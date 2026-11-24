/**
 * Component Skeleton thuần UI cho màn hình Tổng quan Duyệt bài tập (`/teacher/submissions`)
 * - Server Component tĩnh (không 'use client', không hook, không gọi API)
 * - Khớp 100% bố cục `MissionsOverviewView` + lưới thẻ `MissionOverviewCard` (Quy tắc 9)
 */
export function SubmissionsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="h-8 sm:h-9 w-48 bg-slate-200 rounded-xl" />
          <div className="h-4 w-full max-w-xl bg-slate-100 rounded-md mt-2" />
        </div>
      </div>

      {/* 2. 4 Thẻ KPI Toàn hệ thống */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-4 w-28 bg-slate-100 rounded-md" />
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="h-8 w-14 bg-slate-200 rounded-lg" />
              <div className="h-4 w-16 bg-slate-100 rounded-md" />
              {i === 2 && (
                <div className="ml-auto h-5 w-16 bg-slate-100 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Lưới Thẻ Bài Tập (Khớp cấu trúc MissionOverviewCard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        {[1, 2, 3, 4, 5, 6].map((card) => (
          <div
            key={card}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between overflow-hidden"
          >
            {/* Header Thẻ: Icon + Tiêu đề + Hạn nộp + Phần thưởng xu */}
            <div className="p-5 pb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-slate-200/70 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-full bg-slate-200 rounded-md" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="h-3.5 w-36 bg-slate-100 rounded-md" />
                <div className="h-6 w-20 bg-slate-100 rounded-lg shrink-0" />
              </div>
            </div>

            {/* Thân Thẻ: Tiến độ nộp bài & 4 Pills thống kê */}
            <div className="px-5 py-4 bg-slate-50/70 border-y border-slate-100 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-3.5 w-44 bg-slate-200/80 rounded-md" />
                  <div className="h-3.5 w-9 bg-slate-200/80 rounded-md" />
                </div>
                <div className="h-2.5 w-full bg-slate-200 rounded-full" />
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4].map((pill) => (
                  <div
                    key={pill}
                    className="px-1.5 sm:px-2 py-2 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1.5"
                  >
                    <div className="h-3 w-11 bg-slate-100 rounded" />
                    <div className="h-3.5 w-9 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Thẻ: Nút Chấm bài */}
            <div className="p-4 bg-white flex items-center justify-end">
              <div className="h-8 w-36 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Component Skeleton thuần UI cho trang Chi tiết Bài tập & Danh sách Học sinh (`/teacher/submissions/[id]`)
 * - Server Component tĩnh (không 'use client', không hook, không gọi API)
 * - Khớp bố cục `MissionDetailHeader` mới + `StudentRosterView`
 */
export function SubmissionDetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 1. Nút Back gọn trên cùng */}
      <div>
        <div className="h-8 w-48 bg-slate-200/80 rounded-xl" />
      </div>

      {/* 2. Thông tin Bài tập: Icon + Tiêu đề/Mô tả & Hạn nộp/Xu bên phải */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 border border-slate-200/70 shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-6 sm:h-7 w-full max-w-lg bg-slate-200 rounded-xl" />
            <div className="h-4 w-full max-w-2xl bg-slate-100 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 lg:self-start">
          <div className="h-8 w-44 bg-slate-100 rounded-xl" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* 3. 5 Thẻ KPI độc lập */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((kpi) => (
          <div
            key={kpi}
            className="bg-white p-4 xl:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-4 w-24 bg-slate-100 rounded-md" />
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="h-8 w-14 bg-slate-200 rounded-lg" />
              <div className="h-4 w-16 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Toolbar Lọc trạng thái, Tìm kiếm & Duyệt nhanh */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="h-10 w-full xl:w-96 bg-slate-100 rounded-xl" />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="h-10 w-full sm:w-56 bg-slate-100 rounded-xl" />
          <div className="h-10 w-full sm:w-44 bg-slate-200/80 rounded-xl shrink-0" />
        </div>
      </div>

      {/* 5. Lưới Thẻ Danh sách Học sinh (4 cột trên màn hình lớn) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((studentCard) => (
          <div
            key={studentCard}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-4 w-24 bg-slate-200 rounded-md" />
                  <div className="h-3 w-20 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="h-5 w-16 bg-slate-100 rounded-full shrink-0" />
            </div>

            <div className="h-16 rounded-xl bg-slate-50 border border-slate-100" />

            <div className="pt-1">
              <div className="h-9 w-full bg-slate-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Component Skeleton thuần UI cho Studio Chấm Bài Học Sinh (`/teacher/submissions/[id]/[studentId]`)
 * - Server Component tĩnh (không 'use client', không hook, không gọi API)
 * - Khớp 100% bố cục Header + 5 KPI + TopBar Studio + 2 cột (Ảnh 7/12 & AI/Form 5/12)
 */
export function SubmissionStudioSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 1. Nút Back */}
      <div>
        <div className="h-8 w-48 bg-slate-200/80 rounded-xl" />
      </div>

      {/* 2. Thông tin Bài tập */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-6 sm:h-7 w-full max-w-lg bg-slate-200 rounded-xl" />
            <div className="h-4 w-full max-w-2xl bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-44 bg-slate-100 rounded-xl" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* 3. 5 Thẻ KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((kpi) => (
          <div
            key={kpi}
            className="bg-white p-4 xl:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-4 w-24 bg-slate-100 rounded-md" />
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="h-8 w-14 bg-slate-200 rounded-lg" />
              <div className="h-4 w-16 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Studio Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-48 bg-slate-100 rounded-xl" />
          <div className="w-9 h-9 rounded-full bg-slate-100" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-52 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-8 w-44 bg-slate-100 rounded-full" />
      </div>

      {/* 5. Studio 2 cột: Ảnh bài làm (7/12) & AI + Form cô giáo (5/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 h-[740px] rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
          <div className="h-10 w-full bg-slate-800 rounded-xl" />
          <div className="flex-1 my-4 bg-slate-800/60 rounded-xl" />
          <div className="h-12 w-full bg-slate-800 rounded-xl" />
        </div>
        <div className="lg:col-span-5 h-[740px] rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between gap-4">
          <div className="h-10 w-full bg-slate-100 rounded-xl" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((m) => (
              <div key={m} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="h-28 w-full bg-slate-50 rounded-xl border border-slate-100" />
          <div className="h-40 w-full bg-amber-50/50 rounded-2xl border border-amber-100" />
          <div className="h-24 w-full bg-slate-50 rounded-xl" />
          <div className="h-10 w-full bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
