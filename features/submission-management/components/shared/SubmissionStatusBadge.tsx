import { CheckCircle2, RotateCcw } from "lucide-react";
import { SubmissionApprovalStatus } from "@/constants";

interface SubmissionStatusBadgeProps {
  status: SubmissionApprovalStatus | "unsubmitted";
  variant?: "compact" | "studio";
  approvedCoins?: number | null;
}

/**
 * Badge hiển thị trạng thái duyệt bài tập dùng chung cho StudentRosterCard & StudioTopBar
 */
export function SubmissionStatusBadge({
  status,
  variant = "compact",
  approvedCoins,
}: SubmissionStatusBadgeProps) {
  if (variant === "studio") {
    if (status === SubmissionApprovalStatus.APPROVED) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Đã duyệt{approvedCoins != null ? ` (+${approvedCoins} xu)` : ""}
          </span>
        </span>
      );
    }

    if (status === SubmissionApprovalStatus.REJECTED) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-extrabold whitespace-nowrap">
          <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Yêu cầu làm lại</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
        <span>Đang chờ giáo viên duyệt</span>
      </span>
    );
  }

  // Variant compact cho StudentRosterCard
  if (status === SubmissionApprovalStatus.PENDING_APPROVAL) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>Chờ duyệt</span>
      </span>
    );
  }

  if (status === SubmissionApprovalStatus.APPROVED) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Đã duyệt</span>
      </span>
    );
  }

  if (status === SubmissionApprovalStatus.REJECTED) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-extrabold whitespace-nowrap">
        <RotateCcw className="w-3 h-3 text-rose-600" />
        <span>Cần sửa</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold whitespace-nowrap">
      Chưa nộp
    </span>
  );
}
