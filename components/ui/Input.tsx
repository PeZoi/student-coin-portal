"use client";

import React, { useImperativeHandle, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FIELD_BASE_BORDER,
  FIELD_DISABLED,
  FIELD_ERROR_BORDER,
  FIELD_FOCUS_RING,
  FIELD_LABEL,
  FIELD_PLAIN_ICON,
  FIELD_SIZES,
  FIELD_TILE_ICON,
  FIELD_VALUE_TEXT,
  FIELD_VARIANTS,
  FieldIconStyle,
  FieldSize,
  FieldVariant,
} from "./fieldStyles";

export type InputSize = FieldSize;
export type InputVariant = FieldVariant;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Nhãn hiển thị phía trên ô nhập liệu */
  label?: string;
  /** Biểu tượng hoặc emoji hiển thị ở phía trước ô nhập liệu */
  icon?: React.ReactNode;
  /** Kiểu hiển thị icon: dạng ô vuông tile hoặc plain */
  iconStyle?: FieldIconStyle;
  /** Phần tử hiển thị ở phía cuối ô nhập (ví dụ: nút ẩn/hiện mật khẩu) */
  rightElement?: React.ReactNode;
  /** Thông báo lỗi kiểm tra form */
  error?: string;
  /** Chú thích trợ giúp bên dưới ô nhập liệu */
  helperText?: string;
  /** Kích thước của ô nhập liệu (sm: 40px, md: 48px, lg: 56px) */
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
      iconStyle = "tile",
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
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const sizeConfig = FIELD_SIZES[inputSize];

    // Chạm vào vùng đệm khung hoặc icon thì tự động focus vào ô input
    const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      // Không cướp focus nếu bấm vào input hoặc button (ví dụ nút con mắt)
      if (
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON" ||
        target.closest("button")
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };

    return (
      <div className={cn("w-full flex flex-col", wrapperClassName)}>
        {/* Label hoạt hình đồng bộ hệ thống */}
        {label && (
          <label htmlFor={id} className={FIELD_LABEL}>
            {label}
          </label>
        )}

        {/* Khung viền 3D dập nổi chuẩn tương thích toàn bộ hệ thống */}
        <div
          onMouseDown={handleContainerMouseDown}
          className={cn(
            "relative flex items-center transition-all cursor-text",
            FIELD_VARIANTS[variant],
            sizeConfig.container,
            error ? FIELD_ERROR_BORDER : cn(FIELD_BASE_BORDER, FIELD_FOCUS_RING),
            disabled && FIELD_DISABLED,
            containerClassName
          )}
        >
          {/* Biểu tượng hoặc Emoji đứng trước */}
          {icon && (
            <div
              className={cn(
                iconStyle === "tile"
                  ? cn(FIELD_TILE_ICON, sizeConfig.tileIcon)
                  : cn(FIELD_PLAIN_ICON, sizeConfig.plainIcon)
              )}
            >
              {icon}
            </div>
          )}

          {/* Thẻ Input chính */}
          <input
            ref={inputRef}
            id={id}
            disabled={disabled}
            className={cn(
              "w-full bg-transparent focus:outline-none",
              FIELD_VALUE_TEXT,
              sizeConfig.text,
              disabled && "cursor-not-allowed",
              className
            )}
            {...props}
          />

          {/* Phần tử bên phải (ví dụ: nút toggle ẩn/hiện password) */}
          {rightElement && (
            <div className="flex-shrink-0 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>

        {/* Thông báo lỗi validation kèm icon cảnh báo nhỏ */}
        {error && (
          <div className="flex items-center gap-1.5 mt-1.5 pl-1 text-[13px] font-bold text-[#DC2626] animate-in fade-in duration-150">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#DC2626]" />
            <span>{error}</span>
          </div>
        )}

        {/* Chú thích trợ giúp */}
        {!error && helperText && (
          <p className="mt-1 text-[13px] text-[#7A5433] pl-1 font-medium">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
