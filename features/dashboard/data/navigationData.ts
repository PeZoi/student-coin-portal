export interface NavigationItem {
  id: string;
  title: string;
  subtitle: string;
  iconSrc: string;
  buttonText: string;
  buttonVariant: "yellow" | "green" | "orange" | "blue" | "purple";
  href: string;
  borderColor: string;
  bodyBg: string;
  headerBg: string;
  arcFill: string;
  badgeText: string;
  badgeStyle: string;
}

export const navigationCards: NavigationItem[] = [
  {
    id: "missions",
    title: "NHIỆM VỤ",
    subtitle: "Làm bài tập & Tích lũy xu",
    iconSrc: "/navigation/mission.png",
    buttonText: "Vào làm ngay",
    buttonVariant: "blue",
    href: "/student/missions",
    borderColor: "border-[#0091FF]",
    bodyBg: "bg-[#EBF6FF]",
    headerBg: "bg-gradient-to-r from-[#0091FF] via-[#007AE6] to-[#0055CC]",
    arcFill: "fill-[#EBF6FF]",
    badgeText: "Bài tập",
    badgeStyle: "bg-sky-100 text-sky-700 border-sky-300",
  },
  {
    id: "wheel",
    title: "VÒNG QUAY MAY MẮN",
    subtitle: "Thử vận may rinh quà khủng",
    iconSrc: "/navigation/spinner.png",
    buttonText: "Quay thưởng ngay",
    buttonVariant: "orange",
    href: "/student/wheel",
    borderColor: "border-[#FF8400]",
    bodyBg: "bg-[#FFF6EB]",
    headerBg: "bg-gradient-to-r from-[#FF8400] via-[#FF6A00] to-[#E64500]",
    arcFill: "fill-[#FFF6EB]",
    badgeText: "Quay",
    badgeStyle: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "rewards",
    title: "ĐỔI QUÀ",
    subtitle: "Đổi xu nhận quà hấp dẫn",
    iconSrc: "/navigation/reward.png",
    buttonText: "Đổi quà ngay",
    buttonVariant: "green",
    href: "/student/rewards",
    borderColor: "border-[#00C254]",
    bodyBg: "bg-[#EDFDF3]",
    headerBg: "bg-gradient-to-r from-[#00C254] via-[#00A843] to-[#067F33]",
    arcFill: "fill-[#EDFDF3]",
    badgeText: "Quà xịn",
    badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    id: "leaderboard",
    title: "BẢNG XẾP HẠNG",
    subtitle: "Vinh danh học sinh chăm ngoan",
    iconSrc: "/navigation/rank.png",
    buttonText: "Xem bảng vàng",
    buttonVariant: "purple",
    href: "#leaderboard",
    borderColor: "border-[#9333EA]",
    bodyBg: "bg-[#FBF5FF]",
    headerBg: "bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#7E22CE]",
    arcFill: "fill-[#FBF5FF]",
    badgeText: "Top",
    badgeStyle: "bg-purple-100 text-purple-800 border-purple-300",
  },
];
