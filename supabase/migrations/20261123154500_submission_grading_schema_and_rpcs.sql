-- Migration: Bổ sung final_score, ràng buộc mission_id NOT NULL và 3 hàm RPC Atomic Transaction cho Duyệt / Từ chối / Hủy bài nộp

-- 1. Bổ sung cột final_score (điểm giáo viên chốt) vào bảng homework_submissions
ALTER TABLE public.homework_submissions
  ADD COLUMN IF NOT EXISTS final_score DECIMAL(3,1);

ALTER TABLE public.homework_submissions
  DROP CONSTRAINT IF EXISTS homework_submissions_final_score_check;

ALTER TABLE public.homework_submissions
  ADD CONSTRAINT homework_submissions_final_score_check
  CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 10));

-- 2. Ràng buộc mission_id NOT NULL và đổi FK sang ON DELETE RESTRICT (khớp với safe_delete_mission)
ALTER TABLE public.homework_submissions
  DROP CONSTRAINT IF EXISTS homework_submissions_mission_id_fkey;

ALTER TABLE public.homework_submissions
  ALTER COLUMN mission_id SET NOT NULL;

ALTER TABLE public.homework_submissions
  ADD CONSTRAINT homework_submissions_mission_id_fkey
  FOREIGN KEY (mission_id) REFERENCES public.missions(id) ON DELETE RESTRICT;

