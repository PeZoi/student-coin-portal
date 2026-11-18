import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants/http";
import { CoinTxType, CoinReferenceType } from "@/constants/coins";
import { ExchangeRequestStatus } from "@/constants/rewards";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/rewards/[id]/reject
 * Từ chối yêu cầu đổi quà của học sinh
 * - Cập nhật status sang 'rejected' kèm lý do từ chối
 * - Tự động hoàn trả 100% số xu (EXCHANGE_REFUND) vào Heo Đất (users.current_coins)
 * - Ghi nhận sổ cái coin_transactions
 * - Gửi thông báo 'exchange_rejected' cho học sinh
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã yêu cầu đổi quà không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền từ chối yêu cầu đổi quà."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    // Đọc lý do từ chối từ request body (nếu có)
    let reason = "Yêu cầu đổi quà chưa phù hợp.";
    try {
      const body = (await req.json()) as { reason?: string };
      if (body?.reason && body.reason.trim()) {
        reason = body.reason.trim();
      }
    } catch {
      // Body rỗng hoặc không phải JSON hợp lệ -> giữ lý do mặc định
    }

    // 1. Kiểm tra yêu cầu đổi quà trong cơ sở dữ liệu
    const { data: requestRecord, error: findError } = await supabase
      .from("monthly_exchange_requests")
      .select(`
        id,
        student_id,
        choice_type,
        coins_to_exchange,
        amount_vnd,
        shopee_note,
        status,
        student:users!monthly_exchange_requests_student_id_fkey (
          id,
          full_name,
          current_coins
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (findError || !requestRecord) {
      return apiError("Không tìm thấy yêu cầu đổi quà.", HttpStatus.NOT_FOUND);
    }

    if (requestRecord.status !== ExchangeRequestStatus.PENDING) {
      return apiError(
        "Chỉ có thể từ chối các yêu cầu đang ở trạng thái 'Chờ cô duyệt'.",
        HttpStatus.BAD_REQUEST
      );
    }

    const student = Array.isArray(requestRecord.student)
      ? requestRecord.student[0]
      : requestRecord.student;
    const studentName = student?.full_name || "Học sinh";
    const currentCoins = student?.current_coins ?? 0;
    const refundCoins = requestRecord.coins_to_exchange;
    const newCoins = currentCoins + refundCoins;
    const now = new Date().toISOString();

    // 2. Hoàn lại xu vào ví học sinh (users.current_coins)
    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        current_coins: newCoins,
        updated_at: now,
        updated_by: session.userId,
      })
      .eq("id", requestRecord.student_id);

    if (updateUserError) {
      console.error("Lỗi khi hoàn xu cho học sinh:", updateUserError.message);
      return apiError("Không thể hoàn trả xu vào ví học sinh. Vui lòng thử lại.");
    }

    // 3. Ghi nhận giao dịch sổ cái hoàn xu (coin_transactions)
    const { error: txError } = await supabase.from("coin_transactions").insert({
      user_id: requestRecord.student_id,
      amount: refundCoins,
      balance_before: currentCoins,
      balance_after: newCoins,
      tx_type: CoinTxType.EXCHANGE_REFUND,
      reference_type: CoinReferenceType.MONTHLY_EXCHANGE_REQUESTS,
      reference_id: id,
      description: `Hoàn trả ${refundCoins.toLocaleString("vi-VN")} xu Heo Đất do từ chối yêu cầu đổi quà: ${reason}`,
      created_by: session.userId,
      created_at: now,
    });

    if (txError) {
      console.error("Cảnh báo ghi sổ cái hoàn xu:", txError.message);
    }

    // 4. Cập nhật trạng thái yêu cầu sang 'rejected' và lưu lý do vào cột rejection_reason độc lập
    const { error: updateReqError } = await supabase
      .from("monthly_exchange_requests")
      .update({
        status: ExchangeRequestStatus.REJECTED,
        rejection_reason: reason,
        processed_by: session.userId,
        processed_at: now,
        updated_by: session.userId,
        updated_at: now,
      })
      .eq("id", id);

    if (updateReqError) {
      console.error("Lỗi cập nhật trạng thái từ chối:", updateReqError.message);
      return apiError("Không thể cập nhật trạng thái từ chối. Vui lòng thử lại.");
    }

    // 5. Gửi thông báo đến học sinh
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: requestRecord.student_id,
      title: "Yêu cầu đổi quà chưa được chấp thuận",
      content: `Yêu cầu đổi quà của con đã bị từ chối (Lý do: ${reason}). Số xu (${refundCoins.toLocaleString("vi-VN")} xu) đã được hoàn lại vào Heo Đất của con.`,
      type: "exchange_rejected",
      icon_type: "alert-triangle",
      reference_type: "monthly_exchange_requests",
      reference_id: id,
      created_by: session.userId,
      created_at: now,
    });

    if (notifError) {
      console.warn("Cảnh báo gửi thông báo từ chối:", notifError.message);
    }

    return apiSuccess(
      {
        id,
        status: ExchangeRequestStatus.REJECTED,
        rejection_reason: reason,
        refunded_coins: refundCoins,
        processed_at: now,
      },
      `Đã từ chối yêu cầu của học sinh ${studentName} và hoàn lại ${refundCoins.toLocaleString("vi-VN")} xu vào Heo Đất!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/rewards/[id]/reject:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi từ chối yêu cầu đổi quà.");
  }
}
