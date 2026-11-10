"use client";

import { useState, useCallback } from "react";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import {
  TeacherStaffItem,
  TeacherFormValues,
  TeacherBatchAction,
} from "../../components/teachers/types";
import { teacherStaffService } from "../../services/teacherStaffService";

interface UseTeacherMutationsProps {
  teachersList: TeacherStaffItem[];
  mutate: KeyedMutator<TeacherStaffItem[]>;
  onMutateClasses?: () => Promise<unknown> | void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  modals: {
    editingTeacher: TeacherStaffItem | null;
    setFormKey: React.Dispatch<React.SetStateAction<number>>;
    setIsTeacherFormOpen: (open: boolean) => void;
    setEditingTeacher: (item: TeacherStaffItem | null) => void;
    assigningTeacher: TeacherStaffItem | null;
    setIsAssignModalOpen: (open: boolean) => void;
    setAssigningTeacher: (item: TeacherStaffItem | null) => void;
    resettingTeacher: TeacherStaffItem | null;
    setIsResetPasswordOpen: (open: boolean) => void;
    setResettingTeacher: (item: TeacherStaffItem | null) => void;
    deletingTeacher: TeacherStaffItem | null;
    handleCloseDeleteModal: () => void;
    permanentTargetTeacher: TeacherStaffItem | null;
    handleClosePermanentModal: () => void;
    handleCloseBatchPermanentModal: () => void;
  };
}

/**
 * Micro-hook chuyên trách: Tương tác API, Cập nhật SWR Cache và Optimistic UI cho Giáo viên
 */
