import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ChatMessage, DailyLog, WorkoutRoutine, MealAnalysis, AppTab, ThemeMode, MuscleGroupStat, ScheduledDay, MetricEntry } from './types';
import { defaultUserProfile, initialChatMessages, sampleWorkouts, initialDailyLog, initialMetricEntries, getTodayDateString, createFreshDailyLog, initialDailyLogsHistory } from './data/initialData';
import { Navbar } from './components/Navbar';
import { CoachChat } from './components/CoachChat';
import { Dashboard } from './components/Dashboard';
import { WorkoutHub } from './components/WorkoutHub';
import { MealScanner } from './components/MealScanner';
import { WorkoutPlanner } from './components/WorkoutPlanner';
import { CalculatorsHub } from './components/CalculatorsHub';
import { LoginScreen } from './components/LoginScreen';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { DeviceIntegrationsModal } from './components/DeviceIntegrationsModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, firebaseSignOut, sanitizeForFirestore, handleFirestoreError, OperationType } from './lib/firebase';
import { sfx } from './utils/sfx';
import { UserRole } from './types';
import { useDeferredLoading } from './hooks/useDeferredLoading';
import { DashboardSkeleton } from './components/SkeletonLoader';

const defaultMuscleStats: Record<string, MuscleGroupStat> = {
  chest: { id: 'chest', name: 'Chest', level: 2, xp: 60, nextLevelXp: 100, completedWorkoutsCount: 3, rankTitle: 'Bronze Chest' },
  back: { id: 'back', name: 'Back & Lats', level: 2, xp: 80, nextLevelXp: 100, completedWorkoutsCount: 4, rankTitle: 'Bronze Lats' },
  shoulders: { id: 'shoulders', name: 'Shoulders', level: 1, xp: 40, nextLevelXp: 100, completedWorkoutsCount: 2, rankTitle: 'Novice Shoulders' },
  biceps: { id: 'biceps', name: 'Biceps', level: 3, xp: 120, nextLevelXp: 200, completedWorkoutsCount: 6, rankTitle: 'Silver Biceps' },
  triceps: { id: 'triceps', name: 'Triceps', level: 2, xp: 50, nextLevelXp: 100, completedWorkoutsCount: 3, rankTitle: 'Bronze Triceps' },
  abs: { id: 'abs', name: 'Abs & Core', level: 2, xp: 70, nextLevelXp: 100, completedWorkoutsCount: 4, rankTitle: 'Bronze Core' },
  quads: { id: 'quads', name: 'Quads & Glutes', level: 1, xp: 30, nextLevelXp: 100, completedWorkoutsCount: 1, rankTitle: 'Novice Legs' },
  hamstrings: { id: 'hamstrings', name: 'Hamstrings', level: 1, xp: 20, nextLevelXp: 100, completedWorkoutsCount: 1, rankTitle: 'Novice Hamstrings' },
  calves: { id: 'calves', name: 'Calves', level: 1, xp: 10, nextLevelXp: 100, completedWorkoutsCount: 1, rankTitle: 'Novice Calves' },
};

const initialScheduledDays: ScheduledDay[] = [
  { day: 'Monday', routineId: 'r1', routineTitle: 'Chest & Triceps Hypertrophy', category: 'Strength', targetFocus: 'Chest, Shoulders & Triceps', completed: true },
  { day: 'Tuesday', routineId: 'r2', routineTitle: 'HIIT Full-Body Calorie Blast', category: 'HIIT', targetFocus: 'Full Body Conditioning', completed: false },
  { day: 'Wednesday', routineId: 'r1', routineTitle: 'Back & Biceps Power', category: 'Strength', targetFocus: 'Lats, Upper Back & Biceps', completed: false },
  { day: 'Thursday', routineId: 'r3', routineTitle: 'Lower Body & Core Crusher', category: 'Strength', targetFocus: 'Quads, Hamstrings & Abs', completed: false },
  { day: 'Friday', routineId: 'r2', routineTitle: 'Cardio & Mobility Recovery', category: 'Recovery', targetFocus: 'Active Rest & Stretching', completed: false },
  { day: 'Saturday', routineId: 'r1', routineTitle: 'Upper Body Pump', category: 'Strength', targetFocus: 'Chest, Back & Arms', completed: false },
  { day: 'Sunday', routineTitle: 'Complete Rest & Recovery', targetFocus: 'Sleep & Muscle Synthesis', completed: false },
];

