"use client";

import { ConfirmDeleteModal } from "@/components/ui/modal";
import { MockClassItem } from "@/features/class-management/types";
import { useTeacherClassesContext } from "@/features/class-management/contexts/TeacherClassesContext";

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

	const hasStudents = (item.student_count ?? 0) > 0;

	return (
		<ConfirmDeleteModal
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			isSubmitting={isSubmitting}
			title='Xác nhận xóa lớp học'
			description='Thao tác này sẽ chuyển lớp học vào thùng rác'
			warningText={
				hasStudents
					? `Lớp học hiện có ${item.student_count} học sinh và sẽ được chuyển vào thùng rác. Dữ liệu tài khoản và lịch sử nộp bài của học sinh vẫn được bảo toàn an toàn trên hệ thống.`
					: "Lớp học này sẽ được chuyển vào thùng rác. Quản trị viên có thể khôi phục hoặc xóa vĩnh viễn bất kỳ lúc nào."
			}
		>
			Bạn có chắc chắn muốn xóa lớp học{" "}
			<span className='font-semibold text-slate-900'>
				&quot;{item.class_name}&quot;
			</span>{" "}
			không?
		</ConfirmDeleteModal>
	);
}
