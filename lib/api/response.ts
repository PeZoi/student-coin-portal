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
 */
export function apiError(
  error: string,
  statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      statusCode,
      error,
    },
    { status: statusCode }
  );
}
