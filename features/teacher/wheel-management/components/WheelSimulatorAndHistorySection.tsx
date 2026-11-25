"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  Award,
  TrendingUp,
  TrendingDown,
  History,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  WHEEL_CONSTANTS,
  WHEEL_PRIZE_TYPES,
  WHEEL_ASSETS,
} from "@/constants/wheel";
import { WheelSpinHistoryItem } from "../types";
import { useWheelConfigContext } from "../contexts/WheelConfigContext";
import { useWheelSpinHistoryInfinite } from "../hooks/useWheelSpinHistoryInfinite";
import { WheelPrizeImage } from "./WheelPrizeImage";

/**
 * Badge hiển thị phần thưởng tại mỗi dòng lịch sử quay của học sinh
 */
function SpinHistoryPrizeBadge({ item }: { item: WheelSpinHistoryItem }) {
  if (item.reward_coins > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black shrink-0">
        <WheelPrizeImage type={WHEEL_PRIZE_TYPES.COIN} size={16} />
        <span>+{item.reward_coins.toLocaleString("vi-VN")} xu</span>
      </span>
    );
  }

  if (
    item.reward_coins < 0 ||
    item.prize_type_snapshot === WHEEL_PRIZE_TYPES.DEDUCT_COIN
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black shrink-0">
        <WheelPrizeImage type={WHEEL_PRIZE_TYPES.DEDUCT_COIN} size={16} />
        <span>
          {item.reward_coins < 0
            ? `${item.reward_coins.toLocaleString("vi-VN")} xu`
            : item.prize_label_snapshot}
        </span>
      </span>
    );
  }

  if (
    item.prize_type_snapshot === WHEEL_PRIZE_TYPES.FREE_SPIN ||
    item.reward_free_spins > 0
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black shrink-0">
        <WheelPrizeImage type={WHEEL_PRIZE_TYPES.FREE_SPIN} size={16} />
        <span>+{item.reward_free_spins || 1} lượt quay</span>
      </span>
    );
  }

  if (item.prize_type_snapshot === WHEEL_PRIZE_TYPES.LUCK) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold shrink-0">
        <WheelPrizeImage type={WHEEL_PRIZE_TYPES.LUCK} size={16} />
        <span className="truncate max-w-[130px]">
          {item.prize_label_snapshot}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-black shrink-0">
      <WheelPrizeImage type={WHEEL_PRIZE_TYPES.GIFT} size={16} />
      <span className="truncate max-w-[130px]">
        {item.prize_label_snapshot}
      </span>
    </span>
  );
}

/**
 * Tab 2 (Top Ô Trúng & Lịch Sử Quay Thưởng):
 * - Cột Trái (6 phần): Top Ô Hay Trúng Nhất (Thực Tế vs Lý Thuyết)
 * - Cột Phải (6 phần): Lịch Sử Quay Thưởng Thực Tế (20 lượt / trang + Infinite Scroll)
 * - Tự truy xuất state từ WheelConfigContext (Quy tắc 10)
 */
