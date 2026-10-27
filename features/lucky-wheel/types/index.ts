export type PrizeType = "coin" | "gift" | "luck" | "multiplier";

export interface WheelPrize {
  id: string;
  label: string;
  shortLabel: string;
  type: PrizeType;
  rewardCoins: number;
  bgGradient?: string; // Không bắt buộc, màu múi quay được quản lý tự động theo palette cố định
  textColor?: string;
  iconName: "coins" | "gift" | "sparkles" | "star" | "smile" | "trophy";
  probabilityWeight: number; // Trọng số xác suất trúng
}

export interface WheelWinner {
  id: string;
  studentName: string;
  classGroup: string;
  avatarUrl: string;
  prizeLabel: string;
  rewardCoins: number;
  wonAt: string; // ISO 8601 string hoặc relative
}

export interface WheelRule {
  id: string;
  title: string;
  description: string;
  icon: "ticket" | "coin" | "refresh" | "shield";
}

export interface SpinState {
  isSpinning: boolean;
  rotation: number;
  winningPrize: WheelPrize | null;
  showPrizeModal: boolean;
  freeSpinsLeft: number;
}

/**
 * Cấu hình động cho Vòng quay may mắn (do giáo viên / quản trị viên thiết lập)
 */
export interface WheelConfig {
  spinCost: number; // Chi phí mỗi lượt quay (ví dụ: 500 xu)
  allowFreeSpin: boolean; // Có cho phép lượt quay miễn phí hàng ngày không
  dailyFreeSpins: number; // Số lượt miễn phí hàng ngày (nếu allowFreeSpin = true)
  prizes: WheelPrize[]; // Danh sách vật phẩm & trọng số tỷ lệ trúng
}
