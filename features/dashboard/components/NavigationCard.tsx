"use client";

import React from "react";
import Image from "next/image";
import { NavigationItem } from "../data/navigationData";
import { cn } from "@/lib/utils";
import { Button3D } from "@/components/ui/Button3D";

interface NavigationCardProps {
  item: NavigationItem;
}

export function NavigationCard({ item }: NavigationCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[26px] border-[3.5px] shadow-[0_10px_24px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 select-none",
        item.borderColor,
        item.bodyBg
      )}
    >
      {/* Top Header Banner with Upward Arc - Fixed Synchronous Height */}
      <div
        className={cn(
          "w-full h-[60px] sm:h-[66px] pt-1.5 pb-5 px-3 flex items-center justify-center text-center text-white relative",
          item.headerBg
        )}
      >
        <h3 className="font-heading font-black text-[13.5px] sm:text-[14.5px] lg:text-[15px] leading-tight drop-shadow-[0_1.5px_0_rgba(0,0,0,0.25)] select-none uppercase tracking-wide">
          {item.title}
        </h3>

        {/* Smooth upward arc / vòng cung */}
        <div className="absolute -bottom-px left-0 right-0 h-5 sm:h-6 w-full pointer-events-none overflow-hidden">
          <svg viewBox="0 0 500 45" preserveAspectRatio="none" className={cn("w-full h-full", item.arcFill)}>
            <path d="M0,45 Q250,-5 500,45 L500,50 L0,50 Z" />
          </svg>
        </div>
      </div>

      {/* Card Center: 3D Illustration & Information */}
      <div className="px-3.5 py-1.5 sm:py-2 flex items-center justify-between gap-2.5">
        {/* Navigation 3D Icon */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 relative flex-shrink-0 transition-transform hover:scale-105 duration-200">
          <Image
            src={item.iconSrc}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 64px, 80px"
            unoptimized
            className="object-contain drop-shadow-sm"
          />
        </div>

        {/* Card Details: Tag & Subtitle */}
        <div className="flex-1 flex flex-col items-start gap-1 pr-1">
          <span
            className={cn(
              "font-heading font-black text-[10.5px] sm:text-[11.5px] uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs",
              item.badgeStyle
            )}
          >
            {item.badgeText}
          </span>
          <span className="font-heading font-bold text-xs sm:text-[13px] text-slate-700 leading-tight">
            {item.subtitle}
          </span>
        </div>
      </div>

      {/* Bottom Action Button (Chỉ nhấn vào nút mới chuyển trang) */}
      <div className="p-3 sm:p-3.5 pt-0.5 flex justify-center">
        <Button3D
          href={item.href}
          variant={item.buttonVariant}
          fullWidth
          size="md"
        >
          {item.buttonText}
        </Button3D>
      </div>
    </div>
  );
}

