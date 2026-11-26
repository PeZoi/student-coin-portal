"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCheck,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { MissionSubmissionType, SubmissionApprovalStatus } from "@/constants";
import { AppRoutes } from "@/constants/routes";
import {
  SUBMISSION_GRADING_CONFIG,
  SUBMISSION_MEDIA_PATHS,
} from "../constants";
import { SubmissionMutationAction } from "../hooks/useSubmissionMutations";
import { TeacherGradingSubmissionItem } from "../types";
import { useManageSubmissionsContext } from "../contexts/ManageSubmissionsContext";
import { AiEvaluationSummary } from "./grading/AiEvaluationSummary";
import { AiErrorBreakdownList } from "./grading/AiErrorBreakdownList";
import { TeacherGradingForm } from "./grading/TeacherGradingForm";

/**
 * Cột 2 (Phải): Container Bảng AI Đánh Giá & Chấm Điểm
 * - Tách gọn thành 3 sub-components (`AiEvaluationSummary`, `AiErrorBreakdownList`, `TeacherGradingForm`)
 * - Dùng `key={submission.id + status}` để tự reset form không cần `useEffect` (Quy tắc 8 AGENTS.md)
 */
export function SubmissionGradingPanel() {
  const {
    selectedMissionId,
    activeSubmission,
    nextPendingSubmission,
    isSubmitting,
    submittingAction,
    handleApproveSubmission,
    handleRejectSubmission,
  } = useManageSubmissionsContext();

  if (!activeSubmission) return null;

  return (
    <SubmissionGradingFormContent
      key={`${activeSubmission.id}-${activeSubmission.approval_status}`}
      missionId={selectedMissionId ?? activeSubmission.mission_id}
      submission={activeSubmission}
      nextPendingStudentId={nextPendingSubmission?.student_id ?? null}
      nextPendingStudentName={nextPendingSubmission?.student_name ?? null}
      isSubmitting={isSubmitting}
      submittingAction={submittingAction}
      onApprove={handleApproveSubmission}
      onReject={handleRejectSubmission}
    />
  );
}

interface SubmissionGradingFormContentProps {
  missionId: string;
  submission: TeacherGradingSubmissionItem;
  nextPendingStudentId: string | null;
  nextPendingStudentName: string | null;
  isSubmitting: boolean;
  submittingAction: SubmissionMutationAction;
  onApprove: (
    id: string,
    coins: number,
    feedback: string,
    finalScore?: number | null,
    correctCount?: number | null,
    totalQuestions?: number | null
  ) => Promise<boolean>;
  onReject: (id: string, reason: string) => Promise<boolean>;
}

