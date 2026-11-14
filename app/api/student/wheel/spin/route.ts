import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeStudentRequest } from "@/lib/auth/guard";
import {
  HttpStatus,
  COIN_TX_DESCRIPTIONS,
  formatWheelPrizeTxDescription,
  WHEEL_CONSTANTS,
  WHEEL_PRIZE_TYPES,
} from "@/constants";
import { studentSpinRequestSchema } from "@/features/wheel-management/schemas/wheelSchemas";
import { getStudentWheelInitialDataServer } from "@/features/lucky-wheel/services/luckyWheelServerService";
import { PrizeType, WheelPrize } from "@/features/lucky-wheel/types";
import { defaultWheelConfig } from "@/features/lucky-wheel/data/wheelData";

interface ExecuteWheelSpinRpcResult {
  spin_id: string;
  created_at: string;
  is_free_spin: boolean;
  spin_cost: number;
  actual_reward_coins: number;
  actual_reward_free_spins: number;
  current_coins: number;
  total_earned_coins: number;
  free_spins: number;
}

/**
 * POST /api/student/wheel/spin
 * Thực hiện quay Vòng Quay May Mắn bảo mật trên Server:
 * - Chống gian lận Client-side (Server-authoritative RNG)
 * - Chống lệch kim chỉ khi giáo viên vừa đổi ô (Desync Animation Guard qua client_slot_ids)
 * - Chuẩn hóa tổng xác suất động (Dynamic Normalization)
 * - Khóa dòng FOR UPDATE & thực thi ACID Transaction qua RPC execute_wheel_spin
 * - Lưu Immutable Snapshot vào wheel_spins và ghi sổ cái coin_transactions
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeStudentRequest(
      req,
      "Chỉ học sinh mới có thể quay Vòng Quay May Mắn."
    );
    if (!auth.success) {
      return auth.response;
    }

    const rawBody: unknown = await req.json().catch(() => ({}));
    const validation = studentSpinRequestSchema.safeParse(rawBody);
    const clientSlotIds = validation.success
      ? validation.data.client_slot_ids
      : undefined;

    // 1. Tải danh sách ô đang kích hoạt (chưa xóa mềm) và thiết lập kinh tế mới nhất từ CSDL
    const [prizesRes, settingsRes] = await Promise.all([
      supabase
        .from("wheel_prizes")
        .select(
          "id, slot_order, label, short_label, prize_type, reward_coins, reward_free_spins, probability_weight"
        )
        .eq("is_deleted", false)
        .eq("is_active", true)
        .order("slot_order", { ascending: true }),

      supabase
        .from("system_settings")
        .select("value")
        .eq("key", WHEEL_CONSTANTS.SYSTEM_SETTING_KEY)
        .maybeSingle(),
    ]);

    if (prizesRes.error) {
      return apiError(
        `Lỗi truy xuất danh sách giải thưởng: ${prizesRes.error.message}`
      );
    }

    const activePrizes = prizesRes.data || [];
    if (activePrizes.length < WHEEL_CONSTANTS.MIN_SLOTS) {
      return apiError(
        "Vòng quay hiện đang được giáo viên cập nhật cơ cấu giải thưởng. Bé vui lòng thử lại sau ít phút nhé!",
        HttpStatus.BAD_REQUEST
      );
    }

    let spinCost = defaultWheelConfig.spin_cost;
    let allowFreeSpin = defaultWheelConfig.allow_free_spin;
    let isMaintenance = false;

    if (settingsRes.data && settingsRes.data.value) {
      const val = settingsRes.data.value as Record<string, unknown>;
      if (typeof val.spin_cost === "number") spinCost = val.spin_cost;
      if (typeof val.allow_free_spin === "boolean")
        allowFreeSpin = val.allow_free_spin;
      if (typeof val.is_maintenance === "boolean")
        isMaintenance = val.is_maintenance;
    }

    if (isMaintenance) {
      return apiError(
        "Vòng quay may mắn hiện đang tạm dừng bảo trì để nâng cấp phần thưởng. Bé vui lòng quay lại sau nhé!",
        HttpStatus.FORBIDDEN
      );
    }

    // 2. Chống lệch kim chỉ (Desync Animation Guard):
    const serverSlotIds = activePrizes.map((p) => p.id);
    if (
      Array.isArray(clientSlotIds) &&
      clientSlotIds.length > 0 &&
      clientSlotIds.join("|") !== serverSlotIds.join("|")
    ) {
      const latestData = await getStudentWheelInitialDataServer(auth.session);
      return apiSuccess(
        {
          config_changed: true,
          updated_data: latestData,
        },
        "Giáo viên vừa cập nhật cơ cấu giải thưởng mới! Đĩa quay đã được làm mới, bé hãy bấm quay lại nhé!"
      );
    }

    // 3. Thuật toán bốc thăm ngẫu nhiên theo trọng số trên Server (Dynamic Normalization)
    const totalWeight = activePrizes.reduce(
      (sum, p) =>
        sum +
        Math.max(
          WHEEL_CONSTANTS.MIN_SLOT_WEIGHT,
          Number(p.probability_weight) || WHEEL_CONSTANTS.MIN_SLOT_WEIGHT
        ),
      0
    );

    let randomNum = Math.random() * totalWeight;
    let winningIndex = 0;

    for (let i = 0; i < activePrizes.length; i++) {
      const weight = Math.max(
        WHEEL_CONSTANTS.MIN_SLOT_WEIGHT,
        Number(activePrizes[i].probability_weight) ||
        WHEEL_CONSTANTS.MIN_SLOT_WEIGHT
      );
      if (randomNum < weight) {
        winningIndex = i;
        break;
      }
      randomNum -= weight;
    }

    const selectedRow = activePrizes[winningIndex];
    const rawRewardCoins =
      selectedRow.prize_type === WHEEL_PRIZE_TYPES.DEDUCT_COIN
        ? -Math.abs(Number(selectedRow.reward_coins) || 0)
        : selectedRow.prize_type === WHEEL_PRIZE_TYPES.COIN
          ? Math.abs(Number(selectedRow.reward_coins) || 0)
          : 0;
    const rawRewardFreeSpins =
      selectedRow.prize_type === WHEEL_PRIZE_TYPES.FREE_SPIN
        ? Math.max(1, Number(selectedRow.reward_free_spins) || 1)
        : 0;

    const feeDescription = COIN_TX_DESCRIPTIONS.WHEEL_SPIN_FEE;
    const prizeDescription = formatWheelPrizeTxDescription(
      selectedRow.label,
      rawRewardCoins
    );

    // 4. Gọi Postgres Atomic RPC để khóa dòng FOR UPDATE, trừ phí, cộng thưởng và lưu Snapshot lịch sử
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "execute_wheel_spin",
      {
        p_student_id: auth.session.userId,
        p_prize_id: selectedRow.id,
        p_prize_label: selectedRow.label,
        p_prize_short_label: selectedRow.short_label,
        p_prize_type: selectedRow.prize_type,
        p_reward_coins: rawRewardCoins,
        p_reward_free_spins: rawRewardFreeSpins,
        p_spin_cost: spinCost,
        p_allow_free_spin: allowFreeSpin,
        p_fee_description: feeDescription,
        p_prize_description: prizeDescription,
      }
    );

    if (rpcError) {
      if (rpcError.message.includes("INSUFFICIENT_COINS")) {
        return apiError(
          `Bé cần ít nhất ${spinCost.toLocaleString("vi-VN")} xu để quay lượt này! Hãy làm bài tập để tích lũy thêm xu nhé!`,
          HttpStatus.BAD_REQUEST
        );
      }
      if (rpcError.message.includes("STUDENT_NOT_ACTIVE")) {
        return apiError(
          "Tài khoản học sinh hiện không hoạt động.",
          HttpStatus.FORBIDDEN
        );
      }
      console.error("Lỗi RPC execute_wheel_spin:", rpcError.message);
      return apiError(`Không thể thực hiện lượt quay: ${rpcError.message}`);
    }

    const spinResult = rpcData as ExecuteWheelSpinRpcResult;

    const winningPrize: WheelPrize = {
      id: selectedRow.id,
      slot_order: Number(selectedRow.slot_order) || winningIndex + 1,
      label: selectedRow.label,
      short_label: selectedRow.short_label,
      prize_type:
        (selectedRow.prize_type as PrizeType) || WHEEL_PRIZE_TYPES.COIN,
      reward_coins: spinResult.actual_reward_coins,
      reward_free_spins: spinResult.actual_reward_free_spins,
      probability_weight:
        Number(selectedRow.probability_weight) || WHEEL_CONSTANTS.MIN_SLOT_WEIGHT,
    };

    return apiSuccess({
      config_changed: false,
      prize_index: winningIndex,
      winning_prize: winningPrize,
      spin_result: spinResult,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại POST /api/student/wheel/spin:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi thực hiện lượt quay.");
  }
}
