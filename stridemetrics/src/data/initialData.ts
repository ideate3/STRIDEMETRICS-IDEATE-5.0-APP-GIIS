import { UserProfile, WorkoutRoutine, DailyLog, ChatMessage } from '../types';

export const defaultUserProfile: UserProfile = {
  name: 'Alex',
  coachName: 'Coach Jason',
  age: 28,
  gender: 'Non-binary',
  weightKg: 72,
  heightCm: 178,
  fitnessGoal: 'muscle_gain',
  activityLevel: 'moderately_active',
  coachingStyle: 'encouraging',
  dailyCalorieTarget: 2400,
  dailyProteinTargetG: 160,
  dailyCarbsTargetG: 260,
  dailyFatTargetG: 70,
  dailyWaterMlTarget: 3000,
  equipmentAvailable: ['Dumbbells', 'Pull-up bar', 'Resistance bands', 'Bodyweight'],
};

export const sampleWorkouts: WorkoutRoutine[] = [
  {
    id: 'w1',
    title: 'Full Body Hypertrophy Blitz',
    durationMinutes: 35,
    difficulty: 'Intermediate',
    category: 'Strength',
    estimatedCaloriesBurned: 320,
    description: 'A balanced full body routine targeting chest, back, quads, and core with high time-under-tension.',
    exercises: [
      {
        id: 'e1',
        name: 'Goblet Squats',
        sets: 4,
        repsOrDuration: '10-12 reps',
        restSeconds: 60,
        targetMuscles: ['Quads', 'Glutes', 'Core'],
        instructions: 'Hold dumbbell vertically at chest height. Keep chest upright and squat below parallel with knees tracking toes.',
        tips: 'Drive through your mid-foot and squeeze glutes at the top.',
      },
      {
        id: 'e2',
        name: 'Dumbbell Incline Chest Press',
        sets: 4,
        repsOrDuration: '10-12 reps',
        restSeconds: 60,
        targetMuscles: ['Upper Chest', 'Anterior Delts', 'Triceps'],
        instructions: 'Set bench to 30 degrees. Press dumbbells upward with controlled descent.',
        tips: 'Keep shoulder blades retracted and lower back slightly arched.',
      },
      {
        id: 'e3',
        name: 'Single-Arm Dumbbell Rows',
        sets: 3,
        repsOrDuration: '12 reps / side',
        restSeconds: 45,
        targetMuscles: ['Lats', 'Rhomboids', 'Rear Delts'],
        instructions: 'Hinge forward at hips with knee on bench. Pull dumbbell towards your hip bone.',
        tips: 'Lead the movement with your elbow rather than pulling with biceps.',
      },
      {
        id: 'e4',
        name: 'Plank with Shoulder Taps',
        sets: 3,
        repsOrDuration: '45 secs',
        restSeconds: 30,
        targetMuscles: ['Abs', 'Obliques', 'Shoulders'],
        instructions: 'Maintain rigid push-up position. Alternately tap opposite shoulder without hips rocking.',
        tips: 'Squeeze glutes and keep feet slightly wider for stability.',
      },
    ],
  },
  {
    id: 'w2',
    title: 'High-Octane Metabolic HIIT',
    durationMinutes: 20,
    difficulty: 'Intermediate',
    category: 'HIIT',
    estimatedCaloriesBurned: 260,
    description: 'Fast-paced calorie burner designed to boost cardiovascular endurance and EPOC post-exercise burn.',
    exercises: [
      {
        id: 'e5',
        name: 'Mountain Climbers',
        sets: 4,
        repsOrDuration: '40 secs',
        restSeconds: 20,
        targetMuscles: ['Core', 'Shoulders', 'Cardio'],
        instructions: 'Drive knees rapidly towards chest in plank position.',
        tips: 'Keep hips low and shoulders over wrists.',
      },
      {
        id: 'e6',
        name: 'Dumbbell Thrusters',
        sets: 4,
        repsOrDuration: '12 reps',
        restSeconds: 30,
        targetMuscles: ['Quads', 'Shoulders', 'Full Body'],
        instructions: 'Squat with dumbbells at shoulders, drive up explosive and press overhead.',
        tips: 'Transfer momentum smoothly from legs to arms.',
      },
      {
        id: 'e7',
        name: 'Jumping Lunge Switches',
        sets: 3,
        repsOrDuration: '30 secs',
        restSeconds: 30,
        targetMuscles: ['Quads', 'Hamstrings', 'Glutes'],
        instructions: 'Lunge down softly and explode upward switching leg positions in air.',
        tips: 'Land softly on front heel to protect knee joint.',
      },
    ],
  },
  {
    id: 'w3',
    title: 'Core & Lower Back Resilience',
    durationMinutes: 15,
    difficulty: 'Beginner',
    category: 'Flexibility',
    estimatedCaloriesBurned: 110,
    description: 'Mobility, core stabilization, and spinal health sequence to prevent low back pain and improve posture.',
    exercises: [
      {
        id: 'e8',
        name: 'Bird-Dog Holds',
        sets: 3,
        repsOrDuration: '10 reps / side',
        restSeconds: 30,
        targetMuscles: ['Lower Back', 'Glutes', 'Core'],
        instructions: 'On hands and knees, reach opposite arm and leg straight out while bracing abdominal wall.',
        tips: 'Avoid twisting pelvis; keep spine neutral.',
      },
      {
        id: 'e9',
        name: 'Deadbugs',
        sets: 3,
        repsOrDuration: '12 reps / side',
        restSeconds: 30,
        targetMuscles: ['Deep Core', 'Transverse Abdominis'],
        instructions: 'Lie on back, lower opposite hand and leg towards floor without letting lumbar spine arch.',
        tips: 'Press lower back flush against floor throughout.',
      },
    ],
  },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'jason',
    text: "Hey Alex! I'm Jason, your personal AI health and fitness coach. I'm locked in and ready to help you hit your peak. Today we're targeting your muscle gain goals. How are you feeling, or what do you want to lock in first today?",
    timestamp: '09:00 AM',
  },
];

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createFreshDailyLog = (dateStr?: string): DailyLog => ({
  date: dateStr || getTodayDateString(),
  caloriesConsumed: 0,
  proteinConsumedG: 0,
  carbsConsumedG: 0,
  fatConsumedG: 0,
  waterConsumedMl: 0,
  workoutsCompleted: 0,
  activeMinutes: 0,
});

