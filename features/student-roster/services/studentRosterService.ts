import { http } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types/api";
import { TeacherRosterStudent, MonthlyExchangeRequestItem, RosterAssignedMissionItem } from "../types";

export interface StudentAssignedMissionsResponse {
  student: {
    id: string;
    full_name: string;
    class_id?: string;
    class_name?: string;
  };
  summary: {
    total: number;
    completed: number;
    pending: number;
    unsubmitted: number;
    total_earned_coins: number;
  };
  items: RosterAssignedMissionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface StudentExchangeRequestsResponse {
  student: {
    id: string;
    full_name: string;
  };
  requests: MonthlyExchangeRequestItem[];
}

/**
 * Service gọi API danh sách học sinh theo lớp, tiến độ bài tập & đổi quà (Client)
 */
export const studentRosterService = {
  /**
   * Lấy danh sách học sinh theo lớp (dùng cho SWR revalidate)
   */
  async getRosterStudents(classId?: string, search?: string): Promise<TeacherRosterStudent[]> {
    const params = new URLSearchParams();
    if (classId) params.append("classId", classId);
    if (search) params.append("search", search);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await http.get<ApiResponse<TeacherRosterStudent[]>>(`/api/teacher/roster${qs}`);
    return res.data ?? [];
  },

  /**
   * Lấy danh sách bài tập đã giao phân trang của học sinh
   */
  async getStudentAssignedMissions(
    studentId: string,
    page: number = 1,
    limit: number = 10,
    status: string = "all"
  ): Promise<StudentAssignedMissionsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status,
    });

    const res = await http.get<ApiResponse<StudentAssignedMissionsResponse>>(
      `/api/teacher/students/${studentId}/assigned-missions?${params.toString()}`
    );

    if (!res.data) {
      throw new Error(res.message || "Không thể tải danh sách bài tập của học sinh.");
    }
    return res.data;
  },

  /**
   * Bật / tắt miễn làm một bài tập cho học sinh
   */
  async toggleExemptMission(
    studentId: string,
    missionId: string,
    isExempt: boolean
  ): Promise<{ student_id: string; mission_id: string; status: string }> {
    const res = await http.patch<
      ApiResponse<{ student_id: string; mission_id: string; status: string }>
    >(`/api/teacher/students/${studentId}/assigned-missions/${missionId}/exempt`, {
      is_exempt: isExempt,
    });

    if (!res.data) {
      throw new Error(res.message || "Không thể cập nhật trạng thái bài tập.");
    }
    return res.data;
  },

  /**
   * Lấy lịch sử yêu cầu đổi quà tháng của học sinh
   */
  async getStudentExchangeRequests(
    studentId: string
  ): Promise<StudentExchangeRequestsResponse> {
    const res = await http.get<ApiResponse<StudentExchangeRequestsResponse>>(
      `/api/teacher/students/${studentId}/exchange-requests`
    );

    if (!res.data) {
      throw new Error(res.message || "Không thể tải lịch sử đổi quà của học sinh.");
    }
    return res.data;
  },
};
