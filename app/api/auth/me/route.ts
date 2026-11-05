import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatus, ApiResponse } from "@/types/api";
import { StudentSessionData } from "@/features/auth/types";
import { clearAuthCookie, getAuthSession } from "@/lib/auth/jwt";

interface UserMeDbRow {
  id: string;
  full_name: string;
  phone_zalo: string;
  avatar_url: string | null;
  current_coins: number | null;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  classes: { class_name: string } | null;
}

/**
 * GET /api/auth/me
 * Lấy thông tin chi tiết của người dùng hiện tại dựa trên session cookie (JWT)
 * Dùng để khôi phục State khi F5 trang hoặc khởi động ứng dụng
 */
export async function GET(
  _req: Request
): Promise<NextResponse<ApiResponse<StudentSessionData>>> {
  try {
    // 1. Lấy thông tin phiên từ JWT Cookie
    const session = await getAuthSession();

    if (!session || !session.userId) {
      return apiError(
        "Chưa đăng nhập hoặc phiên làm việc đã hết hạn.",
        HttpStatus.UNAUTHORIZED
      );
    }

    // 2. Truy vấn dữ liệu mới nhất từ Supabase
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        phone_zalo,
        avatar_url,
        current_coins,
        role,
        is_active,
        is_deleted,
        classes!users_class_id_fkey (
          class_name
        )
      `
      )
      .eq("id", session.userId)
      .maybeSingle();

    if (error) {
      console.error("Lỗi khi truy vấn thông tin người dùng /api/auth/me:", error.message);
      return apiError("Lỗi hệ thống khi tải thông tin người dùng.");
    }

    if (!data) {
      // Token hợp lệ nhưng tài khoản không còn tồn tại trong DB -> xóa cookie
      await clearAuthCookie();
      return apiError(
        "Tài khoản không tồn tại trên hệ thống.",
        HttpStatus.NOT_FOUND
      );
    }

    const userRow = data as unknown as UserMeDbRow;

    // 3. Kiểm tra trạng thái tài khoản
    if (!userRow.is_active || userRow.is_deleted) {
      await clearAuthCookie();
      return apiError(
        "Tài khoản này hiện đang bị tạm khóa hoặc đã bị xóa.",
        HttpStatus.FORBIDDEN
      );
    }

    // 4. Định dạng dữ liệu trả về cho client store
    const sessionData: StudentSessionData = {
      id: userRow.id,
      full_name: userRow.full_name,
      phone_zalo: userRow.phone_zalo,
      avatar_url: userRow.avatar_url || "/avatar.jpg",
      current_coins: userRow.current_coins ?? 0,
      role: userRow.role,
      class_name: userRow.classes?.class_name ?? null,
    };

    return apiSuccess<StudentSessionData>(
      sessionData,
      "Tải thông tin người dùng thành công."
    );
  } catch (err: unknown) {
    unstable_rethrow(err);
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại GET /api/auth/me:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi xác thực phiên làm việc.");
  }
}
