import { supabase } from "@/lib/supabase/db";
import { MaybeArray, unwrapFirst } from "@/lib/supabase/helpers";
import { AuthTokenPayload } from "@/lib/auth/jwt";
import { unstable_rethrow } from "next/navigation";
import {
  WHEEL_CONSTANTS,
  WHEEL_ASSETS,
  WHEEL_PRIZE_TYPES,
} from "@/constants/wheel";
import { formatShortDateTime } from "@/lib/date";
import {
  WheelSlotItem,
  WheelGeneralSettings,
  WheelStatisticsData,
  WheelPrizeType,
  WheelSpinHistoryItem,
  WheelSpinHistoryPageData,
} from "../types";
import {
  DEFAULT_WHEEL_SETTINGS,
  EMPTY_WHEEL_STATISTICS,
} from "../constants/prizeConfig";
import {
  buildWheelCategories,
  buildTopFrequentItems,
  calculateTheoreticalRtp,
} from "../utils/wheelUtils";

export interface InitialWheelConfigData {
  slots: WheelSlotItem[];
  settings: WheelGeneralSettings;
  stats: WheelStatisticsData;
  initialSpinHistory: WheelSpinHistoryPageData;
}

interface DbWheelStatsSummary {
  total_historical_spins: number;
  total_spins_today: number;
  total_spins_yesterday: number;
  total_coins_rewarded_today: number;
  total_coins_deducted_today: number;
  all_time_rewarded_coins: number;
  all_time_spin_fee_collected: number;
  hit_counts: Record<string, number>;
}

interface JoinedSpinHistoryRow {
  id: string;
  student_id: string;
  prize_id: string | null;
  prize_label_snapshot: string;
  prize_short_label_snapshot: string;
  prize_type_snapshot: string;
  spin_cost: number;
  reward_coins: number;
  reward_free_spins: number;
  is_free_spin: boolean;
  created_at: string;
  users?: MaybeArray<{
    full_name?: string | null;
    avatar_url?: string | null;
    classes?: MaybeArray<{
      class_name?: string | null;
    }>;
  }>;
}

/**
 * Truy xuất danh sách lịch sử quay thưởng theo phân trang (mặc định 20 lượt / trang)
 */
export async function getWheelSpinHistoryPageServer(
  page: number = 1,
  limit: number = WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT
): Promise<WheelSpinHistoryPageData> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const { data, count, error } = await supabase
    .from("wheel_spins")
    .select(
      "id, student_id, prize_id, prize_label_snapshot, prize_short_label_snapshot, prize_type_snapshot, spin_cost, reward_coins, reward_free_spins, is_free_spin, created_at, users(full_name, avatar_url, classes!users_class_id_fkey(class_name))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + safeLimit - 1);

  if (error || !data) {
    if (error) {
      console.error("Lỗi truy vấn lịch sử vòng quay:", error.message);
    }
    return {
      items: [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: 0,
        has_more: false,
      },
    };
  }

  const total = count ?? 0;
  const has_more = offset + data.length < total;

  const items: WheelSpinHistoryItem[] = (
    data as unknown as JoinedSpinHistoryRow[]
  ).map((row) => {
    const userObj = unwrapFirst(row.users);
    const classObj = unwrapFirst(userObj?.classes);

    return {
      id: row.id,
      student_id: row.student_id,
      student_name: userObj?.full_name || "Học sinh",
      class_name: classObj?.class_name || "Chưa xếp lớp",
      avatar_url: userObj?.avatar_url || WHEEL_ASSETS.DEFAULT_AVATAR,
      prize_id: row.prize_id,
      prize_label_snapshot: row.prize_label_snapshot,
      prize_short_label_snapshot:
        row.prize_short_label_snapshot || row.prize_label_snapshot,
      prize_type_snapshot:
        (row.prize_type_snapshot as WheelPrizeType) || WHEEL_PRIZE_TYPES.COIN,
      spin_cost: row.spin_cost || 0,
      reward_coins: row.reward_coins || 0,
      reward_free_spins: row.reward_free_spins || 0,
      is_free_spin: Boolean(row.is_free_spin),
      created_at: formatShortDateTime(row.created_at),
    };
  });

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      has_more,
    },
  };
}

/**
 * Server Service: Truy xuất dữ liệu cấu hình vòng quay trực tiếp từ CSDL Supabase
 * - Chỉ lấy các ô chưa bị xóa mềm (is_deleted = false)
 * - Đẩy toàn bộ phép gộp thống kê (Aggregation) xuống Postgres RPC get_wheel_config_stats (< 2ms, không tải hàng nghìn dòng về Node.js)
 * - Tải song song trang đầu tiên (20 lượt quay gần nhất) để hiển thị ngay lập tức trên SSR
 */
