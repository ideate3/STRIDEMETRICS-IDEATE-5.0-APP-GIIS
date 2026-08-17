import React, { useState } from 'react';
import { Menu, Sun, Moon, LogOut, User, Key, ShieldCheck, Watch } from 'lucide-react';
import { AppTab, ThemeMode, UserProfile } from '../types';
import { sfx } from '../utils/sfx';
import { BrandLogo } from './BrandLogo';
import { Sidebar } from './Sidebar';

interface NavbarProps {
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

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenDevicesModal,
  onOpenSecurityModal,
  theme,
  setTheme,
  userProfile,
  userAuthEmail,
  apiKeyOption = 'default',
  onOpenAuthModal,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isDark = theme === 'dark';

  const tabLabels: Record<AppTab, string> = {
    chat: 'Coach',
    dashboard: 'Dashboard',
    calculators: 'Metrics',
    workouts: 'Workouts',
    planner: 'Planner',
    meals: 'Meals',
  };

  return (
    <>
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? 'border-white/10 bg-[#08080c]/90 text-white'
          : 'border-slate-200/80 bg-white/90 text-slate-900 shadow-sm'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6">
          
          {/* Left: Hamburger Menu Button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Hamburger Drawer Menu Button - 44px touch target on mobile */}
            <button
              id="hamburger-menu-toggle-btn"
              onClick={() => {
                sfx.playClick();
                setIsSidebarOpen(true);
              }}
              className={`flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md active:scale-95 transition-all ${
                isDark
                  ? 'bg-[#11151c] border-white/10 text-zinc-200 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-white/5'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:text-emerald-700 hover:border-emerald-500/50 hover:bg-slate-200'
              }`}
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('dashboard');
              }}
              className="hover:opacity-90 transition-opacity text-left active:scale-98 flex items-center shrink-0"
            >
              <BrandLogo size="md" showSubtitle={false} theme={theme} />
            </button>
          </div>

          {/* Right Actions: Clean, decluttered controls on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Devices & Wearables Hub Trigger (Desktop/Tablet) */}
            {onOpenDevicesModal && (
              <button
                onClick={() => {
                  sfx.playClick();
                  onOpenDevicesModal();
                }}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-semibold text-xs active:scale-95 transition-all ${
                  isDark
                    ? 'bg-[#11151c] border-white/10 text-emerald-400 hover:border-emerald-500/50'
                    : 'bg-slate-100 border-slate-200 text-emerald-700 hover:border-emerald-500/50'
                }`}
                title="Wearables & Fitness Apps Sync Center"
              >
                <Watch className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-xs font-bold">Devices</span>
              </button>
            )}

            {/* Auth & API Key Settings Trigger (Tablet/Desktop - accessible in drawer on mobile) */}
            {onOpenAuthModal && (
              <button
                onClick={() => {
                  sfx.playClick();
                  onOpenAuthModal();
                }}
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-mono font-bold text-xs active:scale-95 transition-all ${
                  isDark
                    ? 'bg-[#11151c] border-white/10 text-emerald-400 hover:border-emerald-500/50'
                    : 'bg-slate-100 border-slate-200 text-emerald-700 hover:border-emerald-500/50'
                }`}
                title="Account & API Key Settings"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="hidden md:inline text-[11px] font-sans font-medium">
                  {userAuthEmail ? userAuthEmail.split('@')[0] : 'Auth & Key'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  apiKeyOption === 'custom'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {apiKeyOption === 'custom' ? 'BYOK' : 'Key'}
                </span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                sfx.playClick();
                setTheme(theme === 'dark' ? 'light' : 'dark');
              }}
              className={`flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-xl border backdrop-blur-md active:scale-95 transition-all ${
                isDark
                  ? 'bg-[#11151c] border-white/10 text-emerald-400 hover:bg-white/10'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User Profile Button */}
            <button
              onClick={() => {
                sfx.playClick();
                onOpenProfile();
              }}
              className={`flex h-11 sm:h-9 items-center gap-1.5 px-3 sm:px-3 rounded-xl border backdrop-blur-md font-semibold text-xs active:scale-95 transition-all ${
                isDark
                  ? 'bg-[#11151c] border-white/10 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-emerald-500/50 hover:text-emerald-700'
              }`}
              title="User Fitness Profile & Goals"
            >
              <User className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline-block max-w-[90px] truncate">{userProfile?.name || 'Profile'}</span>
            </button>

            {/* Switch Account / Logout (Desktop Only) */}
            {onLogout && (
              <button
                onClick={() => {
                  sfx.playClick();
                  onLogout();
                }}
                className={`hidden md:flex h-9 w-9 items-center justify-center rounded-xl border active:scale-95 transition-all ${
                  isDark
                    ? 'bg-[#12121a] border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-red-600'
                }`}
                title="Switch Account / Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Interface */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={onOpenProfile}
        onOpenDevicesModal={onOpenDevicesModal}
        onOpenSecurityModal={onOpenSecurityModal}
        theme={theme}
        setTheme={setTheme}
        userProfile={userProfile}
        userAuthEmail={userAuthEmail}
        apiKeyOption={apiKeyOption}
        onOpenAuthModal={onOpenAuthModal}
        onLogout={onLogout}
      />
    </>
  );
};



