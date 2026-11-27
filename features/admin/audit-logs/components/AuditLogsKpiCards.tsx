"use client";

import { Activity, CheckCircle2, History, ShieldAlert } from "lucide-react";
import { useAuditLogsContext } from "../contexts/AuditLogsContext";

/**
 * 4 Thẻ KPI thống kê tổng quan cho trang Nhật ký an ninh
 * - Đồng bộ 100% thiết kế với StudentsKpiCards
 */
export function AuditLogsKpiCards() {
  const { kpiStats } = useAuditLogsContext();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng lượt truy cập */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Tổng lượt truy cập
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {kpiStats.totalAuthLogs.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">lượt</span>
        </div>
      </div>

      {/* 2. Đăng nhập thành công */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Truy cập hợp lệ
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {kpiStats.successAuthCount.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">lượt</span>
        </div>
      </div>

      {/* 3. Cảnh báo thất bại */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Cảnh báo thất bại
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {kpiStats.failedAuthCount.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">cảnh báo</span>
        </div>
      </div>

      {/* 4. Thao tác dữ liệu */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Thao tác dữ liệu
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight tabular-nums">
            {kpiStats.totalActivityLogs.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">bản ghi</span>
        </div>
      </div>
    </div>
  );
}
