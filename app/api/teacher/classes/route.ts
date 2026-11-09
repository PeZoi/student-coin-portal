import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { createClassSchema } from "@/features/teacher/schemas/classSchemas";
import { getTeacherClassesServer } from "@/features/teacher/services/teacherClassServerService";
import { format } from "date-fns";

/**
 * GET /api/teacher/classes
 * Lấy danh sách toàn bộ lớp học kèm số lượng học sinh và giáo viên phụ trách
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(req, "Bạn không có quyền truy cập dữ liệu quản lý lớp học.");
    if (!auth.success) {
      return auth.response;
    }

    const formattedClasses = await getTeacherClassesServer(auth.session);
    return apiSuccess(formattedClasses);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/classes:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách lớp học.");
  }
}

/**
 * POST /api/teacher/classes
 * Tạo lớp học mới trong hệ thống
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(req, "Bạn không có quyền tạo lớp học mới.");
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, createClassSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { class_name, is_active } = validation.data;

    // Kiểm tra tên lớp học đã tồn tại chưa
    const { data: existingClass } = await supabase
      .from("classes")
      .select("id")
      .ilike("class_name", class_name)
      .eq("is_deleted", false)
      .maybeSingle();

    if (existingClass) {
      return apiError("Tên lớp học này đã tồn tại trong hệ thống. Vui lòng chọn tên khác.", HttpStatus.CONFLICT);
    }

    // Thêm bản ghi lớp học mới
    const { data: createdClass, error: insertError } = await supabase
      .from("classes")
      .insert({
        class_name,
        is_active,
        is_deleted: false,
        created_by: session.userId,
        updated_by: session.userId,
      })
      .select("id, class_name, is_active, created_at")
      .single();

    if (insertError || !createdClass) {
      console.error("Lỗi khi thêm lớp học vào Supabase:", insertError?.message);
      return apiError("Không thể tạo lớp học. Vui lòng thử lại sau.");
    }

    let formattedDate = "";
    try {
      formattedDate = createdClass.created_at ? format(new Date(createdClass.created_at), "dd/MM/yyyy") : "";
    } catch {
      formattedDate = "";
    }

    const responseItem = {
      id: createdClass.id,
      class_name: createdClass.class_name,
      is_active: createdClass.is_active,
      student_count: 0,
      teachers: [],
      teacher_ids: [],
      created_at: formattedDate,
    };

    return apiSuccess(responseItem, "Tạo lớp học mới thành công!", HttpStatus.CREATED);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/classes:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tạo lớp học.");
  }
}
