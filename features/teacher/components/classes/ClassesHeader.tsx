import { Plus } from "lucide-react";
import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";

/**
 * Header của trang Quản lý lớp học
 * - Tiêu đề trang và nút Tạo lớp học mới
 * - Tự động gọi handleOpenCreateClass từ Context mà không cần nhận props
 */
export function ClassesHeader() {
  const { handleOpenCreateClass } = useTeacherClassesContext();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
          Quản lý lớp học
        </h1>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Danh sách lớp học / ca học và phân công giáo viên phụ trách.
        </p>
      </div>

      <button
        type="button"
        onClick={handleOpenCreateClass}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Tạo lớp học mới</span>
      </button>
    </div>
  );
}
