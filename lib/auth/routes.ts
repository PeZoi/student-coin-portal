/**
 * ==============================================================================
 * CẤU HÌNH PHÂN QUYỀN VÀ ĐIỀU HƯỚNG HỆ THỐNG (AUTH & ROLE PERMISSIONS CONFIG)
 * ==============================================================================
 * Dễ dàng tinh chỉnh, thêm bớt route hoặc phân quyền vai trò về sau tại đây.
 */

/**
 * Danh sách các đường dẫn giao diện (Pages) công khai.
 * Người dùng chưa đăng nhập có thể truy cập mà không bị chuyển hướng.
 */
export const PUBLIC_PAGES: readonly string[] = [
  "/login",
];

/**
 * Danh sách các tiền tố API công khai (không yêu cầu token xác thực).
 */
export const PUBLIC_API_PREFIXES: readonly string[] = [
  "/api/auth/login",
  "/api/auth/lookup",
  "/api/auth/register",
  "/api/classes",
];

/**
 * Cấu hình quyền hạn truy cập theo từng vai trò (Role-Based Access Control).
 */
export interface RoleAccessRule {
  /** Các tiền tố route mà vai trò này được phép truy cập */
  allowedPrefixes: readonly string[];
  /** Trang chủ mặc định khi đăng nhập thành công hoặc khi truy cập sai quyền */
  defaultHome: string;
}

export const ROLE_PERMISSIONS: Record<string, RoleAccessRule> = {
  // Học sinh: Chỉ được truy cập khu vực /student
  student: {
    allowedPrefixes: ["/student"],
    defaultHome: "/student",
  },

  // Giáo viên: Truy cập khu vực quản trị /teacher
  teacher: {
    allowedPrefixes: ["/teacher"],
    defaultHome: "/teacher/dashboard",
  },

  // Quản trị viên (Admin): Toàn quyền truy cập cả /admin và /student
  admin: {
    allowedPrefixes: ["/admin", "/student"],
    defaultHome: "/admin/dashboard",
  },
};

/**
 * Kiểm tra xem một pathname có phải là trang công khai không
 */
export function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGES.includes(pathname);
}

/**
 * Kiểm tra xem một pathname có phải là API công khai không
 */
export function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Lấy trang chủ mặc định theo vai trò (Role)
 */
export function getRoleDefaultHome(role?: string): string {
  if (role && ROLE_PERMISSIONS[role]) {
    return ROLE_PERMISSIONS[role].defaultHome;
  }
  return "/student";
}

/**
 * Kiểm tra xem người dùng có vai trò `role` có quyền truy cập vào `pathname` hay không
 */
export function hasPermission(role: string, pathname: string): boolean {
  const rule = ROLE_PERMISSIONS[role];
  if (!rule) {
    return false;
  }

  // Quản trị viên admin có thể cấu hình wildcard nếu cần
  return rule.allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
}
