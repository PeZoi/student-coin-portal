import { WheelPrize, WheelWinner, WheelRule, WheelConfig } from "../types";

/**
 * 8 Giải thưởng trên vòng quay may mắn (chia đều 360 độ: mỗi ô 45 độ)
 */
export const wheelPrizes: WheelPrize[] = [
  {
    id: "p4",
    label: "+100 Xu May Mắn",
    shortLabel: "+100 Xu",
    type: "coin",
    rewardCoins: 100,
    iconName: "sparkles",
    probabilityWeight: 12,
  },
  {
    id: "p8",
    label: "Thẻ Nhân Đôi Xu",
    shortLabel: "Thẻ X2",
    type: "multiplier",
    rewardCoins: 60,
    iconName: "star",
    probabilityWeight: 10,
  },
  {
    id: "p2",
    label: "+20 Xu Vàng",
    shortLabel: "+20 Xu",
    type: "coin",
    rewardCoins: 20,
    iconName: "coins",
    probabilityWeight: 30,
  },
  {
    id: "p7",
    label: "+40 Xu Vàng",
    shortLabel: "+40 Xu",
    type: "coin",
    rewardCoins: 40,
    iconName: "coins",
    probabilityWeight: 20,
  },
  {
    id: "p6",
    label: "+200 Xu Đại Thưởng",
    shortLabel: "+200 Xu!",
    type: "coin",
    rewardCoins: 200,
    iconName: "trophy",
    probabilityWeight: 5,
  },
  {
    id: "p3",
    label: "Hộp Quà Thần Kỳ",
    shortLabel: "Hộp Quà",
    type: "gift",
    rewardCoins: 80,
    iconName: "gift",
    probabilityWeight: 10,
  },
  {
    id: "p5",
    label: "Chúc Bạn May Mắn Lần Sau",
    shortLabel: "May Mắn",
    type: "luck",
    rewardCoins: 5,
    iconName: "smile",
    probabilityWeight: 8,
  },
  {
    id: "p1",
    label: "+50 Xu Vàng",
    shortLabel: "+50 Xu",
    type: "coin",
    rewardCoins: 50,
    iconName: "coins",
    probabilityWeight: 25,
  },
];

/**
 * Lịch sử người vừa quay trúng thưởng (Live Winners Feed)
 */
export const initialWinners: WheelWinner[] = [
  {
    id: "w1",
    studentName: "Minh Khang",
    classGroup: "Lớp 5A",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "+200 Xu Đại Thưởng 🎉",
    rewardCoins: 200,
    wonAt: "1 phút trước",
  },
  {
    id: "w2",
    studentName: "Ngọc Hân",
    classGroup: "Lớp 4B",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "Hộp Quà Thần Kỳ 🎁",
    rewardCoins: 80,
    wonAt: "3 phút trước",
  },
  {
    id: "w3",
    studentName: "Hoàng Nam",
    classGroup: "Lớp 5C",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "+100 Xu May Mắn 🌟",
    rewardCoins: 100,
    wonAt: "5 phút trước",
  },
  {
    id: "w4",
    studentName: "Bảo Trân",
    classGroup: "Lớp 3A",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "+50 Xu Vàng 💰",
    rewardCoins: 50,
    wonAt: "8 phút trước",
  },
  {
    id: "w5",
    studentName: "Tuấn Kiệt",
    classGroup: "Lớp 5B",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "Thẻ Nhân Đôi Xu ⭐",
    rewardCoins: 60,
    wonAt: "12 phút trước",
  },
  {
    id: "w6",
    studentName: "Phương Uyên",
    classGroup: "Lớp 4A",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "+40 Xu Vàng 💰",
    rewardCoins: 40,
    wonAt: "15 phút trước",
  },
];

/**
 * Lịch sử quay của bản thân học sinh
 */
export const initialMyHistory: WheelWinner[] = [
  {
    id: "my-1",
    studentName: "Gia Bảo",
    classGroup: "Lớp 5A",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "+100 Xu May Mắn 🌟",
    rewardCoins: 100,
    wonAt: "25 phút trước",
  },
  {
    id: "my-2",
    studentName: "Gia Bảo",
    classGroup: "Lớp 5A",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "Hộp Quà Thần Kỳ 🎁",
    rewardCoins: 80,
    wonAt: "Hôm qua",
  },
  {
    id: "my-3",
    studentName: "Gia Bảo",
    classGroup: "Lớp 5A",
    avatarUrl: "/avatar.jpg",
    prizeLabel: "+50 Xu Vàng 💰",
    rewardCoins: 50,
    wonAt: "2 ngày trước",
  },
];

/**
  * Cấu hình Vòng Quay Mặc Định (Có thể ghi đè bằng cấu hình động từ DB / Giáo viên)
  */
export const defaultWheelConfig: WheelConfig = {
  spinCost: 500, // Giáo viên thiết lập: 500 xu mỗi lượt quay
  allowFreeSpin: false, // Giáo viên thiết lập: Không cho quay miễn phí
  dailyFreeSpins: 0,
  prizes: wheelPrizes,
};

/**
 * Hàm sinh thể lệ động dựa trên cấu hình do giáo viên thiết lập
 */
export function getWheelRules(config: WheelConfig = defaultWheelConfig): WheelRule[] {
  const rules: WheelRule[] = [];

  if (config.allowFreeSpin && config.dailyFreeSpins > 0) {
    rules.push({
      id: "r1",
      title: `${config.dailyFreeSpins} Lượt quay miễn phí mỗi ngày`,
      description: `Mỗi ngày khi đăng nhập vào hệ thống, bạn sẽ nhận được ${config.dailyFreeSpins} lượt quay thưởng hoàn toàn miễn phí.`,
      icon: "ticket",
    });
  } else {
    rules.push({
      id: "r1",
      title: "Vòng quay thử thách tích lũy",
      description: "Vòng quay dành riêng cho các bạn học sinh chăm chỉ, tích lũy xu từ việc hoàn thành tốt các bài tập.",
      icon: "ticket",
    });
  }

  rules.push({
    id: "r2",
    title: `Chi phí tham gia: ${config.spinCost} xu / lượt`,
    description: `Mỗi lượt quay sẽ tiêu tốn ${config.spinCost} xu trong ví Heo Đất của bạn. Hãy cân nhắc và thử vận may nhé!`,
    icon: "coin",
  });

  rules.push({
    id: "r3",
    title: "Cộng xu ngay vào Heo Đất",
    description: "Xu thưởng và quà tặng sẽ được gửi trực tiếp vào ví Heo Đất của bạn ngay khi vòng quay dừng.",
    icon: "refresh",
  });

  rules.push({
    id: "r4",
    title: "May mắn & Minh bạch 100%",
    description: "Tỷ lệ trúng thưởng của từng vật phẩm được thiết lập minh bạch và xáo trộn ngẫu nhiên công bằng.",
    icon: "shield",
  });

  return rules;
}

export const wheelRules: WheelRule[] = getWheelRules(defaultWheelConfig);

export const SPIN_COST = defaultWheelConfig.spinCost;
