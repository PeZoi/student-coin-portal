"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { AppRoutes } from "@/constants/routes";
import {
  ManageSubmissionsProvider,
  useManageSubmissionsContext,
} from "../contexts/ManageSubmissionsContext";
import { UseManageSubmissionsParams } from "../hooks/useManageSubmissions";
import { MissionsOverviewView } from "./MissionsOverviewView";
import { MissionDetailHeader } from "./MissionDetailHeader";
import { StudentRosterView } from "./StudentRosterView";
import { StudioTopBar } from "./StudioTopBar";
import { SubmissionImageViewer } from "./SubmissionImageViewer";
import { SubmissionGradingPanel } from "./SubmissionGradingPanel";
import {
  SubmissionDetailSkeleton,
  SubmissionStudioSkeleton,
} from "./SubmissionsSkeleton";

/**
 * Giao diện gốc của Không Gian Duyệt Bài Tập (`/teacher/submissions`)
 * - Kiến trúc 2 tầng (Level 1: Assignment Hub ↔ Level 2: Chi tiết Roster & Studio chấm bài)
 * - Feature Context Pattern (Quy tắc 10 AGENTS.md)
 */
export function ManageSubmissionsView(props: UseManageSubmissionsParams) {
  return (
    <ManageSubmissionsProvider
      key={`${props.initialMissionId ?? "overview"}-${props.initialStudentId ?? "roster"}`}
      {...props}
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
    isLoadingDetail,
  } = useManageSubmissionsContext();

  // LEVEL 1: Danh sách tổng quan các bài tập cần duyệt
  if (!selectedMissionId) {
    return <MissionsOverviewView />;
  }

  // Đang tải chi tiết khi chuyển lớp ở Client
  if (isLoadingDetail && !selectedMission) {
    return viewMode === "studio" ? (
      <SubmissionStudioSkeleton />
    ) : (
      <SubmissionDetailSkeleton />
    );
  }

  if (!selectedMission) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
          Không tìm thấy bài tập
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Bài tập bạn đang tìm không tồn tại hoặc không thuộc lớp học đang chọn.
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

  // LEVEL 2: Chi tiết bài tập (Header + Roster hoặc Studio 2 cột)
  return (
    <div className="space-y-5">
      <MissionDetailHeader />

      {viewMode === "roster" && <StudentRosterView key={selectedMissionId} />}

      {viewMode === "studio" && (
        <div className="space-y-4">
          <StudioTopBar />

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
              <div className="lg:col-span-7">
                <SubmissionImageViewer />
              </div>
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
