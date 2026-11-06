import { supabase } from "@/lib/supabase/db";
import { AuthSecurityConfig, SystemPublicConfigs } from "@/types/systemConfig";
import {
  DEFAULT_AUTH_SECURITY_CONFIG,
  DEFAULT_CACHE_TTL_MS,
} from "@/constants/system";

export { DEFAULT_AUTH_SECURITY_CONFIG };

/**
 * Cấu trúc bản ghi cache trong bộ nhớ RAM của Server
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Bộ nhớ đệm In-Memory trên Server
 * - Lưu trữ các cấu hình hệ thống ít biến động
 * - Tránh việc mỗi request API lại tốn một kết nối truy vấn sang cơ sở dữ liệu Supabase
 */
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Lấy một giá trị cấu hình cụ thể theo key từ bảng system_settings
 * - Có cơ chế Server-side In-Memory Caching
 * - Tự động tái sử dụng cache cũ (Stale-on-error) nếu truy vấn DB gặp sự cố
 *
 * @param key Khóa cấu hình (ví dụ: 'auth_security', 'wheel_setting'...)
 * @param ttlMs Thời gian lưu cache tính bằng mili-giây (mặc định 5 phút)
 */
export async function getSystemSetting<T>(
  key: string,
  ttlMs: number = DEFAULT_CACHE_TTL_MS
): Promise<T | null> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  // Nếu cache còn hiệu lực thì lấy ngay lập tức từ RAM (0ms, 0 kết nối Supabase)
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) {
      // Nếu lỗi truy vấn nhưng trong RAM có cache cũ thì tạm dùng cache cũ
      if (cached) return cached.data as T;
      return null;
    }

    const value = data.value as T;
    memoryCache.set(key, {
      data: value,
      expiresAt: now + ttlMs,
    });

    return value;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`[ServerCache] Lỗi khi đọc system_settings [${key}]:`, error.message);
    if (cached) return cached.data as T;
    return null;
  }
}

/**
 * Lấy cấu hình bảo mật xác thực (auth_security) có sẵn Server In-Memory Cache
 * - Dùng cho API Login, Lookup, Reset mã PIN...
 * - Đảm bảo luôn trả về giá trị an toàn, không bao giờ gây gián đoạn luồng đăng nhập
 */
export async function getAuthSecurityConfig(): Promise<AuthSecurityConfig> {
  const rawConfig = await getSystemSetting<Partial<AuthSecurityConfig>>("auth_security");

  if (!rawConfig) {
    return DEFAULT_AUTH_SECURITY_CONFIG;
  }

  return {
    max_failed_attempts:
      typeof rawConfig.max_failed_attempts === "number" && rawConfig.max_failed_attempts > 0
        ? rawConfig.max_failed_attempts
        : DEFAULT_AUTH_SECURITY_CONFIG.max_failed_attempts,
    lockout_minutes:
      typeof rawConfig.lockout_minutes === "number" && rawConfig.lockout_minutes > 0
        ? rawConfig.lockout_minutes
        : DEFAULT_AUTH_SECURITY_CONFIG.lockout_minutes,
  };
}

/**
 * Lấy toàn bộ danh sách cấu hình công khai (is_public = true) có Server In-Memory Cache
 * - Dùng cho API GET /api/system/config phục vụ Client
 */
export async function getPublicSystemConfigs(
  ttlMs: number = DEFAULT_CACHE_TTL_MS
): Promise<SystemPublicConfigs> {
  const cacheKey = "__all_public_configs__";
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.data as SystemPublicConfigs;
  }

  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .eq("is_public", true);

    if (error) {
      if (cached) return cached.data as SystemPublicConfigs;
      throw error;
    }

    const configMap: Record<string, unknown> = {};
    if (data) {
      for (const row of data as { key: string; value: unknown }[]) {
        configMap[row.key] = row.value;
      }
    }

    const result = configMap as unknown as SystemPublicConfigs;
    memoryCache.set(cacheKey, {
      data: result,
      expiresAt: now + ttlMs,
    });

    return result;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[ServerCache] Lỗi khi đọc danh sách cấu hình công khai:", error.message);
    if (cached) return cached.data as SystemPublicConfigs;
    throw error;
  }
}

/**
 * Xóa cache trong RAM khi Admin cập nhật cấu hình hệ thống
 * - Giúp cấu hình mới có hiệu lực ngay lập tức mà không cần chờ hết TTL
 *
 * @param key Tên key cần xóa cache (bỏ trống để xóa toàn bộ cache)
 */
export function invalidateSystemSettingCache(key?: string): void {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
}
