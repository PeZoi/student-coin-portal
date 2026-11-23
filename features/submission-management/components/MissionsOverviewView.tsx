"use client";

import {
  BookOpen,
  FileCheck2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { MissionOverviewCard } from "./MissionOverviewCard";

/**
 * Màn hình Tổng quan Danh sách Bài tập Cần duyệt (Level 1 - Assignment Hub)
 * - Header và 4 Thẻ KPI đồng bộ 100% phong cách thiết kế với Quản lý học sinh, Lớp học và Giáo viên
 * - Đã loại bỏ Toolbar rườm rà
 * - Tự động sắp xếp (Sort): Bài còn hạn & có bài chờ duyệt lên đầu, bài ĐÃ QUÁ HẠN đưa xuống CUỐI CÙNG
 */
export function MissionsOverviewView() {
  const {
    missionsOverview,
    totalMissionsCount,
    totalPendingAllMissions,
    totalApprovedAllMissions,
    totalRejectedAllMissions,
  } = useManageSubmissionsContext();

  return (
    <div className="space-y-6">
      {/* 1. Header Trang Tổng Quan (Đồng bộ chuẩn phong cách các trang quản trị khác) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Duyệt bài tập
          </h1>
          <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
            Tổng hợp tiến độ nộp bài của học sinh, đối chiếu kết quả bóc tách từ AI và duyệt thưởng xu Heo Đất.
          </p>
        </div>

      </div>

      {/* 2. Thống kê KPI Toàn hệ thống (Đồng bộ 100% chuẩn Card KPI với Quản lý học sinh / Lớp học) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bài tập đang mở */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Bài tập đang mở
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {totalMissionsCount}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              bài tập
            </span>
          </div>
        </div>

        {/* Card 2: Bài chờ duyệt (Highlight) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Bài chờ duyệt
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-amber-600 tracking-tight tabular-nums">
              {totalPendingAllMissions}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              bài nộp
            </span>
            {totalPendingAllMissions > 0 && (
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                Cần duyệt
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Đã duyệt xong */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Đã duyệt xong
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {totalApprovedAllMissions}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              bài nộp
            </span>
          </div>
        </div>

        {/* Card 4: Cần sửa / Nộp lại */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Cần sửa / Nộp lại
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-3xl font-heading font-extrabold tracking-tight tabular-nums",
                totalRejectedAllMissions > 0
                  ? "text-rose-600"
                  : "text-[#0F172A]"
              )}
            >
              {totalRejectedAllMissions}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              bài nộp
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lưới Thẻ Bài Tập (Đã sắp xếp: Bài còn hạn lên trước, Bài quá hạn ở cuối) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        {missionsOverview.map((mission) => (
          <MissionOverviewCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}
