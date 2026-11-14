"use client";

import { useMemo } from "react";
import {
  BarChart3,
  Sparkles,
  Play,
  RotateCw,
  RotateCcw,
  Award,
  Settings,
  Save,
  Undo2,
  Coins,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { WHEEL_CONSTANTS, WHEEL_PRIZE_TYPES } from "@/constants/wheel";
import { WheelSpinner } from "@/features/lucky-wheel/components/WheelSpinner";
import { useWheelConfigContext } from "../contexts/WheelConfigContext";
import { useWheelSimulator } from "../hooks/useWheelSimulator";
import { WheelPrizeImage } from "./WheelPrizeImage";

/**
 * Hàng 1 của Tab 1 (Thiết Lập & Mô Phỏng Vòng Quay):
 * - Cột Trái (6 phần) gồm 2 thẻ xếp chồng vừa khít chiều cao:
 *   + Thẻ Trên: Thiết Lập Chi Phí & Kỳ Vọng Lượt Quay
 *   + Thẻ Dưới: Cơ Cấu Tỷ Lệ Theo Loại Giải (nằm ngay dưới phí lượt quay)
 * - Cột Phải (6 phần): Vòng Quay Thử Nghiệm Trực Tiếp
 * - Tự truy xuất state từ WheelConfigContext (Quy tắc 10)
 */
export function WheelConfigAnalytics() {
  const {
    dynamicStats: stats,
    slots,
    settings,
    setSettings: onUpdateSettings,
    isEconomyDirty,
    isSavingEconomy,
    handleSaveEconomy: onSaveEconomy,
    handleResetEconomy: onResetEconomy,
  } = useWheelConfigContext();

  const {
    activeSlots,
    isSpinning,
    rotationAngle,
    lastWonSlot,
    handleTestSpin,
    handleResetSimulator,
  } = useWheelSimulator(slots);

  // Tính toán các chỉ số kỳ vọng toán học trên mỗi lượt quay (Expected Value) từ cấu hình thực tế
  const economyMetrics = useMemo(() => {
    const totalWeight = activeSlots.reduce(
      (sum, s) => sum + s.probability_weight,
      0
    );
    if (totalWeight <= 0) {
      return {
        expectedCoinPerSpin: 0,
        netSchoolPerSpin: settings.spin_cost,
        positiveWinRate: 0,
      };
    }

    const expectedCoinPerSpin = Math.round(
      activeSlots.reduce((sum, s) => {
        const prob = s.probability_weight / totalWeight;
        if (
          s.prize_type === WHEEL_PRIZE_TYPES.COIN ||
          s.prize_type === WHEEL_PRIZE_TYPES.DEDUCT_COIN
        ) {
          return sum + prob * s.reward_coins;
        }
        return sum;
      }, 0)
    );

    const netSchoolPerSpin = settings.spin_cost - expectedCoinPerSpin;

    const positiveWeight = activeSlots
      .filter(
        (s) =>
          s.prize_type === WHEEL_PRIZE_TYPES.COIN ||
          s.prize_type === WHEEL_PRIZE_TYPES.FREE_SPIN ||
          s.prize_type === WHEEL_PRIZE_TYPES.GIFT
      )
      .reduce((sum, s) => sum + s.probability_weight, 0);

    const positiveWinRate = Number(
      ((positiveWeight / totalWeight) * 100).toFixed(1)
    );

    return {
      expectedCoinPerSpin,
      netSchoolPerSpin,
      positiveWinRate,
    };
  }, [activeSlots, settings.spin_cost]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* CỘT TRÁI (6 phần): THẺ PHÍ LƯỢT QUAY Ở TRÊN + THẺ CƠ CẤU TỶ LỆ Ở DƯỚI */}
      <div className="lg:col-span-6 flex flex-col gap-5 justify-between">
        {/* THẺ TRÁI - TRÊN: Thiết Lập Chi Phí & Kỳ Vọng Lượt Quay */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Thiết Lập Chi Phí & Kỳ Vọng Lượt Quay
                </h3>
              </div>

              {isEconomyDirty ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Chưa lưu</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                  Đang áp dụng
                </span>
              )}
            </div>

            {/* Dòng điều chỉnh Phí mỗi lượt quay + Nút Lưu */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-slate-600 font-bold">
                  Phí mỗi lượt quay:
                </span>
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
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
                    className="w-16 h-7 text-xs font-black text-[#0F172A] bg-transparent outline-none text-center"
                  />
                  <span className="font-bold text-amber-600">xu / lượt</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onResetEconomy}
                  disabled={!isEconomyDirty}
                  title={
                    isEconomyDirty
                      ? "Hủy bỏ thay đổi chi phí và khôi phục về thiết lập ban đầu"
                      : "Hiện chưa có thay đổi nào để đặt lại"
                  }
                  className={`inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isEconomyDirty
                      ? "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs cursor-pointer active:scale-98"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Undo2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Đặt lại</span>
                </button>

                <button
                  type="button"
                  onClick={onSaveEconomy}
                  disabled={isSavingEconomy}
                  className={`inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0 disabled:opacity-60 ${
                    isEconomyDirty
                      ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/40 ring-offset-1"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEconomy ? "Đang lưu..." : "Lưu thiết lập"}</span>
                </button>
              </div>
            </div>

            {/* 3 Chỉ số Kỳ Vọng Toán Học (Expected Value) */}
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                  <Coins className="w-3 h-3" />
                  <span>Trả thưởng TB/lượt</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-black text-amber-900">
                  {economyMetrics.expectedCoinPerSpin >= 0
                    ? `+${economyMetrics.expectedCoinPerSpin.toLocaleString("vi-VN")} xu`
                    : `${economyMetrics.expectedCoinPerSpin.toLocaleString("vi-VN")} xu`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#0A62D6]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Thu hồi ròng/lượt</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-black text-slate-900">
                  {economyMetrics.netSchoolPerSpin >= 0
                    ? `+${economyMetrics.netSchoolPerSpin.toLocaleString("vi-VN")} xu`
                    : `${economyMetrics.netSchoolPerSpin.toLocaleString("vi-VN")} xu`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <TrendingUp className="w-3 h-3" />
                  <span>Tỷ lệ ô có quà</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-black text-emerald-800">
                  {economyMetrics.positiveWinRate}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              * Kỳ vọng toán học (EV) tính theo phí lượt quay và trọng số hiện tại.
            </span>
          </div>
        </div>

        {/* THẺ TRÁI - DƯỚI: Cơ Cấu Tỷ Lệ Theo Loại Giải (Nằm dưới phí lượt quay) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0A62D6] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Cơ Cấu Tỷ Lệ Theo Loại Giải
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {stats.categories.length} nhóm thưởng
              </span>
            </div>

            {/* Thanh phân bổ đa sắc Stacked Progress Bar */}
            <div className="mt-3.5">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                {stats.categories.map((cat) => (
                  <div
                    key={cat.type}
                    title={`${cat.label}: ${cat.percentage}%`}
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                    className="h-full transition-all hover:opacity-85"
                  />
                ))}
              </div>

              {/* Chi tiết từng nhóm */}
              <div className="mt-3.5 space-y-2">
                {stats.categories.map((cat) => (
                  <div
                    key={cat.type}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <WheelPrizeImage type={cat.type} size={20} />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({cat.slot_count} ô)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-slate-900">
                        {cat.percentage}%
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.badgeBg}`}
                      >
                        {cat.badgeText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              * Tỷ lệ tính toán tự động dựa trên tổng trọng số các ô đang bật.
            </span>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI (6 phần): Vòng Quay Thử Nghiệm Trực Tiếp */}
      <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Vòng Quay Thử Nghiệm Trực Tiếp
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#0A62D6] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
              Đang bật {activeSlots.length} ô
            </span>
          </div>

          {/* Đĩa Vòng Quay Thử Nghiệm */}
          <div className="py-2 flex flex-col items-center justify-center">
            <WheelSpinner
              mode="simulator"
              prizes={activeSlots}
              rotation={rotationAngle}
              isSpinning={isSpinning}
              transitionDurationMs={WHEEL_CONSTANTS.SIMULATOR_SPIN_DURATION_MS}
              onSpin={handleTestSpin}
            />

            {/* Cụm nút điều khiển quay thử & đặt lại */}
            <div className="mt-1.5 flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={handleTestSpin}
                  disabled={isSpinning || activeSlots.length === 0}
                  className={`inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer ${
                    isSpinning
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-[1.02] active:scale-98"
                  }`}
                >
                  {isSpinning ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Đang quay thử...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Bấm Để Quay Thử</span>
                    </>
                  )}
                </button>

                {rotationAngle > 0 && !isSpinning && (
                  <button
                    type="button"
                    onClick={handleResetSimulator}
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-98"
                    title="Đặt lại kim chỉ và góc quay về trạng thái 0 độ ban đầu"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Đặt lại vị trí</span>
                  </button>
                )}
              </div>

              {/* Khối hiển thị kết quả với chiều cao cố định (min-h-8) để không làm giật bố cục */}
              <div className="min-h-8 flex items-center justify-center">
                {lastWonSlot && !isSpinning ? (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 animate-in fade-in zoom-in-95">
                    <Award className="w-3.5 h-3.5 text-[#0A62D6] shrink-0" />
                    <span>Kết quả quay thử:</span>
                    <span className="text-[#0A62D6] font-extrabold">
                      {lastWonSlot.label}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Nhấn nút &ldquo;QUAY THỬ NGHIỆM&rdquo; ở tâm vòng quay để kiểm tra xác suất
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            * Mô phỏng trực tiếp theo trọng số các ô đang bật (không trừ xu học sinh).
          </span>
        </div>
      </div>
    </div>
  );
}