function SubmissionGradingFormContent({
  missionId,
  submission,
  nextPendingStudentId,
  nextPendingStudentName,
  isSubmitting,
  submittingAction,
  onApprove,
  onReject,
}: SubmissionGradingFormContentProps) {
  const isApproved =
    submission.approval_status === SubmissionApprovalStatus.APPROVED;
  const isRejected =
    submission.approval_status === SubmissionApprovalStatus.REJECTED;
  const isReadOnly = isApproved || isRejected;
  const showQuestionCountEditor =
    submission.submission_type === MissionSubmissionType.PLATFORM_PROOF ||
    submission.total_questions !== null;

  const [scoreInput, setScoreInput] = useState<number>(
    submission.final_score ??
      submission.ai_score ??
      SUBMISSION_GRADING_CONFIG.MAX_SCORE
  );
  const [correctCountInput, setCorrectCountInput] = useState<string>(
    submission.correct_count !== null ? String(submission.correct_count) : ""
  );
  const [totalQuestionsInput, setTotalQuestionsInput] = useState<string>(
    submission.total_questions !== null
      ? String(submission.total_questions)
      : ""
  );
  const [coinsInput, setCoinsInput] = useState<number>(
    submission.final_coins ?? submission.ai_suggested_coins
  );
  const [feedbackInput, setFeedbackInput] = useState<string>(
    submission.teacher_feedback ?? ""
  );

  const parsedCorrect =
    correctCountInput.trim() === ""
      ? null
      : Math.max(0, Number(correctCountInput));
  const parsedTotal =
    totalQuestionsInput.trim() === ""
      ? null
      : Math.max(0, Number(totalQuestionsInput));
  const isQuestionCountInvalid =
    parsedCorrect !== null &&
    parsedTotal !== null &&
    parsedCorrect > parsedTotal;

  const handleApplyAiComment = (comment?: string) => {
    const text = comment ?? submission.ai_raw_response?.overall_comment;
    if (text) {
      setFeedbackInput(text);
      toast.info("Đã chèn nhận xét của AI vào khung lời phê!");
    }
  };

  const handleCalcScoreFromQuestions = () => {
    if (
      parsedCorrect !== null &&
      parsedTotal !== null &&
      parsedTotal > 0 &&
      parsedCorrect <= parsedTotal
    ) {
      const calculated =
        Math.round(
          (parsedCorrect / parsedTotal) *
            SUBMISSION_GRADING_CONFIG.MAX_SCORE *
            10
        ) / 10;
      setScoreInput(calculated);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[740px] overflow-hidden">
      {/* 1. Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider truncate">
            AI Đánh Giá &amp; Chấm Điểm
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold shrink-0 tabular-nums">
          <Image
            src={SUBMISSION_MEDIA_PATHS.COIN_ICON}
            alt="Xu Heo Đất"
            width={14}
            height={14}
            style={{ height: "auto" }}
            className="w-3.5 select-none shrink-0"
          />
          <span>
            Khung: +{submission.min_reward_coins} ~ {submission.max_reward_coins}{" "}
            xu
          </span>
        </div>
      </div>

      {/* 2. Nội dung cuộn dọc (tách compositor layer + overscroll-contain chống giật / scroll chaining) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain teacher-scrollbar will-change-scroll [contain:paint] p-4 space-y-4">
        <AiEvaluationSummary
          submission={submission}
          isApproved={isReadOnly}
          onApplyAiComment={handleApplyAiComment}
        />

        <AiErrorBreakdownList
          errors={submission.errors}
          readable={submission.readable}
        />

        <TeacherGradingForm
          submission={submission}
          isApproved={isReadOnly}
          showQuestionCountEditor={showQuestionCountEditor}
          scoreInput={scoreInput}
          onScoreChange={setScoreInput}
          correctCountInput={correctCountInput}
          onCorrectCountChange={setCorrectCountInput}
          totalQuestionsInput={totalQuestionsInput}
          onTotalQuestionsChange={setTotalQuestionsInput}
          parsedCorrect={parsedCorrect}
          parsedTotal={parsedTotal}
          isQuestionCountInvalid={isQuestionCountInvalid}
          onCalcScoreFromQuestions={handleCalcScoreFromQuestions}
          coinsInput={coinsInput}
          onCoinsChange={setCoinsInput}
          feedbackInput={feedbackInput}
          onFeedbackChange={setFeedbackInput}
          onApplyAiComment={() => handleApplyAiComment()}
        />
      </div>

      {/* 3. Sticky Footer */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/90 flex flex-col sm:flex-row items-center gap-2 shrink-0">
        {isReadOnly ? (
          <>
            {isApproved ? (
              <div className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Đã duyệt (+{submission.final_coins ?? coinsInput} xu)
                </span>
              </div>
            ) : (
              <div className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold">
                <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Đã yêu cầu nộp lại bài</span>
              </div>
            )}

            {nextPendingStudentId && (
              <Link
                href={AppRoutes.TEACHER.STUDENT_GRADING(
                  missionId,
                  nextPendingStudentId
                )}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[#0A62D6] hover:bg-[#0850B0] text-white text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0"
                title={
                  nextPendingStudentName
                    ? `Chấm tiếp bài của ${nextPendingStudentName}`
                    : undefined
                }
              >
                <span>Chấm học sinh tiếp theo</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onReject(submission.id, feedbackInput)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submittingAction === "reject" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Yêu cầu nộp lại</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting || isQuestionCountInvalid}
              onClick={() =>
                onApprove(
                  submission.id,
                  coinsInput,
                  feedbackInput,
                  scoreInput,
                  showQuestionCountEditor ? parsedCorrect : undefined,
                  showQuestionCountEditor ? parsedTotal : undefined
                )
              }
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submittingAction === "approve" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Đang duyệt bài...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4 shrink-0" />
                  <span>Duyệt (+{coinsInput} xu)</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
