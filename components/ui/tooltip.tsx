"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type TooltipSide = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "start" | "center" | "end";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  delayDuration?: number;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  showArrow?: boolean;
}

interface Coords {
  x: number;
  y: number;
  actualSide: TooltipSide;
}

/**
 * Component Tooltip UI hiện đại, mượt mà và trực quan
 * - Tự động định vị thông minh, tránh tràn màn hình (flip / boundary detection)
 * - Sử dụng React Portal để tránh triệt để vấn đề bị cắt xén (overflow: hidden/auto)
 * - Hiệu ứng chuyển động mượt mà (fade in, scale nhẹ)
 * - Không sử dụng bất kỳ thuộc tính aria nào theo quy chuẩn dự án
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  sideOffset = 8,
  delayDuration = 150,
  disabled = false,
  className = "",
  showArrow = true,
  wrapperClassName = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, []);

  const calculatePosition = useCallback((): Coords | null => {
    if (!triggerRef.current) return null;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let targetSide = side;

    // Tự động lật hướng nếu chạm mép màn hình
    if (targetSide === "top" && rect.top - 40 < 0) {
      targetSide = "bottom";
    } else if (targetSide === "bottom" && rect.bottom + 40 > viewportHeight) {
      targetSide = "top";
    } else if (targetSide === "left" && rect.left - 60 < 0) {
      targetSide = "right";
    } else if (targetSide === "right" && rect.right + 60 > viewportWidth) {
      targetSide = "left";
    }

    let x = 0;
    let y = 0;

    if (targetSide === "top") {
      y = rect.top - sideOffset;
      if (align === "start") {
        x = rect.left;
      } else if (align === "end") {
        x = rect.right;
      } else {
        x = rect.left + rect.width / 2;
      }
    } else if (targetSide === "bottom") {
      y = rect.bottom + sideOffset;
      if (align === "start") {
        x = rect.left;
      } else if (align === "end") {
        x = rect.right;
      } else {
        x = rect.left + rect.width / 2;
      }
    } else if (targetSide === "left") {
      x = rect.left - sideOffset;
      if (align === "start") {
        y = rect.top;
      } else if (align === "end") {
        y = rect.bottom;
      } else {
        y = rect.top + rect.height / 2;
      }
    } else if (targetSide === "right") {
      x = rect.right + sideOffset;
      if (align === "start") {
        y = rect.top;
      } else if (align === "end") {
        y = rect.bottom;
      } else {
        y = rect.top + rect.height / 2;
      }
    }

    // Giữ tọa độ không tràn ra ngoài màn hình
    x = Math.max(12, Math.min(x, viewportWidth - 12));
    y = Math.max(12, Math.min(y, viewportHeight - 12));

    return { x, y, actualSide: targetSide };
  }, [side, align, sideOffset]);

  const handleOpen = useCallback(() => {
    if (disabled || !content) return;

    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    showTimeoutRef.current = setTimeout(() => {
      const position = calculatePosition();
      if (position) {
        setCoords(position);
        setIsRendered(true);
        // Hiệu ứng mượt kích hoạt ở frame tiếp theo
        requestAnimationFrame(() => {
          if (isMountedRef.current) {
            setIsVisible(true);
          }
        });
      }
    }, delayDuration);
  }, [disabled, content, delayDuration, calculatePosition]);

  const handleClose = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    setIsVisible(false);
    setIsRendered(false);
    setCoords(null);
  }, []);

  // Lắng nghe sự kiện scroll và resize để ẩn hoặc cập nhật vị trí tooltip
  useEffect(() => {
    if (!isRendered) return;

    const handleScrollOrResize = () => {
      handleClose();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isRendered, handleClose]);

  if (!content || disabled) {
    return <>{children}</>;
  }

  // Bọc phần tử trigger bằng thẻ span để hỗ trợ cả các nút bị disabled
  const triggerElement = (
    <span
      ref={triggerRef}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
      className={`inline-flex items-center ${wrapperClassName}`}
    >
      {children}
    </span>
  );

  // Tính transform dựa trên actualSide và align
  const getTransformClass = (actualSide: TooltipSide) => {
    if (actualSide === "top") {
      if (align === "start") return "-translate-y-full";
      if (align === "end") return "-translate-x-full -translate-y-full";
      return "-translate-x-1/2 -translate-y-full";
    }
    if (actualSide === "bottom") {
      if (align === "start") return "";
      if (align === "end") return "-translate-x-full";
      return "-translate-x-1/2";
    }
    if (actualSide === "left") {
      if (align === "start") return "-translate-x-full";
      if (align === "end") return "-translate-x-full -translate-y-full";
      return "-translate-x-full -translate-y-1/2";
    }
    // right
    if (align === "start") return "";
    if (align === "end") return "-translate-y-full";
    return "-translate-y-1/2";
  };

  const portalContent =
    isRendered && coords && typeof document !== "undefined"
      ? createPortal(
          <div
            style={{
              top: `${coords.y}px`,
              left: `${coords.x}px`,
            }}
            className={`fixed z-[9999] pointer-events-none transition-all duration-150 ease-out ${getTransformClass(
              coords.actualSide
            )} ${
              isVisible
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <div
              className={`relative px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 backdrop-blur-xs rounded-xl shadow-xl border border-slate-700/60 leading-tight whitespace-nowrap max-w-xs ${className}`}
            >
              {content}

              {/* Mũi tên chỉ vào trigger */}
              {showArrow && (
                <div
                  className={`absolute w-0 h-0 border-solid ${
                    coords.actualSide === "top"
                      ? "top-full left-1/2 -translate-x-1/2 border-t-4 border-t-slate-900 border-x-4 border-x-transparent border-b-0"
                      : coords.actualSide === "bottom"
                      ? "bottom-full left-1/2 -translate-x-1/2 border-b-4 border-b-slate-900 border-x-4 border-x-transparent border-t-0"
                      : coords.actualSide === "left"
                      ? "left-full top-1/2 -translate-y-1/2 border-l-4 border-l-slate-900 border-y-4 border-y-transparent border-r-0"
                      : "right-full top-1/2 -translate-y-1/2 border-r-4 border-r-slate-900 border-y-4 border-y-transparent border-l-0"
                  }`}
                />
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {triggerElement}
      {portalContent}
    </>
  );
}
