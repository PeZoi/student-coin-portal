"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/stores/useUserStore";

/**
 * UserInitializer
 * Component Client chạy ngầm khi tải hoặc F5 trang:
 * 1. Đọc ngay tức khắc thông tin học sinh từ localStorage để hiển thị tức thì (0ms latency)
 * 2. Gọi API GET /api/auth/me ngầm để revalidate và ghi đè dữ liệu mới nhất từ Database
 */
export function UserInitializer() {
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // 1. Khôi phục nhanh từ LocalStorage ngay khi client mount
      useUserStore.persist.rehydrate();
      // 2. Đồng bộ ngầm dữ liệu mới nhất từ Supabase
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  return null;
}