-- 3. RPC Duyệt bài tập & Cộng xu Heo Đất (Atomic ACID Transaction)
CREATE OR REPLACE FUNCTION public.approve_homework_submission(
  p_submission_id uuid,
  p_reviewer_id uuid,
  p_final_coins integer,
  p_final_score numeric DEFAULT NULL,
  p_teacher_feedback text DEFAULT NULL,
  p_correct_count integer DEFAULT NULL,
  p_total_questions integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_sub RECORD;
  v_mission_title TEXT;
  v_current_coins INTEGER;
  v_total_earned_coins INTEGER;
  v_new_coins INTEGER;
  v_new_total_earned INTEGER;
  v_is_active BOOLEAN;
  v_is_deleted BOOLEAN;
  v_effective_score NUMERIC(3,1);
  v_effective_correct INTEGER;
  v_effective_total INTEGER;
  v_clean_feedback TEXT;
  v_tx_id UUID := NULL;
  v_reviewed_at TIMESTAMPTZ := CURRENT_TIMESTAMP;
BEGIN
  IF p_final_coins IS NULL OR p_final_coins < 0 THEN
    RAISE EXCEPTION 'INVALID_FINAL_COINS';
  END IF;

  IF p_final_score IS NOT NULL AND (p_final_score < 0 OR p_final_score > 10) THEN
    RAISE EXCEPTION 'INVALID_FINAL_SCORE';
  END IF;

  IF p_correct_count IS NOT NULL AND p_correct_count < 0 THEN
    RAISE EXCEPTION 'INVALID_QUESTION_COUNT';
  END IF;

  IF p_total_questions IS NOT NULL AND p_total_questions < 0 THEN
    RAISE EXCEPTION 'INVALID_QUESTION_COUNT';
  END IF;

  -- 1. Khóa dòng bài nộp chống race condition / double approve
  SELECT
    id,
    mission_id,
    student_id,
    approval_status,
    ai_score,
    correct_count,
    total_questions
  INTO v_sub
  FROM public.homework_submissions
  WHERE id = p_submission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SUBMISSION_NOT_FOUND';
  END IF;

  IF v_sub.approval_status = 'approved' THEN
    RAISE EXCEPTION 'SUBMISSION_ALREADY_APPROVED';
  END IF;

  IF v_sub.approval_status = 'cancelled' THEN
    RAISE EXCEPTION 'SUBMISSION_CANCELLED';
  END IF;

  v_effective_correct := COALESCE(p_correct_count, v_sub.correct_count);
  v_effective_total := COALESCE(p_total_questions, v_sub.total_questions);

  IF v_effective_correct IS NOT NULL
     AND v_effective_total IS NOT NULL
     AND v_effective_correct > v_effective_total THEN
    RAISE EXCEPTION 'CORRECT_EXCEEDS_TOTAL';
  END IF;

  v_effective_score := COALESCE(p_final_score, v_sub.ai_score);
  v_clean_feedback := NULLIF(TRIM(COALESCE(p_teacher_feedback, '')), '');

  -- 2. Lấy tiêu đề bài tập phục vụ ghi sổ cái & thông báo
  SELECT title INTO v_mission_title
  FROM public.missions
  WHERE id = v_sub.mission_id;

  v_mission_title := COALESCE(v_mission_title, 'Bài tập về nhà');

  -- 3. Khóa dòng học sinh
  SELECT current_coins, total_earned_coins, is_active, is_deleted
  INTO v_current_coins, v_total_earned_coins, v_is_active, v_is_deleted
  FROM public.users
  WHERE id = v_sub.student_id
  FOR UPDATE;

  IF NOT FOUND OR v_is_deleted = true THEN
    RAISE EXCEPTION 'STUDENT_NOT_FOUND';
  END IF;

  v_current_coins := COALESCE(v_current_coins, 0);
  v_total_earned_coins := COALESCE(v_total_earned_coins, 0);
  v_new_coins := v_current_coins + p_final_coins;
  v_new_total_earned := v_total_earned_coins + p_final_coins;

  -- 4. Cập nhật bài nộp sang approved
  UPDATE public.homework_submissions
  SET
    approval_status = 'approved',
    final_coins = p_final_coins,
    final_score = v_effective_score,
    correct_count = v_effective_correct,
    total_questions = v_effective_total,
    teacher_feedback = v_clean_feedback,
    reviewed_by = p_reviewer_id,
    reviewed_at = v_reviewed_at,
    updated_by = p_reviewer_id,
    updated_at = v_reviewed_at
  WHERE id = p_submission_id;

  -- 5. Đồng bộ tiến độ bài tập trong student_missions
  UPDATE public.student_missions
  SET
    status = 'approved',
    completed_at = v_reviewed_at
  WHERE student_id = v_sub.student_id
    AND mission_id = v_sub.mission_id;

  -- 6. Cộng xu vào Heo Đất & ghi sổ cái coin_transactions (nếu final_coins > 0)
  IF p_final_coins > 0 THEN
    UPDATE public.users
    SET
      current_coins = v_new_coins,
      total_earned_coins = v_new_total_earned
    WHERE id = v_sub.student_id;

    INSERT INTO public.coin_transactions (
      user_id,
      tx_type,
      amount,
      balance_before,
      balance_after,
      reference_type,
      reference_id,
      description,
      created_by
    ) VALUES (
      v_sub.student_id,
      'MISSION_REWARD',
      p_final_coins,
      v_current_coins,
      v_new_coins,
      'homework_submissions',
      p_submission_id,
      'Thưởng duyệt bài tập: ' || v_mission_title,
      p_reviewer_id
    )
    RETURNING id INTO v_tx_id;
  END IF;

  -- 7. Tạo thông báo gửi học sinh
  INSERT INTO public.notifications (
    user_id,
    title,
    content,
    type,
    reference_type,
    reference_id,
    created_by
  ) VALUES (
    v_sub.student_id,
    'Bài tập đã được duyệt! (+' || p_final_coins || ' xu)',
    COALESCE(
      v_clean_feedback,
      'Cô giáo đã duyệt bài tập "' || v_mission_title || '" và cộng +' || p_final_coins || ' xu vào Heo Đất của con.'
    ),
    'homework_approved',
    'homework_submissions',
    p_submission_id::text,
    p_reviewer_id
  );

  RETURN jsonb_build_object(
    'submission_id', p_submission_id,
    'approval_status', 'approved',
    'final_coins', p_final_coins,
    'final_score', v_effective_score,
    'correct_count', v_effective_correct,
    'total_questions', v_effective_total,
    'current_coins', v_new_coins,
    'coin_tx_id', v_tx_id,
    'reviewed_at', v_reviewed_at
  );
END;
$function$;

-- 4. RPC Từ chối / Yêu cầu học sinh nộp lại bài (Atomic ACID Transaction)
CREATE OR REPLACE FUNCTION public.reject_homework_submission(
  p_submission_id uuid,
  p_reviewer_id uuid,
  p_teacher_feedback text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_sub RECORD;
  v_mission_title TEXT;
  v_clean_feedback TEXT;
  v_reviewed_at TIMESTAMPTZ := CURRENT_TIMESTAMP;
BEGIN
  v_clean_feedback := NULLIF(TRIM(COALESCE(p_teacher_feedback, '')), '');
  IF v_clean_feedback IS NULL THEN
    v_clean_feedback := 'Ảnh bài làm chưa rõ hoặc chưa đủ yêu cầu, con kiểm tra và nộp lại giúp cô nhé!';
  END IF;

  -- 1. Khóa dòng bài nộp
  SELECT id, mission_id, student_id, approval_status
  INTO v_sub
  FROM public.homework_submissions
  WHERE id = p_submission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SUBMISSION_NOT_FOUND';
  END IF;

  IF v_sub.approval_status <> 'pending_approval' THEN
    RAISE EXCEPTION 'SUBMISSION_NOT_PENDING';
  END IF;

  SELECT title INTO v_mission_title
  FROM public.missions
  WHERE id = v_sub.mission_id;

  v_mission_title := COALESCE(v_mission_title, 'Bài tập về nhà');

  -- 2. Cập nhật bài nộp sang rejected
  UPDATE public.homework_submissions
  SET
    approval_status = 'rejected',
    final_coins = 0,
    teacher_feedback = v_clean_feedback,
    reviewed_by = p_reviewer_id,
    reviewed_at = v_reviewed_at,
    updated_by = p_reviewer_id,
    updated_at = v_reviewed_at
  WHERE id = p_submission_id;

  -- 3. Đồng bộ trạng thái student_missions sang rejected
  UPDATE public.student_missions
  SET status = 'rejected'
  WHERE student_id = v_sub.student_id
    AND mission_id = v_sub.mission_id;

  -- 4. Tạo thông báo yêu cầu nộp lại cho học sinh
  INSERT INTO public.notifications (
    user_id,
    title,
    content,
    type,
    reference_type,
    reference_id,
    created_by
  ) VALUES (
    v_sub.student_id,
    'Cô giáo yêu cầu nộp lại bài: ' || v_mission_title,
    v_clean_feedback,
    'homework_rejected',
    'homework_submissions',
    p_submission_id::text,
    p_reviewer_id
  );

  RETURN jsonb_build_object(
    'submission_id', p_submission_id,
    'approval_status', 'rejected',
    'teacher_feedback', v_clean_feedback,
    'reviewed_at', v_reviewed_at
  );
END;
$function$;

-- 5. RPC Học sinh hủy bài nộp (khi chưa được duyệt) để nộp lại
CREATE OR REPLACE FUNCTION public.cancel_homework_submission(
  p_submission_id uuid,
  p_student_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_sub RECORD;
  v_cancelled_at TIMESTAMPTZ := CURRENT_TIMESTAMP;
BEGIN
  SELECT id, mission_id, student_id, approval_status
  INTO v_sub
  FROM public.homework_submissions
  WHERE id = p_submission_id
    AND student_id = p_student_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SUBMISSION_NOT_FOUND';
  END IF;

  IF v_sub.approval_status <> 'pending_approval' THEN
    RAISE EXCEPTION 'SUBMISSION_CANNOT_CANCEL';
  END IF;

  UPDATE public.homework_submissions
  SET
    approval_status = 'cancelled',
    cancelled_at = v_cancelled_at,
    updated_by = p_student_id,
    updated_at = v_cancelled_at
  WHERE id = p_submission_id;

  UPDATE public.student_missions
  SET
    status = 'assigned',
    submitted_at = NULL,
    is_late = FALSE
  WHERE student_id = v_sub.student_id
    AND mission_id = v_sub.mission_id;

  RETURN jsonb_build_object(
    'submission_id', p_submission_id,
    'approval_status', 'cancelled',
    'cancelled_at', v_cancelled_at
  );
END;
$function$;
