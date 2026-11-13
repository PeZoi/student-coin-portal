"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  WheelSlotItem,
  WheelGeneralSettings,
  WheelStatisticsData,
  WheelPrizeType,
  WheelCategoryDistribution,
} from "../types";
import {
  defaultWheelSettings,
  initialMockStatistics,
} from "../data/mockWheelConfig";
import { InitialWheelConfigData } from "../services/wheelServerService";
import { wheelService } from "../services/wheelService";
import { WheelConfigHeader } from "./WheelConfigHeader";
import { WheelConfigStatsKPI } from "./WheelConfigStatsKPI";
import { WheelConfigAnalytics } from "./WheelConfigAnalytics";
import { WheelEconomySettingsBar } from "./WheelEconomySettingsBar";
import { WheelSlotsGrid } from "./WheelSlotsGrid";
import { EditWheelSlotModal } from "./modals/EditWheelSlotModal";
import { WheelSimulatorModal } from "./modals/WheelSimulatorModal";
import { ConfirmBalanceModal, BalanceMode } from "./modals/ConfirmBalanceModal";
import { ConfirmDeleteSlotModal } from "./modals/ConfirmDeleteSlotModal";

interface WheelConfigViewProps {
  initialData?: InitialWheelConfigData;
}

/**
 * Kiểm tra xem một ô có sự thay đổi so với bản đã lưu hay không
 */
function checkIsSlotModified(slot: WheelSlotItem, savedSlots: WheelSlotItem[]): boolean {
  const original = savedSlots.find((s) => s.id === slot.id);
  if (!original) return true; // Ô mới tạo
  return (
    original.slot_order !== slot.slot_order ||
    original.label !== slot.label ||
    original.short_label !== slot.short_label ||
    original.prize_type !== slot.prize_type ||
    original.reward_coins !== slot.reward_coins ||
    original.reward_free_spins !== slot.reward_free_spins ||
    original.probability_weight !== slot.probability_weight ||
    original.is_active !== slot.is_active ||
    !!original.is_locked !== !!slot.is_locked
  );
}

