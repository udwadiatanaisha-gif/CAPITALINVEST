import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = true,
  className = ''
}) => {
  const isDark = variant === 'dark'; // Dark background
  const isCompact = variant === 'compact';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Geometric Capital & Trajectory Monogram */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-lg ${isDark ? 'bg-[#172B46]' : 'bg-[#101C2C]'} p-1.5 shadow-sm border border-[#C6A76A]/40`}>
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          {/* Architectural Pillars & Upward Portfolio Growth Trajectory */}
          <path
            d="M8 32V20L20 8L32 20V32"
            stroke="#C6A76A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 32V23L20 18L25 23V32"
            stroke="#147D64"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="12" r="2.5" fill="#C6A76A" />
        </svg>
      </div>

      {!isCompact && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-wider">
            <span className={`font-serif-display font-bold tracking-widest ${textSizes[size]} ${isDark ? 'text-white' : 'text-[#101C2C]'}`}>
              CAPITAL<span className="text-[#C6A76A]">VEST</span>
            </span>
          </div>
          {showTagline && size !== 'sm' && (
            <span className={`text-[9px] uppercase tracking-[0.2em] font-medium ${isDark ? 'text-slate-400' : 'text-[#5B6677]'}`}>
              Wealth Management
            </span>
          )}
        </div>
      )}
    </div>
  );
};
