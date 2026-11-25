"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { WHEEL_PRIZE_TYPES } from "@/constants/wheel";
import { wheelAudio } from "@/features/student/lucky-wheel/audio/wheelAudio";
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

  // Thuật toán quay thử nghiệm ngẫu nhiên theo đúng Trọng số xác suất hiện tại
  const handleTestSpin = useCallback(() => {
    if (isSpinning || activeSlots.length === 0) return null;

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

    return Promise.resolve({
      prizeIndex: winningIndex,
      wonItem,
    });
  }, [isSpinning, activeSlots, totalWeight]);

  // Xử lý khi đĩa quay thử nghiệm kết thúc và dừng lại tại ô trúng
  const handleSimulatorComplete = useCallback(
    (payload?: { prizeIndex: number; wonItem?: unknown; finalAngle?: number }) => {
      setIsSpinning(false);
      if (typeof payload?.finalAngle === "number") {
        currentRotationRef.current = payload.finalAngle;
        setRotationAngle(payload.finalAngle);
      }
      const wonItem = payload?.wonItem as WheelSlotItem | undefined;
      if (wonItem) {
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
      }
    },
    []
  );

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
    handleSimulatorComplete,
    handleResetSimulator,
  };
}
