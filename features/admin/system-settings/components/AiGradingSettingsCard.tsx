"use client";

import { Bot, CheckSquare, SlidersHorizontal, Sparkles } from "lucide-react";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { SettingsToggleRow } from "./SettingsToggleRow";

export interface AiGradingSettingsFormState {
  isAiGradingEnabled: boolean;
  gradingModel: string;
  gradingStrictness: string;
  approvalMode: string;
  maxRewardScoreThreshold: number;
  feedbackStyleGuide: string;
}

interface AiGradingSettingsCardProps {
  value: AiGradingSettingsFormState;
  onChange: (next: AiGradingSettingsFormState) => void;
}

const AI_MODEL_OPTIONS: TeacherSelectOption[] = [
  {
    label: "Tốc độ nhanh & Cân bằng (Khuyên dùng hàng ngày)",
    value: "balanced_fast",
  },
  {
    label: "Phân tích kỹ chuyên sâu (Dành cho bài văn, phiếu dài)",
    value: "deep_accurate",
  },
];

const AI_STRICTNESS_OPTIONS: TeacherSelectOption[] = [
  {
    label: "Khuyến khích (Nhẹ nhàng, ưu tiên động viên học sinh nhỏ)",
    value: "lenient",
  },
  {
    label: "Tiêu chuẩn (Cân bằng giữa độ chính xác và sự khích lệ)",
    value: "balanced",
  },
  {
    label: "Chặt chẽ (Kiểm tra kỹ từng đáp án và cách trình bày)",
    value: "strict",
  },
];

const AI_APPROVAL_MODE_OPTIONS: TeacherSelectOption[] = [
  {
    label: "Giáo viên kiểm tra và bấm duyệt thủ công (An toàn)",
    value: "manual",
  },
  {
    label: "Tự động duyệt khi bài đạt từ 95% trở lên",
    value: "auto_95",
  },
];

/**
 * Thẻ 5: Hỗ trợ chấm bài tự động bằng AI
 * - Ngôn ngữ thân thiện, gần gũi với giáo viên tiểu học/THCS
 */
export function AiGradingSettingsCard({
  value,
  onChange,
}: AiGradingSettingsCardProps) {
  const isDisabled = !value.isAiGradingEnabled;

  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5 lg:col-span-2">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] border border-blue-100 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Hỗ trợ chấm bài tự động bằng AI
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Cấu hình cách trợ lý AI đọc ảnh chụp bài làm, gợi ý số xu thưởng và viết lời nhận xét cho học sinh.
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto shrink-0 ${
            value.isAiGradingEnabled
              ? "bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              value.isAiGradingEnabled ? "bg-[#22C55E]" : "bg-slate-400"
            }`}
          />
          <span>
            {value.isAiGradingEnabled ? "Đang bật hỗ trợ AI" : "Đang tạm tắt"}
          </span>
        </span>
      </div>

      {/* Bật / tắt AI chấm bài */}
      <SettingsToggleRow
        label="Bật tính năng AI hỗ trợ chấm trước bài nộp"
        description="Khi học sinh nộp ảnh bài tập, trợ lý AI sẽ tự động đọc bài, đối chiếu đáp án và gợi ý mức xu để cô giáo duyệt nhanh hơn."
        checked={value.isAiGradingEnabled}
        onChange={(checked) =>
          onChange({ ...value, isAiGradingEnabled: checked })
        }
      />

      {/* Lưới cấu hình chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TeacherSelect
          label="Chế độ xử lý bài làm"
          icon={<Sparkles className="w-4 h-4 text-[#0A62D6]" />}
          size="sm"
          options={AI_MODEL_OPTIONS}
          value={value.gradingModel}
          disabled={isDisabled}
          onChange={(val) => onChange({ ...value, gradingModel: val })}
        />

        <TeacherSelect
          label="Mức độ chấm điểm"
          icon={<SlidersHorizontal className="w-4 h-4 text-amber-600" />}
          size="sm"
          options={AI_STRICTNESS_OPTIONS}
          value={value.gradingStrictness}
          disabled={isDisabled}
          onChange={(val) => onChange({ ...value, gradingStrictness: val })}
        />

        <TeacherSelect
          label="Quy trình duyệt bài"
          icon={<CheckSquare className="w-4 h-4 text-emerald-600" />}
          size="sm"
          options={AI_APPROVAL_MODE_OPTIONS}
          value={value.approvalMode}
          disabled={isDisabled}
          onChange={(val) => onChange({ ...value, approvalMode: val })}
        />

        <div>
          <label
            htmlFor="ai-max-score-threshold"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Ngưỡng điểm gợi ý xu tối đa
          </label>
          <div className="relative">
            <input
              id="ai-max-score-threshold"
              type="number"
              min={5}
              max={10}
              step={0.5}
              disabled={isDisabled}
              value={value.maxRewardScoreThreshold}
              onChange={(e) =>
                onChange({
                  ...value,
                  maxRewardScoreThreshold: Math.min(
                    10,
                    Math.max(1, Number(e.target.value) || 8)
                  ),
                })
              }
              className="w-full h-9.5 pl-3.5 pr-14 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
              điểm
            </span>
          </div>
        </div>
      </div>

      {/* Hướng dẫn giọng văn nhận xét chung */}
      <div>
        <label
          htmlFor="ai-feedback-guide"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Hướng dẫn giọng văn nhận xét chung của trợ lý AI
        </label>
        <textarea
          id="ai-feedback-guide"
          rows={3}
          disabled={isDisabled}
          value={value.feedbackStyleGuide}
          onChange={(e) =>
            onChange({ ...value, feedbackStyleGuide: e.target.value })
          }
          placeholder="Ví dụ: Nhận xét bằng giọng văn ấm áp, xưng cô - con, luôn khen ngợi điểm làm tốt trước khi góp ý nhẹ nhàng phần cần sửa..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all resize-none disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Áp dụng mặc định cho tất cả bài tập nếu giáo viên không nhập hướng dẫn riêng khi giao bài.
        </p>
      </div>
    </section>
  );
}
