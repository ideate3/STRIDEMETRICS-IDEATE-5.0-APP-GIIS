import React from 'react';
import { UserProfile, DailyLog, WorkoutRoutine } from '../types';
import { Flame, Droplet, Dumbbell, Award, Sparkles, TrendingUp, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'motion/react';

interface DashboardProps {
  userProfile: UserProfile;
  dailyLog: DailyLog;
  onAddWater: (amountMl: number) => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  featuredWorkouts: WorkoutRoutine[];
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  dailyLog,
  onAddWater,
  onStartWorkout,
  featuredWorkouts,
  onOpenChatWithPrompt,
}) => {
  const caloriePercent = Math.min(100, Math.round((dailyLog.caloriesConsumed / userProfile.dailyCalorieTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((dailyLog.proteinConsumedG / userProfile.dailyProteinTargetG) * 100));
  const carbsPercent = Math.min(100, Math.round((dailyLog.carbsConsumedG / userProfile.dailyCarbsTargetG) * 100));
  const fatPercent = Math.min(100, Math.round((dailyLog.fatConsumedG / userProfile.dailyFatTargetG) * 100));
  const waterPercent = Math.min(100, Math.round((dailyLog.waterConsumedMl / userProfile.dailyWaterMlTarget) * 100));

  const weeklyTrendData = [
    { day: 'Mon', calories: 2100 },
    { day: 'Tue', calories: 2350 },
    { day: 'Wed', calories: 1980 },
    { day: 'Thu', calories: 2420 },
    { day: 'Fri', calories: 2200 },
    { day: 'Sat', calories: 2500 },
    { day: 'Today', calories: dailyLog.caloriesConsumed },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Header Greeting Bar */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-zinc-500 text-xs font-mono font-semibold tracking-widest uppercase">{dailyLog.date}</span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-light tracking-tight mt-1 text-white">
            Welcome back, <span className="font-extrabold text-emerald-400">{userProfile.name}</span>.
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Goal: <span className="text-emerald-400 font-mono font-semibold">{userProfile.fitnessGoal.replace('_', ' ')}</span> • Style: <span className="capitalize text-zinc-300">{userProfile.coachingStyle}</span>
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 squircle-card">
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Readiness Index</span>
            <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">94 / 100</span>
          </div>
          <button
            onClick={() => {
              const coach = userProfile.coachName ? (userProfile.coachName.toLowerCase().startsWith('coach') ? userProfile.coachName : `Coach ${userProfile.coachName}`) : 'Coach Jason';
              onOpenChatWithPrompt(`${coach}, give me a quick daily readiness breakdown based on my target goals.`);
            }}
            className="w-9 h-9 squircle-btn bg-emerald-500 flex items-center justify-center text-slate-950 font-bold hover:scale-105 active:scale-95 transition-all"
            title="Get Readiness Breakdown"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Featured Focus Banner */}
      <div className="liquid-glass squircle-card p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 sm:gap-8 relative overflow-hidden">
        <div className="flex flex-col flex-1">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2.5 flex items-center gap-2 font-mono">
            <Sparkles className="h-4 w-4 text-emerald-400" /> AI Health Focus
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-light leading-relaxed text-zinc-100">
            "Your protein intake is <span className="text-emerald-400 font-bold">{proteinPercent}%</span> to target. Hit your mark to maximize <span className="italic text-emerald-300">muscle recovery</span> today."
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => {
                const coach = userProfile.coachName ? (userProfile.coachName.toLowerCase().startsWith('coach') ? userProfile.coachName : `Coach ${userProfile.coachName}`) : 'Coach Jason';
                onOpenChatWithPrompt(`${coach}, what high-protein snack can I eat right now to hit my target?`);
              }}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-500 text-slate-950 squircle-btn font-extrabold text-xs tracking-wider uppercase hover:bg-emerald-400 active:scale-95 transition-all"
            >
              Get Nutrition Advice
            </button>
          </div>
        </div>
        <div className="w-full md:w-48 flex md:flex-col justify-around items-center gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
          <div className="text-center">
            <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-emerald-400">{dailyLog.caloriesConsumed}</span>
            <span className="block text-[10px] text-zinc-400 uppercase tracking-widest mt-1 font-mono">/ {userProfile.dailyCalorieTarget} Kcal</span>
          </div>
        </div>
      </div>

      {/* Main Metrics 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Calories Card */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-widest">
            <span className="font-semibold flex items-center gap-1.5 text-zinc-200">
              <Flame className="h-4 w-4 text-emerald-400" /> Energy Intake
            </span>
            <span className="font-mono text-emerald-400 font-bold">{caloriePercent}%</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-mono text-white font-bold">{dailyLog.caloriesConsumed}</span>
            <span className="text-xs text-zinc-400 ml-2 font-mono">/ {userProfile.dailyCalorieTarget} kcal</span>
          </div>
          <div className="h-1.5 w-full bg-[#1b2230] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caloriePercent}%` }}
              className="h-full bg-emerald-400"
            />
          </div>
        </div>

        {/* Protein Target */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-widest">
            <span className="font-semibold flex items-center gap-1.5 text-zinc-200">
              <HeartPulse className="h-4 w-4 text-emerald-400" /> Protein
            </span>
            <span className="font-mono text-emerald-400 font-bold">{proteinPercent}%</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-mono text-white font-bold">{dailyLog.proteinConsumedG}g</span>
            <span className="text-xs text-zinc-400 ml-2 font-mono">/ {userProfile.dailyProteinTargetG}g</span>
          </div>
          <div className="h-1.5 w-full bg-[#1b2230] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${proteinPercent}%` }}
              className="h-full bg-emerald-400"
            />
          </div>
        </div>

        {/* Hydration */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-widest">
            <span className="font-semibold flex items-center gap-1.5 text-zinc-200">
              <Droplet className="h-4 w-4 text-emerald-400" /> Hydration
            </span>
            <span className="font-mono text-emerald-400 font-bold">{waterPercent}%</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-mono text-white font-bold">{(dailyLog.waterConsumedMl / 1000).toFixed(1)}</span>
            <span className="text-xs text-zinc-400 ml-1 font-mono">/ {(userProfile.dailyWaterMlTarget / 1000).toFixed(1)} L</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onAddWater(250)}
              className="flex-1 rounded-xl bg-[#1b2230] border border-white/[0.06] py-1.5 text-[11px] font-bold text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
            >
              +250ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="flex-1 rounded-xl bg-[#1b2230] border border-white/[0.06] py-1.5 text-[11px] font-bold text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Workouts Activity */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-widest">
            <span className="font-semibold flex items-center gap-1.5 text-zinc-200">
              <Dumbbell className="h-4 w-4 text-emerald-400" /> Training
            </span>
            <span className="font-mono text-emerald-400 font-bold">{dailyLog.activeMinutes}m</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-mono text-white font-bold">{dailyLog.workoutsCompleted}</span>
            <span className="text-xs text-zinc-400 ml-2">Sessions done</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 font-medium font-mono">Peak performance track active.</div>
        </div>

      </div>

      {/* Analytics & Macro Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Weekly Calories Trend Chart */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2 font-display">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Caloric Consistency
              </h3>
              <p className="text-xs text-zinc-400">Daily intake relative to {userProfile.dailyCalorieTarget} kcal target</p>
            </div>
          </div>

          <div className="h-56 sm:h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <XAxis dataKey="day" stroke="#666670" fontSize={11} tickLine={false} />
                <YAxis stroke="#666670" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b26', borderColor: '#2d3748', borderRadius: '12px', fontSize: '12px', color: '#f4f4f5' }}
                />
                <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                  {weeklyTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#10b981' : '#1f293d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Distribution Bars */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-5 sm:p-6 space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 font-display">
              <Award className="h-4 w-4 text-emerald-400" /> Macronutrient Breakdown
            </h3>
            <p className="text-xs text-zinc-400">Optimized for daily metabolic performance</p>
          </div>

          <div className="space-y-5 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-200">Protein</span>
                <span className="text-emerald-400 font-mono font-bold">{dailyLog.proteinConsumedG}g / {userProfile.dailyProteinTargetG}g</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1b2230] overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${proteinPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-200">Carbohydrates</span>
                <span className="text-zinc-300 font-mono font-bold">{dailyLog.carbsConsumedG}g / {userProfile.dailyCarbsTargetG}g</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1b2230] overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${carbsPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-200">Fats</span>
                <span className="text-zinc-300 font-mono font-bold">{dailyLog.fatConsumedG}g / {userProfile.dailyFatTargetG}g</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1b2230] overflow-hidden">
                <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${fatPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Featured Routines Quick Access */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white font-display">Recommended Training Routines</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredWorkouts.slice(0, 3).map((routine) => (
            <div key={routine.id} className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-5 sm:p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                    {routine.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">{routine.durationMinutes} MINS</span>
                </div>
                <h4 className="font-semibold text-sm sm:text-base text-white">{routine.title}</h4>
                <p className="text-xs text-zinc-400 line-clamp-2">{routine.description}</p>
              </div>
              <button
                onClick={() => onStartWorkout(routine)}
                className="w-full rounded-xl bg-[#1b2230] border border-white/[0.06] py-2.5 text-xs font-bold text-zinc-200 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 transition-all tracking-wider uppercase active:scale-95"
              >
                Start Workout
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

