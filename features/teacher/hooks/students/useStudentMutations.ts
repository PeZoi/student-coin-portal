"use client";

import { useState, useCallback } from "react";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import {
  StudentItem,
  StudentFormValues,
  AdjustCoinsValues,
  StudentBatchAction,
} from "../../components/students/types";
import { teacherStudentService } from "../../services/teacherStudentService";
import { UseStudentModalsReturn } from "./useStudentModals";

interface UseStudentMutationsProps {
  isAdmin: boolean;
  mutate: KeyedMutator<StudentItem[]>;
  selectedIds: string[];
  handleClearSelection: () => void;
  modals: UseStudentModalsReturn;
}

/**
 * Micro-hook chuyên trách: Tương tác API, Cập nhật SWR Cache cho Học sinh
 */
export function useStudentMutations({
  isAdmin,
  mutate,
  selectedIds,
  handleClearSelection,
  modals,
}: UseStudentMutationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [batchActionLoading, setBatchActionLoading] =
    useState<StudentBatchAction | null>(null);

  // 1. Thêm mới hoặc Cập nhật hồ sơ học sinh
  const handleStudentFormSubmit = useCallback(
    async (values: StudentFormValues) => {
      try {
        setIsSubmitting(true);
        if (modals.editingStudent) {
          await teacherStudentService.updateStudent(
            modals.editingStudent.id,
            values
          );
          await mutate();
          toast.success(`Đã cập nhật hồ sơ "${values.full_name}" thành công!`);
        } else {
          await teacherStudentService.createStudent(values);
          await mutate();
          toast.success(
            `Đã tạo hồ sơ học sinh "${values.full_name}" thành công!`
          );
        }
        modals.setIsStudentFormOpen(false);
        modals.setEditingStudent(null);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modals, mutate]
  );

  // 2. Chuyển lớp 1 học sinh
  const handleChangeClassSubmit = useCallback(
    async (
      studentId: string,
      newClassId: string,
      newClassName: string,
      resetProgress: boolean = false
    ) => {
      try {
        setIsSubmitting(true);
        await teacherStudentService.changeClass(
          studentId,
          newClassId,
          resetProgress
        );
        await mutate();
        modals.setIsChangeClassOpen(false);
        modals.setChangingClassStudent(null);
        toast.success(
          resetProgress
            ? `Đã chuyển học sinh sang "${newClassName}" và làm mới toàn bộ dữ liệu bài tập & số xu!`
            : `Đã chuyển học sinh sang "${newClassName}" thành công!`
        );
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modals, mutate]
  );

  // 3. Chuyển lớp học hàng loạt
  const handleBatchChangeClassSubmit = useCallback(
    async (
      newClassId: string,
      newClassName: string,
      resetProgress: boolean = false
    ) => {
      try {
        setIsSubmitting(true);
        await teacherStudentService.batchChangeClass(
          selectedIds,
          newClassId,
          resetProgress
        );
        await mutate();
        modals.setIsBatchChangeClassOpen(false);
        toast.success(
          resetProgress
            ? `Đã chuyển ${selectedIds.length} học sinh sang "${newClassName}" và làm mới toàn bộ dữ liệu bài tập & số xu!`
            : `Đã chuyển ${selectedIds.length} học sinh sang "${newClassName}" thành công!`
        );
        handleClearSelection();
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedIds, handleClearSelection, modals, mutate]
  );

  // 4. Đặt lại mã PIN
  const handleResetPinSubmit = useCallback(
    async (studentId: string, newPin: string) => {
      try {
        setIsSubmitting(true);
        await teacherStudentService.resetPin(studentId, newPin);
        await mutate();
        modals.setIsResetPinOpen(false);
        modals.setResettingPinStudent(null);
        toast.success(
          `Đã đặt lại mã PIN và mở khóa tài khoản thành công cho bé!`
        );
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modals, mutate]
  );

  // 5. Thưởng / Trừ xu Heo Đất & Lượt quay
  const handleAdjustCoinsSubmit = useCallback(
    async (values: AdjustCoinsValues) => {
      try {
        setIsSubmitting(true);
        await teacherStudentService.adjustCoins(values);
        await mutate();
        modals.setIsAdjustCoinsOpen(false);
        modals.setAdjustingCoinsStudent(null);

        if (
          values.spins_change !== undefined &&
          values.spins_change !== 0 &&
          values.amount === 0
        ) {
          if (values.spins_change > 0) {
            toast.success(
              `Đã thưởng +${values.spins_change} lượt quay cho bé ${values.student_name}! 🎡`
            );
          } else {
            toast.success(
              `Đã trừ ${Math.abs(values.spins_change)} lượt quay của bé ${values.student_name}.`
            );
          }
        } else if (values.type === "add") {
          toast.success(
            `Đã thưởng +${values.amount} xu cho bé ${values.student_name}! 🎉`
          );
        } else {
          toast.success(
            `Đã trừ ${values.amount} xu của bé ${values.student_name}.`
          );
        }
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modals, mutate]
  );

  // 6. Bật / Tắt trạng thái hoạt động học sinh (Tạm ngưng / Đang học)
  const handleToggleStudentStatus = useCallback(
    async (item: StudentItem) => {
      try {
        const nextStatus = !item.is_active;
        await teacherStudentService.toggleStatus(item.id, nextStatus);
        await mutate();
        toast.success(
          nextStatus
            ? `Đã kích hoạt trạng thái học cho bé "${item.full_name}"`
            : `Đã tạm ngưng trạng thái học của bé "${item.full_name}"`
        );
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message);
      }
    },
    [mutate]
  );

  // 7. Mở khóa PIN tức thì
  const handleUnlockStudent = useCallback(
    async (item: StudentItem) => {
      try {
        await teacherStudentService.unlockStudent(item.id);
        await mutate();
        toast.success(
          `Đã mở khóa tài khoản thành công cho bé "${item.full_name}"! 🔓`
        );
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message);
      }
    },
    [mutate]
  );

  // 8. Xóa mềm (Thùng rác - Chỉ Admin)
  const handleConfirmDelete = useCallback(async () => {
    if (!modals.deletingStudent) return;
    if (!isAdmin) {
      toast.error(
        "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa học sinh."
      );
      return false;
    }
    try {
      setIsSubmitting(true);
      await teacherStudentService.deleteStudent(
        modals.deletingStudent.id,
        false
      );
      await mutate();
      modals.setIsDeleteModalOpen(false);
      toast.success(
        `Đã chuyển học sinh "${modals.deletingStudent.full_name}" vào thùng rác!`
      );
      modals.setDeletingStudent(null);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [modals, isAdmin, mutate]);

  // 9. Khôi phục từ thùng rác (Chỉ Admin)
  const handleRestoreStudent = useCallback(
    async (item: StudentItem) => {
      if (!isAdmin) {
        toast.error(
          "Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục học sinh."
        );
        return;
      }
      try {
        setRestoringId(item.id);
        await teacherStudentService.restoreStudent(item.id);
        await mutate();
        toast.success(`Đã khôi phục hồ sơ bé "${item.full_name}" thành công!`);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message);
      } finally {
        setRestoringId(null);
      }
    },
    [isAdmin, mutate]
  );

  // 10. Xóa vĩnh viễn 1 học sinh (Chỉ Admin)
  const handleConfirmPermanentDelete = useCallback(async () => {
    if (!modals.permanentTargetStudent) return;
    if (!isAdmin) {
      toast.error(
        "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn học sinh."
      );
      return false;
    }
    try {
      setIsSubmitting(true);
      await teacherStudentService.deleteStudent(
        modals.permanentTargetStudent.id,
        true
      );
      await mutate();
      modals.setIsPermanentModalOpen(false);
      toast.success(
        `Đã xóa vĩnh viễn học sinh "${modals.permanentTargetStudent.full_name}" khỏi hệ thống!`
      );
      modals.setPermanentTargetStudent(null);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [modals, isAdmin, mutate]);

  // 11. Các tác vụ hàng loạt (Batch Actions)
  const handleBatchActivate = useCallback(async () => {
    setBatchActionLoading("activate");
    try {
      await Promise.all(
        selectedIds.map((id) => teacherStudentService.toggleStatus(id, true))
      );
      await mutate();
      toast.success(`Đã kích hoạt lại ${selectedIds.length} học sinh đã chọn!`);
      handleClearSelection();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    } finally {
      setBatchActionLoading(null);
    }
  }, [selectedIds, handleClearSelection, mutate]);

  const handleBatchDeactivate = useCallback(async () => {
    setBatchActionLoading("deactivate");
    try {
      await Promise.all(
        selectedIds.map((id) => teacherStudentService.toggleStatus(id, false))
      );
      await mutate();
      toast.success(`Đã tạm ngưng ${selectedIds.length} học sinh đã chọn!`);
      handleClearSelection();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    } finally {
      setBatchActionLoading(null);
    }
  }, [selectedIds, handleClearSelection, mutate]);

  const handleBatchSoftDelete = useCallback(async () => {
    if (!isAdmin) {
      toast.error(
        "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa học sinh."
      );
      return;
    }
    setBatchActionLoading("delete_soft");
    try {
      await Promise.all(
        selectedIds.map((id) =>
          teacherStudentService.deleteStudent(id, false)
        )
      );
      await mutate();
      toast.success(
        `Đã chuyển ${selectedIds.length} học sinh vào thùng rác!`
      );
      handleClearSelection();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    } finally {
      setBatchActionLoading(null);
    }
  }, [selectedIds, handleClearSelection, isAdmin, mutate]);

  const handleBatchRestore = useCallback(async () => {
    if (!isAdmin) {
      toast.error(
        "Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục học sinh."
      );
      return;
    }
    setBatchActionLoading("restore");
    try {
      await Promise.all(
        selectedIds.map((id) => teacherStudentService.restoreStudent(id))
      );
      await mutate();
      toast.success(
        `Đã khôi phục thành công ${selectedIds.length} học sinh!`
      );
      handleClearSelection();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    } finally {
      setBatchActionLoading(null);
    }
  }, [selectedIds, handleClearSelection, isAdmin, mutate]);

  const handleConfirmBatchPermanentDelete = useCallback(async () => {
    if (!isAdmin) {
      toast.error(
        "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn học sinh."
      );
      return false;
    }
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedIds.map((id) => teacherStudentService.deleteStudent(id, true))
      );
      await mutate();
      modals.setIsBatchPermanentModalOpen(false);
      toast.success(
        `Đã xóa vĩnh viễn ${selectedIds.length} học sinh khỏi hệ thống!`
      );
      handleClearSelection();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedIds, handleClearSelection, modals, isAdmin, mutate]);

  return {
    isSubmitting,
    restoringId,
    batchActionLoading,

    // Mutation handlers
    handleStudentFormSubmit,
    handleChangeClassSubmit,
    handleBatchChangeClassSubmit,
    handleResetPinSubmit,
    handleAdjustCoinsSubmit,
    handleToggleStudentStatus,
    handleUnlockStudent,
    handleConfirmDelete,
    handleRestoreStudent,
    handleConfirmPermanentDelete,

    // Batch actions
    handleBatchActivate,
    handleBatchDeactivate,
    handleBatchSoftDelete,
    handleBatchRestore,
    handleConfirmBatchPermanentDelete,
  };
}

export type UseStudentMutationsReturn = ReturnType<typeof useStudentMutations>;
