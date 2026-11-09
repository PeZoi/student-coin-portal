"use client";

import { ConfirmDeleteModal } from "@/components/ui/modal";
import { MockClassItem } from "./types";
import { useTeacherClassesContext } from "../../contexts/TeacherClassesContext";

interface DeleteClassModalProps {
	isOpen?: boolean;
	onClose?: () => void;
	item?: MockClassItem | null;
	onConfirm?: () => Promise<boolean | void> | boolean | void;
	isSubmitting?: boolean;
}

/**
 * Modal xác nhận xóa lớp học (Tái sử dụng ConfirmDeleteModal từ @/components/ui/modal)
 */
export function DeleteClassModal(props?: DeleteClassModalProps) {
	const context = useTeacherClassesContext();
	const isOpen = props?.isOpen ?? context.isDeleteModalOpen;
	const onClose = props?.onClose ?? context.handleCloseDeleteModal;
	const item = props?.item !== undefined ? props.item : context.deletingClass;
	const onConfirm = props?.onConfirm ?? context.handleConfirmDelete;
	const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

	if (!isOpen || !item) return null;

	return (
		<ConfirmDeleteModal
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			isSubmitting={isSubmitting}
			title='Xác nhận xóa lớp học'
			description='Thao tác này không thể hoàn tác'
			warningText='Lớp học này sẽ bị xóa khỏi danh sách quản lý. Thao tác này không thể hoàn tác, bạn có chắc chắn muốn tiếp tục?'
		>
			Bạn có chắc chắn muốn xóa lớp học{" "}
			<span className='font-semibold text-slate-900'>
				&quot;{item.class_name}&quot;
			</span>{" "}
			không?
		</ConfirmDeleteModal>
	);
}
