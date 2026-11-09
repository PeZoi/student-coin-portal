import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { apiError } from "./response";
import { HttpStatus } from "@/constants";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

/**
 * Tiện ích parse và xác thực JSON Body động theo Zod Schema cho API Routes
 * - Tự động bắt lỗi cú pháp JSON và trả về response lỗi BAD_REQUEST chuẩn hóa
 * - Tự động xác thực qua Zod schema và trả về thông báo lỗi chi tiết đầu tiên
 * - Trả về dữ liệu kiểu T an toàn (Type-safe) khi hợp lệ
 *
 * @param req Đối tượng Request gửi lên API
 * @param schema Zod Schema dùng để kiểm tra tính hợp lệ của dữ liệu
 */
export async function validateRequestBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return {
      success: false,
      response: apiError("Dữ liệu gửi lên không đúng định dạng JSON.", HttpStatus.BAD_REQUEST),
    };
  }

  const parseResult = schema.safeParse(body);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    const errorMessage = firstIssue ? firstIssue.message : "Dữ liệu gửi lên không hợp lệ.";
    return {
      success: false,
      response: apiError(errorMessage, HttpStatus.BAD_REQUEST),
    };
  }

  return {
    success: true,
    data: parseResult.data,
  };
}
