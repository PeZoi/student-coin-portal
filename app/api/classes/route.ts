import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { ClassItem } from "@/features/auth/types";
import { getAuthSessionFromRequest } from "@/lib/auth/jwt";
import { UserRole } from "@/constants/auth";

export async function GET(req: Request) {
  try {
    const session = await getAuthSessionFromRequest(req);

    let query = supabase
      .from("classes")
      .select("id, class_name")
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("class_name", { ascending: true });

    // Nếu là giáo viên thường (teacher), chỉ lấy các lớp được phân công
    if (session && session.role === UserRole.TEACHER) {
      const { data: assignments } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", session.userId);

      const classIds = assignments?.map((a: { class_id: string }) => a.class_id) ?? [];
      if (classIds.length === 0) {
        return apiSuccess<ClassItem[]>([]);
      }
      query = query.in("id", classIds);
    }
    // Nếu là super_teacher hoặc admin hoặc chưa đăng nhập: Lấy toàn bộ danh sách lớp

    const { data, error } = await query;

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
