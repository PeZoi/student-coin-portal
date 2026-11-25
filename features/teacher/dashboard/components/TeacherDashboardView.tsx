"use client";

import { useTeacherDashboard } from "../hooks/useTeacherDashboard";
import { CoinBreakdownWidget } from "./CoinBreakdownWidget";
import { PendingRewardsWidget } from "./PendingRewardsWidget";
import { RecentSubmissionsQueue } from "./RecentSubmissionsQueue";
import { StudentsAttentionWidget } from "./StudentsAttentionWidget";
import { TeacherDashboardHeader } from "./TeacherDashboardHeader";
import { TeacherDashboardKpis } from "./TeacherDashboardKpis";
import { TopStudentsMonthlyCard } from "./TopStudentsMonthlyCard";

/**
 * ==============================================================================
 * TEACHER DASHBOARD VIEW (BÀN LÀM VIỆC GIÁO VIÊN & QUẢN TRỊ)
 * ==============================================================================
 * Tinh gọn, hiện đại và tập trung hành động (Action-Oriented):
 * - Header tiêu đề phẳng đồng bộ toàn hệ thống.
 * - 4 Thẻ KPI thống kê số liệu tổng quan.
 * - Cột chính (2/3): Hàng đợi duyệt bài nộp + Học sinh cần nhắc nhở học tập.
 * - Cột phụ (1/3): Top 5 nhận xu tháng này + Quà chờ trao + Cơ cấu nguồn xu.
 * ==============================================================================
 */
export function TeacherDashboardView() {
  const {
    kpis,
    recentSubmissions,
    attentionStudents,
    topStudents,
    pendingRewards,
    handleHandoverReward,
    handleRejectReward,
    coinBreakdown,
  } = useTeacherDashboard();

  return (
    <div className="space-y-6">
      {/* 1. PAGE TITLE */}
      <TeacherDashboardHeader />

      {/* 2. STATS KPI CARDS (Đồng bộ với MissionsKpiCards) */}
      <TeacherDashboardKpis kpis={kpis} />

      {/* 3. MAIN BENTO GRID (2 CỘT CÂN ĐỐI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Cột trái (2 cols): Hàng đợi duyệt bài nộp & Học sinh cần nhắc nhở */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hàng đợi bài nộp cần duyệt */}
          <RecentSubmissionsQueue submissions={recentSubmissions} />

          {/* Học sinh chưa nộp bài sắp hết hạn hoặc bài bị trả về cần sửa */}
          <StudentsAttentionWidget items={attentionStudents} />
        </div>

        {/* Cột phải (1 col): Top 5 + Quà chờ trao + Cơ cấu nguồn xu & Quỹ thưởng */}
        <div className="space-y-6">
          {/* Cơ cấu nguồn xu & Quỹ quy đổi tháng này */}
          <CoinBreakdownWidget stats={coinBreakdown} />

          {/* Top 5 học sinh nhận nhiều xu nhất tháng */}
          <TopStudentsMonthlyCard topStudents={topStudents} />

          {/* Quà Heo Đất chờ trao tận tay tại lớp */}
          <PendingRewardsWidget
            rewards={pendingRewards}
            onHandoverReward={handleHandoverReward}
            onRejectReward={handleRejectReward}
          />
        </div>
      </div>
    </div>
  );
}