export async function getInitialWheelConfigServer(
  _customSession?: AuthTokenPayload | null
): Promise<InitialWheelConfigData> {
  void _customSession;
  try {
    const [prizesRes, settingsRes, statsRpcRes, initialSpinHistory] =
      await Promise.all([
        supabase
          .from("wheel_prizes")
          .select(
            "id, slot_order, label, short_label, prize_type, reward_coins, reward_free_spins, probability_weight, is_active, is_locked"
          )
          .eq("is_deleted", false)
          .order("slot_order", { ascending: true }),

        supabase
          .from("system_settings")
          .select("value")
          .eq("key", WHEEL_CONSTANTS.SYSTEM_SETTING_KEY)
          .maybeSingle(),

        supabase.rpc("get_wheel_config_stats"),

        getWheelSpinHistoryPageServer(1, WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT),
      ]);

    let settings: WheelGeneralSettings = DEFAULT_WHEEL_SETTINGS;
    if (settingsRes.data && settingsRes.data.value) {
      const val = settingsRes.data.value as Record<string, unknown>;
      settings = {
        spin_cost:
          typeof val.spin_cost === "number"
            ? val.spin_cost
            : DEFAULT_WHEEL_SETTINGS.spin_cost,
        allow_free_spin:
          typeof val.allow_free_spin === "boolean"
            ? val.allow_free_spin
            : DEFAULT_WHEEL_SETTINGS.allow_free_spin,
        daily_free_spins:
          typeof val.daily_free_spins === "number"
            ? val.daily_free_spins
            : DEFAULT_WHEEL_SETTINGS.daily_free_spins,
        is_maintenance:
          typeof val.is_maintenance === "boolean"
            ? val.is_maintenance
            : DEFAULT_WHEEL_SETTINGS.is_maintenance,
      };
    }

    const dbSummary = (statsRpcRes.data as DbWheelStatsSummary | null) || {
      total_historical_spins: 0,
      total_spins_today: 0,
      total_spins_yesterday: 0,
      total_coins_rewarded_today: 0,
      total_coins_deducted_today: 0,
      all_time_rewarded_coins: 0,
      all_time_spin_fee_collected: 0,
      hit_counts: {},
    };

    const totalSpinsCount = Number(dbSummary.total_historical_spins) || 0;
    const hitCounts = dbSummary.hit_counts || {};

    let slots: WheelSlotItem[] = [];
    if (prizesRes.data && prizesRes.data.length > 0) {
      slots = prizesRes.data.map((p, idx) => {
        const hits = Number(hitCounts[p.id]) || 0;
        const actualRate =
          totalSpinsCount > 0
            ? Number(((hits / totalSpinsCount) * 100).toFixed(1))
            : 0;

        return {
          id: p.id,
          slot_order: p.slot_order || idx + 1,
          label: p.label,
          short_label: p.short_label,
          prize_type: p.prize_type as WheelPrizeType,
          reward_coins: p.reward_coins || 0,
          reward_free_spins: p.reward_free_spins || 0,
          probability_weight: p.probability_weight || 10,
          is_active: p.is_active ?? true,
          is_locked: p.is_locked ?? false,
          stats: {
            total_hits: hits,
            actual_rate: actualRate,
          },
        };
      });
    }

    const totalSpinsToday = Number(dbSummary.total_spins_today) || 0;
    const totalSpinsYesterday = Number(dbSummary.total_spins_yesterday) || 0;
    const totalCoinsRewardedToday =
      Number(dbSummary.total_coins_rewarded_today) || 0;
    const totalCoinsDeductedToday =
      Number(dbSummary.total_coins_deducted_today) || 0;
    const allTimeRewardedCoins = Number(dbSummary.all_time_rewarded_coins) || 0;
    const allTimeSpinFeeCollected =
      Number(dbSummary.all_time_spin_fee_collected) || 0;

    const spinsChangeVsYesterday =
      totalSpinsYesterday > 0
        ? Number(
            (
              ((totalSpinsToday - totalSpinsYesterday) / totalSpinsYesterday) *
              100
            ).toFixed(1)
          )
        : totalSpinsToday > 0
        ? 100
        : 0;

    const netCoinsFlow = totalCoinsRewardedToday - totalCoinsDeductedToday;

    const activeSlots = slots.filter((s) => s.is_active);
    const totalWeight = activeSlots.reduce(
      (sum, s) => sum + s.probability_weight,
      0
    );

    const rtpRate =
      allTimeSpinFeeCollected > 0
        ? Number(
            ((allTimeRewardedCoins / allTimeSpinFeeCollected) * 100).toFixed(1)
          )
        : calculateTheoreticalRtp(activeSlots, totalWeight, settings.spin_cost);

    const stats: WheelStatisticsData = {
      total_spins_today: totalSpinsToday,
      total_historical_spins: totalSpinsCount,
      spins_change_vs_yesterday: spinsChangeVsYesterday,
      total_coins_rewarded_today: totalCoinsRewardedToday,
      total_coins_deducted_today: totalCoinsDeductedToday,
      net_coins_flow: netCoinsFlow,
      rtp_rate: rtpRate,
      total_active_slots: activeSlots.length,
      total_weight: totalWeight,
      is_weight_balanced: totalWeight === WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT,
      categories: buildWheelCategories(activeSlots, totalWeight),
      top_frequent_items: buildTopFrequentItems(
        slots,
        totalWeight,
        totalSpinsCount
      ),
    };

    return {
      slots,
      settings,
      stats,
      initialSpinHistory,
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Lỗi khi tải cấu hình vòng quay trên server:", error);
    return {
      slots: [],
      settings: DEFAULT_WHEEL_SETTINGS,
      stats: EMPTY_WHEEL_STATISTICS,
      initialSpinHistory: {
        items: [],
        pagination: {
          page: 1,
          limit: WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT,
          total: 0,
          has_more: false,
        },
      },
    };
  }
}
