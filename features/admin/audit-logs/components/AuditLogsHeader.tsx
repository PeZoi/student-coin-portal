"use client";

import { Download } from "lucide-react";
import { useAuditLogsContext } from "../contexts/AuditLogsContext";

/**
 * Header trang Nhật ký an ninh
 * - Đồng bộ 100% phong cách với Quản lý học sinh, Quản lý giáo viên và Cài đặt hệ thống
 */
export function AuditLogsHeader() {
  const { handleExportCsv } = useAuditLogsContext();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
          Nhật ký an ninh
        </h1>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Theo dõi lịch sử đăng nhập, cảnh báo khóa tài khoản và các thao tác thay đổi dữ liệu quan trọng.
        </p>
      </div>

      <button
        type="button"
        onClick={handleExportCsv}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 text-sm font-semibold transition-all shadow-2xs cursor-pointer active:scale-98 shrink-0"
      >
        <Download className="w-4 h-4 text-[#0A62D6]" />
        <span>Xuất báo cáo CSV</span>
      </button>
    </div>
  );
}
