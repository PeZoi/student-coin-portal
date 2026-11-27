/**
 * Pure Server Skeleton UI cho trang Nhật ký an ninh (dùng trong <Suspense fallback>)
 * và bảng dữ liệu khi chuyển trang / lọc (không 'use client', 0 JavaScript overhead)
 */
export function AuditLogsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {/* Header row giả */}
      <div className="bg-slate-50/90 px-4 py-3 grid grid-cols-6 gap-4">
        <div className="h-3.5 w-20 rounded bg-slate-200" />
        <div className="h-3.5 w-28 rounded bg-slate-200" />
        <div className="h-3.5 w-16 rounded bg-slate-200" />
        <div className="h-3.5 w-20 rounded bg-slate-200" />
        <div className="h-3.5 w-24 rounded bg-slate-200" />
        <div className="h-3.5 w-24 rounded bg-slate-200 ml-auto" />
      </div>

      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="px-4 py-3.5 grid grid-cols-6 gap-4 items-center"
        >
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-slate-200" />
            <div className="h-3 w-16 rounded bg-slate-100" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-6 w-24 rounded-full bg-slate-200" />
          <div className="space-y-1.5 flex flex-col items-end">
            <div className="h-3.5 w-28 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuditLogsPageSkeleton() {
  return (
    <div className="space-y-6 pb-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-xl bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded-lg bg-slate-100" />
        </div>
        <div className="h-10 w-40 rounded-xl bg-slate-200" />
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Card Table Skeleton */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center gap-4">
          <div className="h-7 w-40 rounded-lg bg-slate-200" />
          <div className="h-7 w-44 rounded-lg bg-slate-100" />
        </div>
        <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-48 rounded-xl bg-slate-100" />
            <div className="h-10 w-44 rounded-xl bg-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-64 rounded-xl bg-slate-100" />
            <div className="h-10 w-10 rounded-xl bg-slate-100" />
          </div>
        </div>
        <AuditLogsTableSkeleton rows={6} />
      </div>
    </div>
  );
}
