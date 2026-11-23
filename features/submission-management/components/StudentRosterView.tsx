"use client";

import { SubmissionApprovalStatus } from "@/constants";
import { formatDate } from "@/lib/date";
import { cn, getInitials, normalizeText } from "@/lib/utils";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Image as ImageIcon,
  MessageSquareText,
  Phone,
  RotateCcw,
  Search,
  Sparkles,
  UserCheck,
  X
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { StudentRosterItem, SubmissionStatusFilter } from "../types";

function renderQuestionSummary(student: StudentRosterItem) {
  if (
    student.total_questions != null &&
    student.total_questions > 0 &&
    student.correct_count != null
  ) {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap tabular-nums font-semibold">
        <span className="inline-flex items-center gap-0.5 text-emerald-700">
          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{student.correct_count} đúng</span>
        </span>
        <span className="inline-flex items-center gap-0.5 text-rose-600">
          <X className="w-3 h-3 text-rose-500 shrink-0" />
          <span>
            {Math.max(0, student.total_questions - student.correct_count)} sai
          </span>
        </span>
      </span>
    );
  }

  if (student.ai_score !== null) {
    return (student.error_count ?? 0) === 0 ? (
      <span className="text-emerald-700 font-semibold whitespace-nowrap">
        Không lỗi
      </span>
    ) : (
      <span className="inline-flex items-center gap-0.5 text-rose-600 font-bold whitespace-nowrap">
        <X className="w-3 h-3 text-rose-500 shrink-0" />
        <span>{student.error_count} lỗi sai</span>
      </span>
    );
  }

  return (
    <span className="text-amber-700 font-semibold whitespace-nowrap">
      Ảnh mờ
    </span>
  );
}

/**
 * Chế độ xem Toàn bộ Học sinh trong Bài tập (Student Roster View)
 * - Thể hiện trực quan từng học sinh: đã nộp, chưa nộp, điểm AI, kết quả duyệt
 * - 1-Click "Chấm bài ngay" liên kết trực tiếp sang Studio Chấm Bài của học sinh đó
 */
