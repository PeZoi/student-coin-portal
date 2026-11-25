"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { RotateCw } from "lucide-react";
import { useStudentRosterContext } from "../contexts/StudentRosterContext";

/**
 * Header của trang Danh sách học sinh (Góc giáo viên)
 * - Đồng bộ 100% phong cách thiết kế với Quản lý học sinh, Quản lý lớp học và Giao bài tập
 * - Tự động kết nối StudentRosterContext (Quy tắc 10 AGENTS.md)
 */
export function StudentRosterHeader() {
  const { handleRefresh, isRefreshing } = useStudentRosterContext();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
            Danh sách học sinh
          </h1>
        </div>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Theo dõi thông tin học sinh, tiến độ rèn luyện, Heo Đất tích lũy và hỗ trợ mã PIN.
        </p>
      </div>

      {/* Cụm nút hành động bên phải */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        <Tooltip content="Làm mới dữ liệu" side="bottom">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-60"
          >
            <RotateCw
              className={`w-4 h-4 text-slate-600 ${
                isRefreshing ? "animate-spin text-[#0A62D6]" : ""
              }`}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
