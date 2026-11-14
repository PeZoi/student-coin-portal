"use client";

import {
  PieChart,
  RotateCw,
  Coins,
  Percent,
} from "lucide-react";
import { useWheelConfigContext } from "../contexts/WheelConfigContext";

/**
 * Thẻ KPI Thống Kê của Cấu hình vòng quay
 * - Tự truy xuất dynamicStats từ WheelConfigContext (Quy tắc 10)
 */
export function WheelConfigStatsKPI() {
  const { dynamicStats: stats } = useWheelConfigContext();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Cân bằng xác suất */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Cân bằng xác suất
          </span>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              stats.is_weight_balanced
                ? "bg-[#ECFDF3] text-[#15803D]"
                : "bg-[#FFF1F2] text-[#E11D48]"
            }`}
          >
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {stats.total_weight}%
          </span>
          <span className="text-sm font-semibold text-slate-500">
            {stats.is_weight_balanced ? "/ 100% chuẩn" : "chưa cân bằng"}
          </span>
        </div>
      </div>

      {/* 2. Tổng lượt quay */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tổng lượt quay
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <RotateCw className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {(stats.total_historical_spins ?? 0).toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">lượt</span>
        </div>
      </div>

      {/* 3. Dòng tiền xu ròng */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Dòng tiền xu ròng
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {stats.net_coins_flow > 0 ? "+" : ""}
            {stats.net_coins_flow.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">xu</span>
        </div>
      </div>

      {/* 4. Tỷ lệ hoàn trả */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tỷ lệ hoàn xu
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {stats.rtp_rate}%
          </span>
          <span className="text-sm font-semibold text-slate-500">hoàn trả</span>
        </div>
      </div>
    </div>
  );
}