export function StudentRosterView() {
  const {
    selectedMission,
    selectedMissionId,
    studentRoster,
    validAiPendingCount,
    handleBatchApproveValid,
  } = useManageSubmissionsContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatusFilter>("all");

  // Đếm số lượng học sinh theo từng trạng thái
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let unsubmitted = 0;

    for (const st of studentRoster) {
      if (st.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL) {
        pending += 1;
      } else if (st.approval_status === SubmissionApprovalStatus.APPROVED) {
        approved += 1;
      } else if (st.approval_status === SubmissionApprovalStatus.REJECTED) {
        rejected += 1;
      } else if (st.approval_status === "unsubmitted") {
        unsubmitted += 1;
      }
    }

    return {
      total: studentRoster.length,
      pending,
      approved,
      rejected,
      unsubmitted,
    };
  }, [studentRoster]);

  // Lọc danh sách học sinh
  const filteredRoster = useMemo(() => {
    const query = normalizeText(searchQuery);

    return studentRoster.filter((st) => {
      // 1. Lọc trạng thái
      if (statusFilter !== "all" && st.approval_status !== statusFilter) {
        return false;
      }

      // 2. Lọc tìm kiếm
      if (query) {
        const matchName = normalizeText(st.student_name).includes(query);
        const matchPhone = normalizeText(st.student_phone ?? "").includes(query);
        if (!matchName && !matchPhone) return false;
      }

      return true;
    });
  }, [studentRoster, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 1. Thanh Toolbar lọc, tìm kiếm học sinh & Duyệt nhanh bài hợp lệ */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Tabs Trạng thái */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Tất cả ({counts.total})
          </button>
          <button
            type="button"
            onClick={() =>
              setStatusFilter(SubmissionApprovalStatus.PENDING_APPROVAL)
            }
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1",
              statusFilter === SubmissionApprovalStatus.PENDING_APPROVAL
                ? "bg-white text-amber-800 shadow-2xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {counts.pending > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            )}
            Chờ duyệt ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(SubmissionApprovalStatus.APPROVED)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              statusFilter === SubmissionApprovalStatus.APPROVED
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Đã duyệt ({counts.approved})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(SubmissionApprovalStatus.REJECTED)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              statusFilter === SubmissionApprovalStatus.REJECTED
                ? "bg-white text-rose-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Cần sửa ({counts.rejected})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unsubmitted")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              statusFilter === "unsubmitted"
                ? "bg-white text-slate-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Chưa nộp ({counts.unsubmitted})
          </button>
        </div>

        {/* Cụm phải: Ô tìm kiếm + Nút Duyệt nhanh bài hợp lệ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 xl:flex-initial justify-end">
          <div className="relative flex-1 sm:w-64 xl:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên học sinh, SĐT..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {validAiPendingCount > 0 && (
            <button
              type="button"
              onClick={handleBatchApproveValid}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 whitespace-nowrap shrink-0"
            >
              <CheckCheck className="w-4 h-4 shrink-0" />
              <span>Duyệt nhanh bài hợp lệ ({validAiPendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Danh sách Học sinh (Cards Grid) */}
      {filteredRoster.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">
            Không có học sinh nào khớp với điều kiện lọc
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="text-xs text-[#0A62D6] font-bold underline cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredRoster.map((student) => {
            const isPending =
              student.approval_status ===
              SubmissionApprovalStatus.PENDING_APPROVAL;
            const isApproved =
              student.approval_status === SubmissionApprovalStatus.APPROVED;
            const isRejected =
              student.approval_status === SubmissionApprovalStatus.REJECTED;
            const isUnsubmitted = student.approval_status === "unsubmitted";

            return (
              <div
                key={student.id}
                className={cn(
                  "rounded-2xl border p-4 transition-all shadow-2xs flex flex-col justify-between gap-3",
                  isPending &&
                    "bg-amber-50/55 border-amber-200/90 hover:border-amber-300",
                  isApproved &&
                    "bg-emerald-50/45 border-emerald-200/90 hover:border-emerald-300",
                  isRejected &&
                    "bg-rose-50/35 border-rose-200/90 hover:border-rose-300",
                  isUnsubmitted &&
                    "bg-white border-slate-200/90 hover:border-slate-300"
                )}
              >
                {/* Header Thẻ Học Sinh */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      {student.student_avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                          <Image
                            src={student.student_avatar}
                            alt={student.student_name}
                            width={40}
                            height={40}
                            style={{ height: "auto" }}
                            className="w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0A62D6] font-bold text-xs flex items-center justify-center">
                          {getInitials(student.student_name)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-[#0F172A] truncate">
                        {student.student_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5 tabular-nums">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {student.student_phone || "--"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Badge Trạng thái */}
                  <div className="shrink-0">
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Chờ duyệt</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã duyệt</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-extrabold whitespace-nowrap">
                        <RotateCcw className="w-3 h-3 text-rose-600" />
                        <span>Cần sửa</span>
                      </span>
                    )}
                    {isUnsubmitted && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold whitespace-nowrap">
                        Chưa nộp
                      </span>
                    )}
                  </div>
                </div>

                {/* Thông tin Bài nộp (Không hiển thị ai_raw_response) */}
                {student.has_submitted ? (
                  <div
                    className={cn(
                      "rounded-xl p-2.5 border space-y-2 text-xs",
                      isPending && "bg-white/85 border-amber-200/60",
                      isApproved && "bg-white/85 border-emerald-200/60",
                      isRejected && "bg-white/85 border-rose-200/60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 text-slate-600">
                      <span className="flex items-center gap-1 text-[11px] whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {student.submitted_at
                            ? formatDate(student.submitted_at, "HH:mm - dd/MM")
                            : "--"}
                        </span>
                        {student.attempt_number > 1 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold">
                            Lần #{student.attempt_number}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700 text-[11px] whitespace-nowrap">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.proof_image_count} ảnh</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                      {isPending && (
                        <>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] whitespace-nowrap",
                              student.is_late
                                ? "text-orange-700 font-bold"
                                : "text-emerald-700 font-semibold"
                            )}
                          >
                            {student.is_late ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                            <span>
                              {student.is_late ? "Nộp muộn" : "Đúng hạn"}
                            </span>
                          </span>

                          {student.ai_suggested_coins != null &&
                          student.ai_suggested_coins > 0 ? (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 shrink-0 tabular-nums whitespace-nowrap"
                              title="Xu AI đề xuất"
                            >
                              <span>AI</span>
                              <Image
                                src="/coin.webp"
                                alt="Xu Heo Đất"
                                width={14}
                                height={14}
                                style={{ height: "auto" }}
                                className="w-3.5 select-none shrink-0"
                              />
                              <span className="font-extrabold text-amber-700">
                                +{student.ai_suggested_coins} xu
                              </span>
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[11px] whitespace-nowrap",
                                student.readable
                                  ? "text-slate-600 font-medium"
                                  : "text-amber-700 font-bold"
                              )}
                            >
                              {student.readable ? (
                                <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              )}
                              <span>
                                {student.readable ? "Ảnh rõ" : "Ảnh mờ"}
                              </span>
                            </span>
                          )}
                        </>
                      )}

                      {isApproved && (
                        <>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] whitespace-nowrap",
                              student.is_late
                                ? "text-orange-700 font-bold"
                                : "text-emerald-700 font-semibold"
                            )}
                          >
                            {student.is_late ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                            <span>
                              {student.is_late ? "Nộp muộn" : "Đúng hạn"}
                            </span>
                          </span>

                          {student.final_coins !== null && (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 shrink-0 tabular-nums whitespace-nowrap">
                              <Image
                                src="/coin.webp"
                                alt="Xu Heo Đất"
                                width={15}
                                height={15}
                                style={{ height: "auto" }}
                                className="w-3.5 select-none shrink-0"
                              />
                              <span>+{student.final_coins} xu</span>
                            </span>
                          )}
                        </>
                      )}

                      {isRejected && (
                        <>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MessageSquareText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <p
                              className="text-[11px] text-rose-700 truncate"
                              title={student.teacher_feedback || undefined}
                            >
                              {student.teacher_feedback ||
                                "Đã yêu cầu học sinh nộp lại bài"}
                            </p>
                          </div>

                          {student.is_late && (
                            <span className="text-[11px] font-bold text-orange-700 shrink-0 whitespace-nowrap">
                              Nộp muộn
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                        {student.ai_score !== null ? (
                          <span
                            className="inline-flex items-center gap-1 font-extrabold text-indigo-700 whitespace-nowrap tabular-nums"
                            title="Điểm AI chấm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{student.ai_score}/10</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 whitespace-nowrap">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Chưa chấm</span>
                          </span>
                        )}

                        {renderQuestionSummary(student)}
                      </div>
                    )}

                    {isApproved && (
                      <>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                          <span
                            className="inline-flex items-center gap-1 font-extrabold text-emerald-700 whitespace-nowrap tabular-nums"
                            title="Điểm giáo viên chốt"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              {(student.final_score ?? student.ai_score) !== null
                                ? `${student.final_score ?? student.ai_score}/10`
                                : "Đã chấm"}
                            </span>
                          </span>
                          {renderQuestionSummary(student)}
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                          <span
                            className="inline-flex items-center gap-1 min-w-0 font-medium text-slate-600"
                            title={`Người duyệt: ${student.reviewed_by_name || "Giáo viên"}`}
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              {student.reviewed_by_name || "Giáo viên"}
                            </span>
                          </span>
                          <span
                            className="inline-flex items-center gap-1 whitespace-nowrap tabular-nums shrink-0 text-slate-500"
                            title="Thời gian duyệt"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {student.reviewed_at
                                ? formatDate(student.reviewed_at, "HH:mm - dd/MM")
                                : "--"}
                            </span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl p-2.5 border border-slate-200/60 bg-slate-50/60 space-y-2 text-xs">
                    {/* Hàng 1: Hạn nộp & Trạng thái mở/hết hạn */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-[11px] whitespace-nowrap">
                        {selectedMission?.is_expired ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            selectedMission?.is_expired
                              ? "text-rose-600 font-semibold"
                              : "text-slate-600"
                          )}
                        >
                          {selectedMission
                            ? selectedMission.is_expired
                              ? "Đã quá hạn nộp"
                              : `Hạn: ${formatDate(selectedMission.due_at, "HH:mm - dd/MM")}`
                            : "Chưa có hạn nộp"}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap",
                          selectedMission?.is_expired
                            ? "text-rose-700 bg-rose-50 border-rose-200/80"
                            : "text-amber-700 bg-amber-50 border-amber-200/80"
                        )}
                      >
                        {selectedMission?.is_expired ? "Hết hạn" : "Đang mở"}
                      </span>
                    </div>

                    {/* Minh chứng bài nộp */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>Chưa gửi ảnh</span>
                      </span>
                      <span className="font-medium text-slate-400">0/1 lần nộp</span>
                    </div>
                  </div>
                )}

                {/* Footer Thao tác: Chấm bài ngay (nếu đã nộp) HOẶC Trạng thái chờ nộp */}
                {student.submission_id ? (
                  <div className="pt-1">
                    <Link
                      href={`/teacher/submissions/${selectedMissionId || "all"}/${student.student_id}`}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98",
                        isPending
                          ? "bg-[#0A62D6] hover:bg-[#0850B0] text-white"
                          : isApproved
                            ? "bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      )}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>
                        {isPending ? "Chấm bài em này ➜" : "Xem chi tiết bài làm"}
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="pt-1">
                    <div
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-2 h-9 px-3 rounded-xl text-xs select-none border transition-colors",
                        selectedMission?.is_expired
                          ? "bg-rose-50/50 border-rose-200/70 text-rose-600 font-semibold"
                          : "bg-slate-50 border-slate-200/70 text-slate-500 font-medium"
                      )}
                    >
                      {selectedMission?.is_expired ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>Chưa nộp (Đã hết hạn)</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                          <span>Đang chờ học sinh gửi bài</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
