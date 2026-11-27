"use client";

import { AuditLogsPagePayload } from "../types";
import { useAuditLogsActions } from "./useAuditLogsActions";
import { useAuditLogsFilters } from "./useAuditLogsFilters";
import { useAuditLogsQuery } from "./useAuditLogsQuery";

/**
 * Root Orchestrator Hook: Điều phối 3 Micro-Hooks cho trang Nhật ký an ninh
 * - useAuditLogsFilters: Tab, lọc, tìm kiếm debounce, phân trang
 * - useAuditLogsQuery: SWR 2 tầng kết hợp SSR initialData & phân trang Server
 * - useAuditLogsActions: Làm mới & xuất báo cáo CSV
 */
export function useAuditLogs(initialData?: AuditLogsPagePayload) {
  const filters = useAuditLogsFilters();

  const query = useAuditLogsQuery({
    initialData,
    activeTab: filters.activeTab,
    page: filters.currentPage,
    pageSize: filters.pageSize,
    debouncedSearch: filters.debouncedSearch,
    authStatusFilter: filters.authStatusFilter,
    authRoleFilter: filters.authRoleFilter,
    activityScopeFilter: filters.activityScopeFilter,
  });

  const actions = useAuditLogsActions({
    activeTab: filters.activeTab,
    authLogs: query.paginatedAuthLogs,
    activityLogs: query.paginatedActivityLogs,
    mutate: query.mutate,
  });

  return {
    ...filters,
    ...query,
    ...actions,
  };
}

export type UseAuditLogsReturn = ReturnType<typeof useAuditLogs>;
