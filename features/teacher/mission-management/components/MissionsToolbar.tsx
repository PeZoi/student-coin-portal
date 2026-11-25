"use client";

import { useMemo } from "react";
import {
  Search,
  X,
  RotateCw,
  Filter,
  LayoutGrid,
  List,
  Trash2,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { cn } from "@/lib/utils";
import { MissionStatusFilter } from "../types";
import {
  MISSION_STATUS_FILTER_OPTIONS,
  MISSION_VIEW_MODE_OPTIONS,
} from "../constants";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";

/**
 * Thanh công cụ lọc, tìm kiếm và chuyển đổi chế độ xem (Bảng / Thẻ)
 * - Tối ưu chiều ngang tối đa: Lược bỏ lọc lớp học và lọc hình thức
 * - Tab Bảng / Thẻ được thiết kế chuẩn Segmented Control cao cấp
 */
export function MissionsToolbar() {
  const {
    statusFilter,
    setStatusFilter: onStatusFilterChange,
    searchQuery,
    setSearchQuery: onSearchQueryChange,
    viewMode,
    setViewMode: onViewModeChange,
    handleRefresh: onRefresh,
    isRefreshing,
    isAdmin,
    totalMissions,
    recentMissionsCount,
    archivedMissionsCount,
    deletedMissionsCount,
  } = useManageMissionsContext();

  // Tùy chọn lọc Trạng thái bài tập ánh xạ từ cấu hình chuẩn constants
  const statusFilterOptions: TeacherSelectOption[] = useMemo(
    () =>
      MISSION_STATUS_FILTER_OPTIONS.map((opt) => {
        let badge: string | undefined;
        if (opt.value === "recent") badge = `${recentMissionsCount ?? 0}`;
        else if (opt.value === "archived")
          badge = `${archivedMissionsCount ?? 0}`;
        else if (opt.value === "all") badge = `${totalMissions}`;

        return {
          label: opt.label,
          value: opt.value,
          badge,
        };
      }),
    [recentMissionsCount, archivedMissionsCount, totalMissions]
  );

  const isDeletedTab = statusFilter === "deleted";

  return (
    <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* 1. Bên trái: Select Trạng thái (Width rộng rãi chuẩn Quản lý lớp học) + Nút Thùng rác nhanh */}
      <div className="flex items-center gap-2">
        <div className="w-full sm:w-60 shrink-0">
          <TeacherSelect
            icon={<Filter className="w-3.5 h-3.5 text-slate-500" />}
            size="sm"
            options={statusFilterOptions}
            value={statusFilter === "deleted" ? "" : statusFilter}
            placeholder={statusFilter === "deleted" ? "Lọc trạng thái" : undefined}
            onChange={(val) => onStatusFilterChange(val as MissionStatusFilter)}
          />
        </div>

        {/* Nút Đã xóa riêng biệt (Chỉ hiển thị cho Admin, cảnh báo màu đỏ) */}
        {isAdmin && (
          <Tooltip
            content={
              isDeletedTab
                ? "Quay lại danh sách bài tập đang hoạt động"
                : `Xem thùng rác (${deletedMissionsCount} bài tập đã xóa)`
            }
            side="top"
          >
            <button
              type="button"
              onClick={() =>
                onStatusFilterChange(isDeletedTab ? "recent" : "deleted")
              }
              className={cn(
                "h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5",
                isDeletedTab
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80"
              )}
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Đã xóa ({deletedMissionsCount})</span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* 2. Bên phải: Ô Tìm kiếm + Segmented Tab (Bảng / Thẻ) + Nút Làm mới */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Tìm tên bài tập..."
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
          />
          {searchQuery.length > 0 && (
            <Tooltip content="Xóa từ khóa tìm kiếm" side="top">
              <button
                type="button"
                onClick={() => onSearchQueryChange("")}
                className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Cụm nút chuyển đổi Chế độ xem: Bảng (Table) hoặc Thẻ (Grid) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/90 shrink-0 gap-1 h-10">
          {MISSION_VIEW_MODE_OPTIONS.map(({ mode, label }) => {
            const Icon = mode === "table" ? List : LayoutGrid;
            const isActive = viewMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs transition-all cursor-pointer select-none",
                  isActive
                    ? "bg-white text-[#0A62D6] font-bold shadow-xs border border-slate-200/90"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Nút Làm mới danh sách */}
        <Tooltip
          content={isRefreshing ? "Đang đồng bộ..." : "Làm mới danh sách bài tập"}
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
      </div>
    </div>
  );
}
