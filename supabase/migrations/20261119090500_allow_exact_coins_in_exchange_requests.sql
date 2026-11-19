-- Migration: Cho phép số xu linh hoạt (chính xác), bỏ ràng buộc bội số 5000 xu cũ
-- Bảng: monthly_exchange_requests
-- Lý do: Hỗ trợ tính số xu chính xác cho quà tự chọn và cấu hình step_coins động từ hệ thống

ALTER TABLE monthly_exchange_requests 
  DROP CONSTRAINT IF EXISTS monthly_exchange_requests_coins_to_exchange_check;

ALTER TABLE monthly_exchange_requests 
  ADD CONSTRAINT monthly_exchange_requests_coins_to_exchange_check 
  CHECK (coins_to_exchange >= 0);

COMMENT ON CONSTRAINT monthly_exchange_requests_coins_to_exchange_check ON monthly_exchange_requests 
  IS 'Số xu quy đổi phải là số nguyên không âm (>= 0), cho phép số xu chính xác không bắt buộc chia hết cho 5000';
