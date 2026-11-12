import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { AppRoutes } from "@/constants/routes";
import {
  TeacherClassItem,
  AvailableTeacherItem,
  ClassStudentItem,
} from "@/features/class-management/types";

/**
 * Service quản lý các yêu cầu API Lớp học & Phân công giáo viên
 */
export const teacherClassService = {
  /**
   * Lấy danh sách tất cả các lớp học
   */
  async getClasses(): Promise<TeacherClassItem[]> {
    const res = await http.get<ApiResponse<TeacherClassItem[]>>(AppRoutes.API.TEACHER.CLASSES);
    return res.data ?? [];
  },

  /**
   * Tạo một lớp học mới
   */
  async createClass(payload: { class_name: string; is_active: boolean }): Promise<TeacherClassItem> {
    const res = await http.post<ApiResponse<TeacherClassItem>>(AppRoutes.API.TEACHER.CLASSES, payload);
    if (!res.data) {
      throw new Error(res.message || "Không thể tạo lớp học.");
    }
    return res.data;
  },

  /**
   * Cập nhật thông tin lớp học (tên lớp hoặc trạng thái hoạt động)
   */
  async updateClass(
    id: string,
    payload: { class_name?: string; is_active?: boolean }
  ): Promise<TeacherClassItem> {
    const res = await http.patch<ApiResponse<TeacherClassItem>>(AppRoutes.API.TEACHER.CLASS_DETAIL(id), payload);
    if (!res.data) {
      throw new Error(res.message || "Không thể cập nhật lớp học.");
    }
    return res.data;
  },

  /**
   * Cập nhật phân công giáo viên cho lớp học
   */
  async assignTeachers(
    classId: string,
    teacherIds: string[]
  ): Promise<{ class_id: string; teachers: string[]; teacher_ids: string[] }> {
    const res = await http.put<
      ApiResponse<{ class_id: string; teachers: string[]; teacher_ids: string[] }>
    >(AppRoutes.API.TEACHER.CLASS_TEACHERS(classId), { teacher_ids: teacherIds });

    if (!res.data) {
      throw new Error(res.message || "Không thể cập nhật phân công giáo viên.");
    }
    return res.data;
  },

  /**
   * Xóa lớp học
   * - permanent = false: Xóa mềm (chuyển vào thùng rác)
   * - permanent = true: Xóa vĩnh viễn (gỡ bỏ toàn bộ quan hệ học sinh/giáo viên)
   */
  async deleteClass(id: string, permanent = false): Promise<{ id: string; permanent?: boolean }> {
    const baseUrl = AppRoutes.API.TEACHER.CLASS_DETAIL(id);
    const url = `${baseUrl}${permanent ? "?permanent=true" : ""}`;
    const res = await http.delete<ApiResponse<{ id: string; permanent?: boolean }>>(url);
    if (!res.data && !res.success) {
      throw new Error(res.message || "Không thể xóa lớp học.");
    }
    return res.data ?? { id, permanent };
  },

  /**
   * Khôi phục lớp học từ thùng rác
   */
  async restoreClass(id: string): Promise<{ id: string }> {
    const res = await http.post<ApiResponse<{ id: string }>>(AppRoutes.API.TEACHER.CLASS_RESTORE(id));
    if (!res.data && !res.success) {
      throw new Error(res.message || "Không thể khôi phục lớp học.");
    }
    return res.data ?? { id };
  },

  /**
   * Thao tác hàng loạt trên nhiều lớp học (Khôi phục, Xóa vĩnh viễn, Kích hoạt, Tạm ẩn, Chuyển thùng rác)
   */
  async batchAction(
    ids: string[],
    action: "restore" | "delete_permanent" | "activate" | "deactivate" | "delete_soft"
  ): Promise<{ count: number; action: string }> {
    const res = await http.post<ApiResponse<{ count: number; action: string }>>(
      AppRoutes.API.TEACHER.BATCH,
      { ids, action }
    );
    if (!res.data && !res.success) {
      throw new Error(res.message || "Không thể thực hiện thao tác hàng loạt.");
    }
    return res.data ?? { count: ids.length, action };
  },

  /**
   * Lấy danh sách giáo viên có thể phân công
   */
  async getAvailableTeachers(): Promise<AvailableTeacherItem[]> {
    const res = await http.get<ApiResponse<AvailableTeacherItem[]>>(AppRoutes.API.TEACHER.TEACHERS);
    return res.data ?? [];
  },

  /**
   * Lấy danh sách học sinh thuộc một lớp học cụ thể
   */
  async getClassStudents(classId: string): Promise<ClassStudentItem[]> {
    const res = await http.get<ApiResponse<ClassStudentItem[]>>(
      AppRoutes.API.TEACHER.CLASS_STUDENTS(classId)
    );
    return res.data ?? [];
  },
};
