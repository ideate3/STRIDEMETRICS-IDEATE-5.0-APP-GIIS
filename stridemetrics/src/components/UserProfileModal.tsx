import React, { useState } from 'react';
import { UserProfile, FitnessGoal, CoachingStyle } from '../types';
import { User, Check, X, Cloud, HardDrive, ShieldCheck, AlertTriangle, Key, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { sfx } from '../utils/sfx';

interface UserProfileModalProps {
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onClose: () => void;
  apiKeyOption?: 'default' | 'custom';
  customApiKey?: string;
  onSaveKeySettings?: (option: 'default' | 'custom', customKey: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userProfile,
  onSaveProfile,
  onClose,
  apiKeyOption = 'default',
  customApiKey = '',
  onSaveKeySettings,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [keyOpt, setKeyOpt] = useState<'default' | 'custom'>(apiKeyOption);
  const [personalKey, setPersonalKey] = useState<string>(customApiKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [keyNotice, setKeyNotice] = useState<string>('');

  const handleKeyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = personalKey.trim();
      if (trimmed && onSaveKeySettings) {
        setKeyOpt('custom');
        onSaveKeySettings('custom', trimmed);
        sfx.playLevelUp();
        setKeyNotice('✓ Personal Gemini API key updated & active!');
        setTimeout(() => setKeyNotice(''), 3500);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveKeySettings) {
      if (keyOpt === 'custom' && personalKey.trim()) {
        onSaveKeySettings('custom', personalKey.trim());
      } else if (keyOpt === 'default') {
        onSaveKeySettings('default', '');
      }
    }
    onSaveProfile(profile);
    onClose();
  };

  const goals: { id: FitnessGoal; label: string }[] = [
    { id: 'muscle_gain', label: 'Muscle Gain & Strength' },
    { id: 'weight_loss', label: 'Fat Loss & Definition' },
    { id: 'endurance', label: 'Endurance & Stamina' },
    { id: 'general_health', label: 'General Health & Vitality' },
    { id: 'mobility_flexibility', label: 'Mobility & Posture' },
  ];

  const styles: { id: CoachingStyle; label: string; desc: string }[] = [
    { id: 'encouraging', label: 'Encouraging', desc: 'Positive, supportive, and empathetic motivation' },
    { id: 'direct', label: 'Direct', desc: 'Concise, data-focused, no fluff' },
    { id: 'scientific', label: 'Scientific', desc: 'Explains biomechanics, hypertrophy, & physiology' },
    { id: 'intense', label: 'Intense', desc: 'High energy, athletic trainer push' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-3xl border border-white/[0.1] bg-[#11151c] p-5 sm:p-7 shadow-2xl space-y-5 sm:space-y-6"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">Profile & Coach Settings</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-zinc-300">
          
          {/* Personal Info & AI Coach Customization */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Your Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 sm:p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium text-emerald-400 mb-1 flex items-center gap-1 font-bold">
                <span>AI Coach Name</span>
              </label>
              <input
                type="text"
                value={profile.coachName || ''}
                placeholder="Coach Jason"
                onChange={(e) => setProfile({ ...profile, coachName: e.target.value })}
                className="w-full bg-[#0b0f17] border border-emerald-500/40 rounded-xl p-2.5 sm:p-3 text-white focus:outline-none focus:border-emerald-400 transition-colors font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 sm:p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={profile.weightKg}
                onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 sm:p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Height (cm)</label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 sm:p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Primary Fitness Goal</label>
              <select
                value={profile.fitnessGoal}
                onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value as FitnessGoal })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 sm:p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {goals.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#11151c] text-white">
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coaching Style selection */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">{profile.coachName || 'Jason'}'s Coaching Style</label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setProfile({ ...profile, coachingStyle: s.id })}
                  className={`rounded-2xl p-3 text-left transition-all border ${
                    profile.coachingStyle === s.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                      : 'bg-[#181f2a] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-[#202938]'
                  }`}
                >
                  <div className="font-bold text-xs">{s.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Gemini AI Key Settings */}
          {onSaveKeySettings && (
            <div className="p-3.5 rounded-2xl border border-white/[0.08] bg-[#0d1117] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-medium text-white flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-emerald-400" />
                  <span>Gemini API Key Setting</span>
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  {keyOpt === 'custom' ? 'Personal BYOK' : 'App Default'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setKeyOpt('default');
                    onSaveKeySettings('default', '');
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs ${
                    keyOpt === 'default'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                      : 'bg-[#181f2a] border-white/[0.08] text-zinc-400 hover:text-white'
                  }`}
                >
                  App Default Key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKeyOpt('custom');
                    if (personalKey.trim()) {
                      onSaveKeySettings('custom', personalKey.trim());
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs ${
                    keyOpt === 'custom'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                      : 'bg-[#181f2a] border-white/[0.08] text-zinc-400 hover:text-white'
                  }`}
                >
                  Personal Custom Key (BYOK)
                </button>
              </div>

              {keyOpt === 'custom' && (
                <div className="space-y-1.5 pt-1">
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={personalKey}
                      onChange={(e) => setPersonalKey(e.target.value)}
                      onKeyDown={handleKeyKeyDown}
                      placeholder="Paste AIzaSy... (Press Enter to update)"
                      className="w-full bg-[#0b0f17] border border-white/[0.1] rounded-xl p-2.5 pr-9 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
                    >
                      {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Press <strong>Enter</strong> to instantly apply key.</span>
                    {keyNotice && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {keyNotice}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Target Macro Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={profile.dailyCalorieTarget}
                onChange={(e) => setProfile({ ...profile, dailyCalorieTarget: Number(e.target.value) })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Protein (g)</label>
              <input
                type="number"
                value={profile.dailyProteinTargetG}
                onChange={(e) => setProfile({ ...profile, dailyProteinTargetG: Number(e.target.value) })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={profile.dailyCarbsTargetG}
                onChange={(e) => setProfile({ ...profile, dailyCarbsTargetG: Number(e.target.value) })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Fat (g)</label>
              <input
                type="number"
                value={profile.dailyFatTargetG}
                onChange={(e) => setProfile({ ...profile, dailyFatTargetG: Number(e.target.value) })}
                className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Data Storage Mode Selection & Security Disclaimer */}
          <div className="pt-3 border-t border-white/[0.08]">
            <label className="block font-medium text-zinc-200 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Data & Chat Storage Mode</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setProfile({ ...profile, storageMode: 'cloud' })}
                className={`rounded-2xl p-3 text-left transition-all border flex flex-col justify-between ${
                  (profile.storageMode || 'cloud') === 'cloud'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                    : 'bg-[#181f2a] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-[#202938]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-xs text-white">1. Cloud Sync (Encrypted Firestore)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  High security cloud storage. Automatically syncs chats and health data across devices under your account.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProfile({ ...profile, storageMode: 'local' })}
                className={`rounded-2xl p-3 text-left transition-all border flex flex-col justify-between ${
                  profile.storageMode === 'local'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-[#181f2a] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-[#202938]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-white">2. Local PC Only</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Keeps data strictly inside this browser cache.
                </p>
              </button>
            </div>

            {profile.storageMode === 'local' && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-bold">Local PC Storage Disclaimer: </span>
                  Your chats and health logs are stored solely on this browser. Clearing browser history, cache, or switching devices will permanently wipe your chat history and recorded logs.
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-4 py-2 font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 sm:px-6 py-2.5 sm:py-3 font-extrabold text-slate-950 uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
