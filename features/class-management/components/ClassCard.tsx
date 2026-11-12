import Image from "next/image";
import { Users } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { MockClassItem } from "@/features/class-management/types";
import { StatusBadge } from "./StatusBadge";
import { TeacherList } from "./TeacherList";
import { RowActions } from "./RowActions";

interface ClassCardProps {
  item: MockClassItem;
  onAssignTeacher?: (item: MockClassItem) => void;
  onEdit?: (item: MockClassItem) => void;
  onToggleStatus?: (item: MockClassItem) => void;
  onDelete?: (item: MockClassItem) => void;
  onRestore?: (item: MockClassItem) => void;
  onPermanentDelete?: (item: MockClassItem) => void;
  onOpenStudents?: (item: MockClassItem) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function ClassCard({
  item,
  onAssignTeacher,
  onEdit,
  onToggleStatus,
  onDelete,
  onRestore,
  onPermanentDelete,
  onOpenStudents,
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
          {item.is_deleted ? (
            <span className="font-semibold text-sm leading-snug truncate select-text text-slate-500 line-through">
              {item.class_name}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onEdit) onEdit(item);
              }}
              className={`text-left font-semibold text-sm leading-snug truncate cursor-pointer hover:underline hover:text-[#0A62D6] block transition-colors ${
                item.is_active ? "text-[#0F172A]" : "text-slate-500"
              }`}
            >
              {item.class_name}
            </button>
          )}
        </div>
        <div className="shrink-0">
          <StatusBadge isActive={item.is_active} isDeleted={item.is_deleted} />
        </div>
      </div>

      {/* Hàng 2: Danh sách giáo viên (avatar + tên, tối đa 2 + "+N") */}
      <div className="pt-0.5">
        <TeacherList teachers={item.teachers} />
      </div>

      {/* Hàng 3: Sĩ số + Tổng xu lớp + Ngày tạo */}
      <div className="flex items-center justify-between gap-2 text-[13px] text-slate-600 pt-2 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Sĩ số */}
          {onOpenStudents ? (
            <Tooltip content="Xem danh sách học sinh" side="top">
              <button
                type="button"
                onClick={() => onOpenStudents(item)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer tabular-nums shadow-2xs group ${
                  item.student_count > 0
                    ? "bg-blue-50/80 text-[#0A62D6] border border-blue-200/70 hover:bg-[#EAF2FF]"
                    : "bg-slate-50 text-slate-400 border border-slate-200/60 hover:bg-slate-100"
                }`}
              >
                <Users
                  className={`w-3.5 h-3.5 ${
                    item.student_count > 0 ? "text-[#0A62D6]" : "text-slate-400"
                  }`}
                />
                <span>{item.student_count} HS</span>
              </button>
            </Tooltip>
          ) : (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums ${
                item.student_count > 0
                  ? "bg-blue-50/80 text-[#0A62D6] border border-blue-200/70"
                  : "bg-slate-50 text-slate-400 border border-slate-200/60"
              }`}
            >
              <Users
                className={`w-3.5 h-3.5 ${
                  item.student_count > 0 ? "text-[#0A62D6]" : "text-slate-400"
                }`}
              />
              <span>{item.student_count} HS</span>
            </div>
          )}

          {/* Tổng xu lớp */}
          {item.total_coins && item.total_coins > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-bold tabular-nums shadow-2xs">
              <Image
                src="/wheel/coin.webp"
                alt="Xu"
                width={14}
                height={14}
                unoptimized
                style={{ height: "auto" }}
                className="w-3.5 h-3.5 drop-shadow-xs shrink-0"
              />
              <span>{item.total_coins.toLocaleString("vi-VN")}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-slate-400 text-xs font-medium tabular-nums">
              <Image
                src="/wheel/coin.webp"
                alt="Xu"
                width={14}
                height={14}
                unoptimized
                style={{ height: "auto" }}
                className="w-3.5 h-3.5 opacity-30 grayscale shrink-0"
              />
              <span>0</span>
            </div>
          )}
        </div>

        <div className="text-[12px] font-sans font-medium text-slate-500 tabular-nums shrink-0">
          <span>{item.created_at}</span>
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
