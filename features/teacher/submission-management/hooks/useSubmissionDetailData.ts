"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { CACHE_KEYS } from "@/constants";
import {
  MissionSubmissionDetailPayload,
  StudentRosterItem,
  TeacherGradingSubmissionItem,
} from "../types";
import { submissionService } from "../services/submissionService";

interface UseSubmissionDetailDataParams {
  missionId: string | null;
  workspaceClassId: string | null;
  initialClassId?: string;
  initialDetail?: MissionSubmissionDetailPayload | null;
}

/**
 * Micro-Hook: Tải dữ liệu Level 2 (Chi tiết 1 bài tập + Danh sách học sinh Roster + Bài nộp kèm lỗi AI)
 * - Chỉ kích hoạt SWR khi `missionId` tồn tại
 * - Tin tưởng `initialDetail` từ Server Component khi khớp lớp (0ms client delay, chống Duplicate Fetch)
 */
export function useSubmissionDetailData({
  missionId,
  workspaceClassId,
  initialClassId,
  initialDetail,
}: UseSubmissionDetailDataParams) {
  const isMatchingInitial = Boolean(
    missionId &&
      initialDetail &&
      initialDetail.mission.id === missionId &&
      (!workspaceClassId || workspaceClassId === initialClassId)
  );

  const swrKey = missionId
    ? CACHE_KEYS.SUBMISSIONS.MISSION_DETAIL(missionId, workspaceClassId)
    : null;

  const {
    data,
    mutate: mutateDetail,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useSWR(
    swrKey,
    () => submissionService.getMissionDetail(missionId!, workspaceClassId),
    {
      fallbackData: isMatchingInitial ? initialDetail : undefined,
      revalidateOnMount: isMatchingInitial ? false : true,
      revalidateIfStale: !isMatchingInitial,
      revalidateOnFocus: false,
    }
  );

  const selectedMission = data?.mission ?? undefined;

  const studentRoster = useMemo<StudentRosterItem[]>(
    () => data?.roster ?? [],
    [data?.roster]
  );

  const submissionsList = useMemo<TeacherGradingSubmissionItem[]>(
    () => data?.submissions ?? [],
    [data?.submissions]
  );

  return {
    detailData: data ?? null,
    selectedMission,
    studentRoster,
    submissionsList,
    mutateDetail,
    isLoadingDetail,
    isDetailError: Boolean(detailError),
  };
}
