import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  User, 
  Calendar, 
  Sun, 
  Moon, 
  LogOut, 
  Calculator, 
  X, 
  ChevronRight,
  Sparkles,
  Activity,
  ShieldCheck,
  Watch
} from 'lucide-react';
import { AppTab, ThemeMode, UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';
import { sfx } from '../utils/sfx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenProfile: () => void;
  onOpenDevicesModal?: () => void;
  onOpenSecurityModal?: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  userProfile?: UserProfile;
  userAuthEmail?: string | null;
  apiKeyOption?: 'default' | 'custom';
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenDevicesModal,
  onOpenSecurityModal,
  theme,
  setTheme,
  userProfile,
  userAuthEmail,
  apiKeyOption,
  onOpenAuthModal,
  onLogout,
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { 
      id: 'chat', 
      label: userProfile?.coachName ? (userProfile.coachName.toLowerCase().startsWith('coach') ? userProfile.coachName : `Coach ${userProfile.coachName}`) : 'AI Coach', 
      desc: 'Interactive AI voice & chat guidance', 
      icon: MessageSquare,
      badge: 'Live AI'
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      desc: 'Streak, hydration & daily summary', 
      icon: LayoutDashboard,
      badge: undefined
    },
    { 
      id: 'calculators', 
      label: 'Metrics & BMR', 
      desc: 'Biometrics, body composition & logs', 
      icon: Calculator,
      badge: undefined
    },
    { 
      id: 'workouts', 
      label: 'Workouts', 
      desc: 'Routines, exercises & strength focus', 
      icon: Dumbbell,
      badge: undefined
    },
    { 
      id: 'planner', 
      label: 'Planner', 
      desc: 'Weekly schedule & muscle RPG level', 
      icon: Calendar,
      badge: undefined
    },
    { 
      id: 'meals', 
      label: 'Meals', 
      desc: 'AI meal scanner & macro analyzer', 
      icon: Utensils,
      badge: undefined
    },
  ] as const;

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectTab = (tabId: AppTab) => {
    sfx.playClick();
    setActiveTab(tabId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className={`fixed inset-0 backdrop-blur-md transition-all ${
              isDark ? 'bg-black/70' : 'bg-slate-900/40'
            }`}
            aria-hidden="true"
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: '-100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.8 }}
            transition={{ 
              type: 'spring', 
              stiffness: 340, 
              damping: 32, 
              mass: 0.8 
            }}
            className={`relative flex w-full max-w-xs sm:max-w-sm flex-col justify-between border-r shadow-2xl backdrop-blur-2xl z-10 ${
              isDark 
                ? 'bg-[#0b0e14]/95 border-white/10 text-white' 
                : 'bg-white/95 border-slate-200 text-slate-900'
            }`}
          >
            {/* Ambient subtle decorative background glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

            {/* Top Header */}
            <div className="relative flex items-center justify-between border-b px-5 py-4 border-inherit">
              <div className="flex items-center gap-3">
                <BrandLogo size="md" showSubtitle={true} theme={theme} />
              </div>

              <button
                onClick={() => {
                  sfx.playClick();
                  onClose();
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-90 ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                aria-label="Close Sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin">
              <div className="px-2 pb-2">
                <p className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                  isDark ? 'text-emerald-400/80' : 'text-emerald-700'
                }`}>
                  Navigation Menu
                </p>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTab(item.id as AppTab)}
                    className={`relative w-full flex items-center justify-between rounded-2xl p-3 text-left transition-all duration-200 group ${
                      isActive
                        ? isDark
                          ? 'bg-emerald-500/15 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                          : 'bg-emerald-500/15 text-slate-900 border border-emerald-600/30 shadow-md shadow-emerald-500/10'
                        : isDark
                          ? 'text-zinc-300 hover:bg-white/5 hover:text-white border border-transparent'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActiveGlow"
                        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-emerald-500"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        isActive
                          ? isDark
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-emerald-600 text-white border-emerald-600'
                          : isDark
                            ? 'bg-zinc-900/80 border-white/10 text-zinc-400 group-hover:border-white/20 group-hover:text-emerald-400'
                            : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:border-slate-300 group-hover:text-emerald-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold tracking-tight ${
                            isActive 
                              ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                              : ''
                          }`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                              <Sparkles className="h-2.5 w-2.5" />
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${
                          isDark ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isActive
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                        : isDark ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                  </motion.button>
                );
              })}
            </div>

            {/* Bottom Actions & User Profile Card */}
            <div className={`border-t p-4 pb-safe space-y-2.5 border-inherit ${
              isDark ? 'bg-zinc-950/40' : 'bg-slate-50/70'
            }`}>
              {/* Wearables & Health Integrations Hub Button */}
              {onOpenDevicesModal && (
                <button
                  onClick={() => {
                    sfx.playClick();
                    onOpenDevicesModal();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl p-2.5 border transition-all active:scale-98 ${
                    isDark
                      ? 'bg-[#11151c] border-white/10 hover:border-emerald-500/40 text-zinc-200'
                      : 'bg-white border-slate-200 hover:border-emerald-500/40 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      <Watch className="h-4 w-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold truncate">Wearables & Apps Sync</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        boAt, Apple, Google, Noise, Strava
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Sync Hub
                  </span>
                </button>
              )}

              {/* Account & API Key Settings Button */}
              {onOpenAuthModal && (
                <button
                  onClick={() => {
                    sfx.playClick();
                    onOpenAuthModal();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl p-2.5 border transition-all active:scale-98 ${
                    isDark
                      ? 'bg-[#11151c] border-white/10 hover:border-emerald-500/40 text-zinc-200'
                      : 'bg-white border-slate-200 hover:border-emerald-500/40 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold truncate">
                        {userAuthEmail ? userAuthEmail : 'Auth & API Key'}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        Mode: {apiKeyOption === 'custom' ? 'Bring Your Own Key' : 'App Default Key'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    apiKeyOption === 'custom'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {apiKeyOption === 'custom' ? 'BYOK' : 'App Key'}
                  </span>
                </button>
              )}

              {/* User Profile Mini Button */}
              <button
                onClick={() => {
                  sfx.playClick();
                  onOpenProfile();
                  onClose();
                }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 border transition-all active:scale-98 ${
                  isDark
                    ? 'bg-[#11151c] border-white/10 hover:border-emerald-500/40 text-zinc-200'
                    : 'bg-white border-slate-200 hover:border-emerald-500/40 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold truncate">{userProfile?.name || 'User Profile'}</p>
                    <p className="text-[10px] text-emerald-400 font-medium truncate">
                      Goal: {userProfile?.fitnessGoal ? userProfile.fitnessGoal.replace('_', ' ') : 'Fitness'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Edit
                </span>
              </button>

              {/* Utility buttons row */}
              <div className="flex items-center gap-2">
                {/* Theme Mode Switch */}
                <button
                  onClick={() => {
                    sfx.playClick();
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 border text-xs font-semibold transition-all active:scale-95 ${
                    isDark
                      ? 'bg-zinc-900 border-white/10 text-emerald-400 hover:bg-white/10'
                      : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 text-emerald-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-slate-700" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={() => {
                      sfx.playClick();
                      onLogout();
                      onClose();
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                      isDark
                        ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300'
                    }`}
                    title="Switch Account / Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
