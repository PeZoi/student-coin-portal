import { Users } from "lucide-react";
import { MockClassItem } from "./types";
import { StatusBadge } from "./StatusBadge";
import { TeacherList } from "./TeacherList";
import { RowActions } from "./RowActions";

interface ClassCardProps {
  item: MockClassItem;
  onAssignTeacher?: (item: MockClassItem) => void;
  onEdit?: (item: MockClassItem) => void;
  onToggleStatus?: (item: MockClassItem) => void;
  onViewClassDetails?: (item: MockClassItem) => void;
}

export function ClassCard({
  item,
  onAssignTeacher,
  onEdit,
  onToggleStatus,
  onViewClassDetails,
}: ClassCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
      {/* Hàng 1: Tên lớp (bên trái, cho phép wrap) + Huy hiệu trạng thái (bên phải) */}
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            // TODO: mở chi tiết lớp
            if (onViewClassDetails) onViewClassDetails(item);
          }}
          className={`text-left font-semibold text-sm leading-snug transition-colors cursor-pointer hover:underline hover:text-[#0A62D6] ${
            item.is_active ? "text-[#0F172A]" : "text-slate-500"
          }`}
        >
          {item.class_name}
        </button>
        <div className="shrink-0">
          <StatusBadge isActive={item.is_active} />
        </div>
      </div>

      {/* Hàng 2: Danh sách giáo viên (avatar + tên, tối đa 2 + "+N") */}
      <div className="pt-0.5">
        <TeacherList teachers={item.teachers} />
      </div>

      {/* Hàng 3: "Sĩ số: N" (icon Users) và Ngày tạo (13px text-slate-600) */}
      <div className="flex items-center justify-between text-[13px] text-slate-600 pt-1 border-t border-slate-100">
        <div className="inline-flex items-center gap-1.5 font-medium">
          <Users className="w-4 h-4 text-slate-400" />
          <span>Sĩ số: <strong className="font-semibold text-slate-800 tabular-nums">{item.student_count}</strong></span>
        </div>
        <div className="text-[13px] font-sans font-medium text-slate-600 tabular-nums">
          <span>Ngày tạo: {item.created_at}</span>
        </div>
      </div>

      {/* Hàng 4: Nút "Gán GV" chiếm phần lớn chiều rộng + nút "⋯" */}
      <div className="pt-2 border-t border-slate-100">
        <RowActions
          item={item}
          fullWidth
          onAssignTeacher={onAssignTeacher}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </div>
  );
}
