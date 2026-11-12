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
import { StudentItem } from "@/features/student-management/types";
import { Tooltip } from "@/components/ui/tooltip";
import { useManageStudentsContext } from "@/features/student-management/contexts/ManageStudentsContext";

interface StudentRowActionsProps {
  item: StudentItem;
  fullWidth?: boolean;
  onChangeClass?: (item: StudentItem) => void;
  onEdit?: (item: StudentItem) => void;
  onAdjustCoins?: (item: StudentItem) => void;
  onResetPin?: (item: StudentItem) => void;
  onToggleStatus?: (item: StudentItem) => void;
  onUnlock?: (item: StudentItem) => void;
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
  onUnlock,
  onDelete,
  onRestore,
  onPermanentDelete,
  isRestoring = false,
}: StudentRowActionsProps) {
  const context = useManageStudentsContext();
  const isAdmin = context.isAdmin;
  const canSoftDelete = context.canSoftDelete;
  const handleUnlockAction = onUnlock ?? context.handleUnlockStudent;
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

  const handleUnlockClick = () => {
    setIsOpen(false);
    handleUnlockAction?.(item);
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    if (onDelete) {
      onDelete(item);
    }
  };

  const isLocked = Boolean(
    item.lock_remaining_text ||
      (item.failed_login_attempts !== undefined &&
        item.failed_login_attempts >= 5)
  );

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${
        fullWidth ? "w-full" : "justify-end"
      }`}
    >
      {/* Nút thao tác (nút 3 chấm trên Desktop, nút bấm rộng trên Mobile) */}
      <Tooltip content={item.is_deleted ? "Thao tác khôi phục hoặc xóa" : "Thao tác"} side="top">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggleMenu}
          disabled={isRestoring}
          className={`rounded-xl flex items-center justify-center border bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0 shadow-2xs ${
            fullWidth ? "w-full h-9 gap-2 px-3 text-xs font-semibold text-slate-700" : "w-9 h-9"
          } ${
            item.is_deleted
              ? "border-rose-200/90 text-rose-600 hover:bg-rose-50/50"
              : "border-slate-200"
          }`}
        >
          {isRestoring ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          ) : (
            <MoreHorizontal className="w-4 h-4" />
          )}
          {fullWidth && <span>{item.is_deleted ? "Thao tác xóa/khôi phục" : "Thao tác"}</span>}
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
            {item.is_deleted ? (
              /* Menu dành riêng cho học sinh trong thùng rác */
              <>
                <button
                  type="button"
                  onClick={handleRestoreClick}
                  disabled={isRestoring}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors text-left font-medium cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>Khôi phục hồ sơ</span>
                </button>

                {isAdmin && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={handlePermanentDeleteClick}
                      disabled={isRestoring}
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
                {/* Nếu học sinh đang bị khóa PIN, cho phép mở khóa tức thì */}
                {isLocked && (
                  <button
                    type="button"
                    onClick={handleUnlockClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors text-left font-bold cursor-pointer"
                  >
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span>Mở khóa PIN tức thì</span>
                  </button>
                )}

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
                  onClick={handleChangeClassClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                  <span>Chuyển sang lớp khác</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdjustCoinsClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Thưởng xu / Lượt quay</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetPinClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#0A62D6]" />
                  <span>Đặt lại mã PIN</span>
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

                {canSoftDelete && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Xóa hồ sơ học sinh</span>
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