export const initialDailyLog: DailyLog = {
  date: getTodayDateString(),
  caloriesConsumed: 1650,
  proteinConsumedG: 125,
  carbsConsumedG: 180,
  fatConsumedG: 48,
  waterConsumedMl: 2250,
  workoutsCompleted: 1,
  activeMinutes: 35,
  weightRecordedKg: 72,
};

// Seed historical past 6 days logs for trend charts
export const initialDailyLogsHistory: DailyLog[] = [6, 5, 4, 3, 2, 1].map((daysAgo, i) => {
  const d = new Date(Date.now() - daysAgo * 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const presets = [
    { calories: 2150, protein: 150, carbs: 240, fat: 65, water: 2800, workouts: 1, mins: 45 },
    { calories: 2380, protein: 165, carbs: 265, fat: 72, water: 3100, workouts: 1, mins: 40 },
    { calories: 1980, protein: 140, carbs: 210, fat: 58, water: 2500, workouts: 0, mins: 15 },
    { calories: 2420, protein: 170, carbs: 270, fat: 75, water: 3200, workouts: 1, mins: 50 },
    { calories: 2200, protein: 155, carbs: 250, fat: 68, water: 2900, workouts: 1, mins: 35 },
    { calories: 2510, protein: 175, carbs: 280, fat: 76, water: 3400, workouts: 1, mins: 60 },
  ];
  const p = presets[i % presets.length];
  return {
    date: dateStr,
    caloriesConsumed: p.calories,
    proteinConsumedG: p.protein,
    carbsConsumedG: p.carbs,
    fatConsumedG: p.fat,
    waterConsumedMl: p.water,
    workoutsCompleted: p.workouts,
    activeMinutes: p.mins,
  };
});

export const initialMetricEntries = [
  {
    id: 'm_entry_1',
    date: new Date(Date.now() - 56 * 86400000).toISOString().split('T')[0],
    weightKg: 75.0,
    heightCm: 178,
    age: 28,
    gender: 'Male',
    bmi: 23.7,
    bmr: 1715,
    tdee: 2658,
    bodyFatPercentage: 20.5,
    fatMassKg: 15.4,
    leanMassKg: 59.6,
    neckCm: 39,
    waistCm: 85,
    hipCm: 96,
    notes: 'Initial fitness baseline assessment with Coach Jason.',
  },
  {
    id: 'm_entry_2',
    date: new Date(Date.now() - 42 * 86400000).toISOString().split('T')[0],
    weightKg: 74.2,
    heightCm: 178,
    age: 28,
    gender: 'Male',
    bmi: 23.4,
    bmr: 1708,
    tdee: 2647,
    bodyFatPercentage: 19.8,
    fatMassKg: 14.7,
    leanMassKg: 59.5,
    neckCm: 39,
    waistCm: 84,
    hipCm: 95,
    notes: 'Starting consistent strength routine and tracking macros.',
  },
  {
    id: 'm_entry_3',
    date: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0],
    weightKg: 73.5,
    heightCm: 178,
    age: 28,
    gender: 'Male',
    bmi: 23.2,
    bmr: 1701,
    tdee: 2636,
    bodyFatPercentage: 19.0,
    fatMassKg: 14.0,
    leanMassKg: 59.5,
    neckCm: 39.5,
    waistCm: 82.5,
    hipCm: 94,
    notes: 'Progressing nicely; waist dropping while lean muscle mass holds.',
  },
  {
    id: 'm_entry_4',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    weightKg: 72.8,
    heightCm: 178,
    age: 28,
    gender: 'Male',
    bmi: 23.0,
    bmr: 1694,
    tdee: 2625,
    bodyFatPercentage: 18.2,
    fatMassKg: 13.2,
    leanMassKg: 59.6,
    neckCm: 40,
    waistCm: 81,
    hipCm: 93.5,
    notes: 'Energy levels high, workouts feeling strong.',
  },
  {
    id: 'm_entry_5',
    date: new Date().toISOString().split('T')[0],
    weightKg: 72.0,
    heightCm: 178,
    age: 28,
    gender: 'Male',
    bmi: 22.7,
    bmr: 1686,
    tdee: 2613,
    bodyFatPercentage: 17.5,
    fatMassKg: 12.6,
    leanMassKg: 59.4,
    neckCm: 40,
    waistCm: 80,
    hipCm: 93,
    notes: 'Current baseline measurement.',
  },
];
