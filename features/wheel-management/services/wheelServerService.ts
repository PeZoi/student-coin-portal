import { supabase } from "@/lib/supabase/db";
import { getAuthSession, AuthTokenPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/constants";
import { unstable_rethrow } from "next/navigation";
import {
  WheelSlotItem,
  WheelGeneralSettings,
  WheelStatisticsData,
  WheelPrizeType,
} from "../types";
import { initialMockStatistics, initialMockSettings } from "../data/mockWheelConfig";

export interface InitialWheelConfigData {
  slots: WheelSlotItem[];
  settings: WheelGeneralSettings;
  stats: WheelStatisticsData;
}

/**
 * Server Service: Truy xuất dữ liệu cấu hình vòng quay trực tiếp từ CSDL Supabase
 * Tối ưu hóa 0ms độ trễ mạng client, áp dụng mô hình Server Component
 */
export async function getInitialWheelConfigServer(
  customSession?: AuthTokenPayload | null
): Promise<InitialWheelConfigData> {
  try {
    const session = customSession !== undefined ? customSession : await getAuthSession();

    // 1. Tải song song danh sách giải thưởng và thiết lập kinh tế từ DB
    const [prizesRes, settingsRes, spinsRes] = await Promise.all([
      supabase
        .from("wheel_prizes")
        .select(
          "id, slot_order, label, short_label, prize_type, reward_coins, reward_free_spins, icon_name, probability_weight, is_active, is_locked"
        )
        .order("slot_order", { ascending: true }),

      supabase
        .from("system_settings")
        .select("value")
        .eq("key", "wheel_setting")
        .maybeSingle(),

      supabase
        .from("wheel_spins")
        .select("prize_id, created_at")
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

    // 2. Xử lý danh sách ô giải thưởng
    let slots: WheelSlotItem[] = [];
    if (prizesRes.data && prizesRes.data.length > 0) {
      // Đếm số lần trúng thực tế từ bảng wheel_spins
      const hitCounts: Record<string, number> = {};
      const totalSpinsCount = spinsRes.data?.length || 0;

      spinsRes.data?.forEach((s) => {
        hitCounts[s.prize_id] = (hitCounts[s.prize_id] || 0) + 1;
      });

      slots = prizesRes.data.map((p, idx) => {
        const hits = hitCounts[p.id] || 0;
        const actualRate =
          totalSpinsCount > 0
            ? Number(((hits / totalSpinsCount) * 100).toFixed(1))
            : Number(((p.probability_weight / 100) * 100).toFixed(1));

        return {
          id: p.id,
          slot_order: p.slot_order || idx + 1,
          label: p.label,
          short_label: p.short_label,
          prize_type: p.prize_type as WheelPrizeType,
          reward_coins: p.reward_coins || 0,
          reward_free_spins: p.reward_free_spins || 0,
          icon_name: p.icon_name || "coins",
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

    // 3. Xử lý thiết lập kinh tế vòng quay
    let settings: WheelGeneralSettings = initialMockSettings;
    if (settingsRes.data && settingsRes.data.value) {
      const val = settingsRes.data.value as Record<string, unknown>;
      settings = {
        spin_cost: typeof val.spin_cost === "number" ? val.spin_cost : 20,
        allow_free_spin: typeof val.allow_free_spin === "boolean" ? val.allow_free_spin : true,
        daily_free_spins: typeof val.daily_free_spins === "number" ? val.daily_free_spins : 1,
        is_maintenance: typeof val.is_maintenance === "boolean" ? val.is_maintenance : false,
      };
    }

    // 4. Thống kê ban đầu
    const stats: WheelStatisticsData = initialMockStatistics;

    return {
      slots,
      settings,
      stats,
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Lỗi khi tải cấu hình vòng quay trên server:", error);
    return {
      slots: [],
      settings: initialMockSettings,
      stats: initialMockStatistics,
    };
  }
}
