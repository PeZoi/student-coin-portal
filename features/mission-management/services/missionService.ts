import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { AppRoutes } from "@/constants/routes";
import {
  TeacherMissionItem,
  MissionFormValues,
  MissionStudentProgressItem,
} from "../types";

export interface GetMissionsParams {
  classId?: string;
  status?: string;
  search?: string;
}

/**
 * Service Client quản lý các yêu cầu API Bài tập phía Giáo viên
 */
export const missionService = {
  /**
   * Lấy danh sách toàn bộ bài tập (hỗ trợ lọc theo lớp, trạng thái, tìm kiếm)
   */
  async getMissions(params?: GetMissionsParams): Promise<TeacherMissionItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.classId && params.classId !== "all") {
      searchParams.set("classId", params.classId);
    }
    if (params?.status && params.status !== "all") {
      searchParams.set("status", params.status);
    }
    if (params?.search && params.search.trim()) {
      searchParams.set("search", params.search.trim());
    }

    const queryString = searchParams.toString();
    const url = queryString
      ? `${AppRoutes.API.TEACHER.MISSIONS}?${queryString}`
      : AppRoutes.API.TEACHER.MISSIONS;

    const res = await http.get<ApiResponse<TeacherMissionItem[]>>(url);
    return res.data ?? [];
  },

  /**
   * Tạo bài tập mới và tự động gán vào các lớp được chọn
   */
  async createMission(
    payload: MissionFormValues
  ): Promise<TeacherMissionItem> {
    const res = await http.post<ApiResponse<TeacherMissionItem>>(
      AppRoutes.API.TEACHER.MISSIONS,
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể tạo bài tập mới.");
    }
    return res.data;
  },

  /**
   * Cập nhật thông tin bài tập và phân công lớp
   */
  async updateMission(
    id: string,
    payload: Partial<MissionFormValues>
  ): Promise<TeacherMissionItem> {
    const res = await http.put<ApiResponse<TeacherMissionItem>>(
      AppRoutes.API.TEACHER.MISSION_DETAIL(id),
      payload
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể cập nhật bài tập.");
    }
    return res.data;
  },

  /**
   * Bật / Tắt nhận bài nhanh
   */
  async toggleMissionStatus(
    id: string,
    isActive: boolean
  ): Promise<{ id: string; is_active: boolean }> {
    const res = await http.patch<
      ApiResponse<{ id: string; is_active: boolean }>
    >(AppRoutes.API.TEACHER.MISSION_STATUS(id), { is_active: isActive });
    if (!res.data) {
      throw new Error(res.message || "Không thể đổi trạng thái bài tập.");
    }
    return res.data;
  },

  /**
   * Xóa mềm bài tập (qua RPC safe_delete_mission)
   */
  async deleteMission(
    id: string
  ): Promise<{ resultType: string }> {
    const res = await http.delete<ApiResponse<{ resultType: string }>>(
      AppRoutes.API.TEACHER.MISSION_DETAIL(id)
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể xóa bài tập.");
    }
    return res.data;
  },

  /**
   * Khôi phục bài tập từ thùng rác
   */
  async restoreMission(id: string): Promise<boolean> {
    const res = await http.post<ApiResponse<boolean>>(
      AppRoutes.API.TEACHER.MISSION_RESTORE(id),
      {}
    );
    return Boolean(res.data);
  },

  /**
   * Xóa vĩnh viễn bài tập (dành cho Admin)
   */
  async permanentDeleteMission(id: string): Promise<boolean> {
    const res = await http.delete<ApiResponse<boolean>>(
      AppRoutes.API.TEACHER.MISSION_PERMANENT(id)
    );
    return Boolean(res.data);
  },

  /**
   * Thực hiện các thao tác theo lô (Batch Action)
   */
  async batchActions(
    action: "activate" | "deactivate" | "delete_soft" | "restore" | "delete_permanent",
    ids: string[]
  ): Promise<{ affectedCount: number }> {
    const res = await http.post<ApiResponse<{ affectedCount: number }>>(
      AppRoutes.API.TEACHER.MISSION_BATCH,
      { action, ids }
    );
    if (!res.data) {
      throw new Error(res.message || "Không thể thực hiện thao tác hàng loạt.");
    }
    return res.data;
  },

  /**
   * Lấy chi tiết tiến độ nộp bài của học sinh cho bài tập cụ thể
   */
  async getMissionProgress(
    id: string
  ): Promise<MissionStudentProgressItem[]> {
    const res = await http.get<
      ApiResponse<{ students: MissionStudentProgressItem[] }>
    >(AppRoutes.API.TEACHER.MISSION_PROGRESS(id));
    return res.data?.students ?? [];
  },
};
