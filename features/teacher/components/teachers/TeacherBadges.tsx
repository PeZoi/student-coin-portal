import { ShieldCheck, Sparkles, UserCheck, School } from "lucide-react";
import { StaffRole } from "./types";
import { STAFF_ROLE_CONFIG } from "./constants";
import { UserRole } from "@/constants/auth";

interface RoleBadgeProps {
  role: StaffRole;
}

/**
 * Huy hiệu hiển thị vai trò hệ thống (`role` từ bảng `public.users`)
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  const config = STAFF_ROLE_CONFIG[role] ?? STAFF_ROLE_CONFIG.teacher;

  const Icon =
    role === UserRole.ADMIN
      ? ShieldCheck
      : role === UserRole.SUPER_TEACHER
        ? Sparkles
        : UserCheck;

  return (
    <span
      style={{
        backgroundColor: config.badgeBg,
        color: config.badgeText,
        borderColor: config.badgeBorder,
      }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.shortLabel}</span>
    </span>
  );
}

interface TeacherStatusBadgeProps {
  isActive: boolean;
  isLocked?: boolean;
  isDeleted?: boolean;
}

/**
 * Huy hiệu hiển thị trạng thái tài khoản (`is_active`, `is_locked` và `is_deleted`)
 */
export function TeacherStatusBadge({
  isActive,
  isLocked,
  isDeleted,
}: TeacherStatusBadgeProps) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        <span>Đã xóa</span>
      </span>
    );
  }

  if (isLocked) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        <span>Khóa đăng nhập</span>
      </span>
    );
  }

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#15803D] bg-[#ECFDF3] px-2.5 py-1 rounded-full border border-[#22C55E]/30 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
        <span>Hoạt động</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0" />
      <span>Tạm khóa</span>
    </span>
  );
}

interface AssignedClassesListProps {
  classes: string[];
  role: StaffRole;
}

/**
 * Hiển thị danh sách lớp học đang phụ trách (tối đa 2 lớp + "+N")
 */
export function AssignedClassesList({ classes, role }: AssignedClassesListProps) {
  if (!classes || classes.length === 0) {
    if (role === UserRole.ADMIN) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap">
          <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Toàn hệ thống</span>
        </span>
      );
    }
    return <span className="text-slate-400 text-[13px] italic">Chưa phân công</span>;
  }

  const maxVisible = 2;
  const visibleClasses = classes.slice(0, maxVisible);
  const remainingCount = classes.length - maxVisible;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visibleClasses.map((className) => (
        <span
          key={className}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-[13px] font-medium text-slate-700 whitespace-nowrap"
        >
          <School className="w-3.5 h-3.5 text-[#0A62D6] shrink-0" />
          <span>{className}</span>
        </span>
      ))}

      {remainingCount > 0 && (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

