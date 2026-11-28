"use client";

import { Coins, Crown, TrendingUp, Users } from "lucide-react";
import { useLeaderboardContext } from "../contexts/LeaderboardContext";

/**
 * 4 Thẻ KPI tổng quan kỳ xếp hạng
 */
export function LeaderboardKpiCards() {
  const { computed } = useLeaderboardContext();
  const top1 = computed.topCoinsBoard[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng học sinh tham gia */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Học sinh xếp hạng
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {computed.totalStudents}
          </span>
          <span className="text-sm font-semibold text-slate-500">em</span>
        </div>
      </div>

      {/* 2. Tổng xu tích lũy trong tháng */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tổng xu kiếm được
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {computed.totalEarnedCoins.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">xu</span>
        </div>
      </div>

      {/* 3. Dẫn đầu bảng vàng */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Dẫn đầu tháng này
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-lg sm:text-xl font-heading font-extrabold text-[#0F172A] tracking-tight truncate">
            {top1 ? top1.fullName : "Chưa có"}
          </p>
          {top1 && (
            <p className="text-xs font-bold text-amber-700 mt-0.5 tabular-nums">
              {top1.currentMonthCoins.toLocaleString("vi-VN")} xu
            </p>
          )}
        </div>
      </div>

      {/* 4. Học sinh vượt phong độ tháng trước */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Học sinh tiến bộ
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
        {computed.hasPreviousMonthData ? (
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {computed.improvedStudentsCount}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              / {computed.totalStudents} em
            </span>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-base font-heading font-bold text-slate-500">
              Chưa mở đối chiếu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
