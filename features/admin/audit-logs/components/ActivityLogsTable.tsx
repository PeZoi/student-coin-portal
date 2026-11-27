"use client";

import { Clock, SearchX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ACTIVITY_SCOPE_BADGE_STYLES,
  ACTIVITY_SCOPE_LABELS,
  ROLE_LABELS,
} from "../constants";
import { useAuditLogsContext } from "../contexts/AuditLogsContext";

/**
 * Bảng Lịch sử thao tác dữ liệu (sử dụng chuẩn component <Table /> của hệ thống)
 */
export function ActivityLogsTable() {
  const { paginatedActivityLogs, hasActiveFilter, handleResetFilters } =
    useAuditLogsContext();

  if (paginatedActivityLogs.length === 0) {
    return (
      <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-[#0F172A]">
          Không tìm thấy lịch sử thao tác phù hợp
        </p>
        <p className="text-xs text-[#64748B] mt-1 max-w-sm">
          Thử chọn phạm vi khác hoặc xóa từ khóa tìm kiếm để xem toàn bộ bản ghi thao tác.
        </p>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 h-9 px-4 rounded-xl bg-[#EAF2FF] hover:bg-[#DCEAFE] text-[#0A62D6] text-xs font-semibold transition-colors cursor-pointer"
          >
            Xóa bộ lọc hiện tại
          </button>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Thời gian</TableHead>
          <TableHead>Người thực hiện</TableHead>
          <TableHead>Thao tác</TableHead>
          <TableHead>Phạm vi dữ liệu</TableHead>
          <TableHead>Nội dung chi tiết</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedActivityLogs.map((item) => (
          <TableRow key={item.id}>
            {/* Thời gian */}
            <TableCell className="whitespace-nowrap">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0F172A] tabular-nums inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.timestamp}</span>
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5 pl-5">
                  {item.relativeTime}
                </span>
              </div>
            </TableCell>

            {/* Người thực hiện */}
            <TableCell className="whitespace-nowrap">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#0F172A] leading-snug">
                  {item.actorName}
                </span>
                <span className="text-xs text-[#64748B] mt-0.5">
                  {ROLE_LABELS[item.actorRole]}
                </span>
              </div>
            </TableCell>

            {/* Thao tác */}
            <TableCell className="whitespace-nowrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EAF2FF] text-[#0A62D6] border border-[#CFE1FB]">
                {item.actionLabel}
              </span>
            </TableCell>

            {/* Phạm vi dữ liệu */}
            <TableCell className="whitespace-nowrap">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ACTIVITY_SCOPE_BADGE_STYLES[item.scope]}`}
              >
                {ACTIVITY_SCOPE_LABELS[item.scope]}
              </span>
            </TableCell>

            {/* Nội dung chi tiết */}
            <TableCell>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-md">
                {item.description}
              </p>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
