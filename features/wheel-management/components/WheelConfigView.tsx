"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  WheelSlotItem,
  WheelGeneralSettings,
  WheelStatisticsData,
  WheelPrizeType,
  WheelCategoryDistribution,
} from "../types";
import {
  initialMockSlots,
  initialMockSettings,
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

interface WheelConfigViewProps {
  initialData?: InitialWheelConfigData;
}

export function WheelConfigView({ initialData }: WheelConfigViewProps) {
  const [slots, setSlots] = useState<WheelSlotItem[]>(
    initialData?.slots && initialData.slots.length > 0
      ? initialData.slots
      : initialMockSlots
  );
  const [settings, setSettings] = useState<WheelGeneralSettings>(
    initialData?.settings || initialMockSettings
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Trạng thái lưu API
  const [isSavingSlots, setIsSavingSlots] = useState(false);
  const [isSavingEconomy, setIsSavingEconomy] = useState(false);

  // State Modal
  const [editingSlot, setEditingSlot] = useState<WheelSlotItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);

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
        label: "Quà Tặng Hiện Vật",
        badgeBg: "bg-purple-50 border-purple-200 text-purple-800",
        badgeText: "Hiện Vật",
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
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id) {
          const nextLock = !slot.is_locked;
          if (nextLock) {
            toast.success(`Đã KHÓA cố định ô #${slot.slot_order} (${slot.short_label}: ${slot.probability_weight}%)`, {
              description: "Ô này sẽ được giữ nguyên tỷ lệ khi bạn nhấn 'Tự động cân bằng'.",
            });
          } else {
            toast.info(`Đã MỞ KHÓA ô #${slot.slot_order} (${slot.short_label})`, {
              description: "Ô này sẽ tham gia tự động cân bằng cùng các ô khác.",
            });
          }
          return { ...slot, is_locked: nextLock };
        }
        return slot;
      })
    );
  };

  // Hành động 2: Bật / Tắt trạng thái kích hoạt của 1 ô
  const handleToggleActive = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id) {
          const nextActive = !slot.is_active;
          toast(nextActive ? `Đã kích hoạt ô #${slot.slot_order}` : `Đã tạm ẩn ô #${slot.slot_order}`);
          return { ...slot, is_active: nextActive };
        }
        return slot;
      })
    );
  };

  // Hành động 3: Xóa một ô phần thưởng
  const handleDeleteSlot = (id: string) => {
    if (slots.length <= 4) {
      toast.error("Vòng quay cần duy trì tối thiểu 4 ô để đảm bảo tính mỹ thuật!");
      return;
    }

    const slotToDelete = slots.find((s) => s.id === id);
    setSlots((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      return remaining.map((s, idx) => ({
        ...s,
        slot_order: idx + 1,
      }));
    });

    if (slotToDelete) {
      toast.success(`Đã xóa ô "${slotToDelete.label}" khỏi vòng quay.`);
    }
  };

  // Hành động 4: Lưu chỉnh sửa hoặc thêm ô mới
  const handleSaveSlot = (slotData: Omit<WheelSlotItem, "stats">) => {
    setSlots((prev) => {
      const existsIndex = prev.findIndex((s) => s.id === slotData.id);
      if (existsIndex !== -1) {
        const updated = [...prev];
        updated[existsIndex] = {
          ...updated[existsIndex],
          ...slotData,
        };
        toast.success(`Đã cập nhật ô #${slotData.slot_order}: ${slotData.label}`);
        return updated;
      } else {
        const newSlot: WheelSlotItem = {
          ...slotData,
          slot_order: prev.length + 1,
          stats: {
            total_hits: 0,
            actual_rate: 0,
          },
        };
        toast.success(`Đã thêm mới ô "${newSlot.label}" vào vòng quay!`);
        return [...prev, newSlot];
      }
    });

    setEditingSlot(null);
    setIsAddModalOpen(false);
  };

  // Hành động 5: Lưu thiết lập kinh tế vào CSDL
  const handleSaveEconomy = async () => {
    setIsSavingEconomy(true);
    const toastId = toast.loading("Đang lưu thiết lập kinh tế vào CSDL...");
    try {
      await wheelService.saveEconomy(settings);
      toast.success("Đã lưu thiết lập kinh tế vòng quay thành công!", {
        id: toastId,
        description: `Phí quay: ${settings.spin_cost} xu • Free spin: ${
          settings.allow_free_spin ? `${settings.daily_free_spins} lượt/ngày` : "Tắt"
        }`,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Lỗi lưu thiết lập kinh tế: ${error.message}`, { id: toastId });
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

  return (
    <div className="space-y-5">
      {/* 1. Header Trang & Trạng thái cân bằng */}
      <WheelConfigHeader
        totalWeight={totalWeight}
        isBalanced={isBalanced}
      />

      {/* 2. Thẻ KPI Thống Kê Thông Minh */}
      <WheelConfigStatsKPI stats={dynamicStats} />

      {/* 3. Phân Tích Cơ Cấu 5 Nhóm Giải & Top Item Hay Trúng Nhất */}
      <WheelConfigAnalytics stats={dynamicStats} />

      {/* 4. Thanh Thiết Lập Tham Số Kinh Tế & Nút Mở Vòng Quay Popup Duy Nhất */}
      <WheelEconomySettingsBar
        settings={settings}
        onUpdateSettings={setSettings}
        onSaveEconomy={handleSaveEconomy}
        onOpenSimulator={() => setIsSimulatorModalOpen(true)}
      />

      {/* 5. Lưới Các Thẻ Ô Số Visual Cards Kèm Thao Tác Cân Bằng, Thêm Ô & Lưu Cơ Cấu */}
      <WheelSlotsGrid
        slots={slots}
        totalWeight={totalWeight}
        selectedSlotId={selectedSlotId}
        onSelectSlot={(id) => setSelectedSlotId(id)}
        onAddSlot={() => setIsAddModalOpen(true)}
        onEditSlot={(slot) => setEditingSlot(slot)}
        onToggleActive={handleToggleActive}
        onToggleLock={handleToggleLock}
        onDeleteSlot={handleDeleteSlot}
        onEqualize={handleEqualize}
        onAutoBalance={handleAutoBalance}
        onSaveSlots={handleSaveSlots}
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
    </div>
  );
}
