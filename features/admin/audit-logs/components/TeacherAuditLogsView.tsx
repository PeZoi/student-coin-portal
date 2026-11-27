"use client";

import { Pagination } from "@/components/ui/Pagination";
import { AUDIT_LOGS_PAGE_SIZE_OPTIONS } from "../constants";
import {
  AuditLogsProvider,
  useAuditLogsContext,
} from "../contexts/AuditLogsContext";
import { AuditLogsPagePayload } from "../types";
import { ActivityLogsTable } from "./ActivityLogsTable";
import { AuditLogsHeader } from "./AuditLogsHeader";
import { AuditLogsKpiCards } from "./AuditLogsKpiCards";
import { AuditLogsTableSkeleton } from "./AuditLogsSkeleton";
import { AuditLogsToolbar } from "./AuditLogsToolbar";
import { AuthLogsTable } from "./AuthLogsTable";

function AuditLogsContent() {
  const {
    activeTab,
    currentPage,
    setCurrentPage,
    pageSize,
    handlePageSizeChange,
    totalItems,
    totalPages,
    isTableLoading,
    isError,
    handleRefresh,
  } = useAuditLogsContext();

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Tiêu đề trang & Nút xuất báo cáo */}
      <AuditLogsHeader />

      {/* 2. 4 Thẻ KPI thống kê nhanh */}
      <AuditLogsKpiCards />

      {/* 3. Khung Tab + Bộ lọc + Bảng dữ liệu chuẩn + Phân trang */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <AuditLogsToolbar />

        {isTableLoading ? (
          <AuditLogsTableSkeleton rows={Math.min(pageSize, 10)} />
        ) : isError ? (
          <div className="py-12 px-4 text-center">
            <p className="text-sm font-bold text-rose-700">
              Không thể tải dữ liệu nhật ký an ninh lúc này.
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-3 h-9 px-4 rounded-xl bg-[#EAF2FF] hover:bg-[#DCEAFE] text-[#0A62D6] text-xs font-semibold transition-colors cursor-pointer"
            >
              Thử tải lại
            </button>
          </div>
        ) : activeTab === "auth" ? (
          <AuthLogsTable />
        ) : (
          <ActivityLogsTable />
        )}

        {totalItems > 0 && (
          <div className="border-t border-slate-100 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[...AUDIT_LOGS_PAGE_SIZE_OPTIONS]}
              itemLabel={activeTab === "auth" ? "lượt truy cập" : "thao tác"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface TeacherAuditLogsViewProps {
  initialData?: AuditLogsPagePayload;
}

/**
 * Giao diện chính trang Nhật ký an ninh (dành cho Quản trị viên)
 * - Đồng bộ 100% phong cách với Quản lý học sinh, Quản lý giáo viên và Cài đặt hệ thống
 */
export function TeacherAuditLogsView({
  initialData,
}: TeacherAuditLogsViewProps = {}) {
  return (
    <AuditLogsProvider initialData={initialData}>
      <AuditLogsContent />
    </AuditLogsProvider>
  );
}
