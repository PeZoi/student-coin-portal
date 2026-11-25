"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { SubmissionApprovalStatus } from "@/constants";
import { SUBMISSION_GRADING_CONFIG } from "../constants";
import {
  TeacherGradingSubmissionItem,
  MissionDetailViewMode,
} from "../types";

interface UseSubmissionFiltersParams {
  submissionsList: TeacherGradingSubmissionItem[];
  initialMissionId?: string;
  initialViewMode?: MissionDetailViewMode;
  initialStudentId?: string;
}

/**
 * Micro-Hook: Điều hướng URL (Single Source of Truth), Thống kê KPI Level 2,
 * xác định bài nộp đang chấm (`activeSubmission`) và học sinh chờ duyệt kế tiếp (`nextPendingSubmission`)
 */
export function useSubmissionFilters({
  submissionsList,
  initialMissionId,
  initialViewMode,
  initialStudentId,
}: UseSubmissionFiltersParams) {
  // Đọc thông số trực tiếp từ URL (Single Source of Truth)
  const params = useParams();
  const urlMissionId =
    (params?.id as string | undefined) || initialMissionId || null;
  const urlStudentId =
    (params?.studentId as string | undefined) || initialStudentId || null;

  const selectedMissionId = urlMissionId;

  // Quyết định chế độ xem hoàn toàn dựa vào URL
  const viewMode: MissionDetailViewMode = urlMissionId
    ? urlStudentId
      ? "studio"
      : (initialViewMode ?? "roster")
    : "roster";

  // Trang ảnh đang soi (0-based index)
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Thống kê KPIs trên phạm vi bài tập đang chọn
  const kpiStats = useMemo(() => {
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let lateCount = 0;
    const validAiPendingIds: string[] = [];
    let validAiPendingTotalCoins = 0;

    for (const sub of submissionsList) {
      if (sub.is_late) {
        lateCount += 1;
      }
      if (sub.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL) {
        pendingCount += 1;
        if (
          sub.readable &&
          (sub.ai_score === null ||
            sub.ai_score >=
              SUBMISSION_GRADING_CONFIG.VALID_AI_BATCH_APPROVE_MIN_SCORE)
        ) {
          validAiPendingIds.push(sub.id);
          validAiPendingTotalCoins += sub.ai_suggested_coins;
        }
      } else if (sub.approval_status === SubmissionApprovalStatus.APPROVED) {
        approvedCount += 1;
      } else if (sub.approval_status === SubmissionApprovalStatus.REJECTED) {
        rejectedCount += 1;
      }
    }

    return {
      totalCount: submissionsList.length,
      pendingCount,
      approvedCount,
      rejectedCount,
      lateCount,
      validAiPendingIds,
      validAiPendingCount: validAiPendingIds.length,
      validAiPendingTotalCoins,
    };
  }, [submissionsList]);

  // Tìm bài nộp đích danh của học sinh trên URL
  const activeSubmission = useMemo(() => {
    if (!urlStudentId) return null;
    return (
      submissionsList.find(
        (s) => s.student_id === urlStudentId || s.id === urlStudentId
      ) ?? null
    );
  }, [submissionsList, urlStudentId]);

  // Tìm học sinh chờ duyệt kế tiếp (khác bài đang xem) để hiển thị nút "Chấm học sinh tiếp theo →"
  const nextPendingSubmission = useMemo(() => {
    const pendingList = submissionsList.filter(
      (s) =>
        s.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL &&
        s.id !== activeSubmission?.id
    );
    if (pendingList.length === 0) return null;

    if (activeSubmission) {
      const currentIdx = submissionsList.findIndex(
        (s) => s.id === activeSubmission.id
      );
      if (currentIdx >= 0) {
        const afterCurrent = submissionsList
          .slice(currentIdx + 1)
          .find(
            (s) =>
              s.approval_status === SubmissionApprovalStatus.PENDING_APPROVAL
          );
        if (afterCurrent) return afterCurrent;
      }
    }

    return pendingList[0];
  }, [submissionsList, activeSubmission]);

  // Đảm bảo activePhotoIndex luôn hợp lệ với số ảnh của bài đang xem
  const safePhotoIndex = useMemo(() => {
    if (!activeSubmission) return 0;
    const maxIdx = Math.max(0, activeSubmission.proof_image_urls.length - 1);
    return activePhotoIndex > maxIdx ? 0 : activePhotoIndex;
  }, [activeSubmission, activePhotoIndex]);

  return {
    selectedMissionId,
    viewMode,
    activeSubmission,
    nextPendingSubmission,
    activePhotoIndex: safePhotoIndex,
    setActivePhotoIndex,
    ...kpiStats,
  };
}
