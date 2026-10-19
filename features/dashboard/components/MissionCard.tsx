"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Mission } from "../types";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/utils";

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const { openSubmitModal, submitMission } = useUserStore();
  const isCompleted = mission.status === "completed";

  const handleActionClick = () => {
    if (isCompleted) return;

    if (mission.actionType === "upload") {
      openSubmitModal(mission);
    } else {
      // Direct report confirmation
      submitMission(mission.id);
    }
  };

  return (
    <div className="relative bg-white rounded-[24px] border-4 border-white shadow-[0_10px_24px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
      {/* Top Header Banner with 3D drop-shadow and gradient */}
      <div
        className={cn(
          "w-full px-4 py-2.5 text-center text-white font-heading font-black text-sm sm:text-base tracking-wide rounded-t-[18px] shadow-sm flex items-center justify-center min-h-[48px]",
          mission.headerBg
        )}
      >
        <span className="drop-shadow-[0_1.5px_0_rgba(0,0,0,0.3)] leading-snug">
          {mission.title}
        </span>
      </div>

      {/* Card Center: Icon & Reward Badge */}
      <div className="px-4 py-3.5 flex items-center justify-between gap-3 bg-gradient-to-b from-white to-[#F8FAFC]">
        {/* Mission Illustration (PNG unoptimized) */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0">
          <Image
            src={mission.iconSrc}
            alt={mission.title}
            fill
            sizes="(max-width: 640px) 64px, 80px"
            unoptimized
            className="object-contain drop-shadow-sm"
          />
        </div>

        {/* Reward Coins Golden Badge */}
        <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#FFFDF0] to-[#FFF3CE] border-2 border-[#FFD066] px-3.5 py-1 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_6px_rgba(200,120,0,0.14)]">
          <div className="w-5 h-5 relative flex-shrink-0">
            <Image src="/coin.png" alt="Coin" fill sizes="20px" unoptimized className="object-contain" />
          </div>
          <span className="text-amber-800 font-heading font-black text-lg sm:text-xl drop-shadow-[0_1px_0_#FFF]">
            +{mission.rewardCoins}
          </span>
          <span className="text-amber-700 font-heading font-black text-xs sm:text-sm">
            xu
          </span>
        </div>
      </div>

      {/* Bottom Action Button (Pure 3D Pill - NO WHITE BORDER) */}
      <div className="p-3.5 pt-1.5 bg-[#F8FAFC] flex justify-center">
        {isCompleted ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-full bg-slate-200 shadow-[0_3px_0_#CBD5E1] text-slate-500 font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-default select-none"
          >
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Đã nhận thưởng</span>
          </button>
        ) : mission.buttonVariant === "yellow" ? (
          <button
            onClick={handleActionClick}
            className="group relative w-full py-2.5 px-4 rounded-full bg-gradient-to-b from-[#FFE84D] via-[#FFBA08] to-[#F48C06] shadow-[inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-2px_0_rgba(0,0,0,0.15),0_5px_0_#9D4800,0_8px_14px_rgba(0,0,0,0.2)] active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#9D4800,0_3px_6px_rgba(0,0,0,0.18)] transition-all cursor-pointer text-center select-none overflow-hidden hover:brightness-105"
          >
            {/* Top Gloss Sheen */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />
            <span className="relative z-10 text-[#4D2200] font-heading font-black text-sm sm:text-[15px] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] tracking-wide">
              {mission.buttonText}
            </span>
          </button>
        ) : (
          <button
            onClick={handleActionClick}
            className="group relative w-full py-2.5 px-4 rounded-full bg-gradient-to-b from-[#34E876] via-[#1DC459] to-[#0A8F3D] shadow-[inset_0_2px_0_rgba(255,255,255,0.65),inset_0_-2px_0_rgba(0,0,0,0.15),0_5px_0_#065F26,0_8px_14px_rgba(0,0,0,0.2)] active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#065F26,0_3px_6px_rgba(0,0,0,0.18)] transition-all cursor-pointer text-center select-none overflow-hidden hover:brightness-105"
          >
            {/* Top Gloss Sheen */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-full pointer-events-none" />
            <span className="relative z-10 text-white font-heading font-black text-sm sm:text-[15px] drop-shadow-[0_1.5px_0_#064D1F] tracking-wide">
              {mission.buttonText}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
