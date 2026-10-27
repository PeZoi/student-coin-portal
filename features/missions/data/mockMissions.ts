import { MissionItem } from "../types";

export const initialMissions: MissionItem[] = [
  // =========================================================================
  // 1. NHIỆM VỤ CHƯA XONG (PENDING) - HẠN NỘP HÔM NAY VÀ NHỮNG NGÀY TỚI
  // =========================================================================
  {
    id: "m1",
    title: "Hoàn thành bài tập & đúng hết",
    description: "Làm đầy đủ các bài tập toán và tiếng Việt được giao trong ngày, đạt kết quả chính xác 100%.",
    rewardCoins: 40,
    difficulty: "easy",
    themeColor: "blue",
    iconType: "notebook",
    status: "pending",
    isCompleted: false,
    assignedAt: "2026-10-27T08:00:00+07:00", // 08:00 hôm nay
    dueAt: "2026-10-27T21:00:00+07:00",      // 21:00 hôm nay
  },
  {
    id: "m2",
    title: "Viết 1 bài văn sáng tạo",
    description: "Viết một đoạn văn ngắn miêu tả con vật nuôi yêu thích hoặc cảnh đẹp quê hương em.",
    rewardCoins: 50,
    difficulty: "medium",
    themeColor: "purple",
    iconType: "book-pen",
    status: "pending",
    isCompleted: false,
    assignedAt: "2026-10-27T09:30:00+07:00", // 09:30 hôm nay
    dueAt: "2026-10-27T22:00:00+07:00",      // 22:00 hôm nay
  },
  {
    id: "m3",
    title: "Luyện 30 từ vựng tiếng Anh",
    description: "Học và ghi nhớ cách phát âm, ngữ nghĩa của 30 từ vựng chủ đề School & Science.",
    rewardCoins: 80,
    difficulty: "medium",
    themeColor: "purple",
    iconType: "flags-en-vi",
    status: "pending",
    isCompleted: false,
    assignedAt: "2026-10-27T10:00:00+07:00",
    dueAt: "2026-10-28T22:00:00+07:00",      // 22:00 ngày mai
  },
  {
    id: "m4",
    title: "Dịch Việt ➔ Anh đoạn văn mẫu",
    description: "Dịch đoạn văn giới thiệu bản thân và sở thích từ tiếng Việt sang tiếng Anh chuẩn ngữ pháp.",
    rewardCoins: 100,
    difficulty: "hard",
    themeColor: "orange",
    iconType: "flags-vi-en",
    status: "pending",
    isCompleted: false,
    assignedAt: "2026-10-27T07:30:00+07:00",
    dueAt: "2026-10-30T23:59:00+07:00",      // 23:59 ngày 30/10
  },
  {
    id: "m5",
    title: "Đọc 2 chương sách thiếu nhi",
    description: "Đọc xong 2 chương sách truyện và ghi lại 3 bài học ý nghĩa em rút ra được.",
    rewardCoins: 60,
    difficulty: "easy",
    themeColor: "blue",
    iconType: "book-pen",
    status: "pending",
    isCompleted: false,
    assignedAt: "2026-10-26T14:00:00+07:00",
    dueAt: "2026-10-29T21:00:00+07:00",
  },

  // =========================================================================
  // 2. NHIỆM VỤ ĐÃ XONG (COMPLETED)
  // =========================================================================
  {
    id: "m6",
    title: "Dịch Anh ➔ Việt bài mẫu",
    description: "Hãy học thuộc lòng và dịch bài văn tuần này từ Anh sang Việt thật hay nhé!",
    rewardCoins: 50,
    difficulty: "medium",
    themeColor: "green",
    iconType: "flags-en-vi",
    status: "completed",
    isCompleted: true,
    assignedAt: "2026-10-26T14:00:00+07:00",
    dueAt: "2026-10-27T17:00:00+07:00",
    completedAt: "2026-10-26T16:30:00+07:00",
  },
  {
    id: "m7",
    title: "Điểm danh học tập buổi sáng",
    description: "Đăng nhập và điểm danh vào lúc 7h30 sáng trước khi vào tiết học.",
    rewardCoins: 20,
    difficulty: "easy",
    themeColor: "green",
    iconType: "notebook",
    status: "completed",
    isCompleted: true,
    assignedAt: "2026-10-27T07:00:00+07:00",
    dueAt: "2026-10-27T08:00:00+07:00",
    completedAt: "2026-10-27T07:25:00+07:00",
  },
  {
    id: "m8",
    title: "Ôn tập bảng cửu chương 7 và 8",
    description: "Hoàn thành bài kiểm tra nhanh 20 câu hỏi về bảng nhân 7 và nhân 8.",
    rewardCoins: 30,
    difficulty: "easy",
    themeColor: "green",
    iconType: "notebook",
    status: "completed",
    isCompleted: true,
    assignedAt: "2026-10-25T08:00:00+07:00",
    dueAt: "2026-10-25T20:00:00+07:00",
    completedAt: "2026-10-25T11:15:00+07:00",
  },
  {
    id: "m9",
    title: "Tóm tắt bài học Lịch sử tuần 8",
    description: "Ghi chép lại các mốc sự kiện quan trọng trong bài đọc Lịch sử lớp 5.",
    rewardCoins: 45,
    difficulty: "medium",
    themeColor: "green",
    iconType: "book-pen",
    status: "completed",
    isCompleted: true,
    assignedAt: "2026-10-24T09:00:00+07:00",
    dueAt: "2026-10-25T21:00:00+07:00",
    completedAt: "2026-10-24T20:45:00+07:00",
  },

  // =========================================================================
  // 3. NHIỆM VỤ QUÁ HẠN (OVERDUE) - ĐÃ QUA HẠN NỘP VÀ CHƯA HOÀN THÀNH
  // =========================================================================
  {
    id: "m10",
    title: "Giải bài toán đố hình học nâng cao",
    description: "Tính diện tích hình thang và giải bài toán chuyển động đều được giao cuối tuần trước.",
    rewardCoins: 70,
    difficulty: "hard",
    themeColor: "orange",
    iconType: "notebook",
    status: "overdue",
    isCompleted: false,
    assignedAt: "2026-10-23T08:00:00+07:00",
    dueAt: "2026-10-25T23:59:00+07:00", // Đã quá hạn ngày 25/10
  },
  {
    id: "m11",
    title: "Luyện phát âm ngữ âm Unit 4",
    description: "Ghi âm bài đọc mẫu 5 câu đối thoại tiếng Anh và gửi file phát âm.",
    rewardCoins: 50,
    difficulty: "medium",
    themeColor: "purple",
    iconType: "flags-vi-en",
    status: "overdue",
    isCompleted: false,
    assignedAt: "2026-10-24T10:00:00+07:00",
    dueAt: "2026-10-26T20:00:00+07:00", // Đã quá hạn tối hôm qua
  },
  {
    id: "m12",
    title: "Vẽ sơ đồ tư duy Bài 5 Sinh học",
    description: "Vẽ sơ đồ tư duy hệ tuần hoàn và chụp ảnh nộp lên hệ thống.",
    rewardCoins: 60,
    difficulty: "medium",
    themeColor: "blue",
    iconType: "book-pen",
    status: "overdue",
    isCompleted: false,
    assignedAt: "2026-10-22T08:00:00+07:00",
    dueAt: "2026-10-24T22:00:00+07:00", // Đã quá hạn ngày 24/10
  },
];
