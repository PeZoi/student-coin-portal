"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { WHEEL_CONSTANTS } from "@/constants/wheel";
import {
  WheelSlotItem,
  WheelGeneralSettings,
  WheelStatisticsData,
} from "../types";
import {
  DEFAULT_WHEEL_SETTINGS,
  EMPTY_WHEEL_STATISTICS,
} from "../constants/prizeConfig";
import {
  checkIsSlotModified,
  buildWheelCategories,
  buildTopFrequentItems,
  calculateTheoreticalRtp,
} from "../utils/wheelUtils";
import { InitialWheelConfigData } from "../services/wheelServerService";

interface UseWheelSlotsStateProps {
  serverConfig?: InitialWheelConfigData | null;
  modals: {
    slotToDelete: WheelSlotItem | null;
    setSlotToDelete: (slot: WheelSlotItem | null) => void;
    setEditingSlot: (slot: WheelSlotItem | null) => void;
    setIsAddModalOpen: (open: boolean) => void;
  };
}

/**
 * Micro-hook chuyên trách: Quản lý state cục bộ của danh sách ô & thiết lập kinh tế,
 * tính toán thống kê thời gian thực (Dynamic Stats), kiểm tra Dirty State và các thao tác Sắp xếp / Cân bằng
 */
export function useWheelSlotsState({
  serverConfig,
  modals,
}: UseWheelSlotsStateProps) {
  const [slots, setSlots] = useState<WheelSlotItem[]>(
    () => serverConfig?.slots || []
  );
  const [settings, setSettings] = useState<WheelGeneralSettings>(
    () => serverConfig?.settings || DEFAULT_WHEEL_SETTINGS
  );

  // Snapshot dữ liệu đã lưu để theo dõi trạng thái chưa lưu (Dirty Tracking)
  const [savedSlots, setSavedSlots] = useState<WheelSlotItem[]>(
    () => serverConfig?.slots || []
  );
  const [savedSettings, setSavedSettings] = useState<WheelGeneralSettings>(
    () => serverConfig?.settings || DEFAULT_WHEEL_SETTINGS
  );

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Tính trạng thái thay đổi chưa lưu
  const isSlotsDirty = useMemo(() => {
    if (slots.length !== savedSlots.length) return true;
    return slots.some((s) => checkIsSlotModified(s, savedSlots));
  }, [slots, savedSlots]);

  const isEconomyDirty = useMemo(() => {
    return (
      settings.spin_cost !== savedSettings.spin_cost ||
      settings.allow_free_spin !== savedSettings.allow_free_spin ||
      settings.daily_free_spins !== savedSettings.daily_free_spins ||
      settings.is_maintenance !== savedSettings.is_maintenance
    );
  }, [settings, savedSettings]);

  const hasUnsavedChanges = isSlotsDirty || isEconomyDirty;

  // Cảnh báo khi người dùng rời khỏi trang hoặc reload nếu có thay đổi chưa lưu
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || target.target === "_blank") return;
      if (href === window.location.pathname) return;

      const confirmed = window.confirm(
        "⚠️ Bạn có thay đổi cấu hình Vòng Quay chưa được lưu!\n\nNếu rời khỏi trang bây giờ, mọi thay đổi (thứ tự ô, tỷ lệ xác suất, thông tin ô) sẽ bị mất hoàn toàn.\n\nBạn có chắc chắn muốn rời đi mà không lưu không?"
      );

      if (!confirmed) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [hasUnsavedChanges]);

  // Tính tổng trọng số các ô đang active
  const activeSlots = useMemo(() => slots.filter((s) => s.is_active), [slots]);
  const totalWeight = useMemo(
    () => activeSlots.reduce((sum, s) => sum + s.probability_weight, 0),
    [activeSlots]
  );
  const isBalanced = totalWeight === WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT;

  // Tính toán dữ liệu thống kê phân bổ theo thời gian thực
  const dynamicStats: WheelStatisticsData = useMemo(() => {
    const baseStats = serverConfig?.stats || EMPTY_WHEEL_STATISTICS;
    const totalHistoricalSpins = baseStats.total_historical_spins ?? 0;

    const rtpRate =
      totalHistoricalSpins === 0
        ? calculateTheoreticalRtp(activeSlots, totalWeight, settings.spin_cost)
        : baseStats.rtp_rate;

    return {
      ...baseStats,
      rtp_rate: rtpRate,
      total_active_slots: activeSlots.length,
      total_weight: totalWeight,
      is_weight_balanced: isBalanced,
      categories: buildWheelCategories(activeSlots, totalWeight),
      top_frequent_items: buildTopFrequentItems(
        slots,
        totalWeight,
        totalHistoricalSpins
      ),
    };
  }, [
    activeSlots,
    totalWeight,
    isBalanced,
    slots,
    settings.spin_cost,
    serverConfig?.stats,
  ]);

  // Hành động 1A: Chia đều phẳng 100% cho tất cả các ô đang kích hoạt
  const handleEqualize = useCallback(() => {
    if (activeSlots.length === 0) return;

    const n = activeSlots.length;
    const targetTotal = WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT;
    const baseWeight = Math.floor(targetTotal / n);
    const remainder = targetTotal - baseWeight * n;

    let activeIndex = 0;
    const equalizedSlots = slots.map((slot) => {
      if (!slot.is_active) return slot;

      const extra = activeIndex < remainder ? 1 : 0;
      activeIndex++;

      return {
        ...slot,
        probability_weight: baseWeight + extra,
        is_locked: false,
      };
    });

    setSlots(equalizedSlots);
    toast.success(
      `Đã chia đều phẳng tỷ lệ cho tất cả ${n} ô (mỗi ô ~${(targetTotal / n).toFixed(1)}%)!`,
      {
        description:
          "Tất cả các ô hiện có xác suất trúng thưởng xấp xỉ bằng nhau.",
      }
    );
  }, [activeSlots.length, slots]);

  // Hành động 1B: Tự động cân bằng tổng trọng số về đúng 100%
  const handleAutoBalance = useCallback(() => {
    if (activeSlots.length === 0) return;

    const targetTotal = WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT;
    const lockedSlots = activeSlots.filter((s) => s.is_locked);
    const unlockedSlots = activeSlots.filter((s) => !s.is_locked);

    const lockedTotal = lockedSlots.reduce(
      (sum, s) => sum + s.probability_weight,
      0
    );

    if (lockedTotal >= targetTotal) {
      toast.error(
        `Không thể tự động cân bằng! Tổng các ô đã khóa đã là ${lockedTotal}% (>= ${targetTotal}%). Vui lòng giảm bớt hoặc mở khóa bớt ô.`,
        { duration: 5000 }
      );
      return;
    }

    if (unlockedSlots.length === 0) {
      toast.warning(
        "Tất cả các ô đều đang bị khóa cố định! Vui lòng mở khóa ít nhất 1 ô để hệ thống tự động bù trừ tỷ lệ."
      );
      return;
    }

    const remainingWeight = targetTotal - lockedTotal;
    const unlockedCurrentTotal = unlockedSlots.reduce(
      (sum, s) => sum + s.probability_weight,
      0
    );

    let allocatedUnlockedWeight = 0;
    const balancedSlots = slots.map((slot) => {
      if (!slot.is_active) return slot;
      if (slot.is_locked) return slot;

      let newWeight: number = WHEEL_CONSTANTS.MIN_SLOT_WEIGHT;
      if (unlockedCurrentTotal > 0) {
        newWeight = Math.max(
          WHEEL_CONSTANTS.MIN_SLOT_WEIGHT,
          Math.round(
            (slot.probability_weight / unlockedCurrentTotal) * remainingWeight
          )
        );
      } else {
        newWeight = Math.max(
          WHEEL_CONSTANTS.MIN_SLOT_WEIGHT,
          Math.floor(remainingWeight / unlockedSlots.length)
        );
      }

      allocatedUnlockedWeight += newWeight;
      return {
        ...slot,
        probability_weight: newWeight,
      };
    });

    const diff = remainingWeight - allocatedUnlockedWeight;
    if (diff !== 0) {
      const targetIndex = balancedSlots.findIndex(
        (s) => s.is_active && !s.is_locked
      );
      if (targetIndex !== -1) {
        balancedSlots[targetIndex].probability_weight += diff;
      }
    }

    setSlots(balancedSlots);
    toast.success(
      lockedSlots.length > 0
        ? `Đã giữ nguyên ${lockedSlots.length} ô khóa (${lockedTotal}%) và tự động cân bằng ${unlockedSlots.length} ô còn lại về chuẩn ${targetTotal}%!`
        : `Đã tự động chuẩn hóa tỷ lệ các ô về đúng ${targetTotal}%!`
    );
  }, [activeSlots, slots]);

  // Hành động 1C: Bật/tắt khóa tỷ lệ của 1 ô
  const handleToggleLock = useCallback((id: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== id) return slot;
        const nextLockState = !slot.is_locked;
        toast.info(
          nextLockState
            ? `🔒 Đã cố định tỷ lệ ô "${slot.label}" ở mức ${slot.probability_weight}%`
            : `🔓 Đã mở khóa tỷ lệ ô "${slot.label}"`,
          { id: `lock-${id}` }
        );
        return { ...slot, is_locked: nextLockState };
      })
    );
  }, []);

  // Hành động 2: Bật/tắt kích hoạt 1 ô
  const handleToggleActive = useCallback((id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
    toast.info("Đã thay đổi trạng thái hiển thị của ô trên vòng quay!");
  }, []);

  // Hành động 3: Mở modal xác nhận xóa 1 ô phần thưởng
  const handleDeleteSlot = useCallback(
    (id: string) => {
      const target = slots.find((s) => s.id === id);
      if (target) {
        modals.setSlotToDelete(target);
      }
    },
    [slots, modals]
  );

  // Thực thi xóa ô sau khi người dùng bấm Xác nhận trong Modal
  const handleConfirmDeleteSlot = useCallback(() => {
    const slotToDelete = modals.slotToDelete;
    if (!slotToDelete) return;

    if (slots.length <= WHEEL_CONSTANTS.MIN_SLOTS) {
      toast.error(
        `Vòng quay cần có tối thiểu ${WHEEL_CONSTANTS.MIN_SLOTS} ô phần thưởng để đảm bảo tính mỹ thuật!`
      );
      modals.setSlotToDelete(null);
      return;
    }

    const id = slotToDelete.id;
    const deletedLabel = slotToDelete.label;

    setSlots((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, idx) => ({
        ...s,
        slot_order: idx + 1,
      }));
    });

    if (selectedSlotId === id) {
      setSelectedSlotId(null);
    }

    modals.setSlotToDelete(null);
    toast.success(
      `Đã xóa ô "${deletedLabel}"! Nhấn "Lưu cơ cấu ô" để cập nhật CSDL.`
    );
  }, [modals, slots.length, selectedSlotId]);

  // Hành động 3B: Đặt lại cơ cấu ô về trạng thái đã lưu gần nhất
  const handleResetSlots = useCallback(() => {
    if (!isSlotsDirty) return;
    setSlots(savedSlots.map((s) => ({ ...s })));
    toast.info("Đã hủy thay đổi và khôi phục lại cơ cấu ô ban đầu!", {
      id: "reset-wheel-slots",
    });
  }, [isSlotsDirty, savedSlots]);

  // Hành động 3C: Đặt lại thiết lập kinh tế về trạng thái đã lưu gần nhất
  const handleResetEconomy = useCallback(() => {
    if (!isEconomyDirty) return;
    setSettings({ ...savedSettings });
    toast.info("Đã khôi phục lại thiết lập chi phí lượt quay ban đầu!", {
      id: "reset-wheel-economy",
    });
  }, [isEconomyDirty, savedSettings]);

  // Hành động 3D: Đặt lại toàn bộ trang
  const handleResetAll = useCallback(() => {
    if (!hasUnsavedChanges) return;
    setSlots(savedSlots.map((s) => ({ ...s })));
    setSettings({ ...savedSettings });
    toast.info(
      "Đã đặt lại toàn bộ cấu hình về trạng thái đã lưu gần nhất!",
      { id: "reset-wheel-all" }
    );
  }, [hasUnsavedChanges, savedSlots, savedSettings]);

  // Hành động 4: Lưu thông tin ô từ Modal Thêm mới / Chỉnh sửa vào state cục bộ
  const handleSaveSlot = useCallback(
    (updatedSlot: WheelSlotItem) => {
      let toastMessage = "";
      let toastId = "";

      setSlots((prev) => {
        const exists = prev.some((s) => s.id === updatedSlot.id);
        const desiredIdx = Math.max(
          0,
          Math.min(
            (updatedSlot.slot_order || prev.length + 1) - 1,
            exists ? prev.length - 1 : prev.length
          )
        );

        if (exists) {
          const currentIdx = prev.findIndex((s) => s.id === updatedSlot.id);
          const listWithoutCurrent = prev.filter(
            (s) => s.id !== updatedSlot.id
          );
          listWithoutCurrent.splice(desiredIdx, 0, updatedSlot);

          const reindexed = listWithoutCurrent.map((s, idx) => ({
            ...s,
            slot_order: idx + 1,
          }));

          toastId = `save-slot-${updatedSlot.id}`;
          toastMessage =
            currentIdx !== desiredIdx
              ? `Đã cập nhật và chuyển ô "${updatedSlot.label}" sang vị trí #${desiredIdx + 1}! (Nhớ bấm "Lưu cơ cấu ô")`
              : `Đã cập nhật thông tin ô "${updatedSlot.label}"! (Nhớ bấm "Lưu cơ cấu ô")`;

          return reindexed;
        } else {
          const updatedList = [...prev];
          updatedList.splice(desiredIdx, 0, updatedSlot);

          const reindexed = updatedList.map((s, idx) => ({
            ...s,
            slot_order: idx + 1,
          }));

          toastId = `add-slot-${updatedSlot.id}`;
          toastMessage = `Đã thêm ô mới "${updatedSlot.label}" vào vị trí #${desiredIdx + 1}! (Nhớ bấm "Lưu cơ cấu ô")`;

          return reindexed;
        }
      });

      if (toastMessage) {
        toast.success(toastMessage, { id: toastId });
      }

      modals.setEditingSlot(null);
      modals.setIsAddModalOpen(false);
    },
    [modals]
  );

  // Hành động 7: Kéo thả sắp xếp ô
  const handleReorderSlots = useCallback(
    (
      draggedId: string,
      targetId: string,
      mode: "insert-before" | "insert-after" | "swap" = "swap"
    ) => {
      if (draggedId === targetId) return;

      setSlots((prev) => {
        const fromIndex = prev.findIndex((s) => s.id === draggedId);
        const toIndex = prev.findIndex((s) => s.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return prev;

        const updated = [...prev];

        if (mode === "swap") {
          const temp = updated[fromIndex];
          updated[fromIndex] = updated[toIndex];
          updated[toIndex] = temp;
        } else {
          const [movedItem] = updated.splice(fromIndex, 1);
          const targetIndexInRemaining = updated.findIndex(
            (s) => s.id === targetId
          );
          if (targetIndexInRemaining === -1) return prev;

          const insertIndex =
            mode === "insert-before"
              ? targetIndexInRemaining
              : targetIndexInRemaining + 1;

          updated.splice(insertIndex, 0, movedItem);
        }

        return updated.map((s, idx) => ({
          ...s,
          slot_order: idx + 1,
        }));
      });

      const slotA = slots.find((s) => s.id === draggedId);
      const slotB = slots.find((s) => s.id === targetId);
      if (slotA && slotB) {
        if (mode === "swap") {
          toast.info(
            `Đã hoán đổi vị trí giữa ô #${slotA.slot_order} và ô #${slotB.slot_order}`,
            { id: `reorder-${draggedId}` }
          );
        } else {
          toast.info(`Đã chèn ô "${slotA.label}" vào giữa`, {
            id: `reorder-${draggedId}`,
          });
        }
      }
    },
    [slots]
  );

  // Hành động 8: Di chuyển ô trực tiếp đến vị trí số thứ tự mong muốn
  const handleMoveSlot = useCallback((id: string, newOrder: number) => {
    let movedItemLabel = "";

    setSlots((prev) => {
      const fromIndex = prev.findIndex((s) => s.id === id);
      if (fromIndex === -1) return prev;

      const toIndex = Math.max(0, Math.min(newOrder - 1, prev.length - 1));
      if (fromIndex === toIndex) return prev;

      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);

      movedItemLabel = movedItem.label;

      return updated.map((s, idx) => ({
        ...s,
        slot_order: idx + 1,
      }));
    });

    if (movedItemLabel) {
      toast.info(`Đã chèn ô "${movedItemLabel}" vào vị trí #${newOrder}!`, {
        id: `move-slot-${id}`,
      });
    }
  }, []);

  return {
    slots,
    setSlots,
    settings,
    setSettings,
    savedSlots,
    setSavedSlots,
    savedSettings,
    setSavedSettings,
    selectedSlotId,
    setSelectedSlotId,
    isSlotsDirty,
    isEconomyDirty,
    hasUnsavedChanges,
    totalWeight,
    isBalanced,
    dynamicStats,
    handleEqualize,
    handleAutoBalance,
    handleToggleLock,
    handleToggleActive,
    handleDeleteSlot,
    handleConfirmDeleteSlot,
    handleResetSlots,
    handleResetEconomy,
    handleResetAll,
    handleSaveSlot,
    handleReorderSlots,
    handleMoveSlot,
  };
}
