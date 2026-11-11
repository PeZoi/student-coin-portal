"use client";

import {
  RotateCcw,
  Trash2,
  X,
  CheckSquare,
  Lock,
  Unlock,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

/**
 * Thanh tác vụ hàng loạt nổi (Floating Batch Action Bar) cho Học sinh
 * - Tự động hiển thị khi người dùng tích chọn ít nhất 1 checkbox học sinh
 * - Cho phép Kích hoạt, Tạm ngưng, Chuyển thùng rác, Khôi phục hoặc Xóa vĩnh viễn hàng loạt
 */
export function StudentsBatchBar() {
  const {
    selectedIds,
    statusFilter,
    handleClearSelection,
    handleBatchRestore,
    handleBatchActivate,
    handleBatchDeactivate,
    handleBatchSoftDelete,
    handleOpenBatchPermanentModal,
    handleOpenBatchChangeClass,
    isSubmitting,
    batchActionLoading,
  } = useManageStudentsContext();

  if (selectedIds.length === 0) return null;

  const isDeletedTab = statusFilter === "deleted";
  const isAnyLoading = Boolean(batchActionLoading) || isSubmitting;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-200 border border-slate-700/80 max-w-[95vw] overflow-x-auto">
      {/* Số lượng đã chọn */}
      <div className="flex items-center gap-2 text-sm font-medium shrink-0">
        <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
        <span>
          Đã chọn{" "}
          <strong className="text-white font-bold">{selectedIds.length}</strong>{" "}
          học sinh
        </span>
      </div>

      <div className="h-5 w-[1px] bg-slate-700 shrink-0" />

      {/* Các nút hành động hàng loạt */}
      <div className="flex items-center gap-2 shrink-0">
        {isDeletedTab ? (
          <>
            {/* Nút Khôi phục tất cả đã chọn */}
            <Tooltip
              content="Khôi phục các hồ sơ học sinh đã chọn về trạng thái đang học"
              side="top"
            >
              <button
                type="button"
                onClick={handleBatchRestore}
                disabled={isAnyLoading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {batchActionLoading === "restore" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang khôi phục...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Khôi phục ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </Tooltip>

            {/* Nút Xóa vĩnh viễn tất cả đã chọn */}
            <Tooltip
              content="Mở hộp thoại xác nhận xóa vĩnh viễn các hồ sơ đã chọn"
              side="top"
            >
              <button
                type="button"
                onClick={handleOpenBatchPermanentModal}
                disabled={isAnyLoading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {batchActionLoading === "delete_permanent" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa vĩnh viễn ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </Tooltip>
          </>
        ) : (
          <>
            {/* Nút Chuyển lớp hàng loạt */}
            <Tooltip content="Chuyển tất cả học sinh đã chọn sang lớp học khác" side="top">
              <button
                type="button"
                onClick={handleOpenBatchChangeClass}
                disabled={isAnyLoading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Chuyển lớp ({selectedIds.length})</span>
              </button>
            </Tooltip>

            {/* Nút Kích hoạt hàng loạt */}
            <Tooltip content="Kích hoạt trạng thái đang học cho các bạn đã chọn" side="top">
              <button
                type="button"
                onClick={handleBatchActivate}
                disabled={isAnyLoading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {batchActionLoading === "activate" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang mở...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Kích hoạt ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </Tooltip>

            {/* Nút Tạm ngưng hàng loạt */}
            <Tooltip content="Tạm ngưng học tập các học sinh đã chọn" side="top">
              <button
                type="button"
                onClick={handleBatchDeactivate}
                disabled={isAnyLoading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {batchActionLoading === "deactivate" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang ngưng...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Tạm ngưng ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </Tooltip>

            {/* Nút Chuyển thùng rác hàng loạt */}
            <Tooltip
              content="Chuyển tất cả học sinh đã chọn vào thùng rác"
              side="top"
            >
              <button
                type="button"
                onClick={handleBatchSoftDelete}
                disabled={isAnyLoading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {batchActionLoading === "delete_soft" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang chuyển...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Chuyển thùng rác ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </Tooltip>
          </>
        )}

        {/* Nút Bỏ chọn */}
        <Tooltip content="Bỏ chọn tất cả học sinh" side="top">
          <button
            type="button"
            onClick={handleClearSelection}
            disabled={isAnyLoading}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

