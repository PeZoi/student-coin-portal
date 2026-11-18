"use client";

import { useState, useCallback } from "react";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
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
 * - Duyệt & Trao quà (Approve & Deliver) 1 chạm
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

  // 1. Duyệt & Trao quà trực tiếp (UX 1-Click)
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

        toast.success(
          `Đã duyệt và trao ${
            req.choice_type === ExchangeChoiceType.CASH
              ? "tiền mặt"
              : "quà tặng"
          } cho học sinh ${req.student_name} thành công!`
        );

        // Revalidate dữ liệu tươi mới từ server
        await mutate();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Lỗi duyệt quà: ${error.message}`);
        await mutate(); // Rollback về dữ liệu server
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [requests, mutate]
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

        toast.info(
          `Đã từ chối yêu cầu của học sinh ${req.student_name} và hoàn lại ${req.coins_to_exchange.toLocaleString(
            "vi-VN"
          )} xu vào Heo Đất.`
        );

        onCloseRejectModal?.();
        if (selectedRequestId === req.id) {
          onCloseDetailModal?.();
        }

        // Revalidate dữ liệu tươi mới từ server
        await mutate();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Lỗi từ chối yêu cầu: ${error.message}`);
        await mutate(); // Rollback về dữ liệu server
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [requests, mutate, onCloseRejectModal, selectedRequestId, onCloseDetailModal]
  );

  // 3. Làm mới danh sách đổi thưởng
  const handleRefresh = useCallback(async () => {
    try {
      await mutate();
      toast.success("Đã đồng bộ danh sách đổi thưởng mới nhất!");
    } catch {
      toast.error("Không thể làm mới danh sách. Vui lòng thử lại.");
    }
  }, [mutate]);

  return {
    isSubmittingAction,
    handleApproveAndDeliver,
    handleConfirmReject,
    handleRefresh,
  };
}
