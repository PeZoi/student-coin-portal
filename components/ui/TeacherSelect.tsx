"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TeacherSelectOption {
  label: string;
  value: string;
  badge?: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TeacherSelectProps {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  options: TeacherSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "xs" | "sm" | "md";
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  containerClassName?: string;
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  openUpward: boolean;
}

const ESTIMATED_MAX_HEIGHT = 240;

/**
 * Component Select chuyên dụng cho Cổng Quản Trị & Giáo Viên (Teacher Portal)
 * - Thiết kế tối giản, sắc nét, đồng bộ chuẩn Design System (#0A62D6, #E2E8F0, #0F172A)
 * - Render qua Portal (document.body) với fixed z-index cao: KHÔNG BAO GIỜ bị che khuất bởi Modal hay thẻ cha overflow:hidden
 * - Tự động tính toán hướng mở (Auto-flip lên/xuống) chống tràn màn hình
 * - Hỗ trợ tìm kiếm nhanh, badge đính kèm số lượng và icon đại diện
 */
export function TeacherSelect({
  label,
  required = false,
  icon,
  options,
  value,
  onChange,
  placeholder = "Chọn một mục...",
  size = "md",
  disabled = false,
  error,
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
  className,
  containerClassName,
}: TeacherSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuPos, setMenuPos] = useState<MenuPosition>({
    left: 0,
    width: 0,
    openUpward: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tìm option hiện tại đang được chọn
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Lọc options khi bật tìm kiếm
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.badge !== undefined && String(opt.badge).toLowerCase().includes(q))
    );
  }, [options, searchable, searchQuery]);

  // Tính toán vị trí và hướng mở (Upward / Downward)
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward =
      spaceBelow < ESTIMATED_MAX_HEIGHT && spaceAbove > spaceBelow;

    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const minWidth = size === "xs" ? 108 : 0;
    const width = Math.min(Math.max(rect.width, minWidth), screenWidth - 16);
    const maxLeft = Math.max(8, screenWidth - width - 8);
    const safeLeft = Math.min(Math.max(8, rect.left), maxLeft);

    setMenuPos({
      top: openUpward ? undefined : rect.bottom + 6,
      bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
      left: safeLeft,
      width: width,
      openUpward,
    });
  }, [size]);

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updateMenuPosition();
      setSearchQuery("");
      setIsOpen(true);
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectOption = (opt: TeacherSelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
    setSearchQuery("");
    triggerRef.current?.focus();
  };

  // Đóng khi click ra ngoài, cuộn trang ngoài hoặc bấm Escape
  useEffect(() => {
    if (!isOpen) return;

    // Cập nhật lại tọa độ chuẩn xác khi menu vừa render
    updateMenuPosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleScrollOrResize = (e: Event) => {
      // Không đóng nếu thao tác cuộn xảy ra bên trong chính danh sách menu options
      if (
        e.type === "scroll" &&
        menuRef.current &&
        menuRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updateMenuPosition]);

  const heightClass =
    size === "xs"
      ? "h-8 px-2 text-xs font-semibold"
      : size === "sm"
      ? "h-10 px-3.5 text-xs sm:text-sm font-semibold"
      : "h-11 px-3.5 text-sm font-semibold";

  const roundedClass = size === "xs" ? "rounded-lg" : "rounded-xl";

  return (
    <div ref={containerRef} className={cn("relative w-full", containerClassName)}>
      {label && (
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5 select-none">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggleOpen}
        className={cn(
          "w-full bg-white border text-left transition-all flex items-center justify-between cursor-pointer select-none",
          heightClass,
          roundedClass,
          size === "xs" ? "gap-1.5" : "gap-2.5",
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            : isOpen
            ? "border-[#0A62D6] ring-2 ring-[#0A62D6]/20"
            : "border-slate-300 hover:border-slate-400 focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20",
          disabled && "bg-slate-100 text-slate-400 cursor-not-allowed opacity-75",
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {icon && (
            <span className="shrink-0 flex items-center justify-center text-slate-500">
              {icon}
            </span>
          )}

          {selectedOption ? (
            <span className="font-semibold text-[#0F172A] truncate">
              {selectedOption.label}
            </span>
          ) : (
            <span className="font-medium text-slate-400 truncate">
              {placeholder}
            </span>
          )}

          {selectedOption?.badge !== undefined && (
            <span className="ml-auto mr-1 hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            size === "xs" ? "w-3.5 h-3.5" : "w-4 h-4",
            "text-slate-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[#0A62D6]"
          )}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Popover Dropdown Menu Render qua Portal (document.body) */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuPos.top !== undefined ? `${menuPos.top}px` : undefined,
              bottom:
                menuPos.bottom !== undefined ? `${menuPos.bottom}px` : undefined,
              left: `${menuPos.left}px`,
              width: `${menuPos.width}px`,
            }}
            className={cn(
              "fixed z-[9999] bg-white border border-[#E2E8F0] shadow-2xl animate-in fade-in zoom-in-95 duration-150",
              size === "xs" ? "rounded-lg p-1" : "rounded-xl p-1.5",
              menuPos.openUpward ? "origin-bottom" : "origin-top"
            )}
          >
            {/* Ô tìm kiếm nhanh nếu có searchable */}
            {searchable && (
              <div className="p-1 mb-1 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full h-8 pl-8 pr-7 rounded-lg bg-slate-50 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0A62D6]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="w-4 h-4 rounded-full flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Danh sách Options */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="py-3 px-2 text-center text-xs text-slate-400">
                  Không tìm thấy kết quả phù hợp
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelectOption(opt)}
                      className={cn(
                        "w-full text-left font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer select-none",
                        size === "xs"
                          ? "px-2 py-1.5 rounded-md text-xs"
                          : "px-3 py-2 rounded-lg text-xs sm:text-sm",
                        isSelected
                          ? "bg-[#EAF2FF] text-[#0A62D6] font-semibold"
                          : "text-[#0F172A] hover:bg-slate-50",
                        opt.disabled &&
                          "opacity-40 cursor-not-allowed hover:bg-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {opt.icon && (
                          <span className="shrink-0 text-slate-500">
                            {opt.icon}
                          </span>
                        )}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {opt.badge !== undefined && (
                          <span
                            className={cn(
                              "text-[11px] font-semibold px-2 py-0.5 rounded-md border",
                              isSelected
                                ? "bg-white text-[#0A62D6] border-[#CFE1FB]"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            )}
                          >
                            {opt.badge}
                          </span>
                        )}

                        {isSelected && (
                          <Check
                            className={cn(
                              size === "xs" ? "w-3.5 h-3.5" : "w-4 h-4",
                              "text-[#0A62D6] shrink-0 stroke-[2.5]"
                            )}
                          />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
