import { StudentClassOption, StudentItem } from "./types";

/**
 * Danh sách lớp học chuẩn đối chiếu trực tiếp từ bảng `public.classes` trong DB
 */
export const INITIAL_STUDENT_CLASSES: StudentClassOption[] = [
  {
    id: "d145866c-c749-4d9b-ac0e-5b939c3e7d79",
    class_name: "Lớp 1A",
    is_active: true,
    student_count: 24,
  },
  {
    id: "8b0c65a0-eeb6-401f-95e6-8a2f726efd69",
    class_name: "Lớp 1B",
    is_active: true,
    student_count: 22,
  },
  {
    id: "97580984-e079-4b80-9b1f-b26ac223fbb0",
    class_name: "Lớp 2A",
    is_active: true,
    student_count: 26,
  },
  {
    id: "c8e2f1a9-4501-49b8-a764-10ab92ef33c1",
    class_name: "Lớp 2B",
    is_active: true,
    student_count: 20,
  },
  {
    id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
    class_name: "Lớp 3A1",
    is_active: true,
    student_count: 28,
  },
];

/**
 * Dữ liệu học sinh mẫu dựa trên bảng `public.users` (role = 'student'),
 * tích hợp dữ liệu thật từ DB (Phúc Lét, Phạm Ngọc Viễn Đông) và các trường hợp nghiệp vụ thực tế.
 */
export const INITIAL_MOCK_STUDENTS: StudentItem[] = [
  {
    id: "d6545664-22c5-4e07-bf6b-2ae5c15d1405",
    full_name: "Phúc Lét",
    phone_zalo: "0703995861",
    pin_number: "9999",
    class_id: "97580984-e079-4b80-9b1f-b26ac223fbb0",
    class_name: "Lớp 2A",
    avatar_url: "/avatar.jpg",
    current_coins: 350,
    free_spins: 2,
    total_earned_coins: 720,
    is_active: true,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    created_at: "06/11/2026",
  },
  {
    id: "af9d14bb-170f-440e-b85d-66a46e41e9d6",
    full_name: "Phạm Ngọc Viễn Đông",
    phone_zalo: "0813535314",
    pin_number: "0000",
    class_id: "d145866c-c749-4d9b-ac0e-5b939c3e7d79",
    class_name: "Lớp 1A",
    avatar_url: "/avatar.jpg",
    current_coins: 580,
    free_spins: 1,
    total_earned_coins: 1100,
    is_active: true,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    created_at: "04/11/2026",
  },
  {
    id: "c18a4d70-3d75-43a9-9521-8eb90bcfc701",
    full_name: "Nguyễn Minh An",
    phone_zalo: "0912345678",
    pin_number: "1234",
    class_id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
    class_name: "Lớp 3A1",
    avatar_url: "/avatar.jpg",
    current_coins: 1250,
    free_spins: 5,
    total_earned_coins: 2450,
    is_active: true,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    created_at: "02/11/2026",
  },
  {
    id: "e43b1289-9a2c-4e89-8d54-1b4570fae802",
    full_name: "Trần Bảo Ngọc",
    phone_zalo: "0988765432",
    pin_number: "2024",
    class_id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
    class_name: "Lớp 3A1",
    avatar_url: "/avatar.jpg",
    current_coins: 980,
    free_spins: 3,
    total_earned_coins: 1800,
    is_active: true,
    is_deleted: false,
    failed_login_attempts: 1,
    locked_until: null,
    created_at: "03/11/2026",
  },
  {
    id: "f87c2934-11bc-40f8-8ef7-32dc89ea4103",
    full_name: "Đỗ Thùy Linh",
    phone_zalo: "0904112233",
    pin_number: "5555",
    class_id: "d145866c-c749-4d9b-ac0e-5b939c3e7d79",
    class_name: "Lớp 1A",
    avatar_url: "/avatar.jpg",
    current_coins: 690,
    free_spins: 0,
    total_earned_coins: 1350,
    is_active: true,
    is_deleted: false,
    failed_login_attempts: 5,
    locked_until: "2026-11-10T22:30:00.000Z",
    created_at: "01/11/2026",
  },
  {
    id: "a99c8120-65de-4b12-9c3f-76a0b943d204",
    full_name: "Hoàng Gia Bảo",
    phone_zalo: "0977445566",
    pin_number: "6789",
    class_id: "97580984-e079-4b80-9b1f-b26ac223fbb0",
    class_name: "Lớp 2A",
    avatar_url: "/avatar.jpg",
    current_coins: 840,
    free_spins: 2,
    total_earned_coins: 1600,
    is_active: true,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    created_at: "05/11/2026",
  },
  {
    id: "b22e7019-33aa-44ee-b789-99ff0123c505",
    full_name: "Lê Phương Thảo",
    phone_zalo: "0933889900",
    pin_number: "8888",
    class_id: "8b0c65a0-eeb6-401f-95e6-8a2f726efd69",
    class_name: "Lớp 1B",
    avatar_url: "/avatar.jpg",
    current_coins: 420,
    free_spins: 0,
    total_earned_coins: 800,
    is_active: false,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    created_at: "07/11/2026",
  },
  {
    id: "d55a6612-88ef-41bc-b234-77cc6543e606",
    full_name: "Vũ Hải Đăng",
    phone_zalo: "0966332211",
    pin_number: "1111",
    class_id: "8b0c65a0-eeb6-401f-95e6-8a2f726efd69",
    class_name: "Lớp 1B",
    avatar_url: "/avatar.jpg",
    current_coins: 510,
    free_spins: 1,
    total_earned_coins: 950,
    is_active: true,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    created_at: "08/11/2026",
  },
  {
    id: "e99f1122-44bb-42aa-9876-00aa11223344",
    full_name: "Bùi Tuấn Kiệt",
    phone_zalo: "0944556677",
    pin_number: "2222",
    class_id: null,
    class_name: "Chưa phân lớp",
    avatar_url: "/avatar.jpg",
    current_coins: 100,
    free_spins: 0,
    total_earned_coins: 100,
    is_active: true,
    is_deleted: false,
    failed_login_attempts: 0,
    locked_until: null,
    created_at: "09/11/2026",
  },
];

/**
 * Tiện ích xác định cấp bậc Heo Đất từ số dư xu
 */
export function getPiggyTier(coins: number): {
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
} {
  if (coins >= 1000) {
    return {
      name: "Hoàng Kim",
      badgeBg: "#FEF3C7",
      badgeText: "#B45309",
      badgeBorder: "#FDE68A",
    };
  }
  if (coins >= 600) {
    return {
      name: "Bạc",
      badgeBg: "#F1F5F9",
      badgeText: "#475569",
      badgeBorder: "#CBD5E1",
    };
  }
  if (coins >= 300) {
    return {
      name: "Đồng",
      badgeBg: "#FFF7ED",
      badgeText: "#C2410C",
      badgeBorder: "#FFEDD5",
    };
  }
  return {
    name: "Tập sự",
    badgeBg: "#F8FAFC",
    badgeText: "#64748B",
    badgeBorder: "#E2E8F0",
  };
}

/**
 * Lấy chữ cái đầu tiên làm Avatar đại diện
 */
export function getStudentInitial(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return "S";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1].charAt(0).toUpperCase()
  );
}

