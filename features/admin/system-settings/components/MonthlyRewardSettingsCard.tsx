"use client";

import Image from "next/image";
import { Award, Trophy } from "lucide-react";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";

export interface MonthlyRewardSettingsFormState {
  top1BonusCoins: number;
  top2BonusCoins: number;
  top3BonusCoins: number;
  progressRewardMode: "all_qualifying" | "top_rank_only";
}

interface MonthlyRewardSettingsCardProps {
  value: MonthlyRewardSettingsFormState;
  onChange: (next: MonthlyRewardSettingsFormState) => void;
}

const PROGRESS_REWARD_MODE_OPTIONS: TeacherSelectOption[] = [
  {
    label: "Trao cho tất cả học sinh đạt tiêu chí tiến bộ",
    value: "all_qualifying",
  },
  {
    label: "Chỉ trao cho nhóm dẫn đầu bảng xếp hạng",
    value: "top_rank_only",
  },
];

/**
 * Thẻ 3: Thưởng thi đua Bảng vàng hàng tháng
 */
export function MonthlyRewardSettingsCard({
  value,
  onChange,
}: MonthlyRewardSettingsCardProps) {
  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Header Card */}
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#15803D] border border-emerald-100 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Thưởng thi đua Bảng vàng tháng
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Thiết lập mức xu thưởng vinh danh Top 3 và chế độ khuyến khích học sinh tiến bộ mỗi cuối tháng.
          </p>
        </div>
      </div>

      {/* Top 1 - 2 - 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label
            htmlFor="top1-bonus-coins"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold">
              1
            </span>
            <span>Thưởng Hạng 1</span>
          </label>
          <div className="relative">
            <input
              id="top1-bonus-coins"
              type="number"
              min={0}
              step={50}
              value={value.top1BonusCoins}
              onChange={(e) =>
                onChange({
                  ...value,
                  top1BonusCoins: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-full h-10 pl-3 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 pointer-events-none">
              <Image
                src="/wheel/coin.webp"
                alt="Xu"
                width={13}
                height={13}
                unoptimized
                style={{ height: "auto" }}
                className="w-3.5 h-3.5"
              />
              <span>xu</span>
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="top2-bonus-coins"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-extrabold">
              2
            </span>
            <span>Thưởng Hạng 2</span>
          </label>
          <div className="relative">
            <input
              id="top2-bonus-coins"
              type="number"
              min={0}
              step={50}
              value={value.top2BonusCoins}
              onChange={(e) =>
                onChange({
                  ...value,
                  top2BonusCoins: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-full h-10 pl-3 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 pointer-events-none">
              <Image
                src="/wheel/coin.webp"
                alt="Xu"
                width={13}
                height={13}
                unoptimized
                style={{ height: "auto" }}
                className="w-3.5 h-3.5"
              />
              <span>xu</span>
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="top3-bonus-coins"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-extrabold">
              3
            </span>
            <span>Thưởng Hạng 3</span>
          </label>
          <div className="relative">
            <input
              id="top3-bonus-coins"
              type="number"
              min={0}
              step={50}
              value={value.top3BonusCoins}
              onChange={(e) =>
                onChange({
                  ...value,
                  top3BonusCoins: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-full h-10 pl-3 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 pointer-events-none">
              <Image
                src="/wheel/coin.webp"
                alt="Xu"
                width={13}
                height={13}
                unoptimized
                style={{ height: "auto" }}
                className="w-3.5 h-3.5"
              />
              <span>xu</span>
            </span>
          </div>
        </div>
      </div>

      {/* Chế độ thưởng học sinh tiến bộ */}
      <TeacherSelect
        label="Chế độ trao thưởng Học sinh tiến bộ"
        icon={<Award className="w-4 h-4 text-emerald-600" />}
        size="sm"
        options={PROGRESS_REWARD_MODE_OPTIONS}
        value={value.progressRewardMode}
        onChange={(val) =>
          onChange({
            ...value,
            progressRewardMode:
              val === "top_rank_only" ? "top_rank_only" : "all_qualifying",
          })
        }
      />
    </section>
  );
}
