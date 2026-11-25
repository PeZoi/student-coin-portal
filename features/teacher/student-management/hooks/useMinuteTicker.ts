"use client";

import { useSyncExternalStore } from "react";

/**
 * Minute Ticker Store:
 * Cung cấp snapshot số phút hiện tại (epoch minutes), tự động cập nhật mỗi phút
 * - getServerSnapshot trả về 0 cố định để an toàn tuyệt đối với Next.js Prerender
 * - getSnapshot trả về cùng 1 số nguyên trong suốt 60 giây, đảm bảo cache snapshot bất biến (tránh infinite loop)
 * - Không gọi setState đồng bộ trong effect (tuân thủ Rule 8)
 */
let currentMinute = typeof window !== "undefined" ? Math.floor(Date.now() / 60000) : 0;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  setInterval(() => {
    const nextMinute = Math.floor(Date.now() / 60000);
    if (nextMinute !== currentMinute) {
      currentMinute = nextMinute;
      listeners.forEach((callback) => callback());
    }
  }, 15000);
}

function subscribeMinuteTicker(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getMinuteSnapshot(): number {
  return currentMinute;
}

function getServerMinuteSnapshot(): number {
  return 0;
}

export function useMinuteTicker(): number {
  return useSyncExternalStore(
    subscribeMinuteTicker,
    getMinuteSnapshot,
    getServerMinuteSnapshot
  );
}
