"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

interface WheelConfigHeaderProps {
  totalWeight: number;
  isBalanced: boolean;
}

/**
 * Header của trang Cấu hình vòng quay may mắn
 * - Thiết kế tối giản, tập trung vào tiêu đề và trạng thái cân bằng xác suất
 * - Đã chuyển toàn bộ các nút thao tác xuống các khối chứa số liệu tương ứng
 */
export function WheelConfigHeader({
  totalWeight,
  isBalanced,
}: WheelConfigHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Tiêu đề & Trạng thái cân bằng xác suất */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Cấu hình vòng quay
          </h1>
        </div>

        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Cơ cấu ô giải thưởng, trọng số xác suất hoàn xu và thiết lập chi phí mỗi lượt quay.
        </p>
      </div>
    </div>
  );
}
