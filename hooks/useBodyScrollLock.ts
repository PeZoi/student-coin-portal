"use client";

import { useEffect } from "react";

/**
 * Biến đếm số lượng Modal / Drawer / Sheet đang mở trên toàn hệ thống (Reference Counting).
 * Đảm bảo khi mở Modal lồng Modal (ví dụ: mở Modal sửa -> mở tiếp Modal xác nhận xóa),
 * việc đóng Modal con sẽ KHÔNG làm mở khóa cuộn của Modal cha trước khi Modal cha đóng hoàn toàn.
 */
let activeLocksCount = 0;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";
let originalBodyPaddingRight = "";

/**
 * Hook khóa cuộn trang nền (Body Scroll Lock) dùng chung toàn hệ thống
 *
 * Tính năng chuẩn mực UX:
 * 1. Chống "Scroll Chaining": Ngăn chặn hoàn toàn việc cuộn trang web nền khi Modal đang mở.
 * 2. Chống "Layout Shift" (Scrollbar Jump): Tự động tính toán bề rộng thanh cuộn (scrollbar width)
 *    và bù padding-right cho body để giao diện trang không bị giật/nhảy sang phải khi thanh cuộn ẩn đi.
 * 3. Hỗ trợ Stacked Modals (Modal lồng Modal): Dùng cơ chế Reference Counting chuẩn xác.
 * 4. Tương thích SSR & Mobile/Safari (khóa cả document.body và document.documentElement).
 *
 * @param isLocked Trạng thái cần khóa cuộn (mặc định: true)
 */
export function useBodyScrollLock(isLocked: boolean = true): void {
  useEffect(() => {
    if (!isLocked) return;

    if (activeLocksCount === 0) {
      // 1. Lưu lại trạng thái style gốc
      originalBodyOverflow = document.body.style.overflow;
      originalHtmlOverflow = document.documentElement.style.overflow;
      originalBodyPaddingRight = document.body.style.paddingRight;

      // 2. Tính bề rộng scrollbar để bù padding-right (tránh layout shift khi scrollbar biến mất)
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // 3. Khóa cuộn trang
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }

    activeLocksCount += 1;

    return () => {
      activeLocksCount = Math.max(0, activeLocksCount - 1);

      // Chỉ khôi phục style khi TẤT CẢ các modal đã đóng hoàn toàn
      if (activeLocksCount === 0) {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;

        originalBodyOverflow = "";
        originalHtmlOverflow = "";
        originalBodyPaddingRight = "";
      }
    };
  }, [isLocked]);
}
