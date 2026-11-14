"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Gift, Smile, Star, RotateCw } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { WheelPrize, PrizeType } from "../types";
import {
  WHEEL_CONSTANTS,
  WHEEL_THEME,
  WHEEL_PRIZE_TYPES,
  WHEEL_ASSETS,
  getSliceTheme,
  getWheelPrizeImageUrl,
} from "@/constants/wheel";
import { wheelAudio, AUDIO_CONFIG } from "../audio/wheelAudio";
import { WheelDynamicDisc } from "./WheelDynamicDisc";

export interface WheelSpinnerItem {
  id: string;
  label: string;
  short_label: string;
  prize_type: PrizeType | string;
}

export interface WheelSpinnerProps {
  prizes: (WheelPrize | WheelSpinnerItem)[];
  rotation: number;
  isSpinning: boolean;
  spinCost?: number;
  onSpin: () => void;
  currentCoins?: number;
  mode?: "student" | "simulator";
  transitionDurationMs?: number;
  sizeClassName?: string;
}

const LED_COUNT = 24;

const OFFICIAL_IMAGE_TYPES: string[] = [
  WHEEL_PRIZE_TYPES.COIN,
  WHEEL_PRIZE_TYPES.GIFT,
  WHEEL_PRIZE_TYPES.LUCK,
  WHEEL_PRIZE_TYPES.FREE_SPIN,
  WHEEL_PRIZE_TYPES.DEDUCT_COIN,
];

/**
 * Render Icon giải thưởng trên từng múi quạt
 */
function renderPrizeIcon(prize: WheelSpinnerItem) {
  const imageUrl = getWheelPrizeImageUrl(prize.prize_type);
  const isCoin = prize.prize_type === WHEEL_PRIZE_TYPES.COIN;

  if (OFFICIAL_IMAGE_TYPES.includes(prize.prize_type)) {
    return (
      <div
        className="relative w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9"
        style={{
          filter: isCoin
            ? "drop-shadow(1px 0 0 #B86E00) drop-shadow(-1px 0 0 #B86E00) drop-shadow(0 1px 0 #B86E00) drop-shadow(0 -1px 0 #B86E00) drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
            : "drop-shadow(0 2px 5px rgba(0,0,0,0.25))",
        }}
      >
        <Image
          src={imageUrl}
          alt={prize.label}
          fill
          unoptimized
          sizes="36px"
          className="object-contain"
        />
      </div>
    );
  }

  const iconComponentMap = {
    [WHEEL_PRIZE_TYPES.GIFT]: Gift,
    [WHEEL_PRIZE_TYPES.MULTIPLIER]: Star,
    [WHEEL_PRIZE_TYPES.LUCK]: Smile,
  };

  const IconComp =
    iconComponentMap[prize.prize_type as keyof typeof iconComponentMap] || Star;

  return (
    <div
      className="w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 rounded-xl flex items-center justify-center border-2 border-white shadow-[0_2px_5px_rgba(0,0,0,0.35)]"
      style={{
        background: `linear-gradient(to bottom, ${WHEEL_THEME.special.from}, ${WHEEL_THEME.special.to})`,
      }}
    >
      <IconComp className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
    </div>
  );
}

/**
 * SVG Kim chỉ may mắn (Wheel Pointer):
 * - Nhận ref để cập nhật góc xoay trực tiếp theo chuyển động vật lý của divider
 */
export const WheelPointer = React.forwardRef<
  HTMLDivElement,
  { initialAngle?: number }
