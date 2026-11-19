"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { useOptionalTeacherRewardsContext } from "../contexts/TeacherRewardsContext";

export interface TeacherRewardsHeaderProps {
  selectedMonth?: number | "all";
  selectedYear?: number | "all";
  onMonthChange?: (month: number | "all") => void;
}

/**
 * Header của trang Đổi quà Heo Đất (Góc giáo viên)
 * - Tự động đọc dữ liệu từ TeacherRewardsContext (Quy tắc 10 - Feature Context Pattern)
 * - Vẫn hỗ trợ truyền props độc lập khi cần
 */
export function TeacherRewardsHeader(props?: TeacherRewardsHeaderProps) {
  const context = useOptionalTeacherRewardsContext();

  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();

  const selectedMonth = props?.selectedMonth ?? context?.selectedMonth ?? defaultMonth;
  const selectedYear = props?.selectedYear ?? context?.selectedYear ?? defaultYear;
  const onMonthChange =
    props?.onMonthChange ?? context?.setSelectedMonth ?? (() => {});

  // Danh sách các kỳ đổi quà hàng tháng (Rút gọn nhãn menu + Chấm xanh Live Dot cho kỳ hiện tại)
  const periodOptions: TeacherSelectOption[] = useMemo(() => {
    // Nếu là năm hiện tại thì tối đa là tháng hiện tại (defaultMonth); nếu là năm cũ thì tối đa là tháng 12
    const targetYear = selectedYear === "all" ? defaultYear : selectedYear;
    const maxMonth = targetYear === defaultYear ? defaultMonth : 12;

    const monthItems: TeacherSelectOption[] = Array.from(
      { length: maxMonth },
      (_, i) => {
        const monthNum = maxMonth - i;
        const isCurrent =
          monthNum === defaultMonth && targetYear === defaultYear;
        return {
          label: `Tháng ${monthNum}/${targetYear}`,
          triggerLabel: `Kỳ đổi: Tháng ${monthNum}/${targetYear}`,
          value: String(monthNum),
          badge: isCurrent ? (
            <span
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 shrink-0"
              title="Kỳ đổi hiện tại"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Hiện tại
              </span>
            </span>
          ) : undefined,
        };
      }
    );

    return [
      {
        label: "Tất cả các kỳ",
        triggerLabel: "Kỳ đổi: Tất cả các kỳ",
        value: "all",
      },
      ...monthItems,
    ];
  }, [selectedYear, defaultMonth, defaultYear]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight">
          Đổi quà
        </h1>
        <p className="text-sm sm:text-[15px] text-[#475569] mt-1">
          Xét duyệt và theo dõi các yêu cầu quy đổi xu Heo Đất thành Tiền mặt hoặc Quà tự chọn của học sinh.
        </p>
      </div>

      {/* Cụm công cụ bên phải */}
      <div className="w-full sm:w-60 shrink-0">
        <TeacherSelect
          icon={<Calendar className="w-4 h-4 text-[#0A62D6]" />}
          size="sm"
          options={periodOptions}
          value={String(selectedMonth)}
          showBadgeInTrigger={false}
          onChange={(val) =>
            onMonthChange(val === "all" ? "all" : Number(val))
          }
        />
      </div>
    </div>
  );
}
