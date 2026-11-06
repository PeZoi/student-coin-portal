import { NextResponse } from "next/server";
import { ApiResponse, HttpStatus, HttpStatusCode } from "@/types/api";

/**
 * Tạo phản hồi thành công chuẩn cho API Route
 * - Mặc định statusCode là HttpStatus.OK (200), không cần truyền thủ công
 *
 * @param data Dữ liệu trả về
 * @param message Thông điệp kèm theo (tùy chọn)
 * @param statusCode Mã trạng thái HTTP (mặc định 200)
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  statusCode: HttpStatusCode = HttpStatus.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      statusCode,
      data,
      message,
    },
    { status: statusCode }
  );
}

/**
 * Tạo phản hồi lỗi chuẩn cho API Route
 * - Mặc định statusCode là HttpStatus.INTERNAL_SERVER_ERROR (500)
 *
 * @param error Thông điệp lỗi
 * @param statusCode Mã trạng thái HTTP lỗi (mặc định 500)
 * @param data Dữ liệu bổ sung kèm theo lỗi (nếu có, ví dụ trạng thái khóa, số lần thử...)
 */
export function apiError<T = never>(
  error: string,
  statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
  data?: T
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: false,
      statusCode,
      error,
      ...(data !== undefined ? { data } : {}),
    },
    { status: statusCode }
  );
}
