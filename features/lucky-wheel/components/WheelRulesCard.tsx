"use client";

import React from "react";
import { Ticket, Coins, Zap, Info, BookOpen } from "lucide-react";
import { WheelConfig } from "../types";
import { WheelPanel } from "./WheelPanel";

interface WheelRulesCardProps {
  config?: WheelConfig;
  onOpenRules?: () => void;
}

export function WheelRulesCard({ config, onOpenRules }: WheelRulesCardProps) {
  const allowFreeSpin = config?.allowFreeSpin ?? false;
  const spinCost = config?.spinCost ?? 500;

  const tips = [
    {
      id: "tip-1",
      icon: <Ticket className="w-4.5 h-4.5 text-white stroke-[2.5]" />,
      iconBg: "from-[#34D399] to-[#059669] shadow-[0_3px_0_#047857]",
      title: allowFreeSpin ? "1 lượt quay miễn phí" : "Vòng quay thử thách",
      description: allowFreeSpin
        ? "Tặng mỗi ngày khi bạn đăng nhập"
        : "Tích lũy xu từ bài tập để săn thưởng",
    },
    {
      id: "tip-2",
      icon: <Coins className="w-4.5 h-4.5 text-white stroke-[2.5]" />,
      iconBg: "from-[#FBBF24] to-[#D97706] shadow-[0_3px_0_#B45309]",
      title: `${spinCost.toLocaleString("vi-VN")} xu / lượt quay`,
      description: "Dùng xu Heo Đất để thử vận may",
    },
    {
      id: "tip-3",
      icon: <Zap className="w-4.5 h-4.5 text-white stroke-[2.5]" />,
      iconBg: "from-[#60A5FA] to-[#2563EB] shadow-[0_3px_0_#1D4ED8]",
      title: "Nhận thưởng tức thì",
      description: "Xu được cộng thẳng vào Heo Đất",
    },
  ];

  return (
    <WheelPanel
      tone="purple"
      title="BÍ KÍP SĂN QUÀ"
      subtitle="Đọc kỹ trước khi quay nhé!"
      icon={<BookOpen className="w-5 h-5 text-purple-600 stroke-[2.5]" />}
      action={
        onOpenRules && (
          <button
            type="button"
            onClick={onOpenRules}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-purple-700 font-heading font-black text-[11px] shadow-[0_3px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Thể lệ</span>
          </button>
        )
      }
    >
      <div className="flex flex-col gap-2.5">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border-2 border-amber-200/80 shadow-[0_3px_0_#FDE68A] hover:-translate-y-0.5 transition-transform"
          >
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-b ${tip.iconBg} flex items-center justify-center flex-shrink-0`}
            >
              {tip.icon}
            </div>
            <div className="min-w-0">
              <div className="font-heading font-black text-slate-800 text-[13px] leading-tight">
                {tip.title}
              </div>
              <div className="font-heading font-semibold text-slate-500 text-[11px] leading-snug">
                {tip.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </WheelPanel>
  );
}
