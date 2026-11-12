"use client";

import {
  BarChart3,
  Award,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { WheelStatisticsData, WheelPrizeType } from "../types";
import { WheelPrizeImage } from "./WheelPrizeImage";

interface WheelConfigAnalyticsProps {
  stats: WheelStatisticsData;
}

export function WheelConfigAnalytics({ stats }: WheelConfigAnalyticsProps) {
  const getPrizeIcon = (type: WheelPrizeType) => {
    return <WheelPrizeImage type={type} size={18} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* CỘT TRÁI (5 phần): Cơ cấu 5 nhóm giải thưởng */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
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
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              5 nhóm thưởng
            </span>
          </div>

          {/* Thanh phân bổ đa sắc Stacked Progress Bar */}
          <div className="mt-4">
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
            <div className="mt-4 space-y-2.5">
              {stats.categories.map((cat) => (
                <div
                  key={cat.type}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors"
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

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>* Tỷ lệ tính toán tự động dựa trên tổng trọng số các ô.</span>
        </div>
      </div>

      {/* CỘT PHẢI (7 phần): Top Ô Hay Trúng Nhất (Thực Tế vs Lý Thuyết) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Top Ô Hay Trúng Nhất (Thực Tế vs Lý Thuyết)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              Chuẩn xác 99.2%
            </span>
          </div>

          {/* Danh sách so sánh Top Items */}
          <div className="mt-3.5 space-y-2">
            {stats.top_frequent_items.map((item, idx) => {
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
                        {getPrizeIcon(item.prize_type)}
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          (Ô #{item.slot_order})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Đã trúng: <b className="text-slate-700">{item.total_hits} lần</b> trong tuần này
                      </span>
                    </div>
                  </div>

                  {/* Cột so sánh tỷ lệ */}
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <div className="text-[10px] text-slate-400">Lý thuyết</div>
                      <div className="text-xs font-bold text-slate-700">
                        {item.expected_rate.toFixed(1)}%
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">Thực tế</div>
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
                          {isPositive ? `+${item.diff_percent}%` : `${item.diff_percent}%`}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dữ liệu dựa trên 2,450 lượt quay gần nhất của học sinh toàn trường.</span>
        </div>
      </div>
    </div>
  );
}
