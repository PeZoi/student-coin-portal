import { HttpStatus, HttpStatusCode } from "@/constants/http";

export { HttpStatus, type HttpStatusCode };

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
