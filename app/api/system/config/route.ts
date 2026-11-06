import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatus, ApiResponse } from "@/types/api";
import { getAuthSession } from "@/lib/auth/jwt";
import { SystemPublicConfigs } from "@/types/systemConfig";
import { getPublicSystemConfigs } from "@/lib/system/serverConfig";

/**
 * GET /api/system/config
 * Lấy toàn bộ cấu hình hệ thống (Public Configs) dành cho Client
 * Yêu cầu: Đã đăng nhập (có cookie xác thực hợp lệ)
 * Hỗ trợ Server In-Memory Cache và HTTP Caching (Cache-Control) tối ưu hiệu năng
 */
export async function GET(
  _req: Request
): Promise<NextResponse<ApiResponse<SystemPublicConfigs>>> {
  try {
    // 1. Kiểm tra xác thực (Chỉ cho phép người dùng đã đăng nhập gọi)
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return apiError(
        "Chưa đăng nhập hoặc phiên làm việc đã hết hạn.",
        HttpStatus.UNAUTHORIZED
      );
    }

    // 2. Lấy cấu hình công khai từ Server In-Memory Cache (0ms nếu đã có trong RAM)
    const configs = await getPublicSystemConfigs();

    // 3. Trả về kết quả kèm Cache-Control header (Cache Client 60s, stale-while-revalidate 5 phút)
    const response = apiSuccess<SystemPublicConfigs>(
      configs,
      "Tải cấu hình hệ thống thành công."
    );

    response.headers.set(
      "Cache-Control",
      "private, max-age=60, stale-while-revalidate=300"
    );

    return response;
  } catch (err: unknown) {
    unstable_rethrow(err);
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại GET /api/system/config:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi đọc cấu hình hệ thống.");
  }
}
