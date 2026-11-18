export * from "@/features/rewards/types";

export type ExchangeFilterStatus = "all" | "pending" | "completed" | "rejected";
export type ExchangeFilterChoiceType = "all" | "cash" | "shopee";
export type ExchangeViewMode = "table" | "grid";

export type ExchangeSortField =
  | "student_name"
  | "choice_type"
  | "amount_vnd"
  | "status"
  | "created_at";

export type SortOrder = "asc" | "desc" | "none";
