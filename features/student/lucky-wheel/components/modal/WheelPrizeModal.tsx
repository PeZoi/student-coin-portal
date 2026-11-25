"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Star, X, Check, ArrowRight, Gift } from "lucide-react";
import { WheelPrize } from "../../types";
import {
  getWheelPrizeModalContent,
  WHEEL_PRIZE_IMAGES,
  WHEEL_PRIZE_TYPES,
} from "@/constants/wheel";
import { Button3D } from "@/components/ui/Button3D";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";

interface WheelPrizeModalProps {
  prize: WheelPrize | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenGiftClaim?: () => void;
}

export function WheelPrizeModal({
  prize,
  isOpen,
  onClose,
  onOpenGiftClaim,
}: WheelPrizeModalProps) {
  useBodyScrollLock(isOpen && !!prize);

  if (!isOpen || !prize) return null;

  const theme = getWheelPrizeModalContent(prize);

  const hasSpecificCoin =
    typeof prize.reward_coins === "number" && prize.reward_coins !== 0;
  const hasFreeSpins =
    typeof prize.reward_free_spins === "number" &&
    prize.reward_free_spins > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200 select-none">
      <div
        className={cn(
          "relative w-full max-w-sm sm:max-w-md rounded-[32px] border-[4px] p-5 sm:p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 overflow-hidden",
          theme.modalBg,
          theme.modalBorder,
          theme.modalShadow
        )}
      >
        {/* Viền sáng bóng dập nổi phía trên cùng */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-white/80 rounded-full pointer-events-none" />

        {/* Nút đóng (X) xinh xắn ở góc phải */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng popup"
          className={cn(
            "absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-xs cursor-pointer z-10",
            theme.closeBtnClasses
          )}
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Các ngôi sao hoạt hình nhí nhảnh trang trí bay nhẹ ở 4 góc */}
        <div
          className={cn(
            "absolute top-4 left-5 pointer-events-none opacity-60 animate-pulse",
            theme.sparkleColor
          )}
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <div
          className={cn(
            "absolute top-12 right-12 pointer-events-none opacity-40 animate-bounce duration-1000",
            theme.sparkleColor
          )}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
        </div>
        <div
          className={cn(
            "absolute bottom-20 left-4 pointer-events-none opacity-40 animate-pulse",
            theme.sparkleColor
          )}
        >
          <Star className="w-4 h-4 fill-current" />
        </div>

        {/* Vùng phát sáng hào quang (Radial Glow Halo) */}
        <div
          className={cn(
            "absolute -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none",
            theme.auraColor
          )}
        />

        {/* Chip Huy hiệu trạng thái nhí nhảnh (Badge Chip) */}
        <div className="mb-2.5 z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border shadow-2xs font-heading font-black text-xs sm:text-[13px] tracking-wide select-none",
              theme.badgeBg,
              theme.badgeBorder,
              theme.badgeTextColor
            )}
          >
            <span className="text-sm leading-none">{theme.badgeEmoji}</span>
            <span>{theme.badgeText}</span>
          </span>
        </div>

        {/* Vùng trưng bày Hình ảnh 3D tròn mềm mại (Hero Image Card) */}
        <div className="relative my-2 sm:my-3 flex flex-col items-center justify-center z-10">
          {/* Đĩa đệm kính trắng mờ bo góc mịn màng */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-white/75 backdrop-blur-xs border-2 border-white/95 shadow-[0_10px_25px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center transition-transform hover:scale-105 duration-200">
            {/* Vòng sáng nhẹ phía sau ảnh */}
            <div
              className={cn(
                "absolute inset-2 rounded-[22px] blur-sm opacity-50",
                theme.auraColor
              )}
            />

            {/* Hình ảnh 3D phần thưởng */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <Image
                src={theme.imageUrl}
                alt={prize.label}
                fill
                unoptimized
                className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
              />
            </div>
          </div>

          {/* Bóng đổ elip mềm mại phía dưới đĩa */}
          <div className="w-24 h-2.5 rounded-full bg-black/10 blur-[2px] mt-2 select-none pointer-events-none" />
        </div>

        {/* Tiêu đề phần thưởng: Chữ cực kỳ sắc nét, tương phản chuẩn, không gây chói */}
        <div className="mb-1.5 z-10 px-2 max-w-xs">
          <h3
            className={cn(
              "font-heading font-black text-xl sm:text-2xl leading-tight tracking-tight",
              theme.titleColor
            )}
          >
            {prize.label}
          </h3>
        </div>

        {/* Viên thuốc nổi bật giá trị (Reward Value Tag) - Nếu là cộng/trừ xu hoặc tặng lượt */}
        {hasSpecificCoin && (
          <div className="mb-2 z-10">
            {prize.reward_coins > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-200/90 via-amber-100 to-amber-200/90 border border-amber-300 shadow-2xs font-heading font-black text-sm text-[#B45309]">
                <span>+{prize.reward_coins.toLocaleString("vi-VN")}</span>
                <Image
                  src={WHEEL_PRIZE_IMAGES[WHEEL_PRIZE_TYPES.COIN]}
                  alt="Xu"
                  width={18}
                  height={18}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-4 h-4 object-contain"
                />
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-200/90 via-rose-100 to-rose-200/90 border border-rose-300 shadow-2xs font-heading font-black text-sm text-rose-700">
                <span>{prize.reward_coins.toLocaleString("vi-VN")}</span>
                <Image
                  src={WHEEL_PRIZE_IMAGES[WHEEL_PRIZE_TYPES.DEDUCT_COIN]}
                  alt="Trừ xu"
                  width={18}
                  height={18}
                  unoptimized
                  style={{ height: "auto" }}
                  className="w-4 h-4 object-contain"
                />
              </div>
            )}
          </div>
        )}

        {hasFreeSpins && (
          <div className="mb-2 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-200/90 via-sky-100 to-sky-200/90 border border-sky-300 shadow-2xs font-heading font-black text-sm text-sky-800">
              <span>+{prize.reward_free_spins} Lượt quay</span>
              <Image
                src={WHEEL_PRIZE_IMAGES[WHEEL_PRIZE_TYPES.FREE_SPIN]}
                alt="Lượt quay"
                width={18}
                height={18}
                unoptimized
                style={{ height: "auto" }}
                className="w-4 h-4 object-contain"
              />
            </div>
          </div>
        )}

        {/* Đoạn mô tả chúc mừng hoặc động viên: Font mềm mại, tương phản êm mắt */}
        <p
          className={cn(
            "font-heading font-bold text-xs sm:text-[13px] max-w-xs leading-relaxed mb-5 z-10 px-1",
            theme.descColor
          )}
        >
          {theme.descriptionText}
        </p>

        {/* Nút hành động 3D nổi bật: Kích cỡ lớn, màu sắc đồng điệu theo theme */}
        <div className="w-full z-10 space-y-2.5">
          {theme.isGift && onOpenGiftClaim ? (
            <>
              <Button3D
                variant={theme.buttonVariant}
                size="lg"
                onClick={onOpenGiftClaim}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base tracking-wide font-black shadow-lg gap-2"
              >
                <Gift className="w-5 h-5 stroke-[2.5]" />
                <span>Chọn quà & dán link ngay!</span>
              </Button3D>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-3 rounded-xl text-xs sm:text-[13px] font-heading font-bold text-purple-800/80 hover:text-purple-950 hover:bg-purple-200/50 transition-colors cursor-pointer"
              >
                Để dành vào Hộp quà (Chọn sau)
              </button>
            </>
          ) : (
            <Button3D
              variant={theme.buttonVariant}
              size="lg"
              onClick={onClose}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base tracking-wide font-black shadow-lg gap-2"
            >
              {theme.isDeduct || theme.isLuck ? (
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              ) : (
                <Check className="w-5 h-5 stroke-[3]" />
              )}
              <span>{theme.buttonText}</span>
            </Button3D>
          )}
        </div>
      </div>
    </div>
  );
}
