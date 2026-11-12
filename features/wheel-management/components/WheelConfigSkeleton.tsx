export function WheelConfigSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-60 bg-slate-200 rounded-xl mb-2" />
          <div className="h-4 w-96 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* 2. KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs h-28 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 w-28 bg-slate-200 rounded-lg" />
            <div className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Analytics Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs h-80" />
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs h-80" />
      </div>

      {/* 4. Economy Settings Skeleton */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs h-18 flex items-center justify-between" />

      {/* 5. Slots Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs h-64 flex flex-col justify-between"
          >
            <div className="h-7 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl my-4" />
            <div className="h-8 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