export function useTeacherMutations({
  teachersList,
  mutate,
  onMutateClasses,
  selectedIds,
  setSelectedIds,
  modals,
}: UseTeacherMutationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchActionLoading, setBatchActionLoading] = useState<TeacherBatchAction | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // 1. Tạo mới hoặc cập nhật thông tin giáo viên qua API
  const handleTeacherFormSubmit = useCallback(
    async (data: TeacherFormValues): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        if (modals.editingTeacher) {
          const updated = await teacherStaffService.updateTeacher(
            modals.editingTeacher.id,
            {
              full_name: data.full_name,
              phone_zalo: data.phone_zalo || "",
              email: data.email || "",
            }
          );
          const nextList = teachersList.map((t) =>
            t.id === modals.editingTeacher!.id
              ? {
                  ...t,
                  full_name: updated.full_name,
                  phone_zalo: updated.phone_zalo,
                  email: updated.email,
                  role: updated.role,
                  is_active: updated.is_active,
                }
              : t
          );
          await mutate(nextList, false);
          toast.success("Cập nhật thông tin giáo viên thành công!");
        } else {
          const newTeacher = await teacherStaffService.createTeacher(data);
          await mutate([newTeacher, ...teachersList], false);
          toast.success("Tạo tài khoản giáo viên mới thành công!");
        }
        modals.setFormKey((k) => k + 1);
        modals.setIsTeacherFormOpen(false);
        modals.setEditingTeacher(null);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Thao tác không thành công.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modals, mutate, teachersList]
  );

  // 2. Cập nhật phân công lớp học phụ trách
  const handleAssignClassesSubmit = useCallback(
    async (teacherId: string, selectedClassIds: string[]): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        const res = await teacherStaffService.assignClasses(teacherId, selectedClassIds);
        const nextList = teachersList.map((t) =>
          t.id === teacherId
            ? {
                ...t,
                assigned_classes: res.assigned_classes,
                assigned_class_ids: res.assigned_class_ids,
              }
            : t
        );
        await mutate(nextList, false);
        void onMutateClasses?.();

        toast.success("Phân công lớp phụ trách thành công!");
        modals.setIsAssignModalOpen(false);
        modals.setAssigningTeacher(null);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể phân công lớp phụ trách.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modals, mutate, onMutateClasses, teachersList]
  );

  // 3. Đặt lại mật khẩu tài khoản
  const handleResetPasswordSubmit = useCallback(
    async (teacherId: string, newPassword: string): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        await teacherStaffService.resetPassword(teacherId, newPassword);
        const nextList = teachersList.map((t) =>
          t.id === teacherId
            ? { ...t, locked_until: null }
            : t
        );
        await mutate(nextList, false);

        toast.success("Đặt lại mật khẩu giáo viên thành công!");
        modals.setIsResetPasswordOpen(false);
        modals.setResettingTeacher(null);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể đặt lại mật khẩu.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modals, mutate, teachersList]
  );

  // 4. Bật/tắt trạng thái hoạt động (Tạm khóa / Mở khóa)
  const handleToggleTeacherStatus = useCallback(
    async (item: TeacherStaffItem) => {
      const nextStatus = !item.is_active;
      const optimisticList = teachersList.map((t) =>
        t.id === item.id ? { ...t, is_active: nextStatus, locked_until: nextStatus ? null : t.locked_until } : t
      );

      try {
        await mutate(optimisticList, false);
        await teacherStaffService.updateTeacher(item.id, { is_active: nextStatus });
        toast.success(
          nextStatus ? "Đã mở khóa tài khoản giáo viên!" : "Đã tạm khóa tài khoản giáo viên!"
        );
      } catch (err: unknown) {
        await mutate(teachersList, false);
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể cập nhật trạng thái tài khoản.");
      }
    },
    [mutate, teachersList]
  );

  const handleViewTeacherDetails = useCallback((item: TeacherStaffItem) => {
    toast.info(`Giáo viên: ${item.full_name} (@${item.username})`);
  }, []);

  // 5. Xóa mềm giáo viên (chuyển thùng rác)
  const handleConfirmDelete = useCallback(async (): Promise<boolean> => {
    if (!modals.deletingTeacher) return false;

    try {
      setIsSubmitting(true);
      await teacherStaffService.deleteTeacher(modals.deletingTeacher.id, false);

      const nextList = teachersList.map((t) =>
        t.id === modals.deletingTeacher!.id
          ? { ...t, is_deleted: true, is_active: false }
          : t
      );

      await mutate(nextList, false);
      setSelectedIds((prev) => prev.filter((id) => id !== modals.deletingTeacher!.id));
      toast.success(`Đã chuyển tài khoản "${modals.deletingTeacher.full_name}" vào thùng rác!`);

      modals.handleCloseDeleteModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa tài khoản giáo viên.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [modals, mutate, setSelectedIds, teachersList]);

  // 6. Khôi phục giáo viên đơn lẻ từ thùng rác
  const handleRestoreTeacher = useCallback(
    async (item: TeacherStaffItem): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        setRestoringId(item.id);
        await teacherStaffService.restoreTeacher(item.id);
        const nextList = teachersList.map((t) =>
          t.id === item.id ? { ...t, is_deleted: false, is_active: true } : t
        );
        await mutate(nextList, false);
        setSelectedIds((prev) => prev.filter((id) => id !== item.id));
        toast.success(`Đã khôi phục tài khoản "${item.full_name}" thành công!`);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể khôi phục tài khoản.");
        return false;
      } finally {
        setIsSubmitting(false);
        setRestoringId(null);
      }
    },
    [mutate, setSelectedIds, teachersList]
  );

  // 7. Xóa vĩnh viễn đơn lẻ (Tầng 2 - Admin)
  const handleConfirmPermanentDelete = useCallback(async (): Promise<boolean> => {
    if (!modals.permanentTargetTeacher) return false;

    try {
      setIsSubmitting(true);
      await teacherStaffService.deleteTeacher(modals.permanentTargetTeacher.id, true);
      const nextList = teachersList.filter((t) => t.id !== modals.permanentTargetTeacher!.id);
      await mutate(nextList, false);
      setSelectedIds((prev) => prev.filter((id) => id !== modals.permanentTargetTeacher!.id));
      toast.success(`Đã xóa vĩnh viễn giáo viên "${modals.permanentTargetTeacher.full_name}"!`);
      modals.handleClosePermanentModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa vĩnh viễn giáo viên.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [modals, mutate, setSelectedIds, teachersList]);

  // 8. Khôi phục hàng loạt
  const handleBatchRestore = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("restore");
      const count = selectedIds.length;
      await teacherStaffService.batchAction(selectedIds, "restore");
      const nextList = teachersList.map((t) =>
        selectedIds.includes(t.id) ? { ...t, is_deleted: false, is_active: true } : t
      );
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã khôi phục thành công ${count} tài khoản giáo viên!`);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể khôi phục các tài khoản giáo viên.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [mutate, selectedIds, setSelectedIds, teachersList]);

  // 9. Mở khóa / Kích hoạt hàng loạt
  const handleBatchActivate = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("activate");
      const count = selectedIds.length;
      await teacherStaffService.batchAction(selectedIds, "activate");
      const nextList = teachersList.map((t) =>
        selectedIds.includes(t.id) ? { ...t, is_active: true } : t
      );
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã mở khóa thành công ${count} tài khoản giáo viên!`);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể kích hoạt các tài khoản giáo viên.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [mutate, selectedIds, setSelectedIds, teachersList]);

  // 10. Tạm khóa hàng loạt
  const handleBatchDeactivate = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("deactivate");
      const count = selectedIds.length;
      await teacherStaffService.batchAction(selectedIds, "deactivate");
      const nextList = teachersList.map((t) =>
        selectedIds.includes(t.id) ? { ...t, is_active: false } : t
      );
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã tạm khóa ${count} tài khoản giáo viên!`);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể tạm khóa các tài khoản giáo viên.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [mutate, selectedIds, setSelectedIds, teachersList]);

  // 11. Chuyển vào thùng rác hàng loạt (Xóa mềm)
  const handleBatchSoftDelete = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("delete_soft");
      const count = selectedIds.length;
      await teacherStaffService.batchAction(selectedIds, "delete_soft");
      const nextList = teachersList.map((t) =>
        selectedIds.includes(t.id) ? { ...t, is_deleted: true, is_active: false } : t
      );
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã chuyển thành công ${count} tài khoản giáo viên vào thùng rác!`);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể chuyển các tài khoản vào thùng rác.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [mutate, selectedIds, setSelectedIds, teachersList]);

  // 12. Xóa vĩnh viễn hàng loạt (Admin)
  const handleConfirmBatchPermanentDelete = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("delete_permanent");
      const count = selectedIds.length;
      await teacherStaffService.batchAction(selectedIds, "delete_permanent");
      const nextList = teachersList.filter((t) => !selectedIds.includes(t.id));
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã xóa vĩnh viễn thành công ${count} tài khoản giáo viên!`);
      modals.handleCloseBatchPermanentModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa các tài khoản giáo viên.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [modals, mutate, selectedIds, setSelectedIds, teachersList]);

  // 13. Làm mới danh sách qua SWR
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        mutate(),
        onMutateClasses?.(),
      ]);
      toast.success("Đã làm mới danh sách giáo viên!");
    } catch {
      toast.error("Không thể làm mới danh sách giáo viên.");
    }
  }, [mutate, onMutateClasses]);

  return {
    isSubmitting,
    batchActionLoading,
    restoringId,
    handleTeacherFormSubmit,
    handleAssignClassesSubmit,
    handleResetPasswordSubmit,
    handleToggleTeacherStatus,
    handleViewTeacherDetails,
    handleConfirmDelete,
    handleRestoreTeacher,
    handleConfirmPermanentDelete,
    handleBatchRestore,
    handleBatchActivate,
    handleBatchDeactivate,
    handleBatchSoftDelete,
    handleConfirmBatchPermanentDelete,
    handleRefresh,
  };
}
