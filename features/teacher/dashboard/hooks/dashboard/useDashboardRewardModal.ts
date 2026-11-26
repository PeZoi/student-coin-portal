"use client";

import { useState, useMemo, useCallback } from "react";
import { ExchangeRequestStatus } from "@/constants/rewards";
import type { TeacherExchangeRequestItem } from "@/features/student/rewards/types";
import { DashboardPendingRewardItem } from "../../types";

/**
 * Micro-Hook 2: Chuyên trách trạng thái Modal chi tiết yêu cầu đổi quà trên Dashboard
 */
export function useDashboardRewardModal() {
  const [selectedReward, setSelectedReward] =
    useState<DashboardPendingRewardItem | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const selectedExchangeRequest = useMemo<TeacherExchangeRequestItem | null>(() => {
    if (!selectedReward) return null;
    return {
      id: selectedReward.id,
      month: selectedReward.month,
      year: selectedReward.year,
      student_id: selectedReward.student_id,
      student_name: selectedReward.student_name,
      student_avatar: selectedReward.student_avatar,
      student_phone: selectedReward.student_phone ?? undefined,
      class_id: selectedReward.class_id,
      class_name: selectedReward.class_name,
      choice_type: selectedReward.choice_type,
      coins_to_exchange: selectedReward.coins_to_exchange,
      amount_vnd: selectedReward.amount_vnd,
      shopee_product_url: selectedReward.shopee_product_url ?? null,
      shopee_note: selectedReward.shopee_note ?? selectedReward.item_name,
      status: selectedReward.status ?? ExchangeRequestStatus.PENDING,
      created_at: selectedReward.created_at,
    };
  }, [selectedReward]);

  const handleOpenRewardDetail = useCallback(
    (reward: DashboardPendingRewardItem) => {
      setSelectedReward(reward);
      setIsRewardModalOpen(true);
    },
    []
  );

  const handleCloseRewardDetail = useCallback(() => {
    setIsRewardModalOpen(false);
    setSelectedReward(null);
  }, []);

  return {
    selectedReward,
    isRewardModalOpen,
    selectedExchangeRequest,
    handleOpenRewardDetail,
    handleCloseRewardDetail,
  };
}
