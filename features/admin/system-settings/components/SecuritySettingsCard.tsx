"use client";

import { ShieldCheck } from "lucide-react";
import { SettingsToggleRow } from "./SettingsToggleRow";

export interface SecuritySettingsFormState {
  maxFailedAttempts: number;
  lockoutMinutes: number;
  autoResetOnSuccess: boolean;
  allowTeacherPinReset: boolean;
}

interface SecuritySettingsCardProps {
  value: SecuritySettingsFormState;
  onChange: (next: SecuritySettingsFormState) => void;
}

/**
 * Thẻ 1: Bảo mật đăng nhập học sinh
 */
export function SecuritySettingsCard({
  value,
  onChange,
}: SecuritySettingsCardProps) {
  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs flex flex-col justify-between gap-5">
      <div className="space-y-5">
        {/* Header Card */}
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
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

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="max-failed-attempts"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Số lần nhập sai mã PIN tối đa
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
                    maxFailedAttempts: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-full h-10 pl-3.5 pr-14 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                lần
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tài khoản sẽ tạm khóa nếu nhập sai liên tiếp vượt mức này.
            </p>
          </div>

          <div>
            <label
              htmlFor="lockout-minutes"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Thời gian tạm khóa tài khoản
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
            <p className="text-[11px] text-slate-400 mt-1">
              Học sinh có thể thử đăng nhập lại sau khi hết thời gian chờ.
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5">
          <SettingsToggleRow
            label="Tự động xóa số lần nhập sai sau khi đăng nhập đúng"
            description="Đặt bộ đếm lỗi về 0 ngay khi học sinh đăng nhập thành công."
            checked={value.autoResetOnSuccess}
            onChange={(checked) =>
              onChange({ ...value, autoResetOnSuccess: checked })
            }
          />

          <SettingsToggleRow
            label="Cho phép giáo viên chủ nhiệm cấp lại mã PIN"
            description="Giáo viên có thể mở khóa và đặt lại mã PIN cho học sinh thuộc lớp phụ trách."
            checked={value.allowTeacherPinReset}
            onChange={(checked) =>
              onChange({ ...value, allowTeacherPinReset: checked })
            }
          />
        </div>
      </div>
    </section>
  );
}