export function WheelConfigView({ initialData }: WheelConfigViewProps) {
  const [slots, setSlots] = useState<WheelSlotItem[]>(
    initialData?.slots || []
  );
  const [settings, setSettings] = useState<WheelGeneralSettings>(
    initialData?.settings || defaultWheelSettings
  );

  // Snapshot dữ liệu đã lưu để theo dõi trạng thái chưa lưu (Dirty Tracking)
  const [savedSlots, setSavedSlots] = useState<WheelSlotItem[]>(() =>
    initialData?.slots || []
  );
  const [savedSettings, setSavedSettings] = useState<WheelGeneralSettings>(() =>
    initialData?.settings || defaultWheelSettings
  );

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Trạng thái lưu API
  const [isSavingSlots, setIsSavingSlots] = useState(false);
  const [isSavingEconomy, setIsSavingEconomy] = useState(false);

  // State Modal
  const [editingSlot, setEditingSlot] = useState<WheelSlotItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [confirmBalanceMode, setConfirmBalanceMode] = useState<BalanceMode | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<WheelSlotItem | null>(null);

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

    // 1. Cảnh báo khi đóng tab, reload, F5 trình duyệt
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    // 2. Cảnh báo khi click vào link chuyển trang nội bộ (Next.js Link / thẻ a)
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
  const isBalanced = totalWeight === 100;

  // Tính toán dữ liệu thống kê phân bổ theo thời gian thực (Derived Statistics)
  const dynamicStats: WheelStatisticsData = useMemo(() => {
    // 5 nhóm giải thưởng
    const categoryMap: Record<
      WheelPrizeType,
      { count: number; totalWeight: number; color: string; label: string; badgeBg: string; badgeText: string }
    > = {
      coin: {
        count: 0,
        totalWeight: 0,
        color: "#F59E0B",
        label: "Cộng Xu Thưởng",
        badgeBg: "bg-amber-50 border-amber-200 text-amber-800",
        badgeText: "Cộng Xu",
      },
      deduct_coin: {
        count: 0,
        totalWeight: 0,
        color: "#EF4444",
        label: "Bị Trừ Xu",
        badgeBg: "bg-rose-50 border-rose-200 text-rose-800",
        badgeText: "Bị Trừ Xu",
      },
      luck: {
        count: 0,
        totalWeight: 0,
        color: "#64748B",
        label: "Chúc May Mắn",
        badgeBg: "bg-slate-100 border-slate-200 text-slate-700",
        badgeText: "May Mắn",
      },
      free_spin: {
        count: 0,
        totalWeight: 0,
        color: "#10B981",
        label: "Thêm Lượt Quay",
        badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
        badgeText: "Free Spin",
      },
      gift: {
        count: 0,
        totalWeight: 0,
        color: "#8B5CF6",
        label: "Quà Tặng Bí Ẩn",
        badgeBg: "bg-purple-50 border-purple-200 text-purple-800",
        badgeText: "Hộp quà",
      },
    };

    activeSlots.forEach((slot) => {
      if (categoryMap[slot.prize_type]) {
        categoryMap[slot.prize_type].count += 1;
        categoryMap[slot.prize_type].totalWeight += slot.probability_weight;
      }
    });

    const categories: WheelCategoryDistribution[] = (
      Object.keys(categoryMap) as WheelPrizeType[]
    ).map((type) => {
      const val = categoryMap[type];
      return {
        type,
        label: val.label,
        color: val.color,
        badgeBg: val.badgeBg,
        badgeText: val.badgeText,
        total_weight: val.totalWeight,
        percentage:
          totalWeight > 0 ? Math.round((val.totalWeight / totalWeight) * 100) : 0,
        slot_count: val.count,
      };
    });

    return {
      ...initialMockStatistics,
      total_active_slots: activeSlots.length,
      total_weight: totalWeight,
      is_weight_balanced: isBalanced,
      categories,
    };
  }, [activeSlots, totalWeight, isBalanced]);

  // Hành động 1A: Chia đều phẳng 100% cho tất cả các ô đang kích hoạt (bằng phẳng hết)
  const handleEqualize = () => {
    if (activeSlots.length === 0) return;

    const n = activeSlots.length;
    const baseWeight = Math.floor(100 / n);
    const remainder = 100 - baseWeight * n;

    let activeIndex = 0;
    const equalizedSlots = slots.map((slot) => {
      if (!slot.is_active) return slot;

      // Chia đều baseWeight, phân bổ phần dư remainder cho các ô đầu tiên
      const extra = activeIndex < remainder ? 1 : 0;
      activeIndex++;

      return {
        ...slot,
        probability_weight: baseWeight + extra,
        is_locked: false, // Reset khóa khi chia đều phẳng
      };
    });

    setSlots(equalizedSlots);
    toast.success(
      `Đã chia đều phẳng tỷ lệ cho tất cả ${n} ô (mỗi ô ~${(100 / n).toFixed(1)}%)!`,
      {
        description: "Tất cả các ô hiện có xác suất trúng thưởng xấp xỉ bằng nhau.",
      }
    );
  };

  // Hành động 1B: Tự động cân bằng tổng trọng số về đúng 100% (Ưu tiên giữ nguyên các ô ĐÃ KHÓA 🔒)
  const handleAutoBalance = () => {
    if (activeSlots.length === 0) return;

    const lockedSlots = activeSlots.filter((s) => s.is_locked);
    const unlockedSlots = activeSlots.filter((s) => !s.is_locked);

    // Tính tổng trọng số của các ô đã khóa
    const lockedTotal = lockedSlots.reduce((sum, s) => sum + s.probability_weight, 0);

    // Kiểm tra điều kiện các ô khóa
    if (lockedTotal >= 100) {
      toast.error(
        `Không thể tự động cân bằng! Tổng các ô đã khóa đã là ${lockedTotal}% (>= 100%). Vui lòng giảm bớt hoặc mở khóa bớt ô.`,
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

    const remainingWeight = 100 - lockedTotal;
    const unlockedCurrentTotal = unlockedSlots.reduce((sum, s) => sum + s.probability_weight, 0);

    let allocatedUnlockedWeight = 0;
    const balancedSlots = slots.map((slot) => {
      if (!slot.is_active) return slot;
      if (slot.is_locked) return slot; // Giữ nguyên 100% ô đã khóa

      let newWeight = 1;
      if (unlockedCurrentTotal > 0) {
        newWeight = Math.max(1, Math.round((slot.probability_weight / unlockedCurrentTotal) * remainingWeight));
      } else {
        newWeight = Math.max(1, Math.floor(remainingWeight / unlockedSlots.length));
      }

      allocatedUnlockedWeight += newWeight;
      return {
        ...slot,
        probability_weight: newWeight,
      };
    });

    // Bù sai số làm tròn (rounding diff) vào ô chưa khóa đầu tiên
    const diff = remainingWeight - allocatedUnlockedWeight;
    if (diff !== 0) {
      const targetIndex = balancedSlots.findIndex((s) => s.is_active && !s.is_locked);
      if (targetIndex !== -1) {
        balancedSlots[targetIndex].probability_weight += diff;
      }
    }

    setSlots(balancedSlots);

    if (lockedSlots.length > 0) {
      toast.success("Đã tự động cân bằng về chuẩn 100%!", {
        description: `Đã giữ nguyên ${lockedSlots.length} ô khóa cố định và tự động cân đối ${unlockedSlots.length} ô còn lại.`,
      });
    } else {
      toast.success("Đã tự động cân bằng toàn bộ các ô về chuẩn 100%!");
    }
  };

  // Hành động 1C: Bật / Tắt trạng thái khóa tỷ lệ của 1 ô
  const handleToggleLock = (id: string) => {
    const target = slots.find((s) => s.id === id);
    if (!target) return;

    const nextLock = !target.is_locked;
    if (nextLock) {
      toast.success(
        `Đã KHÓA cố định ô #${target.slot_order} (${target.short_label}: ${target.probability_weight}%)`,
        {
          id: `toggle-lock-${id}`,
          description: "Ô này sẽ được giữ nguyên tỷ lệ khi bạn nhấn 'Tự động cân bằng'.",
        }
      );
    } else {
      toast.info(`Đã MỞ KHÓA ô #${target.slot_order} (${target.short_label})`, {
        id: `toggle-lock-${id}`,
        description: "Ô này sẽ tham gia tự động cân bằng cùng các ô khác.",
      });
    }

    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, is_locked: nextLock } : slot))
    );
  };

  // Hành động 2: Bật / Tắt trạng thái kích hoạt của 1 ô
  const handleToggleActive = (id: string) => {
    const target = slots.find((s) => s.id === id);
    if (!target) return;

    const nextActive = !target.is_active;
    toast(
      nextActive ? `Đã kích hoạt ô #${target.slot_order}` : `Đã tạm ẩn ô #${target.slot_order}`,
      { id: `toggle-active-${id}` }
    );

    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, is_active: nextActive } : slot))
    );
  };

  // Hành động 3: Chuẩn bị xóa một ô phần thưởng (mở popup xác nhận)
  const handleDeleteSlot = (id: string) => {
    const target = slots.find((s) => s.id === id);
    if (!target) return;

    if (slots.length <= 4) {
      toast.error("Vòng quay cần duy trì tối thiểu 4 ô để đảm bảo tính mỹ thuật!");
      return;
    }

    setSlotToDelete(target);
  };

  // Xác nhận xóa ô phần thưởng từ popup modal
  const handleConfirmDeleteSlot = () => {
    if (!slotToDelete) return;
    const id = slotToDelete.id;

    setSlots((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      return remaining.map((s, idx) => ({
        ...s,
        slot_order: idx + 1,
      }));
    });

    toast.success(`Đã xóa ô "${slotToDelete.label}" khỏi vòng quay.`, {
      id: `delete-slot-${id}`,
    });
    setSlotToDelete(null);
  };

  // Khôi phục toàn bộ các ô về trạng thái đã lưu ban đầu
  const handleResetSlots = () => {
    setSlots([...savedSlots]);
    toast.info("Đã khôi phục toàn bộ cơ cấu ô về trạng thái đã lưu ban đầu!", {
      id: "reset-slots",
    });
  };

  // Khôi phục lại thiết lập kinh tế đã lưu ban đầu
  const handleResetEconomy = () => {
    setSettings(savedSettings);
    toast.info("Đã khôi phục cấu hình kinh tế về trạng thái ban đầu!", {
      id: "reset-economy",
    });
  };

  // Khôi phục toàn bộ cấu hình (cả cơ cấu ô và thiết lập kinh tế) về trạng thái đã lưu ban đầu
  const handleResetAll = () => {
    setSlots([...savedSlots]);
    setSettings(savedSettings);
    toast.info("Đã khôi phục toàn bộ cấu hình vòng quay về trạng thái ban đầu!", {
      id: "reset-all",
    });
  };

  // Hành động 4: Lưu chỉnh sửa hoặc chèn ô mới vào vị trí chỉ định
  const handleSaveSlot = (slotData: Omit<WheelSlotItem, "stats">) => {
    let toastMessage = "";
    let toastId = "";

    setSlots((prev) => {
      const isExisting = prev.some((s) => s.id === slotData.id);

      if (isExisting) {
        // Tách ô cần sửa ra khỏi danh sách
        const currentSlot = prev.find((s) => s.id === slotData.id)!;
        const withoutCurrent = prev.filter((s) => s.id !== slotData.id);

        const updatedSlot: WheelSlotItem = {
          ...currentSlot,
          ...slotData,
        };

        // Chèn vào vị trí đích được chọn (1-based index)
        const targetIndex = Math.max(0, Math.min(slotData.slot_order - 1, withoutCurrent.length));
        withoutCurrent.splice(targetIndex, 0, updatedSlot);

        // Đánh lại số thứ tự slot_order lần lượt 1..N
        const reindexed = withoutCurrent.map((s, idx) => ({
          ...s,
          slot_order: idx + 1,
        }));

        toastMessage = `Đã cập nhật ô #${updatedSlot.slot_order}: "${updatedSlot.label}"!`;
        toastId = `save-slot-${updatedSlot.id}`;
        return reindexed;
      } else {
        // Thêm mới ô và chèn vào vị trí chỉ định
        const newSlot: WheelSlotItem = {
          ...slotData,
          stats: {
            total_hits: 0,
            actual_rate: 0,
          },
        };

        const targetIndex = Math.max(0, Math.min(slotData.slot_order - 1, prev.length));
        const newSlots = [...prev];
        newSlots.splice(targetIndex, 0, newSlot);

        const reindexed = newSlots.map((s, idx) => ({
          ...s,
          slot_order: idx + 1,
        }));

        toastMessage = `Đã chèn mới ô "${newSlot.label}" vào vị trí #${newSlot.slot_order} trên vòng quay!`;
        toastId = `add-slot-${newSlot.id}`;
        return reindexed;
      }
    });

    if (toastMessage) {
      toast.success(toastMessage, { id: toastId });
    }

    setEditingSlot(null);
    setIsAddModalOpen(false);
  };

  // Hành động 5: Lưu thiết lập kinh tế vào CSDL
  const handleSaveEconomy = async () => {
    setIsSavingEconomy(true);
    const toastId = toast.loading("Đang lưu thiết lập kinh tế vào CSDL...");
    try {
      await wheelService.saveEconomy(settings);
      setSavedSettings({ ...settings });
      toast.success("Đã lưu cấu hình vòng quay thành công!", {
        id: toastId,
        description: `Phí quay: ${settings.spin_cost} xu • Free spin: ${
          settings.allow_free_spin ? `${settings.daily_free_spins} lượt/ngày` : "Tắt"
        }`,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Lỗi lưu cấu hình: ${error.message}`, { id: toastId });
    } finally {
      setIsSavingEconomy(false);
    }
  };

  // Hành động 6: Lưu cơ cấu các ô phần thưởng vào CSDL
  const handleSaveSlots = async () => {
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
  };

  // Hành động 7: Kéo thả sắp xếp ô (Thả vào khoảng cách giữa 2 ô: Chèn vào giữa; Thả vào thân ô: Swap đổi chỗ)
  const handleReorderSlots = (
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
        // 1. Thả trực tiếp vào thân ô: Hoán đổi (SWAP) 2 ô với nhau
        const temp = updated[fromIndex];
        updated[fromIndex] = updated[toIndex];
        updated[toIndex] = temp;
      } else {
        // 2. Thả vào khoảng cách giữa 2 ô: Chèn vào giữa
        const [movedItem] = updated.splice(fromIndex, 1);
        const targetIndexInRemaining = updated.findIndex((s) => s.id === targetId);
        if (targetIndexInRemaining === -1) return prev;

        const insertIndex =
          mode === "insert-before"
            ? targetIndexInRemaining
            : targetIndexInRemaining + 1;

        updated.splice(insertIndex, 0, movedItem);
      }

      // Cập nhật lại số thứ tự slot_order lần lượt từ 1 đến N
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
        toast.info(
          `Đã chèn ô "${slotA.label}" vào giữa`,
          { id: `reorder-${draggedId}` }
        );
      }
    }
  };

  // Hành động 8: Di chuyển ô trực tiếp đến vị trí số thứ tự mong muốn (Chọn từ menu nhanh)
  const handleMoveSlot = (id: string, newOrder: number) => {
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

      const reindexed = updated.map((s, idx) => ({
        ...s,
        slot_order: idx + 1,
      }));

      return reindexed;
    });

    if (movedItemLabel) {
      toast.info(`Đã chèn ô "${movedItemLabel}" vào vị trí #${newOrder}!`, {
        id: `move-slot-${id}`,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Trang & Trạng thái cân bằng */}
      <WheelConfigHeader
        totalWeight={totalWeight}
        isBalanced={isBalanced}
        hasUnsavedChanges={hasUnsavedChanges}
        onResetAll={handleResetAll}
      />

      {/* 2. Thẻ KPI Thống Kê Thông Minh */}
      <WheelConfigStatsKPI stats={dynamicStats} />

      {/* 3. Phân Tích Cơ Cấu 5 Nhóm Giải & Top Item Hay Trúng Nhất */}
      <WheelConfigAnalytics stats={dynamicStats} />

      {/* 4. Thanh Thiết Lập Tham Số Kinh Tế & Nút Mở Vòng Quay Popup Duy Nhất */}
      <WheelEconomySettingsBar
        settings={settings}
        isDirty={isEconomyDirty}
        isSaving={isSavingEconomy}
        onUpdateSettings={setSettings}
        onSaveEconomy={handleSaveEconomy}
        onResetEconomy={handleResetEconomy}
        onOpenSimulator={() => setIsSimulatorModalOpen(true)}
      />

      {/* 5. Lưới Các Thẻ Ô Số Visual Cards Kèm Thao Tác Cân Bằng, Thêm Ô & Lưu Cơ Cấu */}
      <WheelSlotsGrid
        slots={slots}
        savedSlots={savedSlots}
        totalWeight={totalWeight}
        selectedSlotId={selectedSlotId}
        isDirty={isSlotsDirty}
        isSaving={isSavingSlots}
        onSelectSlot={(id) => setSelectedSlotId(id)}
        onAddSlot={() => setIsAddModalOpen(true)}
        onEditSlot={(slot) => setEditingSlot(slot)}
        onToggleActive={handleToggleActive}
        onToggleLock={handleToggleLock}
        onDeleteSlot={handleDeleteSlot}
        onEqualize={() => setConfirmBalanceMode("equalize")}
        onAutoBalance={() => setConfirmBalanceMode("auto_balance")}
        onResetSlots={handleResetSlots}
        onSaveSlots={handleSaveSlots}
        onReorderSlots={handleReorderSlots}
        onMoveSlot={handleMoveSlot}
      />

      {/* 6. Modal Thêm / Chỉnh Sửa Ô Phần Thưởng */}
      {(isAddModalOpen || editingSlot) && (
        <EditWheelSlotModal
          key={editingSlot?.id || "create-new"}
          isOpen={isAddModalOpen || !!editingSlot}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingSlot(null);
          }}
          onSave={handleSaveSlot}
          initialData={editingSlot}
          totalSlotsCount={slots.length}
        />
      )}

      {/* 7. Modal Popup Vòng Quay To Lớn Quay Thử Nghiệm (Full-Size Live Wheel Simulator) */}
      <WheelSimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        slots={slots}
      />

      {/* 8. Modal Popup Xác Nhận & Hướng Dẫn Chia Đều / Cân Bằng Tỷ Lệ */}
      {confirmBalanceMode && (
        <ConfirmBalanceModal
          key={confirmBalanceMode}
          isOpen={!!confirmBalanceMode}
          mode={confirmBalanceMode}
          onClose={() => setConfirmBalanceMode(null)}
          onConfirm={() => {
            if (confirmBalanceMode === "equalize") {
              handleEqualize();
            } else if (confirmBalanceMode === "auto_balance") {
              handleAutoBalance();
            }
            setConfirmBalanceMode(null);
          }}
          slots={slots}
          totalWeight={totalWeight}
        />
      )}

      {/* 9. Modal Popup Xác Nhận Xóa Ô Phần Thưởng */}
      {slotToDelete && (
        <ConfirmDeleteSlotModal
          key={slotToDelete.id}
          isOpen={!!slotToDelete}
          slot={slotToDelete}
          totalSlots={slots.length}
          onClose={() => setSlotToDelete(null)}
          onConfirm={handleConfirmDeleteSlot}
        />
      )}
    </div>
  );
}
