import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatus, ApiResponse } from "@/types/api";
import { studentLoginSchema } from "@/features/auth/schemas/authSchemas";
import { StudentLookupData } from "@/features/auth/types";
import { getAuthSecurityConfig } from "@/lib/system/serverConfig";

interface UserLookupDbRow {
  id: string;
  full_name: string;
  phone_zalo: string;
  avatar_url: string | null;
  current_coins: number | null;
  failed_login_attempts: number | null;
  locked_until: string | null;
  classes: { class_name: string } | null;
}

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<StudentLookupData>>> {
  try {
    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      return apiError(
        "Dữ liệu gửi lên không đúng định dạng JSON.",
        HttpStatus.BAD_REQUEST
      );
    }

    // 1. Kiểm tra tính hợp lệ của Số điện thoại (thống nhất dùng phone_zalo)
    const validationResult = studentLoginSchema.safeParse(body);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      const errorMessage = firstIssue
        ? firstIssue.message
        : "Số điện thoại không hợp lệ.";
      return apiError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const { phone_zalo } = validationResult.data;
    const normalizedPhone = phone_zalo.trim();

    // 2. Tra cứu học sinh trong bảng `users` kèm thông tin lớp học từ bảng `classes`
    let queryResult = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        phone_zalo,
        avatar_url,
        current_coins,
        failed_login_attempts,
        locked_until,
        classes!users_class_id_fkey (
          class_name
        )
      `
      )
      .eq("phone_zalo", normalizedPhone)
      .eq("role", "student")
      .eq("is_active", true)
      .eq("is_deleted", false)
      .maybeSingle();

    // Tự động thử lại 1 lần nếu mạng chập chờn (DNS timeout hoặc fetch failed)
    if (queryResult.error && (queryResult.error.message.includes("fetch failed") || queryResult.error.message.includes("ENOTFOUND"))) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      queryResult = await supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          phone_zalo,
          avatar_url,
          current_coins,
          failed_login_attempts,
          locked_until,
          classes!users_class_id_fkey (
            class_name
          )
        `
        )
        .eq("phone_zalo", normalizedPhone)
        .eq("role", "student")
        .eq("is_active", true)
        .eq("is_deleted", false)
        .maybeSingle();
    }

    const { data, error } = queryResult;

    if (error) {
      console.error("Lỗi khi tra cứu học sinh theo SĐT:", error.message);
      return apiError("Lỗi hệ thống khi tìm kiếm tài khoản. Vui lòng thử lại sau.");
    }

    if (!data) {
      return apiError(
        "Không tìm thấy tài khoản học sinh với số điện thoại này. Bé hoặc bố mẹ kiểm tra lại nhé!",
        HttpStatus.NOT_FOUND
      );
    }

    const userRow = data as unknown as UserLookupDbRow;

    // 3. Đọc cấu hình bảo mật từ Server In-Memory Cache (0ms, không tốn query Supabase)
    const { max_failed_attempts: maxFailedAttempts } = await getAuthSecurityConfig();

    // 4. Kiểm tra trạng thái khóa tài khoản hiện tại
    let isLocked = false;
    let remainingMinutes = 0;
    const now = new Date();

    if (userRow.locked_until) {
      const lockUntilDate = new Date(userRow.locked_until);
      if (lockUntilDate > now) {
        isLocked = true;
        const diffMs = lockUntilDate.getTime() - now.getTime();
        remainingMinutes = Math.max(1, Math.ceil(diffMs / (60 * 1000)));
      }
    }

    const remainingAttempts = isLocked
      ? 0
      : Math.max(0, maxFailedAttempts - (userRow.failed_login_attempts ?? 0));

    const studentInfo: StudentLookupData = {
      id: userRow.id,
      full_name: userRow.full_name,
      phone_zalo: userRow.phone_zalo,
      avatar_url: userRow.avatar_url || "/avatar.jpg",
      current_coins: userRow.current_coins ?? 0,
      class_name: userRow.classes?.class_name ?? null,
      is_locked: isLocked,
      locked_until: userRow.locked_until,
      remaining_minutes: remainingMinutes,
      remaining_attempts: remainingAttempts,
    };

    return apiSuccess<StudentLookupData>(
      studentInfo,
      "Đã tìm thấy thông tin của bé!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại POST /api/auth/lookup:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ trong quá trình tra cứu thông tin.");
  }
}

