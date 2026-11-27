"use client";

import { useState } from "react";
import {
  Bot,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  PlugZap,
  SlidersHorizontal,
} from "lucide-react";
import { TeacherSelect } from "@/components/ui/TeacherSelect";
import { THINKING_MODE_OPTIONS } from "../constants";
import { useSystemSettingsContext } from "../contexts/SystemSettingsContext";
import { SettingsSectionRow } from "./SettingsSectionRow";

/**
 * Panel Cấu hình trợ lý chấm bài AI (đọc trực tiếp từ Context)
 */
export function AiGradingSettingsCard() {
  const {
    formState,
    hasStoredAiApiKey,
    isTestingAi,
    updateSection,
    handleTestAiConnection,
  } = useSystemSettingsContext();
  const [showApiKey, setShowApiKey] = useState(false);

  const value = formState.aiGrading;
  const onChange = (next: typeof value) => updateSection("aiGrading", next);

  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0A62D6] border border-blue-100 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Cấu hình trợ lý chấm bài AI
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Thiết lập kết nối dịch vụ AI, quy tắc chấm nháp và giọng văn nhận xét mặc định hỗ trợ giáo viên.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isTestingAi}
          onClick={handleTestAiConnection}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#EAF2FF] hover:bg-blue-100 text-[#0A62D6] border border-blue-200/80 text-xs font-bold transition-colors cursor-pointer active:scale-98 self-start sm:self-auto shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isTestingAi ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <PlugZap className="w-3.5 h-3.5" />
          )}
          <span>{isTestingAi ? "Đang kiểm tra..." : "Kiểm tra kết nối"}</span>
        </button>
      </div>

      <div className="px-6 py-4 divide-y divide-slate-100">
        <SettingsSectionRow
          title="Kết nối dịch vụ AI"
          description="Thông tin kết nối tới máy chủ xử lý ảnh bài tập. Khóa bí mật luôn được bảo mật nội bộ."
        >
          <div>
            <label
              htmlFor="ai-base-url"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Đường dẫn máy chủ AI
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ai-base-url"
                type="url"
                value={value.baseUrl}
                onChange={(e) =>
                  onChange({ ...value, baseUrl: e.target.value })
                }
                placeholder="https://api.openai.com/v1"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="ai-api-key"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Khóa kết nối bí mật
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="ai-api-key"
                  type={showApiKey ? "text" : "password"}
                  value={value.apiKey}
                  onChange={(e) =>
                    onChange({ ...value, apiKey: e.target.value })
                  }
                  placeholder={
                    hasStoredAiApiKey
                      ? "Đã lưu khóa — để trống nếu giữ nguyên"
                      : "Nhập khóa kết nối..."
                  }
                  autoComplete="off"
                  className="w-full h-10 pl-9 pr-10 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((prev) => !prev)}
                  aria-label={
                    showApiKey ? "Ẩn khóa kết nối" : "Hiện khóa kết nối"
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="ai-model-name"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Tên mô hình AI
              </label>
              <input
                id="ai-model-name"
                type="text"
                value={value.modelName}
                onChange={(e) =>
                  onChange({ ...value, modelName: e.target.value })
                }
                placeholder="Ví dụ: gemini-2.5-flash"
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
              />
            </div>
          </div>
        </SettingsSectionRow>

        <SettingsSectionRow
          title="Tốc độ & Quy tắc chấm điểm"
          description="Cân chỉnh độ sâu phân tích, giới hạn thời gian chờ và mức trừ điểm nháp cho từng loại lỗi."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <TeacherSelect
              label="Độ sâu phân tích bài làm"
              icon={<SlidersHorizontal className="w-4 h-4 text-[#0A62D6]" />}
              size="sm"
              options={THINKING_MODE_OPTIONS}
              value={value.thinkingMode}
              onChange={(val) =>
                onChange({
                  ...value,
                  thinkingMode:
                    val === "off" || val === "high" ? val : "low",
                })
              }
            />

            <div>
              <label
                htmlFor="ai-timeout-seconds"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Thời gian chờ phản hồi tối đa
              </label>
              <div className="relative">
                <input
                  id="ai-timeout-seconds"
                  type="number"
                  min={15}
                  max={180}
                  step={5}
                  value={value.timeoutSeconds}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      timeoutSeconds: Math.max(15, Number(e.target.value) || 60),
                    })
                  }
                  className="w-full h-9.5 pl-3.5 pr-12 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  giây
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="ai-major-penalty"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Mức trừ lỗi nghiêm trọng
              </label>
              <div className="relative">
                <input
                  id="ai-major-penalty"
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  value={value.majorErrorPenalty}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      majorErrorPenalty: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full h-9.5 pl-3.5 pr-14 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  điểm
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="ai-minor-penalty"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Mức trừ lỗi nhẹ
              </label>
              <div className="relative">
                <input
                  id="ai-minor-penalty"
                  type="number"
                  min={0}
                  max={5}
                  step={0.25}
                  value={value.minorErrorPenalty}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      minorErrorPenalty: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full h-9.5 pl-3.5 pr-14 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                  điểm
                </span>
              </div>
            </div>
          </div>
        </SettingsSectionRow>

        <SettingsSectionRow
          title="Giọng văn nhận xét chung"
          description="Áp dụng mặc định cho tất cả bài tập nếu giáo viên không nhập hướng dẫn riêng khi giao bài."
        >
          <textarea
            id="ai-feedback-guide"
            rows={3}
            value={value.feedbackStyleGuide}
            onChange={(e) =>
              onChange({ ...value, feedbackStyleGuide: e.target.value })
            }
            placeholder="Ví dụ: Nhận xét bằng giọng văn ấm áp, xưng cô - con, luôn khen ngợi điểm làm tốt trước khi góp ý nhẹ nhàng phần cần sửa..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/15 transition-all resize-none"
          />
        </SettingsSectionRow>
      </div>
    </section>
  );
}
