import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Key, 
  ShieldCheck, 
  HardDrive, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight,
  Database
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut,
  doc, 
  setDoc,
  getDoc,
  sanitizeForFirestore
} from '../lib/firebase';
import { ThemeMode } from '../types';
import { sfx } from '../utils/sfx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  currentUserEmail?: string | null;
  currentApiKeyOption: 'default' | 'custom';
  currentCustomKey: string;
  onSaveKeySettings: (option: 'default' | 'custom', customKey: string) => void;
  onUserLoginSuccess: (email: string, uid: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  theme,
  currentUserEmail,
  currentApiKeyOption,
  currentCustomKey,
  onSaveKeySettings,
  onUserLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'guest'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // API Key mode selection inside Auth
  const [apiKeyOption, setApiKeyOption] = useState<'default' | 'custom'>(currentApiKeyOption);
  const [customApiKey, setCustomApiKey] = useState(currentCustomKey);
  const [showCustomKeyText, setShowCustomKeyText] = useState(false);
  const [keySaveNotice, setKeySaveNotice] = useState('');

  // Pressing Enter in the custom key field automatically updates and saves key
  const handleKeyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = customApiKey.trim();
      if (trimmed) {
        setApiKeyOption('custom');
        onSaveKeySettings('custom', trimmed);
        sfx.playLevelUp();
        setKeySaveNotice('✓ Personal Gemini API key updated & active!');
        setTimeout(() => setKeySaveNotice(''), 3500);
      }
    }
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter both email and passkey/password.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg('Passkey/password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    sfx.playClick();

    // Clean up any legacy client-side plaintext passkey remnants
    const safeEmailKey = cleanEmail.replace(/[^a-z0-9]/g, '_');
    localStorage.removeItem(`stridemetrics_pass_${safeEmailKey}`);

    try {
      let resolvedUid = `usr_${safeEmailKey}`;
      let resolvedEmail = cleanEmail;

      // 1. Authenticate with Firebase Authentication
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        if (userCredential?.user?.uid) {
          resolvedUid = userCredential.user.uid;
          resolvedEmail = userCredential.user.email || cleanEmail;
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        if (userCredential?.user?.uid) {
          resolvedUid = userCredential.user.uid;
          resolvedEmail = userCredential.user.email || cleanEmail;
        }
      }

      // 2. Save account credentials and API key settings in Firestore cloud database
      try {
        await setDoc(doc(db, 'users', resolvedUid), sanitizeForFirestore({
          uid: resolvedUid,
          email: resolvedEmail,
          authProvider: 'password',
          apiKeyOption,
          customApiKey: apiKeyOption === 'custom' ? customApiKey.trim() : '',
          updatedAt: new Date().toISOString(),
        }), { merge: true });
      } catch (dbErr) {
        console.warn('Firestore user doc sync notice:', dbErr);
      }

      // Apply key settings to app state
      onSaveKeySettings(apiKeyOption, customApiKey.trim());
      onUserLoginSuccess(resolvedEmail, resolvedUid);

      setSuccessMsg(authMode === 'signup' 
        ? 'Account registered successfully!' 
        : `Welcome back, ${resolvedEmail}!`);

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. If you are new, please Sign Up first.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please switch to Log In.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    sfx.playClick();

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user has already signed up/registered in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (authMode === 'login' && !userDocSnap.exists()) {
        // Strict enforcement: Don't allow login without sign up!
        await firebaseSignOut(auth);
        setErrorMsg('No registered account found for this Google email. You must Sign Up first before logging in!');
        setIsLoading(false);
        return;
      }

      // Save crucial account metadata to Firestore
      await setDoc(userDocRef, sanitizeForFirestore({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        authProvider: 'google',
        apiKeyOption,
        customApiKey: apiKeyOption === 'custom' ? customApiKey.trim() : '',
        updatedAt: new Date().toISOString(),
      }), { merge: true });

      setSuccessMsg(authMode === 'signup' ? `Account registered for ${user.displayName || user.email}!` : `Welcome back, ${user.displayName || user.email}!`);

      onSaveKeySettings(apiKeyOption, customApiKey.trim());
      onUserLoginSuccess(user.email || 'Google User', user.uid);

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.message || 'Google authentication failed or was cancelled.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    sfx.playClick();
    onSaveKeySettings(apiKeyOption, customApiKey.trim());
    setSuccessMsg('Continuing in Local PC Mode.');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto transition-all ${
          isDark
            ? 'bg-[#0e121a] border-white/10 text-white shadow-emerald-500/5'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sfx.playClick();
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors ${
            isDark 
              ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/10' 
              : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display">
              {currentUserEmail 
                ? 'STRIDEMETRICS Account & API Settings' 
                : authMode === 'signup' ? 'Sign Up to STRIDEMETRICS' : 'Login to STRIDEMETRICS'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {currentUserEmail ? `Signed in as ${currentUserEmail}` : 'Select your login method and Gemini API credits mode'}
            </p>
          </div>
        </div>

        {/* MODE SWITCHER: SIGN UP vs LOG IN */}
        <div className="flex rounded-2xl bg-slate-200 dark:bg-[#121722] p-1 mb-4 border border-slate-300 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setAuthMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              authMode === 'signup'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. Sign Up / Register
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setAuthMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              authMode === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2. Log In / Sign In
          </button>
        </div>

        {/* DATA STORAGE & PRIVACY NOTICE BANNER */}
        <div className={`mb-5 p-3.5 rounded-2xl border text-xs leading-relaxed flex gap-3 items-start ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}>
          <HardDrive className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Local Data Privacy Guarantee: </span>
            Besides crucial account profile and API key preferences saved in our secure database, all your personal workout routines, daily calorie/macro logs, metric trackers, and food images are stored directly on your PC locally in your browser.
          </div>
        </div>

        {/* 3 AUTH OPTIONS SELECTOR TABS */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#151c28] border border-slate-200 dark:border-white/10 mb-5">
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setErrorMsg(''); }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'email'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('google'); setErrorMsg(''); }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'google'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('guest'); setErrorMsg(''); }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'guest'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Local PC</span>
          </button>
        </div>

        {/* ERROR / SUCCESS ALERTS */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {errorMsg.includes('Google Sign-In') && (
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setErrorMsg('');
                  handleGoogleAuth();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 transition-all"
              >
                <span>Continue with Google Sign-In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* API KEY CREDIT OPTIONS (Used in all 3 auth methods) */}
        <div className="mb-5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#131a26]">
          <label className="block text-xs font-bold text-slate-900 dark:text-zinc-200 mb-2.5 flex items-center gap-1.5">
            <Key className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>Gemini API Credits Option</span>
          </label>

          <div className="space-y-2.5 text-xs">
            {/* OPTION A: Default App Key */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              apiKeyOption === 'default'
                ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1017] text-slate-700 dark:text-zinc-400 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="apiKeyOption"
                checked={apiKeyOption === 'default'}
                onChange={() => setApiKeyOption('default')}
                className="mt-0.5 accent-emerald-500 h-4 w-4"
              />
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  <span>Use App Default Key</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded font-mono">Recommended</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-normal">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Notice on Credits: </span>
                  App default credits are provided for standard daily AI coaching, but credits may be rate limited or finish when daily app limits are reached.
                </p>
              </div>
            </label>

            {/* OPTION B: Bring Your Own Key (BYOK) */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              apiKeyOption === 'custom'
                ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1017] text-slate-700 dark:text-zinc-400 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="apiKeyOption"
                checked={apiKeyOption === 'custom'}
                onChange={() => setApiKeyOption('custom')}
                className="mt-0.5 accent-emerald-500 h-4 w-4"
              />
              <div className="w-full">
                <div className="font-bold">Bring Your Own Gemini API Key</div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Use your personal Gemini API key for dedicated capacity.
                </p>

                {apiKeyOption === 'custom' && (
                  <div className="mt-2.5 space-y-2">
                    <div className="relative">
                      <input
                        type={showCustomKeyText ? 'text' : 'password'}
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        onKeyDown={handleKeyKeyDown}
                        placeholder="Paste AIzaSy... (Press Enter to apply)"
                        className="w-full px-3 py-2 pr-9 text-xs rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-[#080a0e] text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomKeyText(!showCustomKeyText)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        {showCustomKeyText ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-zinc-400">
                        Press <strong className="text-emerald-500 dark:text-emerald-400">Enter</strong> to save & apply
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = customApiKey.trim();
                          if (trimmed) {
                            setApiKeyOption('custom');
                            onSaveKeySettings('custom', trimmed);
                            sfx.playLevelUp();
                            setKeySaveNotice('✓ Personal Gemini API key updated & active!');
                            setTimeout(() => setKeySaveNotice(''), 3500);
                          }
                        }}
                        className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/30 transition-colors"
                      >
                        Save Key Now
                      </button>
                    </div>

                    {keySaveNotice && (
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 animate-fadeIn">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{keySaveNotice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* AUTH METHOD BODY */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#080a0e] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 chars)"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#080a0e] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{authMode === 'signup' ? 'Create Account' : 'Log In'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline"
              >
                {authMode === 'signup' ? 'Already have an account? Log In to STRIDEMETRICS' : 'Need a new account? Sign Up for STRIDEMETRICS'}
              </button>
            </div>
          </form>
        )}

        {authMethod === 'google' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              {authMode === 'signup' 
                ? 'Sign up and register your STRIDEMETRICS account using your Google profile via Firebase Cloud Auth.' 
                : 'Log in to STRIDEMETRICS with your registered Google account.'}
            </p>

            {/* Verification Domain Note */}
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>STRIDEMETRICS Secure OAuth Authentication</span>
              </div>
              <p className="text-[11px] leading-normal opacity-90">
                Authenticate securely with your Google account to sync your fitness routines, logs, and biometric data in real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2.5 shadow-md"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Connecting to Google...' : authMode === 'signup' ? 'Sign Up to STRIDEMETRICS with Google' : 'Login to STRIDEMETRICS with Google'}</span>
            </button>
          </div>
        )}

        {authMethod === 'guest' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Continue using Coach Jason without a cloud account. All your workout routines, nutrition logs, and tracking data remain safely stored directly on your PC in local browser storage.
            </p>

            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <HardDrive className="h-4 w-4" />
              <span>Continue in Local PC Storage Mode</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
