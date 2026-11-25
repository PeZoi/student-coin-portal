"use client";

import dynamic from "next/dynamic";
import { Search, Plus, Trash2, School } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { TeacherMissionItem, MissionAvailableClass } from "../types";
import {
  ManageMissionsProvider,
  useManageMissionsContext,
} from "../contexts/ManageMissionsContext";
import { MissionsHeader } from "./MissionsHeader";
import { MissionsKpiCards } from "./MissionsKpiCards";
import { MissionsToolbar } from "./MissionsToolbar";
import { MissionsTable } from "./MissionsTable";
import { MissionsGridList } from "./MissionsGridList";
import { MissionsBatchBar } from "./MissionsBatchBar";

// Tách nhỏ Bundle Size qua dynamic imports
const MissionFormModal = dynamic(
  () => import("./modals/MissionFormModal").then((m) => m.MissionFormModal),
  { ssr: false }
);
const DeleteMissionModal = dynamic(
  () => import("./modals/DeleteMissionModal").then((m) => m.DeleteMissionModal),
  { ssr: false }
);
const PermanentDeleteMissionModal = dynamic(
  () =>
    import("./modals/PermanentDeleteMissionModal").then(
      (m) => m.PermanentDeleteMissionModal
    ),
  { ssr: false }
);
const MissionProgressModal = dynamic(
  () =>
    import("./modals/MissionProgressModal").then((m) => m.MissionProgressModal),
  { ssr: false }
);


interface ManageMissionsViewProps {
  initialMissions?: TeacherMissionItem[];
  initialClasses?: MissionAvailableClass[];
  userRole?: string;
  initialClassId?: string;
}

export function ManageMissionsView({
  initialMissions,
  initialClasses,
  userRole,
  initialClassId,
}: ManageMissionsViewProps) {
  return (
    <ManageMissionsProvider
      initialMissions={initialMissions}
      initialClasses={initialClasses}
      userRole={userRole}
      initialClassId={initialClassId}
    >
      <ManageMissionsContent />
    </ManageMissionsProvider>
  );
}

function ManageMissionsContent() {
  const {
    filteredMissions,
    viewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    statusFilter,
    handleResetFilter,
    handleOpenCreateMission,
    availableClasses,
    isAdmin,
    isLoading,
  } = useManageMissionsContext();

  const isTeacherWithNoClasses = !isAdmin && availableClasses.length === 0;

  return (
    <div className="space-y-5">
      {/* 1. Header Trang */}
      <MissionsHeader />

      {/* 2. Thẻ Thống kê KPI */}
      <MissionsKpiCards />

      {/* 3. Toolbar và Danh sách bài tập trong cùng một Card đồng bộ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <MissionsToolbar />
        <div className="border-b border-slate-200" />

        {isTeacherWithNoClasses ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <School className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Chưa được phân công lớp học
            </h3>
            <p className="text-sm text-[#475569] mt-1 max-w-md mx-auto">
              Tài khoản giáo viên của bạn hiện chưa được phân công phụ trách lớp học nào. Vui lòng liên hệ Quản trị viên để được phân lớp trước khi giao hoặc quản lý bài tập nhé.
            </p>
          </div>
        ) : isLoading ? (
          /* Skeleton nạp dữ liệu khi đang chuyển lớp trên Header */
          <div className="p-4 sm:p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0 gap-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                  <div className="space-y-2 flex-1 max-w-sm">
                    <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded-md" />
                  </div>
                </div>

                <div className="hidden md:block h-6 w-20 bg-slate-100 rounded-xl shrink-0" />
                <div className="hidden lg:block h-6 w-28 bg-slate-100 rounded-lg shrink-0" />
                <div className="h-6 w-24 bg-slate-100 rounded-full shrink-0" />
                <div className="h-9 w-28 bg-slate-100 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              {statusFilter === "deleted" ? (
                <Trash2 className="w-6 h-6 text-slate-400" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              {statusFilter === "deleted"
                ? "Thùng rác đang trống"
                : "Không tìm thấy bài tập nào phù hợp"}
            </h3>
            <p className="text-sm text-[#475569] mt-1 max-w-md mx-auto">
              {statusFilter === "deleted"
                ? "Hiện tại không có bài tập nào bị xóa trong thùng rác."
                : "Thử đổi từ khóa tìm kiếm hoặc giao một bài tập mới cho học sinh nhé."}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold transition-colors cursor-pointer"
              >
                {statusFilter === "deleted" ? "Về danh sách chính" : "Xóa bộ lọc"}
              </button>
              {statusFilter !== "deleted" && (
                <button
                  type="button"
                  onClick={handleOpenCreateMission}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Giao bài tập mới</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {viewMode === "table" ? (
              <>
                {/* Desktop: Bảng dữ liệu chi tiết */}
                <div className="hidden md:block">
                  <MissionsTable />
                </div>
                {/* Mobile: Danh sách thẻ trực quan */}
                <MissionsGridList mobileOnly />
              </>
            ) : (
              /* Chế độ xem Thẻ (Grid Cards) trên mọi thiết bị */
              <MissionsGridList />
            )}

            {/* Phân trang đồng bộ */}
            <div className="border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="bài tập"
              />
            </div>
          </>
        )}
      </div>

      {/* 4. Modal Tạo mới / Chỉnh sửa bài tập */}
      <MissionFormModal />

      {/* 5. Modal Xác nhận xóa mềm (Smart Hybrid Delete) */}
      <DeleteMissionModal />

      {/* 7. Modal Xác nhận xóa vĩnh viễn */}
      <PermanentDeleteMissionModal />

      {/* 8. Modal Danh sách tiến độ làm bài (Ai đã làm, ai chưa làm) */}
      <MissionProgressModal />

      {/* 9. Thanh tác vụ hàng loạt nổi (Floating Batch Action Bar) */}
      <MissionsBatchBar />
    </div>
  );
}
