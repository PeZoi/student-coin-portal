"use client";

import { useCallback, useEffect, useState } from "react";
import { wheelAudio, AUDIO_CONFIG } from "./wheelAudio";

export function useWheelAudio() {
  const [muted, setMutedState] = useState<boolean>(() => wheelAudio.isMuted());
  const [volume, setVolumeState] = useState<number>(() => wheelAudio.getVolume());

  // Kiểm tra prefers-reduced-motion
  const isReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Kích hoạt rung haptic an toàn
  const triggerHaptic = useCallback(
    (pattern: number | number[]) => {
      if (typeof window === "undefined" || isReducedMotion()) return;
      try {
        if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
          navigator.vibrate(pattern);
        }
      } catch {
        // Bỏ qua nếu haptic bị chặn
      }
    },
    [isReducedMotion]
  );

  // Mở khóa AudioContext trong handler click của người dùng
  const unlock = useCallback(() => {
    wheelAudio.unlock();
  }, []);

  // Bật / Tắt tiếng
  const toggleMute = useCallback(() => {
    const next = wheelAudio.toggleMute();
    setMutedState(next);
    return next;
  }, []);

  // Thay đổi âm lượng
  const setVolume = useCallback((val: number) => {
    wheelAudio.setVolume(val);
    setVolumeState(val);
  }, []);

  // Bắt đầu quay
  const playSpinStart = useCallback(() => {
    try {
      wheelAudio.playSpinStart();
    } catch {
      // An toàn: không làm đứt mạch game
    }
  }, []);

  // Cập nhật trong lúc quay: điều chỉnh tiếng vo vo và hỗ trợ tick
  const updateSpin = useCallback(
    (angularVelocity: number) => {
      try {
        // Chuẩn hóa velocity: 0 đến 1 (với vận tốc cực đại ~1500 deg/s)
        const ratio = Math.max(0, Math.min(1, Math.abs(angularVelocity) / 1500));
        wheelAudio.updateSpinLoopVelocity(ratio);
      } catch {
        // Bỏ qua
      }
    },
    []
  );

  // Phát tiếng tick chốt kèm haptic nếu quay chậm
  const playTick = useCallback(
    (speedRatio: number, isRebound = false) => {
      try {
        wheelAudio.playTick(speedRatio, isRebound);
        // Haptic: chỉ rung nhẹ 8ms khi tốc độ chậm lúc sắp dừng
        if (speedRatio < 0.35 && !isRebound) {
          triggerHaptic(8);
        }
      } catch {
        // Bỏ qua
      }
    },
    [triggerHaptic]
  );

  // Khi vòng dừng hẳn
  const playSpinEnd = useCallback(() => {
    try {
      wheelAudio.playSpinEnd();
    } catch {
      // Bỏ qua
    }
  }, []);

  // Nhận thưởng: MỘT âm thanh duy nhất cho mọi phần thưởng (không nhận tham số)
  const playReward = useCallback(() => {
    try {
      wheelAudio.playReward();
      // Haptic chiến thắng
      triggerHaptic([30, 40, 60]);
    } catch {
      // Bỏ qua
    }
  }, [triggerHaptic]);

  // Dừng âm thưởng khi đóng modal
  const stopReward = useCallback(() => {
    try {
      wheelAudio.stopReward();
    } catch {
      // Bỏ qua
    }
  }, []);

  // Âm thanh báo lỗi không đủ xu
  const playError = useCallback(() => {
    try {
      wheelAudio.playError();
      triggerHaptic([20, 30, 20]);
    } catch {
      // Bỏ qua
    }
  }, [triggerHaptic]);

  // Âm thanh click nút UI
  const playClick = useCallback(() => {
    try {
      wheelAudio.playClick();
    } catch {
      // Bỏ qua
    }
  }, []);

  // Quản lý visibilitychange và unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wheelAudio.stopAllSounds();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wheelAudio.stopAllSounds();
    };
  }, []);

  return {
    muted,
    toggleMute,
    volume,
    setVolume,
    unlock,
    playSpinStart,
    updateSpin,
    playTick,
    playSpinEnd,
    playReward,
    stopReward,
    playError,
    playClick,
    AUDIO_CONFIG,
  };
}
