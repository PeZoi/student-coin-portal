"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { SubmissionApprovalStatus } from "@/constants";
import { useUserStore } from "@/stores/useUserStore";
import { TeacherGradingSubmissionItem } from "../types";

interface UseSubmissionMutationsParams {
  submissionsList: TeacherGradingSubmissionItem[];
  setSubmissionsList: Dispatch<SetStateAction<TeacherGradingSubmissionItem[]>>;
  filteredSubmissions: TeacherGradingSubmissionItem[];
  activeIndex: number;
  handleSelectSubmission: (id: string) => void;
  missionIdFilter: string;
}

/**
 * Micro-Hook 2: Xử lý Duyệt bài, Chấm thưởng Xu Heo Đất, Yêu cầu làm lại và Duyệt hàng loạt
 */
export function useSubmissionMutations({
  submissionsList,
  setSubmissionsList,
  filteredSubmissions,
  activeIndex,
  handleSelectSubmission,
  missionIdFilter,
}: UseSubmissionMutationsParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chọn tự động học sinh kế tiếp trước khi bài hiện tại biến mất khỏi tab "Chờ duyệt"
  const advanceToNextStudent = useCallback(
    (currentId: string) => {
      const remaining = filteredSubmissions.filter((s) => s.id !== currentId);
      if (remaining.length === 0) return;
      const nextItem =
        filteredSubmissions[activeIndex + 1] ??
        filteredSubmissions[activeIndex - 1] ??
        remaining[0];
      if (nextItem) {
        handleSelectSubmission(nextItem.id);
      }
    },
    [filteredSubmissions, activeIndex, handleSelectSubmission]
  );

  // 1. Duyệt bài & Cộng xu Heo Đất (`approved`)
  const handleApproveSubmission = useCallback(
    (
      submissionId: string,
      finalCoins: number,
      teacherFeedback: string,
      autoAdvance = true,
      finalScore?: number | null,
      correctCount?: number | null,
      totalQuestions?: number | null
    ) => {
      const target = submissionsList.find((s) => s.id === submissionId);
      if (!target) return;

      if (target.approval_status === SubmissionApprovalStatus.APPROVED) {
        toast.info("Bài nộp này đã được duyệt và cộng xu trước đó.");
        return;
      }

      if (
        correctCount != null &&
        totalQuestions != null &&
        correctCount > totalQuestions
      ) {
        toast.error("Số câu đúng không được lớn hơn tổng số câu hỏi!");
        return;
      }

      const safeCoins = Math.max(0, finalCoins);
      const feedbackText =
        teacherFeedback.trim() ||
        "Cô đã kiểm tra bài làm, con hoàn thành rất tốt! 🌟";

      setIsSubmitting(true);
      if (autoAdvance) {
        advanceToNextStudent(submissionId);
      }

      const nowIso = new Date().toISOString();
      const reviewerName =
        useUserStore.getState().student?.full_name || "Cô Minh Anh";
      setSubmissionsList((prev) =>
        prev.map((item) =>
          item.id === submissionId
            ? {
                ...item,
                approval_status: SubmissionApprovalStatus.APPROVED,
                final_coins: safeCoins,
                final_score:
                  finalScore !== undefined
                    ? finalScore
                    : (item.final_score ?? item.ai_score),
                correct_count:
                  correctCount !== undefined ? correctCount : item.correct_count,
                total_questions:
                  totalQuestions !== undefined
                    ? totalQuestions
                    : item.total_questions,
                teacher_feedback: feedbackText,
                reviewed_by: "usr-teacher-01",
                reviewed_by_name: reviewerName,
                reviewed_at: nowIso,
              }
            : item
        )
      );

      toast.success(
        `Đã duyệt bài của ${target.student_name} (+${safeCoins} xu Heo Đất)!`
      );
      setIsSubmitting(false);
    },
    [submissionsList, setSubmissionsList, advanceToNextStudent]
  );

  // 2. Từ chối / Yêu cầu học sinh chụp hoặc làm lại bài (`rejected`)
  const handleRejectSubmission = useCallback(
    (submissionId: string, rejectReason: string, autoAdvance = true) => {
      const target = submissionsList.find((s) => s.id === submissionId);
      if (!target) return;

      const reasonText =
        rejectReason.trim() ||
        "Ảnh bài làm chưa rõ hoặc chưa đủ yêu cầu, con kiểm tra và nộp lại giúp cô nhé!";

      setIsSubmitting(true);
      if (autoAdvance) {
        advanceToNextStudent(submissionId);
      }

      const nowIso = new Date().toISOString();
      const reviewerName =
        useUserStore.getState().student?.full_name || "Cô Minh Anh";
      setSubmissionsList((prev) =>
        prev.map((item) =>
          item.id === submissionId
            ? {
                ...item,
                approval_status: SubmissionApprovalStatus.REJECTED,
                final_coins: 0,
                teacher_feedback: reasonText,
                reviewed_by: "usr-teacher-01",
                reviewed_by_name: reviewerName,
                reviewed_at: nowIso,
              }
            : item
        )
      );

      toast.info(`Đã gửi yêu cầu nộp lại bài cho ${target.student_name}.`);
      setIsSubmitting(false);
    },
    [submissionsList, setSubmissionsList, advanceToNextStudent]
  );

  // 3. Duyệt nhanh tất cả các bài hợp lệ (readable = true & ai_score >= 8.0)
  const handleBatchApproveValid = useCallback(() => {
    const validTargets = submissionsList.filter((sub) => {
      const matchMission =
        missionIdFilter === "all" || sub.mission_id === missionIdFilter;
      return (
        matchMission &&
        sub.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL &&
        sub.readable &&
        (sub.ai_score === null || sub.ai_score >= 8.0)
      );
    });

    if (validTargets.length === 0) {
      toast.info("Không có bài nộp hợp lệ nào đang chờ duyệt nhanh.");
      return;
    }

    const targetIds = new Set(validTargets.map((t) => t.id));
    const nowIso = new Date().toISOString();
    const reviewerName =
      useUserStore.getState().student?.full_name || "Cô Minh Anh";

    setSubmissionsList((prev) =>
      prev.map((item) =>
        targetIds.has(item.id)
          ? {
              ...item,
              approval_status: SubmissionApprovalStatus.APPROVED,
              final_coins: item.ai_suggested_coins,
              final_score: item.final_score ?? item.ai_score,
              teacher_feedback:
                item.teacher_feedback ||
                "Bài làm đạt chuẩn, cô duyệt thưởng xu theo đề xuất của AI! 🌟",
              reviewed_by: "usr-teacher-01",
              reviewed_by_name: reviewerName,
              reviewed_at: nowIso,
            }
          : item
      )
    );

    toast.success(
      `Đã duyệt nhanh ${validTargets.length} bài nộp hợp lệ và cộng xu thành công!`
    );
  }, [submissionsList, missionIdFilter, setSubmissionsList]);

  return {
    isSubmitting,
    handleApproveSubmission,
    handleRejectSubmission,
    handleBatchApproveValid,
  };
}
