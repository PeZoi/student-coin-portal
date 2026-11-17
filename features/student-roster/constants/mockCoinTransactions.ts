import { CoinTxType, CoinReferenceType } from "@/constants/coins";
import { TeacherRosterStudent, RosterCoinTransactionItem } from "../types";

/**
 * Sinh danh sách mock giao dịch xu chân thực theo đúng database `coin_transactions`
 * - Đồng bộ với số dư `current_coins` và `total_earned_coins` của học sinh
 * - Mỗi giao dịch có đầy đủ thông tin: tx_type, amount, balance_before/after, mô tả, người thực hiện
 */
export function getMockCoinTransactions(
  student: TeacherRosterStudent
): RosterCoinTransactionItem[] {
  const current = student.current_coins;

  // Danh sách mẫu các sự kiện giao dịch phổ biến
  const transactionTemplates = [
    {
      tx_type: CoinTxType.MISSION_REWARD,
      reference_type: CoinReferenceType.HOMEWORK_SUBMISSIONS,
      description: "Thưởng làm bài tập: Luyện đọc hiểu bài 12 và đạt điểm 10",
      amount: 40,
      creator_name: "Cô Nguyễn Thị Mai",
      creator_role: "teacher",
      daysAgo: 0.1, // vài giờ trước
    },
    {
      tx_type: CoinTxType.WHEEL_PRIZE,
      reference_type: CoinReferenceType.WHEEL_SPINS,
      description: "Trúng thưởng Vòng quay may mắn: Ô 100 Xu Vàng",
      amount: 100,
      creator_name: null,
      creator_role: null,
      daysAgo: 1,
    },
    {
      tx_type: CoinTxType.WHEEL_SPIN_FEE,
      reference_type: CoinReferenceType.WHEEL_SPINS,
      description: "Phí tham gia 1 lượt quay Vòng quay may mắn",
      amount: -20,
      creator_name: null,
      creator_role: null,
      daysAgo: 1.01,
    },
    {
      tx_type: CoinTxType.SPEAKING_REWARD,
      reference_type: CoinReferenceType.MANUAL_ADJUST,
      description: "Thưởng phát biểu xây dựng bài học môn Toán hăng hái",
      amount: 30,
      creator_name: "Thầy Lê Văn Hùng",
      creator_role: "teacher",
      daysAgo: 2,
    },
    {
      tx_type: CoinTxType.MISSION_REWARD,
      reference_type: CoinReferenceType.HOMEWORK_SUBMISSIONS,
      description: "Thưởng hoàn thành phiếu ôn tập cuối tuần môn Tiếng Việt",
      amount: 50,
      creator_name: "Cô Nguyễn Thị Mai",
      creator_role: "teacher",
      daysAgo: 3,
    },
    {
      tx_type: CoinTxType.MANUAL_ADJUST,
      reference_type: CoinReferenceType.MANUAL_ADJUST,
      description: "Thưởng khuyến khích em giúp đỡ bạn bè trong giờ học",
      amount: 50,
      creator_name: "Admin (Quản trị viên)",
      creator_role: "admin",
      daysAgo: 4,
    },
    {
      tx_type: CoinTxType.MISSION_REWARD,
      reference_type: CoinReferenceType.HOMEWORK_SUBMISSIONS,
      description: "Thưởng nộp bài vẽ tranh phong cảnh ngày 20/11 đúng hạn",
      amount: 60,
      creator_name: "Cô Nguyễn Thị Mai",
      creator_role: "teacher",
      daysAgo: 5,
    },
    {
      tx_type: CoinTxType.WHEEL_PRIZE,
      reference_type: CoinReferenceType.WHEEL_SPINS,
      description: "Trúng thưởng Vòng quay may mắn: Ô 50 Xu",
      amount: 50,
      creator_name: null,
      creator_role: null,
      daysAgo: 6,
    },
    {
      tx_type: CoinTxType.WHEEL_SPIN_FEE,
      reference_type: CoinReferenceType.WHEEL_SPINS,
      description: "Phí tham gia 1 lượt quay Vòng quay may mắn",
      amount: -20,
      creator_name: null,
      creator_role: null,
      daysAgo: 6.01,
    },
    {
      tx_type: CoinTxType.EXCHANGE_FULFILLED,
      reference_type: CoinReferenceType.MONTHLY_EXCHANGE_REQUESTS,
      description: "Đã trừ xu quy đổi phần quà Heo Đất tháng trước",
      amount: -300,
      creator_name: "Admin (Quản trị viên)",
      creator_role: "admin",
      daysAgo: 8,
    },
    {
      tx_type: CoinTxType.TOP_RANK_BONUS,
      reference_type: CoinReferenceType.MONTHLY_LEADERBOARD,
      description: "Thưởng Top 3 Bảng xếp hạng thi đua chăm chỉ tháng",
      amount: 200,
      creator_name: "Hệ thống",
      creator_role: "system",
      daysAgo: 10,
    },
    {
      tx_type: CoinTxType.MISSION_REWARD,
      reference_type: CoinReferenceType.HOMEWORK_SUBMISSIONS,
      description: "Thưởng bài tập ngữ pháp Tiếng Anh Unit 4: Family",
      amount: 40,
      creator_name: "Cô Phạm Thu Hà",
      creator_role: "teacher",
      daysAgo: 12,
    },
    {
      tx_type: CoinTxType.MISSION_REWARD,
      reference_type: CoinReferenceType.HOMEWORK_SUBMISSIONS,
      description: "Thưởng giải toán tư duy bảng nhân chia tuần 20",
      amount: 50,
      creator_name: "Thầy Lê Văn Hùng",
      creator_role: "teacher",
      daysAgo: 15,
    },
    {
      tx_type: CoinTxType.SPEAKING_REWARD,
      reference_type: CoinReferenceType.MANUAL_ADJUST,
      description: "Thưởng phát biểu giải bài toán khó trước lớp",
      amount: 20,
      creator_name: "Thầy Lê Văn Hùng",
      creator_role: "teacher",
      daysAgo: 18,
    },
    {
      tx_type: CoinTxType.MISSION_REWARD,
      reference_type: CoinReferenceType.HOMEWORK_SUBMISSIONS,
      description: "Thưởng hoàn thành nhiệm vụ đọc truyện 15 phút mỗi ngày",
      amount: 30,
      creator_name: "Cô Nguyễn Thị Mai",
      creator_role: "teacher",
      daysAgo: 21,
    },
    {
      tx_type: CoinTxType.WHEEL_PRIZE,
      reference_type: CoinReferenceType.WHEEL_SPINS,
      description: "Trúng thưởng Vòng quay may mắn: Ô 80 Xu",
      amount: 80,
      creator_name: null,
      creator_role: null,
      daysAgo: 25,
    },
    {
      tx_type: CoinTxType.MANUAL_ADJUST,
      reference_type: CoinReferenceType.MANUAL_ADJUST,
      description: "Tặng xu khởi tạo khi tạo hồ sơ học sinh trên cổng",
      amount: 100,
      creator_name: "Admin (Quản trị viên)",
      creator_role: "admin",
      daysAgo: 30,
    },
  ];

  // Tính ngược số dư từ current_coins về quá khứ để balance_before/after luôn logic
  const now = new Date("2026-11-17T13:30:00Z").getTime();
  let runningBalance = current;

  return transactionTemplates.map((tpl, index) => {
    const after = runningBalance;
    const before = Math.max(0, after - tpl.amount);
    runningBalance = before; // Giao dịch cũ hơn có balance_after = balance_before của giao dịch mới hơn

    const txTime = new Date(now - tpl.daysAgo * 86400000).toISOString();

    return {
      id: `tx-${student.id}-${index + 1}`,
      user_id: student.id,
      amount: tpl.amount,
      balance_before: before,
      balance_after: after,
      tx_type: tpl.tx_type,
      reference_type: tpl.reference_type,
      reference_id: `ref-${index + 1}`,
      description: tpl.description,
      created_at: txTime,
      created_by: tpl.creator_name ? "u-teacher-1" : null,
      creator_name: tpl.creator_name,
      creator_role: tpl.creator_role,
    };
  });
}
