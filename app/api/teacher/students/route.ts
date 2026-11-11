import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { getManageStudentsServer } from "@/features/teacher/services/teacherStudentServerService";
import { createStudentSchema } from "@/features/teacher/schemas/studentSchemas";
import { StudentItem } from "@/features/teacher/components/students/types";
import { format } from "date-fns";

/**
 * GET /api/teacher/students
 * Lấy danh sách đầy đủ học sinh phục vụ trang Quản lý học sinh (đã phân quyền server)
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập danh sách học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }

    const manageStudents = await getManageStudentsServer(auth.session);
    return apiSuccess<StudentItem[]>(manageStudents);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/students:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách học sinh.");
  }
}

/**
 * POST /api/teacher/students
 * Tạo hồ sơ học sinh mới trong hệ thống
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền tạo hồ sơ học sinh mới."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, createStudentSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { full_name, phone_zalo, class_id, pin_number } = validation.data;

    // 1. Kiểm tra số điện thoại Zalo đã tồn tại trong hệ thống chưa
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, full_name, role")
      .eq("phone_zalo", phone_zalo.trim())
      .maybeSingle();

    if (existingUser) {
      return apiError(
        `Số điện thoại Zalo "${phone_zalo}" đã được sử dụng cho tài khoản "${existingUser.full_name}". Vui lòng kiểm tra lại.`,
        HttpStatus.CONFLICT
      );
    }

    // 2. Kiểm tra lớp học có tồn tại (nếu có chọn lớp)
    let className = "Chưa phân lớp";
    if (class_id && class_id.trim() !== "") {
      const { data: classRecord } = await supabase
        .from("classes")
        .select("id, class_name, is_deleted")
        .eq("id", class_id)
        .maybeSingle();

      if (!classRecord || classRecord.is_deleted) {
        return apiError(
          "Lớp học được chọn không tồn tại hoặc đã bị xóa.",
          HttpStatus.BAD_REQUEST
        );
      }
      className = classRecord.class_name;
    }

    // 3. Thêm học sinh mới vào bảng users
    const nowIso = new Date().toISOString();
    const { data: newStudent, error: insertError } = await supabase
      .from("users")
      .insert({
        full_name: full_name.trim(),
        phone_zalo: phone_zalo.trim(),
        pin_number: pin_number || "0000",
        class_id: class_id && class_id.trim() !== "" ? class_id : null,
        role: UserRole.STUDENT,
        current_coins: 0,
        total_earned_coins: 0,
        free_spins: 0,
        is_active: true,
        is_deleted: false,
        failed_login_attempts: 0,
        created_at: nowIso,
        updated_at: nowIso,
        created_by: session.userId,
        updated_by: session.userId,
      })
      .select(
        "id, full_name, phone_zalo, avatar_url, class_id, current_coins, total_earned_coins, free_spins, is_active, is_deleted, failed_login_attempts, locked_until, created_at"
      )
      .single();

    if (insertError || !newStudent) {
      console.error("Lỗi khi thêm học sinh vào users:", insertError?.message);
      return apiError("Không thể tạo hồ sơ học sinh. Vui lòng thử lại.");
    }

    const createdItem: StudentItem = {
      id: newStudent.id,
      full_name: newStudent.full_name,
      phone_zalo: newStudent.phone_zalo || "",
      avatar_url: newStudent.avatar_url || null,
      class_id: newStudent.class_id,
      class_name: className,
      current_coins: newStudent.current_coins ?? 0,
      total_earned_coins: newStudent.total_earned_coins ?? 0,
      free_spins: newStudent.free_spins ?? 0,
      is_active: newStudent.is_active ?? true,
      is_deleted: false,
      failed_login_attempts: 0,
      locked_until: null,
      lock_remaining_text: null,
      last_login_at: null,
      created_at: format(new Date(newStudent.created_at), "dd/MM/yyyy"),
    };

    return apiSuccess<StudentItem>(
      createdItem,
      `Đã tạo hồ sơ học sinh "${full_name}" thành công!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/students:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tạo hồ sơ học sinh.");
  }
}
