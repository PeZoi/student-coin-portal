"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  Copy,
  Check,
  XCircle,
  Banknote,
  ShoppingBag,
  Gift,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import {
  ExchangeChoiceType,
  ExchangeRequestStatus,
  getExchangeChoiceTypeLabel,
} from "@/constants/rewards";
import { formatDate } from "@/lib/date";
import { toast } from "sonner";
import { useOptionalTeacherRewardsContext } from "../contexts/TeacherRewardsContext";
import { TeacherExchangeRequestItem } from "../types";

export interface TeacherRewardDetailModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  request?: TeacherExchangeRequestItem | null;
  onApproveAndDeliver?: (req: TeacherExchangeRequestItem) => void;
  onReject?: (req: TeacherExchangeRequestItem) => void;
}

export function TeacherRewardDetailModal(props?: TeacherRewardDetailModalProps) {
  const context = useOptionalTeacherRewardsContext();

  const isOpen =
    props?.isOpen !== undefined ? props.isOpen : context?.isDetailModalOpen ?? false;
  const onClose = props?.onClose ?? context?.handleCloseDetail ?? (() => {});
  const request =
    props?.request !== undefined ? props.request : context?.selectedRequest ?? null;
  const onApproveAndDeliver =
    props?.onApproveAndDeliver ?? context?.handleApproveAndDeliver;
  const onReject = props?.onReject ?? context?.handleOpenRejectModal;

  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const isCash = request.choice_type === ExchangeChoiceType.CASH;
  const isSpinGift = request.choice_type === ExchangeChoiceType.SPIN_GIFT;
  const isGift =
    request.choice_type === ExchangeChoiceType.GIFT ||
    (request.choice_type as string) === "shopee";
  const isGiftLike = isGift || isSpinGift;

  const handleCopyLink = () => {
    if (!request.shopee_product_url) return;
    navigator.clipboard.writeText(request.shopee_product_url);
    setCopied(true);
    toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      {/* 1. Header Modal */}
      <ModalHeader
        icon={
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isCash
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : isSpinGift
                  ? "bg-purple-50 text-purple-600 border-purple-200"
                  : "bg-orange-50 text-orange-600 border-orange-200"
            }`}
          >
            {isCash ? (
              <Banknote className="w-5 h-5" />
            ) : isSpinGift ? (
              <Gift className="w-5 h-5" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </div>
        }
        title="Chi Tiết Yêu Cầu Đổi Thưởng"
        description={
          <span>
            Học sinh: <strong>{request.student_name}</strong>
          </span>
        }
        onClose={onClose}
      />

      {/* 2. Body Modal */}
      <ModalBody className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto teacher-scrollbar">
        {/* Khối 1: Tóm tắt Học sinh & Trạng thái */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/40 border border-blue-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-white border border-blue-200 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center font-black text-[#0A62D6] text-sm uppercase">
              {request.student_avatar ? (
                <Image
                  src={request.student_avatar}
                  alt={request.student_name}
                  width={48}
                  height={48}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-full h-full object-cover"
                />
              ) : (
                request.student_name.slice(0, 2)
              )}
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                {request.student_name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                {request.phone_zalo && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{request.phone_zalo}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Badge Trạng thái: Chỉ gồm 3 trạng thái */}
          <div>
            {request.status === ExchangeRequestStatus.PENDING && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-extrabold">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Chờ cô xét duyệt</span>
              </span>
            )}
            {request.status === ExchangeRequestStatus.COMPLETED && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã duyệt</span>
              </span>
            )}
            {request.status === ExchangeRequestStatus.REJECTED && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-extrabold">
                <XCircle className="w-3.5 h-3.5" />
                <span>
                  {isSpinGift
                    ? "Đã từ chối (Hoàn hộp quà)"
                    : "Đã từ chối (Hoàn xu)"}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Khối Hiển thị Lý do từ chối của giáo viên (nếu có) */}
        {request.status === ExchangeRequestStatus.REJECTED && request.rejection_reason && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1 animate-in fade-in duration-150">
            <span className="font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Lý do từ chối:
            </span>
            <p className="text-rose-900 font-semibold pl-5 text-[13px]">
              &ldquo;{request.rejection_reason}&rdquo;
            </p>
          </div>
        )}

        {/* Lý do từ chối của cô giáo nếu có */}
        {request.status === ExchangeRequestStatus.REJECTED && request.rejection_reason && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/90 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <XCircle className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-extrabold text-rose-950 uppercase tracking-wider block">
                Lý do cô giáo từ chối:
              </span>
              <p className="text-rose-800 font-semibold leading-relaxed">
                {request.rejection_reason}
              </p>
            </div>
          </div>
        )}

        {/* Khối 2: Thông số Quy đổi (Xu Heo đất -> VNĐ) */}
        <div
          className={`grid gap-3 ${isSpinGift ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {!isSpinGift && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Xu Heo Đất khấu trừ
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-900 font-heading">
                  -{request.coins_to_exchange.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                <Image
                  src="/coin.webp"
                  alt="Coin"
                  width={20}
                  height={20}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-5"
                />
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                {isSpinGift ? "Giá trị món quà" : "Giá trị quy đổi"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-900 font-heading">
                {request.amount_vnd.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Khối 3: Chi tiết Hình thức Đổi Quà */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hình thức nhận quà
            </span>
            <span className="text-xs font-extrabold text-[#0F172A]">
              {getExchangeChoiceTypeLabel(request.choice_type)}
            </span>
          </div>

          {/* Trường hợp 1: Quà tặng tự chọn (đổi xu hoặc trúng Spin) */}
          {isGiftLike && (
            <div className="space-y-3">
              {request.shopee_product_url && (
                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-orange-950 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-orange-600" />
                      <span>Đường dẫn sản phẩm học sinh gửi:</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-orange-900 px-2 py-0.5 rounded-md bg-white border border-orange-200 cursor-pointer shadow-2xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <a
                    href={request.shopee_product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 hover:text-orange-900 hover:underline break-all bg-white/80 p-2 rounded-lg border border-orange-200/60"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>{request.shopee_product_url}</span>
                  </a>
                </div>
              )}

              {/* Ghi chú chi tiết của học sinh */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Ghi chú phân loại của học sinh (Màu sắc, kích cỡ, mã món quà):
                </span>
                <p className="text-xs text-slate-800 font-medium">
                  {request.shopee_note || "Không có ghi chú thêm."}
                </p>
              </div>

              {/* Gợi ý giáo viên */}
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-2 text-xs text-blue-900">
                <AlertCircle className="w-4 h-4 text-[#0A62D6] shrink-0 mt-0.5" />
                <span>
                  Cô đặt mua quà theo link trên. Khi duyệt yêu cầu, hệ thống sẽ lưu vết lịch sử phê duyệt.
                </span>
              </div>
            </div>
          )}

          {/* Trường hợp 2: Tiền mặt / Chuyển khoản */}
          {isCash && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Thông tin nhận tiền / Số tài khoản ngân hàng của phụ huynh:
                </span>
                <p className="text-xs text-slate-800 font-medium whitespace-pre-line">
                  {request.shopee_note || "Nhận tiền mặt trực tiếp tại lớp học."}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Khi bấm <strong>&ldquo;Duyệt yêu cầu&rdquo;</strong>, hệ thống tự động hoàn tất yêu cầu và lưu vết lịch sử giao dịch.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Khối 4: Lịch sử giao dịch */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Lịch sử giao dịch
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Gửi lúc: <strong>{formatDate(request.created_at)}</strong></span>
            </div>

            {request.processed_at && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Xử lý bởi: <strong>{request.processor_name || "Giáo viên"}</strong> ({formatDate(request.processed_at)})
                </span>
              </div>
            )}
          </div>
        </div>
      </ModalBody>

      {/* 3. Footer Modal */}
      <ModalFooter className="flex items-center justify-between gap-3 p-4 bg-slate-50 border-t border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-2xs"
        >
          Đóng
        </button>

        <div className="flex items-center gap-2">
          {/* Nút Từ chối (khi pending) */}
          {request.status === ExchangeRequestStatus.PENDING && onReject && (
            <button
              type="button"
              onClick={() => {
                onReject(request);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-200 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>
                {isSpinGift ? "Từ chối (Hoàn hộp quà)" : "Từ chối (Hoàn xu)"}
              </span>
            </button>
          )}

          {/* Nút Duyệt trực tiếp (khi pending) */}
          {request.status === ExchangeRequestStatus.PENDING && onApproveAndDeliver && (
            <button
              type="button"
              onClick={() => {
                onApproveAndDeliver(request);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Duyệt yêu cầu</span>
            </button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
