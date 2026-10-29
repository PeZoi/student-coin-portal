"use client";

import React from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { LeaderboardPeriodTabs } from "./LeaderboardPeriodTabs";
import { LeaderboardClassFilter } from "./LeaderboardClassFilter";
import { LeaderboardColumn } from "./LeaderboardColumn";

export function LeaderboardView() {
  const {
    activePeriod,
    setActivePeriod,
    selectedClass,
    setSelectedClass,
    availableClasses,
    data,
  } = useLeaderboard();

  return (
    <div className="relative w-full h-full flex-1 flex flex-col justify-between items-center px-3 sm:px-6 lg:px-8 pt-2 pb-2.5 sm:pt-2.5 sm:pb-3.5 min-h-0 overflow-y-auto md:overflow-hidden select-none">
      {/* Background Decor: Mây thực tế bồng bềnh và ánh sao lấp lánh */}
      <DashboardBackgroundDecor />

      {/* Nút 3D: Quay lại Trang chủ trên Desktop */}
      <div className="hidden lg:flex items-center justify-start absolute top-2.5 sm:top-3 left-4 sm:left-6 z-30">
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          className="gap-1.5 py-1.5 px-3.5 text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Quay lại Trang chủ</span>
        </Button3D>
      </div>

      {/* Main Container - Chiếm trọn không gian vừa vặn trên Desktop, triệt tiêu scroll Y bên ngoài */}
      <main className="relative z-10 w-full max-w-5xl h-full flex-1 min-h-0 flex flex-col items-center justify-between">
        {/* Bộ chuyển đổi Tab tháng & Bộ lọc Lớp học & Thông báo chốt top */}
        <div className="flex-shrink-0 mb-2 sm:mb-2.5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full z-20 relative">
          <LeaderboardPeriodTabs
            activePeriod={activePeriod}
            onChangePeriod={setActivePeriod}
          />
          <LeaderboardClassFilter
            selectedClass={selectedClass}
            onChangeClass={setSelectedClass}
            classes={availableClasses}
          />

          {/* Badge thông báo ngày giờ cụ thể để chốt top */}
          {data.cutoffTime && (
            <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#0B4899]/85 backdrop-blur-md border border-amber-300/40 shadow-[0_8px_20px_rgba(0,25,75,0.35)] text-xs sm:text-sm font-heading select-none">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0 animate-pulse" />
              <span className="text-sky-200/90 font-bold">
                {data.isClosed ? "Đã chốt:" : "Chốt top:"}
              </span>
              <span className="text-amber-300 font-black">
                {data.cutoffTime}
              </span>
            </div>
          )}
        </div>

        {/* Khung Bảng Xếp Hạng Lớn Bo Tròn Kính Mờ (Glassmorphism Outer Box) */}
        <div className="w-full flex-1 min-h-0 relative z-10 rounded-[24px] sm:rounded-[30px] p-2.5 sm:p-3.5 lg:p-4 bg-[#1868CE]/85 backdrop-blur-md border-2 sm:border-4 border-sky-200/55 shadow-[0_16px_40px_rgba(0,25,80,0.3)] flex flex-col overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 lg:gap-4 items-stretch h-full flex-1 min-h-0">
            {/* Cột 1: TOP XU CAO NHẤT 👑 */}
            <section className="flex flex-col h-full min-h-0">
              <LeaderboardColumn
                type="coins"
                title="TOP XU CAO NHẤT"
                theme="blue"
                coinItems={data.topCoins}
              />
            </section>

            {/* Cột 2: TOP TIẾN BỘ NHẤT 🚀 */}
            <section className="flex flex-col h-full min-h-0">
              <LeaderboardColumn
                type="progress"
                title="TOP TIẾN BỘ NHẤT"
                theme="green"
                progressItems={data.topProgress}
              />
            </section>
          </div>
        </div>

        {/* Ghi chú chân trang thông báo chốt top */}
        <div className="flex-shrink-0 text-center mt-1.5 sm:mt-2 px-2 select-none">
          <p className="inline-flex items-center justify-center gap-1.5 font-heading font-black text-xs sm:text-sm text-[#00224D] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] tracking-wide">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 inline-block" />
            <span>{data.footerNote}</span>
          </p>
        </div>
      </main>
    </div>
  );
}

