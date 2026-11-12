"use client";

import dynamic from "next/dynamic";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { TeachersHeader } from "./TeachersHeader";
import { TeachersKpiCards } from "./TeachersKpiCards";
import { TeachersToolbar } from "./TeachersToolbar";
import { TeachersTable } from "./TeachersTable";
import { TeachersMobileList } from "./TeachersMobileList";
import { TeachersBatchBar } from "./TeachersBatchBar";
import { TeacherStaffItem } from "@/features/teacher-management/types";
import {
  ManageTeachersProvider,
  useManageTeachersContext,
} from "@/features/teacher-management/contexts/ManageTeachersContext";

// Tách nhỏ Bundle Size qua dynamic imports (Điểm tối ưu 3)
const TeacherFormModal = dynamic(
  () => import("./modals/TeacherFormModal").then((m) => m.TeacherFormModal),
  { ssr: false }
);
const AssignClassesModal = dynamic(
  () => import("./modals/AssignClassesModal").then((m) => m.AssignClassesModal),
  { ssr: false }
);
const ResetPasswordModal = dynamic(
  () => import("./modals/ResetPasswordModal").then((m) => m.ResetPasswordModal),
  { ssr: false }
);
const DeleteTeacherModal = dynamic(
  () => import("./modals/DeleteTeacherModal").then((m) => m.DeleteTeacherModal),
  { ssr: false }
);
const PermanentDeleteTeacherModal = dynamic(
  () =>
    import("./modals/PermanentDeleteTeacherModal").then(
      (m) => m.PermanentDeleteTeacherModal
    ),
  { ssr: false }
);

interface TeacherManageTeachersViewProps {
  initialTeachers?: TeacherStaffItem[];
  userRole?: string;
}

/**
 * Component View chính của trang Quản lý giáo viên
 * - Áp dụng Feature Context Pattern (Quy tắc 10): Tách biệt Provider và Content
 * - Đồng bộ 100% kiến trúc và giao diện với trang Quản lý lớp học (TeacherClassesView)
 */
export function TeacherManageTeachersView({
  initialTeachers,
  userRole,
}: TeacherManageTeachersViewProps) {
  return (
    <ManageTeachersProvider
      initialTeachers={initialTeachers}
      userRole={userRole}
    >
      <ManageTeachersContent />
    </ManageTeachersProvider>
  );
}

function ManageTeachersContent() {
  const {
    isLoading,
    isError,
    teachersList,
    filteredTeachers,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    handleResetFilter,
    handleRefresh,
  } = useManageTeachersContext();

  return (
    <div className="space-y-5">
      {/* 1. Header Trang */}
      <TeachersHeader />

      {/* 2. Thẻ Thống kê KPI */}
      <TeachersKpiCards />

      {/* 3. Toolbar và Danh sách giáo viên trong cùng một Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <TeachersToolbar />
        <div className="border-b border-slate-200" />

        {/* Hiển thị nội dung: Loading / Lỗi kết nối / Trạng thái rỗng / Danh sách giáo viên */}
        {isLoading ? (
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#0A62D6] animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">
              Đang tải danh sách giáo viên...
            </p>
          </div>
        ) : isError && teachersList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Không thể tải danh sách giáo viên
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
        ) : filteredTeachers.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Không tìm thấy giáo viên nào
            </h3>
            <p className="text-sm text-[#475569] mt-1">
              Thử đổi từ khóa tìm kiếm hoặc bộ lọc vai trò / trạng thái nhé
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
              <TeachersTable />
            </div>

            {/* Mobile: Danh sách thẻ */}
            <TeachersMobileList />

            {/* Phân trang: Click từng trang 1 */}
            <div className="border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="giáo viên"
              />
            </div>
          </>
        )}
      </div>

      {/* 4. Modal Thêm / Chỉnh sửa thông tin giáo viên */}
      <TeacherFormModal />

      {/* 5. Modal Phân công lớp học phụ trách */}
      <AssignClassesModal />

      {/* 6. Modal Đặt lại mật khẩu */}
      <ResetPasswordModal />

      {/* 7. Modal Xác nhận xóa tài khoản giáo viên (thùng rác) */}
      <DeleteTeacherModal />

      {/* 8. Modal Xác nhận xóa vĩnh viễn (Admin) */}
      <PermanentDeleteTeacherModal />

      {/* 9. Floating Batch Action Bar */}
      <TeachersBatchBar />
    </div>
  );
}
