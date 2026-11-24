-- Migration: Tối ưu Level 1 bằng RPC get_submission_missions_overview (< 7 ngày quá hạn, vượt giới hạn 1.000 dòng PostgREST)
-- và siết bảo mật approve_homework_submission (chặn bài rejected) + batch_approve_homework_submissions (Defense in Depth)

-- 1. RPC tổng hợp danh sách bài tập duyệt bài (Level 1) bằng SQL GROUP BY + DISTINCT ON
CREATE OR REPLACE FUNCTION public.get_submission_missions_overview(
  p_class_ids uuid[] DEFAULT NULL,
  p_expired_window_days integer DEFAULT 7
)
RETURNS TABLE (
  id uuid,
  title varchar,
  description text,
  due_at timestamptz,
  min_reward_coins integer,
  max_reward_coins integer,
  submission_type public.mission_submission_type,
  allow_late_submission boolean,
  grading_focus public.ai_error_type[],
  total_students integer,
  submitted_count integer,
  pending_count integer,
  approved_count integer,
  rejected_count integer,
  exempt_count integer,
  is_expired boolean
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  WITH scoped_missions AS (
    SELECT
      m.id,
      m.title,
      m.description,
      m.due_at,
      m.min_reward_coins,
      m.max_reward_coins,
      m.submission_type,
      m.allow_late_submission,
      m.grading_focus,
      (m.due_at < CURRENT_TIMESTAMP) AS is_expired
    FROM public.missions m
    WHERE m.is_deleted = FALSE
      AND m.due_at >= (CURRENT_TIMESTAMP - make_interval(days => GREATEST(0, COALESCE(p_expired_window_days, 7))))
      AND (
        p_class_ids IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.mission_classes mc
          WHERE mc.mission_id = m.id
            AND mc.class_id = ANY(p_class_ids)
        )
      )
  ),
  scoped_student_missions AS (
    SELECT
      sm.mission_id,
      sm.student_id,
      sm.status
    FROM public.student_missions sm
    INNER JOIN scoped_missions m ON m.id = sm.mission_id
    INNER JOIN public.users u ON u.id = sm.student_id AND u.is_deleted = FALSE
    WHERE p_class_ids IS NULL OR sm.class_id = ANY(p_class_ids)
  ),
  roster_stats AS (
    SELECT
      mission_id,
      COUNT(*) FILTER (WHERE status <> 'exempt')::integer AS active_student_count,
      COUNT(*) FILTER (WHERE status = 'exempt')::integer AS exempt_count
    FROM scoped_student_missions
    GROUP BY mission_id
  ),
  latest_submissions AS (
    SELECT DISTINCT ON (hs.mission_id, hs.student_id)
      hs.mission_id,
      hs.student_id,
      hs.approval_status
    FROM public.homework_submissions hs
    INNER JOIN scoped_missions m ON m.id = hs.mission_id
    WHERE hs.approval_status <> 'cancelled'
      AND (
        EXISTS (
          SELECT 1
          FROM scoped_student_missions ssm
          WHERE ssm.mission_id = hs.mission_id
            AND ssm.student_id = hs.student_id
            AND ssm.status <> 'exempt'
        )
        OR (
          p_class_ids IS NULL
          AND NOT EXISTS (
            SELECT 1
            FROM scoped_student_missions ssm_ex
            WHERE ssm_ex.mission_id = hs.mission_id
              AND ssm_ex.student_id = hs.student_id
              AND ssm_ex.status = 'exempt'
          )
        )
      )
    ORDER BY hs.mission_id, hs.student_id, hs.attempt_number DESC, hs.created_at DESC
  ),
  submission_stats AS (
    SELECT
      mission_id,
      COUNT(*)::integer AS submitted_count,
      COUNT(*) FILTER (WHERE approval_status = 'pending_approval')::integer AS pending_count,
      COUNT(*) FILTER (WHERE approval_status = 'approved')::integer AS approved_count,
      COUNT(*) FILTER (WHERE approval_status = 'rejected')::integer AS rejected_count
    FROM latest_submissions
    GROUP BY mission_id
  )
  SELECT
    m.id,
    m.title,
    m.description,
    m.due_at,
    m.min_reward_coins,
    m.max_reward_coins,
    m.submission_type,
    m.allow_late_submission,
    m.grading_focus,
    GREATEST(COALESCE(rs.active_student_count, 0), COALESCE(ss.submitted_count, 0))::integer AS total_students,
    COALESCE(ss.submitted_count, 0)::integer AS submitted_count,
    COALESCE(ss.pending_count, 0)::integer AS pending_count,
    COALESCE(ss.approved_count, 0)::integer AS approved_count,
    COALESCE(ss.rejected_count, 0)::integer AS rejected_count,
    COALESCE(rs.exempt_count, 0)::integer AS exempt_count,
    m.is_expired
  FROM scoped_missions m
  LEFT JOIN roster_stats rs ON rs.mission_id = m.id
  LEFT JOIN submission_stats ss ON ss.mission_id = m.id
  ORDER BY
    m.is_expired ASC,
    (CASE WHEN NOT m.is_expired AND COALESCE(ss.pending_count, 0) > 0 THEN 0 ELSE 1 END) ASC,
    (CASE WHEN NOT m.is_expired THEN EXTRACT(EPOCH FROM m.due_at) ELSE -EXTRACT(EPOCH FROM m.due_at) END) ASC;
