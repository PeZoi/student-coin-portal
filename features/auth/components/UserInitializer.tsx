"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { isPublicPage } from "@/lib/auth/routes";

/**
 * UserInitializer
 * Component Client quản lý khởi tạo phiên đăng nhập và cấu hình hệ thống:
 * - Khi ở các trang công khai (như /login - chưa đăng nhập): KHÔNG gọi bất kỳ API /me hay /config nào.
 * - Khi ở các trang nội bộ (đã đăng nhập, ví dụ /student):
 *   1. Rehydrate tức thì dữ liệu User & Config từ LocalStorage (0ms latency, không giật UI)
 *   2. Gọi ngầm API GET /api/auth/me & GET /api/system/config để revalidate và ghi đè dữ liệu mới nhất từ Database
 */
export function UserInitializer() {
  const pathname = usePathname();
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);
  const fetchConfigs = useConfigStore((state) => state.fetchConfigs);
  const hasFetchedForAuth = useRef(false);

  useEffect(() => {
    // 1. Khi đang ở trang công khai (chưa đăng nhập, ví dụ: /login) -> Tuyệt đối KHÔNG gọi API
    if (isPublicPage(pathname)) {
      hasFetchedForAuth.current = false;
      return;
    }

    // 2. Khi đang ở các trang nội bộ (đã đăng nhập): Chỉ đồng bộ 1 lần cho phiên truy cập này
    if (!hasFetchedForAuth.current) {
      hasFetchedForAuth.current = true;

      // 2.1 Khôi phục nhanh User Profile & System Configs từ LocalStorage (0ms)
      useUserStore.persist.rehydrate();
      useConfigStore.persist.rehydrate();

      // 2.2 Đồng bộ ngầm dữ liệu mới nhất từ Database
      fetchCurrentUser();
      fetchConfigs();
    }
  }, [pathname, fetchCurrentUser, fetchConfigs]);

  return null;
}
