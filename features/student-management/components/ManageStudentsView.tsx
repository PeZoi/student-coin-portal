"use client";

import { Search, Loader2, AlertCircle } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { StudentsHeader } from "./StudentsHeader";
import { StudentsKpiCards } from "./StudentsKpiCards";
import { StudentsToolbar } from "./StudentsToolbar";
import { StudentsTable } from "./StudentsTable";
import { StudentsMobileList } from "./StudentsMobileList";
import { StudentFormModal } from "./modals/StudentFormModal";
import { ChangeStudentClassModal } from "./modals/ChangeStudentClassModal";
import { BatchChangeClassModal } from "./modals/BatchChangeClassModal";
import { ResetStudentPinModal } from "./modals/ResetStudentPinModal";
import { AdjustStudentCoinsModal } from "./modals/AdjustStudentCoinsModal";
import { StudentCoinTransactionsModal } from "./modals/StudentCoinTransactionsModal";
import { DeleteStudentModal } from "./modals/DeleteStudentModal";
import { PermanentDeleteStudentModal } from "./modals/PermanentDeleteStudentModal";
import { StudentsBatchBar } from "./StudentsBatchBar";
import { StudentItem } from "@/features/student-management/types";
import {
  ManageStudentsProvider,
  useManageStudentsContext,
} from "@/features/student-management/contexts/ManageStudentsContext";

interface TeacherManageStudentsViewProps {
  initialStudents?: StudentItem[];
  userRole?: string;
}

/**
 * Component View chính của trang Quản lý học sinh
 * - Áp dụng Feature Context Pattern (Quy tắc 10): Tách biệt Provider và Content
 * - Đồng bộ 100% kiến trúc, bảng màu và trải nghiệm với Quản lý lớp học và Quản lý giáo viên
 */
export function TeacherManageStudentsView({
  initialStudents,
  userRole,
}: TeacherManageStudentsViewProps) {
  return (
    <ManageStudentsProvider
      initialStudents={initialStudents}
      userRole={userRole}
    >
      <ManageStudentsContent />
    </ManageStudentsProvider>
  );
}

function ManageStudentsContent() {
  const {
    isLoading,
    isError,
    studentsList,
    filteredStudents,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    handleResetFilter,
    handleRefresh,
  } = useManageStudentsContext();

  return (
    <div className="space-y-5">
      {/* 1. Header Trang */}
      <StudentsHeader />

      {/* 2. Thẻ Thống kê KPI */}
      <StudentsKpiCards />

      {/* 3. Toolbar và Danh sách học sinh trong cùng một Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <StudentsToolbar />
        <div className="border-b border-slate-200" />

        {/* Hiển thị nội dung: Loading / Lỗi kết nối / Trạng thái rỗng / Danh sách học sinh */}
        {isLoading ? (
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#0A62D6] animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">
              Đang tải danh sách học sinh...
            </p>
          </div>
        ) : isError && studentsList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Không thể tải danh sách học sinh
            </h3>
            <p className="text-sm text-[#475569] mt-1">
              Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại.
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Thử tải lại
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Không tìm thấy học sinh nào
            </h3>
            <p className="text-sm text-[#475569] mt-1">
              Thử đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc lớp học khác nhé
            </p>
            <button
              type="button"
              onClick={handleResetFilter}
              className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            {/* Desktop: Bảng dữ liệu */}
            <div className="hidden md:block">
              <StudentsTable />
            </div>

            {/* Mobile: Danh sách thẻ */}
            <StudentsMobileList />

            {/* Phân trang: Click từng trang 1 */}
            <div className="border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="học sinh"
              />
            </div>
          </>
        )}
      </div>

      {/* 4. Modal Thêm / Chỉnh sửa hồ sơ học sinh */}
      <StudentFormModal />

      {/* 5. Modal Chuyển lớp học */}
      <ChangeStudentClassModal />

      {/* 5.1 Modal Chuyển lớp học hàng loạt */}
      <BatchChangeClassModal />

      {/* 6. Modal Đặt lại mã PIN & Mở khóa tài khoản */}
      <ResetStudentPinModal />

      {/* 7. Modal Thưởng / Trừ Heo Đất xu */}
      <AdjustStudentCoinsModal />

      {/* 7.1 Modal Xem lịch sử biến động ví xu */}
      <StudentCoinTransactionsModal />

      {/* 8. Modal Xác nhận chuyển học sinh vào thùng rác */}
      <DeleteStudentModal />

      {/* 9. Modal Xác nhận xóa vĩnh viễn (Admin) */}
      <PermanentDeleteStudentModal />

      {/* 10. Floating Batch Action Bar */}
      <StudentsBatchBar />
    </div>
  );
}
