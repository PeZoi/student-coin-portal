"use client";

import { Button3D } from "@/components/ui/Button3D";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface CashRewardCardProps {
  canExchange: boolean;
  onOpenModal: () => void;
}

export function CashRewardCard({ canExchange, onOpenModal }: CashRewardCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[26px] border-[3.5px] shadow-[0_10px_24px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 select-none h-full",
        "border-[#00C254] bg-[#EDFDF3]"
      )}
    >
      {/* Top Header Banner with Upward Arc - Đồng bộ chuẩn Dashboard */}
      <div className="w-full h-[60px] sm:h-[66px] pt-1.5 pb-5 px-3 flex items-center justify-center text-center text-white relative bg-gradient-to-r from-[#00C254] via-[#00A843] to-[#067F33] flex-shrink-0">
        <h3 className="font-heading font-black text-[13.5px] sm:text-[14.5px] lg:text-[15px] leading-tight drop-shadow-[0_1.5px_0_rgba(0,0,0,0.25)] select-none uppercase tracking-wide flex items-center justify-center gap-1.5">
          <span>NHẬN TIỀN MẶT</span>
        </h3>

        {/* Smooth upward arc / vòng cung */}
        <div className="absolute -bottom-px left-0 right-0 h-5 sm:h-6 w-full pointer-events-none overflow-hidden">
          <svg viewBox="0 0 500 45" preserveAspectRatio="none" className="w-full h-full fill-[#EDFDF3]">
            <path d="M0,45 Q250,-5 500,45 L500,50 L0,50 Z" />
          </svg>
        </div>
      </div>

      {/* Card Center: 3D Illustration & Information */}
      <div className="px-3.5 sm:px-4 py-2 sm:py-3.5 flex-1 flex items-center justify-between gap-3 sm:gap-3.5 my-auto">
        {/* Navigation 3D Icon */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 lg:w-22 lg:h-22 relative flex-shrink-0 transition-transform hover:scale-105 duration-200">
          <Image
            src="/rewards/cash_reward.png"
            alt="Đổi tiền mặt"
            fill
            sizes="(max-width: 640px) 72px, 88px"
            unoptimized
            className="object-contain drop-shadow-sm"
          />
        </div>

        {/* Card Details: Tag & Subtitle */}
        <div className="flex-1 flex flex-col items-start gap-1 pr-1">
          <span className="font-heading font-black text-[10.5px] sm:text-[11.5px] uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs bg-emerald-100 text-emerald-800 border-emerald-300">
            Tiền mặt
          </span>
          <span className="font-heading font-bold text-xs sm:text-[13px] text-slate-700 leading-tight">
            Nhận trực tiếp từ cô giáo
          </span>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="p-3 sm:p-3.5 pt-0.5 flex justify-center flex-shrink-0">
        <Button3D
          variant={canExchange ? "green" : "disabled"}
          fullWidth
          size="md"
          disabled={!canExchange}
          onClick={onOpenModal}
        >
          ĐỔI TIỀN MẶT
        </Button3D>
      </div>
    </div>
  );
}
