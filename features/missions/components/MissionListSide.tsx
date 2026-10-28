import { formatShortDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, ChevronRight, Clock } from "lucide-react";
import Image from "next/image";
import { checkIsMissionOverdue } from "../hooks/useMissionFilter";
import { MissionFilter, MissionItem } from "../types";
import { formatDueLabel, URGENCY_STYLES } from "../utils/formatDueLabel";
import { MissionWoodBanner } from "./MissionWoodBanner";

interface MissionListSideProps {
  missions: MissionItem[];
  selectedFilter: MissionFilter;
  onSelectFilter: (filter: MissionFilter) => void;
  filterCounts: { pending: number; completed: number; overdue: number };
  selectedMissionId: string;
  onSelectMission: (mission: MissionItem) => void;
}

export function MissionListSide({
  missions,
  selectedFilter,
  onSelectFilter,
  filterCounts,
  selectedMissionId,
  onSelectMission,
}: MissionListSideProps) {
  // Bộ lọc 3 tab: Chưa xong - Đã xong - Quá hạn
  const tabs: { id: MissionFilter; label: string; activeClass: string; inactiveClass: string }[] = [
    {
      id: "pending",
      label: `Chưa xong (${filterCounts.pending})`,
      activeClass: "bg-[#0284C7] text-white border-sky-300 shadow-[0_2px_0_#0369A1]",
      inactiveClass: "bg-amber-950/5 text-amber-950/80 hover:bg-amber-950/10 border-transparent",
    },
    {
      id: "completed",
      label: `Đã xong (${filterCounts.completed})`,
      activeClass: "bg-[#16A34A] text-white border-emerald-300 shadow-[0_2px_0_#15803D]",
      inactiveClass: "bg-amber-950/5 text-amber-950/80 hover:bg-amber-950/10 border-transparent",
    },
    {
      id: "overdue",
      label: `Quá hạn (${filterCounts.overdue})`,
      activeClass: "bg-[#DC2626] text-white border-rose-300 shadow-[0_2px_0_#B91C1C]",
      inactiveClass: "bg-amber-950/5 text-amber-950/80 hover:bg-amber-950/10 border-transparent",
    },
  ];

  // Helper render icon minh họa nhiệm vụ
  const renderMissionIcon = (iconType: MissionItem["iconType"]) => {
    switch (iconType) {
      case "notebook":
        return (
          <svg viewBox="0 0 48 48" className="w-5 h-5 sm:w-5.5 sm:h-5.5 drop-shadow-sm flex-shrink-0" fill="none">
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
          <svg viewBox="0 0 48 48" className="w-5 h-5 sm:w-5.5 sm:h-5.5 drop-shadow-sm flex-shrink-0" fill="none">
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
          <div className="flex items-center -space-x-1 drop-shadow-sm flex-shrink-0">
            <div className="w-5 h-3.5 sm:w-5.5 sm:h-4 rounded-sm border border-slate-300 overflow-hidden relative bg-[#012169] shadow-sm transform -rotate-6">
              <svg viewBox="0 0 60 30" className="w-full h-full">
                <clipPath id="ukClip"><rect width="60" height="30" /></clipPath>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="8" />
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="4" />
              </svg>
            </div>
            <div className="w-5 h-3.5 sm:w-5.5 sm:h-4 rounded-sm border border-red-700 overflow-hidden relative bg-[#DA251D] flex items-center justify-center shadow-sm transform rotate-6 z-10">
              <span className="text-yellow-300 text-[7px] leading-none select-none">★</span>
            </div>
          </div>
        );
      case "flags-vi-en":
        return (
          <div className="flex items-center -space-x-1 drop-shadow-sm flex-shrink-0">
            <div className="w-5 h-3.5 sm:w-5.5 sm:h-4 rounded-sm border border-red-700 overflow-hidden relative bg-[#DA251D] flex items-center justify-center shadow-sm transform -rotate-6 z-10">
              <span className="text-yellow-300 text-[7px] leading-none select-none">★</span>
            </div>
            <div className="w-5 h-3.5 sm:w-5.5 sm:h-4 rounded-sm border border-slate-300 overflow-hidden relative bg-[#012169] shadow-sm transform rotate-6">
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

  return (
    <div className="w-full flex flex-col h-full">
      {/* Tấm biển gỗ tiêu đề: DANH SÁCH NHIỆM VỤ */}
      <div className="-mt-0.5 mb-1 sm:mb-1.5 flex justify-center flex-shrink-0">
        <MissionWoodBanner title="DANH SÁCH NHIỆM VỤ" />
      </div>

      {/* Thanh Tabs 3 mục: Chưa xong - Đã xong - Quá hạn */}
      <div
        role="tablist"
        aria-label="Bộ lọc trạng thái nhiệm vụ"
        className="flex items-center justify-between gap-1 w-full bg-amber-900/10 p-0.5 rounded-full border border-amber-900/15 flex-shrink-0 mb-1.5 sm:mb-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedFilter === tab.id}
            onClick={() => onSelectFilter(tab.id)}
            className={cn(
              "flex-1 text-center py-1 lg:py-1.5 px-1 rounded-full font-heading font-black text-[9.5px] sm:text-[10.5px] lg:text-[11px] tracking-tight border transition-all duration-200 motion-reduce:transition-none active:scale-95 shadow-xs truncate cursor-pointer",
              selectedFilter === tab.id ? tab.activeClass : tab.inactiveClass
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách nhiệm vụ dạng card bo tròn với thông tin thời gian ngắn gọn */}
      <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 lg:gap-3 overflow-y-auto pr-1 sm:pr-1.5 min-h-0 pb-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(180,83,9,0.45)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-amber-950/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-800/40 hover:[&::-webkit-scrollbar-thumb]:bg-amber-800/70 [&::-webkit-scrollbar-thumb]:rounded-full">
        {missions.length === 0 ? (
          <div className="py-8 text-center text-amber-800/60 font-heading font-medium text-xs">
            {selectedFilter === "pending" && "Tuyệt vời! Không còn nhiệm vụ nào cần làm."}
            {selectedFilter === "completed" && "Chưa có nhiệm vụ nào hoàn thành."}
            {selectedFilter === "overdue" && "Không có nhiệm vụ nào bị quá hạn."}
          </div>
        ) : (
          missions.map((mission) => {
            const isSelected = selectedMissionId === mission.id;
            const isCompleted = mission.status === "completed" || Boolean(mission.isCompleted);
            const isOverdueItem = checkIsMissionOverdue(mission);

            // Format thời gian ngắn gọn
            const assignedText = formatShortDateTime(mission.assignedAt);
            const dueInfo = formatDueLabel(mission.dueAt, {
              isCompleted,
              status: mission.status,
            });
            const urgencyStyle = URGENCY_STYLES[dueInfo.urgency];

            // Phân biệt style trạng thái 3 nhóm: ĐÃ XONG | QUÁ HẠN | CHƯA XONG
            const statusConfig = isCompleted
              ? {
                  dueBadge: cn(urgencyStyle.bg, urgencyStyle.text, urgencyStyle.border),
                  cardBase: "bg-[#F0FDF4]/90 hover:bg-white border border-[#86EFAC]/85",
                }
              : isOverdueItem
              ? {
                  dueBadge: cn(urgencyStyle.bg, urgencyStyle.text, urgencyStyle.border, "font-extrabold"),
                  cardBase: "bg-[#FFF1F2]/90 hover:bg-white border border-rose-300/85",
                }
              : {
                  dueBadge: cn(urgencyStyle.bg, urgencyStyle.text, urgencyStyle.border),
                  cardBase: "bg-white/90 hover:bg-white border border-amber-950/15",
                };

            // Style thẻ khi được chọn (Active)
            const cardStyle = isSelected
              ? "bg-[#FFFBEB] border-2 border-amber-600 shadow-[0_2px_8px_rgba(217,119,6,0.22)]"
              : statusConfig.cardBase;

            return (
              <button
                type="button"
                key={mission.id}
                onClick={() => onSelectMission(mission)}
                aria-pressed={isSelected}
                aria-current={isSelected ? "true" : undefined}
                className={cn(
                  "w-full text-left relative rounded-xl p-2 sm:p-2.5 cursor-pointer transition-all duration-150 motion-reduce:transition-none select-none flex flex-col justify-between gap-1.5 flex-shrink-0 min-h-[58px] sm:min-h-[62px] focus-visible:outline-2 focus-visible:outline-amber-600 focus-visible:outline-offset-1 active:scale-[0.99] shadow-xs",
                  cardStyle
                )}
              >
                {/* HÀNG 1: Icon minh họa (có badge đã xong/quá hạn) + Tên bài tập + Chevron */}
                <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Cụm Icon minh họa có huy hiệu trạng thái nhỏ trên góc giống Mobile */}
                    <div className="relative w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-amber-50/90 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
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

                    {/* Tên nhiệm vụ */}
                    <span
                      className={cn(
                        "font-heading font-black leading-tight line-clamp-1 sm:line-clamp-2 min-w-0 flex-1",
                        isSelected
                          ? "text-[#78350F] text-[12px] sm:text-[13px]"
                          : isOverdueItem
                          ? "text-rose-950 text-[11.5px] sm:text-[12.5px]"
                          : "text-amber-950 text-[11.5px] sm:text-[12.5px]"
                      )}
                    >
                      {mission.title}
                    </span>
                  </div>

                  {/* Mũi tên Chevron mép phải */}
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      isSelected ? "stroke-[2.5] text-[#D97706]" : "text-amber-800/40"
                    )}
                  />
                </div>

                {/* HÀNG 2: Thông tin Thời gian giao, Hạn nộp & Cụm Xu style mobile */}
                <div className="flex items-center justify-between gap-1 text-[9.5px] sm:text-[10px] w-full pt-0.5">
                  {/* Cụm thời gian: Giao & Hạn nộp format ngắn gọn (giữ nguyên cho Desktop) */}
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="text-slate-500 font-medium truncate">
                      Giao: <span className="text-slate-700 font-bold">{assignedText}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-heading font-bold border truncate",
                        statusConfig.dueBadge
                      )}
                    >
                      <Clock className="w-2.5 h-2.5 flex-shrink-0 stroke-[2.5]" />
                      <span className="truncate">{dueInfo.text}</span>
                    </span>
                  </div>

                  {/* Chip Xu: Icon /coin.png + số xu thưởng giống Mobile */}
                  <div className="inline-flex items-center gap-1 flex-shrink-0 font-heading font-black text-[11.5px] sm:text-[12.5px] text-[#D97706] ml-1">
                    <span>+{mission.rewardCoins}</span>
                    <Image
                      src="/coin.png"
                      alt="Xu"
                      width={16}
                      height={16}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block object-contain drop-shadow-2xs"
                    />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
