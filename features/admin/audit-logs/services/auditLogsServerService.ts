import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { supabase } from "@/lib/supabase/db";
import { formatDate } from "@/lib/date";
import { AuthStatus } from "@/constants/auth";
import {
  AUDIT_LOGS_DEFAULT_PAGE,
  AUDIT_LOGS_DEFAULT_PAGE_SIZE,
  AUTH_FAILURE_REASON_LABELS,
  EMPTY_AUDIT_LOGS_PAYLOAD,
  SCOPE_TO_ENTITY_TYPES,
  mapEntityTypeToScope,
} from "../constants";
import {
  ActivityLogItem,
  AuditLogsKpiStats,
  AuditLogsPagePayload,
  AuditLogsQueryParams,
  AuthLogAction,
  AuthLogItem,
  LogDeviceType,
  LogUserRole,
} from "../types";

interface AuthLogDbRow {
  id: string;
  user_id: string | null;
  phone_zalo: string;
  role: string;
  auth_action: string;
  status: string;
  failure_reason: string | null;
  ip_address: string;
  location: string | null;
  device_type: string | null;
  created_at: string | null;
}

interface AuditLogDbRow {
  id: string;
  user_name_snapshot: string;
  role: string;
  action: string;
  entity_type: string;
  description: string;
  created_at: string | null;
}

interface UserNameRow {
  id: string;
  full_name: string;
}

function normalizeRole(role: string): LogUserRole {
  const lowered = role.trim().toLowerCase();
  if (
    lowered === "student" ||
    lowered === "teacher" ||
    lowered === "super_teacher" ||
    lowered === "admin"
  ) {
    return lowered;
  }
  return "student";
}

function normalizeAuthAction(action: string): AuthLogAction {
  const lowered = action.trim().toLowerCase();
  if (lowered === "logout") return "logout";
  if (lowered === "register") return "register";
  return "login";
}

function normalizeDeviceType(device: string | null): LogDeviceType {
  const lowered = (device || "").trim().toLowerCase();
  if (lowered === "mobile" || lowered === "tablet") {
    return lowered;
  }
  return "desktop";
}

function formatRelativeTimeSafe(isoString: string | null): string {
  if (!isoString) return "Vừa xong";
  try {
    return formatDistanceToNow(new Date(isoString), {
      addSuffix: true,
      locale: vi,
    });
  } catch {
    return "";
  }
}

function sanitizeIlikeKeyword(raw: string): string {
  return raw.replace(/[%_,()]/g, " ").trim();
}

/**
 * Lấy 4 chỉ số KPI tổng quan bằng truy vấn đếm siêu nhẹ (head: true)
 */
async function fetchAuditLogsKpiStats(): Promise<AuditLogsKpiStats> {
  const [totalAuthRes, successAuthRes, failedAuthRes, totalActivityRes] =
    await Promise.all([
      supabase.from("auth_logs").select("id", { count: "exact", head: true }),
      supabase
        .from("auth_logs")
        .select("id", { count: "exact", head: true })
        .eq("status", AuthStatus.SUCCESS),
      supabase
        .from("auth_logs")
        .select("id", { count: "exact", head: true })
        .eq("status", AuthStatus.FAILED),
      supabase.from("audit_logs").select("id", { count: "exact", head: true }),
    ]);

  return {
    totalAuthLogs: totalAuthRes.count ?? 0,
    successAuthCount: successAuthRes.count ?? 0,
    failedAuthCount: failedAuthRes.count ?? 0,
    totalActivityLogs: totalActivityRes.count ?? 0,
  };
}

/**
 * Truy vấn trang dữ liệu Nhật ký an ninh trực tiếp trên Server (phân trang DB .range)
 * - Dùng trực tiếp trong Server Component (0ms HTTP round-trip) và GET /api/admin/audit-logs
 */
