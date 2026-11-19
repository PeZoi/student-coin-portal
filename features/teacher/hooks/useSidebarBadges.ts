"use client";

import useSWR from "swr";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import { useTeacherWorkspaceStore } from "@/stores/useTeacherWorkspaceStore";
import {
  teacherBadgeService,
  TeacherSidebarBadgesData,
} from "../services/teacherBadgeService";

/**
 * Micro-hook chuyên trách: Tải và đồng bộ số lượng badge trên Menu Sidebar của giáo viên
 * - Tự động tải ngầm bằng SWR, không gây lag giao diện
 * - Tự động cập nhật lại khi giáo viên chuyển đổi lớp trên Header (Workspace)
 * - Làm mới định kỳ mỗi 60 giây và tự động revalidate khi focus tab
 */
export function useSidebarBadges() {
  const selectedClassId = useTeacherWorkspaceStore(
    (state) => state.selectedClassId
  );

  const { data, mutate, isLoading } = useSWR<TeacherSidebarBadgesData>(
    CACHE_KEYS.SIDEBAR.TEACHER_BADGES(selectedClassId),
    () => teacherBadgeService.getSidebarBadges(selectedClassId),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      refreshInterval: 60000,
    }
  );

  return {
    pendingRewards: data?.pendingRewards ?? 0,
    pendingSubmissions: data?.pendingSubmissions ?? 0,
    selectedClassId,
    mutateBadges: mutate,
    isLoading,
  };
}
