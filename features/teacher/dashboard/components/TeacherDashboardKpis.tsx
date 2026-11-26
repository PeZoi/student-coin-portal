"use client";

import Image from "next/image";
import { FileCheck2, BookOpen, Gift } from "lucide-react";
import { useTeacherDashboardContext } from "../contexts/TeacherDashboardContext";
import { DASHBOARD_ASSETS } from "../constants";

/**
 * 4 Thẻ KPI trên Dashboard giáo viên
 * - Đọc trực tiếp từ TeacherDashboardContext
 */
export function TeacherDashboardKpis() {
  const { kpis } = useTeacherDashboardContext();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Bài chờ cô duyệt */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left flex flex-col justify-between hover:border-amber-300 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Bài chờ cô duyệt
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/80">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {kpis.pending_submissions_count}
            </span>
            <span className="text-sm font-semibold text-slate-500">bài nộp</span>
          </div>
        </div>
      </div>

      {/* 2. Bài tập đang mở */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left flex flex-col justify-between hover:border-emerald-300 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Bài tập đang mở
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/80">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {kpis.active_missions_count}
            </span>
            <span className="text-sm font-semibold text-slate-500">bài tập</span>
          </div>
        </div>
      </div>

      {/* 3. Đổi quà chờ duyệt */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left flex flex-col justify-between hover:border-blue-300 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Quà chờ duyệt
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0A62D6] flex items-center justify-center shrink-0 border border-blue-200/80">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {kpis.pending_rewards_count}
            </span>
            <span className="text-sm font-semibold text-slate-500">phần quà</span>
          </div>
        </div>
      </div>

      {/* 4. Tổng xu đã phát thưởng */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left flex flex-col justify-between hover:border-amber-300 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Xu thưởng tháng này
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50/90 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Image
              src={DASHBOARD_ASSETS.COIN_ICON}
              alt="Xu thưởng"
              width={24}
              height={24}
              style={{ height: "auto" }}
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-amber-600 tracking-tight tabular-nums">
              {kpis.monthly_awarded_coins.toLocaleString("vi-VN")}
            </span>
            <span className="text-sm font-bold text-amber-600">xu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
