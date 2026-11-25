"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Phone,
} from "lucide-react";
import { formatDate } from "@/lib/date";
import { AppRoutes } from "@/constants/routes";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { StudentAvatar } from "./shared/StudentAvatar";
import { SubmissionStatusBadge } from "./shared/SubmissionStatusBadge";

/**
 * Thanh Top Bar Studio: Nút quay lại danh sách học sinh, thông tin học sinh đang chấm,
 * badge trạng thái và nút chuyển nhanh "Chấm học sinh tiếp theo →"
 */
export function StudioTopBar() {
  const { selectedMissionId, activeSubmission, nextPendingSubmission } =
    useManageSubmissionsContext();

  if (!selectedMissionId) return null;

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={AppRoutes.TEACHER.SUBMISSION_DETAIL(selectedMissionId)}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Quay lại danh sách học sinh</span>
        </Link>

        {activeSubmission && (
          <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />
        )}

        {activeSubmission && (
          <div className="flex items-center gap-2.5 min-w-0">
            <StudentAvatar
              name={activeSubmission.student_name}
              avatarUrl={activeSubmission.student_avatar}
              size="sm"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm text-[#0F172A] truncate">
                  {activeSubmission.student_name}
                </h3>
                {activeSubmission.attempt_number > 1 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold shrink-0">
                    Lần nộp #{activeSubmission.attempt_number}
                  </span>
                )}
                {activeSubmission.is_late ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold shrink-0">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    Nộp muộn
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Đúng hạn
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 tabular-nums">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{activeSubmission.student_phone || "--"}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    {activeSubmission.proof_image_urls.length} ảnh bài làm
                  </span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    Nộp lúc:{" "}
                    {formatDate(activeSubmission.created_at, "HH:mm - dd/MM")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phía bên phải: Badge trạng thái + Nút chuyển nhanh học sinh tiếp theo */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {activeSubmission && (
          <SubmissionStatusBadge
            status={activeSubmission.approval_status}
            variant="studio"
            approvedCoins={
              activeSubmission.final_coins ?? activeSubmission.ai_suggested_coins
            }
          />
        )}

        {nextPendingSubmission && (
          <Link
            href={AppRoutes.TEACHER.STUDENT_GRADING(
              selectedMissionId,
              nextPendingSubmission.student_id
            )}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#EAF2FF] hover:bg-[#0A62D6] text-[#0A62D6] hover:text-white border border-blue-200 text-xs font-bold transition-colors whitespace-nowrap"
            title={`Chuyển sang chấm bài của ${nextPendingSubmission.student_name}`}
          >
            <span>Chấm học sinh tiếp theo</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}
