"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Clock } from "lucide-react";
import { WheelWinner } from "../types";
import { WheelPanel } from "./WheelPanel";
import { cn } from "@/lib/utils";

interface WheelWinnersHistoryProps {
  winners: WheelWinner[];
}

// Màu chip phần thưởng theo giá trị xu (giải càng to càng nổi bật)
function getPrizeChipClass(rewardCoins: number): string {
  if (rewardCoins >= 200) {
    return "bg-gradient-to-b from-[#FDE047] to-[#F59E0B] text-amber-950 border-amber-500 shadow-[0_2px_0_#B45309]";
  }
  if (rewardCoins >= 80) {
    return "bg-gradient-to-b from-[#E879F9] to-[#C026D3] text-white border-fuchsia-600 shadow-[0_2px_0_#86198F]";
  }
  if (rewardCoins >= 50) {
    return "bg-gradient-to-b from-[#7DD3FC] to-[#0284C7] text-white border-sky-600 shadow-[0_2px_0_#075985]";
  }
  return "bg-gradient-to-b from-[#86EFAC] to-[#16A34A] text-white border-green-600 shadow-[0_2px_0_#166534]";
}

export function WheelWinnersHistory({ winners }: WheelWinnersHistoryProps) {
  return (
    <WheelPanel
      tone="green"
      title="BẢNG VÀNG MAY MẮN"
      subtitle="Các bạn vừa trúng thưởng"
      icon={<Trophy className="w-5 h-5 text-green-600 stroke-[2.5]" />}
      action={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-green-700 font-heading font-black text-[10.5px] shadow-[0_3px_0_rgba(0,0,0,0.2)]">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-red-500" />
          </span>
          <span>LIVE</span>
        </div>
      }
      footer={
        <p className="text-center font-heading font-black text-[11px] text-amber-800">
          🍀 Lượt tiếp theo có thể là bạn đó!
        </p>
      }
    >
      <div className="flex flex-col gap-2.5 pt-2 max-h-[320px] overflow-y-auto pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {winners.length === 0 ? (
          <div className="py-8 text-center text-xs font-heading font-bold text-amber-800/60">
            Chưa có ai quay. Hãy là người đầu tiên nhé!
          </div>
        ) : (
          winners.map((winner, index) => {
            const isNewest = index === 0;

            return (
              <div
                key={winner.id}
                className={cn(
                  "relative flex items-center gap-2.5 p-2 rounded-2xl border-2 transition-transform hover:-translate-y-0.5",
                  isNewest
                    ? "bg-gradient-to-r from-[#FFF4C2] to-[#FFE58A] border-amber-400 shadow-[0_3px_0_#F59E0B]"
                    : "bg-white border-amber-200/80 shadow-[0_3px_0_#FDE68A]"
                )}
              >
                {isNewest && (
                  <span className="absolute -top-2 left-3 px-1.5 py-px rounded-md bg-red-500 text-white font-heading font-black text-[9px] tracking-wider shadow-[0_2px_0_#991B1B]">
                    MỚI
                  </span>
                )}

                {/* Avatar viền vàng */}
                <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-b from-[#FDE047] to-[#F59E0B] flex-shrink-0 shadow-[0_2px_0_#B45309]">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-amber-100">
                    <Image
                      src={winner.avatarUrl || "/avatar.jpg"}
                      alt={winner.studentName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Tên, lớp, thời gian */}
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-black text-slate-800 text-[13px] leading-tight truncate">
                    {winner.studentName}
                  </div>
                  <div className="flex items-center gap-1.5 font-heading font-bold text-[10.5px] text-slate-500">
                    <span className="text-amber-700 whitespace-nowrap">{winner.classGroup}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-0.5 whitespace-nowrap">
                      <Clock className="w-2.5 h-2.5" />
                      {winner.wonAt}
                    </span>
                  </div>
                </div>

                {/* Chip phần thưởng */}
                <div
                  className={cn(
                    "flex-shrink-0 max-w-[45%] px-2 py-1 rounded-lg border font-heading font-black text-[10.5px] truncate",
                    getPrizeChipClass(winner.rewardCoins)
                  )}
                >
                  {winner.prizeLabel}
                </div>
              </div>
            );
          })
        )}
      </div>
    </WheelPanel>
  );
}
