import { WHEEL_PRIZE_TYPES } from "@/constants/wheel";
import {
  WheelSlotItem,
  WheelCategoryDistribution,
  TopFrequentItem,
} from "../types";
import { WHEEL_PRIZE_TYPES_LIST } from "../constants/prizeConfig";

/**
 * Kiểm tra xem một ô có sự thay đổi so với bản đã lưu hay không (Dùng chung cho Hook & Grid UI)
 */
export function checkIsSlotModified(
  slot: WheelSlotItem,
  savedSlots?: WheelSlotItem[]
): boolean {
  if (!savedSlots) return false;
  const original = savedSlots.find((s) => s.id === slot.id);
  if (!original) return true;
  return (
    original.slot_order !== slot.slot_order ||
    original.label !== slot.label ||
    original.short_label !== slot.short_label ||
    original.prize_type !== slot.prize_type ||
    original.reward_coins !== slot.reward_coins ||
    original.reward_free_spins !== slot.reward_free_spins ||
    original.probability_weight !== slot.probability_weight ||
    original.is_active !== slot.is_active ||
    !!original.is_locked !== !!slot.is_locked
  );
}

/**
 * Tính toán phân bổ cơ cấu 5 nhóm giải thưởng dựa trên các ô đang kích hoạt
 */
export function buildWheelCategories(
  activeSlots: WheelSlotItem[],
  totalWeight: number
): WheelCategoryDistribution[] {
  return WHEEL_PRIZE_TYPES_LIST.map((cfg) => {
    const matching = activeSlots.filter((s) => s.prize_type === cfg.type);
    const groupWeight = matching.reduce(
      (sum, s) => sum + s.probability_weight,
      0
    );

    return {
      type: cfg.type,
      label: cfg.analyticsLabel,
      color: cfg.chartColor,
      badgeBg: cfg.badgeBg,
      badgeText: cfg.badgeLabel,
      total_weight: groupWeight,
      percentage:
        totalWeight > 0 ? Math.round((groupWeight / totalWeight) * 100) : 0,
      slot_count: matching.length,
    };
  });
}

/**
 * Xây dựng danh sách Top 5 ô hay trúng nhất (Thực tế vs Lý thuyết)
 * - Khi chưa có lượt quay thực tế (totalHistoricalSpins === 0), actual_rate hiển thị đúng 0%
 * - Khi đã có lượt quay thực tế, sắp xếp theo total_hits giảm dần rồi theo probability_weight giảm dần
 */
export function buildTopFrequentItems(
  slots: WheelSlotItem[],
  totalWeight: number,
  totalHistoricalSpins: number
): TopFrequentItem[] {
  return [...slots]
    .sort((a, b) => {
      const hitsDiff = (b.stats?.total_hits || 0) - (a.stats?.total_hits || 0);
      if (hitsDiff !== 0) return hitsDiff;
      return b.probability_weight - a.probability_weight;
    })
    .slice(0, 5)
    .map((slot) => {
      const expectedRate =
        slot.is_active && totalWeight > 0
          ? Number(((slot.probability_weight / totalWeight) * 100).toFixed(1))
          : 0;
      const hits = slot.stats?.total_hits || 0;
      const actualRate =
        totalHistoricalSpins > 0
          ? Number(((hits / totalHistoricalSpins) * 100).toFixed(1))
          : 0;
      const diffPercent =
        totalHistoricalSpins > 0
          ? Number((actualRate - expectedRate).toFixed(1))
          : 0;

      return {
        slot_order: slot.slot_order,
        id: slot.id,
        label: slot.label,
        short_label: slot.short_label,
        prize_type: slot.prize_type,
        expected_rate: expectedRate,
        actual_rate: actualRate,
        total_hits: hits,
        diff_percent: diffPercent,
      };
    });
}

/**
 * Tính tỷ lệ hoàn trả kỳ vọng lý thuyết (Theoretical RTP %) dựa trên các ô đang kích hoạt và phí quay
 */
export function calculateTheoreticalRtp(
  activeSlots: WheelSlotItem[],
  totalWeight: number,
  spinCost: number
): number {
  if (spinCost <= 0 || totalWeight <= 0) return 0;

  const expectedReward = activeSlots.reduce((sum, s) => {
    const netCoin =
      s.prize_type === WHEEL_PRIZE_TYPES.COIN
        ? Math.abs(s.reward_coins)
        : s.prize_type === WHEEL_PRIZE_TYPES.DEDUCT_COIN
        ? -Math.abs(s.reward_coins)
        : 0;
    return sum + (s.probability_weight / totalWeight) * netCoin;
  }, 0);

  return Number(
    ((Math.max(0, expectedReward) / spinCost) * 100).toFixed(1)
  );
}
