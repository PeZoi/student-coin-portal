"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { TeacherStaffItem, TeacherFormValues } from "../../components/teachers/types";

interface UseTeacherOperationsProps {
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
  };
}

/**
 * Micro-hook chuyên trách: Các hành động tương tác nghiệp vụ Giáo viên
 */
export function useTeacherOperations({ modals }: UseTeacherOperationsProps) {
  const handleTeacherFormSubmit = useCallback(
    (data: TeacherFormValues): boolean => {
      toast.info(
        modals.editingTeacher
          ? `Giao diện mẫu: Lưu chỉnh sửa "${data.full_name}" (sẽ kết nối API sau).`
          : `Giao diện mẫu: Tạo tài khoản "${data.full_name}" (@${data.username}) (sẽ kết nối API sau).`
      );
      modals.setFormKey((k) => k + 1);
      modals.setIsTeacherFormOpen(false);
      modals.setEditingTeacher(null);
      return true;
    },
    [modals]
  );

  const handleAssignClassesSubmit = useCallback(
    (teacherId: string, selectedClassIds: string[]): boolean => {
      void teacherId;
      toast.info(
        `Giao diện mẫu: Đã chọn ${selectedClassIds.length} lớp phụ trách cho "${modals.assigningTeacher?.full_name}" (sẽ kết nối API sau).`
      );
      modals.setIsAssignModalOpen(false);
      modals.setAssigningTeacher(null);
      return true;
    },
    [modals]
  );

  const handleResetPasswordSubmit = useCallback(
    (teacherId: string, newPassword: string): boolean => {
      void teacherId;
      void newPassword;
      toast.info(
        `Giao diện mẫu: Đặt lại mật khẩu cho "${modals.resettingTeacher?.full_name}" (@${modals.resettingTeacher?.username}) (sẽ kết nối API sau).`
      );
      modals.setIsResetPasswordOpen(false);
      modals.setResettingTeacher(null);
      return true;
    },
    [modals]
  );

  const handleToggleTeacherStatus = useCallback((item: TeacherStaffItem) => {
    toast.info(
      item.is_active
        ? `Giao diện mẫu: Tạm khóa tài khoản "${item.full_name}" (sẽ kết nối API sau).`
        : `Giao diện mẫu: Mở khóa tài khoản "${item.full_name}" (sẽ kết nối API sau).`
    );
  }, []);

  const handleViewTeacherDetails = useCallback((item: TeacherStaffItem) => {
    toast.info(`Xem thông tin giáo viên: ${item.full_name} (@${item.username})`);
  }, []);

  const handleConfirmDelete = useCallback((): boolean => {
    if (!modals.deletingTeacher) return false;
    toast.info(
      `Giao diện mẫu: Xóa tài khoản "${modals.deletingTeacher.full_name}" (sẽ kết nối API sau).`
    );
    modals.handleCloseDeleteModal();
    return true;
  }, [modals]);

  const handleRefresh = useCallback(() => {
    toast.info("Giao diện mẫu: Sẽ kết nối API làm mới danh sách giáo viên sau.");
  }, []);

  return {
    handleTeacherFormSubmit,
    handleAssignClassesSubmit,
    handleResetPasswordSubmit,
    handleToggleTeacherStatus,
    handleViewTeacherDetails,
    handleConfirmDelete,
    handleRefresh,
  };
}
