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
import {
  MissionStatusFilter,
  MissionViewMode,
} from "../types";
import { useManageMissionsContext } from "../contexts/ManageMissionsContext";

interface MissionsToolbarProps {
  statusFilter?: MissionStatusFilter;
  onStatusFilterChange?: (filter: MissionStatusFilter) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  viewMode?: MissionViewMode;
  onViewModeChange?: (mode: MissionViewMode) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * Thanh công cụ lọc, tìm kiếm và chuyển đổi chế độ xem (Bảng / Thẻ)
 * - Tối ưu chiều ngang tối đa: Lược bỏ lọc lớp học và lọc hình thức
 * - Tab Bảng / Thẻ được thiết kế chuẩn Segmented Control cao cấp
 */
export function MissionsToolbar(props?: MissionsToolbarProps) {
  const context = useManageMissionsContext();
  const statusFilter = props?.statusFilter ?? context.statusFilter;
  const onStatusFilterChange =
    props?.onStatusFilterChange ?? context.setStatusFilter;
  const searchQuery = props?.searchQuery ?? context.searchQuery;
  const onSearchQueryChange =
    props?.onSearchQueryChange ?? context.setSearchQuery;
  const viewMode = props?.viewMode ?? context.viewMode;
  const onViewModeChange = props?.onViewModeChange ?? context.setViewMode;
  const onRefresh = props?.onRefresh ?? context.handleRefresh;
  const isRefreshing = props?.isRefreshing ?? context.isRefreshing;

  const {
    isAdmin,
    totalMissions,
    activeMissionsCount,
    expiredMissionsCount,
    inactiveMissionsCount,
    deletedMissionsCount,
  } = context;

  // Tùy chọn lọc Trạng thái bài tập (Tham khảo chuẩn Quản lý lớp học)
  const statusFilterOptions: TeacherSelectOption[] = useMemo(
    () => [
      {
        label: "Tất cả trạng thái",
        value: "all",
        badge: `${totalMissions}`,
      },
      {
        label: "Đang mở nhận bài",
        value: "active",
        badge: `${activeMissionsCount}`,
      },
      {
        label: "Đã qua hạn nộp",
        value: "expired",
        badge: `${expiredMissionsCount}`,
      },
      {
        label: "Tạm ẩn / Bản nháp",
        value: "inactive",
        badge: `${inactiveMissionsCount}`,
      },
    ],
    [
      totalMissions,
      activeMissionsCount,
      expiredMissionsCount,
      inactiveMissionsCount,
    ]
  );

  const isDeletedTab = statusFilter === "deleted";

  return (
    <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* 1. Bên trái: Select Trạng thái (Width rộng rãi chuẩn Quản lý lớp học) + Nút Thùng rác nhanh */}
      <div className="flex items-center gap-2">
        <div className="w-full sm:w-56 shrink-0">
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
                onStatusFilterChange(isDeletedTab ? "all" : "deleted")
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
