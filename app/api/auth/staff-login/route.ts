import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { ApiResponse } from "@/types/api";
import {
  HttpStatus,
  AuthAction,
  AuthStatus,
  AuthFailureReason,
  type AuthFailureReasonType,
  UserRole,
  type UserRoleType,
  AppRoutes,
} from "@/constants";
import { teacherLoginSchema } from "@/features/auth/schemas/authSchemas";
import { StudentSessionData, AuthLockInfo } from "@/features/auth/types";
import { setAuthCookie, signAuthToken } from "@/lib/auth/jwt";
import { getAuthSecurityConfig } from "@/lib/system/serverConfig";
import { logAuthEvent } from "@/lib/auth/authLogger";

interface UserStaffLoginDbRow {
  id: string;
  full_name: string;
  username: string | null;
  phone_zalo: string | null;
  password: string | null;
  avatar_url: string | null;
  current_coins: number | null;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  failed_login_attempts: number | null;
  locked_until: string | null;
}

export type StaffLoginResponseData =
  | {
      user: StudentSessionData;
      redirect_url: string;
    }
  | AuthLockInfo;

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<StaffLoginResponseData>>> {
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

    // 1. Kiểm tra tính hợp lệ của username và password
    const validationResult = teacherLoginSchema.safeParse(body);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      const errorMessage = firstIssue
        ? firstIssue.message
        : "Thông tin đăng nhập không hợp lệ.";
      return apiError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const { username, password } = validationResult.data;
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    // Helper DRY ghi log lỗi đăng nhập
    const logFail = (
      reason: AuthFailureReasonType,
      user?: UserStaffLoginDbRow | null
    ) => {
      void logAuthEvent({
        userId: user?.id || null,
        phoneZalo: user?.phone_zalo || user?.username || normalizedUsername,
        role: (user?.role as UserRoleType) || "teacher",
        authAction: AuthAction.LOGIN,
        status: AuthStatus.FAILED,
        failureReason: reason,
        req,
      });
    };

    // 2. Lấy thông tin tài khoản giáo viên/admin trong DB
    let queryResult = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        username,
        phone_zalo,
        password,
        avatar_url,
        current_coins,
        role,
        is_active,
        is_deleted,
        failed_login_attempts,
        locked_until
      `
      )
      .eq("username", normalizedUsername)
      .in("role", [UserRole.TEACHER, UserRole.SUPER_TEACHER, UserRole.ADMIN])
      .maybeSingle();

    // Tự động thử lại 1 lần nếu mạng chập chờn
    if (
      queryResult.error &&
      (queryResult.error.message.includes("fetch failed") ||
        queryResult.error.message.includes("ENOTFOUND"))
    ) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      queryResult = await supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          username,
          phone_zalo,
          password,
          avatar_url,
          current_coins,
          role,
          is_active,
          is_deleted,
          failed_login_attempts,
          locked_until
        `
        )
        .eq("username", normalizedUsername)
        .in("role", [UserRole.TEACHER, UserRole.SUPER_TEACHER, UserRole.ADMIN])
        .maybeSingle();
    }

    const { data, error } = queryResult;

    if (error) {
      console.error("Lỗi khi xác thực đăng nhập giáo viên/admin:", error.message);
      return apiError("Lỗi hệ thống khi đăng nhập. Vui lòng thử lại sau.");
    }

    if (!data) {
      logFail(AuthFailureReason.USER_NOT_FOUND);
      return apiError(
        "Tên đăng nhập hoặc mật khẩu không chính xác.",
        HttpStatus.UNAUTHORIZED
      );
    }

    const userRow = data as unknown as UserStaffLoginDbRow;

    // 3. Kiểm tra trạng thái tài khoản
    if (!userRow.is_active || userRow.is_deleted) {
      logFail(AuthFailureReason.ACCOUNT_INACTIVE, userRow);
      return apiError(
        "Tài khoản quản trị này hiện đang bị tạm khóa hoặc đã bị xóa.",
        HttpStatus.FORBIDDEN
      );
    }

    // 4. Đọc cấu hình bảo mật từ Server In-Memory Cache
    const { max_failed_attempts: maxFailedAttempts, lockout_minutes: lockoutMinutes } =
      await getAuthSecurityConfig();

    // 5. Kiểm tra xem tài khoản có đang bị tạm khóa không
    const now = new Date();
    if (userRow.locked_until) {
      const lockUntilDate = new Date(userRow.locked_until);
      if (lockUntilDate > now) {
        const diffMs = lockUntilDate.getTime() - now.getTime();
        const remainingMinutes = Math.max(1, Math.ceil(diffMs / (60 * 1000)));
        logFail(AuthFailureReason.ACCOUNT_LOCKED, userRow);
        return apiError<AuthLockInfo>(
          `Tài khoản đang bị tạm khóa do nhập sai mật khẩu nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút!`,
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

    // 6. Đối soát mật khẩu
    if (userRow.password !== normalizedPassword) {
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

        logFail(AuthFailureReason.ACCOUNT_LOCKED, userRow);

        return apiError<AuthLockInfo>(
          `Bạn đã nhập sai mật khẩu ${maxFailedAttempts} lần! Tài khoản tạm thời bị khóa trong ${lockoutMinutes} phút.`,
          HttpStatus.UNAUTHORIZED,
          {
            is_locked: true,
            locked_until: lockedUntil,
            remaining_minutes: lockoutMinutes,
            remaining_attempts: 0,
          }
        );
      }

      // Chưa đạt ngưỡng -> Ghi nhận số lần sai
      await supabase
        .from("users")
        .update({
          failed_login_attempts: newFailed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userRow.id);

      logFail(AuthFailureReason.WRONG_PASSWORD, userRow);

      const remainingAttempts = maxFailedAttempts - newFailed;
      return apiError<AuthLockInfo>(
        `Mật khẩu không chính xác! Còn ${remainingAttempts} lần thử.`,
        HttpStatus.UNAUTHORIZED,
        {
          is_locked: false,
          remaining_attempts: remainingAttempts,
          failed_attempts: newFailed,
        }
      );
    }

    // 7. Nhập ĐÚNG Mật khẩu -> Reset số lần nhập sai, trạng thái khóa và cập nhật thời gian đăng nhập
    // Lưu ý: Không cập nhật updated_at ở đây vì login là sự kiện hệ thống, chỉ updated_at khi thay đổi thông tin hồ sơ
    const nowIso = new Date().toISOString();
    await supabase
      .from("users")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: nowIso,
      })
      .eq("id", userRow.id);

    // 8. Tạo JWT Token chứa userId, username, phone_zalo và role
    const token = await signAuthToken({
      userId: userRow.id,
      username: userRow.username,
      phone_zalo: userRow.phone_zalo || "",
      role: userRow.role,
    });

    await setAuthCookie(token);

    // 9. Cả giáo viên và admin đều dùng chung link /teacher (admin sẽ hiển thị thêm menu quản trị)
    const redirectUrl = AppRoutes.TEACHER.DASHBOARD;

    // 10. Trả về phiên đăng nhập thành công
    const sessionData: StudentSessionData = {
      id: userRow.id,
      full_name: userRow.full_name,
      phone_zalo: userRow.phone_zalo || "",
      avatar_url: userRow.avatar_url || "/avatar.jpg",
      current_coins: userRow.current_coins ?? 0,
      role: userRow.role,
      class_name: null,
      token,
    };

    void logAuthEvent({
      userId: userRow.id,
      phoneZalo: userRow.phone_zalo || userRow.username || normalizedUsername,
      role: userRow.role as UserRoleType,
      authAction: AuthAction.LOGIN,
      status: AuthStatus.SUCCESS,
      req,
    });

    return apiSuccess<StaffLoginResponseData>(
      {
        user: sessionData,
        redirect_url: redirectUrl,
      },
      `Xin chào ${userRow.full_name}! Đăng nhập thành công.`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại POST /api/auth/staff-login:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ trong quá trình đăng nhập quản trị.");
  }
}
