import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, PostgresErrorCode } from "@/constants";
import { UserRole } from "@/constants/auth";
import { updateTeacherSchema } from "@/features/teacher-management/schemas/teacherSchemas";
import { escapeSqlWildcards } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/teacher/teachers/[id]
 * Cập nhật thông tin hoặc trạng thái hoạt động của giáo viên
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã giáo viên không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền chỉnh sửa thông tin giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, updateTeacherSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { full_name, phone_zalo, email, role, is_active } = validation.data;

    // 1. Kiểm tra tài khoản giáo viên có tồn tại không
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id, full_name, phone_zalo, email, role, is_active, is_deleted")
      .eq("id", id)
      .maybeSingle();

    if (findError || !existingUser) {
      return apiError(
        "Không tìm thấy tài khoản giáo viên yêu cầu.",
        HttpStatus.NOT_FOUND
      );
    }

    // 2. Kiểm tra trùng số điện thoại (nếu thay đổi SĐT)
    if (
      phone_zalo !== undefined &&
      phone_zalo.trim() !== "" &&
      phone_zalo.trim() !== existingUser.phone_zalo
    ) {
      const { data: duplicatePhone } = await supabase
        .from("users")
        .select("id")
        .eq("phone_zalo", phone_zalo.trim())
        .neq("id", id)
        .maybeSingle();

      if (duplicatePhone) {
        return apiError(
          "Số điện thoại này đã được sử dụng cho một tài khoản khác.",
          HttpStatus.CONFLICT
        );
      }
    }

    // 3. Kiểm tra trùng email (nếu thay đổi email, escape wildcards)
    if (
      email !== undefined &&
      email.trim() !== "" &&
      email.trim().toLowerCase() !== (existingUser.email || "").toLowerCase()
    ) {
      const { data: duplicateEmail } = await supabase
        .from("users")
        .select("id")
        .ilike("email", escapeSqlWildcards(email.trim()))
        .neq("id", id)
        .maybeSingle();

      if (duplicateEmail) {
        return apiError(
          "Email này đã được sử dụng cho một tài khoản khác.",
          HttpStatus.CONFLICT
        );
      }
    }

    // 4. Chuẩn bị payload cập nhật
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    };

    if (full_name !== undefined) updatePayload.full_name = full_name.trim();
    if (phone_zalo !== undefined) {
      updatePayload.phone_zalo = phone_zalo.trim() !== "" ? phone_zalo.trim() : null;
    }
    if (email !== undefined) {
      updatePayload.email = email.trim() !== "" ? email.trim() : null;
    }
    if (role !== undefined) {
      // Chỉ Admin mới được quyền đổi vai trò sang Admin hoặc Super Teacher
      if (
        (role === UserRole.ADMIN || role === UserRole.SUPER_TEACHER) &&
        session.role !== UserRole.ADMIN
      ) {
        return apiError(
          "Chỉ Quản trị viên tối cao mới có quyền phân quyền này.",
          HttpStatus.FORBIDDEN
        );
      }
      updatePayload.role = role;
    }
    if (is_active !== undefined) {
      updatePayload.is_active = is_active;
      // Khi mở khóa lại tài khoản, tự động xóa bộ đếm đăng nhập sai và thời gian khóa
      if (is_active === true) {
        updatePayload.failed_login_attempts = 0;
        updatePayload.locked_until = null;
      }
    }

    // 5. Cập nhật vào DB
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .select(
        `
        id,
        username,
        full_name,
        email,
        phone_zalo,
        avatar_url,
        role,
        is_active,
        is_deleted,
        failed_login_attempts,
        locked_until,
        created_at
      `
      )
      .single();

    if (updateError || !updatedUser) {
      // Bắt lỗi vi phạm ràng buộc UNIQUE của PostgreSQL (trùng lặp username, phone_zalo hoặc email)
      if (updateError?.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        return apiError(
          "Tên đăng nhập, số điện thoại hoặc email đã được sử dụng bởi một tài khoản khác.",
          HttpStatus.CONFLICT
        );
      }
      console.error(
        "Lỗi khi cập nhật giáo viên trong Supabase:",
        updateError?.message
      );
      return apiError("Không thể cập nhật thông tin giáo viên. Vui lòng thử lại.");
    }

    return apiSuccess(
      updatedUser,
      "Cập nhật thông tin giáo viên thành công!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại PATCH /api/teacher/teachers/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi cập nhật thông tin giáo viên.");
  }
}

