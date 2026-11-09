import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { updateClassSchema } from "@/features/teacher/schemas/classSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/teacher/classes/[id]
 * Cập nhật tên lớp học hoặc trạng thái hoạt động (hoạt động / tạm ẩn)
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(req, "Bạn không có quyền chỉnh sửa lớp học.");
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // Xác thực body động thông qua helper tập trung
    const validation = await validateRequestBody(req, updateClassSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { class_name, is_active } = validation.data;

    // 1. Kiểm tra lớp học có tồn tại không
    const { data: existingClass, error: findError } = await supabase
      .from("classes")
      .select("id, class_name, is_active")
      .eq("id", id)
      .eq("is_deleted", false)
      .maybeSingle();

    if (findError || !existingClass) {
      return apiError("Không tìm thấy lớp học yêu cầu hoặc lớp đã bị xóa.", HttpStatus.NOT_FOUND);
    }

    // 2. Nếu đổi tên lớp, kiểm tra trùng tên với lớp khác
    if (class_name && class_name.toLowerCase() !== existingClass.class_name.toLowerCase()) {
      const { data: duplicate } = await supabase
        .from("classes")
        .select("id")
        .ilike("class_name", class_name)
        .neq("id", id)
        .eq("is_deleted", false)
        .maybeSingle();

      if (duplicate) {
        return apiError("Tên lớp học này đã được sử dụng bởi lớp khác.", HttpStatus.CONFLICT);
      }
    }

    // 3. Tiến hành cập nhật
    const updatePayload: {
      class_name?: string;
      is_active?: boolean;
      updated_at: string;
      updated_by: string;
    } = {
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    };

    if (class_name !== undefined) updatePayload.class_name = class_name;
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data: updatedClass, error: updateError } = await supabase
      .from("classes")
      .update(updatePayload)
      .eq("id", id)
      .select("id, class_name, is_active, updated_at")
      .single();

    if (updateError || !updatedClass) {
      console.error("Lỗi khi cập nhật lớp học tại Supabase:", updateError?.message);
      return apiError("Không thể cập nhật thông tin lớp học. Vui lòng thử lại sau.");
    }

    return apiSuccess(updatedClass, "Cập nhật thông tin lớp học thành công!");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PATCH /api/teacher/classes/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi cập nhật lớp học.");
  }
}

/**
 * DELETE /api/teacher/classes/[id]
 * Xóa mềm (soft delete) lớp học
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xoá lớp học."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const { error: deleteError } = await supabase
      .from("classes")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: session.userId,
      })
      .eq("id", id);

    if (deleteError) {
      console.error("Lỗi khi xóa lớp học:", deleteError.message);
      return apiError("Không thể xóa lớp học. Vui lòng thử lại sau.");
    }

    return apiSuccess({ id }, "Đã xóa lớp học thành công!");
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại DELETE /api/teacher/classes/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xóa lớp học.");
  }
}
