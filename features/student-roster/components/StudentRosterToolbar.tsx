"use client";

import { useMemo } from "react";
import { Search, X, RotateCw, Filter } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { StudentRosterStatusFilter } from "../types";
import { TeacherSelect, TeacherSelectOption } from "@/components/ui/TeacherSelect";

interface StudentRosterToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  statusFilter: StudentRosterStatusFilter;
  onStatusFilterChange: (filter: StudentRosterStatusFilter) => void;
  totalStudents: number;
  activeCount: number;
  lockedCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * Toolbar tìm kiếm, lọc trạng thái danh sách học sinh
 * - Đồng bộ 100% bố cục với các trang quản lý (ClassesToolbar, TeachersToolbar, StudentsToolbar)
 * - Đã lược bỏ dropdown sắp xếp theo vì người dùng có thể sort trực tiếp tại tiêu đề các cột của bảng
 * - Bên trái: Dropdown Trạng thái + Nút Đặt lại
 * - Bên phải: Ô Tìm kiếm + Nút Làm mới
 */
export function StudentRosterToolbar({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  totalStudents,
  activeCount,
  lockedCount,
  onResetFilters,
  hasActiveFilters,
  onRefresh,
  isRefreshing = false,
}: StudentRosterToolbarProps) {
  // Tùy chọn lọc trạng thái (kèm badge số lượng học sinh)
  const statusOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: "Tất cả trạng thái", value: "all", badge: `${totalStudents}` },
      { label: "Đang học", value: "active", badge: `${activeCount}` },
      { label: "Khóa PIN", value: "locked", badge: `${lockedCount}` },
    ],
    [totalStudents, activeCount, lockedCount]
  );

  return (
    <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* 1. Bên trái: Dropdown Lọc trạng thái + Nút Đặt lại */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Dropdown Lọc Trạng thái (độ rộng chuẩn 224px, không bị cụt text) */}
        <div className="w-full sm:w-56 shrink-0">
          <TeacherSelect
            icon={<Filter className="w-3.5 h-3.5 text-slate-500" />}
            size="sm"
            options={statusOptions}
            value={statusFilter}
            onChange={(val) =>
              onStatusFilterChange(val as StudentRosterStatusFilter)
            }
          />
        </div>

        {/* Nút Đặt lại bộ lọc */}
        {hasActiveFilters && (
          <Tooltip content="Khôi phục bộ lọc mặc định" side="top">
            <button
              type="button"
              onClick={onResetFilters}
              className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-98 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* 2. Bên phải: Ô Tìm kiếm + Nút Làm mới */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        {/* Ô tìm kiếm chuẩn form quản trị */}
        <div className="relative flex-1 sm:w-64 md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Tìm theo họ tên hoặc SĐT..."
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
          />
          {searchQuery.length > 0 && (
            <Tooltip content="Xóa từ khóa tìm kiếm" side="top">
              <button
                type="button"
                onClick={() => onSearchQueryChange("")}
                className="w-5 h-5 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Nút Làm mới danh sách */}
        {onRefresh && (
          <Tooltip
            content={isRefreshing ? "Đang đồng bộ..." : "Làm mới danh sách học sinh"}
            side="top"
          >
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0A62D6] hover:border-[#0A62D6]/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
            >
              <RotateCw
                className={`w-4 h-4 ${
                  isRefreshing ? "animate-spin text-[#0A62D6]" : ""
                }`}
              />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
