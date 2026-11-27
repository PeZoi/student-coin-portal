import { ExchangeSettingConfig } from "@/types/systemConfig";

export type PrizeType =
  | "coin"
  | "gift"
  | "luck"
  | "free_spin"
  | "deduct_coin"

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

export interface ExecuteWheelSpinRpcResult {
  spin_id: string;
  created_at: string;
  is_free_spin: boolean;
  spin_cost: number;
  actual_reward_coins: number;
  actual_reward_free_spins: number;
  current_coins: number;
  total_earned_coins: number;
  free_spins: number;
  unclaimed_gifts?: number;
}

export interface ClaimWheelGiftResponseData {
  request_id: string;
  unclaimed_gifts: number;
  created_at: string;
}

export interface SpinWheelPayload {
  prizeIndex: number;
  winningPrize?: WheelPrize;
  spinResult?: ExecuteWheelSpinRpcResult;
  configChanged?: boolean;
  finalAngle?: number;
}

export interface WheelHistoryPagination {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface WheelHistoryPageData {
  items: WheelWinner[];
  pagination: WheelHistoryPagination;
}

/**
 * Dữ liệu khởi tạo Vòng quay cho Học sinh (Tên trường đồng bộ với bảng public.users)
 */
export interface StudentWheelInitialData {
  config: WheelConfig;
  allWinners?: WheelWinner[];
  myHistory?: WheelWinner[];
  free_spins: number;
  current_coins: number;
  unclaimed_gifts?: number;
  exchange_config?: ExchangeSettingConfig;
}
