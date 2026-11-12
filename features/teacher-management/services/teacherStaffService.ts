import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { AppRoutes } from "@/constants/routes";
import {
  TeacherStaffItem,
  AvailableClassItem,
  TeacherFormValues,
  TeacherBatchAction,
} from "@/features/teacher-management/types";

/**
 * Service quản lý các yêu cầu API Nhân sự Giáo viên & Phân công
 */
export const teacherStaffService = {
  /**
   * Lấy danh sách đầy đủ nhân sự giáo viên (trang Quản lý giáo viên)
   */
  async getManageTeachers(): Promise<TeacherStaffItem[]> {
    const res = await http.get<ApiResponse<TeacherStaffItem[]>>(
      `${AppRoutes.API.TEACHER.STAFF}?scope=manage`
    );
    return res.data ?? [];
  },

  /**
   * Lấy danh sách lớp học sẵn có để phân công cho giáo viên
   */
  async getAvailableClasses(): Promise<AvailableClassItem[]> {
    const res = await http.get<ApiResponse<AvailableClassItem[]>>(
      AppRoutes.API.TEACHER.STAFF_AVAILABLE_CLASSES
    );
    return res.data ?? [];
  },

  /**
   * Tạo tài khoản giáo viên mới
   */
  async createTeacher(payload: TeacherFormValues): Promise<TeacherStaffItem> {
    const res = await http.post<ApiResponse<TeacherStaffItem>>(
      AppRoutes.API.TEACHER.STAFF,
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể tạo tài khoản giáo viên.");
    }
    return res.data;
  },

  /**
   * Cập nhật thông tin giáo viên (họ tên, email, sđt, vai trò, trạng thái)
   */
  async updateTeacher(
    id: string,
    payload: Partial<TeacherFormValues> & { is_active?: boolean; role?: string }
  ): Promise<TeacherStaffItem> {
    const res = await http.patch<ApiResponse<TeacherStaffItem>>(
      AppRoutes.API.TEACHER.STAFF_DETAIL(id),
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể cập nhật thông tin giáo viên.");
    }
    return res.data;
  },

  /**
   * Cập nhật phân công lớp phụ trách cho giáo viên
   */
  async assignClasses(
    teacherId: string,
    classIds: string[]
  ): Promise<{
    teacher_id: string;
    assigned_classes: string[];
    assigned_class_ids: string[];
  }> {
    const res = await http.put<
      ApiResponse<{
        teacher_id: string;
        assigned_classes: string[];
        assigned_class_ids: string[];
      }>
    >(AppRoutes.API.TEACHER.STAFF_CLASSES(teacherId), {
      class_ids: classIds,
    });

    if (!res.data) {
      throw new Error(res.message || "Không thể cập nhật phân công lớp học.");
    }
    return res.data;
  },

  /**
   * Đặt lại mật khẩu cho tài khoản giáo viên
   */
  async resetPassword(
    teacherId: string,
    newPassword: string
  ): Promise<{ id: string }> {
    const res = await http.post<ApiResponse<{ id: string }>>(
      AppRoutes.API.TEACHER.STAFF_RESET_PASSWORD(teacherId),
      { new_password: newPassword }
    );
    if (!res.data && !res.success) {
      throw new Error(res.message || "Không thể đặt lại mật khẩu.");
    }
    return res.data ?? { id: teacherId };
  },

  /**
   * Xóa tài khoản giáo viên
   * - permanent = false: Xóa mềm (chuyển vào thùng rác)
   * - permanent = true: Xóa vĩnh viễn (gỡ toàn bộ phân công và xóa khỏi users)
   */
  async deleteTeacher(
    id: string,
    permanent = false
  ): Promise<{ id: string; permanent?: boolean }> {
    const baseUrl = AppRoutes.API.TEACHER.STAFF_DETAIL(id);
    const url = `${baseUrl}${permanent ? "?permanent=true" : ""}`;
    const res = await http.delete<ApiResponse<{ id: string; permanent?: boolean }>>(
      url
    );
    if (!res.data && !res.success) {
      throw new Error(res.message || "Không thể xóa tài khoản giáo viên.");
    }
    return res.data ?? { id, permanent };
  },

  /**
   * Khôi phục tài khoản giáo viên từ thùng rác
   */
  async restoreTeacher(id: string): Promise<{ id: string }> {
    const res = await http.post<ApiResponse<{ id: string }>>(
      AppRoutes.API.TEACHER.STAFF_RESTORE(id)
    );
    if (!res.data && !res.success) {
      throw new Error(res.message || "Không thể khôi phục tài khoản giáo viên.");
    }
    return res.data ?? { id };
  },

  /**
   * Thao tác hàng loạt trên nhiều tài khoản giáo viên
   */
  async batchAction(
    ids: string[],
    action: TeacherBatchAction
  ): Promise<{ count: number; action: string }> {
    const res = await http.post<ApiResponse<{ count: number; action: string }>>(
      AppRoutes.API.TEACHER.STAFF_BATCH,
      { ids, action }
    );
    if (!res.data && !res.success) {
      throw new Error(
        res.message || "Không thể thực hiện thao tác hàng loạt."
      );
    }
    return res.data ?? { count: ids.length, action };
  },
};
