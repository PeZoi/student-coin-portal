"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { teacherStudentService } from "@/features/student-management/services/studentService";
import { AdjustCoinsValues } from "@/features/student-management/types";
import { CoinTxType } from "@/constants/coins";
import { useStudentRosterModals } from "./useStudentRosterModals";

interface UseStudentRosterMutationsProps {
  mutate: () => Promise<unknown>;
  modals: ReturnType<typeof useStudentRosterModals>;
  selectedIds?: string[];
  handleClearSelection?: () => void;
}

/**
 * Micro-Hook 3: Quản lý các tương tác API Mutations (Thưởng xu, Đặt lại PIN, Làm mới dữ liệu)
 */
export function useStudentRosterMutations({
  mutate,
  modals,
  selectedIds = [],
  handleClearSelection,
}: UseStudentRosterMutationsProps) {
  const [isAwardSubmitting, setIsAwardSubmitting] = useState(false);
  const [isResetPinSubmitting, setIsResetPinSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Xử lý gửi thưởng xu
  const handleAwardSubmit = useCallback(
    async (values: AdjustCoinsValues) => {
      setIsAwardSubmitting(true);
      try {
        const studentIdsToAward =
          values.student_id === "batch" || !values.student_id
            ? selectedIds
            : [values.student_id];

        if (studentIdsToAward.length === 0) {
          toast.error("Vui lòng chọn ít nhất một học sinh để thưởng xu.");
          return;
        }

        await Promise.all(
          studentIdsToAward.map((id) =>
            teacherStudentService.adjustCoins({
              ...values,
              student_id: id,
              tx_type:
                values.tx_type ||
                (values.type === "add"
                  ? CoinTxType.SPEAKING_REWARD
                  : CoinTxType.MANUAL_ADJUST),
            })
          )
        );

        await mutate();
        modals.handleCloseAwardModal();
        handleClearSelection?.();

        const successText =
          values.type === "add"
            ? `Đã thưởng nóng +${values.amount} xu thành công cho ${studentIdsToAward.length} học sinh!`
            : `Đã trừ ${values.amount} xu thành công cho ${studentIdsToAward.length} học sinh!`;

        toast.success(successText);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể điều chỉnh xu học sinh.");
      } finally {
        setIsAwardSubmitting(false);
      }
    },
    [mutate, modals, selectedIds, handleClearSelection]
  );

  // Xử lý đặt lại PIN
  const handleResetPinSubmit = useCallback(
    async (studentId: string, newPin: string) => {
      setIsResetPinSubmitting(true);
      try {
        await teacherStudentService.resetPin(studentId, newPin);
        await mutate();
        modals.handleCloseResetPinModal();

        toast.success(
          `Đã đặt lại mã PIN thành công (${newPin}) cho học sinh. Tài khoản đã hoạt động bình thường!`
        );
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể đặt lại mã PIN.");
      } finally {
        setIsResetPinSubmitting(false);
      }
    },
    [mutate, modals]
  );

  // Thao tác làm mới danh sách học sinh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await mutate();
      toast.success("Đã làm mới danh sách học sinh");
    } catch {
      toast.error("Không thể làm mới danh sách học sinh.");
    } finally {
      setIsRefreshing(false);
    }
  }, [mutate]);

  const handleExportExcel = useCallback(() => {
    toast.info("Tính năng xuất Excel danh sách học sinh sẽ được bổ sung sau.");
  }, []);

  return {
    isAwardSubmitting,
    isResetPinSubmitting,
    isRefreshing,
    handleAwardSubmit,
    handleResetPinSubmit,
    handleRefresh,
    handleExportExcel,
  };
}
