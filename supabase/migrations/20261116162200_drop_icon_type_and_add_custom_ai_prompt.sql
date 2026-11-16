-- Migration: Xóa cột icon_type và thêm cột custom_ai_prompt vào bảng missions
-- 1. Xóa icon_type vì hệ thống đã chuyển sang quản lý icon tự động theo submission_type
ALTER TABLE public.missions DROP COLUMN IF EXISTS icon_type;

-- 2. Thêm custom_ai_prompt để giáo viên nhập chỉ dẫn riêng cho AI khi chấm bài
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS custom_ai_prompt TEXT NULL;
