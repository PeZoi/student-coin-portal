"use client";

import { useMemo } from "react";
import { Search, X, RotateCw, BookOpen } from "lucide-react";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SubmissionStatusFilter } from "../types";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";

/**
 * Thanh công cụ Studio Duyệt bài tập:
 * - Lọc theo Bài tập đang giao
 * - Chuyển tab trạng thái (Chờ duyệt / Đã duyệt / Làm lại / Tất cả)
 * - Tìm kiếm nhanh tên học sinh
 */
export function SubmissionsToolbar() {
  const {
    missionIdFilter,
    setMissionIdFilter,
    missionFilterOptions,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalCount,
    isRefreshing,
    handleRefresh,
  } = useManageSubmissionsContext();

  const missionSelectOptions = useMemo<TeacherSelectOption[]>(() => {
    return [
      {
        value: "all",
        label: "Tất cả bài tập",
        badge: totalCount,
      },
      ...missionFilterOptions.map((m) => ({
        value: m.id,
        label: m.title,
        badge: m.pending_count > 0 ? `${m.pending_count} chờ` : m.total_submitted,
      })),
    ];
  }, [missionFilterOptions, totalCount]);

  const statusTabs: {
    id: SubmissionStatusFilter;
    label: string;
    count: number;
  }[] = [
    { id: "pending_approval", label: "Chờ duyệt", count: pendingCount },
    { id: "approved", label: "Đã duyệt", count: approvedCount },
    { id: "rejected", label: "Cần làm lại", count: rejectedCount },
    { id: "all", label: "Tất cả", count: totalCount },
  ];

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
      {/* 1. Cụm bên trái: Lọc theo Bài tập + Tab trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
        {/* Dropdown chọn bài tập */}
        <div className="w-full sm:w-72 shrink-0">
          <TeacherSelect
            value={missionIdFilter}
            onChange={setMissionIdFilter}
            options={missionSelectOptions}
            icon={<BookOpen className="w-3.5 h-3.5" />}
            className="w-full"
          />
        </div>

        {/* Segmented Tabs trạng thái duyệt */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto gap-1 shrink-0">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer select-none",
                  isActive
                    ? "bg-white text-[#0A62D6] font-bold shadow-2xs border border-slate-200/90"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums leading-none",
                    isActive
                      ? "bg-[#EAF2FF] text-[#0A62D6]"
                      : "bg-slate-200/80 text-slate-600"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cụm bên phải: Tìm tên học sinh + Làm mới */}
      <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên học sinh..."
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <Tooltip
          content={isRefreshing ? "Đang đồng bộ..." : "Làm mới danh sách"}
          side="top"
        >
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0A62D6] hover:border-[#0A62D6]/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
          >
            <RotateCw
              className={cn(
                "w-4 h-4",
                isRefreshing && "animate-spin text-[#0A62D6]"
              )}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
