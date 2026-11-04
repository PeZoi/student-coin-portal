"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOptionItem {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectOptionTileProps {
  option: SelectOptionItem;
  isSelected: boolean;
  layout: "grid" | "list";
  onSelect: (option: SelectOptionItem) => void;
  id?: string;
  className?: string;
}

export const SelectOptionTile = React.forwardRef<
  HTMLButtonElement,
  SelectOptionTileProps
>(({ option, isSelected, layout, onSelect, id, className }, ref) => {
  const isGrid = layout === "grid";

  return (
    <button
      ref={ref}
      type="button"
      id={id}
      disabled={option.disabled}
      onClick={() => onSelect(option)}
      style={{ touchAction: "manipulation" }}
      className={cn(
        "relative flex items-center transition-all select-none cursor-pointer border-2 font-heading font-black",
        isGrid
          ? "min-h-[52px] px-2.5 py-2 rounded-2xl justify-center text-center text-base sm:text-[17px]"
          : "min-h-[48px] px-4 py-2.5 rounded-2xl justify-between text-left text-base sm:text-[17px]",
        // Trạng thái đang chọn vs chưa chọn (Hiệu ứng 3D Game)
        isSelected
          ? "bg-[#FEF3C7] border-[#D97706] text-[#78350F] shadow-[0_3px_0_#B45309] active:translate-y-[2px] active:shadow-[0_1px_0_#B45309]"
          : "bg-white border-[#E3D2B3] text-[#4A2307] shadow-[0_3px_0_#E3D2B3] hover:border-[#D97706]/70 active:translate-y-[2px] active:shadow-[0_1px_0_#E3D2B3]",
        option.disabled && "opacity-40 cursor-not-allowed pointer-events-none shadow-none",
        className
      )}
    >
      {/* Nhãn của Option */}
      <span className="truncate drop-shadow-2xs">{option.label}</span>

      {/* Huy hiệu tích chọn tròn xanh lá 20px chuẩn phong cách dự án */}
      {isSelected && (
        <div
          className={cn(
            "w-5 h-5 rounded-full bg-[#16A34A] border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center text-white flex-shrink-0 animate-in zoom-in-75 duration-150 motion-reduce:animate-none",
            isGrid ? "absolute -top-1.5 -right-1.5 z-10" : "ml-3"
          )}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}
    </button>
  );
});

SelectOptionTile.displayName = "SelectOptionTile";
