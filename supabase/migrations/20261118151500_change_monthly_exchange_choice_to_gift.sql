-- ==============================================================================
-- Migration: Đổi giá trị enum 'shopee' thành 'gift' trong monthly_exchange_choice
-- ==============================================================================

-- 1. Đổi tên ENUM cũ
ALTER TYPE monthly_exchange_choice RENAME TO monthly_exchange_choice_old;

-- 2. Tạo ENUM mới với 2 hình thức: 'cash' (Tiền mặt) và 'gift' (Quà tặng tự chọn)
CREATE TYPE monthly_exchange_choice AS ENUM ('cash', 'gift');

-- 3. Cập nhật kiểu dữ liệu cột choice_type và ánh xạ giá trị cũ 'shopee' -> 'gift'
ALTER TABLE monthly_exchange_requests 
  ALTER COLUMN choice_type TYPE monthly_exchange_choice 
  USING (
    CASE 
      WHEN choice_type::text = 'shopee' THEN 'gift'::monthly_exchange_choice
      WHEN choice_type::text = 'cash' THEN 'cash'::monthly_exchange_choice
      ELSE 'gift'::monthly_exchange_choice
    END
  );

-- 4. Xóa ENUM cũ
DROP TYPE monthly_exchange_choice_old;
