import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeRequest } from "@/lib/auth/guard";
import { HttpStatus, UserRole } from "@/constants";
import { ApiResponse } from "@/types/api";
import { auditLogsQuerySchema } from "@/features/admin/audit-logs/schemas/auditLogsSchema";
import { getAdminAuditLogsServer } from "@/features/admin/audit-logs/services/auditLogsServerService";
import { AuditLogsPagePayload } from "@/features/admin/audit-logs/types";

/**
 * GET /api/admin/audit-logs
 * Lấy danh sách Nhật ký an ninh & thao tác dữ liệu có phân trang trên Server
 * Yêu cầu: Chỉ dành riêng cho Quản trị viên (ADMIN)
 */
export async function GET(
  req: Request
): Promise<NextResponse<ApiResponse<AuditLogsPagePayload>>> {
  try {
    const auth = await authorizeRequest(
      req,
      [UserRole.ADMIN],
      "Chỉ quản trị viên mới có quyền truy cập nhật ký an ninh."
    );
    if (!auth.success) {
      return auth.response as NextResponse<ApiResponse<AuditLogsPagePayload>>;
    }

    const { searchParams } = new URL(req.url);
    const parsed = auditLogsQuerySchema.safeParse({
      tab: searchParams.get("tab") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      scope: searchParams.get("scope") ?? undefined,
    });

    if (!parsed.success) {
      return apiError(
        "Tham số truy vấn nhật ký không hợp lệ.",
        HttpStatus.BAD_REQUEST
      );
    }

    const payload = await getAdminAuditLogsServer(parsed.data);
    return apiSuccess<AuditLogsPagePayload>(
      payload,
      "Tải nhật ký an ninh thành công."
    );
  } catch (err: unknown) {
    unstable_rethrow(err);
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại GET /api/admin/audit-logs:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải nhật ký an ninh.");
  }
}
