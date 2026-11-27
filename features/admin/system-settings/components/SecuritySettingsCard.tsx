"use client";

import { ShieldCheck } from "lucide-react";
import { useSystemSettingsContext } from "../contexts/SystemSettingsContext";
import { SettingsSectionRow } from "./SettingsSectionRow";
import { SettingsToggleRow } from "./SettingsToggleRow";

/**
 * Panel Bảo mật đăng nhập học sinh (đọc trực tiếp từ Context)
 */
export function SecuritySettingsCard() {
  const { formState, updateSection } = useSystemSettingsContext();
  const value = formState.security;
  const onChange = (next: typeof value) => updateSection("security", next);

  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Bảo mật đăng nhập học sinh
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Giới hạn số lần nhập sai mã PIN để bảo vệ tài khoản và số dư Heo Đất của các em.
          </p>
        </div>
      </div>

      <div className="px-6 py-4 divide-y divide-slate-100">
        <SettingsSectionRow
          title="Giới hạn nhập sai mã PIN"
          description="Tạm khóa tài khoản trong một khoảng thời gian ngắn nếu phát hiện nhập sai liên tiếp nhiều lần."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="max-failed-attempts"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Số lần nhập sai tối đa
              </label>
              <div className="relative">
                <input
                  id="max-failed-attempts"
                  type="number"
                  min={1}
                  max={20}
                  value={value.maxFailedAttempts}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      maxFailedAttempts: Math.max(
                        1,
                        Number(e.target.value) || 1
                      ),
                    })
                  }
                  className="w-full h-10 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  lần
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="lockout-minutes"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Thời gian tạm khóa
              </label>
              <div className="relative">
                <input
                  id="lockout-minutes"
                  type="number"
                  min={1}
                  max={1440}
                  value={value.lockoutMinutes}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      lockoutMinutes: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                  className="w-full h-10 pl-3.5 pr-14 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  phút
                </span>
              </div>
            </div>
          </div>
        </SettingsSectionRow>

        <SettingsSectionRow
          title="Đặt lại bộ đếm khi đăng nhập đúng"
          description="Cấu hình tự động xóa số lần nhập sai mã PIN khi học sinh đăng nhập thành công."
        >
          <SettingsToggleRow
            label="Tự động xóa số lần nhập sai sau khi đăng nhập đúng"
            description="Đặt bộ đếm lỗi về 0 ngay khi học sinh đăng nhập thành công."
            checked={value.autoResetOnSuccess}
            onChange={(checked) =>
              onChange({ ...value, autoResetOnSuccess: checked })
            }
          />
        </SettingsSectionRow>
      </div>
    </section>
  );
}
