"use client";

import React from "react";
import { Flame, Lock, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentLeaderboardBoardId } from "../types";

interface LeaderboardBoardTabsProps {
  activeBoard: StudentLeaderboardBoardId;
  onChangeBoard: (board: StudentLeaderboardBoardId) => void;
  topCoinsCount: number;
  leadersCount: number;
  risersCount: number;
  hasPreviousMonthData: boolean;
}

interface TabItemConfig {
  id: StudentLeaderboardBoardId;
  label: string;
  shortLabel: string;
  activeClass: string;
  badgeActiveClass: string;
}

const TAB_ITEMS: readonly TabItemConfig[] = [
  {
    id: "top_coins",
    label: "Top Xu Tháng Này",
    shortLabel: "Top Xu",
    activeClass:
      "bg-gradient-to-r from-[#0080FF] via-[#0099FF] to-[#006ED6] text-white border-sky-200/90 shadow-[0_0_16px_rgba(0,153,255,0.55),inset_0_1.5px_1px_rgba(255,255,255,0.75)]",
    badgeActiveClass: "bg-white/25 text-white",
  },
  {
    id: "progress_leaders",
    label: "Tiến Bộ • Dẫn Đầu",
    shortLabel: "Nhóm Dẫn Đầu",
    activeClass:
      "bg-gradient-to-r from-[#FF9800] via-[#FFB703] to-[#F97316] text-white border-amber-200/90 shadow-[0_0_16px_rgba(255,180,0,0.55),inset_0_1.5px_1px_rgba(255,255,255,0.8)]",
    badgeActiveClass: "bg-white/25 text-white",
  },
  {
    id: "progress_risers",
    label: "Tiến Bộ • Vươn Lên",
    shortLabel: "Nhóm Vươn Lên",
    activeClass:
      "bg-gradient-to-r from-[#00A844] via-[#10C45C] to-[#008F38] text-white border-emerald-200/90 shadow-[0_0_16px_rgba(16,196,92,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.75)]",
    badgeActiveClass: "bg-white/25 text-white",
  },
];

export function LeaderboardBoardTabs({
  activeBoard,
  onChangeBoard,
  topCoinsCount,
  leadersCount,
  risersCount,
  hasPreviousMonthData,
}: LeaderboardBoardTabsProps) {
  const renderIcon = (id: StudentLeaderboardBoardId) => {
    if (id === "top_coins") {
      return <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />;
    }
    if (id === "progress_leaders") {
      return <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />;
    }
    return <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />;
  };

  const getBadgeInfo = (id: StudentLeaderboardBoardId) => {
    if (id === "top_coins") {
      return { text: `${topCoinsCount}`, locked: false };
    }
    if (!hasPreviousMonthData) {
      return { text: "Chưa mở", locked: true };
    }
    if (id === "progress_leaders") {
      return { text: `${leadersCount}`, locked: false };
    }
    return { text: `${risersCount}`, locked: false };
  };

  return (
    <div
      role="tablist"
      aria-label="Chọn bảng xếp hạng"
      className="w-full grid grid-cols-3 gap-1.5 sm:gap-2.5 mb-2.5 sm:mb-3 flex-shrink-0 select-none"
    >
      {TAB_ITEMS.map((tab) => {
        const isActive = activeBoard === tab.id;
        const badge = getBadgeInfo(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChangeBoard(tab.id)}
            className={cn(
              "cursor-pointer transition-all duration-200 rounded-xl sm:rounded-2xl border-2 px-2 sm:px-3.5 py-2 sm:py-2.5 font-heading flex items-center justify-center gap-1.5 sm:gap-2 min-w-0",
              isActive
                ? cn(tab.activeClass, "font-black scale-[1.01]")
                : "bg-[#0B4899]/65 hover:bg-[#0B4899]/90 border-sky-300/30 text-sky-100/90 hover:text-white font-bold"
            )}
          >
            {renderIcon(tab.id)}
            <span className="hidden sm:inline text-xs md:text-sm tracking-wide truncate">
              {tab.label}
            </span>
            <span className="sm:hidden text-[11px] tracking-tight truncate">
              {tab.shortLabel}
            </span>

            <span
              className={cn(
                "hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black leading-none flex-shrink-0",
                isActive
                  ? tab.badgeActiveClass
                  : "bg-white/15 text-sky-100/90"
              )}
            >
              {badge.locked && <Lock className="w-2.5 h-2.5" />}
              <span>{badge.locked ? badge.text : `${badge.text} bạn`}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
