"use client";

import { CheckCheck, Loader2, Search, X } from "lucide-react";
import { SubmissionApprovalStatus } from "@/constants";
import { cn } from "@/lib/utils";
import { SubmissionStatusFilter } from "../../types";

interface RosterTabCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  unsubmitted: number;
}

interface StudentRosterToolbarProps {
  statusFilter: SubmissionStatusFilter;
  onStatusFilterChange: (filter: SubmissionStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: RosterTabCounts;
  validAiPendingCount: number;
  isSubmitting: boolean;
  onBatchApprove: () => void;
}

/**
 * Thanh công cụ lọc trạng thái, tìm kiếm học sinh và nút Duyệt nhanh bài hợp lệ
 */
export function StudentRosterToolbar({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  counts,
  validAiPendingCount,
  isSubmitting,
  onBatchApprove,
}: StudentRosterToolbarProps) {
  const tabs: {
    key: SubmissionStatusFilter;
    label: string;
    count: number;
    dot?: string;
  }[] = [
    { key: "all", label: "Tất cả", count: counts.all },
    {
      key: SubmissionApprovalStatus.PENDING_APPROVAL,
      label: "Chờ duyệt",
      count: counts.pending,
      dot: "bg-amber-500",
    },
    {
      key: SubmissionApprovalStatus.APPROVED,
      label: "Đã duyệt",
      count: counts.approved,
    },
    {
      key: SubmissionApprovalStatus.REJECTED,
      label: "Cần sửa",
      count: counts.rejected,
    },
    { key: "unsubmitted", label: "Chưa nộp", count: counts.unsubmitted },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
      {/* Tabs lọc trạng thái */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
                isActive
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-slate-600 hover:text-[#0F172A]"
              )}
            >
              {tab.dot && (
                <span className={cn("w-1.5 h-1.5 rounded-full", tab.dot)} />
              )}
              <span>{tab.label}</span>
              <span className="text-[11px] opacity-75">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Tìm kiếm + Duyệt nhanh hàng loạt */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative w-full sm:w-56">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm tên học sinh, SĐT..."
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={validAiPendingCount === 0 || isSubmitting}
          onClick={onBatchApprove}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 disabled:cursor-not-allowed shrink-0"
          title="Duyệt nhanh toàn bộ bài có ảnh rõ nét và điểm AI >= 8.0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Đang duyệt nhanh...</span>
            </>
          ) : (
            <>
              <CheckCheck className="w-4 h-4 shrink-0" />
              <span>Duyệt nhanh bài hợp lệ ({validAiPendingCount})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
