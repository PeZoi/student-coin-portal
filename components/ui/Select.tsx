"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useControllableState } from "@/hooks/useControllableState";
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
import { SelectSheet } from "./select/SelectSheet";
import { SelectSheetTone } from "./select/selectTheme";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type SelectSize = FieldSize;
export type SelectVariant = FieldVariant;

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "onChange"> {
  /** Nhãn hiển thị phía trên ô chọn */
  label?: string;
  /** Biểu tượng hoặc emoji hiển thị ở phía trước ô chọn */
  icon?: React.ReactNode;
  /** Kiểu hiển thị icon: dạng ô vuông tile hoặc plain */
  iconStyle?: FieldIconStyle;
  /** Danh sách các options */
  options: SelectOption[];
  /** Thông báo lỗi kiểm tra form */
  error?: string;
  /** Chú thích trợ giúp bên dưới ô chọn */
  helperText?: string;
  /** Placeholder hiển thị khi chưa có giá trị được chọn */
  placeholder?: string;
  /** Kích thước của ô chọn (sm: 40px, md: 48px, lg: 56px) */
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

  // =========================================================================
  // CÁC PROP TÙY CHỌN BỔ SUNG CHO BOTTOM SHEET TRÊN MOBILE & TÌM KIẾM
  // =========================================================================
  /** Tiêu đề của Bottom Sheet trên mobile (mặc định lấy từ label hoặc placeholder) */
  sheetTitle?: string;
  /** Tone màu của Header Bottom Sheet ("orange" | "blue" | "green" | "purple", mặc định "orange") */
  sheetTone?: SelectSheetTone;
  /** Kiểu bố trí các mục trong sheet ("auto" | "list" | "grid", mặc định "auto") */
  optionLayout?: "auto" | "list" | "grid";
  /** Số cột trong Grid Layout của sheet (mặc định: 3, tự co về 2 nếu nhãn dài) */
  gridCols?: 2 | 3 | 4;
  /** Cho phép tìm kiếm theo tên mục (mặc định: true) */
  searchable?: boolean;
  /** Placeholder cho ô tìm kiếm */
  searchPlaceholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      icon,
      iconStyle = "tile",
      options,
      error,
      helperText,
      placeholder = "Chọn một mục",
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
      sheetTitle,
      sheetTone = "orange",
      optionLayout = "auto",
      gridCols = 3,
      searchable = true,
      searchPlaceholder = "Tìm kiếm...",
      ...props
    },
    ref
  ) => {
    // Trạng thái mở/đóng dropdown trên desktop
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // Trạng thái mở/đóng sheet trên mobile/cảm ứng
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    // Hướng mở dropdown: true là mở lên trên (flip-up), false là mở xuống dưới
    const [openUpward, setOpenUpward] = useState(false);
    // Chiều cao tối đa tính động cho dropdown trên desktop để không tràn viewport
    const [dropdownMaxHeight, setDropdownMaxHeight] = useState<number>(240);
    // Vị trí mục đang được focus qua phím mũi tên trên desktop dropdown
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    // Từ khóa tìm kiếm trên Desktop Dropdown
    const [desktopSearchQuery, setDesktopSearchQuery] = useState("");

    // Xác định kiểu hiển thị: Mobile/Touch dùng Sheet, Desktop dùng Dropdown
    const isMobileOrTouch = useMediaQuery("(max-width: 639px), (pointer: coarse)");
    const presentation: "sheet" | "dropdown" = isMobileOrTouch ? "sheet" : "dropdown";

    // Quản lý giá trị chọn: Dùng useControllableState hỗ trợ cả controlled & uncontrolled chuẩn xác
    const [selectedValue, setSelectedValue] = useControllableState<string | number>({
      prop: controlledValue as string | number | undefined,
      defaultProp: (defaultValue ?? "") as string | number,
    });

    // DOM Refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const listboxRef = useRef<HTMLDivElement | null>(null);
    const selectedItemRef = useRef<HTMLButtonElement | null>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);
    const typeaheadTimerRef = useRef<NodeJS.Timeout | null>(null);
    const typeaheadQueryRef = useRef<string>("");

    // LUÔN LUÔN trỏ ref tới hidden native select ở MỌI thiết bị
    useImperativeHandle(ref, () => hiddenSelectRef.current as HTMLSelectElement);

    const sizeConfig = FIELD_SIZES[selectSize];

    // Tìm option đang được chọn
    const selectedOption = options.find(
      (opt) => String(opt.value) === String(selectedValue)
    );

    // Lọc options trên Desktop Dropdown khi có tìm kiếm
    const filteredDesktopOptions = useMemo(() => {
      if (!searchable || !desktopSearchQuery.trim()) return options;
      const q = desktopSearchQuery.trim().toLowerCase();
      return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, searchable, desktopSearchQuery]);

    // Tính toán hướng mở (Flip-up) và max-height cho Desktop Dropdown
    const calculateDirection = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 220 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
        const maxH = Math.min(280, Math.max(160, spaceAbove - 16));
        setDropdownMaxHeight(maxH);
      } else {
        setOpenUpward(false);
        const maxH = Math.min(280, Math.max(160, spaceBelow - 16));
        setDropdownMaxHeight(maxH);
      }
    };

    const handleOpenDropdown = () => {
      if (disabled) return;
      setDesktopSearchQuery("");
      calculateDirection();
      setIsDropdownOpen(true);
      const currentIndex = options.findIndex(
        (opt) => String(opt.value) === String(selectedValue)
      );
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);

      // Tự động cuộn tới item đang chọn trong dropdown
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({ block: "nearest" });
      }, 50);
    };

    const handleCloseDropdown = () => {
      setIsDropdownOpen(false);
      setFocusedIndex(-1);
    };

    // Kích hoạt onBlur an toàn cho react-hook-form (tránh lỗi null.name khi blurEvent.target là null)
    const triggerBlur = useCallback(() => {
      if (hiddenSelectRef.current) {
        // Dispatch native blur event lên thẻ select ẩn
        const blurEvent = new Event("blur", { bubbles: true });
        hiddenSelectRef.current.dispatchEvent(blurEvent);

        // Gọi callback onBlur của react-hook-form với SyntheticEvent có target đầy đủ
        if (onBlur) {
          const syntheticBlurEvent = {
            target: hiddenSelectRef.current,
            currentTarget: hiddenSelectRef.current,
          } as unknown as React.FocusEvent<HTMLSelectElement>;
          onBlur(syntheticBlurEvent);
        }
      }
    }, [onBlur]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          handleCloseDropdown();
          triggerBlur();
        }
      };

      if (isDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, [isDropdownOpen, triggerBlur]);

    // Xử lý khi chọn một Option (dùng chung cho cả Dropdown và Bottom Sheet)
    const handleSelectOption = (option: SelectOption) => {
      if (option.disabled || disabled) return;

      setSelectedValue(option.value);
      handleCloseDropdown();
      setIsSheetOpen(false);
      triggerRef.current?.focus();

      // Cập nhật giá trị vào hidden native select & dispatch change event cho react-hook-form
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = String(option.value);
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

    // Xử lý khi click vào Trigger Button
    const handleTriggerClick = () => {
      if (disabled) return;

      if (presentation === "sheet") {
        setIsSheetOpen(true);
      } else {
        if (isDropdownOpen) {
          handleCloseDropdown();
        } else {
          handleOpenDropdown();
        }
      }
    };

    // Xử lý bàn phím trên Desktop Trigger
    const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (presentation === "sheet") {
        if (
          e.key === "Enter" ||
          e.key === " " ||
          e.key === "ArrowDown" ||
          e.key === "ArrowUp"
        ) {
          e.preventDefault();
          setIsSheetOpen(true);
        }
        return;
      }

      // Xử lý bàn phím cho Desktop Dropdown
      if (!isDropdownOpen) {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();
          handleOpenDropdown();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredDesktopOptions.length - 1 ? prev + 1 : 0
          );
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredDesktopOptions.length - 1
          );
          break;
        }
        case "Home": {
          e.preventDefault();
          setFocusedIndex(0);
          break;
        }
        case "End": {
          e.preventDefault();
          setFocusedIndex(filteredDesktopOptions.length - 1);
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredDesktopOptions.length) {
            handleSelectOption(filteredDesktopOptions[focusedIndex]);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          handleCloseDropdown();
          triggerBlur();
          triggerRef.current?.focus();
          break;
        }
        case "Tab": {
          handleCloseDropdown();
          triggerBlur();
          break;
        }
        default: {
          // Typeahead search
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            if (typeaheadTimerRef.current) {
              clearTimeout(typeaheadTimerRef.current);
            }
            typeaheadQueryRef.current += e.key.toLowerCase();
            typeaheadTimerRef.current = setTimeout(() => {
              typeaheadQueryRef.current = "";
            }, 500);

            const matchIndex = filteredDesktopOptions.findIndex((opt) =>
              opt.label.toLowerCase().startsWith(typeaheadQueryRef.current)
            );
            if (matchIndex >= 0) {
              setFocusedIndex(matchIndex);
            }
          }
          break;
        }
      }
    };

    return (
      <div
        className={cn("w-full flex flex-col", wrapperClassName)}
        ref={containerRef}
      >
        {/* Label hoạt hình đồng bộ hệ thống */}
        {label && (
          <label htmlFor={id} className={FIELD_LABEL}>
            {label}
          </label>
        )}

        {/* Khung ô chọn (Custom Trigger) */}
        <div className="relative w-full">
          <button
            ref={triggerRef}
            type="button"
            id={id}
            disabled={disabled}
            onClick={handleTriggerClick}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              "relative w-full flex items-center justify-between transition-all select-none text-left cursor-pointer",
              FIELD_VARIANTS[variant],
              sizeConfig.container,
              isDropdownOpen || isSheetOpen
                ? "border-2 border-[#D97706] ring-4 ring-amber-500/30"
                : error
                ? FIELD_ERROR_BORDER
                : cn(FIELD_BASE_BORDER, FIELD_FOCUS_RING),
              disabled && FIELD_DISABLED,
              containerClassName
            )}
          >
            <div className="flex items-center min-w-0 mr-2">
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

              {/* Nhãn hiển thị của Option đang chọn hoặc Placeholder */}
              <span
                className={cn(
                  "truncate",
                  FIELD_VALUE_TEXT,
                  sizeConfig.text,
                  selectedOption
                    ? "text-[#3B1902]"
                    : "text-[#A68A70] font-heading font-semibold",
                  className
                )}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>

            {/* Mũi tên xổ xuống cố định 20px, màu #8C6D53 */}
            <div
              className={cn(
                "flex-shrink-0 flex items-center justify-center text-[#8C6D53] transition-transform duration-200",
                (isDropdownOpen || isSheetOpen) && "rotate-180 text-[#D97706]"
              )}
            >
              <ChevronDown className="w-5 h-5" />
            </div>
          </button>

          {/* ========================================================================= */}
          {/* MENU DROPDOWN TÙY BIẾN 3D CHO DESKTOP */}
          {/* ========================================================================= */}
          {isDropdownOpen && presentation === "dropdown" && (
            <div
              ref={listboxRef}
              tabIndex={-1}
              style={{ maxHeight: `${dropdownMaxHeight}px` }}
              className={cn(
                "absolute left-0 right-0 z-50 bg-[#FFFDF7] border-2 border-[#B08A52] rounded-2xl shadow-[0_12px_28px_rgba(40,15,0,0.22),0_2px_6px_rgba(0,0,0,0.06)] p-1.5 overflow-y-auto scrollbar-thin animate-in fade-in duration-150",
                openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
              )}
            >
              {/* Ô tìm kiếm nhanh trên Desktop Dropdown nếu searchable được bật */}
              {searchable && options.length > 5 && (
                <div className="p-1 border-b border-[#E3D2B3]/60 mb-1 sticky top-0 bg-[#FFFDF7] z-10">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-[#8C6D53] absolute left-2 pointer-events-none" />
                    <input
                      type="text"
                      value={desktopSearchQuery}
                      onChange={(e) => setDesktopSearchQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full h-8 pl-7 pr-6 bg-white border border-[#E3D2B3] focus:border-[#D97706] rounded-lg font-heading font-bold text-xs text-[#4A2307] placeholder:text-[#A68A70] outline-none"
                    />
                    {desktopSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDesktopSearchQuery("")}
                        className="absolute right-1.5 p-0.5 text-stone-400 hover:text-stone-600 rounded-full cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {filteredDesktopOptions.length === 0 ? (
                <div className="py-4 text-center text-xs font-heading font-bold text-[#7A4E26]">
                  Không tìm thấy kết quả nào
                </div>
              ) : (
                filteredDesktopOptions.map((option, index) => {
                  const isSelected =
                    String(option.value) === String(selectedValue);
                  const isFocused = index === focusedIndex;

                  return (
                    <button
                      type="button"
                      key={String(option.value)}
                      ref={isSelected ? selectedItemRef : null}
                      disabled={option.disabled}
                      onClick={() => handleSelectOption(option)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl font-heading font-black transition-all cursor-pointer mb-1 last:mb-0 text-left min-h-11 px-3 py-2 text-base",
                        option.disabled
                          ? "opacity-40 cursor-not-allowed text-stone-400"
                          : isSelected
                          ? "bg-[#FEF3C7] text-[#78350F] border border-[#F4C56A] shadow-xs"
                          : isFocused
                          ? "bg-[#FDF2D6] text-[#78350F]"
                          : "text-[#4A2307] hover:bg-[#FDF2D6] hover:text-[#78350F]"
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {/* Huy hiệu tích tròn xanh lá 20px đồng bộ với Sheet */}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#16A34A] border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center text-white flex-shrink-0 ml-2">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SHEET TỰ VẼ TRÊN MOBILE / THIẾT BỊ CẢM ỨNG (RENDER QUA PORTAL) */}
        {/* ========================================================================= */}
        {presentation === "sheet" && isSheetOpen && (
          <SelectSheet
            isOpen={isSheetOpen}
            onClose={() => {
              setIsSheetOpen(false);
              triggerBlur();
              triggerRef.current?.focus();
            }}
            title={sheetTitle || label || placeholder}
            icon={icon}
            tone={sheetTone}
            options={options}
            selectedValue={selectedValue}
            onSelect={handleSelectOption}
            optionLayout={optionLayout}
            gridCols={gridCols}
            searchable={searchable}
            searchPlaceholder={searchPlaceholder}
          />
        )}

        {/* ========================================================================= */}
        {/* DUY NHẤT 1 NATIVE HIDDEN SELECT PHỤC VỤ 100% CHO REACT-HOOK-FORM & SUBMIT */}
        {/* ========================================================================= */}
        <select
          ref={hiddenSelectRef}
          id={id ? `${id}-hidden` : undefined}
          name={name}
          value={String(selectedValue)}
          onChange={() => {}}
          tabIndex={-1}
          className="sr-only"
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Thông báo lỗi validation kèm icon cảnh báo */}
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

Select.displayName = "Select";
