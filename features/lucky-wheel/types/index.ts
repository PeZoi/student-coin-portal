export type PrizeType =
  | "coin"
  | "gift"
  | "luck"
  | "free_spin"
  | "deduct_coin"
  | "multiplier";

/**
 * Ô phần thưởng trên Vòng quay may mắn (Tên trường đồng bộ 100% với bảng public.wheel_prizes)
 */
export interface WheelPrize {
  id: string;
  slot_order?: number;
  label: string;
  short_label: string;
  prize_type: PrizeType;
  reward_coins: number;
  reward_free_spins?: number;
  probability_weight: number;
}

/**
 * Lịch sử lượt quay trúng thưởng (Tên trường đồng bộ với bảng public.wheel_spins & public.users)
 */
export interface WheelWinner {
  id: string;
  student_name: string;
  class_name: string;
  avatar_url: string;
  prize_label_snapshot: string;
  prize_type_snapshot?: PrizeType;
  reward_coins: number;
  reward_free_spins?: number;
  created_at: string;
}

export interface WheelRule {
  id: string;
  title: string;
  description: string;
  icon: "ticket" | "coin" | "refresh" | "shield";
}

/**
 * Cấu hình động cho Vòng quay may mắn (Tên trường đồng bộ với system_settings.value)
 */
export interface WheelConfig {
  spin_cost: number;
  allow_free_spin: boolean;
  daily_free_spins: number;
  is_maintenance?: boolean;
  prizes: WheelPrize[];
}

/**
 * Dữ liệu khởi tạo Vòng quay cho Học sinh (Tên trường đồng bộ với bảng public.users)
 */
export interface StudentWheelInitialData {
  config: WheelConfig;
  allWinners: WheelWinner[];
  myHistory: WheelWinner[];
  free_spins: number;
  current_coins: number;
}
