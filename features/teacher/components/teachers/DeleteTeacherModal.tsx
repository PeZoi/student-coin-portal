"use client";

import { ConfirmDeleteModal } from "@/components/ui/modal";
import { TeacherStaffItem } from "./types";
import { useManageTeachersContext } from "../../contexts/ManageTeachersContext";

interface DeleteTeacherModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  item?: TeacherStaffItem | null;
  onConfirm?: () => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

/**
 * Modal xác nhận xóa tài khoản giáo viên (Tái sử dụng ConfirmDeleteModal từ @/components/ui/modal)
 */
export function DeleteTeacherModal(props?: DeleteTeacherModalProps) {
  const context = useManageTeachersContext();
  const isOpen = props?.isOpen ?? context.isDeleteModalOpen;
  const onClose = props?.onClose ?? context.handleCloseDeleteModal;
  const item =
    props?.item !== undefined ? props.item : context.deletingTeacher;
  const onConfirm = props?.onConfirm ?? context.handleConfirmDelete;
  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

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
