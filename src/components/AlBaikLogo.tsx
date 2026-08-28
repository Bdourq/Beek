import React from 'react';

interface AlBaikLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'badge' | 'header' | 'symbol';
  className?: string;
  withTagline?: boolean;
  lightBackground?: boolean;
}

export const AlBaikLogo: React.FC<AlBaikLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  withTagline = false,
  lightBackground = false
}) => {
  // Dimensions helper
  const sizeConfig = {
    xs: { h: 'h-8', w: 'w-auto', textBaik: 'text-base', textShawarma: 'text-[9px]', textFooter: 'text-[7px]', iconW: 'w-6' },
    sm: { h: 'h-10', w: 'w-auto', textBaik: 'text-xl', textShawarma: 'text-[11px]', textFooter: 'text-[9px]', iconW: 'w-8' },
    md: { h: 'h-14', w: 'w-auto', textBaik: 'text-2xl sm:text-3xl', textShawarma: 'text-xs sm:text-sm', textFooter: 'text-[11px] sm:text-xs', iconW: 'w-12' },
    lg: { h: 'h-20', w: 'w-auto', textBaik: 'text-4xl sm:text-5xl', textShawarma: 'text-base sm:text-lg', textFooter: 'text-sm sm:text-base', iconW: 'w-16' },
    xl: { h: 'h-28', w: 'w-auto', textBaik: 'text-6xl', textShawarma: 'text-2xl', textFooter: 'text-xl', iconW: 'w-24' }
  };

  const cfg = sizeConfig[size] || sizeConfig.md;

  if (variant === 'symbol') {
    return (
      <div className={`relative inline-flex items-center justify-center p-1 rounded-xl bg-black border border-yellow-400/40 shadow-sm ${className}`}>
        <svg viewBox="0 0 100 100" className={`${cfg.iconW} h-auto`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Badge */}
          <rect width="100" height="100" rx="18" fill="#0A0A0B" />
          
          {/* Shawarma skewer mini icon */}
          <path d="M50 12 L56 24 L52 24 L55 35 L45 35 L48 24 L44 24 Z" fill="#FFE600" />
          <circle cx="50" cy="10" r="3" fill="#FFFFFF" />

          {/* Bold Arabic Al-Baik Emblem */}
          <path
            d="M20 40 H32 V72 H20 Z M36 40 H50 V54 H64 V40 H78 V72 H64 V62 H36 V72 H24"
            fill="#E51924"
            stroke="#FFE600"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Dots and accents */}
          <circle cx="26" cy="48" r="2.5" fill="#FFE600" />
          <circle cx="71" cy="48" r="2.5" fill="#FFE600" />

          {/* Bottom Triple Ring Emblem */}
          <circle cx="40" cy="85" r="5" stroke="#FFE600" strokeWidth="2" fill="#E51924" />
          <circle cx="50" cy="85" r="5" stroke="#FFE600" strokeWidth="2" fill="#FFE600" />
          <circle cx="60" cy="85" r="5" stroke="#FFE600" strokeWidth="2" fill="#E51924" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center select-none font-['Cairo',sans-serif] ${className}`}
      dir="rtl"
    >
      <div className="relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-black border-2 border-yellow-400/80 shadow-lg shadow-black/40 flex flex-col items-center justify-center overflow-hidden group">
        {/* Subtle Brand Glow */}
        <div className="absolute inset-0 bg-radial from-red-600/20 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Top: Shawarma Calligraphy style */}
        <div className="relative flex items-center justify-center gap-1 -mb-1 z-10">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current animate-pulse" viewBox="0 0 24 24">
            <path d="M12 2L14 7H10L12 2ZM11 8H13V15H11V8ZM9 16H15V18H9V16ZM10 19H14V22H10V19Z" fill="#FFE600" />
          </svg>
          <span
            className={`${cfg.textShawarma} font-black text-yellow-400 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
            style={{
              fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif",
              letterSpacing: '1px'
            }}
          >
            شـــاورمــــا
          </span>
        </div>

        {/* Center: Iconic "الـبـيـك" in heavy Arabic block typography */}
        <div className="relative z-10 flex items-center justify-center my-0.5">
          <span
            className={`${cfg.textBaik} font-black tracking-tight`}
            style={{
              color: '#E51924',
              WebkitTextStroke: '2px #FFE600',
              textShadow: '0 0 12px rgba(229,25,36,0.6), 0 3px 6px rgba(0,0,0,0.9)',
              letterSpacing: '-1px',
              fontWeight: 900
            }}
          >
            الـبـيـك
          </span>
        </div>

        {/* Bottom Bar: AL-Baik + 3 Circles + يحيى */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 pt-0.5 border-t border-yellow-400/40">
          {/* AL-Baik in English */}
          <span
            className={`${cfg.textFooter} font-black text-yellow-400 tracking-normal font-sans uppercase`}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            AL-Baik
          </span>

          {/* Triple Ring Motif */}
          <div className="flex items-center -space-x-1 space-x-reverse">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-yellow-400 bg-red-600 shadow-2xs" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-yellow-400 bg-yellow-400 shadow-2xs z-10" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-yellow-400 bg-red-600 shadow-2xs" />
          </div>

          {/* Yahya */}
          <span
            className={`${cfg.textFooter} font-black text-yellow-400`}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            يـحـيـى
          </span>
        </div>
      </div>

      {withTagline && (
        <span className="mt-1 text-[11px] font-bold text-slate-600">
          الجرد والمصاريف اليومي
        </span>
      )}
    </div>
  );
};
