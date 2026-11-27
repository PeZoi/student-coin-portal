"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AUDIT_LOGS_DEFAULT_PAGE,
  AUDIT_LOGS_DEFAULT_PAGE_SIZE,
} from "../constants";
import {
  ActivityScopeFilter,
  AuditLogsTab,
  AuthRoleFilter,
  AuthStatusFilter,
} from "../types";

/**
 * Micro-Hook 1: Quản lý Tab, Bộ lọc, Tìm kiếm (debounce 300ms) và trạng thái Phân trang
 */
export function useAuditLogsFilters() {
  const [activeTab, setActiveTab] = useState<AuditLogsTab>("auth");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [authStatusFilter, setAuthStatusFilter] =
    useState<AuthStatusFilter>("all");
  const [authRoleFilter, setAuthRoleFilter] = useState<AuthRoleFilter>("all");
  const [activityScopeFilter, setActivityScopeFilter] =
    useState<ActivityScopeFilter>("all");
  const [currentPage, setCurrentPage] = useState<number>(
    AUDIT_LOGS_DEFAULT_PAGE
  );
  const [pageSize, setPageSize] = useState<number>(
    AUDIT_LOGS_DEFAULT_PAGE_SIZE
  );

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleChangeTab = useCallback((tab: AuditLogsTab) => {
    setActiveTab(tab);
    setCurrentPage(AUDIT_LOGS_DEFAULT_PAGE);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setCurrentPage(AUDIT_LOGS_DEFAULT_PAGE);
    }, 300);
  }, []);

  const handleAuthStatusFilterChange = useCallback((val: AuthStatusFilter) => {
    setAuthStatusFilter(val);
    setCurrentPage(AUDIT_LOGS_DEFAULT_PAGE);
  }, []);

  const handleAuthRoleFilterChange = useCallback((val: AuthRoleFilter) => {
    setAuthRoleFilter(val);
    setCurrentPage(AUDIT_LOGS_DEFAULT_PAGE);
  }, []);

  const handleActivityScopeFilterChange = useCallback(
    (val: ActivityScopeFilter) => {
      setActivityScopeFilter(val);
      setCurrentPage(AUDIT_LOGS_DEFAULT_PAGE);
    },
    []
  );

  const handlePageSizeChange = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setCurrentPage(AUDIT_LOGS_DEFAULT_PAGE);
  }, []);

  const handleResetFilters = useCallback(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    setSearchQuery("");
    setDebouncedSearch("");
    setAuthStatusFilter("all");
    setAuthRoleFilter("all");
    setActivityScopeFilter("all");
    setCurrentPage(AUDIT_LOGS_DEFAULT_PAGE);
  }, []);

  const hasActiveFilter = useMemo(() => {
    if (searchQuery.trim().length > 0) return true;
    if (activeTab === "auth") {
      return authStatusFilter !== "all" || authRoleFilter !== "all";
    }
    return activityScopeFilter !== "all";
  }, [
    activeTab,
    activityScopeFilter,
    authRoleFilter,
    authStatusFilter,
    searchQuery,
  ]);

  return {
    activeTab,
    handleChangeTab,
    searchQuery,
    debouncedSearch,
    handleSearchChange,
    authStatusFilter,
    handleAuthStatusFilterChange,
    authRoleFilter,
    handleAuthRoleFilterChange,
    activityScopeFilter,
    handleActivityScopeFilterChange,
    currentPage,
    setCurrentPage,
    pageSize,
    handlePageSizeChange,
    hasActiveFilter,
    handleResetFilters,
  };
}
