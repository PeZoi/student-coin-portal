"use client";

import { DashboardBackgroundDecor } from "@/features/dashboard/components/DashboardBackgroundDecor";
import { PiggyBankCard } from "@/features/dashboard/components/PiggyBankCard";
import React from "react";
import { useRewardExchange } from "../hooks/useRewardExchange";
import { CashExchangeModal } from "./CashExchangeModal";
import { CashRewardCard } from "./CashRewardCard";
import { RewardHeaderRibbon } from "./RewardHeaderRibbon";
import { ShopeeExchangeModal } from "./ShopeeExchangeModal";
import { ShopeeRewardCard } from "./ShopeeRewardCard";

export function RewardsView() {
  const {
    student,
    canExchange,
    isSubmitting,
    isCashModalOpen,
    setIsCashModalOpen,
    isShopeeModalOpen,
    setIsShopeeModalOpen,
    handleConfirmCashExchange,
    handleConfirmShopeeExchange,
    coinStep,
    vndPerStep,
  } = useRewardExchange();

  return (
    <div className="relative w-full flex-1 flex flex-col justify-start lg:justify-center items-center px-3 sm:px-6 lg:px-8 pt-8 pb-8 sm:pt-10 sm:pb-10 lg:py-4 min-h-full overflow-visible">
      {/* Decorative Sky Clouds, Ambient Radiance & Floating Stars */}
      <DashboardBackgroundDecor />

      {/* Main Content Layout Container - Đồng bộ 100% tỉ lệ, vị trí và căn giữa với Dashboard */}
      <main className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch my-auto pt-3 lg:pt-0">
        {/* Cột trái: Heo Đất Của Gia Bảo (5 cols trên lg) */}
        <section className="lg:col-span-5 flex flex-col pt-3 lg:pt-0">
          <PiggyBankCard />
        </section>

        {/* Cột phải: Khung Đổi Quà Nhận Thưởng (7 cols trên lg) - Đồng bộ 100% style với Dashboard */}
        <section className="lg:col-span-7 flex flex-col">
          {/* Khung ngoài tạo viền gradient mờ dần từ trên xuống dưới giống hệt NavigationGrid ở Dashboard */}
          <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] p-[2px] bg-gradient-to-b from-white/40 via-white/18 to-white/10 shadow-[0_16px_36px_rgba(0,35,90,0.22)] overflow-visible mb-10 sm:mb-0">
            {/* Huy hiệu Ngôi sao Vàng 3D may mắn góc trên bên trái */}
            <div className="absolute -top-3.5 -left-3.5 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-11 sm:h-11 pointer-events-none select-none z-20 animate-soft-twinkle">
              <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-[0_4px_10px_rgba(255,160,0,0.5)]">
                <defs>
                  <linearGradient id="rewardStarBadgeGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF9C4" />
                    <stop offset="40%" stopColor="#FFC107" />
                    <stop offset="100%" stopColor="#FF8F00" />
                  </linearGradient>
                  <radialGradient id="rewardStarHaloLeft" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFE082" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="22" cy="22" r="18" fill="url(#rewardStarHaloLeft)" />
                <path
                  d="M 22 4 Q 22 22 40 22 Q 22 22 22 40 Q 22 22 4 22 Q 22 22 22 4 Z"
                  fill="url(#rewardStarBadgeGradLeft)"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="22" cy="22" r="2.5" fill="#FFFFFF" />
              </svg>
            </div>

            {/* Huy hiệu Ngôi sao Vàng 3D may mắn góc trên bên phải */}
            <div className="absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-11 sm:h-11 pointer-events-none select-none z-20 animate-soft-twinkle">
              <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-[0_4px_10px_rgba(255,160,0,0.5)]">
                <defs>
                  <linearGradient id="rewardStarBadgeGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF9C4" />
                    <stop offset="40%" stopColor="#FFC107" />
                    <stop offset="100%" stopColor="#FF8F00" />
                  </linearGradient>
                  <radialGradient id="rewardStarHaloRight" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFE082" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="22" cy="22" r="18" fill="url(#rewardStarHaloRight)" />
                <path
                  d="M 22 4 Q 22 22 40 22 Q 22 22 22 40 Q 22 22 4 22 Q 22 22 22 4 Z"
                  fill="url(#rewardStarBadgeGradRight)"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="22" cy="22" r="2.5" fill="#FFFFFF" />
              </svg>
            </div>

            {/* Thân card bên trong với background mờ dần từ trên xuống dưới (90% -> 45% -> 18%) */}
            <div className="w-full h-full rounded-[26px] sm:rounded-[30px] p-3.5 sm:p-4.5 lg:p-5 pt-3 sm:pt-3.5 bg-gradient-to-b from-[#004DA3]/90 via-[#005ABF]/45 to-[#003B7A]/18 flex flex-col justify-between overflow-visible">
              {/* Header: Title 3D giống Dashboard & Subheader */}
              <div>
                <RewardHeaderRibbon />

                <div className="w-full text-center mb-2.5 sm:mb-3">
                  <p className="font-heading font-black text-amber-200 sm:text-yellow-100 text-xs sm:text-[13px] lg:text-sm tracking-wide drop-shadow-[0_1.5px_2px_rgba(0,20,60,0.5)]">
                    Cứ mỗi {coinStep.toLocaleString("vi-VN")} xu = {vndPerStep.toLocaleString("vi-VN")}đ tiền mặt hoặc quà tùy chọn
                  </p>
                </div>
              </div>

              {/* 2 Thẻ đổi quà song song: Nhận tiền mặt & Tự chọn quà Shopee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 flex-1 items-stretch">
                {/* Thẻ 1: Nhận tiền mặt */}
                <CashRewardCard
                  canExchange={canExchange}
                  onOpenModal={() => setIsCashModalOpen(true)}
                />

                {/* Thẻ 2: Tự chọn quà Shopee */}
                <ShopeeRewardCard
                  canExchange={canExchange}
                  onOpenModal={() => setIsShopeeModalOpen(true)}
                />
              </div>

              {/* Footer Note with rich text-shadow */}
              <div className="w-full mt-2.5 pt-1 text-center select-none">
                <p className="font-heading font-bold text-white text-[11.5px] sm:text-[12.5px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:_0_1.5px_2px_rgba(0,25,80,0.9),_0_2px_6px_rgba(0,10,50,0.7)] px-2 leading-tight tracking-wide">
                  *Sau khi con gửi yêu cầu, cô sẽ kiểm tra và trao quà/tiền cho con nhé!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Popup Modal Đổi Tiền Mặt */}
      {isCashModalOpen && (
        <CashExchangeModal
          isOpen={isCashModalOpen}
          onClose={() => setIsCashModalOpen(false)}
          currentCoins={student.currentCoins}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmCashExchange}
        />
      )}

      {/* Popup Modal Đổi Quà Shopee */}
      {isShopeeModalOpen && (
        <ShopeeExchangeModal
          isOpen={isShopeeModalOpen}
          onClose={() => setIsShopeeModalOpen(false)}
          currentCoins={student.currentCoins}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmShopeeExchange}
        />
      )}
    </div>
  );
}
