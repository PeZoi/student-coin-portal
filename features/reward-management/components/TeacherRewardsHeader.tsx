"use client";

import { useMemo } from "react";
import { Calendar, RotateCw } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherSelect, TeacherSelectOption } from "@/components/ui/TeacherSelect";

interface TeacherRewardsHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * Header của trang Đổi quà Heo Đất (Góc giáo viên)
 * - Đồng bộ 100% phong cách thiết kế với Quản lý bài tập (MissionsHeader) và Danh sách học sinh (StudentRosterHeader)
 * - Sử dụng TeacherSelect chuyên dụng cho bộ chọn kỳ đổi thưởng thay vì thẻ select HTML thô
 */
export function TeacherRewardsHeader({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onRefresh,
  isRefreshing,
}: TeacherRewardsHeaderProps) {
  // Danh sách các kỳ đổi quà hàng tháng
  const periodOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: `Kỳ đổi: Tháng 11/${selectedYear}`, value: "11" },
      { label: `Kỳ đổi: Tháng 10/${selectedYear}`, value: "10" },
      { label: `Kỳ đổi: Tháng 9/${selectedYear}`, value: "9" },
      { label: `Kỳ đổi: Tháng 8/${selectedYear}`, value: "8" },
    ],
    [selectedYear]
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
          Đổi quà Heo Đất
        </h1>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Xét duyệt và theo dõi các yêu cầu quy đổi xu Heo Đất thành Tiền mặt hoặc Quà tự chọn của học sinh.
        </p>
      </div>

      {/* Cụm công cụ bên phải */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Bộ chọn Kỳ đổi: Sử dụng TeacherSelect cao cấp đồng bộ hệ thống */}
        <div className="w-56 shrink-0">
          <TeacherSelect
            icon={<Calendar className="w-4 h-4 text-[#0A62D6]" />}
            size="sm"
            options={periodOptions}
            value={String(selectedMonth)}
            onChange={(val) => onMonthChange(Number(val))}
          />
        </div>

        {/* Nút Làm mới dữ liệu */}
        <Tooltip content={isRefreshing ? "Đang đồng bộ..." : "Làm mới danh sách"} side="bottom">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-60 shrink-0"
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
