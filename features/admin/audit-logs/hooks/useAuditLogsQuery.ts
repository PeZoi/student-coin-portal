"use client";

import useSWR from "swr";
import { CACHE_KEYS } from "@/constants/cacheKeys";
import {
  AUDIT_LOGS_DEFAULT_PAGE,
  AUDIT_LOGS_DEFAULT_PAGE_SIZE,
  EMPTY_AUDIT_LOGS_PAYLOAD,
} from "../constants";
import { auditLogsService } from "../services/auditLogsService";
import {
  ActivityScopeFilter,
  AuditLogsPagePayload,
  AuditLogsTab,
  AuthRoleFilter,
  AuthStatusFilter,
} from "../types";

interface UseAuditLogsQueryProps {
  initialData?: AuditLogsPagePayload;
  activeTab: AuditLogsTab;
  page: number;
  pageSize: number;
  debouncedSearch: string;
  authStatusFilter: AuthStatusFilter;
  authRoleFilter: AuthRoleFilter;
  activityScopeFilter: ActivityScopeFilter;
}

/**
 * Micro-Hook 2: Data Fetching 2 tầng (Server Component + SWR Cache + Server Pagination)
 * - Tin tưởng hoàn toàn initialData ở truy vấn mặc định đầu tiên (không duplicate fetch)
 * - Tự động cache từng trang/tab/bộ lọc đã xem
 */
export function useAuditLogsQuery({
  initialData,
  activeTab,
  page,
  pageSize,
  debouncedSearch,
  authStatusFilter,
  authRoleFilter,
  activityScopeFilter,
}: UseAuditLogsQueryProps) {
  const isMatchingInitialDefault = Boolean(
    initialData &&
      activeTab === "auth" &&
      page === AUDIT_LOGS_DEFAULT_PAGE &&
      pageSize === AUDIT_LOGS_DEFAULT_PAGE_SIZE &&
      debouncedSearch === "" &&
      authStatusFilter === "all" &&
      authRoleFilter === "all"
  );

  const swrKey = CACHE_KEYS.SYSTEM.AUDIT_LOGS({
    tab: activeTab,
    page,
    pageSize,
    search: debouncedSearch,
    status: activeTab === "auth" ? authStatusFilter : "all",
    role: activeTab === "auth" ? authRoleFilter : "all",
    scope: activeTab === "activity" ? activityScopeFilter : "all",
  });

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () =>
      auditLogsService.getAuditLogs({
        tab: activeTab,
        page,
        pageSize,
        search: debouncedSearch,
        status: activeTab === "auth" ? authStatusFilter : "all",
        role: activeTab === "auth" ? authRoleFilter : "all",
        scope: activeTab === "activity" ? activityScopeFilter : "all",
      }),
    {
      fallbackData: isMatchingInitialDefault ? initialData : undefined,
      revalidateOnMount: !isMatchingInitialDefault,
      revalidateIfStale: !isMatchingInitialDefault,
      revalidateOnFocus: false,
      dedupingInterval: 15000,
    }
  );

  const payload = data ?? (isMatchingInitialDefault ? initialData : undefined);
  const kpiStats =
    payload?.kpiStats ??
    initialData?.kpiStats ??
    EMPTY_AUDIT_LOGS_PAYLOAD.kpiStats;

  return {
    paginatedAuthLogs: payload?.authLogs ?? [],
    paginatedActivityLogs: payload?.activityLogs ?? [],
    kpiStats,
    totalItems: payload?.pagination.totalItems ?? 0,
    totalPages: payload?.pagination.totalPages ?? 1,
    isTableLoading: isLoading && !payload,
    isRefreshing: isValidating,
    isError: Boolean(error),
    mutate,
  };
}
