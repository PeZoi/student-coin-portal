"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordToggleProps {
  /** Trạng thái đang hiển thị mật khẩu / mã PIN hay không */
  show: boolean;
  /** Hàm callback khi click để đổi trạng thái */
  onToggle: () => void;
  /** Loại field để hiển thị nhãn gợi ý (mặc định là "pin") */
  fieldType?: "pin" | "password";
  /** Disabled */
  disabled?: boolean;
  /** Tùy biến className */
  className?: string;
}

export function PasswordToggle({
  show,
  onToggle,
  fieldType = "pin",
  disabled = false,
  className,
}: PasswordToggleProps) {
  const isPin = fieldType === "pin";
  const label = show
    ? isPin
      ? "Ẩn mã PIN"
      : "Ẩn mật khẩu"
    : isPin
    ? "Hiện mã PIN"
    : "Hiện mật khẩu";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={label}
      className={cn(
        "w-10 h-10 -mr-1.5 flex items-center justify-center rounded-xl text-[#85705C] hover:text-[#3B1902] hover:bg-[#FFF0D1]/60 focus-visible:outline-2 focus-visible:outline-amber-600 transition-colors cursor-pointer select-none",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {show ? (
        <EyeOff className="w-4 h-4 stroke-[2.2]" />
      ) : (
        <Eye className="w-4 h-4 stroke-[2.2]" />
      )}
    </button>
  );
}
