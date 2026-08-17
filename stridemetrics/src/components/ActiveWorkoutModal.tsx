import React, { useState, useEffect } from 'react';
import { WorkoutRoutine, Exercise } from '../types';
import { Play, Pause, Check, ChevronRight, ChevronLeft, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sfx } from '../utils/sfx';

interface ActiveWorkoutModalProps {
  workout: WorkoutRoutine;
  onClose: () => void;
  onCompleteWorkout: (workout: WorkoutRoutine, durationSecs: number) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  onClose,
  onCompleteWorkout,
}) => {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [completedSetsMap, setCompletedSetsMap] = useState<Record<string, boolean[]>>(() => {
    const map: Record<string, boolean[]> = {};
    workout.exercises.forEach((ex) => {
      map[ex.id] = new Array(ex.sets).fill(false);
    });
    return map;
  });

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Rest Timer
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);

  const currentExercise: Exercise | undefined = workout.exercises[currentExerciseIdx];

  // Main active workout timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest countdown timer
  useEffect(() => {
    let restInterval: any = null;
    if (isResting && restSeconds > 0) {
      restInterval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restInterval);
  }, [isResting, restSeconds]);

  const toggleSetComplete = (exId: string, setIndex: number) => {
    sfx.playToggle();
    setCompletedSetsMap((prev) => {
      const currentSets = [...(prev[exId] || [])];
      currentSets[setIndex] = !currentSets[setIndex];

      // Trigger rest timer on completing a set
      if (currentSets[setIndex] && currentExercise) {
        setRestSeconds(currentExercise.restSeconds);
        setIsResting(true);
      }

      return { ...prev, [exId]: currentSets };
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleFinishSession = () => {
    sfx.playSuccess();
    onCompleteWorkout(workout, timerSeconds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-white/[0.1] bg-[#11151c] p-5 sm:p-7 shadow-2xl space-y-5 sm:space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                LIVE SESSION
              </span>
              <span className="text-xs text-zinc-400 font-mono uppercase">{workout.category}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1 font-display">{workout.title}</h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Session Timer */}
            <div className="flex items-center gap-2 rounded-2xl bg-[#181f2a] border border-emerald-500/30 px-3.5 sm:px-4 py-1.5 text-xs font-mono font-bold text-emerald-400">
              <span>{formatTime(timerSeconds)}</span>
              <button
                onClick={() => setIsTimerRunning((prev) => !prev)}
                className="text-zinc-400 hover:text-white"
              >
                {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl bg-[#181f2a] p-2 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Rest Interval Banner if Resting */}
        <AnimatePresence>
          {isResting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-1 shadow-lg shadow-emerald-500/10"
            >
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">REST INTERVAL</span>
              <div className="text-3xl font-mono font-bold text-emerald-400">{restSeconds}s</div>
              <p className="text-xs text-zinc-300">Catch your breath, hydrate, and prepare for the next set!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Exercise Detail */}
        {currentExercise && (
          <div className="space-y-4">
            
            {/* Exercise Selector Pagination */}
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Exercise {currentExerciseIdx + 1} of {workout.exercises.length}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentExerciseIdx === 0}
                  onClick={() => setCurrentExerciseIdx((i) => i - 1)}
                  className="rounded-xl bg-[#181f2a] p-2 text-zinc-300 disabled:opacity-30 hover:bg-[#202938]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={currentExerciseIdx === workout.exercises.length - 1}
                  onClick={() => setCurrentExerciseIdx((i) => i + 1)}
                  className="rounded-xl bg-[#181f2a] p-2 text-zinc-300 disabled:opacity-30 hover:bg-[#202938]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Exercise Card */}
            <div className="rounded-2xl bg-[#141a24] border border-white/[0.08] p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display">{currentExercise.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {currentExercise.targetMuscles.map((muscle, idx) => (
                      <span key={idx} className="rounded-full bg-[#0b0f17] border border-white/[0.08] px-2.5 py-0.5 text-[10px] text-emerald-400 font-mono">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">{currentExercise.repsOrDuration}</span>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">{currentExercise.sets} Sets Target</span>
                </div>
              </div>

              {/* Form & Technique */}
              <div className="rounded-xl bg-[#0b0f17] p-3.5 text-xs text-zinc-300 space-y-1.5 border border-white/[0.06]">
                <div className="font-bold text-emerald-400 font-mono">Execution Tip:</div>
                <p className="leading-relaxed">{currentExercise.instructions}</p>
                {currentExercise.tips && (
                  <p className="text-zinc-200 italic mt-1">"Coach Jason: {currentExercise.tips}"</p>
                )}
              </div>

              {/* Set Checkers */}
              <div>
                <span className="text-xs font-medium text-zinc-300 block mb-2">Sets Tracker</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {completedSetsMap[currentExercise.id]?.map((isDone, setIdx) => (
                    <button
                      key={setIdx}
                      onClick={() => toggleSetComplete(currentExercise.id, setIdx)}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-mono font-bold transition-all border ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'bg-[#0b0f17] text-zinc-400 border border-white/[0.08] hover:border-emerald-500/50'
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : null}
                      <span>Set {setIdx + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Bottom */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <button
            onClick={onClose}
            className="text-xs font-medium text-zinc-400 hover:text-white"
          >
            Cancel Session
          </button>

          <button
            onClick={handleFinishSession}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-extrabold text-slate-950 uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Trophy className="h-4 w-4" />
            <span>Complete & Log</span>
          </button>
        </div>

      </div>
    </div>
  );
};

