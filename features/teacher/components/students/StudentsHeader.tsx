import { Plus } from "lucide-react";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface StudentsHeaderProps {
  onOpenCreate?: () => void;
}

/**
 * Header của trang Quản lý học sinh
 * - Đồng bộ 100% phong cách thiết kế với Quản lý lớp học và Quản lý giáo viên
 * - Tiêu đề trang nổi bật và nút Thêm học sinh mới
 */
export function StudentsHeader(props?: StudentsHeaderProps) {
  const context = useManageStudentsContext();
  const onOpenCreate = props?.onOpenCreate ?? context.handleOpenCreateStudent;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
          Quản lý học sinh
        </h1>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Danh sách học sinh, phân bổ lớp học, bảo mật mã PIN và quản lý số dư Heo Đất xu.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenCreate}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Thêm học sinh mới</span>
      </button>
    </div>
  );
}
