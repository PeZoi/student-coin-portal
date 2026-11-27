"use client";

import Image from "next/image";
import { Calendar, Coins, Info } from "lucide-react";
import { TeacherSelect } from "@/components/ui/TeacherSelect";
import { Tooltip } from "@/components/ui/tooltip";
import {
  formatNumberInput,
  onlyNumberKeyDown,
  parseFormattedNumber,
} from "@/lib/utils";
import { DAY_OF_MONTH_OPTIONS } from "../constants";
import { useSystemSettingsContext } from "../contexts/SystemSettingsContext";
import { SettingsSectionRow } from "./SettingsSectionRow";
import { SettingsToggleRow } from "./SettingsToggleRow";

/**
 * Panel Quy đổi xu & Điều kiện mở cổng đổi quà Heo Đất (đọc trực tiếp từ Context)
 */
export function ExchangeSettingsCard() {
  const { formState, updateSection } = useSystemSettingsContext();
  const value = formState.exchange;
  const onChange = (next: typeof value) => updateSection("exchange", next);

  const stepSampleCoins = value.stepCoins > 0 ? value.stepCoins : 5000;
  const stepSampleVnd = value.vndPerStep;

  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Quy đổi xu &amp; Điều kiện mở đổi quà
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Thiết lập tỷ giá quy đổi Heo Đất, hạn mức quà tặng và điều kiện mở cổng đổi quà cho học sinh.
          </p>
        </div>
      </div>

      <div className="px-6 py-4 divide-y divide-slate-100">
        <SettingsSectionRow
          title="Tỷ giá quy đổi & Hạn mức quà"
          description="Mức nhảy quy đổi áp dụng theo mốc chẵn khi học sinh đổi tiền mặt; đổi quà tự chọn sẽ tính xu chính xác theo đúng tỷ giá này."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="step-coins"
                className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5"
              >
                <span>Mức nhảy quy đổi (Tiền mặt)</span>
                <Tooltip
                  content="Áp dụng làm bội số chẵn khi học sinh đổi tiền mặt để tránh số tiền lẻ. Đổi quà tự chọn sẽ tính xu chính xác theo tỷ giá này."
                  side="top"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </Tooltip>
              </label>
              <div className="relative">
                <input
                  id="step-coins"
                  type="text"
                  inputMode="numeric"
                  onKeyDown={onlyNumberKeyDown}
                  value={formatNumberInput(value.stepCoins)}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      stepCoins: parseFormattedNumber(e.target.value),
                    })
                  }
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
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
                Tiền tương ứng mỗi mốc
              </label>
              <div className="relative">
                <input
                  id="vnd-per-step"
                  type="text"
                  inputMode="numeric"
                  onKeyDown={onlyNumberKeyDown}
                  value={formatNumberInput(value.vndPerStep)}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      vndPerStep: parseFormattedNumber(e.target.value),
                    })
                  }
                  className="w-full h-10 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  VNĐ
                </span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="max-spin-gift-vnd"
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5"
            >
              <span>Hạn mức Hộp quà Vòng quay</span>
              <Tooltip
                content="Giá trị tối đa của món quà học sinh được chọn khi trúng Hộp quà từ Vòng quay may mắn."
                side="top"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </Tooltip>
            </label>
            <div className="relative sm:max-w-[calc(50%-0.4375rem)]">
              <input
                id="max-spin-gift-vnd"
                type="text"
                inputMode="numeric"
                onKeyDown={onlyNumberKeyDown}
                value={formatNumberInput(value.maxSpinGiftVnd)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    maxSpinGiftVnd: parseFormattedNumber(e.target.value),
                  })
                }
                className="w-full h-10 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                VNĐ
              </span>
            </div>
          </div>

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
              <span>Mỗi mốc quy đổi:</span>
            </div>
            <div className="font-bold text-[#0F172A] tabular-nums">
              <span className="text-amber-700">
                {stepSampleCoins.toLocaleString("vi-VN")} xu
              </span>{" "}
              ={" "}
              <span className="text-emerald-700">
                {stepSampleVnd.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </SettingsSectionRow>

        <SettingsSectionRow
          title="Điều kiện mở cổng đổi quà"
          description="Học sinh cần đáp ứng đủ số dư xu tối thiểu và nằm trong khung ngày mở cổng (nếu bật) để sử dụng chức năng đổi quà."
        >
          <div>
            <label
              htmlFor="min-exchange-coins"
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5"
            >
              <span>Số xu tối thiểu để mở cổng đổi quà</span>
              <Tooltip
                content="Học sinh phải tích lũy đạt ít nhất số xu này trong Heo Đất thì cổng đổi quà mới được mở khóa."
                side="top"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </Tooltip>
            </label>
            <div className="relative sm:max-w-[calc(50%-0.4375rem)]">
              <input
                id="min-exchange-coins"
                type="text"
                inputMode="numeric"
                onKeyDown={onlyNumberKeyDown}
                value={formatNumberInput(value.minExchangeCoins)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    minExchangeCoins: parseFormattedNumber(e.target.value),
                  })
                }
                className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                xu
              </span>
            </div>
          </div>

          <SettingsToggleRow
            label="Áp dụng lịch mở cổng theo ngày trong tháng"
            description="Tắt nếu muốn cho phép học sinh đổi quà bất kỳ ngày nào ngay khi đủ số xu tối thiểu."
            checked={value.isExchangeWindowEnabled}
            onChange={(checked) =>
              onChange({ ...value, isExchangeWindowEnabled: checked })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <TeacherSelect
              label="Ngày bắt đầu mở"
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
              label="Ngày đóng cổng"
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

          <div className="px-3.5 py-2.5 rounded-xl bg-[#EAF2FF]/60 border border-blue-200/70 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-[#0A62D6]">Điều kiện hiện tại:</span>{" "}
            Học sinh có ít nhất{" "}
            <strong className="text-[#0F172A] tabular-nums">
              {value.minExchangeCoins.toLocaleString("vi-VN")} xu
            </strong>
            {value.isExchangeWindowEnabled ? (
              <>
                {" "}
                và truy cập từ{" "}
                <strong className="text-[#0F172A] tabular-nums">
                  Ngày {value.exchangeOpenDay} đến Ngày {value.exchangeCloseDay}
                </strong>{" "}
                hàng tháng.
              </>
            ) : (
              <> (mở quanh tháng không giới hạn ngày).</>
            )}
          </div>
        </SettingsSectionRow>
      </div>
    </section>
  );
}
