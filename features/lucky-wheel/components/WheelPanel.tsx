import React from "react";
import { cn } from "@/lib/utils";

export type WheelPanelTone = "purple" | "green" | "orange";

interface WheelPanelProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  tone: WheelPanelTone;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const headerToneClasses: Record<WheelPanelTone, string> = {
  purple: "bg-[#7C3AED] border-b border-[#6D28D9]",
  green: "bg-[#16A34A] border-b border-[#15803D]",
  orange: "bg-[#EA580C] border-b border-[#C2410C]",
};

/**
 * Khung bảng: header phẳng gọn (không bóng) + thân giấy kem + viền bo tròn 3D.
 */
export function WheelPanel({
  title,
  subtitle,
  icon,
  tone,
  action,
  footer,
  children,
  className,
}: WheelPanelProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-[26px] border-[3px] border-[#B45309] bg-[#FFF8E7] shadow-[0_6px_0_#92400E,0_18px_32px_rgba(0,0,0,0.2)] overflow-hidden select-none",
        className
      )}
    >
      {/* HEADER: Phẳng, mịn, không bóng */}
      <div
        className={cn(
          "relative flex items-center justify-between gap-2 px-3.5 py-3",
          headerToneClasses[tone]
        )}
      >

        <div className="relative flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/95 flex items-center justify-center flex-shrink-0 shadow-[0_3px_0_rgba(0,0,0,0.2)]">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-black text-white text-sm sm:text-[15px] tracking-wide leading-tight truncate [text-shadow:_0_2px_0_rgba(0,0,0,0.25)]">
              {title}
            </h3>
            {subtitle && (
              <p className="font-heading font-bold text-white/85 text-[10.5px] leading-tight truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div className="relative flex-shrink-0">{action}</div>}
      </div>

      {/* BODY */}
      <div className="p-3 sm:p-3.5">{children}</div>

      {/* FOOTER */}
      {footer && (
        <div className="px-3.5 py-2 border-t-2 border-dashed border-amber-900/15 bg-amber-100/50">
          {footer}
        </div>
      )}
    </div>
  );
}
