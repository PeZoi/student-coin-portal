"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Image as ImageIcon,
  MessageSquareText,
  Phone,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { SubmissionApprovalStatus } from "@/constants";
import { AppRoutes } from "@/constants/routes";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  SUBMISSION_GRADING_CONFIG,
  SUBMISSION_MEDIA_PATHS,
} from "../../constants";
import { MissionSubmissionSummary, StudentRosterItem } from "../../types";
import { StudentAvatar } from "../shared/StudentAvatar";
import { SubmissionStatusBadge } from "../shared/SubmissionStatusBadge";

interface StudentRosterCardProps {
  student: StudentRosterItem;
  missionId: string;
  selectedMission?: MissionSubmissionSummary;
}

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

  if (!student.readable) {
    return (
      <span className="text-[11px] font-bold text-amber-700 whitespace-nowrap">
        Ảnh mờ
      </span>
    );
  }

  if (student.error_count != null && student.error_count > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 whitespace-nowrap tabular-nums">
        <X className="w-3 h-3 text-rose-500 shrink-0" />
        <span>{student.error_count} lỗi sai</span>
      </span>
    );
  }

  return (
    <span className="text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
      Không lỗi
    </span>
  );
}

/**
 * Thẻ học sinh trong Danh sách Học sinh (Student Roster) — hỗ trợ đủ 4 trạng thái:
 * Chờ duyệt, Đã duyệt, Cần sửa, và Chưa nộp
 */
export function StudentRosterCard({
  student,
  missionId,
  selectedMission,
}: StudentRosterCardProps) {
  const isPending =
    student.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL;
  const isApproved =
    student.approval_status === SubmissionApprovalStatus.APPROVED;
  const isRejected =
    student.approval_status === SubmissionApprovalStatus.REJECTED;
  const isUnsubmitted = student.approval_status === "unsubmitted";

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all shadow-2xs flex flex-col justify-between gap-3",
        isPending &&
          "bg-amber-50/55 border-amber-200/90 hover:border-amber-300",
        isApproved &&
          "bg-emerald-50/45 border-emerald-200/90 hover:border-emerald-300",
        isRejected && "bg-rose-50/35 border-rose-200/90 hover:border-rose-300",
        isUnsubmitted && "bg-white border-slate-200/90 hover:border-slate-300"
      )}
    >
      {/* Header Thẻ Học Sinh */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <StudentAvatar
            name={student.student_name}
            avatarUrl={student.student_avatar}
            size="md"
          />

          <div className="min-w-0">
            <h4 className="font-extrabold text-sm text-[#0F172A] truncate">
              {student.student_name}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5 tabular-nums">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{student.student_phone || "--"}</span>
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <SubmissionStatusBadge
            status={student.approval_status}
            variant="compact"
          />
        </div>
      </div>

      {/* Nội dung Bài nộp hoặc Chưa nộp */}
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
                  <span>{student.is_late ? "Nộp muộn" : "Đúng hạn"}</span>
                </span>

                {student.ai_suggested_coins != null &&
                student.ai_suggested_coins > 0 ? (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 shrink-0 tabular-nums whitespace-nowrap"
                    title="Xu AI đề xuất"
                  >
                    <span>AI</span>
                    <Image
                      src={SUBMISSION_MEDIA_PATHS.COIN_ICON}
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
                    <span>{student.readable ? "Ảnh rõ" : "Ảnh mờ"}</span>
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
                  <span>{student.is_late ? "Nộp muộn" : "Đúng hạn"}</span>
                </span>

                {student.final_coins !== null && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 shrink-0 tabular-nums whitespace-nowrap">
                    <Image
                      src={SUBMISSION_MEDIA_PATHS.COIN_ICON}
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
                  title={`Người duyệt: ${student.reviewed_by_name || SUBMISSION_GRADING_CONFIG.DEFAULT_REVIEWER_NAME}`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {student.reviewed_by_name ||
                      SUBMISSION_GRADING_CONFIG.DEFAULT_REVIEWER_NAME}
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

          {/* Hàng 2: Minh chứng bài nộp */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>Chưa gửi ảnh</span>
            </span>
            <span className="font-medium text-slate-400">0/1 lần nộp</span>
          </div>
        </div>
      )}

      {/* Footer Thao tác */}
      {student.submission_id ? (
        <div className="pt-1">
          <Link
            href={AppRoutes.TEACHER.STUDENT_GRADING(
              missionId,
              student.student_id
            )}
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
}
