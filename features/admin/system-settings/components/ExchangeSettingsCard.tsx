"use client";

import Image from "next/image";
import { Calendar, Coins, Info } from "lucide-react";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { Tooltip } from "@/components/ui/tooltip";
import { SettingsToggleRow } from "./SettingsToggleRow";

export interface ExchangeSettingsFormState {
  stepCoins: number;
  vndPerStep: number;
  minExchangeCoins: number;
  isExchangeWindowEnabled: boolean;
  exchangeOpenDay: number;
  exchangeCloseDay: number;
  allowCustomGiftLink: boolean;
}

interface ExchangeSettingsCardProps {
  value: ExchangeSettingsFormState;
  onChange: (next: ExchangeSettingsFormState) => void;
}

const DAY_OF_MONTH_OPTIONS: TeacherSelectOption[] = Array.from(
  { length: 31 },
  (_, index) => {
    const day = index + 1;
    return {
      label: day === 31 ? "Ngày 31 (Cuối tháng)" : `Ngày ${day} hàng tháng`,
      triggerLabel: `Ngày ${day}`,
      value: String(day),
    };
  }
);

/**
 * Thẻ 2: Quy đổi xu Heo Đất & Lịch mở chức năng đổi quà hàng tháng
 */
export function ExchangeSettingsCard({
  value,
  onChange,
}: ExchangeSettingsCardProps) {
  const sampleCoins = 1000;
  const sampleVnd =
    value.stepCoins > 0
      ? Math.round((sampleCoins / value.stepCoins) * value.vndPerStep)
      : 0;

  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Header Card */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Quy đổi xu &amp; Lịch mở đổi quà
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Cấu hình tỷ giá Heo Đất, hạn mức quy đổi và ngày mở cổng đổi quà hàng tháng.
            </p>
          </div>
        </div>
      </div>

      {/* Quy đổi xu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label
            htmlFor="step-coins"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Bước quy đổi xu
          </label>
          <div className="relative">
            <input
              id="step-coins"
              type="number"
              min={1}
              step={10}
              value={value.stepCoins}
              onChange={(e) =>
                onChange({
                  ...value,
                  stepCoins: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className="w-full h-10 pl-3 pr-10 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
              xu
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="vnd-per-step"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Giá trị mỗi bước
          </label>
          <div className="relative">
            <input
              id="vnd-per-step"
              type="number"
              min={100}
              step={100}
              value={value.vndPerStep}
              onChange={(e) =>
                onChange({
                  ...value,
                  vndPerStep: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-full h-10 pl-3 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
              VNĐ
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="min-exchange-coins"
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5"
          >
            <span>Mức đổi tối thiểu</span>
            <Tooltip
              content="Số xu ít nhất trong Heo Đất để học sinh có thể gửi yêu cầu đổi quà."
              side="top"
            >
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            </Tooltip>
          </label>
          <div className="relative">
            <input
              id="min-exchange-coins"
              type="number"
              min={0}
              step={100}
              value={value.minExchangeCoins}
              onChange={(e) =>
                onChange({
                  ...value,
                  minExchangeCoins: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-full h-10 pl-3 pr-10 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
              xu
            </span>
          </div>
        </div>
      </div>

      {/* Hộp xem trước tỷ giá quy đổi */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs">
        <div className="flex items-center gap-2 text-amber-900 font-medium">
          <Image
            src="/wheel/coin.webp"
            alt="Xu"
            width={16}
            height={16}
            unoptimized
            style={{ height: "auto" }}
            className="w-4 h-4 shrink-0"
          />
          <span>Quy đổi tham khảo:</span>
        </div>
        <div className="font-bold text-[#0F172A] tabular-nums">
          <span className="text-amber-700">
            {sampleCoins.toLocaleString("vi-VN")} xu
          </span>{" "}
          = <span className="text-emerald-700">{sampleVnd.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      {/* Lịch mở chức năng đổi quà hàng tháng */}
      <div className="pt-1 space-y-3">
        <SettingsToggleRow
          label="Mở cổng đổi quà theo lịch hàng tháng"
          description="Học sinh chỉ có thể gửi yêu cầu đổi tiền mặt hoặc quà tự chọn trong khoảng ngày đã thiết lập."
          checked={value.isExchangeWindowEnabled}
          onChange={(checked) =>
            onChange({ ...value, isExchangeWindowEnabled: checked })
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <TeacherSelect
            label="Ngày bắt đầu mở đổi quà"
            icon={<Calendar className="w-4 h-4 text-[#0A62D6]" />}
            size="sm"
            options={DAY_OF_MONTH_OPTIONS}
            value={String(value.exchangeOpenDay)}
            disabled={!value.isExchangeWindowEnabled}
            onChange={(val) =>
              onChange({ ...value, exchangeOpenDay: Number(val) })
            }
          />

          <TeacherSelect
            label="Ngày đóng cổng đổi quà"
            icon={<Calendar className="w-4 h-4 text-slate-500" />}
            size="sm"
            options={DAY_OF_MONTH_OPTIONS}
            value={String(value.exchangeCloseDay)}
            disabled={!value.isExchangeWindowEnabled}
            onChange={(val) =>
              onChange({ ...value, exchangeCloseDay: Number(val) })
            }
          />
        </div>

        <SettingsToggleRow
          label="Cho phép học sinh gửi đường dẫn quà tự chọn"
          description="Học sinh có thể dán link sản phẩm mong muốn (Shopee, Tiki...) thay vì chỉ nhận tiền mặt."
          checked={value.allowCustomGiftLink}
          onChange={(checked) =>
            onChange({ ...value, allowCustomGiftLink: checked })
          }
        />
      </div>
    </section>
  );
}
