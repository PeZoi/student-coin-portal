import { WHEEL_CONSTANTS } from "@/constants/wheel";
import { WheelRule, WheelConfig } from "../types";

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

/**
 * Hàm sinh thể lệ động dựa trên cấu hình do giáo viên thiết lập
 */
export function getWheelRules(config: WheelConfig = defaultWheelConfig): WheelRule[] {
  const rules: WheelRule[] = [];

  if (config.allow_free_spin && config.daily_free_spins > 0) {
    rules.push({
      id: "r1",
      title: `${config.daily_free_spins} Lượt quay miễn phí mỗi ngày`,
      description: `Mỗi ngày khi đăng nhập vào hệ thống, bạn sẽ nhận được ${config.daily_free_spins} lượt quay thưởng hoàn toàn miễn phí.`,
      icon: "ticket",
    });
  } else {
    rules.push({
      id: "r1",
      title: "Vòng quay thử thách tích lũy",
      description:
        "Vòng quay dành riêng cho các bạn học sinh chăm chỉ, tích lũy xu từ việc hoàn thành tốt các bài tập.",
      icon: "ticket",
    });
  }

  rules.push({
    id: "r2",
    title: `Chi phí tham gia: ${config.spin_cost.toLocaleString("vi-VN")} xu / lượt`,
    description: `Mỗi lượt quay sẽ tiêu tốn ${config.spin_cost.toLocaleString("vi-VN")} xu trong ví Heo Đất của bạn. Hãy cân nhắc và thử vận may nhé!`,
    icon: "coin",
  });

  rules.push({
    id: "r3",
    title: "Cộng xu ngay vào Heo Đất",
    description:
      "Xu thưởng và quà tặng sẽ được gửi trực tiếp vào ví Heo Đất của bạn ngay khi vòng quay dừng.",
    icon: "refresh",
  });

  rules.push({
    id: "r4",
    title: "May mắn & Minh bạch 100%",
    description:
      "Tỷ lệ trúng thưởng của từng vật phẩm được thiết lập minh bạch và xáo trộn ngẫu nhiên công bằng.",
    icon: "shield",
  });

  return rules;
}
