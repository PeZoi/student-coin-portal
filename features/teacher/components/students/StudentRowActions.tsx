"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRightLeft,
  MoreHorizontal,
  Pencil,
  KeyRound,
  Coins,
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { StudentItem } from "./types";
import { Tooltip } from "@/components/ui/tooltip";

interface StudentRowActionsProps {
  item: StudentItem;
  fullWidth?: boolean;
  onChangeClass?: (item: StudentItem) => void;
  onEdit?: (item: StudentItem) => void;
  onAdjustCoins?: (item: StudentItem) => void;
  onResetPin?: (item: StudentItem) => void;
  onToggleStatus?: (item: StudentItem) => void;
  onDelete?: (item: StudentItem) => void;
  onRestore?: (item: StudentItem) => void;
  onPermanentDelete?: (item: StudentItem) => void;
  isRestoring?: boolean;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  right: number;
  openUpward: boolean;
}

const ESTIMATED_MENU_HEIGHT = 220;
const VIEWPORT_PADDING = 12;

export function StudentRowActions({
  item,
  fullWidth = false,
  onChangeClass,
  onEdit,
  onAdjustCoins,
  onResetPin,
  onToggleStatus,
  onDelete,
  onRestore,
  onPermanentDelete,
  isRestoring = false,
}: StudentRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition>({
    top: 0,
    right: 0,
    openUpward: false,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mở/đóng menu và tự động tính toán hướng bung popover thông minh
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

  // Đóng popover khi nhấn Escape, click ngoài, cuộn trang
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

  // Nếu là học sinh trong thùng rác: Hiển thị 2 nút trực tiếp Khôi phục và Xóa vĩnh viễn
  if (item.is_deleted) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${
          fullWidth ? "w-full" : "justify-end"
        }`}
      >
        <Tooltip content="Khôi phục hồ sơ học sinh" side="top">
          <button
            type="button"
            onClick={() => onRestore?.(item)}
            disabled={isRestoring}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[13px] font-semibold transition-colors cursor-pointer border border-emerald-200/80 disabled:opacity-50 ${
              fullWidth ? "flex-1 h-10 px-3" : "h-9 px-3"
            }`}
          >
            {isRestoring ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <RotateCcw className="w-4 h-4 text-emerald-600" />
            )}
            <span>Khôi phục</span>
          </button>
        </Tooltip>

        <Tooltip content="Xóa vĩnh viễn khỏi hệ thống" side="top">
          <button
            type="button"
            onClick={() => onPermanentDelete?.(item)}
            disabled={isRestoring}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[13px] font-semibold transition-colors cursor-pointer border border-rose-200/80 disabled:opacity-50 ${
              fullWidth ? "flex-1 h-10 px-3" : "h-9 px-3"
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Xóa vĩnh viễn</span>
          </button>
        </Tooltip>
      </div>
    );
  }

  const handleChangeClassClick = () => {
    setIsOpen(false);
    if (onChangeClass) {
      onChangeClass(item);
    }
  };

  const handleEditClick = () => {
    setIsOpen(false);
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleAdjustCoinsClick = () => {
    setIsOpen(false);
    if (onAdjustCoins) {
      onAdjustCoins(item);
    }
  };

  const handleResetPinClick = () => {
    setIsOpen(false);
    if (onResetPin) {
      onResetPin(item);
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
      {/* Nút Chuyển lớp nhanh */}
      <Tooltip content="Chuyển lớp học cho học sinh" side="top">
        <button
          type="button"
          onClick={handleChangeClassClick}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#D8E7FD] text-[#0A62D6] text-[13px] font-semibold transition-colors cursor-pointer ${
            fullWidth ? "flex-1 h-10 px-4" : "h-9 px-3"
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Chuyển lớp</span>
        </button>
      </Tooltip>

      {/* Nút 3 chấm mở popover */}
      <Tooltip content="Thao tác khác" side="top">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggleMenu}
          className={`rounded-xl flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0 ${
            fullWidth ? "w-10 h-10" : "w-9 h-9"
          }`}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </Tooltip>

      {/* Popover menu render qua Portal */}
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
            className={`fixed z-50 w-52 rounded-xl bg-white border border-slate-200 shadow-xl p-1 text-[13px] animate-in fade-in zoom-in-95 duration-150 ${
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
              onClick={handleAdjustCoinsClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Thưởng / Trừ số xu</span>
            </button>

            <button
              type="button"
              onClick={handleResetPinClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#0A62D6]" />
              <span>Đặt lại mã PIN / Mở khóa</span>
            </button>

            <button
              type="button"
              onClick={handleChangeClassClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <span>Chuyển sang lớp khác</span>
            </button>

            <button
              type="button"
              onClick={handleToggleStatusClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
            >
              {item.is_active ? (
                <>
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Tạm dừng học</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-[#15803D]" />
                  <span>Kích hoạt học lại</span>
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
              <span>Xóa hồ sơ học sinh</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

