/**
 * ==============================================================================
 * HTTP STATUS CODES CONSTANTS (TRÁNH MAGIC NUMBERS)
 * - Tự động autocomplete qua TypeScript, không cần nhớ mã số
 * - Tránh lỗi gõ nhầm mã HTTP trong toàn bộ dự án
 * ==============================================================================
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

/**
 * Cấu trúc Response chuẩn mực chung cho toàn bộ API trong dự án
 */
export interface ApiResponse<T = unknown> {
  /** Trạng thái thành công của yêu cầu */
  success: boolean;
  /** Mã trạng thái HTTP (200, 201, 400, 401, 403, 404, 500...) */
  statusCode: HttpStatusCode | number;
  /** Dữ liệu trả về khi thành công */
  data?: T;
  /** Thông điệp lỗi chi tiết khi thất bại */
  error?: string;
  /** Thông điệp thông báo thân thiện (nếu có) */
  message?: string;
}
