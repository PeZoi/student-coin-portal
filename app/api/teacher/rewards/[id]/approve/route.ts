import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants/http";
import { UserRole } from "@/constants/auth";
import { ExchangeRequestStatus, ExchangeChoiceType } from "@/constants/rewards";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/rewards/[id]/approve
 * Duyệt yêu cầu đổi quà của học sinh
 * - Kiểm tra phân quyền: giáo viên thường chỉ được duyệt học sinh lớp mình phụ trách
 * - Cập nhật status sang 'completed'
 * - Ghi nhận processed_by và processed_at
 * - Gửi thông báo 'exchange_fulfilled' vào hộp thư của học sinh
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã yêu cầu đổi quà không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền duyệt yêu cầu đổi quà."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // 1. Kiểm tra yêu cầu đổi quà trong cơ sở dữ liệu
    const { data: requestRecord, error: findError } = await supabase
      .from("monthly_exchange_requests")
      .select(`
        id,
        student_id,
        choice_type,
        coins_to_exchange,
        amount_vnd,
        status,
        student:users!monthly_exchange_requests_student_id_fkey (
          id,
          full_name,
          class_id
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (findError || !requestRecord) {
      return apiError("Không tìm thấy yêu cầu đổi quà.", HttpStatus.NOT_FOUND);
    }

    if (requestRecord.status !== ExchangeRequestStatus.PENDING) {
      return apiError(
        "Chỉ có thể duyệt các yêu cầu đang ở trạng thái 'Chờ cô duyệt'.",
        HttpStatus.BAD_REQUEST
      );
    }

    const student = Array.isArray(requestRecord.student)
      ? requestRecord.student[0]
      : requestRecord.student;

    // 2. Kiểm tra phân quyền lớp: Giáo viên thường chỉ duyệt được học sinh thuộc lớp phụ trách
    if (session.role === UserRole.TEACHER) {
      const studentClassId = student?.class_id;
      if (!studentClassId) {
        return apiError(
          "Học sinh này chưa được phân bổ vào lớp học nào.",
          HttpStatus.FORBIDDEN
        );
      }

      const { data: isAssigned, error: classCheckError } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", session.userId)
        .eq("class_id", studentClassId)
        .maybeSingle();

      if (classCheckError || !isAssigned) {
        return apiError(
          "Bạn không được phân công phụ trách lớp của học sinh này.",
          HttpStatus.FORBIDDEN
        );
      }
    }

    const now = new Date().toISOString();

    // 2. Cập nhật trạng thái thành 'completed'
    const { error: updateError } = await supabase
      .from("monthly_exchange_requests")
      .update({
        status: ExchangeRequestStatus.COMPLETED,
        processed_by: session.userId,
        processed_at: now,
        updated_by: session.userId,
        updated_at: now,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Lỗi cập nhật trạng thái đổi quà:", updateError.message);
      return apiError("Không thể duyệt yêu cầu đổi quà. Vui lòng thử lại.");
    }

    // 3. Gửi thông báo đến học sinh
    const studentName = student?.full_name || "Học sinh";
    const isCash = requestRecord.choice_type === ExchangeChoiceType.CASH;
    const rewardDescription = isCash
      ? `tiền mặt ${requestRecord.amount_vnd.toLocaleString("vi-VN")} đ`
      : "món quà tặng tự chọn";

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: requestRecord.student_id,
      title: "Yêu cầu đổi quà đã được duyệt!",
      content: `Cô giáo đã duyệt ${rewardDescription} của con. Chúc mừng con nhé!`,
      type: "exchange_fulfilled",
      icon_type: "gift",
      reference_type: "monthly_exchange_requests",
      reference_id: id,
      created_by: session.userId,
      created_at: now,
    });

    if (notifError) {
      console.warn("Cảnh báo gửi thông báo cho học sinh:", notifError.message);
    }

    return apiSuccess(
      {
        id,
        status: ExchangeRequestStatus.COMPLETED,
        processed_at: now,
      },
      `Đã duyệt thành công yêu cầu ${rewardDescription} của học sinh ${studentName}!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/rewards/[id]/approve:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi duyệt yêu cầu đổi quà.");
  }
}
