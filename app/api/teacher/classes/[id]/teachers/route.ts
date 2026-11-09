import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { assignTeachersSchema } from "@/features/teacher/schemas/classSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/teacher/classes/[id]/teachers
 * Cập nhật danh sách giáo viên phụ trách cho một lớp học
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id: classId } = await params;
    if (!classId) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(req, "Bạn không có quyền phân công giáo viên.");
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, assignTeachersSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { teacher_ids } = validation.data;

    // 1. Kiểm tra lớp học có tồn tại và chưa bị xóa
    const { data: classRecord, error: classFindError } = await supabase
      .from("classes")
      .select("id, class_name")
      .eq("id", classId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (classFindError || !classRecord) {
      return apiError("Lớp học không tồn tại hoặc đã bị xóa.", HttpStatus.NOT_FOUND);
    }

    // 2. Xóa toàn bộ phân công cũ của lớp học này
    const { error: deleteError } = await supabase
      .from("teacher_classes")
      .delete()
      .eq("class_id", classId);

    if (deleteError) {
      console.error("Lỗi khi xóa phân công cũ:", deleteError.message);
      return apiError("Không thể làm mới phân công giáo viên. Vui lòng thử lại.");
    }

    // 3. Nếu danh sách giáo viên mới không rỗng, thêm các bản ghi mới
    let assignedTeacherNames: string[] = [];

    if (teacher_ids.length > 0) {
      const rowsToInsert = teacher_ids.map((teacher_id) => ({
        class_id: classId,
        teacher_id,
        created_by: session.userId,
      }));

      const { error: insertError } = await supabase
        .from("teacher_classes")
        .insert(rowsToInsert);

      if (insertError) {
        console.error("Lỗi khi thêm phân công mới:", insertError.message);
        return apiError("Không thể lưu phân công giáo viên mới. Vui lòng thử lại.");
      }

      // Lấy danh sách tên giáo viên tương ứng
      const { data: teachersData } = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", teacher_ids);

      if (teachersData) {
        assignedTeacherNames = teachersData.map((t) => t.full_name);
      }
    }

    return apiSuccess(
      {
        class_id: classId,
        teachers: assignedTeacherNames,
        teacher_ids,
      },
      "Phân công giáo viên thành công!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PUT /api/teacher/classes/[id]/teachers:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi phân công giáo viên.");
  }
}
