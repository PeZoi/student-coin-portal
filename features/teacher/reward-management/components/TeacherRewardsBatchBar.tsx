"use client";

import { Check, X, Loader2, Sparkles } from "lucide-react";
import { useTeacherRewardsContext } from "../contexts/TeacherRewardsContext";

/**
 * Thanh tác vụ nổi duyệt hàng loạt yêu cầu đổi quà Heo Đất (Batch Action Bar)
 * - Tự động hiển thị khi giáo viên tick chọn từ 1 đơn trở lên
 * - Hiển thị số lượng đơn được chọn và tổng tiền VNĐ chi trả
 * - Cung cấp nút Duyệt đồng loạt các đơn chờ duyệt và nút Hủy chọn
 */
export function TeacherRewardsBatchBar() {
  const {
    selection,
    selectedPendingIds,
    selectedTotalVnd,
    handleBatchApproveSelected,
    isSubmittingAction,
  } = useTeacherRewardsContext();

  const count = selection.selectedIds.length;
  const pendingCount = selectedPendingIds.length;
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#0F172A] text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 backdrop-blur-md">
        {/* Thông tin số lượng & tổng tiền */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#0A62D6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {count}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold truncate">
              <span>Đang chọn {count} yêu cầu</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 hidden sm:inline" />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate">
              {pendingCount > 0 ? (
                <>
                  Có <strong className="text-amber-300 font-bold">{pendingCount}</strong> đơn chờ duyệt •{" "}
                </>
              ) : null}
              Tổng tiền:{" "}
              <strong className="text-emerald-400 font-bold">
                {selectedTotalVnd.toLocaleString("vi-VN")} đ
              </strong>
            </p>
          </div>
        </div>

        {/* Các nút thao tác */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Nút Bỏ chọn */}
          <button
            type="button"
            onClick={selection.handleClearSelection}
            disabled={isSubmittingAction}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bỏ chọn</span>
          </button>

          {/* Nút Duyệt hàng loạt (chỉ active khi có đơn pending) */}
          {pendingCount > 0 ? (
            <button
              type="button"
              onClick={handleBatchApproveSelected}
              disabled={isSubmittingAction}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0A62D6] hover:bg-[#084DB0] active:scale-95 text-white transition-all shadow-md shadow-[#0A62D6]/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang duyệt...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Duyệt ({pendingCount})</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/60 hidden sm:inline-block">
              Đã duyệt hết
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
