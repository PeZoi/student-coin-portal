"use client";

import { Button3D } from "@/components/ui/Button3D";
import { Banknote, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { COIN_STEP, VND_PER_STEP } from "../hooks/useRewardExchange";

interface CashExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  isSubmitting: boolean;
  onConfirm: (coins: number) => Promise<boolean>;
}

export function CashExchangeModal({
  isOpen,
  onClose,
  currentCoins,
  isSubmitting,
  onConfirm,
}: CashExchangeModalProps) {
  const [selectedCoins, setSelectedCoins] = useState(5000);

  if (!isOpen) return null;

  const rewardVnd = (selectedCoins / COIN_STEP) * VND_PER_STEP;
  const remainingCoins = currentCoins - selectedCoins;
  const isAffordable = currentCoins >= selectedCoins;

  const handleIncrease = () => {
    setSelectedCoins((prev) => prev + COIN_STEP);
  };

  const handleDecrease = () => {
    setSelectedCoins((prev) => Math.max(COIN_STEP, prev - COIN_STEP));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAffordable || isSubmitting) return;
    await onConfirm(selectedCoins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#F2FAF4] rounded-[28px] sm:rounded-[32px] border-4 border-white shadow-[0_20px_50px_rgba(0,20,50,0.35)] p-5 sm:p-6 text-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Banknote className="w-6 h-6 drop-shadow" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 leading-tight">
              Đổi Tiền Mặt
            </h3>
            <p className="text-xs sm:text-sm font-heading font-semibold text-emerald-700">
              Nhận tiền mặt trực tiếp
            </p>
          </div>
        </div>

        {/* Khung số dư hiện tại */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-heading font-bold text-amber-900">
            Số xu con đang có:
          </span>
          <div className="flex items-center gap-1.5 font-heading font-black text-base sm:text-lg text-[#E65100]">
            <Image
              src="/coin.png"
              alt="Xu"
              width={22}
              height={22}
              unoptimized
              style={{ height: "auto" }}
            />
            <span>{currentCoins.toLocaleString("vi-VN")} xu</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bộ điều khiển chọn số xu muốn đổi */}
          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-slate-700 mb-1.5">
              Chọn số xu muốn đổi:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={selectedCoins <= COIN_STEP}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center border border-slate-300 transition-colors font-black cursor-pointer disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 bg-white border-2 border-emerald-300 rounded-xl py-2 px-3 text-center shadow-inner">
                <span className="text-lg sm:text-xl font-heading font-black text-emerald-900">
                  {selectedCoins.toLocaleString("vi-VN")} xu
                </span>
                <span className="text-xs font-heading font-black text-emerald-600 block mt-0.5">
                  = {rewardVnd.toLocaleString("vi-VN")}đ tiền mặt
                </span>
              </div>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={selectedCoins + COIN_STEP > currentCoins}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition-colors font-black cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tổng kết số dư */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs sm:text-sm space-y-1">
            <div className="flex justify-between font-heading font-semibold text-slate-600">
              <span>Số xu sẽ trừ:</span>
              <span className="text-red-600 font-bold">
                -{selectedCoins.toLocaleString("vi-VN")} xu
              </span>
            </div>
            <div className="flex justify-between font-heading font-bold text-slate-800 border-t border-slate-200/70 pt-1">
              <span>Số xu còn lại:</span>
              <span
                className={
                  remainingCoins >= 0
                    ? "text-emerald-700 font-black"
                    : "text-red-500 font-black"
                }
              >
                {remainingCoins >= 0
                  ? `${remainingCoins.toLocaleString("vi-VN")} xu`
                  : "Không đủ số dư!"}
              </span>
            </div>
          </div>

          {/* Các nút hành động */}
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
              variant={isAffordable ? "green" : "disabled"}
              size="md"
              fullWidth
              disabled={!isAffordable || isSubmitting}
            >
              {isSubmitting ? "ĐANG GỬI..." : "XÁC NHẬN ĐỔI"}
            </Button3D>
          </div>
        </form>
      </div>
    </div>
  );
}
