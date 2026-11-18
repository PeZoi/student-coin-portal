"use client";

import dynamic from "next/dynamic";
import { Pagination } from "@/components/ui/Pagination";
import { TeacherExchangeRequestItem } from "../types";
import { TeacherRewardsHeader } from "./TeacherRewardsHeader";
import { TeacherRewardsKpiCards } from "./TeacherRewardsKpiCards";
import { TeacherRewardsToolbar } from "./TeacherRewardsToolbar";
import { TeacherRewardsTable } from "./TeacherRewardsTable";
import { TeacherRewardsGrid } from "./TeacherRewardsGrid";
import { TeacherRewardRejectModal } from "./TeacherRewardRejectModal";
import {
  RewardsKpiSkeleton,
  RewardsListSkeleton,
} from "./RewardsSkeleton";
import {
  TeacherRewardsProvider,
  useTeacherRewardsContext,
} from "../contexts/TeacherRewardsContext";

const TeacherRewardDetailModal = dynamic(
  () =>
    import("./TeacherRewardDetailModal").then(
      (m) => m.TeacherRewardDetailModal
    ),
  { ssr: false }
);

export interface TeacherRewardsViewProps {
  initialRequests?: TeacherExchangeRequestItem[];
  initialMonth?: number;
  initialYear?: number;
  initialClassId?: string;
}

/**
 * Component View chính của trang Đổi quà Heo Đất (Góc giáo viên)
 * - Áp dụng Feature Context Pattern (Quy tắc 10 AGENTS.md): Tách biệt Provider và Declarative Content
 * - Triệt tiêu hoàn toàn hiện tượng Prop Drilling (Không còn destructure 35 biến để truyền xuống con)
 */
export function TeacherRewardsView({
  initialRequests,
  initialMonth = 11,
  initialYear = 2026,
  initialClassId,
}: TeacherRewardsViewProps) {
  return (
    <TeacherRewardsProvider
      initialRequests={initialRequests}
      initialMonth={initialMonth}
      initialYear={initialYear}
      initialClassId={initialClassId}
    >
      <TeacherRewardsContent />
    </TeacherRewardsProvider>
  );
}

function TeacherRewardsContent() {
  const {
    isLoading,
    viewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    selectedRequest,
    rejectModalRequest,
  } = useTeacherRewardsContext();

  return (
    <div className="space-y-5">
      {/* 1. Header Trang: Tự động truy xuất Context */}
      <TeacherRewardsHeader />

      {/* 2. Thẻ KPI Thống Kê: Hiển thị Skeleton khi đang nạp lại theo lớp hoặc kỳ đổi */}
      {isLoading ? <RewardsKpiSkeleton /> : <TeacherRewardsKpiCards />}

      {/* 3. Card Container: Toolbar, Table/Grid và Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar: Tìm kiếm, lọc trạng thái, lọc hình thức và chế độ xem */}
        <TeacherRewardsToolbar />

        {/* Danh sách yêu cầu: Hiển thị Skeleton khi đang tải, hoặc Render Bảng/Thẻ */}
        {isLoading ? (
          <RewardsListSkeleton viewMode={viewMode} />
        ) : viewMode === "table" ? (
          <TeacherRewardsTable />
        ) : (
          <TeacherRewardsGrid />
        )}

        {/* Phân trang Pagination: Ẩn khi đang loading */}
        {!isLoading && totalItems > 0 && (
          <div className="border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20]}
              itemLabel="yêu cầu"
            />
          </div>
        )}
      </div>

      {/* 4. Modal Chi Tiết Yêu Cầu */}
      <TeacherRewardDetailModal
        key={selectedRequest?.id ?? "detail-empty"}
      />

      {/* 5. Modal Xác Nhận Từ Chối & Hoàn Xu */}
      <TeacherRewardRejectModal
        key={rejectModalRequest?.id ?? "reject-empty"}
      />
    </div>
  );
}
