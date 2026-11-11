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
    /** Danh sách học sinh của một lớp học cụ thể */
    STUDENTS: (id: string) => `class-students-${id}`,
  },

  // 2. Giáo viên (Teachers)
  TEACHERS: {
    /** Danh sách giáo viên khả dụng để phân công vào lớp học */
    AVAILABLE: "available-teachers",
    /** Danh sách đầy đủ nhân sự giáo viên (Quản lý giáo viên) */
    MANAGE_ALL: "manage-teachers-all",
    /** Danh sách lớp học khả dụng để phân công cho giáo viên */
    AVAILABLE_CLASSES: "teachers-available-classes",
  },

  // 3. Học sinh (Students)
  STUDENTS: {
    /** Danh sách đầy đủ học sinh toàn trường (Quản lý học sinh) */
    MANAGE_ALL: "manage-students-all",
  },
} as const;

export type CacheKeysType = typeof CACHE_KEYS;
