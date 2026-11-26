/**
 * Pure Server Component Skeleton cho trang Tổng quan Giáo viên (Teacher Dashboard)
 * - Tuyệt đối không thêm 'use client' (Quy tắc 9 AGENTS.md)
 * - Tái sử dụng được cho cả Suspense Fallback (SSR) và trạng thái chuyển lớp trên Header (Client)
 */

export function DashboardKpisSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="h-8 w-16 bg-slate-200 rounded-lg" />
            <div className="h-4 w-14 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardBodySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-pulse">
      {/* Cột trái (2/3): Hàng đợi bài nộp & Học sinh cần nhắc nhở */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card 1: RecentSubmissionsQueue Skeleton */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-72 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-28 bg-slate-100 rounded" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-3 w-56 bg-slate-100 rounded" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                      <div className="h-4 w-16 bg-slate-200 rounded" />
                    </div>
                  </div>
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: StudentsAttentionWidget Skeleton */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-44 bg-slate-200 rounded" />
                <div className="h-3 w-64 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>

          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-44 bg-slate-200 rounded" />
                    <div className="h-3 w-52 bg-slate-100 rounded" />
                    <div className="h-3 w-28 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cột phải (1/3): Cơ cấu nguồn xu + Top 3 + Quà chờ duyệt */}
      <div className="space-y-6">
        {/* Card 3: CoinBreakdownWidget Skeleton */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-100 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-3 w-44 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 bg-slate-100 rounded" />
            <div className="h-5 w-24 bg-slate-200 rounded" />
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full" />
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-32 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
            <div className="h-14 rounded-xl bg-slate-100" />
            <div className="h-14 rounded-xl bg-slate-100" />
          </div>
        </div>

        {/* Card 4: TopStudentsMonthlyCard Skeleton */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-200" />
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-2.5 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-12 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        {/* Card 5: PendingRewardsWidget Skeleton */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-40 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-3 w-14 bg-slate-100 rounded" />
          </div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-7 w-14 bg-slate-200 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      {/* 1. Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded-md" />
      </div>

      {/* 2. 4 Thẻ KPI Skeleton */}
      <DashboardKpisSkeleton />

      {/* 3. Main Bento Grid Skeleton */}
      <DashboardBodySkeleton />
    </div>
  );
}
