"use client";

import useSWR from "swr";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { InitialWheelConfigData } from "../services/wheelServerService";
import { wheelService } from "../services/wheelService";

// Import 3 Micro-Hooks chuyên trách (Đồng bộ kiến trúc với class-management, student-management, teacher-management)
import { useWheelModals } from "./useWheelModals";
import { useWheelSlotsState } from "./useWheelSlotsState";
import { useWheelMutations } from "./useWheelMutations";

/**
 * Root Orchestrator Hook: Quản lý toàn bộ tính năng Cấu hình Vòng quay
 * - Đóng vai trò "Nhạc trưởng" điều phối SWR và các Micro-Hooks chuyên biệt
 */
export function useWheelConfig(initialData?: InitialWheelConfigData) {
  // 1. Quản lý dữ liệu cấu hình từ Server qua SWR (Quy tắc 9)
  const { data: swrData, mutate } = useSWR(
    CACHE_KEYS.WHEEL.CONFIG,
    () => wheelService.getConfig(),
    {
      fallbackData: initialData ?? null,
      revalidateOnMount: initialData ? false : true,
      revalidateIfStale: !initialData,
      revalidateOnFocus: false,
    }
  );

  const serverConfig = swrData ?? initialData;

  // 2. Micro-hook: Quản lý đóng/mở & dữ liệu của các Modals
  const modals = useWheelModals();

  // 3. Micro-hook: Quản lý state danh sách ô, thiết lập kinh tế, thống kê động & kéo thả/cân bằng
  const slotsState = useWheelSlotsState({
    serverConfig,
    modals,
  });

  // 4. Micro-hook: Tương tác API lưu CSDL & đồng bộ SWR Cache
  const mutations = useWheelMutations({
    slots: slotsState.slots,
    settings: slotsState.settings,
    isBalanced: slotsState.isBalanced,
    totalWeight: slotsState.totalWeight,
    setSavedSlots: slotsState.setSavedSlots,
    setSavedSettings: slotsState.setSavedSettings,
    mutate,
  });

  return {
    initialSpinHistory: serverConfig?.initialSpinHistory,
    ...modals,
    ...slotsState,
    ...mutations,
  };
}
