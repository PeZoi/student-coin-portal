import {
  ExchangeChoiceTypeValue,
  ExchangeRequestStatusType,
} from "@/constants/rewards";

/**
 * Hình thức đổi quà khớp 100% với Postgres ENUM `monthly_exchange_choice`
 */
export type ExchangeChoiceType = ExchangeChoiceTypeValue;

/**
 * Trạng thái yêu cầu đổi quà khớp 100% với Postgres ENUM `monthly_exchange_status`
 */
export type ExchangeRequestStatus = ExchangeRequestStatusType;

/**
 * Cấu hình hiển thị lựa chọn đổi quà cho học sinh
 */
export interface ExchangeOption {
  type: ExchangeChoiceType;
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

/**
 * Dữ liệu yêu cầu đổi quà khớp 100% với bảng CSDL `monthly_exchange_requests`
 */
export interface MonthlyExchangeRequest {
  id: string;
  month: number;
  year: number;
  student_id: string;
  choice_type: ExchangeChoiceType;
  coins_to_exchange: number;
  amount_vnd: number;
  shopee_product_url?: string | null;
  shopee_note?: string | null;
  status: ExchangeRequestStatus;
  hold_tx_id?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_by?: string | null;
  updated_at?: string | null;
}

/**
 * Thông tin yêu cầu đổi quà hiển thị cho Giáo viên (kèm dữ liệu JOIN từ users và classes)
 */
export interface TeacherExchangeRequestItem extends MonthlyExchangeRequest {
  student_name: string;
  student_avatar?: string | null;
  class_id?: string;
  class_name?: string;
  phone_zalo?: string | null;
  processor_name?: string | null;
}
