/**
 * ==============================================================================
 * SUPABASE QUERY & DATA HELPER UTILITIES
 * ==============================================================================
 */

/**
 * Kiểu dữ liệu bổ trợ cho quan hệ Join của Supabase (PostgREST có thể trả về đối tượng đơn hoặc mảng 1 phần tử)
 */
export type MaybeArray<T> = T | T[] | null | undefined;

/**
 * Trích xuất an toàn đối tượng đầu tiên từ kết quả Join 1-1 hoặc 1-N của Supabase
 * @param value Giá trị có thể là một đối tượng, mảng đối tượng, null hoặc undefined
 * @returns Đối tượng đầu tiên hoặc null
 */
export function unwrapFirst<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}
