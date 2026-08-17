import React from 'react';
import { UserProfile, DailyLog, WorkoutRoutine } from '../types';
import { Flame, Droplet, Dumbbell, Award, Sparkles, TrendingUp, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'motion/react';

interface DashboardProps {
  userProfile: UserProfile;
  dailyLog: DailyLog;
  dailyLogsHistory?: DailyLog[];
  onAddWater: (amountMl: number) => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  featuredWorkouts: WorkoutRoutine[];
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  dailyLog,
  dailyLogsHistory = [],
  onAddWater,
  onStartWorkout,
  featuredWorkouts,
  onOpenChatWithPrompt,
}) => {
  const caloriePercent = Math.min(100, Math.round((dailyLog.caloriesConsumed / (userProfile.dailyCalorieTarget || 2000)) * 100));
  const proteinPercent = Math.min(100, Math.round((dailyLog.proteinConsumedG / (userProfile.dailyProteinTargetG || 150)) * 100));
  const carbsPercent = Math.min(100, Math.round((dailyLog.carbsConsumedG / (userProfile.dailyCarbsTargetG || 250)) * 100));
  const fatPercent = Math.min(100, Math.round((dailyLog.fatConsumedG / (userProfile.dailyFatTargetG || 70)) * 100));
  const waterPercent = Math.min(100, Math.round((dailyLog.waterConsumedMl / (userProfile.dailyWaterMlTarget || 3000)) * 100));

  // Compute dynamic last 7-day trend from historical daily logs + today's live dailyLog
  const weeklyTrendData = React.useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: { day: string; fullDate: string; calories: number; isToday: boolean }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = dayLabels[d.getDay()];

      if (i === 0) {
        result.push({
          day: 'Today',
          fullDate: dateStr,
          calories: dailyLog.caloriesConsumed,
          isToday: true,
        });
      } else {
        const found = dailyLogsHistory.find((h) => h.date === dateStr);
        result.push({
          day: dayName,
          fullDate: dateStr,
          calories: found ? found.caloriesConsumed : 0,
          isToday: false,
        });
      }
    }
    return result;
  }, [dailyLogsHistory, dailyLog]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3.5 sm:py-8 space-y-4 sm:space-y-8">
      
      {/* Header Greeting Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-zinc-500 text-[10px] sm:text-xs font-mono font-semibold tracking-wider uppercase">{dailyLog.date}</span>
          <h1 className="text-xl sm:text-3xl font-display font-light tracking-tight mt-0.5 text-white">
            Welcome back, <span className="font-extrabold text-emerald-400">{userProfile.name}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium text-emerald-400">
            Goal: <strong className="capitalize">{userProfile.fitnessGoal.replace('_', ' ')}</strong>
          </span>
          <button
            onClick={() => {
              const coach = userProfile.coachName ? (userProfile.coachName.toLowerCase().startsWith('coach') ? userProfile.coachName : `Coach ${userProfile.coachName}`) : 'Coach Jason';
              onOpenChatWithPrompt(`${coach}, give me my daily fitness summary and advice for today.`);
            }}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask Coach</span>
          </button>
        </div>
      </header>

      {/* Main Metrics 4-Grid: 2x2 on mobile for native app ergonomics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
        
        {/* Calories Card */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-3 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">
            <span className="font-semibold flex items-center gap-1 text-zinc-200 truncate">
              <Flame className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Energy
            </span>
            <span className="font-mono text-emerald-400 font-bold">{caloriePercent}%</span>
          </div>
          <div>
            <span className="text-xl sm:text-4xl font-mono text-white font-bold">{dailyLog.caloriesConsumed}</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 ml-1 font-mono">/ {userProfile.dailyCalorieTarget}</span>
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
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-3 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">
            <span className="font-semibold flex items-center gap-1 text-zinc-200 truncate">
              <HeartPulse className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Protein
            </span>
            <span className="font-mono text-emerald-400 font-bold">{proteinPercent}%</span>
          </div>
          <div>
            <span className="text-xl sm:text-4xl font-mono text-white font-bold">{dailyLog.proteinConsumedG}g</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 ml-1 font-mono">/ {userProfile.dailyProteinTargetG}g</span>
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
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-3 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">
            <span className="font-semibold flex items-center gap-1 text-zinc-200 truncate">
              <Droplet className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Water
            </span>
            <span className="font-mono text-emerald-400 font-bold">{waterPercent}%</span>
          </div>
          <div>
            <span className="text-xl sm:text-4xl font-mono text-white font-bold">{(dailyLog.waterConsumedMl / 1000).toFixed(1)}</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 ml-1 font-mono">/ {(userProfile.dailyWaterMlTarget / 1000).toFixed(1)}L</span>
          </div>
          <div className="flex gap-1.5 pt-0.5">
            <button
              onClick={() => onAddWater(250)}
              className="flex-1 rounded-xl bg-[#1b2230] border border-white/[0.06] py-2 sm:py-1.5 text-[11px] font-bold text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 active:scale-95 transition-all"
            >
              +250ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="flex-1 rounded-xl bg-[#1b2230] border border-white/[0.06] py-2 sm:py-1.5 text-[11px] font-bold text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 active:scale-95 transition-all"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Workouts Activity */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-3 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-4 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">
            <span className="font-semibold flex items-center gap-1 text-zinc-200 truncate">
              <Dumbbell className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Training
            </span>
            <span className="font-mono text-emerald-400 font-bold">{dailyLog.activeMinutes}m</span>
          </div>
          <div>
            <span className="text-xl sm:text-4xl font-mono text-white font-bold">{dailyLog.workoutsCompleted}</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 ml-1">Sessions</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400/90 font-medium font-mono truncate">Peak performance active</div>
        </div>

      </div>

      {/* Analytics & Macro Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        
        {/* Weekly Calories Trend Chart */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-4 sm:p-6 space-y-3 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 sm:pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2 font-display">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Caloric Consistency
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">Daily intake relative to {userProfile.dailyCalorieTarget} kcal</p>
            </div>
          </div>

          <div className="h-44 sm:h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#666670" fontSize={10} tickLine={false} />
                <YAxis stroke="#666670" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b26', borderColor: '#2d3748', borderRadius: '12px', fontSize: '11px', color: '#f4f4f5' }}
                  formatter={(value: any) => [`${value} kcal`, 'Intake']}
                  labelFormatter={(label: string, payload: any) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${label} (${item.fullDate})` : label;
                  }}
                />
                <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                  {weeklyTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isToday ? '#10b981' : '#1f293d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Distribution Bars */}
        <div className="bg-[#11151c] rounded-2xl border border-white/[0.08] p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="border-b border-white/[0.08] pb-3 sm:pb-4">
            <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2 font-display">
              <Award className="h-4 w-4 text-emerald-400" /> Macronutrient Breakdown
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400">Optimized for daily metabolic performance</p>
          </div>

          <div className="space-y-4 pt-1 sm:pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-200">Protein</span>
                <span className="text-emerald-400 font-mono font-bold text-[11px] sm:text-xs">{dailyLog.proteinConsumedG}g / {userProfile.dailyProteinTargetG}g</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1b2230] overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${proteinPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-200">Carbohydrates</span>
                <span className="text-zinc-300 font-mono font-bold text-[11px] sm:text-xs">{dailyLog.carbsConsumedG}g / {userProfile.dailyCarbsTargetG}g</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1b2230] overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${carbsPercent}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-200">Fats</span>
                <span className="text-zinc-300 font-mono font-bold text-[11px] sm:text-xs">{dailyLog.fatConsumedG}g / {userProfile.dailyFatTargetG}g</span>
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

