"use client";

import { Button3D } from "@/components/ui/Button3D";
import { Mission } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const isCompleted = mission.status === "completed";

  return (
    <div
      className={cn(
        "relative rounded-[26px] border-[3.5px] shadow-[0_10px_24px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1",
        mission.borderColor || "border-[#0091FF]",
        mission.bodyBg || "bg-[#EBF6FF]"
      )}
    >
      {/* Top Header Banner with Upward Arc - Fixed Synchronous Height */}
      <div className={cn("w-full h-[66px] sm:h-[72px] pt-1.5 pb-5 px-3 flex items-center justify-center text-center text-white relative", mission.headerBg)}>
        <h3 className="font-heading font-black text-[13px] sm:text-[14px] lg:text-[14.5px] leading-tight drop-shadow-[0_1.5px_0_rgba(0,0,0,0.25)] select-none">
          {mission.title}
        </h3>

        {/* Smooth upward arc */}
        <div className="absolute -bottom-px left-0 right-0 h-5 sm:h-6 w-full pointer-events-none overflow-hidden">
          <svg viewBox="0 0 500 45" preserveAspectRatio="none" className={cn("w-full h-full", mission.arcFill)}>
            <path d="M0,45 Q250,-5 500,45 L500,50 L0,50 Z" />
          </svg>
        </div>
      </div>

      {/* Card Center: Icon & 3D Reward Text */}
      <div className="px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        {/* Mission Illustration */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0 transition-transform hover:scale-105 duration-200">
          <Image
            src={mission.iconSrc}
            alt={mission.title}
            fill
            sizes="(max-width: 640px) 64px, 80px"
            unoptimized
            className="object-contain drop-shadow-sm"
          />
        </div>

        {/* 3D Reward Text (+40 xu) floating on pastel background */}
        <div className="flex items-baseline gap-1 select-none pr-1 sm:pr-2">
          <span className="font-heading font-black text-2xl sm:text-3xl text-[#FFB000] [text-shadow:_0_2px_0_#9E4500,_0_4px_8px_rgba(150,60,0,0.25)]">
            +{mission.rewardCoins}
          </span>
          <span className="font-heading font-black text-lg sm:text-2xl text-[#FFB000] [text-shadow:_0_1.5px_0_#9E4500,_0_3px_6px_rgba(150,60,0,0.2)]">
            xu
          </span>
        </div>
      </div>

      {/* Bottom Action Button (Pure 3D Pill) */}
      <div className="p-3.5 pt-1 flex justify-center">
        {isCompleted ? (
          <Button3D variant="disabled" fullWidth size="md">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Đã nhận thưởng</span>
          </Button3D>
        ) : (
          <Button3D
            variant={mission.buttonVariant === "yellow" ? "yellow" : "green"}
            fullWidth
            size="md"
          >
            {mission.buttonText}
          </Button3D>
        )}
      </div>
    </div>
  );
}
