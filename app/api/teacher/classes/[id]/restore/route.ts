import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, PostgresErrorCode } from "@/constants";
import { UserRole } from "@/constants/auth";
import { escapeSqlWildcards } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/classes/[id]/restore
 * Khôi phục lớp học từ thùng rác về trạng thái hoạt động:
 * - Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục
 * - Kiểm tra lớp học có tồn tại và đang nằm trong thùng rác (is_deleted = true)
 * - Kiểm tra tên lớp có bị trùng với một lớp khác đang hoạt động hay không
 * - Cập nhật có kiểm tra số dòng ảnh hưởng thực tế
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền khôi phục lớp học."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục lớp học
    if (session.role !== UserRole.ADMIN) {
      return apiError(
        "Chỉ Quản trị viên tối cao (Admin) mới có quyền khôi phục lớp học.",
        HttpStatus.FORBIDDEN
      );
    }

    // 1. Kiểm tra lớp học có tồn tại và đang ở trong thùng rác không
    const { data: targetClass, error: findError } = await supabase
      .from("classes")
      .select("id, class_name, is_deleted")
      .eq("id", id)
      .maybeSingle();

    if (findError || !targetClass) {
      return apiError("Không tìm thấy lớp học yêu cầu.", HttpStatus.NOT_FOUND);
    }

    if (!targetClass.is_deleted) {
      return apiError("Lớp học này hiện không nằm trong thùng rác.", HttpStatus.BAD_REQUEST);
    }

    // 2. Kiểm tra trùng tên với bất kỳ lớp học nào đang hoạt động
    const { data: duplicateClass } = await supabase
      .from("classes")
      .select("id, class_name")
      .eq("is_deleted", false)
      .ilike("class_name", escapeSqlWildcards(targetClass.class_name.trim()))
      .maybeSingle();

    if (duplicateClass) {
      return apiError(
        `Không thể khôi phục vì đã có lớp học "${duplicateClass.class_name}" đang hoạt động cùng tên. Vui lòng đổi tên lớp học trước khi khôi phục.`,
        HttpStatus.CONFLICT
      );
    }

    // 3. Tiến hành khôi phục và kiểm tra kết quả trả về
    const { data: restoredClass, error: restoreError } = await supabase
      .from("classes")
      .update({
        is_deleted: false,
        is_active: true,
        deleted_at: null,
        deleted_by: null,
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
      })
      .eq("id", id)
      .eq("is_deleted", true)
      .select("id, class_name")
      .maybeSingle();

    if (restoreError || !restoredClass) {
      // Bắt lỗi vi phạm ràng buộc UNIQUE của PostgreSQL (Unique Index uq_classes_active_name chặn trùng tên)
      if (restoreError?.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        return apiError("Tên lớp học này bị trùng lặp với một lớp học khác đang hoạt động.", HttpStatus.CONFLICT);
      }
      console.error("Lỗi khi khôi phục lớp học:", restoreError?.message);
      return apiError("Không thể khôi phục lớp học. Vui lòng thử lại sau.");
    }

    return apiSuccess(
      { id: restoredClass.id, class_name: restoredClass.class_name },
      `Đã khôi phục lớp học "${restoredClass.class_name}" thành công!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/classes/[id]/restore:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi khôi phục lớp học.");
  }
}
