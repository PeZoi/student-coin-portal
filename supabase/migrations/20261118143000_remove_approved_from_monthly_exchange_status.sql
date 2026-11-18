-- ==============================================================================
-- MIGRATION: REMOVE 'approved' STATUS FROM monthly_exchange_status ENUM
-- Quy trình đổi quà mới: Học sinh gửi yêu cầu (pending) -> Giáo viên nhấn duyệt trao quà (completed).
-- Bỏ hoàn toàn trạng thái trung gian 'approved' để tối ưu luồng thao tác 1 chạm cho giáo viên.
-- ==============================================================================

-- 1. Cập nhật tất cả các bản ghi đang ở trạng thái 'approved' sang 'completed'
UPDATE public.monthly_exchange_requests 
SET status = 'completed'::monthly_exchange_status 
WHERE status = 'approved'::monthly_exchange_status;

-- 2. Tạo ENUM mới không có 'approved'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'monthly_exchange_status_new') THEN
        CREATE TYPE public.monthly_exchange_status_new AS ENUM ('pending', 'completed', 'rejected', 'cancelled');
    END IF;
END $$;

-- 3. Chuyển đổi kiểu dữ liệu cột status sang ENUM mới
ALTER TABLE public.monthly_exchange_requests ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.monthly_exchange_requests 
  ALTER COLUMN status TYPE public.monthly_exchange_status_new 
  USING (status::text::public.monthly_exchange_status_new);
ALTER TABLE public.monthly_exchange_requests 
  ALTER COLUMN status SET DEFAULT 'pending'::public.monthly_exchange_status_new;

-- 4. Xóa ENUM cũ và đổi tên ENUM mới
DROP TYPE public.monthly_exchange_status;
ALTER TYPE public.monthly_exchange_status_new RENAME TO monthly_exchange_status;
