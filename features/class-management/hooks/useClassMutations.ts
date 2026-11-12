"use client";

import { useState, useCallback } from "react";
import { KeyedMutator } from "swr";
import { toast } from "sonner";
import { TeacherClassItem } from "@/features/class-management/types";
import { teacherClassService } from "@/features/class-management/services/classService";

interface UseClassMutationsProps {
  classesList: TeacherClassItem[];
  mutate: KeyedMutator<TeacherClassItem[]>;
  onMutateTeachers?: () => Promise<unknown> | void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  modals: {
    editingClass: TeacherClassItem | null;
    setFormKey: React.Dispatch<React.SetStateAction<number>>;
    setIsClassFormOpen: (open: boolean) => void;
    setEditingClass: (item: TeacherClassItem | null) => void;
    setIsAssignModalOpen: (open: boolean) => void;
    setAssigningClass: (item: TeacherClassItem | null) => void;
    deletingClass: TeacherClassItem | null;
    handleCloseDeleteModal: () => void;
    permanentTargetClass: TeacherClassItem | null;
    handleClosePermanentModal: () => void;
    handleCloseBatchPermanentModal: () => void;
  };
}

export type BatchActionType =
  | "activate"
  | "deactivate"
  | "delete_soft"
  | "restore"
  | "delete_permanent";

/**
 * Micro-hook chuyên trách: Tương tác API, Cập nhật Cache và Thông báo người dùng (Mutations & Optimistic UI)
 */
