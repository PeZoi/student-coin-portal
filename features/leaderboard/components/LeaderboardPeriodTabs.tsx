"use client";

import React from "react";
import { PeriodType } from "../types";
import { cn } from "@/lib/utils";

interface LeaderboardPeriodTabsProps {
  activePeriod: PeriodType;
  onChangePeriod: (period: PeriodType) => void;
}

export function LeaderboardPeriodTabs({
  activePeriod,
  onChangePeriod,
}: LeaderboardPeriodTabsProps) {
  const isCurrent = activePeriod === "current_month";

  return (
    <div className="relative z-20 inline-flex items-center select-none justify-center">
      {/* Outer Glow Halo container */}
      <div className="bg-[#0B4899]/75 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-sky-300/35 shadow-[0_10px_25px_rgba(0,25,75,0.35)] flex items-center gap-1 sm:gap-2">
        {/* Tab 1: Tháng Hiện Tại */}
        <button
          type="button"
          onClick={() => onChangePeriod("current_month")}
          className={cn(
            "relative cursor-pointer transition-all duration-200 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-1.5 sm:py-2 text-sm sm:text-base font-heading tracking-wide",
            isCurrent
              ? "text-white font-black bg-gradient-to-r from-[#FF9800] via-[#FFB703] to-[#FF8500] border-2 border-amber-200/90 shadow-[0_0_18px_rgba(255,180,0,0.6),inset_0_1.5px_1px_rgba(255,255,255,0.9)] scale-100"
              : "text-sky-200/80 hover:text-white hover:bg-white/10 font-bold"
          )}
        >
          <span>Tháng Hiện Tại</span>
          <span className="text-base sm:text-lg select-none">📅</span>
        </button>

        {/* Tab 2: Tháng Trước */}
        <button
          type="button"
          onClick={() => onChangePeriod("previous_month")}
          className={cn(
            "relative cursor-pointer transition-all duration-200 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-1.5 sm:py-2 text-sm sm:text-base font-heading tracking-wide",
            !isCurrent
              ? "text-white font-black bg-gradient-to-r from-[#FF9800] via-[#FFB703] to-[#FF8500] border-2 border-amber-200/90 shadow-[0_0_18px_rgba(255,180,0,0.6),inset_0_1.5px_1px_rgba(255,255,255,0.9)] scale-100"
              : "text-sky-200/80 hover:text-white hover:bg-white/10 font-bold"
          )}
        >
          <span>Tháng Trước</span>
          <span className="text-base sm:text-lg select-none">📅</span>
        </button>
      </div>
    </div>
  );
}

