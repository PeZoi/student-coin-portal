-- Migration: Bổ sung các Composite Indexes & View thống kê xu tháng cho Trang Tổng Quan (Teacher Dashboard)
-- Giúp Postgres thực hiện Index Scan & Database-level Aggregation thay vì kéo raw data về Node.js

-- 1. Index tối ưu truy vấn tính toán xu thưởng trong tháng theo học sinh
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_month
  ON public.coin_transactions (user_id, created_at DESC, tx_type);

-- 2. Index tối ưu truy vấn bài nộp đang chờ duyệt theo học sinh của lớp
CREATE INDEX IF NOT EXISTS idx_homework_submissions_pending_lookup
  ON public.homework_submissions (approval_status, student_id, created_at DESC);

-- 3. Index tối ưu truy vấn yêu cầu đổi quà đang chờ duyệt và đã duyệt theo tháng
CREATE INDEX IF NOT EXISTS idx_monthly_exchange_status_month
  ON public.monthly_exchange_requests (status, student_id, month, year);

-- 4. Index tối ưu truy vấn nhiệm vụ học sinh cần nhắc nhở (assigned / rejected)
CREATE INDEX IF NOT EXISTS idx_student_missions_student_status_lookup
  ON public.student_missions (student_id, status);

-- 5. View thống kê xu kiếm được & số bài tập hoàn thành theo từng học sinh trong tháng (Múi giờ Việt Nam GMT+7)
CREATE OR REPLACE VIEW public.v_student_monthly_leaderboard
WITH (security_invoker = true) AS
WITH monthly_coins AS (
  SELECT
    ct.user_id AS student_id,
    EXTRACT(MONTH FROM timezone('Asia/Ho_Chi_Minh', ct.created_at))::int AS month,
    EXTRACT(YEAR FROM timezone('Asia/Ho_Chi_Minh', ct.created_at))::int AS year,
    COALESCE(SUM(ct.amount) FILTER (WHERE ct.tx_type = 'MISSION_REWARD'), 0)::int AS missions_coins,
    COALESCE(SUM(ct.amount) FILTER (WHERE ct.tx_type = 'WHEEL_PRIZE'), 0)::int AS wheel_coins,
    COALESCE(SUM(ct.amount) FILTER (WHERE ct.tx_type NOT IN ('MISSION_REWARD', 'WHEEL_PRIZE', 'EXCHANGE_REFUND')), 0)::int AS bonus_coins,
    COALESCE(SUM(ct.amount), 0)::int AS monthly_coins_earned
  FROM public.coin_transactions ct
  WHERE ct.amount > 0
    AND ct.tx_type <> 'EXCHANGE_REFUND'
  GROUP BY
    ct.user_id,
    EXTRACT(MONTH FROM timezone('Asia/Ho_Chi_Minh', ct.created_at))::int,
    EXTRACT(YEAR FROM timezone('Asia/Ho_Chi_Minh', ct.created_at))::int
),
monthly_missions AS (
  SELECT
    hs.student_id,
    EXTRACT(MONTH FROM timezone('Asia/Ho_Chi_Minh', hs.created_at))::int AS month,
    EXTRACT(YEAR FROM timezone('Asia/Ho_Chi_Minh', hs.created_at))::int AS year,
    COUNT(*)::int AS completed_missions_count
  FROM public.homework_submissions hs
  WHERE hs.approval_status = 'approved'
  GROUP BY
    hs.student_id,
    EXTRACT(MONTH FROM timezone('Asia/Ho_Chi_Minh', hs.created_at))::int,
    EXTRACT(YEAR FROM timezone('Asia/Ho_Chi_Minh', hs.created_at))::int
),
combined_keys AS (
  SELECT student_id, month, year FROM monthly_coins
  UNION
  SELECT student_id, month, year FROM monthly_missions
)
SELECT
  u.id AS student_id,
  u.full_name AS student_name,
  u.avatar_url,
  u.class_id,
  COALESCE(c.class_name, '') AS class_name,
  ck.month,
  ck.year,
  COALESCE(mc.missions_coins, 0)::int AS missions_coins,
  COALESCE(mc.wheel_coins, 0)::int AS wheel_coins,
  COALESCE(mc.bonus_coins, 0)::int AS bonus_coins,
  COALESCE(mc.monthly_coins_earned, 0)::int AS monthly_coins_earned,
  COALESCE(mm.completed_missions_count, 0)::int AS completed_missions_count
FROM combined_keys ck
INNER JOIN public.users u
  ON u.id = ck.student_id
  AND u.role = 'student'
  AND u.is_deleted = false
LEFT JOIN public.classes c
  ON c.id = u.class_id
  AND c.is_deleted = false
LEFT JOIN monthly_coins mc
  ON mc.student_id = ck.student_id
  AND mc.month = ck.month
  AND mc.year = ck.year
LEFT JOIN monthly_missions mm
  ON mm.student_id = ck.student_id
  AND mm.month = ck.month
  AND mm.year = ck.year;
