"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Laptop,
  LogIn,
  LogOut,
  MapPin,
  SearchX,
  Smartphone,
  Tablet,
  UserPlus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import {
  AUTH_ACTION_LABELS,
  DEVICE_LABELS,
  ROLE_BADGE_STYLES,
  ROLE_LABELS,
} from "../constants";
import { useAuditLogsContext } from "../contexts/AuditLogsContext";
import { LogDeviceType } from "../types";

function renderDeviceIcon(deviceType: LogDeviceType) {
  if (deviceType === "mobile") {
    return <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
  if (deviceType === "tablet") {
    return <Tablet className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
  return <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
}

/**
 * Bảng Lịch sử đăng nhập (sử dụng chuẩn component <Table /> của hệ thống)
 */
export function AuthLogsTable() {
  const { paginatedAuthLogs, hasActiveFilter, handleResetFilters } =
    useAuditLogsContext();

  if (paginatedAuthLogs.length === 0) {
    return (
      <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-[#0F172A]">
          Không tìm thấy lịch sử đăng nhập phù hợp
        </p>
        <p className="text-xs text-[#64748B] mt-1 max-w-sm">
          Thử điều chỉnh bộ lọc vai trò, kết quả hoặc xóa từ khóa tìm kiếm để xem thêm bản ghi.
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
          <TableHead>Tài khoản truy cập</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Hành động</TableHead>
          <TableHead>Kết quả &amp; Ghi chú</TableHead>
          <TableHead align="right">Thiết bị &amp; Vị trí</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedAuthLogs.map((log) => (
          <TableRow key={log.id}>
            {/* Thời gian */}
            <TableCell className="whitespace-nowrap">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0F172A] tabular-nums inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{log.timestamp}</span>
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5 pl-5">
                  {log.relativeTime}
                </span>
              </div>
            </TableCell>

            {/* Tài khoản truy cập */}
            <TableCell>
              <div className="flex flex-col min-w-[160px]">
                <span className="text-sm font-bold text-[#0F172A] leading-snug">
                  {log.fullName}
                </span>
                <span className="text-xs text-[#64748B] font-mono mt-0.5">
                  {log.accountIdentifier}
                </span>
              </div>
            </TableCell>

            {/* Vai trò */}
            <TableCell className="whitespace-nowrap">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_BADGE_STYLES[log.role]}`}
              >
                {ROLE_LABELS[log.role]}
              </span>
            </TableCell>

            {/* Hành động */}
            <TableCell className="whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                {log.action === "login" ? (
                  <LogIn className="w-3.5 h-3.5 text-[#0A62D6]" />
                ) : log.action === "register" ? (
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{AUTH_ACTION_LABELS[log.action]}</span>
              </span>
            </TableCell>

            {/* Kết quả & Ghi chú */}
            <TableCell>
              {log.status === "success" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#15803D] border border-[#ABEFC6] whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                  <span>Thành công</span>
                </span>
              ) : (
                <div className="flex flex-col items-start gap-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Thất bại</span>
                  </span>
                  {log.reasonText && (
                    <span className="text-xs text-rose-700 font-medium">
                      {log.reasonText}
                    </span>
                  )}
                </div>
              )}
            </TableCell>

            {/* Thiết bị & Vị trí */}
            <TableCell align="right" className="whitespace-nowrap">
              <div className="inline-flex flex-col items-end">
                <Tooltip
                  content={`Thiết bị: ${DEVICE_LABELS[log.deviceType]}`}
                  side="top"
                >
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    {renderDeviceIcon(log.deviceType)}
                    <span>{DEVICE_LABELS[log.deviceType]}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {log.ipAddress}
                    </span>
                  </div>
                </Tooltip>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{log.location}</span>
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
