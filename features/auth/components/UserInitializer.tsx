"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useConfigStore } from "@/stores/useConfigStore";

/**
 * UserInitializer
 * Component Client chạy ngầm khi tải hoặc F5 trang:
 * 1. Đọc ngay tức khắc thông tin học sinh & cấu hình hệ thống từ localStorage để hiển thị tức thì (0ms latency)
 * 2. Gọi API GET /api/auth/me & GET /api/system/config ngầm để revalidate và ghi đè dữ liệu mới nhất từ Database
 */
export function UserInitializer() {
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);
  const fetchConfigs = useConfigStore((state) => state.fetchConfigs);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // 1. Khôi phục nhanh User Profile & System Configs từ LocalStorage
      useUserStore.persist.rehydrate();
      useConfigStore.persist.rehydrate();

      // 2. Đồng bộ ngầm dữ liệu mới nhất từ Supabase
      fetchCurrentUser();
      fetchConfigs();
    }
  }, [fetchCurrentUser, fetchConfigs]);

  return null;
}
