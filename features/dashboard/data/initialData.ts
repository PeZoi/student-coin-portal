import { Mission, StudentProfile } from "../types";

export const initialStudent: StudentProfile = {
  name: "Gia Bảo",
  classGroup: "Lớp 5A",
  avatarUrl: "/avatar.jpg",
  currentCoins: 1760,
  nextTierCoins: 2000,
  piggyTitle: "HEO ĐẤT CỦA GIA BẢO 🐷",
  nextTierTitle: "Heo Vàng béo ú!",
};

export const initialMissions: Mission[] = [
  {
    id: "mission-1",
    title: "Hoàn thành bài tập & đúng hết",
    rewardCoins: 40,
    iconSrc: "/pencil.png",
    headerBg: "bg-gradient-to-r from-[#00A2FF] to-[#007AE6]",
    buttonText: "Nộp bài tập (Ảnh/Excel)",
    buttonVariant: "yellow",
    status: "available",
    actionType: "upload",
  },
  {
    id: "mission-2",
    title: "Viết 1 bài văn sáng tạo",
    rewardCoins: 50,
    iconSrc: "/pen.png",
    headerBg: "bg-gradient-to-r from-[#A855F7] to-[#7E22CE]",
    buttonText: "Nộp bài làm",
    buttonVariant: "green",
    status: "available",
    actionType: "upload",
  },
  {
    id: "mission-3",
    title: "Học thuộc & Dịch Anh ➡️ Việt",
    rewardCoins: 50,
    iconSrc: "/en-vi.png",
    headerBg: "bg-gradient-to-r from-[#00C07F] to-[#00945E]",
    buttonText: "Báo cáo hoàn thành",
    buttonVariant: "green",
    status: "available",
    actionType: "report",
  },
  {
    id: "mission-4",
    title: "Học thuộc & Dịch Việt ➡️ Anh",
    rewardCoins: 100,
    iconSrc: "/vi-en.png",
    headerBg: "bg-gradient-to-r from-[#FF6B35] to-[#E63900]",
    buttonText: "Báo cáo hoàn thành",
    buttonVariant: "green",
    status: "available",
    actionType: "report",
  },
];
