"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Crown,
  Medal,
  TrendingUp,
} from "lucide-react";
import { WHEEL_ASSETS } from "@/constants/wheel";
import { cn } from "@/lib/utils";
import { useLeaderboardContext } from "../contexts/LeaderboardContext";
import { ProgressRankEntry, TopCoinsRankEntry } from "../types";

interface PodiumCardModel {
  rank: 1 | 2 | 3;
  studentId: string;
  fullName: string;
  avatarUrl: string;
  primaryValue: string;
  primaryUnit?: string;
  subBadgeText: string;
  prevCoins: number | null;
  currentCoins: number;
  missionsText: string;
  isPositive: boolean;
}

const RANK_VISUAL_STYLES: Record<
  1 | 2 | 3,
  {
    orderClass: string;
    cardClass: string;
    topBarClass: string;
    ringClass: string;
    badgeClass: string;
    rankLabel: string;
  }
> = {
  1: {
    orderClass: "order-1 md:order-2 md:-mt-3",
    cardClass:
      "border-yellow-300/95 bg-gradient-to-b from-yellow-50/80 via-white to-white shadow-[0_12px_30px_-10px_rgba(234,179,8,0.24)]",
    topBarClass: "bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400",
    ringClass: "ring-yellow-400",
    badgeClass:
      "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-xs",
    rankLabel: "Hạng 1",
  },
  2: {
    orderClass: "order-2 md:order-1 md:mt-2",
    cardClass:
      "border-slate-200/95 bg-gradient-to-b from-slate-50/80 via-white to-white shadow-2xs",
    topBarClass: "bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500",
    ringClass: "ring-slate-300",
    badgeClass: "bg-slate-600 text-white",
    rankLabel: "Hạng 2",
  },
  3: {
    orderClass: "order-3 md:order-3 md:mt-2",
    cardClass:
      "border-[#D9B59A] bg-gradient-to-b from-[#FAF1EA] via-white to-white shadow-2xs",
    topBarClass: "bg-gradient-to-r from-[#B86B43] via-[#A0522D] to-[#8C4320]",
    ringClass: "ring-[#C7855E]",
    badgeClass: "bg-[#8C4320] text-white",
    rankLabel: "Hạng 3",
  },
};

function toPodiumModels(
  mode: "top_coins" | "progress_leaders" | "progress_risers",
  topCoins: TopCoinsRankEntry[],
  progressEntries: ProgressRankEntry[]
): PodiumCardModel[] {
  if (mode === "top_coins") {
    return topCoins.slice(0, 3).map((item, idx) => {
      const rank = (idx + 1) as 1 | 2 | 3;
      const deltaSign =
        item.deltaCoins !== null && item.deltaCoins >= 0 ? "+" : "";
      const subBadgeText =
        item.deltaCoins === null
          ? "Tháng khởi đầu"
          : `${deltaSign}${item.deltaCoins.toLocaleString("vi-VN")} xu so với tháng trước`;

      return {
        rank,
        studentId: item.studentId,
        fullName: item.fullName,
        avatarUrl: item.avatarUrl,
        primaryValue: item.currentMonthCoins.toLocaleString("vi-VN"),
        primaryUnit: "xu",
        subBadgeText,
        prevCoins: item.prevMonthCoins,
        currentCoins: item.currentMonthCoins,
        missionsText: `${item.completedMissionsCount}/${item.totalMissionsCount} bài tập`,
        isPositive: item.deltaCoins === null || item.deltaCoins >= 0,
      };
    });
  }

  // Đồng bộ 100% thông tin hiển thị cho cả 2 bảng Tiến bộ (thuần theo số xu tăng thêm)
  return progressEntries.slice(0, 3).map((item, idx) => {
    const rank = (idx + 1) as 1 | 2 | 3;
    const deltaSign = item.deltaCoins > 0 ? "+" : "";
    const subBadgeText =
      item.deltaCoins > 0
        ? "Tăng so với tháng trước"
        : item.deltaCoins < 0
        ? "Giảm so với tháng trước"
        : "Giữ nguyên so với tháng trước";

    return {
      rank,
      studentId: item.studentId,
      fullName: item.fullName,
      avatarUrl: item.avatarUrl,
      primaryValue: `${deltaSign}${item.deltaCoins.toLocaleString("vi-VN")}`,
      primaryUnit: "xu",
      subBadgeText,
      prevCoins: item.prevMonthCoins,
      currentCoins: item.currentMonthCoins,
      missionsText: `${item.completedMissionsCount}/${item.totalMissionsCount} bài tập`,
      isPositive: item.isImproved,
    };
  });
}

/**
 * Bục vinh danh Top 3 chuyên nghiệp (chuẩn UI/UX Pro Max)
 * - Đồng bộ 100% cấu trúc dữ liệu giữa 2 bảng Tiến bộ (% tăng trưởng là chỉ số chính)
 */
