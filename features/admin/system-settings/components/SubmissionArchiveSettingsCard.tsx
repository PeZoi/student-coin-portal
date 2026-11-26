"use client";

import { Archive } from "lucide-react";
import { SettingsToggleRow } from "./SettingsToggleRow";

export interface SubmissionArchiveSettingsFormState {
  lateSubmissionGraceDays: number;
  maxUploadFileSizeMb: number;
  autoPurgeOldMedia: boolean;
  mediaRetentionDays: number;
}

interface SubmissionArchiveSettingsCardProps {
  value: SubmissionArchiveSettingsFormState;
  onChange: (next: SubmissionArchiveSettingsFormState) => void;
}

/**
 * Thẻ 4: Quy định nộp bài & Lưu trữ tự động
 */
export function SubmissionArchiveSettingsCard({
  value,
  onChange,
}: SubmissionArchiveSettingsCardProps) {
  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Header Card */}
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
          <Archive className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">
            Quy định nộp bài &amp; Lưu trữ
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Thiết lập thời hạn cho phép nộp bù bài tập và tự động dọn dẹp ảnh chụp cũ để tối ưu dung lượng.
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="late-grace-days"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Thời gian cho phép nộp bù sau hạn
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
          <p className="text-[11px] text-slate-400 mt-1">
            Sau thời gian này, bài tập tự chuyển vào mục Lưu trữ và đóng nhận bài.
          </p>
        </div>

        <div>
          <label
            htmlFor="max-upload-size"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Dung lượng ảnh bài làm tối đa
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
                  maxUploadFileSizeMb: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className="w-full h-10 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
              MB
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Giới hạn kích thước cho mỗi ảnh chụp minh chứng học sinh tải lên.
          </p>
        </div>
      </div>

      {/* Tự động dọn dẹp ảnh cũ */}
      <div className="space-y-3">
        <SettingsToggleRow
          label="Tự động dọn dẹp ảnh chụp bài làm cũ"
          description="Chỉ xóa tệp ảnh bài làm đã chấm xong quá hạn lưu trữ; toàn bộ điểm số, nhận xét và xu thưởng vẫn giữ nguyên."
          checked={value.autoPurgeOldMedia}
          onChange={(checked) =>
            onChange({ ...value, autoPurgeOldMedia: checked })
          }
        />

        {value.autoPurgeOldMedia && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <label
              htmlFor="media-retention-days"
              className="text-xs font-semibold text-slate-700"
            >
              Thời gian lưu giữ ảnh chụp sau khi đã duyệt bài:
            </label>
            <div className="relative w-28 shrink-0">
              <input
                id="media-retention-days"
                type="number"
                min={7}
                max={365}
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
                className="w-full h-9 pl-3 pr-12 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400 pointer-events-none">
                ngày
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
