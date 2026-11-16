"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";

interface MissionsHeaderProps {
  onOpenCreate?: () => void;
}

/**
 * Header của trang Giao bài tập cho học sinh
 * - Đồng bộ 100% phong cách thiết kế với Quản lý lớp học, Quản lý học sinh và Quản lý giáo viên
 * - Tiêu đề trang nổi bật và nút Giao bài tập mới
 */
export function MissionsHeader(props?: MissionsHeaderProps) {
  const context = useManageMissionsContext();
  const { handleOpenCreateMission, availableClasses, isAdmin } = context;
  const onOpenCreate = props?.onOpenCreate ?? handleOpenCreateMission;
  const hasNoClasses = !isAdmin && availableClasses.length === 0;

  const handleCreateClick = () => {
    if (hasNoClasses) {
      toast.error("Bạn chưa được phân công lớp học nào để giao bài tập.");
      return;
    }
    onOpenCreate();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
          Giao bài tập
        </h1>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Thiết lập bài tập tích xu, cấu hình tiêu chí AI chấm bài và theo dõi tiến độ nộp bài của học sinh.
        </p>
      </div>

      <button
        type="button"
        onClick={handleCreateClick}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0 disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        <span>Giao bài tập mới</span>
      </button>
    </div>
  );
}
