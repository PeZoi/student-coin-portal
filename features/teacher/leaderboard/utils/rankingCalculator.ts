import {
  ComputedLeaderboardData,
  MonthlyLeaderboardDataset,
  ProgressRankEntry,
  RawStudentMonthPerformance,
  TopCoinsRankEntry,
} from "../types";

/**
 * Bộ tính toán chuẩn hóa 3 Bảng Xếp Hạng từ dữ liệu tháng hiện tại & tháng trước:
 * 1. Top Xu Tháng Này: Sắp xếp theo `currentMonthCoins` giảm dần
 * 2. Chia 2 nhóm dựa trên Bảng xếp hạng THÁNG TRƯỚC (`prevMonthCoins` giảm dần):
 *    - Nhóm Dẫn Đầu (Top chăm chỉ tháng trước): `Math.floor(N / 2)` học sinh đầu
 *    - Nhóm Vươn Lên (Nửa sau tháng trước): `N - Math.floor(N / 2)` học sinh còn lại (số lẻ đẩy qua nhóm này)
 * 3. Xếp hạng Tiến bộ trong cả 2 nhóm:
 *    - Thuần theo số xu tăng thêm (`deltaCoins = currentMonthCoins - prevMonthCoins`) giảm dần
 *    - Nếu bằng nhau: ưu tiên tổng xu tháng này cao hơn, sau đó số bài tập hoàn thành
 */
export function computeThreeLeaderboards(
  dataset: MonthlyLeaderboardDataset
): ComputedLeaderboardData {
  const { students, hasPreviousMonthData } = dataset;
  const totalStudents = students.length;
  const totalEarnedCoins = students.reduce(
    (sum, s) => sum + s.currentMonthCoins,
    0
  );

  // 1. BẢNG 1: Top Xu Kiếm Được Nhiều Nhất Trong Tháng
  const sortedByCurrentCoins = [...students].sort((a, b) => {
    if (b.currentMonthCoins !== a.currentMonthCoins) {
      return b.currentMonthCoins - a.currentMonthCoins;
    }
    return b.completedMissionsCount - a.completedMissionsCount;
  });

  const topCoinsBoard: TopCoinsRankEntry[] = sortedByCurrentCoins.map(
    (s, index) => ({
      rank: index + 1,
      studentId: s.studentId,
      fullName: s.fullName,
      avatarUrl: s.avatarUrl,
      className: s.className,
      currentMonthCoins: s.currentMonthCoins,
      prevMonthCoins: hasPreviousMonthData ? s.prevMonthCoins : null,
      deltaCoins: hasPreviousMonthData
        ? s.currentMonthCoins - s.prevMonthCoins
        : null,
      completedMissionsCount: s.completedMissionsCount,
      totalMissionsCount: s.totalMissionsCount,
    })
  );

  // Nếu tháng trước chưa có dữ liệu (tháng đầu hệ thống khởi động) -> Chưa mở 2 bảng tiến bộ
  if (!hasPreviousMonthData || totalStudents === 0) {
    return {
      hasPreviousMonthData: false,
      totalStudents,
      totalEarnedCoins,
      improvedStudentsCount: 0,
      leadersGroupCount: 0,
      risersGroupCount: 0,
      topCoinsBoard,
      progressLeadersBoard: [],
      progressRisersBoard: [],
    };
  }

  // 2. Xếp hạng THÁNG TRƯỚC để chia 2 nhóm công bằng
  const sortedByPrevCoins = [...students].sort((a, b) => {
    if (b.prevMonthCoins !== a.prevMonthCoins) {
      return b.prevMonthCoins - a.prevMonthCoins;
    }
    return b.currentMonthCoins - a.currentMonthCoins;
  });

  // Chia đôi: nửa trên = floor(N/2), phần dư đẩy qua bảng thứ 2 (Nhóm Vươn Lên)
  const leadersSplitIndex = Math.floor(totalStudents / 2);

  const prevRankMap = new Map<string, number>();
  sortedByPrevCoins.forEach((s, idx) => {
    prevRankMap.set(s.studentId, idx + 1);
  });

  const leadersRaw = sortedByPrevCoins.slice(0, leadersSplitIndex);
  const risersRaw = sortedByPrevCoins.slice(leadersSplitIndex);

  const toProgressDraft = (
    s: RawStudentMonthPerformance,
    group: "leaders" | "risers"
  ): Omit<ProgressRankEntry, "rank"> => {
    const deltaCoins = s.currentMonthCoins - s.prevMonthCoins;
    return {
      group,
      studentId: s.studentId,
      fullName: s.fullName,
      avatarUrl: s.avatarUrl,
      className: s.className,
      prevMonthRank: prevRankMap.get(s.studentId) ?? 0,
      prevMonthCoins: s.prevMonthCoins,
      currentMonthCoins: s.currentMonthCoins,
      deltaCoins,
      completedMissionsCount: s.completedMissionsCount,
      totalMissionsCount: s.totalMissionsCount,
      isImproved: deltaCoins > 0,
    };
  };

  // Cả 2 bảng Tiến bộ đều đồng nhất sắp xếp thuần theo Số xu tăng thêm (deltaCoins) giảm dần
  const sortProgressEntries = (
    entries: Omit<ProgressRankEntry, "rank">[]
  ): ProgressRankEntry[] =>
    entries
      .sort((a, b) => {
        if (b.deltaCoins !== a.deltaCoins) return b.deltaCoins - a.deltaCoins;
        if (b.currentMonthCoins !== a.currentMonthCoins) {
          return b.currentMonthCoins - a.currentMonthCoins;
        }
        return b.completedMissionsCount - a.completedMissionsCount;
      })
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const progressLeadersBoard = sortProgressEntries(
    leadersRaw.map((s) => toProgressDraft(s, "leaders"))
  );

  const progressRisersBoard = sortProgressEntries(
    risersRaw.map((s) => toProgressDraft(s, "risers"))
  );

  const improvedStudentsCount = students.filter(
    (s) => s.currentMonthCoins > s.prevMonthCoins
  ).length;

  return {
    hasPreviousMonthData: true,
    totalStudents,
    totalEarnedCoins,
    improvedStudentsCount,
    leadersGroupCount: progressLeadersBoard.length,
    risersGroupCount: progressRisersBoard.length,
    topCoinsBoard,
    progressLeadersBoard,
    progressRisersBoard,
  };
}
