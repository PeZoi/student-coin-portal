"use client";

import { cn } from "@/lib/utils";
import { Gift, Smile, Star } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { WheelPrize } from "../types";
import { WheelDynamicDisc } from "./WheelDynamicDisc";

interface WheelSpinnerProps {
  prizes: WheelPrize[];
  rotation: number;
  isSpinning: boolean;
  spinCost: number;
  onSpin: () => void;
}

const LED_COUNT = 24;

// Render icon giải thưởng trên từng múi (hỗ trợ scale kích thước động theo số lượng item)
function renderPrizeIcon(
  prize: WheelPrize,
  wrapperClass?: string,
  iconInnerClass?: string
) {
  if (prize.type === "coin") {
    return (
      <div
        className={cn(
          "relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]",
          wrapperClass || "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
        )}
      >
        <Image src="/coin.png" alt="Xu vàng" fill unoptimized className="object-contain" />
      </div>
    );
  }

  const iconMap = {
    gift: { Icon: Gift, bg: "from-fuchsia-400 to-pink-600" },
    multiplier: { Icon: Star, bg: "from-violet-400 to-indigo-600" },
    luck: { Icon: Smile, bg: "from-sky-400 to-blue-600" },
  } as const;

  const { Icon, bg } = iconMap[prize.type];
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-b flex items-center justify-center border-2 border-white shadow-[0_2px_5px_rgba(0,0,0,0.4)]",
        wrapperClass || "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10",
        bg
      )}
    >
      <Icon className={cn("text-white stroke-[2.5]", iconInnerClass || "w-4.5 h-4.5 md:w-5 md:h-5")} />
    </div>
  );
}

