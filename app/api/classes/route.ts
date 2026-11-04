import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { ClassItem } from "@/features/auth/types";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("classes")
      .select("id, class_name")
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("class_name", { ascending: true });

    if (error) {
      console.error("Lỗi khi tải danh sách lớp học từ Supabase:", error.message);
      return apiError("Không thể lấy danh sách lớp học từ cơ sở dữ liệu.");
    }

    return apiSuccess<ClassItem[]>((data as ClassItem[]) ?? []);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại /api/classes:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách lớp học.");
  }
}
