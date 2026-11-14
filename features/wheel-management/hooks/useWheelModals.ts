"use client";

import { useState } from "react";
import { WheelSlotItem } from "../types";
import { BalanceMode } from "../components/modals/ConfirmBalanceModal";

export type WheelConfigTab = "config" | "analytics";

/**
 * Micro-hook chuyên trách: Quản lý Tab hiển thị và trạng thái đóng/mở của 3 Modals cấu hình vòng quay
 */
export function useWheelModals() {
  const [activeTab, setActiveTab] = useState<WheelConfigTab>("config");
  const [editingSlot, setEditingSlot] = useState<WheelSlotItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmBalanceMode, setConfirmBalanceMode] =
    useState<BalanceMode | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<WheelSlotItem | null>(null);

  return {
    activeTab,
    setActiveTab,
    editingSlot,
    setEditingSlot,
    isAddModalOpen,
    setIsAddModalOpen,
    confirmBalanceMode,
    setConfirmBalanceMode,
    slotToDelete,
    setSlotToDelete,
  };
}
