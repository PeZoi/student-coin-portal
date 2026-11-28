-- Migration: Dọn dẹp cột growth_percent không còn sử dụng trong monthly_leaderboard
-- Chuyển hoàn toàn sang tính tiến bộ bằng delta_coins (số xu tăng thêm thuần)

ALTER TABLE public.monthly_leaderboard 
  DROP COLUMN IF EXISTS growth_percent;
