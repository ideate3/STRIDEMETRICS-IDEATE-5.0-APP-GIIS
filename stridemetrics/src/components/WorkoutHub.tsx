import React, { useState } from 'react';
import { WorkoutRoutine, UserProfile } from '../types';
import { Dumbbell, Play, Sparkles, Clock, Flame, Layers, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  const categories = ['All', 'Strength', 'HIIT', 'Flexibility', 'Recovery'];

  const filteredRoutines = selectedCategory === 'All'
    ? routines
    : routines.filter((r) => r.category === selectedCategory);

  const handleGenerateCustomRoutine = async () => {
    setIsGenerating(true);
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
        throw new Error('Failed to generate routine');
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
    } catch (err) {
      console.error('Failed to generate plan:', err);
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

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-2xl px-4 sm:px-5 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-[#11151c] text-zinc-400 border border-white/[0.08] hover:text-white hover:bg-[#181f2a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredRoutines.map((routine) => (
          <motion.div
            key={routine.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#11151c] p-5 sm:p-6 hover:border-emerald-500/50 transition-all shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  {routine.category}
                </span>
                <span className="text-xs text-zinc-400 font-mono uppercase">{routine.difficulty}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors font-display">
                {routine.title}
              </h3>
              <p className="mt-2 text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                {routine.description}
              </p>

              {/* Stats Bar */}
              <div className="mt-5 flex items-center gap-4 text-xs text-zinc-300 border-t border-white/[0.08] pt-4 font-mono">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{routine.durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Flame className="h-3.5 w-3.5 text-emerald-400" />
                  <span>~{routine.estimatedCaloriesBurned} kcal</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{routine.exercises.length} Ex</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => onStartWorkout(routine)}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#181f2a] border border-white/10 py-3 text-xs font-bold text-zinc-200 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 active:scale-95 transition-all uppercase tracking-wider font-mono"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-white/[0.1] bg-[#11151c] p-5 sm:p-7 shadow-2xl space-y-5 sm:space-y-6"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

