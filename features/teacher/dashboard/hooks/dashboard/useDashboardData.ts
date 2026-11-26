"use client";

import useSWR from "swr";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import { EMPTY_DASHBOARD_PAYLOAD } from "../../constants";
import { dashboardService } from "../../services/dashboardService";
import { TeacherDashboardPayload } from "../../types";

export interface UseDashboardDataParams {
  initialData?: TeacherDashboardPayload;
  initialClassId?: string;
}

/**
 * Micro-Hook 1: Chuyên trách Data Fetching 2 tầng (SSR initialData + SWR theo lớp Header)
 * - Tự động nhận diện lớp học đang chọn từ useTeacherWorkspaceStore
 * - Khi lớp khớp initialClassId từ Server: 0ms tải, không refetch thừa (revalidateOnMount: false)
 * - Khi đổi lớp trên Header: tự động fetch dữ liệu lớp mới và bật trạng thái loading cho Skeleton
 */
export function useDashboardData({
  initialData,
  initialClassId,
}: UseDashboardDataParams = {}) {
  const classes = useTeacherWorkspaceStore((state) => state.classes);
  const selectedWorkspaceClassId = useTeacherWorkspaceStore(
    (state) => state.selectedClassId
  );

  const activeClassId = selectedWorkspaceClassId ?? initialClassId ?? null;
  const activeClass =
    classes.find((c) => c.id === activeClassId) ?? null;

  const isMatchingInitial = Boolean(
    initialData && (!initialClassId || activeClassId === initialClassId)
  );

  const { data, mutate, isLoading, isValidating, error } =
    useSWR<TeacherDashboardPayload>(
      CACHE_KEYS.DASHBOARD.TEACHER(activeClassId),
      () => dashboardService.getDashboard(activeClassId),
      {
        fallbackData: isMatchingInitial ? initialData : undefined,
        revalidateOnMount: !isMatchingInitial,
        revalidateIfStale: !isMatchingInitial,
        revalidateOnFocus: true,
        focusThrottleInterval: 30000,
        keepPreviousData: false,
      }
    );

  const dashboard = data ?? (isMatchingInitial && initialData ? initialData : EMPTY_DASHBOARD_PAYLOAD);
  const isSwitchingClass = isLoading && !data;

  return {
    activeClassId,
    activeClassName: activeClass?.class_name ?? null,
    dashboard,
    kpis: dashboard.kpis,
    recentSubmissions: dashboard.recentSubmissions,
    attentionStudents: dashboard.attentionStudents,
    topStudents: dashboard.topStudents,
    pendingRewards: dashboard.pendingRewards,
    coinBreakdown: dashboard.coinBreakdown,
    isLoading: isSwitchingClass,
    isValidating,
    isError: Boolean(error),
    mutate,
  };
}
