"use client";

import { Search, Loader2 } from "lucide-react";
import { StudentsHeader } from "./students/StudentsHeader";
import { StudentsKpiCards } from "./students/StudentsKpiCards";
import { StudentsToolbar } from "./students/StudentsToolbar";
import { StudentsTable } from "./students/StudentsTable";
import { StudentsMobileList } from "./students/StudentsMobileList";
import { StudentFormModal } from "./students/StudentFormModal";
import { ChangeStudentClassModal } from "./students/ChangeStudentClassModal";
import { ResetStudentPinModal } from "./students/ResetStudentPinModal";
import { AdjustStudentCoinsModal } from "./students/AdjustStudentCoinsModal";
import { DeleteStudentModal } from "./students/DeleteStudentModal";
import { PermanentDeleteStudentModal } from "./students/PermanentDeleteStudentModal";
import { StudentsBatchBar } from "./students/StudentsBatchBar";
import { StudentItem } from "./students/types";
import {
  ManageStudentsProvider,
  useManageStudentsContext,
} from "../contexts/ManageStudentsContext";

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
    filteredStudents,
    handleResetFilter,
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

        {/* Hiển thị nội dung: Loading / Trạng thái rỗng / Danh sách học sinh */}
        {isLoading ? (
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#0A62D6] animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">
              Đang tải danh sách học sinh...
            </p>
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
          </>
        )}
      </div>

      {/* 4. Modal Thêm / Chỉnh sửa hồ sơ học sinh */}
      <StudentFormModal />

      {/* 5. Modal Chuyển lớp học */}
      <ChangeStudentClassModal />

      {/* 6. Modal Đặt lại mã PIN & Mở khóa tài khoản */}
      <ResetStudentPinModal />

      {/* 7. Modal Thưởng / Trừ Heo Đất xu */}
      <AdjustStudentCoinsModal />

      {/* 8. Modal Xác nhận chuyển học sinh vào thùng rác */}
      <DeleteStudentModal />

      {/* 9. Modal Xác nhận xóa vĩnh viễn (Admin) */}
      <PermanentDeleteStudentModal />

      {/* 10. Floating Batch Action Bar */}
      <StudentsBatchBar />
    </div>
  );
}
