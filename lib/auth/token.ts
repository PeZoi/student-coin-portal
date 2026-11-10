import { SignJWT, jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, UserRole } from "@/constants/auth";

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
  const secret = process.env.JWT_SECRET || "";
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
 * Xác thực và giải mã JWT Token (Edge-runtime compatible)
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
        role: typeof payload.role === "string" ? payload.role : UserRole.STUDENT,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Trích xuất JWT token từ chuỗi Cookie Header
 *
 * @param cookieHeader Chuỗi header cookie (req.headers.get("cookie"))
 * @returns Token nếu tìm thấy, ngược lại trả về null
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
