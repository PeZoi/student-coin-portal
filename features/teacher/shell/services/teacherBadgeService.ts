import { AppRoutes } from "@/constants/routes";

export interface TeacherSidebarBadgesData {
  pendingRewards: number;
  pendingSubmissions: number;
}

/**
 * Service Client lấy số lượng thông báo / badge hiển thị trên Sidebar của Giáo viên
 */
export const teacherBadgeService = {
  async getSidebarBadges(
    classId?: string | null
  ): Promise<TeacherSidebarBadgesData> {
    const url =
      classId && classId !== "all"
        ? `${AppRoutes.API.TEACHER.SIDEBAR_BADGES}?classId=${encodeURIComponent(classId)}`
        : AppRoutes.API.TEACHER.SIDEBAR_BADGES;

    const res = await fetch(url, {
      method: "GET",
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Không thể tải số lượng badges");
    }

    return (data.data ?? {
      pendingRewards: 0,
      pendingSubmissions: 0,
    }) as TeacherSidebarBadgesData;
  },
};
