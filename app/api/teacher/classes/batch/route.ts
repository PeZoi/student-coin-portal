import { z } from "zod";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";

const batchActionSchema = z.object({
  ids: z
    .array(z.string().uuid("Mã lớp học không hợp lệ"))
    .min(1, "Vui lòng chọn ít nhất một lớp học"),
  action: z.enum(["restore", "delete_permanent"], {
    message: "Hành động hàng loạt không hợp lệ.",
  }),
});

/**
 * POST /api/teacher/classes/batch
 * Thực hiện thao tác hàng loạt trên nhiều lớp học (Khôi phục hoặc Xóa vĩnh viễn)
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền thực hiện thao tác hàng loạt."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, batchActionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { ids, action } = validation.data;

    // 1. Khôi phục hàng loạt
    if (action === "restore") {
      const { error: restoreError } = await supabase
        .from("classes")
        .update({
          is_deleted: false,
          is_active: true,
          deleted_at: null,
          deleted_by: null,
          updated_at: new Date().toISOString(),
          updated_by: session.userId,
        })
        .in("id", ids);

      if (restoreError) {
        console.error("Lỗi khi khôi phục hàng loạt lớp học:", restoreError.message);
        return apiError("Không thể khôi phục các lớp học đã chọn. Vui lòng thử lại.");
      }

      return apiSuccess(
        { count: ids.length, action: "restore" },
        `Đã khôi phục thành công ${ids.length} lớp học!`
      );
    }

    // 2. Xóa vĩnh viễn hàng loạt (Chỉ dành cho Admin / Super-Teacher)
    if (action === "delete_permanent") {
      if (session.role !== UserRole.ADMIN && session.role !== UserRole.SUPER_TEACHER) {
        return apiError(
          "Chỉ Quản trị viên mới có quyền xóa vĩnh viễn các lớp học.",
          HttpStatus.FORBIDDEN
        );
      }

      // a. Giải phóng toàn bộ học sinh khỏi các lớp này
      await supabase.from("users").update({ class_id: null }).in("class_id", ids);

      // b. Xóa các phân công giáo viên liên quan
      await supabase.from("teacher_classes").delete().in("class_id", ids);

      // c. Xóa các phân công nhiệm vụ liên quan
      await supabase.from("mission_classes").delete().in("class_id", ids);

      // d. Xóa vĩnh viễn các bản ghi lớp học
      const { error: hardDeleteError } = await supabase
        .from("classes")
        .delete()
        .in("id", ids);

      if (hardDeleteError) {
        console.error("Lỗi khi xóa vĩnh viễn hàng loạt lớp học:", hardDeleteError.message);
        return apiError("Không thể xóa vĩnh viễn các lớp học đã chọn. Vui lòng thử lại.");
      }

      return apiSuccess(
        { count: ids.length, action: "delete_permanent" },
        `Đã xóa vĩnh viễn thành công ${ids.length} lớp học!`
      );
    }

    return apiError("Thao tác không được hỗ trợ.", HttpStatus.BAD_REQUEST);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/classes/batch:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xử lý thao tác hàng loạt.");
  }
}
