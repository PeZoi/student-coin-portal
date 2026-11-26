"use client";

import {
  TeacherDashboardProvider,
  useTeacherDashboardContext,
} from "../contexts/TeacherDashboardContext";
import { TeacherDashboardPayload } from "../types";
import { CoinBreakdownWidget } from "./CoinBreakdownWidget";
import { PendingRewardsWidget } from "./PendingRewardsWidget";
import { RecentSubmissionsQueue } from "./RecentSubmissionsQueue";
import { StudentsAttentionWidget } from "./StudentsAttentionWidget";
import { TeacherDashboardHeader } from "./TeacherDashboardHeader";
import { TeacherDashboardKpis } from "./TeacherDashboardKpis";
import {
  DashboardBodySkeleton,
  DashboardKpisSkeleton,
} from "./TeacherDashboardSkeleton";
import { TopStudentsMonthlyCard } from "./TopStudentsMonthlyCard";

export interface TeacherDashboardViewProps {
  initialData?: TeacherDashboardPayload;
  initialClassId?: string;
}

function TeacherDashboardContent() {
  const { isLoading } = useTeacherDashboardContext();

  return (
    <div className="space-y-6">
      {/* 1. PAGE TITLE */}
      <TeacherDashboardHeader />

      {isLoading ? (
        <>
          <DashboardKpisSkeleton />
          <DashboardBodySkeleton />
        </>
      ) : (
        <>
          {/* 2. STATS KPI CARDS */}
          <TeacherDashboardKpis />

          {/* 3. MAIN BENTO GRID (2 CỘT CÂN ĐỐI) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Cột trái (2 cols): Hàng đợi duyệt bài nộp & Học sinh cần nhắc nhở */}
            <div className="lg:col-span-2 space-y-6">
              <RecentSubmissionsQueue />
              <StudentsAttentionWidget />
            </div>

            {/* Cột phải (1 col): Cơ cấu nguồn xu + Top 3 + Quà chờ duyệt */}
            <div className="space-y-6">
              <CoinBreakdownWidget />
              <TopStudentsMonthlyCard />
              <PendingRewardsWidget />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * ==============================================================================
 * TEACHER DASHBOARD VIEW (BÀN LÀM VIỆC GIÁO VIÊN & QUẢN TRỊ)
 * - Áp dụng Feature Context Pattern (Quy tắc 10 AGENTS.md): 0 dòng Prop Drilling
 * - Nhận initialData từ Server Component để render tức thì 0ms
 * - Tự động hiển thị Skeleton mượt mà khi chuyển lớp học trên Header
 * ==============================================================================
 */
export function TeacherDashboardView({
  initialData,
  initialClassId,
}: TeacherDashboardViewProps) {
  return (
    <TeacherDashboardProvider
      initialData={initialData}
      initialClassId={initialClassId}
    >
      <TeacherDashboardContent />
    </TeacherDashboardProvider>
  );
}
