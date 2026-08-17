import React, { useState } from 'react';
import { UserProfile, MetricEntry } from '../types';
import {
  Calculator,
  TrendingUp,
  Activity,
  Flame,
  Scale,
  Percent,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { sfx } from '../utils/sfx';

interface CalculatorsHubProps {
  userProfile: UserProfile;
  metricEntries: MetricEntry[];
  onSaveMetricEntry: (entry: MetricEntry) => void;
  onDeleteMetricEntry: (id: string) => void;
  onUpdateProfileTargetCalories: (newTarget: number) => void;
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const CalculatorsHub: React.FC<CalculatorsHubProps> = ({
  userProfile,
  metricEntries,
  onSaveMetricEntry,
  onDeleteMetricEntry,
  onUpdateProfileTargetCalories,
  onOpenChatWithPrompt,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'bmr' | 'bodyfat' | 'bmi'>('overview');

  // BMR State
  const [bmrForm, setBmrForm] = useState({
    weightKg: userProfile.weightKg || 72,
    heightCm: userProfile.heightCm || 178,
    age: userProfile.age || 28,
    gender: userProfile.gender === 'Female' ? 'Female' : 'Male',
    activityLevel: userProfile.activityLevel || 'moderately_active',
    bodyFatPct: 18,
    useKatchMcArdle: false,
  });

  // Body Fat State
  const [bfForm, setBfForm] = useState({
    weightKg: userProfile.weightKg || 72,
    heightCm: userProfile.heightCm || 178,
    age: userProfile.age || 28,
    gender: userProfile.gender === 'Female' ? 'Female' : 'Male',
    neckCm: 39,
    waistCm: 81,
    hipCm: 94,
  });

  // BMI State
  const [bmiForm, setBmiForm] = useState({
    weightKg: userProfile.weightKg || 72,
    heightCm: userProfile.heightCm || 178,
  });

  // Add Log Entry Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: userProfile.weightKg || 72,
    heightCm: userProfile.heightCm || 178,
    bodyFatPercentage: 18,
    neckCm: 39,
    waistCm: 81,
    hipCm: 94,
    notes: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    sfx.playSuccess();
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --------------------------------------------------------------------------
  // BMR / TDEE Calculations
  // --------------------------------------------------------------------------
  const calculateBMR = () => {
    const { weightKg, heightCm, age, gender, bodyFatPct, useKatchMcArdle } = bmrForm;
    if (useKatchMcArdle && bodyFatPct > 0) {
      const leanMass = weightKg * (1 - bodyFatPct / 100);
      return Math.round(370 + 21.6 * leanMass);
    }
    // Mifflin-St Jeor
    if (gender === 'Female') {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
    }
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  };

  const getActivityMultiplier = (level: string) => {
    switch (level) {
      case 'sedentary':
        return 1.2;
      case 'lightly_active':
        return 1.375;
      case 'moderately_active':
        return 1.55;
      case 'very_active':
        return 1.725;
      default:
        return 1.55;
    }
  };

  const calculatedBmr = calculateBMR();
  const calculatedTdee = Math.round(calculatedBmr * getActivityMultiplier(bmrForm.activityLevel));

  // --------------------------------------------------------------------------
  // Body Fat Calculations (US Navy Method)
  // --------------------------------------------------------------------------
  const calculateBodyFat = () => {
    const { weightKg, heightCm, gender, neckCm, waistCm, hipCm } = bfForm;
    if (neckCm <= 0 || waistCm <= 0 || heightCm <= 0) return 18;

    let bf = 18;
    if (gender === 'Male') {
      const val = waistCm - neckCm;
      if (val > 0) {
        bf = 495 / (1.0324 - 0.19077 * Math.log10(val) + 0.15456 * Math.log10(heightCm)) - 450;
      }
    } else {
      const val = waistCm + hipCm - neckCm;
      if (val > 0) {
        bf = 495 / (1.29579 - 0.35004 * Math.log10(val) + 0.22100 * Math.log10(heightCm)) - 450;
      }
    }

    // Clamp between 3% and 50%
    bf = Math.max(3, Math.min(50, bf));
    return parseFloat(bf.toFixed(1));
  };

  const calculatedBodyFatPct = calculateBodyFat();
  const fatMassKg = parseFloat(((bfForm.weightKg * calculatedBodyFatPct) / 100).toFixed(1));
  const leanMassKg = parseFloat((bfForm.weightKg - fatMassKg).toFixed(1));

  const getBodyFatCategory = (bf: number, gender: string) => {
    if (gender === 'Male') {
      if (bf < 6) return { name: 'Essential Fat', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      if (bf <= 13) return { name: 'Athletes', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      if (bf <= 17) return { name: 'Fitness', color: 'text-green-400 bg-green-500/10 border-green-500/30' };
      if (bf <= 24) return { name: 'Average', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
      return { name: 'Above Average / High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    } else {
      if (bf < 14) return { name: 'Essential Fat', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      if (bf <= 20) return { name: 'Athletes', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      if (bf <= 24) return { name: 'Fitness', color: 'text-green-400 bg-green-500/10 border-green-500/30' };
      if (bf <= 31) return { name: 'Average', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
      return { name: 'Above Average / High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    }
  };

  // --------------------------------------------------------------------------
  // BMI Calculations
  // --------------------------------------------------------------------------
  const calculateBMI = (weight: number, heightCm: number) => {
    if (!heightCm || heightCm <= 0) return 22.5;
    const hM = heightCm / 100;
    const bmiVal = weight / (hM * hM);
    return parseFloat(bmiVal.toFixed(1));
  };

  const calculatedBmi = calculateBMI(bmiForm.weightKg, bmiForm.heightCm);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-sky-400', badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30', range: '< 18.5' };
    if (bmi < 25.0) return { category: 'Normal Weight (Healthy)', color: 'text-emerald-400', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', range: '18.5 – 24.9' };
    if (bmi < 30.0) return { category: 'Overweight', color: 'text-teal-400', badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30', range: '25.0 – 29.9' };
    if (bmi < 35.0) return { category: 'Obesity Class I', color: 'text-orange-400', badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30', range: '30.0 – 34.9' };
    return { category: 'Obesity Class II/III', color: 'text-rose-400', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30', range: '≥ 35.0' };
  };

  const minHealthyWeightKg = parseFloat((18.5 * Math.pow(bmiForm.heightCm / 100, 2)).toFixed(1));
  const maxHealthyWeightKg = parseFloat((24.9 * Math.pow(bmiForm.heightCm / 100, 2)).toFixed(1));

  // Save calculated metrics from any tab directly to history
  const handleSaveCalculationToHistory = (
    wKg: number,
    hCm: number,
    ageVal: number,
    gen: string,
    bmiVal: number,
    bmrVal: number,
    tdeeVal: number,
    bfVal: number,
    notesStr: string = 'Calculated metric entry'
  ) => {
    const fatM = parseFloat(((wKg * bfVal) / 100).toFixed(1));
    const leanM = parseFloat((wKg - fatM).toFixed(1));

    const newEntry: MetricEntry = {
      id: `m_entry_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: wKg,
      heightCm: hCm,
      age: ageVal,
      gender: gen,
      bmi: bmiVal,
      bmr: bmrVal,
      tdee: tdeeVal,
      bodyFatPercentage: bfVal,
      fatMassKg: fatM,
      leanMassKg: leanM,
      notes: notesStr,
    };

    onSaveMetricEntry(newEntry);
    showNotification('Saved calculation to your tracking metrics history!');
  };

  // Recent baseline metrics
  const latestEntry = metricEntries.length > 0 ? metricEntries[metricEntries.length - 1] : null;
  const previousEntry = metricEntries.length > 1 ? metricEntries[metricEntries.length - 2] : null;

  const weightDiff = latestEntry && previousEntry ? parseFloat((latestEntry.weightKg - previousEntry.weightKg).toFixed(1)) : 0;
  const bodyFatDiff = latestEntry && previousEntry ? parseFloat((latestEntry.bodyFatPercentage - previousEntry.bodyFatPercentage).toFixed(1)) : 0;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-500 text-slate-950 px-4 py-3 font-bold text-xs sm:text-sm shadow-2xl border border-emerald-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
            Health & Biometric Metrics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Calculate your BMR, TDEE, Body Fat %, and BMI based on Mifflin-St Jeor and US Navy formulas.
          </p>
        </div>

        <button
          onClick={() => {
            sfx.playClick();
            setShowLogModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all hover:bg-emerald-400 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Log Metric Entry</span>
        </button>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar border-b border-white/10">
        {[
          { id: 'overview', label: 'Tracking & Analytics', icon: TrendingUp },
          { id: 'bmr', label: 'BMR & TDEE', icon: Flame },
          { id: 'bodyfat', label: 'Body Fat %', icon: Percent },
          { id: 'bmi', label: 'BMI Gauge', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sfx.playClick();
                setActiveSubTab(tab.id as any);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & TRACKING METRICS
         ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Quick Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Weight Card */}
            <div className="rounded-2xl border border-white/10 bg-[#11151c] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Weight</span>
                <Scale className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {latestEntry ? latestEntry.weightKg : userProfile.weightKg}
                </span>
                <span className="text-xs text-zinc-400 font-bold">kg</span>
              </div>
              {weightDiff !== 0 && (
                <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${
                  weightDiff < 0 ? 'text-emerald-400' : 'text-teal-400'
                }`}>
                  {weightDiff < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                  <span>{Math.abs(weightDiff)} kg since last log</span>
                </div>
              )}
            </div>

            {/* Body Fat Card */}
            <div className="rounded-2xl border border-white/10 bg-[#11151c] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Body Fat</span>
                <Percent className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {latestEntry ? latestEntry.bodyFatPercentage : 18.0}%
                </span>
              </div>
              {bodyFatDiff !== 0 && (
                <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${
                  bodyFatDiff < 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {bodyFatDiff < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                  <span>{Math.abs(bodyFatDiff)}% shift</span>
                </div>
              )}
            </div>

            {/* BMI Card */}
            <div className="rounded-2xl border border-white/10 bg-[#11151c] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>BMI Score</span>
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {latestEntry ? latestEntry.bmi : calculatedBmi}
                </span>
              </div>
              <div className="mt-2 text-[11px] font-bold text-emerald-400">
                {getBMICategory(latestEntry ? latestEntry.bmi : calculatedBmi).category}
              </div>
            </div>

            {/* BMR / TDEE Card */}
            <div className="rounded-2xl border border-white/10 bg-[#11151c] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>Daily TDEE</span>
                <Flame className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {latestEntry ? latestEntry.tdee : calculatedTdee}
                </span>
                <span className="text-xs text-zinc-400 font-bold">kcal</span>
              </div>
              <div className="mt-2 text-[11px] font-bold text-zinc-400 font-mono">
                BMR: {latestEntry ? latestEntry.bmr : calculatedBmr} kcal
              </div>
            </div>

          </div>

          {/* Visual Trend Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Weight & BMI Progression */}
            <div className="rounded-3xl border border-white/10 bg-[#12121a]/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Scale className="h-4 w-4 text-emerald-400" />
                    Weight & BMI History Trend
                  </h3>
                  <p className="text-xs text-zinc-400">Track body weight changes alongside BMI curve</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricEntries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#181825', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="weightKg" name="Weight (kg)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
                    <Area yAxisId="right" type="monotone" dataKey="bmi" name="BMI" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#bmiGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Body Composition (Lean Mass vs Fat Mass) */}
            <div className="rounded-3xl border border-white/10 bg-[#12121a]/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Percent className="h-4 w-4 text-emerald-400" />
                    Body Composition (Lean vs Fat Mass)
                  </h3>
                  <p className="text-xs text-zinc-400">Kilograms of Lean Muscle vs Fat Mass breakdown</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricEntries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#a1a1aa" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#181825', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="leanMassKg" name="Lean Mass (kg)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="fatMassKg" name="Fat Mass (kg)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="bodyFatPercentage" name="Body Fat %" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Historical Metrics Data Table / Mobile Card List */}
          <div className="rounded-3xl border border-white/10 bg-[#12121a]/90 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Biometric Log History
                </h3>
                <p className="text-xs text-zinc-400">Recorded history entries with notes & calculations</p>
              </div>

              <button
                onClick={() => {
                  sfx.playClick();
                  setShowLogModal(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-3.5 py-2 text-xs font-bold text-white border border-white/10 self-start active:scale-95 transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Add Record</span>
              </button>
            </div>

            {/* Mobile View: Clean Biometric Cards */}
            <div className="space-y-3 block md:hidden">
              {metricEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-[#11151c] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-mono font-bold text-white">{entry.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        BMI {entry.bmi}
                      </span>
                      <button
                        onClick={() => {
                          sfx.playClick();
                          onDeleteMetricEntry(entry.id);
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors"
                        title="Delete metric entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="bg-[#181824] rounded-xl p-2">
                      <span className="text-zinc-400 block text-[10px]">Weight</span>
                      <span className="font-bold text-emerald-300">{entry.weightKg} kg</span>
                    </div>
                    <div className="bg-[#181824] rounded-xl p-2">
                      <span className="text-zinc-400 block text-[10px]">Body Fat</span>
                      <span className="font-bold text-emerald-400">{entry.bodyFatPercentage}%</span>
                    </div>
                    <div className="bg-[#181824] rounded-xl p-2">
                      <span className="text-zinc-400 block text-[10px]">TDEE</span>
                      <span className="font-bold text-teal-300">{entry.tdee} kcal</span>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-[11px] text-zinc-400 bg-[#181824]/50 rounded-xl px-2.5 py-1.5 italic">
                      {entry.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop / Tablet View: Full Data Table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-white/10 bg-white/5 text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Weight</th>
                    <th className="py-3 px-3">BMI</th>
                    <th className="py-3 px-3">Body Fat</th>
                    <th className="py-3 px-3">Lean / Fat Mass</th>
                    <th className="py-3 px-3">BMR / TDEE</th>
                    <th className="py-3 px-3">Notes</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {metricEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 text-white font-bold whitespace-nowrap">{entry.date}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-300">{entry.weightKg} kg</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                          {entry.bmi}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">{entry.bodyFatPercentage}%</td>
                      <td className="py-3 px-3 text-zinc-300">
                        <span className="text-sky-400 font-bold">{entry.leanMassKg} kg</span> / <span className="text-rose-400 font-bold">{entry.fatMassKg} kg</span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {entry.bmr} / <span className="text-teal-400 font-bold">{entry.tdee} kcal</span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 max-w-[200px] truncate">{entry.notes || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            sfx.playClick();
                            onDeleteMetricEntry(entry.id);
                          }}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                          title="Delete metric entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: BMR & TDEE CALCULATOR
         ========================================================================= */}
      {activeSubTab === 'bmr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Inputs */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#12121a]/90 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-emerald-400" />
                BMR & Daily Energy Expenditure Calculator
              </h2>

              <button
                onClick={() => {
                  sfx.playClick();
                  setBmrForm({
                    weightKg: userProfile.weightKg,
                    heightCm: userProfile.heightCm,
                    age: userProfile.age,
                    gender: userProfile.gender === 'Female' ? 'Female' : 'Male',
                    activityLevel: userProfile.activityLevel,
                    bodyFatPct: 18,
                    useKatchMcArdle: false,
                  });
                  showNotification('Auto-filled from your profile!');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 active:scale-95 transition-all"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Auto-Fill from Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  value={bmrForm.weightKg}
                  onChange={(e) => setBmrForm({ ...bmrForm, weightKg: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  value={bmrForm.heightCm}
                  onChange={(e) => setBmrForm({ ...bmrForm, heightCm: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Age</label>
                <input
                  type="number"
                  value={bmrForm.age}
                  onChange={(e) => setBmrForm({ ...bmrForm, age: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Biological Sex</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Male', 'Female'].map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => setBmrForm({ ...bmrForm, gender: sex })}
                      className={`rounded-2xl py-2 text-xs font-bold border transition-all ${
                        bmrForm.gender === sex
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {sex}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Activity Multiplier</label>
                <select
                  value={bmrForm.activityLevel}
                  onChange={(e) => setBmrForm({ ...bmrForm, activityLevel: e.target.value as any })}
                  className="w-full rounded-2xl bg-[#181825] border border-white/10 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="sedentary">Sedentary (Little/no exercise - 1.2x)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/wk - 1.375x)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/wk - 1.55x)</option>
                  <option value="very_active">Very Active (6-7 intense days - 1.725x)</option>
                </select>
              </div>
            </div>

            {/* Formula Toggle */}
            <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Use Katch-McArdle Formula (Requires Body Fat %)</span>
                <input
                  type="checkbox"
                  checked={bmrForm.useKatchMcArdle}
                  onChange={(e) => setBmrForm({ ...bmrForm, useKatchMcArdle: e.target.checked })}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
              </div>

              {bmrForm.useKatchMcArdle && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Body Fat Percentage (%)</label>
                  <input
                    type="number"
                    value={bmrForm.bodyFatPct}
                    onChange={(e) => setBmrForm({ ...bmrForm, bodyFatPct: Number(e.target.value) })}
                    className="w-full sm:w-1/2 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  handleSaveCalculationToHistory(
                    bmrForm.weightKg,
                    bmrForm.heightCm,
                    bmrForm.age,
                    bmrForm.gender,
                    calculatedBmi,
                    calculatedBmr,
                    calculatedTdee,
                    bmrForm.bodyFatPct,
                    `BMR: ${calculatedBmr} kcal | TDEE: ${calculatedTdee} kcal`
                  )
                }
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 px-4 py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Save to History Logs</span>
              </button>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Main BMR / TDEE Card */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-[#12121a] to-[#12121a] p-6 space-y-5 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <Zap className="h-3.5 w-3.5" />
                <span>Metabolic Engine Results</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                  <span className="block text-[11px] font-bold text-zinc-400">Basal Metabolic Rate</span>
                  <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{calculatedBmr}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">kcal / day (At Rest)</span>
                </div>

                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5">
                  <span className="block text-[11px] font-bold text-emerald-300">Total Energy Burn (TDEE)</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">{calculatedTdee}</span>
                  <span className="text-[10px] text-emerald-400/70 font-mono">kcal / day (Active)</span>
                </div>
              </div>

              {/* Goal Targets */}
              <div className="text-left space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">Recommended Calorie Targets</span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 text-xs">
                    <span className="font-bold text-emerald-400">Fat Loss (-500 kcal deficit)</span>
                    <span className="font-mono font-black text-white">{Math.max(1200, calculatedTdee - 500)} kcal</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 text-xs">
                    <span className="font-bold text-teal-400">Weight Maintenance</span>
                    <span className="font-mono font-black text-white">{calculatedTdee} kcal</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 text-xs">
                    <span className="font-bold text-sky-400">Muscle Growth (+350 kcal surplus)</span>
                    <span className="font-mono font-black text-white">{calculatedTdee + 350} kcal</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    onUpdateProfileTargetCalories(calculatedTdee);
                    showNotification(`Updated profile daily calorie goal to ${calculatedTdee} kcal!`);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 py-2.5 text-xs font-bold active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Set {calculatedTdee} kcal as Profile Daily Target</span>
                </button>

                <button
                  onClick={() => {
                    onOpenChatWithPrompt(
                      `Coach Jason, my calculated BMR is ${calculatedBmr} kcal and TDEE is ${calculatedTdee} kcal. How should I structure my macros for maximum fat loss while maintaining muscle?`
                    );
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white py-2.5 text-xs font-bold border border-white/10 active:scale-95 transition-all"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Ask Coach Jason for Macro Plan</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: BODY FAT % CALCULATOR
         ========================================================================= */}
      {activeSubTab === 'bodyfat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Inputs */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#12121a]/90 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Percent className="h-5 w-5 text-emerald-400" />
                U.S. Navy Circumference Body Fat Calculator
              </h2>

              <button
                onClick={() => {
                  sfx.playClick();
                  setBfForm({
                    weightKg: userProfile.weightKg,
                    heightCm: userProfile.heightCm,
                    age: userProfile.age,
                    gender: userProfile.gender === 'Female' ? 'Female' : 'Male',
                    neckCm: 39,
                    waistCm: 81,
                    hipCm: 94,
                  });
                  showNotification('Auto-filled from profile!');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 active:scale-95 transition-all"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Auto-Fill</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              The U.S. Navy Method uses tape measure circumferences (neck, waist, and hips for women) alongside height and weight to estimate lean body mass with high statistical precision.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  value={bfForm.weightKg}
                  onChange={(e) => setBfForm({ ...bfForm, weightKg: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  value={bfForm.heightCm}
                  onChange={(e) => setBfForm({ ...bfForm, heightCm: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Gender</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Male', 'Female'].map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => setBfForm({ ...bfForm, gender: sex })}
                      className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                        bfForm.gender === sex
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : 'bg-white/5 text-zinc-300 border-white/10'
                      }`}
                    >
                      {sex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Circumference Tape Measure Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1.5">Neck Circumference (cm)</label>
                <input
                  type="number"
                  value={bfForm.neckCm}
                  onChange={(e) => setBfForm({ ...bfForm, neckCm: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Measure just below Adam's apple</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1.5">Waist Circumference (cm)</label>
                <input
                  type="number"
                  value={bfForm.waistCm}
                  onChange={(e) => setBfForm({ ...bfForm, waistCm: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Measure horizontally at navel level</span>
              </div>

              {bfForm.gender === 'Female' && (
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5">Hip Circumference (cm)</label>
                  <input
                    type="number"
                    value={bfForm.hipCm}
                    onChange={(e) => setBfForm({ ...bfForm, hipCm: Number(e.target.value) })}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Measure at widest part of glutes</span>
                </div>
              )}
            </div>

            <button
              onClick={() =>
                handleSaveCalculationToHistory(
                  bfForm.weightKg,
                  bfForm.heightCm,
                  bfForm.age,
                  bfForm.gender,
                  calculatedBmi,
                  calculatedBmr,
                  calculatedTdee,
                  calculatedBodyFatPct,
                  `Navy Body Fat: ${calculatedBodyFatPct}% | Lean: ${leanMassKg} kg | Fat: ${fatMassKg} kg`
                )
              }
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 px-4 py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Save Body Composition to History</span>
            </button>
          </div>

          {/* Body Composition Breakdown Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-[#12121a] to-[#12121a] p-6 space-y-5 text-center">
              
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <Percent className="h-3.5 w-3.5" />
                <span>Body Fat Breakdown</span>
              </div>

              <div>
                <span className="text-4xl sm:text-5xl font-black text-white">{calculatedBodyFatPct}%</span>
                <div className="mt-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border ${
                    getBodyFatCategory(calculatedBodyFatPct, bfForm.gender).color
                  }`}>
                    {getBodyFatCategory(calculatedBodyFatPct, bfForm.gender).name} Range
                  </span>
                </div>
              </div>

              {/* Composition Stack Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-sky-400">Lean Mass: {leanMassKg} kg</span>
                  <span className="text-rose-400">Fat Mass: {fatMassKg} kg</span>
                </div>

                <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden flex">
                  <div style={{ width: `${100 - calculatedBodyFatPct}%` }} className="bg-sky-400 h-full transition-all duration-500" />
                  <div style={{ width: `${calculatedBodyFatPct}%` }} className="bg-rose-500 h-full transition-all duration-500" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onOpenChatWithPrompt(
                      `Coach Jason, my body fat is estimated at ${calculatedBodyFatPct}% (${leanMassKg} kg lean mass, ${fatMassKg} kg fat mass). What strategies do you recommend to drop body fat while preserving lean muscle?`
                    );
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white py-2.5 text-xs font-bold border border-white/10 active:scale-95 transition-all"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Get Recomposition Advice from Coach Jason</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 4: BMI CALCULATOR
         ========================================================================= */}
      {activeSubTab === 'bmi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#12121a]/90 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-400" />
                Body Mass Index (BMI) & Weight Class Scale
              </h2>

              <button
                onClick={() => {
                  sfx.playClick();
                  setBmiForm({
                    weightKg: userProfile.weightKg,
                    heightCm: userProfile.heightCm,
                  });
                  showNotification('Auto-filled from profile!');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 active:scale-95 transition-all"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Auto-Fill</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  value={bmiForm.weightKg}
                  onChange={(e) => setBmiForm({ ...bmiForm, weightKg: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  value={bmiForm.heightCm}
                  onChange={(e) => setBmiForm({ ...bmiForm, heightCm: Number(e.target.value) })}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* WHO Scale Legend */}
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
              <span className="text-xs font-extrabold text-white">World Health Organization (WHO) Classifications</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium">
                <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 p-2 text-sky-300">
                  <span className="block font-bold">Underweight</span>
                  <span>&lt; 18.5</span>
                </div>

                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2 text-emerald-300">
                  <span className="block font-bold">Normal</span>
                  <span>18.5 – 24.9</span>
                </div>

                <div className="rounded-xl bg-teal-500/10 border border-teal-500/30 p-2 text-teal-300">
                  <span className="block font-bold">Overweight</span>
                  <span>25.0 – 29.9</span>
                </div>

                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2 text-rose-300">
                  <span className="block font-bold">Obese</span>
                  <span>≥ 30.0</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                handleSaveCalculationToHistory(
                  bmiForm.weightKg,
                  bmiForm.heightCm,
                  userProfile.age,
                  userProfile.gender,
                  calculatedBmi,
                  calculatedBmr,
                  calculatedTdee,
                  calculatedBodyFatPct,
                  `BMI Recorded: ${calculatedBmi}`
                )
              }
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-slate-950 px-4 py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Save BMI Entry to Log History</span>
            </button>

          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-500/10 via-[#12121a] to-[#12121a] p-6 space-y-5 text-center">
              
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300 border border-sky-500/30">
                <Activity className="h-3.5 w-3.5" />
                <span>BMI Result</span>
              </div>

              <div>
                <span className="text-4xl sm:text-5xl font-black text-white">{calculatedBmi}</span>
                <div className="mt-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border ${getBMICategory(calculatedBmi).badgeClass}`}>
                    {getBMICategory(calculatedBmi).category}
                  </span>
                </div>
              </div>

              {/* Healthy Weight Recommendation */}
              <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 text-left space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 block">Healthy Weight Range for {bmiForm.heightCm} cm:</span>
                <span className="text-sm font-black text-emerald-400 block">
                  {minHealthyWeightKg} kg – {maxHealthyWeightKg} kg
                </span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          LOG NEW METRIC ENTRY MODAL
         ========================================================================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#12121a] p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                Log Biometric Measurement
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-bold text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={logForm.weightKg}
                    onChange={(e) => setLogForm({ ...logForm, weightKg: Number(e.target.value) })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Body Fat (%)</label>
                  <input
                    type="number"
                    value={logForm.bodyFatPercentage}
                    onChange={(e) => setLogForm({ ...logForm, bodyFatPercentage: Number(e.target.value) })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Notes / Reflection</label>
                <input
                  type="text"
                  placeholder="e.g. Morning weigh-in before breakfast"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-medium text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const bmiVal = calculateBMI(logForm.weightKg, logForm.heightCm);
                  const bmrVal = Math.round(10 * logForm.weightKg + 6.25 * logForm.heightCm - 5 * userProfile.age + 5);
                  const tdeeVal = Math.round(bmrVal * 1.55);
                  const fatM = parseFloat(((logForm.weightKg * logForm.bodyFatPercentage) / 100).toFixed(1));
                  const leanM = parseFloat((logForm.weightKg - fatM).toFixed(1));

                  const newEntry: MetricEntry = {
                    id: `m_entry_${Date.now()}`,
                    date: logForm.date,
                    weightKg: logForm.weightKg,
                    heightCm: logForm.heightCm,
                    age: userProfile.age,
                    gender: userProfile.gender,
                    bmi: bmiVal,
                    bmr: bmrVal,
                    tdee: tdeeVal,
                    bodyFatPercentage: logForm.bodyFatPercentage,
                    fatMassKg: fatM,
                    leanMassKg: leanM,
                    notes: logForm.notes,
                  };

                  onSaveMetricEntry(newEntry);
                  setShowLogModal(false);
                  showNotification('Successfully logged biometric entry!');
                }}
                className="w-full rounded-2xl bg-emerald-500 text-slate-950 py-2.5 text-xs font-extrabold active:scale-95 transition-all hover:bg-emerald-400"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
