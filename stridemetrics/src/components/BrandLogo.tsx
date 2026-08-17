import React from 'react';
import { ThemeMode } from '../types';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: ThemeMode;
  isDark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  theme,
  isDark: isDarkProp,
}) => {
  const isDark = isDarkProp !== undefined ? isDarkProp : theme ? theme === 'dark' : true;

  const textSizeClass = {
    sm: 'text-lg tracking-tight',
    md: 'text-xl sm:text-2xl tracking-tight',
    lg: 'text-3xl sm:text-4xl tracking-tight',
    xl: 'text-4xl sm:text-5xl tracking-tight',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Text - Sleek Space Grotesk font with emerald health branding */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-display font-extrabold lowercase transition-colors ${textSizeClass} ${
            isDark ? 'text-zinc-100' : 'text-slate-900'
          }`}>
            stride<span className={isDark ? 'text-emerald-400 font-black' : 'text-emerald-600 font-black'}>metrics</span>
          </span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-[10px] font-mono font-medium tracking-[0.2em] uppercase transition-colors ${
            isDark ? 'text-zinc-400' : 'text-slate-500'
          }`}>
            Biometric & Health Intelligence
          </span>
        )}
      </div>
    </div>
  );
};

