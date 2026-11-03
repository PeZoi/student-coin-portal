"use client";

import React, { useEffect, useRef, useState, useImperativeHandle } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "default" | "cream" | "white";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "onChange"> {
  /** Nhãn hiển thị phía trên ô chọn */
  label?: string;
  /** Biểu tượng hoặc emoji hiển thị ở phía trước ô chọn */
  icon?: React.ReactNode;
  /** Danh sách các options */
  options: SelectOption[];
  /** Thông báo lỗi kiểm tra form */
  error?: string;
  /** Chú thích trợ giúp bên dưới ô chọn */
  helperText?: string;
  /** Placeholder hiển thị khi chưa có giá trị được chọn */
  placeholder?: string;
  /** Kích thước của ô chọn */
  selectSize?: SelectSize;
  /** Biến thể màu sắc nền */
  variant?: SelectVariant;
  /** Tùy biến class cho ô trigger */
  className?: string;
  /** Tùy biến class cho khung bọc trực tiếp ô select (trigger) */
  containerClassName?: string;
  /** Tùy biến class cho toàn bộ khối (bao gồm label, select, error) */
  wrapperClassName?: string;
  /** Callback khi thay đổi giá trị */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      icon,
      options,
      error,
      helperText,
      placeholder = "-- Chọn một mục --",
      selectSize = "md",
      variant = "default",
      className,
      containerClassName,
      wrapperClassName,
      disabled,
      id,
      name,
      value: controlledValue,
      defaultValue,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    // Quản lý trạng thái mở/đóng menu custom
    const [isOpen, setIsOpen] = useState(false);

    // Giá trị hiện tại (hỗ trợ cả controlled và uncontrolled từ react-hook-form)
    const initialVal = (controlledValue ?? defaultValue ?? (options.length > 0 ? options[0].value : "")) as string | number;
    const [selectedValue, setSelectedValue] = useState<string | number>(initialVal);

    // Đồng bộ khi controlledValue thay đổi từ bên ngoài (reset form, v.v.)
    useEffect(() => {
      if (controlledValue !== undefined) {
        setSelectedValue(controlledValue as string | number);
      }
    }, [controlledValue]);

    // DOM Refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);

    // Forward ref cho hidden select để tương thích 100% với react-hook-form
    useImperativeHandle(ref, () => hiddenSelectRef.current as HTMLSelectElement);

    // Tìm option đang được chọn để hiển thị nhãn
    const selectedOption = options.find(
      (opt) => String(opt.value) === String(selectedValue)
    );

    // Tự động sinh ID hỗ trợ Accessibility
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const errorId = selectId ? `${selectId}-error` : undefined;
    const helperId = selectId ? `${selectId}-helper` : undefined;
    const listboxId = selectId ? `${selectId}-listbox` : undefined;

    // Kích thước chiều cao, padding và font chữ
    const sizeConfig: Record<SelectSize, { container: string; text: string; icon: string; item: string }> = {
      sm: {
        container: "px-2.5 py-1.5 rounded-xl",
        text: "text-xs",
        icon: "w-5 h-5 text-base mr-1.5",
        item: "px-2.5 py-1.5 text-xs",
      },
      md: {
        container: "px-2.5 sm:px-3 py-2 transition-all rounded-2xl",
        text: "text-xs sm:text-sm",
        icon: "w-5 h-5 sm:w-6 sm:h-6 text-base sm:text-lg mr-1.5 sm:mr-2",
        item: "px-3 py-2 text-xs sm:text-sm",
      },
      lg: {
        container: "px-3.5 py-2.5 sm:py-3 rounded-2xl",
        text: "text-sm sm:text-base",
        icon: "w-7 h-7 text-xl sm:text-2xl mr-2.5",
        item: "px-3.5 py-2.5 text-sm sm:text-base",
      },
    };

    // Biến thể màu nền
    const variantClasses: Record<SelectVariant, string> = {
      default: "bg-white",
      white: "bg-white",
      cream: "bg-[#FFF9EA]",
    };

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          // Kích hoạt onBlur cho react-hook-form
          if (onBlur && hiddenSelectRef.current) {
            const blurEvent = new FocusEvent("blur");
            onBlur(blurEvent as unknown as React.FocusEvent<HTMLSelectElement>);
          }
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen, onBlur]);

    // Xử lý khi chọn một mục
    const handleSelectOption = (option: SelectOption) => {
      if (option.disabled || disabled) return;

      setSelectedValue(option.value);
      setIsOpen(false);

      // Cập nhật giá trị vào hidden select & kích hoạt sự kiện change cho react-hook-form
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = String(option.value);

        // Tạo Synthetic event để truyền cho callback onChange
        const event = new Event("change", { bubbles: true });
        hiddenSelectRef.current.dispatchEvent(event);

        if (onChange) {
          const syntheticEvent = {
            target: hiddenSelectRef.current,
            currentTarget: hiddenSelectRef.current,
          } as unknown as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        }
      }
    };

    return (
      <div className={cn("w-full flex flex-col", wrapperClassName)} ref={containerRef}>
        {/* Label hoạt hình đồng bộ hệ thống */}
        {label && (
          <label
            htmlFor={selectId}
            className="block font-heading font-extrabold text-xs sm:text-sm text-[#4A2307] mb-1 select-none"
          >
            {label}
          </label>
        )}

        {/* Khung ô chọn (Custom Trigger) */}
        <div className="relative w-full">
          <button
            type="button"
            role="combobox"
            id={selectId}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            className={cn(
              "relative w-full flex items-center justify-between border-2 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] cursor-pointer select-none text-left",
              variantClasses[variant],
              sizeConfig[selectSize].container,
              isOpen
                ? "border-[#F59E0B] ring-2 ring-amber-400/30 scale-[1.005]"
                : error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/30"
                : "border-[#D8C7B0] hover:border-[#C4B097] focus:border-[#F59E0B] focus:ring-2 focus:ring-amber-400/30",
              disabled && "opacity-60 bg-stone-100 cursor-not-allowed",
              containerClassName
            )}
          >
            <div className="flex items-center min-w-0 mr-2">
              {/* Biểu tượng hoặc Emoji đứng trước */}
              {icon && (
                <div
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center select-none leading-none",
                    sizeConfig[selectSize].icon
                  )}
                  aria-hidden="true"
                >
                  {icon}
                </div>
              )}

              {/* Nhãn hiển thị của Option đang chọn */}
              <span
                className={cn(
                  "font-sans font-bold truncate",
                  sizeConfig[selectSize].text,
                  selectedOption ? "text-[#3B1902]" : "text-[#A38E7D] font-normal",
                  className
                )}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>

            {/* Mũi tên xổ xuống tùy biến sinh động */}
            <div
              className={cn(
                "flex-shrink-0 flex items-center justify-center text-[#8C6D53] transition-transform duration-200",
                isOpen && "rotate-180 text-amber-600"
              )}
              aria-hidden="true"
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* ========================================================================= */}
          {/* MENU DANH SÁCH OPTIONS TÙY BIẾN HOẠT HÌNH 3D (CUSTOM DROPDOWN LIST) */}
          {/* ========================================================================= */}
          {isOpen && (
            <div
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              aria-label={label || placeholder}
              className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#FFFDF7] border-2 border-[#D8C7B0] rounded-2xl shadow-[0_12px_28px_rgba(40,15,0,0.18),0_2px_6px_rgba(0,0,0,0.06)] p-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            >
              {options.map((option) => {
                const isSelected = String(option.value) === String(selectedValue);
                return (
                  <button
                    type="button"
                    key={String(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => handleSelectOption(option)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl font-sans font-bold transition-all cursor-pointer mb-0.5 last:mb-0 text-left",
                      sizeConfig[selectSize].item,
                      option.disabled
                        ? "opacity-40 cursor-not-allowed text-stone-400"
                        : isSelected
                        ? "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]/80 shadow-sm"
                        : "text-[#4A2307] hover:bg-[#FDF2D6] hover:text-[#78350F]"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0 ml-2 drop-shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Hidden Native Select để tương thích 100% với React Hook Form và HTML Form Submit */}
        <select
          ref={hiddenSelectRef}
          name={name}
          value={String(selectedValue)}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          {...props}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

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

Select.displayName = "Select";
