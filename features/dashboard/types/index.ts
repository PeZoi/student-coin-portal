export interface Mission {
  id: string;
  title: string;
  rewardCoins: number;
  iconSrc: string;
  headerBg: string;
  borderColor?: string;
  bodyBg?: string;
  arcFill?: string;
  buttonText: string;
  buttonVariant: "yellow" | "green";
  status: "available" | "submitted" | "completed";
  actionType: "upload" | "report";
}

export interface StudentProfile {
  // Chuẩn hóa theo Database Schema và Module Auth
  id?: string;
  full_name: string;
  displayName: string;
  phone_zalo?: string;
  avatar_url: string;
  current_coins: number;
  class_name?: string | null;
  role?: string;
  piggy_title: string;
  next_tier_coins?: number;
  next_tier_title?: string;

  // Thuộc tính tương thích ngược (Aliases)
  name: string;
  avatarUrl: string;
  currentCoins: number;
  classGroup: string;
  piggyTitle: string;
  nextTierCoins?: number;
  nextTierTitle?: string;
}
