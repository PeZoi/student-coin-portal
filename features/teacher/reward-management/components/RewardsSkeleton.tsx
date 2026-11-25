import { ExchangeViewMode } from "../types";

/**
 * Skeleton cho 4 Thẻ KPI Thống Kê
 */
export function RewardsKpiSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            <div className="h-3 w-12 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton cho Danh sách dạng Bảng (Table View)
 */
export function RewardsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="hidden sm:block h-6 w-24 bg-slate-100 rounded-full" />
          <div className="space-y-1.5 text-right">
            <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
            <div className="h-3 w-16 bg-slate-100 rounded ml-auto" />
          </div>
          <div className="hidden md:block h-4 w-48 bg-slate-100 rounded" />
          <div className="h-6 w-24 bg-slate-100 rounded-full" />
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100" />
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton cho Danh sách dạng Thẻ (Grid View)
 */
export function RewardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs flex flex-col justify-between"
        >
          {/* Card Header */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
                <div className="space-y-1">
                  <div className="h-3 w-14 bg-slate-100 rounded" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-slate-200 rounded-full" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100" />
              <div className="w-16 h-7 rounded-lg bg-slate-200" />
              <div className="w-7 h-7 rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton linh hoạt cho Danh sách yêu cầu đổi quà theo chế độ xem (Bảng hoặc Thẻ)
 */
export function RewardsListSkeleton({
  viewMode = "table",
}: {
  viewMode?: ExchangeViewMode;
}) {
  return viewMode === "grid" ? (
    <RewardsGridSkeleton count={6} />
  ) : (
    <RewardsTableSkeleton rows={5} />
  );
}

/**
 * Pure Server Component Skeleton cho toàn trang Đổi quà Heo Đất (Suspense Fallback)
 * - Tuyệt đối không thêm 'use client' (Quy tắc 9 AGENTS.md)
 */
export function RewardsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-44 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="h-10 w-10 bg-slate-100 rounded-xl border border-slate-200" />
        </div>
      </div>

      {/* 2. 4 KPI Cards Skeleton */}
      <RewardsKpiSkeleton />

      {/* 3. Card Container: Toolbar + Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar Skeleton */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="h-9 w-36 bg-slate-100 rounded-xl" />
            <div className="h-9 w-32 bg-slate-100 rounded-xl" />
          </div>
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="h-9 w-64 bg-slate-100 rounded-xl" />
            <div className="h-9 w-20 bg-slate-100 rounded-xl" />
            <div className="h-9 w-9 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <RewardsTableSkeleton rows={5} />

        {/* Pagination Skeleton */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-100 rounded" />
          <div className="h-8 w-48 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
