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
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TeacherExchangeRequestItem } from "../../types/rewards";
import { ExchangeChoiceType, ExchangeRequestStatus } from "@/constants/rewards";
import { formatDate } from "@/lib/date";

interface TeacherRewardsGridProps {
  requests: TeacherExchangeRequestItem[];
  onSelectRequest: (request: TeacherExchangeRequestItem) => void;
  onApproveAndDeliver?: (request: TeacherExchangeRequestItem) => void;
  onReject?: (request: TeacherExchangeRequestItem) => void;
}

export function TeacherRewardsGrid({
  requests,
  onSelectRequest,
  onApproveAndDeliver,
  onReject,
}: TeacherRewardsGridProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((req) => {
        const isCash = req.choice_type === ExchangeChoiceType.CASH;
        const isShopee = req.choice_type === ExchangeChoiceType.SHOPEE;

        return (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-[#0A62D6]/40 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between overflow-hidden group"
          >
            {/* 1. Header Card: Học sinh & Trạng thái */}
            <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative">
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
                <div className="min-w-0">
                  <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm group-hover:text-[#0A62D6] transition-colors truncate">
                    {req.student_name}
                  </h3>
                  {req.phone_zalo ? (
                    <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{req.phone_zalo}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Badge Trạng thái: Đồng bộ kích thước font và padding với StudentStatusBadge & MissionStatusBadge */}
              <div>
                {req.status === ExchangeRequestStatus.PENDING && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600 shrink-0" />
                    <span>Chờ cô duyệt</span>
                  </span>
                )}
                {req.status === ExchangeRequestStatus.COMPLETED && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0] text-xs font-bold whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span>Đã duyệt & trao</span>
                  </span>
                )}
                {req.status === ExchangeRequestStatus.REJECTED && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold whitespace-nowrap">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Đã từ chối</span>
                  </span>
                )}
              </div>
            </div>

            {/* 2. Body Card: Giá trị quy đổi & Chi tiết */}
            <div className="p-4 space-y-3 flex-1">
              {/* Box Quy đổi */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isCash
                    ? "bg-emerald-50/50 border-emerald-200/80"
                    : "bg-orange-50/50 border-orange-200/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {isCash ? (
                      <Banknote className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-500">
                      {isCash ? "Tiền mặt" : "Quà tự chọn"}
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {req.amount_vnd.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 block">Xu khấu trừ</span>
                  <div className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Image
                      src="/coin.webp"
                      alt="Xu"
                      width={13}
                      height={13}
                      unoptimized
                      style={{ height: "auto" }}
                      className="w-3.2"
                    />
                    <span>-{req.coins_to_exchange.toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin Shopee hoặc ghi chú tiền mặt */}
              {isShopee && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  {req.shopee_product_url && (
                    <a
                      href={req.shopee_product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-orange-700 font-bold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Mở link sản phẩm Shopee</span>
                    </a>
                  )}
                  {req.shopee_note && (
                    <p className="text-slate-600 line-clamp-2 text-xs italic">
                      &ldquo;{req.shopee_note}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {isCash && req.shopee_note && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                    Ghi chú nhận tiền:
                  </span>
                  <p className="text-slate-700 text-xs line-clamp-2">
                    {req.shopee_note}
                  </p>
                </div>
              )}
            </div>

            {/* 3. Footer Card: Ngày tạo & Phím hành động */}
            <div className="p-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(req.created_at)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Tooltip content="Xem chi tiết" side="top">
                  <button
                    type="button"
                    onClick={() => onSelectRequest(req)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </Tooltip>

                {/* Duyệt & Trao trực tiếp */}
                {req.status === ExchangeRequestStatus.PENDING && onApproveAndDeliver && (
                  <Tooltip content="Duyệt & Trao quà" side="top">
                    <button
                      type="button"
                      onClick={() => onApproveAndDeliver(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Duyệt & Trao</span>
                    </button>
                  </Tooltip>
                )}

                {/* Từ chối */}
                {req.status === ExchangeRequestStatus.PENDING && onReject && (
                  <Tooltip content="Từ chối (Hoàn xu)" side="top">
                    <button
                      type="button"
                      onClick={() => onReject(req)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all shadow-2xs cursor-pointer"
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
