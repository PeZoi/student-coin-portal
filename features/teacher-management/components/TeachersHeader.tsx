import { Plus } from "lucide-react";
import { useManageTeachersContext } from "@/features/teacher-management/contexts/ManageTeachersContext";

/**
 * Header của trang Quản lý giáo viên
 * - Tiêu đề trang và nút Thêm giáo viên mới
 * - Tự động gọi handleOpenCreateTeacher từ Context mà không cần nhận props
 */
export function TeachersHeader() {
  const { handleOpenCreateTeacher } = useManageTeachersContext();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
          Quản lý giáo viên
        </h1>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Danh sách tài khoản nhân sự, phân quyền vai trò và phân công lớp phụ trách.
        </p>
      </div>

      <button
        type="button"
        onClick={handleOpenCreateTeacher}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Thêm giáo viên mới</span>
      </button>
    </div>
  );
}

