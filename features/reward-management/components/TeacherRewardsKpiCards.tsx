"use client";

import Image from "next/image";
import { Gift, Clock, CheckCircle2, Coins } from "lucide-react";
import { useOptionalTeacherRewardsContext } from "../contexts/TeacherRewardsContext";

export interface TeacherRewardsKpiCardsProps {
  totalRequests?: number;
  pendingRequests?: number;
  completedRequests?: number;
  totalCoinsExchanged?: number;
  totalVndAmount?: number;
}

/**
 * 4 Thẻ thống kê KPI trang Đổi quà Heo Đất
 * - Tự động đọc dữ liệu từ TeacherRewardsContext (Quy tắc 10 - Feature Context Pattern)
 * - Vẫn hỗ trợ truyền props độc lập khi cần
 */
export function TeacherRewardsKpiCards(props?: TeacherRewardsKpiCardsProps) {
  const context = useOptionalTeacherRewardsContext();

  const totalRequests = props?.totalRequests ?? context?.counts.all ?? 0;
  const pendingRequests =
    props?.pendingRequests ?? context?.counts.pending ?? 0;
  const completedRequests =
    props?.completedRequests ?? context?.counts.completed ?? 0;
  const totalCoinsExchanged =
    props?.totalCoinsExchanged ?? context?.totalCoinsExchanged ?? 0;
  const totalVndAmount = props?.totalVndAmount ?? context?.totalVndAmount ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng yêu cầu */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left transition-all hover:shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tổng yêu cầu
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {totalRequests}
          </span>
          <span className="text-sm font-semibold text-slate-500">lượt đổi</span>
        </div>
      </div>

      {/* 2. Chờ xét duyệt (Pending) */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left transition-all hover:shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Chờ xét duyệt
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#B45309] tracking-tight">
            {pendingRequests}
          </span>
          <span className="text-sm font-semibold text-slate-500">chờ cô duyệt</span>
        </div>
      </div>

      {/* 3. Đã duyệt & trao quà (Completed) */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left transition-all hover:shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Đã duyệt & trao quà
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#15803D] tracking-tight">
            {completedRequests}
          </span>
          <span className="text-sm font-semibold text-slate-500">thành công</span>
        </div>
      </div>

      {/* 4. Tổng giá trị quy đổi */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left transition-all hover:shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-sm font-semibold text-[#475569] block">
              Tổng giá trị quy đổi
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              (Chờ duyệt & Đã trao)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
              {totalVndAmount.toLocaleString("vi-VN")}
            </span>
            <span className="text-sm font-bold text-slate-500">đ</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-amber-700">
            <Image
              src="/coin.webp"
              alt="Xu"
              width={16}
              height={16}
              unoptimized
              style={{ height: "auto" }}
              className="w-4"
            />
            <span>{totalCoinsExchanged.toLocaleString("vi-VN")} xu Heo Đất</span>
          </div>
        </div>
      </div>
    </div>
  );
}
