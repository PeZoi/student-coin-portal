import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants/http";
import { UserRole } from "@/constants/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/teacher/students/[id]/exchange-requests
 * Lấy lịch sử yêu cầu đổi quà tháng (tiền mặt / Shopee) của học sinh
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xem lịch sử đổi quà của học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }

    // 1. Kiểm tra tài khoản học sinh
    const { data: studentRecord, error: studentError } = await supabase
      .from("users")
      .select("id, full_name, class_id")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (studentError || !studentRecord) {
      return apiError("Không tìm thấy thông tin học sinh.", HttpStatus.NOT_FOUND);
    }

    // 2. Truy vấn danh sách yêu cầu đổi quà từ monthly_exchange_requests
    const { data: requestsData, error: reqError } = await supabase
      .from("monthly_exchange_requests")
      .select(`
        id,
        month,
        year,
        student_id,
        choice_type,
        coins_to_exchange,
        amount_vnd,
        shopee_product_url,
        shopee_note,
        status,
        processed_by,
        processed_at,
        created_at
      `)
      .eq("student_id", id)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .order("created_at", { ascending: false });

    if (reqError) {
      console.error("Lỗi khi tải monthly_exchange_requests:", reqError.message);
      return apiError("Không thể tải lịch sử đổi quà của học sinh.");
    }

    return apiSuccess({
      student: {
        id: studentRecord.id,
        full_name: studentRecord.full_name,
      },
      requests: requestsData || [],
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET exchange-requests:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải lịch sử đổi quà.");
  }
}
