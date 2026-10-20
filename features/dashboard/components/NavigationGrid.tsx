"use client";

import { navigationCards } from "../data/navigationData";
import { NavigationCard } from "./NavigationCard";

export function NavigationGrid() {
  return (
    <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] p-3.5 sm:p-4.5 lg:p-5 pt-3 sm:pt-3.5 bg-gradient-to-b from-[#004DA3]/90 via-[#0060C5]/45 to-transparent border-2 border-white/25 shadow-[0_16px_36px_rgba(0,35,90,0.22),inset_0_2px_4px_rgba(255,255,255,0.35)] flex flex-col justify-between overflow-visible">
      {/* Top Left Celebration Burst & Star */}
      <div className="absolute -top-4 -left-4 w-14 h-14 sm:w-16 sm:h-16 pointer-events-none select-none z-10">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <line x1="50" y1="50" x2="15" y2="18" stroke="#FF477E" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="32" y2="6" stroke="#FFD13B" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="56" y2="4" stroke="#00E5FF" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="50" x2="8" y2="45" stroke="#2ED573" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="16" y2="72" stroke="#FFA502" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <div className="absolute -top-1 -left-1 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300 stroke-amber-500 stroke-[1.5]" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

      {/* Top Right Celebration Burst & Star */}
      <div className="absolute -top-4 -right-4 w-14 h-14 sm:w-16 sm:h-16 pointer-events-none select-none z-10">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <line x1="50" y1="50" x2="85" y2="18" stroke="#FF477E" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="68" y2="6" stroke="#FFD13B" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="44" y2="4" stroke="#00E5FF" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="50" x2="92" y2="45" stroke="#2ED573" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="84" y2="72" stroke="#9C88FF" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <div className="absolute -top-1 -right-1 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300 stroke-amber-500 stroke-[1.5]" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

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
  );
}
