import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatus, ApiResponse } from "@/types/api";
import { studentPinVerificationSchema } from "@/features/auth/schemas/authSchemas";
import { StudentLoginResponseData, StudentSessionData } from "@/features/auth/types";
import { setAuthCookie, signAuthToken } from "@/lib/auth/jwt";
import { getAuthSecurityConfig } from "@/lib/system/serverConfig";

interface UserLoginDbRow {
  id: string;
  full_name: string;
  phone_zalo: string;
  pin_number: string | null;
  avatar_url: string | null;
  current_coins: number | null;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  failed_login_attempts: number | null;
  locked_until: string | null;
  classes: { class_name: string } | null;
}

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<StudentLoginResponseData>>> {
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

    // 1. Kiểm tra tính hợp lệ của SĐT và mã PIN (thống nhất chuẩn phone_zalo & pin_number)
    const validationResult = studentPinVerificationSchema.safeParse(body);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      const errorMessage = firstIssue
        ? firstIssue.message
        : "Thông tin đăng nhập không hợp lệ.";
      return apiError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const { phone_zalo, pin_number } = validationResult.data;
    const normalizedPhone = phone_zalo.trim();
    const normalizedPin = pin_number.trim();

    // 2. Lấy thông tin tài khoản học sinh và mã PIN lưu trong DB
    let queryResult = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        phone_zalo,
        pin_number,
        avatar_url,
        current_coins,
        role,
        is_active,
        is_deleted,
        failed_login_attempts,
        locked_until,
        classes!users_class_id_fkey (
          class_name
        )
      `
      )
      .eq("phone_zalo", normalizedPhone)
      .eq("role", "student")
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
          pin_number,
          avatar_url,
          current_coins,
          role,
          is_active,
          is_deleted,
          failed_login_attempts,
          locked_until,
          classes!users_class_id_fkey (
            class_name
          )
        `
        )
        .eq("phone_zalo", normalizedPhone)
        .eq("role", "student")
        .maybeSingle();
    }

    const { data, error } = queryResult;

    if (error) {
      console.error("Lỗi khi xác thực đăng nhập:", error.message);
      return apiError("Lỗi hệ thống khi đăng nhập. Vui lòng thử lại sau.");
    }

    if (!data) {
      return apiError(
        "Không tìm thấy tài khoản học sinh với số điện thoại này.",
        HttpStatus.NOT_FOUND
      );
    }

    const userRow = data as unknown as UserLoginDbRow;

    // 3. Kiểm tra trạng thái tài khoản
    if (!userRow.is_active || userRow.is_deleted) {
      return apiError(
        "Tài khoản của bé hiện đang tạm đóng. Bé hãy liên hệ cô giáo hoặc phụ huynh để mở lại nhé!",
        HttpStatus.FORBIDDEN
      );
    }

    // 4. Đọc cấu hình bảo mật từ Server In-Memory Cache (0ms, không tốn query Supabase)
    const { max_failed_attempts: maxFailedAttempts, lockout_minutes: lockoutMinutes } =
      await getAuthSecurityConfig();

    // 5. Kiểm tra xem tài khoản có đang bị tạm khóa không
    const now = new Date();
    if (userRow.locked_until) {
      const lockUntilDate = new Date(userRow.locked_until);
      if (lockUntilDate > now) {
        const diffMs = lockUntilDate.getTime() - now.getTime();
        const remainingMinutes = Math.max(1, Math.ceil(diffMs / (60 * 1000)));
        return apiError(
          `Tài khoản của con đang bị tạm khóa do nhập sai mã PIN nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút nữa (hoặc nhờ cô giáo mở khóa nhé)!`,
          HttpStatus.UNAUTHORIZED,
          {
            is_locked: true,
            locked_until: userRow.locked_until,
            remaining_minutes: remainingMinutes,
            remaining_attempts: 0,
          }
        );
      }
    }

    // 6. Đối soát mã PIN
    if (userRow.pin_number !== normalizedPin) {
      const newFailed = (userRow.failed_login_attempts ?? 0) + 1;

      // Nếu nhập sai đạt ngưỡng giới hạn -> Tạm khóa tài khoản
      if (newFailed >= maxFailedAttempts) {
        const lockedUntil = new Date(
          Date.now() + lockoutMinutes * 60 * 1000
        ).toISOString();

        await supabase
          .from("users")
          .update({
            failed_login_attempts: newFailed,
            locked_until: lockedUntil,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userRow.id);

        return apiError(
          `Con đã nhập sai mã PIN ${maxFailedAttempts} lần! Tài khoản của con tạm thời bị khóa trong ${lockoutMinutes} phút. Con hãy nhờ cô giáo hoặc bố mẹ mở khóa nhé!`,
          HttpStatus.UNAUTHORIZED,
          {
            is_locked: true,
            locked_until: lockedUntil,
            remaining_minutes: lockoutMinutes,
            remaining_attempts: 0,
          }
        );
      }

      // Chưa đạt ngưỡng -> Ghi nhận số lần sai và báo số lần còn lại
      await supabase
        .from("users")
        .update({
          failed_login_attempts: newFailed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userRow.id);

      const remainingAttempts = maxFailedAttempts - newFailed;
      return apiError(
        "Mã PIN chưa chính xác rồi con ơi!",
        HttpStatus.UNAUTHORIZED,
        {
          is_locked: false,
          remaining_attempts: remainingAttempts,
          failed_attempts: newFailed,
        }
      );
    }

    // 7. Nhập ĐÚNG PIN -> Reset số lần nhập sai và trạng thái khóa nếu có
    if (
      (userRow.failed_login_attempts && userRow.failed_login_attempts > 0) ||
      userRow.locked_until
    ) {
      await supabase
        .from("users")
        .update({
          failed_login_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userRow.id);
    }

    // 5. Tạo JWT Token (chứa userId, phone_zalo và role) và lưu vào httpOnly Cookie
    const token = await signAuthToken({
      userId: userRow.id,
      phone_zalo: userRow.phone_zalo,
      role: userRow.role,
    });

    await setAuthCookie(token);

    // 6. Trả về phiên đăng nhập thành công kèm token
    const sessionData: StudentSessionData = {
      id: userRow.id,
      full_name: userRow.full_name,
      phone_zalo: userRow.phone_zalo,
      avatar_url: userRow.avatar_url || "/avatar.jpg",
      current_coins: userRow.current_coins ?? 0,
      role: userRow.role,
      class_name: userRow.classes?.class_name ?? null,
      token,
    };

    return apiSuccess<StudentSessionData>(
      sessionData,
      `Chào mừng con ${userRow.full_name} đã vào lớp học! 🎉`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại POST /api/auth/login:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ trong quá trình xác thực mã PIN.");
  }
}

