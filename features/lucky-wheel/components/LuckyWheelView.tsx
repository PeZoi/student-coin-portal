"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, HelpCircle, History } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";
import { WheelSpinner } from "./WheelSpinner";
import { WheelPrizeModal } from "./WheelPrizeModal";
import { WheelRulesModal } from "./WheelRulesModal";
import { WheelHistoryModal } from "./WheelHistoryModal";
import { useLuckyWheel } from "../hooks/useLuckyWheel";
import { WheelConfig } from "../types";

interface LuckyWheelViewProps {
  initialConfig?: Partial<WheelConfig>;
}

export function LuckyWheelView({ initialConfig }: LuckyWheelViewProps = {}) {
  const {
    config,
    prizes,
    rules,
    spinCost,
    rotation,
    isSpinning,
    winningPrize,
    showPrizeModal,
    winners,
    myHistory,
    currentCoins,
    handleSpin,
    handleClosePrizeModal,
  } = useLuckyWheel(initialConfig);

  // State mở Modal thể lệ & tỷ lệ phần thưởng (Hướng dẫn)
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  // State mở Modal lịch sử quay (Toàn bộ / Bản thân)
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  return (
    <div className="relative w-full max-w-full h-full flex-1 flex flex-col items-center justify-start px-2 sm:px-6 pt-1 pb-2 sm:pb-3 min-h-0 overflow-hidden select-none">
      {/* Background Decor: Bầu trời mây sống động đồng bộ toàn hệ thống */}
      <DashboardBackgroundDecor />

      {/* ======================================================== */}
      {/* THANH ĐỈNH: QUAY LẠI, SỐ DƯ, CHI PHÍ, LỊCH SỬ & HƯỚNG DẪN */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* THANH ĐỈNH: QUAY LẠI (TRÁI) VÀ SỐ DƯ, LỊCH SỬ, HƯỚNG DẪN (PHẢI) */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between gap-2 mb-1 sm:mb-2 flex-shrink-0 pt-0.5">
        {/* Nút Quay lại */}
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          className="gap-1 sm:gap-1.5 py-1 px-2.5 sm:py-1.5 sm:px-3.5 text-xs sm:text-sm tracking-wide flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          <span>Quay lại</span>
        </Button3D>

        {/* Cụm bên phải: Số dư Heo Đất (đặt cạnh Lịch sử) + Nút Lịch sử + Nút Hướng dẫn */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap sm:flex-nowrap justify-end">
          {/* Badge Số dư Heo Đất: Màu cam 3D rực rỡ, tương phản tuyệt đối trên nền trời xanh, cực kỳ dễ nhìn */}
          <div className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-gradient-to-b from-[#FFA238] via-[#FF6A00] to-[#E04F00] border-2 border-white/95 shadow-[0_4px_12px_rgba(224,79,0,0.35),0_1.5px_0_#8F2800,inset_0_1.5px_2px_rgba(255,255,255,0.85),inset_0_-1.5px_2px_rgba(143,40,0,0.4)] select-none flex-shrink-0">
            <div className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 flex-shrink-0 drop-shadow-[0_2px_3px_rgba(100,25,0,0.45)]">
              <Image
                src="/coin.png"
                alt="Xu"
                width={22}
                height={22}
                unoptimized
                style={{ height: "auto" }}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-baseline gap-1 font-heading leading-none">
              <span className="hidden min-[380px]:inline text-xs font-bold text-amber-100 [text-shadow:0_1px_1.5px_rgba(120,30,0,0.8)]">
                Số dư:
              </span>
              <span className="font-heading font-black text-sm sm:text-[15px] text-white tracking-tight drop-shadow-[0_1.5px_2px_rgba(100,20,0,0.8)]">
                {currentCoins.toLocaleString("vi-VN")}
              </span>
              <span className="text-[11px] font-black text-[#FEF08A] uppercase [text-shadow:0_1px_1.5px_rgba(120,30,0,0.8)]">
                xu
              </span>
            </div>
          </div>

          {/* Nút Lịch sử */}
          <Button3D
            variant="blue"
            size="sm"
            onClick={() => setShowHistoryModal(true)}
            className="gap-1 sm:gap-1.5 py-1 px-2.5 sm:py-1.5 sm:px-3.5 text-xs sm:text-sm tracking-wide shadow-sm whitespace-nowrap flex-shrink-0"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span>Lịch sử</span>
          </Button3D>

          {/* Nút Hướng dẫn */}
          <Button3D
            variant="purple"
            size="sm"
            onClick={() => setShowRulesModal(true)}
            className="gap-1 sm:gap-1.5 py-1 px-2.5 sm:py-1.5 sm:px-3.5 text-xs sm:text-sm tracking-wide shadow-sm whitespace-nowrap flex-shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span>Hướng dẫn</span>
          </Button3D>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VÒNG QUAY MAY MẮN Ở TRUNG TÂM TO HẾT CỠ */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-full flex-1 flex flex-col items-center justify-center min-h-0 py-1 overflow-visible">
        <WheelSpinner
          prizes={prizes}
          rotation={rotation}
          isSpinning={isSpinning}
          spinCost={spinCost}
          onSpin={handleSpin}
        />
      </div>

      {/* ======================================================== */}
      {/* POPUP MODAL NHẬN THƯỞNG 3D KHI DỪNG VÒNG QUAY */}
      {/* ======================================================== */}
      <WheelPrizeModal
        prize={winningPrize}
        isOpen={showPrizeModal}
        onClose={handleClosePrizeModal}
      />

      {/* ======================================================== */}
      {/* POPUP MODAL THỂ LỆ & TỶ LỆ TRÚNG THƯỞNG MINH BẠCH */}
      {/* ======================================================== */}
      <WheelRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        config={config}
        rules={rules}
      />

      {/* ======================================================== */}
      {/* POPUP MODAL LỊCH SỬ QUAY THƯỞNG (2 TAB: TOÀN BỘ & BẢN THÂN) */}
      {/* ======================================================== */}
      <WheelHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        allWinners={winners}
        myHistory={myHistory}
      />
    </div>
  );
}
