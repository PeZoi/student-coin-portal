"use client";

import { ConfirmDeleteModal } from "@/components/ui/modal";
import { useManageTeachersContext } from "@/features/teacher-management/contexts/ManageTeachersContext";

/**
 * Modal xác nhận xóa tài khoản giáo viên (Tái sử dụng ConfirmDeleteModal từ @/components/ui/modal)
 */
export function DeleteTeacherModal() {
  const {
    isDeleteModalOpen: isOpen,
    handleCloseDeleteModal: onClose,
    deletingTeacher: item,
    handleConfirmDelete: onConfirm,
    isSubmitting,
  } = useManageTeachersContext();

  if (!isOpen || !item) return null;

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
      title="Xác nhận xóa tài khoản"
      description="Thao tác này sẽ thu hồi toàn bộ quyền truy cập"
      warningText="Tài khoản này sẽ bị xóa khỏi danh sách nhân sự và gỡ khỏi các lớp đang phụ trách. Dữ liệu lịch sử duyệt bài vẫn được giữ lại."
    >
      Bạn có chắc chắn muốn xóa tài khoản giáo viên{" "}
      <span className="font-semibold text-slate-900">
        &quot;{item.full_name}&quot;
      </span>{" "}
      <span className="font-mono text-xs text-slate-500">
        (@{item.username})
      </span>{" "}
      không?
    </ConfirmDeleteModal>
  );
}
