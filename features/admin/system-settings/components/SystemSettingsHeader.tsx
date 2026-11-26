"use client";

import { RotateCcw, Save } from "lucide-react";

interface SystemSettingsHeaderProps {
  hasChanges: boolean;
  onReset: () => void;
  onSave: () => void;
}

/**
 * Header trang Cài đặt hệ thống
 * - Đồng bộ 100% phong cách với các trang Giáo viên / Quản trị (Đổi quà, Vòng quay, Giao bài tập)
 */
export function SystemSettingsHeader({
  hasChanges,
  onReset,
  onSave,
}: SystemSettingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Cài đặt hệ thống
          </h1>
          {hasChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Có thay đổi chưa lưu</span>
            </span>
          )}
        </div>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Thiết lập bảo mật đăng nhập, quy đổi xu Heo Đất, lịch mở đổi quà, thưởng thi đua tháng và hỗ trợ chấm bài AI.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer active:scale-98"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>Đặt lại mặc định</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-[#0A62D6] hover:bg-[#084FB0] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>Lưu cài đặt</span>
        </button>
      </div>
    </div>
  );
}
