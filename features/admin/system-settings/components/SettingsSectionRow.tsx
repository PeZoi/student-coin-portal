"use client";

import { ReactNode } from "react";

interface SettingsSectionRowProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

/**
 * Hàng cấu hình chuẩn SaaS (Trái: Tiêu đề & mô tả ngắn | Phải: Các ô nhập liệu / điều khiển)
 * - Giúp toàn bộ các mục cài đặt đồng nhất 100% về phân cấp thị giác và độ thoáng
 */
export function SettingsSectionRow({
  title,
  description,
  children,
  action,
}: SettingsSectionRowProps) {
  return (
    <div className="py-5 first:pt-1 last:pb-1 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
      <div className="md:col-span-5 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
          {action}
        </div>
        {description && (
          <p className="text-xs text-[#64748B] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="md:col-span-7 space-y-3.5">{children}</div>
    </div>
  );
}
