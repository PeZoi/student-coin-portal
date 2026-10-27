"use client";

import React from "react";
import { X, ShieldCheck, Sparkles, Trophy, Coins, Gift } from "lucide-react";
import { WheelConfig, WheelRule } from "../types";
import { defaultWheelConfig, getWheelRules } from "../data/wheelData";
import { Button3D } from "@/components/ui/Button3D";

interface WheelRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: WheelConfig;
  rules?: WheelRule[];
}

const RULE_THEMES = [
  {
    Icon: Trophy,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100/90 border-amber-200/90",
  },
  {
    Icon: Coins,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100/90 border-orange-200/90",
  },
  {
    Icon: Gift,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100/90 border-emerald-200/90",
  },
  {
    Icon: ShieldCheck,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100/90 border-sky-200/90",
  },
];

export function WheelRulesModal({
  isOpen,
  onClose,
  config = defaultWheelConfig,
  rules,
}: WheelRulesModalProps) {
  if (!isOpen) return null;

  const currentRules = rules || getWheelRules(config);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md sm:max-w-lg bg-white rounded-[26px] sm:rounded-[30px] border-2 border-amber-300/80 shadow-[0_25px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(251,191,36,0.2)] p-4 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Nút đóng tròn nhẹ nhàng */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng bảng thể lệ"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/80 shadow-xs flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Tiêu đề Modal: Màu sắc tương phản cao, hiện đại và thanh lịch */}
        <div className="flex items-center gap-3 pb-3 sm:pb-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FFE84D] via-[#FFBA08] to-[#F59E0B] border-2 border-white shadow-[0_3px_8px_rgba(245,158,11,0.3)] flex items-center justify-center text-white flex-shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-heading font-black text-slate-800 text-base sm:text-lg tracking-tight">
              THỂ LỆ THAM GIA
            </h3>
            <p className="font-sans font-medium text-slate-500 text-xs sm:text-[13px]">
              Quy tắc quay thưởng và cơ chế nhận quà Heo Đất
            </p>
          </div>
        </div>

        {/* Thân Modal: Thẻ trắng sạch sẽ, font chữ rõ nét dễ đọc */}
        <div className="flex-1 overflow-y-auto pr-1 my-3 sm:my-3.5 space-y-2.5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.4)_transparent]">
          {currentRules.map((rule, idx) => {
            const theme = RULE_THEMES[idx % RULE_THEMES.length];
            const RuleIcon = theme.Icon;

            return (
              <div
                key={rule.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-amber-300 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex items-start gap-3 sm:gap-3.5"
              >
                {/* Icon chủ đề màu sắc tươi sáng */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${theme.iconBg} ${theme.iconColor} border flex items-center justify-center flex-shrink-0 shadow-xs`}
                >
                  <RuleIcon className="w-5 h-5 stroke-[2.3]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="font-heading font-black text-slate-800 text-sm sm:text-[14.5px] tracking-tight mb-1">
                    {rule.title}
                  </h5>
                  <p className="font-sans font-normal text-slate-600 text-xs sm:text-[13px] leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Hộp mẹo nhỏ: Tông vàng kem dịu mắt, chữ than dễ đọc */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-200/60 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-700 stroke-[2.3]" />
            </div>
            <p className="font-sans font-medium text-slate-700 text-xs sm:text-[12.5px] leading-snug">
              <strong className="text-amber-900 font-bold">Mẹo nhỏ:</strong> Hoàn thành thêm nhiều bài tập mỗi ngày để tích lũy xu quay thưởng nhé!
            </p>
          </div>
        </div>

        {/* Chân Modal */}
        <div className="pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
          <Button3D variant="yellow" size="sm" onClick={onClose} className="px-8 font-heading font-bold text-sm">
            <span>Đã hiểu</span>
          </Button3D>
        </div>
      </div>
    </div>
  );
}
