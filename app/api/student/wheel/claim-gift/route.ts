import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeStudentRequest } from "@/lib/auth/guard";
import { getCurrentVietnamMonthYear } from "@/lib/date";
import { getExchangeSettingConfig } from "@/lib/system/serverConfig";
import { calculateSpinGiftEquivalentCoins } from "@/lib/system/exchangeRules";
import { HttpStatus } from "@/constants";
import { claimWheelGiftSchema } from "@/features/teacher/wheel-management/schemas/wheelSchemas";
import { ClaimWheelGiftResponseData } from "@/features/student/lucky-wheel/types";

/**
 * POST /api/student/wheel/claim-gift
 * Học sinh mở Hộp quà trúng thưởng Vòng quay để gửi link món quà tuỳ chọn (Spin)
 * - Giới hạn giá trị tối đa theo MAX_SPIN_GIFT_VND (25.000đ)
 * - Không trừ xu trong ví Heo Đất (coins_to_exchange = 0)
 * - Trừ 1 lượt mở Hộp quà (unclaimed_gifts) và tạo đơn monthly_exchange_requests loại 'spin_gift'
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeStudentRequest(
      req,
      "Chỉ học sinh mới có thể mở Hộp quà Vòng quay."
    );
    if (!auth.success) {
      return auth.response;
    }

    const validation = await validateRequestBody(req, claimWheelGiftSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { link, priceVnd, note } = validation.data;
    const exchangeConfig = await getExchangeSettingConfig();
    const roundedPriceVnd = Math.round(priceVnd);

    if (roundedPriceVnd > exchangeConfig.max_spin_gift_vnd) {
      const equivalentCoins = calculateSpinGiftEquivalentCoins(exchangeConfig);
      return apiError(
        `Món quà từ Hộp quà vòng quay chỉ được có giá tối đa ${exchangeConfig.max_spin_gift_vnd.toLocaleString("vi-VN")}đ (tương đương ${equivalentCoins.toLocaleString("vi-VN")} xu).`,
        HttpStatus.BAD_REQUEST
      );
    }

    const { month, year } = getCurrentVietnamMonthYear();

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "claim_wheel_gift_box",
      {
        p_student_id: auth.session.userId,
        p_amount_vnd: roundedPriceVnd,
        p_shopee_product_url: link,
        p_shopee_note: note?.trim() ? note.trim() : null,
        p_month: month,
        p_year: year,
      }
    );

    if (rpcError) {
      if (rpcError.message.includes("NO_UNCLAIMED_GIFTS")) {
        return apiError(
          "Bé hiện không còn hộp quà nào chưa mở. Hãy quay trúng ô Hộp quà để nhận thêm nhé!",
          HttpStatus.BAD_REQUEST
        );
      }
      if (rpcError.message.includes("STUDENT_NOT_ACTIVE")) {
        return apiError(
          "Tài khoản học sinh hiện không hoạt động.",
          HttpStatus.FORBIDDEN
        );
      }
      console.error("Lỗi RPC claim_wheel_gift_box:", rpcError.message);
      return apiError(`Không thể gửi yêu cầu nhận quà: ${rpcError.message}`);
    }

    const rawResult =
      rpcData && typeof rpcData === "object" && !Array.isArray(rpcData)
        ? (rpcData as Record<string, unknown>)
        : {};

    const result: ClaimWheelGiftResponseData = {
      request_id: String(rawResult.request_id ?? ""),
      unclaimed_gifts: Number(rawResult.unclaimed_gifts ?? 0),
      created_at: String(rawResult.created_at ?? new Date().toISOString()),
    };

    return apiSuccess(
      result,
      "Đã gửi yêu cầu nhận quà thành công! Cô sẽ kiểm tra và duyệt quà cho con nhé!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại POST /api/student/wheel/claim-gift:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi gửi yêu cầu nhận quà.");
  }
}
