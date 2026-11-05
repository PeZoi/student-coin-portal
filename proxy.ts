import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt";
import {
  getRoleDefaultHome,
  hasPermission,
  isPublicApi,
  isPublicPage,
} from "@/lib/auth/routes";

/**
 * ==============================================================================
 * NEXT.JS PROXY (AUTH & ROLE AUTHORIZATION GATEWAY)
 * ==============================================================================
 * - Chạy ở tầng Edge/Server trước khi tới bất kỳ Page hay Route Handler nào.
 * - Public route duy nhất: /login (và các Public Auth APIs).
 * - Tự động bảo vệ tất cả các Private routes: bắt buộc phải có Cookie JWT hợp lệ.
 * - Kiểm tra quyền hạn theo vai trò (role: student / teacher / admin).
 * ==============================================================================
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Cho phép các API công khai đi qua (Login, Register, Lookup, Classes)
  if (isPublicApi(pathname)) {
    return NextResponse.next();
  }

  // 2. Lấy và xác thực JWT token từ httpOnly cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyAuthToken(token) : null;
  const isAuthenticated = Boolean(session && session.userId);

  // 3. Xử lý đường dẫn gốc "/"
  if (pathname === "/") {
    if (isAuthenticated && session) {
      return NextResponse.redirect(
        new URL(getRoleDefaultHome(session.role), request.url)
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Xử lý các trang công khai (hiện tại chỉ có /login)
  if (isPublicPage(pathname)) {
    if (isAuthenticated && session) {
      // Người dùng đã đăng nhập thì tự động đưa về trang chủ tương ứng của họ
      return NextResponse.redirect(
        new URL(getRoleDefaultHome(session.role), request.url)
      );
    }
    return NextResponse.next();
  }

  // 5. Kiểm tra Xác thực (Authentication) cho các Route riêng tư
  if (!isAuthenticated || !session) {
    // Nếu là API route riêng tư -> Phản hồi JSON 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    // Nếu là giao diện trang web -> Chuyển hướng người dùng về /login
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/login") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 6. Kiểm tra Phân quyền theo vai trò (Authorization) cho các Route giao diện
  if (!pathname.startsWith("/api/")) {
    const isAllowed = hasPermission(session.role, pathname);
    if (!isAllowed) {
      // Cố tình truy cập trang ngoài quyền hạn (VD: học sinh gõ /admin) -> Chuyển về đúng trang của họ
      return NextResponse.redirect(
        new URL(getRoleDefaultHome(session.role), request.url)
      );
    }
  }

  return NextResponse.next();
}

/**
 * Cấu hình Matcher: Áp dụng Proxy cho toàn bộ ứng dụng,
 * loại trừ các file tĩnh, ảnh, media và nội bộ Next.js.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|json)$).*)",
  ],
};
