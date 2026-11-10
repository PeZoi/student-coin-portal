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
 * - Validate danh sách teacher_ids: loại trùng, kiểm tra role và trạng thái hoạt động
 * - Áp dụng Diff-based update: Thêm mới trước, xóa sau để tránh mất dữ liệu nếu xảy ra lỗi giữa chừng
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

    // 2. Loại trùng danh sách teacher_ids
    const uniqueTeacherIds = Array.from(new Set(teacher_ids));

    // 3. Validate kiểm tra toàn bộ teacher_ids có thật sự là giáo viên hợp lệ
    let teachersData: { id: string; full_name: string }[] = [];
    if (uniqueTeacherIds.length > 0) {
      const { data: validTeachers, error: teacherCheckError } = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", uniqueTeacherIds)
        .in("role", ["teacher", "super_teacher"])
        .eq("is_deleted", false);

      if (teacherCheckError) {
        console.error("Lỗi khi kiểm tra danh sách giáo viên:", teacherCheckError.message);
        return apiError("Không thể kiểm tra thông tin giáo viên. Vui lòng thử lại.");
      }

      if (!validTeachers || validTeachers.length !== uniqueTeacherIds.length) {
        return apiError(
          "Một hoặc nhiều giáo viên được chọn không tồn tại, sai vai trò hoặc đã bị khóa/xóa.",
          HttpStatus.BAD_REQUEST
        );
      }

      teachersData = validTeachers;
    }

    // 4. Lấy danh sách phân công hiện tại để áp dụng Diff-based Update (Bảo vệ dữ liệu)
    const { data: currentAssignments, error: currentFetchError } = await supabase
      .from("teacher_classes")
      .select("teacher_id")
      .eq("class_id", classId);

    if (currentFetchError) {
      console.error("Lỗi khi đọc phân công hiện tại:", currentFetchError.message);
      return apiError("Không thể kiểm tra phân công hiện tại của lớp học.");
    }

    const currentTeacherIds = (currentAssignments || []).map((r) => r.teacher_id);
    const idsToAdd = uniqueTeacherIds.filter((tId) => !currentTeacherIds.includes(tId));
    const idsToRemove = currentTeacherIds.filter((tId) => !uniqueTeacherIds.includes(tId));

    // 5. Thêm mới các phân công chưa có trước (Nếu thêm lỗi -> Dừng lại ngay, không xóa phân công cũ)
    if (idsToAdd.length > 0) {
      const rowsToInsert = idsToAdd.map((teacher_id) => ({
        class_id: classId,
        teacher_id,
        created_by: session.userId,
      }));

      const { error: insertError } = await supabase
        .from("teacher_classes")
        .insert(rowsToInsert);

      if (insertError) {
        console.error("Lỗi khi thêm phân công mới:", insertError.message);
        return apiError("Không thể lưu phân công giáo viên mới. Dữ liệu phân công cũ vẫn được giữ nguyên.");
      }
    }

    // 6. Xóa các phân công không còn được chọn sau
    if (idsToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from("teacher_classes")
        .delete()
        .eq("class_id", classId)
        .in("teacher_id", idsToRemove);

      if (removeError) {
        console.error("Lỗi khi gỡ phân công cũ:", removeError.message);
        return apiError("Đã thêm giáo viên mới nhưng chưa thể gỡ giáo viên cũ. Vui lòng thử lại.");
      }
    }

    const assignedTeacherNames = teachersData.map((t) => t.full_name);

    return apiSuccess(
      {
        class_id: classId,
        teachers: assignedTeacherNames,
        teacher_ids: uniqueTeacherIds,
      },
      "Phân công giáo viên thành công!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PUT /api/teacher/classes/[id]/teachers:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi phân công giáo viên.");
  }
}
