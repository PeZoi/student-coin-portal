"use client";

import { RotateCcw, Trash2, X, CheckSquare } from "lucide-react";
import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";

/**
 * Thanh tác vụ hàng loạt nổi (Floating Batch Action Bar)
 * - Tự động hiển thị khi người dùng tích chọn ít nhất 1 checkbox lớp học
 * - Cho phép Khôi phục hoặc Xóa vĩnh viễn hàng loạt cùng 1 lúc
 */
export function ClassesBatchBar() {
  const {
    selectedIds,
    statusFilter,
    handleClearSelection,
    handleBatchRestore,
    handleOpenBatchPermanentModal,
    isSubmitting,
  } = useTeacherClassesContext();

  if (selectedIds.length === 0) return null;

  const isDeletedTab = statusFilter === "deleted";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-200 border border-slate-700 max-w-[95vw]">
      {/* Số lượng đã chọn */}
      <div className="flex items-center gap-2 text-sm font-medium shrink-0">
        <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
        <span>
          Đã chọn <strong className="text-white font-bold">{selectedIds.length}</strong> lớp
        </span>
      </div>

      <div className="h-5 w-[1px] bg-slate-700 shrink-0" />

      {/* Các nút hành động hàng loạt */}
      <div className="flex items-center gap-2 shrink-0">
        {isDeletedTab ? (
          <>
            {/* Nút Khôi phục tất cả đã chọn */}
            <button
              type="button"
              onClick={handleBatchRestore}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục ({selectedIds.length})</span>
            </button>

            {/* Nút Xóa vĩnh viễn tất cả đã chọn */}
            <button
              type="button"
              onClick={handleOpenBatchPermanentModal}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa vĩnh viễn ({selectedIds.length})</span>
            </button>
          </>
        ) : (
          /* Nếu ở tab thông thường mà chọn nhiều: hỗ trợ chuyển thùng rác hàng loạt nếu cần */
          <button
            type="button"
            onClick={handleOpenBatchPermanentModal}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa đã chọn ({selectedIds.length})</span>
          </button>
        )}

        {/* Nút Bỏ chọn */}
        <button
          type="button"
          onClick={handleClearSelection}
          title="Bỏ chọn tất cả"
          className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
