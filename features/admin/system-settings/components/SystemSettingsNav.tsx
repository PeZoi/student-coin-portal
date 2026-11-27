"use client";

import { Archive, Bot, Coins, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystemSettingsContext } from "../contexts/SystemSettingsContext";
import { SystemSettingsTabId } from "../types";

interface SettingsNavItem {
  id: SystemSettingsTabId;
  label: string;
  shortDesc: string;
  icon: typeof Coins;
}

const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    id: "exchange",
    label: "Quy đổi & Đổi quà",
    shortDesc: "Tỷ giá xu, hạn mức & lịch mở",
    icon: Coins,
  },
  {
    id: "ai",
    label: "Trợ lý chấm bài AI",
    shortDesc: "Kết nối, mô hình & quy tắc chấm",
    icon: Bot,
  },
  {
    id: "security",
    label: "Bảo mật đăng nhập",
    shortDesc: "Mã PIN & khóa tài khoản",
    icon: ShieldCheck,
  },
  {
    id: "archive",
    label: "Nộp bài & Lưu trữ",
    shortDesc: "Nộp bù & dọn dẹp dữ liệu cũ",
    icon: Archive,
  },
  {
    id: "maintenance",
    label: "Bảo trì hệ thống",
    shortDesc: "Tạm đóng cổng học sinh",
    icon: Wrench,
  },
];

/**
 * Thanh điều hướng danh mục cài đặt (đọc trực tiếp state từ SystemSettingsContext)
 */
export function SystemSettingsNav() {
  const { activeTab, setActiveTab, formState } = useSystemSettingsContext();
  const { isMaintenanceMode } = formState.maintenance;
  const {
    isExchangeWindowEnabled,
    exchangeOpenDay,
    exchangeCloseDay,
    stepCoins,
    vndPerStep,
  } = formState.exchange;

  return (
    <aside className="lg:sticky lg:top-6 space-y-4">
      <nav
        aria-label="Danh mục cài đặt hệ thống"
        className="bg-white rounded-2xl border border-[#E2E8F0] p-2 shadow-2xs flex lg:flex-col gap-1 overflow-x-auto [scrollbar-width:none]"
      >
        {SETTINGS_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showMaintenanceDot =
            item.id === "maintenance" && isMaintenanceMode;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer shrink-0 lg:w-full",
                isActive
                  ? "bg-[#EAF2FF] text-[#0A62D6] shadow-2xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isActive
                    ? "bg-white text-[#0A62D6] shadow-2xs"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-xs sm:text-[13px] truncate",
                      isActive ? "font-bold text-[#0A62D6]" : "font-semibold"
                    )}
                  >
                    {item.label}
                  </span>
                  {showMaintenanceDot && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  )}
                </div>
                <p
                  className={cn(
                    "hidden lg:block text-[11px] truncate mt-0.5",
                    isActive ? "text-[#0A62D6]/80" : "text-slate-400"
                  )}
                >
                  {item.shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Thẻ tóm tắt trạng thái nhanh (Desktop) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Trạng thái hiện hành
        </p>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Cổng học sinh</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-bold",
                isMaintenanceMode ? "text-amber-700" : "text-emerald-700"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isMaintenanceMode ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
              <span>{isMaintenanceMode ? "Đang bảo trì" : "Đang mở"}</span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Lịch đổi quà</span>
            <span className="font-bold text-[#0F172A] tabular-nums">
              {isExchangeWindowEnabled
                ? `Ngày ${exchangeOpenDay} – ${exchangeCloseDay}`
                : "Mở quanh tháng"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Tỷ giá Heo Đất</span>
            <span className="font-bold text-amber-700 tabular-nums">
              {stepCoins.toLocaleString("vi-VN")} xu ={" "}
              {vndPerStep.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
