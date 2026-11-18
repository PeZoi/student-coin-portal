"use client";

import { useState } from "react";
import { AlertTriangle, XCircle, Loader2 } from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { TeacherExchangeRequestItem } from "../types";
import { ExchangeChoiceType } from "@/constants/rewards";
import { useOptionalTeacherRewardsContext } from "../contexts/TeacherRewardsContext";

const QUICK_REASONS = [
  "Link món quà bị lỗi hoặc hết hàng",
  "Sản phẩm đổi giá vượt quá số xu",
  "Thông tin nhận tiền chưa chính xác",
  "Cần phụ huynh liên hệ lại với cô",
];

export interface TeacherRewardRejectModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  request?: TeacherExchangeRequestItem | null;
  onConfirmReject?: (
    request: TeacherExchangeRequestItem,
    reason: string
  ) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function TeacherRewardRejectModal(
  props?: TeacherRewardRejectModalProps
) {
  const context = useOptionalTeacherRewardsContext();

  const isOpen = props?.isOpen ?? context?.isRejectModalOpen ?? false;
  const onClose =
    props?.onClose ?? context?.handleCloseRejectModal ?? (() => {});
  const request = props?.request ?? context?.rejectModalRequest ?? null;
  const onConfirmReject =
    props?.onConfirmReject ?? context?.handleConfirmReject ?? (() => {});
  const isSubmitting =
    props?.isSubmitting ?? context?.isSubmittingAction ?? false;

  const [reason, setReason] = useState(QUICK_REASONS[0]);

  if (!request) return null;

  const isCash = request.choice_type === ExchangeChoiceType.CASH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || isSubmitting) return;
    await onConfirmReject(request, reason.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          }
          title="Từ Chối Yêu Cầu Đổi Quà"
          description={
            <span>
              Học sinh: <strong>{request.student_name}</strong>
              {request.class_name ? ` • ${request.class_name}` : ""}
            </span>
          }
          onClose={onClose}
        />

        <ModalBody className="p-5 space-y-4">
          {/* Thông tin hoàn trả xu tự động */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Hệ thống sẽ tự động hoàn xu cho học sinh:</p>
              <p>
                Hoàn lại{" "}
                <strong className="text-amber-700 font-extrabold">
                  +{request.coins_to_exchange.toLocaleString("vi-VN")} xu
                </strong>{" "}
                vào Heo Đất của bé ({isCash ? "quy đổi tiền mặt" : "quà tặng tự chọn"}{" "}
                {request.amount_vnd.toLocaleString("vi-VN")} đ) và gửi thông báo
                chuông kèm lý do từ chối.
              </p>
            </div>
          </div>

          {/* Nhập lý do từ chối */}
          <div className="space-y-2">
            <label
              htmlFor="reject-reason"
              className="text-xs font-bold text-slate-700 block"
            >
              Lý do từ chối <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do cô từ chối để học sinh và phụ huynh nắm rõ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none shadow-2xs"
              required
            />
          </div>

          {/* Gợi ý lý do nhanh */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Gợi ý lý do nhanh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setReason(chip)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    reason === chip
                      ? "bg-rose-50 text-rose-700 border-rose-300 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex items-center justify-end gap-2.5 p-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={!reason.trim() || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Xác nhận từ chối & Hoàn xu</span>
              </>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
