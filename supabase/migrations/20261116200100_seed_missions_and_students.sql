-- Migration: Tạo dữ liệu mẫu thực tế cho trang Giao bài tập
-- 3 bài tập tiêu biểu, 1 lớp học (Lớp 1A) có 20 học sinh, kèm bài đã nộp & chưa nộp

DO $$
DECLARE
    v_class_id UUID := 'd145866c-c749-4d9b-ac0e-5b939c3e7d79'; -- Lớp 1A
    v_teacher_id UUID := '2e5090f4-375e-451e-9e87-768818219538'; -- Cô Giáo Mai
    v_teacher_dong UUID := 'caa32eb8-dc4d-4fa4-a07a-cf21c29533ab'; -- Thầy Đông
    v_sub_id UUID;
BEGIN
    -- 1. Bổ sung hoặc cập nhật đủ 20 học sinh trong Lớp 1A
    -- Đảm bảo học sinh đã có Phạm Ngọc Viễn Đông thuộc Lớp 1A
    UPDATE public.users 
    SET class_id = v_class_id 
    WHERE id = 'af9d14bb-170f-440e-b85d-66a46e41e9d6';

    -- Thêm các học sinh mẫu (nếu chưa có)
    INSERT INTO public.users (
        id, full_name, phone_zalo, pin_number, role, class_id, 
        avatar_url, current_coins, free_spins, total_earned_coins, 
        is_active, is_deleted, created_at
    ) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Nguyễn Gia Bảo', '0901234501', '1234', 'student', v_class_id, '/avatar-chibi/male-1.webp', 120, 3, 350, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000002', 'Trần Ngọc Bảo Hân', '0901234502', '1234', 'student', v_class_id, '/avatar-chibi/female-2.webp', 240, 5, 580, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000003', 'Lê Minh Khôi', '0901234503', '1234', 'student', v_class_id, '/avatar-chibi/male-3.webp', 80, 2, 210, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000004', 'Phạm Khánh Linh', '0901234504', '1234', 'student', v_class_id, '/avatar-chibi/female-4.webp', 190, 4, 450, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000005', 'Hoàng Tuấn Kiệt', '0901234505', '1234', 'student', v_class_id, '/avatar-chibi/male-5.webp', 310, 6, 720, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000006', 'Đỗ Hà My', '0901234506', '1234', 'student', v_class_id, '/avatar-chibi/female-6.webp', 150, 3, 390, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000007', 'Vũ Đức Anh', '0901234507', '1234', 'student', v_class_id, '/avatar-chibi/male-1.webp', 95, 1, 260, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000008', 'Nguyễn Thùy Chi', '0901234508', '1234', 'student', v_class_id, '/avatar-chibi/female-2.webp', 220, 5, 510, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000009', 'Đặng Quốc Tuấn', '0901234509', '1234', 'student', v_class_id, '/avatar-chibi/male-3.webp', 170, 2, 400, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000010', 'Bùi Phương Thảo', '0901234510', '1234', 'student', v_class_id, '/avatar-chibi/female-4.webp', 140, 3, 330, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000011', 'Lý Nhật Minh', '0901234511', '1234', 'student', v_class_id, '/avatar-chibi/male-5.webp', 60, 1, 150, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000012', 'Ngô Diệp Anh', '0901234512', '1234', 'student', v_class_id, '/avatar-chibi/female-6.webp', 280, 4, 600, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000013', 'Dương Hải Nam', '0901234513', '1234', 'student', v_class_id, '/avatar-chibi/male-1.webp', 110, 2, 290, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000014', 'Phan Ánh Nguyệt', '0901234514', '1234', 'student', v_class_id, '/avatar-chibi/female-2.webp', 185, 3, 440, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000015', 'Đinh Quang Huy', '0901234515', '1234', 'student', v_class_id, '/avatar-chibi/male-3.webp', 75, 1, 180, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000016', 'Trịnh Thảo Nguyên', '0901234516', '1234', 'student', v_class_id, '/avatar-chibi/female-4.webp', 205, 4, 490, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000017', 'Bùi Thiên Phú', '0901234517', '1234', 'student', v_class_id, '/avatar-chibi/male-5.webp', 130, 2, 310, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000018', 'Hoàng Lan Hương', '0901234518', '1234', 'student', v_class_id, '/avatar-chibi/female-6.webp', 250, 5, 590, true, false, CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000019', 'Lâm Đình Khang', '0901234519', '1234', 'student', v_class_id, '/avatar-chibi/male-1.webp', 90, 2, 230, true, false, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        class_id = EXCLUDED.class_id,
        phone_zalo = EXCLUDED.phone_zalo;

    -- 2. Thêm 3 bài tập tiêu biểu
    INSERT INTO public.missions (
        id, title, description, submission_type, min_reward_coins, max_reward_coins,
        due_at, created_by, is_active, is_deleted, grading_focus, custom_ai_prompt,
        allow_late_submission, created_at, updated_at
    ) VALUES
    (
        '11111111-1111-1111-1111-111111111101',
        'Viết đoạn văn ngắn (5-7 câu) miêu tả các thành viên trong gia đình em',
        'Các con viết tay vào vở ô ly đoạn văn từ 5 đến 7 câu tiếng Anh giới thiệu gia đình. Chụp ảnh trang vở thật rõ nét để cô và AI trợ giảng chấm bài nhé!',
        'subjective_writing',
        30,
        60,
        CURRENT_TIMESTAMP + INTERVAL '3 days',
        v_teacher_id,
        true,
        false,
        ARRAY['spelling', 'grammar', 'vocab', 'punctuation'],
        'Kiểm tra chia động từ ngôi thứ 3 số ít và viết hoa đầu câu. Giải thích dễ hiểu bằng tiếng Việt.',
        true,
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        '11111111-1111-1111-1111-111111111102',
        'Hoàn thành bài tập Quizizz Unit 6: Animals (20 câu) & chụp màn hình điểm',
        'Bấm vào link Quizizz cô ghim trong nhóm lớp, hoàn thành đủ 20 câu hỏi và chụp ảnh màn hình kết quả điểm số tải lên hệ thống.',
        'platform_proof',
        20,
        40,
        CURRENT_TIMESTAMP + INTERVAL '1 day',
        v_teacher_dong,
        true,
        false,
        ARRAY['content'],
        'Đọc chính xác tỷ lệ số câu đúng trên tổng số câu trong ảnh chụp Quizizz.',
        true,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        '11111111-1111-1111-1111-111111111103',
        'Dịch 8 câu mẫu tiếng Việt sang tiếng Anh chủ đề School Things',
        'Chép đề 8 câu tiếng Việt trong phiếu bài tập và dịch sang tiếng Anh vào vở, chú ý danh từ số ít / số nhiều.',
        'subjective_writing',
        25,
        50,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        v_teacher_id,
        true,
        false,
        ARRAY['spelling', 'grammar', 'vocab'],
        'Đối chiếu từng câu dịch từ 1 đến 8, khen ngợi câu dịch tự nhiên.',
        true,
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        due_at = EXCLUDED.due_at,
        is_active = EXCLUDED.is_active,
        is_deleted = EXCLUDED.is_deleted;

    -- 3. Phân công 3 bài tập vào Lớp 1A (mission_classes)
    INSERT INTO public.mission_classes (mission_id, class_id) VALUES
    ('11111111-1111-1111-1111-111111111101', v_class_id),
    ('11111111-1111-1111-1111-111111111102', v_class_id),
    ('11111111-1111-1111-1111-111111111103', v_class_id)
    ON CONFLICT (mission_id, class_id) DO NOTHING;

    -- 4. Thêm các bài nộp mẫu cho Bài tập 1 (12 bài nộp trong số 20 học sinh)
    -- Xóa bài nộp cũ nếu có để tránh trùng lặp
    DELETE FROM public.homework_submissions WHERE mission_id = '11111111-1111-1111-1111-111111111101';

    -- 6 bài đã duyệt (approved)
    INSERT INTO public.homework_submissions (
        id, mission_id, student_id, submission_type, proof_image_urls,
        readable, ai_score, ai_suggested_coins, final_coins, approval_status,
        teacher_feedback, reviewed_by, reviewed_at, created_at
    ) VALUES
    ('30000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111101', 'af9d14bb-170f-440e-b85d-66a46e41e9d6', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 9.5, 55, 60, 'approved', 'Chữ viết rất nắn nót, câu văn lưu loát! Cô cộng tối đa 60 xu nhé.', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
    ('30000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000001', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 9.0, 50, 50, 'approved', 'Làm tốt lắm con! Chú ý dấu chấm cuối câu nhé.', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
    ('30000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000002', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 10.0, 60, 60, 'approved', 'Xuất sắc! Bài làm hoàn hảo không có lỗi.', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    ('30000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000003', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 8.5, 45, 45, 'approved', 'Con tiến bộ rất nhiều, cố gắng phát huy nhé.', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
    ('30000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000004', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 9.0, 50, 50, 'approved', 'Bài viết rất sinh động!', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '7 hours'),
    ('30000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000005', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 9.5, 55, 55, 'approved', 'Ý văn rất hay và đúng ngữ pháp.', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '3 hours');

    -- 4 bài chờ cô duyệt (pending_approval)
    INSERT INTO public.homework_submissions (
        id, mission_id, student_id, submission_type, proof_image_urls,
        readable, ai_score, ai_suggested_coins, final_coins, approval_status,
        created_at
    ) VALUES
    ('30000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000006', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 8.5, 45, NULL, 'pending_approval', CURRENT_TIMESTAMP - INTERVAL '50 minutes'),
    ('30000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000007', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 8.0, 40, NULL, 'pending_approval', CURRENT_TIMESTAMP - INTERVAL '40 minutes'),
    ('30000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000008', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 9.0, 50, NULL, 'pending_approval', CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
    ('30000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000009', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, 8.5, 45, NULL, 'pending_approval', CURRENT_TIMESTAMP - INTERVAL '15 minutes');

    -- 1 bài nộp muộn (late)
    INSERT INTO public.homework_submissions (
        id, mission_id, student_id, submission_type, proof_image_urls,
        readable, is_late, ai_score, ai_suggested_coins, final_coins, approval_status,
        created_at
    ) VALUES
    ('30000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000010', 'subjective_writing', '["/book/book.svg"]'::jsonb, true, true, 8.0, 35, NULL, 'pending_approval', CURRENT_TIMESTAMP - INTERVAL '10 minutes');

    -- 1 bài bị từ chối (rejected do ảnh mờ)
    INSERT INTO public.homework_submissions (
        id, mission_id, student_id, submission_type, proof_image_urls,
        readable, unreadable_reason, ai_score, ai_suggested_coins, final_coins, approval_status,
        teacher_feedback, reviewed_by, reviewed_at, created_at
    ) VALUES
    ('30000000-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111101', '20000000-0000-0000-0000-000000000011', 'subjective_writing', '["/book/book.svg"]'::jsonb, false, 'Ảnh chụp bị rung mờ ở nửa dưới trang vở', NULL, 0, 0, 'rejected', 'Ảnh chụp bị mờ và rung, con chụp lại dưới ánh đèn sáng nhé!', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour');

    -- 5. Chi tiết lỗi AI (ai_submission_errors) cho bài chờ duyệt
    DELETE FROM public.ai_submission_errors WHERE submission_id = '30000000-0000-0000-0000-000000000007';

    INSERT INTO public.ai_submission_errors (
        submission_id, line_number, student_text, correction_text, error_type, severity, explanation
    ) VALUES
    (
        '30000000-0000-0000-0000-000000000007',
        3,
        'My father play badminton with me on Sunday.',
        'My father plays badminton with me on Sunday.',
        'grammar',
        'major',
        'Chủ ngữ "My father" là ngôi thứ 3 số ít nên động từ "play" cần thêm "-s" thành "plays".'
    ),
    (
        '30000000-0000-0000-0000-000000000007',
        5,
        'We have delicous dinner together.',
        'We have delicious dinner together.',
        'spelling',
        'minor',
        'Từ "delicious" thiếu chữ "i" sau chữ "c".'
    );

END $$;
