import { createBrowserClient } from "@supabase/ssr";

/**
 * Khởi tạo Supabase client dành cho Client Components trong trình duyệt
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

