"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Clock, Sparkles } from "lucide-react";
import { WheelWinner } from "../types";
import { WheelPanel } from "./WheelPanel";
import { cn } from "@/lib/utils";

interface WheelWinnersHistoryProps {
  winners: WheelWinner[];
}

/**
 * Component hiển thị Badge phần thưởng:
 * - Nếu là phần thưởng xu (rewardCoins > 0): Hiển thị "+ số xu" kèm icon ảnh xu vàng (/coin.png)
 * - Nếu là vật phẩm đặc biệt: Hiển thị tên vật phẩm kèm icon Sparkles
 */
function PrizeBadge({ rewardCoins, prizeLabel }: { rewardCoins: number; prizeLabel: string }) {
  if (rewardCoins > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 via-amber-100/90 to-amber-200/90 border border-amber-300/90 shadow-2xs font-heading font-black text-xs text-[#D97706] flex-shrink-0 transition-transform hover:scale-105 select-none">
        <span>+{rewardCoins}</span>
        <Image
          src="/coin.png"
          alt="Xu"
          width={16}
          height={16}
          unoptimized
          style={{ height: "auto" }}
          className="w-3.5 h-3.5 inline-block object-contain drop-shadow-2xs"
        />
      </div>
    );
  }

  const isCard = prizeLabel.toLowerCase().includes("thẻ");
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-2xs font-heading font-black text-[10.5px] flex-shrink-0 transition-transform hover:scale-105 select-none",
        isCard
          ? "bg-gradient-to-r from-sky-50 to-blue-100/90 border-sky-300 text-sky-900"
          : "bg-gradient-to-r from-purple-50 to-fuchsia-100/90 border-purple-300 text-purple-900"
      )}
    >
      <Sparkles className="w-3 h-3 flex-shrink-0" />
      <span className="truncate max-w-[120px]">{prizeLabel || "Quà đặc biệt"}</span>
    </div>
  );
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
          winners.map((winner) => (
            <div
              key={winner.id}
              className="flex items-center gap-2.5 p-2 rounded-2xl border-2 bg-white hover:bg-amber-50/60 border-amber-200/80 shadow-[0_2px_0_#FDE68A] transition-all hover:-translate-y-0.5"
            >
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

              {/* Badge phần thưởng style mới */}
              <PrizeBadge rewardCoins={winner.rewardCoins} prizeLabel={winner.prizeLabel} />
            </div>
          ))
        )}
      </div>
    </WheelPanel>
  );
}
