"use client";

import { CheckCheck } from "lucide-react";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";

interface SubmissionsHeaderProps {
  validAiPendingCount?: number;
  onBatchApproveValid?: () => void;
}

/**
 * Header của Studio Duyệt bài tập
 * - Hiển thị tiêu đề trang, mô tả hướng dẫn và nút thao tác Duyệt nhanh bài hợp lệ
 * - Các chỉ số KPI đã được tách riêng thành <SubmissionsKpiCards /> chuẩn hóa
 */
export function SubmissionsHeader(props?: SubmissionsHeaderProps) {
  const context = useManageSubmissionsContext();
  const validAiPendingCount =
    props?.validAiPendingCount ?? context.validAiPendingCount;
  const handleBatchApproveValid =
    props?.onBatchApproveValid ?? context.handleBatchApproveValid;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
          Duyệt bài tập
        </h1>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Soi ảnh vở viết tay đa trang (1–5 ảnh), đối chiếu lỗi AI phát hiện và duyệt thưởng xu Heo Đất.
        </p>
      </div>

      {validAiPendingCount > 0 && (
        <button
          type="button"
          onClick={handleBatchApproveValid}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
        >
          <CheckCheck className="w-4 h-4 shrink-0" />
          <span>Duyệt nhanh bài hợp lệ ({validAiPendingCount})</span>
        </button>
      )}
    </div>
  );
}
