import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { TeacherClassItem, AvailableTeacherItem } from "../components/classes/types";

/**
 * Service quản lý các yêu cầu API Lớp học & Phân công giáo viên
 */
export const teacherClassService = {
  /**
   * Lấy danh sách tất cả các lớp học
   */
  async getClasses(): Promise<TeacherClassItem[]> {
    const res = await http.get<ApiResponse<TeacherClassItem[]>>("/api/teacher/classes");
    return res.data ?? [];
  },

  /**
   * Tạo một lớp học mới
   */
  async createClass(payload: { class_name: string; is_active: boolean }): Promise<TeacherClassItem> {
    const res = await http.post<ApiResponse<TeacherClassItem>>("/api/teacher/classes", payload);
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
    const res = await http.patch<ApiResponse<TeacherClassItem>>(`/api/teacher/classes/${id}`, payload);
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
    >(`/api/teacher/classes/${classId}/teachers`, { teacher_ids: teacherIds });

    if (!res.data) {
      throw new Error(res.message || "Không thể cập nhật phân công giáo viên.");
    }
    return res.data;
  },

  /**
   * Xóa mềm (soft delete) một lớp học
   */
  async deleteClass(id: string): Promise<{ id: string }> {
    const res = await http.delete<ApiResponse<{ id: string }>>(`/api/teacher/classes/${id}`);
    if (!res.data && !res.success) {
      throw new Error(res.message || "Không thể xóa lớp học.");
    }
    return res.data ?? { id };
  },

  /**
   * Lấy danh sách giáo viên có thể phân công
   */
  async getAvailableTeachers(): Promise<AvailableTeacherItem[]> {
    const res = await http.get<ApiResponse<AvailableTeacherItem[]>>("/api/teacher/teachers");
    return res.data ?? [];
  },
};
