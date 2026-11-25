/**
 * ==============================================================================
 * DATABASE SCHEMA & TYPES: MISSIONS (NHIỆM VỤ HỌC TẬP TÍCH XU)
 * ==============================================================================
 * 
 * Tài liệu tham khảo tạo bảng Database (Prisma / PostgreSQL):
 * 
 * ```prisma
 * enum MissionDifficulty {
 *   easy
 *   medium
 *   hard
 * }
 * 
 * enum MissionStatus {
 *   pending    // Chưa xong (trong hạn)
 *   completed  // Đã xong
 *   overdue    // Quá hạn (chưa nộp và đã quá hạn dueAt)
 * }
 * 
 * model Mission {
 *   id              String            @id @default(uuid())
 *   title           String            @db.VarChar(255)
 *   description     String            @db.Text
 *   rewardCoins     Int               @default(0)
 *   difficulty      MissionDifficulty @default(easy)
 *   themeColor      String            @default("blue") @db.VarChar(30)
 *   iconType        String            @default("notebook") @db.VarChar(50)
 *   status          MissionStatus     @default(pending)
 *   assignedAt      DateTime          @default(now())
 *   dueAt           DateTime
 *   completedAt     DateTime?
 *   submissionProof String?           @db.VarChar(1000)
 *   createdAt       DateTime          @default(now())
 *   updatedAt       DateTime          @updatedAt
 * 
 *   @@map("missions")
 * }
 * ```
 */

export type MissionDifficulty = "easy" | "medium" | "hard";

export type MissionThemeColor = "blue" | "purple" | "green" | "orange";

export type MissionIconType = "notebook" | "book-pen" | "flags-en-vi" | "flags-vi-en";

/**
 * Trạng thái của nhiệm vụ trong cơ sở dữ liệu:
 * - pending: Chưa xong (vẫn còn trong thời hạn nộp)
 * - completed: Đã hoàn thành (đã nộp & nhận thưởng)
 * - overdue: Quá hạn (chưa hoàn thành nhưng đã vượt mốc dueAt)
 */
export type MissionStatus = "pending" | "completed" | "overdue";

/**
 * 3 Tab điều hướng danh sách nhiệm vụ trên giao diện:
 * - pending: Chưa xong
 * - completed: Đã xong
 * - overdue: Quá hạn
 */
export type MissionFilter = "pending" | "completed" | "overdue";

/**
 * Entity Nhiệm vụ (Tương ứng 1-1 với bản ghi trong Database)
 */
export interface MissionItem {
  id: string; // Khóa chính (UUID / ID chuỗi duy nhất)
  title: string; // Tên nhiệm vụ
  description: string; // Mô tả chi tiết yêu cầu bài tập
  rewardCoins: number; // Số lượng coin thưởng
  difficulty: MissionDifficulty; // Độ khó: easy | medium | hard
  themeColor: MissionThemeColor; // Màu chủ đề giao diện
  iconType: MissionIconType; // Biểu tượng bài tập
  status: MissionStatus; // Trạng thái: pending | completed | overdue
  assignedAt: string; // ISO 8601 DateTime (ví dụ: "2026-10-27T08:00:00.000Z")
  dueAt: string; // ISO 8601 DateTime (ví dụ: "2026-10-27T21:00:00.000Z")
  completedAt?: string | null; // Thời điểm nộp/hoàn thành (ISO 8601)
  submissionProof?: string | null; // URL file bài làm hoặc ảnh chụp

  isCompleted?: boolean; // Cờ kiểm tra nhanh (true nếu status === 'completed')
}
