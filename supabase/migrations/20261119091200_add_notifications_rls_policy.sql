-- Migration: Bổ sung chính sách bảo mật RLS policy cho bảng notifications
-- Lý do: Bảng notifications đã được bật RLS nhưng chưa có policy, khiến các lệnh INSERT thông báo khi duyệt/từ chối đổi quà bị lỗi 42501 RLS policy violation.

DROP POLICY IF EXISTS "allow_all_notifications" ON notifications;

CREATE POLICY "allow_all_notifications" 
  ON notifications 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

COMMENT ON POLICY "allow_all_notifications" ON notifications 
  IS 'Cho phép hệ thống và người dùng thêm, đọc, cập nhật thông báo (phân quyền chi tiết được quản lý ở tầng Backend API)';
