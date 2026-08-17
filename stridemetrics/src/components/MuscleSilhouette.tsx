import React, { useState } from 'react';
import { MuscleGroupStat } from '../types';
import { Trophy, Zap, Sparkles, Flame, Dumbbell, Eye, Layers, ShieldCheck, Target, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sfx } from '../utils/sfx';

interface MuscleSilhouetteProps {
  muscleStats: Record<string, MuscleGroupStat>;
  onSelectMuscle?: (muscleId: string) => void;
  theme: 'dark' | 'light';
}

export interface DetailedMuscleInfo {
  id: string;
  parentGroup: string;
  name: string;
  scientificName: string;
  exercises: string[];
  functionDesc: string;
  jasonTip: string;
  view: 'front' | 'back';
}

export const INDIVIDUAL_MUSCLES: Record<string, DetailedMuscleInfo> = {
  // ANTERIOR (FRONT) INDIVIDUAL MUSCLES
  chest_upper: {
    id: 'chest_upper',
    parentGroup: 'chest',
    name: 'Upper Pecs (Clavicular Head)',
    scientificName: 'Pectoralis Major - Clavicular',
    exercises: ['Incline Dumbbell Press', 'Low-to-High Cable Flyes', 'Incline Barbell Bench', 'Reverse-Grip Press'],
    functionDesc: 'Shoulder flexion and upper chest shelf volume attached to the collarbone.',
    jasonTip: 'Set bench angle at 30 degrees to hit upper pecs without letting front delts take over.',
    view: 'front',
  },
  chest_lower: {
    id: 'chest_lower',
    parentGroup: 'chest',
    name: 'Lower & Outer Pecs',
    scientificName: 'Pectoralis Major - Sternocostal',
    exercises: ['Decline Bench Press', 'Weighted Bodyweight Dips', 'High-to-Low Cable Flyes', 'Flat Dumbbell Press'],
    functionDesc: 'Arm adduction across lower torso, pushing power, and lower chest sweep definition.',
    jasonTip: 'Flare your elbows at 45 degrees and press downward toward your hips for peak lower pec sweep.',
    view: 'front',
  },
  shoulder_front: {
    id: 'shoulder_front',
    parentGroup: 'shoulders',
    name: 'Front Deltoid (Anterior)',
    scientificName: 'Anterior Deltoid',
    exercises: ['Seated Overhead Press', 'Arnold Press', 'Front Cable Raises', 'Standing Military Press'],
    functionDesc: 'Forward arm elevation and shoulder stabilization during heavy pressing movements.',
    jasonTip: 'Control the eccentric lowering phase down to collarbone height without arching lower back.',
    view: 'front',
  },
  shoulder_side: {
    id: 'shoulder_side',
    parentGroup: 'shoulders',
    name: 'Side Deltoid (Lateral)',
    scientificName: 'Lateral Deltoid',
    exercises: ['Cable Lateral Raises', 'Dumbbell Lateral Raises', 'Egyptian Lateral Raise', 'Upright Rows'],
    functionDesc: 'Arm abduction (raising arms outward) creating broad V-taper 3D shoulder width.',
    jasonTip: 'Lead with your elbows and imagine pouring water jugs at top contraction.',
    view: 'front',
  },
  biceps_long: {
    id: 'biceps_long',
    parentGroup: 'biceps',
    name: 'Outer Biceps Peak (Long Head)',
    scientificName: 'Biceps Brachii - Caput Longum',
    exercises: ['Incline Dumbbell Curls', 'Close-Grip EZ Bar Curls', 'Bayesian Cable Curls', 'Drag Curls'],
    functionDesc: 'Elbow flexion when shoulder is extended behind body; builds the tall peak shape.',
    jasonTip: 'Perform curls on an incline bench to stretch the long head deep behind your torso.',
    view: 'front',
  },
  biceps_short: {
    id: 'biceps_short',
    parentGroup: 'biceps',
    name: 'Inner Biceps Thickness (Short Head)',
    scientificName: 'Biceps Brachii - Caput Breve',
    exercises: ['Wide-Grip Barbell Curls', 'Preacher Curls', 'Concentration Curls', 'Spider Curls'],
    functionDesc: 'Forearm supination and inner biceps thickness when viewed from front.',
    jasonTip: 'Use a wider grip on the barbell to shift mechanical tension directly onto inner short head.',
    view: 'front',
  },
  forearms: {
    id: 'forearms',
    parentGroup: 'biceps',
    name: 'Forearm Flexors & Brachioradialis',
    scientificName: 'Brachioradialis & Flexor Carpi',
    exercises: ['Reverse Barbell Curls', 'Hammer Curls', 'Farmer\'s Carry', 'Wrist Curls'],
    functionDesc: 'Grip strength, wrist stability, and pushing biceps up from underneath.',
    jasonTip: 'Squeeze neutral-grip dumbbells at top of hammer curls to thicken outer forearm wall.',
    view: 'front',
  },
  abs_upper: {
    id: 'abs_upper',
    parentGroup: 'abs',
    name: 'Upper Abs (Rectus Abdominis)',
    scientificName: 'Rectus Abdominis - Upper Segment',
    exercises: ['Kneeling Cable Crunches', 'Weighted Decline Crunches', 'Machine Ab Crunches'],
    functionDesc: 'Spinal flexion from top down; sculpts the upper 4-pack abs.',
    jasonTip: 'Curl your ribcage down toward your pelvis rather than pulling with your neck.',
    view: 'front',
  },
  abs_lower: {
    id: 'abs_lower',
    parentGroup: 'abs',
    name: 'Lower Abs & Deep Core',
    scientificName: 'Transverse Abdominis & Lower Rectus',
    exercises: ['Hanging Captain\'s Chair Leg Raises', 'Ab Wheel Rollouts', 'Reverse Crunches', 'Dragon Flags'],
    functionDesc: 'Pelvic tilt control, deep core brace, and lower V-cut ab line.',
    jasonTip: 'Lift your pelvis upward toward your chest at top of hanging leg raises.',
    view: 'front',
  },
  obliques: {
    id: 'obliques',
    parentGroup: 'abs',
    name: 'External Obliques & Serratus',
    scientificName: 'Obliquus Externus Abdominis',
    exercises: ['Russian Twists', 'Cable Woodchoppers', 'Side Planks', 'Dumbbell Side Bends'],
    functionDesc: 'Torso rotation, lateral flexion, waistline taper, and ribcage stabilization.',
    jasonTip: 'Rotate through your ribcage with control rather than swinging arms wildly.',
    view: 'front',
  },
  quad_rectus: {
    id: 'quad_rectus',
    parentGroup: 'quads',
    name: 'Front Rectus Femoris (Quad)',
    scientificName: 'Rectus Femoris',
    exercises: ['Barbell Back Squats', 'Leg Press', 'Sissy Squats', 'Hack Squats'],
    functionDesc: 'Knee extension and hip flexion; main central bulk of front thigh.',
    jasonTip: 'Squat with deep knee flexion while keeping torso braced upright.',
    view: 'front',
  },
  quad_outer: {
    id: 'quad_outer',
    parentGroup: 'quads',
    name: 'Outer Quad Sweep (Vastus Lateralis)',
    scientificName: 'Vastus Lateralis',
    exercises: ['Narrow Stance Squats', 'Bulgarian Split Squats', 'Hack Squat', 'Leg Extensions'],
    functionDesc: 'Outer thigh sweep aesthetics and heavy leg driving power.',
    jasonTip: 'Use a narrower stance on footplate to emphasize outer quad sweep.',
    view: 'front',
  },
  quad_teardrop: {
    id: 'quad_teardrop',
    parentGroup: 'quads',
    name: 'Teardrop Muscle (Vastus Medialis VMO)',
    scientificName: 'Vastus Medialis Obliquus',
    exercises: ['Terminal Knee Extensions (TKE)', 'Cyclist Squats', 'Leg Extension Lockouts', 'Step-ups'],
    functionDesc: 'Knee joint lockout stability and tracking protection against ACL strain.',
    jasonTip: 'Hold peak lockout on leg extensions for 1 second to burn the inner teardrop.',
    view: 'front',
  },
  calves_inner: {
    id: 'calves_inner',
    parentGroup: 'calves',
    name: 'Anterior Tibialis & Inner Calf',
    scientificName: 'Tibialis Anterior & Medial Gastrocnemius',
    exercises: ['Tibialis Raises', 'Standing Calf Raises', 'Jump Rope', 'Seated Calf Raise'],
    functionDesc: 'Ankle dorsiflexion, shin splint prevention, and lower leg balance.',
    jasonTip: 'Flex your toes upward against resistance to strengthen anterior shin wall.',
    view: 'front',
  },

  // POSTERIOR (BACK) INDIVIDUAL MUSCLES
  trap_upper: {
    id: 'trap_upper',
    parentGroup: 'back',
    name: 'Upper Trapezius (Traps)',
    scientificName: 'Trapezius - Superior',
    exercises: ['Heavy Barbell Shrugs', 'Dumbbell Shrugs', 'Farmer\'s Walk', 'Overhead Y-Raises'],
    functionDesc: 'Scapular elevation, neck support, and upper neck/shoulder armor thickness.',
    jasonTip: 'Pause for 2 full seconds at peak shrug contraction without rolling shoulders.',
    view: 'back',
  },
  shoulder_rear: {
    id: 'shoulder_rear',
    parentGroup: 'shoulders',
    name: 'Rear Deltoid (Posterior)',
    scientificName: 'Posterior Deltoid',
    exercises: ['Reverse Pec Deck Flyes', 'Cable Face Pulls', 'Incline Dumbbell Rear Flyes', 'High Cable Crossovers'],
    functionDesc: 'Horizontal shoulder abduction and rotator cuff health for 3D shoulder roundness.',
    jasonTip: 'Pull with your pinkies leading outwards and squeeze rear shoulder caps.',
    view: 'back',
  },
  mid_back: {
    id: 'mid_back',
    parentGroup: 'back',
    name: 'Middle Traps & Rhomboids (Mid Back)',
    scientificName: 'Rhomboideus Major & Trapezius Medialis',
    exercises: ['Chest-Supported T-Bar Rows', 'Seated Cable Rows (Wide Grip)', 'Meadows Rows', 'Face Pulls'],
    functionDesc: 'Scapular retraction, dense mid-back thickness, and posture alignment.',
    jasonTip: 'Squeeze your shoulder blades together tightly as if crushing a coin between them.',
    view: 'back',
  },
  lats: {
    id: 'lats',
    parentGroup: 'back',
    name: 'Latissimus Dorsi (Lats Wing)',
    scientificName: 'Latissimus Dorsi',
    exercises: ['Wide-Grip Pull-ups', 'Lat Pulldowns', 'Single-Arm Dumbbell Rows', 'Straight-Arm Cable Pushdowns'],
    functionDesc: 'Shoulder depression and pulling inward to build wide V-taper back wings.',
    jasonTip: 'Drive your elbows straight down into your rear hip pockets to engage lats.',
    view: 'back',
  },
  lower_back: {
    id: 'lower_back',
    parentGroup: 'back',
    name: 'Lower Back (Erector Spinae)',
    scientificName: 'Erector Spinae & Thoracolumbar Fascia',
    exercises: ['Conventional Deadlifts', 'Hyperextensions', 'Good Mornings', 'Jefferson Curls'],
    functionDesc: 'Spinal extension, posture support, and deadlift lockout power.',
    jasonTip: 'Maintain a neutral lumbar spine and brace abdominal wall tightly on heavy pulls.',
    view: 'back',
  },
  tricep_long: {
    id: 'tricep_long',
    parentGroup: 'triceps',
    name: 'Triceps Long Head (Inner Mass)',
    scientificName: 'Triceps Brachii - Caput Longum',
    exercises: ['Overhead Dumbbell Extension', 'Skullcrushers', 'Cable Overhead Rope Extension', 'French Press'],
    functionDesc: 'Overhead elbow extension; makes up two-thirds of upper arm size.',
    jasonTip: 'Stretch deep behind your head on overhead extensions to fully lengthen long head.',
    view: 'back',
  },
  tricep_lateral: {
    id: 'tricep_lateral',
    parentGroup: 'triceps',
    name: 'Triceps Lateral Head (Outer Horseshoe)',
    scientificName: 'Triceps Brachii - Caput Laterale',
    exercises: ['Tricep Rope Pushdowns', 'Straight Bar Pushdowns', 'Diamond Push-ups', 'Weighted Dips'],
    functionDesc: 'Explosive elbow lockout and outer horseshoe arm definition.',
    jasonTip: 'Spread rope handles wide at bottom of pushdowns and lock out triceps hard.',
    view: 'back',
  },
  glutes: {
    id: 'glutes',
    parentGroup: 'quads',
    name: 'Gluteus Maximus & Medius',
    scientificName: 'Gluteus Maximus & Medius',
    exercises: ['Barbell Hip Thrusts', 'Romanian Deadlifts', 'Cable Kickbacks', 'Bulgarian Split Squats'],
    functionDesc: 'Hip extension, pelvic stability, and sprinting/jumping power.',
    jasonTip: 'Drive through your heels and squeeze glutes hard at peak hip extension.',
    view: 'back',
  },
  hamstring_outer: {
    id: 'hamstring_outer',
    parentGroup: 'hamstrings',
    name: 'Outer Hamstrings (Biceps Femoris)',
    scientificName: 'Biceps Femoris',
    exercises: ['Lying Leg Curls', 'Stiff-Legged Deadlifts', 'Nordic Hamstring Curls'],
    functionDesc: 'Knee flexion, hip extension, and posterior leg thickness.',
    jasonTip: 'Control a slow 3-second negative descent on leg curls for full fiber recruitment.',
    view: 'back',
  },
  hamstring_inner: {
    id: 'hamstring_inner',
    parentGroup: 'hamstrings',
    name: 'Inner Hamstrings (Semitendinosus)',
    scientificName: 'Semitendinosus & Semimembranosus',
    exercises: ['Seated Leg Curls', 'Single-Leg Romanian Deadlift', 'Dumbbell Hamstring Curls'],
    functionDesc: 'Knee flexion and hip extension synergy.',
    jasonTip: 'Keep toes pointed straight ahead and hinge deep into hips with flat spine.',
    view: 'back',
  },
  gastrocnemius: {
    id: 'gastrocnemius',
    parentGroup: 'calves',
    name: 'Gastrocnemius (Upper Calf Diamond)',
    scientificName: 'Gastrocnemius - Medial & Lateral',
    exercises: ['Standing Calf Raises', 'Donkey Calf Raises', 'Leg Press Calf Raises'],
    functionDesc: 'Explosive ankle jumping power and upper diamond calf shape.',
    jasonTip: 'Perform calf raises with straight knees to fully isolate upper gastrocnemius.',
    view: 'back',
  },
  soleus: {
    id: 'soleus',
    parentGroup: 'calves',
    name: 'Soleus (Lower Calf & Achilles)',
    scientificName: 'Soleus Muscle',
    exercises: ['Seated Calf Raises', 'Bent-Knee Calf Presses', 'Farmer\'s Toe Walk'],
    functionDesc: 'Endurance ankle stability and lower calf width under bent-knee angles.',
    jasonTip: 'Perform seated calf raises slowly with a 1-second stretch pause at the bottom.',
    view: 'back',
  },
};

