/**
 * ==============================================================================
 * CẤU HÌNH PHÂN QUYỀN VÀ ĐIỀU HƯỚNG HỆ THỐNG (AUTH & ROLE PERMISSIONS)
 * ==============================================================================
 * - Hằng số routes & quyền hạn được quản lý tập trung tại @/constants/routes
 * - File này cung cấp các helper functions kiểm tra quyền hạn cho proxy / middleware
 * ==============================================================================
 */

import {
  AppRoutes,
  PUBLIC_PAGES,
  PUBLIC_API_PREFIXES,
  ROLE_PERMISSIONS,
  type RoleAccessRule,
} from "@/constants/routes";

export {
  AppRoutes,
  PUBLIC_PAGES,
  PUBLIC_API_PREFIXES,
  ROLE_PERMISSIONS,
  type RoleAccessRule,
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
  return AppRoutes.STUDENT.DASHBOARD;
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
