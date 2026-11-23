"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  TrendingUp,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { AppRoutes } from "@/constants/routes";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";

/**
 * Header Không gian Chi tiết Bài tập (Level 2 Header)
 * - Nút Back đặt gọn phía trên: quay về danh sách bài tập (Roster) hoặc danh sách học sinh (Studio)
 * - Hiển thị icon, tiêu đề, mô tả bài tập kèm Hạn nộp & Xu thưởng bên phải
 * - 5 thẻ KPI độc lập đồng bộ chuẩn Design System các trang quản trị
 */
export function MissionDetailHeader() {
  const {
    selectedMission,
    pendingCount,
    approvedCount,
    lateCount,
    studentRoster,
  } = useManageSubmissionsContext();

  const isExpired = Boolean(selectedMission?.is_expired);
  const thumbnailSrc =
    selectedMission?.submission_type === "platform_proof"
      ? "/submissions/capture.webp"
      : "/submissions/write.webp";

  const totalStudents =
    selectedMission?.total_students ?? studentRoster.length;
  const submittedCount =
    selectedMission?.submitted_count ??
    studentRoster.filter((s) => s.has_submitted).length;
  const submissionRate =
    totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;
  const unsubmittedCount = selectedMission
    ? Math.max(0, selectedMission.total_students - selectedMission.submitted_count)
    : studentRoster.filter((s) => !s.has_submitted).length;

  return (
    <div className="space-y-5">
      {/* 1. Nút Back gọn gàng phía trên tiêu đề */}
      <div>
        <Link
          href={AppRoutes.TEACHER.SUBMISSIONS}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#E2E8F0] text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0A62D6] transition-colors shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Quay lại danh sách bài tập</span>
        </Link>
      </div>

      {/* 2. Thông tin Bài tập: Icon + Tiêu đề/Mô tả & Hạn nộp/Xu thưởng bên phải */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-slate-200/90 bg-white shrink-0 shadow-2xs">
            <Image
              src={thumbnailSrc}
              alt={selectedMission?.title || "Bài tập"}
              width={56}
              height={56}
              style={{ height: "auto" }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-black text-[#0F172A] font-heading tracking-tight leading-snug">
              {selectedMission?.title || "Chi tiết bài tập"}
            </h1>
            {selectedMission?.description && (
              <p className="text-xs sm:text-sm text-[#475569] mt-1 leading-relaxed max-w-3xl">
                {selectedMission.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0 lg:self-start">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap",
              isExpired
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-slate-50 text-slate-600 border-slate-200/90"
            )}
          >
            <Clock
              className={cn(
                "w-3.5 h-3.5 shrink-0",
                isExpired ? "text-rose-500" : "text-slate-400"
              )}
            />
            <span>
              Hạn nộp:{" "}
              {selectedMission
                ? formatDate(selectedMission.due_at, "HH:mm - dd/MM/yyyy")
                : "--"}
            </span>
            {isExpired && (
              <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-md bg-rose-100/80 text-rose-700 text-[10px] font-bold">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Đã quá hạn</span>
              </span>
            )}
          </div>

          {selectedMission && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-black shrink-0 whitespace-nowrap shadow-2xs">
              <Image
                src="/coin.webp"
                alt="Xu Heo Đất"
                width={15}
                height={15}
                style={{ height: "auto" }}
                className="w-3.5 select-none shrink-0"
              />
              <span>
                +{selectedMission.min_reward_coins}~
                {selectedMission.max_reward_coins} xu
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. 5 Thẻ KPI độc lập đồng bộ với các trang quản trị */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1: Tiến độ nộp bài */}
        <div className="bg-white p-4 xl:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Tiến độ nộp bài
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {submissionRate}%
            </span>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              ({submittedCount}/{totalStudents} em)
            </span>
          </div>
        </div>

        {/* KPI 2: Chờ duyệt */}
        <div className="bg-white p-4 xl:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Chờ duyệt
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-3xl font-heading font-extrabold tracking-tight tabular-nums",
                pendingCount > 0 ? "text-amber-600" : "text-[#0F172A]"
              )}
            >
              {pendingCount}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              bài nộp
            </span>
          </div>
        </div>

        {/* KPI 3: Đã duyệt */}
        <div className="bg-white p-4 xl:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Đã duyệt
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {approvedCount}
            </span>
            <span className="text-sm font-semibold text-slate-500">bài</span>
          </div>
        </div>

        {/* KPI 4: Nộp muộn */}
        <div className="bg-white p-4 xl:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Nộp muộn
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-3xl font-heading font-extrabold tracking-tight tabular-nums",
                lateCount > 0 ? "text-orange-600" : "text-[#0F172A]"
              )}
            >
              {lateCount}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              bài nộp
            </span>
          </div>
        </div>

        {/* KPI 5: Chưa làm */}
        <div className="bg-white p-4 xl:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left col-span-2 sm:col-span-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#475569]">
              Chưa làm
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-3xl font-heading font-extrabold tracking-tight tabular-nums",
                unsubmittedCount > 0 ? "text-rose-600" : "text-[#0F172A]"
              )}
            >
              {unsubmittedCount}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              học sinh
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
