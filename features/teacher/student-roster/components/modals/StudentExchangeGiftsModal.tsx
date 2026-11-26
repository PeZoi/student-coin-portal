"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import useSWR from "swr";
import {
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Phone,
  Banknote,
  Gift,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { studentRosterService } from "../../services/studentRosterService";
import { useStudentRosterContext } from "../../contexts/StudentRosterContext";
import {
  CACHE_KEYS,
  ExchangeChoiceType,
  EXCHANGE_CHOICE_TYPE_LABELS,
  ExchangeRequestStatus,
  getExchangeChoiceTypeLabel,
} from "@/constants";

type GiftFilterTab = "all" | "cash" | "gift" | "spin_gift";

/**
 * Modal hiển thị chi tiết lịch sử đổi quà của học sinh
 * - Khớp 100% với schema bảng DB `monthly_exchange_requests`
 * - Hiển thị đẹp mắt, cân xứng và đầy đặn cho cả 2 cách đổi quà:
 *   1. 'cash': Đổi thành tiền thật (VNĐ) với đầy đủ thông tin hình thức trao, tỷ lệ quy đổi và người nhận
 *   2. 'gift': Đổi thành quà tự chọn bằng link kèm ghi chú món đồ và link mua hàng
 */
export function StudentExchangeGiftsModal() {
  const {
    isRewardsModalOpen: isOpen,
    handleCloseRewardsModal: onClose,
    rewardsStudent: student,
  } = useStudentRosterContext();
  const [filterTab, setFilterTab] = useState<GiftFilterTab>("all");

  const { data: exchangeData, isLoading } = useSWR(
    isOpen && student?.id ? CACHE_KEYS.ROSTER.EXCHANGE_REQUESTS(student.id) : null,
    () => studentRosterService.getStudentExchangeRequests(student!.id),
    {
      revalidateOnFocus: false,
    }
  );

  const requests = useMemo(() => {
    return exchangeData?.requests || student?.exchange_requests || [];
  }, [exchangeData, student]);

  // Thống kê nhanh
  const cashRequests = useMemo(
    () => requests.filter((r) => r.choice_type === ExchangeChoiceType.CASH),
    [requests]
  );
  const giftRequests = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.choice_type === ExchangeChoiceType.GIFT ||
          (r.choice_type as string) === "shopee"
      ),
    [requests]
  );
  const spinGiftRequests = useMemo(
    () =>
      requests.filter((r) => r.choice_type === ExchangeChoiceType.SPIN_GIFT),
    [requests]
  );

  const totalCashVnd = useMemo(
    () => cashRequests.reduce((sum, r) => sum + r.amount_vnd, 0),
    [cashRequests]
  );
  const totalCoinsUsed = useMemo(
    () => requests.reduce((sum, r) => sum + r.coins_to_exchange, 0),
    [requests]
  );

  // Lọc theo Tab đã chọn
  const filteredRequests = useMemo(() => {
    if (filterTab === "cash") return cashRequests;
    if (filterTab === "gift") return giftRequests;
    if (filterTab === "spin_gift") return spinGiftRequests;
    return requests;
  }, [filterTab, requests, cashRequests, giftRequests, spinGiftRequests]);

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      {/* 1. Header Modal */}
      <ModalHeader
        icon={
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Image
              src="/rewards/shopee_gift.webp"
              alt="Đổi quà Heo Đất"
              width={36}
              height={36}
              unoptimized
              style={{ height: "auto" }}
              className="w-7 h-7 object-contain"
            />
          </div>
        }
        title={
          <div className="flex items-center gap-2">
            <span>Lịch sử đổi quà Heo Đất</span>
          </div>
        }
        description={
          <span className="flex items-center gap-2">
            <strong>{student.full_name}</strong>
            <span>•</span>
            <span>Đã đổi {student.redeemed_rewards_count} phần quà & tiền mặt</span>
          </span>
        }
        onClose={onClose}
      />

      {/* 2. Nội dung chi tiết */}
      <ModalBody className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
        {/* Thẻ học sinh & Tóm tắt chỉ số */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-indigo-50/50 border border-blue-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-white border border-blue-200 overflow-hidden shrink-0 shadow-2xs relative">
              {student.avatar_url ? (
                <Image
                  src={student.avatar_url}
                  alt={student.full_name}
                  width={48}
                  height={48}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-[#0A62D6] uppercase flex items-center justify-center w-full h-full">
                  {student.full_name.slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                {student.full_name}
              </h3>
              {student.phone_zalo && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{student.phone_zalo}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-0.5">
                Số dư hiện có:{" "}
                <strong className="text-amber-600 font-bold">
                  {student.current_coins.toLocaleString("vi-VN")} xu
                </strong>
              </p>
            </div>
          </div>

          {/* KPI mini 3 cột */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center shrink-0">
            <div className="px-3 py-2 rounded-xl bg-white/90 border border-blue-100 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                Tiền mặt
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600">
                {totalCashVnd.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/90 border border-blue-100 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                Quà tự chọn
              </span>
              <span className="text-xs sm:text-sm font-black text-[#0A62D6]">
                {giftRequests.length + spinGiftRequests.length} món
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/90 border border-blue-100 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                Xu đã đổi
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-600">
                {totalCoinsUsed.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* Thanh tiêu đề & Bộ lọc Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-4 h-4 text-[#0A62D6] shrink-0" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Lịch sử đổi quà ({requests.length})
            </h4>
          </div>

          {/* Tabs bộ lọc: Tất cả | Tiền mặt | Quà tặng | Quà Spin */}
          {requests.length > 0 && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start sm:self-auto text-xs font-semibold overflow-x-auto [scrollbar-width:none] max-w-full">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  filterTab === "all"
                    ? "bg-white text-[#0F172A] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả ({requests.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("cash")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  filterTab === "cash"
                    ? "bg-white text-emerald-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tiền mặt ({cashRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("gift")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  filterTab === "gift"
                    ? "bg-white text-orange-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quà tặng ({giftRequests.length})
              </button>
              {spinGiftRequests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterTab("spin_gift")}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    filterTab === "spin_gift"
                      ? "bg-white text-purple-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Quà Spin ({spinGiftRequests.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Danh sách các lần đổi quà */}
        {isLoading && !exchangeData ? (
          <div className="py-14 flex flex-col items-center justify-center gap-2.5 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A62D6]" />
            <span className="text-xs sm:text-sm font-medium">Đang tải lịch sử đổi quà...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-14 h-14 mx-auto mb-2 flex items-center justify-center">
              <Image
                src="/rewards/shopee_gift.webp"
                alt="Chưa có dữ liệu"
                width={56}
                height={56}
                unoptimized
                style={{ height: "auto" }}
                className="w-12 h-12 object-contain opacity-40 grayscale"
              />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Không có yêu cầu đổi quà nào trong mục này
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {filterTab === "cash"
                ? "Học sinh chưa có yêu cầu đổi lấy tiền mặt nào."
                : filterTab === "gift"
                ? "Học sinh chưa có yêu cầu đổi quà tặng tự chọn nào."
                : filterTab === "spin_gift"
                ? "Học sinh chưa có phần thưởng đổi quà từ Vòng quay may mắn."
                : "Học sinh chưa thực hiện đổi quà trong các kỳ vừa qua."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((item, index) => {
              const isCash = item.choice_type === ExchangeChoiceType.CASH;
              const isSpinGift = item.choice_type === ExchangeChoiceType.SPIN_GIFT;
              const isGift =
                item.choice_type === ExchangeChoiceType.GIFT ||
                (item.choice_type as string) === "shopee";
              const isGiftLike = isGift || isSpinGift;

              return (
                <div
                  key={item.id || index}
                  className={`p-4 rounded-2xl border transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCash
                      ? "bg-white hover:bg-emerald-50/20 border-slate-200/90 hover:border-emerald-300/80"
                      : isSpinGift
                        ? "bg-white hover:bg-purple-50/20 border-slate-200/90 hover:border-purple-300/80"
                        : "bg-white hover:bg-orange-50/20 border-slate-200/90 hover:border-orange-300/80"
                  }`}
                >
                  {/* Khối bên trái: Icon đồ họa + Thông tin */}
                  <div className={`flex gap-3.5 min-w-0 flex-1 ${isCash ? "items-center" : "items-start"}`}>
                    {/* Icon đồ họa sắc nét */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border p-1 shadow-2xs ${
                        isCash
                          ? "bg-emerald-50/90 border-emerald-200/80"
                          : isSpinGift
                            ? "bg-purple-50/90 border-purple-200/80"
                            : "bg-orange-50/90 border-orange-200/80"
                      }`}
                    >
                      <Image
                        src={
                          isCash
                            ? "/rewards/cash_reward.webp"
                            : "/rewards/shopee_gift.webp"
                        }
                        alt={getExchangeChoiceTypeLabel(item.choice_type)}
                        width={48}
                        height={48}
                        unoptimized
                        style={{ height: "auto" }}
                        className="w-9 h-9 object-contain"
                      />
                    </div>

                    {/* Nội dung thông tin */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Badge loại hình + Kỳ đánh giá */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCash ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200/80">
                            <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{EXCHANGE_CHOICE_TYPE_LABELS[ExchangeChoiceType.CASH]}</span>
                          </span>
                        ) : isSpinGift ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border bg-purple-50 text-purple-700 border-purple-200/80">
                            <Gift className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{EXCHANGE_CHOICE_TYPE_LABELS[ExchangeChoiceType.SPIN_GIFT]}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border bg-orange-50 text-orange-700 border-orange-200/80">
                            <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            <span>{EXCHANGE_CHOICE_TYPE_LABELS[ExchangeChoiceType.GIFT]}</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Kỳ đánh giá: Tháng {item.month}/{item.year}</span>
                        </span>
                      </div>

                      {/* Khi là quà tặng theo link (Quà tuỳ chọn hoặc Quà Spin) */}
                      {isGiftLike && (
                        <>
                          <p className="text-xs font-bold text-[#0F172A] leading-relaxed line-clamp-2">
                            Món quà đã chọn:{" "}
                            <span className="font-medium text-slate-700">
                              {item.shopee_note || "Chưa có ghi chú quà tặng"}
                            </span>
                          </p>

                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            {item.shopee_product_url ? (
                              <a
                                href={item.shopee_product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-bold text-[#0A62D6] hover:text-[#0850B0] bg-blue-50/80 px-2.5 py-0.5 rounded-md border border-blue-100 transition-colors"
                              >
                                <span>Mở link sản phẩm</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">
                                Học sinh chưa đính kèm link sản phẩm
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {/* Khi là tiền mặt và có ghi chú */}
                      {isCash && item.shopee_note && (
                        <p className="text-xs text-slate-500 italic">
                          {item.shopee_note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Khối bên phải: Giá trị quy đổi & Trạng thái */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100 min-w-[130px]">
                    <div className="text-left md:text-right">
                      <span className="text-sm sm:text-base font-black text-[#0F172A] block tracking-tight">
                        {item.amount_vnd.toLocaleString("vi-VN")} đ
                      </span>
                      {!isSpinGift && item.coins_to_exchange > 0 && (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 mt-0.5 tabular-nums">
                          <Image
                            src="/wheel/coin.webp"
                            alt="Xu"
                            width={14}
                            height={14}
                            unoptimized
                            style={{ height: "auto" }}
                            className="w-3.5 h-3.5 object-contain shrink-0 drop-shadow-2xs"
                          />
                          <span>-{item.coins_to_exchange.toLocaleString("vi-VN")} xu</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1">
                      {item.status === ExchangeRequestStatus.COMPLETED ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {isCash ? "Đã trao tiền mặt" : "Đã trao quà"}
                          </span>
                        </span>
                      ) : item.status === ExchangeRequestStatus.REJECTED ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Đã từ chối</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Chờ cô duyệt</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ModalBody>

      {/* 3. Footer */}
      <ModalFooter className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer active:scale-98"
        >
          Đóng
        </button>
      </ModalFooter>
    </Modal>
  );
}
