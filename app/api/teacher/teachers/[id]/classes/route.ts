import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { assignTeacherClassesSchema } from "@/features/teacher-management/schemas/teacherSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/teacher/teachers/[id]/classes
 * Cập nhật danh sách các lớp học mà giáo viên này phụ trách
 * - Loại trùng class_ids, validate lớp học tồn tại và chưa bị xóa
 * - Áp dụng Diff-based update: Thêm mới trước, gỡ bỏ sau để tránh mất dữ liệu nếu lỗi
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id: teacherId } = await params;
    if (!teacherId) {
      return apiError("Mã giáo viên không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền phân công lớp cho giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, assignTeacherClassesSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { class_ids } = validation.data;

    // 1. Kiểm tra giáo viên có tồn tại và chưa bị xóa
    const { data: teacherRecord, error: teacherFindError } = await supabase
      .from("users")
      .select("id, full_name, is_deleted")
      .eq("id", teacherId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (teacherFindError || !teacherRecord) {
      return apiError(
        "Tài khoản giáo viên không tồn tại hoặc đã bị xóa.",
        HttpStatus.NOT_FOUND
      );
    }

    // 2. Loại trùng danh sách class_ids
    const uniqueClassIds = Array.from(new Set(class_ids));

    // 3. Validate kiểm tra tất cả các lớp học có tồn tại và chưa bị xóa
    let classesData: { id: string; class_name: string }[] = [];
    if (uniqueClassIds.length > 0) {
      const { data: validClasses, error: classCheckError } = await supabase
        .from("classes")
        .select("id, class_name")
        .in("id", uniqueClassIds)
        .eq("is_deleted", false)
        .eq("is_active", true);

      if (classCheckError) {
        console.error("Lỗi khi kiểm tra lớp học:", classCheckError.message);
        return apiError("Không thể kiểm tra thông tin lớp học. Vui lòng thử lại.");
      }

      if (!validClasses || validClasses.length !== uniqueClassIds.length) {
        return apiError(
          "Một hoặc nhiều lớp học được chọn không tồn tại, đã bị xóa hoặc đang tạm ngưng hoạt động.",
          HttpStatus.BAD_REQUEST
        );
      }

      classesData = validClasses;
    }

    // 4. Lấy danh sách phân công hiện tại để áp dụng Diff-based Update (Bảo vệ dữ liệu)
    const { data: currentAssignments, error: currentFetchError } = await supabase
      .from("teacher_classes")
      .select("class_id")
      .eq("teacher_id", teacherId);

    if (currentFetchError) {
      console.error("Lỗi khi đọc phân công lớp hiện tại:", currentFetchError.message);
      return apiError("Không thể kiểm tra phân công lớp hiện tại của giáo viên.");
    }

    const currentClassIds = (currentAssignments || []).map((r) => r.class_id);
    const idsToAdd = uniqueClassIds.filter((cId) => !currentClassIds.includes(cId));
    const idsToRemove = currentClassIds.filter((cId) => !uniqueClassIds.includes(cId));

    // 5. Thêm mới các lớp chưa phân công trước (Nếu thêm lỗi -> Dừng lại, giữ nguyên phân công cũ)
    if (idsToAdd.length > 0) {
      const recordsToInsert = idsToAdd.map((cId) => ({
        teacher_id: teacherId,
        class_id: cId,
        created_by: session.userId,
      }));

      const { error: insertError } = await supabase
        .from("teacher_classes")
        .insert(recordsToInsert);

      if (insertError) {
        console.error("Lỗi khi thêm phân công lớp học mới:", insertError.message);
        return apiError("Không thể lưu phân công lớp học mới. Phân công cũ vẫn được giữ nguyên.");
      }
    }

    // 6. Gỡ bỏ các lớp không còn được chọn sau
    if (idsToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from("teacher_classes")
        .delete()
        .eq("teacher_id", teacherId)
        .in("class_id", idsToRemove);

      if (removeError) {
        console.error("Lỗi khi gỡ phân công lớp cũ:", removeError.message);
        return apiError("Đã thêm lớp mới nhưng chưa thể gỡ lớp cũ. Vui lòng thử lại.");
      }
    }

    const assignedClassNames = classesData.map((c) => c.class_name);

    return apiSuccess(
      {
        teacher_id: teacherId,
        assigned_classes: assignedClassNames,
        assigned_class_ids: uniqueClassIds,
      },
      `Phân công lớp học cho giáo viên "${teacherRecord.full_name}" thành công!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "Lỗi máy chủ tại PUT /api/teacher/teachers/[id]/classes:",
      error.message
    );
    return apiError("Đã xảy ra lỗi hệ thống khi phân công lớp học.");
  }
}
