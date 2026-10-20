import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Button3DVariant =
  | "yellow"
  | "green"
  | "orange"
  | "blue"
  | "purple"
  | "slate"
  | "gray"
  | "disabled";

export type Button3DSize = "sm" | "md" | "lg";

export interface Button3DProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Button3DVariant;
  size?: Button3DSize;
  fullWidth?: boolean;
  gloss?: boolean;
  href?: string;
  children?: React.ReactNode;
}

export const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  (
    {
      variant = "yellow",
      size = "md",
      fullWidth = false,
      gloss = true,
      disabled = false,
      href,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Determine effective variant: if disabled prop is true, force disabled styling
    const effectiveVariant = disabled ? "disabled" : variant;

    // Base structural classes
    const baseClasses =
      "relative inline-flex items-center justify-center font-heading font-black select-none rounded-full transition-all duration-150";

    // Size variants
    const sizeClasses: Record<Button3DSize, string> = {
      sm: "py-1.5 px-3 text-xs tracking-wide",
      md: "py-2.5 px-4 text-sm sm:text-[15px] tracking-wide",
      lg: "py-3 sm:py-3.5 px-6 text-base sm:text-lg lg:text-xl tracking-wider",
    };

    // Color and 3D extrusion variants
    const variantClasses: Record<Button3DVariant, string> = {
      yellow:
        "bg-gradient-to-b from-[#FFE84D] via-[#FFBA08] to-[#F48C06] " +
        "shadow-[inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-2px_0_rgba(0,0,0,0.15),0_5px_0_#9D4800,0_8px_14px_rgba(0,0,0,0.2)] " +
        "active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#9D4800,0_3px_6px_rgba(0,0,0,0.18)] " +
        "hover:brightness-105 text-[#4D2200] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] cursor-pointer overflow-hidden",

      green:
        "bg-gradient-to-b from-[#34E876] via-[#1DC459] to-[#0A8F3D] " +
        "shadow-[inset_0_2px_0_rgba(255,255,255,0.65),inset_0_-2px_0_rgba(0,0,0,0.15),0_5px_0_#065F26,0_8px_14px_rgba(0,0,0,0.2)] " +
        "active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#065F26,0_3px_6px_rgba(0,0,0,0.18)] " +
        "hover:brightness-105 text-white drop-shadow-[0_1.5px_0_#064D1F] cursor-pointer overflow-hidden",

      orange:
        "bg-gradient-to-b from-[#FF7A00] via-[#FF6000] to-[#E64500] " +
        "shadow-[inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-2px_0_rgba(0,0,0,0.2),0_6px_0_#8F1F00,0_10px_20px_rgba(0,0,0,0.25)] " +
        "active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#8F1F00,0_4px_6px_rgba(0,0,0,0.2)] " +
        "hover:brightness-105 text-white [text-shadow:_0_1.5px_0_#9E3500,_0_2px_4px_rgba(100,20,0,0.25)] cursor-pointer",

      blue:
        "bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0369A1] " +
        "shadow-[inset_0_2px_0_rgba(255,255,255,0.65),inset_0_-2px_0_rgba(0,0,0,0.15),0_5px_0_#074E79,0_8px_14px_rgba(0,0,0,0.2)] " +
        "active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#074E79,0_3px_6px_rgba(0,0,0,0.18)] " +
        "hover:brightness-105 text-white drop-shadow-[0_1.5px_0_#034066] cursor-pointer overflow-hidden",

      purple:
        "bg-gradient-to-b from-[#C084FC] via-[#9333EA] to-[#6B21A8] " +
        "shadow-[inset_0_2px_0_rgba(255,255,255,0.65),inset_0_-2px_0_rgba(0,0,0,0.15),0_5px_0_#4C1D95,0_8px_14px_rgba(0,0,0,0.2)] " +
        "active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#4C1D95,0_3px_6px_rgba(0,0,0,0.18)] " +
        "hover:brightness-105 text-white drop-shadow-[0_1.5px_0_#3B0764] cursor-pointer overflow-hidden",

      slate:
        "bg-slate-100 shadow-[0_4px_0_#CBD5E1] active:translate-y-[2px] active:shadow-[0_2px_0_#CBD5E1] " +
        "hover:bg-slate-200 text-slate-600 font-bold cursor-pointer",

      gray:
        "bg-slate-100 shadow-[0_4px_0_#CBD5E1] active:translate-y-[2px] active:shadow-[0_2px_0_#CBD5E1] " +
        "hover:bg-slate-200 text-slate-600 font-bold cursor-pointer",

      disabled:
        "bg-slate-200 shadow-[0_3px_0_#CBD5E1] text-slate-500 font-bold cursor-default opacity-85",
    };

    // Gloss sheen gradient (only applied if gloss is enabled and not disabled/slate)
    const showGloss =
      gloss &&
      effectiveVariant !== "disabled" &&
      effectiveVariant !== "slate" &&
      effectiveVariant !== "gray";

    const commonClasses = cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[effectiveVariant],
      fullWidth && "w-full",
      className
    );

    // If href is provided, render as next/link
    if (href && !disabled && effectiveVariant !== "disabled") {
      return (
        <Link href={href} className={commonClasses}>
          {showGloss && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-full pointer-events-none z-0"
            />
          )}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || effectiveVariant === "disabled"}
        className={commonClasses}
        {...props}
      >
        {/* Top Gloss Sheen Layer */}
        {showGloss && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-full pointer-events-none z-0"
          />
        )}

        {children}
      </button>
    );
  }
);

Button3D.displayName = "Button3D";
