"use client";

import { Undo2 } from "lucide-react";
import { useWheelConfigContext } from "../contexts/WheelConfigContext";

/**
 * Header của trang Cấu hình vòng quay may mắn
 * - Tự truy xuất trực tiếp state từ WheelConfigContext (Quy tắc 10)
 */
export function WheelConfigHeader() {
  const { hasUnsavedChanges, handleResetAll } = useWheelConfigContext();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Cấu hình vòng quay
          </h1>

          {/* Badge Chưa Lưu Thay Đổi Toàn Trang kèm nút Đặt lại tất cả */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Có thay đổi chưa lưu</span>
              </span>

              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer active:scale-98 shadow-2xs"
                title="Hủy bỏ mọi thay đổi chưa lưu (cả cơ cấu ô và thiết lập kinh tế)"
              >
                <Undo2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Đặt lại tất cả</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Cơ cấu ô giải thưởng, trọng số xác suất hoàn xu và thiết lập chi phí mỗi lượt quay.
        </p>
      </div>
    </div>
  );
}
