import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/[0.06] ${className}`}
  />
);

export const SkeletonLine: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-lg bg-slate-200/80 dark:bg-white/[0.06] ${className}`}
  />
);

/**
 * Skeleton for Meal Scanner during photo/text macro analysis
 */
export const MealScannerSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#11151c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 dark:border-white/[0.06] pb-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-6 w-24 !rounded-full bg-emerald-500/20" />
            <SkeletonLine className="h-4 w-32" />
          </div>
          <SkeletonLine className="h-7 w-3/4 max-w-sm" />
          <SkeletonLine className="h-4 w-1/2" />
        </div>
        <SkeletonBox className="h-16 w-16 !rounded-2xl shrink-0" />
      </div>

      {/* Macros 4-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Calories', color: 'bg-amber-500/10' },
          { label: 'Protein', color: 'bg-emerald-500/10' },
          { label: 'Carbs', color: 'bg-blue-500/10' },
          { label: 'Fats', color: 'bg-rose-500/10' },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-4 border border-slate-200/50 dark:border-white/[0.04] ${item.color} space-y-2`}
          >
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="h-6 w-20" />
            <SkeletonBox className="h-2 w-full !rounded-full" />
          </div>
        ))}
      </div>

      {/* Key Ingredients & Breakdown List */}
      <div className="space-y-3 pt-2">
        <SkeletonLine className="h-4 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/60 dark:bg-white/[0.03] border border-slate-200/40 dark:border-white/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <SkeletonBox className="h-8 w-8 !rounded-xl" />
                <div className="space-y-1.5">
                  <SkeletonLine className="h-3.5 w-24" />
                  <SkeletonLine className="h-2.5 w-16" />
                </div>
              </div>
              <SkeletonLine className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Coach Insights card */}
      <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-4 w-4 !rounded-full bg-emerald-500/30" />
          <SkeletonLine className="h-4 w-36 bg-emerald-500/20" />
        </div>
        <SkeletonLine className="h-3.5 w-full" />
        <SkeletonLine className="h-3.5 w-5/6" />
      </div>
    </motion.div>
  );
};

/**
 * Skeleton for Workout Plan generation in WorkoutPlanner or WorkoutHub
 */
export const WorkoutPlanSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonLine className="h-6 w-48" />
          <SkeletonLine className="h-3.5 w-64" />
        </div>
        <SkeletonBox className="h-9 w-28 !rounded-xl" />
      </div>

      {/* 7-Day Split Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#11151c] p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-5 w-20 !rounded-full" />
              <SkeletonBox className="h-6 w-16 !rounded-lg" />
            </div>

            <div className="space-y-1.5">
              <SkeletonLine className="h-5 w-4/5" />
              <SkeletonLine className="h-3 w-3/5" />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <SkeletonLine className="h-3.5 w-24" />
              <SkeletonBox className="h-8 w-20 !rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Skeleton for Coach Chat message generation / response
 */
export const CoachMessageSkeleton: React.FC<{ coachName?: string }> = ({ coachName = 'Coach Jason' }) => {
  const coachInitial = coachName.replace(/^Coach\s+/i, '').trim().charAt(0).toUpperCase() || 'C';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-2.5 sm:gap-3 items-start"
    >
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm mt-1 font-display">
        {coachInitial}
      </div>

      <div className="w-[85%] sm:w-[70%] rounded-2xl rounded-tl-none border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#11151c] p-4 sm:p-5 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {coachName} is formulating strategy...
          </span>
          <span className="flex gap-1 items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]"></span>
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <SkeletonLine className="h-3.5 w-full" />
          <SkeletonLine className="h-3.5 w-11/12" />
          <SkeletonLine className="h-3.5 w-4/5" />
        </div>

        <div className="pt-2 flex gap-2">
          <SkeletonBox className="h-6 w-24 !rounded-lg bg-emerald-500/10" />
          <SkeletonBox className="h-6 w-28 !rounded-lg bg-emerald-500/10" />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Full page / Dashboard hydration skeleton for initial startup or cloud sync
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#11151c] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBox className="h-5 w-32 !rounded-full bg-emerald-500/20" />
            <SkeletonLine className="h-8 w-64" />
            <SkeletonLine className="h-4 w-48" />
          </div>
          <div className="flex gap-3">
            <SkeletonBox className="h-11 w-32 !rounded-2xl" />
            <SkeletonBox className="h-11 w-11 !rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 4 Metrics Rings Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#11151c] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonLine className="h-3.5 w-20" />
              <SkeletonBox className="h-8 w-8 !rounded-xl" />
            </div>
            <SkeletonLine className="h-7 w-24" />
            <SkeletonBox className="h-2 w-full !rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Content 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#11151c] p-6 space-y-4">
            <SkeletonLine className="h-6 w-44" />
            <SkeletonBox className="h-40 w-full !rounded-2xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#11151c] p-6 space-y-4">
            <SkeletonLine className="h-6 w-36" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <SkeletonBox key={j} className="h-14 w-full !rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
