"use client";

import React from "react";
import Image from "next/image";
import { StudentChibiAvatar } from "./StudentChibiAvatar";
import { cn } from "@/lib/utils";

export interface LeaderboardRowItemProps {
  rank: number;
  name: string;
  avatarId: string;
  classGroup: string;
  isCurrentUser?: boolean;
  type: "coins" | "progress";
  coins?: number;
  bonusCoins?: number;
  increasePercent?: number;
  bonusPoints?: number;
}

export function LeaderboardRowItem({
  rank,
  name,
  avatarId,
  classGroup,
  isCurrentUser = false,
  type,
  coins,
  bonusCoins,
  increasePercent,
  bonusPoints,
}: LeaderboardRowItemProps) {
  const isTop3 = rank <= 3;

  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-between px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl transition-all border-2 box-border flex-shrink-0",
        isTop3 ? "h-[58px] sm:h-[62px] lg:h-[66px]" : "h-[50px] sm:h-[54px] lg:h-[58px]",
        isCurrentUser
          ? "bg-gradient-to-r from-[#FFFBE8] via-[#FFF5D6] to-[#FFFBE8] border-[#F59E0B] shadow-[0_4px_12px_rgba(245,158,11,0.22)]"
          : "border-transparent hover:bg-slate-50/80"
      )}
    >
      {/* Huy hiệu "Của bạn" nổi bật góc trên bên phải khi là hàng của học sinh đang đăng nhập */}
      {isCurrentUser && (
        <div className="absolute -top-2.5 sm:-top-3 right-6 sm:right-8 z-20">
          <span className="bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white text-[11px] sm:text-xs font-heading font-black px-2.5 sm:px-3 py-0.5 rounded-full shadow-md border border-white/90 select-none tracking-wide">
            Bạn
          </span>
        </div>
      )}

      {/* Cụm bên trái: Huy chương + Avatar + Tên & Điểm */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
        {/* 1. Huy chương Top 1, 2, 3 từ folder /public/leaderboard hoặc Huy hiệu tròn Rank 4+ */}
        <div className="w-10 sm:w-11 lg:w-12 flex-shrink-0 flex items-center justify-center">
          {isTop3 ? (
            <div className="relative w-9.5 sm:w-11 lg:w-11.5 aspect-[48/52] flex-shrink-0">
              <Image
                src={`/leaderboard/top-${rank}.png`}
                alt={`Huy chương Top ${rank}`}
                width={52}
                height={58}
                priority={rank === 1}
                unoptimized
                style={{ height: "auto" }}
                className="w-full h-auto object-contain drop-shadow-md select-none pointer-events-none"
              />
            </div>
          ) : (
            <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 lg:w-10 lg:h-10 rounded-full flex-shrink-0 bg-gradient-to-b from-[#F2F6FA] via-[#D8E3EF] to-[#BDCEE0] border-2 border-[#9DB3CB] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.12)] flex items-center justify-center">
              <span className="font-heading font-black text-slate-700 text-xs sm:text-sm lg:text-base leading-none">
                {rank}
              </span>
            </div>
          )}
        </div>

        {/* 2. Avatar Chibi sinh viên */}
        <StudentChibiAvatar
          avatarId={avatarId}
          name={name}
          hasCrown={rank === 1 && type === "coins"}
          className={cn(
            "flex-shrink-0",
            isTop3 ? "w-10.5 h-10.5 sm:w-11.5 sm:h-11.5 lg:w-12 lg:h-12" : "w-9 h-9 sm:w-10 sm:h-10 lg:w-10.5 lg:h-10.5"
          )}
        />

        {/* 3. Tên học sinh, Lớp và Thông số tương ứng */}
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-heading font-black text-slate-800 text-sm sm:text-base lg:text-lg truncate leading-snug">
              {name}
            </span>
            <span
              className={cn(
                "flex-shrink-0 font-heading font-black text-[10px] sm:text-[11px] lg:text-xs px-1.5 py-0.5 rounded-md leading-none border shadow-2xs",
                isCurrentUser
                  ? "bg-amber-200/90 text-amber-900 border-amber-300"
                  : "bg-sky-100/90 text-sky-800 border-sky-300/80"
              )}
            >
              {classGroup}
            </span>
          </div>

          {/* Dòng 2: Hiển thị xu tích lũy hoặc phần trăm tăng tiến độ */}
          {type === "coins" ? (
            <div className="flex items-center gap-1 mt-0.5">
              <Image
                src="/coin.png"
                alt="Xu"
                width={18}
                height={18}
                unoptimized
                style={{ height: "auto" }}
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 object-contain flex-shrink-0"
              />
              <span className="font-heading font-black text-[#D97706] text-xs sm:text-sm lg:text-base whitespace-nowrap leading-none">
                {coins?.toLocaleString("en-US")} xu
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-heading font-black text-emerald-600 text-xs sm:text-sm lg:text-base whitespace-nowrap leading-none">
                Tăng {increasePercent}%
              </span>
              <span className="text-xs sm:text-sm lg:text-base select-none">📈</span>
            </div>
          )}
        </div>
      </div>

      {/* Cụm bên phải: Thưởng +150, +100, +50 (Top Xu) hoặc +300, +200, +100 (Top Tiến Bộ) kèm ảnh xu */}
      <div className="flex items-center justify-end flex-shrink-0 pl-1">
        {type === "coins" ? (
          isTop3 && bonusCoins ? (
            /* Top 1, 2, 3: Chỉ hiện +150, +100, +50 kèm ảnh xu */
            <div className="flex items-center gap-1 font-heading font-black text-[#D97706] text-sm sm:text-base lg:text-lg whitespace-nowrap">
              <span>+{bonusCoins}</span>
              <Image
                src="/coin.png"
                alt="Xu thưởng"
                width={20}
                height={20}
                unoptimized
                style={{ height: "auto" }}
                className="w-4.5 h-4.5 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5 object-contain drop-shadow-xs flex-shrink-0"
              />
            </div>
          ) : null
        ) : (
          isTop3 && bonusPoints ? (
            /* Top 1, 2, 3 Tiến bộ: Chỉ hiện +300, +200, +100 kèm ảnh xu */
            <div className="flex items-center gap-1 font-heading font-black text-[#D97706] text-sm sm:text-base lg:text-lg whitespace-nowrap">
              <span>+{bonusPoints}</span>
              <Image
                src="/coin.png"
                alt="Xu thưởng"
                width={20}
                height={20}
                unoptimized
                style={{ height: "auto" }}
                className="w-4.5 h-4.5 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5 object-contain drop-shadow-xs flex-shrink-0"
              />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