export function useClassMutations({
  classesList,
  mutate,
  onMutateTeachers,
  selectedIds,
  setSelectedIds,
  modals,
}: UseClassMutationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchActionLoading, setBatchActionLoading] = useState<BatchActionType | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // 1. Tạo mới hoặc cập nhật lớp học qua API
  const handleClassFormSubmit = useCallback(
    async (data: { class_name: string; is_active: boolean }): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        if (modals.editingClass) {
          const updated = await teacherClassService.updateClass(modals.editingClass.id, data);
          const nextList = classesList.map((c) =>
            c.id === modals.editingClass!.id
              ? { ...c, class_name: updated.class_name, is_active: updated.is_active }
              : c
          );
          await mutate(nextList, false);
          toast.success("Cập nhật thông tin lớp học thành công!");
        } else {
          const newClass = await teacherClassService.createClass(data);
          await mutate([newClass, ...classesList], false);
          toast.success("Tạo lớp học mới thành công!");
        }
        modals.setFormKey((k) => k + 1);
        modals.setIsClassFormOpen(false);
        modals.setEditingClass(null);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Thao tác không thành công.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [classesList, modals, mutate]
  );

  // 2. Cập nhật phân công giáo viên
  const handleAssignTeacherSubmit = useCallback(
    async (classId: string, assignedTeacherIds: string[]): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        const res = await teacherClassService.assignTeachers(classId, assignedTeacherIds);
        const nextList = classesList.map((c) =>
          c.id === classId
            ? { ...c, teachers: res.teachers, teacher_ids: res.teacher_ids }
            : c
        );
        await mutate(nextList, false);
        void onMutateTeachers?.();

        toast.success("Phân công giáo viên thành công!");
        modals.setIsAssignModalOpen(false);
        modals.setAssigningClass(null);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể phân công giáo viên.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [classesList, modals, mutate, onMutateTeachers]
  );

  // 3. Bật/tắt trạng thái kích hoạt lớp học (Cập nhật lạc quan - Optimistic)
  const handleToggleClassStatus = useCallback(
    async (item: TeacherClassItem) => {
      const nextStatus = !item.is_active;
      const optimisticList = classesList.map((c) =>
        c.id === item.id ? { ...c, is_active: nextStatus } : c
      );

      try {
        await mutate(optimisticList, false);
        await teacherClassService.updateClass(item.id, { is_active: nextStatus });
        toast.success(
          nextStatus ? "Đã hiện lại lớp học!" : "Đã chuyển lớp học sang trạng thái tạm ẩn!"
        );
      } catch (err: unknown) {
        await mutate(classesList, false);
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể cập nhật trạng thái lớp học.");
      }
    },
    [classesList, mutate]
  );

  const handleViewClassDetails = useCallback((item: TeacherClassItem) => {
    toast.info(`Xem chi tiết lớp: ${item.class_name}`);
  }, []);

  // 4. Xóa lớp học (Nếu lớp chưa có học sinh: xóa vĩnh viễn; nếu đã có học sinh: chuyển vào thùng rác)
  const handleConfirmDelete = useCallback(async (): Promise<boolean> => {
    if (!modals.deletingClass) return false;

    try {
      setIsSubmitting(true);
      const res = await teacherClassService.deleteClass(modals.deletingClass.id, false);
      const isPermanentDeleted = res.permanent === true;

      const nextList = isPermanentDeleted
        ? classesList.filter((c) => c.id !== modals.deletingClass!.id)
        : classesList.map((c) =>
            c.id === modals.deletingClass!.id ? { ...c, is_deleted: true, is_active: false } : c
          );

      await mutate(nextList, false);
      setSelectedIds((prev) => prev.filter((id) => id !== modals.deletingClass!.id));

      toast.success(`Đã xóa lớp "${modals.deletingClass.class_name}" thành công!`);

      modals.handleCloseDeleteModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa lớp học.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [classesList, modals, mutate, setSelectedIds]);

  // 5. Khôi phục lớp học đơn lẻ từ thùng rác
  const handleRestoreClass = useCallback(
    async (item: TeacherClassItem): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        setRestoringId(item.id);
        await teacherClassService.restoreClass(item.id);
        const nextList = classesList.map((c) =>
          c.id === item.id ? { ...c, is_deleted: false, is_active: true } : c
        );
        await mutate(nextList, false);
        setSelectedIds((prev) => prev.filter((id) => id !== item.id));
        toast.success(`Đã khôi phục lớp "${item.class_name}" thành công!`);
        return true;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Không thể khôi phục lớp học.");
        return false;
      } finally {
        setIsSubmitting(false);
        setRestoringId(null);
      }
    },
    [classesList, mutate, setSelectedIds]
  );

  // 6. Xóa vĩnh viễn đơn lẻ (Tầng 2 - Admin)
  const handleConfirmPermanentDelete = useCallback(async (): Promise<boolean> => {
    if (!modals.permanentTargetClass) return false;

    try {
      setIsSubmitting(true);
      await teacherClassService.deleteClass(modals.permanentTargetClass.id, true);
      const nextList = classesList.filter((c) => c.id !== modals.permanentTargetClass!.id);
      await mutate(nextList, false);
      setSelectedIds((prev) => prev.filter((id) => id !== modals.permanentTargetClass!.id));
      toast.success(`Đã xóa vĩnh viễn lớp "${modals.permanentTargetClass.class_name}"!`);
      modals.handleClosePermanentModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa vĩnh viễn lớp học.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [classesList, modals, mutate, setSelectedIds]);

  // 7. Khôi phục hàng loạt
  const handleBatchRestore = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("restore");
      const count = selectedIds.length;
      await teacherClassService.batchAction(selectedIds, "restore");
      const nextList = classesList.map((c) =>
        selectedIds.includes(c.id) ? { ...c, is_deleted: false, is_active: true } : c
      );
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã khôi phục thành công ${count} lớp học!`);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể khôi phục các lớp học.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [classesList, mutate, selectedIds, setSelectedIds]);

  // 8. Kích hoạt / Hiện lại hàng loạt
  const handleBatchActivate = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("activate");
      const count = selectedIds.length;
      await teacherClassService.batchAction(selectedIds, "activate");
      const nextList = classesList.map((c) =>
        selectedIds.includes(c.id) ? { ...c, is_active: true } : c
      );
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã hiện lại thành công ${count} lớp học!`);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể kích hoạt các lớp học.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [classesList, mutate, selectedIds, setSelectedIds]);

  // 9. Tạm ẩn hàng loạt
  const handleBatchDeactivate = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("deactivate");
      const count = selectedIds.length;
      await teacherClassService.batchAction(selectedIds, "deactivate");
      const nextList = classesList.map((c) =>
        selectedIds.includes(c.id) ? { ...c, is_active: false } : c
      );
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã chuyển ${count} lớp học sang trạng thái tạm ẩn!`);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể tạm ẩn các lớp học.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [classesList, mutate, selectedIds, setSelectedIds]);

  // 10. Chuyển vào thùng rác hàng loạt (Xóa mềm)
  const handleBatchSoftDelete = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("delete_soft");
      const count = selectedIds.length;
      await teacherClassService.batchAction(selectedIds, "delete_soft");
      const nextList = classesList.map((c) =>
        selectedIds.includes(c.id) ? { ...c, is_deleted: true, is_active: false } : c
      );
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã chuyển thành công ${count} lớp học vào thùng rác!`);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể chuyển các lớp học vào thùng rác.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [classesList, mutate, selectedIds, setSelectedIds]);

  // 11. Xóa vĩnh viễn hàng loạt (Admin)
  const handleConfirmBatchPermanentDelete = useCallback(async (): Promise<boolean> => {
    if (selectedIds.length === 0) return false;

    try {
      setIsSubmitting(true);
      setBatchActionLoading("delete_permanent");
      const count = selectedIds.length;
      await teacherClassService.batchAction(selectedIds, "delete_permanent");
      const nextList = classesList.filter((c) => !selectedIds.includes(c.id));
      await mutate(nextList, false);
      setSelectedIds([]);
      toast.success(`Đã xóa vĩnh viễn thành công ${count} lớp học!`);
      modals.handleCloseBatchPermanentModal();
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Không thể xóa các lớp học.");
      return false;
    } finally {
      setIsSubmitting(false);
      setBatchActionLoading(null);
    }
  }, [classesList, modals, mutate, selectedIds, setSelectedIds]);

  return {
    isSubmitting,
    batchActionLoading,
    restoringId,
    handleClassFormSubmit,
    handleAssignTeacherSubmit,
    handleToggleClassStatus,
    handleViewClassDetails,
    handleConfirmDelete,
    handleRestoreClass,
    handleConfirmPermanentDelete,
    handleBatchRestore,
    handleBatchActivate,
    handleBatchDeactivate,
    handleBatchSoftDelete,
    handleConfirmBatchPermanentDelete,
  };
}
