import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, PostgresErrorCode } from "@/constants";
import { UserRole } from "@/constants/auth";
import { updateClassSchema } from "@/features/teacher/schemas/classSchemas";
import { escapeSqlWildcards } from "@/lib/utils";

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

    // 2. Nếu đổi tên lớp, kiểm tra trùng tên với lớp khác (escape wildcards)
    if (class_name && class_name.trim().toLowerCase() !== existingClass.class_name.toLowerCase()) {
      const { data: duplicate } = await supabase
        .from("classes")
        .select("id")
        .ilike("class_name", escapeSqlWildcards(class_name.trim()))
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

    if (class_name !== undefined) updatePayload.class_name = class_name.trim();
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data: updatedClass, error: updateError } = await supabase
      .from("classes")
      .update(updatePayload)
      .eq("id", id)
      .select("id, class_name, is_active, updated_at")
      .single();

    if (updateError || !updatedClass) {
      // Bắt lỗi vi phạm ràng buộc UNIQUE của PostgreSQL (Unique Index uq_classes_active_name chặn trùng tên lớp)
      if (updateError?.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        return apiError("Tên lớp học này đã được sử dụng bởi lớp khác.", HttpStatus.CONFLICT);
      }
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
 * - Lớp CHƯA CÓ HỌC SINH HOẠT ĐỘNG (không có user role=student và is_deleted=false):
 *   + Xóa vĩnh viễn luôn khỏi hệ thống (cả giáo viên và admin đều thực hiện được).
 * - Lớp ĐÃ CÓ HỌC SINH HOẠT ĐỘNG:
 *   + Mặc định: Xóa mềm (chuyển vào thùng rác, bảo vệ an toàn học sinh và lịch sử học tập).
 *   + Kèm ?permanent=true (chỉ dành cho Admin / Super-Teacher): Xóa vĩnh viễn (giải phóng học sinh về Chưa phân lớp, xóa lớp).
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const { searchParams } = new URL(req.url);
    const isPermanent = searchParams.get("permanent") === "true";

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xoá lớp học."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // 1. Kiểm tra lớp học tồn tại
    const { data: targetClass, error: classFindError } = await supabase
      .from("classes")
      .select("id, class_name, is_deleted")
      .eq("id", id)
      .maybeSingle();

    if (classFindError || !targetClass) {
      return apiError("Không tìm thấy lớp học yêu cầu.", HttpStatus.NOT_FOUND);
    }

    // 2. Kiểm tra học sinh hoạt động trong lớp (chỉ đếm role=student và is_deleted=false)
    const { data: existingStudent, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("class_id", id)
      .eq("role", UserRole.STUDENT)
      .eq("is_deleted", false)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error("Lỗi khi kiểm tra học sinh trong lớp học:", checkError.message);
      return apiError("Không thể kiểm tra thông tin lớp học. Vui lòng thử lại.");
    }

    const hasStudents = !!existingStudent;

    // 3. XÓA VĨNH VIỄN (TẦNG 2): Chỉ duy nhất Quản trị viên tối cao (Admin) mới có quyền
    if (isPermanent) {
      if (session.role !== UserRole.ADMIN) {
        return apiError(
          "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn lớp học.",
          HttpStatus.FORBIDDEN
        );
      }

      // a. Giải phóng học sinh khỏi lớp (nếu có học sinh) - Kiểm tra lỗi nghiêm ngặt
      if (hasStudents) {
        const { error: unassignError } = await supabase
          .from("users")
          .update({ class_id: null })
          .eq("class_id", id);

        if (unassignError) {
          console.error("Lỗi khi giải phóng học sinh khỏi lớp:", unassignError.message);
          return apiError("Không thể giải phóng học sinh khỏi lớp. Thao tác đã bị hủy để bảo vệ dữ liệu.");
        }
      }

      // b. Xóa các phân công giáo viên liên quan - Kiểm tra lỗi
      const { error: tcDeleteError } = await supabase
        .from("teacher_classes")
        .delete()
        .eq("class_id", id);

      if (tcDeleteError) {
        console.error("Lỗi khi xóa phân công giáo viên:", tcDeleteError.message);
        return apiError("Không thể xóa phân công giáo viên của lớp học. Vui lòng thử lại sau.");
      }

      // c. Xóa các liên kết nhiệm vụ theo lớp - Kiểm tra lỗi
      const { error: mcDeleteError } = await supabase
        .from("mission_classes")
        .delete()
        .eq("class_id", id);

      if (mcDeleteError) {
        console.error("Lỗi khi xóa liên kết nhiệm vụ của lớp:", mcDeleteError.message);
        return apiError("Không thể xóa liên kết bài tập của lớp học. Vui lòng thử lại sau.");
      }

      // d. Xóa vĩnh viễn lớp học khỏi cơ sở dữ liệu
      const { error: hardDeleteError } = await supabase
        .from("classes")
        .delete()
        .eq("id", id);

      if (hardDeleteError) {
        console.error("Lỗi khi xóa vĩnh viễn lớp học:", hardDeleteError.message);
        return apiError("Không thể xóa vĩnh viễn lớp học. Vui lòng thử lại sau.");
      }

      return apiSuccess(
        { id, permanent: true },
        `Đã xóa vĩnh viễn lớp học "${targetClass.class_name}" khỏi hệ thống!`
      );
    }

    // 4. XÓA MỀM (TẦNG 1): Chuyển lớp học vào thùng rác (bảo vệ an toàn dữ liệu cho tất cả người dùng)
    const { error: deleteError } = await supabase
      .from("classes")
      .update({
        is_deleted: true,
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: session.userId,
      })
      .eq("id", id);

    if (deleteError) {
      console.error("Lỗi khi chuyển lớp học vào thùng rác:", deleteError.message);
      return apiError("Không thể xóa lớp học. Vui lòng thử lại sau.");
    }

    return apiSuccess({ id, permanent: false }, `Đã chuyển lớp học "${targetClass.class_name}" vào thùng rác!`);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại DELETE /api/teacher/classes/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xóa lớp học.");
  }
}
