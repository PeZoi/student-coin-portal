"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Gift, Smile, Star } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { WheelPrize } from "../types";
import { WHEEL_THEME, getSliceTheme } from "../wheelTheme";
import { wheelAudio, AUDIO_CONFIG } from "../audio/wheelAudio";
import { WheelDynamicDisc } from "./WheelDynamicDisc";

export interface WheelSpinnerProps {
	prizes: WheelPrize[];
	rotation: number;
	isSpinning: boolean;
	spinCost: number;
	onSpin: () => void;
	currentCoins?: number;
}

const LED_COUNT = 24;

/**
 * Render Icon giải thưởng:
 * - Đồng xu: /coin.png với viền #B86E00 1px để nổi trên nền vàng.
 * - Vật phẩm đặc biệt (gift, multiplier, luck): Gộp về MỘT tile tím duy nhất (special.from -> special.to)
 *   với viền trắng 2px và icon trắng.
 */
function renderPrizeIcon(prize: WheelPrize) {
	if (prize.type === "coin") {
		return (
			<div
				className='relative w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9'
				style={{
					filter:
						"drop-shadow(1px 0 0 #B86E00) drop-shadow(-1px 0 0 #B86E00) drop-shadow(0 1px 0 #B86E00) drop-shadow(0 -1px 0 #B86E00) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
				}}
			>
				<Image
					src='/coin.png'
					alt='Xu vàng'
					fill
					unoptimized
					className='object-contain'
				/>
			</div>
		);
	}

	const iconComponentMap = {
		gift: Gift,
		multiplier: Star,
		luck: Smile,
	};

	const IconComp = iconComponentMap[prize.type] || Star;

	return (
		<div
			className='w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 rounded-xl flex items-center justify-center border-2 border-white shadow-[0_2px_5px_rgba(0,0,0,0.35)]'
			style={{
				background: `linear-gradient(to bottom, ${WHEEL_THEME.special.from}, ${WHEEL_THEME.special.to})`,
			}}
		>
			<IconComp className='w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]' />
		</div>
	);
}

/**
 * SVG Kim chỉ may mắn (Wheel Pointer):
 * - Gradient đỏ giống nút QUAY (action.from -> action.to)
 * - Viền trắng 2.5px nổi bật
 * - Thân kim kéo dài thon gọn, đầu nhọn chạm tới các item của vòng quay
 * - Nhận ref để cập nhật góc xoay trực tiếp theo chuyển động vật lý của divider
 */
const WheelPointer = React.forwardRef<
	HTMLDivElement,
	{ initialAngle?: number }
>(function WheelPointer({ initialAngle = 0 }, ref) {
	return (
		<div
			ref={ref}
			className='absolute -top-[3.5%] left-1/2 z-30 w-9 sm:w-11 md:w-12 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] origin-[50%_19.1%] will-change-transform'
			style={{
				transform: `translateX(-50%) rotate(${initialAngle}deg)`,
			}}
		>
			<svg
				viewBox='0 0 60 94'
				className='w-full h-auto overflow-visible'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<defs>
					{/* Gradient đỏ của kim chỉ đồng bộ với nút QUAY */}
					<linearGradient
						id='pointerRedGradient'
						x1='50%'
						y1='0%'
						x2='50%'
						y2='100%'
					>
						<stop offset='0%' stopColor={WHEEL_THEME.action.from} />
						<stop offset='100%' stopColor={WHEEL_THEME.action.to} />
					</linearGradient>
					{/* Gradient chốt kim loại trên đỉnh kim */}
					<radialGradient
						id='pointerCapGradient'
						cx='40%'
						cy='35%'
						r='65%'
					>
						<stop offset='0%' stopColor='#FFFFFF' />
						<stop offset='45%' stopColor={WHEEL_THEME.rim.mid} />
						<stop offset='100%' stopColor={WHEEL_THEME.rim.edge} />
					</radialGradient>
				</defs>

				{/* Thân kim chỉ: đầu nhọn dài chạm tới các item của vòng quay */}
				<path
					d='M30 89 L10 24 C6 15 14 4 25 4 L35 4 C46 4 54 15 50 24 Z'
					fill='url(#pointerRedGradient)'
					stroke='#FFFFFF'
					strokeWidth='2.5'
					strokeLinejoin='round'
				/>

				{/* Vệt bóng phản quang trong lòng kim */}
				<path
					d='M24 10 L30 10 L28 62 C28 64 26 64 25 60 Z'
					fill='#FFFFFF'
					opacity='0.3'
				/>

				{/* Chốt tròn kim loại vàng trên đầu kim tạo chiều sâu 3D */}
				<circle
					cx='30'
					cy='18'
					r='8'
					fill='url(#pointerCapGradient)'
					stroke='#FFFFFF'
					strokeWidth='1.5'
				/>
				<circle cx='28' cy='16' r='2' fill='#FFFFFF' opacity='0.8' />
			</svg>
		</div>
	);
});

