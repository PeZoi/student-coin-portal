/**
 * Skeleton cho 4 thẻ thống kê KPI
 */
export function StudentRosterKpiSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 w-28 bg-slate-100 rounded-md" />
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            <div className="h-4 w-12 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton cho các hàng trong bảng danh sách học sinh
 */
export function StudentRosterTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="p-4 sm:p-6 space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0 gap-4"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
            <div className="space-y-1.5 flex-1 max-w-xs">
              <div className="h-4 w-36 bg-slate-200 rounded-md" />
              <div className="h-3 w-24 bg-slate-100 rounded-md" />
            </div>
          </div>

          <div className="hidden sm:block h-6 w-24 bg-slate-100 rounded-full shrink-0" />
          <div className="hidden md:block h-6 w-24 bg-slate-100 rounded-full shrink-0" />
          <div className="hidden lg:block h-6 w-32 bg-slate-100 rounded-lg shrink-0" />
          <div className="h-6 w-20 bg-slate-100 rounded-full shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-100" />
            <div className="w-8 h-8 rounded-xl bg-slate-100" />
            <div className="w-8 h-8 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Component Skeleton thuần UI toàn trang Hồ sơ & Danh sách học sinh theo lớp
 * - Server Component tĩnh (không 'use client', không hook, không fetch mạng)
 * - Dùng làm Suspense fallback chuẩn theo Quy tắc 9 AGENTS.md
 */
export function StudentRosterSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-56 bg-slate-200 rounded-xl" />
          <div className="h-4 w-72 bg-slate-100 rounded-md mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-slate-100 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200 rounded-xl shrink-0" />
        </div>
      </div>

      {/* 2. KPI Cards Skeleton */}
      <StudentRosterKpiSkeleton />

      {/* 3. Toolbar & Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="h-10 w-44 bg-slate-100 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-full sm:w-64 bg-slate-100 rounded-xl" />
            <div className="h-10 w-10 bg-slate-100 rounded-xl shrink-0" />
          </div>
        </div>

        <div className="border-b border-slate-200" />

        {/* Table Rows Skeleton */}
        <StudentRosterTableSkeleton rows={6} />
      </div>
    </div>
  );
}
