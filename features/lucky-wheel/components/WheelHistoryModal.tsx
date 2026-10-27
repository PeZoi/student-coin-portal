"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, History, Users, User, Clock, Gift, Coins, Sparkles } from "lucide-react";
import { WheelWinner } from "../types";
import { Button3D } from "@/components/ui/Button3D";
import { cn } from "@/lib/utils";

interface WheelHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  allWinners: WheelWinner[];
  myHistory: WheelWinner[];
}

// Màu chip phần thưởng theo giá trị xu
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

export function WheelHistoryModal({
  isOpen,
  onClose,
  allWinners,
  myHistory,
}: WheelHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "personal">("all");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#FFFDF7] rounded-[24px] sm:rounded-[28px] border-[3px] border-[#D97706] shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-4 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition-colors shadow-xs cursor-pointer z-10"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-amber-900/15 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <History className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-heading font-black text-amber-950 text-base sm:text-lg leading-tight">
              LỊCH SỬ VÒNG QUAY
            </h3>
            <p className="font-heading font-medium text-amber-900/70 text-xs">
              Cập nhật các lượt quay may mắn thời gian thực
            </p>
          </div>
        </div>

        {/* 2 Tab chuyển đổi: Toàn bộ / Bản thân */}
        <div className="grid grid-cols-2 gap-2 p-1.5 mt-3 rounded-2xl bg-amber-100/70 border border-amber-300/80 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-heading text-xs sm:text-sm transition-all cursor-pointer",
              activeTab === "all"
                ? "bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 font-black shadow-[0_2px_0_#B45309]"
                : "text-amber-900/75 hover:text-amber-950 hover:bg-white/40 font-bold"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Toàn bộ ({allWinners.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-heading text-xs sm:text-sm transition-all cursor-pointer",
              activeTab === "personal"
                ? "bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 font-black shadow-[0_2px_0_#B45309]"
                : "text-amber-900/75 hover:text-amber-950 hover:bg-white/40 font-bold"
            )}
          >
            <User className="w-4 h-4" />
            <span>Bản thân ({myHistory.length})</span>
          </button>
        </div>

        {/* Thân danh sách cuộn được */}
        <div className="flex-1 overflow-y-auto pr-1 mt-3 space-y-2 [scrollbar-width:thin] [scrollbar-color:rgba(180,83,9,0.3)_transparent]">
          {activeTab === "all" ? (
            /* TAB 1: TOÀN BỘ HỌC SINH */
            allWinners.length === 0 ? (
              <div className="py-12 text-center text-xs sm:text-sm font-heading font-bold text-amber-800/60">
                Chưa có lượt quay nào. Hãy là người đầu tiên thử vận may!
              </div>
            ) : (
              allWinners.map((winner, index) => {
                const isNewest = index === 0;

                return (
                  <div
                    key={winner.id}
                    className={cn(
                      "relative flex items-center gap-2.5 p-2.5 rounded-2xl border-2 transition-transform hover:-translate-y-0.5",
                      isNewest
                        ? "bg-gradient-to-r from-[#FFF7D6] to-[#FFEAA0] border-amber-400 shadow-[0_3px_0_#F59E0B]"
                        : "bg-white border-amber-200/80 shadow-[0_2px_0_#FDE68A]"
                    )}
                  >
                    {isNewest && (
                      <span className="absolute -top-2 left-3 px-1.5 py-px rounded-md bg-red-500 text-white font-heading font-black text-[9px] tracking-wider shadow-[0_2px_0_#991B1B]">
                        MỚI
                      </span>
                    )}

                    {/* Avatar */}
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full p-[2px] bg-gradient-to-b from-[#FDE047] to-[#F59E0B] flex-shrink-0 shadow-[0_2px_0_#B45309]">
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
                      <div className="font-heading font-black text-slate-800 text-xs sm:text-[13px] leading-tight truncate">
                        {winner.studentName}
                      </div>
                      <div className="flex items-center gap-1.5 font-heading font-bold text-[10.5px] text-slate-500 mt-0.5">
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
                        "flex-shrink-0 max-w-[45%] px-2.5 py-1 rounded-xl border font-heading font-black text-[11px] truncate",
                        getPrizeChipClass(winner.rewardCoins)
                      )}
                    >
                      {winner.prizeLabel}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* TAB 2: BẢN THÂN */
            myHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="font-heading font-black text-slate-700 text-sm">
                  Bạn chưa có lượt quay nào!
                </p>
                <p className="font-heading font-medium text-slate-500 text-xs mt-0.5">
                  Chạm vào vòng quay để thử vận may ngay nhé!
                </p>
              </div>
            ) : (
              myHistory.map((item, index) => {
                const isNewest = index === 0;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "relative flex items-center gap-2.5 p-2.5 rounded-2xl border-2 transition-transform hover:-translate-y-0.5",
                      isNewest
                        ? "bg-gradient-to-r from-sky-50 to-blue-50 border-sky-300 shadow-[0_3px_0_#0284C7]"
                        : "bg-white border-amber-200/80 shadow-[0_2px_0_#FDE68A]"
                    )}
                  >
                    {isNewest && (
                      <span className="absolute -top-2 left-3 px-1.5 py-px rounded-md bg-blue-600 text-white font-heading font-black text-[9px] tracking-wider shadow-[0_2px_0_#0369A1]">
                        VỪA QUAY
                      </span>
                    )}

                    {/* Icon quà */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 flex items-center justify-center shadow-[0_2px_0_#B45309] flex-shrink-0 text-white">
                      {item.rewardCoins > 0 ? (
                        <Coins className="w-5 h-5 text-amber-950" />
                      ) : (
                        <Gift className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Chi tiết phần thưởng */}
                    <div className="min-w-0 flex-1">
                      <div className="font-heading font-black text-slate-800 text-xs sm:text-[13px] leading-tight truncate">
                        {item.prizeLabel}
                      </div>
                      <div className="flex items-center gap-1.5 font-heading font-bold text-[10.5px] text-slate-500 mt-0.5">
                        <span className="text-emerald-600 flex items-center gap-0.5 whitespace-nowrap">
                          ✓ Đã nhận thưởng
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5 whitespace-nowrap">
                          <Clock className="w-2.5 h-2.5" />
                          {item.wonAt}
                        </span>
                      </div>
                    </div>

                    {/* Chip giá trị */}
                    <div
                      className={cn(
                        "flex-shrink-0 px-2.5 py-1 rounded-xl border font-heading font-black text-[11px]",
                        getPrizeChipClass(item.rewardCoins)
                      )}
                    >
                      {item.rewardCoins > 0 ? `+${item.rewardCoins} Xu` : "Quà tặng"}
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Chân Modal */}
        <div className="pt-3 border-t border-amber-900/10 flex justify-end flex-shrink-0 mt-3">
          <Button3D variant="yellow" size="sm" onClick={onClose} className="px-6">
            <span>Đóng</span>
          </Button3D>
        </div>
      </div>
    </div>
  );
}
