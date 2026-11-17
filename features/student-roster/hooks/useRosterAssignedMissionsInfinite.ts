"use client";

import { useMemo, useEffect, useRef, useCallback } from "react";
import useSWRInfinite from "swr/infinite";
import { toast } from "sonner";
import {
  TeacherRosterStudent,
  RosterMissionProgressStatus,
} from "../types";
import { studentRosterService, StudentAssignedMissionsResponse } from "../services/studentRosterService";

export type MissionFilterTab = "all" | RosterMissionProgressStatus;

const PAGE_SIZE = 8;

/**
 * Custom Hook tải danh sách bài tập đã giao dạng Infinite Scroll bằng useSWRInfinite
 * - Tuân thủ tuyệt đối Quy tắc 8 & 9 AGENTS.md: Không gọi setState đồng bộ trong useEffect
 */
export function useRosterAssignedMissionsInfinite(
  student: TeacherRosterStudent | null,
  activeTab: MissionFilterTab,
  onTabChange: (tab: MissionFilterTab) => void
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const studentId = student?.id;

  const getKey = (
    pageIndex: number,
    previousPageData: StudentAssignedMissionsResponse | null
  ) => {
    if (!studentId) return null;
    if (previousPageData && (!previousPageData.items || previousPageData.items.length === 0)) {
      return null;
    }
    if (previousPageData && !previousPageData.pagination.has_more) {
      return null;
    }
    return [`roster-assigned-missions-${studentId}-${activeTab}`, pageIndex + 1] as const;
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<StudentAssignedMissionsResponse>(
      getKey,
      async ([, page]: readonly [string, number]) => {
        return studentRosterService.getStudentAssignedMissions(
          studentId!,
          page,
          PAGE_SIZE,
          activeTab
        );
      },
      {
        revalidateOnFocus: false,
        revalidateFirstPage: false,
      }
    );

  const visibleMissions = useMemo(
    () => (data ? data.flatMap((page) => page.items ?? []) : []),
    [data]
  );

  const summary = useMemo(() => {
    return (
      data?.[0]?.summary || {
        total: 0,
        completed: 0,
        pending: 0,
        unsubmitted: 0,
        total_earned_coins: 0,
      }
    );
  }, [data]);

  const stats = useMemo(() => {
    const total = summary.total;
    const approved = summary.completed;
    const submitted = summary.pending;
    const assigned = summary.unsubmitted;
    const totalCoins = summary.total_earned_coins;
    const rejected = 0;
    const exempt = visibleMissions.filter((m) => m.status === "exempt").length;

    return {
      total,
      approved,
      submitted,
      assigned,
      rejected,
      exempt,
      totalCoins,
      progressPercent: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }, [summary, visibleMissions]);

  const isInitialLoading = !data && isLoading;
  const isLoadingMore =
    isLoading ||
    (size > 0 && data && typeof data[size - 1] === "undefined") ||
    (size > 1 && isValidating);
  const isEmpty = data?.[0]?.items?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && !data[data.length - 1]?.pagination?.has_more) ||
    false;

  // Thao tác chuyển đổi Miễn làm ngoại lệ (exempt)
  const toggleExemptMission = useCallback(
    async (missionId: string): Promise<{ status: RosterMissionProgressStatus; title: string } | null> => {
      if (!studentId) return null;
      const target = visibleMissions.find((m) => m.id === missionId);
      if (!target) return null;

      const willExempt = target.status !== "exempt";
      const nextStatus: RosterMissionProgressStatus = willExempt ? "exempt" : "assigned";

      try {
        await studentRosterService.toggleExemptMission(
          studentId,
          target.mission_id,
          willExempt
        );
        await mutate();
        return { status: nextStatus, title: target.title };
      } catch (err: unknown) {
        const errObj = err instanceof Error ? err : new Error(String(err));
        toast.error(errObj.message || "Không thể cập nhật trạng thái miễn làm.");
        return null;
      }
    },
    [studentId, visibleMissions, mutate]
  );

  // IntersectionObserver tự động tăng size khi cuộn tới sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || isReachingEnd || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setSize((prev) => prev + 1);
        }
      },
      {
        root: containerRef.current,
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, setSize]);

  return {
    activeTab,
    handleTabChange: onTabChange,
    visibleMissions,
    totalFilteredCount: data?.[0]?.pagination?.total ?? visibleMissions.length,
    stats,
    isLoading: isInitialLoading,
    isLoadingMore,
    isReachingEnd,
    error,
    containerRef,
    sentinelRef,
    toggleExemptMission,
  };
}
