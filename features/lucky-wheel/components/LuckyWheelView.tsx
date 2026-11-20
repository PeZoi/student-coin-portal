"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, History } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { WHEEL_ASSETS } from "@/constants/wheel";
import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";
import { useWheelAudio } from "../audio/useWheelAudio";
import {
  LuckyWheelProvider,
  useLuckyWheelContext,
} from "../contexts/LuckyWheelContext";
import { StudentWheelInitialData, WheelConfig } from "../types";
import { WheelSpinner } from "./WheelSpinner";
import { WheelPrizeModal, WheelHistoryModal } from "./modal";

interface LuckyWheelViewProps {
  initialData?: StudentWheelInitialData;
  initialConfig?: Partial<WheelConfig>;
}

function LuckyWheelContent() {
  const {
    winningPrize,
    showPrizeModal,
    currentCoins,
    handleClosePrizeModal,
  } = useLuckyWheelContext();

  const audio = useWheelAudio();

  // State mở Modal lịch sử quay (Toàn bộ / Bản thân)
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Khi modal trúng thưởng xuất hiện: phát âm thanh nhận thưởng duy nhất trễ ~150ms sau khi vòng dừng
  useEffect(() => {
    if (showPrizeModal) {
      const timer = setTimeout(() => {
        audio.playReward();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showPrizeModal, audio]);

  return (
    <div className="relative w-full max-w-full h-full flex-1 flex flex-col items-center justify-start px-2 sm:px-6 pt-1 pb-2 sm:pb-3 min-h-0 overflow-hidden select-none">
      {/* Background Decor: Bầu trời mây sống động đồng bộ toàn hệ thống */}
      <DashboardBackgroundDecor />

      {/* ======================================================== */}
      {/* THANH ĐỈNH: QUAY LẠI (TRÁI) VÀ SỐ DƯ, LỊCH SỬ (PHẢI) */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between gap-2 mb-1 sm:mb-2 flex-shrink-0 pt-0.5 px-1 sm:px-2">
        {/* Nút Quay lại (Không phát tiếng click) */}
        <Button3D
          href="/student"
          variant="yellow"
          size="sm"
          className="h-8 sm:h-9 gap-1 sm:gap-1.5 px-3 sm:px-3.5 text-xs sm:text-sm tracking-wide flex-shrink-0 inline-flex items-center justify-center"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          <span>Quay lại</span>
        </Button3D>

        {/* Cụm bên phải: Số dư Heo Đất + Nút Lịch sử */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-nowrap justify-end">
          {/* Badge Số dư Heo Đất */}
          <div className="h-8 sm:h-9 flex items-center gap-1.5 px-2.5 sm:px-3.5 rounded-full bg-gradient-to-b from-[#FFA238] via-[#FF6A00] to-[#E04F00] border-2 border-white/95 shadow-[0_3px_8px_rgba(224,79,0,0.35),0_1.5px_0_#8F2800,inset_0_1.5px_2px_rgba(255,255,255,0.85),inset_0_-1.5px_2px_rgba(143,40,0,0.4)] select-none flex-shrink-0">
            <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 drop-shadow-[0_1.5px_2px_rgba(100,25,0,0.45)]">
              <Image
                src={WHEEL_ASSETS.COIN}
                alt="Xu"
                width={20}
                height={20}
                unoptimized
                style={{ height: "auto" }}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-baseline gap-1 font-heading leading-none">
              <span className="hidden min-[420px]:inline text-[11px] sm:text-xs font-bold text-amber-100 [text-shadow:0_1px_1.5px_rgba(120,30,0,0.8)]">
                Số dư:
              </span>
              <span className="font-heading font-black text-xs sm:text-sm text-white tracking-tight drop-shadow-[0_1.5px_2px_rgba(100,20,0,0.8)]">
                {currentCoins.toLocaleString("vi-VN")}
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-[#FEF08A] uppercase [text-shadow:0_1px_1.5px_rgba(120,30,0,0.8)]">
                xu
              </span>
            </div>
          </div>

          {/* Nút Lịch sử (Không phát tiếng click) */}
          <Button3D
            variant="blue"
            size="sm"
            onClick={() => setShowHistoryModal(true)}
            className="h-8 sm:h-9 gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 text-xs sm:text-sm tracking-wide shadow-sm whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span>Lịch sử</span>
          </Button3D>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VÒNG QUAY MAY MẮN Ở TRUNG TÂM TO HẾT CỠ */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-full flex-1 flex flex-col items-center justify-center min-h-0 py-1 overflow-visible">
        <WheelSpinner />
      </div>

      {/* ======================================================== */}
      {/* POPUP MODAL NHẬN THƯỞNG 3D KHI DỪNG VÒNG QUAY */}
      {/* ======================================================== */}
      <WheelPrizeModal
        prize={winningPrize}
        isOpen={showPrizeModal}
        onClose={() => {
          audio.stopReward();
          handleClosePrizeModal();
        }}
      />

      {/* ======================================================== */}
      {/* POPUP MODAL LỊCH SỬ QUAY THƯỞNG (2 TAB: TOÀN BỘ & BẢN THÂN) */}
      {/* ======================================================== */}
      <WheelHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}

export function LuckyWheelView({
  initialData,
  initialConfig,
}: LuckyWheelViewProps = {}) {
  return (
    <LuckyWheelProvider initialData={initialData} initialConfig={initialConfig}>
      <LuckyWheelContent />
    </LuckyWheelProvider>
  );
}
