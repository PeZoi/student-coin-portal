"use client";

import { ConfirmDeleteModal } from "@/components/ui/modal";
import { StudentItem } from "@/features/student-management/types";
import { useManageStudentsContext } from "@/features/student-management/contexts/ManageStudentsContext";

interface DeleteStudentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  item?: StudentItem | null;
  onConfirm?: () => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

/**
 * Modal xác nhận xóa hồ sơ học sinh (chuyển thùng rác)
 * Tái sử dụng ConfirmDeleteModal từ @/components/ui/modal
 */
export function DeleteStudentModal(props?: DeleteStudentModalProps) {
  const context = useManageStudentsContext();
  const isOpen = props?.isOpen ?? context.isDeleteModalOpen;
  const onClose = props?.onClose ?? context.handleCloseDeleteModal;
  const item =
    props?.item !== undefined ? props.item : context.deletingStudent;
  const onConfirm = props?.onConfirm ?? context.handleConfirmDelete;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

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

