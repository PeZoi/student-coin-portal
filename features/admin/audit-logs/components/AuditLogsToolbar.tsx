"use client";

import { useMemo } from "react";
import { Filter, History, Lock, RotateCw, Search, Users, X } from "lucide-react";
import {
  TeacherSelect,
  TeacherSelectOption,
} from "@/components/ui/TeacherSelect";
import { Tooltip } from "@/components/ui/tooltip";
import { ACTIVITY_SCOPE_LABELS, ROLE_LABELS } from "../constants";
import { useAuditLogsContext } from "../contexts/AuditLogsContext";
import {
  ActivityScopeFilter,
  AuthRoleFilter,
  AuthStatusFilter,
} from "../types";

/**
 * Thanh chuyển Tab + Bộ lọc + Tìm kiếm đồng bộ 100% với StudentsToolbar
 */
export function AuditLogsToolbar() {
  const {
    activeTab,
    handleChangeTab,
    searchQuery,
    handleSearchChange,
    authStatusFilter,
    handleAuthStatusFilterChange,
    authRoleFilter,
    handleAuthRoleFilterChange,
    activityScopeFilter,
    handleActivityScopeFilterChange,
    isRefreshing,
    handleRefresh,
    kpiStats,
  } = useAuditLogsContext();

  const authStatusOptions: TeacherSelectOption[] = useMemo(
    () => [
      {
        label: "Tất cả kết quả",
        value: "all",
        badge: `${kpiStats.totalAuthLogs}`,
      },
      {
        label: "Thành công",
        value: "success",
        badge: `${kpiStats.successAuthCount}`,
      },
      {
        label: "Thất bại / Cảnh báo",
        value: "failed",
        badge: `${kpiStats.failedAuthCount}`,
      },
    ],
    [
      kpiStats.failedAuthCount,
      kpiStats.successAuthCount,
      kpiStats.totalAuthLogs,
    ]
  );

  const authRoleOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: "Tất cả vai trò", value: "all" },
      { label: ROLE_LABELS.student, value: "student" },
      { label: ROLE_LABELS.teacher, value: "teacher" },
      { label: ROLE_LABELS.super_teacher, value: "super_teacher" },
      { label: ROLE_LABELS.admin, value: "admin" },
    ],
    []
  );

  const activityScopeOptions: TeacherSelectOption[] = useMemo(
    () => [
      { label: "Tất cả phạm vi", value: "all" },
      { label: ACTIVITY_SCOPE_LABELS.account_pin, value: "account_pin" },
      {
        label: ACTIVITY_SCOPE_LABELS.class_assignment,
        value: "class_assignment",
      },
      { label: ACTIVITY_SCOPE_LABELS.wheel_rewards, value: "wheel_rewards" },
      {
        label: ACTIVITY_SCOPE_LABELS.system_settings,
        value: "system_settings",
      },
    ],
    []
  );

  return (
    <div className="border-b border-slate-200/80">
      {/* Hàng 1: Thanh chuyển danh mục nhật ký */}
      <div className="px-4 pt-3 flex items-center gap-1 border-b border-slate-100 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleChangeTab("auth")}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "auth"
              ? "text-[#0A62D6]"
              : "text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span>Lịch sử đăng nhập</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${
              activeTab === "auth"
                ? "bg-[#EAF2FF] text-[#0A62D6]"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {kpiStats.totalAuthLogs}
          </span>
          {activeTab === "auth" && (
            <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#0A62D6]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleChangeTab("activity")}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "activity"
              ? "text-[#0A62D6]"
              : "text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span>Lịch sử thao tác dữ liệu</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${
              activeTab === "activity"
                ? "bg-[#EAF2FF] text-[#0A62D6]"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {kpiStats.totalActivityLogs}
          </span>
          {activeTab === "activity" && (
            <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#0A62D6]" />
          )}
        </button>
      </div>

      {/* Hàng 2: Bộ lọc & Ô tìm kiếm */}
      <div className="p-3 sm:p-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {activeTab === "auth" ? (
            <>
              <div className="w-full sm:w-52 shrink-0">
                <TeacherSelect
                  icon={<Filter className="w-3.5 h-3.5 text-slate-500" />}
                  size="sm"
                  options={authStatusOptions}
                  value={authStatusFilter}
                  onChange={(val) =>
                    handleAuthStatusFilterChange(val as AuthStatusFilter)
                  }
                />
              </div>

              <div className="w-full sm:w-48 shrink-0">
                <TeacherSelect
                  icon={<Users className="w-3.5 h-3.5 text-slate-500" />}
                  size="sm"
                  options={authRoleOptions}
                  value={authRoleFilter}
                  onChange={(val) =>
                    handleAuthRoleFilterChange(val as AuthRoleFilter)
                  }
                />
              </div>
            </>
          ) : (
            <div className="w-full sm:w-60 shrink-0">
              <TeacherSelect
                icon={<Filter className="w-3.5 h-3.5 text-slate-500" />}
                size="sm"
                options={activityScopeOptions}
                value={activityScopeFilter}
                onChange={(val) =>
                  handleActivityScopeFilterChange(val as ActivityScopeFilter)
                }
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
          <div className="relative flex-1 xl:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={
                activeTab === "auth"
                  ? "Tìm tên, SĐT, tài khoản, địa chỉ..."
                  : "Tìm người thực hiện, nội dung thao tác..."
              }
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 transition-all focus:outline-none focus:border-[#0A62D6] focus:ring-2 focus:ring-[#0A62D6]/20"
            />
            {searchQuery.length > 0 && (
              <Tooltip content="Xóa từ khóa tìm kiếm" side="top">
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </Tooltip>
            )}
          </div>

          <Tooltip content="Làm mới danh sách" side="top">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 w-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0A62D6] flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              aria-label="Làm mới"
            >
              <RotateCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#0A62D6]" : ""}`}
              />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
