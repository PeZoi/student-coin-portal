"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectOptionItem, SelectOptionTile } from "./SelectOptionTile";
import { SELECT_SHEET_TONES, SelectSheetTone } from "./selectTheme";

export interface SelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  tone?: SelectSheetTone;
  options: SelectOptionItem[];
  selectedValue: string | number;
  onSelect: (option: SelectOptionItem) => void;
  optionLayout?: "auto" | "list" | "grid";
  gridCols?: 2 | 3 | 4;
  /** Cho phép tìm kiếm */
  searchable?: boolean;
  /** Placeholder cho ô tìm kiếm */
  searchPlaceholder?: string;
}

const emptySubscribe = () => () => {};

export function SelectSheet({
  isOpen,
  onClose,
  title,
  icon,
  tone = "orange",
  options,
  selectedValue,
  onSelect,
  optionLayout = "auto",
  gridCols = 3,
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
}: SelectSheetProps) {
  // SSR-safe mount check bằng useSyncExternalStore (chuẩn React 19)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [pendingValue, setPendingValue] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedTileRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const startTimeRef = useRef(0);

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  // Tính toán layout dạng Grid hay List
  const computedLayout: "grid" | "list" = (() => {
    if (optionLayout === "grid") return "grid";
    if (optionLayout === "list") return "list";
    // Mặc định "auto": Nếu <= 12 mục và nhãn ngắn (<= 10 ký tự) thì dùng Grid
    const allLabelsShort = filteredOptions.every((opt) => opt.label.length <= 10);
    return filteredOptions.length <= 12 && allLabelsShort ? "grid" : "list";
  })();

  // Số cột của Grid (nếu có nhãn hơi dài trên mobile thì tự co về 2 cột)
  const computedCols = (() => {
    if (computedLayout === "list") return 1;
    const hasMediumLabel = filteredOptions.some((opt) => opt.label.length > 7);
    if (hasMediumLabel && gridCols > 2) {
      return 2;
    }
    return gridCols;
  })();

  // Xử lý chọn mục với hiệu ứng phản hồi ~120ms trước khi đóng
  const handleSelect = useCallback(
    (option: SelectOptionItem) => {
      if (option.disabled) return;
      setPendingValue(option.value);

      // Kiểm tra prefers-reduced-motion
      const isReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (isReduced) {
        onSelect(option);
        onClose();
      } else {
        setTimeout(() => {
          onSelect(option);
          onClose();
        }, 120);
      }
    },
    [onSelect, onClose]
  );

  // Khóa cuộn trang nền khi sheet mở và reset search khi đóng
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Focus vào sheet
    const timer = setTimeout(() => {
      sheetRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  // Cuộn mục đang chọn vào giữa vùng nhìn khi mở
  useEffect(() => {
    if (isOpen) {
      const scrollTimer = setTimeout(() => {
        selectedTileRef.current?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }, 100);

      return () => clearTimeout(scrollTimer);
    }
  }, [isOpen]);

  // Focus trap và điều hướng phím
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Xử lý Focus trap qua phím Tab
      if (e.key === "Tab" && sheetRef.current) {
        const focusableElements = sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        return;
      }

      // Không can thiệp phím điều hướng nếu đang focus trong input tìm kiếm (trừ ArrowDown hoặc Enter)
      if (document.activeElement === searchInputRef.current) {
        if (e.key === "ArrowDown" && filteredOptions.length > 0) {
          e.preventDefault();
          setFocusedIndex(0);
          searchInputRef.current?.blur();
        } else if (e.key === "Enter" && filteredOptions.length > 0) {
          e.preventDefault();
          handleSelect(filteredOptions[0]);
        }
        return;
      }

      // Điều hướng phím mũi tên giữa các option
      const total = filteredOptions.length;
      if (total === 0) return;

      const cols = computedLayout === "grid" ? computedCols : 1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + cols < total ? prev + cols : prev % cols));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - cols >= 0 ? prev - cols : prev));
      } else if (e.key === "ArrowRight" && computedLayout === "grid") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1 < total ? prev + 1 : 0));
      } else if (e.key === "ArrowLeft" && computedLayout === "grid") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : total - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusedIndex(total - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < total) {
          handleSelect(filteredOptions[focusedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredOptions, focusedIndex, computedLayout, computedCols, onClose, handleSelect]);

  // =========================================================================
  // XỬ LÝ VUỐT XUỐNG ĐỂ ĐÓNG (POINTER EVENTS SWIPE-DOWN TO DISMISS)
  // =========================================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Chỉ vuốt khi chạm vào header hoặc handle (không vuốt khi bấm nút đóng)
    if ((e.target as HTMLElement).closest("button")) return;

    startYRef.current = e.clientY;
    currentYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    currentYRef.current = e.clientY;
    const deltaY = e.clientY - startYRef.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    } else {
      setDragY(0);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentYRef.current - startYRef.current;
    const elapsed = Date.now() - startTimeRef.current;
    const velocity = deltaY / Math.max(1, elapsed);

    // Kéo quá 90px hoặc vận tốc vuốt đủ nhanh
    if (deltaY > 90 || (velocity > 0.45 && deltaY > 30)) {
      onClose();
    }
    setDragY(0);
  };

  if (!isMounted || !isOpen) return null;

  const toneConfig = SELECT_SHEET_TONES[tone] || SELECT_SHEET_TONES.orange;
  const effectiveSelected = pendingValue !== null ? pendingValue : selectedValue;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center select-none">
      {/* Backdrop mờ nền - Bấm vào đóng */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200 motion-reduce:animate-none"
      />

      {/* Bottom Sheet Container */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={cn(
          "relative z-10 w-full max-w-[480px] max-h-[min(82dvh,600px)] rounded-t-[28px] sm:rounded-t-[32px] bg-[#FFF8E6] shadow-[0_-12px_40px_rgba(0,18,50,0.38)] flex flex-col overflow-hidden outline-none animate-in slide-in-from-bottom duration-250 motion-reduce:animate-none"
        )}
      >
        {/* ========================================================================= */}
        {/* HEADER VỚI ĐÁY CONG HOẠT HÌNH 3D (THE ARCHED HEADER) */}
        {/* ========================================================================= */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={cn("w-full pt-2 flex-shrink-0 cursor-grab active:cursor-grabbing", toneConfig.gradient)}
        >
          {/* Thanh kéo Pill 44x5px ở trên cùng */}
          <div className="w-11 h-1.5 rounded-full bg-white/60 mx-auto mb-2 shadow-xs" />

          {/* Hàng Header: Icon, Tiêu đề, Nút đóng đỏ 3D */}
          <div className="px-4 pb-3 flex items-center justify-between gap-2.5">
            {/* Khối Icon Emoji vuông bo tròn 40px (nếu có) */}
            {icon ? (
              <div className="w-10 h-10 rounded-2xl bg-white/95 border-2 border-white/60 shadow-[0_2px_6px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl flex-shrink-0">
                {icon}
              </div>
            ) : (
              <div className="w-1.5" />
            )}

            {/* Tiêu đề Header */}
            <h3 className="font-heading font-black text-base sm:text-lg text-white drop-shadow-[0_1.5px_0_rgba(0,0,0,0.3)] flex-1 truncate text-center px-1">
              {title}
            </h3>

            {/* Nút đóng tròn đỏ 3D (vùng bấm 40x40px chuẩn) */}
            <button
              type="button"
              onClick={onClose}
              title="Đóng"
              className="w-10 h-10 rounded-full bg-gradient-to-b from-[#EF4444] to-[#B91C1C] border-2 border-[#7F1D1D] shadow-[0_3px_6px_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center text-white active:scale-95 cursor-pointer flex-shrink-0 transition-transform"
            >
              <X className="w-5 h-5 drop-shadow-sm stroke-[2.5]" />
            </button>
          </div>

          {/* Đáy cong SVG mượt mà fill màu #FFF8E6 đồng bộ với thân */}
          <div className="relative -bottom-px left-0 right-0 h-4.5 w-full pointer-events-none overflow-hidden -mt-px">
            <svg
              viewBox="0 0 500 45"
              preserveAspectRatio="none"
              className="w-full h-full fill-[#FFF8E6]"
            >
              <path d="M0,45 Q250,-5 500,45 L500,50 L0,50 Z" />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THANH TÌM KIẾM CỐ ĐỊNH PHÍA TRÊN DANH SÁCH (STICKY SEARCH BAR) */}
        {/* ========================================================================= */}
        {searchable && (
          <div className="px-3.5 sm:px-4 pt-1.5 pb-2 flex-shrink-0 bg-[#FFF8E6]">
            <div className="relative flex items-center">
              <div className="absolute left-3 text-stone-400 flex items-center justify-center pointer-events-none">
                <Search className="w-4 h-4 text-[#8C6D53]" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-10 pl-9 pr-8 bg-white border-2 border-[#E3D2B3] focus:border-[#D97706] focus:ring-2 focus:ring-amber-500/20 rounded-xl font-heading font-bold text-sm text-[#4A2307] placeholder:text-[#A68A70] placeholder:font-heading placeholder:font-semibold outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  title="Xóa từ khóa"
                  className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VÙNG THÂN NỘI DUNG CUỘN RIÊNG BIỆT (CONTAINED SCROLLABLE BODY) */}
        {/* ========================================================================= */}
        <div
          ref={scrollContainerRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto overscroll-contain px-3.5 sm:px-4 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))] scrollbar-thin"
        >
          {filteredOptions.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center select-none">
              <span className="text-3xl mb-1.5">🔍</span>
              <p className="font-heading font-extrabold text-sm text-[#7A4E26]">
                Không tìm thấy kết quả nào phù hợp
              </p>
              <p className="text-xs text-[#9C7550] mt-0.5">
                Bé thử kiểm tra lại từ khóa nhé!
              </p>
            </div>
          ) : computedLayout === "grid" ? (
            <div
              className={cn(
                "grid gap-2.5 sm:gap-3 py-1",
                computedCols === 2 ? "grid-cols-2" : "grid-cols-3"
              )}
            >
              {filteredOptions.map((option, idx) => {
                const isSelected = String(option.value) === String(effectiveSelected);
                return (
                  <SelectOptionTile
                    key={String(option.value)}
                    ref={isSelected ? selectedTileRef : null}
                    id={`sheet-opt-${idx}`}
                    option={option}
                    isSelected={isSelected}
                    layout="grid"
                    onSelect={handleSelect}
                    className={idx === focusedIndex ? "ring-2 ring-[#D97706]" : ""}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-1">
              {filteredOptions.map((option, idx) => {
                const isSelected = String(option.value) === String(effectiveSelected);
                return (
                  <SelectOptionTile
                    key={String(option.value)}
                    ref={isSelected ? selectedTileRef : null}
                    id={`sheet-opt-${idx}`}
                    option={option}
                    isSelected={isSelected}
                    layout="list"
                    onSelect={handleSelect}
                    className={idx === focusedIndex ? "ring-2 ring-[#D97706]" : ""}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
