/**
 * ==============================================================================
 * REWARDS & COIN EXCHANGE CONSTANTS & ENUMS
 * - Định nghĩa tập trung các hằng số quy chuẩn đổi thưởng
 * - Đồng bộ 100% với Postgres ENUM trong CSDL:
 *   + monthly_exchange_status
 *   + monthly_exchange_choice
 * ==============================================================================
 */

export const REWARD_CONFIG = {
  /** Bước quy đổi xu mặc định (Ví dụ: 5.000 xu) */
  DEFAULT_COIN_STEP: 5000,
  /** Số tiền VND tương ứng với mỗi bước quy đổi (Ví dụ: 25.000 VNĐ) */
  DEFAULT_VND_PER_STEP: 25000,
  /** Số xu tối thiểu để có thể gửi yêu cầu đổi thưởng */
  MIN_EXCHANGE_COINS: 5000,
} as const;

export const COIN_STEP = REWARD_CONFIG.DEFAULT_COIN_STEP;
export const VND_PER_STEP = REWARD_CONFIG.DEFAULT_VND_PER_STEP;

/**
 * 1. Trạng thái yêu cầu đổi quà hàng tháng (monthly_exchange_requests.status)
 */
export const ExchangeRequestStatus = {
  /** Đang chờ giáo viên / admin xét duyệt */
  PENDING: "pending",
  /** Đã duyệt yêu cầu đổi quà */
  APPROVED: "approved",
  /** Đã trao tiền / quà thực tế thành công */
  COMPLETED: "completed",
  /** Từ chối yêu cầu đổi quà (hoàn lại xu) */
  REJECTED: "rejected",
  /** Học sinh hoặc phụ huynh tự hủy yêu cầu */
  CANCELLED: "cancelled",
} as const;

export type ExchangeRequestStatusType =
  (typeof ExchangeRequestStatus)[keyof typeof ExchangeRequestStatus];
export type ExchangeRequestStatus = ExchangeRequestStatusType;

export const ALL_EXCHANGE_REQUEST_STATUSES: readonly ExchangeRequestStatusType[] = [
  ExchangeRequestStatus.PENDING,
  ExchangeRequestStatus.APPROVED,
  ExchangeRequestStatus.COMPLETED,
  ExchangeRequestStatus.REJECTED,
  ExchangeRequestStatus.CANCELLED,
] as const;

export const EXCHANGE_REQUEST_STATUS_LABELS: Record<ExchangeRequestStatusType, string> = {
  [ExchangeRequestStatus.PENDING]: "Chờ duyệt",
  [ExchangeRequestStatus.APPROVED]: "Đã duyệt",
  [ExchangeRequestStatus.COMPLETED]: "Đã trao thưởng",
  [ExchangeRequestStatus.REJECTED]: "Từ chối",
  [ExchangeRequestStatus.CANCELLED]: "Đã hủy",
};

/**
 * 2. Hình thức nhận quà đổi thưởng (monthly_exchange_requests.choice_type)
 */
export const ExchangeChoiceType = {
  /** Đổi thành tiền thật (VNĐ) qua hình thức nhận tiền mặt hoặc chuyển khoản */
  CASH: "cash",
  /** Đổi thành quà hiện vật qua link sàn TMĐT (Shopee, Tiki, Lazada...) */
  SHOPEE: "shopee",
} as const;

export type ExchangeChoiceTypeValue =
  (typeof ExchangeChoiceType)[keyof typeof ExchangeChoiceType];
export type ExchangeChoiceType = ExchangeChoiceTypeValue;

export const ALL_EXCHANGE_CHOICE_TYPES: readonly ExchangeChoiceTypeValue[] = [
  ExchangeChoiceType.CASH,
  ExchangeChoiceType.SHOPEE,
] as const;

export const EXCHANGE_CHOICE_TYPE_LABELS: Record<ExchangeChoiceTypeValue, string> = {
  [ExchangeChoiceType.CASH]: "Tiền mặt",
  [ExchangeChoiceType.SHOPEE]: "Quà tự chọn",
};
