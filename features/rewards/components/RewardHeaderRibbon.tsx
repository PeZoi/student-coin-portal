import React from "react";

export function RewardHeader() {
  return (
    <div className="relative flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 select-none w-full">
      <h2 className="text-lg min-[380px]:text-xl sm:text-2xl lg:text-3xl font-heading font-black uppercase tracking-wide sm:tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:_0_2px_0_#003E8A,_0_4px_6px_rgba(0,0,0,0.3)] flex items-center justify-center gap-1.5 sm:gap-2.5 whitespace-nowrap">
        <span className="text-base min-[380px]:text-lg sm:text-2xl lg:text-3xl select-none filter drop-shadow flex-shrink-0">✨</span>
        <span className="whitespace-nowrap">ĐỔI QUÀ NHẬN THƯỞNG</span>
        <span className="text-base min-[380px]:text-lg sm:text-2xl lg:text-3xl select-none filter drop-shadow flex-shrink-0">✨</span>
      </h2>
    </div>
  );
}

// Giữ lại alias RewardHeaderRibbon để tương thích ngược
export const RewardHeaderRibbon = RewardHeader;
