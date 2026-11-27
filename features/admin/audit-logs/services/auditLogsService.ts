import { http } from "@/lib/http/httpClient";
import { AppRoutes } from "@/constants/routes";
import { ApiResponse } from "@/types/api";
import { AuditLogsPagePayload, AuditLogsQueryParams } from "../types";

/**
 * Client Service gọi API GET /api/admin/audit-logs có phân trang trên Server
 */
export const auditLogsService = {
  async getAuditLogs(
    params: AuditLogsQueryParams
  ): Promise<AuditLogsPagePayload> {
    const query = new URLSearchParams({
      tab: params.tab,
      page: String(params.page),
      pageSize: String(params.pageSize),
    });

    if (params.search && params.search.trim()) {
      query.set("search", params.search.trim());
    }
    if (params.status && params.status !== "all") {
      query.set("status", params.status);
    }
    if (params.role && params.role !== "all") {
      query.set("role", params.role);
    }
    if (params.scope && params.scope !== "all") {
      query.set("scope", params.scope);
    }

    const res = await http.get<ApiResponse<AuditLogsPagePayload>>(
      `${AppRoutes.API.ADMIN.AUDIT_LOGS}?${query.toString()}`
    );

    if (!res.success || !res.data) {
      throw new Error(res.message || "Không thể tải dữ liệu nhật ký an ninh.");
    }

    return res.data;
  },
};
