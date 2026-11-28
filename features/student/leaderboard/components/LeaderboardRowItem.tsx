"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CHIBI_AVATAR_MAP: Record<string, string> = {
  "vu-huy": "/avatar-chibi/male-1.webp",
  "lan-anh": "/avatar-chibi/female-1.webp",
  "gia-bao": "/avatar-chibi/male-2.webp",
  "bao-an": "/avatar-chibi/female-2.webp",
  "minh-khang": "/avatar-chibi/male-3.webp",
  "thao-vy": "/avatar-chibi/female-3.webp",
  "tien-dat": "/avatar-chibi/male-4.webp",
};

function getLeaderboardAvatarSrc(avatarId: string): string {
  if (avatarId.startsWith("/") || avatarId.startsWith("http")) {
    return avatarId;
  }
  return CHIBI_AVATAR_MAP[avatarId] || "/avatar-chibi/male-1.webp";
}

function CrownSticker() {
  return (
    <svg
      viewBox="0 0 24 18"
      className="w-5 h-4 sm:w-6 sm:h-4.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
    >
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
      </defs>
      <path
        d="M 2 15 L 22 15 L 20 5 L 14 11 L 12 3 L 10 11 L 4 5 Z"
        fill="url(#crownGrad)"
        stroke="#E65100"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle
        cx="2"
        cy="5"
        r="1.5"
        fill="#FFE082"
        stroke="#E65100"
        strokeWidth="0.8"
      />
      <circle
        cx="12"
        cy="3"
        r="1.8"
        fill="#FFF9C4"
        stroke="#E65100"
        strokeWidth="0.8"
      />
      <circle
        cx="22"
        cy="5"
        r="1.5"
        fill="#FFE082"
        stroke="#E65100"
        strokeWidth="0.8"
      />
      <rect x="3" y="14" width="18" height="2" rx="1" fill="#FF8F00" />
    </svg>
  );
}

