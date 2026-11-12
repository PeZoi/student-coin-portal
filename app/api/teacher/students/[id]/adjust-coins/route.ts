import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import {
  HttpStatus,
  CoinTxType,
  CoinReferenceType,
  formatCoinTxDescription,
} from "@/constants";
import { UserRole } from "@/constants/auth";
import { adjustStudentCoinsSchema } from "@/features/student-management/schemas/studentSchemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teacher/students/[id]/adjust-coins
 * Thưởng hoặc trừ xu Heo Đất & lượt quay may mắn cho học sinh
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền điều chỉnh số xu hoặc lượt quay của học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }
    const { session } = auth;

    const validation = await validateRequestBody(req, adjustStudentCoinsSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { type, amount, spins_change, reason, tx_type } = validation.data;

    // 1. Kiểm tra tài khoản học sinh tồn tại
    const { data: studentRecord, error: findError } = await supabase
      .from("users")
      .select("id, full_name, current_coins, total_earned_coins, free_spins, is_deleted")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .maybeSingle();

    if (findError || !studentRecord) {
      return apiError("Không tìm thấy hồ sơ học sinh yêu cầu.", HttpStatus.NOT_FOUND);
    }

    if (studentRecord.is_deleted) {
      return apiError("Học sinh này đang ở trong thùng rác, không thể điều chỉnh xu/lượt quay.", HttpStatus.BAD_REQUEST);
    }

    const currentCoins = studentRecord.current_coins ?? 0;
    const currentSpins = studentRecord.free_spins ?? 0;
    const totalEarned = studentRecord.total_earned_coins ?? currentCoins;

    // 2. Kiểm tra tính hợp lệ khi trừ
    if (type === "deduct" && amount > currentCoins) {
      return apiError(
        `Số xu trừ (${amount.toLocaleString("vi-VN")} xu) vượt quá số dư hiện tại của bé (${currentCoins.toLocaleString("vi-VN")} xu).`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (spins_change !== undefined && spins_change < 0 && Math.abs(spins_change) > currentSpins) {
      return apiError(
        `Số lượt quay trừ (${Math.abs(spins_change)} lượt) vượt quá số lượt hiện có của bé (${currentSpins} lượt).`,
        HttpStatus.BAD_REQUEST
      );
    }

    // 3. Tính toán số dư mới
    const coinDiff = type === "add" ? amount : -amount;
    const newCoins = Math.max(0, currentCoins + coinDiff);
    const newSpins = Math.max(0, currentSpins + (spins_change || 0));
    const newTotalEarned = type === "add" ? totalEarned + amount : totalEarned;

    // 4. Cập nhật bảng users
    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        current_coins: newCoins,
        free_spins: newSpins,
        total_earned_coins: newTotalEarned,
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
      })
      .eq("id", id);

    if (updateUserError) {
      console.error("Lỗi khi cập nhật xu/lượt quay của học sinh:", updateUserError.message);
      return apiError("Không thể cập nhật số dư của học sinh. Vui lòng thử lại.");
    }

    // 5. Nếu có biến động xu (amount > 0), ghi vào sổ cái coin_transactions
    if (amount > 0) {
      const fullDescription = formatCoinTxDescription(reason, spins_change);

      const resolvedTxType =
        tx_type === CoinTxType.SPEAKING_REWARD
          ? CoinTxType.SPEAKING_REWARD
          : CoinTxType.MANUAL_ADJUST;

      const { error: txError } = await supabase.from("coin_transactions").insert({
        user_id: id,
        amount: coinDiff,
        balance_before: currentCoins,
        balance_after: newCoins,
        tx_type: resolvedTxType,
        reference_type: CoinReferenceType.MANUAL_ADJUST,
        reference_id: null,
        created_by: session.userId,
        description: fullDescription,
        created_at: new Date().toISOString(),
      });

      if (txError) {
        console.error("Cảnh báo ghi log giao dịch xu:", txError.message);
      }
    }

    return apiSuccess(
      {
        student_id: id,
        new_coins: newCoins,
        new_spins: newSpins,
      },
      amount > 0
        ? type === "add"
          ? `Đã thưởng +${amount.toLocaleString("vi-VN")} xu cho bé "${studentRecord.full_name}"!`
          : `Đã trừ ${amount.toLocaleString("vi-VN")} xu của bé "${studentRecord.full_name}".`
        : spins_change && spins_change > 0
        ? `Đã thưởng +${spins_change} lượt quay cho bé "${studentRecord.full_name}"!`
        : `Đã trừ ${Math.abs(spins_change || 0)} lượt quay của bé "${studentRecord.full_name}".`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại POST /api/teacher/students/[id]/adjust-coins:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi điều chỉnh xu hoặc lượt quay.");
  }
}
