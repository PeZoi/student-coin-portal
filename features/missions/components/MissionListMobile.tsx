"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Check, ChevronRight, Clock } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { checkIsMissionOverdue } from "../hooks/useMissionFilter";
import { MissionFilter, MissionItem } from "../types";
import { formatDueLabel, URGENCY_STYLES } from "../utils/formatDueLabel";
import { MissionWoodBanner } from "./MissionWoodBanner";

interface MissionListMobileProps {
  missions: MissionItem[];
  selectedFilter: MissionFilter;
  onSelectFilter: (filter: MissionFilter) => void;
  filterCounts: { pending: number; completed: number; overdue: number };
  selectedMissionId?: string;
  onSelectMission: (mission: MissionItem) => void;
}

export function MissionListMobile({
  missions,
  selectedFilter,
  onSelectFilter,
  filterCounts,
  selectedMissionId,
  onSelectMission,
}: MissionListMobileProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBottomFade, setShowBottomFade] = useState(true);

  // Bộ lọc 3 tab: Chưa xong - Đã xong - Quá hạn (vùng chạm 36-40px, chữ >= 12px)
  const tabs: {
    id: MissionFilter;
    label: string;
    count: number;
    activeClass: string;
    inactiveClass: string;
  }[] = [
    {
      id: "pending",
      label: "Chưa xong",
      count: filterCounts.pending,
      activeClass: "bg-[#0284C7] text-white border-sky-300 shadow-[0_2px_0_#0369A1]",
      inactiveClass: "bg-amber-950/5 text-amber-950/80 hover:bg-amber-950/10 border-transparent",
    },
    {
      id: "completed",
      label: "Đã xong",
      count: filterCounts.completed,
      activeClass: "bg-[#16A34A] text-white border-emerald-300 shadow-[0_2px_0_#15803D]",
      inactiveClass: "bg-amber-950/5 text-amber-950/80 hover:bg-amber-950/10 border-transparent",
    },
    {
      id: "overdue",
      label: "Quá hạn",
      count: filterCounts.overdue,
      activeClass: "bg-[#DC2626] text-white border-rose-300 shadow-[0_2px_0_#B91C1C]",
      inactiveClass: "bg-amber-950/5 text-amber-950/80 hover:bg-amber-950/10 border-transparent",
    },
  ];

  // Helper render icon minh họa nhiệm vụ (~28px)
  const renderMissionIcon = (iconType: MissionItem["iconType"]) => {
    switch (iconType) {
      case "notebook":
        return (
          <svg viewBox="0 0 48 48" className="w-5 h-5 drop-shadow-xs" fill="none">
            <rect x="10" y="8" width="28" height="34" rx="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
            <rect x="6" y="8" width="6" height="34" rx="2" fill="#0284C7" />
            <line x1="16" y1="16" x2="32" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="22" x2="32" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="28" x2="26" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <g transform="rotate(35 34 28)">
              <rect x="32" y="16" width="6" height="22" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              <polygon points="32,38 35,44 38,38" fill="#FDE68A" />
              <polygon points="34,42 35,44 36,42" fill="#1F2937" />
            </g>
          </svg>
        );
      case "book-pen":
        return (
          <svg viewBox="0 0 48 48" className="w-5 h-5 drop-shadow-xs" fill="none">
            <path d="M 6 36 Q 16 34 24 38 Q 32 34 42 36 L 42 16 Q 32 14 24 18 Q 16 14 6 16 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
            <line x1="24" y1="18" x2="24" y2="38" stroke="#64748B" strokeWidth="2" />
            <path d="M 10 22 Q 16 20 20 22" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 10 27 Q 16 25 20 27" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            <g transform="rotate(45 36 20)">
              <rect x="34" y="8" width="5" height="24" rx="1" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
              <polygon points="34,32 36.5,38 39,32" fill="#F59E0B" />
            </g>
          </svg>
        );
      case "flags-en-vi":
        return (
          <div className="flex items-center -space-x-1 drop-shadow-xs">
            <div className="w-4.5 h-3 rounded-xs border border-slate-300 overflow-hidden relative bg-[#012169] shadow-xs transform -rotate-6">
              <svg viewBox="0 0 60 30" className="w-full h-full">
                <clipPath id="ukClipMob"><rect width="60" height="30" /></clipPath>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="8" />
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="4" />
              </svg>
            </div>
            <div className="w-4.5 h-3 rounded-xs border border-red-700 overflow-hidden relative bg-[#DA251D] flex items-center justify-center shadow-xs transform rotate-6 z-10">
              <span className="text-yellow-300 text-[6px] leading-none select-none">★</span>
            </div>
          </div>
        );
      case "flags-vi-en":
        return (
          <div className="flex items-center -space-x-1 drop-shadow-xs">
            <div className="w-4.5 h-3 rounded-xs border border-red-700 overflow-hidden relative bg-[#DA251D] flex items-center justify-center shadow-xs transform -rotate-6 z-10">
              <span className="text-yellow-300 text-[6px] leading-none select-none">★</span>
            </div>
            <div className="w-4.5 h-3 rounded-xs border border-slate-300 overflow-hidden relative bg-[#012169] shadow-xs transform rotate-6">
              <svg viewBox="0 0 60 30" className="w-full h-full">
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="8" />
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="4" />
              </svg>
            </div>
          </div>
        );
    }
  };

  // Lắng nghe sự kiện cuộn để ẩn/hiện gradient gợi ý cuộn
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setShowBottomFade(!isAtBottom);
  };

  useEffect(() => {
    handleScroll();
  }, [missions]);

  return (
    <div className="w-full flex flex-col h-full select-none min-h-0 relative">
      {/* Tấm biển gỗ tiêu đề nhỏ gọn */}
      <div className="-mt-1 mb-1.5 flex justify-center flex-shrink-0">
        <MissionWoodBanner title="NHIỆM VỤ NHẬN XU" />
      </div>

      {/* Thanh Tabs 3 mục: chiều cao 36-40px, font >= 12px, vùng chạm thân thiện */}
      <div
        role="tablist"
        aria-label="Bộ lọc trạng thái nhiệm vụ"
        className="flex items-center justify-between gap-1 w-full bg-amber-900/10 p-0.5 rounded-full border border-amber-900/15 flex-shrink-0 mb-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedFilter === tab.id}
            onClick={() => onSelectFilter(tab.id)}
            className={cn(
              "flex-1 h-9 sm:h-10 flex items-center justify-center gap-1.5 px-2 rounded-full font-heading font-black text-xs sm:text-[13px] tracking-tight border transition-all duration-200 motion-reduce:transition-none active:scale-95 shadow-xs cursor-pointer truncate",
              selectedFilter === tab.id ? tab.activeClass : tab.inactiveClass
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] sm:text-[11px] font-bold leading-none",
                selectedFilter === tab.id ? "bg-white/30 text-white" : "bg-amber-900/15 text-amber-950/80"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* VÙNG DANH SÁCH THẺ TỐI GIẢN MOBILE (CUỘN CẢM ỨNG OVERSCROLL-CONTAIN) */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 flex flex-col gap-2 sm:gap-2.5 overflow-y-auto overscroll-contain pr-1 pb-4 min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {missions.length === 0 ? (
            <div className="py-12 text-center text-amber-800/70 font-heading font-bold text-xs sm:text-sm">
              {selectedFilter === "pending" && "Tuyệt vời! Bạn không còn nhiệm vụ nào cần làm."}
              {selectedFilter === "completed" && "Chưa có nhiệm vụ nào được hoàn thành."}
              {selectedFilter === "overdue" && "Không có nhiệm vụ nào bị quá hạn."}
            </div>
          ) : (
            missions.map((mission) => {
              const isSelected = selectedMissionId === mission.id;
              const isCompleted = mission.status === "completed" || Boolean(mission.isCompleted);
              const isOverdueItem = checkIsMissionOverdue(mission);

              // Nhãn hạn nộp thân thiện (Hôm nay 21:00, Ngày mai, Còn 2 ngày, Quá hạn 2 ngày...)
              const dueInfo = formatDueLabel(mission.dueAt, {
                isCompleted,
                status: mission.status,
              });
              const urgencyStyle = URGENCY_STYLES[dueInfo.urgency];

              return (
                <button
                  type="button"
                  key={mission.id}
                  onClick={() => onSelectMission(mission)}
                  aria-pressed={isSelected}
                  aria-current={isSelected ? "true" : undefined}
                  className={cn(
                    "w-full text-left relative rounded-xl p-2.5 sm:p-3 cursor-pointer transition-all duration-150 motion-reduce:transition-none select-none flex flex-col justify-between gap-1.5 flex-shrink-0 min-h-[64px] sm:min-h-[68px] focus-visible:outline-2 focus-visible:outline-amber-600 focus-visible:outline-offset-1 active:scale-[0.985] shadow-xs",
                    isSelected
                      ? "bg-[#FFFBEB] border-2 border-amber-600 shadow-[0_2px_8px_rgba(217,119,6,0.25)]"
                      : isCompleted
                      ? "bg-[#F0FDF4]/90 hover:bg-white border border-[#86EFAC]/85"
                      : isOverdueItem
                      ? "bg-[#FFF1F2]/90 hover:bg-white border border-rose-300/85"
                      : "bg-white/90 hover:bg-white border border-amber-950/15"
                  )}
                >
                  {/* HÀNG 1: Icon minh họa (có badge đã xong/quá hạn) + Tên bài tập (line-clamp-2, font >= 13px) + Chevron */}
                  <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Cụm Icon minh họa ~28px có huy hiệu trạng thái */}
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50/90 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        {renderMissionIcon(mission.iconType)}

                        {/* Huy hiệu trạng thái nhỏ gắn trên góc icon: Đã xong (✓ xanh) hoặc Quá hạn (! đỏ) */}
                        {isCompleted ? (
                          <div
                            aria-label="Đã hoàn thành"
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center border border-white shadow-xs"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                          </div>
                        ) : isOverdueItem ? (
                          <div
                            aria-label="Đã quá hạn"
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center border border-white shadow-xs"
                          >
                            <AlertCircle className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : null}
                      </div>

                      {/* Tên nhiệm vụ (font >= 13px, hiển thị tối đa 2 dòng, không truncate 1 dòng) */}
                      <span className="font-heading font-black text-amber-950 text-[13px] sm:text-[14px] leading-tight line-clamp-2 min-w-0 flex-1">
                        {mission.title}
                      </span>
                    </div>

                    {/* Mũi tên Chevron mép phải */}
                    <ChevronRight className="w-4 h-4 text-amber-800/40 flex-shrink-0" />
                  </div>

                  {/* HÀNG 2: Chip hạn nộp (trái) + Chip Xu (phải) - không còn dòng Giao lúc */}
                  <div className="flex items-center justify-between gap-1.5 w-full pt-0.5">
                    {/* Chip hạn nộp: icon đồng hồ + text thân thiện (font >= 11px) */}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-[11.5px] font-heading font-bold border truncate",
                        urgencyStyle.bg,
                        urgencyStyle.text,
                        urgencyStyle.border
                      )}
                    >
                      <Clock className="w-3 h-3 flex-shrink-0 stroke-[2.5]" />
                      <span className="truncate">{dueInfo.text}</span>
                    </span>

                    {/* Chip Xu: Icon /coin.png 16px + số xu thưởng */}
                    <div className="inline-flex items-center gap-1 flex-shrink-0 font-heading font-black text-[12px] sm:text-[13px] text-[#D97706]">
                      <span>+{mission.rewardCoins}</span>
                      <Image
                        src="/coin.png"
                        alt="Xu"
                        width={16}
                        height={16}
                        unoptimized
                        style={{ height: "auto" }}
                        className="w-4 h-4 inline-block object-contain drop-shadow-2xs"
                      />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Lớp gradient mờ ở đáy vùng danh sách gợi ý còn nội dung cuộn */}
        {showBottomFade && missions.length > 3 && (
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-[#FFFDF7] via-[#FFFDF7]/60 to-transparent z-10 transition-opacity duration-200"
          />
        )}
      </div>
    </div>
  );
}
