-- Migration: Bổ sung cột rejection_reason vào bảng monthly_exchange_requests
-- Giúp lưu lý do từ chối độc lập, không làm biến đổi ghi chú shopee_note của học sinh

ALTER TABLE monthly_exchange_requests
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

COMMENT ON COLUMN monthly_exchange_requests.rejection_reason IS 'Lý do giáo viên từ chối yêu cầu đổi quà của học sinh';
