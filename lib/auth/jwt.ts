import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/constants/auth";

export { AUTH_COOKIE_NAME };

/**
 * Payload chứa trong JWT Token
 * - Gồm userId, phone_zalo (hoặc username) và role để phục vụ Authentication & Authorization
 */
export interface AuthTokenPayload {
  userId: string;
  phone_zalo?: string | null;
  username?: string | null;
  role: string;
}

// Khóa bí mật dùng để ký và xác thực token (HS256)
const getSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET || "student_coin_portal_jwt_secret_key_2026_super_secure_32chars";
  return new TextEncoder().encode(secret);
};

/**
 * Ký và tạo JWT Token
 * - Thuật toán: HS256
 * - Thời hạn: Vĩnh viễn (không bao giờ hết hạn)
 *
 * @param payload Gồm userId, role, và phone_zalo / username
 * @returns Chuỗi JWT token
 */
export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  const secretKey = getSecretKey();

  return await new SignJWT({
    userId: payload.userId,
    phone_zalo: payload.phone_zalo || "",
    username: payload.username || "",
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(secretKey);
}

/**
 * Xác thực và giải mã JWT Token
 *
 * @param token Chuỗi JWT token
 * @returns Payload nếu hợp lệ, ngược lại trả về null
 */
export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (typeof payload.userId === "string") {
      return {
        userId: payload.userId,
        phone_zalo: typeof payload.phone_zalo === "string" ? payload.phone_zalo : "",
        username: typeof payload.username === "string" ? payload.username : "",
        role: typeof payload.role === "string" ? payload.role : "student",
      };
    }

    return null;
  } catch {
    return null;
  }
}

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