export async function getAdminAuditLogsServer(
  params: Partial<AuditLogsQueryParams> = {}
): Promise<AuditLogsPagePayload> {
  const tab = params.tab === "activity" ? "activity" : "auth";
  const page = Math.max(1, params.page ?? AUDIT_LOGS_DEFAULT_PAGE);
  const pageSize = Math.min(
    100,
    Math.max(5, params.pageSize ?? AUDIT_LOGS_DEFAULT_PAGE_SIZE)
  );
  const search = sanitizeIlikeKeyword(params.search ?? "");
  const statusFilter = params.status ?? "all";
  const roleFilter = params.role ?? "all";
  const scopeFilter = params.scope ?? "all";

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    if (tab === "auth") {
      // Nếu có từ khóa tìm kiếm, tìm thêm user_id khớp tên để hỗ trợ tìm theo họ tên học sinh/giáo viên
      let matchingUserIds: string[] = [];
      if (search) {
        const { data: matchedUsers } = await supabase
          .from("users")
          .select("id")
          .ilike("full_name", `%${search}%`)
          .limit(50);

        matchingUserIds = (matchedUsers ?? []).map(
          (u: { id: string }) => u.id
        );
      }

      let authQuery = supabase
        .from("auth_logs")
        .select(
          "id, user_id, phone_zalo, role, auth_action, status, failure_reason, ip_address, location, device_type, created_at",
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      if (statusFilter === "success") {
        authQuery = authQuery.eq("status", AuthStatus.SUCCESS);
      } else if (statusFilter === "failed") {
        authQuery = authQuery.eq("status", AuthStatus.FAILED);
      }

      if (roleFilter !== "all") {
        authQuery = authQuery.eq("role", roleFilter);
      }

      if (search) {
        const orConditions = [
          `phone_zalo.ilike.%${search}%`,
          `ip_address.ilike.%${search}%`,
          `location.ilike.%${search}%`,
        ];
        if (matchingUserIds.length > 0) {
          orConditions.push(`user_id.in.(${matchingUserIds.join(",")})`);
        }
        authQuery = authQuery.or(orConditions.join(","));
      }

      const [kpiStats, authRes] = await Promise.all([
        fetchAuditLogsKpiStats(),
        authQuery.range(from, to),
      ]);

      if (authRes.error) {
        console.error(
          "[AuditLogsServer] Lỗi truy vấn auth_logs:",
          authRes.error.message
        );
        return { ...EMPTY_AUDIT_LOGS_PAYLOAD, tab, kpiStats };
      }

      const rows = (authRes.data ?? []) as AuthLogDbRow[];
      const totalItems = authRes.count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

      // Batch lookup tên người dùng cho đúng trang hiện tại (0 N+1 query)
      const uniqueUserIds = Array.from(
        new Set(
          rows
            .map((r) => r.user_id)
            .filter((id): id is string => Boolean(id))
        )
      );

      const userNameMap = new Map<string, string>();
      if (uniqueUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", uniqueUserIds);

        for (const u of (usersData ?? []) as UserNameRow[]) {
          userNameMap.set(u.id, u.full_name);
        }
      }

      const authLogs: AuthLogItem[] = rows.map((row) => {
        const mappedReason = row.failure_reason
          ? AUTH_FAILURE_REASON_LABELS[row.failure_reason] ?? row.failure_reason
          : undefined;

        return {
          id: row.id,
          fullName:
            (row.user_id ? userNameMap.get(row.user_id) : undefined) ||
            "Tài khoản chưa xác định",
          accountIdentifier: row.phone_zalo || "-",
          role: normalizeRole(row.role),
          action: normalizeAuthAction(row.auth_action),
          status:
            row.status.toUpperCase() === AuthStatus.SUCCESS
              ? "success"
              : "failed",
          reasonText: mappedReason,
          ipAddress: row.ip_address || "-",
          location: row.location || "Không xác định",
          deviceType: normalizeDeviceType(row.device_type),
          timestamp: formatDate(row.created_at, "HH:mm dd/MM/yyyy"),
          relativeTime: formatRelativeTimeSafe(row.created_at),
        };
      });

      return {
        tab: "auth",
        authLogs,
        activityLogs: [],
        kpiStats,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
      };
    }

    // TAB 2: Lịch sử thao tác dữ liệu (audit_logs)
    let activityQuery = supabase
      .from("audit_logs")
      .select(
        "id, user_name_snapshot, role, action, entity_type, description, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (scopeFilter !== "all" && scopeFilter !== "other") {
      activityQuery = activityQuery.in("entity_type", [
        ...SCOPE_TO_ENTITY_TYPES[scopeFilter],
      ]);
    } else if (scopeFilter === "other") {
      const knownEntities = [
        ...SCOPE_TO_ENTITY_TYPES.account_pin,
        ...SCOPE_TO_ENTITY_TYPES.class_assignment,
        ...SCOPE_TO_ENTITY_TYPES.wheel_rewards,
        ...SCOPE_TO_ENTITY_TYPES.system_settings,
      ];
      activityQuery = activityQuery.not(
        "entity_type",
        "in",
        `(${knownEntities.join(",")})`
      );
    }

    if (search) {
      activityQuery = activityQuery.or(
        `user_name_snapshot.ilike.%${search}%,action.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const [kpiStats, activityRes] = await Promise.all([
      fetchAuditLogsKpiStats(),
      activityQuery.range(from, to),
    ]);

    if (activityRes.error) {
      console.error(
        "[AuditLogsServer] Lỗi truy vấn audit_logs:",
        activityRes.error.message
      );
      return { ...EMPTY_AUDIT_LOGS_PAYLOAD, tab, kpiStats };
    }

    const rows = (activityRes.data ?? []) as AuditLogDbRow[];
    const totalItems = activityRes.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const activityLogs: ActivityLogItem[] = rows.map((row) => ({
      id: row.id,
      actorName: row.user_name_snapshot || "Quản trị viên",
      actorRole: normalizeRole(row.role),
      actionLabel: row.action,
      scope: mapEntityTypeToScope(row.entity_type),
      description: row.description,
      timestamp: formatDate(row.created_at, "HH:mm dd/MM/yyyy"),
      relativeTime: formatRelativeTimeSafe(row.created_at),
    }));

    return {
      tab: "activity",
      authLogs: [],
      activityLogs,
      kpiStats,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "[AuditLogsServer] Lỗi ngoại lệ getAdminAuditLogsServer:",
      error.message
    );
    return { ...EMPTY_AUDIT_LOGS_PAYLOAD, tab };
  }
}
