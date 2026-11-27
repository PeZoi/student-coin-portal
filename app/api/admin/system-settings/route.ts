import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeRequest } from "@/lib/auth/guard";
import { HttpStatus, UserRole } from "@/constants";
import { systemSettingsUpdateSchema } from "@/features/admin/system-settings/schemas/systemSettingsSchema";
import {
  getAdminSystemSettingsServer,
  updateAdminSystemSettingsServer,
} from "@/features/admin/system-settings/services/systemSettingsServerService";

const ADMIN_FORBIDDEN_MSG =
  "Chỉ quản trị viên mới có quyền truy cập và thay đổi cài đặt hệ thống.";

/**
 * GET /api/admin/system-settings
 * Lấy toàn bộ 5 nhóm cấu hình hệ thống cho trang quản trị
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeRequest(
      req,
      [UserRole.ADMIN],
      ADMIN_FORBIDDEN_MSG
    );
    if (!auth.success) {
      return auth.response;
    }

    const payload = await getAdminSystemSettingsServer();
    return apiSuccess(payload, "Tải cài đặt hệ thống thành công.");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại GET /api/admin/system-settings:",
      error.message
    );
    return apiError("Đã xảy ra lỗi máy chủ khi tải cài đặt hệ thống.");
  }
}

/**
 * PUT /api/admin/system-settings
 * Validate bằng Zod và cập nhật đồng bộ toàn bộ 5 nhóm cấu hình vào `system_settings`
 */
export async function PUT(req: Request) {
  try {
    const auth = await authorizeRequest(
      req,
      [UserRole.ADMIN],
      ADMIN_FORBIDDEN_MSG
    );
    if (!auth.success) {
      return auth.response;
    }

    const rawBody: unknown = await req.json();
    const parsed = systemSettingsUpdateSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return apiError(
        firstIssue?.message || "Dữ liệu cài đặt không hợp lệ.",
        HttpStatus.BAD_REQUEST
      );
    }

    const updatedPayload = await updateAdminSystemSettingsServer(
      parsed.data,
      auth.session.userId
    );

    return apiSuccess(updatedPayload, "Đã lưu cài đặt hệ thống thành công.");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại PUT /api/admin/system-settings:",
      error.message
    );
    return apiError(
      error.message || "Đã xảy ra lỗi máy chủ khi lưu cài đặt hệ thống."
    );
  }
}
