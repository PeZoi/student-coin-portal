import { supabase } from "@/lib/supabase/db";
import {
  AuthAction,
  AuthActionType,
  AuthStatus,
  AuthStatusType,
  AuthFailureReason,
  AuthFailureReasonType,
  DeviceType,
  UserRoleType,
} from "@/constants/auth";

export {
  AuthAction,
  type AuthActionType,
  AuthStatus,
  type AuthStatusType,
  AuthFailureReason,
  type AuthFailureReasonType,
  DeviceType,
  type UserRoleType,
};

export interface LogAuthEventParams {
  userId?: string | null;
  phoneZalo: string;
  role?: UserRoleType;
  authAction: AuthActionType;
  status: AuthStatusType;
  failureReason?: AuthFailureReasonType | string | null;
  req: Request;
}

/**
 * Trích xuất địa chỉ IP của Client từ Request Headers
 * - Ưu tiên x-forwarded-for (IP thực khi đi qua Proxy/Vercel/Cloudflare)
 * - Dự phòng x-real-ip
 * - Mặc định 127.0.0.1 khi chạy Localhost
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp?.trim()) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Xác định Vị trí địa lý (Thành phố, Quốc gia) của Client
 * - Khi deploy lên Vercel: Tận dụng các header địa lý có sẵn miễn phí của Vercel Edge Network
 * - Khi chạy ở Localhost: Đánh dấu rõ là môi trường phát triển
 */
export function getClientLocation(req: Request): string {
  const cityRaw = req.headers.get("x-vercel-ip-city");
  const country = req.headers.get("x-vercel-ip-country");

  if (cityRaw && country) {
    try {
      const city = decodeURIComponent(cityRaw);
      return `${city}, ${country}`;
    } catch {
      return `${cityRaw}, ${country}`;
    }
  }

  if (country) {
    return country;
  }

  const ip = getClientIp(req);
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "Localhost (Môi trường phát triển)";
  }

  return "Không xác định";
}

/**
 * Phân tích User-Agent để nhận diện loại thiết bị (mobile, tablet, desktop)
 */
export function getDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "desktop";

  const ua = userAgent.toLowerCase();

  // Kiểm tra tablet trước
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua)) {
    return "tablet";
  }

  // Kiểm tra mobile
  if (/(mobi|ipod|phone|blackberry|opera mini|iemobile|mobile)/i.test(ua)) {
    return "mobile";
  }

  return "desktop";
}

/**
 * Ghi nhật ký xác thực (Authentication Log) vào bảng `auth_logs`
 * - Hoạt động BẤT ĐỒNG BỘ (Non-blocking): Không làm gián đoạn hay làm chậm luồng của người dùng
 * - Tự động bao bọc trong try/catch an toàn tuyệt đối
 */
export async function logAuthEvent(params: LogAuthEventParams): Promise<void> {
  try {
    const ip = getClientIp(params.req);
    const location = getClientLocation(params.req);
    const userAgent = params.req.headers.get("user-agent") || null;
    const deviceType = getDeviceType(userAgent);

    const { error } = await supabase.from("auth_logs").insert({
      user_id: params.userId || null,
      phone_zalo: params.phoneZalo,
      role: params.role || "student",
      auth_action: params.authAction,
      status: params.status,
      failure_reason: params.failureReason || null,
      ip_address: ip,
      location: location,
      user_agent: userAgent,
      device_type: deviceType,
    });

    if (error) {
      console.error("[AuthLogger] Lỗi khi ghi auth_logs:", error.message);
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[AuthLogger] Ngoại lệ khi ghi log xác thực:", error.message);
  }
}
