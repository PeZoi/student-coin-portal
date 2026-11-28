"use client";

import { Calendar, CheckCircle2, HelpCircle } from "lucide-react";
import { TeacherSelect } from "@/components/ui/TeacherSelect";
import { Tooltip } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/date";
import { useLeaderboardContext } from "../contexts/LeaderboardContext";

/**
 * Header trang Bảng xếp hạng thi đua
 * - Đồng bộ 100% typography, spacing và control với các trang quản trị chuẩn
 */
export function LeaderboardHeader() {
  const {
    selectedMonthKey,
    setSelectedMonthKey,
    monthOptions,
    setIsFormulaModalOpen,
    isClosed,
    closedAt,
  } = useLeaderboardContext();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Bảng xếp hạng thi đua
          </h1>
          {isClosed && (
            <Tooltip
              content={
                closedAt
                  ? `Đã chốt sổ cố định lúc ${formatDate(closedAt, "HH:mm dd/MM/yyyy")}`
                  : "Bảng xếp hạng tháng này đã được chốt sổ cố định"
              }
              side="top"
            >
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF3] text-[#15803D] border border-[#ABEFC6] cursor-default">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Đã chốt sổ</span>
              </span>
            </Tooltip>
          )}
        </div>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Vinh danh học sinh tích lũy xu xuất sắc và ghi nhận công bằng mức độ tiến bộ theo từng nhóm phong độ.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
        <div className="w-full sm:w-64">
          <TeacherSelect
            icon={
              <Calendar
                className="w-4 h-4 text-[#0A62D6]"
                aria-hidden="true"
              />
            }
            size="sm"
            options={monthOptions}
            value={selectedMonthKey}
            onChange={setSelectedMonthKey}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsFormulaModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <HelpCircle
            className="w-4 h-4 text-[#0A62D6]"
            aria-hidden="true"
          />
          <span>Cách tính hạng</span>
        </button>
      </div>
    </div>
  );
}
