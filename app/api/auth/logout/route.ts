import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { clearAuthCookie } from "@/lib/auth/jwt";

/**
 * POST /api/auth/logout
 * Xóa session cookie để đăng xuất người dùng
 */
export async function POST(): Promise<NextResponse> {
  await clearAuthCookie();
  return apiSuccess(null, "Đăng xuất thành công.");
}
