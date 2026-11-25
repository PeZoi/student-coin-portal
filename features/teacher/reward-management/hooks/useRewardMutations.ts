"use client";

import { useState, useCallback } from "react";
import { KeyedMutator, mutate as globalMutate } from "swr";
import { toast } from "sonner";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { TeacherExchangeRequestItem } from "../types";
import { rewardService } from "../services/rewardService";
import { ExchangeRequestStatus, ExchangeChoiceType } from "@/constants/rewards";

export interface UseRewardMutationsProps {
  requests: TeacherExchangeRequestItem[];
  mutate: KeyedMutator<TeacherExchangeRequestItem[]>;
  onCloseRejectModal?: () => void;
  onCloseDetailModal?: () => void;
  selectedRequestId?: string | null;
}

/**
 * Micro-hook chuyên trách: Tương tác API, Cập nhật SWR Cache, Optimistic UI & Toast Notification
 * - Duyệt yêu cầu đổi quà (Approve) 1 chạm
 * - Từ chối & Hoàn xu Heo Đất (Reject with Reason)
 * - Làm mới danh sách đổi thưởng (Refresh Sync)
 * - Tuân thủ Quy tắc 7 (No Explicit any), Quy tắc 9 (SWR Caching) & Quy tắc 12 (Micro-Hooks)
 */
export function useRewardMutations({
  requests,
  mutate,
  onCloseRejectModal,
  onCloseDetailModal,
  selectedRequestId,
}: UseRewardMutationsProps) {
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Helper revalidate toàn bộ cache badge trên Sidebar của giáo viên
  const revalidateSidebarBadges = useCallback(() => {
    void globalMutate(
      (key) =>
        (typeof key === "string" &&
          key.startsWith(CACHE_KEYS.SIDEBAR.TEACHER_BADGES_PREFIX)) ||
        (Array.isArray(key) &&
          key[0] === CACHE_KEYS.SIDEBAR.TEACHER_BADGES_PREFIX)
    );
  }, []);

  // 1. Duyệt yêu cầu đổi quà trực tiếp (UX 1-Click)
  const handleApproveAndDeliver = useCallback(
    async (req: TeacherExchangeRequestItem) => {
      try {
        setIsSubmittingAction(true);
        // Optimistic UI update
        mutate(
          requests.map((item) =>
            item.id === req.id
              ? {
                  ...item,
                  status: ExchangeRequestStatus.COMPLETED,
                  processed_at: new Date().toISOString(),
                }
              : item
          ),
          false
        );

        await rewardService.approveReward(req.id);

        const choiceLabel =
          req.choice_type === ExchangeChoiceType.CASH
            ? "tiền mặt"
            : req.choice_type === ExchangeChoiceType.SPIN_GIFT
              ? "quà tặng (Spin)"
              : "quà tặng";

        toast.success(
          `Đã duyệt thành công yêu cầu ${choiceLabel} của học sinh ${req.student_name}!`
        );

        // Revalidate dữ liệu tươi mới từ server & cập nhật badge sidebar
        await mutate();
        revalidateSidebarBadges();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Lỗi duyệt quà: ${error.message}`);
        await mutate(); // Rollback về dữ liệu server
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [requests, mutate, revalidateSidebarBadges]
  );

  // 2. Từ chối yêu cầu & Hoàn xu Heo Đất
  const handleConfirmReject = useCallback(
    async (req: TeacherExchangeRequestItem, reason: string) => {
      try {
        setIsSubmittingAction(true);
        // Optimistic UI update
        mutate(
          requests.map((item) =>
            item.id === req.id
              ? {
                  ...item,
                  status: ExchangeRequestStatus.REJECTED,
                  rejection_reason: reason,
                  processed_at: new Date().toISOString(),
                }
              : item
          ),
          false
        );

        await rewardService.rejectReward(req.id, reason);

        const isSpinGift = req.choice_type === ExchangeChoiceType.SPIN_GIFT;
        toast.info(
          isSpinGift
            ? `Đã từ chối yêu cầu của học sinh ${req.student_name} và hoàn lại 1 lượt mở Hộp quà (Spin).`
            : `Đã từ chối yêu cầu của học sinh ${req.student_name} và hoàn lại ${req.coins_to_exchange.toLocaleString(
                "vi-VN"
              )} xu vào Heo Đất.`
        );

        onCloseRejectModal?.();
        if (selectedRequestId === req.id) {
          onCloseDetailModal?.();
        }

        // Revalidate dữ liệu tươi mới từ server & cập nhật badge sidebar
        await mutate();
        revalidateSidebarBadges();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Lỗi từ chối yêu cầu: ${error.message}`);
        await mutate(); // Rollback về dữ liệu server
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [
      requests,
      mutate,
      onCloseRejectModal,
      selectedRequestId,
      onCloseDetailModal,
      revalidateSidebarBadges,
    ]
  );

  // 3. Duyệt hàng loạt yêu cầu (Batch Approve)
  const handleBatchApprove = useCallback(
    async (selectedIds: string[], onClearSelection?: () => void) => {
      if (!selectedIds || selectedIds.length === 0) return;

      try {
        setIsSubmittingAction(true);
        // Optimistic UI update
        const idSet = new Set(selectedIds);
        mutate(
          requests.map((item) =>
            idSet.has(item.id)
              ? {
                  ...item,
                  status: ExchangeRequestStatus.COMPLETED,
                  processed_at: new Date().toISOString(),
                }
              : item
          ),
          false
        );

        const result = await rewardService.batchApproveRewards(selectedIds);

        toast.success(
          `Đã duyệt thành công ${result.approvedCount} yêu cầu đổi quà!`
        );

        onClearSelection?.();
        // Revalidate dữ liệu tươi mới từ server & cập nhật badge sidebar
        await mutate();
        revalidateSidebarBadges();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Lỗi duyệt hàng loạt: ${error.message}`);
        await mutate(); // Rollback về dữ liệu server
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [requests, mutate, revalidateSidebarBadges]
  );

  // 4. Làm mới danh sách đổi thưởng
  const handleRefresh = useCallback(async () => {
    try {
      await mutate();
      revalidateSidebarBadges();
      toast.success("Đã đồng bộ danh sách đổi thưởng mới nhất!");
    } catch {
      toast.error("Không thể làm mới danh sách. Vui lòng thử lại.");
    }
  }, [mutate, revalidateSidebarBadges]);

  return {
    isSubmittingAction,
    handleApproveAndDeliver,
    handleConfirmReject,
    handleBatchApprove,
    handleRefresh,
  };
}
