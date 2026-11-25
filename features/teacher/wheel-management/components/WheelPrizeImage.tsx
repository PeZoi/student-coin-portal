"use client";

import Image from "next/image";
import { getWheelPrizeImageUrl } from "@/constants/wheel";
import { WheelPrizeType } from "../types";

interface WheelPrizeImageProps {
  type: WheelPrizeType | string;
  alt?: string;
  size?: number;
  className?: string;
  hasShadow?: boolean;
}

/**
 * Component hiển thị hình ảnh 3D chính thức cho từng loại giải thưởng Vòng quay
 * Tự động ánh xạ từ hằng số WHEEL_PRIZE_IMAGES:
 * - coin: /wheel/coin.webp
 * - deduct_coin: /wheel/deduct-coin.webp
 * - free_spin: /wheel/free-spin.webp
 * - gift: /wheel/gift.webp
 * - luck: /wheel/luck.webp
 */
export function WheelPrizeImage({
  type,
  alt = "Phần thưởng vòng quay",
  size = 32,
  className = "",
}: WheelPrizeImageProps) {
  const imageUrl = getWheelPrizeImageUrl(type);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        unoptimized
        sizes={`${size}px`}
        className="object-contain pointer-events-none select-none"
      />
    </div>
  );
}
