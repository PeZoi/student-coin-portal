"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileCheck2,
  MoreHorizontal,
  Pencil,
  EyeOff,
  Eye,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherMissionItem } from "../types";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";

interface MissionRowActionsProps {
  item: TeacherMissionItem;
  fullWidth?: boolean;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  right: number;
  openUpward: boolean;
}

const ESTIMATED_MENU_HEIGHT = 180;
const VIEWPORT_PADDING = 12;

export function MissionRowActions({
  item,
  fullWidth = false,
}: MissionRowActionsProps) {
  const {
    isAdmin,
    canSoftDelete,
    restoringId,
    handleOpenEditMission,
    handleOpenSubmissionsModal,
    handleToggleMissionStatus,
    handleOpenDeleteModal,
    handleRestoreMission,
    handleOpenPermanentModal,
  } = useManageMissionsContext();

  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition>({
    top: 0,
    right: 0,
    openUpward: false,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const hasPendingReview = item.pending_review_count > 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${
        fullWidth ? "w-full" : "justify-end"
      }`}
    >
      {/* Nút nhanh Xem bài nộp / Duyệt bài (khi chưa xóa) */}
      {!item.is_deleted && (
        <Tooltip
          content={
            hasPendingReview
              ? `Có ${item.pending_review_count} bài nộp đang chờ cô duyệt thưởng xu`
              : `Xem danh sách ${item.submitted_count} bài nộp của học sinh`
          }
          side="top"
        >
          <button
            type="button"
            onClick={() => handleOpenSubmissionsModal(item)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
              fullWidth ? "flex-1 h-10 px-4" : "h-9 px-3"
            } ${
              hasPendingReview
                ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80"
                : "bg-[#EAF2FF] hover:bg-[#D8E7FD] text-[#0A62D6]"
            }`}
          >
            <FileCheck2 className="w-4 h-4 shrink-0" />
            <span>
              {hasPendingReview
                ? `Duyệt bài (${item.pending_review_count})`
                : `Bài nộp (${item.submitted_count})`}
            </span>
          </button>
        </Tooltip>
      )}

      {/* Nút 3 chấm mở Popover qua Portal */}
      <Tooltip
        content={
          item.is_deleted ? "Thao tác khôi phục hoặc xóa" : "Thao tác khác"
        }
        side="top"
        disabled={isOpen}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggleMenu}
          disabled={restoringId === item.id}
          className={`rounded-xl flex items-center justify-center border bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0 ${
            fullWidth && item.is_deleted
              ? "w-full h-10 gap-2 px-3 text-xs font-semibold"
              : fullWidth
              ? "w-10 h-10"
              : "w-9 h-9"
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
          {fullWidth && item.is_deleted && (
            <span>Thao tác khôi phục / xóa vĩnh viễn</span>
          )}
        </button>
      </Tooltip>

      {/* Menu Popover qua Portal */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuPos.top !== undefined ? `${menuPos.top}px` : undefined,
              bottom:
                menuPos.bottom !== undefined
                  ? `${menuPos.bottom}px`
                  : undefined,
              right: `${menuPos.right}px`,
            }}
            className={`fixed z-50 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-1 text-[13px] animate-in fade-in zoom-in-95 duration-150 ${
              menuPos.openUpward ? "origin-bottom-right" : "origin-top-right"
            }`}
          >
            {item.is_deleted ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleRestoreMission(item);
                  }}
                  disabled={restoringId === item.id}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors text-left font-medium cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Khôi phục bài tập</span>
                </button>

                {isAdmin && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        handleOpenPermanentModal(item);
                      }}
                      disabled={restoringId === item.id}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Xóa vĩnh viễn</span>
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleOpenSubmissionsModal(item);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4 text-[#0A62D6] shrink-0" />
                  <span>Xem bài nộp & Tiến độ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleOpenEditMission(item);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Chỉnh sửa bài tập</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleToggleMissionStatus(item);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                >
                  {item.is_active ? (
                    <>
                      <EyeOff className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Tạm đóng nhận bài</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-[#15803D] shrink-0" />
                      <span>Mở lại nhận bài</span>
                    </>
                  )}
                </button>

                {canSoftDelete && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        handleOpenDeleteModal(item);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Chuyển vào thùng rác</span>
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
