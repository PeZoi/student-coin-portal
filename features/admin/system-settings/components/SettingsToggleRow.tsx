"use client";

import { cn } from "@/lib/utils";

interface SettingsToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  disabled?: boolean;
}

/**
 * Dòng cấu hình dạng nút gạt (Toggle Switch) dùng chung cho trang Cài đặt hệ thống
 */
export function SettingsToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingsToggleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 transition-colors",
        !disabled && "hover:bg-slate-50 hover:border-slate-300/80",
        disabled && "opacity-60"
      )}
    >
      <div className="min-w-0">
        <p className="text-xs sm:text-[13px] font-semibold text-[#0F172A] leading-snug">
          {label}
        </p>
        {description && (
          <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0A62D6]/25",
          checked ? "bg-[#0A62D6]" : "bg-slate-300",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