$function$;

-- 2. Siết chặt approve_homework_submission: chỉ cho phép duyệt bài đang ở trạng thái pending_approval
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

  IF v_sub.approval_status = 'rejected' THEN
    RAISE EXCEPTION 'SUBMISSION_REJECTED';
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

  SELECT title INTO v_mission_title
  FROM public.missions
  WHERE id = v_sub.mission_id;

  v_mission_title := COALESCE(v_mission_title, 'Bài tập về nhà');

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

  UPDATE public.student_missions
  SET
    status = 'approved',
    completed_at = v_reviewed_at
  WHERE student_id = v_sub.student_id
    AND mission_id = v_sub.mission_id;

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

-- 3. Bảo vệ 2 lớp (Defense in Depth) cho batch_approve_homework_submissions
CREATE OR REPLACE FUNCTION public.batch_approve_homework_submissions(
  p_submission_ids uuid[],
  p_reviewer_id uuid,
  p_default_feedback text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_sub RECORD;
  v_feedback TEXT;
  v_result JSONB;
  v_approved_ids UUID[] := ARRAY[]::UUID[];
  v_total_coins INTEGER := 0;
BEGIN
  IF p_submission_ids IS NULL OR array_length(p_submission_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'EMPTY_SUBMISSION_IDS';
  END IF;

  v_feedback := NULLIF(TRIM(COALESCE(p_default_feedback, '')), '');
  IF v_feedback IS NULL THEN
    v_feedback := 'Bài làm đạt chuẩn, cô duyệt thưởng xu theo đề xuất của AI! 🌟';
  END IF;

  FOR v_sub IN
    SELECT
      id,
      ai_suggested_coins,
      ai_score,
      teacher_feedback,
      correct_count,
      total_questions
    FROM public.homework_submissions
    WHERE id = ANY(p_submission_ids)
      AND approval_status = 'pending_approval'
      AND readable = TRUE
      AND (ai_score IS NULL OR ai_score >= 8.0)
    ORDER BY created_at ASC
    FOR UPDATE
  LOOP
    v_result := public.approve_homework_submission(
      p_submission_id => v_sub.id,
      p_reviewer_id => p_reviewer_id,
      p_final_coins => COALESCE(v_sub.ai_suggested_coins, 0),
      p_final_score => v_sub.ai_score,
      p_teacher_feedback => COALESCE(NULLIF(TRIM(COALESCE(v_sub.teacher_feedback, '')), ''), v_feedback),
      p_correct_count => v_sub.correct_count,
      p_total_questions => v_sub.total_questions
    );

    v_approved_ids := array_append(v_approved_ids, v_sub.id);
    v_total_coins := v_total_coins + COALESCE(v_sub.ai_suggested_coins, 0);
  END LOOP;

  RETURN jsonb_build_object(
    'approved_count', COALESCE(array_length(v_approved_ids, 1), 0),
    'approved_ids', v_approved_ids,
    'total_coins_awarded', v_total_coins
  );
END;
$function$;
