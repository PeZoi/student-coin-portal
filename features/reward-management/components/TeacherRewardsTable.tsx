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
  AlertCircle,
  AlertTriangle,
  MessageSquareQuote,
  Phone,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ExchangeSortField,
} from "../types";
import {
  ExchangeChoiceType,
  ExchangeRequestStatus,
} from "@/constants/rewards";
import { formatDate } from "@/lib/date";
import { useTeacherRewardsContext } from "../contexts/TeacherRewardsContext";

export function TeacherRewardsTable() {
  const {
    paginatedRequests: requests,
    sortField,
    sortOrder,
    handleSortToggle: onSortToggle,
    handleOpenDetail: onSelectRequest,
    handleApproveAndDeliver: onApproveAndDeliver,
    handleOpenRejectModal: onReject,
    selection,
    allVisibleIds,
  } = useTeacherRewardsContext();

  const { isSelected, handleToggleSelect, isAllSelected, handleSelectAll } =
    selection;
  const renderSortIcon = (field: ExchangeSortField) => {
    if (sortField !== field || sortOrder === "none") {
      return (
        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
      );
    }
    if (sortOrder === "asc") {
      return <ChevronUp className="w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0" />;
    }
    return <ChevronDown className="w-3.5 h-3.5 text-[#0A62D6] ml-1 shrink-0" />;
  };

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
          Thử thay đổi bộ lọc trạng thái, hình thức hoặc tìm kiếm bằng từ khóa khác.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {/* 0. Cột Checkbox chọn hàng loạt (44px) */}
          <TableHead className="w-11 py-3 px-3 text-center">
            <input
              type="checkbox"
              aria-label="Chọn tất cả yêu cầu trên trang"
              disabled={allVisibleIds.length === 0}
              checked={isAllSelected(allVisibleIds)}
              onChange={() => handleSelectAll(allVisibleIds)}
              className="w-4 h-4 rounded-sm border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </TableHead>

          {/* 1. Cột Học sinh (20%) */}
          <TableHead className="w-[19%] py-3 px-3">
            {onSortToggle ? (
              <button
                type="button"
                onClick={() => onSortToggle("student_name")}
                className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
              >
                <span>Học sinh</span>
                {renderSortIcon("student_name")}
              </button>
            ) : (
              <span>Học sinh</span>
            )}
          </TableHead>

          {/* 2. Cột Hình thức (12%) */}
          <TableHead className="w-[12%] py-3 px-3">
            {onSortToggle ? (
              <button
                type="button"
                onClick={() => onSortToggle("choice_type")}
                className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
              >
                <span>Hình thức</span>
                {renderSortIcon("choice_type")}
              </button>
            ) : (
              <span>Hình thức</span>
            )}
          </TableHead>

          {/* 3. Cột Quy đổi (13%) */}
          <TableHead className="w-[13%] py-3 px-3">
            {onSortToggle ? (
              <button
                type="button"
                onClick={() => onSortToggle("amount_vnd")}
                className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
              >
                <span>Quy đổi</span>
                {renderSortIcon("amount_vnd")}
              </button>
            ) : (
              <span>Quy đổi</span>
            )}
          </TableHead>

          {/* 4. Cột Chi tiết / Link (18%) */}
          <TableHead className="w-[18%] py-3 px-3">
            <span className="text-xs font-bold text-slate-700 select-none">
              Chi tiết / Link món quà
            </span>
          </TableHead>

          {/* 5. Cột Trạng thái (13%) */}
          <TableHead className="w-[13%] py-3 px-3 text-center">
            {onSortToggle ? (
              <button
                type="button"
                onClick={() => onSortToggle("status")}
                className="inline-flex items-center justify-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
              >
                <span>Trạng thái</span>
                {renderSortIcon("status")}
              </button>
            ) : (
              <span>Trạng thái</span>
            )}
          </TableHead>

          {/* 6. Cột Thời gian gửi (12%) */}
          <TableHead className="w-[12%] py-3 px-3">
            {onSortToggle ? (
              <button
                type="button"
                onClick={() => onSortToggle("created_at")}
                className="flex items-center text-xs font-bold text-slate-700 hover:text-[#0A62D6] transition-colors cursor-pointer select-none"
              >
                <span>Thời gian</span>
                {renderSortIcon("created_at")}
              </button>
            ) : (
              <span>Thời gian</span>
            )}
          </TableHead>

          {/* 7. Cột Thao tác (11%) */}
          <TableHead align="right" className="w-[11%] py-3 pr-4 pl-2 text-right">
            <span className="text-xs font-bold text-slate-700 select-none">
              Thao tác
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {requests.map((req) => {
          const isCash = req.choice_type === ExchangeChoiceType.CASH;
          const isGift =
            req.choice_type === ExchangeChoiceType.GIFT ||
            (req.choice_type as string) === "shopee";

          const checked = isSelected(req.id);

          return (
            <TableRow
              key={req.id}
              className={cn(
                "group transition-colors",
                checked ? "bg-[#EAF2FF]/50 hover:bg-[#EAF2FF]/70" : "hover:bg-slate-50/70"
              )}
            >
              {/* Cột 0: Checkbox chọn dòng */}
              <TableCell className="py-3 px-3 text-center">
                <input
                  type="checkbox"
                  aria-label={`Chọn yêu cầu của học sinh ${req.student_name}`}
                  checked={checked}
                  onChange={() => handleToggleSelect(req.id)}
                  className="w-4 h-4 rounded-sm border-slate-300 text-[#0A62D6] focus:ring-[#0A62D6] cursor-pointer"
                />
              </TableCell>

              {/* Cột 1: Thông tin học sinh */}
              <TableCell className="py-3 px-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative">
                    {req.student_avatar ? (
                      <Image
                        src={req.student_avatar}
                        alt={req.student_name}
                        width={36}
                        height={36}
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
                    <div
                      className="font-bold text-xs sm:text-sm text-[#0F172A] group-hover:text-[#0A62D6] transition-colors truncate"
                      title={req.student_name}
                    >
                      {req.student_name}
                    </div>
                    {req.phone_zalo ? (
                      <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{req.phone_zalo}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              {/* Cột 2: Hình thức đổi quà */}
              <TableCell className="py-3 px-3">
                {isCash ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold whitespace-nowrap">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tiền mặt</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200/80 text-xs font-bold whitespace-nowrap">
                    <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>Quà tuỳ chọn</span>
                  </span>
                )}
              </TableCell>

              {/* Cột 3: Xu quy đổi & Số tiền */}
              <TableCell className="py-3 px-3">
                <div className="font-extrabold text-[#0F172A] text-xs sm:text-sm tabular-nums truncate">
                  {req.amount_vnd.toLocaleString("vi-VN")} đ
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-0.5 tabular-nums">
                  <Image
                    src="/coin.webp"
                    alt="Xu"
                    width={14}
                    height={14}
                    unoptimized
                    style={{ height: "auto" }}
                    className="w-3.5 h-3.5 object-contain shrink-0"
                  />
                  <span>-{req.coins_to_exchange.toLocaleString("vi-VN")}</span>
                </div>
              </TableCell>

              {/* Cột 4: Chi tiết / Link món quà (Kèm cảnh báo khi thiếu link) */}
              <TableCell className="py-3 px-3">
                {isGift ? (
                  <div className="space-y-1.5 min-w-0">
                    {!req.shopee_product_url ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Thiếu link quà</span>
                      </span>
                    ) : !req.shopee_product_url.startsWith("http") ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
                        <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>Link không hợp lệ</span>
                      </span>
                    ) : (
                      <a
                        href={req.shopee_product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline max-w-full"
                        title={req.shopee_product_url}
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>Xem link món quà</span>
                      </a>
                    )}
                    {req.shopee_note && (
                      <p
                        className="text-xs text-slate-600 leading-relaxed italic break-words"
                        title={req.shopee_note}
                      >
                        &ldquo;{req.shopee_note}&rdquo;
                      </p>
                    )}
                    {req.rejection_reason && (
                      <div className="flex items-start gap-1 text-[11px] text-rose-600 font-semibold bg-rose-50/80 p-1.5 rounded-md border border-rose-200/70">
                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                        <span>Từ chối: {req.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="min-w-0 space-y-1">
                    {req.shopee_note ? (
                      <div
                        className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed break-words"
                        title={req.shopee_note}
                      >
                        <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{req.shopee_note}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Tiền mặt tại lớp
                      </span>
                    )}
                    {req.rejection_reason && (
                      <div className="flex items-start gap-1 text-[11px] text-rose-600 font-semibold bg-rose-50/80 p-1.5 rounded-md border border-rose-200/70">
                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                        <span>Từ chối: {req.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                )}
              </TableCell>

              {/* Cột 5: Trạng thái (Chỉ còn: PENDING, COMPLETED, REJECTED) */}
              <TableCell className="py-3 px-3 text-center">
                {req.status === ExchangeRequestStatus.PENDING && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600 shrink-0" />
                    <span>Chờ cô duyệt</span>
                  </span>
                )}

                {req.status === ExchangeRequestStatus.COMPLETED && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0] text-xs font-bold whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span>Đã duyệt</span>
                  </span>
                )}

                {req.status === ExchangeRequestStatus.REJECTED && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold whitespace-nowrap">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Đã từ chối</span>
                  </span>
                )}
              </TableCell>

              {/* Cột 6: Thời gian */}
              <TableCell className="py-3 px-3">
                <div className="text-xs font-medium text-slate-700 truncate">
                  {formatDate(req.created_at)}
                </div>
                {req.processor_name && (
                  <div
                    className="text-[11px] text-slate-400 truncate mt-0.5"
                    title={`Bởi ${req.processor_name}`}
                  >
                    bởi {req.processor_name}
                  </div>
                )}
              </TableCell>

              {/* Cột 7: Thao tác */}
              <TableCell align="right" className="py-3 pr-4 pl-2 text-right">
                <div className="inline-flex items-center justify-end gap-1.5">
                  {/* Xem chi tiết */}
                  <Tooltip content="Xem chi tiết yêu cầu" side="top">
                    <button
                      type="button"
                      onClick={() => onSelectRequest(req)}
                      className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center justify-center active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  {/* Khi PENDING: Nút Duyệt (Icon Check xanh lá với Tooltip) */}
                  {req.status === ExchangeRequestStatus.PENDING && onApproveAndDeliver && (
                    <Tooltip content="Duyệt yêu cầu ngay" side="top">
                      <button
                        type="button"
                        onClick={() => onApproveAndDeliver(req)}
                        className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </Tooltip>
                  )}

                  {/* Khi PENDING: Nút Từ chối (Icon X đỏ với Tooltip) */}
                  {req.status === ExchangeRequestStatus.PENDING && onReject && (
                    <Tooltip content="Từ chối yêu cầu (Hoàn xu)" side="top">
                      <button
                        type="button"
                        onClick={() => onReject(req)}
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center justify-center active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
