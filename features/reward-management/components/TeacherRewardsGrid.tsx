"use client";

import Image from "next/image";
import {
  ExternalLink,
  Eye,
  Check,
  XCircle,
  Banknote,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherExchangeRequestItem } from "../types";
import {
  ExchangeChoiceType,
  ExchangeRequestStatus,
  ExchangeRequestStatusType,
} from "@/constants/rewards";
import { formatDate } from "@/lib/date";
import { useOptionalTeacherRewardsContext } from "../contexts/TeacherRewardsContext";

export interface TeacherRewardsGridProps {
  requests?: TeacherExchangeRequestItem[];
  onSelectRequest?: (request: TeacherExchangeRequestItem) => void;
  onApproveAndDeliver?: (request: TeacherExchangeRequestItem) => void;
  onReject?: (request: TeacherExchangeRequestItem) => void;
}

/**
 * Cấu hình style phân tầng theo từng trạng thái yêu cầu đổi quà
 * - PENDING: Nền vàng nhạt ấm áp, thân thiện, dễ nhận diện cần xử lý
 * - COMPLETED: Nền xanh lá nhạt tươi mới, thể hiện sự thành công & tin cậy
 * - REJECTED: Nền đỏ nhạt dịu mắt, trang nhã, không gây chói
 * - Các box con bên trong được đặt trên nền trắng (elevated surface) để KHÔNG TRÙNG MÀU với nền card
 */
const getCardStatusTheme = (status: ExchangeRequestStatusType) => {
  switch (status) {
    case ExchangeRequestStatus.PENDING:
      return {
        cardBg: "bg-[#FFFDF0] hover:bg-[#FFFCE6] border-amber-200/90 hover:border-amber-400/80 shadow-2xs hover:shadow-xs",
        headerBg: "bg-amber-100/50 border-amber-200/70",
        footerBg: "bg-amber-100/30 border-amber-200/70",
        boxBg: "bg-white border-amber-200/60 shadow-2xs",
        noteBg: "bg-white/95 border-amber-200/60 shadow-2xs",
        badge: (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-amber-900 border border-amber-300 text-xs font-bold whitespace-nowrap shadow-2xs">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600 shrink-0" />
            <span>Chờ cô duyệt</span>
          </span>
        ),
      };
    case ExchangeRequestStatus.COMPLETED:
      return {
        cardBg: "bg-[#F3FAF5] hover:bg-[#EDF8F0] border-emerald-200/90 hover:border-emerald-400/80 shadow-2xs hover:shadow-xs",
        headerBg: "bg-emerald-100/50 border-emerald-200/70",
        footerBg: "bg-emerald-100/30 border-emerald-200/70",
        boxBg: "bg-white border-emerald-200/60 shadow-2xs",
        noteBg: "bg-white/95 border-emerald-200/60 shadow-2xs",
        badge: (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-emerald-800 border border-emerald-300 text-xs font-bold whitespace-nowrap shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Đã duyệt & trao</span>
          </span>
        ),
      };
    case ExchangeRequestStatus.REJECTED:
      return {
        cardBg: "bg-[#FFF5F5] hover:bg-[#FFEFEF] border-rose-200/90 hover:border-rose-400/80 shadow-2xs hover:shadow-xs",
        headerBg: "bg-rose-100/50 border-rose-200/70",
        footerBg: "bg-rose-100/30 border-rose-200/70",
        boxBg: "bg-white border-rose-200/60 shadow-2xs",
        noteBg: "bg-white/95 border-rose-200/60 shadow-2xs",
        badge: (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-rose-800 border border-rose-300 text-xs font-bold whitespace-nowrap shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Đã từ chối</span>
          </span>
        ),
      };
    default:
      return {
        cardBg: "bg-white border-slate-200 shadow-2xs hover:shadow-xs",
        headerBg: "bg-slate-50/50 border-slate-100",
        footerBg: "bg-slate-50/50 border-slate-100",
        boxBg: "bg-white border-slate-200 shadow-2xs",
        noteBg: "bg-white border-slate-200 shadow-2xs",
        badge: null,
      };
  }
};

