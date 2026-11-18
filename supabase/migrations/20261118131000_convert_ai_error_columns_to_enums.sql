-- Migration: Convert ai_submission_errors and missions.grading_focus to Postgres ENUMs
-- Date: 2026-11-18 13:10:00

DO $$
BEGIN
    -- 1. Create ai_error_type ENUM if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_error_type') THEN
        CREATE TYPE ai_error_type AS ENUM (
            'spelling',
            'grammar',
            'vocab',
            'punctuation',
            'content'
        );
    END IF;

    -- 2. Create ai_error_severity ENUM if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_error_severity') THEN
        CREATE TYPE ai_error_severity AS ENUM (
            'minor',
            'major'
        );
    END IF;

    -- 3. Drop check constraints on ai_submission_errors
    ALTER TABLE public.ai_submission_errors DROP CONSTRAINT IF EXISTS ai_submission_errors_error_type_check;
    ALTER TABLE public.ai_submission_errors DROP CONSTRAINT IF EXISTS ai_submission_errors_severity_check;

    -- 4. Alter columns on ai_submission_errors
    ALTER TABLE public.ai_submission_errors 
        ALTER COLUMN error_type TYPE ai_error_type USING error_type::ai_error_type;

    ALTER TABLE public.ai_submission_errors 
        ALTER COLUMN severity TYPE ai_error_severity USING severity::ai_error_severity;

    -- 5. Alter missions.grading_focus to ai_error_type[]
    ALTER TABLE public.missions 
        ALTER COLUMN grading_focus SET DEFAULT ARRAY['spelling'::ai_error_type, 'grammar'::ai_error_type];

    ALTER TABLE public.missions 
        ALTER COLUMN grading_focus TYPE ai_error_type[] USING grading_focus::text[]::ai_error_type[];

END $$;
