import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeRequest } from "@/lib/auth/guard";
import { HttpStatus, UserRole } from "@/constants";
import { testAiConnectionSchema } from "@/features/admin/system-settings/schemas/systemSettingsSchema";
import { testAiConnectionServer } from "@/features/admin/system-settings/services/systemSettingsServerService";

/**
 * POST /api/admin/system-settings/test-ai
 * Kiểm tra kết nối thực tế tới dịch vụ AI đã cấu hình
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeRequest(
      req,
      [UserRole.ADMIN],
      "Chỉ quản trị viên mới có quyền kiểm tra kết nối máy chủ AI."
    );
    if (!auth.success) {
      return auth.response;
    }

    const rawBody: unknown = await req.json();
    const parsed = testAiConnectionSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return apiError(
        firstIssue?.message || "Thông tin kết nối AI không hợp lệ.",
        HttpStatus.BAD_REQUEST
      );
    }

    const result = await testAiConnectionServer(parsed.data);
    return apiSuccess(result, result.message);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi tại POST /api/admin/system-settings/test-ai:",
      error.message
    );
    return apiError(
      error.message || "Không thể kết nối tới máy chủ AI.",
      HttpStatus.BAD_REQUEST
    );
  }
}
