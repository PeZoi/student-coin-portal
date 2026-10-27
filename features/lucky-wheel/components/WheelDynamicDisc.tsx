import React, { useMemo } from "react";
import { WheelPrize } from "../types";
import { WHEEL_THEME, getSliceTheme } from "../wheelTheme";

interface WheelDynamicDiscProps {
  prizes: WheelPrize[];
}

/**
 * Đĩa quay động SVG (Dynamic SVG Wheel Disc).
 * Tô màu xen kẽ chẵn/lẻ theo WHEEL_THEME (vàng kem / xanh dương),
 * hướng gradient tỏa từ tâm ra rìa, đường chia nan trắng 2px và chốt tròn viền trắng.
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

      const r1 = (startDeg * Math.PI) / 180;
      const r2 = (endDeg * Math.PI) / 180;

      // 0 độ là hướng 12h (lên trên), chiều kim đồng hồ
      const x1 = RADIUS * Math.sin(r1);
      const y1 = -RADIUS * Math.cos(r1);
      const x2 = RADIUS * Math.sin(r2);
      const y2 = -RADIUS * Math.cos(r2);

      // Đường path hình quạt
      const pathData = `M 0 0 L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${RADIUS} ${RADIUS} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;

      // Vị trí chốt tròn ở rìa ngoài của đường chia nan
      const studR = RADIUS * 0.94;
      const studX = studR * Math.sin(r1);
      const studY = -studR * Math.cos(r1);

      // Lấy theme màu theo chỉ số vị trí chẵn/lẻ (tâm sáng hơn, rìa đậm hơn)
      const theme = getSliceTheme(i);

      return {
        id: prize.id,
        index: i,
        pathData,
        x1,
        y1,
        studX,
        studY,
        theme,
      };
    });
  }, [prizes, segmentAngle]);

  return (
    <svg
      viewBox={`-${RADIUS} -${RADIUS} ${RADIUS * 2} ${RADIUS * 2}`}
      className="absolute inset-0 w-full h-full pointer-events-none select-none rounded-full"
    >
      <defs>
        {/* Gradients tỏa tròn đồng nhất cho từng múi: tâm sáng hơn (from), rìa đậm hơn (to) */}
        {slicesData.map(({ index, theme }) => (
          <radialGradient
            key={`slice-grad-${index}`}
            id={`slice-grad-${index}`}
            cx="0"
            cy="0"
            r={RADIUS}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={theme.from} stopOpacity="1" />
            <stop offset="100%" stopColor={theme.to} stopOpacity="1" />
          </radialGradient>
        ))}

        {/* Bóng lòng chảo nhẹ ở rìa đĩa tạo chiều sâu 3D */}
        <radialGradient id="discBowlShadow" cx="0" cy="0" r={RADIUS} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="78%" stopColor="#000000" stopOpacity="0" />
          <stop offset="94%" stopColor="#000000" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </radialGradient>
      </defs>

      {/* 1. CÁC MÚI QUẠT: Tô theo chỉ số chẵn/lẻ, hướng gradient từ tâm ra rìa */}
      <g>
        {slicesData.map(({ id, index, pathData }) => (
          <path
            key={`wedge-${id}-${index}`}
            d={pathData}
            fill={`url(#slice-grad-${index})`}
          />
        ))}
      </g>

      {/* 2. CÁC ĐƯỜNG PHÂN CÁCH GIỮA CÁC MIẾNG & CHỐT TRÒN RÌA */}
      <g>
        {slicesData.map(({ index, x1, y1, studX, studY }) => (
          <React.Fragment key={`divider-${index}`}>
            {/* Đường phân cách giữa các miếng: divider dày 2px */}
            <line
              x1="0"
              y1="0"
              x2={x1}
              y2={y1}
              stroke={WHEEL_THEME.divider}
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Chốt tròn ở rìa miếng: nền #FFC93C, viền trắng 1.5px */}
            <circle
              cx={studX}
              cy={studY}
              r="4.5"
              fill={WHEEL_THEME.rim.mid}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Điểm nhấn sáng nhẹ trên chốt tròn */}
            <circle
              cx={studX - 0.9}
              cy={studY - 0.9}
              r="1.2"
              fill="#FFFFFF"
              opacity="0.8"
            />
          </React.Fragment>
        ))}
      </g>

      {/* 3. LỚP BÓNG ĐỔ LÒNG CHẢO TẠO CHIỀU SÂU */}
      <circle cx="0" cy="0" r={RADIUS} fill="url(#discBowlShadow)" />

      {/* 4. VIỀN TRONG SÁT CÁC MIẾNG: Trắng 3px, opacity 0.9 */}
      <circle
        cx="0"
        cy="0"
        r={RADIUS - 1.5}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeOpacity="0.9"
      />
    </svg>
  );
}
