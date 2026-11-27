import { AuthFailureReason } from "@/constants/auth";
import {
  ActivityScope,
  AuditLogsPagePayload,
  AuthLogAction,
  LogDeviceType,
  LogUserRole,
} from "../types";

export const AUDIT_LOGS_DEFAULT_PAGE = 1;
export const AUDIT_LOGS_DEFAULT_PAGE_SIZE = 10;
export const AUDIT_LOGS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const ROLE_LABELS: Record<LogUserRole, string> = {
  student: "Học sinh",
  teacher: "Giáo viên",
  super_teacher: "Giáo viên trưởng",
  admin: "Quản trị viên",
};

export const ROLE_BADGE_STYLES: Record<LogUserRole, string> = {
  student: "bg-sky-50 text-sky-700 border-sky-200",
  teacher: "bg-indigo-50 text-indigo-700 border-indigo-200",
  super_teacher: "bg-amber-50 text-amber-800 border-amber-200",
  admin: "bg-slate-100 text-slate-800 border-slate-300",
};

export const AUTH_ACTION_LABELS: Record<AuthLogAction, string> = {
  login: "Đăng nhập",
  logout: "Đăng xuất",
  register: "Đăng ký",
};

export const AUTH_FAILURE_REASON_LABELS: Record<string, string> = {
  [AuthFailureReason.WRONG_PIN]: "Nhập sai mã PIN",
  [AuthFailureReason.WRONG_PASSWORD]: "Nhập sai mật khẩu",
  [AuthFailureReason.ACCOUNT_LOCKED]: "Tài khoản đang bị tạm khóa",
  [AuthFailureReason.USER_NOT_FOUND]: "Không tìm thấy tài khoản",
  [AuthFailureReason.ACCOUNT_INACTIVE]: "Tài khoản đang tạm ngưng",
  [AuthFailureReason.PHONE_ALREADY_EXISTS]: "Số điện thoại đã được đăng ký",
  [AuthFailureReason.INVALID_DATA]: "Thông tin xác thực không hợp lệ",
};

export const DEVICE_LABELS: Record<LogDeviceType, string> = {
  mobile: "Điện thoại",
  tablet: "Máy tính bảng",
  desktop: "Máy tính",
};

export const ACTIVITY_SCOPE_LABELS: Record<ActivityScope, string> = {
  account_pin: "Tài khoản & Mã PIN",
  class_assignment: "Lớp học & Phân công",
  wheel_rewards: "Vòng quay & Quà tặng",
  system_settings: "Cài đặt hệ thống",
  other: "Hoạt động khác",
};

export const ACTIVITY_SCOPE_BADGE_STYLES: Record<ActivityScope, string> = {
  account_pin: "bg-rose-50 text-rose-700 border-rose-200",
  class_assignment: "bg-blue-50 text-blue-700 border-blue-200",
  wheel_rewards: "bg-amber-50 text-amber-800 border-amber-200",
  system_settings: "bg-emerald-50 text-emerald-700 border-emerald-200",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

/**
 * Ánh xạ tên nhóm đối tượng trong CSDL sang phạm vi hiển thị tiếng Việt
 */
export const SCOPE_TO_ENTITY_TYPES: Record<
  Exclude<ActivityScope, "other">,
  readonly string[]
> = {
  account_pin: ["users", "student", "teacher", "pin"],
  class_assignment: ["classes", "teacher_classes", "class"],
  wheel_rewards: [
    "wheel_prizes",
    "wheel_spins",
    "monthly_exchange_requests",
    "rewards",
  ],
  system_settings: ["system_settings", "settings"],
};

export function mapEntityTypeToScope(entityType: string): ActivityScope {
  const normalized = entityType.trim().toLowerCase();
  if (SCOPE_TO_ENTITY_TYPES.account_pin.includes(normalized)) {
    return "account_pin";
  }
  if (SCOPE_TO_ENTITY_TYPES.class_assignment.includes(normalized)) {
    return "class_assignment";
  }
  if (SCOPE_TO_ENTITY_TYPES.wheel_rewards.includes(normalized)) {
    return "wheel_rewards";
  }
  if (SCOPE_TO_ENTITY_TYPES.system_settings.includes(normalized)) {
    return "system_settings";
  }
  return "other";
}

export const EMPTY_AUDIT_LOGS_PAYLOAD: AuditLogsPagePayload = {
  tab: "auth",
  authLogs: [],
  activityLogs: [],
  kpiStats: {
    totalAuthLogs: 0,
    successAuthCount: 0,
    failedAuthCount: 0,
    totalActivityLogs: 0,
  },
  pagination: {
    page: AUDIT_LOGS_DEFAULT_PAGE,
    pageSize: AUDIT_LOGS_DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  },
};
