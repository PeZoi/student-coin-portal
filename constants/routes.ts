import { UserRole } from "./auth";

/**
 * ==============================================================================
 * APPLICATION ROUTES CONSTANTS
 * - Tập trung toàn bộ đường dẫn Routing thực tế đã triển khai trong hệ thống
 * - Giáo viên và Quản trị viên (Admin) dùng chung cổng điều khiển /teacher
 * ==============================================================================
 */

export const AppRoutes = {
  // Trang chủ & Xác thực công khai
  HOME: "/",
  LOGIN: "/login",

  // Phân hệ Học sinh (Student Portal) - Đã triển khai
  STUDENT: {
    DASHBOARD: "/student",
    MISSIONS: "/student/missions",
    WHEEL: "/student/wheel",
    REWARDS: "/student/rewards",
    LEADERBOARD: "/student/leaderboard",
    TEST_AI: "/student/test-ai",
  },

  // Phân hệ Quản trị & Giáo viên dùng chung (Staff / Teacher Portal) - Đã triển khai
  TEACHER: {
    DASHBOARD: "/teacher",
    SUBMISSIONS: "/teacher/submissions",
    SUBMISSION_DETAIL: (id: string) => `/teacher/submissions/${id}`,
    STUDENT_GRADING: (missionId: string, studentId: string) =>
      `/teacher/submissions/${missionId}/${studentId}`,
    MISSIONS: "/teacher/missions",
    REWARDS: "/teacher/rewards",
    STUDENTS: "/teacher/students",
    LEADERBOARD: "/teacher/leaderboard",
    // Quản lý cấp Trường (Dành cho Super-Teacher & Admin)
    CLASSES: "/teacher/manage-classes",
    MANAGE_STUDENTS: "/teacher/manage-students",
    MANAGE_TEACHERS: "/teacher/manage-teachers",
    // Quản trị Hệ thống Tối cao (Độc quyền Admin)
    SYSTEM_SETTINGS: "/teacher/system-settings",
    WHEEL_CONFIG: "/teacher/wheel-config",
    AUDIT_LOGS: "/teacher/audit-logs",
  },

  // API Endpoints nội bộ - Đã triển khai
  API: {
    AUTH: {
      LOGIN: "/api/auth/login",
      STAFF_LOGIN: "/api/auth/staff-login",
      REGISTER: "/api/auth/register",
      LOGOUT: "/api/auth/logout",
      LOOKUP: "/api/auth/lookup",
      ME: "/api/auth/me",
    },
    CLASSES: "/api/classes",
    STUDENT: {
      WHEEL: "/api/student/wheel",
      WHEEL_SPIN: "/api/student/wheel/spin",
      WHEEL_HISTORY: "/api/student/wheel/history",
      WHEEL_CLAIM_GIFT: "/api/student/wheel/claim-gift",
      REWARDS_EXCHANGE: "/api/student/rewards/exchange",
    },
    TEACHER: {
      DASHBOARD: "/api/teacher/dashboard",
      CLASSES: "/api/teacher/classes",
      MY_CLASSES: "/api/teacher/my-classes",
      TEACHERS: "/api/teacher/teachers",
      CLASS_DETAIL: (id: string) => `/api/teacher/classes/${id}`,
      CLASS_RESTORE: (id: string) => `/api/teacher/classes/${id}/restore`,
      CLASS_TEACHERS: (id: string) => `/api/teacher/classes/${id}/teachers`,
      CLASS_STUDENTS: (id: string) => `/api/teacher/classes/${id}/students`,
      BATCH: "/api/teacher/classes/batch",
      // Quản lý nhân sự Giáo viên
      STAFF: "/api/teacher/teachers",
      STAFF_DETAIL: (id: string) => `/api/teacher/teachers/${id}`,
      STAFF_CLASSES: (id: string) => `/api/teacher/teachers/${id}/classes`,
      STAFF_RESET_PASSWORD: (id: string) => `/api/teacher/teachers/${id}/reset-password`,
      STAFF_RESTORE: (id: string) => `/api/teacher/teachers/${id}/restore`,
      STAFF_BATCH: "/api/teacher/teachers/batch",
      STAFF_AVAILABLE_CLASSES: "/api/teacher/teachers/available-classes",
      // Quản lý Học sinh
      STUDENTS: "/api/teacher/students",
      STUDENT_DETAIL: (id: string) => `/api/teacher/students/${id}`,
      STUDENT_RESTORE: (id: string) => `/api/teacher/students/${id}/restore`,
      STUDENT_CHANGE_CLASS: (id: string) => `/api/teacher/students/${id}/change-class`,
      STUDENT_BATCH_CHANGE_CLASS: "/api/teacher/students/batch-change-class",
      STUDENT_ADJUST_COINS: (id: string) => `/api/teacher/students/${id}/adjust-coins`,
      STUDENT_RESET_PIN: (id: string) => `/api/teacher/students/${id}/reset-pin`,
      STUDENT_STATUS: (id: string) => `/api/teacher/students/${id}/status`,
      STUDENT_UNLOCK: (id: string) => `/api/teacher/students/${id}/unlock`,
      STUDENT_COIN_TRANSACTIONS: (id: string) => `/api/teacher/students/${id}/coin-transactions`,
      STUDENT_ASSIGNED_MISSIONS: (id: string) => `/api/teacher/students/${id}/assigned-missions`,
      STUDENT_ASSIGNED_MISSION_EXEMPT: (studentId: string, missionId: string) => `/api/teacher/students/${studentId}/assigned-missions/${missionId}/exempt`,
      STUDENT_EXCHANGE_REQUESTS: (id: string) => `/api/teacher/students/${id}/exchange-requests`,
      ROSTER: "/api/teacher/roster",
      // Quản lý Vòng quay may mắn
      WHEEL_CONFIG: "/api/teacher/wheel-config",
      WHEEL_SPINS_HISTORY: "/api/teacher/wheel-config/spins",
      // Quản lý Giao bài tập
      MISSIONS: "/api/teacher/missions",
      MISSION_DETAIL: (id: string) => `/api/teacher/missions/${id}`,
      MISSION_STATUS: (id: string) => `/api/teacher/missions/${id}/status`,
      MISSION_RESTORE: (id: string) => `/api/teacher/missions/${id}/restore`,
      MISSION_PERMANENT: (id: string) => `/api/teacher/missions/${id}/permanent`,
      MISSION_BATCH: "/api/teacher/missions/batch",
      MISSION_PROGRESS: (id: string) => `/api/teacher/missions/${id}/progress`,
      // Duyệt bài tập (Submission Management)
      SUBMISSIONS: "/api/teacher/submissions",
      SUBMISSION_MISSION_DETAIL: (missionId: string) =>
        `/api/teacher/submissions/missions/${missionId}`,
      SUBMISSION_APPROVE: (submissionId: string) =>
        `/api/teacher/submissions/${submissionId}/approve`,
      SUBMISSION_REJECT: (submissionId: string) =>
        `/api/teacher/submissions/${submissionId}/reject`,
      SUBMISSION_BATCH_APPROVE: "/api/teacher/submissions/batch-approve",
      // Quản lý Đổi quà & Heo Đất (Reward Management)
      REWARDS: "/api/teacher/rewards",
      REWARD_APPROVE: (id: string) => `/api/teacher/rewards/${id}/approve`,
      REWARD_REJECT: (id: string) => `/api/teacher/rewards/${id}/reject`,
      REWARD_BATCH_APPROVE: "/api/teacher/rewards/batch-approve",
      // Sidebar Badges
      SIDEBAR_BADGES: "/api/teacher/sidebar-badges",
    },
    SYSTEM: {
      CONFIG: "/api/system/config",
    },
    ADMIN: {
      SYSTEM_SETTINGS: "/api/admin/system-settings",
      SYSTEM_SETTINGS_TEST_AI: "/api/admin/system-settings/test-ai",
      AUDIT_LOGS: "/api/admin/audit-logs",
    },
    TEST_AI: {
      GRADE: "/api/test-ai/grade",
    },
  },
} as const;

