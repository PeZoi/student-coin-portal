"use client";

import { useSyncExternalStore } from "react";

/**
 * Hook lắng nghe Media Query chuẩn React và Next.js (SSR-safe).
 * Sử dụng `useSyncExternalStore` để tránh lỗi hydration mismatch.
 * Trên Server: trả về `undefined` để component có thể xử lý trạng thái chờ mount.
 */
export function useMediaQuery(query: string): boolean | undefined {
  const subscribe = (onStoreChange: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.addEventListener("change", onStoreChange);
    return () => {
      mediaQueryList.removeEventListener("change", onStoreChange);
    };
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    return undefined;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook xác định xem có đủ điều kiện hiển thị giao diện Sách mở đôi Desktop hay không:
 * - Chiều rộng tối thiểu 1024px (lg)
 * - Chiều cao tối thiểu 560px (đủ không gian dọc để không bị nén vỡ sách)
 */
export function useIsBookDesktop(): boolean | undefined {
  return useMediaQuery("(min-width: 1024px) and (min-height: 560px)");
}

/**
 * Hook xác định màn hình điện thoại xoay ngang (chiều cao < 500px)
 */
export function useIsLandscapeMobile(): boolean | undefined {
  return useMediaQuery("(max-height: 500px) and (orientation: landscape)");
}

