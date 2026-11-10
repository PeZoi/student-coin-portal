/**
 * Mã lỗi tiêu chuẩn của cơ sở dữ liệu PostgreSQL (PostgreSQL Error Codes)
 * - Tham khảo đặc tả mã lỗi chuẩn SQL: https://www.postgresql.org/docs/current/errcodes-appendix.html
 * - Sử dụng để nhận diện chính xác nguyên nhân lỗi từ Database (Supabase) thay vì dựa vào chuỗi text
 */
export const PostgresErrorCode = {
  /**
   * 23505 - UNIQUE_VIOLATION (Class 23 — Integrity Constraint Violation)
   * Vi phạm ràng buộc duy nhất (Unique Constraint hoặc Unique Index).
   * Xảy ra khi thêm mới / cập nhật dữ liệu bị trùng lặp trường bắt buộc duy nhất
   * (ví dụ: trùng tên lớp học, trùng tên đăng nhập @username, trùng số điện thoại Zalo, trùng email).
   */
  UNIQUE_VIOLATION: "23505",

  /**
   * 23503 - FOREIGN_KEY_VIOLATION
   * Vi phạm ràng buộc khóa ngoại (Foreign Key Constraint).
   * Xảy ra khi tham chiếu tới bản ghi không tồn tại hoặc xóa bản ghi cha khi dữ liệu con vẫn còn liên kết.
   */
  FOREIGN_KEY_VIOLATION: "23503",

  /**
   * 23502 - NOT_NULL_VIOLATION
   * Vi phạm ràng buộc giá trị rỗng (Not-Null Constraint).
   * Xảy ra khi một cột bắt buộc (NOT NULL) nhưng không được truyền giá trị.
   */
  NOT_NULL_VIOLATION: "23502",

  /**
   * 23514 - CHECK_VIOLATION
   * Vi phạm ràng buộc kiểm tra (Check Constraint).
   * Dữ liệu truyền vào không thỏa mãn điều kiện logic của CHECK (ví dụ: điểm số < 0 hoặc coin âm).
   */
  CHECK_VIOLATION: "23514",

  /**
   * 42501 - INSUFFICIENT_PRIVILEGE
   * Không đủ quyền hạn thực thi hoặc vi phạm chính sách Row-Level Security (RLS).
   */
  INSUFFICIENT_PRIVILEGE: "42501",
} as const;

export type PostgresErrorCodeType =
  (typeof PostgresErrorCode)[keyof typeof PostgresErrorCode];
