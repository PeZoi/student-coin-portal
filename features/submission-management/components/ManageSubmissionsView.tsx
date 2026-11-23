"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Phone,
  RotateCcw,
} from "lucide-react";
import { formatDate } from "@/lib/date";
import { getInitials } from "@/lib/utils";
import { SubmissionApprovalStatus } from "@/constants";
import { AppRoutes } from "@/constants/routes";
import {
  TeacherGradingSubmissionItem,
  MissionDetailViewMode,
} from "../types";
import {
  ManageSubmissionsProvider,
  useManageSubmissionsContext,
} from "../contexts/ManageSubmissionsContext";
import { MissionsOverviewView } from "./MissionsOverviewView";
import { MissionDetailHeader } from "./MissionDetailHeader";
import { StudentRosterView } from "./StudentRosterView";
import { SubmissionImageViewer } from "./SubmissionImageViewer";
import { SubmissionGradingPanel } from "./SubmissionGradingPanel";

interface ManageSubmissionsViewProps {
  initialSubmissions?: TeacherGradingSubmissionItem[];
  initialMissionId?: string;
  initialStudentId?: string;
  initialViewMode?: MissionDetailViewMode;
}

/**
 * Giao diện gốc của Không Gian Duyệt Bài Tập (`/teacher/submissions`)
 * - Áp dụng kiến trúc 2 tầng (Level 1: Assignment Hub ↔ Level 2: Chi tiết & Chấm bài)
 * - Feature Context Pattern (Quy tắc 10)
 */
export function ManageSubmissionsView({
  initialSubmissions,
  initialMissionId,
  initialStudentId,
  initialViewMode,
}: ManageSubmissionsViewProps) {
  return (
    <ManageSubmissionsProvider
      key={`${initialMissionId ?? "all"}-${initialStudentId ?? "roster"}`}
      initialSubmissions={initialSubmissions}
      initialMissionId={initialMissionId}
      initialStudentId={initialStudentId}
      initialViewMode={initialViewMode}
    >
      <ManageSubmissionsContent />
    </ManageSubmissionsProvider>
  );
}

function ManageSubmissionsContent() {
  const {
    selectedMission,
    selectedMissionId,
    viewMode,
    activeSubmission,
  } = useManageSubmissionsContext();

  // =========================================================================
  // LEVEL 1: Khi chưa chọn bài tập nào -> Hiện Danh sách tổng hợp các Bài tập
  // =========================================================================
  if (!selectedMissionId) {
    return <MissionsOverviewView />;
  }

  if (selectedMissionId !== "all" && !selectedMission) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
          Không tìm thấy bài tập
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Bài tập bạn đang tìm không tồn tại hoặc đã bị gỡ khỏi danh sách duyệt bài.
        </p>
        <div className="pt-2">
          <Link
            href={AppRoutes.TEACHER.SUBMISSIONS}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách bài tập</span>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LEVEL 2: Đã chọn một Bài tập -> Không gian Chi tiết Bài tập & Chấm Điểm
  // =========================================================================
  return (
    <div className="space-y-5">
      {/* 1. Header Chi tiết bài tập: Nút quay lại, 5 KPI của bài này */}
      <MissionDetailHeader />

      {/* 2. CHẾ ĐỘ XEM: Danh sách toàn bộ Học sinh (Student Roster) */}
      {viewMode === "roster" && <StudentRosterView key={selectedMissionId} />}

      {/* 3. CHẾ ĐỘ XEM: Studio Chấm bài tập trung của học sinh (Không có danh sách học sinh bên cạnh) */}
      {viewMode === "studio" && (
        <div className="space-y-4">
          {/* Top Bar Studio: Nút quay lại danh sách học sinh + Thông tin học sinh đang chấm */}
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
                  {activeSubmission.student_avatar ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <Image
                        src={activeSubmission.student_avatar}
                        alt={activeSubmission.student_name}
                        width={36}
                        height={36}
                        style={{ height: "auto" }}
                        className="w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0A62D6] font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(activeSubmission.student_name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
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
                          {formatDate(
                            activeSubmission.created_at,
                            "HH:mm - dd/MM"
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Phía bên phải: Badge trạng thái duyệt */}
            {activeSubmission && (
              <div className="flex items-center gap-2 shrink-0">
                {activeSubmission.approval_status ===
                SubmissionApprovalStatus.APPROVED ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Đã duyệt (+
                      {activeSubmission.final_coins ??
                        activeSubmission.ai_suggested_coins}{" "}
                      xu)
                    </span>
                  </span>
                ) : activeSubmission.approval_status ===
                  SubmissionApprovalStatus.REJECTED ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-extrabold">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>Yêu cầu làm lại</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Đang chờ giáo viên duyệt</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Không gian Studio 2 cột: Ảnh bài làm (7/12) & AI + Form cô giáo (5/12) */}
          {!activeSubmission ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
                Không tìm thấy bài nộp của học sinh này
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Học sinh chưa nộp bài hoặc mã bài nộp không hợp lệ. Vui lòng quay
                lại danh sách để chọn học sinh khác.
              </p>
              <div className="pt-2">
                <Link
                  href={AppRoutes.TEACHER.SUBMISSION_DETAIL(selectedMissionId)}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại danh sách học sinh</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Cột 1 (7/12): Khung soi ảnh bài làm của học sinh */}
              <div className="lg:col-span-7">
                <SubmissionImageViewer />
              </div>

              {/* Cột 2 (5/12): AI Bóc tách lỗi & Chấm xu Heo Đất & Form dành cho cô giáo */}
              <div className="lg:col-span-5">
                <SubmissionGradingPanel />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