/**
 * Danh sách các đường dẫn giao diện (Pages) công khai (không cần đăng nhập)
 */
export const PUBLIC_PAGES: readonly string[] = [
  AppRoutes.LOGIN,
];

/**
 * Danh sách các tiền tố API công khai (không yêu cầu token xác thực)
 */
export const PUBLIC_API_PREFIXES: readonly string[] = [
  AppRoutes.API.AUTH.LOGIN,
  AppRoutes.API.AUTH.STAFF_LOGIN,
  AppRoutes.API.AUTH.LOOKUP,
  AppRoutes.API.AUTH.REGISTER,
  AppRoutes.API.CLASSES,
];

/**
 * Cấu hình quyền hạn truy cập theo từng vai trò (Role-Based Access Control)
 */
export interface RoleAccessRule {
  /** Các tiền tố route mà vai trò này được phép truy cập */
  allowedPrefixes: readonly string[];
  /** Trang chủ mặc định khi đăng nhập thành công hoặc khi truy cập sai quyền */
  defaultHome: string;
}

export const ROLE_PERMISSIONS: Record<string, RoleAccessRule> = {
  // Học sinh: Chỉ được truy cập khu vực /student
  [UserRole.STUDENT]: {
    allowedPrefixes: [AppRoutes.STUDENT.DASHBOARD],
    defaultHome: AppRoutes.STUDENT.DASHBOARD,
  },

  // Giáo viên: Truy cập khu vực /teacher và được xem /student
  [UserRole.TEACHER]: {
    allowedPrefixes: [AppRoutes.TEACHER.DASHBOARD, AppRoutes.STUDENT.DASHBOARD],
    defaultHome: AppRoutes.TEACHER.DASHBOARD,
  },

  // Tổ trưởng / Khối trưởng (Super-Teacher): Quản lý toàn bộ lớp học và xem /student
  [UserRole.SUPER_TEACHER]: {
    allowedPrefixes: [AppRoutes.TEACHER.DASHBOARD, AppRoutes.STUDENT.DASHBOARD],
    defaultHome: AppRoutes.TEACHER.DASHBOARD,
  },

  // Quản trị viên (Admin): Dùng chung khu vực /teacher (kèm menu mở rộng của Admin) và /student
  [UserRole.ADMIN]: {
    allowedPrefixes: [AppRoutes.TEACHER.DASHBOARD, AppRoutes.STUDENT.DASHBOARD],
    defaultHome: AppRoutes.TEACHER.DASHBOARD,
  },
};