function LeaderboardAvatar({
  avatarId,
  name,
  hasCrown = false,
  className = "w-10 h-10",
}: {
  avatarId: string;
  name: string;
  hasCrown?: boolean;
  className?: string;
}) {
  const avatarSrc = getLeaderboardAvatarSrc(avatarId);

  return (
    <div className={cn("relative flex-shrink-0 select-none", className)}>
      {hasCrown && (
        <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
          <CrownSticker />
        </div>
      )}
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/90 shadow-[0_2px_6px_rgba(0,0,0,0.12)] bg-[#FFF5E6] flex items-center justify-center relative">
        <Image
          src={avatarSrc}
          alt={name}
          fill
          sizes="48px"
          unoptimized
          className="object-cover"
        />
      </div>
    </div>
  );
}

export interface LeaderboardRowItemProps {
  rank: number;
  name: string;
  avatarId: string;
  classGroup: string;
  showClassBadge?: boolean;
  isCurrentUser?: boolean;
  type: "coins" | "progress";
  coins?: number;
  bonusCoins?: number;
  completedMissionsCount?: number;
  totalMissionsCount?: number;
  deltaCoins?: number;
  prevMonthCoins?: number;
  currentMonthCoins?: number;
  isNewStudent?: boolean;
}

export function LeaderboardRowItem({
  rank,
  name,
  avatarId,
  classGroup,
  showClassBadge = false,
  isCurrentUser = false,
  type,
  coins,
  bonusCoins,
  completedMissionsCount = 0,
  totalMissionsCount = 0,
  deltaCoins = 0,
  prevMonthCoins = 0,
  currentMonthCoins = 0,
  isNewStudent = false,
}: LeaderboardRowItemProps) {
  const isTop3 = rank <= 3 && !isNewStudent;

  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-between px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl transition-all border-2 box-border flex-shrink-0",
        isTop3
          ? "h-[60px] sm:h-[64px] lg:h-[68px]"
          : "h-[52px] sm:h-[56px] lg:h-[60px]",
        isCurrentUser
          ? "bg-gradient-to-r from-[#FFFBE8] via-[#FFF5D6] to-[#FFFBE8] border-[#F59E0B] shadow-[0_4px_12px_rgba(245,158,11,0.22)]"
          : "border-transparent hover:bg-slate-50/80"
      )}
    >
      {/* Huy hiệu "Bạn" nổi bật góc trên bên phải khi là hàng của học sinh đang đăng nhập */}
      {isCurrentUser && (
        <div className="absolute -top-2.5 sm:-top-3 right-6 sm:right-8 z-20">
          <span className="bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white text-[11px] sm:text-xs font-heading font-black px-2.5 sm:px-3 py-0.5 rounded-full shadow-md border border-white/90 select-none tracking-wide">
            Bạn
          </span>
        </div>
      )}

      {/* Cụm bên trái: Huy chương + Avatar + Tên & Điểm */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
        {/* 1. Huy chương Top 1, 2, 3 hoặc Huy hiệu tròn Rank 4+ */}
        <div className="w-10 sm:w-11 lg:w-12 flex-shrink-0 flex items-center justify-center">
          {isTop3 ? (
            <div className="relative w-9.5 sm:w-11 lg:w-11.5 aspect-[48/52] flex-shrink-0">
              <Image
                src={`/leaderboard/top-${rank}.webp`}
                alt={`Huy chương Top ${rank}`}
                width={52}
                height={58}
                priority={rank === 1}
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

        {/* 2. Avatar Chibi */}
        <LeaderboardAvatar
          avatarId={avatarId}
          name={name}
          hasCrown={rank === 1 && !isNewStudent}
          className={cn(
            "flex-shrink-0",
            isTop3
              ? "w-10.5 h-10.5 sm:w-11.5 sm:h-11.5 lg:w-12 lg:h-12"
              : "w-9 h-9 sm:w-10 sm:h-10 lg:w-10.5 lg:h-10.5"
          )}
        />

        {/* 3. Tên học sinh, Lớp và Thông số tương ứng */}
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-heading font-black text-slate-800 text-sm sm:text-base lg:text-lg truncate leading-snug">
              {name}
            </span>
            {showClassBadge && classGroup && (
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
            )}
          </div>

          {/* Dòng 2: Xu học tập (Top Xu) hoặc mức tiến bộ ΔXu (Top Tiến Bộ) */}
          {type === "coins" ? (
            <div className="flex items-center gap-2 sm:gap-2.5 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <Image
                  src="/wheel/coin.webp"
                  alt="Xu"
                  width={18}
                  height={18}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain flex-shrink-0"
                />
                <span className="font-heading font-black text-[#D97706] text-xs sm:text-sm lg:text-base whitespace-nowrap leading-none">
                  {(coins ?? 0).toLocaleString("vi-VN")} xu
                </span>
              </div>
              {totalMissionsCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-heading font-bold text-slate-500 whitespace-nowrap leading-none">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  <span>
                    {completedMissionsCount}/{totalMissionsCount} bài
                  </span>
                </span>
              )}
            </div>
          ) : isNewStudent ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-heading font-bold bg-sky-100 text-[#0A62D6] border border-sky-200 leading-none">
                Học sinh mới • Chưa xét tiến bộ
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
              {deltaCoins > 0 ? (
                <span className="font-heading font-black text-emerald-600 text-xs sm:text-sm lg:text-base whitespace-nowrap leading-none">
                  +{deltaCoins.toLocaleString("vi-VN")} xu 📈
                </span>
              ) : deltaCoins === 0 ? (
                <span className="font-heading font-bold text-slate-500 text-xs sm:text-sm whitespace-nowrap leading-none">
                  Giữ nguyên
                </span>
              ) : (
                <span className="font-heading font-bold text-rose-500 text-xs sm:text-sm whitespace-nowrap leading-none">
                  {deltaCoins.toLocaleString("vi-VN")} xu
                </span>
              )}
              <span className="hidden sm:inline font-heading font-semibold text-[11px] sm:text-xs text-slate-400 whitespace-nowrap leading-none">
                ({prevMonthCoins.toLocaleString("vi-VN")} →{" "}
                {currentMonthCoins.toLocaleString("vi-VN")} xu)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cụm bên phải: Thưởng xu cho Top 1, 2, 3 đủ điều kiện */}
      <div className="flex items-center justify-end flex-shrink-0 pl-1">
        {isTop3 && bonusCoins ? (
          <div className="flex items-center gap-1 font-heading font-black text-[#D97706] text-sm sm:text-base lg:text-lg whitespace-nowrap">
            <span>+{bonusCoins}</span>
            <Image
              src="/wheel/coin.webp"
              alt="Xu thưởng"
              width={20}
              height={20}
              unoptimized
              style={{ height: "auto" }}
              className="w-4.5 h-4.5 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5 object-contain drop-shadow-xs flex-shrink-0"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
