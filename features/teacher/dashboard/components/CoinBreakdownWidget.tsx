"use client";

import Image from "next/image";
import { PieChart, Sparkles, Banknote } from "lucide-react";
import { DashboardCoinBreakdownStats } from "../types";

interface CoinBreakdownWidgetProps {
  stats: DashboardCoinBreakdownStats;
}

export function CoinBreakdownWidget({ stats }: CoinBreakdownWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs">
      {/* Header khối */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200/80 shrink-0">
          <PieChart className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-[#0F172A] font-heading">
            Cơ cấu nguồn xu tháng này
          </h2>
          <p className="text-[11px] text-slate-500">
            Phân bổ xu thưởng & quỹ quy đổi quà
          </p>
        </div>
      </div>

      {/* Tổng xu thưởng tháng này */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500">
          Tổng xu đã phát hành
        </span>
        <div className="inline-flex items-center gap-1.5 font-black text-base text-[#0F172A] font-heading tabular-nums">
          <Image
            src="/wheel/coin.webp"
            alt="Xu"
            width={16}
            height={16}
            style={{ height: "auto" }}
            className="w-4 h-4 select-none"
          />
          <span>+{stats.total_coins_awarded.toLocaleString("vi-VN")} xu</span>
        </div>
      </div>

      {/* Thanh Stacked Progress Bar hiển thị tỷ lệ nguồn xu */}
      <div className="h-2.5 w-full rounded-full overflow-hidden flex gap-0.5 bg-slate-100 mb-3.5">
        {stats.sources.map((src) => (
          <div
            key={src.id}
            style={{ width: `${src.percent}%` }}
            className={`${src.barColorClass} h-full transition-all duration-500`}
            title={`${src.label}: ${src.coins.toLocaleString("vi-VN")} xu (${src.percent}%)`}
          />
        ))}
      </div>

      {/* Chi tiết từng nguồn phát xu */}
      <div className="space-y-2.5">
        {stats.sources.map((src) => (
          <div
            key={src.id}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${src.dotColorClass}`}
              />
              <span className="text-slate-600 font-medium truncate">
                {src.label}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 tabular-nums">
              <span className="font-bold text-[#0F172A]">
                +{src.coins.toLocaleString("vi-VN")} xu
              </span>
              <span className="text-[11px] font-semibold text-slate-400 w-8 text-right">
                {src.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hai thẻ thống kê bổ trợ: Lượt quay & Giá trị quy đổi quà */}
      <div className="grid grid-cols-2 gap-2.5 pt-3.5 mt-4 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/70">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Lượt quay</span>
          </div>
          <div className="text-sm font-black text-[#0F172A] font-heading tabular-nums">
            {stats.total_wheel_spins} lượt
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mb-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Đã quy đổi</span>
          </div>
          <div className="text-sm font-black text-emerald-800 font-heading tabular-nums">
            {stats.total_exchanged_vnd.toLocaleString("vi-VN")}đ
          </div>
        </div>
      </div>
    </div>
  );
}
