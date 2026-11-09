"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  School,
  MoreHorizontal,
  Pencil,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";
import { TeacherStaffItem } from "./types";

interface TeacherRowActionsProps {
  item: TeacherStaffItem;
  fullWidth?: boolean;
  onAssignClasses?: (item: TeacherStaffItem) => void;
  onEdit?: (item: TeacherStaffItem) => void;
  onResetPassword?: (item: TeacherStaffItem) => void;
  onToggleStatus?: (item: TeacherStaffItem) => void;
  onDelete?: (item: TeacherStaffItem) => void;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  right: number;
  openUpward: boolean;
}

const ESTIMATED_MENU_HEIGHT = 185;
const VIEWPORT_PADDING = 12;

export function TeacherRowActions({
  item,
  fullWidth = false,
  onAssignClasses,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: TeacherRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition>({
    top: 0,
    right: 0,
    openUpward: false,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mở/đóng menu và tự động tính toán hướng bung (lên trên hoặc xuống dưới) để không bị che khuất ở mép màn hình
  const handleToggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward =
        spaceBelow < ESTIMATED_MENU_HEIGHT + VIEWPORT_PADDING &&
        spaceAbove > spaceBelow;

      const rightOffset = Math.max(
        VIEWPORT_PADDING,
        window.innerWidth - rect.right
      );

      if (openUpward) {
        setMenuPos({
          bottom: window.innerHeight - rect.top + 6,
          right: rightOffset,
          openUpward: true,
        });
      } else {
        setMenuPos({
          top: rect.bottom + 6,
          right: rightOffset,
          openUpward: false,
        });
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Đóng popover khi nhấn phím Escape, click ra ngoài, cuộn trang hoặc đổi kích thước cửa sổ
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const handleAssignClick = () => {
    if (onAssignClasses) {
      onAssignClasses(item);
    }
  };

  const handleEditClick = () => {
    setIsOpen(false);
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleResetPasswordClick = () => {
    setIsOpen(false);
    if (onResetPassword) {
      onResetPassword(item);
    }
  };

  const handleToggleStatusClick = () => {
    setIsOpen(false);
    if (onToggleStatus) {
      onToggleStatus(item);
    }
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${
        fullWidth ? "w-full" : "justify-end"
      }`}
    >
      {/* Nút Gán lớp */}
      <button
        type="button"
        onClick={handleAssignClick}
        title="Phân công lớp phụ trách"
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#D8E7FD] text-[#0A62D6] text-[13px] font-semibold transition-colors cursor-pointer ${
          fullWidth ? "flex-1 h-10 px-4" : "h-9 px-3"
        }`}
      >
        <School className="w-4 h-4" />
        <span>Gán lớp</span>
      </button>

      {/* Nút 3 chấm mở popover */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleMenu}
        title="Thao tác khác"
        className={`rounded-xl flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0 ${
          fullWidth ? "w-10 h-10" : "w-9 h-9"
        }`}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Popover menu render qua Portal và tự động đảo chiều lên trên nếu sát đáy màn hình */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuPos.top !== undefined ? `${menuPos.top}px` : undefined,
              bottom:
                menuPos.bottom !== undefined ? `${menuPos.bottom}px` : undefined,
              right: `${menuPos.right}px`,
            }}
            className={`fixed z-50 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-1 text-[13px] animate-in fade-in zoom-in-95 duration-150 ${
              menuPos.openUpward ? "origin-bottom-right" : "origin-top-right"
            }`}
          >
            <button
              type="button"
              onClick={handleEditClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
              <span>Chỉnh sửa thông tin</span>
            </button>

            <button
              type="button"
              onClick={handleResetPasswordClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#0A62D6]" />
              <span>Đặt lại mật khẩu</span>
            </button>

            <button
              type="button"
              onClick={handleToggleStatusClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
            >
              {item.is_active ? (
                <>
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Tạm khóa tài khoản</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-[#15803D]" />
                  <span>Mở khóa tài khoản</span>
                </>
              )}
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Xóa tài khoản</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
