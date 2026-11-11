import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import {
  StudentItem,
  StudentFormValues,
  AdjustCoinsValues,
} from "../components/students/types";

/**
 * Service quản lý các yêu cầu API Học sinh & Hồ sơ lớp học (Client Service)
 */
export const teacherStudentService = {
  /**
   * Lấy danh sách đầy đủ học sinh (trang Quản lý học sinh)
   */
  async getManageStudents(): Promise<StudentItem[]> {
    const res = await http.get<ApiResponse<StudentItem[]>>(
      "/api/teacher/students"
    );
    return res.data ?? [];
  },

  /**
   * Tạo hồ sơ học sinh mới
   */
  async createStudent(payload: StudentFormValues): Promise<StudentItem> {
    const res = await http.post<ApiResponse<StudentItem>>(
      "/api/teacher/students",
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể tạo hồ sơ học sinh.");
    }
    return res.data;
  },

  /**
   * Cập nhật thông tin học sinh (họ tên, sđt Zalo)
   */
  async updateStudent(
    id: string,
    payload: Partial<StudentFormValues>
  ): Promise<StudentItem> {
    const res = await http.patch<ApiResponse<StudentItem>>(
      `/api/teacher/students/${id}`,
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể cập nhật hồ sơ học sinh.");
    }
    return res.data;
  },

  /**
   * Xóa mềm (chuyển thùng rác) hoặc Xóa vĩnh viễn học sinh (Chỉ Admin)
   */
  async deleteStudent(
    id: string,
    permanent: boolean = false
  ): Promise<{ id: string; permanent: boolean }> {
    const query = permanent ? "?permanent=true" : "";
    const res = await http.delete<
      ApiResponse<{ id: string; permanent: boolean }>
    >(`/api/teacher/students/${id}${query}`);
    if (!res.data) {
      throw new Error(res.message || "Không thể xóa hồ sơ học sinh.");
    }
    return res.data;
  },

  /**
   * Khôi phục học sinh từ thùng rác
   */
  async restoreStudent(id: string): Promise<StudentItem> {
    const res = await http.post<ApiResponse<StudentItem>>(
      `/api/teacher/students/${id}/restore`
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể khôi phục hồ sơ học sinh.");
    }
    return res.data;
  },

  /**
   * Chuyển lớp cho 1 học sinh
   */
  async changeClass(
    studentId: string,
    newClassId: string,
    resetProgress: boolean = false
  ): Promise<{ student_id: string; new_class_id: string }> {
    const res = await http.post<
      ApiResponse<{ student_id: string; new_class_id: string }>
    >(`/api/teacher/students/${studentId}/change-class`, {
      new_class_id: newClassId || null,
      reset_progress: resetProgress,
    });
    if (!res.data) {
      throw new Error(res.message || "Không thể chuyển lớp học cho học sinh.");
    }
    return res.data;
  },

  /**
   * Chuyển lớp cho nhiều học sinh hàng loạt
   */
  async batchChangeClass(
    studentIds: string[],
    newClassId: string,
    resetProgress: boolean = false
  ): Promise<{ updated_count: number; new_class_id: string }> {
    const res = await http.post<
      ApiResponse<{ updated_count: number; new_class_id: string }>
    >("/api/teacher/students/batch-change-class", {
      student_ids: studentIds,
      new_class_id: newClassId || null,
      reset_progress: resetProgress,
    });
    if (!res.data) {
      throw new Error(
        res.message || "Không thể chuyển lớp hàng loạt cho học sinh."
      );
    }
    return res.data;
  },

  /**
   * Thưởng / Trừ số xu hoặc Lượt quay may mắn
   */
  async adjustCoins(payload: AdjustCoinsValues): Promise<{
    student_id: string;
    new_coins: number;
    new_spins: number;
  }> {
    const res = await http.post<
      ApiResponse<{
        student_id: string;
        new_coins: number;
        new_spins: number;
      }>
    >(`/api/teacher/students/${payload.student_id}/adjust-coins`, {
      type: payload.type,
      amount: payload.amount,
      spins_change: payload.spins_change ?? 0,
      reason: payload.reason,
    });
    if (!res.data) {
      throw new Error(
        res.message || "Không thể điều chỉnh xu / lượt quay cho học sinh."
      );
    }
    return res.data;
  },

  /**
   * Đặt lại mã PIN cho học sinh
   */
  async resetPin(
    studentId: string,
    newPin: string
  ): Promise<{ student_id: string }> {
    const res = await http.post<ApiResponse<{ student_id: string }>>(
      `/api/teacher/students/${studentId}/reset-pin`,
      {
        new_pin: newPin,
      }
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể đặt lại mã PIN cho học sinh.");
    }
    return res.data;
  },

  /**
   * Bật/Tắt trạng thái hoạt động học sinh (Tạm ngưng / Đang học)
   */
  async toggleStatus(
    studentId: string,
    isActive: boolean
  ): Promise<{ id: string; is_active: boolean }> {
    const res = await http.patch<
      ApiResponse<{ id: string; is_active: boolean }>
    >(`/api/teacher/students/${studentId}/status`, {
      is_active: isActive,
    });
    if (!res.data) {
      throw new Error(
        res.message || "Không thể cập nhật trạng thái hoạt động."
      );
    }
    return res.data;
  },

  /**
   * Mở khóa tài khoản tức thì (khi học sinh bị khóa PIN do nhập sai quá 5 lần)
   */
  async unlockStudent(
    studentId: string
  ): Promise<{ student_id: string; unlocked: boolean }> {
    const res = await http.post<
      ApiResponse<{ student_id: string; unlocked: boolean }>
    >(`/api/teacher/students/${studentId}/unlock`);
    if (!res.data) {
      throw new Error(res.message || "Không thể mở khóa tài khoản học sinh.");
    }
    return res.data;
  },
};
