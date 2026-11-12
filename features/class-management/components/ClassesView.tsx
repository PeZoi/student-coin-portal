"use client";

import { Search, Loader2, AlertCircle } from "lucide-react";
import { ClassesHeader } from "./ClassesHeader";
import { ClassesKpiCards } from "./ClassesKpiCards";
import { ClassesToolbar } from "./ClassesToolbar";
import { ClassesTable } from "./ClassesTable";
import { ClassesMobileList } from "./ClassesMobileList";
import { ClassFormModal } from "./modals/ClassFormModal";
import { AssignTeachersModal } from "./modals/AssignTeachersModal";
import { DeleteClassModal } from "./modals/DeleteClassModal";
import { PermanentDeleteModal } from "./modals/PermanentDeleteModal";
import { ClassStudentsModal } from "./modals/ClassStudentsModal";
import { ClassesBatchBar } from "./ClassesBatchBar";
import { TeacherClassItem } from "@/features/class-management/types";
import {
  TeacherClassesProvider,
  useTeacherClassesContext,
} from "@/features/class-management/contexts/TeacherClassesContext";

interface TeacherClassesViewProps {
  initialClasses?: TeacherClassItem[];
  userRole?: string;
}

/**
 * Component View chính của trang Quản lý lớp học
 * - Áp dụng Feature Context Pattern (Quy tắc 10): Tách biệt Provider và Content
 * - Loại bỏ hoàn toàn 35 biến destructure và Prop Drilling
 */
export function TeacherClassesView({ initialClasses, userRole }: TeacherClassesViewProps) {
  return (
    <TeacherClassesProvider initialClasses={initialClasses} userRole={userRole}>
      <TeacherClassesContent />
    </TeacherClassesProvider>
  );
}

function TeacherClassesContent() {
  const {
    isLoading,
    isError,
    classesList,
    filteredClasses,
    handleResetFilter,
    handleRefresh,
  } = useTeacherClassesContext();

  return (
    <div className="space-y-5">
      {/* 1. Header Trang */}
      <ClassesHeader />

      {/* 2. Thẻ Thống kê KPI */}
      <ClassesKpiCards />

      {/* 3. Toolbar và Danh sách lớp trong cùng một Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <ClassesToolbar />
        <div className="border-b border-slate-200" />

        {/* Hiển thị nội dung: Loading / Lỗi kết nối / Trạng thái rỗng / Danh sách lớp */}
        {isLoading ? (
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#0A62D6] animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">Đang tải danh sách lớp học...</p>
          </div>
        ) : isError && classesList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Không thể tải danh sách lớp học
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
        ) : filteredClasses.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">
              Không tìm thấy lớp học nào
            </h3>
            <p className="text-sm text-[#475569] mt-1">
              Thử đổi từ khóa hoặc bộ lọc nhé
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
              <ClassesTable />
            </div>

            {/* Mobile: Danh sách thẻ */}
            <ClassesMobileList />
          </>
        )}
      </div>

      {/* 4. Modal Tạo / Chỉnh sửa lớp học */}
      <ClassFormModal />

      {/* 5. Modal Phân công giáo viên phụ trách */}
      <AssignTeachersModal />

      {/* 6. Modal Xác nhận xóa lớp học (Xóa mềm - Chuyển thùng rác) */}
      <DeleteClassModal />

      {/* 7. Modal Xác nhận xóa vĩnh viễn (Hard delete - Admin) */}
      <PermanentDeleteModal />

      {/* 8. Modal Danh sách học sinh trong lớp */}
      <ClassStudentsModal />

      {/* 9. Thanh tác vụ hàng loạt nổi khi chọn checkbox */}
      <ClassesBatchBar />
    </div>
  );
}
