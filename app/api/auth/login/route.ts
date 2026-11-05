import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatus, ApiResponse } from "@/types/api";
import { studentPinVerificationSchema } from "@/features/auth/schemas/authSchemas";
import { StudentSessionData } from "@/features/auth/types";
import { setAuthCookie, signAuthToken } from "@/lib/auth/jwt";

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
  classes: { class_name: string } | null;
}

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<StudentSessionData>>> {
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
    const { data, error } = await supabase
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
        classes!users_class_id_fkey (
          class_name
        )
      `
      )
      .eq("phone_zalo", normalizedPhone)
      .eq("role", "student")
      .maybeSingle();

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

    // 4. Đối soát mã PIN
    if (userRow.pin_number !== normalizedPin) {
      return apiError(
        "Mã PIN chưa đúng rồi! Bé thử nhớ lại hoặc hỏi bố mẹ xem sao nhé.",
        HttpStatus.UNAUTHORIZED
      );
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

