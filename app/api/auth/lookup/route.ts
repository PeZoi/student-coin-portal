import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { HttpStatus, ApiResponse } from "@/types/api";
import { studentLoginSchema } from "@/features/auth/schemas/authSchemas";
import { StudentLookupData } from "@/features/auth/types";

interface UserLookupDbRow {
  id: string;
  full_name: string;
  phone_zalo: string;
  avatar_url: string | null;
  current_coins: number | null;
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
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        phone_zalo,
        avatar_url,
        current_coins,
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

    const studentInfo: StudentLookupData = {
      id: userRow.id,
      full_name: userRow.full_name,
      phone_zalo: userRow.phone_zalo,
      avatar_url: userRow.avatar_url || "/avatar.jpg",
      current_coins: userRow.current_coins ?? 0,
      class_name: userRow.classes?.class_name ?? null,
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

