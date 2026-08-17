import React, { useState } from 'react';
import { WorkoutRoutine, UserProfile, ApiErrorDetails } from '../types';
import { Dumbbell, Play, Sparkles, Clock, Flame, Layers, Filter, AlertCircle, Key, Zap, WifiOff, HelpCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDeferredLoading } from '../hooks/useDeferredLoading';
import { SkeletonBox, SkeletonLine } from './SkeletonLoader';

interface WorkoutHubProps {
  routines: WorkoutRoutine[];
  userProfile: UserProfile;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  onAddNewRoutine: (routine: WorkoutRoutine) => void;
  customApiKey?: string;
}

export const WorkoutHub: React.FC<WorkoutHubProps> = ({
  routines,
  userProfile,
  onStartWorkout,
  onAddNewRoutine,
  customApiKey,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [focusAreaInput, setFocusAreaInput] = useState('');
  const [daysCount, setDaysCount] = useState(4);
  const [errorInfo, setErrorInfo] = useState<ApiErrorDetails | null>(null);

  // Deferred skeleton loading: triggers only if workout formulation takes > 280ms
  const showSkeleton = useDeferredLoading(isGenerating, { delay: 280, minDisplayTime: 400 });

  const categories = ['All', 'Strength', 'HIIT', 'Flexibility', 'Recovery'];

  const filteredRoutines = selectedCategory === 'All'
    ? routines
    : routines.filter((r) => r.category === selectedCategory);

  const handleGenerateCustomRoutine = async () => {
    setIsGenerating(true);
    setErrorInfo(null);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {})
        },
        body: JSON.stringify({
          userProfile,
          focusArea: focusAreaInput.trim() || 'Full Body',
          daysCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const waitSec = errData.retryAfterSeconds || 15;

        if (res.status === 503 || errData.isUnavailable || errData.errorType === 'TRAFFIC_SPIKE') {
          setErrorInfo({
            errorType: 'TRAFFIC_SPIKE',
            title: 'AI Traffic Spike (503)',
            whatHappened: 'The Gemini workout formulation model is momentarily experiencing high traffic.',
            howToFix: [
              'Wait a few moments and tap Build Workout again.',
              'Add your personal Gemini API key in Settings for dedicated bandwidth.',
            ],
            retryAfterSeconds: 5,
          });
          return;
        }

        if (errData.isRateLimited || errData.isQuotaError || res.status === 429 || errData.errorType === 'QUOTA_EXHAUSTED') {
          setErrorInfo({
            errorType: 'QUOTA_EXHAUSTED',
            title: 'Rate Limit Reached (429)',
            whatHappened: `You reached the generation rate limit (${waitSec}s window).`,
            howToFix: [
              `Wait ~${waitSec} seconds and try again.`,
              'Add your personal Gemini API key in Settings (Key icon) for higher quotas.',
            ],
            retryAfterSeconds: waitSec,
          });
          return;
        }

        if (res.status === 401 || errData.isMissingKey || errData.errorType === 'MISSING_KEY') {
          setErrorInfo({
            errorType: 'MISSING_KEY',
            title: 'Gemini API Key Required',
            whatHappened: 'No valid Gemini API key is configured to build customized routines.',
            howToFix: [
              'Click the Key icon in the top header.',
              'Configure your personal Gemini API key in Settings.',
            ],
          });
          return;
        }

        setErrorInfo({
          errorType: 'SERVER_ERROR',
          title: 'Plan Generation Error',
          whatHappened: errData.error || 'The server could not complete the custom routine generation.',
          howToFix: [
            'Check your network connection.',
            'Try simplifying the focus muscle description.',
            'Tap Build Workout again in a few seconds.',
          ],
        });
        return;
      }

      const data = await res.json();
      const newRoutine: WorkoutRoutine = {
        id: `gen_${Date.now()}`,
        title: data.title || 'Jason AI Custom Workout',
        description: data.description || 'Tailored to your specific goals and available equipment.',
        durationMinutes: data.durationMinutes || 30,
        difficulty: data.difficulty || 'Intermediate',
        category: data.category || 'Strength',
        estimatedCaloriesBurned: data.estimatedCaloriesBurned || 280,
        exercises: data.exercises || [],
      };

      onAddNewRoutine(newRoutine);
      setShowGeneratorModal(false);
      setFocusAreaInput('');
    } catch (err: any) {
      console.error('Failed to generate plan:', err);
      const isOffline = !navigator.onLine || err?.message?.toLowerCase().includes('fetch');
      setErrorInfo({
        errorType: isOffline ? 'NETWORK_ERROR' : 'SERVER_ERROR',
        title: isOffline ? 'Internet Connection Interrupted' : 'Routine Generator Temporarily Unavailable',
        whatHappened: isOffline
          ? 'Your internet or Wi-Fi connection dropped while sending your routine requirements to the AI coach.'
          : (err.message || 'The server encountered an unexpected delay while processing your training split parameters.'),
        howToFix: [
          'Verify your Wi-Fi, Ethernet, or mobile data connection is active.',
          'Check that the server process is running and reachable.',
          'Click "Build Workout" below to retry sending your prompt.',
        ],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white">Workout & Training Hub</h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Pick a routine or let Coach Jason craft a custom session engineered for your goals.
          </p>
        </div>

        <button
          onClick={() => setShowGeneratorModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 sm:px-6 py-3 text-xs font-extrabold text-slate-950 uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Sparkles className="h-4 w-4 text-slate-950" />
          <span>Generate AI Custom Workout</span>
        </button>
      </div>

      {/* Categories Filter - Smooth touch scrolling */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-2xl px-3.5 sm:px-5 py-2 sm:py-2 text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                : 'bg-[#11151c] text-zinc-400 border border-white/[0.08] hover:text-white hover:bg-[#181f2a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {filteredRoutines.map((routine) => (
          <motion.div
            key={routine.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#11151c] p-4 sm:p-6 hover:border-emerald-500/50 transition-all shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  {routine.category}
                </span>
                <span className="text-xs text-zinc-400 font-mono uppercase">{routine.difficulty}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors font-display">
                {routine.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                {routine.description}
              </p>

              {/* Stats Bar */}
              <div className="mt-4 sm:mt-5 flex items-center gap-3 sm:gap-4 text-xs text-zinc-300 border-t border-white/[0.08] pt-3 sm:pt-4 font-mono flex-wrap">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{routine.durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Flame className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>~{routine.estimatedCaloriesBurned} kcal</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span>{routine.exercises.length} Ex</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => onStartWorkout(routine)}
              className="mt-4 sm:mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#181f2a] border border-white/10 py-3.5 sm:py-3 text-xs font-bold text-zinc-200 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 active:scale-95 transition-all uppercase tracking-wider font-mono"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start Workout</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Generator Modal */}
      <AnimatePresence>
        {showGeneratorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#11151c] p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-6 my-auto"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white font-display">Jason AI Plan Studio</h3>
                </div>
                <button
                  onClick={() => setShowGeneratorModal(false)}
                  className="text-zinc-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {showSkeleton ? (
                <div className="space-y-4 py-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Coach Jason is assembling your customized exercises...</span>
                  </div>
                  <div className="space-y-2.5 rounded-2xl bg-[#0b0f17] p-4 border border-white/[0.08]">
                    <SkeletonLine className="h-5 w-3/4" />
                    <SkeletonLine className="h-3.5 w-1/2" />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <SkeletonBox className="h-10 w-full !rounded-xl" />
                      <SkeletonBox className="h-10 w-full !rounded-xl" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-2">
                      Focus Muscle Groups or Workout Style
                    </label>
                    <input
                      type="text"
                      value={focusAreaInput}
                      onChange={(e) => setFocusAreaInput(e.target.value)}
                      placeholder="e.g. Chest & Triceps power, Glute builder, 20-min HIIT cardio..."
                      className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="rounded-2xl bg-[#181f2a] p-4 border border-white/[0.08] text-xs text-zinc-300 space-y-1">
                    <div className="text-emerald-400 font-bold mb-1 font-mono">Active User Profile Rules:</div>
                    <div>- Goal: <span className="text-white font-mono">{userProfile.fitnessGoal}</span></div>
                    <div>- Equipment: {userProfile.equipmentAvailable.join(', ')}</div>
                    <div>- Style: {userProfile.coachingStyle}</div>
                  </div>

                  {errorInfo && (
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-400">
                        {errorInfo.errorType === 'QUOTA_EXHAUSTED' && <Clock className="h-4 w-4 text-amber-400 shrink-0" />}
                        {errorInfo.errorType === 'TRAFFIC_SPIKE' && <Zap className="h-4 w-4 text-amber-400 shrink-0" />}
                        {errorInfo.errorType === 'MISSING_KEY' && <Key className="h-4 w-4 text-amber-400 shrink-0" />}
                        {errorInfo.errorType === 'NETWORK_ERROR' && <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />}
                        {(!errorInfo.errorType || errorInfo.errorType === 'SERVER_ERROR') && <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />}
                        <span>{errorInfo.title}</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{errorInfo.whatHappened}</p>
                      {errorInfo.howToFix && errorInfo.howToFix.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-amber-500/20">
                          <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" />
                            <span>How to fix this:</span>
                          </div>
                          <ul className="space-y-0.5 pl-1 text-[11px] text-zinc-300">
                            {errorInfo.howToFix.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-emerald-400 font-bold font-mono text-[10px]">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowGeneratorModal(false)}
                      className="rounded-2xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateCustomRoutine}
                      disabled={isGenerating}
                      className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-xs font-extrabold text-slate-950 uppercase tracking-wider hover:bg-emerald-400 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-slate-950" />
                          <span>Build Workout</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

