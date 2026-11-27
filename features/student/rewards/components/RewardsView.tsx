"use client";

import { Button3D } from "@/components/ui/Button3D";
import { WHEEL_ASSETS } from "@/constants/wheel";
import { DashboardBackgroundDecor } from "@/features/student/dashboard/components/DashboardBackgroundDecor";
import { ExchangeSettingConfig } from "@/types/systemConfig";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import { useRewardExchange } from "../hooks/useRewardExchange";
import { CashRewardCard } from "./CashRewardCard";
import { RewardHeaderRibbon } from "./RewardHeaderRibbon";
import { ShopeeRewardCard } from "./ShopeeRewardCard";

// Dynamic imports cho modal để giảm initial bundle size
const CashExchangeModal = dynamic(
	() => import("./CashExchangeModal").then((m) => m.CashExchangeModal),
	{ ssr: false }
);

const ShopeeExchangeModal = dynamic(
	() => import("./ShopeeExchangeModal").then((m) => m.ShopeeExchangeModal),
	{ ssr: false }
);

interface RewardsViewProps {
	initialExchangeConfig?: ExchangeSettingConfig;
	currentVietnamDay?: number;
}

export function RewardsView({
	initialExchangeConfig,
	currentVietnamDay,
}: RewardsViewProps = {}) {
	const {
		student,
		exchangeConfig,
		canExchange,
		canExchangeCash,
		windowLabel,
		blockReason,
		isSubmitting,
		isCashModalOpen,
		setIsCashModalOpen,
		isShopeeModalOpen,
		setIsShopeeModalOpen,
		handleConfirmCashExchange,
		handleConfirmShopeeExchange,
		coinStep,
		vndPerStep,
		minExchangeCoins,
	} = useRewardExchange({ initialExchangeConfig, currentVietnamDay });

	const currentCoins = student?.current_coins ?? 0;

	return (
		<div className='relative w-full flex-1 flex flex-col items-center justify-start px-3 sm:px-6 lg:px-8 pt-2 pb-8 sm:pt-3 sm:pb-10 min-h-full overflow-visible'>
			{/* Decorative Sky Clouds, Ambient Radiance & Floating Stars */}
			<DashboardBackgroundDecor />

			{/* Thanh đỉnh: Nút Quay lại (Trái) & Số dư Heo Đất (Phải) - Đồng bộ 100% với trang Vòng quay */}
			<div className='relative z-30 w-full max-w-5xl flex items-center justify-between gap-2 mb-4 sm:mb-6 flex-shrink-0 pt-0.5 px-1 sm:px-2'>
				<Button3D
					href='/student'
					variant='yellow'
					size='sm'
					className='h-8 sm:h-9 gap-1 sm:gap-1.5 px-3 sm:px-3.5 text-xs sm:text-sm tracking-wide flex-shrink-0 inline-flex items-center justify-center'
				>
					<ArrowLeft className='w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]' />
					<span>Quay lại</span>
				</Button3D>

				<div className='h-8 sm:h-9 flex items-center gap-1.5 px-2.5 sm:px-3.5 rounded-full bg-gradient-to-b from-[#FFA238] via-[#FF6A00] to-[#E04F00] border-2 border-white/95 shadow-[0_3px_8px_rgba(224,79,0,0.35),0_1.5px_0_#8F2800,inset_0_1.5px_2px_rgba(255,255,255,0.85),inset_0_-1.5px_2px_rgba(143,40,0,0.4)] select-none flex-shrink-0'>
					<div className='relative w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 drop-shadow-[0_1.5px_2px_rgba(100,25,0,0.45)]'>
						<Image
							src={WHEEL_ASSETS.COIN}
							alt='Xu'
							width={20}
							height={20}
							unoptimized
							style={{ height: "auto" }}
							className='w-full h-full object-contain'
						/>
					</div>
					<div className='flex items-baseline gap-1 font-heading leading-none'>
						<span className='hidden min-[420px]:inline text-[11px] sm:text-xs font-bold text-amber-100 [text-shadow:0_1px_1.5px_rgba(120,30,0,0.8)]'>
							Số dư:
						</span>
						<span className='font-heading font-black text-xs sm:text-sm text-white tracking-tight drop-shadow-[0_1.5px_2px_rgba(100,20,0,0.8)]'>
							{currentCoins.toLocaleString("vi-VN")}
						</span>
						<span className='text-[10px] sm:text-[11px] font-black text-[#FEF08A] uppercase [text-shadow:0_1px_1.5px_rgba(120,30,0,0.8)]'>
							xu
						</span>
					</div>
				</div>
			</div>

			{/* Main Content: Khung Đổi Quà Nhận Thưởng căn giữa gọn gàng */}
			<main className='relative z-10 w-full max-w-3xl mx-auto flex flex-col my-auto'>
				<section className='w-full flex flex-col'>
					{/* Khung ngoài tạo viền gradient mờ dần từ trên xuống dưới giống hệt NavigationGrid ở Dashboard */}
					<div className='relative w-full h-full rounded-[28px] sm:rounded-[32px] p-[2px] bg-gradient-to-b from-white/40 via-white/18 to-white/10 shadow-[0_16px_36px_rgba(0,35,90,0.22)] overflow-visible mb-10 sm:mb-0'>
						{/* Huy hiệu Ngôi sao Vàng 3D may mắn góc trên bên trái */}
						<div className='absolute -top-3.5 -left-3.5 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-11 sm:h-11 pointer-events-none select-none z-20 animate-soft-twinkle'>
							<svg
								viewBox='0 0 44 44'
								className='w-full h-full drop-shadow-[0_4px_10px_rgba(255,160,0,0.5)]'
							>
								<defs>
									<linearGradient
										id='rewardStarBadgeGradLeft'
										x1='0%'
										y1='0%'
										x2='100%'
										y2='100%'
									>
										<stop offset='0%' stopColor='#FFF9C4' />
										<stop offset='40%' stopColor='#FFC107' />
										<stop offset='100%' stopColor='#FF8F00' />
									</linearGradient>
									<radialGradient
										id='rewardStarHaloLeft'
										cx='50%'
										cy='50%'
										r='50%'
									>
										<stop
											offset='0%'
											stopColor='#FFE082'
											stopOpacity='0.6'
										/>
										<stop
											offset='100%'
											stopColor='#FFA000'
											stopOpacity='0'
										/>
									</radialGradient>
								</defs>
								<circle
									cx='22'
									cy='22'
									r='18'
									fill='url(#rewardStarHaloLeft)'
								/>
								<path
									d='M 22 4 Q 22 22 40 22 Q 22 22 22 40 Q 22 22 4 22 Q 22 22 22 4 Z'
									fill='url(#rewardStarBadgeGradLeft)'
									stroke='#FFFFFF'
									strokeWidth='2'
									strokeLinejoin='round'
								/>
								<circle cx='22' cy='22' r='2.5' fill='#FFFFFF' />
							</svg>
						</div>

						{/* Huy hiệu Ngôi sao Vàng 3D may mắn góc trên bên phải */}
						<div className='absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-11 sm:h-11 pointer-events-none select-none z-20 animate-soft-twinkle'>
							<svg
								viewBox='0 0 44 44'
								className='w-full h-full drop-shadow-[0_4px_10px_rgba(255,160,0,0.5)]'
							>
								<defs>
									<linearGradient
										id='rewardStarBadgeGradRight'
										x1='0%'
										y1='0%'
										x2='100%'
										y2='100%'
									>
										<stop offset='0%' stopColor='#FFF9C4' />
										<stop offset='40%' stopColor='#FFC107' />
										<stop offset='100%' stopColor='#FF8F00' />
									</linearGradient>
									<radialGradient
										id='rewardStarHaloRight'
										cx='50%'
										cy='50%'
										r='50%'
									>
										<stop
											offset='0%'
											stopColor='#FFE082'
											stopOpacity='0.6'
										/>
										<stop
											offset='100%'
											stopColor='#FFA000'
											stopOpacity='0'
										/>
									</radialGradient>
								</defs>
								<circle
									cx='22'
									cy='22'
									r='18'
									fill='url(#rewardStarHaloRight)'
								/>
								<path
									d='M 22 4 Q 22 22 40 22 Q 22 22 22 40 Q 22 22 4 22 Q 22 22 22 4 Z'
									fill='url(#rewardStarBadgeGradRight)'
									stroke='#FFFFFF'
									strokeWidth='2'
									strokeLinejoin='round'
								/>
								<circle cx='22' cy='22' r='2.5' fill='#FFFFFF' />
							</svg>
						</div>

						{/* Thân card bên trong với background mờ dần từ trên xuống dưới (90% -> 45% -> 18%) */}
						<div className='w-full h-full rounded-[26px] sm:rounded-[30px] p-3.5 sm:p-4.5 lg:p-5 pt-3 sm:pt-3.5 bg-gradient-to-b from-[#004DA3]/90 via-[#005ABF]/45 to-[#003B7A]/18 flex flex-col justify-between overflow-visible'>
							{/* Header: Title 3D giống Dashboard & Subheader */}
							<div>
								<RewardHeaderRibbon />

								<div className='w-full text-center mb-2.5 sm:mb-3'>
									<p className='font-heading font-black text-amber-200 sm:text-yellow-100 text-xs sm:text-[13px] lg:text-sm tracking-wide drop-shadow-[0_1.5px_2px_rgba(0,20,60,0.5)]'>
										Cứ mỗi {coinStep.toLocaleString("vi-VN")} xu ={" "}
										{vndPerStep.toLocaleString("vi-VN")}đ tiền mặt
										hoặc quà tùy chọn
									</p>
								</div>
							</div>

							{/* 2 Thẻ đổi quà song song: Nhận tiền mặt & Tự chọn quà Shopee */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 flex-1 items-stretch'>
								{/* Thẻ 1: Nhận tiền mặt */}
								<CashRewardCard
									canExchange={canExchangeCash}
									onOpenModal={() => setIsCashModalOpen(true)}
								/>

								{/* Thẻ 2: Tự chọn quà Shopee */}
								<ShopeeRewardCard
									canExchange={canExchange}
									onOpenModal={() => setIsShopeeModalOpen(true)}
								/>
							</div>

							{/* Trạng thái cổng đổi quà */}
							<div className='w-full mt-2.5 pt-1 text-center select-none'>
								{blockReason ? (
									<p className='font-heading font-bold text-amber-200 text-[11.5px] sm:text-[12.5px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:_0_1.5px_2px_rgba(0,25,80,0.9),_0_2px_6px_rgba(0,10,50,0.7)] px-2 leading-tight tracking-wide'>
										{blockReason}
									</p>
								) : (
									<p className='font-heading font-bold text-white text-[11.5px] sm:text-[12.5px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:_0_1.5px_2px_rgba(0,25,80,0.9),_0_2px_6px_rgba(0,10,50,0.7)] px-2 leading-tight tracking-wide'>
										Cổng đổi quà đang mở ({windowLabel} • Tối thiểu{" "}
										{minExchangeCoins.toLocaleString("vi-VN")} xu)
									</p>
								)}
							</div>
						</div>
					</div>
				</section>
			</main>

			{/* Popup Modal Đổi Tiền Mặt */}
			{isCashModalOpen && (
				<CashExchangeModal
					key={`cash-${exchangeConfig.step_coins}-${exchangeConfig.min_exchange_coins}`}
					isOpen={isCashModalOpen}
					onClose={() => setIsCashModalOpen(false)}
					currentCoins={student?.current_coins ?? 0}
					exchangeConfig={exchangeConfig}
					isSubmitting={isSubmitting}
					onConfirm={handleConfirmCashExchange}
				/>
			)}

			{/* Popup Modal Đổi Quà Shopee */}
			{isShopeeModalOpen && (
				<ShopeeExchangeModal
					key={`gift-${exchangeConfig.step_coins}-${exchangeConfig.vnd_per_step}`}
					isOpen={isShopeeModalOpen}
					onClose={() => setIsShopeeModalOpen(false)}
					currentCoins={student?.current_coins ?? 0}
					exchangeConfig={exchangeConfig}
					isSubmitting={isSubmitting}
					onConfirm={handleConfirmShopeeExchange}
				/>
			)}
		</div>
	);
}
