/**
 * ==============================================================================
 * SWR CACHE KEYS CONSTANTS
 * - Định nghĩa tập trung các Cache Key thực tế đang được sử dụng trong toàn hệ thống
 * - Tránh hardcode chuỗi bừa bãi (Magic Strings), chống đụng độ key (Key Collisions)
 * - Giúp quản lý Revalidation và Mutation đồng bộ, chính xác
 * ==============================================================================
 */

export const CACHE_KEYS = {
  // 1. Lớp học (Classes)
  CLASSES: {
    /** Danh sách tất cả lớp học trong trang Quản lý lớp học (Giáo viên / Admin) */
    ALL: "teacher-classes",
    /** Danh sách lớp học đang hoạt động phục vụ đăng ký / xác thực */
    ACTIVE: "active-classes",
    /** Danh sách các lớp được phân công cho giáo viên hiện tại */
    MY_CLASSES: "teacher-my-classes",
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
    /** Chi tiết thông tin học sinh */
    DETAIL: (id: string) => `student-detail-${id}`,
    /** Danh sách lịch sử giao dịch xu của học sinh */
    TRANSACTIONS: (studentId: string, page?: number) =>
      page !== undefined
        ? `student-transactions-${studentId}-p${page}`
        : `student-transactions-${studentId}`,
  },

  // 4. Quản lý Giao bài tập (Mission Management)
  MISSIONS: {
    /** Danh sách bài tập được giao (hỗ trợ lọc theo lớp workspace) */
    ALL: (classId?: string | null) =>
      classId ? (["teacher-missions", classId] as const) : "teacher-missions",
    /** Chi tiết một bài tập cụ thể */
    DETAIL: (id: string) => `mission-detail-${id}`,
    /** Danh sách chi tiết tiến độ làm bài của học sinh theo bài tập */
    PROGRESS: (missionId: string) => ["mission-progress", missionId] as const,
  },

  // 5. Sổ lớp & Điểm danh học sinh (Student Roster)
  ROSTER: {
    /** Prefix định danh cache danh sách học sinh theo lớp (dùng cho globalMutate regex/filter) */
    STUDENTS_PREFIX: "roster-students",
    /** Danh sách học sinh theo lớp học trong Sổ lớp */
    STUDENTS: (classId?: string | null) =>
      classId
        ? (["roster-students", classId] as const)
        : "roster-students-empty",
    /** Lịch sử yêu cầu đổi quà của học sinh trong modal */
    EXCHANGE_REQUESTS: (studentId: string) =>
      `exchange-requests-${studentId}`,
    /** Danh sách bài tập đã giao cho học sinh cụ thể (Infinite scroll) */
    ASSIGNED_MISSIONS: (studentId: string, tab: string = "all") =>
      `roster-assigned-missions-${studentId}-${tab}`,
  },

  // 6. Vòng quay may mắn (Lucky Wheel)
  WHEEL: {
    /** Cấu hình vòng quay may mắn của giáo viên / quản trị viên */
    CONFIG: "teacher-wheel-config",
    /** Dữ liệu vòng quay may mắn của học sinh (Client Portal) */
    STUDENT_DATA: "student-wheel-data",
    /** Lịch sử lượt quay thực tế của học sinh (Infinite Scroll) */
    SPIN_HISTORY: (page?: number) =>
      page !== undefined
        ? `teacher-wheel-spins-p${page}`
        : "teacher-wheel-spins",
    /** Lịch sử lượt quay may mắn trong Modal học sinh (Infinite Scroll: Toàn bộ / Bản thân) */
    STUDENT_HISTORY: (tab: "all" | "personal", page?: number) =>
      page !== undefined
        ? (["student-wheel-history", tab, page] as const)
        : (["student-wheel-history", tab] as const),
  },

  // 7. Duyệt bài tập Studio (Submission Management)
  SUBMISSIONS: {
    /** Danh sách bài nộp chờ duyệt hoặc lọc theo bài tập */
    QUEUE: (missionId?: string | null) =>
      missionId
        ? (["teacher-submissions", missionId] as const)
        : "teacher-submissions",
    /** Chi tiết một bài nộp cụ thể */
    DETAIL: (submissionId: string) => `submission-detail-${submissionId}`,
  },

  // 8. Bảng xếp hạng (Leaderboard)
  LEADERBOARD: {
    /** Bảng xếp hạng theo chu kỳ tháng và theo lớp */
    MONTHLY: (period: string = "current_month", classId: string = "all") =>
      `leaderboard-${period}-${classId}`,
  },

  // 9. Quản lý Đổi quà & Heo Đất (Reward Management)
  REWARDS: {
    /** Danh sách yêu cầu đổi quà tháng của giáo viên (hỗ trợ lọc theo lớp, tháng, năm) */
    LIST: (
      classId?: string | null,
      month?: number | "all",
      year?: number | "all"
    ) =>
      [
        "teacher-rewards",
        classId ?? "all",
        month ?? "all",
        year ?? "all",
      ] as const,
  },

  // 10. Xác thực & Cấu hình Hệ thống (Auth & System)
  SYSTEM: {
    /** Phiên đăng nhập người dùng hiện tại */
    CURRENT_USER: "auth-me",
    /** Cấu hình hệ thống chung (Heo đất, tỷ giá xu, bảo trì) */
    CONFIG: "system-config",
  },

  // 11. Layout & Sidebar Badges
  SIDEBAR: {
    /** Số lượng thông báo / badge hiển thị trên menu Sidebar giáo viên (hỗ trợ lọc theo lớp workspace) */
    TEACHER_BADGES: (classId?: string | null) =>
      classId
        ? (["teacher-sidebar-badges", classId] as const)
        : "teacher-sidebar-badges",
    /** Prefix định danh cache sidebar badges để revalidate toàn bộ */
    TEACHER_BADGES_PREFIX: "teacher-sidebar-badges",
  },
} as const;

export type CacheKeysType = typeof CACHE_KEYS;
