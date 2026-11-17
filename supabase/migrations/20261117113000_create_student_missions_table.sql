-- ==============================================================================
-- MIGRATION: TẠO BẢNG STUDENT_MISSIONS VÀ ĐỒNG BỘ TIẾN ĐỘ BÀI TẬP HỌC SINH
-- 1. Thêm cột attempt_number vào homework_submissions để lưu toàn bộ lịch sử nộp bài
-- 2. Tạo bảng student_missions (Phân bổ bài tập & Quản lý tiến độ học sinh)
-- 3. Tạo Trigger tự động hóa: Giao bài cho lớp, Giao bài cho học sinh mới, Đồng bộ duyệt bài
-- 4. Chuyển đổi dữ liệu có sẵn (Data Migration) từ 12 bài nộp hiện có
-- ==============================================================================

-- 1. Bổ sung cột attempt_number vào homework_submissions (đánh dấu lần nộp 1, 2, 3...)
ALTER TABLE homework_submissions 
ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;

-- 2. Tạo bảng student_missions (Sổ theo dõi bài tập & tiến độ của từng học sinh)
CREATE TABLE IF NOT EXISTS student_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Trạng thái tiến độ bài tập của học sinh:
    -- 'assigned': Đang làm (chưa nộp)
    -- 'submitted': Đã nộp bài (đang chờ cô chấm)
    -- 'approved': Đã hoàn thành (cô duyệt cộng xu)
    -- 'rejected': Cô từ chối (yêu cầu chụp lại/làm lại)
    -- 'exempt': Miễn làm (học sinh mới vào lớp sau khi bài đã hết hạn hoặc nghỉ ốm)
    status VARCHAR(30) NOT NULL DEFAULT 'assigned' 
        CHECK (status IN ('assigned', 'submitted', 'approved', 'rejected', 'exempt')),

    -- Cờ nộp trễ hạn / quá hạn
    is_late BOOLEAN NOT NULL DEFAULT FALSE,

    -- Các mốc thời gian quan trọng
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Đảm bảo mỗi học sinh chỉ có duy nhất 1 bản ghi tiến độ cho 1 bài tập
    CONSTRAINT uq_student_mission UNIQUE(student_id, mission_id)
);

-- 3. Bật RLS và thiết lập Policies bảo mật
ALTER TABLE student_missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read student_missions" ON student_missions;
CREATE POLICY "Allow authenticated read student_missions" 
ON student_missions FOR SELECT 
TO authenticated 
USING (
    student_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'super_teacher', 'admin')
    )
);

DROP POLICY IF EXISTS "Allow teachers and admins manage student_missions" ON student_missions;
CREATE POLICY "Allow teachers and admins manage student_missions" 
ON student_missions FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'super_teacher', 'admin')
    )
);

-- 4. Tạo các Index tối ưu hiệu năng truy vấn
CREATE INDEX IF NOT EXISTS idx_student_missions_student_status 
ON student_missions(student_id, status);

CREATE INDEX IF NOT EXISTS idx_student_missions_class 
ON student_missions(class_id, mission_id);

CREATE INDEX IF NOT EXISTS idx_student_missions_lookup 
ON student_missions(student_id, mission_id);

CREATE INDEX IF NOT EXISTS idx_homework_submissions_student_mission 
ON homework_submissions(student_id, mission_id, attempt_number);

-- 5. CHUYỂN ĐỔI DỮ LIỆU ĐANG CÓ SẴN TRONG DATABASE (DATA MIGRATION)
-- 5.1. Tự động sinh student_missions cho các học sinh thuộc lớp đang có bài tập
INSERT INTO student_missions (student_id, mission_id, class_id, status, is_late, assigned_at)
SELECT 
    u.id AS student_id,
    mc.mission_id,
    u.class_id,
    'assigned' AS status,
    FALSE AS is_late,
    m.created_at AS assigned_at
FROM users u
JOIN mission_classes mc ON mc.class_id = u.class_id
JOIN missions m ON m.id = mc.mission_id
WHERE u.role = 'student' AND u.class_id IS NOT NULL
ON CONFLICT (student_id, mission_id) DO NOTHING;

