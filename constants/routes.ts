import { UserRole } from "./auth";

/**
 * ==============================================================================
 * APPLICATION ROUTES CONSTANTS
 * - Tập trung toàn bộ đường dẫn Routing thực tế đã triển khai trong hệ thống
 * - Chỉ định nghĩa những route ĐÃ CÓ trong dự án (Không tạo route ảo chưa làm)
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

  // API Endpoints nội bộ - Đã triển khai
  API: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      LOGOUT: "/api/auth/logout",
      LOOKUP: "/api/auth/lookup",
      ME: "/api/auth/me",
    },
    CLASSES: "/api/classes",
    SYSTEM: {
      CONFIG: "/api/system/config",
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

  // Giáo viên: Hiện tại chưa có giao diện /teacher, tạm điều hướng về /student
  [UserRole.TEACHER]: {
    allowedPrefixes: [AppRoutes.STUDENT.DASHBOARD],
    defaultHome: AppRoutes.STUDENT.DASHBOARD,
  },

  // Quản trị viên: Hiện tại chưa có giao diện /admin, tạm điều hướng về /student
  [UserRole.ADMIN]: {
    allowedPrefixes: [AppRoutes.STUDENT.DASHBOARD],
    defaultHome: AppRoutes.STUDENT.DASHBOARD,
  },
};
