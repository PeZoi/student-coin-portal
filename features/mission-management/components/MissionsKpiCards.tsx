"use client";

import Image from "next/image";
import { ListTodo, CheckCircle2, FileCheck2 } from "lucide-react";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";

/**
 * 4 Thẻ thống kê KPI trang Giao bài tập
 * - Đồng bộ 100% hệ thống thẻ KPI với Quản lý lớp học, Học sinh và Giáo viên
 */
export function MissionsKpiCards() {
  const {
    activeMissionsCount,
    totalMissions,
    expiredMissionsCount,
    averageCompletionPercent,
    totalSubmittedSum,
    totalAssignedStudentsSum,
    pendingReviewTotal,
    totalCoinsAwardedAll,
    isLoading,
  } = useManageMissionsContext();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-4 w-28 bg-slate-100 rounded-md" />
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <div className="h-8 w-16 bg-slate-200 rounded-lg" />
              <div className="h-4 w-12 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Đang mở nhận bài */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Đang mở nhận bài
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {activeMissionsCount}
          </span>
          <span className="text-sm font-semibold text-slate-500">
            / {totalMissions} bài tập
          </span>
          {expiredMissionsCount > 0 && (
            <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
              {expiredMissionsCount} Quá hạn
            </span>
          )}
        </div>
      </div>

      {/* 2. Tỷ lệ hoàn thành trung bình */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tiến độ nộp bài
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {averageCompletionPercent}%
          </span>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            ({totalSubmittedSum}/{totalAssignedStudentsSum} lượt nộp)
          </span>
        </div>
      </div>

      {/* 3. Bài nộp chờ cô duyệt */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Bài chờ cô duyệt
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {pendingReviewTotal}
          </span>
          <span className="text-sm font-semibold text-slate-500">bài nộp</span>
        </div>
      </div>

      {/* 4. Tổng xu đã phát thưởng */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tổng xu đã thưởng
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50/90 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Image
              src="/wheel/coin.webp"
              alt="Xu thưởng"
              width={22}
              height={22}
              unoptimized
              style={{ height: "auto" }}
              className="w-5.5 h-5.5 object-contain drop-shadow-2xs"
            />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {totalCoinsAwardedAll.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">xu</span>
        </div>
      </div>
    </div>
  );
}
