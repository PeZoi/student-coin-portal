export type ChibiGender = "male" | "female";

export interface ChibiAvatar {
  id: string;
  name: string;
  gender: ChibiGender;
  url: string;
  description: string;
}

export const MALE_CHIBI_AVATARS: ChibiAvatar[] = [
  {
    id: "male-1",
    name: "Thông Thái",
    gender: "male",
    url: "/avatar-chibi/male-1.webp",
    description: "Kính tròn thông minh, áo sao vàng rạng rỡ",
  },
  {
    id: "male-2",
    name: "Năng Động",
    gender: "male",
    url: "/avatar-chibi/male-2.webp",
    description: "Mũ đỏ cá tính, luôn tràn đầy năng lượng",
  },
  {
    id: "male-3",
    name: "Chăm Chỉ",
    gender: "male",
    url: "/avatar-chibi/male-3.webp",
    description: "Khăn quàng đỏ thắm, học sinh gương mẫu",
  },
  {
    id: "male-4",
    name: "Tươi Cười",
    gender: "male",
    url: "/avatar-chibi/male-4.webp",
    description: "Nụ cười rạng rỡ, áo hoodie xanh lá",
  },
  {
    id: "male-5",
    name: "Tinh Nghịch",
    gender: "male",
    url: "/avatar-chibi/male-5.webp",
    description: "Áo vàng tươi sáng, bạn của mọi người",
  },
  {
    id: "male-6",
    name: "Tự Tin",
    gender: "male",
    url: "/avatar-chibi/male-6.webp",
    description: "Phong thái đĩnh đạc, yêu thích học tập",
  },
  {
    id: "male-7",
    name: "Khám Phá",
    gender: "male",
    url: "/avatar-chibi/male-7.webp",
    description: "Thích tìm hiểu thế giới, năng nổ sáng tạo",
  },
  {
    id: "male-8",
    name: "Thân Thiện",
    gender: "male",
    url: "/avatar-chibi/male-8.webp",
    description: "Ánh mắt ấm áp, luôn hòa đồng cùng bạn bè",
  },
  {
    id: "male-9",
    name: "Chú Bộ Đội",
    gender: "male",
    url: "/avatar-chibi/male-9.webp",
    description: "Mũ ca-lô xanh, chú bộ đội tí hon oai phong",
  },
];

export const FEMALE_CHIBI_AVATARS: ChibiAvatar[] = [
  {
    id: "female-1",
    name: "Dịu Dàng",
    gender: "female",
    url: "/avatar-chibi/female-1.webp",
    description: "Kẹp tóc xinh xắn, khăn quàng đỏ chăm ngoan",
  },
  {
    id: "female-2",
    name: "Họa Mi",
    gender: "female",
    url: "/avatar-chibi/female-2.webp",
    description: "Trang phục dân tộc thổ cẩm rực rỡ sắc màu",
  },
  {
    id: "female-3",
    name: "Đáng Yêu",
    gender: "female",
    url: "/avatar-chibi/female-3.webp",
    description: "Nụ cười tỏa nắng, nét mặt hồn nhiên trong sáng",
  },
  {
    id: "female-4",
    name: "Hoạt Bát",
    gender: "female",
    url: "/avatar-chibi/female-4.webp",
    description: "Đôi mắt tròn xoe, năng động và vui tươi",
  },
  {
    id: "female-5",
    name: "Thùy Mị",
    gender: "female",
    url: "/avatar-chibi/female-5.webp",
    description: "Tóc mây bồng bềnh, bạn nhỏ ngoan ngoãn",
  },
  {
    id: "female-6",
    name: "Khéo Tay",
    gender: "female",
    url: "/avatar-chibi/female-6.webp",
    description: "Yêu thích nghệ thuật, thích vẽ tranh tô màu",
  },
  {
    id: "female-7",
    name: "Nhí Nhảnh",
    gender: "female",
    url: "/avatar-chibi/female-7.webp",
    description: "Gương mặt rạng rỡ, thích múa hát líu lo",
  },
  {
    id: "female-8",
    name: "Tinh Khôi",
    gender: "female",
    url: "/avatar-chibi/female-8.webp",
    description: "Ánh mắt ngây thơ, bạn học sinh gương mẫu",
  },
  {
    id: "female-9",
    name: "Mèo Con",
    gender: "female",
    url: "/avatar-chibi/female-9.webp",
    description: "Tóc hai bên đáng yêu, yếm mèo con ngộ nghĩnh",
  },
];

export const CHIBI_AVATARS: ChibiAvatar[] = [
  ...MALE_CHIBI_AVATARS,
  ...FEMALE_CHIBI_AVATARS,
];

export const DEFAULT_CHIBI_AVATAR = MALE_CHIBI_AVATARS[0].url;
