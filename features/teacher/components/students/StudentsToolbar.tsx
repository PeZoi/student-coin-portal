import { useMemo } from "react";
import { Search, X, RotateCw, Filter } from "lucide-react";
import { StudentStatusFilter } from "./types";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherSelect, TeacherSelectOption } from "@/components/ui/TeacherSelect";
import { useManageStudentsContext } from "../../contexts/ManageStudentsContext";

interface StudentsToolbarProps {
  statusFilter?: StudentStatusFilter;
  onStatusFilterChange?: (filter: StudentStatusFilter) => void;
  selectedClassId?: string;
  onSelectedClassIdChange?: (classId: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  totalCount?: number;
  activeCount?: number;
  lockedCount?: number;
  inactiveCount?: number;
  deletedCount?: number;
  isAdmin?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function StudentsToolbar(props?: StudentsToolbarProps) {
  const context = useManageStudentsContext();
  const statusFilter = props?.statusFilter ?? context.statusFilter;
  const onStatusFilterChange =
    props?.onStatusFilterChange ?? context.setStatusFilter;
  const selectedClassId = props?.selectedClassId ?? context.selectedClassId;
  const onSelectedClassIdChange =
    props?.onSelectedClassIdChange ?? context.setSelectedClassId;
  const searchQuery = props?.searchQuery ?? context.searchQuery;
  const onSearchQueryChange =
    props?.onSearchQueryChange ?? context.setSearchQuery;
  const totalCount = props?.totalCount ?? context.totalStudents;
  const activeCount = props?.activeCount ?? context.activeStudents;
  const lockedCount = props?.lockedCount ?? context.lockedPinStudents;
  const inactiveCount = props?.inactiveCount ?? context.inactiveStudents;
  const deletedCount = props?.deletedCount ?? context.deletedStudents;
  const isAdmin = props?.isAdmin ?? context.isAdmin;
  const onRefresh = props?.onRefresh ?? context.handleRefresh;
  const isRefreshing = props?.isRefreshing ?? context.isRefreshing;
  const availableClasses = context.availableClasses;

  const classFilterOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: "Toàn bộ lớp học", value: "all" },
      { label: "Chưa phân lớp", value: "unassigned" },
      ...availableClasses.map((c) => ({
        label: c.class_name,
        value: c.id,
        badge:
          c.student_count !== undefined ? `${c.student_count} em` : undefined,
      })),
    ],
    [availableClasses]
  );

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-4">
      {/* 1. Hàng trên: Các tab lọc trạng thái dạng pill (cuộn ngang mượt) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onStatusFilterChange("all")}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
            statusFilter === "all"
              ? "bg-[#0A62D6] text-white shadow-2xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          Tất cả ({totalCount})
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("active")}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
            statusFilter === "active"
              ? "bg-[#0A62D6] text-white shadow-2xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          Đang học ({activeCount})
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("locked")}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
            statusFilter === "locked"
              ? "bg-rose-600 text-white shadow-2xs"
              : "bg-rose-50 hover:bg-rose-100 text-rose-700"
          }`}
        >
          Khóa PIN ({lockedCount})
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("inactive")}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
            statusFilter === "inactive"
              ? "bg-[#0A62D6] text-white shadow-2xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          Tạm ngưng ({inactiveCount})
        </button>

        {/* Tab Thùng rác (Admin) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onStatusFilterChange("deleted")}
            className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              statusFilter === "deleted"
                ? "bg-slate-800 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            Thùng rác ({deletedCount})
          </button>
        )}
      </div>

      {/* 2. Hàng dưới: Lọc lớp học + Tìm kiếm + Làm mới */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Component Select Lọc theo Lớp */}
        <div className="w-full sm:w-56">
          <TeacherSelect
            icon={<Filter className="w-3.5 h-3.5 text-slate-500" />}
            size="sm"
            options={classFilterOptions}
            value={selectedClassId}
            onChange={onSelectedClassIdChange}
          />
        </div>

        {/* Ô Tìm kiếm & Nút Làm mới */}
        <div className="flex items-center gap-2.5 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Tìm tên học sinh, SĐT Zalo phụ huynh..."
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchQueryChange("")}
                className="w-6 h-6 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Tooltip content="Làm mới dữ liệu" side="top">
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
    </div>
  );
}

