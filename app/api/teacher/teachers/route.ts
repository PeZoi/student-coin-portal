import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, PostgresErrorCode } from "@/constants";
import { getAvailableTeachersServer } from "@/features/class-management/services/classServerService";
import { getManageTeachersServer } from "@/features/teacher-management/services/teacherStaffServerService";
import { createTeacherSchema } from "@/features/teacher-management/schemas/teacherSchemas";
import { AvailableTeacherItem } from "@/features/class-management/types";
import { TeacherStaffItem, StaffRole } from "@/features/teacher-management/types";
import { format } from "date-fns";
import { escapeSqlWildcards } from "@/lib/utils";

export type { AvailableTeacherItem };

/**
 * GET /api/teacher/teachers
 * - scope=manage: Lấy danh sách đầy đủ nhân sự giáo viên (trang Quản lý giáo viên)
 * - Mặc định: Lấy danh sách giáo viên khả dụng để phân công vào lớp
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập danh sách giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");

    if (scope === "manage") {
      const manageTeachers = await getManageTeachersServer(auth.session);
      return apiSuccess<TeacherStaffItem[]>(manageTeachers);
    }

    const availableTeachers = await getAvailableTeachersServer(auth.session);
    return apiSuccess<AvailableTeacherItem[]>(availableTeachers);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/teachers:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách giáo viên.");
  }
}

/**
 * POST /api/teacher/teachers
 * Tạo tài khoản giáo viên mới trong hệ thống
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền tạo tài khoản giáo viên mới."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, createTeacherSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { full_name, username, password, phone_zalo, email, role } =
      validation.data;

    // 1. Kiểm tra username đã tồn tại chưa
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, username")
      .ilike("username", escapeSqlWildcards(username.trim()))
      .maybeSingle();

    if (existingUser) {
      return apiError(
        `Tên đăng nhập "@${username}" đã tồn tại. Vui lòng chọn tên đăng nhập khác.`,
        HttpStatus.CONFLICT
      );
    }

    // 2. Kiểm tra số điện thoại (nếu có cung cấp)
    if (phone_zalo && phone_zalo.trim() !== "") {
      const { data: existingPhone } = await supabase
        .from("users")
        .select("id")
        .eq("phone_zalo", phone_zalo.trim())
        .maybeSingle();

      if (existingPhone) {
        return apiError(
          "Số điện thoại này đã được sử dụng cho một tài khoản khác.",
          HttpStatus.CONFLICT
        );
      }
    }

    // 3. Kiểm tra email (nếu có cung cấp)
    if (email && email.trim() !== "") {
      const { data: existingEmail } = await supabase
        .from("users")
        .select("id")
        .ilike("email", escapeSqlWildcards(email.trim()))
        .maybeSingle();

      if (existingEmail) {
        return apiError(
          "Email này đã được sử dụng cho một tài khoản khác.",
          HttpStatus.CONFLICT
        );
      }
    }

    // 4. Thêm tài khoản mới vào bảng users
    const { data: createdUser, error: insertError } = await supabase
      .from("users")
      .insert({
        full_name: full_name.trim(),
        username: username.trim(),
        password,
        phone_zalo: phone_zalo && phone_zalo.trim() !== "" ? phone_zalo.trim() : null,
        email: email && email.trim() !== "" ? email.trim() : null,
        role: role || "teacher",
        is_active: true,
        is_deleted: false,
        created_by: session.userId,
        updated_by: session.userId,
      })
      .select(
        `
        id,
        username,
        full_name,
        email,
        phone_zalo,
        avatar_url,
        role,
        is_active,
        is_deleted,
        failed_login_attempts,
        locked_until,
        created_at
      `
      )
      .single();

    if (insertError || !createdUser) {
      // Bắt lỗi vi phạm ràng buộc UNIQUE của PostgreSQL (trùng lặp username, phone_zalo hoặc email)
      if (insertError?.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        return apiError(
          "Tên đăng nhập, số điện thoại hoặc email này đã tồn tại trong hệ thống.",
          HttpStatus.CONFLICT
        );
      }
      console.error(
        "Lỗi khi thêm giáo viên vào Supabase:",
        insertError?.message
      );
      return apiError("Không thể tạo tài khoản giáo viên. Vui lòng thử lại sau.");
    }

    const formattedDate = createdUser.created_at
      ? format(new Date(createdUser.created_at), "dd/MM/yyyy")
      : "";

    const responseItem: TeacherStaffItem = {
      id: createdUser.id,
      username: createdUser.username || username,
      full_name: createdUser.full_name,
      email: createdUser.email,
      phone_zalo: createdUser.phone_zalo,
      avatar_url: createdUser.avatar_url,
      role: (createdUser.role as StaffRole) || "teacher",
      is_active: Boolean(createdUser.is_active),
      is_deleted: Boolean(createdUser.is_deleted),
      failed_login_attempts: createdUser.failed_login_attempts || 0,
      locked_until: createdUser.locked_until,
      assigned_classes: [],
      assigned_class_ids: [],
      last_login_at: null,
      created_at: formattedDate,
    };

    return apiSuccess(
      responseItem,
      `Đã tạo tài khoản giáo viên "${full_name}" thành công!`,
      HttpStatus.CREATED
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/teachers:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tạo tài khoản giáo viên.");
  }
}
