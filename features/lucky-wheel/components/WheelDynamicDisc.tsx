import React, { useMemo } from "react";
import { WheelPrize } from "../types";

interface WheelDynamicDiscProps {
  prizes: WheelPrize[];
}

// Bảng 4 màu chủ đạo 3D cố định (Vàng, Xanh biển, Đỏ san hô, Xanh ngọc)
// Tự động lặp lại tuần hoàn (cycle) nếu số lượng giải thưởng vượt quá 4
export const DYNAMIC_SLICE_PALETTES = [
  { id: "amber", from: "#FEF08A", via: "#FBBF24", to: "#F59E0B" }, // 0: Vàng kim sáng rực
  { id: "blue", from: "#BAE6FD", via: "#38BDF8", to: "#0284C7" }, // 1: Xanh biển trời tươi mát
  { id: "coral", from: "#FECDD3", via: "#FB7185", to: "#E11D48" }, // 2: Đỏ san hô / Ruby năng động
  { id: "green", from: "#BBF7D0", via: "#4ADE80", to: "#16A34A" }, // 3: Xanh táo / Ngọc may mắn
];

/**
 * Đĩa quay động đa múi (Dynamic SVG Wheel Disc).
 * Sử dụng bảng màu sáng tươi tắn, đường chia nan mạ vàng và độ sâu 3D tinh tế.
 */
