import { useMemo } from "react";
import { Search, X, RotateCw, Filter } from "lucide-react";
import { StudentStatusFilter } from "@/features/student-management/types";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherSelect, TeacherSelectOption } from "@/components/ui/TeacherSelect";
import { useManageStudentsContext } from "@/features/student-management/contexts/ManageStudentsContext";

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

  // 1. Tùy chọn lọc Trạng thái (chuyển từ các tab sang Select)
  const statusFilterOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: "Tất cả trạng thái", value: "all", badge: `${totalCount}` },
      { label: "Đang học", value: "active", badge: `${activeCount}` },
      { label: "Khóa PIN", value: "locked", badge: `${lockedCount}` },
      { label: "Tạm ngưng", value: "inactive", badge: `${inactiveCount}` },
    ],
    [totalCount, activeCount, lockedCount, inactiveCount]
  );

  // 2. Tùy chọn lọc Lớp học
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
    <div className="p-3 sm:p-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
      {/* 1. Bên trái: Select Trạng thái + Nút Đã xóa (Admin) + Select Lớp học */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Dropdown Lọc Trạng thái (thay thế cho dãy tab dài) */}
        <div className="w-full sm:w-56 shrink-0">
          <TeacherSelect
            icon={<Filter className="w-3.5 h-3.5 text-slate-500" />}
            size="sm"
            options={statusFilterOptions}
            value={statusFilter === "deleted" ? "" : statusFilter}
            placeholder={statusFilter === "deleted" ? "Lọc trạng thái" : undefined}
            onChange={(val) => onStatusFilterChange(val as StudentStatusFilter)}
          />
        </div>

        {/* Nút Đã xóa riêng biệt (Chỉ hiển thị cho Admin, cảnh báo màu đỏ) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onStatusFilterChange("deleted")}
            className={`h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              statusFilter === "deleted"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80"
            }`}
          >
            Đã xóa ({deletedCount})
          </button>
        )}

        {/* Dropdown Lọc Lớp học (chiều rộng thoải mái, không bị cụt text) */}
        <div className="w-full sm:w-56 md:w-60 shrink-0">
          <TeacherSelect
            size="sm"
            options={classFilterOptions}
            value={selectedClassId}
            onChange={onSelectedClassIdChange}
          />
        </div>
      </div>

      {/* 2. Bên phải: Ô Tìm kiếm + Nút Làm mới */}
      <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
        <div className="relative flex-1 xl:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Tìm tên học sinh, SĐT Zalo..."
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

        {/* Nút Làm mới */}
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
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#0A62D6]" : ""}`}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
