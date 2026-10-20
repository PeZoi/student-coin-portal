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
  name: string;
  classGroup: string;
  avatarUrl: string;
  currentCoins: number;
  nextTierCoins: number;
  piggyTitle: string;
  nextTierTitle: string;
}
