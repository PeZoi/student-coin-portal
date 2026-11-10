import { Phone, Mail, Clock } from "lucide-react";
import { TeacherStaffItem } from "./types";
import { TeacherStatusBadge, AssignedClassesList } from "./TeacherBadges";
import { TeacherRowActions } from "./TeacherRowActions";
import { getTeacherColor, getTeacherInitial } from "../classes/utils";
import { formatDate } from "@/lib/date";

interface TeacherCardProps {
  item: TeacherStaffItem;
  onAssignClasses?: (item: TeacherStaffItem) => void;
  onEdit?: (item: TeacherStaffItem) => void;
  onResetPassword?: (item: TeacherStaffItem) => void;
  onToggleStatus?: (item: TeacherStaffItem) => void;
  onViewDetails?: (item: TeacherStaffItem) => void;
  onDelete?: (item: TeacherStaffItem) => void;
  onRestore?: (item: TeacherStaffItem) => void;
  onPermanentDelete?: (item: TeacherStaffItem) => void;
  isRestoring?: boolean;
}

export function TeacherCard({
  item,
  onAssignClasses,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
  onRestore,
  onPermanentDelete,
  isRestoring = false,
}: TeacherCardProps) {
  const color = getTeacherColor(item.full_name);
  const initial = getTeacherInitial(item.full_name);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
      {/* Hàng 1: Avatar + Họ tên (@username) bên trái + Trạng thái bên phải */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{ backgroundColor: color.bg, color: color.text }}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
              !item.is_active ? "opacity-60" : ""
            }`}
          >
            {initial}
          </div>
          <div className="min-w-0">
            {item.is_deleted ? (
              <span className="text-left font-semibold text-sm leading-snug block truncate text-slate-400 line-through">
                {item.full_name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onEdit) onEdit(item);
                }}
                className={`text-left font-semibold text-sm leading-snug transition-colors cursor-pointer hover:underline hover:text-[#0A62D6] block truncate ${
                  item.is_active ? "text-[#0F172A]" : "text-slate-500"
                }`}
              >
                {item.full_name}
              </button>
            )}
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              @{item.username}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <TeacherStatusBadge
            isActive={item.is_active}
            isLocked={item.is_locked}
            isDeleted={item.is_deleted}
          />
        </div>
      </div>

      {/* Hàng 2: Lớp phụ trách */}
      <div className="pt-0.5">
        <AssignedClassesList classes={item.assigned_classes} role={item.role} />
      </div>

      {/* Hàng 3: Thông tin liên hệ */}
      <div className="flex items-center gap-3 flex-wrap text-[13px] text-slate-600 pt-2 border-t border-slate-100">
        {item.phone_zalo ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 tabular-nums">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.phone_zalo}</span>
          </span>
        ) : null}
        {item.email ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.email}</span>
          </span>
        ) : null}
        {!item.phone_zalo && !item.email && (
          <span className="text-xs text-slate-400 italic">
            Chưa cập nhật liên hệ
          </span>
        )}
      </div>

      {/* Hàng 4: Đăng nhập lần cuối & Ngày tạo */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-slate-500 pt-2 border-t border-slate-100 tabular-nums">
        <div className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Đăng nhập:{" "}
            <strong className="font-medium text-slate-700">
              {item.last_login_at || "Chưa đăng nhập"}
            </strong>
          </span>
        </div>
        <div>
          <span>Ngày tạo: {formatDate(item.created_at)}</span>
        </div>
      </div>

      {/* Hàng 5: Nút "Gán lớp" chiếm phần lớn chiều rộng + nút "⋯" hoặc Khôi phục / Xóa vĩnh viễn */}
      <div className="pt-2 border-t border-slate-100">
        <TeacherRowActions
          item={item}
          fullWidth
          onAssignClasses={onAssignClasses}
          onEdit={onEdit}
          onResetPassword={onResetPassword}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          isRestoring={isRestoring}
        />
      </div>
    </div>
  );
}
