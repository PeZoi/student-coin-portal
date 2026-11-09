import { Search, X } from "lucide-react";
import { StatusFilter } from "./types";

interface ClassesToolbarProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export function ClassesToolbar({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  totalCount,
  activeCount,
  inactiveCount,
}: ClassesToolbarProps) {
  return (
    <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* 1. Các tab lọc trạng thái dạng pill (cuộn ngang trên mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => onStatusFilterChange("all")}
          className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
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
          className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
            statusFilter === "active"
              ? "bg-[#0A62D6] text-white shadow-2xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          Đang hoạt động ({activeCount})
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("inactive")}
          className={`h-10 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
            statusFilter === "inactive"
              ? "bg-[#0A62D6] text-white shadow-2xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          Tạm dừng ({inactiveCount})
        </button>
      </div>

      {/* 2. Ô tìm kiếm */}
      <div className="relative w-full md:w-80 shrink-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Tìm theo tên lớp hoặc giáo viên"
          className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-slate-300 text-base md:text-sm text-[#0F172A] placeholder-slate-500 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/25"
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
    </div>
  );
}
