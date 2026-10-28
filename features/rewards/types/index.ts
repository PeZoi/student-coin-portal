export type ExchangeType = "cash" | "shopee";

export interface ExchangeOption {
  type: ExchangeType;
  title: string;
  subtitle: string;
  costCoins: number;
  rewardValueVnd: number;
  headerTitle: string;
  headerBgClass: string;
  buttonText: string;
  buttonVariant: "green" | "orange";
  imageSrc: string;
}

export interface ExchangeRequest {
  id: string;
  studentName: string;
  type: ExchangeType;
  costCoins: number;
  rewardValueVnd: number;
  shopeeLink?: string;
  status: "pending" | "approved" | "completed" | "rejected";
  createdAt: string;
}
