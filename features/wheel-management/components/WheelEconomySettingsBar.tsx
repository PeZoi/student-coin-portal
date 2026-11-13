"use client";

import { Settings, Play, Save, Undo2 } from "lucide-react";
import { WheelGeneralSettings } from "../types";

interface WheelEconomySettingsBarProps {
  settings: WheelGeneralSettings;
  isDirty?: boolean;
  isSaving?: boolean;
  onUpdateSettings: (newSettings: WheelGeneralSettings) => void;
  onSaveEconomy: () => void;
  onResetEconomy?: () => void;
  onOpenSimulator: () => void;
}

/**
 * Khối Thiết Lập Kinh Tế Vòng Quay
 * - Chứa số liệu kinh tế: Phí quay, lượt quay miễn phí hàng ngày
 * - Nút "Lưu thiết lập" đặt ngay tại khối số liệu
 * - Nút "Quay thử nghiệm 🎡" duy nhất, giao diện phẳng, thanh lịch
 */
export function WheelEconomySettingsBar({
  settings,
  isDirty = false,
  isSaving = false,
  onUpdateSettings,
  onSaveEconomy,
  onResetEconomy,
  onOpenSimulator,
}: WheelEconomySettingsBarProps) {
  return (
    <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* 1. Nhóm Tham Số Kinh Tế & Nút Lưu Thiết Lập Ngay Cạnh Số Liệu */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mr-1">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0A62D6] flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <span>Cấu hình:</span>
        </div>

        {/* Phí mỗi lượt quay */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Phí mỗi lượt:</span>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
            <input
              type="number"
              min="0"
              value={settings.spin_cost}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  spin_cost: Number(e.target.value) || 0,
                })
              }
              className="w-14 h-7 text-xs font-bold text-[#0F172A] bg-transparent outline-none text-center"
            />
            <span className="font-bold text-amber-600">xu / lượt</span>
          </div>
        </div>

        {/* Free Spin mỗi ngày */}
        {/* <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.allow_free_spin}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  allow_free_spin: e.target.checked,
                })
              }
              className="w-4 h-4 rounded text-[#0A62D6] cursor-pointer"
            />
            <span className="text-slate-600 font-semibold">Free Spin:</span>
          </label>

          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border transition-all ${
              settings.allow_free_spin
                ? "bg-slate-50 border-slate-200"
                : "bg-slate-100 border-slate-200/60 opacity-50"
            }`}
          >
            <input
              type="number"
              min="1"
              max="5"
              disabled={!settings.allow_free_spin}
              value={settings.daily_free_spins}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  daily_free_spins: Number(e.target.value) || 0,
                })
              }
              className="w-10 h-7 text-xs font-bold text-[#0F172A] bg-transparent outline-none text-center disabled:cursor-not-allowed"
            />
            <span className="font-bold text-emerald-600">lượt / ngày</span>
          </div>
        </div> */}

        {/* Badge Chưa lưu kinh tế */}
        {isDirty && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse shadow-2xs shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>Chưa lưu</span>
          </span>
        )}

        {/* Nút Đặt lại cấu hình kinh tế ban đầu */}
        {onResetEconomy && (
          <button
            type="button"
            onClick={onResetEconomy}
            disabled={!isDirty}
            title={
              isDirty
                ? "Hủy bỏ thay đổi chi phí và khôi phục về thiết lập ban đầu"
                : "Hiện chưa có thay đổi nào để đặt lại"
            }
            className={`inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ml-1 ${
              isDirty
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs cursor-pointer active:scale-98"
                : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
            }`}
          >
            <Undo2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Đặt lại</span>
          </button>
        )}

        {/* Nút Lưu Cấu Hình Kinh Tế - Đặt ngay tại nơi có số liệu */}
        <button
          type="button"
          onClick={onSaveEconomy}
          disabled={isSaving}
          className={`inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0 disabled:opacity-60 ${
            isDirty
              ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/40 ring-offset-1 shadow-md shadow-emerald-600/20"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Đang lưu..." : "Lưu thiết lập"}</span>
        </button>
      </div>

      {/* 2. Nút Bấm Mở Vòng Quay Thử Nghiệm Duy Nhất - Style Phẳng Thanh Lịch */}
      <button
        type="button"
        onClick={onOpenSimulator}
        className="inline-flex items-center justify-center gap-2 h-9.5 px-4.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-98 shrink-0 self-start lg:self-auto"
      >
        <Play className="w-3.5 h-3.5 fill-white" />
        <span>Quay thử nghiệm 🎡</span>
      </button>
    </div>
  );
}
