"use client";

import { ConfirmDeleteModal } from "@/components/ui/modal";
import { useManageStudentsContext } from "@/features/teacher/student-management/contexts/ManageStudentsContext";

/**
 * Modal xác nhận xóa hồ sơ học sinh (chuyển thùng rác)
 * Tái sử dụng ConfirmDeleteModal từ @/components/ui/modal
 */
export function DeleteStudentModal() {
  const {
    isDeleteModalOpen: isOpen,
    handleCloseDeleteModal: onClose,
    deletingStudent: item,
    handleConfirmDelete: onConfirm,
    isSubmitting,
  } = useManageStudentsContext();

  if (!isOpen || !item) return null;

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
      title="Xác nhận chuyển vào thùng rác"
      description="Hồ sơ học sinh sẽ được tạm ngưng và lưu trữ an toàn"
      warningText="Học sinh này sẽ không thể đăng nhập vào cổng Heo Đất. Bạn có thể khôi phục lại bất kỳ lúc nào từ tab Thùng rác."
    >
      Bạn có chắc chắn muốn chuyển học sinh{" "}
      <span className="font-semibold text-slate-900">
        &quot;{item.full_name}&quot;
      </span>{" "}
      <span className="font-mono text-xs text-slate-500">
        (SĐT: {item.phone_zalo})
      </span>{" "}
      vào thùng rác không?
    </ConfirmDeleteModal>
  );
}

