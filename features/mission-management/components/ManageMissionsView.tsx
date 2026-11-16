"use client";

import dynamic from "next/dynamic";
import { Search, Plus } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { TeacherMissionItem } from "../types";
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
  userRole?: string;
}

export function ManageMissionsView({
  initialMissions,
  userRole,
}: ManageMissionsViewProps) {
  return (
    <ManageMissionsProvider
      initialMissions={initialMissions}
      userRole={userRole}
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
    handleResetFilter,
    handleOpenCreateMission,
  } = useManageMissionsContext();

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

        {filteredMissions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Không tìm thấy bài tập nào phù hợp
            </h3>
            <p className="text-sm text-[#475569] mt-1 max-w-md mx-auto">
              Thử đổi từ khóa tìm kiếm hoặc giao một bài tập mới cho học sinh nhé.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Xóa bộ lọc
              </button>
              <button
                type="button"
                onClick={handleOpenCreateMission}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-[13px] font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Giao bài tập mới</span>
              </button>
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
