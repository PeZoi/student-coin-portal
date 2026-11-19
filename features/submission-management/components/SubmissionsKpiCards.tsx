"use client";

import Image from "next/image";
import { Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";

/**
 * 4 Thẻ thống kê KPI Studio Duyệt bài tập
 * - Đồng bộ 100% phong cách thiết kế KPI cards với Quản lý bài tập, Lớp học và Học sinh
 */
export function SubmissionsKpiCards() {
  const {
    pendingCount,
    approvedCount,
    rejectedCount,
    totalCount,
    validAiPendingCount,
    totalCoinsAwarded,
  } = useManageSubmissionsContext();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Bài chờ duyệt */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Bài chờ duyệt
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {pendingCount}
          </span>
          <span className="text-sm font-semibold text-slate-500">
            bài nộp
          </span>
          {validAiPendingCount > 0 && (
            <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              {validAiPendingCount} bài AI hợp lệ
            </span>
          )}
        </div>
      </div>

      {/* Card 2: Đã duyệt hoàn thành */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Đã duyệt hoàn thành
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {approvedCount}
          </span>
          <span className="text-sm font-semibold text-slate-500">
            / {totalCount} bài nộp
          </span>
        </div>
      </div>

      {/* Card 3: Cần làm lại */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Cần nộp lại
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {rejectedCount}
          </span>
          <span className="text-sm font-semibold text-slate-500">
            bài nộp
          </span>
          {rejectedCount > 0 ? (
            <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
              Ảnh mờ / chưa đạt
            </span>
          ) : (
            <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200/80">
              0 bài lỗi
            </span>
          )}
        </div>
      </div>

      {/* Card 4: Tổng xu đã thưởng */}
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
            +{totalCoinsAwarded.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">
            xu Heo Đất
          </span>
        </div>
      </div>
    </div>
  );
}
