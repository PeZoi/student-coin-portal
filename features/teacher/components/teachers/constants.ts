import { AvailableClassItem, StaffRole, TeacherStaffItem } from "./types";

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
    description: "Quản lý lớp được phân công, giao nhiệm vụ và duyệt bài tập cho học sinh.",
    badgeBg: "#EAF2FF",
    badgeText: "#0A62D6",
    badgeBorder: "#CFE1FB",
    dotColor: "#0A62D6",
  },
  super_teacher: {
    label: "Tổ trưởng (Super-Teacher)",
    shortLabel: "Tổ trưởng",
    description: "Quản lý danh sách lớp học, học sinh và phân công giáo viên toàn trung tâm.",
    badgeBg: "#F3E8FF",
    badgeText: "#7E22CE",
    badgeBorder: "#E9D5FF",
    dotColor: "#9333EA",
  },
  admin: {
    label: "Quản trị viên (Admin)",
    shortLabel: "Quản trị viên",
    description: "Toàn quyền quản trị hệ thống, cấu hình vòng quay, nhân sự và nhật ký an ninh.",
    badgeBg: "#FEF3C7",
    badgeText: "#B45309",
    badgeBorder: "#FDE68A",
    dotColor: "#F59E0B",
  },
};

/**
 * Danh sách lớp học mẫu đối chiếu trực tiếp từ bảng `public.classes` trong DB
 */
export const INITIAL_AVAILABLE_CLASSES: AvailableClassItem[] = [
  {
    id: "d145866c-c749-4d9b-ac0e-5b939c3e7d79",
    class_name: "Lớp 1A",
    is_active: true,
    student_count: 2,
  },
  {
    id: "8b0c65a0-eeb6-401f-95e6-8a2f726efd69",
    class_name: "Lớp 1B",
    is_active: true,
    student_count: 0,
  },
  {
    id: "97580984-e079-4b80-9b1f-b26ac223fbb0",
    class_name: "Lớp 2A",
    is_active: true,
    student_count: 0,
  },
];

/**
 * Dữ liệu giáo viên mẫu dựa trên 5 bản ghi giáo viên thực tế (`role = 'teacher'`) từ bảng `public.users`, `public.teacher_classes` và `public.auth_logs`
 */
export const INITIAL_MOCK_TEACHERS: TeacherStaffItem[] = [
  {
    id: "2e5090f4-375e-451e-9e87-768818219538",
    username: "teacher",
    full_name: "Cô Giáo Mai",
    email: "mai.teacher@studentcoin.edu.vn",
    phone_zalo: "0912 345 678",
    avatar_url: "/avatar.jpg",
    role: "teacher",
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    assigned_classes: ["Lớp 1B"],
    assigned_class_ids: ["8b0c65a0-eeb6-401f-95e6-8a2f726efd69"],
    last_login_at: "20:15 09/11/2026",
    created_at: "07/11/2026",
  },
  {
    id: "27c3232b-b164-4551-8ed0-877ddbbcbb89",
    username: "teacher_lan",
    full_name: "Cô Trần Thị Lan",
    email: "lan.tran@studentcoin.edu.vn",
    phone_zalo: "0987 654 321",
    avatar_url: "/avatar.jpg",
    role: "teacher",
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    assigned_classes: ["Lớp 1A"],
    assigned_class_ids: ["d145866c-c749-4d9b-ac0e-5b939c3e7d79"],
    last_login_at: "18:30 09/11/2026",
    created_at: "09/11/2026",
  },
  {
    id: "00b66144-f9d5-4d2d-a55f-dbdf6b6676aa",
    username: "teacher_nam",
    full_name: "Thầy Nguyễn Văn Nam",
    email: "nam.nguyen@studentcoin.edu.vn",
    phone_zalo: "0933 888 999",
    avatar_url: "/avatar.jpg",
    role: "teacher",
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    assigned_classes: ["Lớp 2A"],
    assigned_class_ids: ["97580984-e079-4b80-9b1f-b26ac223fbb0"],
    last_login_at: "14:40 08/11/2026",
    created_at: "09/11/2026",
  },
  {
    id: "b6090d3e-5b8d-4a7d-9dc4-08722213da3d",
    username: "assistant_minh",
    full_name: "Thầy Minh (Trợ giảng)",
    email: null,
    phone_zalo: "0977 111 222",
    avatar_url: "/avatar.jpg",
    role: "teacher",
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    assigned_classes: ["Lớp 1A"],
    assigned_class_ids: ["d145866c-c749-4d9b-ac0e-5b939c3e7d79"],
    last_login_at: null,
    created_at: "09/11/2026",
  },
  {
    id: "58a9fe9c-7388-4dd3-b239-c0476e331f3d",
    username: "teacher_ngoc",
    full_name: "Cô Hoàng Bích Ngọc",
    email: "ngoc.hoang@studentcoin.edu.vn",
    phone_zalo: null,
    avatar_url: "/avatar.jpg",
    role: "teacher",
    is_active: false,
    failed_login_attempts: 0,
    locked_until: null,
    assigned_classes: [],
    assigned_class_ids: [],
    last_login_at: null,
    created_at: "09/11/2026",
  },
];
