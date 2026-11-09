"use client";

import { useState, useRef, useEffect } from "react";
import { UserPlus, MoreHorizontal, Pencil, EyeOff, Eye } from "lucide-react";
import { MockClassItem } from "./types";

interface RowActionsProps {
  item: MockClassItem;
  fullWidth?: boolean;
  onAssignTeacher?: (item: MockClassItem) => void;
  onEdit?: (item: MockClassItem) => void;
  onToggleStatus?: (item: MockClassItem) => void;
}

export function RowActions({
  item,
  fullWidth = false,
  onAssignTeacher,
  onEdit,
  onToggleStatus,
}: RowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mở/đóng menu và tính vị trí cố định để không bị cắt bởi overflow của bảng
  const handleToggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Đóng popover khi nhấn phím Escape, click ra ngoài hoặc khi cuộn trang
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

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const handleAssignClick = () => {
    // TODO: nối API phân công giáo viên
    if (onAssignTeacher) {
      onAssignTeacher(item);
    }
  };

  const handleEditClick = () => {
    // TODO: nối API chỉnh sửa thông tin lớp
    setIsOpen(false);
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleToggleStatusClick = () => {
    // TODO: nối API thay đổi trạng thái kích hoạt / tạm ẩn
    setIsOpen(false);
    if (onToggleStatus) {
      onToggleStatus(item);
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${fullWidth ? "w-full" : "justify-end"}`}>
      {/* Nút Gán GV */}
      <button
        type="button"
        onClick={handleAssignClick}
        title="Phân công giáo viên"
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#D8E7FD] text-[#0A62D6] text-[13px] font-semibold transition-colors cursor-pointer ${
          fullWidth ? "flex-1 h-10 px-4" : "h-9 px-3"
        }`}
      >
        <UserPlus className="w-4 h-4" />
        <span>Gán GV</span>
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

      {/* Popover menu với vị trí fixed tránh bị cắt */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{ top: `${menuCoords.top}px`, right: `${menuCoords.right}px` }}
          className="fixed z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl p-1 text-[13px]"
        >
          <button
            type="button"
            onClick={handleEditClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
          >
            <Pencil className="w-4 h-4 text-slate-500" />
            <span>Chỉnh sửa</span>
          </button>

          <button
            type="button"
            onClick={handleToggleStatusClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
          >
            {item.is_active ? (
              <>
                <EyeOff className="w-4 h-4 text-amber-500" />
                <span>Tạm ẩn</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-[#15803D]" />
                <span>Hiện lại lớp</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