export function LeaderboardPodium() {
  const { activeBoard, computed } = useLeaderboardContext();

  const isTopCoins = activeBoard === "top_coins";
  const models = toPodiumModels(
    activeBoard,
    computed.topCoinsBoard,
    activeBoard === "progress_leaders"
      ? computed.progressLeadersBoard
      : computed.progressRisersBoard
  );

  if (models.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch pt-2">
      {models.map((item) => {
        const style = RANK_VISUAL_STYLES[item.rank];

        return (
          <div
            key={item.studentId}
            className={cn(
              "relative rounded-2xl border overflow-hidden flex flex-col justify-between transition-colors",
              style.orderClass,
              style.cardClass
            )}
          >
            {/* Dải nhấn sắc màu trên đỉnh thẻ */}
            <div className={cn("h-1.5 w-full", style.topBarClass)} />

            <div className="p-5 flex-1 flex flex-col items-center text-center">
              {/* Huy hiệu thứ hạng */}
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3.5",
                  style.badgeClass
                )}
              >
                {item.rank === 1 ? (
                  <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                ) : item.rank === 2 ? (
                  <Medal className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Award className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{style.rankLabel}</span>
              </div>

              {/* Avatar Chibi */}
              <div
                className={cn(
                  "relative rounded-full overflow-hidden bg-white ring-4 mb-3 shrink-0 shadow-xs",
                  item.rank === 1 ? "w-20 h-20" : "w-16 h-16",
                  style.ringClass
                )}
              >
                <Image
                  src={item.avatarUrl}
                  alt={item.fullName}
                  fill
                  sizes={item.rank === 1 ? "80px" : "64px"}
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Họ tên học sinh */}
              <h3 className="text-base sm:text-[17px] font-heading font-black text-[#0F172A] leading-snug">
                {item.fullName}
              </h3>

              {/* Chỉ số bài tập nhỏ gọn */}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] mt-1 tabular-nums">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                  aria-hidden="true"
                />
                <span>{item.missionsText}</span>
              </span>

              {/* Khối chỉ số chính nổi bật */}
              <div
                className={cn(
                  "mt-4 w-full rounded-xl border px-3.5 py-3 flex flex-col items-center",
                  isTopCoins
                    ? "bg-amber-50/70 border-amber-200/80"
                    : item.isPositive
                    ? "bg-emerald-50/60 border-emerald-200/80"
                    : "bg-rose-50/60 border-rose-200/80"
                )}
              >
                <div className="inline-flex items-center justify-center gap-1.5 tabular-nums">
                  {isTopCoins ? (
                    <Image
                      src={WHEEL_ASSETS.COIN}
                      alt="Xu"
                      width={22}
                      height={22}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-5 h-5 object-contain shrink-0"
                    />
                  ) : (
                    <TrendingUp
                      className={cn(
                        "w-5 h-5 shrink-0",
                        item.isPositive ? "text-emerald-600" : "text-rose-500"
                      )}
                      aria-hidden="true"
                    />
                  )}

                  <span
                    className={cn(
                      "text-2xl font-heading font-black tracking-tight leading-none",
                      isTopCoins
                        ? "text-[#B45309]"
                        : item.isPositive
                        ? "text-emerald-700"
                        : "text-rose-600"
                    )}
                  >
                    {item.primaryValue}
                  </span>

                  {item.primaryUnit && (
                    <span
                      className={cn(
                        "text-sm font-bold",
                        isTopCoins
                          ? "text-amber-600"
                          : item.isPositive
                          ? "text-emerald-600"
                          : "text-rose-500"
                      )}
                    >
                      {item.primaryUnit}
                    </span>
                  )}
                </div>

                {/* Dòng chỉ số bổ trợ */}
                <span
                  className={cn(
                    "mt-1.5 inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
                    isTopCoins
                      ? item.isPositive
                        ? "text-emerald-700"
                        : "text-rose-600"
                      : "text-[#64748B]"
                  )}
                >
                  {isTopCoins &&
                    item.prevCoins !== null &&
                    (item.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                    ))}
                  <span>{item.subBadgeText}</span>
                </span>
              </div>
            </div>

            {/* Chân thẻ đối chiếu Tháng trước -> Tháng này (chỉ hiện ở 2 bảng Tiến bộ) */}
            {!isTopCoins && item.prevCoins !== null && (
              <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold tabular-nums">
                <span className="text-[#64748B]">
                  {item.prevCoins.toLocaleString("vi-VN")} xu
                </span>
                <ArrowRight
                  className="w-3.5 h-3.5 text-slate-400 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[#B45309] font-bold">
                  {item.currentCoins.toLocaleString("vi-VN")} xu
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
