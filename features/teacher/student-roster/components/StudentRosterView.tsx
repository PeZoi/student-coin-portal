"use client";

import dynamic from "next/dynamic";
import { School } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import { AuthSecurityConfig } from "@/types/systemConfig";
import { TeacherRosterStudent } from "../types";
import { ROSTER_PAGE_SIZE_OPTIONS } from "../constants";
import {
  StudentRosterProvider,
  useStudentRosterContext,
} from "../contexts/StudentRosterContext";
import { StudentRosterHeader } from "./StudentRosterHeader";
import { StudentRosterKpiCards } from "./StudentRosterKpiCards";
import { StudentRosterToolbar } from "./StudentRosterToolbar";
import { StudentRosterTable } from "./StudentRosterTable";
import { StudentRosterBatchBar } from "./StudentRosterBatchBar";
import { StudentRosterTableSkeleton } from "./StudentRosterSkeleton";

// Tách nhỏ Bundle Size qua dynamic imports (Tối ưu tốc độ tải trang ban đầu)
const StudentExchangeGiftsModal = dynamic(
  () =>
    import("./modals/StudentExchangeGiftsModal").then(
      (m) => m.StudentExchangeGiftsModal
    ),
  { ssr: false }
);

// Tái sử dụng modal giao dịch xu Heo Đất từ features/student-management (Quy tắc 1 DRY)
const StudentCoinTransactionsModal = dynamic(
  () =>
    import(
      "@/features/teacher/student-management/components/modals/StudentCoinTransactionsModal"
    ).then((m) => m.StudentCoinTransactionsModal),
  { ssr: false }
);

const StudentAssignedMissionsModal = dynamic(
  () =>
    import("./modals/StudentAssignedMissionsModal").then(
      (m) => m.StudentAssignedMissionsModal
    ),
  { ssr: false }
);

const AdjustStudentCoinsModal = dynamic(
  () =>
    import(
      "@/features/teacher/student-management/components/modals/AdjustStudentCoinsModal"
    ).then((m) => m.AdjustStudentCoinsModal),
  { ssr: false }
);

const ResetStudentPinModal = dynamic(
  () =>
    import(
      "@/features/teacher/student-management/components/modals/ResetStudentPinModal"
    ).then((m) => m.ResetStudentPinModal),
  { ssr: false }
);

interface StudentRosterViewProps {
  initialStudents?: TeacherRosterStudent[];
  initialClasses?: Array<{
    id: string;
    class_name: string;
    student_count: number;
    is_active: boolean;
  }>;
  initialClassId?: string;
  userRole?: string;
  authSecurity?: AuthSecurityConfig;
}

/**
 * Giao diện Hồ sơ & Danh sách học sinh theo lớp học (Góc giáo viên)
 * - Tuân thủ 100% 12 Quy tắc kiến trúc cốt lõi trong AGENTS.md
 * - Áp dụng Feature Context Pattern (Quy tắc 10) loại bỏ hoàn toàn Prop Drilling
 * - Áp dụng Kiến trúc Micro-Hooks (Quy tắc 12) tách bạch Filters, Modals, Mutations
 */
export function StudentRosterView({
  initialStudents = [],
  initialClasses = [],
  initialClassId,
  userRole,
  authSecurity,
}: StudentRosterViewProps) {
  // Lấy lớp đang chọn từ Header Workspace (tự động chuyển đổi khi giáo viên chọn lớp khác trên Header)
  const selectedWorkspaceClassId = useTeacherWorkspaceStore(
    (state) => state.selectedClassId
  );
  const activeClassId = selectedWorkspaceClassId ?? initialClassId ?? null;

  return (
    <StudentRosterProvider
      key={activeClassId ?? "default"}
      initialStudents={initialStudents}
      initialClasses={initialClasses}
      initialClassId={initialClassId}
      userRole={userRole}
      authSecurity={authSecurity}
    >
      <StudentRosterContent />
    </StudentRosterProvider>
  );
}

function StudentRosterContent() {
  const {
    isTeacherWithNoClasses,
    isLoading,
    filteredStudents,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
  } = useStudentRosterContext();

  return (
    <div className="space-y-5">
      {/* 1. Header Trang */}
      <StudentRosterHeader />

      {/* 2. Thẻ Thống kê KPI */}
      <StudentRosterKpiCards />

      {/* 3. Toolbar và Table cùng nằm trong Card đồng bộ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <StudentRosterToolbar />

        {isTeacherWithNoClasses ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <School className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Chưa được phân công lớp học
            </h3>
            <p className="text-sm text-[#475569] mt-1 max-w-md mx-auto">
              Tài khoản giáo viên của bạn hiện chưa được phân công phụ trách lớp học nào. Vui lòng liên hệ Quản trị viên để được phân lớp trước khi quản lý học sinh nhé.
            </p>
          </div>
        ) : isLoading ? (
          /* Skeleton nạp dữ liệu khi đang chuyển lớp trên Header (đồng bộ 100% với trang Giao bài tập) */
          <StudentRosterTableSkeleton rows={6} />
        ) : (
          <>
            {/* Bảng danh sách học sinh */}
            <StudentRosterTable />

            {/* Phân trang Pagination */}
            <div className="border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredStudents.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={ROSTER_PAGE_SIZE_OPTIONS}
                itemLabel="học sinh"
              />
            </div>
          </>
        )}
      </div>

      {/* 4. Thanh tác vụ hàng loạt khi tick chọn checkbox */}
      <StudentRosterBatchBar />

      {/* 5. Toàn bộ các Hộp thoại (Modals) quản lý học sinh */}
      {/* Modal 1: Chi tiết các phần quà Heo Đất đã đổi */}
      <StudentExchangeGiftsModal />

      {/* Modal 2: Lịch sử sao kê giao dịch ví xu Heo Đất (Tái sử dụng modal dùng chung) */}
      <StudentCoinTransactionsModal />

      {/* Modal 3: Danh sách bài tập đã giao và duyệt bài ngoại lệ */}
      <StudentAssignedMissionsModal />

      {/* Modal 4: Thưởng nóng xu / Trừ xu */}
      <AdjustStudentCoinsModal />

      {/* Modal 5: Đặt lại mã PIN */}
      <ResetStudentPinModal />
    </div>
  );
}
