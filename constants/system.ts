import { AuthSecurityConfig } from "@/types/systemConfig";

/**
 * ==============================================================================
 * SYSTEM & CACHE CONSTANTS
 * ==============================================================================
 */

/**
 * Thời gian sống mặc định của In-Memory Cache trên Server: 5 phút (300.000 ms)
 */
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Giá trị cấu hình bảo mật mặc định (Fallback an toàn khi mất kết nối DB)
 */
export const DEFAULT_AUTH_SECURITY_CONFIG: AuthSecurityConfig = {
  max_failed_attempts: 5,
  lockout_minutes: 15,
};
