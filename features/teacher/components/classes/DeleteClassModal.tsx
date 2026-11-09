"use client";

import { useEffect, useCallback } from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { MockClassItem } from "./types";
import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";

interface DeleteClassModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  item?: MockClassItem | null;
  onConfirm?: () => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

/**
 * Modal xác nhận xóa lớp học
 * - Thiết kế rõ ràng, cảnh báo trực quan trước khi thực hiện hành động nhạy cảm
 * - Hỗ trợ cả hai chế độ: Tự động kết nối Feature Context hoặc nhận Props từ bên ngoài
 */
export function DeleteClassModal(props?: DeleteClassModalProps) {
  const context = useTeacherClassesContext();
  const isOpen = props?.isOpen ?? context.isDeleteModalOpen;
  const onClose = props?.onClose ?? context.handleCloseDeleteModal;
  const item = props?.item !== undefined ? props.item : context.deletingClass;
  const onConfirm = props?.onConfirm ?? context.handleConfirmDelete;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Đóng modal khi bấm phím Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Xác nhận xóa lớp học</h3>
              <p className="text-xs text-[#475569] mt-0.5">
                Thao tác này không thể hoàn tác
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung xác nhận */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Bạn có chắc chắn muốn xóa lớp học{" "}
            <span className="font-semibold text-slate-900">&quot;{item.class_name}&quot;</span>{" "}
            không?
          </p>

          <div className="rounded-xl bg-rose-50/70 border border-rose-200/70 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Lớp học này sẽ bị xóa khỏi danh sách quản lý. Thao tác này không thể hoàn tác, bạn có chắc chắn muốn tiếp tục?
            </span>
          </div>
        </div>

        {/* Footer thao tác */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
