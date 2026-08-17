import React, { useState } from 'react';
import { UserProfile, FitnessGoal, CoachingStyle } from '../types';
import { Sparkles, Dumbbell, ShieldCheck, Flame, ArrowRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import { sfx } from '../utils/sfx';
import { BrandLogo } from './BrandLogo';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  theme: 'dark' | 'light';
  onOpenAuthModal?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, theme, onOpenAuthModal }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('Male');
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(178);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('muscle_gain');
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>('encouraging');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sfx.playLevelUp();

    // Calculate baseline macro targets based on goal
    let cal = 2400;
    let prot = 160;
    let carbs = 250;
    let fat = 70;

    if (fitnessGoal === 'weight_loss') {
      cal = 2000;
      prot = 175;
      carbs = 180;
      fat = 60;
    } else if (fitnessGoal === 'muscle_gain') {
      cal = 2800;
      prot = 190;
      carbs = 320;
      fat = 80;
    } else if (fitnessGoal === 'endurance') {
      cal = 2600;
      prot = 140;
      carbs = 350;
      fat = 65;
    }

    const profile: UserProfile = {
      name: name.trim(),
      age: Number(age) || 25,
      gender,
      weightKg: Number(weightKg) || 75,
      heightCm: Number(heightCm) || 178,
      fitnessGoal,
      activityLevel: 'moderately_active',
      coachingStyle,
      dailyCalorieTarget: cal,
      dailyProteinTargetG: prot,
      dailyCarbsTargetG: carbs,
      dailyFatTargetG: fat,
      dailyWaterMlTarget: 3000,
      equipmentAvailable: ['Dumbbells', 'Barbell', 'Bodyweight', 'Cable Machine'],
    };

    onLogin(profile);
  };

  const setPreset = (presetName: string, g: FitnessGoal, c: CoachingStyle, w: number) => {
    sfx.playClick();
    setName(presetName);
    setFitnessGoal(g);
    setCoachingStyle(c);
    setWeightKg(w);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden ${
      isDark ? 'bg-[#080a0e] text-zinc-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Dynamic Glassmorphic Emerald Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-xl rounded-3xl sm:rounded-[36px] p-6 sm:p-10 backdrop-blur-2xl border shadow-2xl relative z-10 ${
          isDark
            ? 'bg-[#11151c]/80 border-white/10 shadow-black/80'
            : 'bg-white/80 border-slate-200/80 shadow-slate-300/50'
        }`}
      >
        
        {/* Header Branding */}
        <div className="text-center space-y-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Biometric Fitness & AI Health Analytics
          </div>
          
          <div className="flex justify-center">
            <BrandLogo size="xl" showSubtitle={true} isDark={isDark} />
          </div>
          
          <p className={`text-xs sm:text-sm leading-relaxed max-w-md mx-auto ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Enter your physical metrics to activate your personalized AI health coach, macro targets, and hypertrophy splits.
          </p>

          {onOpenAuthModal && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onOpenAuthModal();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Sign Up / Login to STRIDEMETRICS</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <span className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Quick Setup Presets:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreset('Alex Rivers', 'muscle_gain', 'direct', 80)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                isDark
                  ? 'bg-[#181f2a] border-white/10 hover:border-emerald-500/50 text-zinc-200'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50 text-slate-800'
              }`}
            >
              <div className="font-bold">Alex (Hypertrophy)</div>
              <div className="text-[10px] text-emerald-400">Muscle Gain</div>
            </button>

            <button
              type="button"
              onClick={() => setPreset('Jordan Vance', 'weight_loss', 'encouraging', 72)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                isDark
                  ? 'bg-[#181f2a] border-white/10 hover:border-emerald-500/50 text-zinc-200'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50 text-slate-800'
              }`}
            >
              <div className="font-bold">Jordan (Fat Loss)</div>
              <div className="text-[10px] text-emerald-400">Weight Loss</div>
            </button>

            <button
              type="button"
              onClick={() => setPreset('Sam Taylor', 'general_health', 'scientific', 68)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all col-span-2 sm:col-span-1 ${
                isDark
                  ? 'bg-[#181f2a] border-white/10 hover:border-emerald-500/50 text-zinc-200'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50 text-slate-800'
              }`}
            >
              <div className="font-bold">Sam (Fitness)</div>
              <div className="text-[10px] text-emerald-400">General Health</div>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Your Name / Athlete Tag <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className={`w-full rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium transition-colors border focus:outline-none focus:border-emerald-400 ${
                  isDark
                    ? 'bg-[#0b0f17] border-white/10 text-white placeholder-zinc-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Age
              </label>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className={`w-full rounded-2xl py-2 px-3 text-sm font-mono font-bold border focus:outline-none focus:border-emerald-400 ${
                  isDark ? 'bg-[#0b0f17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Weight (kg)
              </label>
              <input
                type="number"
                min="30"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className={`w-full rounded-2xl py-2 px-3 text-sm font-mono font-bold border focus:outline-none focus:border-emerald-400 ${
                  isDark ? 'bg-[#0b0f17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Height (cm)
              </label>
              <input
                type="number"
                min="120"
                max="230"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className={`w-full rounded-2xl py-2 px-3 text-sm font-mono font-bold border focus:outline-none focus:border-emerald-400 ${
                  isDark ? 'bg-[#0b0f17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Primary Fitness Goal
              </label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                className={`w-full rounded-2xl p-2.5 text-xs font-semibold border focus:outline-none focus:border-emerald-400 ${
                  isDark ? 'bg-[#0b0f17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="muscle_gain">Muscle Hypertrophy</option>
                <option value="weight_loss">Fat Loss & Toning</option>
                <option value="endurance">Endurance & HIIT</option>
                <option value="general_health">General Health & Fitness</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                Coach Coaching Persona
              </label>
              <select
                value={coachingStyle}
                onChange={(e) => setCoachingStyle(e.target.value as CoachingStyle)}
                className={`w-full rounded-2xl p-2.5 text-xs font-semibold border focus:outline-none focus:border-emerald-400 ${
                  isDark ? 'bg-[#0b0f17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="encouraging">Encouraging & Supportive</option>
                <option value="direct">Direct & No-Nonsense</option>
                <option value="scientific">Scientific & Analytical</option>
                <option value="intense">Intense Beast Mode</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 px-6 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span>Start AI Coaching Session</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
