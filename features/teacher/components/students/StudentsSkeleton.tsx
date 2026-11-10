/**
 * Component Skeleton thuần UI cho trang Quản lý học sinh
 * - Server Component tĩnh (không 'use client', không hook, không gọi API)
 * - Dùng làm Suspense fallback trong lúc Server stream dữ liệu xuống (Quy tắc 9)
 */
export function StudentsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 1. Header Trang Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-xl" />
          <div className="h-4 w-72 bg-slate-100 rounded-md mt-2" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl shrink-0" />
      </div>

      {/* 2. Thẻ Thống kê KPI Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-4 w-24 bg-slate-100 rounded-md" />
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <div className="h-8 w-14 bg-slate-200 rounded-lg" />
              <div className="h-4 w-12 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Toolbar & Danh sách Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar Skeleton */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-slate-200 rounded-xl" />
            <div className="h-9 w-32 bg-slate-100 rounded-xl" />
            <div className="h-9 w-28 bg-slate-100 rounded-xl" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-10 w-44 bg-slate-100 rounded-xl" />
            <div className="h-10 w-72 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="border-t border-slate-200 p-4 sm:p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between gap-4 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-200 rounded-md" />
                  <div className="h-3 w-24 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-lg hidden sm:block" />
              <div className="h-6 w-28 bg-slate-100 rounded-lg hidden md:block" />
              <div className="h-6 w-24 bg-slate-100 rounded-lg hidden lg:block" />
              <div className="h-9 w-28 bg-slate-100 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