>(function WheelPointer({ initialAngle = 0 }, ref) {
  return (
    <div
      ref={ref}
      className="absolute -top-[3.5%] left-1/2 z-30 w-9 sm:w-11 md:w-12 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] origin-[50%_19.1%] will-change-transform"
      style={{
        transform: `translateX(-50%) rotate(${initialAngle}deg)`,
      }}
    >
      <svg
        viewBox="0 0 60 94"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="pointerRedGradient"
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop offset="0%" stopColor={WHEEL_THEME.action.from} />
            <stop offset="100%" stopColor={WHEEL_THEME.action.to} />
          </linearGradient>
          <radialGradient
            id="pointerCapGradient"
            cx="40%"
            cy="35%"
            r="65%"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor={WHEEL_THEME.rim.mid} />
            <stop offset="100%" stopColor={WHEEL_THEME.rim.edge} />
          </radialGradient>
        </defs>

        <path
          d="M30 89 L10 24 C6 15 14 4 25 4 L35 4 C46 4 54 15 50 24 Z"
          fill="url(#pointerRedGradient)"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        <path
          d="M24 10 L30 10 L28 62 C28 64 26 64 25 60 Z"
          fill="#FFFFFF"
          opacity="0.3"
        />

        <circle
          cx="30"
          cy="18"
          r="8"
          fill="url(#pointerCapGradient)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <circle cx="28" cy="16" r="2" fill="#FFFFFF" opacity="0.8" />
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
  spinCost = 0,
  onSpin,
  currentCoins: propCoins,
  mode = "student",
  transitionDurationMs = WHEEL_CONSTANTS.SPIN_DURATION_MS,
  sizeClassName,
}: WheelSpinnerProps) {
  const storeCoins = useUserStore(
    (state) => state.student?.current_coins ?? 0
  );
  const isSimulator = mode === "simulator";
  const actualCoins = propCoins !== undefined ? propCoins : storeCoins;
  const isOutOfCoins = !isSimulator && actualCoins < spinCost;

  const totalItems = Math.max(1, prizes.length);
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

  // Vòng lặp requestAnimationFrame đọc góc xoay thực tế, điều khiển kim chỉ chạm divider và phát tiếng tick
  useEffect(() => {
    let animId: number;

    if (isSpinning) {
      const discEl = discRef.current;
      accumulatedAngleRef.current = startRotationRef.current;
      lastRawAngleRef.current = getComputedRotationDeg(discEl);
      lastPegRef.current = Math.floor(
        startRotationRef.current / segmentAngle
      );
      lastSnapTimeRef.current = performance.now();
      prevTimeRef.current = performance.now();

      const rAfLoop = (now: number) => {
        if (!discRef.current) return;

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

        const angularVelocity = dt > 0 && delta > 0 ? delta / dt : 0;
        const speedRatio = Math.max(0, Math.min(1, angularVelocity / 1100));

        wheelAudio.updateSpinLoopVelocity(speedRatio);

        const currentPeg = Math.floor(
          accumulatedAngleRef.current / segmentAngle
        );
        if (currentPeg !== lastPegRef.current) {
          lastPegRef.current = currentPeg;
          lastSnapTimeRef.current = now;

          wheelAudio.playTick(speedRatio);

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

        if (pointerRef.current) {
          let pointerAngle = 0;
          if (angularVelocity > 450) {
            pointerAngle = 6.5 + Math.sin(now * 0.08) * 2.2;
          } else {
            const mod =
              ((accumulatedAngleRef.current % segmentAngle) +
                segmentAngle) %
              segmentAngle;
            const distToPeg = segmentAngle - mod;
            const contactZone = 5.2;

            if (distToPeg <= contactZone) {
              const pushRatio = (contactZone - distToPeg) / contactZone;
              pointerAngle = pushRatio * 8.5;
            } else {
              const timeSinceSnap =
                (now - lastSnapTimeRef.current) / 1000;
              if (timeSinceSnap < 0.07) {
                pointerAngle =
                  -3.5 *
                  Math.exp(-45 * timeSinceSnap) *
                  Math.cos(65 * timeSinceSnap);
              } else {
                pointerAngle = 0;
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
      if (prevSpinningRef.current) {
        wheelAudio.playSpinEnd();

        const remainder =
          ((accumulatedAngleRef.current % segmentAngle) + segmentAngle) %
          segmentAngle;
        if (remainder < 3.5 || remainder > segmentAngle - 3.5) {
          wheelAudio.playReboundTick();
        }
      }
      startRotationRef.current = rotation;

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

  const sizeConfig = useMemo(() => {
    return {
      iconPt: isSimulator ? "pt-[4.2%]" : "pt-[4%]",
      chipMt: "mt-1 sm:mt-1.5",
      chipPad: isSimulator ? "px-1.5 sm:px-2 py-0.5" : "px-2 sm:px-2.5 py-0.5",
      fontSize: isSimulator
        ? "text-[10.5px] sm:text-[12px]"
        : "text-[11px] sm:text-[13px] md:text-[14px]",
      maxBadgeWidth: isSimulator
        ? "max-w-[82px] sm:max-w-[96px]"
        : "max-w-[85px] sm:max-w-[102px]",
    };
  }, [isSimulator]);

  const defaultSizeClasses = isSimulator
    ? "w-[330px] h-[330px] sm:w-[420px] sm:h-[420px] xl:w-[460px] xl:h-[460px] 2xl:w-[480px] 2xl:h-[480px]"
    : "w-[min(calc(100vw-24px),calc(100dvh-200px),370px)] h-[min(calc(100vw-24px),calc(100dvh-200px),370px)] sm:w-[min(calc(100vw-36px),calc(100dvh-220px),580px)] sm:h-[min(calc(100vw-36px),calc(100dvh-220px),580px)] md:w-[min(calc(100vw-48px),calc(100dvh-235px),700px)] md:h-[min(calc(100vw-48px),calc(100dvh-235px),700px)] lg:w-[min(calc(100vw-48px),calc(100dvh-235px),530px)] lg:h-[min(calc(100vw-48px),calc(100dvh-235px),530px)] xl:w-[min(calc(100vw-48px),calc(100dvh-235px),560px)] xl:h-[min(calc(100vw-48px),calc(100dvh-235px),560px)] 2xl:w-[min(calc(100vw-48px),calc(100dvh-235px),600px)] 2xl:h-[min(calc(100vw-48px),calc(100dvh-235px),600px)]";

  return (
    <div
      className={`isolate flex flex-col items-center justify-center select-none w-full max-w-full shrink-0 ${
        isSimulator ? "my-1 pt-3 pb-2" : "my-auto pt-3 pb-5 sm:pt-4 sm:pb-7"
      }`}
    >
      {/* KHU VỰC VÒNG QUAY MAY MẮN - shrink-0 aspect-square chống méo hình bầu dục tuyệt đối */}
      <div
        className={`relative shrink-0 aspect-square select-none ${
          sizeClassName || defaultSizeClasses
        }`}
      >
        {/* 1. Bóng đổ dưới vòng */}
        <div
          className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-12 rounded-[50%] pointer-events-none blur-[20px]"
          style={{ background: "rgba(8, 30, 90, 0.30)" }}
        />

        {/* 2. Tia sáng hào quang trắng dịu nhẹ phía sau vòng */}
        {!isSimulator && (
          <div
            className="absolute -inset-[18%] sm:-inset-[22%] rounded-full pointer-events-none animate-[spin_40s_linear_infinite]"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, rgba(255, 255, 255, 0.10) 0deg 10deg, transparent 10deg 20deg)",
              maskImage:
                "radial-gradient(circle, black 40%, rgba(0,0,0,0.5) 60%, transparent 74%)",
              WebkitMaskImage:
                "radial-gradient(circle, black 40%, rgba(0,0,0,0.5) 60%, transparent 74%)",
            }}
          />
        )}

        {/* 3. VIỀN NGOÀI CÙNG (Gold 3D Rim) */}
        <div
          className="absolute inset-0 rounded-full p-[3%] sm:p-[3.2%]"
          style={{
            background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.mid}, ${WHEEL_THEME.rim.to})`,
            boxShadow: `0 5px 0 ${WHEEL_THEME.rim.edge}, 0 18px 40px rgba(8, 30, 90, 0.35), inset 0 2px 4px rgba(255,255,255,0.85), inset 0 -3px 6px rgba(154, 91, 0, 0.6)`,
          }}
        >
          {/* Lớp viền mỏng chuyển tiếp kim loại */}
          <div
            className="relative w-full h-full rounded-full p-[1.5px]"
            style={{
              background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.edge})`,
            }}
          >
            {/* 4. VÒNG ĐÈN LED: Gradient Navy */}
            <div
              className="relative w-full h-full rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${WHEEL_THEME.ring.from}, ${WHEEL_THEME.ring.to})`,
                boxShadow:
                  "inset 0 6px 14px rgba(0,0,0,0.7), inset 0 -4px 10px rgba(0,0,0,0.55)",
              }}
            >
              {/* Vệt phản quang cung tròn nửa trên vành đèn */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[86%] h-[32%] rounded-t-full bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />

              {/* 5. CÁC BÓNG ĐÈN LED (24 bóng nhấp nháy theo trạng thái) */}
              {Array.from({ length: LED_COUNT }).map((_, i) => {
                const isBulbOn = isWinningFlash
                  ? ledStep === 0
                  : i % 2 === ledStep;

                return (
                  <div
                    key={i}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      transform: `rotate(${i * (360 / LED_COUNT)}deg)`,
                    }}
                  >
                    <div
                      className="absolute left-1/2 top-[2.2%] -translate-x-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full p-[1px] flex items-center justify-center shadow-[0_1.5px_3px_rgba(0,0,0,0.6)]"
                      style={{
                        background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.edge})`,
                      }}
                    >
                      <span
                        className="w-full h-full rounded-full transition-all duration-200"
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
                className="absolute inset-[7.2%] rounded-full p-[1.2%]"
                style={{
                  background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.mid}, ${WHEEL_THEME.rim.to})`,
                  boxShadow: `0 4px 10px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,255,255,0.8), inset 0 -2px 3px ${WHEEL_THEME.rim.edge}`,
                }}
              >
                {/* ĐĨA XOAY */}
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <div
                    ref={discRef}
                    className="relative w-full h-full rounded-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning
                        ? `transform ${transitionDurationMs}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                        : "none",
                    }}
                  >
                    {/* ĐĨA QUAY ĐỘNG SVG */}
                    <WheelDynamicDisc prizes={prizes} />

                    {/* NỘI DUNG TỪNG MÚI: ICON Ở RÌA NGOÀI, CHIP CHỮ GẦN TÂM */}
                    {prizes.map((prize, idx) => {
                      const midAngle =
                        idx * segmentAngle + segmentAngle / 2;

                      const screenAngle =
                        ((rotation % 360) + midAngle + 360) % 360;
                      const isBottomHalf =
                        screenAngle > 90 && screenAngle < 270;

                      const sliceTheme = getSliceTheme(idx);

                      return (
                        <div
                          key={prize.id}
                          className="absolute inset-0 flex flex-col items-center pointer-events-none"
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

                          {/* 2. Chip chữ luôn ở gần tâm */}
                          <div
                            className={`flex items-center justify-center px-0.5 ${sizeConfig.chipMt}`}
                          >
                            <div
                              className={`rounded-full flex items-center justify-center ${sizeConfig.chipPad} ${sizeConfig.maxBadgeWidth}`}
                              style={{
                                backgroundColor: "#FFFFFF",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
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
                                {prize.short_label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 7. HIGHLIGHT KÍNH BÓNG PHỦ LÊN TOÀN BỘ VÒNG */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.28), transparent 55%)",
                    }}
                  />

                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_16px_rgba(0,0,0,0.25)] pointer-events-none" />
                </div>
              </div>

              {/* 8. NÚT TÂM "QUAY" */}
              <button
                type="button"
                onClick={!isSpinning ? onSpin : undefined}
                disabled={isSpinning || prizes.length === 0}
                aria-disabled={isSpinning || isOutOfCoins}
                aria-label={
                  isSpinning
                    ? "Đang quay vòng quay may mắn"
                    : isSimulator
                    ? "Bấm để quay thử nghiệm"
                    : isOutOfCoins
                    ? `Cần ${spinCost.toLocaleString("vi-VN")} xu để quay`
                    : `Nhấn để quay, chi phí ${spinCost.toLocaleString("vi-VN")} xu`
                }
                title={
                  isOutOfCoins && !isSpinning
                    ? `Cần ${spinCost.toLocaleString("vi-VN")} xu để quay`
                    : isSimulator
                    ? "Bấm để quay thử nghiệm"
                    : undefined
                }
                className={`group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[21%] h-[21%] rounded-full p-[2px] sm:p-[2.5px] md:p-1 flex items-center justify-center select-none focus:outline-none transition-transform duration-100 ease-out ${
                  isSpinning
                    ? "cursor-not-allowed opacity-90"
                    : isOutOfCoins
                    ? "cursor-not-allowed filter grayscale"
                    : "cursor-pointer hover:scale-[1.03] active:scale-[0.985]"
                }`}
                style={{
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
                <div
                  className="relative w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden"
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
                  <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-[76%] h-[42%] rounded-full bg-gradient-to-b from-white/45 via-white/10 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {isSpinning && isSimulator ? (
                      <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin stroke-[2.5]" />
                    ) : (
                      <>
                        <span
                          className="font-heading font-black text-[9.5px] min-[360px]:text-[11px] sm:text-[15px] md:text-[18px] lg:text-[15px] xl:text-[16.5px] 2xl:text-[18px] tracking-widest uppercase leading-tight text-white"
                          style={{
                            textShadow:
                              isSpinning || isOutOfCoins
                                ? "none"
                                : `0 2px 0 ${WHEEL_THEME.action.shadow}`,
                          }}
                        >
                          {!isSpinning && "QUAY"}
                        </span>

                        <span
                          className="inline-flex items-center gap-0.5 sm:gap-1 font-heading font-black text-[8px] min-[360px]:text-[9.5px] sm:text-[11px] md:text-[13px] lg:text-[12px] xl:text-[13.5px] 2xl:text-[14.5px] leading-tight mt-0.5 text-white/95"
                          style={{
                            textShadow:
                              isSpinning || isOutOfCoins
                                ? "none"
                                : "0 1px 2px rgba(0,0,0,0.6)",
                          }}
                        >
                          {isSpinning ? (
                            <span className="opacity-75">Đang quay</span>
                          ) : isSimulator ? (
                            <span className="text-amber-200 text-[8.5px] sm:text-[10px] tracking-tight uppercase">
                              THỬ NGHIỆM
                            </span>
                          ) : isOutOfCoins ? (
                            <span className="text-amber-200 whitespace-nowrap">
                              Cần {spinCost.toLocaleString("vi-VN")} xu
                            </span>
                          ) : (
                            <>
                              <span>
                                -{spinCost.toLocaleString("vi-VN")}
                              </span>
                              <Image
                                src={WHEEL_ASSETS.COIN}
                                alt="Xu"
                                width={20}
                                height={20}
                                unoptimized
                                style={{ height: "auto" }}
                                className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-3.5 lg:h-3.5 inline-block object-contain drop-shadow -mt-0.5"
                              />
                            </>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 9. KIM CHỈ */}
        <WheelPointer ref={pointerRef} />
      </div>
    </div>
  );
}
