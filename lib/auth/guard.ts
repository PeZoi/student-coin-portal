import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getAuthSession, getAuthSessionFromRequest, AuthTokenPayload } from "./jwt";
import { apiError } from "@/lib/api/response";
import { HttpStatus, UserRole, AppRoutes } from "@/constants";

/**
 * ==============================================================================
 * 1. SERVER COMPONENT & SERVER ACTION GUARDS (Chuyển hướng tự động qua redirect)
 * ==============================================================================
 */

/**
 * Yêu cầu đăng nhập và phân quyền trong Server Components hoặc Server Actions
 * - Nếu chưa đăng nhập: Tự động redirect về /login
 * - Nếu không đúng quyền: Tự động redirect về /login
 * - Nếu hợp lệ: Trả về AuthTokenPayload an toàn (type-safe)
 *
 * @param allowedRoles Danh sách các vai trò được phép truy cập
 * @returns AuthTokenPayload đã được kiểm tra tính hợp lệ
 */
export async function requireAuth(allowedRoles?: string[]): Promise<AuthTokenPayload> {
  const session = await getAuthSession();

  if (!session) {
    redirect(AppRoutes.LOGIN);
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    redirect(AppRoutes.LOGIN);
  }

  return session;
}

/**
 * Helper yêu cầu quyền Giáo viên / Quản trị viên cho Server Component
 * - Áp dụng cho: TEACHER, SUPER_TEACHER, ADMIN
 */
export async function requireTeacher(): Promise<AuthTokenPayload> {
  return requireAuth([UserRole.TEACHER, UserRole.SUPER_TEACHER, UserRole.ADMIN]);
}

/**
 * Helper yêu cầu quyền Học sinh cho Server Component
 * - Áp dụng cho: STUDENT
 */
export async function requireStudent(): Promise<AuthTokenPayload> {
  return requireAuth([UserRole.STUDENT]);
}

/**
 * ==============================================================================
 * 2. ROUTE HANDLER GUARDS (Phản hồi JSON 401 / 403 chuẩn hóa)
 * ==============================================================================
 */

export type ApiAuthResult =
  | { success: true; session: AuthTokenPayload }
  | { success: false; response: NextResponse };

/**
 * Xác thực và phân quyền cho Route Handlers (API Routes)
 * - Tự động trả về NextResponse lỗi UNAUTHORIZED hoặc FORBIDDEN nếu không hợp lệ
 * - Trả về session type-safe khi hợp lệ
 *
 * @param req Đối tượng Request của API Route
 * @param allowedRoles Danh sách vai trò được cấp phép
 * @param forbiddenMessage Thông điệp khi không đủ quyền hạn
 */
export async function authorizeRequest(
  req: Request,
  allowedRoles?: string[],
  forbiddenMessage = "Bạn không có quyền thực hiện thao tác này."
): Promise<ApiAuthResult> {
  const session = await getAuthSessionFromRequest(req);

  if (!session) {
    return {
      success: false,
      response: apiError("Vui lòng đăng nhập để tiếp tục.", HttpStatus.UNAUTHORIZED),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      success: false,
      response: apiError(forbiddenMessage, HttpStatus.FORBIDDEN),
    };
  }

  return { success: true, session };
}

/**
 * Helper xác thực quyền Giáo viên / Quản trị viên trong Route Handlers
 * - Áp dụng cho: TEACHER, SUPER_TEACHER, ADMIN
 */
export async function authorizeTeacherRequest(
  req: Request,
  forbiddenMessage = "Bạn không có quyền truy cập dữ liệu quản trị."
): Promise<ApiAuthResult> {
  return authorizeRequest(
    req,
    [UserRole.TEACHER, UserRole.SUPER_TEACHER, UserRole.ADMIN],
    forbiddenMessage
  );
}

