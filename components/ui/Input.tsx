import React from "react";
import { cn } from "@/lib/utils";

export type InputSize = "sm" | "md" | "lg";
export type InputVariant = "default" | "cream" | "white";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Nhãn hiển thị phía trên ô nhập liệu */
  label?: string;
  /** Biểu tượng hoặc emoji hiển thị ở phía trước ô nhập liệu */
  icon?: React.ReactNode;
  /** Phần tử hiển thị ở phía cuối ô nhập (ví dụ: nút ẩn/hiện mật khẩu) */
  rightElement?: React.ReactNode;
  /** Thông báo lỗi kiểm tra form */
  error?: string;
  /** Chú thích trợ giúp bên dưới ô nhập liệu */
  helperText?: string;
  /** Kích thước của ô nhập liệu */
  inputSize?: InputSize;
  /** Biến thể màu sắc nền */
  variant?: InputVariant;
  /** Tùy biến class cho thẻ input bên trong */
  className?: string;
  /** Tùy biến class cho khung bọc trực tiếp ô input (chứa icon + input + rightElement) */
  containerClassName?: string;
  /** Tùy biến class cho toàn bộ khối (bao gồm label, input, error) */
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon,
      rightElement,
      error,
      helperText,
      inputSize = "md",
      variant = "default",
      className,
      containerClassName,
      wrapperClassName,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Tự động sinh ID nếu có label để hỗ trợ accessibility
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    // Cấu hình kích thước chiều cao, font chữ và icon
    const sizeConfig: Record<InputSize, { container: string; input: string; icon: string }> = {
      sm: {
        container: "px-2.5 py-1.5 rounded-xl",
        input: "text-xs",
        icon: "w-5 h-5 text-base mr-1.5",
      },
      md: {
        container: "px-3 py-2 sm:py-2.5 rounded-2xl",
        input: "text-xs sm:text-sm md:text-base",
        icon: "w-6 h-6 sm:w-7 sm:h-7 text-lg sm:text-xl md:text-2xl mr-2 sm:mr-2.5",
      },
      lg: {
        container: "px-3.5 py-3 rounded-2xl",
        input: "text-base sm:text-lg",
        icon: "w-7 h-7 sm:w-8 sm:h-8 text-xl sm:text-2xl mr-2.5 sm:mr-3",
      },
    };

    // Biến thể màu nền
    const variantClasses: Record<InputVariant, string> = {
      default: "bg-white",
      white: "bg-white",
      cream: "bg-[#FFF9EA]",
    };

    return (
      <div className={cn("w-full flex flex-col", wrapperClassName)}>
        {/* Label hoạt hình đồng bộ hệ thống */}
        {label && (
          <label
            htmlFor={inputId}
            className="block font-heading font-extrabold text-xs sm:text-sm text-[#4A2307] mb-1 select-none"
          >
            {label}
          </label>
        )}

        {/* Khung viền 3D dập nổi tương thích toàn bộ hệ thống */}
        <div
          className={cn(
            "relative flex items-center border-2 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
            variantClasses[variant],
            sizeConfig[inputSize].container,
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/30"
              : "border-[#D8C7B0] focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-amber-400/30",
            disabled ? "opacity-60 bg-stone-100 cursor-not-allowed" : "hover:border-[#C4B097]",
            containerClassName
          )}
        >
          {/* Biểu tượng hoặc Emoji đứng trước */}
          {icon && (
            <div
              className={cn(
                "flex-shrink-0 flex items-center justify-center select-none leading-none",
                sizeConfig[inputSize].icon
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          {/* Thẻ Input chính */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              "w-full bg-transparent font-sans font-bold text-[#3B1902] placeholder:text-[#A38E7D] placeholder:font-normal focus:outline-none",
              sizeConfig[inputSize].input,
              disabled && "cursor-not-allowed",
              className
            )}
            {...props}
          />

          {/* Phần tử bên phải (ví dụ: nút toggle ẩn/hiện password) */}
          {rightElement && (
            <div className="flex-shrink-0 ml-1.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>

        {/* Thông báo lỗi validation */}
        {error && (
          <p id={errorId} className="mt-1 text-xs font-bold text-red-600 pl-1.5 animate-fadeIn">
            {error}
          </p>
        )}

        {/* Chú thích trợ giúp */}
        {!error && helperText && (
          <p id={helperId} className="mt-0.5 text-xs text-[#7A5433] pl-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

