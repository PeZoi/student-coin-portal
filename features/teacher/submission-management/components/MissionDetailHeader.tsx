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
import { SUBMISSION_MEDIA_PATHS } from "../constants";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { MissionThumbnail } from "./shared/MissionThumbnail";
import { SubmissionKpiCard } from "./shared/SubmissionKpiCard";

/**
 * Header Không gian Chi tiết Bài tập (Level 2 Header)
 * - Tái sử dụng `MissionThumbnail` và `SubmissionKpiCard` (DRY)
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

      {/* 2. Thông tin Bài tập */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          <MissionThumbnail
            submissionType={selectedMission?.submission_type}
            alt={selectedMission?.title || "Bài tập"}
            size="lg"
          />

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
                src={SUBMISSION_MEDIA_PATHS.COIN_ICON}
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

      {/* 3. 5 Thẻ KPI độc lập */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <SubmissionKpiCard
          label="Tiến độ nộp bài"
          value={`${submissionRate}%`}
          unit={`(${submittedCount}/${totalStudents} em)`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconWrapperClassName="bg-[#EAF2FF] text-[#0A62D6]"
        />

        <SubmissionKpiCard
          label="Chờ duyệt"
          value={pendingCount}
          unit="bài nộp"
          icon={<FileCheck2 className="w-5 h-5" />}
          iconWrapperClassName="bg-amber-50 text-amber-600"
          valueClassName={
            pendingCount > 0 ? "text-amber-600" : "text-[#0F172A]"
          }
        />

        <SubmissionKpiCard
          label="Đã duyệt"
          value={approvedCount}
          unit="bài"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconWrapperClassName="bg-[#ECFDF3] text-[#15803D]"
        />

        <SubmissionKpiCard
          label="Nộp muộn"
          value={lateCount}
          unit="bài nộp"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconWrapperClassName="bg-orange-50 text-orange-600"
          valueClassName={lateCount > 0 ? "text-orange-600" : "text-[#0F172A]"}
        />

        <SubmissionKpiCard
          label="Chưa làm"
          value={unsubmittedCount}
          unit="học sinh"
          icon={<UserX className="w-5 h-5" />}
          iconWrapperClassName="bg-[#FFF1F2] text-[#E11D48]"
          valueClassName={
            unsubmittedCount > 0 ? "text-rose-600" : "text-[#0F172A]"
          }
          className="col-span-2 sm:col-span-1"
        />
      </div>
    </div>
  );
}
