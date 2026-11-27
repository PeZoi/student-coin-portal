"use client";

import { Wrench } from "lucide-react";
import { useSystemSettingsContext } from "../contexts/SystemSettingsContext";
import { SettingsSectionRow } from "./SettingsSectionRow";
import { SettingsToggleRow } from "./SettingsToggleRow";

/**
 * Panel Chế độ bảo trì cổng học sinh (đọc trực tiếp từ Context)
 */
export function MaintenanceSettingsCard() {
  const { formState, updateSection } = useSystemSettingsContext();
  const value = formState.maintenance;
  const onChange = (next: typeof value) => updateSection("maintenance", next);

  return (
    <section
      className={`bg-white rounded-2xl border shadow-2xs overflow-hidden transition-colors ${
        value.isMaintenanceMode ? "border-amber-300" : "border-[#E2E8F0]"
      }`}
    >
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              value.isMaintenanceMode
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Chế độ bảo trì cổng học sinh
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Tạm đóng trang học sinh khi cần tổng kết xu cuối tháng hoặc nâng cấp hệ thống.
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto shrink-0 ${
            value.isMaintenanceMode
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              value.isMaintenanceMode
                ? "bg-amber-500 animate-pulse"
                : "bg-[#22C55E]"
            }`}
          />
          <span>
            {value.isMaintenanceMode
              ? "Đang tạm đóng bảo trì"
              : "Đang hoạt động bình thường"}
          </span>
        </span>
      </div>

      <div className="px-6 py-4 divide-y divide-slate-100">
        <SettingsSectionRow
          title="Trạng thái cổng học sinh"
          description="Cổng giáo viên và trang quản trị vẫn hoạt động bình thường khi bật chế độ này."
        >
          <SettingsToggleRow
            label="Tạm đóng cổng học sinh để bảo trì"
            description="Khi bật, học sinh truy cập sẽ thấy màn hình thông báo tạm nghỉ và không thể nộp bài, quay thưởng hay đổi quà."
            checked={value.isMaintenanceMode}
            onChange={(checked) =>
              onChange({ ...value, isMaintenanceMode: checked })
            }
          />
        </SettingsSectionRow>

        <SettingsSectionRow
          title="Thông báo hiển thị cho học sinh"
          description="Lời nhắn thân thiện sẽ xuất hiện trên màn hình khi học sinh mở ứng dụng trong thời gian bảo trì."
        >
          <textarea
            id="maintenance-message"
            rows={3}
            disabled={!value.isMaintenanceMode}
            value={value.maintenanceMessage}
            onChange={(e) =>
              onChange({ ...value, maintenanceMessage: e.target.value })
            }
            placeholder="Nhập lời nhắn hiển thị khi học sinh vào trang trong lúc bảo trì..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all resize-none disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </SettingsSectionRow>
      </div>
    </section>
  );
}
