"use client";

import { Archive } from "lucide-react";
import { useSystemSettingsContext } from "../contexts/SystemSettingsContext";
import { SettingsSectionRow } from "./SettingsSectionRow";
import { SettingsToggleRow } from "./SettingsToggleRow";

/**
 * Panel Quy định nộp bài & Lưu trữ tự động (đọc trực tiếp từ Context)
 */
export function SubmissionArchiveSettingsCard() {
  const { formState, updateSection } = useSystemSettingsContext();
  const value = formState.submissionArchive;
  const onChange = (next: typeof value) =>
    updateSection("submissionArchive", next);

  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
          <Archive className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Quy định nộp bài &amp; Lưu trữ
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Thiết lập thời hạn cho phép nộp bù bài tập và lịch tự động dọn dẹp dữ liệu cũ.
          </p>
        </div>
      </div>

      <div className="px-6 py-4 divide-y divide-slate-100">
        <SettingsSectionRow
          title="Quy định nộp bài tập"
          description="Sau thời gian cho phép nộp bù, bài tập sẽ tự chuyển vào mục Lưu trữ và đóng nhận bài."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="late-grace-days"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Thời gian nộp bù sau hạn
              </label>
              <div className="relative">
                <input
                  id="late-grace-days"
                  type="number"
                  min={0}
                  max={30}
                  value={value.lateSubmissionGraceDays}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      lateSubmissionGraceDays: Math.max(
                        0,
                        Number(e.target.value) || 0
                      ),
                    })
                  }
                  className="w-full h-10 pl-3.5 pr-14 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  ngày
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="max-upload-size"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Dung lượng ảnh tối đa
              </label>
              <div className="relative">
                <input
                  id="max-upload-size"
                  type="number"
                  min={1}
                  max={25}
                  value={value.maxUploadFileSizeMb}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      maxUploadFileSizeMb: Math.max(
                        1,
                        Number(e.target.value) || 1
                      ),
                    })
                  }
                  className="w-full h-10 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  MB
                </span>
              </div>
            </div>
          </div>
        </SettingsSectionRow>

        <SettingsSectionRow
          title="Tự động dọn dẹp dữ liệu cũ"
          description="Chỉ xóa tệp ảnh bài làm đã chấm và nhật ký quá hạn; điểm số, nhận xét và số dư xu luôn được giữ nguyên."
        >
          <SettingsToggleRow
            label="Bật lịch tự động dọn dẹp dữ liệu"
            description="Giúp tối ưu dung lượng lưu trữ và giữ hệ thống vận hành mượt mà."
            checked={value.autoPurgeOldMedia}
            onChange={(checked) =>
              onChange({ ...value, autoPurgeOldMedia: checked })
            }
          />

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 transition-opacity ${
              !value.autoPurgeOldMedia ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div>
              <label
                htmlFor="media-retention-days"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Lưu ảnh bài làm đã duyệt
              </label>
              <div className="relative">
                <input
                  id="media-retention-days"
                  type="number"
                  min={7}
                  max={365}
                  disabled={!value.autoPurgeOldMedia}
                  value={value.mediaRetentionDays}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      mediaRetentionDays: Math.max(
                        7,
                        Number(e.target.value) || 7
                      ),
                    })
                  }
                  className="w-full h-9.5 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  ngày
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="read-notifications-days"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Lưu thông báo đã đọc
              </label>
              <div className="relative">
                <input
                  id="read-notifications-days"
                  type="number"
                  min={7}
                  max={365}
                  disabled={!value.autoPurgeOldMedia}
                  value={value.readNotificationsDays}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      readNotificationsDays: Math.max(
                        7,
                        Number(e.target.value) || 7
                      ),
                    })
                  }
                  className="w-full h-9.5 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  ngày
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-logs-days"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Lưu nhật ký đăng nhập
              </label>
              <div className="relative">
                <input
                  id="auth-logs-days"
                  type="number"
                  min={7}
                  max={730}
                  disabled={!value.autoPurgeOldMedia}
                  value={value.authLogsDays}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      authLogsDays: Math.max(7, Number(e.target.value) || 7),
                    })
                  }
                  className="w-full h-9.5 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  ngày
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="audit-logs-days"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Lưu nhật ký hoạt động hệ thống
              </label>
              <div className="relative">
                <input
                  id="audit-logs-days"
                  type="number"
                  min={30}
                  max={1095}
                  disabled={!value.autoPurgeOldMedia}
                  value={value.auditLogsDays}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      auditLogsDays: Math.max(30, Number(e.target.value) || 30),
                    })
                  }
                  className="w-full h-9.5 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  ngày
                </span>
              </div>
            </div>
          </div>
        </SettingsSectionRow>
      </div>
    </section>
  );
}
