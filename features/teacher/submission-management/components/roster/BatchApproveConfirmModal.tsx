"use client";

import Image from "next/image";
import { AlertTriangle, CheckCheck } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import {
  SUBMISSION_GRADING_CONFIG,
  SUBMISSION_MEDIA_PATHS,
} from "../../constants";

interface BatchApproveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  isSubmitting: boolean;
  validCount: number;
  totalEstimatedCoins: number;
}

/**
 * Hộp thoại xác nhận trước khi Duyệt nhanh hàng loạt bài nộp hợp lệ
 * - Tránh bấm nhầm cộng xu hàng loạt vào sổ cái bất biến (`coin_transactions`)
 * - Tái sử dụng khung Modal chuẩn của dự án (`@/components/ui/modal`)
 */
export function BatchApproveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  validCount,
  totalEstimatedCoins,
}: BatchApproveConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    const ok = await onConfirm();
    if (ok) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      disabled={isSubmitting}
    >
      <ModalHeader
        icon={<CheckCheck className="w-5 h-5 text-emerald-600" />}
        title="Xác nhận duyệt nhanh bài hợp lệ"
        description={`Duyệt đồng loạt ${validCount} bài nộp đạt chuẩn AI`}
        onClose={onClose}
        disabled={isSubmitting}
      />

      <ModalBody>
        <p className="text-sm text-slate-600 leading-relaxed">
          Hệ thống sẽ tự động duyệt{" "}
          <strong className="text-[#0F172A]">{validCount} bài nộp</strong> đang
          chờ duyệt đạt tiêu chí ảnh rõ nét và điểm AI từ{" "}
          <strong className="text-indigo-700">
            {SUBMISSION_GRADING_CONFIG.VALID_AI_BATCH_APPROVE_MIN_SCORE.toFixed(
              1
            )}
            /10
          </strong>{" "}
          trở lên, đồng thời cộng xu Heo Đất theo mức AI đề xuất.
        </p>

        <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-emerald-900">
            Tổng xu ước tính trao thưởng:
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-black text-amber-700 tabular-nums">
            <Image
              src={SUBMISSION_MEDIA_PATHS.COIN_ICON}
              alt="Xu Heo Đất"
              width={16}
              height={16}
              style={{ height: "auto" }}
              className="w-4 select-none shrink-0"
            />
            <span>+{totalEstimatedCoins.toLocaleString("vi-VN")} xu</span>
          </span>
        </div>

        <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3 flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Giao dịch cộng xu Heo Đất được ghi vào sổ cái tài chính bất biến và
            gửi thông báo ngay tới học sinh. Vui lòng kiểm tra trước khi xác
            nhận.
          </span>
        </div>
      </ModalBody>

      <ModalFooter
        showCancel
        cancelLabel="Hủy bỏ"
        onCancel={onClose}
        showSubmit
        submitLabel={`Xác nhận duyệt (${validCount} bài)`}
        submittingLabel="Đang duyệt nhanh..."
        onSubmit={handleConfirm}
        isSubmitting={isSubmitting}
        submitVariant="emerald"
      />
    </Modal>
  );
}
