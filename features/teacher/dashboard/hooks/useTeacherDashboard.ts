"use client";

import { TeacherDashboardPayload } from "../types";
import { useDashboardData } from "./dashboard/useDashboardData";
import { useDashboardRewardModal } from "./dashboard/useDashboardRewardModal";
import { useDashboardMutations } from "./dashboard/useDashboardMutations";

export interface UseTeacherDashboardProps {
  initialData?: TeacherDashboardPayload;
  initialClassId?: string;
}

/**
 * Root Orchestrator Hook cho trang Tổng quan Giáo viên (Teacher Dashboard)
 * - Đóng vai trò "Nhạc trưởng" điều phối 3 Micro-Hooks chuyên trách:
 *   + useDashboardData: SSR Hydration + SWR Cache tự động cập nhật khi đổi lớp trên Header
 *   + useDashboardRewardModal: Trạng thái modal xem chi tiết yêu cầu đổi quà
 *   + useDashboardMutations: Duyệt/từ chối quà thật qua API + Optimistic UI + Revalidate Sidebar
 * - Tuân thủ Quy tắc 9 (Data Fetching 2 tầng) & Quy tắc 12 (Micro-Hooks < 100 dòng)
 */
export function useTeacherDashboard({
  initialData,
  initialClassId,
}: UseTeacherDashboardProps = {}) {
  const dataState = useDashboardData({
    initialData,
    initialClassId,
  });

  const modalState = useDashboardRewardModal();

  const mutationState = useDashboardMutations({
    dashboard: dataState.dashboard,
    mutate: dataState.mutate,
    onCloseRewardDetail: modalState.handleCloseRewardDetail,
  });

  return {
    ...dataState,
    ...modalState,
    ...mutationState,
  };
}
