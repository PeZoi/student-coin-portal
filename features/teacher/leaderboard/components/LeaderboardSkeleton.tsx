/**
 * Pure Server Skeleton UI cho trang Bảng xếp hạng (dùng cho <Suspense fallback>)
 * và nội dung bên trong khi đổi lớp trên Header hoặc chuyển tháng (0 JS overhead)
 */
export function LeaderboardBodySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Podium Top 3 Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch pt-2">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className={`rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden p-5 flex flex-col items-center gap-3 ${
              idx === 1 ? "md:-mt-3" : "md:mt-2"
            }`}
          >
            <div className="h-6 w-20 rounded-full bg-slate-200" />
            <div
              className={`rounded-full bg-slate-200 ${
                idx === 1 ? "w-20 h-20" : "w-16 h-16"
              }`}
            />
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-16 w-full rounded-xl bg-slate-100 mt-1" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="h-5 w-44 rounded bg-slate-200" />
          <div className="h-9 w-60 rounded-xl bg-slate-100" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="px-4 py-3.5 grid grid-cols-5 gap-4 items-center"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                <div className="h-4 w-28 rounded bg-slate-200" />
              </div>
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="h-6 w-24 rounded-full bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-200 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeaderboardPageSkeleton() {
  return (
    <div className="space-y-6 pb-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-60 rounded-xl bg-slate-200" />
          <div className="h-4 w-96 max-w-full rounded-lg bg-slate-100" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-60 rounded-xl bg-slate-200" />
          <div className="h-10 w-36 rounded-xl bg-slate-100" />
        </div>
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
            <div className="h-8 w-24 rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>

      {/* 3 Board Tabs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-2xl border border-[#E2E8F0] flex items-start gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-3 w-44 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      <LeaderboardBodySkeleton />
    </div>
  );
}
