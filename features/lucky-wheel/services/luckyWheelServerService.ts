import { supabase } from "@/lib/supabase/db";
import { MaybeArray, unwrapFirst } from "@/lib/supabase/helpers";
import { AuthTokenPayload } from "@/lib/auth/jwt";
import { unstable_rethrow } from "next/navigation";
import { formatShortDateTime } from "@/lib/date";
import { getDisplayName } from "@/lib/utils";
import {
  WHEEL_CONSTANTS,
  WHEEL_PRIZE_TYPES,
  WHEEL_ASSETS,
} from "@/constants/wheel";
import {
  WheelPrize,
  WheelWinner,
  WheelConfig,
  PrizeType,
  StudentWheelInitialData,
} from "../types";
import { defaultWheelConfig } from "../data/wheelData";

interface JoinedClassRow {
  class_name?: string | null;
}

interface JoinedUserRow {
  full_name?: string | null;
  avatar_url?: string | null;
  classes?: MaybeArray<JoinedClassRow>;
}

interface SpinHistoryRow {
  id: string;
  student_id: string;
  prize_label_snapshot: string;
  prize_type_snapshot?: string | null;
  reward_coins: number;
  reward_free_spins: number;
  created_at: string;
  users?: MaybeArray<JoinedUserRow>;
}

function mapSpinRowToWinner(row: SpinHistoryRow): WheelWinner {
  const userObj = unwrapFirst(row.users);
  const classObj = unwrapFirst(userObj?.classes);

  return {
    id: row.id,
    student_name: userObj?.full_name
      ? getDisplayName(userObj.full_name)
      : "Bạn nhỏ",
    class_name: classObj?.class_name || "Lớp học",
    avatar_url: userObj?.avatar_url || WHEEL_ASSETS.DEFAULT_AVATAR,
    prize_label_snapshot: row.prize_label_snapshot,
    prize_type_snapshot:
      (row.prize_type_snapshot as PrizeType) || WHEEL_PRIZE_TYPES.COIN,
    reward_coins: Number(row.reward_coins) || 0,
    reward_free_spins: Number(row.reward_free_spins) || 0,
    created_at: formatShortDateTime(row.created_at),
  };
}

/**
 * Server Service: Lấy cấu hình Vòng Quay May Mắn và lịch sử trúng thưởng thực tế từ CSDL cho học sinh
 */
export async function getStudentWheelInitialDataServer(
  session?: AuthTokenPayload | null
): Promise<StudentWheelInitialData> {
  try {
    const studentId = session?.userId;

    const [prizesRes, settingsRes, recentSpinsRes, mySpinsRes, studentRes] =
      await Promise.all([
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

        supabase
          .from("wheel_spins")
          .select(
            "id, student_id, prize_label_snapshot, prize_type_snapshot, reward_coins, reward_free_spins, created_at, users(full_name, avatar_url, classes!users_class_id_fkey(class_name))"
          )
          .order("created_at", { ascending: false })
          .limit(WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT),

        studentId
          ? supabase
              .from("wheel_spins")
              .select(
                "id, student_id, prize_label_snapshot, prize_type_snapshot, reward_coins, reward_free_spins, created_at"
              )
              .eq("student_id", studentId)
              .order("created_at", { ascending: false })
              .limit(WHEEL_CONSTANTS.RECENT_WINNERS_LIMIT)
          : Promise.resolve({ data: [] as SpinHistoryRow[] }),

        studentId
          ? supabase
              .from("users")
              .select("current_coins, free_spins")
              .eq("id", studentId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

    const prizes: WheelPrize[] = (prizesRes.data || []).map((p) => ({
      id: p.id,
      slot_order: Number(p.slot_order) || 1,
      label: p.label,
      short_label: p.short_label,
      prize_type: (p.prize_type as PrizeType) || WHEEL_PRIZE_TYPES.COIN,
      reward_coins: Number(p.reward_coins) || 0,
      reward_free_spins: Number(p.reward_free_spins) || 0,
      probability_weight:
        Number(p.probability_weight) || WHEEL_CONSTANTS.MIN_SLOT_WEIGHT,
    }));

    let spin_cost = defaultWheelConfig.spin_cost;
    let allow_free_spin = defaultWheelConfig.allow_free_spin;
    let daily_free_spins = defaultWheelConfig.daily_free_spins;
    let is_maintenance = false;

    if (settingsRes.data && settingsRes.data.value) {
      const val = settingsRes.data.value as Record<string, unknown>;
      if (typeof val.spin_cost === "number") spin_cost = val.spin_cost;
      if (typeof val.allow_free_spin === "boolean")
        allow_free_spin = val.allow_free_spin;
      if (typeof val.daily_free_spins === "number")
        daily_free_spins = val.daily_free_spins;
      if (typeof val.is_maintenance === "boolean")
        is_maintenance = val.is_maintenance;
    }

    const config: WheelConfig = {
      spin_cost,
      allow_free_spin,
      daily_free_spins,
      is_maintenance,
      prizes,
    };

    const allWinners: WheelWinner[] = (
      (recentSpinsRes.data as SpinHistoryRow[] | null) || []
    ).map(mapSpinRowToWinner);

    const myHistory: WheelWinner[] = (
      (mySpinsRes.data as SpinHistoryRow[] | null) || []
    ).map((row) => ({
      id: row.id,
      student_name: "Bạn",
      class_name: "Lớp học",
      avatar_url: WHEEL_ASSETS.DEFAULT_AVATAR,
      prize_label_snapshot: row.prize_label_snapshot,
      prize_type_snapshot:
        (row.prize_type_snapshot as PrizeType) || WHEEL_PRIZE_TYPES.COIN,
      reward_coins: Number(row.reward_coins) || 0,
      reward_free_spins: Number(row.reward_free_spins) || 0,
      created_at: formatShortDateTime(row.created_at),
    }));

    const current_coins = Number(studentRes.data?.current_coins ?? 0);
    const free_spins = allow_free_spin
      ? Number(studentRes.data?.free_spins ?? 0)
      : 0;

    return {
      config,
      allWinners,
      myHistory,
      free_spins,
      current_coins,
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Lỗi khi tải dữ liệu vòng quay học sinh trên server:", error);
    return {
      config: defaultWheelConfig,
      allWinners: [],
      myHistory: [],
      free_spins: 0,
      current_coins: 0,
    };
  }
}
