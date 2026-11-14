"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { WHEEL_CONSTANTS, WHEEL_PRIZE_TYPES } from "@/constants/wheel";
import { wheelAudio } from "@/features/lucky-wheel/audio/wheelAudio";
import { WheelSlotItem } from "../types";

/**
 * Micro-Hook quản lý trạng thái và thuật toán quay thử nghiệm trực tiếp trên trang Cấu hình
 */
export function useWheelSimulator(slots: WheelSlotItem[]) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [lastWonSlot, setLastWonSlot] = useState<WheelSlotItem | null>(null);
  const currentRotationRef = useRef<number>(0);

  const activeSlots = useMemo(
    () => slots.filter((s) => s.is_active),
    [slots]
  );

  const totalWeight = useMemo(
    () => activeSlots.reduce((sum, s) => sum + s.probability_weight, 0),
    [activeSlots]
  );

  const totalSlices = Math.max(1, activeSlots.length);
  const segmentAngle = 360 / totalSlices;

  // Thuật toán quay thử nghiệm ngẫu nhiên theo đúng Trọng số xác suất hiện tại
  const handleTestSpin = useCallback(() => {
    if (isSpinning || activeSlots.length === 0) return;

    wheelAudio.unlock();
    wheelAudio.playSpinStart();
    setIsSpinning(true);
    setLastWonSlot(null);

    // 1. Chọn ô trúng ngẫu nhiên theo trọng số (Dynamic Normalization)
    const safeTotalWeight = Math.max(1, totalWeight);
    const randomVal = Math.random() * safeTotalWeight;
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

    // 2. Tính toán góc quay vật lý đồng bộ chuẩn với WheelSpinner
    const midAngle = winningIndex * segmentAngle + segmentAngle / 2;
    const targetOffset = (360 - midAngle) % 360;
    const safeJitterMax = Math.min(
      WHEEL_CONSTANTS.JITTER_ANGLE_RANGE / 2,
      segmentAngle * 0.22
    );
    const randomJitter = (Math.random() - 0.5) * (safeJitterMax * 2);

    const extraRounds = WHEEL_CONSTANTS.MIN_EXTRA_ROUNDS * 360;
    const currentBase = Math.floor(currentRotationRef.current / 360) * 360;
    const nextAngle =
      currentBase + extraRounds + targetOffset + randomJitter;

    currentRotationRef.current = nextAngle;
    setRotationAngle(nextAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setLastWonSlot(wonItem);
      wheelAudio.playReward();

      if (wonItem.prize_type === WHEEL_PRIZE_TYPES.COIN) {
        toast.success(
          `🎉 Quay thử trúng: ${wonItem.label}! (+${wonItem.reward_coins} xu)`
        );
      } else if (wonItem.prize_type === WHEEL_PRIZE_TYPES.DEDUCT_COIN) {
        toast.error(
          `⚠️ Quay thử trúng ô trừ: ${wonItem.label} (${wonItem.reward_coins} xu)`
        );
      } else if (wonItem.prize_type === WHEEL_PRIZE_TYPES.FREE_SPIN) {
        toast.info(`🎁 Quay thử trúng: ${wonItem.label}`);
      } else {
        toast(`✨ Quay thử trúng: ${wonItem.label}`);
      }
    }, WHEEL_CONSTANTS.SIMULATOR_SPIN_DURATION_MS);
  }, [isSpinning, activeSlots, totalWeight, segmentAngle]);

  // Đặt lại kim chỉ và góc quay về trạng thái 0 độ ban đầu
  const handleResetSimulator = useCallback(() => {
    if (isSpinning) return;
    currentRotationRef.current = 0;
    setRotationAngle(0);
    setLastWonSlot(null);
    toast.info("Đã đặt lại vòng quay về vị trí ban đầu!", {
      id: "reset-simulator",
    });
  }, [isSpinning]);

  return {
    activeSlots,
    isSpinning,
    rotationAngle,
    lastWonSlot,
    handleTestSpin,
    handleResetSimulator,
  };
}
