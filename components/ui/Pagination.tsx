"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  /** Trang hiện tại (1-based) */
  currentPage: number;
  /** Tổng số trang */
  totalPages: number;
  /** Số lượng phần tử trên 1 trang */
  pageSize?: number;
  /** Tổng số phần tử */
  totalItems: number;
  /** Callback khi người dùng chuyển trang */
  onPageChange: (page: number) => void;
  /** Callback khi người dùng đổi số lượng phần tử / trang */
  onPageSizeChange?: (pageSize: number) => void;
  /** Các tùy chọn số phần tử / trang (mặc định: [10, 20, 50]) */
  pageSizeOptions?: number[];
  /** Tên định danh đối tượng (VD: "học sinh", "lớp học", "giao dịch") */
  itemLabel?: string;
  className?: string;
}

/**
 * Component Phân trang chuẩn giao diện (Pagination)
 * - Hiển thị dải số trang thông minh với dấu ba chấm (...) khi số trang lớn
 * - Hỗ trợ chọn số lượng mục trên mỗi trang (10 / 20 / 50)
 * - Tối ưu hiển thị responsive trên cả Mobile và Desktop
 */
export function Pagination({
  currentPage,
  totalPages,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = "học sinh",
  className,
}: PaginationProps) {
  // Tính toán khoảng phần tử đang hiển thị (VD: 1 - 10 trên 45)
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Tạo mảng các số trang cần hiển thị (kèm dấu ba chấm ...)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "dots")[] = [];

    if (currentPage <= 4) {
      // Gần đầu: [1, 2, 3, 4, 5, 'dots', totalPages]
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("dots");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Gần cuối: [1, 'dots', totalPages - 4, totalPages - 3, ...]
      pages.push(1);
      pages.push("dots");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      // Ở giữa: [1, 'dots', cur - 1, cur, cur + 1, 'dots', totalPages]
      pages.push(1);
      pages.push("dots");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("dots");
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        "px-4 py-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none",
        className
      )}
    >
      {/* Vùng trái: Thông tin số lượng hiển thị & Chọn Page Size */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="text-slate-500 font-medium">
          Hiển thị{" "}
          <span className="font-bold text-slate-800 tabular-nums">
            {startItem}
          </span>
          {" - "}
          <span className="font-bold text-slate-800 tabular-nums">
            {endItem}
          </span>{" "}
          trong số{" "}
          <span className="font-bold text-slate-900 tabular-nums">
            {totalItems}
          </span>{" "}
          {itemLabel}
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-slate-200">
            <span className="text-slate-400 hidden sm:inline">Xem:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2 py-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:border-[#0A62D6] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Vùng phải: Các nút điều hướng chuyển trang */}
      <div className="flex items-center gap-1">
        {/* Nút Trước */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className={cn(
            "h-8 px-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-1 font-semibold text-slate-700 transition-colors",
            canGoPrevious
              ? "hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              : "opacity-40 cursor-not-allowed pointer-events-none"
          )}
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Danh sách các số trang (Desktop) */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "dots") {
              return (
                <span
                  key={`dots-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold"
                >
                  •••
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-semibold tabular-nums transition-all flex items-center justify-center cursor-pointer",
                  isActive
                    ? "bg-[#0A62D6] text-white shadow-2xs font-bold border border-[#0A62D6]"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Hiển thị số trang gọn trên Mobile */}
        <div className="sm:hidden px-2 text-xs font-semibold text-slate-700 tabular-nums">
          {currentPage} / {totalPages}
        </div>

        {/* Nút Sau */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={cn(
            "h-8 px-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-1 font-semibold text-slate-700 transition-colors",
            canGoNext
              ? "hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              : "opacity-40 cursor-not-allowed pointer-events-none"
          )}
          title="Trang kế tiếp"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
