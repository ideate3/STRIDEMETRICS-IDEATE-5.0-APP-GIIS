import React, { useState } from 'react';
import { ScheduledDay, WorkoutRoutine, UserProfile, MuscleGroupStat } from '../types';
import { MuscleSilhouette } from './MuscleSilhouette';
import { Calendar, Sparkles, Check, Plus, Play, Dumbbell, Trophy, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sfx } from '../utils/sfx';
import { useDeferredLoading } from '../hooks/useDeferredLoading';
import { WorkoutPlanSkeleton } from './SkeletonLoader';

interface WorkoutPlannerProps {
  scheduledDays: ScheduledDay[];
  setScheduledDays: React.Dispatch<React.SetStateAction<ScheduledDay[]>>;
  availableRoutines: WorkoutRoutine[];
  onStartWorkout: (routine: WorkoutRoutine) => void;
  muscleStats: Record<string, MuscleGroupStat>;
  onCompleteScheduledDay: (dayName: string) => void;
  userProfile: UserProfile;
  theme: 'dark' | 'light';
  customApiKey?: string;
}

export const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({
  scheduledDays,
  setScheduledDays,
  availableRoutines,
  onStartWorkout,
  muscleStats,
  onCompleteScheduledDay,
  userProfile,
  theme,
  customApiKey,
}) => {
  const [selectedDayToEdit, setSelectedDayToEdit] = useState<ScheduledDay | null>(null);
  const [isGeneratingSplit, setIsGeneratingSplit] = useState(false);

  // Deferred skeleton loading: only displays if AI generation takes > 280ms
  const showSkeleton = useDeferredLoading(isGeneratingSplit, { delay: 280, minDisplayTime: 400 });

  const isDark = theme === 'dark';

  // AI Split Generator logic
  const handleAutoGenerateSplit = async () => {
    setIsGeneratingSplit(true);

    try {
      // Call backend AI generator for custom weekly plan
      const res = await fetch('/api/recommend-workout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {})
        },
        body: JSON.stringify({
          userProfile,
          focusArea: `Optimal 7-Day Weekly Training Split for ${userProfile.fitnessGoal}`,
        }),
      });

      if (!res.ok) throw new Error('AI split generator error');
      const data = await res.json();
      
      // Auto assign tailored split across 7 days
      const daysOrder: ScheduledDay['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      let splits: { title: string; category: string; focus: string }[] = [];

      if (data && Array.isArray(data.weeklySplit) && data.weeklySplit.length === 7) {
        splits = data.weeklySplit.map((item: any) => ({
          title: item.title || 'Workout Session',
          category: item.category || 'Strength',
          focus: item.focus || 'Full Body',
        }));
      } else if (userProfile.fitnessGoal === 'weight_loss') {
        splits = [
          { title: 'Full Body HIIT Burn', category: 'HIIT', focus: 'Legs, Core & Cardio' },
          { title: 'Core & Upper Body Sculpt', category: 'Strength', focus: 'Chest, Back & Core' },
          { title: 'Active Recovery & Mobility', category: 'Recovery', focus: 'Full Body Flexibility' },
          { title: 'Lower Body & Glute Power', category: 'Strength', focus: 'Quads, Hamstrings & Calves' },
          { title: 'High-Energy Cardio Blitz', category: 'Cardio', focus: 'Endurance & Core' },
          { title: 'Full Body Strength Challenge', category: 'Strength', focus: 'Compound Movements' },
          { title: 'Rest & Hydration Day', category: 'Recovery', focus: 'Complete Rest' },
        ];
      } else {
        // Hypertrophy / Muscle Gain / General
        splits = [
          { title: 'Push Hypertrophy (Chest & Triceps)', category: 'Strength', focus: 'Chest, Shoulders & Triceps' },
          { title: 'Pull Hypertrophy (Back & Biceps)', category: 'Strength', focus: 'Lats, Upper Back & Biceps' },
          { title: 'Legs & Core Power', category: 'Strength', focus: 'Quads, Hamstrings, Calves & Abs' },
          { title: 'Active Recovery & Stretching', category: 'Recovery', focus: 'Mobility & Joint Health' },
          { title: 'Upper Body Pump', category: 'Strength', focus: 'Chest, Lats & Shoulders' },
          { title: 'Lower Body & Core Blast', category: 'Strength', focus: 'Glutes, Quads & Abs' },
          { title: 'Rest & Nutrient Synthesis Day', category: 'Recovery', focus: 'Rest & Repair' },
        ];
      }

      const updated = daysOrder.map((day, idx) => {
        const item = splits[idx];
        const matchingRoutine = availableRoutines.find((r) => r.category === item.category) || availableRoutines[0];
        return {
          day,
          routineId: matchingRoutine?.id,
          routineTitle: item.title,
          category: item.category,
          targetFocus: item.focus,
          completed: false,
        };
      });

      setScheduledDays(updated);
      sfx.playLevelUp();
    } catch (err) {
      console.error('Split generator failed, fallback applied:', err);
    } finally {
      setIsGeneratingSplit(false);
    }
  };

  const handleAssignRoutine = (dayName: string, routine: WorkoutRoutine) => {
    sfx.playClick();
    setScheduledDays((prev) =>
      prev.map((d) =>
        d.day === dayName
          ? {
              ...d,
              routineId: routine.id,
              routineTitle: routine.title,
              category: routine.category,
              targetFocus: routine.exercises.map((e) => e.targetMuscles[0]).filter(Boolean).join(', '),
            }
          : d
      )
    );
    setSelectedDayToEdit(null);
  };

  const [activePlannerTab, setActivePlannerTab] = useState<'schedule' | 'anatomy' | 'summary'>('schedule');

  const handleToggleDayComplete = (dayName: string) => {
    sfx.playToggle();
    onCompleteScheduledDay(dayName);
  };

  const completedCount = scheduledDays.filter((d) => d.completed).length;
  const totalRoutinesAssigned = scheduledDays.filter((d) => d.routineId).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      
      {/* Header Banner */}
      <div className={`rounded-3xl border p-5 sm:p-7 relative overflow-hidden transition-all ${
        isDark 
          ? 'bg-gradient-to-r from-[#101713] via-[#12181e] to-[#12121a] border-emerald-500/20 text-white' 
          : 'bg-gradient-to-r from-emerald-50/80 via-slate-50 to-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> EMERALD MATRIX ENGINE
              </span>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {completedCount} of 7 Days Completed
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Weekly Workout Planner & Anatomical Matrix
            </h1>
            <p className={`text-xs max-w-2xl leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              Organize your 7-day training split, initiate live guided workouts, and track 24 individual muscle head XP gains in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAutoGenerateSplit}
              disabled={isGeneratingSplit}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-extrabold text-slate-950 uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              {isGeneratingSplit ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                  <span>{userProfile.coachName ? userProfile.coachName.replace(/^Coach\s+/i, '') : 'Jason'} AI Planning Split...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-slate-950" />
                  <span>AI Auto-Plan Weekly Split</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-500/20">
          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white/80 border-slate-200'}`}>
            <span className={`block text-[10px] font-mono font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Weekly Completion
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-emerald-400">{completedCount}</span>
              <span className="text-xs font-mono text-zinc-400">/ 7 Days</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${(completedCount / 7) * 100}%` }}
              />
            </div>
          </div>

          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white/80 border-slate-200'}`}>
            <span className={`block text-[10px] font-mono font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Target Fitness Goal
            </span>
            <div className="text-sm font-bold truncate capitalize mt-1 text-white">
              {userProfile.fitnessGoal.replace('_', ' ')}
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-0.5 block">Tailored Split</span>
          </div>

          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white/80 border-slate-200'}`}>
            <span className={`block text-[10px] font-mono font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Assigned Routines
            </span>
            <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
              {totalRoutinesAssigned} / 7
            </div>
            <span className="text-[10px] font-mono text-zinc-400 mt-0.5 block">Active Routines</span>
          </div>

          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white/80 border-slate-200'}`}>
            <span className={`block text-[10px] font-mono font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Anatomical Status
            </span>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <Trophy className="h-4 w-4" /> 24 Muscle Heads
            </div>
            <span className="text-[10px] font-mono text-zinc-400 mt-0.5 block">Rank Matrix Active</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Navigation Tabs - scrollable horizontally on mobile */}
      <div className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl border overflow-x-auto no-scrollbar ${
        isDark ? 'bg-[#12121a] border-white/10' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => {
            sfx.playClick();
            setActivePlannerTab('schedule');
          }}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activePlannerTab === 'schedule'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          <span>7-Day Schedule</span>
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setActivePlannerTab('anatomy');
          }}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activePlannerTab === 'anatomy'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Dumbbell className="h-4 w-4 shrink-0" />
          <span>Anatomical Silhouette</span>
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setActivePlannerTab('summary');
          }}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activePlannerTab === 'summary'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4 shrink-0" />
          <span>Muscle Levels</span>
        </button>
      </div>

      {/* TAB CONTENT 1: SCHEDULE STREAM */}
      {activePlannerTab === 'schedule' && (
        showSkeleton ? (
          <div className="py-2">
            <WorkoutPlanSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-400" /> Weekly Schedule (Monday – Sunday)
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {completedCount === 7 ? '🎉 Weekly Goal Cleared!' : `${7 - completedCount} Days Remaining`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
            {scheduledDays.map((dayItem) => {
              const isDone = dayItem.completed;
              const routine = availableRoutines.find((r) => r.id === dayItem.routineId);

              return (
                <motion.div
                  key={dayItem.day}
                  whileHover={{ y: -3 }}
                  className={`rounded-2xl p-4 border flex flex-col justify-between transition-all relative overflow-hidden ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : isDark
                        ? 'bg-[#12121a]/90 border-white/10 text-white hover:border-emerald-500/40'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500/40 shadow-sm'
                  }`}
                >
                  {/* Top Day Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                        {dayItem.day}
                      </span>
                      <button
                        onClick={() => handleToggleDayComplete(dayItem.day)}
                        title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                        className={`h-6 w-6 rounded-full flex items-center justify-center transition-all border ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md'
                            : 'bg-black/20 border-zinc-500/30 text-zinc-400 hover:border-emerald-500'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold line-clamp-1">
                        {dayItem.routineTitle || 'Rest & Recovery'}
                      </h3>
                      <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {dayItem.targetFocus || 'Rest day, mobility or light cardio'}
                      </p>
                    </div>
                  </div>

                  {/* Category Pill */}
                  {dayItem.category && (
                    <div className="mt-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {dayItem.category}
                      </span>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-500/20 space-y-2">
                    {routine ? (
                      <button
                        onClick={() => onStartWorkout(routine)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-slate-950 py-2 text-xs font-extrabold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/15"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Start Session</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => setSelectedDayToEdit(dayItem)}
                      className={`w-full py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase border transition-colors ${
                        isDark
                          ? 'bg-[#181824] border-white/5 text-zinc-400 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Change Workout
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT 2: ANATOMICAL SILHOUETTE */}
      {activePlannerTab === 'anatomy' && (
        <div className="space-y-4">
          <MuscleSilhouette muscleStats={muscleStats} theme={theme} />
        </div>
      )}

      {/* TAB CONTENT 3: MUSCLE GROUP SUMMARY */}
      {activePlannerTab === 'summary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-400" /> Muscle Group Progression Dashboard
            </h2>
            <span className="text-xs font-mono text-zinc-400">6 Core Muscle Categories</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(muscleStats).map((key) => {
              const stat = muscleStats[key];
              const pct = Math.min(100, Math.round((stat.xp / stat.nextLevelXp) * 100));

              return (
                <div
                  key={key}
                  className={`rounded-2xl p-5 border space-y-3 ${
                    isDark ? 'bg-[#12121a] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black capitalize text-emerald-400 flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" /> {stat.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Level {stat.level}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>Experience Points</span>
                      <span className="font-bold text-white">{stat.xp} / {stat.nextLevelXp} XP</span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-500/20">
                    <span className="text-zinc-400 font-mono">Completed Workouts:</span>
                    <span className="font-bold font-mono text-emerald-400">{stat.completedWorkoutsCount} Sessions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Routine Selection Modal */}
      <AnimatePresence>
        {selectedDayToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 ${
                isDark ? 'bg-[#12121a] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-zinc-500/20">
                <h3 className="text-base font-extrabold">
                  Assign Routine to <span className="text-emerald-400">{selectedDayToEdit.day}</span>
                </h3>
                <button onClick={() => setSelectedDayToEdit(null)} className="text-zinc-400 hover:text-white text-xs font-mono">
                  ✕ Close
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {availableRoutines.map((routine) => (
                  <button
                    key={routine.id}
                    onClick={() => handleAssignRoutine(selectedDayToEdit.day, routine)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isDark
                        ? 'bg-[#181824] border-white/10 hover:border-emerald-500/50 text-white'
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50 text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{routine.title}</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        {routine.category} • {routine.durationMinutes} min • {routine.difficulty}
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-emerald-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
