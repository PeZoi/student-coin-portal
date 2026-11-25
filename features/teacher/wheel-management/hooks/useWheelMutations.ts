"use client";

import { useState, useCallback } from "react";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import { WheelSlotItem, WheelGeneralSettings } from "../types";
import { InitialWheelConfigData } from "../services/wheelServerService";
import { wheelService } from "../services/wheelService";

interface UseWheelMutationsProps {
  slots: WheelSlotItem[];
  settings: WheelGeneralSettings;
  isBalanced: boolean;
  totalWeight: number;
  setSavedSlots: React.Dispatch<React.SetStateAction<WheelSlotItem[]>>;
  setSavedSettings: React.Dispatch<React.SetStateAction<WheelGeneralSettings>>;
  mutate: KeyedMutator<InitialWheelConfigData | null>;
}

/**
 * Micro-hook chuyên trách: Gọi API lưu cấu hình cơ cấu ô & thiết lập kinh tế xuống CSDL và đồng bộ SWR Cache
 */
export function useWheelMutations({
  slots,
  settings,
  isBalanced,
  totalWeight,
  setSavedSlots,
  setSavedSettings,
  mutate,
}: UseWheelMutationsProps) {
  const [isSavingSlots, setIsSavingSlots] = useState(false);
  const [isSavingEconomy, setIsSavingEconomy] = useState(false);

  // Lưu thiết lập kinh tế vào CSDL
  const handleSaveEconomy = useCallback(async () => {
    setIsSavingEconomy(true);
    const toastId = toast.loading("Đang lưu thiết lập kinh tế vào CSDL...");
    try {
      await wheelService.saveEconomy(settings);
      setSavedSettings({ ...settings });
      await mutate();
      toast.success("Đã lưu cấu hình vòng quay thành công!", {
        id: toastId,
        description: `Phí quay: ${settings.spin_cost} xu / lượt`,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Lỗi lưu cấu hình: ${error.message}`, { id: toastId });
    } finally {
      setIsSavingEconomy(false);
    }
  }, [settings, setSavedSettings, mutate]);

  // Lưu cơ cấu các ô phần thưởng vào CSDL
  const handleSaveSlots = useCallback(async () => {
    if (!isBalanced) {
      toast.error(
        `Chưa thể lưu cơ cấu ô! Tổng tỷ lệ hiện là ${totalWeight}%. Vui lòng nhấn "Cân bằng" hoặc "Chia đều" trước khi lưu.`,
        { duration: 4000 }
      );
      return;
    }

    setIsSavingSlots(true);
    const toastId = toast.loading("Đang lưu cơ cấu ô phần thưởng vào CSDL...");
    try {
      await wheelService.saveSlots(slots);
      setSavedSlots([...slots]);
      await mutate();
      toast.success("Đã lưu cơ cấu các ô phần thưởng thành công vào CSDL!", {
        id: toastId,
        description: `Đã lưu ${slots.length} ô phần thưởng với chuẩn 100% tỷ lệ xác suất.`,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Lỗi lưu CSDL: ${error.message}`, { id: toastId });
    } finally {
      setIsSavingSlots(false);
    }
  }, [isBalanced, totalWeight, slots, setSavedSlots, mutate]);

  return {
    isSavingSlots,
    isSavingEconomy,
    handleSaveEconomy,
    handleSaveSlots,
  };
}
