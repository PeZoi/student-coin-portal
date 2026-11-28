"use client";

import {
  LeaderboardProvider,
  useLeaderboardContext,
} from "../contexts/LeaderboardContext";
import { LeaderboardBoardTabs } from "./LeaderboardBoardTabs";
import { LeaderboardHeader } from "./LeaderboardHeader";
import { LeaderboardKpiCards } from "./LeaderboardKpiCards";
import { LeaderboardPodium } from "./LeaderboardPodium";
import { LeaderboardTable } from "./LeaderboardTable";
import { ProgressBoardLockedState } from "./ProgressBoardLockedState";
import { RankingFormulaModal } from "./RankingFormulaModal";

function LeaderboardContent() {
  const {
    isProgressBoardLocked,
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

      {/* 4. Nội dung Bảng xếp hạng hoặc trạng thái Chưa mở */}
      {isProgressBoardLocked ? (
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

/**
 * Giao diện chính trang Bảng xếp hạng thi đua (3 Bảng xếp hạng)
 * - Đồng bộ 100% hệ thống thiết kế Quản trị Giáo viên & chuẩn UI/UX Pro Max
 */
export function TeacherLeaderboardView() {
  return (
    <LeaderboardProvider>
      <LeaderboardContent />
    </LeaderboardProvider>
  );
}
