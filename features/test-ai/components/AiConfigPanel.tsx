"use client";

import {
  ChevronDown,
  Cpu,
  Eye,
  EyeOff,
  KeyRound,
  Link as LinkIcon,
  RefreshCw,
  RotateCcw,
  Settings,
  Sparkles,
  Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiConfig } from "../types";

interface AiConfigPanelProps {
  config: AiConfig;
  onUpdateConfig: (updates: Partial<AiConfig>) => void;
}

export function AiConfigPanel({ config, onUpdateConfig }: AiConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [serverModels, setServerModels] = useState<string[]>([]);

  const handleFetchModels = async () => {
    if (!config.apiKey || config.apiKey.trim() === "") {
      toast.error("Vui lòng nhập API Key để lấy danh sách model");
      return;
    }
    setIsLoadingModels(true);
    try {
      const url = `/api/test-ai/grade?apiUrl=${encodeURIComponent(
        config.apiUrl
      )}&apiKey=${encodeURIComponent(config.apiKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && Array.isArray(data.models) && data.models.length > 0) {
        setServerModels(data.models);
        toast.success(`Đã tải thành công ${data.models.length} model từ server!`);
      } else {
        toast.error(
          data.error || "Không thể tải danh sách model. Hãy kiểm tra lại API Key hoặc Endpoint."
        );
      }
    } catch (err: any) {
      toast.error("Lỗi khi kết nối lấy model: " + err.message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleReset = () => {
    onUpdateConfig({
      apiUrl: "https://api.example.com/v1/homework/grade",
      apiKey: "sk-test-ai-key-demo-2026",
      model: "gemini-1.5-flash",
      sendFormat: "formData",
      useMockFallback: true,
    });
    toast.info("Đã đặt lại cấu hình AI mặc định");
  };

  return (
    <div className="w-full rounded-2xl border-2 border-amber-300/40 bg-[#073373]/90 backdrop-blur-md shadow-lg overflow-hidden select-none">
      {/* Header Panel - Cho phép thu gọn / mở rộng */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full cursor-pointer px-4 py-3 bg-gradient-to-r from-[#0C489C] to-[#0A3D85] flex items-center justify-between text-left border-b border-sky-300/20"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
            <Settings className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h4 className="font-heading font-black text-white text-xs sm:text-sm flex items-center gap-1.5">
              <span>Cấu hình AI API & Khóa bí mật</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-300/30">
                Dành cho Tester / Dev
              </span>
            </h4>
            <p className="text-[11px] text-sky-200/70 font-heading">
              Có thể thay đổi trực tiếp URL và API Key để test kết nối
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-sky-200 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-300" : ""
          }`}
        />
      </button>

      {/* Nội dung cấu hình */}
      {isOpen && (
        <div className="p-3.5 sm:p-4 flex flex-col gap-3 font-heading text-xs">
          {/* 1. Toggle Chế độ Mock AI tiện lợi */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-white font-black block text-xs">
                  Chế độ Mock AI (Giả lập chấm điểm)
                </span>
                <span className="text-sky-200/80 text-[11px] block">
                  Bật khi chưa có server thật để test giao diện và luồng nén ảnh
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
              <input
                type="checkbox"
                checked={config.useMockFallback}
                onChange={(e) =>
                  onUpdateConfig({ useMockFallback: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 2. Đường link API AI Endpoint */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sky-200 font-bold flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-sky-300" />
                <span>Đường link API AI (Endpoint URL):</span>
              </label>
              {/* Nút chọn nhanh URL chuẩn */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({
                      apiUrl: "https://oxionai.com/v1",
                      model: "gemini-3.7-flash",
                    });
                    toast.success("Đã chọn cấu hình Oxion AI (Gemini 3.7 Flash)");
                  }}
                  className="cursor-pointer text-[10px] bg-purple-500/25 hover:bg-purple-500/40 border border-purple-300/50 text-purple-200 px-2 py-0.5 rounded-lg font-bold"
                >
                  Oxion AI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({
                      apiUrl: "https://api.openai.com/v1/chat/completions",
                      model: "gpt-4o",
                    });
                    toast.success("Đã chọn cấu hình OpenAI (GPT-4o Vision)");
                  }}
                  className="cursor-pointer text-[10px] bg-sky-500/20 hover:bg-sky-500/35 border border-sky-300/40 text-sky-200 px-2 py-0.5 rounded-lg font-bold"
                >
                  OpenAI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({
                      apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                      model: "gemini-1.5-flash",
                    });
                    toast.success("Đã chọn cấu hình Google Gemini (Flash Vision)");
                  }}
                  className="cursor-pointer text-[10px] bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-300/40 text-emerald-200 px-2 py-0.5 rounded-lg font-bold"
                >
                  Gemini
                </button>
              </div>
            </div>
            <input
              type="text"
              value={config.apiUrl}
              onChange={(e) => onUpdateConfig({ apiUrl: e.target.value })}
              placeholder="https://oxionai.com/v1"
              className="w-full bg-[#042555] text-white placeholder:text-slate-400 px-3 py-2 rounded-xl border border-sky-400/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs font-mono"
            />
            <p className="text-[10px] text-sky-200/70 italic">
              *Hệ thống đã tự động tích hợp trọn vẹn cho <strong>Oxion AI (https://oxionai.com/v1)</strong> với model <code>gemini-3.7-flash</code>. Server Proxy sẽ tự động định dạng ảnh Vision gửi sang để AI đọc bài và chấm điểm.
            </p>
          </div>

          {/* 3. API Key */}
          <div className="flex flex-col gap-1">
            <label className="text-sky-200 font-bold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>API Key:</span>
            </label>
            <div className="relative w-full">
              <input
                type={showApiKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => onUpdateConfig({ apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-[#042555] text-white placeholder:text-slate-400 pl-3 pr-10 py-2 rounded-xl border border-sky-400/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sky-300 hover:text-white cursor-pointer p-1"
                title={showApiKey ? "Ẩn khóa" : "Hiện khóa"}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* 4. Model AI & Định dạng gửi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sky-200 font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Model AI:</span>
                </label>
                {/* Gợi ý các model thịnh hành trên Oxion AI */}
                <div className="flex items-center gap-1 flex-wrap">
                  {config.apiUrl.includes("xah.io") ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ model: "gemini-2.0-flash" });
                          toast.info("Đã chọn model gemini-2.0-flash (Không suy luận, phản hồi siêu tốc 3-5s)");
                        }}
                        className="cursor-pointer text-[10px] bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded font-bold"
                        title="Model Gemini 2.0 Flash siêu tốc (3-5s)"
                      >
                        ⚡ 2.0-flash (3s)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ model: "thanhnhan9023/gemini-3.7-flash-high" });
                          toast.info("Đã chọn model thanhnhan9023/gemini-3.7-flash-high (Gemini 3.7 Flash High)");
                        }}
                        className="cursor-pointer text-[10px] bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-bold"
                        title="Model Gemini 3.7 Flash High của thanhnhan9023 trên Ckey"
                      >
                        3.7-flash-high
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ model: "gemini-3.7-flash" });
                          toast.info("Đã chọn model gemini-3.7-flash");
                        }}
                        className="cursor-pointer text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 px-1.5 py-0.5 rounded font-bold"
                      >
                        3.7-flash
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ model: "gemini-3.7-flash" });
                          toast.info("Đã chọn model gemini-3.7-flash");
                        }}
                        className="cursor-pointer text-[10px] bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-bold"
                        title="Model Gemini 3.7 Flash mới nhất trên Oxion AI"
                      >
                        3.7-flash ⭐
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ model: "gemini-3.6-flash" });
                          toast.info("Đã chọn model gemini-3.6-flash");
                        }}
                        className="cursor-pointer text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-bold"
                        title="Gemini 3.6 Flash trên Oxion AI"
                      >
                        3.6-flash
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ model: "gpt-5.6-luna" });
                          toast.info("Đã chọn model gpt-5.6-luna");
                        }}
                        className="cursor-pointer text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 px-1.5 py-0.5 rounded font-bold"
                        title="GPT-5.6 Luna trên Oxion AI"
                      >
                        5.6-luna
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ model: "gemini-1.5-flash" });
                          toast.info("Đã chọn model gemini-1.5-flash");
                        }}
                        className="cursor-pointer text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded font-bold"
                      >
                        1.5-flash
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  list="available-ai-models"
                  value={config.model}
                  onChange={(e) => onUpdateConfig({ model: e.target.value })}
                  placeholder="gemini-1.5-flash / gemini-2.0-flash / gpt-4o"
                  className="w-full bg-[#042555] text-white placeholder:text-slate-400 pl-3 pr-8 py-2 rounded-xl border border-sky-400/30 focus:outline-none focus:border-amber-400 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleFetchModels}
                  disabled={isLoadingModels}
                  title="Tải danh sách model có sẵn từ tài khoản Oxion AI"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-300 hover:text-amber-300 transition-colors cursor-pointer p-0.5"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isLoadingModels ? "animate-spin text-amber-400" : ""
                    }`}
                  />
                </button>
              </div>

              {serverModels.length > 0 && (
                <div className="flex items-center justify-between text-[10px] text-emerald-300">
                  <span>✓ Đã nạp {serverModels.length} models từ server</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onUpdateConfig({ model: e.target.value });
                        toast.success(`Đã chọn: ${e.target.value}`);
                      }
                    }}
                    value={serverModels.includes(config.model) ? config.model : ""}
                    className="bg-[#031d42] text-amber-300 border border-sky-400/30 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
                  >
                    <option value="">-- Chọn nhanh model từ server --</option>
                    {serverModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <datalist id="available-ai-models">
                {serverModels.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sky-200 font-bold">Định dạng gửi tệp:</label>
              <select
                value={config.sendFormat}
                onChange={(e) =>
                  onUpdateConfig({
                    sendFormat: e.target.value as "formData" | "base64",
                  })
                }
                className="w-full bg-[#042555] text-white px-3 py-2 rounded-xl border border-sky-400/30 focus:outline-none focus:border-amber-400 text-xs cursor-pointer"
              >
                <option value="formData">FormData (Multipart File)</option>
                <option value="base64">JSON Payload (Base64 Image)</option>
              </select>
            </div>
          </div>

          {/* 5. Chế độ Suy nghĩ AI (Thinking / Reasoning Mode) */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-sky-950/40 border border-sky-400/20">
            <div className="flex items-center justify-between">
              <label className="text-sky-200 font-bold flex items-center gap-1.5 text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Chế độ Thinking (Suy luận AI):</span>
              </label>
              <span className="text-[10px] text-amber-300 font-bold">
                {config.thinkingMode === "off" || !config.thinkingMode
                  ? "⚡ Tắt suy luận (Siêu tốc 3-6s)"
                  : config.thinkingMode === "low"
                  ? "💡 Suy luận ít (Low 6-12s)"
                  : "🧠 Suy luận sâu (High 1-2.5 phút)"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig({ thinkingMode: "off" });
                  toast.success("Đã bật chế độ Siêu tốc: Tắt suy luận để phản hồi <6s");
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  config.thinkingMode === "off" || !config.thinkingMode
                    ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm"
                    : "bg-[#042555] border-sky-400/30 text-sky-200 hover:bg-[#073373]"
                }`}
              >
                <span>⚡ Siêu tốc (Tắt)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig({ thinkingMode: "low" });
                  toast.info("Đã chọn chế độ Suy luận nhanh (Low)");
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  config.thinkingMode === "low"
                    ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm"
                    : "bg-[#042555] border-sky-400/30 text-sky-200 hover:bg-[#073373]"
                }`}
              >
                <span>💡 Thấp (Low)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig({ thinkingMode: "high" });
                  toast.warning("Chế độ Suy luận sâu (High): Có thể mất 1-2.5 phút!");
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  config.thinkingMode === "high"
                    ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm"
                    : "bg-[#042555] border-sky-400/30 text-sky-200 hover:bg-[#073373]"
                }`}
              >
                <span>🧠 Sâu (High)</span>
              </button>
            </div>
            <p className="text-[10px] text-sky-200/70 italic">
              *Tác vụ chấm bài & đọc ảnh chỉ trích xuất chữ và tìm lỗi cơ bản nên chọn <strong>Siêu tốc (Tắt)</strong> để nhận kết quả ngay sau 3-6 giây, tránh AI tự suy nghĩ ngầm 1-2 phút.
            </p>
          </div>

          {/* Nút Reset & Thông báo lưu tự động */}
          <div className="flex items-center justify-between pt-1 border-t border-sky-300/15">
            <span className="text-[10px] text-emerald-300 font-bold">
              ✓ Cấu hình được lưu tự động trên trình duyệt
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer text-[11px] text-sky-200/80 hover:text-white flex items-center gap-1 font-bold underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại mặc định</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

