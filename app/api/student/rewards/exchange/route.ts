import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateRequestBody } from "@/lib/api/validation";
import { authorizeStudentRequest } from "@/lib/auth/guard";
import { getCurrentVietnamMonthYear } from "@/lib/date";
import { getExchangeSettingConfig } from "@/lib/system/serverConfig";
import {
  formatExchangeWindowLabel,
  isWithinExchangeWindow,
} from "@/lib/system/exchangeRules";
import { HttpStatus, formatExchangeHoldTxDescription } from "@/constants";
import { studentRewardExchangeSchema } from "@/features/student/rewards/schemas/rewardSchemas";
import { SubmitRewardExchangeResponseData } from "@/features/student/rewards/types";

/**
 * POST /api/student/rewards/exchange
 * Học sinh gửi yêu cầu đổi xu Heo Đất lấy Tiền mặt hoặc Tự chọn quà
 * - Tính toán lại số xu & VNĐ trên Server từ cấu hình exchange_setting (tránh gian lận từ client)
 * - Khóa dòng FOR UPDATE, trừ xu, tạo đơn pending và ghi sổ cái EXCHANGE_HOLD qua RPC submit_reward_exchange
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeStudentRequest(
      req,
      "Chỉ học sinh mới có thể gửi yêu cầu đổi quà."
    );
    if (!auth.success) {
      return auth.response;
    }

    const validation = await validateRequestBody(
      req,
      studentRewardExchangeSchema
    );
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;
    const exchangeConfig = await getExchangeSettingConfig();
    const { step_coins, vnd_per_step, min_exchange_coins } = exchangeConfig;

    // 1. Kiểm tra lịch mở cổng đổi quà theo ngày trong tháng (giờ Việt Nam)
    if (!isWithinExchangeWindow(exchangeConfig)) {
      const windowLabel = formatExchangeWindowLabel(exchangeConfig);
      return apiError(
        `Cổng đổi quà hiện đang đóng! Con hãy quay lại vào ${windowLabel} nhé.`,
        HttpStatus.FORBIDDEN
      );
    }

    // 2. Kiểm tra điều kiện số xu tối thiểu để mở cổng đổi quà (áp dụng cho cả Tiền mặt và Quà tự chọn)
    const { data: studentBalanceRow, error: studentBalanceError } = await supabase
      .from("users")
      .select("current_coins, is_active")
      .eq("id", auth.session.userId)
      .maybeSingle();

    if (studentBalanceError || !studentBalanceRow) {
      return apiError(
        "Không thể kiểm tra số dư Heo Đất hiện tại của học sinh.",
        HttpStatus.BAD_REQUEST
      );
    }

    if (studentBalanceRow.is_active === false) {
      return apiError(
        "Tài khoản học sinh hiện không hoạt động.",
        HttpStatus.FORBIDDEN
      );
    }

    const currentStudentCoins = Number(studentBalanceRow.current_coins ?? 0);
    if (currentStudentCoins < min_exchange_coins) {
      return apiError(
        `Cổng đổi quà yêu cầu tối thiểu ${min_exchange_coins.toLocaleString("vi-VN")} xu trong Heo Đất! Hiện tại con đang có ${currentStudentCoins.toLocaleString("vi-VN")} xu.`,
        HttpStatus.BAD_REQUEST
      );
    }

    const { month, year } = getCurrentVietnamMonthYear();

    let coinsToExchange = 0;
    let amountVnd = 0;
    let productUrl: string | null = null;

    if (body.choiceType === "cash") {
      if (body.coinsToExchange < min_exchange_coins) {
        return apiError(
          `Số xu tối thiểu để đổi là ${min_exchange_coins.toLocaleString("vi-VN")} xu!`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (body.coinsToExchange % step_coins !== 0) {
        return apiError(
          `Số xu đổi tiền mặt phải là bội số của ${step_coins.toLocaleString("vi-VN")} xu!`,
          HttpStatus.BAD_REQUEST
        );
      }

      coinsToExchange = body.coinsToExchange;
      amountVnd = Math.round((coinsToExchange / step_coins) * vnd_per_step);
    } else {
      amountVnd = Math.round(body.priceVnd);
      coinsToExchange = Math.ceil((amountVnd * step_coins) / vnd_per_step);
      productUrl = body.link;
    }

    if (coinsToExchange <= 0 || amountVnd <= 0) {
      return apiError(
        "Số xu hoặc giá trị quy đổi không hợp lệ.",
        HttpStatus.BAD_REQUEST
      );
    }

    const txDescription = formatExchangeHoldTxDescription(
      body.choiceType,
      coinsToExchange,
      amountVnd
    );

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "submit_reward_exchange",
      {
        p_student_id: auth.session.userId,
        p_choice_type: body.choiceType,
        p_coins_to_exchange: coinsToExchange,
        p_amount_vnd: amountVnd,
        p_shopee_product_url: productUrl,
        p_shopee_note: body.note?.trim() ? body.note.trim() : null,
        p_month: month,
        p_year: year,
        p_tx_description: txDescription,
      }
    );

    if (rpcError) {
      if (rpcError.message.includes("INSUFFICIENT_COINS")) {
        return apiError(
          `Con không đủ ${coinsToExchange.toLocaleString("vi-VN")} xu để thực hiện đổi thưởng này!`,
          HttpStatus.BAD_REQUEST
        );
      }
      if (rpcError.message.includes("STUDENT_NOT_ACTIVE")) {
        return apiError(
          "Tài khoản học sinh hiện không hoạt động.",
          HttpStatus.FORBIDDEN
        );
      }
      if (
        rpcError.message.includes("INVALID_EXCHANGE_AMOUNT") ||
        rpcError.message.includes("INVALID_CHOICE_TYPE")
      ) {
        return apiError(
          "Thông tin quy đổi xu không hợp lệ.",
          HttpStatus.BAD_REQUEST
        );
      }
      console.error("Lỗi RPC submit_reward_exchange:", rpcError.message);
      return apiError(`Không thể gửi yêu cầu đổi quà: ${rpcError.message}`);
    }

    const rawResult =
      rpcData && typeof rpcData === "object" && !Array.isArray(rpcData)
        ? (rpcData as Record<string, unknown>)
        : {};

    const result: SubmitRewardExchangeResponseData = {
      request_id: String(rawResult.request_id ?? ""),
      hold_tx_id: String(rawResult.hold_tx_id ?? ""),
      current_coins: Number(rawResult.current_coins ?? 0),
      coins_to_exchange: Number(rawResult.coins_to_exchange ?? coinsToExchange),
      amount_vnd: Number(rawResult.amount_vnd ?? amountVnd),
      created_at: String(rawResult.created_at ?? new Date().toISOString()),
    };

    return apiSuccess(
      result,
      body.choiceType === "cash"
        ? `Đã gửi yêu cầu đổi ${result.amount_vnd.toLocaleString("vi-VN")}đ tiền mặt thành công!`
        : `Đã gửi yêu cầu đổi quà trị giá ${result.amount_vnd.toLocaleString("vi-VN")}đ thành công!`
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại POST /api/student/rewards/exchange:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi gửi yêu cầu đổi quà.");
  }
}