/**
 * DELETE /api/teacher/teachers/[id]
 * - permanent = false: Xóa mềm (chuyển vào thùng rác)
 * - permanent = true: Xóa vĩnh viễn (bắt lỗi từng bước, gỡ toàn bộ phân công lớp và xóa khỏi users)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã giáo viên không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xóa tài khoản giáo viên."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // Không cho phép tự xóa tài khoản của chính mình
    if (id === session.userId) {
      return apiError(
        "Bạn không thể tự xóa tài khoản quản trị của chính mình.",
        HttpStatus.BAD_REQUEST
      );
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    // 1. Kiểm tra tài khoản tồn tại
    const { data: targetUser, error: findError } = await supabase
      .from("users")
      .select("id, full_name, role, is_deleted")
      .eq("id", id)
      .maybeSingle();

    if (findError || !targetUser) {
      return apiError("Không tìm thấy tài khoản giáo viên yêu cầu.", HttpStatus.NOT_FOUND);
    }

    // Không được xóa tài khoản Admin tối cao nếu người thực hiện không phải Admin
    if (
      targetUser.role === UserRole.ADMIN &&
      session.role !== UserRole.ADMIN
    ) {
      return apiError(
        "Chỉ Quản trị viên tối cao mới có quyền xóa tài khoản này.",
        HttpStatus.FORBIDDEN
      );
    }

    // 2. Xóa vĩnh viễn (Hard delete - Chỉ Quản trị viên tối cao)
    if (permanent) {
      if (session.role !== UserRole.ADMIN) {
        return apiError(
          "Chỉ Quản trị viên tối cao (Admin) mới có quyền xóa vĩnh viễn tài khoản giáo viên.",
          HttpStatus.FORBIDDEN
        );
      }

      // Chỉ cho phép xóa vĩnh viễn các tài khoản đã nằm trong thùng rác
      if (!targetUser.is_deleted) {
        return apiError(
          "Chỉ có thể xóa vĩnh viễn các tài khoản giáo viên đã nằm trong thùng rác.",
          HttpStatus.BAD_REQUEST
        );
      }

      // a. Xóa toàn bộ phân công lớp học của giáo viên này - Bắt lỗi nghiêm ngặt
      const { error: tcDeleteError } = await supabase
        .from("teacher_classes")
        .delete()
        .eq("teacher_id", id);

      if (tcDeleteError) {
        console.error("Lỗi khi xóa phân công lớp học của giáo viên:", tcDeleteError.message);
        return apiError("Không thể gỡ phân công lớp học của giáo viên. Thao tác đã bị hủy để bảo vệ dữ liệu.");
      }

      // b. Xóa tài khoản khỏi users - Bắt lỗi
      const { error: hardDeleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (hardDeleteError) {
        console.error(
          "Lỗi khi xóa vĩnh viễn tài khoản giáo viên:",
          hardDeleteError.message
        );
        return apiError("Không thể xóa vĩnh viễn tài khoản. Vui lòng thử lại.");
      }

      return apiSuccess(
        { id, permanent: true },
        `Đã xóa vĩnh viễn tài khoản "${targetUser.full_name}" khỏi hệ thống!`
      );
    }

    // 3. Xóa mềm (Soft delete - Chuyển thùng rác): CHỈ SUPER_TEACHER và ADMIN mới có quyền
    if (
      session.role !== UserRole.SUPER_TEACHER &&
      session.role !== UserRole.ADMIN
    ) {
      return apiError(
        "Chỉ Tổ trưởng chuyên môn (Super Teacher) hoặc Quản trị viên (Admin) mới có quyền chuyển tài khoản giáo viên vào thùng rác. Giáo viên thường không có quyền này.",
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
      console.error("Lỗi khi xóa mềm giáo viên:", softDeleteError.message);
      return apiError("Không thể xóa tài khoản giáo viên. Vui lòng thử lại.");
    }

    return apiSuccess(
      { id, permanent: false },
      `Đã chuyển tài khoản "${targetUser.full_name}" vào thùng rác!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại DELETE /api/teacher/teachers/[id]:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi xóa tài khoản giáo viên.");
  }
}
