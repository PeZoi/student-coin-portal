/**
 * ==============================================================================
 * SWR CACHE KEYS CONSTANTS
 * - Định nghĩa tập trung các Cache Key thực tế đang được sử dụng trong hệ thống
 * - Tránh hardcode chuỗi bừa bãi (Magic Strings), chống đụng độ key (Key Collisions)
 * ==============================================================================
 */

export const CACHE_KEYS = {
  // 1. Lớp học (Classes)
  CLASSES: {
    /** Danh sách tất cả lớp học trong trang Quản lý lớp học (Giáo viên / Admin) */
    ALL: "teacher-classes",
    /** Danh sách lớp học đang hoạt động phục vụ đăng ký / xác thực */
    ACTIVE: "active-classes",
  },

  // 2. Giáo viên (Teachers)
  TEACHERS: {
    /** Danh sách giáo viên khả dụng để phân công vào lớp học */
    AVAILABLE: "available-teachers",
  },
} as const;

export type CacheKeysType = typeof CACHE_KEYS;
