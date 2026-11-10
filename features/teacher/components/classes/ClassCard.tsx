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
  onDelete?: (item: MockClassItem) => void;
  onRestore?: (item: MockClassItem) => void;
  onPermanentDelete?: (item: MockClassItem) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function ClassCard({
  item,
  onAssignTeacher,
  onEdit,
  onToggleStatus,
  onViewClassDetails,
  onDelete,
  onRestore,
  onPermanentDelete,
  isSelected,
  onToggleSelect,
}: ClassCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition-colors ${
        item.is_deleted
          ? "border-rose-200 bg-rose-50/20"
          : isSelected
          ? "border-[#0A62D6] bg-blue-50/20"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Hàng 1: Checkbox (nếu có) + Tên lớp (bên trái) + Huy hiệu trạng thái (bên phải) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={Boolean(isSelected)}
              onChange={() => onToggleSelect(item.id)}
              className="w-4 h-4 rounded border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer accent-[#0A62D6] shrink-0"
            />
          )}
          <button
            type="button"
            onClick={() => {
              if (onViewClassDetails) onViewClassDetails(item);
            }}
            className={`text-left font-semibold text-sm leading-snug transition-colors cursor-pointer hover:underline hover:text-[#0A62D6] truncate ${
              item.is_deleted
                ? "text-slate-500 line-through"
                : item.is_active
                ? "text-[#0F172A]"
                : "text-slate-500"
            }`}
          >
            {item.class_name}
          </button>
        </div>
        <div className="shrink-0">
          <StatusBadge isActive={item.is_active} isDeleted={item.is_deleted} />
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

      {/* Hàng 4: Các nút hành động */}
      <div className="pt-2 border-t border-slate-100">
        <RowActions
          item={item}
          fullWidth
          onAssignTeacher={onAssignTeacher}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
        />
      </div>
    </div>
  );
}