export function WheelSimulatorAndHistorySection() {
  const { dynamicStats: stats, initialSpinHistory } = useWheelConfigContext();

  const {
    spinHistoryItems,
    totalCount,
    isInitialLoading,
    isLoadingMore,
    isReachingEnd,
    isEmpty,
    isValidating,
    containerRef,
    sentinelRef,
    mutate,
  } = useWheelSpinHistoryInfinite(initialSpinHistory);

  const hasRealSpins = (stats.total_historical_spins ?? 0) > 0;

  // Chỉ lấy các ô đã thực sự có người quay trúng (total_hits > 0) khi hiển thị Top Ô Hay Trúng Nhất
  const hitItems = useMemo(
    () => stats.top_frequent_items.filter((item) => item.total_hits > 0),
    [stats.top_frequent_items]
  );

  const accuracyRate = useMemo(() => {
    if (!hasRealSpins || hitItems.length === 0) return null;
    const avgDeviation =
      hitItems.reduce((sum, item) => sum + Math.abs(item.diff_percent), 0) /
      hitItems.length;
    return Math.max(0, Number((100 - avgDeviation).toFixed(1)));
  }, [hasRealSpins, hitItems]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* CỘT TRÁI (6 phần): TOP Ô HAY TRÚNG NHẤT (THỰC TẾ VS LÝ THUYẾT) */}
      <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Top Ô Hay Trúng Nhất (Thực Tế vs Lý Thuyết)
              </h3>
            </div>
            {accuracyRate !== null ? (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                Độ khớp {accuracyRate}%
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 rounded-full">
                Chưa có lượt quay
              </span>
            )}
          </div>

          {!hasRealSpins || hitItems.length === 0 ? (
            <div className="flex-1 min-h-[380px] flex flex-col items-center justify-center text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                <Award className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Chưa có học sinh nào thực hiện lượt quay
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Khi có học sinh quay trúng thưởng, bảng xếp hạng các ô hay trúng nhất và độ lệch thực tế sẽ tự động tổng hợp tại đây.
              </p>
            </div>
          ) : (
            <div className="mt-3.5 space-y-2.5 flex-1">
              {hitItems.map((item, idx) => {
                const isPositive = item.diff_percent >= 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 hover:border-slate-300 bg-white transition-all hover:shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800"
                            : idx === 1
                            ? "bg-slate-200 text-slate-700"
                            : idx === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <WheelPrizeImage type={item.prize_type} size={18} />
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            (Ô #{item.slot_order})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Đã trúng:{" "}
                          <b className="text-slate-700">
                            {item.total_hits.toLocaleString("vi-VN")} lần
                          </b>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <div className="text-[10px] text-slate-400">
                          Lý thuyết
                        </div>
                        <div className="text-xs font-bold text-slate-700">
                          {item.expected_rate.toFixed(1)}%
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400">
                          Thực tế
                        </div>
                        <div className="text-xs font-black text-slate-900">
                          {item.actual_rate.toFixed(1)}%
                        </div>
                      </div>

                      <div className="w-16">
                        <span
                          className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-2.5 h-2.5" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5" />
                          )}
                          <span>
                            {isPositive
                              ? `+${item.diff_percent}%`
                              : `${item.diff_percent}%`}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {hasRealSpins
              ? `* Tổng hợp từ ${(stats.total_historical_spins ?? 0).toLocaleString("vi-VN")} lượt quay thực tế của học sinh.`
              : "* Dữ liệu sẽ tự động cập nhật ngay khi có lượt quay đầu tiên."}
          </span>
        </div>
      </div>

      {/* CỘT PHẢI (6 phần): LỊCH SỬ QUAY THƯỞNG THỰC TẾ (20 LƯỢT / TRANG + INFINITE SCROLL) */}
      <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header Lịch Sử Quay */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Lịch Sử Quay Thưởng Thực Tế
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                Tổng {totalCount.toLocaleString("vi-VN")} lượt quay
              </span>
              <button
                type="button"
                onClick={() => mutate()}
                disabled={isInitialLoading || isLoadingMore}
                title="Làm mới lịch sử vòng quay"
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isValidating && !isLoadingMore ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Danh sách cuộn vô tận (Infinite Scroll Container) */}
          <div
            ref={containerRef}
            className="mt-3.5 h-[380px] overflow-y-auto pr-1.5 space-y-2 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]"
          >
            {isInitialLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-15 rounded-xl bg-slate-100/80 animate-pulse border border-slate-100"
                />
              ))
            ) : isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                  <History className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  Chưa có lịch sử lượt quay nào
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Khi học sinh quay thưởng tại trang Vòng Quay May Mắn, lịch sử sẽ tự động hiển thị tại đây.
                </p>
              </div>
            ) : (
              <>
                {spinHistoryItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200/70 hover:border-slate-300 bg-white hover:bg-slate-50/50 transition-all"
                  >
                    {/* Bên trái: STT + Avatar + Tên Học Sinh + Lớp + Thời gian */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 text-center text-[11px] font-bold text-slate-400 shrink-0">
                        #{index + 1}
                      </span>

                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <Image
                          src={item.avatar_url || WHEEL_ASSETS.DEFAULT_AVATAR}
                          alt={item.student_name}
                          fill
                          unoptimized
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.student_name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-[#0A62D6] border border-blue-100 shrink-0">
                            {item.class_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.created_at}</span>
                          </span>
                          <span>•</span>
                          <span>
                            {item.is_free_spin ? (
                              <b className="text-emerald-600 font-semibold">
                                Lượt miễn phí
                              </b>
                            ) : (
                              <span>
                                Phí quay:{" "}
                                <b className="text-slate-600">
                                  -{item.spin_cost.toLocaleString("vi-VN")} xu
                                </b>
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bên phải: Phần thưởng trúng (Snapshot) */}
                    <SpinHistoryPrizeBadge item={item} />
                  </div>
                ))}

                {/* Sentinel Element kích hoạt tải thêm 20 bản ghi tiếp theo khi cuộn tới đáy */}
                <div
                  ref={sentinelRef}
                  className="py-3 flex items-center justify-center text-xs"
                >
                  {isLoadingMore ? (
                    <div className="inline-flex items-center gap-2 text-slate-500 font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin text-[#0A62D6]" />
                      <span>
                        Đang tải thêm {WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT} lượt quay tiếp theo...
                      </span>
                    </div>
                  ) : isReachingEnd ? (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>
                        Đã hiển thị toàn bộ {spinHistoryItems.length.toLocaleString("vi-VN")} lượt quay
                      </span>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>
            * Tự động tải {WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT} lượt quay mỗi lần cuộn xuống cuối danh sách.
          </span>
          <span>
            Đã tải:{" "}
            <b className="text-slate-600">
              {spinHistoryItems.length}/{totalCount}
            </b>
          </span>
        </div>
      </div>
    </div>
  );
}
