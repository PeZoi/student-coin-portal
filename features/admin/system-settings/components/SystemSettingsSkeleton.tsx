/**
 * Pure Server Component Skeleton cho trang Cài đặt hệ thống
 * - Không chứa 'use client' (Quy tắc 9 AGENTS.md)
 * - Khớp 100% bố cục 2 cột: Header + Sidebar danh mục bên trái + Panel cấu hình bên phải
 */
export function SystemSettingsSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-slate-200 rounded-xl" />
          <div className="h-4 w-80 max-w-full bg-slate-100 rounded-lg" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="h-10 w-36 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* 2. Body 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
        {/* Sidebar Skeleton */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-2.5 space-y-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-slate-200 rounded" />
                  <div className="hidden lg:block h-2.5 w-36 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-2xl border border-[#E2E8F0] p-4 space-y-3">
            <div className="h-3 w-28 bg-slate-100 rounded" />
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Content Skeleton */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-slate-200 rounded" />
              <div className="h-3 w-72 max-w-full bg-slate-100 rounded" />
            </div>
          </div>

          <div className="px-6 py-5 divide-y divide-slate-100">
            {[1, 2].map((row) => (
              <div
                key={row}
                className="py-5 first:pt-1 last:pb-1 grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                <div className="md:col-span-5 space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-3/4 bg-slate-100 rounded" />
                </div>
                <div className="md:col-span-7 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="h-10 bg-slate-100 rounded-xl" />
                    <div className="h-10 bg-slate-100 rounded-xl" />
                  </div>
                  <div className="h-12 bg-slate-50 rounded-xl border border-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
