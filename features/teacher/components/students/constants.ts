import { getInitials } from "@/lib/utils";

/**
 * Lấy chữ cái đầu tiên làm Avatar đại diện học sinh (tái sử dụng getInitials từ @/lib/utils)
 */
export function getStudentInitial(name: string): string {
  return getInitials(name, "S");
}
