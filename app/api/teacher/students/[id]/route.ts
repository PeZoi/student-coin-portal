import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";
import { updateStudentSchema } from "@/features/teacher/schemas/studentSchemas";
import { StudentItem } from "@/features/teacher/components/students/types";
import { format } from "date-fns";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/teacher/students/[id]
 * Cập nhật họ và tên hoặc số điện thoại Zalo của học sinh
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền chỉnh sửa hồ sơ học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, updateStudentSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { full_name, phone_zalo, class_id } = validation.data;

    // 1. Kiểm tra tài khoản học sinh có tồn tại
    const { data: existingStudent, error: findError } = await supabase
      .from("users")
      .select("id, full_name, phone_zalo, class_id, current_coins, total_earned_coins, free_spins, is_active, is_deleted, created_at")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (findError || !existingStudent) {
      return apiError("Không tìm thấy hồ sơ học sinh yêu cầu.", HttpStatus.NOT_FOUND);
    }

    // 2. Kiểm tra trùng số điện thoại Zalo nếu có thay đổi
    if (
      phone_zalo !== undefined &&
      phone_zalo.trim() !== "" &&
      phone_zalo.trim() !== existingStudent.phone_zalo
    ) {
      const { data: duplicatePhone } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("phone_zalo", phone_zalo.trim())
        .neq("id", id)
        .maybeSingle();

      if (duplicatePhone) {
        return apiError(
          `Số điện thoại Zalo "${phone_zalo}" đã được sử dụng cho học sinh "${duplicatePhone.full_name}".`,
          HttpStatus.CONFLICT
        );
      }
    }

    // 3. Chuẩn bị payload cập nhật
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    };

    if (full_name !== undefined && full_name.trim() !== "") {
      updatePayload.full_name = full_name.trim();
    }
    if (phone_zalo !== undefined && phone_zalo.trim() !== "") {
      updatePayload.phone_zalo = phone_zalo.trim();
    }
    if (class_id !== undefined) {
      if (class_id && class_id.trim() !== "") {
        const { data: classRecord } = await supabase
          .from("classes")
          .select("id, class_name, is_deleted, is_active")
          .eq("id", class_id)
          .maybeSingle();

        if (!classRecord || classRecord.is_deleted || !classRecord.is_active) {
          return apiError(
            "Lớp học được chọn không tồn tại hoặc đang tạm ngưng hoạt động.",
            HttpStatus.BAD_REQUEST
          );
        }
        updatePayload.class_id = class_id;
      } else {
        updatePayload.class_id = null;
      }
    }

    const { data: updatedStudent, error: updateError } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .select("id, full_name, phone_zalo, avatar_url, class_id, current_coins, total_earned_coins, free_spins, is_active, is_deleted, failed_login_attempts, locked_until, created_at")
      .single();

    if (updateError || !updatedStudent) {
      console.error("Lỗi khi cập nhật học sinh:", updateError?.message);
      return apiError("Không thể cập nhật hồ sơ học sinh. Vui lòng thử lại.");
    }

    // Lấy tên lớp
    let className = "Chưa phân lớp";
    if (updatedStudent.class_id) {
      const { data: classRecord } = await supabase
        .from("classes")
        .select("class_name")
        .eq("id", updatedStudent.class_id)
        .maybeSingle();
      if (classRecord) className = classRecord.class_name;
    }

    const resultItem: StudentItem = {
      id: updatedStudent.id,
      full_name: updatedStudent.full_name,
      phone_zalo: updatedStudent.phone_zalo || "",
      avatar_url: updatedStudent.avatar_url || null,
      class_id: updatedStudent.class_id,
      class_name: className,
      current_coins: updatedStudent.current_coins ?? 0,
      total_earned_coins: updatedStudent.total_earned_coins ?? 0,
      free_spins: updatedStudent.free_spins ?? 0,
      is_active: updatedStudent.is_active ?? true,
      is_deleted: updatedStudent.is_deleted ?? false,
      failed_login_attempts: updatedStudent.failed_login_attempts ?? 0,
      locked_until: updatedStudent.locked_until ?? null,
      lock_remaining_text: null,
      last_login_at: null,
      created_at: updatedStudent.created_at
        ? format(new Date(updatedStudent.created_at), "dd/MM/yyyy")
        : "",
    };

    return apiSuccess<StudentItem>(
      resultItem,
      `Đã cập nhật thông tin học sinh "${updatedStudent.full_name}" thành công!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PATCH /api/teacher/students/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi cập nhật hồ sơ học sinh.");
  }
}

/**
 * DELETE /api/teacher/students/[id]
 * - permanent = false: Xóa mềm (chuyển vào thùng rác)
 * - permanent = true: Xóa vĩnh viễn (Hard delete)
 * QUY TẮC BẮT BUỘC: CHỈ QUẢN TRỊ VIÊN TỐI CAO (ADMIN) MỚI CÓ QUYỀN XÓA (KỂ CẢ XÓA MỀM VÀ XÓA VĨNH VIỄN)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền thực hiện thao tác này."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    // 1. Kiểm tra học sinh có tồn tại không
    const { data: targetStudent, error: findError } = await supabase
      .from("users")
      .select("id, full_name, role, is_deleted")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (findError || !targetStudent) {
      return apiError("Không tìm thấy hồ sơ học sinh yêu cầu.", HttpStatus.NOT_FOUND);
    }

    // 2. XÓA VĨNH VIỄN (Hard Delete): CHỈ DUY NHẤT Quản trị viên tối cao (Admin) mới có quyền
    if (permanent) {
      if (session.role !== UserRole.ADMIN) {
        return apiError(
          "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn hồ sơ học sinh. Giáo viên và Tổ trưởng chỉ có quyền chuyển vào thùng rác.",
          HttpStatus.FORBIDDEN
        );
      }

      // Chỉ cho phép xóa vĩnh viễn học sinh đã nằm trong thùng rác
      if (!targetStudent.is_deleted) {
        return apiError(
          "Chỉ có thể xóa vĩnh viễn các hồ sơ học sinh đã nằm trong thùng rác.",
          HttpStatus.BAD_REQUEST
        );
      }

      // Xóa các bảng liên kết trước khi xóa users để đảm bảo toàn vẹn dữ liệu
      await Promise.all([
        supabase.from("coin_transactions").delete().eq("user_id", id),
        supabase.from("homework_submissions").delete().eq("student_id", id),
        supabase.from("wheel_spins").delete().eq("student_id", id),
        supabase.from("auth_logs").delete().eq("user_id", id),
        supabase.from("notifications").delete().eq("user_id", id),
      ]);

      const { error: hardDeleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (hardDeleteError) {
        console.error("Lỗi khi xóa vĩnh viễn học sinh:", hardDeleteError.message);
        return apiError("Không thể xóa vĩnh viễn hồ sơ học sinh. Vui lòng thử lại.");
      }

      return apiSuccess(
        { id, permanent: true },
        `Đã xóa vĩnh viễn hồ sơ học sinh "${targetStudent.full_name}" khỏi hệ thống!`
      );
    }

    // 3. XÓA MỀM (Soft Delete - Chuyển thùng rác): CHỈ SUPER_TEACHER và ADMIN mới có quyền
    if (
      session.role !== UserRole.SUPER_TEACHER &&
      session.role !== UserRole.ADMIN
    ) {
      return apiError(
        "Chỉ Tổ trưởng chuyên môn (Super Teacher) hoặc Quản trị viên (Admin) mới có quyền chuyển học sinh vào thùng rác. Giáo viên thường không có quyền này.",
        HttpStatus.FORBIDDEN
      );
    }

    const { error: softDeleteError } = await supabase
      .from("users")
      .update({
        is_deleted: true,
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: session.userId,
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
      })
      .eq("id", id);

    if (softDeleteError) {
      console.error("Lỗi khi xóa mềm học sinh:", softDeleteError.message);
      return apiError("Không thể chuyển học sinh vào thùng rác. Vui lòng thử lại.");
    }

    return apiSuccess(
      { id, permanent: false },
      `Đã chuyển học sinh "${targetStudent.full_name}" vào thùng rác thành công!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại DELETE /api/teacher/students/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xóa học sinh.");
  }
}
