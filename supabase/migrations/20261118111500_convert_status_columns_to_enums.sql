-- ==============================================================================
-- MIGRATION: CONVERT STATUS & TYPE COLUMNS TO POSTGRES ENUM TYPES
-- 1. Create ENUM types: student_mission_status, submission_approval_status, 
--    mission_submission_type, monthly_exchange_status, monthly_exchange_choice
-- 2. Alter tables to use the new ENUM types
-- 3. Update triggers and integrity constraints to use ENUM types cleanly
-- ==============================================================================

-- 1. Create ENUM types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_mission_status') THEN
        CREATE TYPE student_mission_status AS ENUM ('assigned', 'submitted', 'approved', 'rejected', 'exempt');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_approval_status') THEN
        CREATE TYPE submission_approval_status AS ENUM ('pending_approval', 'approved', 'rejected', 'cancelled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mission_submission_type') THEN
        CREATE TYPE mission_submission_type AS ENUM ('platform_proof', 'subjective_writing');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'monthly_exchange_status') THEN
        CREATE TYPE monthly_exchange_status AS ENUM ('pending', 'approved', 'completed', 'rejected', 'cancelled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'monthly_exchange_choice') THEN
        CREATE TYPE monthly_exchange_choice AS ENUM ('cash', 'shopee');
    END IF;
END $$;

-- 2. Alter student_missions.status
ALTER TABLE student_missions ALTER COLUMN status DROP DEFAULT;
ALTER TABLE student_missions DROP CONSTRAINT IF EXISTS student_missions_status_check;
ALTER TABLE student_missions ALTER COLUMN status TYPE student_mission_status USING status::student_mission_status;
ALTER TABLE student_missions ALTER COLUMN status SET DEFAULT 'assigned'::student_mission_status;

-- 3. Alter missions.submission_type
ALTER TABLE missions ALTER COLUMN submission_type DROP DEFAULT;
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_submission_type_check;
ALTER TABLE missions ALTER COLUMN submission_type TYPE mission_submission_type USING submission_type::mission_submission_type;
ALTER TABLE missions ALTER COLUMN submission_type SET DEFAULT 'platform_proof'::mission_submission_type;

-- 4. Alter homework_submissions
DROP TRIGGER IF EXISTS trg_sync_submission_on_change ON public.homework_submissions;
DROP TRIGGER IF EXISTS trg_homework_submissions_cancel_check ON public.homework_submissions;
DROP INDEX IF EXISTS uq_submissions_single_active;

ALTER TABLE homework_submissions ALTER COLUMN approval_status DROP DEFAULT;
ALTER TABLE homework_submissions DROP CONSTRAINT IF EXISTS homework_submissions_approval_status_check;
ALTER TABLE homework_submissions DROP CONSTRAINT IF EXISTS homework_submissions_submission_type_check;
ALTER TABLE homework_submissions DROP CONSTRAINT IF EXISTS chk_submission_approval_integrity;
ALTER TABLE homework_submissions DROP CONSTRAINT IF EXISTS chk_submission_cancelled_integrity;

ALTER TABLE homework_submissions ALTER COLUMN approval_status TYPE submission_approval_status USING approval_status::submission_approval_status;
ALTER TABLE homework_submissions ALTER COLUMN approval_status SET DEFAULT 'pending_approval'::submission_approval_status;
ALTER TABLE homework_submissions ALTER COLUMN submission_type TYPE mission_submission_type USING submission_type::mission_submission_type;

ALTER TABLE homework_submissions ADD CONSTRAINT chk_submission_approval_integrity
  CHECK (approval_status <> 'approved'::submission_approval_status OR (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL));

ALTER TABLE homework_submissions ADD CONSTRAINT chk_submission_cancelled_integrity
  CHECK (approval_status <> 'cancelled'::submission_approval_status OR cancelled_at IS NOT NULL);

CREATE UNIQUE INDEX uq_submissions_single_active ON public.homework_submissions (mission_id, student_id)
  WHERE approval_status IN ('pending_approval'::submission_approval_status, 'approved'::submission_approval_status) AND mission_id IS NOT NULL;

-- 5. Alter monthly_exchange_requests
ALTER TABLE monthly_exchange_requests ALTER COLUMN status DROP DEFAULT;
ALTER TABLE monthly_exchange_requests DROP CONSTRAINT IF EXISTS monthly_exchange_requests_status_check;
ALTER TABLE monthly_exchange_requests DROP CONSTRAINT IF EXISTS monthly_exchange_requests_choice_type_check;
ALTER TABLE monthly_exchange_requests DROP CONSTRAINT IF EXISTS chk_exchange_request_choice_rules;

ALTER TABLE monthly_exchange_requests ALTER COLUMN status TYPE monthly_exchange_status USING status::monthly_exchange_status;
ALTER TABLE monthly_exchange_requests ALTER COLUMN status SET DEFAULT 'pending'::monthly_exchange_status;
ALTER TABLE monthly_exchange_requests ALTER COLUMN choice_type TYPE monthly_exchange_choice USING choice_type::monthly_exchange_choice;

ALTER TABLE monthly_exchange_requests ADD CONSTRAINT chk_exchange_request_choice_rules 
  CHECK (coins_to_exchange > 0 AND amount_vnd > 0);

-- 6. Trigger functions
CREATE OR REPLACE FUNCTION public.trg_sync_submission_to_student_mission()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE student_missions
    SET 
        status = CASE 
            WHEN NEW.approval_status = 'approved'::submission_approval_status THEN 'approved'::student_mission_status
            WHEN NEW.approval_status = 'rejected'::submission_approval_status THEN 'rejected'::student_mission_status
            WHEN NEW.approval_status = 'cancelled'::submission_approval_status THEN 'assigned'::student_mission_status
            ELSE 'submitted'::student_mission_status
        END,
        is_late = NEW.is_late,
        submitted_at = CASE 
            WHEN NEW.approval_status = 'cancelled'::submission_approval_status THEN NULL 
            ELSE COALESCE(NEW.created_at, CURRENT_TIMESTAMP) 
        END,
        completed_at = CASE 
            WHEN NEW.approval_status = 'approved'::submission_approval_status THEN COALESCE(NEW.reviewed_at, CURRENT_TIMESTAMP) 
            ELSE NULL 
        END
    WHERE student_id = NEW.student_id 
      AND mission_id = NEW.mission_id;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_check_submission_cancellation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    mission_due_at TIMESTAMP WITH TIME ZONE;
BEGIN
    IF NEW.approval_status = 'cancelled'::submission_approval_status AND OLD.approval_status <> 'cancelled'::submission_approval_status THEN
        IF OLD.approval_status <> 'pending_approval'::submission_approval_status THEN
            RAISE EXCEPTION 'HÀNH ĐỘNG BỊ TỪ CHỐI: Không thể hủy bài nộp đã được duyệt hoặc đã bị từ chối!';
        END IF;

        IF NEW.mission_id IS NOT NULL THEN
            SELECT due_at INTO mission_due_at FROM missions WHERE id = NEW.mission_id;
            IF mission_due_at IS NOT NULL AND CURRENT_TIMESTAMP > mission_due_at THEN
                RAISE EXCEPTION 'HÀNH ĐỘNG BỊ TỪ CHỐI: Đã quá hạn nộp bài tập (hạn chót: %), học sinh không thể hủy bài để nộp lại!', 
                    to_char(mission_due_at, 'HH24:MI DD/MM/YYYY');
            END IF;
        END IF;

        IF NEW.cancelled_at IS NULL THEN
            NEW.cancelled_at := CURRENT_TIMESTAMP;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_homework_submissions_cancel_check 
BEFORE UPDATE ON public.homework_submissions 
FOR EACH ROW EXECUTE FUNCTION trg_check_submission_cancellation();

CREATE TRIGGER trg_sync_submission_on_change 
AFTER INSERT OR UPDATE OF approval_status, is_late, reviewed_at ON public.homework_submissions 
FOR EACH ROW EXECUTE FUNCTION trg_sync_submission_to_student_mission();
