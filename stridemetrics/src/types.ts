export type CoachingStyle = 'encouraging' | 'direct' | 'scientific' | 'intense';

export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'mobility_flexibility' | 'general_health';

export type UserRole = 'athlete' | 'trainer' | 'admin';

export interface UserProfile {
  email?: string;
  name: string;
  coachName?: string;
  role?: UserRole;
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  fitnessGoal: FitnessGoal;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  coachingStyle: CoachingStyle;
  dailyCalorieTarget: number;
  dailyProteinTargetG: number;
  dailyCarbsTargetG: number;
  dailyFatTargetG: number;
  dailyWaterMlTarget: number;
  equipmentAvailable: string[];
  storageMode?: 'cloud' | 'local';
}

export interface ApiErrorDetails {
  errorType: 'QUOTA_EXHAUSTED' | 'RATE_LIMITED' | 'TRAFFIC_SPIKE' | 'MISSING_KEY' | 'NETWORK_ERROR' | 'SERVER_ERROR';
  title: string;
  whatHappened: string;
  howToFix: string[];
  retryAfterSeconds?: number;
  canUseCustomKey?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jason';
  text: string;
  timestamp: string;
  audioUrl?: string;
  mealData?: MealAnalysis;
  workoutSuggestion?: WorkoutRoutine;
  isStreaming?: boolean;
  errorDetails?: ApiErrorDetails;
}

export interface MealAnalysis {
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  healthScore: number; // 1-100
  summary: string;
  jasonAdvice: string;
  keyNutrients: string[];
  imageUrl?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  repsOrDuration: string; // e.g. "10-12 reps" or "45 secs"
  restSeconds: number;
  targetMuscles: string[];
  instructions: string;
  tips: string;
  completedSets?: boolean[];
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Strength' | 'HIIT' | 'Cardio' | 'Flexibility' | 'Recovery';
  estimatedCaloriesBurned: number;
  exercises: Exercise[];
  description: string;
}

export type AppTab = 'chat' | 'dashboard' | 'workouts' | 'planner' | 'meals' | 'calculators';

export type ThemeMode = 'dark' | 'light';

export interface MetricEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  bmi: number;
  bmr: number;
  tdee: number;
  bodyFatPercentage: number;
  fatMassKg: number;
  leanMassKg: number;
  neckCm?: number;
  waistCm?: number;
  hipCm?: number;
  notes?: string;
}

export interface MuscleGroupStat {
  id: string; // 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'abs' | 'quads' | 'hamstrings' | 'calves'
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  completedWorkoutsCount: number;
  rankTitle: string; // e.g. "Bronze Chest", "Silver Lats", "Gold Core"
}

export interface ScheduledDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  routineId?: string;
  routineTitle?: string;
  category?: string;
  targetFocus?: string;
  completed?: boolean;
  notes?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  proteinConsumedG: number;
  carbsConsumedG: number;
  fatConsumedG: number;
  waterConsumedMl: number;
  workoutsCompleted: number;
  activeMinutes: number;
  weightRecordedKg?: number;
  notes?: string;
}
