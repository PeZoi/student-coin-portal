"use client";

import {
  LeaderboardProvider,
  useLeaderboardContext,
} from "../contexts/LeaderboardContext";
import { TeacherLeaderboardApiPayload } from "../types";
import { LeaderboardBoardTabs } from "./LeaderboardBoardTabs";
import { LeaderboardHeader } from "./LeaderboardHeader";
import { LeaderboardKpiCards } from "./LeaderboardKpiCards";
import { LeaderboardPodium } from "./LeaderboardPodium";
import { LeaderboardBodySkeleton } from "./LeaderboardSkeleton";
import { LeaderboardTable } from "./LeaderboardTable";
import { ProgressBoardLockedState } from "./ProgressBoardLockedState";
import { RankingFormulaModal } from "./RankingFormulaModal";

function LeaderboardContent() {
  const {
    isProgressBoardLocked,
    isBoardLoading,
    isError,
    handleRefresh,
    isFormulaModalOpen,
    setIsFormulaModalOpen,
  } = useLeaderboardContext();

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Header trang & Chọn tháng + Nút xem công thức */}
      <LeaderboardHeader />

      {/* 2. 4 Thẻ KPI tổng quan */}
      <LeaderboardKpiCards />

      {/* 3. Thanh chọn 3 Bảng xếp hạng */}
      <LeaderboardBoardTabs />

      {/* 4. Nội dung Bảng xếp hạng / Skeleton / Trạng thái Chưa mở */}
      {isBoardLoading ? (
        <LeaderboardBodySkeleton />
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs py-12 px-4 text-center">
          <p className="text-sm font-bold text-rose-700">
            Không thể tải dữ liệu bảng xếp hạng lúc này.
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-3 h-9 px-4 rounded-xl bg-[#EAF2FF] hover:bg-[#DCEAFE] text-[#0A62D6] text-xs font-semibold transition-colors cursor-pointer"
          >
            Thử tải lại
          </button>
        </div>
      ) : isProgressBoardLocked ? (
        <ProgressBoardLockedState />
      ) : (
        <div className="space-y-6">
          <LeaderboardPodium />
          <LeaderboardTable />
        </div>
      )}

      {/* 5. Modal giải thích quy tắc chia nhóm & công thức */}
      <RankingFormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />
    </div>
  );
}

interface TeacherLeaderboardViewProps {
  initialData?: TeacherLeaderboardApiPayload;
  initialClassId?: string;
}

/**
 * Giao diện chính trang Bảng xếp hạng thi đua (3 Bảng xếp hạng)
 * - Tự động đồng bộ theo lớp học đang chọn trên Header Workspace
 * - Kết hợp SSR initialData + SWR Cache 2 tầng
 */
export function TeacherLeaderboardView({
  initialData,
  initialClassId,
}: TeacherLeaderboardViewProps = {}) {
  return (
    <LeaderboardProvider
      initialData={initialData}
      initialClassId={initialClassId}
    >
      <LeaderboardContent />
    </LeaderboardProvider>
  );
}
