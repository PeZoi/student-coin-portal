"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";
import { TeacherGradingSubmissionItem } from "../types";
import {
  ManageSubmissionsProvider,
  useManageSubmissionsContext,
} from "../contexts/ManageSubmissionsContext";
import { SubmissionsHeader } from "./SubmissionsHeader";
import { SubmissionsKpiCards } from "./SubmissionsKpiCards";
import { SubmissionsToolbar } from "./SubmissionsToolbar";
import { SubmissionsQueueSidebar } from "./SubmissionsQueueSidebar";
import { SubmissionImageViewer } from "./SubmissionImageViewer";
import { SubmissionGradingPanel } from "./SubmissionGradingPanel";

interface ManageSubmissionsViewProps {
  initialSubmissions?: TeacherGradingSubmissionItem[];
  initialMissionId?: string;
}

/**
 * Giao diện gốc của Studio Duyệt bài tập (`/teacher/submissions`)
 * - Áp dụng Feature Context Pattern (Quy tắc 10)
 */
export function ManageSubmissionsView({
  initialSubmissions,
  initialMissionId,
}: ManageSubmissionsViewProps) {
  return (
    <ManageSubmissionsProvider
      initialSubmissions={initialSubmissions}
      initialMissionId={initialMissionId}
    >
      <ManageSubmissionsContent />
    </ManageSubmissionsProvider>
  );
}

function ManageSubmissionsContent() {
  const {
    filteredSubmissions,
    statusFilter,
    setStatusFilter,
    handleResetFilters,
  } = useManageSubmissionsContext();

  return (
    <div className="space-y-5">
      {/* 1. Header Trang */}
      <SubmissionsHeader />

      {/* 2. Thẻ Thống kê KPI */}
      <SubmissionsKpiCards />

      {/* 3. Thanh công cụ lọc Bài tập + Trạng thái + Tìm học sinh */}
      <SubmissionsToolbar />

      {/* 3. Không gian Studio 3 cột (Hoặc Empty State khi đã duyệt hết bài) */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
            {statusFilter === "pending_approval"
              ? "Tuyệt vời! Bạn đã duyệt hết tất cả bài nộp đang chờ"
              : "Không tìm thấy bài nộp nào khớp với bộ lọc"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {statusFilter === "pending_approval"
              ? "Tất cả bài tập học sinh nộp lên đã được chấm điểm và thưởng xu Heo Đất đầy đủ."
              : "Hãy thử đổi trạng thái lọc hoặc chọn bài tập khác để xem lịch sử bài nộp."}
          </p>

          <div className="pt-2 flex items-center justify-center gap-2">
            {statusFilter === "pending_approval" ? (
              <button
                type="button"
                onClick={() => setStatusFilter("approved")}
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
  );
}
