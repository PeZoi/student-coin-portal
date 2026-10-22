"use client";

import { navigationCards } from "../data/navigationData";
import { NavigationCard } from "./NavigationCard";

export function NavigationGrid() {
  return (
    /* Khung ngoài tạo viền gradient mờ dần từ trên xuống dưới (white/40 -> white/18 -> white/10) */
    <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] p-[2px] bg-gradient-to-b from-white/40 via-white/18 to-white/10 shadow-[0_16px_36px_rgba(0,35,90,0.22)] overflow-visible">
      {/* Huy hiệu Ngôi sao Vàng 3D may mắn góc trên bên trái */}
      <div className="absolute -top-3.5 -left-3.5 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-11 sm:h-11 pointer-events-none select-none z-20 animate-soft-twinkle">
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-[0_4px_10px_rgba(255,160,0,0.5)]">
          <defs>
            <linearGradient id="starBadgeGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="40%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
            <radialGradient id="starHaloLeft" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE082" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="22" cy="22" r="18" fill="url(#starHaloLeft)" />
          {/* 3D Star shape */}
          <path
            d="M 22 4 Q 22 22 40 22 Q 22 22 22 40 Q 22 22 4 22 Q 22 22 22 4 Z"
            fill="url(#starBadgeGradLeft)"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="22" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Huy hiệu Ngôi sao Vàng 3D may mắn góc trên bên phải */}
      <div className="absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-11 sm:h-11 pointer-events-none select-none z-20 animate-soft-twinkle">
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-[0_4px_10px_rgba(255,160,0,0.5)]">
          <defs>
            <linearGradient id="starBadgeGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="40%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
            <radialGradient id="starHaloRight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE082" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="22" cy="22" r="18" fill="url(#starHaloRight)" />
          {/* 3D Star shape */}
          <path
            d="M 22 4 Q 22 22 40 22 Q 22 22 22 40 Q 22 22 4 22 Q 22 22 22 4 Z"
            fill="url(#starBadgeGradRight)"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="22" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Thân card bên trong với background mờ dần từ trên xuống dưới (90% -> 45% -> 18%) */}
      <div className="w-full h-full rounded-[26px] sm:rounded-[30px] p-3.5 sm:p-4.5 lg:p-5 pt-3 sm:pt-3.5 bg-gradient-to-b from-[#004DA3]/90 via-[#005ABF]/45 to-[#003B7A]/18 flex flex-col justify-between overflow-visible">
        {/* Section Header with 3D text */}
        <div className="relative flex items-center justify-center gap-2 mb-2 sm:mb-2.5 select-none">
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:_0_2px_0_#003E8A,_0_4px_6px_rgba(0,0,0,0.3)] flex items-center gap-2.5">
            <span>TÍNH NĂNG NỔI BẬT</span>
            <span className="text-2xl sm:text-3xl select-none filter drop-shadow">✨</span>
          </h2>
        </div>

        {/* 2x2 Navigation Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full">
          {navigationCards.map((item) => (
            <NavigationCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
