import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Thiếu biến môi trường Supabase: NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );
}

/**
 * Supabase client instance dùng chung cho các API Routes và Server Services
 * - Khởi tạo 1 lần duy nhất (Singleton), không phụ thuộc cookie context
 * - Tránh lỗi prerender trong Next.js App Router
 * - Import 1 dòng là dùng ngay mọi nơi, không cần lặp lại logic khởi tạo
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

