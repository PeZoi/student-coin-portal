"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { teacherStudentService } from "@/features/teacher/student-management/services/studentService";
import { AdjustCoinsValues } from "@/features/teacher/student-management/types";
import { CoinTxType } from "@/constants/coins";
import { TeacherRosterStudent } from "../types";
import { studentRosterExcelService } from "../services/studentRosterExcelService";
import { useStudentRosterModals } from "./useStudentRosterModals";

interface UseStudentRosterMutationsProps {
  mutate: () => Promise<unknown>;
  modals: ReturnType<typeof useStudentRosterModals>;
  selectedIds?: string[];
  handleClearSelection?: () => void;
  students?: TeacherRosterStudent[];
  filteredStudents?: TeacherRosterStudent[];
  currentClassName?: string;
}

/**
 * Micro-Hook 3: Quản lý các tương tác API Mutations (Thưởng xu, Đặt lại PIN, Làm mới dữ liệu, Xuất Excel)
 */
export function useStudentRosterMutations({
  mutate,
  modals,
  selectedIds = [],
  handleClearSelection,
  students = [],
  filteredStudents = [],
  currentClassName,
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

  // Xử lý xuất dữ liệu ra file Excel chuyên nghiệp với xlsx-js-style
  const handleExportExcel = useCallback(() => {
    try {
      const isPartialSelection = Boolean(selectedIds && selectedIds.length > 0);
      const targetStudents = isPartialSelection
        ? students.filter((s) => selectedIds.includes(s.id))
        : filteredStudents.length > 0
        ? filteredStudents
        : students;

      if (targetStudents.length === 0) {
        toast.warning("Không có học sinh nào trong danh sách để xuất file Excel.");
        return;
      }

      toast.info(
        isPartialSelection
          ? `Đang xuất Excel cho ${targetStudents.length} học sinh được chọn...`
          : `Đang xuất danh sách ${targetStudents.length} học sinh ra file Excel...`
      );

      studentRosterExcelService.exportStudentsToExcel(targetStudents, {
        className: currentClassName,
        isPartialSelection,
      });

      toast.success(
        `Đã xuất thành công file Excel (${targetStudents.length} học sinh)!`
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Lỗi xuất file Excel: ${error.message}`);
    }
  }, [students, filteredStudents, selectedIds, currentClassName]);

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
