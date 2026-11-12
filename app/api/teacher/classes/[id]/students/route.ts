import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, UserRole } from "@/constants";
import { ClassStudentItem } from "@/features/class-management/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/teacher/classes/[id]/students
 * Lấy danh sách học sinh thuộc lớp học cụ thể
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: classId } = await params;
    if (!classId) {
      return apiError("Mã lớp học không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(req, "Bạn không có quyền xem danh sách học sinh.");
    if (!auth.success) {
      return auth.response;
    }

    // 1. Kiểm tra lớp học có tồn tại không
    const { data: classRecord, error: classFindError } = await supabase
      .from("classes")
      .select("id, class_name")
      .eq("id", classId)
      .maybeSingle();

    if (classFindError || !classRecord) {
      return apiError("Lớp học không tồn tại.", HttpStatus.NOT_FOUND);
    }

    // 2. Lấy danh sách học sinh trong lớp
    const { data: students, error: studentsError } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        username,
        phone_zalo,
        avatar_url,
        current_coins,
        total_earned_coins,
        is_active,
        created_at
      `)
      .eq("class_id", classId)
      .eq("role", UserRole.STUDENT)
      .eq("is_deleted", false)
      .order("full_name", { ascending: true });

    if (studentsError) {
      console.error("Lỗi khi tải danh sách học sinh của lớp:", studentsError.message);
      return apiError("Không thể tải danh sách học sinh của lớp.");
    }

    return apiSuccess<ClassStudentItem[]>(
      ((students as unknown) as ClassStudentItem[]) ?? []
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/classes/[id]/students:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi tải danh sách học sinh.");
  }
}