/**
 * Đọc góc xoay thực tế trong quá trình CSS transition bằng getComputedStyle matrix
 */
function getComputedRotationDeg(el: HTMLElement | null): number {
	if (!el || typeof window === "undefined") return 0;
	try {
		const st = window.getComputedStyle(el);
		const tr = st.transform || st.webkitTransform;
		if (!tr || tr === "none") return 0;

		const match = tr.match(/^matrix\((.+)\)$/);
		if (!match) return 0;
		const values = match[1].split(",").map(Number);
		if (values.length < 2) return 0;

		const a = values[0];
		const b = values[1];
		let angle = Math.atan2(b, a) * (180 / Math.PI);
		if (angle < 0) angle += 360;
		return angle;
	} catch {
		return 0;
	}
}

export function WheelSpinner({
	prizes,
	rotation,
	isSpinning,
	spinCost,
	onSpin,
	currentCoins: propCoins,
}: WheelSpinnerProps) {
	const storeCoins = useUserStore((state) => state.student.currentCoins);
	const actualCoins = propCoins !== undefined ? propCoins : storeCoins;
	const isOutOfCoins = actualCoins < spinCost;

	const totalItems = prizes.length;
	const segmentAngle = 360 / totalItems;

	const discRef = useRef<HTMLDivElement>(null);
	const pointerRef = useRef<HTMLDivElement>(null);

	// Quản lý trạng thái đèn LED
	const [ledStep, setLedStep] = useState<number>(0);
	const [isWinningFlash, setIsWinningFlash] = useState<boolean>(false);
	const prevSpinningRef = useRef<boolean>(isSpinning);

	// Biến tracking góc thực tế và vận tốc góc qua getComputedStyle transform matrix
	const startRotationRef = useRef<number>(rotation);
	const accumulatedAngleRef = useRef<number>(rotation);
	const lastRawAngleRef = useRef<number>(0);
	const lastPegRef = useRef<number>(-1);
	const lastSnapTimeRef = useRef<number>(0);
	const prevTimeRef = useRef<number>(0);

	// 3.1 & 3.3: Vòng lặp requestAnimationFrame đọc góc xoay thực tế, điều khiển kim chỉ chạm divider và phát tiếng tick
	useEffect(() => {
		let animId: number;

		if (isSpinning) {
			const discEl = discRef.current;
			// Khởi tạo accumulatedAngle chuẩn xác từ góc xuất phát thực tế của đĩa
			accumulatedAngleRef.current = startRotationRef.current;
			lastRawAngleRef.current = getComputedRotationDeg(discEl);
			// Mốc chốt divider nằm tại các bội số của segmentAngle
			lastPegRef.current = Math.floor(
				startRotationRef.current / segmentAngle,
			);
			lastSnapTimeRef.current = performance.now();
			prevTimeRef.current = performance.now();

			const rAfLoop = (now: number) => {
				if (!discRef.current) return;

				// Đọc góc thực tế từ matrix của element đang animate CSS transition
				const currentRawAngle = getComputedRotationDeg(discRef.current);
				let delta = currentRawAngle - lastRawAngleRef.current;
				if (delta < -180) delta += 360;
				else if (delta > 180) delta -= 360;
				lastRawAngleRef.current = currentRawAngle;

				const dt = (now - prevTimeRef.current) / 1000;
				prevTimeRef.current = now;

				if (delta > 0) {
					accumulatedAngleRef.current += delta;
				}

				// Tính vận tốc góc (độ/giây)
				const angularVelocity = dt > 0 && delta > 0 ? delta / dt : 0;
				const speedRatio = Math.max(0, Math.min(1, angularVelocity / 1100));

				// Cập nhật âm thanh nền vo vo bám theo vận tốc
				wheelAudio.updateSpinLoopVelocity(speedRatio);

				// Kiểm tra chốt divider vừa đi qua đỉnh 12h (chốt tuột khỏi mũi kim)
				const currentPeg = Math.floor(
					accumulatedAngleRef.current / segmentAngle,
				);
				if (currentPeg !== lastPegRef.current) {
					lastPegRef.current = currentPeg;
					lastSnapTimeRef.current = now;

					// Phát âm thanh tick ĐÚNG KHOẢNH KHẮC chốt tuột khỏi kim
					wheelAudio.playTick(speedRatio);

					// Haptic nhẹ khi tốc độ chậm lúc sắp dừng
					if (
						angularVelocity <
							AUDIO_CONFIG.tick.lowSpeedVelocityThreshold &&
						typeof navigator !== "undefined" &&
						navigator.vibrate
					) {
						try {
							navigator.vibrate(8);
						} catch {
							// Bỏ qua
						}
					}
				}

				// Điều khiển chuyển động vật lý của kim chỉ bám sát vị trí divider/chốt nan quạt
				if (pointerRef.current) {
					let pointerAngle = 0;
					if (angularVelocity > 450) {
						// Khi quay tốc độ cao: chốt liên tiếp lướt qua, kim dao động rung liên hồi
						pointerAngle = 6.5 + Math.sin(now * 0.08) * 2.2;
					} else {
						// Khi quay chậm dần hoặc tốc độ thấp: bám sát chính xác vị trí tiếp xúc của chốt
						const mod =
							((accumulatedAngleRef.current % segmentAngle) +
								segmentAngle) %
							segmentAngle;
						const distToPeg = segmentAngle - mod; // Khoảng cách góc tới chốt divider tiếp theo
						const contactZone = 5.2; // Phạm vi góc mà chốt divider chạm vào mép mũi kim (5.2°)

						if (distToPeg <= contactZone) {
							// Chốt divider đang chạm và đẩy mũi kim gạt nghiêng sang phải từ 0° lên 8.5°
							const pushRatio = (contactZone - distToPeg) / contactZone;
							pointerAngle = pushRatio * 8.5;
						} else {
							// Ngoài vùng tiếp xúc: Nếu vừa tuột khỏi chốt (< 70ms), rung đàn hồi tắt dần rồi đứng thẳng yên
							const timeSinceSnap =
								(now - lastSnapTimeRef.current) / 1000;
							if (timeSinceSnap < 0.07) {
								pointerAngle =
									-3.5 *
									Math.exp(-45 * timeSinceSnap) *
									Math.cos(65 * timeSinceSnap);
							} else {
								pointerAngle = 0; // Đứng thẳng yên hoàn toàn khi ở giữa 2 chốt
							}
						}
					}
					pointerRef.current.style.transform = `translateX(-50%) rotate(${pointerAngle.toFixed(2)}deg)`;
				}

				animId = requestAnimationFrame(rAfLoop);
			};

			animId = requestAnimationFrame(rAfLoop);

			return () => {
				if (animId) cancelAnimationFrame(animId);
			};
		} else {
			// Khi vừa kết thúc quay: dừng âm thanh quay và phát 1 tiếng tock chắc chắn
			if (prevSpinningRef.current) {
				wheelAudio.playSpinEnd();

				// Kiểm tra nếu kim dừng sát ranh giới chốt cuối cùng (< 3.5°): phát thêm tiếng nảy ngược nhẹ
				const remainder =
					((accumulatedAngleRef.current % segmentAngle) + segmentAngle) %
					segmentAngle;
				if (remainder < 3.5 || remainder > segmentAngle - 3.5) {
					wheelAudio.playReboundTick();
				}
			}
			startRotationRef.current = rotation;

			// Khi dừng hẳn: nếu dừng sát chốt (< 5.2°) kim tự nhiên hơi nghiêng tì vào chốt, ngược lại đứng thẳng 0°
			if (pointerRef.current) {
				const mod =
					((rotation % segmentAngle) + segmentAngle) % segmentAngle;
				const distToPeg = segmentAngle - mod;
				const staticAngle =
					distToPeg <= 5.2 ? ((5.2 - distToPeg) / 5.2) * 8.5 : 0;
				pointerRef.current.style.transform = `translateX(-50%) rotate(${staticAngle.toFixed(2)}deg)`;
			}
		}
	}, [isSpinning, rotation, segmentAngle]);

	// Nhận biết khi vừa kết thúc quay để kích hoạt flash mừng trúng thưởng
	useEffect(() => {
		if (prevSpinningRef.current && !isSpinning) {
			setIsWinningFlash(true);
			const timer = setTimeout(() => {
				setIsWinningFlash(false);
			}, 1800);
			return () => clearTimeout(timer);
		}
		prevSpinningRef.current = isSpinning;
	}, [isSpinning]);

	// Bộ hẹn giờ nhịp đèn LED nhấp nháy
	useEffect(() => {
		// Tôn trọng cài đặt giảm chuyển động của người dùng
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		const intervalTime = isWinningFlash ? 180 : isSpinning ? 200 : 600;
		const interval = setInterval(() => {
			setLedStep((prev) => (prev === 0 ? 1 : 0));
		}, intervalTime);

		return () => clearInterval(interval);
	}, [isSpinning, isWinningFlash]);

	// Kích thước chip chữ và icon thích ứng mượt mà
	const sizeConfig = useMemo(() => {
		return {
			iconPt: "pt-[4%]",
			chipMt: "mt-1 sm:mt-1.5",
			chipPad: "px-2 sm:px-2.5 py-0.5",
			fontSize: "text-[11px] sm:text-[13px] md:text-[14px]",
			maxBadgeWidth: "max-w-[85px] sm:max-w-[102px]",
		};
	}, []);

	return (
		<div className='flex flex-col items-center justify-center select-none w-full max-w-full my-auto pt-3 pb-5 sm:pt-4 sm:pb-7'>
			{/* KHU VỰC VÒNG QUAY MAY MẮN */}
			<div className='relative w-[min(calc(100vw-24px),calc(100dvh-200px),370px)] h-[min(calc(100vw-24px),calc(100dvh-200px),370px)] sm:w-[min(calc(100vw-36px),calc(100dvh-220px),580px)] sm:h-[min(calc(100vw-36px),calc(100dvh-220px),580px)] md:w-[min(calc(100vw-48px),calc(100dvh-235px),700px)] md:h-[min(calc(100vw-48px),calc(100dvh-235px),700px)] lg:w-[min(calc(100vw-48px),calc(100dvh-235px),530px)] lg:h-[min(calc(100vw-48px),calc(100dvh-235px),530px)] xl:w-[min(calc(100vw-48px),calc(100dvh-235px),560px)] xl:h-[min(calc(100vw-48px),calc(100dvh-235px),560px)] 2xl:w-[min(calc(100vw-48px),calc(100dvh-235px),600px)] 2xl:h-[min(calc(100vw-48px),calc(100dvh-235px),600px)] select-none'>
				{/* 1. Bóng đổ dưới vòng (ellipse rgba(8,30,90,0.30), blur 20px) */}
				<div
					className='absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-12 rounded-[50%] pointer-events-none blur-[20px]'
					style={{ background: "rgba(8, 30, 90, 0.30)" }}
				/>

				{/* 2. Tia sáng hào quang trắng dịu nhẹ phía sau vòng, xoay chậm (rgba(255,255,255,0.10)) */}
				<div
					className='absolute -inset-[18%] sm:-inset-[22%] rounded-full pointer-events-none animate-[spin_40s_linear_infinite]'
					style={{
						background:
							"repeating-conic-gradient(from 0deg, rgba(255, 255, 255, 0.10) 0deg 10deg, transparent 10deg 20deg)",
						maskImage:
							"radial-gradient(circle, black 40%, rgba(0,0,0,0.5) 60%, transparent 74%)",
						WebkitMaskImage:
							"radial-gradient(circle, black 40%, rgba(0,0,0,0.5) 60%, transparent 74%)",
					}}
				/>

				{/* 3. VIỀN NGOÀI CÙNG (Gold 3D Rim): rim.from -> rim.mid -> rim.to, cạnh dưới rim.edge lệch xuống 5px */}
				<div
					className='absolute inset-0 rounded-full p-[3%] sm:p-[3.2%]'
					style={{
						background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.mid}, ${WHEEL_THEME.rim.to})`,
						boxShadow: `0 5px 0 ${WHEEL_THEME.rim.edge}, 0 18px 40px rgba(8, 30, 90, 0.35), inset 0 2px 4px rgba(255,255,255,0.85), inset 0 -3px 6px rgba(154, 91, 0, 0.6)`,
					}}
				>
					{/* Lớp viền mỏng chuyển tiếp kim loại */}
					<div
						className='relative w-full h-full rounded-full p-[1.5px]'
						style={{
							background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.edge})`,
						}}
					>
						{/* 4. VÒNG ĐÈN LED: Gradient Navy (ring.from -> ring.to) */}
						<div
							className='relative w-full h-full rounded-full'
							style={{
								background: `linear-gradient(to bottom, ${WHEEL_THEME.ring.from}, ${WHEEL_THEME.ring.to})`,
								boxShadow:
									"inset 0 6px 14px rgba(0,0,0,0.7), inset 0 -4px 10px rgba(0,0,0,0.55)",
							}}
						>
							{/* Vệt phản quang cung tròn nửa trên vành đèn */}
							<div className='absolute top-1 left-1/2 -translate-x-1/2 w-[86%] h-[32%] rounded-t-full bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none' />

							{/* 5. CÁC BÓNG ĐÈN LED (24 bóng nhấp nháy theo trạng thái) */}
							{Array.from({ length: LED_COUNT }).map((_, i) => {
								// Xác định bóng bật hay tắt
								let isBulbOn = false;
								if (isWinningFlash) {
									// Khi trúng thưởng: tất cả đèn cùng nhấp nháy đồng loạt
									isBulbOn = ledStep === 0;
								} else if (isSpinning) {
									// Đang quay: đảo nhanh xen kẽ chẵn/lẻ mỗi 200ms
									isBulbOn = i % 2 === ledStep;
								} else {
									// Chờ: đảo xen kẽ chẵn/lẻ mỗi 600ms
									isBulbOn = i % 2 === ledStep;
								}

								return (
									<div
										key={i}
										className='absolute inset-0 pointer-events-none'
										style={{
											transform: `rotate(${i * (360 / LED_COUNT)}deg)`,
										}}
									>
										{/* Socket kim loại mạ vàng ôm bóng đèn */}
										<div
											className='absolute left-1/2 top-[2.2%] -translate-x-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full p-[1px] flex items-center justify-center shadow-[0_1.5px_3px_rgba(0,0,0,0.6)]'
											style={{
												background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.edge})`,
											}}
										>
											{/* Thấu kính bóng đèn phát sáng */}
											<span
												className='w-full h-full rounded-full transition-all duration-200'
												style={{
													backgroundColor: isBulbOn
														? WHEEL_THEME.bulb.on
														: WHEEL_THEME.bulb.off,
													boxShadow: isBulbOn
														? `0 0 8px 3px ${WHEEL_THEME.bulb.glow}, 0 0 14px 5px rgba(255, 201, 60, 0.65)`
														: "inset 0 1px 2px rgba(0,0,0,0.5)",
													opacity: isBulbOn ? 1 : 0.65,
												}}
											/>
										</div>
									</div>
								);
							})}

							{/* 6. VÒNG ĐỆM GỜ KIM LOẠI ÔM ĐĨA QUAY */}
							<div
								className='absolute inset-[7.2%] rounded-full p-[1.2%]'
								style={{
									background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.mid}, ${WHEEL_THEME.rim.to})`,
									boxShadow: `0 4px 10px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,255,255,0.8), inset 0 -2px 3px ${WHEEL_THEME.rim.edge}`,
								}}
							>
								{/* ĐĨA XOAY */}
								<div className='relative w-full h-full rounded-full overflow-hidden'>
									<div
										ref={discRef}
										className='relative w-full h-full rounded-full'
										style={{
											transform: `rotate(${rotation}deg)`,
											// Easing dừng quay mượt mà, giảm tốc dần với cú dừng êm
											transition: isSpinning
												? "transform 5.4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
												: "none",
										}}
									>
										{/* ĐĨA QUAY ĐỘNG SVG */}
										<WheelDynamicDisc prizes={prizes} />

										{/* NỘI DUNG TỪNG MÚI: ICON Ở RÌA NGOÀI, CHIP CHỮ GẦN TÂM */}
										{prizes.map((prize, idx) => {
											const midAngle =
												idx * segmentAngle + segmentAngle / 2;

											// Tính góc hiển thị hiện tại trên màn hình khi vòng quay đứng yên
											// Đảm bảo chữ luôn đọc xuôi, không bị ngược đầu ở bất kỳ vị trí nào
											const screenAngle =
												((rotation % 360) + midAngle + 360) % 360;
											const isBottomHalf =
												screenAngle > 90 && screenAngle < 270;

											// Lấy màu chữ tương ứng từ theme của múi
											const sliceTheme = getSliceTheme(idx);

											return (
												<div
													key={prize.id}
													className='absolute inset-0 flex flex-col items-center pointer-events-none'
													style={{
														transform: `rotate(${midAngle}deg)`,
													}}
												>
													{/* 1. Icon luôn ở vành ngoài */}
													<div
														className={`flex items-center justify-center flex-shrink-0 ${sizeConfig.iconPt}`}
													>
														{renderPrizeIcon(prize)}
													</div>

													{/* 2. Chip chữ luôn ở gần tâm, xoay 180° nếu ở nửa dưới để chữ luôn đọc xuôi */}
													<div
														className={`flex items-center justify-center px-0.5 ${sizeConfig.chipMt}`}
													>
														<div
															className={`rounded-full flex items-center justify-center ${sizeConfig.chipPad} ${sizeConfig.maxBadgeWidth}`}
															style={{
																backgroundColor: "#FFFFFF",
																boxShadow:
																	"0 2px 4px rgba(0,0,0,0.18)",
																transform: isBottomHalf
																	? "rotate(180deg)"
																	: "none",
																transition: isSpinning
																	? "none"
																	: "transform 0.25s ease-out",
															}}
														>
															<span
																className={`font-heading font-extrabold tracking-tight truncate whitespace-nowrap ${sizeConfig.fontSize}`}
																style={{
																	color: sliceTheme.text,
																}}
															>
																{prize.shortLabel}
															</span>
														</div>
													</div>
												</div>
											);
										})}
									</div>

									{/* 7. HIGHLIGHT KÍNH BÓNG PHỦ LÊN TOÀN BỘ VÒNG */}
									<div
										className='absolute inset-0 rounded-full pointer-events-none'
										style={{
											background:
												"radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.28), transparent 55%)",
										}}
									/>

									{/* Bóng đổ nhẹ trong lòng đĩa tạo chiều sâu */}
									<div className='absolute inset-0 rounded-full shadow-[inset_0_0_16px_rgba(0,0,0,0.25)] pointer-events-none' />
								</div>
							</div>

							{/* 8. NÚT TÂM "QUAY" (3 trạng thái: Bình thường, Đang quay, Không đủ xu) */}
							<button
								type='button'
								onClick={!isSpinning ? onSpin : undefined}
								disabled={isSpinning}
								aria-disabled={isSpinning || isOutOfCoins}
								aria-label={
									isSpinning
										? "Đang quay vòng quay may mắn"
										: isOutOfCoins
											? `Cần ${spinCost.toLocaleString("vi-VN")} xu để quay`
											: `Nhấn để quay, chi phí ${spinCost.toLocaleString("vi-VN")} xu`
								}
								title={
									isOutOfCoins && !isSpinning
										? `Cần ${spinCost.toLocaleString("vi-VN")} xu để quay`
										: undefined
								}
								className={`group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[20%] h-[20%] rounded-full p-[2px] sm:p-[2.5px] md:p-1 flex items-center justify-center select-none focus:outline-none transition-transform duration-100 ease-out ${
									isSpinning
										? "cursor-not-allowed opacity-90"
										: isOutOfCoins
											? "cursor-not-allowed filter grayscale"
											: "cursor-pointer active:scale-[0.988]"
								}`}
								style={{
									// Viền ngoài: viền vàng action.ring 4px + viền trắng ngoài 2px
									background: isOutOfCoins
										? "linear-gradient(to bottom, #E5E7EB, #9CA3AF)"
										: `linear-gradient(to bottom, #FFFFFF, ${WHEEL_THEME.action.ring})`,
									boxShadow: isSpinning
										? "0 4px 12px rgba(0,0,0,0.3)"
										: isOutOfCoins
											? "0 4px 12px rgba(0,0,0,0.25)"
											: `0 6px 16px rgba(143, 15, 46, 0.45), 0 2px 0 ${WHEEL_THEME.action.shadow}`,
								}}
							>
								{/* Lòng nút: Đỏ Ruby khi sẵn sàng (action.from -> action.to), lún nhẹ êm ái khi nhấn */}
								<div
									className='relative w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden'
									style={{
										background: isSpinning
											? "linear-gradient(to bottom, #9CA3AF, #6B7280)"
											: isOutOfCoins
												? "linear-gradient(to bottom, #6B7280, #4B5563)"
												: `linear-gradient(to bottom, ${WHEEL_THEME.action.from}, ${WHEEL_THEME.action.to})`,
										border: "2px solid rgba(255,255,255,0.75)",
										boxShadow:
											"inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2.5px 4px rgba(0,0,0,0.3)",
									}}
								>
									{/* Vệt sáng bóng tròn ở nửa trên nút */}
									<div className='absolute top-0.5 left-1/2 -translate-x-1/2 w-[76%] h-[42%] rounded-full bg-gradient-to-b from-white/45 via-white/10 to-transparent pointer-events-none' />

									{/* Nội dung nút: Chữ QUAY hoặc ... và chi phí */}
									<div className='relative z-10 flex flex-col items-center justify-center'>
										<span
											className='font-heading font-black text-[9.5px] min-[360px]:text-[11px] sm:text-[15px] md:text-[20px] lg:text-[15px] xl:text-[16.5px] 2xl:text-[18px] tracking-widest uppercase leading-tight text-white'
											style={{
												textShadow:
													isSpinning || isOutOfCoins
														? "none"
														: `0 2px 0 ${WHEEL_THEME.action.shadow}`,
											}}
										>
											{!isSpinning && "QUAY"}
										</span>

										{/* Dòng hiển thị chi phí / thông báo cần xu */}
										<span
											className='inline-flex items-center gap-0.5 sm:gap-1 font-heading font-black text-[8px] min-[360px]:text-[9.5px] sm:text-[12px] md:text-[15px] lg:text-[12px] xl:text-[13.5px] 2xl:text-[14.5px] leading-tight mt-0.5 text-white/95'
											style={{
												textShadow:
													isSpinning || isOutOfCoins
														? "none"
														: "0 1px 2px rgba(0,0,0,0.6)",
											}}
										>
											{isSpinning ? (
												<span className='opacity-75'>
													Đang quay
												</span>
											) : isOutOfCoins ? (
												<span className='text-amber-200 whitespace-nowrap'>
													Cần {spinCost.toLocaleString("vi-VN")} xu
												</span>
											) : (
												<>
													<span>
														-{spinCost.toLocaleString("vi-VN")}
													</span>
													<Image
														src='/coin.png'
														alt='Xu'
														width={20}
														height={20}
														unoptimized
														style={{ height: "auto" }}
														className='w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-3.5 lg:h-3.5 inline-block object-contain drop-shadow -mt-0.5'
													/>
												</>
											)}
										</span>
									</div>
								</div>
							</button>
						</div>
					</div>
				</div>

				{/* 9. KIM CHỈ (Đỏ Ruby, viền trắng, đầu nhọn chạm miếng thưởng) */}
				<WheelPointer ref={pointerRef} />
			</div>
		</div>
	);
}
