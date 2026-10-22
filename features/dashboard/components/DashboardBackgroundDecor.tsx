import React from "react";

export function DashboardBackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
      {/* Soft Ambient Radiance / Glow Spots */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. REALISTIC CLOUD 1 (TRÁI): Mây thực tế với kết cấu xốp tự nhiên feTurbulence */}
      {/* Responsive: */}
      {/* - Desktop (lg+): Góc trên bên trái bầu trời */}
      {/* - Tablet & Mobile (<lg): Dời xuống sườn trái (top-[36%]), không che Banner */}
      {/* ========================================================================= */}
      <div className="absolute top-[36%] -left-16 sm:-left-12 lg:top-4 lg:-left-12 xl:left-0 w-72 sm:w-80 md:w-96 lg:w-[480px] h-40 sm:h-44 lg:h-64 pointer-events-none animate-float-slow">
        <svg viewBox="0 0 460 220" className="w-full h-full overflow-visible" fill="none">
          <defs>
            {/* Bộ lọc gợn sóng vân mây tự nhiên như ảnh chụp thật */}
            <filter id="realCloudNoiseLeft" x="-40%" y="-40%" width="180%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="4" result="cloudNoise" />
              <feDisplacementMap in="SourceGraphic" in2="cloudNoise" scale="26" xChannelSelector="R" yChannelSelector="G" result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation="5" result="softCloud" />
            </filter>

            {/* Bộ lọc sương mây mờ viền (Hơi sương mờ ảo) */}
            <filter id="realCloudMistLeft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="14" />
            </filter>

            {/* Gradient lõi mây sáng tán xạ ánh nắng tự nhiên */}
            <radialGradient id="realSunlitCoreLeft" cx="48%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="45%" stopColor="#F8FBFF" stopOpacity="0.94" />
              <stop offset="75%" stopColor="#E2F0FD" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#BFE0FF" stopOpacity="0" />
            </radialGradient>

            {/* Gradient bóng xanh mát đáy mây */}
            <linearGradient id="realUnderbellyLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="55%" stopColor="#D4EAFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#A5D0FC" stopOpacity="0.7" />
            </linearGradient>

            {/* Ngôi sao vàng gradient */}
            <linearGradient id="realStarLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9A6" />
              <stop offset="45%" stopColor="#FFC820" />
              <stop offset="100%" stopColor="#FF8500" />
            </linearGradient>
          </defs>

          {/* Tầng 1: Vầng sương mây ngoài cùng mờ ảo (Outer Atmospheric Fog) */}
          <g filter="url(#realCloudMistLeft)" opacity="0.65">
            <ellipse cx="230" cy="120" rx="175" ry="55" fill="#E0EFFF" />
            <circle cx="160" cy="95" r="75" fill="#FFFFFF" />
            <circle cx="250" cy="85" r="80" fill="#FFFFFF" />
            <circle cx="320" cy="115" r="65" fill="#E8F4FF" />
          </g>

          {/* Tầng 2: Thân mây thực tế với kết cấu gợn sóng feTurbulence */}
          <g filter="url(#realCloudNoiseLeft)">
            {/* Khối bóng đáy mây */}
            <ellipse cx="230" cy="130" rx="160" ry="46" fill="url(#realUnderbellyLeft)" />

            {/* Thân mây xốp mềm */}
            <ellipse cx="230" cy="115" rx="155" ry="44" fill="url(#realSunlitCoreLeft)" />
            <circle cx="120" cy="118" r="48" fill="url(#realSunlitCoreLeft)" />
            <circle cx="175" cy="92" r="60" fill="url(#realSunlitCoreLeft)" />
            <circle cx="245" cy="78" r="68" fill="url(#realSunlitCoreLeft)" />
            <circle cx="315" cy="98" r="56" fill="url(#realSunlitCoreLeft)" />
            <circle cx="365" cy="122" r="42" fill="url(#realSunlitCoreLeft)" />

            {/* Lõi mây trắng tinh sáng rực dưới ánh mặt trời */}
            <ellipse cx="240" cy="88" rx="110" ry="40" fill="#FFFFFF" opacity="0.88" />
            <circle cx="195" cy="82" r="42" fill="#FFFFFF" opacity="0.92" />
            <circle cx="260" cy="76" r="46" fill="#FFFFFF" opacity="0.92" />
          </g>
        </svg>

        {/* 3D Golden Star nhô lên từ đám mây */}
        <div className="absolute top-2 right-12 sm:right-16 w-9 h-9 sm:w-11 sm:h-11 animate-soft-twinkle">
          <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_4px_10px_rgba(255,160,0,0.5)]">
            <path
              d="M 20 2 Q 20 20 38 20 Q 20 20 20 38 Q 20 20 2 20 Q 20 20 20 2 Z"
              fill="url(#realStarLeft)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Đốm kim tuyến lấp lánh */}
        <div className="absolute top-5 right-4 text-yellow-200 text-sm font-black drop-shadow-sm animate-pulse">✦</div>
        <div className="absolute bottom-4 left-10 text-sky-200 text-xs font-black drop-shadow-sm">✦</div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REALISTIC CLOUD 2 (PHẢI): Mây thực tế với kết cấu xốp tự nhiên */}
      {/* Responsive: */}
      {/* - Desktop (lg+): Góc trên bên phải bầu trời */}
      {/* - Tablet & Mobile (<lg): Dời xuống sườn phải (top-[76%]), tạo nền mềm */}
      {/* ========================================================================= */}
      <div className="absolute top-[76%] -right-16 sm:-right-12 lg:top-4 lg:-right-12 xl:right-0 w-72 sm:w-88 md:w-96 lg:w-[500px] h-42 sm:h-46 lg:h-68 pointer-events-none animate-float-reverse">
        <svg viewBox="0 0 480 230" className="w-full h-full overflow-visible" fill="none">
          <defs>
            {/* Bộ lọc gợn sóng vân mây tự nhiên */}
            <filter id="realCloudNoiseRight" x="-40%" y="-40%" width="180%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="cloudNoise" />
              <feDisplacementMap in="SourceGraphic" in2="cloudNoise" scale="28" xChannelSelector="R" yChannelSelector="G" result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation="5" result="softCloud" />
            </filter>

            {/* Bộ lọc sương mây mờ viền */}
            <filter id="realCloudMistRight" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="15" />
            </filter>

            {/* Gradient lõi mây sáng tán xạ ánh nắng */}
            <radialGradient id="realSunlitCoreRight" cx="50%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="48%" stopColor="#F8FBFF" stopOpacity="0.94" />
              <stop offset="78%" stopColor="#E2F0FD" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#BFE0FF" stopOpacity="0" />
            </radialGradient>

            {/* Gradient bóng xanh mát đáy mây */}
            <linearGradient id="realUnderbellyRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="55%" stopColor="#D4EAFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#A5D0FC" stopOpacity="0.7" />
            </linearGradient>

            {/* Ngôi sao vàng gradient */}
            <linearGradient id="realStarRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9A6" />
              <stop offset="45%" stopColor="#FFC820" />
              <stop offset="100%" stopColor="#FF8500" />
            </linearGradient>
          </defs>

          {/* Tầng 1: Vầng sương mây ngoài cùng mờ ảo */}
          <g filter="url(#realCloudMistRight)" opacity="0.65">
            <ellipse cx="240" cy="125" rx="185" ry="58" fill="#E0EFFF" />
            <circle cx="150" cy="100" r="75" fill="#FFFFFF" />
            <circle cx="240" cy="88" r="82" fill="#FFFFFF" />
            <circle cx="330" cy="108" r="72" fill="#E8F4FF" />
          </g>

          {/* Tầng 2: Thân mây thực tế với kết cấu gợn sóng feTurbulence */}
          <g filter="url(#realCloudNoiseRight)">
            {/* Khối bóng đáy mây */}
            <ellipse cx="240" cy="135" rx="170" ry="48" fill="url(#realUnderbellyRight)" />

            {/* Thân mây xốp mềm */}
            <ellipse cx="240" cy="120" rx="165" ry="46" fill="url(#realSunlitCoreRight)" />
            <circle cx="115" cy="124" r="48" fill="url(#realSunlitCoreRight)" />
            <circle cx="170" cy="96" r="64" fill="url(#realSunlitCoreRight)" />
            <circle cx="248" cy="80" r="72" fill="url(#realSunlitCoreRight)" />
            <circle cx="325" cy="102" r="60" fill="url(#realSunlitCoreRight)" />
            <circle cx="380" cy="126" r="44" fill="url(#realSunlitCoreRight)" />

            {/* Lõi mây trắng tinh sáng rực dưới ánh mặt trời */}
            <ellipse cx="250" cy="92" rx="118" ry="42" fill="#FFFFFF" opacity="0.88" />
            <circle cx="205" cy="86" r="45" fill="#FFFFFF" opacity="0.92" />
            <circle cx="270" cy="80" r="48" fill="#FFFFFF" opacity="0.92" />
          </g>
        </svg>

        {/* Hero 3D Golden Star Burst */}
        <div className="absolute top-1 left-12 sm:left-16 w-10 h-10 sm:w-12 sm:h-12 animate-soft-twinkle">
          <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-[0_6px_14px_rgba(255,160,0,0.55)]">
            <path
              d="M 22 2 Q 22 22 42 22 Q 22 22 22 42 Q 22 22 22 42 Q 22 22 2 22 Q 22 22 22 2 Z"
              fill="url(#realStarRight)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <circle cx="22" cy="22" r="3" fill="#FFFFFF" />
            <circle cx="22" cy="22" r="1.5" fill="#FFE082" />
          </svg>
        </div>

        {/* Secondary medium golden star */}
        <div className="absolute top-10 right-10 sm:right-14 w-7 h-7 sm:w-8 sm:h-8 animate-pulse">
          <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-[0_3px_8px_rgba(255,160,0,0.4)]">
            <path
              d="M 18 2 Q 18 18 34 18 Q 18 18 18 34 Q 18 18 2 18 Q 18 18 18 2 Z"
              fill="url(#realStarRight)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Confetti tinh tế nhẹ nhàng */}
        <div className="absolute top-4 left-6 w-2.5 h-4 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-sm rotate-45 shadow-sm opacity-90" />
        <div className="absolute top-14 left-3 w-2 h-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-sm -rotate-12 shadow-sm opacity-85" />
        <div className="absolute top-16 right-16 w-3 h-2 bg-gradient-to-br from-cyan-300 to-sky-500 rounded-sm rotate-24 shadow-sm opacity-90" />
        <div className="absolute top-2 right-20 text-yellow-200 text-base font-black drop-shadow-sm animate-pulse">✦</div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BACKGROUND DISTANT SOFT MIST (Dưới chân trời, chỉ hiện trên Desktop) */}
      {/* ========================================================================= */}
      <div className="hidden lg:block absolute bottom-8 left-[18%] w-64 h-32 opacity-45 animate-float-slow pointer-events-none">
        <svg viewBox="0 0 240 120" className="w-full h-full" fill="none">
          <defs>
            <filter id="mistSoftFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>
          <g filter="url(#mistSoftFilter)">
            <ellipse cx="120" cy="70" rx="90" ry="30" fill="#D6ECFF" />
            <circle cx="80" cy="55" r="35" fill="#FFFFFF" />
            <circle cx="125" cy="45" r="42" fill="#FFFFFF" />
            <circle cx="165" cy="58" r="32" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 4. FLOATING FESTIVE CONFETTI PARTICLES ACROSS THE SKY */}
      {/* ========================================================================= */}
      {/* Far Mid-Left Sparkle & Confetti */}
      <div className="hidden sm:flex absolute top-[48%] left-2 sm:left-4 flex-col items-center gap-4 opacity-75">
        <div className="text-yellow-100 text-sm font-black drop-shadow-sm animate-pulse">✦</div>
        <div className="w-2.5 h-3.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-sm rotate-12 shadow-sm" />
        <div className="w-2 h-2 bg-sky-200 rounded-full shadow-sm" />
      </div>

      {/* Far Mid-Right Sparkle & Confetti */}
      <div className="hidden sm:flex absolute top-[45%] right-2 sm:right-4 flex-col items-center gap-3 opacity-75">
        <div className="w-3 h-2 bg-gradient-to-br from-rose-400 to-pink-500 rounded-sm -rotate-45 shadow-sm" />
        <div className="text-amber-200 text-base font-black drop-shadow-sm animate-pulse">✦</div>
        <div className="w-2 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-sm rotate-30 shadow-sm" />
      </div>
    </div>
  );
}