// Helper to derive safe account storage key
const getAccountKey = (email?: string | null, uid?: string | null) => {
  if (uid) return `uid_${uid}`;
  if (email) return `email_${email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
  return 'guest';
};

const getStoredAccountData = (key: string, email?: string | null) => {
  const getItem = (type: string) => localStorage.getItem(`stridemetrics_acc_${key}_${type}`);

  // Messages
  const savedMessages = getItem('messages');
  let loadedMessages: ChatMessage[];
  if (savedMessages) {
    try { loadedMessages = JSON.parse(savedMessages); } catch (e) { loadedMessages = initialChatMessages; }
  } else {
    // Legacy single-key migration fallback ONLY if on guest key
    const legacy = localStorage.getItem('jason_chat_messages');
    if (legacy && key === 'guest') {
      try { loadedMessages = JSON.parse(legacy); } catch (e) { loadedMessages = initialChatMessages; }
    } else {
      loadedMessages = [
        {
          id: `w_${Date.now()}`,
          sender: 'jason',
          text: `Welcome to STRIDEMETRICS! I'm Coach Jason, your dedicated AI health & performance coach. Ask me about custom workouts, daily nutrition targets, or form checks. Let's get after it!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ];
    }
  }

  // Profile
  const savedProfile = getItem('profile');
  let loadedProfile: UserProfile;
  if (savedProfile) {
    try { loadedProfile = JSON.parse(savedProfile); } catch (e) { loadedProfile = defaultUserProfile; }
  } else {
    const legacy = localStorage.getItem('jason_user_profile');
    if (legacy && key === 'guest') {
      try { loadedProfile = JSON.parse(legacy); } catch (e) { loadedProfile = defaultUserProfile; }
    } else {
      loadedProfile = {
        ...defaultUserProfile,
        email: email || defaultUserProfile.email,
        name: email ? email.split('@')[0] : defaultUserProfile.name,
      };
    }
  }

  // Daily Logs History
  const savedHistory = getItem('dailyLogsHistory');
  let loadedHistory: DailyLog[];
  if (savedHistory) {
    try { loadedHistory = JSON.parse(savedHistory); } catch (e) { loadedHistory = initialDailyLogsHistory; }
  } else {
    loadedHistory = initialDailyLogsHistory;
  }

  // Daily Log with automatic Day Rollover detection on load
  const todayStr = getTodayDateString();
  const savedLog = getItem('dailyLog');
  let loadedLog: DailyLog;
  if (savedLog) {
    try {
      loadedLog = JSON.parse(savedLog);
      // Check if saved log belongs to a past day
      if (loadedLog.date && loadedLog.date !== todayStr) {
        // Archive the completed day to history if it has activity
        const hasActivity = (loadedLog.caloriesConsumed > 0 || loadedLog.proteinConsumedG > 0 || loadedLog.carbsConsumedG > 0 || loadedLog.fatConsumedG > 0 || loadedLog.waterConsumedMl > 0 || loadedLog.workoutsCompleted > 0);
        if (hasActivity && !loadedHistory.some((h) => h.date === loadedLog.date)) {
          loadedHistory = [...loadedHistory, loadedLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        // Initialize clean, zeroed stats for today
        loadedLog = createFreshDailyLog(todayStr);
      }
    } catch (e) {
      loadedLog = createFreshDailyLog(todayStr);
    }
  } else {
    const legacy = localStorage.getItem('jason_daily_log');
    if (legacy && key === 'guest') {
      try {
        loadedLog = JSON.parse(legacy);
        if (loadedLog.date && loadedLog.date !== todayStr) {
          loadedLog = createFreshDailyLog(todayStr);
        }
      } catch (e) {
        loadedLog = createFreshDailyLog(todayStr);
      }
    } else {
      loadedLog = createFreshDailyLog(todayStr);
    }
  }

  // Routines
  const savedRoutines = getItem('routines');
  let loadedRoutines: WorkoutRoutine[];
  if (savedRoutines) {
    try { loadedRoutines = JSON.parse(savedRoutines); } catch (e) { loadedRoutines = sampleWorkouts; }
  } else {
    const legacy = localStorage.getItem('jason_routines');
    if (legacy && key === 'guest') {
      try { loadedRoutines = JSON.parse(legacy); } catch (e) { loadedRoutines = sampleWorkouts; }
    } else {
      loadedRoutines = sampleWorkouts;
    }
  }

  // Muscle Stats
  const savedMuscle = getItem('muscleStats');
  let loadedMuscle: Record<string, MuscleGroupStat>;
  if (savedMuscle) {
    try { loadedMuscle = JSON.parse(savedMuscle); } catch (e) { loadedMuscle = defaultMuscleStats; }
  } else {
    const legacy = localStorage.getItem('jason_muscle_stats');
    if (legacy && key === 'guest') {
      try { loadedMuscle = JSON.parse(legacy); } catch (e) { loadedMuscle = defaultMuscleStats; }
    } else {
      loadedMuscle = defaultMuscleStats;
    }
  }

  // Scheduled Days
  const savedSchedule = getItem('scheduledDays');
  let loadedSchedule: ScheduledDay[];
  if (savedSchedule) {
    try { loadedSchedule = JSON.parse(savedSchedule); } catch (e) { loadedSchedule = initialScheduledDays; }
  } else {
    const legacy = localStorage.getItem('jason_scheduled_days');
    if (legacy && key === 'guest') {
      try { loadedSchedule = JSON.parse(legacy); } catch (e) { loadedSchedule = initialScheduledDays; }
    } else {
      loadedSchedule = initialScheduledDays;
    }
  }

  // Metric Entries
  const savedMetrics = getItem('metricEntries');
  let loadedMetrics: MetricEntry[];
  if (savedMetrics) {
    try { loadedMetrics = JSON.parse(savedMetrics); } catch (e) { loadedMetrics = initialMetricEntries; }
  } else {
    const legacy = localStorage.getItem('jason_metric_entries');
    if (legacy && key === 'guest') {
      try { loadedMetrics = JSON.parse(legacy); } catch (e) { loadedMetrics = initialMetricEntries; }
    } else {
      loadedMetrics = initialMetricEntries;
    }
  }

  const loadedApiKeyOption = (getItem('apiKeyOption') as 'default' | 'custom') || 'default';
  const loadedCustomApiKey = getItem('customApiKey') || '';

  return {
    messages: loadedMessages,
    userProfile: loadedProfile,
    dailyLog: loadedLog,
    dailyLogsHistory: loadedHistory,
    routines: loadedRoutines,
    muscleStats: loadedMuscle,
    scheduledDays: loadedSchedule,
    metricEntries: loadedMetrics,
    apiKeyOption: loadedApiKeyOption,
    customApiKey: loadedCustomApiKey,
  };
};

export default function App() {
  const [userAuthEmail, setUserAuthEmail] = useState<string | null>(() => {
    return localStorage.getItem('jason_user_auth_email') || null;
  });

  const [accountKey, setAccountKey] = useState<string>(() => {
    const initialEmail = localStorage.getItem('jason_user_auth_email');
    return getAccountKey(initialEmail, auth.currentUser?.uid);
  });

  const initialData = getStoredAccountData(accountKey, userAuthEmail);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('jason_logged_in') === 'true' || !!userAuthEmail;
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('jason_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(initialData.userProfile);
  const [messages, setMessages] = useState<ChatMessage[]>(initialData.messages);
  const [dailyLog, setDailyLog] = useState<DailyLog>(initialData.dailyLog);
  const [dailyLogsHistory, setDailyLogsHistory] = useState<DailyLog[]>(initialData.dailyLogsHistory);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(initialData.routines);
  const [muscleStats, setMuscleStats] = useState<Record<string, MuscleGroupStat>>(initialData.muscleStats);
  const [scheduledDays, setScheduledDays] = useState<ScheduledDay[]>(initialData.scheduledDays);
  const [metricEntries, setMetricEntries] = useState<MetricEntry[]>(initialData.metricEntries);
  const [apiKeyOption, setApiKeyOption] = useState<'default' | 'custom'>(initialData.apiKeyOption);
  const [customApiKey, setCustomApiKey] = useState<string>(initialData.customApiKey);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showDevicesModal, setShowDevicesModal] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);

  // Switch active account state & load account-isolated storage
  const switchAccount = (newKey: string, email?: string | null) => {
    const data = getStoredAccountData(newKey, email);
    setAccountKey(newKey);
    setMessages(data.messages);
    setUserProfile(data.userProfile);
    setDailyLog(data.dailyLog);
    setDailyLogsHistory(data.dailyLogsHistory);
    setRoutines(data.routines);
    setMuscleStats(data.muscleStats);
    setScheduledDays(data.scheduledDays);
    setMetricEntries(data.metricEntries);
    setApiKeyOption(data.apiKeyOption);
    setCustomApiKey(data.customApiKey);
  };

  // Sync API Key settings and persist immediately
  const handleSaveKeySettings = (option: 'default' | 'custom', customKey: string) => {
    setApiKeyOption(option);
    setCustomApiKey(customKey);
    localStorage.setItem(`stridemetrics_acc_${accountKey}_apiKeyOption`, option);
    localStorage.setItem(`stridemetrics_acc_${accountKey}_customApiKey`, customKey);
    localStorage.setItem('jason_apiKeyOption', option);
    localStorage.setItem('jason_customApiKey', customKey);

    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), sanitizeForFirestore({
        apiKeyOption: option,
        customApiKey: option === 'custom' ? customKey.trim() : '',
        updatedAt: new Date().toISOString(),
      }), { merge: true }).catch((err) => console.warn('Firestore key sync warning:', err));
    }
  };

  const handleUserLoginSuccess = (email: string, uid: string) => {
    const newKey = getAccountKey(email, uid);
    setUserAuthEmail(email);
    setIsLoggedIn(true);
    localStorage.setItem('jason_user_auth_email', email);
    switchAccount(newKey, email);
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Error signing out of Firebase:', e);
    }
    setUserAuthEmail(null);
    setIsLoggedIn(false);
    localStorage.removeItem('jason_user_auth_email');
    localStorage.setItem('jason_logged_in', 'false');
    switchAccount('guest', null);
  };

  const [isCloudLoaded, setIsCloudLoaded] = useState<boolean>(false);

  // Deferred skeleton loading for initial cloud hydration: only shows if initial network fetch takes > 350ms
  const showCloudSyncSkeleton = useDeferredLoading(!isCloudLoaded, { delay: 350, minDisplayTime: 450 });

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsCloudLoaded(false);
        const newKey = getAccountKey(user.email, user.uid);
        setUserAuthEmail(user.email);
        setIsLoggedIn(true);
        localStorage.setItem('jason_user_auth_email', user.email || '');

        switchAccount(newKey, user.email);

        // Fetch custom user preferences & profile from Firestore if available
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.apiKeyOption) setApiKeyOption(data.apiKeyOption);
            if (data.customApiKey) setCustomApiKey(data.customApiKey);
            if (data.userProfile) setUserProfile(data.userProfile);
            if (data.messages && Array.isArray(data.messages)) setMessages(data.messages);
            if (data.dailyLog) {
              const todayStr = getTodayDateString();
              if (data.dailyLog.date && data.dailyLog.date !== todayStr) {
                setDailyLog(createFreshDailyLog(todayStr));
              } else {
                setDailyLog(data.dailyLog);
              }
            }
            if (data.dailyLogsHistory && Array.isArray(data.dailyLogsHistory)) setDailyLogsHistory(data.dailyLogsHistory);
            if (data.routines) setRoutines(data.routines);
            if (data.muscleStats) setMuscleStats(data.muscleStats);
            if (data.scheduledDays) setScheduledDays(data.scheduledDays);
            if (data.metricEntries) setMetricEntries(data.metricEntries);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
        } finally {
          setIsCloudLoaded(true);
        }
      } else {
        setIsCloudLoaded(true);
        if (accountKey !== 'guest') {
          switchAccount('guest', null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Day Rollover Detection: monitors date change at midnight & on app wake/focus
  const dailyLogRef = useRef(dailyLog);
  useEffect(() => {
    dailyLogRef.current = dailyLog;
  }, [dailyLog]);

  const checkAndExecuteDayRollover = useCallback(() => {
    const todayStr = getTodayDateString();
    const current = dailyLogRef.current;
    if (current.date && current.date !== todayStr) {
      // Day has changed! Archive current day to history if it has activity
      const hasActivity = (current.caloriesConsumed > 0 || current.proteinConsumedG > 0 || current.carbsConsumedG > 0 || current.fatConsumedG > 0 || current.waterConsumedMl > 0 || current.workoutsCompleted > 0);
      if (hasActivity) {
        setDailyLogsHistory((prev) => {
          if (!prev.some((h) => h.date === current.date)) {
            return [...prev, current].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          }
          return prev;
        });
      }
      // Reset daily log to fresh zeroed metrics for the new day
      setDailyLog(createFreshDailyLog(todayStr));
    }
  }, []);

  useEffect(() => {
    // Initial check on mount
    checkAndExecuteDayRollover();

    // Check periodically (every 15 seconds)
    const interval = setInterval(checkAndExecuteDayRollover, 15000);

    // Calculate exact milliseconds until upcoming midnight (00:00:00)
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 50);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      checkAndExecuteDayRollover();
    }, Math.max(100, msUntilMidnight));

    // Listen to tab/app visibility changes (e.g. user unlocks smartphone next morning)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkAndExecuteDayRollover();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimer);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [checkAndExecuteDayRollover]);

  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Active account persistence effect
  useEffect(() => {
    localStorage.setItem('jason_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('jason_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Account-wise localStorage & Firestore persistence
  useEffect(() => {
    if (!accountKey) return;
    const setItem = (type: string, val: string) => localStorage.setItem(`stridemetrics_acc_${accountKey}_${type}`, val);

    setItem('messages', JSON.stringify(messages));
    setItem('profile', JSON.stringify(userProfile));
    setItem('dailyLog', JSON.stringify(dailyLog));
    setItem('dailyLogsHistory', JSON.stringify(dailyLogsHistory));
    setItem('routines', JSON.stringify(routines));
    setItem('muscleStats', JSON.stringify(muscleStats));
    setItem('scheduledDays', JSON.stringify(scheduledDays));
    setItem('metricEntries', JSON.stringify(metricEntries));
    setItem('apiKeyOption', apiKeyOption);
    setItem('customApiKey', customApiKey);

    // Sync cloud backup to Firestore if user is authenticated, storageMode is 'cloud', and cloud load completed
    const currentMode = userProfile.storageMode || 'cloud';
    if (auth.currentUser && currentMode === 'cloud' && isCloudLoaded) {
      const uid = auth.currentUser.uid;
      const cloudPayload = sanitizeForFirestore({
        email: auth.currentUser.email || '',
        userProfile,
        messages,
        dailyLog,
        dailyLogsHistory,
        routines,
        muscleStats,
        scheduledDays,
        metricEntries,
        apiKeyOption,
        customApiKey,
        updatedAt: new Date().toISOString(),
      });
      setDoc(doc(db, 'users', uid), cloudPayload, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      });
    }
  }, [accountKey, messages, userProfile, dailyLog, dailyLogsHistory, routines, muscleStats, scheduledDays, metricEntries, apiKeyOption, customApiKey, isCloudLoaded]);

  // Metric handlers
  const handleSaveMetricEntry = (entry: MetricEntry) => {
    setMetricEntries((prev) => {
      // Replace if entry with same id exists, or append and sort by date
      const exists = prev.some((e) => e.id === entry.id);
      let updated = exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [...prev, entry];
      return updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    // Also update user profile current weight if latest
    setUserProfile((prev) => ({
      ...prev,
      weightKg: entry.weightKg,
      heightCm: entry.heightCm,
    }));
  };

  const handleDeleteMetricEntry = (id: string) => {
    setMetricEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateProfileTargetCalories = (newTarget: number) => {
    setUserProfile((prev) => ({
      ...prev,
      dailyCalorieTarget: newTarget,
    }));
  };

  // Helper to award XP to muscles when workouts are completed
  const addMuscleXP = (targetMuscleIds: string[], xpGained: number = 60) => {
    setMuscleStats((prev) => {
      const updated = { ...prev };

      targetMuscleIds.forEach((mId) => {
        const key = mId.toLowerCase();
        let targetKey = key;
        if (key.includes('chest') || key.includes('pec')) targetKey = 'chest';
        else if (key.includes('back') || key.includes('lat') || key.includes('trap')) targetKey = 'back';
        else if (key.includes('shoulder') || key.includes('delt')) targetKey = 'shoulders';
        else if (key.includes('bicep')) targetKey = 'biceps';
        else if (key.includes('tricep')) targetKey = 'triceps';
        else if (key.includes('abs') || key.includes('core')) targetKey = 'abs';
        else if (key.includes('leg') || key.includes('quad') || key.includes('glute')) targetKey = 'quads';
        else if (key.includes('hamstring')) targetKey = 'hamstrings';
        else if (key.includes('calf') || key.includes('calves')) targetKey = 'calves';

        if (updated[targetKey]) {
          const current = { ...updated[targetKey] };
          current.completedWorkoutsCount += 1;
          current.xp += xpGained;

          // Check for Level Up
          if (current.xp >= current.nextLevelXp) {
            current.level += 1;
            current.xp = current.xp - current.nextLevelXp;
            current.nextLevelXp = Math.round(current.nextLevelXp * 1.5);

            sfx.playLevelUp();

            // Update rank title
            let badge = 'Bronze';
            if (current.level >= 6) badge = 'Diamond';
            else if (current.level >= 4) badge = 'Gold';
            else if (current.level >= 3) badge = 'Silver';

            current.rankTitle = `${badge} ${current.name}`;
          }

          updated[targetKey] = current;
        }
      });

      return updated;
    });
  };

  // API Request headers helper (with RBAC & IDOR context)
  const getApiHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKeyOption === 'custom' && customApiKey.trim()) {
      headers['x-gemini-api-key'] = customApiKey.trim();
    }
    if (userAuthEmail || userProfile?.email) {
      headers['x-user-email'] = (userAuthEmail || userProfile?.email || '').toLowerCase().trim();
    }
    if (userProfile?.role) {
      headers['x-user-role'] = userProfile.role;
    }
    if (auth.currentUser?.uid) {
      headers['x-user-uid'] = auth.currentUser.uid;
    }
    return headers;
  };

  // Handle sending message to Jason
  const handleSendMessage = async (text: string, imageBase64?: string) => {
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (imageBase64) {
      userMsg.mealData = {
        foodName: 'Uploaded Meal Photo',
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        healthScore: 80,
        summary: 'Analyzing uploaded image...',
        jasonAdvice: 'Processing image...',
        keyNutrients: [],
        imageUrl: imageBase64,
      };
    }

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      let replyText = '';
      let mealAnalysisResult: MealAnalysis | undefined = undefined;
      let errorDetails: any = undefined;

      const activeCoachName = userProfile.coachName
        ? (userProfile.coachName.toLowerCase().startsWith('coach') ? userProfile.coachName : `Coach ${userProfile.coachName}`)
        : 'Coach Jason';

      // If an image was attached, send to meal analysis endpoint as well
      if (imageBase64) {
        const parts = imageBase64.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const rawBase64 = parts[1];

        const mealRes = await fetch('/api/analyze-meal', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({ imageBase64: rawBase64, mimeType, textDescription: text, userProfile }),
        });

        if (mealRes.ok) {
          mealAnalysisResult = await mealRes.json();
          mealAnalysisResult!.imageUrl = imageBase64;
          replyText = `${activeCoachName} analyzed your meal (${mealAnalysisResult!.foodName}): ${mealAnalysisResult!.jasonAdvice}`;
        } else {
          const errData = await mealRes.json().catch(() => ({}));
          const waitSec = errData.retryAfterSeconds || 15;
          if (mealRes.status === 503 || errData.isUnavailable) {
            replyText = `⏱️ The AI model is experiencing a momentary burst in traffic. Please wait ~5 seconds and try scanning again.`;
            errorDetails = {
              errorType: 'TRAFFIC_SPIKE',
              title: 'AI Traffic Spike (503)',
              whatHappened: 'The AI model service is momentarily overloaded with high network demand.',
              howToFix: [
                'Wait 5–10 seconds and tap resend.',
                'Adding your personal Gemini API key in Settings gives you dedicated processing priority.',
              ],
              retryAfterSeconds: 5,
            };
          } else if (errData.isQuotaError || errData.isRateLimited || mealRes.status === 429) {
            replyText = `⏱️ AI rate limit active (${waitSec}s remaining). Please wait a moment before scanning another meal, or add your personal Gemini API key in Settings for 60 requests/min!`;
            errorDetails = {
              errorType: 'QUOTA_EXHAUSTED',
              title: 'Rate Limit Reached (429)',
              whatHappened: `You reached the temporary rate limit bucket for image scanning.`,
              howToFix: [
                `Wait ${waitSec}s for the sliding window to reset.`,
                'Add your personal Gemini API key in Settings for a dedicated 60 req/min quota.',
              ],
              retryAfterSeconds: waitSec,
            };
          }
        }
      }

      if (!replyText) {
        const chatRes = await fetch('/api/chat', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({ sender: m.sender, text: m.text })),
            userProfile,
            dailyLog,
          }),
        });

        if (!chatRes.ok) {
          const errData = await chatRes.json().catch(() => ({}));
          const waitSec = errData.retryAfterSeconds || 15;
          
          if (chatRes.status === 503 || errData.isUnavailable || errData.errorType === 'TRAFFIC_SPIKE') {
            replyText = `⏱️ ${activeCoachName} is momentarily busy handling a traffic spike. The AI model is experiencing high demand.`;
            errorDetails = {
              errorType: 'TRAFFIC_SPIKE',
              title: 'AI Model High Demand (503)',
              whatHappened: 'The AI server is experiencing temporary high demand and traffic spikes.',
              howToFix: [
                'Wait ~5-10 seconds and send your message again.',
                'The system automatically falls back through multiple high-performance models.',
                'You can also add your own Gemini API key in Settings (Key icon) for dedicated access.',
              ],
              retryAfterSeconds: 5,
            };
          } else if (errData.isQuotaError || errData.isRateLimited || chatRes.status === 429 || errData.errorType === 'QUOTA_EXHAUSTED') {
            replyText = `⏱️ ${activeCoachName} is cooling down (AI rate limit reached). Please wait ~${waitSec} seconds, or enter your personal Gemini API Key in Settings for 60 requests/min!`;
            errorDetails = {
              errorType: 'QUOTA_EXHAUSTED',
              title: 'AI Rate Limit Reached (429)',
              whatHappened: 'The rate limit or token limit was reached for this period.',
              howToFix: [
                `Wait ~${waitSec} seconds for the cooldown counter to finish.`,
                'Add your own Gemini API key in Settings (Key icon) to get 60 requests/minute.',
                'Shorten questions or avoid sending rapid consecutive messages.',
              ],
              retryAfterSeconds: waitSec,
            };
          } else if (chatRes.status === 401 || errData.isMissingKey || errData.errorType === 'MISSING_KEY') {
            replyText = `🔑 Gemini API key is missing or invalid. Please add your personal Gemini API key in Settings to chat with ${activeCoachName}.`;
            errorDetails = {
              errorType: 'MISSING_KEY',
              title: 'API Key Required',
              whatHappened: 'No valid Gemini API key is configured for the AI coach.',
              howToFix: [
                'Configure your API key in application settings.',
                'Click the Key icon in the top header or paste it in Settings.',
                'Save the key to immediately resume conversation.',
              ],
            };
          } else {
            const detailMsg = errData.error || `Failed to reach ${activeCoachName}`;
            replyText = `⚠️ I encountered an issue processing your message: ${detailMsg}`;
            errorDetails = {
              errorType: 'SERVER_ERROR',
              title: 'AI Response Error',
              whatHappened: detailMsg,
              howToFix: [
                'Check your internet connection.',
                'Try rephrasing your message or retry in a few seconds.',
                'If this persists, enter your personal Gemini API key in Settings.',
              ],
            };
          }
        } else {
          const data = await chatRes.json();
          replyText = data.reply || "I'm locked in with you. Let's keep working hard!";
        }
      }

      const jasonMsg: ChatMessage = {
        id: `j_${Date.now()}`,
        sender: 'jason',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mealData: mealAnalysisResult,
        errorDetails,
      };

      setMessages((prev) => [...prev, jasonMsg]);
    } catch (err: any) {
      console.error('Error contacting coach:', err);
      const isMissingKey = err?.message?.toLowerCase().includes('gemini api key') || err?.message?.toLowerCase().includes('not configured');
      const isOffline = !navigator.onLine || err?.message?.toLowerCase().includes('failed to fetch') || err?.message?.toLowerCase().includes('network');

      let errTitle = 'Connection Error';
      let whatHappened = 'The app could not communicate with the backend server.';
      let fixSteps = [
        'Check your internet connection.',
        'Verify that the local development server is running on port 3000.',
        'Refresh the page and try sending your message again.',
      ];

      if (isMissingKey) {
        errTitle = 'Gemini API Key Missing';
        whatHappened = 'The Gemini API key is missing or not configured on the server.';
        fixSteps = [
          'Click the Key icon in the top navigation header.',
          'Paste your personal Gemini API key in Settings.',
          'Or set GEMINI_API_KEY in your server environment.',
        ];
      } else if (isOffline) {
        errTitle = 'Network Connection Lost';
        whatHappened = 'Your device appears to be offline or unable to reach the network.';
        fixSteps = [
          'Check your Wi-Fi or cellular data connection.',
          'Wait a few seconds for connectivity to restore.',
          'Tap retry once your connection is back.',
        ];
      }

      const errorMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        sender: 'jason',
        text: isMissingKey
          ? "⚠️ Gemini API key is missing. Add your free key in Settings to chat with the AI coach."
          : `⚠️ Connection error: ${whatHappened}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        errorDetails: {
          errorType: isMissingKey ? 'MISSING_KEY' : (isOffline ? 'NETWORK_ERROR' : 'SERVER_ERROR'),
          title: errTitle,
          whatHappened,
          howToFix: fixSteps,
        },
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleLogMeal = (meal: MealAnalysis) => {
    setDailyLog((prev) => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + meal.calories,
      proteinConsumedG: prev.proteinConsumedG + meal.proteinG,
      carbsConsumedG: prev.carbsConsumedG + meal.carbsG,
      fatConsumedG: prev.fatConsumedG + meal.fatG,
    }));
  };

  const handleAddWater = (amountMl: number) => {
    setDailyLog((prev) => ({
      ...prev,
      waterConsumedMl: prev.waterConsumedMl + amountMl,
    }));
  };

  const handleCompleteWorkoutSession = (workout: WorkoutRoutine, durationSecs: number) => {
    const mins = Math.max(1, Math.round(durationSecs / 60));
    setDailyLog((prev) => ({
      ...prev,
      workoutsCompleted: prev.workoutsCompleted + 1,
      activeMinutes: prev.activeMinutes + mins,
      caloriesConsumed: Math.max(0, prev.caloriesConsumed),
    }));

    // Award XP to all targeted muscles in this workout
    const targetMuscles = workout.exercises.flatMap((ex) => ex.targetMuscles);
    addMuscleXP(targetMuscles.length > 0 ? targetMuscles : ['chest', 'back', 'quads'], 80);

    // Add completion message from Jason
    const finishMsg: ChatMessage = {
      id: `m_fin_${Date.now()}`,
      sender: 'jason',
      text: `Awesome effort completing ${workout.title}! Logged ${mins} active minutes and estimated ~${workout.estimatedCaloriesBurned} kcal burned. Your targeted muscle groups gained +80 XP!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, finishMsg]);
    setActiveWorkout(null);
    setActiveTab('planner');
  };

  const handleCompleteScheduledDay = (dayName: string) => {
    setScheduledDays((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const newCompleted = !d.completed;
          if (newCompleted) {
            // Award muscle XP
            addMuscleXP(['chest', 'back', 'quads', 'abs'], 60);
          }
          return { ...d, completed: newCompleted };
        }
        return d;
      })
    );
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={handleUserLoginSuccess}
        theme={theme}
        initialApiKeyOption={apiKeyOption}
        initialCustomKey={customApiKey}
        onSaveKeySettings={handleSaveKeySettings}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans relative ${
      isDark
        ? 'dark bg-[#080a0e] text-zinc-100 selection:bg-emerald-400 selection:text-black'
        : 'light bg-[#f8fafc] text-slate-900 selection:bg-emerald-400 selection:text-black'
    }`}>
      
      {/* Subtle Ambient Emerald Glow in Background */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-emerald-500/[0.06] via-teal-500/[0.02] to-transparent rounded-full blur-3xl pointer-events-none"></div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenDevicesModal={() => setShowDevicesModal(true)}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
        theme={theme}
        setTheme={setTheme}
        userProfile={userProfile}
        userAuthEmail={userAuthEmail}
        apiKeyOption={apiKeyOption}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {/* View Content with Smooth Animated Transitions */}
      <main className="flex-1 pb-8 relative z-10">
        {showCloudSyncSkeleton ? (
          <DashboardSkeleton />
        ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            {activeTab === 'chat' && (
              <CoachChat
                messages={messages}
                onSendMessage={handleSendMessage}
                userProfile={userProfile}
                onStartWorkout={(routine) => setActiveWorkout(routine)}
                onOpenMealScanner={() => setActiveTab('meals')}
                onClearChatHistory={() => {
                  const welcomeMsg: ChatMessage = {
                    id: `w_${Date.now()}`,
                    sender: 'jason',
                    text: `Chat history cleared. I'm Coach Jason—let's start fresh! Ask me anything about your training, nutrition, or recovery.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                  setMessages([welcomeMsg]);
                }}
                onSaveKeySettings={handleSaveKeySettings}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                userProfile={userProfile}
                dailyLog={dailyLog}
                dailyLogsHistory={dailyLogsHistory}
                onAddWater={handleAddWater}
                onStartWorkout={(routine) => setActiveWorkout(routine)}
                featuredWorkouts={routines}
                onOpenChatWithPrompt={(prompt) => {
                  setActiveTab('chat');
                  handleSendMessage(prompt);
                }}
              />
            )}

            {activeTab === 'workouts' && (
              <WorkoutHub
                routines={routines}
                userProfile={userProfile}
                onStartWorkout={(routine) => setActiveWorkout(routine)}
                onAddNewRoutine={(newRoutine) => setRoutines([newRoutine, ...routines])}
                customApiKey={apiKeyOption === 'custom' ? customApiKey : undefined}
              />
            )}

            {activeTab === 'planner' && (
              <WorkoutPlanner
                scheduledDays={scheduledDays}
                setScheduledDays={setScheduledDays}
                availableRoutines={routines}
                onStartWorkout={(routine) => setActiveWorkout(routine)}
                muscleStats={muscleStats}
                onCompleteScheduledDay={handleCompleteScheduledDay}
                userProfile={userProfile}
                theme={theme}
                customApiKey={apiKeyOption === 'custom' ? customApiKey : undefined}
              />
            )}

            {activeTab === 'calculators' && (
              <CalculatorsHub
                userProfile={userProfile}
                metricEntries={metricEntries}
                onSaveMetricEntry={handleSaveMetricEntry}
                onDeleteMetricEntry={handleDeleteMetricEntry}
                onUpdateProfileTargetCalories={handleUpdateProfileTargetCalories}
                onOpenChatWithPrompt={(prompt) => {
                  setActiveTab('chat');
                  handleSendMessage(prompt);
                }}
              />
            )}

            {activeTab === 'meals' && (
              <MealScanner
                userProfile={userProfile}
                onLogMeal={handleLogMeal}
                customApiKey={apiKeyOption === 'custom' ? customApiKey : undefined}
              />
            )}
          </motion.div>
        </AnimatePresence>
        )}
      </main>

      {/* Active Workout Interactive Modal */}
      {activeWorkout && (
        <ActiveWorkoutModal
          workout={activeWorkout}
          onClose={() => setActiveWorkout(null)}
          onCompleteWorkout={handleCompleteWorkoutSession}
        />
      )}

      {/* User Profile Settings Modal */}
      {showProfileModal && (
        <UserProfileModal
          userProfile={userProfile}
          onSaveProfile={(updated) => setUserProfile(updated)}
          onClose={() => setShowProfileModal(false)}
          apiKeyOption={apiKeyOption}
          customApiKey={customApiKey}
          onSaveKeySettings={handleSaveKeySettings}
        />
      )}

      {/* Auth & API Key Settings Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        theme={theme}
        currentUserEmail={userAuthEmail}
        currentApiKeyOption={apiKeyOption}
        currentCustomKey={customApiKey}
        onSaveKeySettings={handleSaveKeySettings}
        onUserLoginSuccess={handleUserLoginSuccess}
      />

      {/* Wearables & Health Integrations Hub Modal */}
      <DeviceIntegrationsModal
        isOpen={showDevicesModal}
        onClose={() => setShowDevicesModal(false)}
        onSyncMetricsToApp={(syncedData) => {
          if (syncedData.activeCalories || syncedData.steps) {
            setDailyLog((prev) => ({
              ...prev,
              activeMinutes: prev.activeMinutes + 35,
              caloriesConsumed: prev.caloriesConsumed,
            }));
          }
        }}
      />

      {/* Security & Compliance Vault Modal */}
      <SecurityAuditModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        userEmail={userAuthEmail || userProfile.email}
        userRole={userProfile.role || 'athlete'}
        onRoleChange={(newRole) => setUserProfile((prev) => ({ ...prev, role: newRole }))}
        theme={theme}
      />

    </div>
  );
}


