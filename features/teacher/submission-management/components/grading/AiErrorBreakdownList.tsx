import { CheckCircle2 } from "lucide-react";
import { AiGradingSeverity } from "@/constants";
import { cn } from "@/lib/utils";
import { AI_ERROR_TYPE_META } from "../../constants";
import { GradingSubmissionErrorItem } from "../../types";

interface AiErrorBreakdownListProps {
  errors: GradingSubmissionErrorItem[];
  readable: boolean;
}

/**
 * Khối 2 trong Panel Chấm bài: Chi tiết bóc tách lỗi sai do AI phát hiện (`ai_submission_errors`)
 */
export function AiErrorBreakdownList({
  errors,
  readable,
}: AiErrorBreakdownListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
            Bóc tách lỗi chi tiết
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
            {errors.length} lỗi
          </span>
        </div>
      </div>

      {errors.length === 0 ? (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">
              Không phát hiện lỗi chính tả hay ngữ pháp nào!
            </p>
            <p className="text-[11px] text-emerald-700/90 mt-0.5">
              {readable
                ? "Bài làm đạt chuẩn chất lượng cao, đúng cú pháp và từ vựng yêu cầu."
                : "Chưa thể quét lỗi do chất lượng ảnh chụp chưa đạt chuẩn."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map((err) => {
            const meta = AI_ERROR_TYPE_META[err.error_type];

            return (
              <div
                key={err.id}
                className="w-full text-left p-3 rounded-xl border bg-slate-50/70 border-slate-200 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                        meta.badgeClass
                      )}
                    >
                      {meta.label}
                    </span>
                    {err.line_number && (
                      <span className="text-[11px] font-bold text-slate-600">
                        Dòng {err.line_number}
                      </span>
                    )}
                  </div>

                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold",
                      err.severity === AiGradingSeverity.MAJOR
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    )}
                  >
                    {err.severity === AiGradingSeverity.MAJOR
                      ? "Lỗi nặng (-1đ)"
                      : "Lỗi nhẹ (-0.5đ)"}
                  </span>
                </div>

                <div className="text-xs space-y-0.5">
                  <p className="text-rose-600 line-through font-medium">
                    {err.student_text}
                  </p>
                  <p className="text-emerald-700 font-bold">
                    → {err.correction_text}
                  </p>
                </div>

                {err.explanation && (
                  <p className="text-[11px] text-slate-600 leading-snug pt-0.5">
                    💡 {err.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
