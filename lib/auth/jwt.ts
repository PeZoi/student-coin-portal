import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  AuthTokenPayload,
  verifyAuthToken,
  getTokenFromCookie,
} from "./token";

export * from "./token";

/**
 * Thiết lập Cookie httpOnly an toàn chứa JWT token
 *
 * @param token Chuỗi JWT token
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true, // Chống XSS: JavaScript client không thể đọc được
    secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS khi ở production
    sameSite: "lax", // Chống CSRF
    maxAge: 10 * 365 * 24 * 60 * 60, // Thời hạn vĩnh viễn (10 năm trên trình duyệt)
    path: "/", // Áp dụng cho toàn bộ portal
  });
}

/**
 * Xóa Cookie xác thực khi đăng xuất
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Đọc và xác thực session hiện tại từ Request Headers trong Route Handlers
 * - Sử dụng trực tiếp `req.headers.get("cookie")` tránh dynamic bailout
 *
 * @param req Đối tượng Request của API Route
 * @returns AuthTokenPayload nếu hợp lệ, ngược lại trả về null
 */
export async function getAuthSessionFromRequest(req: Request): Promise<AuthTokenPayload | null> {
  const token = getTokenFromCookie(req.headers.get("cookie"));
  if (!token) return null;
  return await verifyAuthToken(token);
}

/**
 * Đọc và xác thực session hiện tại từ Cookie trong Server Components hoặc Route Handlers
 *
 * @returns AuthTokenPayload nếu hợp lệ, ngược lại trả về null
 */
export async function getAuthSession(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  return await verifyAuthToken(token);
}
