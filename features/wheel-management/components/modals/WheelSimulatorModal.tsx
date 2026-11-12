"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  RotateCw,
  Award,
  Play,
} from "lucide-react";
import { WheelSlotItem, WheelPrizeType } from "../../types";
import { WHEEL_THEME, getSliceTheme } from "@/constants/wheel";
import { WheelPrizeImage } from "../WheelPrizeImage";
import { toast } from "sonner";

interface WheelSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: WheelSlotItem[];
}

const LED_COUNT = 24;

/**
 * Kim chỉ may mắn SVG (Đồng bộ 100% với giao diện học sinh /student/wheel)
 */
function WheelPointerSvg({ isSpinning }: { isSpinning: boolean }) {
  return (
    <div
      className={`absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 z-30 w-9 sm:w-11 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] origin-[50%_19.1%] transition-transform duration-75 ${
        isSpinning ? "rotate-2" : "rotate-0"
      }`}
    >
      <svg
        viewBox="0 0 60 94"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="modalPointerRedGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={WHEEL_THEME.action.from} />
            <stop offset="100%" stopColor={WHEEL_THEME.action.to} />
          </linearGradient>
          <radialGradient id="modalPointerCapGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor={WHEEL_THEME.rim.mid} />
            <stop offset="100%" stopColor={WHEEL_THEME.rim.edge} />
          </radialGradient>
        </defs>

        {/* Thân kim chỉ nhọn chạm tới các nan quạt */}
        <path
          d="M30 89 L10 24 C6 15 14 4 25 4 L35 4 C46 4 54 15 50 24 Z"
          fill="url(#modalPointerRedGrad)"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vệt phản quang trong lòng kim */}
        <path d="M24 10 L30 10 L28 62 C28 64 26 64 25 60 Z" fill="#FFFFFF" opacity="0.3" />

        {/* Chốt tròn kim loại vàng trên đầu kim */}
        <circle cx="30" cy="18" r="8" fill="url(#modalPointerCapGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="28" cy="16" r="2" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * Modal Popup Vòng Quay Thử Nghiệm To Lớn (Full-Size Live Wheel Simulator)
 * - Khôi phục 100% phong cách màu chuẩn như trang học sinh (/student/wheel):
 *   Viền mạ vàng 3D, vành đèn Navy 24 bóng LED phát sáng, nan quạt xen kẽ Vàng kem / Xanh dương
 */
export function WheelSimulatorModal({
  isOpen,
  onClose,
  slots,
}: WheelSimulatorModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [lastWonSlot, setLastWonSlot] = useState<WheelSlotItem | null>(null);
  const [ledStep, setLedStep] = useState(0);
  const [isWinningFlash, setIsWinningFlash] = useState(false);

  const activeSlots = useMemo(() => slots.filter((s) => s.is_active), [slots]);
  const totalWeight = useMemo(
    () => activeSlots.reduce((sum, s) => sum + s.probability_weight, 0),
    [activeSlots]
  );

  const totalSlices = activeSlots.length || 8;
  const segmentAngle = 360 / totalSlices;
  const RADIUS = 200;

  // Hiệu ứng nhịp đèn LED nhấp nháy
  useEffect(() => {
    if (!isOpen) return;
    const intervalTime = isWinningFlash ? 180 : isSpinning ? 200 : 600;
    const interval = setInterval(() => {
      setLedStep((prev) => (prev === 0 ? 1 : 0));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOpen, isSpinning, isWinningFlash]);

  // Thuật toán quay thử nghiệm ngẫu nhiên theo đúng Trọng số xác suất
  const handleTestSpin = () => {
    if (isSpinning || activeSlots.length === 0) return;

    setIsSpinning(true);
    setIsWinningFlash(false);
    setLastWonSlot(null);

    // 1. Chọn ô trúng ngẫu nhiên theo trọng số
    const randomVal = Math.random() * totalWeight;
    let accumulated = 0;
    let winningIndex = 0;

    for (let i = 0; i < activeSlots.length; i++) {
      accumulated += activeSlots[i].probability_weight;
      if (randomVal <= accumulated) {
        winningIndex = i;
        break;
      }
    }

    const wonItem = activeSlots[winningIndex];

    // 2. Tính toán góc quay vật lý
    const targetOffset = 360 - (winningIndex * segmentAngle + segmentAngle / 2);
    const totalExtraRotations = 5 * 360;
    const nextAngle =
      rotationAngle + totalExtraRotations + (targetOffset - (rotationAngle % 360));

    setRotationAngle(nextAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setIsWinningFlash(true);
      setLastWonSlot(wonItem);

      if (wonItem.prize_type === "coin") {
        toast.success(`🎉 Quay thử trúng: ${wonItem.label}! (+${wonItem.reward_coins} xu)`);
      } else if (wonItem.prize_type === "deduct_coin") {
        toast.error(`⚠️ Quay thử trúng ô trừ: ${wonItem.label} (${wonItem.reward_coins} xu)`);
      } else if (wonItem.prize_type === "free_spin") {
        toast.info(`🎁 Quay thử trúng: ${wonItem.label}`);
      } else {
        toast(`✨ Quay thử trúng: ${wonItem.label}`);
      }
    }, 4200);
  };

  // Tính toán vector SVG cho các múi quạt (Theme chuẩn Vàng kem / Xanh dương xen kẽ)
  const slicesData = useMemo(() => {
    return activeSlots.map((slot, i) => {
      const startDeg = i * segmentAngle;
      const endDeg = (i + 1) * segmentAngle;

      const r1 = (startDeg * Math.PI) / 180;
      const r2 = (endDeg * Math.PI) / 180;

      const x1 = RADIUS * Math.sin(r1);
      const y1 = -RADIUS * Math.cos(r1);
      const x2 = RADIUS * Math.sin(r2);
      const y2 = -RADIUS * Math.cos(r2);

      const pathData = `M 0 0 L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${RADIUS} ${RADIUS} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;

      const studR = RADIUS * 0.94;
      const studX = studR * Math.sin(r1);
      const studY = -studR * Math.cos(r1);

      const theme = getSliceTheme(i);

      return {
        slot,
        index: i,
        pathData,
        x1,
        y1,
        studX,
        studY,
        theme,
      };
    });
  }, [activeSlots, segmentAngle]);

  const renderSlotIcon = (type: WheelPrizeType) => {
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
        <WheelPrizeImage type={type} size={34} />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col items-center p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng Popup */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0A62D6] text-xs font-bold border border-blue-100 mb-1.5">
            MÔ PHỎNG VÒNG QUAY TRỰC QUAN
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Vòng Quay May Mắn Thử Nghiệm 🎡
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô phỏng trải nghiệm thực tế của học sinh ({activeSlots.length} ô kích hoạt • 100% tỷ lệ)
          </p>
        </div>

        {/* KHUNG VÒNG QUAY TO LỚN (ĐƯỜNG KÍNH 360px - 420px) - CHUẨN PHONG CÁCH /student/wheel */}
        <div className="relative w-80 h-80 sm:w-[420px] sm:h-[420px] my-2 select-none">
          {/* Bóng đổ đáy vòng */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-12 rounded-[50%] pointer-events-none blur-[20px]"
            style={{ background: "rgba(8, 30, 90, 0.32)" }}
          />

          {/* 1. Viền ngoài mạ vàng 3D (Gold 3D Rim) */}
          <div
            className="absolute inset-0 rounded-full p-[3%]"
            style={{
              background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.mid}, ${WHEEL_THEME.rim.to})`,
              boxShadow: `0 5px 0 ${WHEEL_THEME.rim.edge}, 0 20px 45px rgba(8, 30, 90, 0.4), inset 0 2px 4px rgba(255,255,255,0.85), inset 0 -3px 6px rgba(154, 91, 0, 0.6)`,
            }}
          >
            {/* 2. Vành đèn LED Navy */}
            <div
              className="relative w-full h-full rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${WHEEL_THEME.ring.from}, ${WHEEL_THEME.ring.to})`,
                boxShadow:
                  "inset 0 6px 14px rgba(0,0,0,0.7), inset 0 -4px 10px rgba(0,0,0,0.55)",
              }}
            >
              {/* Vệt phản quang cung tròn nửa trên */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[86%] h-[32%] rounded-t-full bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />

              {/* 3. 24 Bóng đèn LED vàng óng */}
              {Array.from({ length: LED_COUNT }).map((_, i) => {
                let isBulbOn = false;
                if (isWinningFlash) {
                  isBulbOn = ledStep === 0;
                } else if (isSpinning) {
                  isBulbOn = i % 2 === ledStep;
                } else {
                  isBulbOn = i % 2 === ledStep;
                }

                return (
                  <div
                    key={i}
                    className="absolute inset-0 pointer-events-none"
                    style={{ transform: `rotate(${i * (360 / LED_COUNT)}deg)` }}
                  >
                    <div
                      className="absolute left-1/2 top-[2.2%] -translate-x-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full p-[1px] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
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
                            ? `0 0 8px 3px ${WHEEL_THEME.bulb.glow}, 0 0 14px 5px rgba(255, 201, 60, 0.7)`
                            : "inset 0 1px 2px rgba(0,0,0,0.5)",
                          opacity: isBulbOn ? 1 : 0.65,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* 4. Gờ kim loại mạ vàng ôm đĩa quay */}
              <div
                className="absolute inset-[7.2%] rounded-full p-[1.2%]"
                style={{
                  background: `linear-gradient(to bottom, ${WHEEL_THEME.rim.from}, ${WHEEL_THEME.rim.mid}, ${WHEEL_THEME.rim.to})`,
                  boxShadow: `0 4px 10px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,255,255,0.8), inset 0 -2px 3px ${WHEEL_THEME.rim.edge}`,
                }}
              >
                {/* 5. Đĩa xoay chính */}
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <div
                    className="relative w-full h-full rounded-full"
                    style={{
                      transform: `rotate(${rotationAngle}deg)`,
                      transition: isSpinning
                        ? "transform 4.2s cubic-bezier(0.15, 0.85, 0.25, 1)"
                        : "none",
                    }}
                  >
                    {/* SVG Múi quạt: Vàng kem & Xanh dương xen kẽ chuẩn hệ thống */}
                    <svg
                      viewBox={`-${RADIUS} -${RADIUS} ${RADIUS * 2} ${RADIUS * 2}`}
                      className="absolute inset-0 w-full h-full pointer-events-none select-none rounded-full"
                    >
                      <defs>
                        {slicesData.map(({ index, theme }) => (
                          <radialGradient
                            key={`modal-grad-${index}`}
                            id={`modal-grad-${index}`}
                            cx="0"
                            cy="0"
                            r={RADIUS}
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0%" stopColor={theme.from} stopOpacity="1" />
                            <stop offset="100%" stopColor={theme.to} stopOpacity="1" />
                          </radialGradient>
                        ))}
                        <radialGradient id="modalBowlShadow" cx="0" cy="0" r={RADIUS} gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                          <stop offset="78%" stopColor="#000000" stopOpacity="0" />
                          <stop offset="94%" stopColor="#000000" stopOpacity="0.08" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
                        </radialGradient>
                      </defs>

                      {/* Nan quạt */}
                      <g>
                        {slicesData.map(({ slot, index, pathData }) => (
                          <path
                            key={`wedge-${slot.id}-${index}`}
                            d={pathData}
                            fill={`url(#modal-grad-${index})`}
                          />
                        ))}
                      </g>

                      {/* Đường chia nan và chốt tròn viền trắng */}
                      <g>
                        {slicesData.map(({ slot, index, x1, y1, studX, studY }) => (
                          <React.Fragment key={`divider-${slot.id}-${index}`}>
                            <line
                              x1="0"
                              y1="0"
                              x2={x1.toFixed(3)}
                              y2={y1.toFixed(3)}
                              stroke={WHEEL_THEME.divider}
                              strokeWidth="2.2"
                            />
                            <circle
                              cx={studX.toFixed(3)}
                              cy={studY.toFixed(3)}
                              r="4.5"
                              fill={WHEEL_THEME.rim.mid}
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                            />
                          </React.Fragment>
                        ))}
                      </g>

                      {/* Bóng đổ lòng chảo tạo độ cong 3D */}
                      <circle cx="0" cy="0" r={RADIUS} fill="url(#modalBowlShadow)" />
                    </svg>

                    {/* Nội dung các múi: Icon 3D ở rìa ngoài, Chip chữ nền trắng gần tâm */}
                    {activeSlots.map((slot, i) => {
                      const angle = i * segmentAngle + segmentAngle / 2;

                      return (
                        <div
                          key={slot.id}
                          className="absolute inset-0 flex flex-col items-center pointer-events-none"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <div className="pt-[5%] flex flex-col items-center select-none">
                            {renderSlotIcon(slot.prize_type)}
                            <div className="mt-1 px-2.5 py-0.5 rounded-full max-w-[95px] sm:max-w-[110px] flex items-center justify-center border border-white/60 bg-white/95 backdrop-blur-xs shadow-[0_2px_4px_rgba(0,0,0,0.22)]">
                              <span
                                className={`text-[11px] sm:text-[12px] font-black truncate tracking-tight ${
                                  i % 2 === 0 ? "text-[#7A4300]" : "text-[#0C3A8C]"
                                }`}
                              >
                                {slot.short_label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* NÚT QUAY TÂM ĐĨA: Thiết kế chuẩn ảnh học sinh (viền trắng, lòng xám kim loại sang trọng) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <button
                      type="button"
                      onClick={handleTestSpin}
                      disabled={isSpinning || activeSlots.length === 0}
                      title="Bấm để quay thử"
                      className={`group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] flex items-center justify-center select-none focus:outline-none transition-transform duration-100 ease-out ${
                        isSpinning
                          ? "cursor-not-allowed opacity-90 scale-95"
                          : "cursor-pointer hover:scale-105 active:scale-95"
                      }`}
                      style={{
                        background: "linear-gradient(to bottom, #FFFFFF, #D1D5DB)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.35), 0 2px 0 rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        className="relative w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden border border-white/60 shadow-inner"
                        style={{
                          background: "linear-gradient(to bottom, #4B5563, #374151)",
                        }}
                      >
                        {/* Vệt phản quang cung tròn */}
                        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-[76%] h-[40%] rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

                        {isSpinning ? (
                          <RotateCw className="w-6 h-6 text-white animate-spin stroke-[2.5]" />
                        ) : (
                          <div className="relative z-10 flex flex-col items-center justify-center leading-none">
                            <span className="font-heading font-black text-sm sm:text-base text-white tracking-widest uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                              QUAY
                            </span>
                            <span className="font-heading font-bold text-[9px] sm:text-[10px] text-amber-300 mt-1 uppercase tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                              THỬ NGHIỆM
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KIM CHỈ MAY MẮN Ở ĐỈNH 12H */}
          <WheelPointerSvg isSpinning={isSpinning} />
        </div>

        {/* Nút bấm lớn phía dưới */}
        <div className="mt-4 flex flex-col items-center gap-2 w-full">
          <button
            type="button"
            onClick={handleTestSpin}
            disabled={isSpinning || activeSlots.length === 0}
            className={`w-full sm:w-auto min-w-[240px] inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl font-bold text-sm transition-all shadow-md cursor-pointer ${
              isSpinning
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-[1.02] active:scale-98"
            }`}
          >
            {isSpinning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Đang quay thử...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Bấm Để Quay Thử</span>
              </>
            )}
          </button>

          {/* Kết quả quay thử gần nhất */}
          {lastWonSlot && !isSpinning && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-blue-50 border border-blue-200 text-sm font-bold text-blue-900 animate-in fade-in zoom-in-95 mt-1">
              <Award className="w-4 h-4 text-[#0A62D6]" />
              <span>Kết quả vừa quay trúng:</span>
              <span className="text-[#0A62D6] font-extrabold">{lastWonSlot.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
