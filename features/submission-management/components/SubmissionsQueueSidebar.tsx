"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Images,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Clock,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { SubmissionApprovalStatus } from "@/constants";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";

/**
 * Cột 1 (Trái): Danh sách hàng đợi học sinh nộp bài
 * - Cho phép giáo viên chuyển nhanh giữa các học sinh mà không cần đóng/mở popup
 */
export function SubmissionsQueueSidebar() {
  const {
    filteredSubmissions,
    activeSubmission,
    activeIndex,
    hasPrevSubmission,
    hasNextSubmission,
    handleSelectSubmission,
    handlePrevSubmission,
    handleNextSubmission,
  } = useManageSubmissionsContext();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[740px] overflow-hidden">
      {/* 1. Header điều hướng nhanh Trước / Tiếp */}
      <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-2 shrink-0">
        <div>
          <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider block">
            Danh sách bài nộp
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {filteredSubmissions.length > 0
              ? `Đang xem học sinh ${activeIndex + 1} / ${filteredSubmissions.length}`
              : "Không có bài nộp"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevSubmission}
            disabled={!hasPrevSubmission}
            title="Học sinh trước"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextSubmission}
            disabled={!hasNextSubmission}
            title="Học sinh tiếp theo"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Danh sách cuộn dọc */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {filteredSubmissions.map((sub) => {
          const isSelected = activeSubmission?.id === sub.id;
          const photoCount = sub.proof_image_urls.length;

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleSelectSubmission(sub.id)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 border",
                isSelected
                  ? "bg-[#EAF2FF]/80 border-[#0A62D6]/40 shadow-2xs"
                  : "bg-white hover:bg-slate-50 border-transparent"
              )}
            >
              {/* Avatar học sinh */}
              <div className="relative shrink-0">
                {sub.student_avatar ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                    <Image
                      src={sub.student_avatar}
                      alt={sub.student_name}
                      width={40}
                      height={40}
                      style={{ height: "auto" }}
                      className="w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0A62D6] font-bold text-xs flex items-center justify-center">
                    {getInitials(sub.student_name)}
                  </div>
                )}

                {/* Chấm trạng thái góc dưới avatar */}
                <span
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5",
                    sub.approval_status === SubmissionApprovalStatus.APPROVED &&
                      "bg-emerald-500",
                    sub.approval_status ===
                      SubmissionApprovalStatus.PENDING_APPROVAL &&
                      "bg-amber-500",
                    sub.approval_status === SubmissionApprovalStatus.REJECTED &&
                      "bg-rose-500"
                  )}
                />
              </div>

              {/* Thông tin học sinh + bài tập */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={cn(
                      "text-xs sm:text-[13px] font-bold truncate",
                      isSelected ? "text-[#0A62D6]" : "text-[#0F172A]"
                    )}
                  >
                    {sub.student_name}
                  </span>

                  {sub.is_late && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200/80 shrink-0">
                      Trễ
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {sub.mission_title}
                </p>

                {/* Huy hiệu số lượng ảnh + Điểm AI */}
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                    <Images className="w-3 h-3 text-slate-500" />
                    <span>{photoCount} ảnh</span>
                  </span>

                  {!sub.readable ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Ảnh mờ</span>
                    </span>
                  ) : sub.ai_score !== null ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-[10px] font-bold">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>AI: {sub.ai_score.toFixed(1)}đ</span>
                    </span>
                  ) : null}

                  {sub.approval_status === SubmissionApprovalStatus.APPROVED && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 ml-auto">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>+{sub.final_coins ?? sub.ai_suggested_coins} xu</span>
                    </span>
                  )}

                  {sub.approval_status === SubmissionApprovalStatus.REJECTED && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 ml-auto">
                      <RotateCcw className="w-3 h-3" />
                      <span>Làm lại</span>
                    </span>
                  )}

                  {sub.approval_status ===
                    SubmissionApprovalStatus.PENDING_APPROVAL && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 ml-auto">
                      <Clock className="w-3 h-3" />
                      <span>Chờ duyệt</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
