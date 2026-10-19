"use client";

import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

export function PiggyBankCard() {
  const { student, spinLuckyWheel } = useUserStore();

  return (
    <div className="relative w-full bg-gradient-to-b from-[#FFE043] via-[#FFCB2B] to-[#FFAE00] rounded-[32px] border-4 border-white shadow-[0_16px_36px_rgba(0,0,0,0.22)] p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
      {/* Decorative ambient rays */}
      <div className="absolute -top-12 -right-12 w-52 h-52 bg-yellow-100/50 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-3 right-3 pointer-events-none opacity-60">
        <Sparkles className="w-7 h-7 text-yellow-100" />
      </div>

      {/* Title - Clean & Balanced 3D Cartoon Header */}
      <div className="text-center mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl lg:text-[25px] font-heading font-black uppercase tracking-wide text-white whitespace-nowrap drop-shadow-[0_2px_0_#A84800] [text-shadow:_0_2px_0_#A84800,_0_3px_5px_rgba(0,0,0,0.2)]">
          {student.piggyTitle}
        </h2>
      </div>

      {/* Mascot & Gamified Coin Vault Container - Flexible without clipping */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 my-auto w-full">
        {/* Cute Pink Piggy Mascot */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 flex-shrink-0 transition-transform hover:scale-105 duration-200">
          <Image
            src="/pig.png"
            alt="Heo Đất"
            fill
            sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 160px"
            priority
            unoptimized
            className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* Right Info: Gamified 3D Gold Coin Vault (Full width flexible, no overflow) */}
        <div className="flex-1 w-full min-w-0 flex flex-col items-center justify-center relative">
          {/* Subtle floating coins placed strictly inside bounds */}
          <div className="absolute -top-2.5 left-2 w-7 h-7 drop-shadow-sm select-none pointer-events-none z-10 -rotate-12">
            <Image src="/coin.png" alt="Coin" fill sizes="28px" unoptimized className="object-contain" />
          </div>

          <div className="absolute -top-2 right-2 w-7 h-7 drop-shadow-sm select-none pointer-events-none z-10 rotate-12">
            <Image src="/coin.png" alt="Coin" fill sizes="28px" unoptimized className="object-contain" />
          </div>

          <div className="absolute -bottom-2 right-3 w-7 h-7 drop-shadow-sm select-none pointer-events-none z-10 rotate-6">
            <Image src="/coin.png" alt="Coin" fill sizes="28px" unoptimized className="object-contain" />
          </div>

          <div className="absolute -bottom-2 left-3 w-6 h-6 drop-shadow-sm select-none pointer-events-none z-10 -rotate-12">
            <Image src="/coin.png" alt="Coin" fill sizes="24px" unoptimized className="object-contain" />
          </div>

          {/* Gamified 3D Card with Golden Bezel */}
          <div className="w-full bg-gradient-to-b from-[#FFFFFF] via-[#FFFBF0] to-[#FFF3CE] rounded-[22px] border-2 border-[#FFD066] shadow-[inset_0_2px_0_rgba(255,255,255,1),0_6px_16px_rgba(180,80,0,0.16)] px-3.5 py-3 sm:py-3.5 flex flex-col items-center text-center relative overflow-hidden">
            {/* 3D Top Ribbon / Tag */}
            <div className="bg-gradient-to-r from-[#FF7A00] via-[#FF5500] to-[#E64A00] text-white text-[11px] sm:text-xs font-heading font-black px-3.5 py-0.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-b-2 border-[#9E2A00] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <span>🪙</span>
              <span>Tổng xu tích lũy</span>
            </div>

            {/* Huge 3D Golden Counter with Coin Icon */}
            <div className="flex items-center justify-center gap-2 my-0.5 max-w-full">
              <div className="w-8 h-8 sm:w-9 sm:h-9 relative flex-shrink-0 drop-shadow-sm">
                <Image src="/coin.png" alt="Coin" fill sizes="36px" unoptimized className="object-contain" />
              </div>

              <div className="flex items-baseline gap-1 min-w-0">
                <span className="font-heading text-4xl sm:text-5xl lg:text-[46px] font-black tracking-tight bg-gradient-to-b from-[#FFAE00] via-[#FF8000] to-[#E64500] bg-clip-text text-transparent filter drop-shadow-[0_2px_0_#802800] select-none truncate">
                  {student.currentCoins}
                </span>
                <span className="font-heading text-xl sm:text-2xl font-black text-[#9E3E00] select-none flex-shrink-0">
                  xu
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button: VÒNG QUAY MAY MẮN (Single line, no spin-the-wheel, pure 3D) */}
      <div className="mt-3 sm:mt-4 w-full">
        <button
          onClick={spinLuckyWheel}
          className="group relative w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-b from-[#FFA726] via-[#FF6D00] to-[#E65100] shadow-[inset_0_2px_0_rgba(255,255,255,0.6),inset_0_-2px_0_rgba(0,0,0,0.2),0_6px_0_#8F1F00,0_10px_18px_rgba(0,0,0,0.28)] active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#8F1F00,0_4px_6px_rgba(0,0,0,0.2)] transition-all cursor-pointer overflow-hidden select-none"
        >
          {/* Subtle Top Gloss Sheen */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl pointer-events-none" />

          {/* Text: strictly single line, NO wrap, NO (Spin the Wheel) */}
          <span className="relative z-10 text-white font-heading font-black text-base sm:text-lg lg:text-xl uppercase tracking-wider drop-shadow-[0_2px_0_#6B1200] whitespace-nowrap">
            VÒNG QUAY MAY MẮN
          </span>

          {/* Wheel Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 relative flex-shrink-0 transition-transform group-hover:scale-105 duration-200 drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] z-10">
            <Image
              src="/spinner.png"
              alt="Lucky Wheel Spinner"
              fill
              sizes="48px"
              unoptimized
              className="object-contain"
            />
          </div>
        </button>
      </div>
    </div>
  );
}
