"use client";

import { Download, RotateCw, Coins } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface StudentRosterHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onExportExcel?: () => void;
  onQuickAward?: () => void;
}

/**
 * Header của trang Danh sách học sinh (Góc giáo viên)
 * - Đồng bộ 100% phong cách thiết kế với Quản lý học sinh, Quản lý lớp học và Giao bài tập
 * - Hiển thị tiêu đề và các nút thao tác nhanh
 */
export function StudentRosterHeader({
  onRefresh,
  isRefreshing = false,
  onExportExcel,
  onQuickAward,
}: StudentRosterHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Hồ sơ học sinh
          </h1>
        </div>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Theo dõi thông tin học sinh, tiến độ rèn luyện, Heo Đất tích lũy và hỗ trợ mã PIN.
        </p>
      </div>

      {/* Cụm nút hành động bên phải */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {onRefresh && (
          <Tooltip content="Làm mới dữ liệu" side="bottom">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-10 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-60"
            >
              <RotateCw
                className={`w-4 h-4 text-slate-600 ${
                  isRefreshing ? "animate-spin text-[#0A62D6]" : ""
                }`}
              />
            </button>
          </Tooltip>
        )}

        <button
          type="button"
          onClick={onExportExcel}
          className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Xuất Excel</span>
        </button>

        <button
          type="button"
          onClick={onQuickAward}
          className="h-10 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <Coins className="w-4 h-4" />
          <span>Thưởng nóng xu</span>
        </button>
      </div>
    </div>
  );
}
