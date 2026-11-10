import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { ApiResponse } from "@/types/api";
import {
  HttpStatus,
  AuthAction,
  AuthStatus,
  AuthFailureReason,
  UserRole,
  PostgresErrorCode,
} from "@/constants";
import { studentRegisterSchema } from "@/features/auth/schemas/authSchemas";
import { RegisteredStudentData } from "@/features/auth/types";
import { logAuthEvent } from "@/lib/auth/authLogger";

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<RegisteredStudentData>>> {
  try {
    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      return apiError("Dữ liệu gửi lên không đúng định dạng JSON.", HttpStatus.BAD_REQUEST);
    }

    // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào bằng Zod Schema
    const validationResult = studentRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      const errorMessage = firstIssue ? firstIssue.message : "Dữ liệu đăng ký không hợp lệ.";
      return apiError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const { full_name, phone_zalo, class_id, pin_number, avatar_url } =
      validationResult.data;

    const normalizedPhone = phone_zalo.trim();
    const normalizedName = full_name.trim();

    // 2. Kiểm tra xem Lớp học có tồn tại và đang hoạt động không
    const { data: classRecord, error: checkClassError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", class_id)
      .eq("is_active", true)
      .eq("is_deleted", false)
      .maybeSingle();

    if (checkClassError || !classRecord) {
      return apiError(
        "Lớp học bạn chọn không tồn tại hoặc hiện đang tạm đóng.",
        HttpStatus.BAD_REQUEST
      );
    }

    // 3. Thêm tài khoản học sinh mới vào bảng `users`
    // Tận dụng ràng buộc UNIQUE của PostgreSQL thay vì SELECT trước (chống Race Condition và giảm round-trip DB)
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        full_name: normalizedName,
        phone_zalo: normalizedPhone,
        class_id,
        pin_number,
        avatar_url: avatar_url,
        role: UserRole.STUDENT,
        has_completed_onboarding: false,
        is_active: true,
        is_deleted: false,
      })
      .select("id, full_name, phone_zalo, class_id, avatar_url, current_coins, role")
      .single();

    if (insertError) {
      // Bắt lỗi vi phạm ràng buộc UNIQUE của PostgreSQL (trùng lặp số điện thoại phone_zalo)
      if (insertError.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        void logAuthEvent({
          phoneZalo: normalizedPhone,
          role: UserRole.STUDENT,
          authAction: AuthAction.REGISTER,
          status: AuthStatus.FAILED,
          failureReason: AuthFailureReason.PHONE_ALREADY_EXISTS,
          req,
        });

        return apiError(
          "Số điện thoại Zalo này đã được đăng ký tài khoản. Bé hãy chuyển sang tab Đăng nhập nhé!",
          HttpStatus.CONFLICT
        );
      }

      console.error("Lỗi khi tạo tài khoản học sinh:", insertError.message);
      return apiError(
        "Không thể hoàn tất đăng ký tài khoản. Vui lòng thử lại sau.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if (!newUser) {
      return apiError(
        "Không thể hoàn tất đăng ký tài khoản. Vui lòng thử lại sau.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    void logAuthEvent({
      userId: newUser.id,
      phoneZalo: newUser.phone_zalo,
      role: UserRole.STUDENT,
      authAction: AuthAction.REGISTER,
      status: AuthStatus.SUCCESS,
      req,
    });

    // 4. Trả về thông tin đăng ký thành công kèm mã 201 Created
    return apiSuccess<RegisteredStudentData>(
      newUser as RegisteredStudentData,
      "Chúc mừng bé đã tạo tài khoản thành công! Bé hãy đăng nhập để khám phá nhé.",
      HttpStatus.CREATED
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại POST /api/auth/register:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ trong quá trình đăng ký.");
  }
}
