import { AppRoutes } from "@/constants/routes";
import { TeacherDashboardPayload } from "../types";

interface ApiDashboardResponse {
  success: boolean;
  data?: TeacherDashboardPayload;
  message?: string;
}

/**
 * Tầng Service Client gọi Route Handler cho trang Tổng quan Giáo viên
 */
export const dashboardService = {
  /**
   * Lấy toàn bộ dữ liệu tổng quan Dashboard theo lớp học đang chọn
   */
  async getDashboard(classId?: string | null): Promise<TeacherDashboardPayload> {
    const searchParams = new URLSearchParams();
    if (classId && classId !== "all") {
      searchParams.set("classId", classId);
    }

    const query = searchParams.toString();
    const url = `${AppRoutes.API.TEACHER.DASHBOARD}${query ? `?${query}` : ""}`;
    const res = await fetch(url, { method: "GET" });
    const json = (await res.json()) as ApiDashboardResponse;

    if (!res.ok || !json.success || !json.data) {
      throw new Error(
        json.message || "Không thể tải dữ liệu tổng quan lớp học."
      );
    }

    return json.data;
  },
};
