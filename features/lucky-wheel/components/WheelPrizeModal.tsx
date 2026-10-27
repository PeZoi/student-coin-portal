"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Trophy, Check, X } from "lucide-react";
import { WheelPrize } from "../types";
import { Button3D } from "@/components/ui/Button3D";

interface WheelPrizeModalProps {
  prize: WheelPrize | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WheelPrizeModal({ prize, isOpen, onClose }: WheelPrizeModalProps) {
  if (!isOpen || !prize) return null;

  const isLuck = prize.type === "luck";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#FFFDF7] to-[#FFF7E6] rounded-[28px] border-[4px] border-[#F59E0B] shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.8)] p-5 sm:p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition-colors shadow-xs"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Vòng hào quang sáng tỏa */}
        <div className="absolute -top-10 w-40 h-40 rounded-full bg-yellow-400/30 blur-2xl pointer-events-none" />

        {/* Biểu tượng phần thưởng lớn ở giữa */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 my-2 flex items-center justify-center">
          {/* Vòng sáng lấp lánh */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 opacity-20 blur-md animate-pulse" />

          {prize.type === "gift" ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white transform rotate-3">
              <Sparkles className="w-12 h-12 text-yellow-300" />
            </div>
          ) : isLuck ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-600 flex items-center justify-center shadow-lg border-2 border-white">
              <Trophy className="w-12 h-12 text-yellow-300" />
            </div>
          ) : (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28">
              <Image
                src="/coin.png"
                alt="Xu Vàng"
                fill
                unoptimized
                className="object-contain drop-shadow-[0_8px_16px_rgba(217,119,6,0.4)]"
              />
            </div>
          )}
        </div>

        {/* Tiêu đề chúc mừng */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-heading font-black text-xs sm:text-[13px] shadow-2xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isLuck ? "CỐ GẮNG LẦN SAU NHÉ!" : "CHÚC MỪNG CHIẾN THẮNG!"}</span>
          </span>

          <h3 className="font-heading font-black text-xl sm:text-2xl text-amber-950 mt-1 [text-shadow:_0_1px_0_#FFF]">
            {prize.label}
          </h3>
        </div>

        {/* Đoạn mô tả chúc mừng */}
        <p className="font-heading font-medium text-slate-700 text-xs sm:text-sm max-w-xs mb-5 leading-relaxed">
          {isLuck
            ? "Đừng nản lòng nhé! Bạn nhận được 5 xu khích lệ tinh thần và hãy tiếp tục chăm ngoan nhé!"
            : `Tuyệt vời! Phần thưởng ${prize.label} đã được chuyển thẳng vào Heo Đất của bạn!`}
        </p>

        {/* Nút Nhận ngay 3D */}
        <Button3D
          variant="green"
          size="lg"
          onClick={onClose}
          className="w-full py-2.5 sm:py-3 text-sm sm:text-base uppercase tracking-wider font-black shadow-lg"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>{isLuck ? "Đã hiểu, quay tiếp!" : "Tuyệt vời, Nhận ngay!"}</span>
        </Button3D>
      </div>
    </div>
  );
}
