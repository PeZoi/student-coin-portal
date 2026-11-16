-- Migration: Tối ưu hóa chỉ mục cho bảng missions và homework_submissions
-- Phục vụ truy vấn thống kê bài tập và tiến độ nộp bài siêu tốc

-- 1. Index cho homework_submissions theo mission_id
CREATE INDEX IF NOT EXISTS idx_submissions_mission 
ON public.homework_submissions (mission_id);

-- 2. Index cho missions theo is_deleted và ngày tạo giảm dần
CREATE INDEX IF NOT EXISTS idx_missions_deleted_created 
ON public.missions (is_deleted, created_at DESC);
