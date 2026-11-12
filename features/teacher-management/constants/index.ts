import { StaffRole } from "@/features/teacher-management/types";

/**
 * Cấu hình hiển thị nhãn và màu sắc theo vai trò (`role` trong bảng `public.users`)
 */
export const STAFF_ROLE_CONFIG: Record<
  StaffRole,
  {
    label: string;
    shortLabel: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dotColor: string;
  }
> = {
  teacher: {
    label: "Giáo viên phụ trách",
    shortLabel: "Giáo viên",
    description:
      "Quản lý lớp được phân công, giao nhiệm vụ và duyệt bài tập cho học sinh.",
    badgeBg: "#EAF2FF",
    badgeText: "#0A62D6",
    badgeBorder: "#CFE1FB",
    dotColor: "#0A62D6",
  },
  super_teacher: {
    label: "Giáo viên",
    shortLabel: "Giáo viên",
    description:
      "Quản lý danh sách lớp học, học sinh và phân công giáo viên toàn trung tâm.",
    badgeBg: "#F3E8FF",
    badgeText: "#7E22CE",
    badgeBorder: "#E9D5FF",
    dotColor: "#9333EA",
  },
  admin: {
    label: "Quản trị viên (Admin)",
    shortLabel: "Quản trị viên",
    description:
      "Toàn quyền quản trị hệ thống, cấu hình vòng quay, nhân sự và nhật ký an ninh.",
    badgeBg: "#FEF3C7",
    badgeText: "#B45309",
    badgeBorder: "#FDE68A",
    dotColor: "#F59E0B",
  },
};
