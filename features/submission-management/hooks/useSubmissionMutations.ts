"use client";

import { useState, useCallback } from "react";
import { useSWRConfig, KeyedMutator } from "swr";
import { toast } from "sonner";
import { CACHE_KEYS, SubmissionApprovalStatus } from "@/constants";
import { getErrorMessage } from "@/lib/http/httpClient";
import { SUBMISSION_GRADING_CONFIG } from "../constants";
import {
  MissionSubmissionDetailPayload,
  TeacherGradingSubmissionItem,
} from "../types";
import { submissionService } from "../services/submissionService";

export type SubmissionMutationAction =
  | "approve"
  | "reject"
  | "batch_approve"
  | null;

interface UseSubmissionMutationsParams {
  submissionsList: TeacherGradingSubmissionItem[];
  validAiPendingIds: string[];
  mutateDetail: KeyedMutator<MissionSubmissionDetailPayload | null>;
}

/**
 * Micro-Hook: Xử lý các thao tác ghi dữ liệu thật (Duyệt bài, Yêu cầu nộp lại, Duyệt nhanh hàng loạt)
 * - Gọi API thật -> Postgres RPC Atomic ACID Transaction
 * - Tự động đồng bộ lại SWR Detail, SWR Overview và Sidebar Badges giáo viên
 */
export function useSubmissionMutations({
  submissionsList,
  validAiPendingIds,
  mutateDetail,
}: UseSubmissionMutationsParams) {
  const { mutate: globalMutate } = useSWRConfig();
  const [submittingAction, setSubmittingAction] =
    useState<SubmissionMutationAction>(null);
  const isSubmitting = submittingAction !== null;

  // Đồng bộ toàn bộ cache liên quan (Detail + Overview + Sidebar Badges)
  const revalidateRelatedCaches = useCallback(async () => {
    await Promise.all([
      mutateDetail(),
      globalMutate(
        (key) =>
          (Array.isArray(key) &&
            key[0] === CACHE_KEYS.SUBMISSIONS.OVERVIEW_PREFIX) ||
          (Array.isArray(key) &&
            key[0] === CACHE_KEYS.SIDEBAR.TEACHER_BADGES_PREFIX) ||
          key === CACHE_KEYS.SIDEBAR.TEACHER_BADGES_PREFIX
      ),
    ]);
  }, [mutateDetail, globalMutate]);

  // 1. Duyệt 1 bài nộp & Cộng xu Heo Đất (`POST /api/teacher/submissions/[id]/approve`)
  const handleApproveSubmission = useCallback(
    async (
      submissionId: string,
      finalCoins: number,
      teacherFeedback: string,
      finalScore?: number | null,
      correctCount?: number | null,
      totalQuestions?: number | null
    ): Promise<boolean> => {
      const target = submissionsList.find((s) => s.id === submissionId);
      if (!target) return false;

      if (target.approval_status === SubmissionApprovalStatus.APPROVED) {
        toast.info("Bài nộp này đã được duyệt và cộng xu trước đó.");
        return false;
      }

      if (
        correctCount != null &&
        totalQuestions != null &&
        correctCount > totalQuestions
      ) {
        toast.error("Số câu đúng không được lớn hơn tổng số câu hỏi!");
        return false;
      }

      const safeCoins = Math.max(
        SUBMISSION_GRADING_CONFIG.MIN_COINS,
        Math.round(finalCoins)
      );
      const feedbackText =
        teacherFeedback.trim() ||
        SUBMISSION_GRADING_CONFIG.DEFAULT_APPROVE_FEEDBACK;

      setSubmittingAction("approve");
      try {
        await submissionService.approveSubmission(submissionId, {
          final_coins: safeCoins,
          final_score:
            finalScore !== undefined
              ? finalScore
              : (target.final_score ?? target.ai_score),
          teacher_feedback: feedbackText,
          correct_count: correctCount,
          total_questions: totalQuestions,
        });

        await revalidateRelatedCaches();
        toast.success(
          `Đã duyệt bài của ${target.student_name} (+${safeCoins} xu Heo Đất)!`
        );
        return true;
      } catch (err: unknown) {
        toast.error(
          getErrorMessage(err, "Không thể duyệt bài nộp. Vui lòng thử lại.")
        );
        return false;
      } finally {
        setSubmittingAction(null);
      }
    },
    [submissionsList, revalidateRelatedCaches]
  );

  // 2. Từ chối / Yêu cầu nộp lại (`POST /api/teacher/submissions/[id]/reject`)
  const handleRejectSubmission = useCallback(
    async (submissionId: string, rejectReason: string): Promise<boolean> => {
      const target = submissionsList.find((s) => s.id === submissionId);
      if (!target) return false;

      const reasonText =
        rejectReason.trim() || SUBMISSION_GRADING_CONFIG.DEFAULT_REJECT_FEEDBACK;

      setSubmittingAction("reject");
      try {
        await submissionService.rejectSubmission(submissionId, {
          teacher_feedback: reasonText,
        });

        await revalidateRelatedCaches();
        toast.info(`Đã gửi yêu cầu nộp lại bài cho ${target.student_name}.`);
        return true;
      } catch (err: unknown) {
        toast.error(
          getErrorMessage(
            err,
            "Không thể gửi yêu cầu nộp lại. Vui lòng thử lại."
          )
        );
        return false;
      } finally {
        setSubmittingAction(null);
      }
    },
    [submissionsList, revalidateRelatedCaches]
  );

  // 3. Duyệt nhanh hàng loạt bài hợp lệ trong 1 round-trip RPC (`POST /api/teacher/submissions/batch-approve`)
  const handleBatchApproveValid = useCallback(async (): Promise<boolean> => {
    if (validAiPendingIds.length === 0) {
      toast.info("Không có bài nộp hợp lệ nào đang chờ duyệt nhanh.");
      return false;
    }

    setSubmittingAction("batch_approve");
    try {
      const result = await submissionService.batchApproveSubmissions({
        submission_ids: validAiPendingIds,
        teacher_feedback:
          SUBMISSION_GRADING_CONFIG.DEFAULT_BATCH_APPROVE_FEEDBACK,
      });

      await revalidateRelatedCaches();
      toast.success(
        `Đã duyệt nhanh ${result.approved_count} bài nộp hợp lệ (+${result.total_coins_awarded} xu)!`
      );
      return true;
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, "Không thể duyệt hàng loạt bài nộp.")
      );
      return false;
    } finally {
      setSubmittingAction(null);
    }
  }, [validAiPendingIds, revalidateRelatedCaches]);

  return {
    isSubmitting,
    submittingAction,
    handleApproveSubmission,
    handleRejectSubmission,
    handleBatchApproveValid,
  };
}
