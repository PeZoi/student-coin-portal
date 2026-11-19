"use client";

import { Button3D } from "@/components/ui/Button3D";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Link2, ShoppingBag, Tag, X, AlertCircle } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useConfigStore } from "@/stores/useConfigStore";
import { COIN_STEP, VND_PER_STEP } from "@/constants/rewards";

interface ShopeeExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  isSubmitting: boolean;
  onConfirm: (
    link: string,
    note?: string,
    priceVnd?: number,
    coinsToExchange?: number
  ) => Promise<boolean>;
}

export function ShopeeExchangeModal({
  isOpen,
  onClose,
  currentCoins,
  isSubmitting,
  onConfirm,
}: ShopeeExchangeModalProps) {
  useBodyScrollLock(isOpen);

  // Lấy cấu hình hệ thống động (gọi từ API /api/system/config mỗi lần F5)
  const { configs } = useConfigStore();
  const stepCoins = configs?.exchange_setting?.step_coins ?? COIN_STEP;
  const vndPerStep = configs?.exchange_setting?.vnd_per_step ?? VND_PER_STEP;

  const [link, setLink] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  // Xử lý khi gõ số tiền
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    if (!rawDigits) {
      setPriceInput("");
      return;
    }
    const num = parseInt(rawDigits, 10);
    setPriceInput(num.toLocaleString("vi-VN"));
  };

  // Trích xuất giá trị số
  const rawDigits = priceInput.replace(/\D/g, "");
  const numericPrice = rawDigits ? parseInt(rawDigits, 10) : 0;

  // Tính toán số xu chính xác theo tỷ giá (không chia theo mốc step_coins để không gây thiệt cho học sinh)
  // Tỷ lệ: (numericPrice * stepCoins) / vndPerStep. Ví dụ: 32.000đ * 5000 / 25000 = 6.400 xu
  const rateVndPerCoin = stepCoins > 0 ? vndPerStep / stepCoins : 5;
  const requiredCoins =
    numericPrice > 0 ? Math.ceil((numericPrice * stepCoins) / vndPerStep) : 0;
  const remainingCoins = currentCoins - requiredCoins;
  const isAffordable = currentCoins >= requiredCoins;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim() || numericPrice <= 0 || !isAffordable || isSubmitting) return;
    await onConfirm(link.trim(), note.trim(), numericPrice, requiredCoins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overscroll-contain animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FFF6EA] rounded-[28px] sm:rounded-[32px] border-4 border-white shadow-[0_20px_50px_rgba(0,20,50,0.35)] p-5 sm:p-6 text-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-tight">
              Tự Chọn Quà
            </h3>
            <p className="text-xs sm:text-sm font-heading font-semibold text-orange-700">
              Gửi link món quà con thích để cô kiểm tra và trao quà nhé!
            </p>
          </div>
        </div>

        {/* Khung số dư hiện tại */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl py-2 px-3 mb-4 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-heading font-bold text-amber-900">
            Số xu con đang có:
          </span>
          <div className="flex items-center gap-1.5 font-heading font-black text-base sm:text-lg text-[#E65100]">
            <Image
              src="/wheel/coin.webp"
              alt="Xu"
              width={22}
              height={22}
              unoptimized
              style={{ height: "auto" }}
            />
            <span>{currentCoins.toLocaleString("vi-VN")} xu</span>
          </div>
        </div>

        {/* Form nhập thông tin đổi quà */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Ô nhập đường link món quà */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-slate-700 mb-1">
              Link món quà muốn đổi: <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all px-3 py-2 shadow-sm">
              <Link2 className="w-4 h-4 text-orange-500 flex-shrink-0 mr-2" />
              <input
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Dán link Shopee hoặc link website của món quà vào đây..."
                className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Ô nhập số tiền của món quà */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-slate-700 mb-1">
              Số tiền của món quà (VNĐ): <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all px-3 py-2 shadow-sm">
              <Tag className="w-4 h-4 text-orange-500 flex-shrink-0 mr-2" />
              <input
                type="text"
                inputMode="numeric"
                required
                value={priceInput}
                onChange={handlePriceChange}
                placeholder="Nhập giá tiền món quà (ví dụ: 25.000, 35.000, 50.000...)"
                className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="text-xs sm:text-sm font-heading font-bold text-slate-400 ml-1">
                đ
              </span>
            </div>
          </div>

          {/* 3. Khung tính toán số xu chính xác theo giá tiền thực tế */}
          {numericPrice > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 border-2 border-amber-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 shadow-2xs">
              {/* Dòng 1: Mức xu bị trừ (tính chính xác theo giá tiền) */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-heading font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Image
                    src="/wheel/coin.webp"
                    alt="Xu"
                    width={18}
                    height={18}
                    unoptimized
                    style={{ height: "auto" }}
                    className="w-4 h-4 object-contain"
                  />
                  <span>Số xu Heo Đất cần đổi:</span>
                </span>
                <span className="text-sm sm:text-base font-black text-[#E65100] tabular-nums">
                  -{requiredCoins.toLocaleString("vi-VN")} xu
                </span>
              </div>

              {/* Dòng 2: Tỷ giá quy đổi áp dụng */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-heading font-semibold text-slate-600 bg-white/80 py-1.5 px-2.5 rounded-xl border border-amber-200/60">
                <span>Tỷ giá quy đổi:</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {stepCoins.toLocaleString("vi-VN")} xu = {vndPerStep.toLocaleString("vi-VN")}đ (1 xu = {rateVndPerCoin.toLocaleString("vi-VN")}đ)
                </span>
              </div>

              {/* Dòng 3: Số xu còn lại */}
              <div className="flex items-center justify-between text-xs font-heading font-bold pt-0.5 border-t border-amber-200/60">
                <span className="text-slate-600">Số xu còn lại sau khi đổi:</span>
                <span
                  className={
                    isAffordable
                      ? "text-emerald-700 font-black tabular-nums"
                      : "text-rose-600 font-black tabular-nums"
                  }
                >
                  {isAffordable
                    ? `${remainingCoins.toLocaleString("vi-VN")} xu`
                    : `Không đủ xu (thiếu ${(requiredCoins - currentCoins).toLocaleString("vi-VN")} xu)!`}
                </span>
              </div>

              {/* Cảnh báo nếu không đủ xu */}
              {!isAffordable && (
                <div className="flex items-start gap-1.5 text-[11px] font-heading font-semibold text-rose-700 bg-rose-50/90 p-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    Con hiện có {currentCoins.toLocaleString("vi-VN")} xu, chưa đủ {requiredCoins.toLocaleString("vi-VN")} xu để đổi món quà {numericPrice.toLocaleString("vi-VN")}đ này. Con hãy làm thêm bài tập nhé!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 4. Ô nhập ghi chú món quà */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-slate-700 mb-1">
              Ghi chú thêm:
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Bút dạ 24 màu, Áo thun trắng size M..."
              className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-300 bg-white px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none shadow-sm"
            />
          </div>

          {/* 5. Các nút hành động */}
          <div className="flex items-center gap-3 pt-2">
            <Button3D
              type="button"
              variant="slate"
              size="md"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting}
            >
              HỦY BỎ
            </Button3D>

            <Button3D
              type="submit"
              variant={link.trim() && numericPrice > 0 && isAffordable ? "orange" : "disabled"}
              size="md"
              fullWidth
              disabled={!link.trim() || numericPrice <= 0 || !isAffordable || isSubmitting}
            >
              {isSubmitting ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}
            </Button3D>
          </div>
        </form>
      </div>
    </div>
  );
}
