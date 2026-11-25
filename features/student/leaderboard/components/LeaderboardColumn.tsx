"use client";

import React from "react";
import { TopCoinStudent, TopProgressStudent } from "../types";
import { LeaderboardRowItem } from "./LeaderboardRowItem";
import { cn } from "@/lib/utils";

interface LeaderboardColumnProps {
  type: "coins" | "progress";
  title: string;
  theme: "blue" | "green";
  coinItems?: TopCoinStudent[];
  progressItems?: TopProgressStudent[];
}

export function LeaderboardColumn({
  type,
  title,
  theme,
  coinItems = [],
  progressItems = [],
}: LeaderboardColumnProps) {
  const isCoins = type === "coins";
  const items = isCoins ? coinItems : progressItems;

  const top3 = items.slice(0, 3);
  const remaining = items.slice(3);

  const headerGradient =
    theme === "blue"
      ? "bg-gradient-to-r from-[#0080FF] via-[#0091FF] to-[#006ED6]"
      : "bg-gradient-to-r from-[#00A844] via-[#00C050] to-[#008F38]";

  const dashedColor =
    theme === "blue" ? "border-sky-200/90" : "border-emerald-200/90";

  return (
    <div className="relative w-full h-full flex-1 min-h-0 rounded-[20px] sm:rounded-[24px] bg-white shadow-md border-2 border-white overflow-hidden flex flex-col justify-start">
      {/* Cột Header Bar dạng Vòng cung Game UI - Chiều cao cố định đồng bộ 100% giữa 2 cột */}
      <div
        className={cn(
          "w-full h-[52px] sm:h-[58px] lg:h-[62px] flex-shrink-0 pt-1 pb-3.5 sm:pb-4.5 px-3 text-center flex items-center justify-center select-none shadow-xs relative",
          headerGradient
        )}
      >
        <h3 className="font-heading font-black text-base sm:text-lg lg:text-xl text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center gap-1.5 whitespace-nowrap select-none">
          <span>{title}</span>
        </h3>

        {/* Smooth upward arc / vòng cung mềm mại như NavigationCard */}
        <div className="absolute -bottom-px left-0 right-0 h-4 sm:h-5 w-full pointer-events-none overflow-hidden">
          <svg
            viewBox="0 0 500 45"
            preserveAspectRatio="none"
            className="w-full h-full fill-white"
          >
            <path d="M0,45 Q250,-5 500,45 L500,50 L0,50 Z" />
          </svg>
        </div>
      </div>

      {/* Danh sách học sinh trong bảng */}
      <div className="w-full flex-1 min-h-0 p-2 sm:p-2.5 sm:px-3 pt-0.5 sm:pt-1 flex flex-col overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#7DD3FC_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-sky-400/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-1">
        {/* Khối Top 1, 2, 3: Cố định chiều cao đồng bộ 100% giữa 2 cột */}
        {top3.length > 0 ? (
          <div className="flex flex-col gap-1.5 sm:gap-2 w-full flex-shrink-0">
            {top3.map((item) => (
              <LeaderboardRowItem
                key={item.id}
                rank={item.rank}
                name={item.name}
                avatarId={item.avatarId}
                classGroup={item.classGroup}
                isCurrentUser={item.isCurrentUser}
                type={type}
                coins={isCoins ? (item as TopCoinStudent).coins : undefined}
                bonusCoins={
                  isCoins ? (item as TopCoinStudent).bonusCoins : undefined
                }
                increasePercent={
                  !isCoins
                    ? (item as TopProgressStudent).increasePercent
                    : undefined
                }
                bonusPoints={
                  !isCoins ? (item as TopProgressStudent).bonusPoints : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 font-heading">
            <p className="text-sm sm:text-base font-bold">Chưa có dữ liệu xếp hạng cho lớp này</p>
          </div>
        )}

        {/* Đường gạch ngang phân cách nét đứt sau Top 3: Luôn ngang bằng tuyệt đối giữa 2 cột */}
        {remaining.length > 0 && (
          <div
            className={cn(
              "w-full border-t-2 border-dashed my-2 sm:my-2.5 flex-shrink-0",
              dashedColor
            )}
          />
        )}

        {/* Danh sách từ Top 4 trở đi */}
        <div className="flex flex-col gap-1.5 sm:gap-2 w-full flex-1">
          {remaining.map((item) => (
            <LeaderboardRowItem
              key={item.id}
              rank={item.rank}
              name={item.name}
              avatarId={item.avatarId}
              classGroup={item.classGroup}
              isCurrentUser={item.isCurrentUser}
              type={type}
              coins={isCoins ? (item as TopCoinStudent).coins : undefined}
              bonusCoins={
                isCoins ? (item as TopCoinStudent).bonusCoins : undefined
              }
              increasePercent={
                !isCoins
                  ? (item as TopProgressStudent).increasePercent
                  : undefined
              }
              bonusPoints={
                !isCoins ? (item as TopProgressStudent).bonusPoints : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

