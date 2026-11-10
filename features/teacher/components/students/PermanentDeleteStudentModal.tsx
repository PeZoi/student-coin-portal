"use client";

import { useEffect, useCallback } from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { StudentItem } from "./types";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface PermanentDeleteStudentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  item?: StudentItem | null;
  batchCount?: number;
  onConfirm?: () => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

/**
 * Modal xác nhận Xóa vĩnh viễn Học sinh (Dành riêng cho Quản trị viên)
 * Hỗ trợ cả 2 chế độ: Xóa 1 học sinh hoặc Xóa hàng loạt nhiều học sinh đã chọn trong thùng rác
 */
export function PermanentDeleteStudentModal(
  props?: PermanentDeleteStudentModalProps
) {
  const context = useManageStudentsContext();
  const isBatch = Boolean(
    props?.batchCount || context.isBatchPermanentModalOpen
  );

  const isOpen = isBatch
    ? (props?.isOpen ?? context.isBatchPermanentModalOpen)
    : (props?.isOpen ?? context.isPermanentModalOpen);

  const onClose = isBatch
    ? (props?.onClose ?? context.handleCloseBatchPermanentModal)
    : (props?.onClose ?? context.handleClosePermanentModal);

  const item =
    props?.item !== undefined ? props.item : context.permanentTargetStudent;
  const count = props?.batchCount ?? context.selectedIds.length;

  const onConfirm = isBatch
    ? (props?.onConfirm ?? context.handleConfirmBatchPermanentDelete)
    : (props?.onConfirm ?? context.handleConfirmPermanentDelete);

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

  if (!isOpen) return null;
  if (!isBatch && !item) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl border border-rose-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950">
                Xác nhận xóa vĩnh viễn
              </h3>
              <p className="text-xs text-rose-600 font-semibold mt-0.5">
                Cảnh báo: Hành động này KHÔNG THỂ HOÀN TÁC
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

        {/* Nội dung cảnh báo */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {isBatch ? (
              <>
                Bạn có chắc chắn muốn xóa vĩnh viễn{" "}
                <span className="font-bold text-rose-600">
                  {count} hồ sơ học sinh
                </span>{" "}
                đã chọn khỏi hệ thống không?
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ học sinh{" "}
                <span className="font-bold text-slate-900">
                  &quot;{item?.full_name}&quot;
                </span>{" "}
                (SĐT: {item?.phone_zalo}) khỏi hệ thống không?
              </>
            )}
          </p>

          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-900">
                Các tác động sau khi xóa vĩnh viễn:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                <li>Xóa toàn bộ số dư xu ví, tổng tích lũy và lượt quay may mắn.</li>
                <li>Xóa vĩnh viễn lịch sử nộp bài tập và điểm danh.</li>
                <li>Hủy bỏ toàn bộ quyền truy cập của số điện thoại này.</li>
              </ul>
            </div>
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
                <span>Đang xóa vĩnh viễn...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa vĩnh viễn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

