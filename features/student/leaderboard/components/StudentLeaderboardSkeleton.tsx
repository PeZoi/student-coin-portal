import React from "react";

/**
 * Pure Server Skeleton cho trang Bảng xếp hạng học sinh (Suspense Fallback)
 * - Khớp 100% bố cục 1 hàng thanh công cụ đỉnh (Quay lại + Tabs tháng + Luật) và khung Game UI kính mờ
 */
export function StudentLeaderboardSkeleton() {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col justify-between items-center px-3 sm:px-6 lg:px-8 pt-2 pb-2.5 sm:pt-2.5 sm:pb-3.5 min-h-0 animate-pulse">
      <main className="relative z-10 w-full max-w-4xl h-full flex-1 min-h-0 flex flex-col items-center justify-between">
        {/* Thanh công cụ đỉnh: Quay lại (Trái) cùng hàng với cụm chuyển tháng & Luật (Phải) */}
        <div className="flex-shrink-0 mb-2 sm:mb-2.5 flex flex-wrap items-center justify-between gap-2 w-full pt-0.5">
          <div className="h-8 sm:h-9 w-24 sm:w-28 rounded-full bg-amber-300/60 flex-shrink-0" />

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2.5 flex-1">
            <div className="h-9 sm:h-10 w-60 sm:w-72 rounded-full bg-[#0B4899]/55 border border-sky-300/25" />
            <div className="h-8 sm:h-9 w-28 sm:w-32 rounded-full bg-[#0B4899]/55 border border-sky-300/25" />
          </div>
        </div>

        {/* Khung kính mờ lớn */}
        <div className="w-full flex-1 min-h-0 rounded-[24px] sm:rounded-[30px] p-2.5 sm:p-3.5 lg:p-4 bg-[#1868CE]/65 border-2 sm:border-4 border-sky-200/40 flex flex-col">
          {/* 3 Tab giả lập */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mb-2.5 sm:mb-3 flex-shrink-0">
            <div className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-sky-300/45 border-2 border-sky-200/40" />
            <div className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0B4899]/55 border-2 border-sky-300/20" />
            <div className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0B4899]/55 border-2 border-sky-300/20" />
          </div>

          {/* Cột danh sách trắng giả lập */}
          <div className="w-full flex-1 min-h-0 rounded-[20px] sm:rounded-[24px] bg-white/95 border-2 border-white overflow-hidden flex flex-col">
            <div className="h-[56px] sm:h-[62px] lg:h-[66px] bg-sky-400/70 w-full flex-shrink-0" />
            <div className="p-2.5 sm:p-3.5 space-y-2 flex-1 overflow-hidden">
              {/* Top 1, 2, 3 */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[60px] sm:h-[64px] rounded-xl sm:rounded-2xl bg-slate-100 w-full"
                />
              ))}
              {/* Đường nét đứt */}
              <div className="w-full border-t-2 border-dashed border-sky-200/80 my-2" />
              {/* Top 4, 5, 6 */}
              {[4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[52px] sm:h-[56px] rounded-xl sm:rounded-2xl bg-slate-100/80 w-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer giả lập */}
        <div className="h-4 w-64 sm:w-72 rounded-full bg-white/30 mt-2 flex-shrink-0" />
      </main>
    </div>
  );
}
