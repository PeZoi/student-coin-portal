/**
 * Component Skeleton thuần UI cho Studio Duyệt bài tập
 * - Server Component tĩnh (không 'use client') chuẩn Quy tắc 9
 */
export function SubmissionsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-xl" />
          <div className="h-4 w-80 bg-slate-100 rounded-md mt-2" />
        </div>
        <div className="h-10 w-44 bg-slate-200 rounded-xl shrink-0" />
      </div>

      {/* 2. KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="h-8 w-16 bg-slate-200 rounded-lg" />
              <div className="h-4 w-12 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Toolbar Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-64 bg-slate-100 rounded-xl" />
          <div className="h-10 w-80 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-10 w-60 bg-slate-100 rounded-xl" />
      </div>

      {/* 4. Studio 3-Column Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 h-[680px] bg-white rounded-2xl border border-slate-200 p-3 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="lg:col-span-5 h-[680px] bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="lg:col-span-4 h-[680px] bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-40 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
