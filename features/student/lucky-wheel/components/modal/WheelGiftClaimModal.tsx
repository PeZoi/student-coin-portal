"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AlertCircle, Gift, Link2, Sparkles, Tag, X } from "lucide-react";
import { Button3D } from "@/components/ui/Button3D";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useConfigStore } from "@/stores/useConfigStore";
import {
  calculateSpinGiftEquivalentCoins,
  normalizeExchangeConfig,
} from "@/lib/system/exchangeRules";
import { ExchangeSettingConfig } from "@/types/systemConfig";
import { WHEEL_ASSETS } from "@/constants/wheel";

interface WheelGiftClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  unclaimedGiftsCount: number;
  exchangeConfig?: ExchangeSettingConfig;
  isSubmitting: boolean;
  onConfirm: (link: string, note: string, priceVnd: number) => Promise<boolean>;
}

interface WheelGiftClaimFormProps {
  onClose: () => void;
  unclaimedGiftsCount: number;
  maxSpinGiftVnd: number;
  equivalentCoins: number;
  isSubmitting: boolean;
  onConfirm: (link: string, note: string, priceVnd: number) => Promise<boolean>;
}

function WheelGiftClaimForm({
  onClose,
  unclaimedGiftsCount,
  maxSpinGiftVnd,
  equivalentCoins,
  isSubmitting,
  onConfirm,
}: WheelGiftClaimFormProps) {
  const [link, setLink] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [note, setNote] = useState("");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    if (!rawDigits) {
      setPriceInput("");
      return;
    }
    const num = parseInt(rawDigits, 10);
    setPriceInput(num.toLocaleString("vi-VN"));
  };

  const rawDigits = priceInput.replace(/\D/g, "");
  const numericPrice = rawDigits ? parseInt(rawDigits, 10) : 0;
  const isOverLimit = numericPrice > maxSpinGiftVnd;
  const isValidPrice = numericPrice > 0 && !isOverLimit;
  const canSubmit =
    unclaimedGiftsCount > 0 &&
    link.trim().length > 0 &&
    isValidPrice &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onConfirm(link.trim(), note.trim(), numericPrice);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overscroll-contain animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-[#FFFFFF] via-[#FCF9FF] to-[#F5ECFF] rounded-[28px] sm:rounded-[32px] border-4 border-white shadow-[0_20px_50px_rgba(76,29,149,0.32)] p-5 sm:p-6 text-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-100/80 hover:bg-purple-200 text-purple-600 hover:text-purple-900 flex items-center justify-center transition-colors cursor-pointer z-10 disabled:opacity-50"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3 mb-3.5 pr-8">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-tight">
              Mở Hộp Quà Vòng Quay
            </h3>
            <p className="text-xs sm:text-sm font-heading font-semibold text-purple-700">
              Chọn món quà tối đa {maxSpinGiftVnd.toLocaleString("vi-VN")}đ (Miễn phí 0 xu)!
            </p>
          </div>
        </div>

        {/* Khung thông tin hộp quà hiện có */}
        <div className="bg-purple-50/90 border border-purple-200/90 rounded-2xl py-2.5 px-3.5 mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={WHEEL_ASSETS.GIFT}
              alt="Hộp quà"
              width={24}
              height={24}
              unoptimized
              style={{ height: "auto" }}
              className="w-6 h-6 object-contain"
            />
            <span className="text-xs sm:text-sm font-heading font-bold text-purple-950">
              Hộp quà chưa mở:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-sm sm:text-base text-purple-700 tabular-nums">
              {unclaimedGiftsCount} hộp
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              Max {maxSpinGiftVnd.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        {/* Form nhập link món quà */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Ô nhập đường link món quà */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-slate-700 mb-1">
              Link món quà con chọn: <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all px-3 py-2 shadow-sm">
              <Link2 className="w-4 h-4 text-purple-500 flex-shrink-0 mr-2" />
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

          {/* 2. Ô nhập số tiền của món quà (tối đa theo hạn mức hệ thống) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs sm:text-sm font-heading font-bold text-slate-700">
                Số tiền của món quà (VNĐ): <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-heading font-bold text-purple-700">
                Tối đa {maxSpinGiftVnd.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="relative flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all px-3 py-2 shadow-sm">
              <Tag className="w-4 h-4 text-purple-500 flex-shrink-0 mr-2" />
              <input
                type="text"
                inputMode="numeric"
                required
                value={priceInput}
                onChange={handlePriceChange}
                placeholder={`Nhập giá tiền món quà (tối đa ${maxSpinGiftVnd.toLocaleString("vi-VN")}đ)...`}
                className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="text-xs sm:text-sm font-heading font-bold text-slate-400 ml-1">
                đ
              </span>
            </div>
          </div>

          {/* 3. Khung tóm tắt giá trị & kiểm tra hạn mức */}
          {numericPrice > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50/70 border-2 border-purple-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 shadow-2xs">
              <div className="flex items-center justify-between text-xs sm:text-sm font-heading font-bold text-purple-950">
                <span>Giá trị món quà con chọn:</span>
                <span
                  className={
                    isOverLimit
                      ? "text-sm sm:text-base font-black text-rose-600 tabular-nums"
                      : "text-sm sm:text-base font-black text-purple-700 tabular-nums"
                  }
                >
                  {numericPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] sm:text-xs font-heading font-semibold text-slate-600 bg-white/85 py-1.5 px-2.5 rounded-xl border border-purple-200/60">
                <span>Chi phí xu Heo Đất:</span>
                <span className="font-bold text-emerald-700">
                  Miễn phí 0 xu (Hạn mức tối đa{" "}
                  {maxSpinGiftVnd.toLocaleString("vi-VN")}đ ={" "}
                  {equivalentCoins.toLocaleString("vi-VN")} xu)
                </span>
              </div>

              {isOverLimit && (
                <div className="flex items-start gap-1.5 text-[11px] font-heading font-semibold text-rose-700 bg-rose-50/90 p-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    Món quà vượt quá hạn mức{" "}
                    {maxSpinGiftVnd.toLocaleString("vi-VN")}đ của Hộp quà vòng quay! Con vui lòng chọn món quà có giá từ{" "}
                    {maxSpinGiftVnd.toLocaleString("vi-VN")}đ trở xuống nhé.
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
              placeholder="Ví dụ: Màu xanh dương, phân loại 1 cây..."
              className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-300 bg-white px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none shadow-sm"
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
              ĐỂ DÀNH CHỌN SAU
            </Button3D>

            <Button3D
              type="submit"
              variant={canSubmit ? "purple" : "disabled"}
              size="md"
              fullWidth
              disabled={!canSubmit}
            >
              {isSubmitting ? "ĐANG GỬI..." : "NHẬN QUÀ NGAY"}
            </Button3D>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal mở Hộp quà trúng thưởng từ Vòng quay may mắn
 * - Reset sạch state mỗi lần mở bằng key (Quy tắc 8 AGENTS.md)
 */
export function WheelGiftClaimModal({
  isOpen,
  onClose,
  unclaimedGiftsCount,
  exchangeConfig,
  isSubmitting,
  onConfirm,
}: WheelGiftClaimModalProps) {
  useBodyScrollLock(isOpen);
  const { configs } = useConfigStore();

  if (!isOpen) return null;

  const effectiveConfig = normalizeExchangeConfig(
    exchangeConfig ?? configs?.exchange_setting
  );
  const maxSpinGiftVnd = effectiveConfig.max_spin_gift_vnd;
  const equivalentCoins = calculateSpinGiftEquivalentCoins(effectiveConfig);

  return (
    <WheelGiftClaimForm
      key={`gift-claim-${unclaimedGiftsCount}-${maxSpinGiftVnd}`}
      onClose={onClose}
      unclaimedGiftsCount={unclaimedGiftsCount}
      maxSpinGiftVnd={maxSpinGiftVnd}
      equivalentCoins={equivalentCoins}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
    />
  );
}
