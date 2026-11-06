import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatus, ApiResponse } from "@/types/api";
import { getAuthSession } from "@/lib/auth/jwt";
import { SystemPublicConfigs } from "@/types/systemConfig";

interface SystemSettingRow {
  key: string;
  value: unknown;
}

/**
 * GET /api/system/config
 * Lấy toàn bộ cấu hình hệ thống (Public Configs) dành cho Client
 * Yêu cầu: Đã đăng nhập (có cookie xác thực hợp lệ)
 * Hỗ trợ HTTP Caching (Cache-Control) tối ưu hiệu năng
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

    // 2. Truy vấn danh sách cấu hình công khai từ bảng system_settings
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .eq("is_public", true);

    if (error) {
      console.error("Lỗi khi tải cấu hình hệ thống /api/system/config:", error.message);
      return apiError("Không thể tải cấu hình hệ thống lúc này.");
    }

    // 3. Gom nhóm dữ liệu dạng Key-Value Object
    const configMap: Record<string, unknown> = {};
    if (data) {
      for (const row of data as SystemSettingRow[]) {
        configMap[row.key] = row.value;
      }
    }

    const configs = configMap as unknown as SystemPublicConfigs;

    // 4. Trả về kết quả kèm Cache-Control header (Cache Client 60s, stale-while-revalidate 5 phút)
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
