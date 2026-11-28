"use client";

import { Flame, Lock, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeaderboardContext } from "../contexts/LeaderboardContext";
import { LeaderboardBoardId } from "../types";

interface BoardTabDefinition {
  id: LeaderboardBoardId;
  title: string;
  subtitle: string;
  accentActive: string;
  iconBgActive: string;
  iconBgIdle: string;
  badgeActive: string;
}

const BOARD_TABS: readonly BoardTabDefinition[] = [
  {
    id: "top_coins",
    title: "Top Xu Tháng Này",
    subtitle: "Tổng xu kiếm được nhiều nhất trong tháng",
    accentActive: "border-[#0A62D6] bg-[#F5F9FF] ring-2 ring-[#0A62D6]/15",
    iconBgActive: "bg-[#0A62D6] text-white",
    iconBgIdle: "bg-[#EAF2FF] text-[#0A62D6]",
    badgeActive: "bg-[#0A62D6] text-white",
  },
  {
    id: "progress_leaders",
    title: "Tiến Bộ • Nhóm Dẫn Đầu",
    subtitle: "Top chăm chỉ tháng trước",
    accentActive: "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/15",
    iconBgActive: "bg-amber-500 text-white",
    iconBgIdle: "bg-amber-50 text-amber-600",
    badgeActive: "bg-amber-600 text-white",
  },
  {
    id: "progress_risers",
    title: "Tiến Bộ • Nhóm Vươn Lên",
    subtitle: "Bứt tốc từ nửa sau tháng trước",
    accentActive: "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/15",
    iconBgActive: "bg-emerald-600 text-white",
    iconBgIdle: "bg-emerald-50 text-emerald-700",
    badgeActive: "bg-emerald-600 text-white",
  },
];

/**
 * Thanh chọn 3 Bảng xếp hạng dạng thẻ tương tác nổi bật
 * - Hiển thị trực quan số học sinh từng nhóm hoặc trạng thái "Chưa mở" ở tháng khởi đầu
 */
export function LeaderboardBoardTabs() {
  const { activeBoard, setActiveBoard, computed } = useLeaderboardContext();

  const renderIcon = (id: LeaderboardBoardId) => {
    if (id === "top_coins") {
      return <Trophy className="w-5 h-5" aria-hidden="true" />;
    }
    if (id === "progress_leaders") {
      return <Flame className="w-5 h-5" aria-hidden="true" />;
    }
    return <TrendingUp className="w-5 h-5" aria-hidden="true" />;
  };

  const getCountBadge = (id: LeaderboardBoardId) => {
    if (id === "top_coins") {
      return { text: `${computed.totalStudents} em`, locked: false };
    }
    if (!computed.hasPreviousMonthData) {
      return { text: "Chưa mở", locked: true };
    }
    if (id === "progress_leaders") {
      return { text: `${computed.leadersGroupCount} em`, locked: false };
    }
    return { text: `${computed.risersGroupCount} em`, locked: false };
  };

  return (
    <div
      role="tablist"
      aria-label="Chọn bảng xếp hạng"
      className="grid grid-cols-1 md:grid-cols-3 gap-3.5"
    >
      {BOARD_TABS.map((tab) => {
        const isActive = activeBoard === tab.id;
        const badge = getCountBadge(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveBoard(tab.id)}
            className={cn(
              "text-left p-4 rounded-2xl border transition-colors duration-150 cursor-pointer flex items-start gap-3.5 shadow-2xs",
              isActive
                ? tab.accentActive
                : "border-[#E2E8F0] bg-white hover:bg-slate-50/80 hover:border-slate-300"
            )}
          >
            <div
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                isActive ? tab.iconBgActive : tab.iconBgIdle
              )}
            >
              {renderIcon(tab.id)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#0F172A] truncate">
                  {tab.title}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 tabular-nums",
                    badge.locked
                      ? "bg-slate-100 text-slate-600 border border-slate-200"
                      : isActive
                      ? tab.badgeActive
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  {badge.locked && (
                    <Lock className="w-3 h-3" aria-hidden="true" />
                  )}
                  <span>{badge.text}</span>
                </span>
              </div>

              <p className="text-xs text-[#64748B] mt-1 leading-snug">
                {tab.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
