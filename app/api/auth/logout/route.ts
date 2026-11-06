import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { clearAuthCookie, getAuthSession } from "@/lib/auth/jwt";
import { logAuthEvent } from "@/lib/auth/authLogger";
import { AuthAction, AuthStatus, UserRole, type UserRoleType } from "@/constants";

/**
 * POST /api/auth/logout
 * Ghi nhận nhật ký đăng xuất và xóa session cookie
 */
export async function POST(req: Request): Promise<NextResponse> {
  const session = await getAuthSession();

  if (session && session.userId) {
    void logAuthEvent({
      userId: session.userId,
      phoneZalo: session.phone_zalo || "",
      role: (session.role as UserRoleType) || UserRole.STUDENT,
      authAction: AuthAction.LOGOUT,
      status: AuthStatus.SUCCESS,
      req,
    });
  }

  await clearAuthCookie();
  return apiSuccess(null, "Đăng xuất thành công.");
}