export function WheelDynamicDisc({ prizes }: WheelDynamicDiscProps) {
  const totalSlices = prizes.length;
  const segmentAngle = 360 / totalSlices;
  const RADIUS = 200;

  // Tính toán tọa độ vector cho từng múi quạt
  const slicesData = useMemo(() => {
    return prizes.map((prize, i) => {
      const startDeg = i * segmentAngle;
      const endDeg = (i + 1) * segmentAngle;
      const midDeg = startDeg + segmentAngle / 2;

      const r1 = (startDeg * Math.PI) / 180;
      const r2 = (endDeg * Math.PI) / 180;
      const rm = (midDeg * Math.PI) / 180;

      // 0 độ là hướng 12h (lên trên), chiều kim đồng hồ
      const x1 = RADIUS * Math.sin(r1);
      const y1 = -RADIUS * Math.cos(r1);
      const x2 = RADIUS * Math.sin(r2);
      const y2 = -RADIUS * Math.cos(r2);

      // Điểm giữa cung tròn của múi (để chiếu gradient hướng tâm)
      const xm = RADIUS * Math.sin(rm);
      const ym = -RADIUS * Math.cos(rm);

      // Đường path hình quạt
      const pathData = `M 0 0 L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${RADIUS} ${RADIUS} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;

      // Điểm đinh tán ở vành ngoài
      const studR = RADIUS * 0.94;
      const studX = studR * Math.sin(r1);
      const studY = -studR * Math.cos(r1);

      const palette = DYNAMIC_SLICE_PALETTES[i % DYNAMIC_SLICE_PALETTES.length];

      return {
        id: prize.id,
        index: i,
        pathData,
        x1,
        y1,
        xm,
        ym,
        studX,
        studY,
        palette,
      };
    });
  }, [prizes, segmentAngle]);

  return (
    <svg
      viewBox={`-${RADIUS} -${RADIUS} ${RADIUS * 2} ${RADIUS * 2}`}
      className="absolute inset-0 w-full h-full pointer-events-none select-none rounded-full"
    >
      <defs>
        {/* Gradients tươi sáng cho từng múi quạt */}
        {slicesData.map(({ index, palette }) => (
          <radialGradient
            key={`slice-grad-${index}`}
            id={`slice-grad-${index}`}
            cx="0"
            cy="0"
            r={RADIUS}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={palette.from} stopOpacity="1" />
            <stop offset="60%" stopColor={palette.via} />
            <stop offset="100%" stopColor={palette.to} />
          </radialGradient>
        ))}

        {/* Bóng lòng chảo nhẹ nhàng giữ cho đĩa luôn sáng sủa, không bị tối màu */}
        <radialGradient id="discBowlShadow" cx="0" cy="0" r={RADIUS} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="80%" stopColor="#000000" stopOpacity="0" />
          <stop offset="93%" stopColor="#000000" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </radialGradient>

        {/* Filter phát quang Neon dịu và mượt */}
        <filter id="neonDividerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient dải Neon Cyan / Electric Aqua rực rỡ */}
        <linearGradient id="neonSplitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="30%" stopColor="#38BDF8" />
          <stop offset="70%" stopColor="#00F5FF" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Gradient viền ngăn nan trắng vàng sáng (dự phòng) */}
        <linearGradient id="dividerGoldLine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FFFBEB" />
          <stop offset="85%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* 1. VẼ CÁC MÚI QUẠT TƯƠI SÁNG */}
      <g>
        {slicesData.map(({ id, index, pathData }) => (
          <path
            key={`wedge-${id}-${index}`}
            d={pathData}
            fill={`url(#slice-grad-${index})`}
            stroke="rgba(0,245,255,0.2)"
            strokeWidth="0.8"
          />
        ))}
      </g>

      {/* 2. CÁC ĐƯỜNG CHIA NAN NEON 3D & ĐINH TÁN PHÁT SÁNG */}
      <g>
        {slicesData.map(({ index, x1, y1, studX, studY }) => (
          <React.Fragment key={`divider-${index}`}>
            {/* Lớp 0: Rãnh khảm âm 3D (Recessed Channel) giúp ống neon nổi bật trên MỌI màu nền (kể cả múi xanh) */}
            <line
              x1="0"
              y1="0"
              x2={x1}
              y2={y1}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Lớp 1: Hào quang Neon mờ phát sáng lan tỏa 2 bên (Neon Bloom Aura) */}
            <line
              x1="0"
              y1="0"
              x2={x1}
              y2={y1}
              stroke="#00F5FF"
              strokeWidth="5"
              strokeOpacity="0.55"
              strokeLinecap="round"
              filter="url(#neonDividerGlow)"
            />
            {/* Lớp 2: Ống đèn Neon điện quang Cyan sắc nét */}
            <line
              x1="0"
              y1="0"
              x2={x1}
              y2={y1}
              stroke="url(#neonSplitGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Lớp 3: Tim đèn laser trắng cực sáng (White-hot core) */}
            <line
              x1="0"
              y1="0"
              x2={x1}
              y2={y1}
              stroke="#FFFFFF"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeOpacity="0.95"
            />

            {/* Socket và chốt đá Neon phát sáng ở vành ngoài */}
            <circle cx={studX} cy={studY} r="5" fill="#0A2540" stroke="rgba(0,245,255,0.7)" strokeWidth="1" />
            <circle
              cx={studX}
              cy={studY}
              r="4.2"
              fill="#00F5FF"
              opacity="0.5"
              filter="url(#neonDividerGlow)"
            />
            <circle cx={studX} cy={studY} r="2.8" fill="#38BDF8" />
            <circle cx={studX - 0.7} cy={studY - 0.7} r="1.1" fill="#FFFFFF" />
          </React.Fragment>
        ))}
      </g>

      {/* 3. LỚP BÓNG ĐỔ LÒNG CHẢO NHẸ */}
      <circle cx="0" cy="0" r={RADIUS} fill="url(#discBowlShadow)" />

      {/* 4. VIỀN NGOÀI CÙNG CỦA ĐĨA XOAY */}
      <circle
        cx="0"
        cy="0"
        r={RADIUS - 1.5}
        fill="none"
        stroke="#00F5FF"
        strokeWidth="3.5"
        strokeOpacity="0.35"
        filter="url(#neonDividerGlow)"
      />
      <circle
        cx="0"
        cy="0"
        r={RADIUS - 1.5}
        fill="none"
        stroke="#E0F2FE"
        strokeWidth="2"
        strokeOpacity="0.85"
      />
    </svg>
  );
}
