"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, Sparkles, UserCheck, School } from "lucide-react";
import { StaffRole } from "@/features/teacher-management/types";
import { STAFF_ROLE_CONFIG } from "@/features/teacher-management/constants";
import { UserRole } from "@/constants/auth";
import { cn } from "@/lib/utils";

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

interface RemainingClassesBadgeProps {
  remainingClasses: string[];
}

/**
 * Nút huy hiệu "+N" tương tác thông minh
 * - Hover (Desktop): Tự động hiển thị Popover danh sách lớp học phụ trách khác
 * - Click (Mobile / Desktop): Bật / tắt Popover danh sách lớp
 * - Render qua Portal chống tràn hoặc bị che khuất bởi overflow bảng
 */
function RemainingClassesBadge({ remainingClasses }: RemainingClassesBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    openUpward: boolean;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;

    const popupWidth = 190;
    let left = rect.left + rect.width / 2 - popupWidth / 2;
    // Đảm bảo không tràn màn hình trái / phải
    left = Math.max(12, Math.min(left, window.innerWidth - popupWidth - 12));

    setCoords({
      top: openUpward ? rect.top - 8 : rect.bottom + 8,
      left,
      openUpward,
    });
  }, []);

  const handleOpen = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updatePosition();
    setIsOpen(true);
  }, [updatePosition]);

  const handleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  const handleImmediateClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(false);
  }, []);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      handleImmediateClose();
    } else {
      handleOpen();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        handleImmediateClose();
      }
    };

    const handleScrollOrResize = () => {
      handleImmediateClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, handleImmediateClose]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggleClick}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        className={cn(
          "px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none",
          isOpen
            ? "bg-[#0A62D6] text-white border border-[#0A62D6] shadow-2xs"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200"
        )}
      >
        +{remainingClasses.length}
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className={cn(
              "fixed z-[9999] w-[190px] p-2 rounded-xl bg-white border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-150",
              coords.openUpward ? "-translate-y-full origin-bottom" : "origin-top"
            )}
          >
            <div className="flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>Lớp khác ({remainingClasses.length})</span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
              {remainingClasses.map((className) => (
                <div
                  key={className}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EAF2FF] text-[#0A62D6] border border-[#CFE1FB] w-full"
                >
                  <School className="w-3.5 h-3.5 text-[#0A62D6] shrink-0" />
                  <span className="truncate">{className}</span>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

interface AssignedClassesListProps {
  classes: string[];
  role: StaffRole;
}

/**
 * Hiển thị danh sách lớp học đang phụ trách (tối đa 2 lớp + "+N" tương tác)
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
    return <span className="text-slate-400 text-[13px] italic whitespace-nowrap">Chưa phân công</span>;
  }

  const maxVisible = 2;
  const visibleClasses = classes.slice(0, maxVisible);
  const remainingClasses = classes.slice(maxVisible);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visibleClasses.map((className) => (
        <span
          key={className}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EAF2FF] text-[#0A62D6] border border-[#CFE1FB] whitespace-nowrap"
        >
          <School className="w-3.5 h-3.5 text-[#0A62D6] shrink-0" />
          <span>{className}</span>
        </span>
      ))}

      {remainingClasses.length > 0 && (
        <RemainingClassesBadge remainingClasses={remainingClasses} />
      )}
    </div>
  );
}

