"use client";

import { useState, useCallback } from "react";
import { KeyedMutator, mutate as globalMutate } from "swr";
import { toast } from "sonner";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import {
  ExchangeChoiceType,
  getExchangeChoiceTypeLabel,
} from "@/constants/rewards";
import { rewardService } from "@/features/teacher/reward-management/services/rewardService";
import { DEFAULT_DASHBOARD_REJECT_REASON } from "../../constants";
import { TeacherDashboardPayload } from "../../types";

export interface UseDashboardMutationsParams {
  dashboard: TeacherDashboardPayload;
  mutate: KeyedMutator<TeacherDashboardPayload>;
  onCloseRewardDetail: () => void;
}

/**
 * Micro-Hook 3: Chuyên trách tương tác API (Duyệt/Từ chối quà), Optimistic UI & Đồng bộ Cache
 */
export function useDashboardMutations({
  dashboard,
  mutate,
  onCloseRewardDetail,
}: UseDashboardMutationsParams) {
  const [isProcessingReward, setIsProcessingReward] = useState(false);

  // Đồng bộ lại badge trên Sidebar và danh sách trang Quản lý Đổi quà
  const revalidateRelatedCaches = useCallback(() => {
    void globalMutate(
      (key) =>
        (typeof key === "string" &&
          key.startsWith(CACHE_KEYS.SIDEBAR.TEACHER_BADGES_PREFIX)) ||
        (Array.isArray(key) &&
          (key[0] === CACHE_KEYS.SIDEBAR.TEACHER_BADGES_PREFIX ||
            key[0] === CACHE_KEYS.REWARDS.LIST_PREFIX))
    );
  }, []);

  const handleHandoverReward = useCallback(
    async (rewardId: string) => {
      const target = dashboard.pendingRewards.find((r) => r.id === rewardId);
      if (!target || isProcessingReward) return;

      try {
        setIsProcessingReward(true);
        onCloseRewardDetail();

        // Optimistic UI: xóa khỏi danh sách chờ duyệt và giảm KPI tức thì
        void mutate(
          {
            ...dashboard,
            kpis: {
              ...dashboard.kpis,
              pending_rewards_count: Math.max(
                0,
                dashboard.kpis.pending_rewards_count - 1
              ),
            },
            pendingRewards: dashboard.pendingRewards.filter(
              (r) => r.id !== rewardId
            ),
          },
          false
        );

        await rewardService.approveReward(rewardId);

        const choiceLabel = getExchangeChoiceTypeLabel(
          target.choice_type
        ).toLowerCase();

        toast.success(
          `Đã duyệt yêu cầu ${choiceLabel} của học sinh ${target.student_name}!`
        );

        await mutate();
        revalidateRelatedCaches();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Lỗi duyệt quà: ${error.message}`);
        await mutate();
      } finally {
        setIsProcessingReward(false);
      }
    },
    [dashboard, isProcessingReward, mutate, onCloseRewardDetail, revalidateRelatedCaches]
  );

  const handleRejectReward = useCallback(
    async (rewardId: string, reason = DEFAULT_DASHBOARD_REJECT_REASON) => {
      const target = dashboard.pendingRewards.find((r) => r.id === rewardId);
      if (!target || isProcessingReward) return;

      try {
        setIsProcessingReward(true);
        onCloseRewardDetail();

        // Optimistic UI: xóa khỏi danh sách chờ duyệt và giảm KPI tức thì
        void mutate(
          {
            ...dashboard,
            kpis: {
              ...dashboard.kpis,
              pending_rewards_count: Math.max(
                0,
                dashboard.kpis.pending_rewards_count - 1
              ),
            },
            pendingRewards: dashboard.pendingRewards.filter(
              (r) => r.id !== rewardId
            ),
          },
          false
        );

        await rewardService.rejectReward(rewardId, reason);

        const isSpinGift = target.choice_type === ExchangeChoiceType.SPIN_GIFT;
        toast.info(
          isSpinGift
            ? `Đã từ chối yêu cầu của ${target.student_name} và hoàn lại 1 Hộp quà (Spin).`
            : `Đã từ chối yêu cầu của ${target.student_name} và hoàn lại ${target.coins_to_exchange.toLocaleString("vi-VN")} xu vào Heo Đất.`
        );

        await mutate();
        revalidateRelatedCaches();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Lỗi từ chối yêu cầu: ${error.message}`);
        await mutate();
      } finally {
        setIsProcessingReward(false);
      }
    },
    [dashboard, isProcessingReward, mutate, onCloseRewardDetail, revalidateRelatedCaches]
  );

  const handleCopyParentPhone = useCallback(
    (studentName: string, phone: string) => {
      navigator.clipboard.writeText(phone);
      toast.success(`Đã sao chép SĐT phụ huynh em ${studentName}: ${phone}`);
    },
    []
  );

  return {
    isProcessingReward,
    handleHandoverReward,
    handleRejectReward,
    handleCopyParentPhone,
  };
}
