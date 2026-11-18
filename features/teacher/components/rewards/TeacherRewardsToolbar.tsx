"use client";

import { useMemo } from "react";
import { Search, X, RotateCw, Filter, List, LayoutGrid } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherSelect, TeacherSelectOption } from "@/components/ui/TeacherSelect";
import { cn } from "@/lib/utils";
import {
  ExchangeFilterStatus,
  ExchangeFilterChoiceType,
  ExchangeViewMode,
} from "../../types/rewards";
import { ExchangeChoiceType, ExchangeRequestStatus } from "@/constants/rewards";

interface TeacherRewardsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ExchangeFilterStatus;
  onStatusChange: (status: ExchangeFilterStatus) => void;
  choiceTypeFilter: ExchangeFilterChoiceType;
  onChoiceTypeChange: (type: ExchangeFilterChoiceType) => void;
  viewMode: ExchangeViewMode;
  onViewModeChange: (mode: ExchangeViewMode) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
    rejected: number;
  };
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * Toolbar tìm kiếm, lọc trạng thái và hình thức đổi quà Heo Đất
 * - Đồng bộ 100% bố cục và style với MissionsToolbar và StudentRosterToolbar
 */
export function TeacherRewardsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  choiceTypeFilter,
  onChoiceTypeChange,
  viewMode,
  onViewModeChange,
  counts,
  onRefresh,
  isRefreshing,
}: TeacherRewardsToolbarProps) {
  // 1. Tùy chọn lọc Trạng thái (Chỉ còn: Tất cả, Chờ duyệt, Đã duyệt & trao, Từ chối)
  const statusOptions: TeacherSelectOption[] = useMemo(
    () => [
      {
        label: "Tất cả trạng thái",
        value: "all",
        badge: `${counts.all}`,
      },
      {
        label: "Chờ cô duyệt",
        value: ExchangeRequestStatus.PENDING,
        badge: `${counts.pending}`,
      },
      {
        label: "Đã duyệt & trao quà",
        value: ExchangeRequestStatus.COMPLETED,
        badge: `${counts.completed}`,
      },
      {
        label: "Từ chối (Hoàn xu)",
        value: ExchangeRequestStatus.REJECTED,
        badge: `${counts.rejected}`,
      },
    ],
    [counts]
  );

  // 2. Tùy chọn lọc Hình thức (Tiền mặt / Sàn TMĐT)
  const choiceTypeOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: "Tất cả hình thức", value: "all" },
      { label: "Tiền mặt", value: ExchangeChoiceType.CASH },
      { label: "Quà tự chọn", value: ExchangeChoiceType.SHOPEE },
    ],
    []
  );

  const hasActiveFilters =
    statusFilter !== "all" || choiceTypeFilter !== "all" || searchQuery.length > 0;

  const handleResetFilters = () => {
    onStatusChange("all");
    onChoiceTypeChange("all");
    onSearchChange("");
  };

  return (
    <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* 1. Bên trái: Các bộ lọc Dropdown chuẩn TeacherSelect */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Dropdown Lọc Trạng thái */}
        <div className="w-full sm:w-52 shrink-0">
          <TeacherSelect
            icon={<Filter className="w-3.5 h-3.5 text-slate-500" />}
            size="sm"
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => onStatusChange(val as ExchangeFilterStatus)}
          />
        </div>

        {/* Dropdown Lọc Hình thức nhận quà */}
        <div className="w-full sm:w-44 shrink-0">
          <TeacherSelect
            size="sm"
            options={choiceTypeOptions}
            value={choiceTypeFilter}
            onChange={(val) => onChoiceTypeChange(val as ExchangeFilterChoiceType)}
          />
        </div>

        {/* Nút Đặt lại bộ lọc */}
        {hasActiveFilters && (
          <Tooltip content="Khôi phục bộ lọc mặc định" side="top">
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-98 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* 2. Bên phải: Ô Tìm kiếm + Segmented Tab (Bảng / Thẻ) + Nút Làm mới */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* Ô tìm kiếm chuẩn form quản trị */}
        <div className="relative flex-1 sm:w-60 md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-hidden focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
          />
          {searchQuery.length > 0 && (
            <Tooltip content="Xóa từ khóa tìm kiếm" side="top">
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="w-5 h-5 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Cụm nút chuyển đổi Chế độ xem: Bảng (Table) hoặc Thẻ (Grid) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/90 shrink-0 gap-1 h-10">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs transition-all cursor-pointer select-none",
              viewMode === "table"
                ? "bg-white text-[#0A62D6] font-bold shadow-xs border border-slate-200/90"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            )}
          >
            <List className="w-4 h-4 shrink-0" />
            <span>Bảng</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs transition-all cursor-pointer select-none",
              viewMode === "grid"
                ? "bg-white text-[#0A62D6] font-bold shadow-xs border border-slate-200/90"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            )}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span>Thẻ</span>
          </button>
        </div>

        {/* Nút Làm mới danh sách */}
        {onRefresh && (
          <Tooltip
            content={isRefreshing ? "Đang đồng bộ..." : "Làm mới danh sách"}
            side="top"
          >
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0A62D6] hover:border-[#0A62D6]/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
            >
              <RotateCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#0A62D6]" : ""}`}
              />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
