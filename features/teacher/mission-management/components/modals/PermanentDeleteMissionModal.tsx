"use client";

import { useCallback } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { useManageMissionsContext } from "../../contexts/ManageMissionsContext";

export function PermanentDeleteMissionModal() {
  const {
    isPermanentModalOpen,
    permanentTargetMission,
    handleClosePermanentModal,
    handleConfirmPermanentDelete,
    isBatchPermanentModalOpen,
    handleCloseBatchPermanentModal,
    handleConfirmBatchPermanentDelete,
    selectedIds,
    isSubmitting,
  } = useManageMissionsContext();

  const isBatch = isBatchPermanentModalOpen;
  const isOpen = isBatch ? isBatchPermanentModalOpen : isPermanentModalOpen;
  const onClose = isBatch
    ? handleCloseBatchPermanentModal
    : handleClosePermanentModal;
  const onConfirm = isBatch
    ? handleConfirmBatchPermanentDelete
    : handleConfirmPermanentDelete;

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;
  if (!isBatch && !permanentTargetMission) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
      disabled={isSubmitting}
    >
      <ModalHeader
        variant="danger"
        icon={<Trash2 className="w-5 h-5" />}
        title="Xác nhận xóa vĩnh viễn bài tập"
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
                {selectedIds.length} bài tập
              </span>{" "}
              đã chọn khỏi cơ sở dữ liệu không?
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn xóa vĩnh viễn bài tập{" "}
              <span className="font-bold text-slate-900">
                &quot;{permanentTargetMission?.title}&quot;
              </span>{" "}
              khỏi cơ sở dữ liệu không?
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
              <li>
                Gỡ bỏ toàn bộ liên kết giao bài tập cho các lớp (
                <code>mission_classes</code>).
              </li>
              <li>
                Xóa bản ghi bài tập khỏi bảng <code>missions</code>.
              </li>
              <li>
                Số dư xu trong ví học sinh đã cộng trước đó vẫn được giữ nguyên
                trong <code>coin_transactions</code>.
              </li>
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
