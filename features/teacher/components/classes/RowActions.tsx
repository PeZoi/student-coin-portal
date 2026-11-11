"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserPlus, MoreHorizontal, Pencil, EyeOff, Eye, Trash2, RotateCcw, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";
import { MockClassItem } from "./types";

interface RowActionsProps {
  item: MockClassItem;
  fullWidth?: boolean;
  onAssignTeacher?: (item: MockClassItem) => void;
  onEdit?: (item: MockClassItem) => void;
  onToggleStatus?: (item: MockClassItem) => void;
  onDelete?: (item: MockClassItem) => void;
  onRestore?: (item: MockClassItem) => void;
  onPermanentDelete?: (item: MockClassItem) => void;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  right: number;
  openUpward: boolean;
}

const ESTIMATED_MENU_HEIGHT = 150;
const VIEWPORT_PADDING = 12;

export function RowActions({
  item,
  fullWidth = false,
  onAssignTeacher,
  onEdit,
  onToggleStatus,
  onDelete,
  onRestore,
  onPermanentDelete,
}: RowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition>({
    top: 0,
    right: 0,
    openUpward: false,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  let restoringId: string | null = null;
  let isAdmin = false;
  let canSoftDelete = false;
  try {
    const context = useTeacherClassesContext();
    restoringId = context.restoringId ?? null;
    isAdmin = context.isAdmin ?? false;
    canSoftDelete = context.canSoftDelete ?? false;
  } catch {
    // Nếu component được gọi độc lập ngoài context
  }

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
    if (onAssignTeacher) {
      onAssignTeacher(item);
    }
  };

  const handleEditClick = () => {
    setIsOpen(false);
    if (onEdit) {
      onEdit(item);
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

  const handleRestoreClick = () => {
    setIsOpen(false);
    if (onRestore) {
      onRestore(item);
    }
  };

  const handlePermanentDeleteClick = () => {
    setIsOpen(false);
    if (onPermanentDelete) {
      onPermanentDelete(item);
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${fullWidth ? "w-full" : "justify-end"}`}>
      {/* Nút Gán GV (chỉ hiện khi chưa xóa) */}
      {!item.is_deleted && (
        <Tooltip content="Phân công giáo viên phụ trách lớp" side="top">
          <button
            type="button"
            onClick={handleAssignClick}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#D8E7FD] text-[#0A62D6] text-[13px] font-semibold transition-colors cursor-pointer ${
              fullWidth ? "flex-1 h-10 px-4" : "h-9 px-3"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Gán GV</span>
          </button>
        </Tooltip>
      )}

      {/* Nút 3 chấm mở popover */}
      <Tooltip content={item.is_deleted ? "Thao tác khôi phục hoặc xóa" : "Thao tác khác"} side="top" disabled={isOpen}>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggleMenu}
          disabled={restoringId === item.id}
          className={`rounded-xl flex items-center justify-center border bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0 ${
            fullWidth ? "w-full h-10 gap-2 px-3 text-xs font-semibold" : "w-9 h-9"
          } ${
            item.is_deleted
              ? "border-rose-200 text-rose-600 hover:bg-rose-50/50"
              : "border-slate-200"
          }`}
        >
          {restoringId === item.id ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          ) : (
            <MoreHorizontal className="w-4 h-4" />
          )}
          {fullWidth && <span>{item.is_deleted ? "Thao tác xóa/khôi phục" : "Thao tác"}</span>}
        </button>
      </Tooltip>

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
            className={`fixed z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl p-1 text-[13px] animate-in fade-in zoom-in-95 duration-150 ${
              menuPos.openUpward ? "origin-bottom-right" : "origin-top-right"
            }`}
          >
            {item.is_deleted ? (
              /* Menu dành cho lớp học trong thùng rác */
              <>
                <button
                  type="button"
                  onClick={handleRestoreClick}
                  disabled={restoringId === item.id}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors text-left font-medium cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>Khôi phục lớp</span>
                </button>

                {isAdmin && (
                  <>
                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={handlePermanentDeleteClick}
                      disabled={restoringId === item.id}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Xóa vĩnh viễn</span>
                    </button>
                  </>
                )}
              </>
            ) : (
              /* Menu bình thường */
              <>
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
                  onClick={handleToggleStatusClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                >
                  {item.is_active ? (
                    <>
                      <EyeOff className="w-4 h-4 text-amber-500" />
                      <span>Tạm ẩn lớp</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-[#15803D]" />
                      <span>Hiện lại lớp</span>
                    </>
                  )}
                </button>

                {canSoftDelete && (
                  <>
                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Xóa lớp học</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