export function TeacherRewardsGrid(props?: TeacherRewardsGridProps) {
  const context = useOptionalTeacherRewardsContext();

  const requests = props?.requests ?? context?.paginatedRequests ?? [];
  const onSelectRequest =
    props?.onSelectRequest ?? context?.handleOpenDetail ?? (() => {});
  const onApproveAndDeliver =
    props?.onApproveAndDeliver ?? context?.handleApproveAndDeliver;
  const onReject = props?.onReject ?? context?.handleOpenRejectModal;
  if (requests.length === 0) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A]">
          Không tìm thấy yêu cầu đổi quà nào
        </h3>
        <p className="text-sm text-[#475569] mt-1 max-w-sm mx-auto">
          Thử thay đổi bộ lọc trạng thái, hình thức hoặc chuyển đổi kỳ đổi thưởng khác.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((req) => {
        const isCash = req.choice_type === ExchangeChoiceType.CASH;
        const isGift =
          req.choice_type === ExchangeChoiceType.GIFT ||
          (req.choice_type as string) === "shopee";
        const theme = getCardStatusTheme(req.status);

        return (
          <div
            key={req.id}
            className={cn(
              "rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group",
              theme.cardBg
            )}
          >
            {/* 1. Header Card: Học sinh & Trạng thái */}
            <div
              className={cn(
                "p-4 border-b flex items-start justify-between gap-3 transition-colors",
                theme.headerBg
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200/90 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative">
                  {req.student_avatar ? (
                    <Image
                      src={req.student_avatar}
                      alt={req.student_name}
                      width={40}
                      height={40}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      {req.student_name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm group-hover:text-[#0A62D6] transition-colors truncate">
                    {req.student_name}
                  </h3>
                  {req.phone_zalo ? (
                    <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{req.phone_zalo}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Badge Trạng thái: Nổi bật trên nền trắng bo viền màu trạng thái */}
              <div className="shrink-0">{theme.badge}</div>
            </div>

            {/* 2. Body Card: Giá trị quy đổi & Chi tiết (Nền trắng chống trùng màu) */}
            <div className="p-4 space-y-3 flex-1">
              {/* Box Quy đổi: Luôn dùng nền trắng nổi khối để KHÔNG TRÙNG MÀU với card background */}
              <div
                className={cn(
                  "p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors",
                  theme.boxBg
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Container Icon chuyên biệt theo hình thức đổi */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border",
                      isCash
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200/80"
                        : "bg-orange-50 text-orange-600 border-orange-200/80"
                    )}
                  >
                    {isCash ? (
                      <Banknote className="w-5 h-5 stroke-[2.2]" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-500">
                      {isCash ? "Tiền mặt" : "Quà tự chọn"}
                    </span>
                    <span className="text-base font-black text-[#0F172A] tracking-tight truncate block">
                      {req.amount_vnd.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                {/* Badge Xu khấu trừ: Luôn sắc nét trên nền box trắng */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Xu khấu trừ
                  </span>
                  <div className="inline-flex items-center gap-1 text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/90 shadow-2xs">
                    <Image
                      src="/coin.webp"
                      alt="Xu"
                      width={13}
                      height={13}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-3.5 object-contain"
                    />
                    <span>-{req.coins_to_exchange.toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin Món quà hoặc ghi chú tiền mặt: Đặt trên thẻ trắng nhẹ nhàng */}
              {isGift && (
                <div
                  className={cn(
                    "p-3 rounded-xl border space-y-1.5 text-xs transition-colors",
                    theme.noteBg
                  )}
                >
                  {req.shopee_product_url && (
                    <a
                      href={req.shopee_product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-bold hover:underline transition-colors max-w-full"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Mở link món quà</span>
                    </a>
                  )}
                  {req.shopee_note && (
                    <p className="text-slate-600 line-clamp-2 text-xs italic leading-relaxed break-words">
                      &ldquo;{req.shopee_note}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {isCash && req.shopee_note && (
                <div
                  className={cn(
                    "p-3 rounded-xl border text-xs transition-colors",
                    theme.noteBg
                  )}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Ghi chú nhận tiền:
                  </span>
                  <p className="text-slate-700 text-xs line-clamp-2 leading-relaxed break-words">
                    {req.shopee_note}
                  </p>
                </div>
              )}

              {/* Box hiển thị Lý do từ chối của giáo viên (nếu bị từ chối) */}
              {req.status === ExchangeRequestStatus.REJECTED && req.rejection_reason && (
                <div className="p-3 rounded-xl border border-rose-200/90 bg-white shadow-2xs text-xs space-y-1">
                  <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    Lý do từ chối:
                  </span>
                  <p className="text-rose-800 text-xs font-semibold leading-relaxed break-words">
                    {req.rejection_reason}
                  </p>
                </div>
              )}
            </div>

            {/* 3. Footer Card: Ngày tạo & Phím hành động */}
            <div
              className={cn(
                "p-3 px-4 border-t flex items-center justify-between gap-2 transition-colors",
                theme.footerBg
              )}
            >
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(req.created_at)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Tooltip content="Xem chi tiết" side="top">
                  <button
                    type="button"
                    onClick={() => onSelectRequest(req)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0A62D6] border border-slate-200 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </Tooltip>

                {/* Khi PENDING: Duyệt & Trao trực tiếp (1-Click) */}
                {req.status === ExchangeRequestStatus.PENDING && onApproveAndDeliver && (
                  <Tooltip content="Duyệt & Trao quà ngay" side="top">
                    <button
                      type="button"
                      onClick={() => onApproveAndDeliver(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-98"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Duyệt & Trao</span>
                    </button>
                  </Tooltip>
                )}

                {/* Khi PENDING: Nút Từ chối tinh tế */}
                {req.status === ExchangeRequestStatus.PENDING && onReject && (
                  <Tooltip content="Từ chối (Hoàn xu)" side="top">
                    <button
                      type="button"
                      onClick={() => onReject(req)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
