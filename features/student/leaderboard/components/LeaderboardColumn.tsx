"use client";

import React from "react";
import { Lock } from "lucide-react";
import { TopCoinStudent, TopProgressStudent } from "../types";
import { LeaderboardRowItem } from "./LeaderboardRowItem";
import { cn } from "@/lib/utils";

interface LeaderboardColumnProps {
  type: "coins" | "progress";
  title: string;
  subtitle?: string;
  theme: "blue" | "amber" | "green";
  coinItems?: TopCoinStudent[];
  progressItems?: TopProgressStudent[];
  isLocked?: boolean;
  lockedDescription?: string;
  isLoading?: boolean;
  showClassBadge?: boolean;
}

export function LeaderboardColumn({
  type,
  title,
  subtitle,
  theme,
  coinItems = [],
  progressItems = [],
  isLocked = false,
  lockedDescription,
  isLoading = false,
  showClassBadge = false,
}: LeaderboardColumnProps) {
  const isCoins = type === "coins";
  const items = isCoins ? coinItems : progressItems;

  const top3 = items.slice(0, 3);
  const remaining = items.slice(3);

  const headerGradient =
    theme === "blue"
      ? "bg-gradient-to-r from-[#0080FF] via-[#0091FF] to-[#006ED6]"
      : theme === "amber"
      ? "bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#EA580C]"
      : "bg-gradient-to-r from-[#00A844] via-[#00C050] to-[#008F38]";

  const dashedColor =
    theme === "blue"
      ? "border-sky-200/90"
      : theme === "amber"
      ? "border-amber-200/90"
      : "border-emerald-200/90";

  return (
    <div
      className={cn(
        "relative w-full h-full flex-1 min-h-0 rounded-[20px] sm:rounded-[24px] bg-white shadow-md border-2 border-white overflow-hidden flex flex-col justify-start transition-opacity duration-200",
        isLoading && "opacity-75"
      )}
    >
      {/* Header Bar dạng Vòng cung Game UI - Giữ nguyên style đặc trưng */}
      <div
        className={cn(
          "w-full h-[56px] sm:h-[62px] lg:h-[66px] flex-shrink-0 pt-1 pb-3.5 sm:pb-4.5 px-3 text-center flex flex-col items-center justify-center select-none shadow-xs relative",
          headerGradient
        )}
      >
        <h3 className="font-heading font-black text-base sm:text-lg lg:text-xl text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center gap-1.5 whitespace-nowrap select-none leading-tight">
          <span>{title}</span>
        </h3>
        {subtitle && (
          <p className="text-[11px] sm:text-xs font-heading font-bold text-white/90 truncate max-w-full leading-tight mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
            {subtitle}
          </p>
        )}

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

      {/* Nội dung danh sách học sinh */}
      <div className="w-full flex-1 min-h-0 p-2 sm:p-2.5 sm:px-3.5 pt-0.5 sm:pt-1 flex flex-col overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#7DD3FC_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-sky-400/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-1">
        {isLocked ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center font-heading">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border-2 border-sky-200/80 text-[#0A62D6] flex items-center justify-center mb-3 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <p className="text-base sm:text-lg font-black text-slate-800">
              Bảng Tiến Bộ chưa mở trong kỳ này
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1.5 max-w-md leading-relaxed">
              {lockedDescription ||
                "Tháng trước chưa có dữ liệu xu học tập để đối chiếu. Các bạn hãy chăm chỉ làm bài tập tháng này để tháng sau bứt phá trên bảng tiến bộ nhé!"}
            </p>
          </div>
        ) : top3.length > 0 ? (
          <>
            {/* Khối Top 1, 2, 3 */}
            <div className="flex flex-col gap-1.5 sm:gap-2 w-full flex-shrink-0">
              {top3.map((item) => (
                <LeaderboardRowItem
                  key={item.id}
                  rank={item.rank}
                  name={item.name}
                  avatarId={item.avatarId}
                  classGroup={item.classGroup}
                  showClassBadge={showClassBadge}
                  isCurrentUser={item.isCurrentUser}
                  type={type}
                  coins={isCoins ? (item as TopCoinStudent).coins : undefined}
                  bonusCoins={item.bonusCoins}
                  completedMissionsCount={item.completedMissionsCount}
                  totalMissionsCount={item.totalMissionsCount}
                  deltaCoins={
                    !isCoins
                      ? (item as TopProgressStudent).deltaCoins
                      : undefined
                  }
                  prevMonthCoins={
                    !isCoins
                      ? (item as TopProgressStudent).prevMonthCoins
                      : undefined
                  }
                  currentMonthCoins={
                    !isCoins
                      ? (item as TopProgressStudent).currentMonthCoins
                      : undefined
                  }
                  isNewStudent={
                    !isCoins
                      ? (item as TopProgressStudent).isNewStudent
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Đường gạch ngang phân cách nét đứt sau Top 3 */}
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
                  showClassBadge={showClassBadge}
                  isCurrentUser={item.isCurrentUser}
                  type={type}
                  coins={isCoins ? (item as TopCoinStudent).coins : undefined}
                  bonusCoins={item.bonusCoins}
                  completedMissionsCount={item.completedMissionsCount}
                  totalMissionsCount={item.totalMissionsCount}
                  deltaCoins={
                    !isCoins
                      ? (item as TopProgressStudent).deltaCoins
                      : undefined
                  }
                  prevMonthCoins={
                    !isCoins
                      ? (item as TopProgressStudent).prevMonthCoins
                      : undefined
                  }
                  currentMonthCoins={
                    !isCoins
                      ? (item as TopProgressStudent).currentMonthCoins
                      : undefined
                  }
                  isNewStudent={
                    !isCoins
                      ? (item as TopProgressStudent).isNewStudent
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 font-heading">
            <p className="text-sm sm:text-base font-bold text-slate-600">
              Chưa có dữ liệu xếp hạng
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
              Kỳ này chưa ghi nhận dữ liệu thi đua cho lớp học này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