export function WheelSpinner({
  prizes,
  rotation,
  isSpinning,
  spinCost,
  onSpin,
}: WheelSpinnerProps) {
  const totalItems = prizes.length;
  const segmentAngle = 360 / totalItems;

  // Tính toán kích thước icon, nhãn và cỡ chữ linh hoạt theo số lượng giải thưởng
  // Vòng quay càng nhiều item thì chữ và icon càng tự động co lại nhỏ gọn, không dính vào nhau
  const sizeConfig = useMemo(() => {
    if (totalItems <= 6) {
      return {
        iconWrapper: "w-8.5 h-8.5 sm:w-10 sm:h-10 md:w-11 md:h-11",
        iconInner: "w-5 h-5 md:w-6 md:h-6",
        badgePad: "px-2.5 sm:px-3 py-0.5 sm:py-1",
        fontSize: "text-[12px] sm:text-[13.5px] md:text-[14.5px]",
        maxBadgeWidth: "max-w-[110px] sm:max-w-[130px]",
        ptIcon: "pt-[4%] sm:pt-[4.5%]",
        mtLabel: "mt-1 sm:mt-1.5",
      };
    }
    if (totalItems <= 8) {
      return {
        iconWrapper: "w-7.5 h-7.5 sm:w-9 sm:h-9 md:w-10 md:h-10",
        iconInner: "w-4.5 h-4.5 md:w-5 md:h-5",
        badgePad: "px-2 sm:px-2.5 py-0.5",
        fontSize: "text-[10.5px] sm:text-[12px] md:text-[13px]",
        maxBadgeWidth: "max-w-[85px] sm:max-w-[102px]",
        ptIcon: "pt-[4.5%] sm:pt-[5%]",
        mtLabel: "mt-1 sm:mt-1.2",
      };
    }
    if (totalItems <= 10) {
      return {
        iconWrapper: "w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 md:w-8.5 md:h-8.5",
        iconInner: "w-3.5 h-3.5 md:w-4.5 md:h-4.5",
        badgePad: "px-1.5 sm:px-2 py-[2px] sm:py-0.5",
        fontSize: "text-[9px] sm:text-[10.5px] md:text-[11.5px]",
        maxBadgeWidth: "max-w-[70px] sm:max-w-[85px]",
        ptIcon: "pt-[5%] sm:pt-[5.5%]",
        mtLabel: "mt-0.5 sm:mt-1",
      };
    }
    // Trường hợp > 10 items (12, 14, 16...)
    return {
      iconWrapper: "w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7",
      iconInner: "w-3 h-3 md:w-3.5 md:h-3.5",
      badgePad: "px-1 sm:px-1.5 py-[1px] sm:py-0.5",
      fontSize: "text-[8px] sm:text-[9px] md:text-[10px]",
      maxBadgeWidth: "max-w-[55px] sm:max-w-[70px]",
      ptIcon: "pt-[5.5%] sm:pt-[6%]",
      mtLabel: "mt-0.5",
    };
  }, [totalItems]);

  return (
    <div className="flex flex-col items-center justify-center select-none w-full max-w-full my-auto pt-3 pb-5 sm:pt-4 sm:pb-7">
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* KHU VỰC VÒNG QUAY MAY MẮN (CHỈ NHẬN CLICK Ở NÚT TÂM "QUAY") */}
      {/* ======================================================== */}
      <div
        className="relative w-[min(calc(100vw-24px),calc(100dvh-200px),370px)] h-[min(calc(100vw-24px),calc(100dvh-200px),370px)] sm:w-[min(calc(100vw-36px),calc(100dvh-220px),580px)] sm:h-[min(calc(100vw-36px),calc(100dvh-220px),580px)] md:w-[min(calc(100vw-48px),calc(100dvh-235px),710px)] md:h-[min(calc(100vw-48px),calc(100dvh-235px),710px)] lg:w-[min(calc(100vw-48px),calc(100dvh-235px),530px)] lg:h-[min(calc(100vw-48px),calc(100dvh-235px),530px)] xl:w-[min(calc(100vw-48px),calc(100dvh-235px),560px)] xl:h-[min(calc(100vw-48px),calc(100dvh-235px),560px)] 2xl:w-[min(calc(100vw-48px),calc(100dvh-235px),600px)] 2xl:h-[min(calc(100vw-48px),calc(100dvh-235px),600px)] select-none"
      >
        {/* 1. Tia sáng hào quang trắng mờ dịu nhẹ xoay chậm phía sau */}
        <div
          className="absolute -inset-[16%] sm:-inset-[20%] lg:-inset-[22%] rounded-full pointer-events-none animate-[spin_32s_linear_infinite] opacity-65"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, rgba(255, 255, 255, 0.38) 0deg 9deg, rgba(255, 255, 255, 0.08) 9deg 10deg, transparent 10deg 20deg)",
            maskImage: "radial-gradient(circle, black 36%, rgba(0,0,0,0.6) 58%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle, black 36%, rgba(0,0,0,0.6) 58%, transparent 75%)",
          }}
        />

        {/* 2. Quầng sáng trắng mờ lan tỏa dịu mắt */}
        <div
          className={cn(
            "absolute -inset-[10%] sm:-inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,rgba(186,230,253,0.2)_50%,transparent_75%)] pointer-events-none transition-all duration-500",
            isSpinning ? "opacity-85 animate-pulse" : "opacity-55"
          )}
        />

        {/* 4. VÀNH NGOÀI KIM LOẠI ĐA TẦNG 3D THẬT SANG TRỌNG (Multi-tier Metallic Gold Rim) */}
        <div className="absolute inset-0 rounded-full p-[3%] sm:p-[3.2%] bg-gradient-to-b from-[#FFFDF0] via-[#FBBF24] to-[#78350F] shadow-[0_20px_50px_rgba(0,0,0,0.45),0_8px_18px_rgba(0,0,0,0.25),inset_0_3px_6px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(69,26,3,0.8)]">
          {/* Lớp viền gờ nổi phản chiếu ánh kim */}
          <div className="relative w-full h-full rounded-full p-[1.5px] bg-gradient-to-b from-[#FEF08A] via-[#B45309] to-[#451A03]">
            {/* DẢI RÃNH SÂU CHỨA ĐÈN LED (Deep Recessed Metallic Track) */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#5d270d] via-[#4A1D08] to-[#4e2503] shadow-[inset_0_6px_14px_rgba(0,0,0,0.85),inset_0_-4px_10px_rgba(0,0,0,0.7)]">
              {/* Vệt phản quang cung tròn ở nửa trên vành (Specular Environment Glare) */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[86%] h-[32%] rounded-t-full bg-gradient-to-b from-white/25 via-white/8 to-transparent pointer-events-none" />

              {/* Đèn LED THẬT: Mỗi bóng có socket kim loại vàng nổi 3D và thấu kính thủy tinh phát sáng */}
              {Array.from({ length: LED_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 pointer-events-none"
                  style={{ transform: `rotate(${i * (360 / LED_COUNT)}deg)` }}
                >
                  {/* Socket kim loại mạ vàng ôm bóng đèn */}
                  <div className="absolute left-1/2 top-[2.2%] -translate-x-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full p-[1px] bg-gradient-to-b from-[#FFFBEB] via-[#D97706] to-[#451A03] shadow-[0_1.5px_3px_rgba(0,0,0,0.65)] flex items-center justify-center">
                    {/* Thấu kính bóng đèn LED phát sáng */}
                    <span
                      className={cn(
                        "w-full h-full rounded-full border-[0.5px] border-white/80 transition-all duration-300",
                        i % 2 === 0
                          ? "bg-gradient-to-b from-white via-[#FEF08A] to-[#F59E0B] shadow-[0_0_10px_3px_rgba(254,240,138,0.95)]"
                          : "bg-gradient-to-b from-[#FFF] via-[#FED7AA] to-[#EA580C] shadow-[0_0_10px_3px_rgba(251,146,60,0.95)]",
                        isSpinning ? "animate-pulse" : ""
                      )}
                      style={{ animationDelay: i % 2 === 0 ? "0s" : "0.5s" }}
                    />
                  </div>
                </div>
              ))}

              {/* 5. VÒNG ĐỆM GỜ KIM LOẠI ÔM ĐĨA QUAY (Inner Polished Gold Stepped Ring) */}
              <div className="absolute inset-[7.2%] rounded-full p-[1.2%] bg-gradient-to-b from-[#FFFDF0] via-[#FBBF24] to-[#78350F] shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(69,26,3,0.6)]">
                {/* ĐĨA XOAY */}
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <div
                    className="relative w-full h-full rounded-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning
                        ? "transform 5.4s cubic-bezier(0.12, 0.95, 0.18, 1)"
                        : "none",
                    }}
                  >
                    {/* ĐĨA QUAY ĐỘNG SVG: Tươi sáng, tự động chia múi cho bất kỳ số lượng giải thưởng nào */}
                    <WheelDynamicDisc prizes={prizes} />

                    {/* NHÃN GIẢI THƯỞNG VÀ ICON TRÊN TỪNG MÚI */}
                    {prizes.map((prize, idx) => {
                      const midAngle = idx * segmentAngle + segmentAngle / 2;

                      return (
                        <div
                          key={prize.id}
                          className="absolute inset-0 flex flex-col items-center pointer-events-none"
                          style={{ transform: `rotate(${midAngle}deg)` }}
                        >
                          {/* Icon đặt ở vành ngoài - nơi múi quạt rộng nhất (tự động co kích thước khi nhiều items) */}
                          <div className={cn("flex items-center justify-center flex-shrink-0", sizeConfig.ptIcon)}>
                            {renderPrizeIcon(prize, sizeConfig.iconWrapper, sizeConfig.iconInner)}
                          </div>

                          {/* Label phong cách huy hiệu ngọc trai viền vàng kim 3D sang trọng, tương phản cao, chữ tự co nhỏ theo số item */}
                          <div className={cn("flex items-center justify-center px-0.5", sizeConfig.mtLabel)}>
                            <div
                              className={cn(
                                "rounded-full bg-white/95 sm:bg-white/92 backdrop-blur-[2px] border-[1.5px] border-amber-300/85 shadow-[0_2px_6px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,1)] flex items-center justify-center",
                                sizeConfig.badgePad,
                                sizeConfig.maxBadgeWidth
                              )}
                            >
                              <span
                                className={cn(
                                  "font-heading font-black text-slate-800 tracking-tight sm:tracking-normal truncate whitespace-nowrap",
                                  sizeConfig.fontSize
                                )}
                              >
                                {prize.shortLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bóng đổ nhẹ trong viền đĩa tạo chiều sâu */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] pointer-events-none" />
                </div>
              </div>

              {/* 6. NÚT TÂM "QUAY -500 XU" (Khi quay chuyển thành màu xám trắng disabled, không animation click) */}
              <button
                type="button"
                onClick={!isSpinning ? onSpin : undefined}
                disabled={isSpinning}
                aria-label="Nhấn để quay vòng quay may mắn"
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[20%] h-[20%] rounded-full p-[2.5px] sm:p-1 md:p-1.5 lg:p-1 xl:p-1.5",
                  "flex items-center justify-center select-none focus:outline-none transition-colors duration-200",
                  isSpinning
                    ? "bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 shadow-[0_4px_16px_rgba(0,0,0,0.25)] cursor-not-allowed"
                    : "bg-gradient-to-b from-[#FFFBEB] via-[#FBBF24] to-[#B45309] shadow-[0_8px_25px_rgba(0,0,0,0.55),0_2px_4px_rgba(0,0,0,0.35)] cursor-pointer"
                )}
              >
                {/* Lòng nút: Đỏ Ruby khi sẵn sàng, chuyển sang xám khi đang quay */}
                <div
                  className={cn(
                    "relative w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-200",
                    isSpinning
                      ? "bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 border-[1.5px] sm:border-2 md:border-[2.5px] lg:border-2 border-gray-300/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-3px_5px_rgba(0,0,0,0.3)]"
                      : "bg-gradient-to-b from-[#FF4D6D] via-[#E11D48] to-[#9F1239] border-[1.5px] sm:border-2 md:border-[2.5px] lg:border-2 border-[#FFA1B5]/70 shadow-[inset_0_3px_5px_rgba(255,255,255,0.7),inset_0_-4px_6px_rgba(76,5,25,0.7)]"
                  )}
                >
                  {/* Vệt sáng bóng tròn ở nửa trên nút */}
                  <div
                    className={cn(
                      "absolute top-0.5 left-1/2 -translate-x-1/2 w-[76%] h-[42%] rounded-full pointer-events-none transition-opacity duration-200",
                      isSpinning
                        ? "bg-gradient-to-b from-white/35 via-white/10 to-transparent"
                        : "bg-gradient-to-b from-white/50 via-white/15 to-transparent"
                    )}
                  />

                  {/* Nội dung nút: chữ QUAY và chi phí xu */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span
                      className={cn(
                        "font-heading font-black text-[9.5px] min-[360px]:text-[11px] sm:text-[15px] md:text-[20px] lg:text-[15px] xl:text-[16.5px] 2xl:text-[18px] tracking-widest uppercase leading-tight transition-colors duration-200",
                        isSpinning
                          ? "text-gray-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] [text-shadow:none]"
                          : "text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)] [text-shadow:_0_1.5px_0_#881337]"
                      )}
                    >
                      QUAY
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 sm:gap-1 font-heading font-black text-[9.5px] min-[360px]:text-[11px] sm:text-[14px] md:text-[19px] lg:text-[14.5px] xl:text-[16px] 2xl:text-[17px] leading-tight mt-0.5 md:mt-1 lg:mt-0.5 transition-colors duration-200",
                        isSpinning
                          ? "text-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] [text-shadow:none]"
                          : "text-[#FEF08A] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_0_#713F12]"
                      )}
                    >
                      <span>-{spinCost.toLocaleString("vi-VN")}</span>
                      <Image
                        src="/coin.png"
                        alt="Xu"
                        width={24}
                        height={24}
                        unoptimized
                        style={{ height: "auto" }}
                        className={cn(
                          "w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-4 lg:h-4 xl:w-4.5 xl:h-4.5 inline-block object-contain drop-shadow -mt-0.5 transition-all duration-200",
                          isSpinning && "grayscale opacity-60"
                        )}
                      />
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 7. KIM CHỈ MÀU XANH DƯƠNG NỔI BẬT */}
        <div className="absolute -top-[5%] left-1/2 -translate-x-1/2 z-30 w-[13%] h-[20%] pointer-events-none drop-shadow-[0_6px_6px_rgba(0,0,0,0.45)]">
          <Image
            src="/wheel/wheel-pointer.svg"
            alt="Kim chỉ vòng quay"
            fill
            priority
            unoptimized
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
