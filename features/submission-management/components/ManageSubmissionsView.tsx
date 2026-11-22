"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
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
import { SubmissionsToolbar } from "./SubmissionsToolbar";
import { SubmissionsQueueSidebar } from "./SubmissionsQueueSidebar";
import { SubmissionImageViewer } from "./SubmissionImageViewer";
import { SubmissionGradingPanel } from "./SubmissionGradingPanel";

interface ManageSubmissionsViewProps {
  initialSubmissions?: TeacherGradingSubmissionItem[];
  initialMissionId?: string;
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
  initialViewMode,
}: ManageSubmissionsViewProps) {
  return (
    <ManageSubmissionsProvider
      initialSubmissions={initialSubmissions}
      initialMissionId={initialMissionId}
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
    filteredSubmissions,
    statusFilter,
    setStatusFilter,
    handleResetFilters,
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
      {/* 1. Header Chi tiết bài tập: Nút quay lại, 4 KPI của bài này & Chuyển đổi View Mode */}
      <MissionDetailHeader />

      {/* 2. CHẾ ĐỘ XEM: Danh sách toàn bộ Học sinh (Student Roster) */}
      {viewMode === "roster" && <StudentRosterView key={selectedMissionId} />}

      {/* 3. CHẾ ĐỘ XEM: Studio Chấm bài 3 cột (Grading Studio Split-View) */}
      {viewMode === "studio" && (
        <div className="space-y-4">
          {/* Thanh công cụ lọc Tab trạng thái + Tìm tên học sinh */}
          <SubmissionsToolbar />

          {/* Không gian Studio 3 cột hoặc Empty State khi đã duyệt hết bài */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
                {statusFilter === SubmissionApprovalStatus.PENDING_APPROVAL
                  ? "Tuyệt vời! Bạn đã duyệt hết tất cả bài nộp đang chờ trong bài tập này"
                  : "Không tìm thấy bài nộp nào khớp với bộ lọc"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {statusFilter === SubmissionApprovalStatus.PENDING_APPROVAL
                  ? "Tất cả bài tập học sinh nộp lên đã được chấm điểm và thưởng xu Heo Đất đầy đủ."
                  : "Hãy thử đổi trạng thái lọc hoặc chọn bài tập khác để xem lịch sử bài nộp."}
              </p>

              <div className="pt-2 flex items-center justify-center gap-2">
                {statusFilter === SubmissionApprovalStatus.PENDING_APPROVAL ? (
                  <button
                    type="button"
                    onClick={() =>
                      setStatusFilter(SubmissionApprovalStatus.APPROVED)
                    }
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Xem các bài đã duyệt</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại bộ lọc</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Cột 1 (3/12): Danh sách học sinh nộp bài */}
              <div className="lg:col-span-3">
                <SubmissionsQueueSidebar />
              </div>

              {/* Cột 2 (5/12): Khung soi ảnh đa trang (1–5 ảnh, Zoom, Xoay 90°, Kéo rê) */}
              <div className="lg:col-span-5">
                <SubmissionImageViewer />
              </div>

              {/* Cột 3 (4/12): AI Bóc tách lỗi & Chấm xu Heo Đất */}
              <div className="lg:col-span-4">
                <SubmissionGradingPanel />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
