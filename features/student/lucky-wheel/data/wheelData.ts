import { WHEEL_CONSTANTS } from "@/constants/wheel";
import { WheelConfig } from "../types";

/**
 * Cấu hình Vòng Quay Mặc Định Rỗng (100% dữ liệu thật lấy từ CSDL, không dùng mock data)
 */
export const defaultWheelConfig: WheelConfig = {
  spin_cost: WHEEL_CONSTANTS.DEFAULT_SPIN_COST,
  allow_free_spin: false,
  daily_free_spins: 0,
  is_maintenance: false,
  prizes: [],
};
