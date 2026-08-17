import React, { useState } from 'react';
import { UserProfile, FitnessGoal, CoachingStyle, ThemeMode } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';
import { sfx } from '../utils/sfx';
import { BrandLogo } from './BrandLogo';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  doc, 
  setDoc,
  getDoc,
  sanitizeForFirestore
} from '../lib/firebase';

interface LoginScreenProps {
  onLoginSuccess: (email: string, uid: string, profile?: UserProfile) => void;
  theme: ThemeMode;
  initialApiKeyOption?: 'default' | 'custom';
  initialCustomKey?: string;
  onSaveKeySettings: (option: 'default' | 'custom', customKey: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  theme,
  initialApiKeyOption = 'default',
  initialCustomKey = '',
  onSaveKeySettings
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [athleteName, setAthleteName] = useState('');
  
  // Custom API Key state
  const [apiKeyOption, setApiKeyOption] = useState<'default' | 'custom'>(initialApiKeyOption);
  const [customApiKey, setCustomApiKey] = useState(initialCustomKey);
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [keyNotice, setKeyNotice] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isDark = theme === 'dark';

  // Automatically update and save API Key when user types and presses Enter in the key field
  const handleKeyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedKey = customApiKey.trim();
      if (trimmedKey) {
        setApiKeyOption('custom');
        onSaveKeySettings('custom', trimmedKey);
        sfx.playLevelUp();
        setKeyNotice('✓ Personal Gemini API key updated and active!');
        setTimeout(() => setKeyNotice(''), 3500);
      }
    }
  };

  // Helper to ensure key is saved on any action
  const syncApiKey = () => {
    if (apiKeyOption === 'custom' && customApiKey.trim()) {
      onSaveKeySettings('custom', customApiKey.trim());
    } else if (apiKeyOption === 'default') {
      onSaveKeySettings('default', '');
    }
  };

  // Email & Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    sfx.playClick();
    syncApiKey();

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

      // 2. Save initial metadata in Firestore
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

      setSuccessMsg(authMode === 'signup' 
        ? 'Account registered successfully!' 
        : `Welcome back, ${resolvedEmail}!`);
      sfx.playLevelUp();

      setTimeout(() => {
        onLoginSuccess(resolvedEmail, resolvedUid);
      }, 500);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. If you are new, please click "2. Sign Up / Register" first.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please switch to "1. Log In to Account".');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password must be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication error. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Authentication
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    sfx.playClick();
    syncApiKey();

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      try {
        const userDocRef = doc(db, 'users', user.uid);
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
      } catch (dbErr) {
        console.warn('Firestore Google auth sync notice:', dbErr);
      }

      setSuccessMsg(`Signed in as ${user.displayName || user.email}!`);
      sfx.playLevelUp();

      setTimeout(() => {
        onLoginSuccess(user.email || 'Google User', user.uid);
      }, 500);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.message || 'Google authentication failed or was closed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden ${
      isDark ? 'bg-[#080a0e] text-zinc-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Dynamic Ambient Emerald Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-lg rounded-3xl sm:rounded-[36px] p-6 sm:p-9 backdrop-blur-2xl border shadow-2xl relative z-10 ${
          isDark
            ? 'bg-[#11151c]/90 border-white/10 shadow-black/80'
            : 'bg-white/90 border-slate-200 shadow-slate-300/60'
        }`}
      >
        
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5" /> STRIDEMETRICS AI Health & Performance
          </div>
          
          <div className="flex justify-center">
            <BrandLogo size="xl" showSubtitle={true} isDark={isDark} />
          </div>
          
          <p className={`text-xs sm:text-sm leading-relaxed max-w-sm mx-auto ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Please log in or register to access your personalized AI coaching session, biometric analytics, and training plans.
          </p>
        </div>

        {/* MODE SWITCHER: LOG IN vs SIGN UP */}
        <div className="flex rounded-2xl bg-slate-200/80 dark:bg-[#151c28] p-1 mb-5 border border-slate-300 dark:border-white/10">
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
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. Log In to Account
          </button>
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
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2. Sign Up / Register
          </button>
        </div>

        {/* AUTH METHOD TABS: EMAIL vs GOOGLE */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#0c1017] border border-slate-200 dark:border-white/10 mb-5">
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setErrorMsg(''); }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'email'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email & Password</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('google'); setErrorMsg(''); }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'google'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        {/* ALERTS */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* GEMINI AI API KEY CONFIGURATION (Pressing Enter automatically updates key & starts) */}
        <div className="mb-5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#131a26]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <span>Gemini AI Engine Key</span>
            </label>
            {apiKeyOption === 'custom' && (
              <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold">
                BYOK Active
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {/* OPTION A: Default App Key */}
            <label className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
              apiKeyOption === 'default'
                ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1017] text-slate-700 dark:text-zinc-400 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="apiKeyOption"
                checked={apiKeyOption === 'default'}
                onChange={() => {
                  setApiKeyOption('default');
                  onSaveKeySettings('default', '');
                }}
                className="mt-0.5 accent-emerald-500 h-4 w-4"
              />
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  <span>Use App Default Gemini Key</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Uses the server's configured Gemini AI environment.
                </p>
              </div>
            </label>

            {/* OPTION B: Bring Your Own Key (BYOK) */}
            <label className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
              apiKeyOption === 'custom'
                ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1017] text-slate-700 dark:text-zinc-400 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="apiKeyOption"
                checked={apiKeyOption === 'custom'}
                onChange={() => {
                  setApiKeyOption('custom');
                  if (customApiKey.trim()) {
                    onSaveKeySettings('custom', customApiKey.trim());
                  }
                }}
                className="mt-0.5 accent-emerald-500 h-4 w-4"
              />
              <div className="w-full">
                <div className="font-bold">Add Custom Personal Gemini API Key</div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Paste your key and press <strong className="text-emerald-500 dark:text-emerald-400">Enter</strong> to update automatically.
                </p>

                {apiKeyOption === 'custom' && (
                  <div className="mt-2 relative">
                    <input
                      type={showCustomKey ? 'text' : 'password'}
                      value={customApiKey}
                      onChange={(e) => {
                        setCustomApiKey(e.target.value);
                      }}
                      onKeyDown={handleKeyKeyDown}
                      placeholder="Paste AIzaSy... (Press Enter to apply)"
                      className="w-full px-3 py-2 pr-9 text-xs rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-[#080a0e] text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomKey(!showCustomKey)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title={showCustomKey ? 'Hide key' : 'Show key'}
                    >
                      {showCustomKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </label>
          </div>

          {keyNotice && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{keyNotice}</span>
            </div>
          )}
        </div>

        {/* EMAIL & PASSWORD AUTH FORM */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Email Address <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#080a0e] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Password <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 chars)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#080a0e] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
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
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
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

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline"
              >
                {authMode === 'signup' ? 'Already registered? Log in here' : 'Need an account? Sign up here'}
              </button>
            </div>
          </form>
        )}

        {/* GOOGLE AUTH BUTTON */}
        {authMethod === 'google' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed text-center">
              Authenticate securely with your verified Google profile to access your health data and AI coach.
            </p>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
};