-- 5.2. Đồng bộ trạng thái từ các bài nộp hiện có trong homework_submissions sang student_missions
UPDATE student_missions sm
SET 
    status = CASE 
        WHEN hs.approval_status = 'approved' THEN 'approved'
        WHEN hs.approval_status = 'pending_approval' THEN 'submitted'
        WHEN hs.approval_status = 'rejected' THEN 'rejected'
        ELSE 'assigned'
    END,
    is_late = hs.is_late,
    submitted_at = hs.created_at,
    completed_at = hs.reviewed_at
FROM (
    SELECT DISTINCT ON (student_id, mission_id)
        student_id,
        mission_id,
        approval_status,
        is_late,
        created_at,
        reviewed_at
    FROM homework_submissions
    ORDER BY student_id, mission_id, created_at DESC
) hs
WHERE hs.student_id = sm.student_id 
  AND hs.mission_id = sm.mission_id;

-- 6. TỰ ĐỘNG HÓA QUA DATABASE TRIGGERS
-- 6.1. Trigger đồng bộ trạng thái khi có bài nộp mới hoặc giáo viên duyệt bài
CREATE OR REPLACE FUNCTION trg_sync_submission_to_student_mission()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE student_missions
    SET 
        status = CASE 
            WHEN NEW.approval_status = 'approved' THEN 'approved'
            WHEN NEW.approval_status = 'rejected' THEN 'rejected'
            WHEN NEW.approval_status = 'cancelled' THEN 'assigned'
            ELSE 'submitted'
        END,
        is_late = NEW.is_late,
        submitted_at = CASE 
            WHEN NEW.approval_status = 'cancelled' THEN NULL 
            ELSE COALESCE(NEW.created_at, CURRENT_TIMESTAMP) 
        END,
        completed_at = CASE 
            WHEN NEW.approval_status = 'approved' THEN COALESCE(NEW.reviewed_at, CURRENT_TIMESTAMP) 
            ELSE NULL 
        END
    WHERE student_id = NEW.student_id 
      AND mission_id = NEW.mission_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_submission_on_change ON homework_submissions;
CREATE TRIGGER trg_sync_submission_on_change
AFTER INSERT OR UPDATE OF approval_status, is_late, reviewed_at ON homework_submissions
FOR EACH ROW
EXECUTE FUNCTION trg_sync_submission_to_student_mission();

-- 6.2. Trigger tự động giao bài cho Học sinh mới vào lớp (Chỉ gán bài còn hạn nộp)
CREATE OR REPLACE FUNCTION trg_assign_active_missions_to_new_student()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'student' AND NEW.class_id IS NOT NULL AND (
        TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.class_id IS NULL OR OLD.class_id <> NEW.class_id))
    ) THEN
        INSERT INTO student_missions (student_id, mission_id, class_id, status, is_late, assigned_at)
        SELECT 
            NEW.id,
            mc.mission_id,
            NEW.class_id,
            'assigned',
            FALSE,
            CURRENT_TIMESTAMP
        FROM mission_classes mc
        JOIN missions m ON m.id = mc.mission_id
        WHERE mc.class_id = NEW.class_id
          AND m.is_active = TRUE
          AND m.due_at > CURRENT_TIMESTAMP
        ON CONFLICT (student_id, mission_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_missions_on_user_class_change ON users;
CREATE TRIGGER trg_assign_missions_on_user_class_change
AFTER INSERT OR UPDATE OF class_id ON users
FOR EACH ROW
EXECUTE FUNCTION trg_assign_active_missions_to_new_student();

-- 6.3. Trigger tự động giao bài cho cả lớp khi Giáo viên tạo bài tập mới
CREATE OR REPLACE FUNCTION trg_assign_mission_to_class_students()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO student_missions (student_id, mission_id, class_id, status, is_late, assigned_at)
    SELECT 
        u.id,
        NEW.mission_id,
        NEW.class_id,
        'assigned',
        FALSE,
        CURRENT_TIMESTAMP
    FROM users u
    WHERE u.class_id = NEW.class_id 
      AND u.role = 'student'
    ON CONFLICT (student_id, mission_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_assign_mission_to_students ON mission_classes;
CREATE TRIGGER trg_auto_assign_mission_to_students
AFTER INSERT ON mission_classes
FOR EACH ROW
EXECUTE FUNCTION trg_assign_mission_to_class_students();
