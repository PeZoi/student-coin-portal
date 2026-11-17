"use client";

import { Users, Coins, CheckCircle2, ShieldAlert } from "lucide-react";
import { StudentRosterKpiSkeleton } from "./StudentRosterSkeleton";
import { useOptionalStudentRosterContext } from "../contexts/StudentRosterContext";

interface StudentRosterKpiCardsProps {
  totalStudents?: number;
  totalCoins?: number;
  completionRate?: number;
  lockedPinCount?: number;
  isLoading?: boolean;
}

/**
 * Các thẻ thống kê KPI lớp học
 * - Thiết kế tối giản, sạch sẽ, đồng bộ 100% với hệ thống quản lý
 * - Tự động kết nối StudentRosterContext (Quy tắc 10)
 */
export function StudentRosterKpiCards(props?: StudentRosterKpiCardsProps) {
  const context = useOptionalStudentRosterContext();
  const totalStudents = props?.totalStudents ?? context?.kpiData.totalStudents ?? 0;
  const totalCoins = props?.totalCoins ?? context?.kpiData.totalCoins ?? 0;
  const completionRate = props?.completionRate ?? context?.kpiData.completionRate ?? 0;
  const lockedPinCount = props?.lockedPinCount ?? context?.kpiData.lockedPinCount ?? 0;
  const isLoading = props?.isLoading ?? context?.isLoading ?? false;

  if (isLoading) {
    return <StudentRosterKpiSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Sĩ số lớp */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left transition-all hover:shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Sĩ số lớp
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {totalStudents}
          </span>
          <span className="text-sm font-semibold text-slate-500">học sinh</span>
        </div>
      </div>

      {/* 2. Tổng xu Heo Đất */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left transition-all hover:shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Heo Đất tích lũy
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {totalCoins.toLocaleString("vi-VN")}
          </span>
          <span className="text-sm font-semibold text-slate-500">xu</span>
        </div>
      </div>

      {/* 3. Tỷ lệ hoàn thành bài tập */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left transition-all hover:shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Hoàn thành bài tập
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {completionRate}%
          </span>
          <span className="text-sm font-semibold text-slate-500">tiến độ</span>
        </div>
      </div>

      {/* 4. Cần hỗ trợ mã PIN */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs text-left transition-all hover:shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-[#475569]">
            Cần hỗ trợ PIN
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-extrabold text-[#0F172A] tracking-tight">
            {lockedPinCount}
          </span>
          <span className="text-sm font-semibold text-slate-500">học sinh</span>
        </div>
      </div>
    </div>
  );
}
