"use client";

import {
  RotateCcw,
  Trash2,
  X,
  CheckSquare,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";

export function MissionsBatchBar() {
  const {
    isAdmin,
    canSoftDelete,
    selectedIds,
    statusFilter,
    handleClearSelection,
    handleBatchRestore,
    handleBatchActivate,
    handleBatchDeactivate,
    handleBatchSoftDelete,
    handleOpenBatchPermanentModal,
    isSubmitting,
    batchActionLoading,
  } = useManageMissionsContext();

  if (!canSoftDelete || selectedIds.length === 0) return null;

  const isDeletedTab = statusFilter === "deleted";
  const isAnyLoading = Boolean(batchActionLoading) || isSubmitting;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-200 border border-slate-700/80 max-w-[95vw] overflow-x-auto">
      <div className="flex items-center gap-2 text-sm font-medium shrink-0">
        <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
        <span>
          Đã chọn{" "}
          <strong className="text-white font-bold">{selectedIds.length}</strong>{" "}
          bài tập
        </span>
      </div>

      <div className="h-5 w-[1px] bg-slate-700 shrink-0" />

      <div className="flex items-center gap-2 shrink-0">
        {isDeletedTab ? (
          <>
            <Tooltip
              content="Khôi phục các bài tập đã chọn về trạng thái hoạt động"
              side="top"
            >
              <button
                type="button"
                onClick={() => handleBatchRestore()}
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

            {isAdmin && (
              <Tooltip
                content="Mở hộp thoại xác nhận xóa vĩnh viễn các bài tập đã chọn"
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
            )}
          </>
        ) : (
          <>
            <Tooltip
              content="Mở lại nhận bài cho tất cả bài tập đã chọn"
              side="top"
            >
              <button
                type="button"
                onClick={() => handleBatchActivate()}
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
                    <Eye className="w-4 h-4" />
                    <span>Mở nhận bài ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </Tooltip>

            <Tooltip
              content="Tạm đóng nhận bài các bài tập đã chọn"
              side="top"
            >
              <button
                type="button"
                onClick={() => handleBatchDeactivate()}
                disabled={isAnyLoading}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {batchActionLoading === "deactivate" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đóng...</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Tạm đóng ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </Tooltip>

            {canSoftDelete && (
              <Tooltip
                content="Chuyển tất cả bài tập đã chọn vào thùng rác"
                side="top"
              >
                <button
                  type="button"
                  onClick={() => handleBatchSoftDelete()}
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
            )}
          </>
        )}

        <Tooltip content="Bỏ chọn tất cả bài tập" side="top">
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
