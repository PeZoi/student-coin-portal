"use client";

import { useCallback } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { TeacherStaffItem } from "@/features/teacher-management/types";
import { useManageTeachersContext } from "@/features/teacher-management/contexts/ManageTeachersContext";

interface PermanentDeleteTeacherModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  item?: TeacherStaffItem | null;
  batchCount?: number;
  onConfirm?: () => Promise<boolean | void> | boolean | void;
  isSubmitting?: boolean;
}

/**
 * Modal xác nhận Xóa vĩnh viễn Giáo viên (Tầng 2 dành riêng cho Admin)
 * - Tái sử dụng Modal, ModalHeader, ModalBody, ModalFooter từ @/components/ui/modal
 */
export function PermanentDeleteTeacherModal(
  props?: PermanentDeleteTeacherModalProps
) {
  const context = useManageTeachersContext();
  const isBatch = Boolean(
    props?.batchCount || context.isBatchPermanentModalOpen
  );

  const isOpen = isBatch
    ? (props?.isOpen ?? context.isBatchPermanentModalOpen)
    : (props?.isOpen ?? context.isPermanentModalOpen);

  const onClose = isBatch
    ? (props?.onClose ?? context.handleCloseBatchPermanentModal)
    : (props?.onClose ?? context.handleClosePermanentModal);

  const item =
    props?.item !== undefined ? props.item : context.permanentTargetTeacher;
  const count = props?.batchCount ?? context.selectedIds.length;

  const onConfirm = isBatch
    ? (props?.onConfirm ?? context.handleConfirmBatchPermanentDelete)
    : (props?.onConfirm ?? context.handleConfirmPermanentDelete);

  const isSubmitting = props?.isSubmitting ?? context.isSubmitting;

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;
  if (!isBatch && !item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
      closeOnBackdrop
      disabled={isSubmitting}
    >
      <ModalHeader
        variant="danger"
        icon={<Trash2 className="w-5 h-5" />}
        title="Xác nhận xóa vĩnh viễn"
        description={
          <span className="text-rose-600 font-semibold">
            Cảnh báo: Hành động này KHÔNG THỂ HOÀN TÁC
          </span>
        }
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <ModalBody>
        <p className="text-sm text-slate-700 leading-relaxed">
          {isBatch ? (
            <>
              Bạn có chắc chắn muốn xóa vĩnh viễn{" "}
              <span className="font-bold text-rose-600">
                {count} tài khoản giáo viên
              </span>{" "}
              đã chọn khỏi hệ thống không?
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn xóa vĩnh viễn giáo viên{" "}
              <span className="font-bold text-slate-900">
                &quot;{item?.full_name}&quot;
              </span>{" "}
              (@{item?.username}) khỏi hệ thống không?
            </>
          )}
        </p>

        <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-900">
              Các tác động sau khi xóa vĩnh viễn:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-rose-700">
              <li>Gỡ bỏ toàn bộ phân công phụ trách tại các lớp học.</li>
              <li>
                Hủy bỏ toàn bộ quyền truy cập và phiên đăng nhập của giáo viên.
              </li>
              <li>Xóa sạch hoàn toàn bản ghi tài khoản khỏi cơ sở dữ liệu.</li>
            </ul>
          </div>
        </div>
      </ModalBody>

      <ModalFooter
        showCancel
        cancelLabel="Hủy bỏ"
        onCancel={handleClose}
        cancelDisabled={isSubmitting}
        showSubmit
        submitLabel="Xác nhận xóa vĩnh viễn"
        submittingLabel="Đang xóa vĩnh viễn..."
        onSubmit={() => onConfirm()}
        isSubmitting={isSubmitting}
        submitVariant="danger"
      />
    </Modal>
  );
}