export const MuscleSilhouette: React.FC<MuscleSilhouetteProps> = ({
  muscleStats,
  onSelectMuscle,
  theme,
}) => {
  const [selectedIndivId, setSelectedIndivId] = useState<string>('chest_upper');
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [displayMode, setDisplayMode] = useState<'rank' | 'heatmap'>('rank');
  const [hoveredIndivId, setHoveredIndivId] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Get style based on parent group stats
  const getIndivMuscleStyle = (indivId: string) => {
    const info = INDIVIDUAL_MUSCLES[indivId];
    const parentKey = info ? info.parentGroup : 'chest';
    const stat = muscleStats[parentKey];
    const lvl = stat?.level || 1;

    if (displayMode === 'heatmap') {
      if (lvl >= 6) return { fill: 'url(#grad-hot)', stroke: '#ef4444', badge: 'Hyper-Trained' };
      if (lvl >= 4) return { fill: 'url(#grad-warm)', stroke: '#f97316', badge: 'Active Focus' };
      if (lvl >= 3) return { fill: 'url(#grad-moderate)', stroke: '#facc15', badge: 'Moderate' };
      if (lvl >= 2) return { fill: 'url(#grad-cool)', stroke: '#3b82f6', badge: 'Recovering' };
      return { fill: 'url(#grad-novice)', stroke: isDark ? '#52525b' : '#94a3b8', badge: 'Rested' };
    }

    if (lvl >= 6) return { fill: 'url(#grad-diamond)', stroke: '#38bdf8', badge: 'Diamond' };
    if (lvl >= 4) return { fill: 'url(#grad-gold)', stroke: '#facc15', badge: 'Gold' };
    if (lvl >= 3) return { fill: 'url(#grad-silver)', stroke: '#e2e8f0', badge: 'Silver' };
    if (lvl >= 2) return { fill: 'url(#grad-bronze)', stroke: '#f97316', badge: 'Bronze' };
    return { fill: 'url(#grad-novice)', stroke: isDark ? '#52525b' : '#cbd5e1', badge: 'Novice' };
  };

  const handleSelectIndiv = (indivId: string) => {
    sfx.playClick();
    setSelectedIndivId(indivId);
    const info = INDIVIDUAL_MUSCLES[indivId];
    if (info && onSelectMuscle) {
      onSelectMuscle(info.parentGroup);
    }
  };

  const selectedInfo = INDIVIDUAL_MUSCLES[selectedIndivId] || INDIVIDUAL_MUSCLES['chest_upper'];
  const parentStat = muscleStats[selectedInfo.parentGroup] || {
    id: selectedInfo.parentGroup,
    name: selectedInfo.parentGroup.toUpperCase(),
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    completedWorkoutsCount: 0,
    rankTitle: 'Novice',
  };

  const selectedStyle = getIndivMuscleStyle(selectedIndivId);

  const hoveredInfo = hoveredIndivId ? INDIVIDUAL_MUSCLES[hoveredIndivId] : null;
  const hoveredStyle = hoveredIndivId ? getIndivMuscleStyle(hoveredIndivId) : null;
  const hoveredParentStat = hoveredInfo ? muscleStats[hoveredInfo.parentGroup] : null;

  return (
    <div className={`rounded-3xl sm:rounded-[32px] p-5 sm:p-7 border backdrop-blur-2xl transition-all ${
      isDark
        ? 'bg-[#12121a]/85 border-white/10 text-white shadow-2xl shadow-black/60'
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl shadow-slate-200/50'
    }`}>
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4 border-zinc-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> HIGH-PRECISION ANATOMICAL MATRIX
            </span>
            <span className="text-xs text-zinc-400 font-mono">24 Individual Muscle Heads</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Anatomical Muscle Inspector
          </h2>
        </div>

        {/* View Switches & Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Mode Switcher: Rank vs Heatmap */}
          <div className={`flex items-center rounded-2xl p-1 border ${
            isDark ? 'bg-[#0a0a0f] border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => {
                sfx.playToggle();
                setDisplayMode('rank');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                displayMode === 'rank'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              Rank View
            </button>
            <button
              onClick={() => {
                sfx.playToggle();
                setDisplayMode('heatmap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                displayMode === 'heatmap'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              Heatmap Mode
            </button>
          </div>

          {/* View Switcher: Anterior (Front) vs Posterior (Back) */}
          <div className={`flex items-center rounded-2xl p-1 border ${
            isDark ? 'bg-[#0a0a0f] border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => {
                sfx.playClick();
                setActiveView('front');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'front'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anterior (Front)
            </button>
            <button
              onClick={() => {
                sfx.playClick();
                setActiveView('back');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'back'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Posterior (Back)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
        
        {/* Left Column: SVG Silhouette with Detailed Muscle Heads */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[440px] p-4 rounded-2xl border bg-gradient-to-b border-white/5 from-transparent to-black/20">
          
          {/* Floating Tooltip */}
          <AnimatePresence>
            {hoveredIndivId && hoveredInfo && hoveredStyle && hoveredParentStat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-4 z-30 pointer-events-none px-3.5 py-2 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                  isDark ? 'bg-black/90 border-emerald-500/40 text-white' : 'bg-slate-900/90 border-emerald-400 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-black uppercase text-emerald-400">{hoveredInfo.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Lv. {hoveredParentStat.level}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-300 mt-0.5">{hoveredInfo.scientificName}</p>
                <div className="text-[10px] font-mono text-emerald-200 mt-1">
                  Tier: <span className="font-bold">{hoveredStyle.badge}</span> ({hoveredInfo.parentGroup.toUpperCase()})
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Body SVG */}
          <motion.svg
            key={activeView}
            initial={{ rotateY: -15, opacity: 0.8 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            viewBox="0 0 320 520"
            className="w-full max-w-[310px] h-auto drop-shadow-2xl overflow-visible cursor-pointer select-none"
          >
            <defs>
              <filter id="glow-active" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Tier Gradients */}
              <linearGradient id="grad-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>

              <linearGradient id="grad-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              <linearGradient id="grad-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>

              <linearGradient id="grad-novice" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDark ? '#3f3f46' : '#cbd5e1'} />
                <stop offset="100%" stopColor={isDark ? '#18181b' : '#94a3b8'} />
              </linearGradient>

              {/* Heatmap Gradients */}
              <linearGradient id="grad-hot" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>

              <linearGradient id="grad-warm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>

              <linearGradient id="grad-moderate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>

              <linearGradient id="grad-cool" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>

            {/* Base Realistic Human Anatomical Underlayer Silhouette */}
            <g opacity={isDark ? "0.18" : "0.22"} pointerEvents="none">
              {/* Head & Neck Base */}
              <path d="M144,38 C144,22 176,22 176,38 C176,52 168,60 160,62 C152,60 144,52 144,38 Z" fill="currentColor" />
              {/* Ears */}
              <path d="M142,34 C140,36 140,42 143,44 M178,34 C180,36 180,42 177,44" stroke="currentColor" strokeWidth="1.5" fill="none" />
              {/* Clavicles / Spine Ghost */}
              <path d="M112,84 C136,90 160,86 160,86 C160,86 184,90 208,84" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="160" y1="62" x2="160" y2="240" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Hands & Feet Base Hints */}
              <path d="M72,242 C68,252 66,262 68,268 M248,242 C252,252 254,262 252,268" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M120,482 C116,492 110,498 106,500 M200,482 C204,492 210,498 214,500" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </g>

            {activeView === 'front' ? (
              /* ================= ANTERIOR (FRONT) HIGH-PRECISION ANATOMICAL MUSCLES ================= */
              <g>
                {/* 1. FRONT DELTOIDS (Anterior Deltoid) */}
                <g
                  onClick={() => handleSelectIndiv('shoulder_front')}
                  onMouseEnter={() => setHoveredIndivId('shoulder_front')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M108,82 C98,85 88,96 88,110 C88,118 94,124 104,122 C110,114 112,100 108,82 Z"
                    fill={getIndivMuscleStyle('shoulder_front').fill}
                    stroke={selectedIndivId === 'shoulder_front' ? '#fbbf24' : getIndivMuscleStyle('shoulder_front').stroke}
                    strokeWidth={selectedIndivId === 'shoulder_front' ? '3' : '1.5'}
                    filter={selectedIndivId === 'shoulder_front' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  {/* Left Deltoid Fiber Detail */}
                  <path d="M104,86 C98,96 96,108 100,118" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" fill="none" pointerEvents="none" />
                  <path
                    d="M212,82 C222,85 232,96 232,110 C232,118 226,124 216,122 C210,114 208,100 212,82 Z"
                    fill={getIndivMuscleStyle('shoulder_front').fill}
                    stroke={selectedIndivId === 'shoulder_front' ? '#fbbf24' : getIndivMuscleStyle('shoulder_front').stroke}
                    strokeWidth={selectedIndivId === 'shoulder_front' ? '3' : '1.5'}
                    filter={selectedIndivId === 'shoulder_front' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  {/* Right Deltoid Fiber Detail */}
                  <path d="M216,86 C222,96 224,108 220,118" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" fill="none" pointerEvents="none" />
                </g>

                {/* 2. SIDE DELTOIDS (Lateral Deltoid Sweep) */}
                <g
                  onClick={() => handleSelectIndiv('shoulder_side')}
                  onMouseEnter={() => setHoveredIndivId('shoulder_side')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M88,110 C80,118 78,130 82,140 C90,140 98,136 104,122 C94,124 88,118 88,110 Z"
                    fill={getIndivMuscleStyle('shoulder_side').fill}
                    stroke={selectedIndivId === 'shoulder_side' ? '#fbbf24' : getIndivMuscleStyle('shoulder_side').stroke}
                    strokeWidth={selectedIndivId === 'shoulder_side' ? '3' : '1.5'}
                    filter={selectedIndivId === 'shoulder_side' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M232,110 C240,118 242,130 238,140 C230,140 222,136 216,122 C226,124 232,118 232,110 Z"
                    fill={getIndivMuscleStyle('shoulder_side').fill}
                    stroke={selectedIndivId === 'shoulder_side' ? '#fbbf24' : getIndivMuscleStyle('shoulder_side').stroke}
                    strokeWidth={selectedIndivId === 'shoulder_side' ? '3' : '1.5'}
                    filter={selectedIndivId === 'shoulder_side' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 3. UPPER PECS (Clavicular Head Sweep) */}
                <g
                  onClick={() => handleSelectIndiv('chest_upper')}
                  onMouseEnter={() => setHoveredIndivId('chest_upper')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M110,84 C128,86 148,86 158,88 L158,110 C146,112 128,114 112,106 C110,98 108,90 110,84 Z"
                    fill={getIndivMuscleStyle('chest_upper').fill}
                    stroke={selectedIndivId === 'chest_upper' ? '#fbbf24' : getIndivMuscleStyle('chest_upper').stroke}
                    strokeWidth={selectedIndivId === 'chest_upper' ? '3' : '1.5'}
                    filter={selectedIndivId === 'chest_upper' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path d="M116,92 C130,94 146,95 154,95" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" fill="none" pointerEvents="none" />
                  <path
                    d="M210,84 C192,86 172,86 162,88 L162,110 C174,112 192,114 208,106 C210,98 212,90 210,84 Z"
                    fill={getIndivMuscleStyle('chest_upper').fill}
                    stroke={selectedIndivId === 'chest_upper' ? '#fbbf24' : getIndivMuscleStyle('chest_upper').stroke}
                    strokeWidth={selectedIndivId === 'chest_upper' ? '3' : '1.5'}
                    filter={selectedIndivId === 'chest_upper' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path d="M204,92 C190,94 174,95 166,95" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" fill="none" pointerEvents="none" />
                </g>

                {/* 4. LOWER & OUTER PECS (Sternocostal Head Belly) */}
                <g
                  onClick={() => handleSelectIndiv('chest_lower')}
                  onMouseEnter={() => setHoveredIndivId('chest_lower')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M112,106 C128,114 146,112 158,110 L158,138 C142,142 124,140 112,128 C110,120 110,112 112,106 Z"
                    fill={getIndivMuscleStyle('chest_lower').fill}
                    stroke={selectedIndivId === 'chest_lower' ? '#fbbf24' : getIndivMuscleStyle('chest_lower').stroke}
                    strokeWidth={selectedIndivId === 'chest_lower' ? '3' : '1.5'}
                    filter={selectedIndivId === 'chest_lower' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path d="M120,118 C132,123 146,124 154,124" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" fill="none" pointerEvents="none" />
                  <path
                    d="M208,106 C192,114 174,112 162,110 L162,138 C178,142 196,140 208,128 C210,120 210,112 208,106 Z"
                    fill={getIndivMuscleStyle('chest_lower').fill}
                    stroke={selectedIndivId === 'chest_lower' ? '#fbbf24' : getIndivMuscleStyle('chest_lower').stroke}
                    strokeWidth={selectedIndivId === 'chest_lower' ? '3' : '1.5'}
                    filter={selectedIndivId === 'chest_lower' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path d="M200,118 C188,123 174,124 166,124" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" fill="none" pointerEvents="none" />
                </g>

                {/* 5. BICEPS LONG HEAD (Outer Peak Fusiform) */}
                <g
                  onClick={() => handleSelectIndiv('biceps_long')}
                  onMouseEnter={() => setHoveredIndivId('biceps_long')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M78,132 C72,146 72,162 78,174 C84,174 88,162 88,142 C88,136 84,132 78,132 Z"
                    fill={getIndivMuscleStyle('biceps_long').fill}
                    stroke={selectedIndivId === 'biceps_long' ? '#fbbf24' : getIndivMuscleStyle('biceps_long').stroke}
                    strokeWidth={selectedIndivId === 'biceps_long' ? '3' : '1.5'}
                    filter={selectedIndivId === 'biceps_long' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M242,132 C248,146 248,162 242,174 C236,174 232,162 232,142 C232,136 236,132 242,132 Z"
                    fill={getIndivMuscleStyle('biceps_long').fill}
                    stroke={selectedIndivId === 'biceps_long' ? '#fbbf24' : getIndivMuscleStyle('biceps_long').stroke}
                    strokeWidth={selectedIndivId === 'biceps_long' ? '3' : '1.5'}
                    filter={selectedIndivId === 'biceps_long' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 6. BICEPS SHORT HEAD (Inner Belly Thickness) */}
                <g
                  onClick={() => handleSelectIndiv('biceps_short')}
                  onMouseEnter={() => setHoveredIndivId('biceps_short')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M88,142 C88,162 84,174 80,180 C88,180 96,168 96,146 C96,138 92,134 88,142 Z"
                    fill={getIndivMuscleStyle('biceps_short').fill}
                    stroke={selectedIndivId === 'biceps_short' ? '#fbbf24' : getIndivMuscleStyle('biceps_short').stroke}
                    strokeWidth={selectedIndivId === 'biceps_short' ? '3' : '1.5'}
                    filter={selectedIndivId === 'biceps_short' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M232,142 C232,162 236,174 240,180 C232,180 224,168 224,146 C224,138 228,134 232,142 Z"
                    fill={getIndivMuscleStyle('biceps_short').fill}
                    stroke={selectedIndivId === 'biceps_short' ? '#fbbf24' : getIndivMuscleStyle('biceps_short').stroke}
                    strokeWidth={selectedIndivId === 'biceps_short' ? '3' : '1.5'}
                    filter={selectedIndivId === 'biceps_short' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 7. FOREARMS & BRACHIORADIALIS (Organic Tapered Bulge) */}
                <g
                  onClick={() => handleSelectIndiv('forearms')}
                  onMouseEnter={() => setHoveredIndivId('forearms')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M78,182 C68,198 68,220 78,242 C84,242 88,236 90,230 C88,210 90,192 92,182 Z"
                    fill={getIndivMuscleStyle('forearms').fill}
                    stroke={selectedIndivId === 'forearms' ? '#fbbf24' : getIndivMuscleStyle('forearms').stroke}
                    strokeWidth={selectedIndivId === 'forearms' ? '3' : '1.5'}
                    filter={selectedIndivId === 'forearms' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M242,182 C252,198 252,220 242,242 C236,242 232,236 230,230 C232,210 230,192 228,182 Z"
                    fill={getIndivMuscleStyle('forearms').fill}
                    stroke={selectedIndivId === 'forearms' ? '#fbbf24' : getIndivMuscleStyle('forearms').stroke}
                    strokeWidth={selectedIndivId === 'forearms' ? '3' : '1.5'}
                    filter={selectedIndivId === 'forearms' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 8. UPPER ABS (Organic Abdominal Cushions) */}
                <g
                  onClick={() => handleSelectIndiv('abs_upper')}
                  onMouseEnter={() => setHoveredIndivId('abs_upper')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  {/* Top Pair */}
                  <path d="M134,144 C134,142 156,142 157,144 C158,154 158,160 157,164 C156,166 134,166 134,164 C133,158 133,150 134,144 Z" fill={getIndivMuscleStyle('abs_upper').fill} stroke={selectedIndivId === 'abs_upper' ? '#fbbf24' : getIndivMuscleStyle('abs_upper').stroke} strokeWidth={selectedIndivId === 'abs_upper' ? '2.5' : '1.5'} />
                  <path d="M163,144 C164,142 186,142 186,144 C187,150 187,158 186,164 C186,166 164,166 163,164 C162,160 162,154 163,144 Z" fill={getIndivMuscleStyle('abs_upper').fill} stroke={selectedIndivId === 'abs_upper' ? '#fbbf24' : getIndivMuscleStyle('abs_upper').stroke} strokeWidth={selectedIndivId === 'abs_upper' ? '2.5' : '1.5'} />
                  {/* Mid Pair */}
                  <path d="M134,170 C134,168 156,168 157,170 C158,180 158,186 157,190 C156,192 134,192 134,190 C133,184 133,176 134,170 Z" fill={getIndivMuscleStyle('abs_upper').fill} stroke={selectedIndivId === 'abs_upper' ? '#fbbf24' : getIndivMuscleStyle('abs_upper').stroke} strokeWidth={selectedIndivId === 'abs_upper' ? '2.5' : '1.5'} />
                  <path d="M163,170 C163,168 186,168 186,170 C187,176 187,184 186,190 C186,192 164,192 163,190 C162,186 162,180 163,170 Z" fill={getIndivMuscleStyle('abs_upper').fill} stroke={selectedIndivId === 'abs_upper' ? '#fbbf24' : getIndivMuscleStyle('abs_upper').stroke} strokeWidth={selectedIndivId === 'abs_upper' ? '2.5' : '1.5'} />
                </g>

                {/* 9. LOWER ABS (V-Taper Abdominal Cushions) */}
                <g
                  onClick={() => handleSelectIndiv('abs_lower')}
                  onMouseEnter={() => setHoveredIndivId('abs_lower')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path d="M136,196 C136,194 156,194 157,196 C157,208 155,218 142,222 C138,220 136,208 136,196 Z" fill={getIndivMuscleStyle('abs_lower').fill} stroke={selectedIndivId === 'abs_lower' ? '#fbbf24' : getIndivMuscleStyle('abs_lower').stroke} strokeWidth={selectedIndivId === 'abs_lower' ? '2.5' : '1.5'} />
                  <path d="M163,196 C164,194 184,194 184,196 C184,208 182,220 178,222 C165,218 163,208 163,196 Z" fill={getIndivMuscleStyle('abs_lower').fill} stroke={selectedIndivId === 'abs_lower' ? '#fbbf24' : getIndivMuscleStyle('abs_lower').stroke} strokeWidth={selectedIndivId === 'abs_lower' ? '2.5' : '1.5'} />
                </g>

                {/* 10. EXTERNAL OBLIQUES & SERRATUS */}
                <g
                  onClick={() => handleSelectIndiv('obliques')}
                  onMouseEnter={() => setHoveredIndivId('obliques')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path d="M112,146 C124,148 128,162 128,212 C120,208 112,188 112,146 Z" fill={getIndivMuscleStyle('obliques').fill} stroke={selectedIndivId === 'obliques' ? '#fbbf24' : getIndivMuscleStyle('obliques').stroke} strokeWidth="1.5" />
                  <path d="M208,146 C196,148 192,162 192,212 C200,208 208,188 208,146 Z" fill={getIndivMuscleStyle('obliques').fill} stroke={selectedIndivId === 'obliques' ? '#fbbf24' : getIndivMuscleStyle('obliques').stroke} strokeWidth="1.5" />
                </g>

                {/* 11. QUAD RECTUS FEMORIS (Fusiform Central Thigh) */}
                <g
                  onClick={() => handleSelectIndiv('quad_rectus')}
                  onMouseEnter={() => setHoveredIndivId('quad_rectus')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M138,252 C130,280 130,320 134,354 C142,356 148,354 148,338 C148,300 146,270 146,252 Z"
                    fill={getIndivMuscleStyle('quad_rectus').fill}
                    stroke={selectedIndivId === 'quad_rectus' ? '#fbbf24' : getIndivMuscleStyle('quad_rectus').stroke}
                    strokeWidth={selectedIndivId === 'quad_rectus' ? '3' : '1.5'}
                    filter={selectedIndivId === 'quad_rectus' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M182,252 C190,280 190,320 186,354 C178,356 172,354 172,338 C172,300 174,270 174,252 Z"
                    fill={getIndivMuscleStyle('quad_rectus').fill}
                    stroke={selectedIndivId === 'quad_rectus' ? '#fbbf24' : getIndivMuscleStyle('quad_rectus').stroke}
                    strokeWidth={selectedIndivId === 'quad_rectus' ? '3' : '1.5'}
                    filter={selectedIndivId === 'quad_rectus' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 12. QUAD OUTER SWEEP (Vastus Lateralis Curved Sweep) */}
                <g
                  onClick={() => handleSelectIndiv('quad_outer')}
                  onMouseEnter={() => setHoveredIndivId('quad_outer')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M128,252 C108,280 106,322 120,364 C128,362 132,352 132,342 C126,310 126,280 134,252 Z"
                    fill={getIndivMuscleStyle('quad_outer').fill}
                    stroke={selectedIndivId === 'quad_outer' ? '#fbbf24' : getIndivMuscleStyle('quad_outer').stroke}
                    strokeWidth={selectedIndivId === 'quad_outer' ? '3' : '1.5'}
                    filter={selectedIndivId === 'quad_outer' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M192,252 C212,280 214,322 200,364 C192,362 188,352 188,342 C194,310 194,280 186,252 Z"
                    fill={getIndivMuscleStyle('quad_outer').fill}
                    stroke={selectedIndivId === 'quad_outer' ? '#fbbf24' : getIndivMuscleStyle('quad_outer').stroke}
                    strokeWidth={selectedIndivId === 'quad_outer' ? '3' : '1.5'}
                    filter={selectedIndivId === 'quad_outer' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 13. QUAD TEARDROP (Vastus Medialis / VMO Bulbous Teardrop) */}
                <g
                  onClick={() => handleSelectIndiv('quad_teardrop')}
                  onMouseEnter={() => setHoveredIndivId('quad_teardrop')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M148,328 C136,342 136,362 142,374 C152,374 154,360 152,338 Z"
                    fill={getIndivMuscleStyle('quad_teardrop').fill}
                    stroke={selectedIndivId === 'quad_teardrop' ? '#fbbf24' : getIndivMuscleStyle('quad_teardrop').stroke}
                    strokeWidth={selectedIndivId === 'quad_teardrop' ? '3' : '1.5'}
                    filter={selectedIndivId === 'quad_teardrop' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M172,328 C184,342 184,362 178,374 C168,374 166,360 168,338 Z"
                    fill={getIndivMuscleStyle('quad_teardrop').fill}
                    stroke={selectedIndivId === 'quad_teardrop' ? '#fbbf24' : getIndivMuscleStyle('quad_teardrop').stroke}
                    strokeWidth={selectedIndivId === 'quad_teardrop' ? '3' : '1.5'}
                    filter={selectedIndivId === 'quad_teardrop' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 14. ANTERIOR TIBIALIS & INNER CALF */}
                <g
                  onClick={() => handleSelectIndiv('calves_inner')}
                  onMouseEnter={() => setHoveredIndivId('calves_inner')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M122,398 C110,422 112,450 126,472 C134,472 138,460 138,440 C134,420 132,408 132,398 Z"
                    fill={getIndivMuscleStyle('calves_inner').fill}
                    stroke={selectedIndivId === 'calves_inner' ? '#fbbf24' : getIndivMuscleStyle('calves_inner').stroke}
                    strokeWidth={selectedIndivId === 'calves_inner' ? '3' : '1.5'}
                    filter={selectedIndivId === 'calves_inner' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M198,398 C210,422 208,450 194,472 C186,472 182,460 182,440 C186,420 188,408 188,398 Z"
                    fill={getIndivMuscleStyle('calves_inner').fill}
                    stroke={selectedIndivId === 'calves_inner' ? '#fbbf24' : getIndivMuscleStyle('calves_inner').stroke}
                    strokeWidth={selectedIndivId === 'calves_inner' ? '3' : '1.5'}
                    filter={selectedIndivId === 'calves_inner' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>
              </g>
            ) : (
              /* ================= POSTERIOR (BACK) HIGH-PRECISION ANATOMICAL MUSCLES ================= */
              <g>
                {/* 1. UPPER TRAPS (Trapezius Clavicular) */}
                <g
                  onClick={() => handleSelectIndiv('trap_upper')}
                  onMouseEnter={() => setHoveredIndivId('trap_upper')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M138,62 C150,60 170,60 182,62 L198,92 C178,98 142,98 122,92 Z"
                    fill={getIndivMuscleStyle('trap_upper').fill}
                    stroke={selectedIndivId === 'trap_upper' ? '#fbbf24' : getIndivMuscleStyle('trap_upper').stroke}
                    strokeWidth={selectedIndivId === 'trap_upper' ? '3' : '1.5'}
                    filter={selectedIndivId === 'trap_upper' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 2. REAR DELTOIDS (Posterior Deltoid Head) */}
                <g
                  onClick={() => handleSelectIndiv('shoulder_rear')}
                  onMouseEnter={() => setHoveredIndivId('shoulder_rear')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M122,92 C108,96 94,106 96,122 C106,126 116,120 120,110 Z"
                    fill={getIndivMuscleStyle('shoulder_rear').fill}
                    stroke={selectedIndivId === 'shoulder_rear' ? '#fbbf24' : getIndivMuscleStyle('shoulder_rear').stroke}
                    strokeWidth={selectedIndivId === 'shoulder_rear' ? '3' : '1.5'}
                    filter={selectedIndivId === 'shoulder_rear' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M198,92 C212,96 226,106 224,122 C214,126 204,120 200,110 Z"
                    fill={getIndivMuscleStyle('shoulder_rear').fill}
                    stroke={selectedIndivId === 'shoulder_rear' ? '#fbbf24' : getIndivMuscleStyle('shoulder_rear').stroke}
                    strokeWidth={selectedIndivId === 'shoulder_rear' ? '3' : '1.5'}
                    filter={selectedIndivId === 'shoulder_rear' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 3. MID TRAPS & RHOMBOIDS */}
                <g
                  onClick={() => handleSelectIndiv('mid_back')}
                  onMouseEnter={() => setHoveredIndivId('mid_back')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M122,94 C142,98 178,98 198,94 L184,142 C168,146 152,146 136,142 Z"
                    fill={getIndivMuscleStyle('mid_back').fill}
                    stroke={selectedIndivId === 'mid_back' ? '#fbbf24' : getIndivMuscleStyle('mid_back').stroke}
                    strokeWidth={selectedIndivId === 'mid_back' ? '3' : '1.5'}
                    filter={selectedIndivId === 'mid_back' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 4. LATISSIMUS DORSI (Lats Sweeping Wings) */}
                <g
                  onClick={() => handleSelectIndiv('lats')}
                  onMouseEnter={() => setHoveredIndivId('lats')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M120,110 C108,128 108,154 116,172 C126,186 132,192 134,192 C132,168 132,140 136,142 Z"
                    fill={getIndivMuscleStyle('lats').fill}
                    stroke={selectedIndivId === 'lats' ? '#fbbf24' : getIndivMuscleStyle('lats').stroke}
                    strokeWidth={selectedIndivId === 'lats' ? '3' : '1.5'}
                    filter={selectedIndivId === 'lats' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M200,110 C212,128 212,154 204,172 C194,186 188,192 186,192 C188,168 188,140 184,142 Z"
                    fill={getIndivMuscleStyle('lats').fill}
                    stroke={selectedIndivId === 'lats' ? '#fbbf24' : getIndivMuscleStyle('lats').stroke}
                    strokeWidth={selectedIndivId === 'lats' ? '3' : '1.5'}
                    filter={selectedIndivId === 'lats' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 5. LOWER BACK (Erector Spinae Pillars) */}
                <g
                  onClick={() => handleSelectIndiv('lower_back')}
                  onMouseEnter={() => setHoveredIndivId('lower_back')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M136,144 C150,144 170,144 184,144 C174,180 170,210 160,210 C150,210 146,180 136,144 Z"
                    fill={getIndivMuscleStyle('lower_back').fill}
                    stroke={selectedIndivId === 'lower_back' ? '#fbbf24' : getIndivMuscleStyle('lower_back').stroke}
                    strokeWidth={selectedIndivId === 'lower_back' ? '3' : '1.5'}
                    filter={selectedIndivId === 'lower_back' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 6. TRICEPS LONG HEAD (Inner Horseshoe Belly) */}
                <g
                  onClick={() => handleSelectIndiv('tricep_long')}
                  onMouseEnter={() => setHoveredIndivId('tricep_long')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M86,126 C78,144 78,162 86,176 C92,168 94,150 92,130 Z"
                    fill={getIndivMuscleStyle('tricep_long').fill}
                    stroke={selectedIndivId === 'tricep_long' ? '#fbbf24' : getIndivMuscleStyle('tricep_long').stroke}
                    strokeWidth={selectedIndivId === 'tricep_long' ? '3' : '1.5'}
                    filter={selectedIndivId === 'tricep_long' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M234,126 C242,144 242,162 234,176 C228,168 226,150 228,130 Z"
                    fill={getIndivMuscleStyle('tricep_long').fill}
                    stroke={selectedIndivId === 'tricep_long' ? '#fbbf24' : getIndivMuscleStyle('tricep_long').stroke}
                    strokeWidth={selectedIndivId === 'tricep_long' ? '3' : '1.5'}
                    filter={selectedIndivId === 'tricep_long' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 7. TRICEPS LATERAL HEAD (Outer Horseshoe Curve) */}
                <g
                  onClick={() => handleSelectIndiv('tricep_lateral')}
                  onMouseEnter={() => setHoveredIndivId('tricep_lateral')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M78,126 C70,144 70,160 78,172 C84,166 86,150 84,130 Z"
                    fill={getIndivMuscleStyle('tricep_lateral').fill}
                    stroke={selectedIndivId === 'tricep_lateral' ? '#fbbf24' : getIndivMuscleStyle('tricep_lateral').stroke}
                    strokeWidth={selectedIndivId === 'tricep_lateral' ? '3' : '1.5'}
                    filter={selectedIndivId === 'tricep_lateral' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M242,126 C250,144 250,160 242,172 C236,166 234,150 236,130 Z"
                    fill={getIndivMuscleStyle('tricep_lateral').fill}
                    stroke={selectedIndivId === 'tricep_lateral' ? '#fbbf24' : getIndivMuscleStyle('tricep_lateral').stroke}
                    strokeWidth={selectedIndivId === 'tricep_lateral' ? '3' : '1.5'}
                    filter={selectedIndivId === 'tricep_lateral' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 8. GLUTES (Gluteal Arch Curvature) */}
                <g
                  onClick={() => handleSelectIndiv('glutes')}
                  onMouseEnter={() => setHoveredIndivId('glutes')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M126,212 C108,232 108,258 128,274 C144,276 158,272 158,212 Z"
                    fill={getIndivMuscleStyle('glutes').fill}
                    stroke={selectedIndivId === 'glutes' ? '#fbbf24' : getIndivMuscleStyle('glutes').stroke}
                    strokeWidth={selectedIndivId === 'glutes' ? '3' : '1.5'}
                    filter={selectedIndivId === 'glutes' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M194,212 C212,232 212,258 192,274 C176,276 162,272 162,212 Z"
                    fill={getIndivMuscleStyle('glutes').fill}
                    stroke={selectedIndivId === 'glutes' ? '#fbbf24' : getIndivMuscleStyle('glutes').stroke}
                    strokeWidth={selectedIndivId === 'glutes' ? '3' : '1.5'}
                    filter={selectedIndivId === 'glutes' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 9. OUTER HAMSTRINGS (Biceps Femoris Curve) */}
                <g
                  onClick={() => handleSelectIndiv('hamstring_outer')}
                  onMouseEnter={() => setHoveredIndivId('hamstring_outer')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M128,278 C112,310 110,350 124,380 C134,380 140,360 140,278 Z"
                    fill={getIndivMuscleStyle('hamstring_outer').fill}
                    stroke={selectedIndivId === 'hamstring_outer' ? '#fbbf24' : getIndivMuscleStyle('hamstring_outer').stroke}
                    strokeWidth={selectedIndivId === 'hamstring_outer' ? '3' : '1.5'}
                    filter={selectedIndivId === 'hamstring_outer' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M192,278 C208,310 210,350 196,380 C186,380 180,360 180,278 Z"
                    fill={getIndivMuscleStyle('hamstring_outer').fill}
                    stroke={selectedIndivId === 'hamstring_outer' ? '#fbbf24' : getIndivMuscleStyle('hamstring_outer').stroke}
                    strokeWidth={selectedIndivId === 'hamstring_outer' ? '3' : '1.5'}
                    filter={selectedIndivId === 'hamstring_outer' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 10. INNER HAMSTRINGS (Semitendinosus Inner Thigh) */}
                <g
                  onClick={() => handleSelectIndiv('hamstring_inner')}
                  onMouseEnter={() => setHoveredIndivId('hamstring_inner')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M142,278 C142,320 140,360 138,380 C148,380 154,360 154,278 Z"
                    fill={getIndivMuscleStyle('hamstring_inner').fill}
                    stroke={selectedIndivId === 'hamstring_inner' ? '#fbbf24' : getIndivMuscleStyle('hamstring_inner').stroke}
                    strokeWidth={selectedIndivId === 'hamstring_inner' ? '3' : '1.5'}
                    filter={selectedIndivId === 'hamstring_inner' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M178,278 C178,320 180,360 182,380 C172,380 166,360 166,278 Z"
                    fill={getIndivMuscleStyle('hamstring_inner').fill}
                    stroke={selectedIndivId === 'hamstring_inner' ? '#fbbf24' : getIndivMuscleStyle('hamstring_inner').stroke}
                    strokeWidth={selectedIndivId === 'hamstring_inner' ? '3' : '1.5'}
                    filter={selectedIndivId === 'hamstring_inner' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 11. GASTROCNEMIUS (Calf Upper Diamond Twin Bellies) */}
                <g
                  onClick={() => handleSelectIndiv('gastrocnemius')}
                  onMouseEnter={() => setHoveredIndivId('gastrocnemius')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M122,392 C108,416 110,442 126,454 C136,454 138,438 134,392 Z"
                    fill={getIndivMuscleStyle('gastrocnemius').fill}
                    stroke={selectedIndivId === 'gastrocnemius' ? '#fbbf24' : getIndivMuscleStyle('gastrocnemius').stroke}
                    strokeWidth={selectedIndivId === 'gastrocnemius' ? '3' : '1.5'}
                    filter={selectedIndivId === 'gastrocnemius' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M198,392 C212,416 210,442 194,454 C184,454 182,438 186,392 Z"
                    fill={getIndivMuscleStyle('gastrocnemius').fill}
                    stroke={selectedIndivId === 'gastrocnemius' ? '#fbbf24' : getIndivMuscleStyle('gastrocnemius').stroke}
                    strokeWidth={selectedIndivId === 'gastrocnemius' ? '3' : '1.5'}
                    filter={selectedIndivId === 'gastrocnemius' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>

                {/* 12. SOLEUS (Achilles Insertion Lower Calf) */}
                <g
                  onClick={() => handleSelectIndiv('soleus')}
                  onMouseEnter={() => setHoveredIndivId('soleus')}
                  onMouseLeave={() => setHoveredIndivId(null)}
                  className="cursor-pointer group"
                >
                  <path
                    d="M126,454 C122,468 126,482 132,488 C138,482 140,468 136,454 Z"
                    fill={getIndivMuscleStyle('soleus').fill}
                    stroke={selectedIndivId === 'soleus' ? '#fbbf24' : getIndivMuscleStyle('soleus').stroke}
                    strokeWidth={selectedIndivId === 'soleus' ? '3' : '1.5'}
                    filter={selectedIndivId === 'soleus' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                  <path
                    d="M194,454 C198,468 194,482 188,488 C182,482 180,468 184,454 Z"
                    fill={getIndivMuscleStyle('soleus').fill}
                    stroke={selectedIndivId === 'soleus' ? '#fbbf24' : getIndivMuscleStyle('soleus').stroke}
                    strokeWidth={selectedIndivId === 'soleus' ? '3' : '1.5'}
                    filter={selectedIndivId === 'soleus' ? 'url(#glow-active)' : undefined}
                    className="transition-all duration-200 hover:brightness-125"
                  />
                </g>
              </g>
            )}
          </motion.svg>

          {/* Quick Tier Legend */}
          <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-zinc-500/20 w-full text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#3f3f46]" /> Novice</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f97316]" /> Bronze</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#e2e8f0]" /> Silver</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#facc15]" /> Gold</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#38bdf8]" /> Diamond</span>
          </div>
        </div>

        {/* Right Column: Detailed Anatomical Dossier & Exercise Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndivId}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl p-5 border relative overflow-hidden ${
                isDark ? 'bg-[#181824] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="h-4 w-4" /> {selectedStyle.badge} Tier - {selectedInfo.parentGroup.toUpperCase()} Group
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase border ${
                  isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  Level {parentStat.level}
                </span>
              </div>

              {/* Title & Scientific Name */}
              <div className="mt-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
                  {selectedInfo.name}
                  <span className="text-xs font-normal font-mono text-zinc-400">({selectedInfo.scientificName})</span>
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                  {selectedInfo.functionDesc}
                </p>
              </div>

              {/* Parent Group XP Progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
                    {parentStat.name} Group Progression
                  </span>
                  <span className="font-bold text-emerald-400">
                    {parentStat.xp} / {parentStat.nextLevelXp} XP
                  </span>
                </div>
                <div className={`h-3 w-full rounded-full overflow-hidden p-0.5 border ${isDark ? 'bg-black/50 border-white/10' : 'bg-slate-200 border-slate-300'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (parentStat.xp / parentStat.nextLevelXp) * 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-500/20">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#12121a] border-white/5' : 'bg-white border-slate-200'}`}>
                  <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Workouts Logged
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                    {parentStat.completedWorkoutsCount} Sessions
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#12121a] border-white/5' : 'bg-white border-slate-200'}`}>
                  <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Rank Badge
                  </div>
                  <div className="text-xs font-extrabold mt-0.5 truncate text-white">
                    {parentStat.rankTitle || `${selectedStyle.badge} Tier`}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${isDark ? 'bg-[#12121a] border-white/5' : 'bg-white border-slate-200'}`}>
                  <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Growth Multiplier
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                    +{(parentStat.level * 10)}% Boost
                  </div>
                </div>
              </div>

              {/* Exercises Recommended */}
              <div className="mt-4 pt-4 border-t border-zinc-500/20">
                <span className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                  isDark ? 'text-emerald-400' : 'text-slate-800'
                }`}>
                  <Dumbbell className="h-3.5 w-3.5" /> Target Exercises for {selectedInfo.name}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedInfo.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border ${
                        isDark ? 'bg-[#12121a]/80 border-white/5 text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold">
                        {idx + 1}
                      </div>
                      <span className="truncate">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Jason Pro Tip */}
              <div className={`mt-4 p-3.5 rounded-xl border ${
                isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400">
                  <Zap className="h-3.5 w-3.5" /> Coach Jason Cue:
                </div>
                <p className="text-xs mt-1 leading-relaxed">
                  "{selectedInfo.jasonTip}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Individual Muscle Quick Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {activeView === 'front' ? 'Anterior (Front) Muscle Heads' : 'Posterior (Back) Muscle Heads'}:
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Click to Inspect</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(INDIVIDUAL_MUSCLES)
                .filter((key) => INDIVIDUAL_MUSCLES[key].view === activeView)
                .map((key) => {
                  const info = INDIVIDUAL_MUSCLES[key];
                  const isSelected = selectedIndivId === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectIndiv(key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md scale-105'
                          : isDark
                            ? 'bg-[#181824] border-white/10 text-zinc-300 hover:border-emerald-500/50'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500/50'
                      }`}
                    >
                      <span>{info.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
