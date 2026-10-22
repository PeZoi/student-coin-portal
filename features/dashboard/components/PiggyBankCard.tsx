"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Tilt from "react-parallax-tilt";

export function PiggyBankCard() {
  const { student } = useUserStore();

  return (
    <Tilt
      perspective={1000}
      tiltMaxAngleX={9}
      tiltMaxAngleY={9}
      scale={1.025}
      transitionSpeed={600}
      transitionEasing="cubic-bezier(0.23, 1, 0.32, 1)"
      glareEnable={true}
      glareMaxOpacity={0.25}
      glareColor="#ffffff"
      glarePosition="all"
      glareBorderRadius="32px"
      className="w-full h-full flex flex-col items-center select-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="relative w-full h-full bg-gradient-to-b from-[#FFE853] via-[#FFBE18] to-[#F58700] rounded-[32px] border-4 border-white shadow-[0_18px_40px_rgba(0,30,80,0.2),inset_0_3px_2px_rgba(255,255,255,0.85),inset_0_-4px_6px_rgba(180,80,0,0.2)] p-4 sm:p-5 pt-9 sm:pt-10 pb-5 sm:pb-6 flex flex-col justify-between items-center overflow-visible min-h-[450px] sm:min-h-[480px] lg:min-h-0 cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Curved Orange Header Banner (Luôn căn giữa tuyệt đối) */}
        <div
          className="absolute -top-12 sm:-top-12 md:-top-12 inset-x-0 mx-auto z-30 w-[84%] sm:w-[80%] max-w-[360px] pointer-events-none flex justify-center"
          style={{ transform: "translateZ(30px)" }}
        >
        <svg
          viewBox="0 0 400 100"
          className="w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.14)]"
          fill="none"
        >
          <defs>
            {/* Gradient màu cam tươi sáng, ấm áp chuẩn game UI */}
            <linearGradient id="softOrangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA726" />
              <stop offset="35%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#E64500" />
            </linearGradient>

            {/* Đường cong uốn lượn mềm mại tự nhiên */}
            <path id="heoTextCurve" d="M 35 68 Q 200 36 365 68" fill="none" />
          </defs>

          {/* Khối 3D nhẹ nhàng phía dưới (Chỉ 4px, không lố, shadow đen nhẹ tạo chiều sâu) */}
          <path
            d="M 35 84 C 15 81, 15 85, 35 88 Q 200 56 365 88 C 385 85, 385 81, 365 84 Q 200 52 35 84 Z"
            fill="#751A00"
          />

          {/* Dải Banner cong màu cam tươi với viền trắng thanh thoát */}
          <path
            d="M 35 38 Q 200 6 365 38 C 385 41, 385 81, 365 84 Q 200 52 35 84 C 15 81, 15 41, 35 38 Z"
            fill="url(#softOrangeGrad)"
            stroke="white"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Vệt sáng bóng kính nhẹ ở viền trên tạo độ mướt nhẹ */}
          <path
            d="M 48 40 Q 200 10 352 40"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Chữ uốn cong mềm mại: "HEO ĐẤT CỦA GIA BẢO" */}
          {/* Lớp 1: Đổ bóng đen nâu sắc nét tạo độ sâu 3D vừa phải */}
          <text
            fontFamily="var(--font-heading), 'Baloo 2', sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="0.8"
          >
            <textPath
              href="#heoTextCurve"
              startOffset="50%"
              textAnchor="middle"
              fill="#2E0A00"
              stroke="#2E0A00"
              strokeWidth="5"
              strokeLinejoin="round"
              dy="3"
            >
              {student.piggyTitle}
            </textPath>
          </text>

          {/* Lớp 2: Viền cam đậm tương phản viền trong */}
          <text
            fontFamily="var(--font-heading), 'Baloo 2', sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="0.8"
          >
            <textPath
              href="#heoTextCurve"
              startOffset="50%"
              textAnchor="middle"
              fill="#942300"
              stroke="#942300"
              strokeWidth="3"
              strokeLinejoin="round"
              dy="1"
            >
              {student.piggyTitle}
            </textPath>
          </text>

          {/* Lớp 3: Mặt chữ trắng tinh khiết nổi bật */}
          <text
            fontFamily="var(--font-heading), 'Baloo 2', sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="0.8"
          >
            <textPath
              href="#heoTextCurve"
              startOffset="50%"
              textAnchor="middle"
              fill="white"
            >
              {student.piggyTitle}
            </textPath>
          </text>
        </svg>
      </div>

      {/* Inner Clipped Ambient Rays and Sheen */}
      <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
        {/* Top subtle gloss sheen for premium depth */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/35 via-white/10 to-transparent z-10" />

        {/* Sunburst Rays radiating from behind the pig mascot */}
        <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-[repeating-conic-gradient(from_0deg,_rgba(255,255,255,0.2)_0deg_15deg,_transparent_15deg_30deg)] rounded-full blur-[0.5px] opacity-45" />

        {/* Radiant golden ambient glow spotlight behind the pig */}
        <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-100/50 rounded-full blur-2xl" />
      </div>

      {/* Floating 3D Gold Coins with Depth of Field & Natural Distribution */}
      {/* Coin 1: Upper Left floating tilted */}
      <div
        className="absolute top-[17%] left-[6%] sm:left-[8%] w-8 h-8 sm:w-9 sm:h-9 pointer-events-none select-none drop-shadow-[0_6px_12px_rgba(160,70,0,0.38)] -rotate-12 z-10 transition-transform duration-300 hover:scale-110"
        style={{ transform: "translateZ(30px)" }}
      >
        <Image src="/coin.png" alt="Coin" fill sizes="36px" unoptimized className="object-contain" />
      </div>

      {/* Coin 2: Mid-Lower Left distant background coin */}
      <div
        className="absolute top-[44%] left-[4%] sm:left-[6%] w-5 h-5 sm:w-6 sm:h-6 pointer-events-none select-none drop-shadow-[0_4px_8px_rgba(160,70,0,0.28)] rotate-12 z-10 opacity-95"
        style={{ transform: "translateZ(20px)" }}
      >
        <Image src="/coin.png" alt="Coin" fill sizes="24px" unoptimized className="object-contain" />
      </div>

      {/* Coin 3: Lower Left near cloud podium */}
      <div
        className="absolute top-[60%] left-[10%] sm:left-[12%] w-5 h-5 sm:w-5.5 sm:h-5.5 pointer-events-none select-none drop-shadow-[0_3px_6px_rgba(160,70,0,0.28)] -rotate-15 z-10 opacity-90"
        style={{ transform: "translateZ(25px)" }}
      >
        <Image src="/coin.png" alt="Coin" fill sizes="22px" unoptimized className="object-contain" />
      </div>

      {/* Coin 4: Upper Right floating hero coin */}
      <div
        className="absolute top-[21%] right-[6%] sm:right-[8%] w-8 h-8 sm:w-9 sm:h-9 pointer-events-none select-none drop-shadow-[0_6px_12px_rgba(160,70,0,0.38)] rotate-15 z-10 transition-transform duration-300 hover:scale-110"
        style={{ transform: "translateZ(32px)" }}
      >
        <Image src="/coin.png" alt="Coin" fill sizes="36px" unoptimized className="object-contain" />
      </div>

      {/* Coin 5: Mid Right floating coin */}
      <div
        className="absolute top-[45%] right-[5%] sm:right-[7%] w-6 h-6 sm:w-7 sm:h-7 pointer-events-none select-none drop-shadow-[0_4px_8px_rgba(160,70,0,0.32)] -rotate-8 z-10"
        style={{ transform: "translateZ(24px)" }}
      >
        <Image src="/coin.png" alt="Coin" fill sizes="28px" unoptimized className="object-contain" />
      </div>

      {/* Decorative Kim Tuyến Sparkles & Twinkling 3D Stars (Phân bổ tự nhiên, đa sắc độ) */}
      {/* Top Left Golden Star */}
      <div className="absolute top-[12%] left-[14%] text-yellow-100 text-lg font-black pointer-events-none opacity-90 drop-shadow-[0_2px_4px_rgba(180,80,0,0.3)] z-10 animate-pulse">✦</div>

      {/* Upper Left Lavender Sparkle */}
      <div className="absolute top-[28%] left-[18%] text-purple-200 text-sm font-black pointer-events-none opacity-85 drop-shadow-sm z-10">✦</div>

      {/* Mid Left Tiny Golden Twinkle */}
      <div className="absolute top-[52%] left-[16%] text-amber-200 text-xs font-black pointer-events-none opacity-80 z-10">✦</div>

      {/* Top Right Cyan Sparkle */}
      <div className="absolute top-[13%] right-[14%] text-sky-200 text-base font-black pointer-events-none opacity-90 drop-shadow-sm z-10">✦</div>

      {/* Upper Right Purple Sparkle Star */}
      <div className="absolute top-[18%] right-[20%] text-purple-300 text-lg font-black pointer-events-none opacity-90 drop-shadow-[0_2px_4px_rgba(100,20,120,0.25)] z-10 animate-pulse">✦</div>

      {/* Mid Right Pure White Sparkle */}
      <div className="absolute top-[36%] right-[18%] text-white text-xs font-black pointer-events-none opacity-85 drop-shadow-sm z-10">✦</div>

      {/* Lower Right Golden Shimmer */}
      <div className="absolute top-[56%] right-[11%] text-yellow-200 text-sm font-black pointer-events-none opacity-90 drop-shadow-sm z-10">✦</div>

      {/* Lucide Sparkles for rich ambient glitter */}
      <div className="absolute top-[10%] left-[28%] pointer-events-none opacity-75 z-10">
        <Sparkles className="w-4 h-4 text-white drop-shadow-sm" />
      </div>
      <div className="absolute top-[10%] right-[28%] pointer-events-none opacity-75 z-10">
        <Sparkles className="w-4 h-4 text-yellow-100 drop-shadow-sm" />
      </div>

      {/* Center Section: Cute Pig Mascot sitting proud on White Cloud Podium */}
      <div
        className="flex-1 w-full flex flex-col items-center justify-center relative z-20 pt-2 pb-5 sm:pb-6 lg:pb-2"
        style={{ transform: "translateZ(44px)", transformStyle: "preserve-3d" }}
      >
        {/* Cute Pink Piggy Mascot with Cloud Podium */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 flex-shrink-0">
          {/* Fluffy White Cartoon Cloud Podium beneath Pig */}
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110%] h-16 pointer-events-none drop-shadow-[0_8px_16px_rgba(0,35,90,0.18)] z-0">
            <svg viewBox="0 0 260 70" className="w-full h-full" fill="none">
              <ellipse cx="130" cy="54" rx="112" ry="14" fill="#CDE5FF" />
            </svg>
          </div>

          {/* Pig Mascot Image */}
          <div className="relative w-full h-full z-10">
            <Image
              src="/pig.png"
              alt="Heo Đất"
              fill
              sizes="(max-width: 640px) 176px, (max-width: 768px) 192px, (max-width: 1024px) 208px, 224px"
              priority
              unoptimized
              className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
            />
          </div>
        </div>
      </div>

      {/* Gamified 3D Gold Coin Vault Card at Bottom - cách đều heo đất như màn hình lớn */}
      <div
        className="w-full max-w-sm sm:max-w-md relative z-20 mt-5 sm:mt-6 lg:mt-3"
        style={{ transform: "translateZ(36px)", transformStyle: "preserve-3d" }}
      >
        {/* Khung Capsule 3D nhẹ nhàng, thanh lịch & cao cấp */}
        <div className="relative w-full bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF7] to-[#FFF4E0] rounded-[26px] border-4 border-white shadow-[0_6px_0_#A84B00,0_14px_26px_rgba(80,25,0,0.22),inset_0_2.5px_0_rgba(255,255,255,1)] px-3.5 sm:px-4 pt-4 sm:pt-5 pb-2.5 sm:pb-3 flex flex-col items-center text-center">
          {/* Orange Pill Tag: "🪙 TỔNG XU TÍCH LŨY 🪙" - 3D 1 chút xíu thanh thoát */}
          <div className="absolute z-10 -top-3.5 sm:-top-4 bg-gradient-to-b from-[#FFA726] via-[#FF7300] to-[#E64200] text-white text-[11px] sm:text-xs font-heading font-black px-4 py-0.5 sm:py-1 rounded-full shadow-[0_2.5px_0_#872400,0_4px_8px_rgba(135,36,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-amber-200/90 uppercase tracking-wider flex items-center gap-1.5">
            <span>🪙</span>
            <span>Tổng xu tích lũy</span>
            <span>🪙</span>
          </div>

          {/* Khay hiển thị xu lõm nhẹ 3D bên trong - nền trắng ngọc trai sáng sạch để chữ nổi bật 100% */}
          <div className="relative z-10 w-full pt-1 sm:pt-1.5 pb-0.5 px-3 sm:px-4 flex items-center justify-center gap-3 sm:gap-3.5">
            {/* Big 3D Coin with clean, subtle golden aura */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center">
              {/* Hào quang vàng dịu nhẹ, tỏa sáng tự nhiên vừa phải (blur nhẹ, trong trẻo) */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400/30 via-yellow-300/50 to-amber-300/30 blur-[2.5px] pointer-events-none" />
              
              {/* Viền sáng vàng thanh mảnh bao quanh xu */}
              <div className="absolute -inset-0.5 rounded-full border border-yellow-300/40 pointer-events-none" />

              {/* Đốm sáng lấp lánh nhỏ tinh tế */}
              <div className="absolute -top-0.5 -right-0.5 text-amber-300 text-[10px] pointer-events-none select-none z-20">✦</div>

              {/* Đồng xu vàng 3D sắc sảo với ánh sáng vàng tỏa nhẹ quanh thân xu */}
              <div className="relative w-full h-full drop-shadow-[0_2px_4px_rgba(160,70,0,0.25)] drop-shadow-[0_0_6px_rgba(255,200,0,0.35)] z-10">
                <Image src="/coin.png" alt="Coin" fill sizes="40px" unoptimized className="object-contain" />
              </div>
            </div>

            {/* Số xu và chữ "xu" CÙNG STYLE, tương phản cao, rõ nét, 3D 1 chút xíu thôi */}
            <div className="flex items-baseline gap-1.5 select-none font-heading font-black">
              {/* Số xu: cam rực rỡ, đậm nét, cực kỳ dễ đọc */}
              <span className="text-4xl sm:text-[44px] tracking-tight leading-none bg-gradient-to-b from-[#FF7A00] via-[#F05500] to-[#CC3300] bg-clip-text text-transparent filter drop-shadow-[0_2px_0_#7A1C00] drop-shadow-[0_3px_3px_rgba(122,28,0,0.2)]">
                {student.currentCoins.toLocaleString()}
              </span>
              {/* Chữ xu: cùng style, cùng gradient đậm đà, cùng độ nổi 3D nhẹ */}
              <span className="text-2xl sm:text-[28px] tracking-wide leading-none bg-gradient-to-b from-[#FF7A00] via-[#F05500] to-[#CC3300] bg-clip-text text-transparent filter drop-shadow-[0_2px_0_#7A1C00] drop-shadow-[0_3px_3px_rgba(122,28,0,0.2)]">
                xu
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Tilt>
  );
}
