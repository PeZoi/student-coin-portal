"use client";

import React from "react";
import { ArrowLeft, Clock, HelpCircle } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { DashboardBackgroundDecor } from "@/features/student/dashboard/components/DashboardBackgroundDecor";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { StudentLeaderboardPayload } from "../types";
import { LeaderboardPeriodTabs } from "./LeaderboardPeriodTabs";
import { LeaderboardClassFilter } from "./LeaderboardClassFilter";
import { LeaderboardBoardTabs } from "./LeaderboardBoardTabs";
import { LeaderboardColumn } from "./LeaderboardColumn";
import { StudentLeaderboardRuleModal } from "./StudentLeaderboardRuleModal";

interface LeaderboardViewProps {
  initialData: StudentLeaderboardPayload;
}

export function LeaderboardView({ initialData }: LeaderboardViewProps) {
  const {
    activePeriod,
    setActivePeriod,
    activeBoard,
    setActiveBoard,
    selectedClass,
    setSelectedClass,
    canSelectClass,
    availableClasses,
    data,
    isLoading,
    isRuleModalOpen,
    setIsRuleModalOpen,
  } = useLeaderboard({ initialData });

  const activeBoardMeta =
    activeBoard === "top_coins"
      ? {
          type: "coins" as const,
          title: "TOP XU HỌC TẬP THÁNG NÀY",
          subtitle: `${data.periodLabel}`,
          theme: "blue" as const,
          isLocked: false,
          lockedDescription: undefined,
        }
      : activeBoard === "progress_leaders"
      ? {
          type: "progress" as const,
          title: "TIẾN BỘ • NHÓM DẪN ĐẦU",
          subtitle: data.previousMonthLabel
            ? `Nửa trên lớp ${data.previousMonthLabel}`
            : "Dành cho nhóm chăm chỉ dẫn đầu tháng trước",
          theme: "amber" as const,
          isLocked: !data.hasPreviousMonthData,
          lockedDescription:
            "Tháng trước chưa có dữ liệu xu học tập để phân nhóm Dẫn Đầu. Các bạn hãy tích lũy thật nhiều xu tháng này nhé!",
        }
      : {
          type: "progress" as const,
          title: "TIẾN BỘ • NHÓM VƯƠN LÊN",
          subtitle: data.previousMonthLabel
            ? `Nửa sau lớp ${data.previousMonthLabel} bứt tốc`
            : "Dành cho nhóm bứt tốc từ nửa sau tháng trước",
          theme: "green" as const,
          isLocked: !data.hasPreviousMonthData,
          lockedDescription:
            "Tháng trước chưa có dữ liệu xu học tập để phân nhóm Vươn Lên. Các bạn hãy làm bài tập đều đặn để tháng sau bứt tốc nhé!",
        };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col justify-between items-center px-3 sm:px-6 lg:px-8 pt-2 pb-2.5 sm:pt-2.5 sm:pb-3.5 min-h-0 overflow-y-auto md:overflow-hidden select-none">
      {/* Background Decor: Mây thực tế bồng bềnh và ánh sao lấp lánh */}
      <DashboardBackgroundDecor />

      {/* Main Container - Chiếm trọn không gian vừa vặn trên Desktop */}
      <main className="relative z-10 w-full max-w-4xl h-full flex-1 min-h-0 flex flex-col items-center justify-between">
        {/* Thanh công cụ đỉnh: Quay lại (Trái) cùng hàng với Chuyển kỳ tháng + Chọn lớp (Staff) + Luật */}
        <div className="flex-shrink-0 mb-2 sm:mb-2.5 flex flex-wrap items-center justify-between gap-2 w-full z-20 relative pt-0.5">
          <Button3D
            href="/student"
            variant="yellow"
            size="sm"
            className="h-8 sm:h-9 gap-1 sm:gap-1.5 px-3 sm:px-3.5 text-xs sm:text-sm tracking-wide flex-shrink-0 inline-flex items-center justify-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            <span>Quay lại</span>
          </Button3D>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2.5 flex-1">
            <LeaderboardPeriodTabs
              activePeriod={activePeriod}
              onChangePeriod={setActivePeriod}
            />

            {/* Select lớp hiện cho Teacher / Super-Teacher / Admin */}
            {canSelectClass && (
              <LeaderboardClassFilter
                selectedClass={selectedClass}
                onChangeClass={setSelectedClass}
                classes={availableClasses}
              />
            )}

            {/* Nút xem Luật xếp hạng */}
            <button
              type="button"
              onClick={() => setIsRuleModalOpen(true)}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-[#0B4899]/80 hover:bg-[#0E54B0] active:scale-95 backdrop-blur-md border border-sky-300/40 shadow-[0_8px_20px_rgba(0,25,75,0.3)] text-xs sm:text-sm font-heading font-black text-sky-100 hover:text-white transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0" />
              <span>Luật xếp hạng</span>
            </button>
          </div>
        </div>

        {/* Khung Bảng Xếp Hạng Lớn Bo Tròn Kính Mờ (Glassmorphism Outer Box) */}
        <div className="w-full flex-1 min-h-0 relative z-10 rounded-[24px] sm:rounded-[30px] p-2.5 sm:p-3.5 lg:p-4 bg-[#1868CE]/85 backdrop-blur-md border-2 sm:border-4 border-sky-200/55 shadow-[0_16px_40px_rgba(0,25,80,0.3)] flex flex-col overflow-hidden">
          {/* 3 Tab chuyển giữa 3 Bảng xếp hạng */}
          <LeaderboardBoardTabs
            activeBoard={activeBoard}
            onChangeBoard={setActiveBoard}
            topCoinsCount={data.topCoins.length}
            leadersCount={data.progressLeaders.length}
            risersCount={data.progressRisers.length}
            hasPreviousMonthData={data.hasPreviousMonthData}
          />

          {/* Bảng xếp hạng đang chọn */}
          <section className="flex flex-col h-full flex-1 min-h-0">
            <LeaderboardColumn
              type={activeBoardMeta.type}
              title={activeBoardMeta.title}
              subtitle={activeBoardMeta.subtitle}
              theme={activeBoardMeta.theme}
              coinItems={data.topCoins}
              progressItems={
                activeBoard === "progress_leaders"
                  ? data.progressLeaders
                  : data.progressRisers
              }
              isLocked={activeBoardMeta.isLocked}
              lockedDescription={activeBoardMeta.lockedDescription}
              isLoading={isLoading}
              showClassBadge={canSelectClass}
            />
          </section>
        </div>

        {/* Ghi chú chân trang thông báo chốt top */}
        <div className="flex-shrink-0 text-center mt-1.5 sm:mt-2 px-2 select-none">
          <p className="inline-flex items-center justify-center gap-1.5 font-heading font-black text-xs sm:text-sm text-[#00224D] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] tracking-wide">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 inline-block" />
            <span>{data.footerNote}</span>
          </p>
        </div>
      </main>

      {/* Modal Luật xếp hạng thân thiện */}
      <StudentLeaderboardRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        rewardConfig={data.rewardConfig}
      />
    </div>
  );
}
