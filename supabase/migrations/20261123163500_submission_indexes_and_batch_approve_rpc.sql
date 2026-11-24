-- Migration: Bổ sung 3 DB indexes tối ưu truy vấn Duyệt bài tập & RPC duyệt hàng loạt 1 round-trip

-- 1. Bổ sung 3 composite/FK indexes tối ưu truy vấn trang Duyệt bài tập
CREATE INDEX IF NOT EXISTS idx_homework_submissions_mission_status
  ON public.homework_submissions (mission_id, approval_status);

CREATE INDEX IF NOT EXISTS idx_ai_submission_errors_submission
  ON public.ai_submission_errors (submission_id);

CREATE INDEX IF NOT EXISTS idx_student_missions_mission_class
  ON public.student_missions (mission_id, class_id);

-- 2. RPC Duyệt nhanh hàng loạt bài nộp hợp lệ trong 1 transaction (Atomic ACID, 1 round-trip)
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
