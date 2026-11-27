/**
 * ==============================================================================
 * TYPES: ADMIN SECURITY & ACTIVITY LOGS
 * ==============================================================================
 */

export type AuditLogsTab = "auth" | "activity";

export type LogUserRole = "student" | "teacher" | "super_teacher" | "admin";

export type AuthLogAction = "login" | "logout" | "register";

export type AuthLogStatus = "success" | "failed";

export type LogDeviceType = "mobile" | "tablet" | "desktop";

export interface AuthLogItem {
  id: string;
  fullName: string;
  accountIdentifier: string;
  role: LogUserRole;
  action: AuthLogAction;
  status: AuthLogStatus;
  reasonText?: string;
  ipAddress: string;
  location: string;
  deviceType: LogDeviceType;
  timestamp: string;
  relativeTime: string;
}

export type ActivityScope =
  | "account_pin"
  | "class_assignment"
  | "wheel_rewards"
  | "system_settings"
  | "other";

export interface ActivityLogItem {
  id: string;
  actorName: string;
  actorRole: LogUserRole;
  actionLabel: string;
  scope: ActivityScope;
  description: string;
  timestamp: string;
  relativeTime: string;
}

export type AuthStatusFilter = "all" | AuthLogStatus;
export type AuthRoleFilter = "all" | LogUserRole;
export type ActivityScopeFilter = "all" | ActivityScope;

export interface AuditLogsKpiStats {
  totalAuthLogs: number;
  successAuthCount: number;
  failedAuthCount: number;
  totalActivityLogs: number;
}

export interface AuditLogsPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AuditLogsQueryParams {
  tab: AuditLogsTab;
  page: number;
  pageSize: number;
  search?: string;
  status?: AuthStatusFilter;
  role?: AuthRoleFilter;
  scope?: ActivityScopeFilter;
}

export interface AuditLogsPagePayload {
  tab: AuditLogsTab;
  authLogs: AuthLogItem[];
  activityLogs: ActivityLogItem[];
  kpiStats: AuditLogsKpiStats;
  pagination: AuditLogsPaginationMeta;
}
