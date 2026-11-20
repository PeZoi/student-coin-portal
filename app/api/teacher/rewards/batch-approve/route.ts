import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants/http";
import { UserRole } from "@/constants/auth";
import { ExchangeRequestStatus, ExchangeChoiceType } from "@/constants/rewards";

interface BatchApproveBody {
  requestIds: string[];
}

/**
 * POST /api/teacher/rewards/batch-approve
 * Duyệt và trao quà hàng loạt (Batch Approve)
 * - Nhận danh sách requestIds
 * - Kiểm tra phân quyền: giáo viên chỉ duyệt học sinh thuộc lớp phụ trách
 * - Cập nhật đồng loạt status sang 'completed'
 * - Gửi thông báo cho từng học sinh
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền duyệt yêu cầu đổi quà."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    let body: BatchApproveBody;
    try {
      body = (await req.json()) as BatchApproveBody;
    } catch {
      return apiError("Dữ liệu gửi lên không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const { requestIds } = body;
    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return apiError(
        "Vui lòng chọn ít nhất một yêu cầu đổi quà để duyệt.",
        HttpStatus.BAD_REQUEST
      );
    }

    if (requestIds.length > 50) {
      return apiError(
        "Mỗi lượt duyệt tối đa 50 yêu cầu.",
        HttpStatus.BAD_REQUEST
      );
    }

    // 1. Lấy danh sách yêu cầu cần duyệt kèm thông tin học sinh
    const { data: rawRequests, error: fetchError } = await supabase
      .from("monthly_exchange_requests")
      .select(`
        id,
        student_id,
        choice_type,
        amount_vnd,
        status,
        student:users!monthly_exchange_requests_student_id_fkey (
          id,
          full_name,
          class_id
        )
      `)
      .in("id", requestIds)
      .eq("status", ExchangeRequestStatus.PENDING);

    if (fetchError) {
      console.error("Lỗi khi tải danh sách duyệt hàng loạt:", fetchError.message);
      return apiError("Không thể tải thông tin yêu cầu đổi quà.");
    }

    if (!rawRequests || rawRequests.length === 0) {
      return apiError(
        "Không tìm thấy yêu cầu hợp lệ nào ở trạng thái 'Chờ cô duyệt'.",
        HttpStatus.BAD_REQUEST
      );
    }

    // 2. Kiểm tra phân quyền theo lớp học nếu là Giáo viên thường
    let validRequests = rawRequests;
    if (session.role === UserRole.TEACHER) {
      const { data: teacherClasses, error: tcError } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", session.userId);

      if (tcError) {
        console.error("Lỗi lấy danh sách lớp giáo viên:", tcError.message);
        return apiError("Lỗi xác thực quyền lớp học.");
      }

      const allowedClassIds = new Set(
        teacherClasses?.map((tc) => tc.class_id) ?? []
      );

      validRequests = rawRequests.filter((reqItem) => {
        const student = Array.isArray(reqItem.student)
          ? reqItem.student[0]
          : reqItem.student;
        return student?.class_id && allowedClassIds.has(student.class_id);
      });

      if (validRequests.length === 0) {
        return apiError(
          "Bạn không có quyền duyệt học sinh thuộc các lớp này.",
          HttpStatus.FORBIDDEN
        );
      }
    }

    const validIds = validRequests.map((r) => r.id);
    const now = new Date().toISOString();

    // 3. Cập nhật đồng loạt trạng thái sang 'completed'
    const { error: updateError } = await supabase
      .from("monthly_exchange_requests")
      .update({
        status: ExchangeRequestStatus.COMPLETED,
        processed_by: session.userId,
        processed_at: now,
        updated_by: session.userId,
        updated_at: now,
      })
      .in("id", validIds);

    if (updateError) {
      console.error("Lỗi cập nhật hàng loạt:", updateError.message);
      return apiError("Không thể duyệt các yêu cầu đã chọn. Vui lòng thử lại.");
    }

    // 4. Gửi thông báo đến từng học sinh
    const notificationsToInsert = validRequests.map((r) => {
      const desc =
        r.choice_type === ExchangeChoiceType.CASH
          ? `tiền mặt ${r.amount_vnd.toLocaleString("vi-VN")} đ`
          : r.choice_type === ExchangeChoiceType.SPIN_GIFT
            ? "món quà trúng thưởng vòng quay"
            : "món quà tặng tự chọn";

      return {
        user_id: r.student_id,
        title: "Yêu cầu đổi quà đã được duyệt!",
        content: `Cô giáo đã duyệt ${desc} của con. Chúc mừng con nhé!`,
        type: "exchange_fulfilled",
        icon_type: "gift",
        reference_type: "monthly_exchange_requests",
        reference_id: r.id,
        created_by: session.userId,
        created_at: now,
      };
    });

    if (notificationsToInsert.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notificationsToInsert);

      if (notifError) {
        console.warn("Cảnh báo gửi thông báo hàng loạt:", notifError.message);
      }
    }

    return apiSuccess(
      {
        approved_count: validIds.length,
        approved_ids: validIds,
      },
      `Đã duyệt và trao quà thành công cho ${validIds.length} học sinh!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại POST /api/teacher/rewards/batch-approve:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi duyệt hàng loạt.");
  }
}
