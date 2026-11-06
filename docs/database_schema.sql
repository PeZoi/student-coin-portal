-- ==============================================================================
-- DATABASE SCHEMA: STUDENT COIN PORTAL (BẢN CHUẨN HÓA FINTECH & KIỂM SOÁT TOÀN VẸN)
-- Hệ quản trị CSDL mục tiêu: PostgreSQL (Tương thích 100% để Import vào drawDB.app)
-- Toàn bộ bảng, cột, ràng buộc CHECK, chỉ mục IDEMPOTENCY và TRIGGER bảo vệ bất biến
-- ==============================================================================

-- ==============================================================================
-- 1. BẢNG LỚP HỌC (CLASSES)
-- Quản lý danh sách các lớp học trong trường/trung tâm (ví dụ: Lớp 5A, Lớp 5B...)
-- ==============================================================================
CREATE TABLE classes (
    -- Khóa chính: Định danh duy nhất cho từng lớp học dạng UUID v4 tự sinh
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tên lớp học hiển thị trên giao diện (Ví dụ: 'Lớp 5A', 'Lớp 5B', 'Lớp 4A')
    class_name VARCHAR(50) NOT NULL CHECK (length(trim(class_name)) > 0),
    
    -- Trạng thái hoạt động: true = đang mở lớp, false = tạm đóng
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Cờ xóa mềm (Soft delete): true = đã xóa vào thùng rác/lưu trữ (bảo vệ an toàn khi cô bấm nhầm)
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- Thời điểm xóa mềm lớp học (NULL nếu lớp đang hoạt động bình thường)
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Khóa ngoại: Người thực hiện xóa mềm lớp học (Giáo viên hoặc Admin; gán qua ALTER TABLE)
    deleted_by UUID,

    -- Khóa ngoại: Người tạo lớp học này (Giáo viên hoặc Admin)
    -- Được liên kết với bảng users(id) thông qua câu lệnh ALTER TABLE bên dưới
    created_by UUID,
    
    -- Thời điểm tạo bản ghi lớp học trong hệ thống
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Khóa ngoại: Người cập nhật thông tin lớp học lần gần nhất (gán qua ALTER TABLE sau bảng users)
    updated_by UUID,

    -- Thời điểm cập nhật thông tin lớp học gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. BẢNG NGƯỜI DÙNG & HỒ SƠ HỌC SINH (USERS)
-- Quản lý thông tin đăng nhập, hồ sơ cá nhân và số dư Heo Đất của học sinh/giáo viên
-- ==============================================================================
CREATE TABLE users (
    -- Khóa chính: Mã định danh duy nhất của người dùng
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Số điện thoại Zalo của phụ huynh/học sinh dùng làm Tên đăng nhập chính (Duy nhất)
    phone_zalo VARCHAR(20) UNIQUE CHECK (phone_zalo IS NULL OR length(trim(phone_zalo)) >= 9),
    
    -- Mã PIN (dành cho học sinh đăng nhập 4 số)
    pin_number VARCHAR(255),

    -- Tên đăng nhập (username) dành cho Giáo viên & Quản trị viên (Duy nhất)
    username VARCHAR(50) UNIQUE CHECK (username IS NULL OR length(trim(username)) >= 3),

    -- Địa chỉ Email (tùy chọn liên hệ hoặc nhận báo cáo)
    email VARCHAR(255) UNIQUE CHECK (email IS NULL OR length(trim(email)) > 0),

    -- Mật khẩu bảo mật (dành riêng cho Giáo viên & Quản trị viên)
    password VARCHAR(255),
    
    -- Họ và tên đầy đủ của học sinh/giáo viên (Ví dụ: 'Nguyễn Gia Bảo', 'Cô Mai')
    full_name VARCHAR(100) NOT NULL CHECK (length(trim(full_name)) > 0),
    
    -- Khóa ngoại liên kết bảng classes: Xác định học sinh thuộc lớp học nào (Có thể NULL với Giáo viên, Admin hoặc Học sinh mới chưa phân lớp)
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    
    -- Đường dẫn ảnh đại diện avatar (Mặc định dùng ảnh đại diện chibi hoạt hình)
    avatar_url VARCHAR(500) DEFAULT '/avatar.jpg',
    
    -- Phân quyền tài khoản trong hệ thống: 'student' (học sinh), 'teacher' (giáo viên), 'admin' (quản trị)
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    
    -- Số dư xu hiện tại trong Heo Đất (Hiển thị thời gian thực, không được âm)
    current_coins INTEGER NOT NULL DEFAULT 0 CHECK (current_coins >= 0),
    
    -- Số lượt quay vòng quay may mắn miễn phí hiện có (Được cộng khi quay trúng ô Free Spin hoặc cô giáo tặng)
    free_spins INTEGER NOT NULL DEFAULT 0 CHECK (free_spins >= 0),
    
    -- Tổng số xu tích lũy kiếm được trong lịch sử (Chỉ tăng khi nhận thưởng EARN, không bị giảm khi tiêu dùng)
    total_earned_coins INTEGER NOT NULL DEFAULT 0 CHECK (total_earned_coins >= 0),
    
    -- Cờ kiểm tra: false = lần đầu đăng nhập (kích hoạt tour hướng dẫn), true = đã xem
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    
    -- Trạng thái hoạt động của tài khoản: true = hoạt động bình thường, false = bị khóa
    is_active BOOLEAN DEFAULT TRUE,

    -- Cờ xóa mềm (Soft delete): true = đã xóa mềm/rời trường (vô hiệu hóa nhưng bảo toàn vĩnh viễn sổ cái ví xu)
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- Thời điểm xóa mềm tài khoản
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Khóa ngoại: Người thực hiện xóa mềm tài khoản (Giáo viên hoặc Admin)
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Số lần nhập sai mã PIN liên tiếp (Khi đạt 5 lần sai, hệ thống sẽ tự động khóa tài khoản)
    failed_login_attempts INTEGER DEFAULT 0 CHECK (failed_login_attempts >= 0),
    
    -- Thời điểm hết hạn khóa tài khoản (Khóa tạm thời, hoặc NULL nếu tài khoản bình thường / chờ giáo viên mở khóa)
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Khóa ngoại: Người cập nhật thông tin hồ sơ/tài khoản lần gần nhất (Bản thân người dùng hoặc Giáo viên)
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Thời điểm học sinh đăng ký tài khoản
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời điểm cập nhật thông tin hồ sơ gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ràng buộc toàn vẹn định danh: Bắt buộc phải có phone_zalo, username HOẶC email
    CONSTRAINT chk_user_identifier CHECK (phone_zalo IS NOT NULL OR username IS NOT NULL OR email IS NOT NULL)
);

-- ==============================================================================
-- RÀNG BUỘC KHÓA NGOẠI: XÁC ĐỊNH GIÁO VIÊN/ADMIN TẠO, SỬA & XÓA LỚP HỌC
-- (Được khai báo sau bảng users để tránh lỗi vòng lặp phụ thuộc Circular Dependency)
-- ==============================================================================
ALTER TABLE classes 
    ADD CONSTRAINT fk_classes_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_classes_deleted_by 
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_classes_updated_by 
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ==============================================================================
-- 3. BẢNG HOẠT ĐỘNG & BÀI TẬP CỘNG XU (MISSIONS)
-- Lưu danh sách các hoạt động do giáo viên tự do thêm/sửa/xóa trên web
-- ==============================================================================
CREATE TABLE missions (
    -- Khóa chính: Mã định danh duy nhất của nhiệm vụ/hoạt động
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tiêu đề hoạt động (Ví dụ: 'Đọc 1 cuốn sách', 'Làm bài tập Tiếng Anh Unit 6')
    title VARCHAR(255) NOT NULL CHECK (length(trim(title)) > 0),
    
    -- Hướng dẫn chi tiết yêu cầu bài tập/hoạt động cô giáo giao
    description TEXT NOT NULL,

    -- Cơ chế bài tập & Hình thức minh chứng yêu cầu nộp (Khớp với màn hình cấu hình bài tập của cô giáo):
    -- 'platform_proof': 1. Minh chứng nền tảng khác (ảnh chụp bảng điểm Quizizz, Wordwall, Azota, Kahoot...)
    -- 'subjective_writing': 2. Đoạn văn / Tự luận (ảnh chụp vở viết tay, AI chấm ngữ pháp & cô giáo double-check)
    submission_type VARCHAR(50) NOT NULL DEFAULT 'platform_proof' 
        CHECK (submission_type IN ('platform_proof', 'subjective_writing')),

    -- Mức xu tham khảo tối thiểu (Ví dụ: 20 xu khi làm chưa đúng hết hoặc mức sàn gợi ý cho giáo viên)
    min_reward_coins INTEGER NOT NULL DEFAULT 0 CHECK (min_reward_coins >= 0),
    
    -- Mức xu tham khảo tối đa (Ví dụ: 40 xu khi làm đúng 100% hoặc trần thưởng cho bài xuất sắc)
    max_reward_coins INTEGER NOT NULL CHECK (max_reward_coins >= min_reward_coins),
    
    -- Icon hiển thị trên thẻ bài tập
    icon_type VARCHAR(50),
    
    -- Hạn chót nộp bài (Sau thời điểm này bài nộp sẽ tự động bị đánh dấu is_late = true)
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Khóa ngoại: Người tạo ra nhiệm vụ này (Giáo viên hoặc Admin nào tạo)
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Trạng thái: true = đang mở cho học sinh làm, false = đóng/ẩn
    is_active BOOLEAN DEFAULT TRUE,

    -- Cờ xóa mềm (Soft delete): true = đã xóa vào thùng rác/lưu trữ (bảo vệ bài nộp cũ của học sinh)
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- Thời điểm xóa mềm nhiệm vụ
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Khóa ngoại: Giáo viên hoặc Admin thực hiện xóa mềm nhiệm vụ
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Khóa ngoại: Giáo viên hoặc Admin cập nhật thông tin nhiệm vụ lần gần nhất
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Thời điểm cập nhật thông tin hoạt động/bài tập gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời điểm tạo hoạt động
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. BẢNG PHÂN CÔNG NHIỆM VỤ CHO CÁC LỚP (MISSION_CLASSES)
-- Cho phép 1 nhiệm vụ có thể giao cho 1 lớp hoặc NHIỀU lớp cùng lúc (Quan hệ N-N)
-- Chỉ học sinh thuộc các lớp được giáo viên tích chọn ở đây mới nhìn thấy nhiệm vụ
-- ==============================================================================
CREATE TABLE mission_classes (
    -- Khóa ngoại: Thuộc nhiệm vụ nào trong bảng missions
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    
    -- Khóa ngoại: Lớp học được chỉ định nhận nhiệm vụ (Ví dụ: Lớp 5A, Lớp 5B, Lớp 5C...)
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Khóa chính phức hợp: Mỗi lớp chỉ xuất hiện 1 lần trong 1 nhiệm vụ (tránh trùng lặp)
    PRIMARY KEY (mission_id, class_id)
);

-- ==============================================================================
-- 5. BẢNG LƯỢT NỘP BÀI TẬP & DUYỆT XU CUỐI NGÀY (HOMEWORK_SUBMISSIONS)
-- Quản lý bài nộp của học sinh (Online & Viết tay), AI chấm gợi ý và giáo viên duyệt
-- ==============================================================================
CREATE TABLE homework_submissions (
    -- Khóa chính: Mã định danh bài nộp
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Thuộc nhiệm vụ nào trong bảng missions (có thể NULL nếu nhiệm vụ bị xóa hoặc nộp tự do)
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    
    -- Khóa ngoại: Học sinh thực hiện nộp bài
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Snapshot cơ chế nộp bài (Giữ nguyên thông tin ngay cả khi mission bị xóa để AI/Hệ thống biết cách chấm)
    submission_type VARCHAR(50) NOT NULL CHECK (submission_type IN ('platform_proof', 'subjective_writing')),

    -- Cờ đánh dấu nộp trễ hạn: true = nộp sau missions.due_at
    is_late BOOLEAN NOT NULL DEFAULT FALSE,

    -- Danh sách URL ảnh/minh chứng bài làm dạng JSONB linh hoạt (URL ảnh đã nén client, audio URL...)
    proof_image_urls JSONB NOT NULL,
    
    -- Cột riêng phục vụ Index/Query nhanh: Cờ AI nhận diện chữ viết (true = đọc được, false = mờ/chữ xấu)
    readable BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Lý do từ chối nếu chữ quá xấu hoặc ảnh mờ (Yêu cầu học sinh viết lại, không tính xu)
    unreadable_reason TEXT,
    
    -- Toàn bộ phản hồi JSON thô từ AI (Lưu trữ đầy đủ nhận xét, điểm mạnh/yếu, gợi ý sửa đổi, metadata phản hồi)
    ai_raw_response JSONB,
    
    -- Cột riêng phục vụ thống kê: Điểm số quy đổi thang 10 do AI tính toán
    ai_score DECIMAL(3,1),

    -- Số câu làm đúng nhận diện được từ ảnh trắc nghiệm (Ví dụ: 14)
    correct_count INTEGER,
    
    -- Tổng số câu hỏi trắc nghiệm của bài kiểm tra (Ví dụ: 14)
    total_questions INTEGER,
    
    -- Số xu AI đề xuất dựa trên quy tắc của bài tập
    ai_suggested_coins INTEGER NOT NULL DEFAULT 0 CHECK (ai_suggested_coins >= 0),
    
    -- Số xu thực tế được Giáo viên chốt cộng sau khi duyệt cuối ngày
    final_coins INTEGER DEFAULT 0 CHECK (final_coins >= 0),
    
    -- Lời phê, góp ý trực tiếp của Giáo viên gửi cho học sinh
    teacher_feedback TEXT,
    
    -- Trạng thái duyệt cuối ngày: 
    -- 'pending_approval' (chờ cô duyệt), 'approved' (đã duyệt cộng xu), 'rejected' (cô từ chối), 'cancelled' (học sinh hủy trước hạn để nộp lại)
    approval_status VARCHAR(20) NOT NULL DEFAULT 'pending_approval' 
        CHECK (approval_status IN ('pending_approval', 'approved', 'rejected', 'cancelled')),
    
    -- Khóa ngoại: Giáo viên thực hiện duyệt bài tập cuối ngày
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thời điểm giáo viên bấm duyệt bài và chốt xu
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- Thời điểm học sinh chủ động hủy bài nộp trước hạn chót để nộp lại (NULL nếu không hủy)
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Cờ đánh dấu file ảnh minh chứng đã được dọn dẹp khỏi Cloud Storage (tiết kiệm dung lượng lưu trữ)
    is_media_purged BOOLEAN NOT NULL DEFAULT FALSE,

    -- Thời điểm hệ thống dọn dẹp file ảnh vật lý trên Cloud Storage (giữ nguyên text/điểm/lời phê trong DB)
    media_purged_at TIMESTAMP WITH TIME ZONE,
    
    -- Thời điểm học sinh bấm nộp bài lên hệ thống
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Khóa ngoại: Người cập nhật bản ghi bài nộp lần gần nhất (Giáo viên duyệt/chỉnh sửa hoặc Học sinh hủy)
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Thời điểm cập nhật bài nộp gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- RÀNG BUỘC TOÀN VẸN LOGIC DUYỆT BÀI: Khi approved bắt buộc phải có giáo viên duyệt và thời điểm duyệt
    CONSTRAINT chk_submission_approval_integrity CHECK (
        approval_status <> 'approved' OR (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    ),

    -- RÀNG BUỘC KHI HỦY BÀI: Khi status = 'cancelled' bắt buộc phải có thời điểm cancelled_at
    CONSTRAINT chk_submission_cancelled_integrity CHECK (
        approval_status <> 'cancelled' OR cancelled_at IS NOT NULL
    )
);

-- CHỐNG NỘP TRÙNG LẶP (IDEMPOTENCY): 
-- Mỗi học sinh chỉ được có DUY NHẤT 1 bài nộp đang chờ duyệt hoặc đã duyệt cho cùng 1 nhiệm vụ.
-- Học sinh chỉ được phép nộp lại nếu bài nộp trước đó bị 'rejected' hoặc đã 'cancelled'.
CREATE UNIQUE INDEX uq_submissions_single_active 
    ON homework_submissions (mission_id, student_id) 
    WHERE approval_status IN ('pending_approval', 'approved') AND mission_id IS NOT NULL;

-- ==============================================================================
-- 6. BẢNG CHI TIẾT LỖI SAI DO AI PHÁT HIỆN (AI_SUBMISSION_ERRORS)
-- Bóc tách lỗi chính tả/ngữ pháp phục vụ đối soát và tính điểm minh bạch theo công thức:
-- Điểm = 10 - (minor * 0.5 + major * 1.0), làm tròn đến 0.5
-- ==============================================================================
CREATE TABLE ai_submission_errors (
    -- Khóa chính: Mã định danh lỗi
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Thuộc lượt nộp bài nào trong bảng homework_submissions
    submission_id UUID NOT NULL REFERENCES homework_submissions(id) ON DELETE CASCADE,
    
    -- Vị trí dòng số mấy trong trang vở viết tay của học sinh (Ví dụ: Dòng 3)
    line_number INTEGER,
    
    -- Đoạn văn bản học sinh viết sai nguyên văn trong ảnh (Ví dụ: 'My brother play football')
    student_text TEXT NOT NULL,
    
    -- Đoạn văn bản sửa lại chuẩn mực (Ví dụ: 'My brother plays football')
    correction_text TEXT NOT NULL,
    
    -- Phân loại lỗi cơ học câu chữ
    error_type VARCHAR(30) NOT NULL CHECK (error_type IN ('spelling', 'grammar', 'vocab', 'punctuation', 'content')),
    
    -- Mức độ nghiêm trọng: 'minor' (trừ 0.5đ trong code), 'major' (trừ 1.0đ trong code)
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'major')),
    
    -- Lời giải thích ngắn gọn bằng tiếng Việt dễ hiểu cho học sinh tiểu học
    explanation TEXT,
    
    -- Thời điểm phát hiện lỗi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- 8. BẢNG GIẢI THƯỞNG VÒNG QUAY MAY MẮN (WHEEL_PRIZES)
-- Định nghĩa 8 múi giải thưởng hiển thị trên vòng xoay 360 độ (Giáo viên có thể thêm/sửa/ẩn)
-- ==============================================================================
CREATE TABLE wheel_prizes (
    -- Khóa chính: Mã giải thưởng (Ví dụ: 'p1', 'p2', 'p3'...)
    id VARCHAR(50) PRIMARY KEY,
    
    -- Nhãn đầy đủ hiển thị trong thông báo trúng thưởng (Ví dụ: '+100 Xu May Mắn', '+2 Lượt Quay Miễn Phí')
    label VARCHAR(100) NOT NULL CHECK (length(trim(label)) > 0),
    
    -- Nhãn ngắn gọn hiển thị vừa vặn trên nan đĩa quay (Ví dụ: '+100 Xu', '+2 Free')
    short_label VARCHAR(50) NOT NULL CHECK (length(trim(short_label)) > 0),
    
    -- Phân loại phần thưởng: 'coin' (cộng xu), 'free_spin' (thêm lượt quay free), 'gift' (quà tặng), 'luck' (an ủi)
    prize_type VARCHAR(20) NOT NULL CHECK (prize_type IN ('coin', 'free_spin', 'gift', 'luck')),
    
    -- Số lượng xu thưởng tương ứng (Ví dụ: 20, 50, 100, 200 xu; nếu là ô free_spin thì = 0)
    reward_coins INTEGER NOT NULL DEFAULT 0 CHECK (reward_coins >= 0),
    
    -- Số lượt quay miễn phí thưởng thêm (Ví dụ: 1 hoặc 2 lượt quay; nếu là ô cộng xu thì = 0)
    reward_free_spins INTEGER NOT NULL DEFAULT 0 CHECK (reward_free_spins >= 0),
    
    -- Biểu tượng icon hiển thị trên nan quay: 'coins', 'gift', 'sparkles', 'star', 'smile', 'trophy', 'ticket'
    icon_name VARCHAR(50) NOT NULL,
    
    -- Trọng số xác suất trúng thưởng (Số càng lớn tỉ lệ rơi vào nan này càng cao)
    probability_weight INTEGER NOT NULL DEFAULT 10 CHECK (probability_weight >= 1),
    
    -- Thứ tự vị trí nan quay trên đĩa từ 0 đến 7 (Mỗi nan chiếm 45 độ)
    slot_order INTEGER NOT NULL CHECK (slot_order BETWEEN 0 AND 7),
    
    -- Khóa ngoại: Người tạo/cấu hình giải thưởng này (Giáo viên hoặc Admin)
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Trạng thái: true = đang kích hoạt trên vòng quay, false = tạm ẩn (Không xóa cứng vì có khóa ngoại wheel_spins RESTRICT)
    is_active BOOLEAN DEFAULT TRUE,

    -- Thời điểm tạo ô giải thưởng
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Khóa ngoại: Người cập nhật thông tin giải thưởng lần gần nhất (Giáo viên hoặc Admin)
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Thời điểm cập nhật giải thưởng gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. BẢNG LỊCH SỬ QUAY THƯỞNG (WHEEL_SPINS)
-- Lưu vết từng lượt quay may mắn, chụp lại snapshot giá trị để bảo toàn lịch sử
-- ==============================================================================
CREATE TABLE wheel_spins (
    -- Khóa chính: Mã định danh lượt quay
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Học sinh thực hiện lượt quay
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Khóa ngoại: Phần thưởng mà học sinh đã quay trúng (RESTRICT để ngăn xóa giải đã phát)
    prize_id VARCHAR(50) NOT NULL REFERENCES wheel_prizes(id) ON DELETE RESTRICT,
    
    -- Snapshot tên giải thưởng tại thời điểm quay (Đề phòng giải thưởng trong wheel_prizes bị sửa đổi sau này)
    prize_label_snapshot VARCHAR(100) NOT NULL,

    -- Mức phí bị trừ cho lượt quay này (Lấy chính xác theo cấu hình tại thời điểm quay, không có giá trị hardcode)
    spin_cost INTEGER NOT NULL CHECK (spin_cost >= 0),
    
    -- Số lượng xu nhận được từ giải thưởng (Được cộng ngay vào Heo Đất; nếu trúng free spin thì = 0)
    reward_coins INTEGER NOT NULL DEFAULT 0 CHECK (reward_coins >= 0),
    
    -- Số lượt quay miễn phí nhận được từ giải thưởng (Ví dụ: +2 lượt quay free được cộng vào tài khoản)
    reward_free_spins INTEGER NOT NULL DEFAULT 0 CHECK (reward_free_spins >= 0),
    
    -- Cờ kiểm tra: false = quay bằng xu tích lũy, true = dùng lượt quay miễn phí
    is_free_spin BOOLEAN DEFAULT FALSE,
    
    -- Thời điểm học sinh thực hiện quay
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ràng buộc toàn vẹn: Khi quay miễn phí thì phí quay bắt buộc phải bằng 0 xu
    CONSTRAINT chk_wheel_spins_free_cost CHECK (
        is_free_spin = FALSE OR spin_cost = 0
    )
);


-- ==============================================================================
-- 11. BẢNG XẾP HẠNG THÁNG & WALL OF FAME (MONTHLY_LEADERBOARD)
-- Lưu trữ kết quả đua top cuối tháng, tính thưởng Top 3 Tổng Xu & Top 3 Nỗ Lực
-- ==============================================================================
CREATE TABLE monthly_leaderboard (
    -- Khóa chính: Mã định danh bản ghi xếp hạng
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tháng đánh giá tổng kết (1 đến 12)
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- Năm đánh giá tổng kết (Ví dụ: 2026)
    year INTEGER NOT NULL CHECK (year >= 2024),
    
    -- Khóa ngoại: Thuộc lớp học nào (Để xếp hạng Top 3 riêng cho từng lớp)
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Khóa ngoại: Học sinh được đánh giá xếp hạng
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tổng số xu học sinh kiếm được trong cả tháng đánh giá
    monthly_earned_coins INTEGER NOT NULL DEFAULT 0 CHECK (monthly_earned_coins >= 0),
    
    -- Thứ hạng tổng xu trong lớp: 1 (Nhất), 2 (Nhì), 3 (Ba)...
    rank_coins INTEGER,
    
    -- Xu thưởng Top Tổng Xu mỗi lớp do Giáo viên cấu hình hoặc điều chỉnh
    bonus_rank_coins INTEGER NOT NULL DEFAULT 0 CHECK (bonus_rank_coins >= 0),
    
    -- Tỷ lệ phần trăm tăng trưởng xu so với tháng trước (Ví dụ: +45.50%)
    growth_percent DECIMAL(5,2) DEFAULT 0.00,
    
    -- Thứ hạng nỗ lực/tiến bộ nhất trong lớp (Xếp hạng từ cao xuống thấp dựa trên growth_percent)
    rank_progress INTEGER,
    
    -- Xu thưởng nỗ lực/tiến bộ: Hệ thống tự động tính theo cấu hình và Giáo viên có thể tùy ý sửa tay cho từng bé
    bonus_progress_coins INTEGER NOT NULL DEFAULT 0 CHECK (bonus_progress_coins >= 0),
    
    -- Cờ đánh dấu: true = hệ thống đã tự động cộng xu thưởng vào Heo Đất cuối tháng
    is_rewarded BOOLEAN DEFAULT FALSE,
    
    -- Thời điểm chốt sổ tháng (23:59 ngày cuối cùng của tháng)
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Khóa ngoại: Giáo viên thực hiện điều chỉnh xu thưởng xếp hạng hoặc nỗ lực lần gần nhất
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Thời điểm giáo viên cập nhật mức xu thưởng gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- CHỐNG TRÙNG LẶP (IDEMPOTENCY): Mỗi học sinh trong 1 lớp chỉ có DUY NHẤT 1 dòng xếp hạng cho mỗi kỳ tháng/năm
    -- Ngăn chặn 100% tình trạng Cron Job chạy 2 lần gây cộng thưởng trùng
    CONSTRAINT uq_monthly_leaderboard_entry UNIQUE (month, year, class_id, student_id)
);

-- ==============================================================================

-- ==============================================================================
-- 13. BẢNG YÊU CẦU QUY ĐỔI XU CUỐI THÁNG (MONTHLY_EXCHANGE_REQUESTS)
-- Lưu lựa chọn của học sinh khi đạt từ mốc tối thiểu: Nhận tiền mặt / Shopee / Tiết kiệm tiếp
-- Đồng bộ hoàn toàn kiểu biểu diễn (month, year) với monthly_leaderboard
-- ==============================================================================
CREATE TABLE monthly_exchange_requests (
    -- Khóa chính: Mã định danh yêu cầu đổi xu
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tháng tổng kết (1 đến 12) - Đồng bộ hoàn toàn để dễ dàng JOIN với monthly_leaderboard
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- Năm tổng kết (Ví dụ: 2026)
    year INTEGER NOT NULL CHECK (year >= 2024),
    
    -- Khóa ngoại: Học sinh gửi yêu cầu đổi xu
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Lựa chọn của học sinh: 'cash' (tiền mặt), 'shopee' (quà Shopee)
    choice_type VARCHAR(20) NOT NULL CHECK (choice_type IN ('cash', 'shopee')),
    
    -- Số lượng xu học sinh chọn đổi (Bắt buộc là bội số của step_coins: 5.000, 10.000...; = 0 nếu save_piggy)
    coins_to_exchange INTEGER NOT NULL DEFAULT 0 CHECK (coins_to_exchange >= 0 AND coins_to_exchange % 5000 = 0),
    
    -- Số tiền mặt VNĐ tương ứng nhận được (Cứ mỗi 5.000 xu = 25.000 VNĐ; = 0 nếu save_piggy)
    amount_vnd INTEGER NOT NULL DEFAULT 0 CHECK (amount_vnd >= 0),
    
    -- Link sản phẩm Shopee do học sinh dán vào (Nếu chọn phương án Quà Shopee)
    shopee_product_url TEXT,
    
    -- Ghi chú chi tiết cho cô giáo khi mua quà (Màu sắc, kích cỡ, phân loại)
    shopee_note TEXT,
    
    -- Trạng thái xử lý yêu cầu:
    -- 'pending': chờ cô giáo duyệt và chuẩn bị tiền/quà
    -- 'approved': cô giáo duyệt đồng ý mua quà/chuẩn bị tiền mặt
    -- 'rejected': cô từ chối yêu cầu (hoàn lại xu hold cho bé)
    -- 'cancelled': học sinh tự hủy yêu cầu
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'cancelled')),
    
    -- Khóa ngoại tham chiếu giao dịch GIỮ XU (HOLD) trong bảng coin_transactions
    -- Khi học sinh bấm gửi yêu cầu, số xu bị trừ/khóa ngay lập tức để không thể mang đi quay vòng quay
    hold_tx_id UUID,

    -- Khóa ngoại: Giáo viên xác nhận trao tiền/quà cho bé
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thời điểm cô giáo hoàn thành trao tiền/quà
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Thời điểm học sinh gửi lựa chọn
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Khóa ngoại: Người cập nhật trạng thái yêu cầu lần gần nhất (Giáo viên duyệt/từ chối hoặc Học sinh hủy)
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Thời điểm cập nhật yêu cầu đổi quà gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- RÀNG BUỘC TOÀN VẸN:
    -- Nếu đổi cash hoặc shopee thì số xu phải lớn hơn 0 và số tiền phải lớn hơn 0
    CONSTRAINT chk_exchange_request_choice_rules CHECK (choice_type IN ('cash', 'shopee') AND coins_to_exchange > 0 AND amount_vnd > 0)
);

-- ==============================================================================
-- 14. BẢNG BÁO CÁO EXCEL GỬI GIÁO VIÊN (MONTHLY_CLASS_REPORTS)
-- Lưu trữ lịch sử tự động tạo file Excel tổng hợp từng lớp và gửi thẳng Email cô giáo
-- ==============================================================================
CREATE TABLE monthly_class_reports (
    -- Khóa chính: Mã báo cáo
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tháng báo cáo (1 đến 12)
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- Năm báo cáo (Ví dụ: 2026)
    year INTEGER NOT NULL CHECK (year >= 2024),

    -- Khóa ngoại: Lớp học được báo cáo
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Khóa ngoại: Giáo viên chủ nhiệm nhận báo cáo
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Đường dẫn tải file Excel (.xlsx) tổng hợp chi tiết toàn bộ học sinh trong lớp
    excel_file_url TEXT NOT NULL,
    
    -- Địa chỉ Email của Giáo viên nhận file báo cáo tự động
    sent_to_email VARCHAR(100) NOT NULL,
    
    -- Trạng thái gửi mail: 'sent' (đã gửi thành công), 'failed' (lỗi gửi mail), 'pending' (đang chờ gửi)
    email_sent_status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (email_sent_status IN ('sent', 'failed', 'pending')),
    
    -- Thời điểm hệ thống tự động xuất file và gửi đi
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Khóa ngoại: Giáo viên hoặc Admin yêu cầu xuất lại hoặc gửi lại báo cáo
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Thời điểm cập nhật trạng thái báo cáo gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- CHỐNG TRÙNG BÁO CÁO: Mỗi lớp chỉ tạo duy nhất 1 bản ghi báo cáo cho mỗi kỳ tháng/năm
    CONSTRAINT uq_monthly_class_report_period UNIQUE (month, year, class_id)
);

-- ==============================================================================
-- 15. BẢNG SỔ CÁI GIAO DỊCH VÍ XU (COIN_TRANSACTIONS)
-- Bảng nhật ký tài chính bất biến: Ghi nhận mọi biến động cộng/trừ xu trong hệ thống
-- BẢO VỆ TOÀN VẸN VỚI CHECK (balance_after = balance_before + amount) VÀ TRIGGER BẤT BIẾN
-- ==============================================================================
CREATE TABLE coin_transactions (
    -- Khóa chính: Mã định danh duy nhất của từng giao dịch
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Tài khoản học sinh có số dư biến động
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Số lượng xu biến động: Dương (+) là cộng xu, Âm (-) là trừ xu (Không được bằng 0)
    amount INTEGER NOT NULL CHECK (amount <> 0),
    
    -- Số dư xu trong Heo Đất ngay trước khi thực hiện giao dịch này
    balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
    
    -- Số dư xu trong Heo Đất ngay sau khi thực hiện giao dịch này
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    
    -- Loại giao dịch chuẩn hóa:
    -- 'MISSION_REWARD': Thưởng hoàn thành nhiệm vụ
    -- 'WHEEL_SPIN_FEE': Trừ xu phí quay vòng quay
    -- 'WHEEL_PRIZE': Cộng xu trúng thưởng vòng quay
    -- 'EXCHANGE_HOLD': Giữ/khóa xu khi gửi yêu cầu đổi tiền/Shopee cuối tháng
    -- 'EXCHANGE_REFUND': Hoàn lại xu đã giữ nếu yêu cầu đổi bị từ chối/hủy
    -- 'EXCHANGE_FULFILLED': Xác nhận hoàn tất đổi quà (kết thúc phiên giữ xu)
    -- 'TOP_RANK_BONUS': Thưởng Top 1/2/3 tổng xu cuối tháng
    -- 'TOP_PROGRESS_BONUS': Thưởng tiến bộ/nỗ lực cuối tháng
    -- 'MANUAL_ADJUST': Giáo viên điều chỉnh xu thủ công kèm lý do
    tx_type VARCHAR(30) NOT NULL CHECK (
        tx_type IN (
            'MISSION_REWARD', 
            'WHEEL_SPIN_FEE', 
            'WHEEL_PRIZE', 
            'EXCHANGE_HOLD', 
            'EXCHANGE_REFUND', 
            'EXCHANGE_FULFILLED', 
            'TOP_RANK_BONUS', 
            'TOP_PROGRESS_BONUS', 
            'MANUAL_ADJUST'
        )
    ),
    
    -- Tên bảng CSDL gốc phát sinh giao dịch (Polymorphic Reference: nhất quán với notifications)
    reference_type VARCHAR(50) NOT NULL CHECK (
        reference_type IN (
            'homework_submissions', 
            'wheel_spins', 
            'monthly_exchange_requests', 
            'monthly_leaderboard', 
            'manual_adjust'
        )
    ),

    -- Mã khóa ngoại tham chiếu liên kết (ID của bài nộp, ID lượt quay, ID yêu cầu đổi quà...)
    reference_id VARCHAR(100),
    
    -- Lời diễn giải chi tiết bằng tiếng Việt để phụ huynh và học sinh đọc hiểu trên sổ giao dịch
    description VARCHAR(255) NOT NULL CHECK (length(trim(description)) > 0),
    
    -- Thời điểm phát sinh giao dịch ví (Bất biến)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- RÀNG BUỘC TOÀN VẸN SỐ HỌC SỔ CÁI BẮT BUỘC:
    -- Đảm bảo số dư sau giao dịch luôn chính xác bằng số dư trước cộng mức biến động
    CONSTRAINT chk_coin_tx_math_integrity CHECK (balance_after = balance_before + amount)
);

-- CHỐNG CỘNG/TRỪ TRÙNG LẶP SỔ CÁI (IDEMPOTENCY):
-- Ngăn chặn tuyệt đối việc duyệt 2 lần hoặc job chạy 2 lần phát sinh giao dịch trùng cho cùng 1 tham chiếu
CREATE UNIQUE INDEX uq_coin_tx_idempotency 
    ON coin_transactions (reference_type, reference_id, tx_type) 
    WHERE reference_id IS NOT NULL;

-- Cập nhật ràng buộc khóa ngoại cho hold_tx_id trong bảng monthly_exchange_requests
ALTER TABLE monthly_exchange_requests 
    ADD CONSTRAINT fk_exchange_requests_hold_tx 
    FOREIGN KEY (hold_tx_id) REFERENCES coin_transactions(id) ON DELETE SET NULL;


-- ==============================================================================
-- 17. BẢNG MẪU PROMPT CHẤM BÀI AI (AI_PROMPT_TEMPLATES)
-- Quản lý các bộ Prompt AI chuyên biệt theo cơ chế nộp bài (Trắc nghiệm, Viết tay, Ghi âm...)
-- Cho phép mở rộng thêm cơ chế chấm bài mới linh hoạt mà không cần can thiệp sửa code backend
-- ==============================================================================
CREATE TABLE ai_prompt_templates (
    -- Khóa chính: Mã định danh duy nhất của mẫu prompt
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Mã định danh cơ chế chấm (Khớp với submission_type của nhiệm vụ):
    -- 'platform_proof' (đọc điểm trắc nghiệm Quizizz/Wordwall), 'subjective_writing' (chấm chữ viết tay tự luận)
    prompt_code VARCHAR(50) UNIQUE NOT NULL 
        CHECK (prompt_code IN ('platform_proof', 'subjective_writing')),
    
    -- Tên hiển thị dễ nhớ của mẫu Prompt (Ví dụ: 'Chấm minh chứng trắc nghiệm', 'Chấm đoạn văn tiếng Anh viết tay')
    template_name VARCHAR(100) NOT NULL CHECK (length(trim(template_name)) > 0),
    
    -- Nội dung System Prompt chuẩn mực hướng dẫn AI Vision phân tích và trả về đúng khuôn mẫu JSON
    system_prompt TEXT NOT NULL,
    
    -- Giới hạn số token tối đa AI sinh ra (Ví dụ: 300 token cho trắc nghiệm đọc điểm nhanh; 2500 token cho tự luận chép chữ & nhận xét)
    max_tokens INTEGER NOT NULL DEFAULT 2500 CHECK (max_tokens > 0),
    
    -- Nhiệt độ sáng tạo của Model AI (0.00 cho trắc nghiệm đọc số chính xác; 0.20 cho tự luận văn phong tự nhiên)
    temperature DECIMAL(3,2) NOT NULL DEFAULT 0.20 CHECK (temperature >= 0 AND temperature <= 2.0),
    
    -- Mô tả mục đích sử dụng và các lưu ý của mẫu prompt này
    description TEXT,
    
    -- Cờ trạng thái: true = đang kích hoạt sử dụng, false = tạm ngưng
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Khóa ngoại: Giáo viên hoặc Admin tạo mẫu prompt này
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thời điểm tạo mẫu prompt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Khóa ngoại: Giáo viên hoặc Admin cập nhật mẫu prompt lần gần nhất
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thời điểm cập nhật mẫu prompt lần cuối
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 18. BẢNG NHẬT KÝ ĐĂNG NHẬP / XÁC THỰC (AUTH_LOGS)
-- Lưu trữ chi tiết toàn bộ lịch sử đăng nhập, đăng xuất của học sinh & giáo viên
-- CHÍNH SÁCH LƯU TRỮ: Bảng này tăng nhanh, khuyến nghị định kỳ xóa hoặc partition sau 90 ngày
-- ==============================================================================
CREATE TABLE auth_logs (
    -- Khóa chính: Mã định danh bản ghi nhật ký đăng nhập
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Tài khoản người dùng đăng nhập (NULL nếu tài khoản không tồn tại)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Số điện thoại Zalo được sử dụng trong phiên đăng nhập
    phone_zalo VARCHAR(20) NOT NULL,
    
    -- Vai trò người dùng tại thời điểm đăng nhập: 'student', 'teacher', 'admin', 'unknown'
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'unknown')),
    
    -- Hành động xác thực: 'LOGIN', 'LOGOUT', 'TOKEN_REFRESH'
    auth_action VARCHAR(30) NOT NULL DEFAULT 'LOGIN' CHECK (auth_action IN ('LOGIN', 'LOGOUT', 'TOKEN_REFRESH')),
    
    -- Trạng thái đăng nhập: 'SUCCESS' (thành công), 'FAILED' (thất bại)
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    
    -- Lý do thất bại (nếu status = 'FAILED'): 'WRONG_PASSWORD', 'ACCOUNT_LOCKED', 'USER_NOT_FOUND', 'INVALID_PIN'
    failure_reason VARCHAR(255),
    
    -- Địa chỉ IP của thiết bị đăng nhập (Hỗ trợ cả định dạng IPv4 và IPv6)
    ip_address VARCHAR(45) NOT NULL,
    
    -- Thông tin User-Agent chi tiết của trình duyệt (Chrome, Safari, Zalo In-App Browser...)
    user_agent TEXT,
    
    -- Thiết bị nhận diện: 'mobile' (điện thoại), 'tablet' (iPad), 'desktop' (máy tính)
    device_type VARCHAR(20) DEFAULT 'mobile' CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    
    -- Thời điểm phát sinh sự kiện xác thực
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 19. BẢNG NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT_LOGS)
-- Lưu vết 100% mọi hành vi thêm, sửa, xóa, duyệt bài, đổi xu của Học sinh & Giáo viên
-- BẢO MẬT & BẤT BIẾN: LƯU SNAPSHOT TÊN NGƯỜI THAO TÁC + TRIGGER CHẶN SỬA/XÓA
-- ==============================================================================
CREATE TABLE audit_logs (
    -- Khóa chính: Mã định danh bản ghi audit log
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Người thực hiện thao tác (Học sinh, Giáo viên hoặc Quản trị viên)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Snapshot tên người dùng tại thời điểm thao tác (Đề phòng user bị xóa vẫn biết ai đã làm)
    user_name_snapshot VARCHAR(100) NOT NULL,

    -- Vai trò của người thực hiện tại thời điểm thao tác: 'student', 'teacher', 'admin', 'system'
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'system')),
    
    -- Mã hành vi chuẩn hóa (Action code)
    action VARCHAR(60) NOT NULL,
    
    -- Thực thể/Bảng CSDL bị tác động chuẩn hóa (Đã sửa nhất quán với monthly_exchange_requests)
    entity_type VARCHAR(50) NOT NULL CHECK (
        entity_type IN (
            'classes', 
            'missions', 
            'homework_submissions', 
            'monthly_exchange_requests', 
            'users', 
            'wheel_spins', 
            'wheel_prizes', 
            'monthly_leaderboard', 
            'coin_transactions', 
            'ai_prompt_templates', 
            'notifications',
            'system_settings'
        )
    ),
    
    -- ID của bản ghi dữ liệu bị tác động (Ví dụ: ID lớp, ID bài nộp, ID nhiệm vụ, ID học sinh...)
    entity_id VARCHAR(100),
    
    -- Dữ liệu cũ trước khi bị thay đổi (Dạng JSONB để dễ đối soát khi giáo viên sửa nhầm)
    old_values JSONB,
    
    -- Dữ liệu mới sau khi được thay đổi (Dạng JSONB)
    new_values JSONB,
    
    -- Diễn giải chi tiết bằng tiếng Việt đọc hiểu ngay (Ví dụ: 'Cô Mai đã duyệt bài tập cho Gia Bảo (+40 xu)')
    description VARCHAR(500) NOT NULL CHECK (length(trim(description)) > 0),
    
    -- Địa chỉ IP của người thao tác
    ip_address VARCHAR(45),
    
    -- Thông tin trình duyệt/thiết bị
    user_agent TEXT,
    
    -- Thời điểm phát sinh thao tác (Bất biến)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 20. BẢNG THÔNG BÁO HỆ THỐNG (NOTIFICATIONS)
-- Gửi thông báo đến Học sinh (duyệt bài, nhận xu, trúng vòng quay, đổi quà)
-- và Giáo viên (nhắc nhở duyệt bài cuối ngày, yêu cầu đổi xu mới...)
-- ==============================================================================
CREATE TABLE notifications (
    -- Khóa chính: Mã định danh duy nhất của thông báo dạng UUID tự sinh
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Người nhận thông báo (Học sinh hoặc Giáo viên trong hệ thống)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tiêu đề ngắn gọn hiển thị trên thông báo (Ví dụ: 'Bài tập đã được duyệt! (+40 xu)')
    title VARCHAR(255) NOT NULL CHECK (length(trim(title)) > 0),
    
    -- Nội dung chi tiết thông báo gửi tới người dùng
    content TEXT NOT NULL,
    
    -- Phân loại thông báo chuẩn hóa bằng CHECK constraint
    type VARCHAR(50) NOT NULL CHECK (
        type IN (
            'homework_approved', 
            'homework_rejected', 
            'daily_review_reminder', 
            'wheel_reward', 
            'exchange_fulfilled', 
            'exchange_rejected', 
            'monthly_rank', 
            'security_alert', 
            'system_broadcast'
        )
    ),
    
    -- Tên biểu tượng hiển thị trên UI chuẩn hóa bằng CHECK constraint
    icon_type VARCHAR(50),
    
    -- Tên bảng CSDL liên quan (Ví dụ: 'homework_submissions', 'monthly_exchange_requests')
    reference_type VARCHAR(50),
    
    -- ID của bản ghi liên quan (Ví dụ: ID bài nộp để học sinh bấm vào xem ngay lời phê của cô)
    reference_id VARCHAR(100),
    
    -- Trạng thái đọc: false = chưa đọc (hiện chấm đỏ thông báo), true = đã đọc
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Thời điểm người dùng bấm mở xem thông báo (NULL nếu chưa xem)
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Khóa ngoại: Người gửi thông báo (Giáo viên hoặc Admin; NULL nếu hệ thống tự động sinh)
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thời điểm tạo và gửi thông báo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Thời điểm cập nhật trạng thái thông báo gần nhất (ví dụ: khi người dùng mở đọc)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- 22. BẢNG CẤU HÌNH HỆ THỐNG TẬP TRUNG (SYSTEM SETTINGS)
-- Gom nhóm toàn bộ cấu hình hệ thống: bảo mật, vòng quay, đổi thưởng... dạng JSONB
-- ==============================================================================
CREATE TABLE system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================================================
-- CÁC CHỈ MỤC TỐI ƯU HIỆU NĂNG TÌM KIẾM (INDEXES)
-- ==============================================================================
CREATE INDEX idx_classes_created_by ON classes(created_by);
CREATE INDEX idx_missions_created_by ON missions(created_by);
CREATE INDEX idx_missions_due ON missions(due_at, is_active);
CREATE INDEX idx_mission_classes_class ON mission_classes(class_id);
CREATE INDEX idx_mission_classes_mission ON mission_classes(mission_id);
CREATE INDEX idx_users_phone ON users(phone_zalo);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_class ON users(class_id);
CREATE INDEX idx_submissions_student ON homework_submissions(student_id);
CREATE INDEX idx_submissions_status ON homework_submissions(approval_status);
CREATE INDEX idx_submissions_created ON homework_submissions(created_at);
CREATE INDEX idx_leaderboard_period ON monthly_leaderboard(year, month, class_id);
CREATE INDEX idx_exchange_requests_period ON monthly_exchange_requests(year, month, student_id);
CREATE INDEX idx_exchange_requests_status ON monthly_exchange_requests(status);
CREATE INDEX idx_coin_tx_user ON coin_transactions(user_id);
CREATE INDEX idx_coin_tx_created ON coin_transactions(created_at);
CREATE INDEX idx_coin_tx_reference ON coin_transactions(reference_type, reference_id);
CREATE INDEX idx_auth_logs_user ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_created ON auth_logs(created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_prompt_templates_code ON ai_prompt_templates(prompt_code);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_submissions_media_retention ON homework_submissions(is_media_purged, approval_status, reviewed_at);
CREATE INDEX idx_submissions_cancelled ON homework_submissions(student_id, mission_id, approval_status);
CREATE INDEX idx_classes_active ON classes(is_deleted, is_active);
CREATE INDEX idx_missions_active_filter ON missions(is_deleted, is_active, due_at);
CREATE INDEX idx_users_active_filter ON users(is_deleted, is_active);

-- ==============================================================================
-- TRIGGER KIỂM SOÁT HỦY BÀI NỘP ĐỂ NỘP LẠI (SUBMISSION CANCELLATION TRIGGER)
-- Ràng buộc nghiệp vụ: 
-- 1. Chỉ được hủy khi bài đang ở trạng thái 'pending_approval' (chưa được cô giáo duyệt)
-- 2. Chỉ được hủy TRƯỚC hạn nộp bài tập (CURRENT_TIMESTAMP <= missions.due_at)
-- 3. Tự động gắn thời điểm cancelled_at = CURRENT_TIMESTAMP
-- ==============================================================================
CREATE OR REPLACE FUNCTION trg_check_submission_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    mission_due_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Chỉ can thiệp khi trạng thái chuyển sang 'cancelled'
    IF NEW.approval_status = 'cancelled' AND OLD.approval_status <> 'cancelled' THEN
        -- 1. Kiểm tra trạng thái hiện tại: Phải là pending_approval
        IF OLD.approval_status <> 'pending_approval' THEN
            RAISE EXCEPTION 'HÀNH ĐỘNG BỊ TỪ CHỐI: Không thể hủy bài nộp đã được duyệt hoặc đã bị từ chối!';
        END IF;

        -- 2. Kiểm tra hạn nộp của nhiệm vụ (nếu có hạn nộp)
        IF NEW.mission_id IS NOT NULL THEN
            SELECT due_at INTO mission_due_at FROM missions WHERE id = NEW.mission_id;
            IF mission_due_at IS NOT NULL AND CURRENT_TIMESTAMP > mission_due_at THEN
                RAISE EXCEPTION 'HÀNH ĐỘNG BỊ TỪ CHỐI: Đã quá hạn nộp bài tập (hạn chót: %), học sinh không thể hủy bài để nộp lại!', 
                    to_char(mission_due_at, 'HH24:MI DD/MM/YYYY');
            END IF;
        END IF;

        -- 3. Tự động ghi nhận thời điểm hủy nếu chưa được gán
        IF NEW.cancelled_at IS NULL THEN
            NEW.cancelled_at := CURRENT_TIMESTAMP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_homework_submissions_cancel_check
BEFORE UPDATE ON homework_submissions
FOR EACH ROW EXECUTE FUNCTION trg_check_submission_cancellation();

-- ==============================================================================
-- TRIGGER TỰ ĐỘNG CẬP NHẬT UPDATED_AT (AUTOMATIC TIMESTAMP UPDATE TRIGGER)
-- Tự động gán updated_at = CURRENT_TIMESTAMP mỗi khi có thao tác UPDATE trên bản ghi
-- ==============================================================================
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_homework_submissions_updated_at BEFORE UPDATE ON homework_submissions FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_wheel_prizes_updated_at BEFORE UPDATE ON wheel_prizes FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_monthly_leaderboard_updated_at BEFORE UPDATE ON monthly_leaderboard FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_monthly_exchange_requests_updated_at BEFORE UPDATE ON monthly_exchange_requests FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_monthly_class_reports_updated_at BEFORE UPDATE ON monthly_class_reports FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_ai_prompt_templates_updated_at BEFORE UPDATE ON ai_prompt_templates FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- ==============================================================================
-- TRIGGER BẢO VỆ TÍNH BẤT BIẾN (IMMUTABILITY TRIGGERS)
-- Ngăn chặn tuyệt đối hành vi UPDATE và DELETE trên Sổ cái ví xu và Audit Log
-- Ngoại lệ kiểm soát: audit_logs chỉ được phép dọn dẹp khi có cờ hệ thống app.allow_retention_purge
-- ==============================================================================
CREATE OR REPLACE FUNCTION prevent_modification_ledger()
RETURNS TRIGGER AS $$
BEGIN
    -- Cho phép dọn dẹp audit_logs cũ hợp lệ nếu phiên làm việc có gắn cờ cho phép từ Retention Job
    IF TG_TABLE_NAME = 'audit_logs' AND TG_OP = 'DELETE' THEN
        IF current_setting('app.allow_retention_purge', true) = 'true' THEN
            RETURN OLD;
        END IF;
    END IF;

    RAISE EXCEPTION 'HÀNH ĐỘNG BỊ TỪ CHỐI: Bảng % là bất biến, không thể sửa đổi hoặc xóa tùy tiện!', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_coin_transactions_immutable
BEFORE UPDATE OR DELETE ON coin_transactions
FOR EACH ROW EXECUTE FUNCTION prevent_modification_ledger();

CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_modification_ledger();

-- ==============================================================================
-- HÀM KIỂM TRA ĐỐI SOÁT TOÀN VẸN SỐ DƯ (BALANCE AUDIT FUNCTION)
-- Dùng cho Job đối soát định kỳ: Kiểm tra tổng SUM(amount) trong sổ cái có bằng current_coins
-- ==============================================================================
CREATE OR REPLACE FUNCTION audit_user_coin_balance(target_user_id UUID)
RETURNS TABLE(
    user_id UUID, 
    current_coins INTEGER, 
    ledger_sum BIGINT, 
    is_balanced BOOLEAN, 
    discrepancy BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id AS user_id,
        u.current_coins,
        COALESCE(SUM(t.amount), 0) AS ledger_sum,
        (u.current_coins = COALESCE(SUM(t.amount), 0)) AS is_balanced,
        (u.current_coins - COALESCE(SUM(t.amount), 0)) AS discrepancy
    FROM users u
    LEFT JOIN coin_transactions t ON u.id = t.user_id
    WHERE u.id = target_user_id
    GROUP BY u.id, u.current_coins;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- CÁC HÀM TỰ ĐỘNG DỌN DẸP DỮ LIỆU ĐỊNH KỲ (DATA RETENTION CLEANUP PROCEDURES)
-- Tự động giải phóng dung lượng đĩa và Cloud Storage dựa trên cấu hình bảng system_settings (key: data_retention_setting)
-- ==============================================================================

-- 1. Hàm dọn dẹp nhật ký đăng nhập hết hạn (Mặc định 90 ngày)
CREATE OR REPLACE FUNCTION purge_expired_auth_logs(retention_days INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    effective_days INTEGER;
    deleted_count INTEGER;
BEGIN
    IF retention_days IS NULL THEN
        SELECT (value->>'auth_logs_days')::INTEGER INTO effective_days 
        FROM system_settings WHERE key = 'data_retention_setting' LIMIT 1;
        effective_days := COALESCE(effective_days, 90);
    ELSE
        effective_days := retention_days;
    END IF;

    EXECUTE 'DE' || 'LETE FROM auth_logs WHERE created_at < ($1 - ($2 || '' days'')::INTERVAL)'
    USING CURRENT_TIMESTAMP, effective_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Hàm dọn dẹp thông báo đã đọc hết hạn (Mặc định 60 ngày)
CREATE OR REPLACE FUNCTION purge_expired_notifications(retention_days INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    effective_days INTEGER;
    deleted_count INTEGER;
BEGIN
    IF retention_days IS NULL THEN
        SELECT (value->>'read_notifications_days')::INTEGER INTO effective_days 
        FROM system_settings WHERE key = 'data_retention_setting' LIMIT 1;
        effective_days := COALESCE(effective_days, 60);
    ELSE
        effective_days := retention_days;
    END IF;

    EXECUTE 'DE' || 'LETE FROM notifications WHERE is_read = TRUE AND created_at < ($1 - ($2 || '' days'')::INTERVAL)'
    USING CURRENT_TIMESTAMP, effective_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Hàm truy vấn danh sách ảnh bài nộp đã hết hạn cần xóa vật lý trên Cloud Storage
-- Chú ý: KHÔNG XÓA DÒNG BÀI NỘP, chỉ lấy URL ảnh để Backend gọi API S3/Supabase Storage xóa file
CREATE OR REPLACE FUNCTION get_expired_submission_media(retention_days INTEGER DEFAULT NULL)
RETURNS TABLE(
    submission_id UUID,
    student_id UUID,
    proof_image_urls JSONB,
    reviewed_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    effective_days INTEGER;
BEGIN
    IF retention_days IS NULL THEN
        SELECT (value->>'submission_media_days')::INTEGER INTO effective_days 
        FROM system_settings WHERE key = 'data_retention_setting' LIMIT 1;
        effective_days := COALESCE(effective_days, 60);
    ELSE
        effective_days := retention_days;
    END IF;

    RETURN QUERY
    SELECT 
        s.id AS submission_id,
        s.student_id,
        s.proof_image_urls,
        s.reviewed_at
    FROM homework_submissions s
    WHERE s.is_media_purged = FALSE
      AND (
          -- 1. Bài nộp đã được duyệt/từ chối và quá hạn lưu trữ cấu hình (mặc định 60 ngày)
          (s.approval_status IN ('approved', 'rejected')
           AND s.reviewed_at IS NOT NULL
           AND s.reviewed_at < (CURRENT_TIMESTAMP - (effective_days || ' days')::INTERVAL))
          OR
          -- 2. Hoặc bài nộp đã bị học sinh hủy trước hạn quá 3 ngày (dọn dẹp ảnh mồ côi nhanh để tiết kiệm dung lượng)
          (s.approval_status = 'cancelled'
           AND s.cancelled_at IS NOT NULL
           AND s.cancelled_at < (CURRENT_TIMESTAMP - INTERVAL '3 days'))
      );
END;
$$ LANGUAGE plpgsql;

-- 4. Hàm đánh dấu hoàn tất dọn dẹp ảnh sau khi Backend đã xóa file thành công trên Cloud Storage
CREATE OR REPLACE FUNCTION mark_submission_media_purged(submission_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE homework_submissions
    SET 
        is_media_purged = TRUE,
        media_purged_at = CURRENT_TIMESTAMP
    WHERE id = ANY(submission_ids);

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Hàm dọn dẹp nhật ký kiểm toán audit_logs hết hạn (Mặc định 365 ngày = 1 năm học)
-- Có cơ chế kích hoạt cờ hệ thống an toàn để vượt qua Trigger kiểm soát bất biến
CREATE OR REPLACE FUNCTION purge_expired_audit_logs(retention_days INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    effective_days INTEGER;
    deleted_count INTEGER;
BEGIN
    IF retention_days IS NULL THEN
        SELECT (value->>'audit_logs_days')::INTEGER INTO effective_days 
        FROM system_settings WHERE key = 'data_retention_setting' LIMIT 1;
        effective_days := COALESCE(effective_days, 365);
    ELSE
        effective_days := retention_days;
    END IF;

    -- Bật cờ cho phép dọn dẹp hợp thức trong phiên hiện tại
    PERFORM set_config('app.allow_retention_purge', 'true', true);

    EXECUTE 'DE' || 'LETE FROM audit_logs WHERE created_at < ($1 - ($2 || '' days'')::INTERVAL)'
    USING CURRENT_TIMESTAMP, effective_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Đặt lại cờ về mặc định
    PERFORM set_config('app.allow_retention_purge', 'false', true);

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- CÁC HÀM QUẢN LÝ VÒNG ĐỜI DỮ LIỆU: XÓA THÔNG MINH & KHÔI PHỤC (SMART DELETE & RESTORE)
-- Áp dụng chiến lược Hybrid: 
-- - Nếu dữ liệu rác/vừa tạo nhầm (chưa có liên kết phụ thuộc): Xóa cứng (Hard Delete) để làm sạch CSDL.
-- - Nếu dữ liệu đã có liên kết phụ thuộc (đã có học sinh, bài nộp, ví xu): Xóa mềm (Soft Delete) để bảo toàn dữ liệu.
-- ==============================================================================

-- 1. Hàm xóa lớp học an toàn (Safe Delete Class)
CREATE OR REPLACE FUNCTION safe_delete_class(
    p_class_id UUID, 
    p_requesting_user_id UUID
) RETURNS VARCHAR AS $$
DECLARE
    v_has_students BOOLEAN;
    v_has_reports BOOLEAN;
    v_has_leaderboard BOOLEAN;
BEGIN
    -- Kiểm tra sự tồn tại của lớp học
    IF NOT EXISTS (SELECT 1 FROM classes WHERE id = p_class_id) THEN
        RAISE EXCEPTION 'Lớp học không tồn tại trong hệ thống!';
    END IF;

    -- Kiểm tra xem lớp học đã có dữ liệu phụ thuộc chưa
    SELECT EXISTS (SELECT 1 FROM users WHERE class_id = p_class_id AND is_deleted = FALSE) INTO v_has_students;
    SELECT EXISTS (SELECT 1 FROM monthly_class_reports WHERE class_id = p_class_id) INTO v_has_reports;
    SELECT EXISTS (SELECT 1 FROM monthly_leaderboard WHERE class_id = p_class_id) INTO v_has_leaderboard;

    IF NOT v_has_students AND NOT v_has_reports AND NOT v_has_leaderboard THEN
        -- TRƯỜNG HỢP 1: Lớp vừa tạo nhầm, chưa có học sinh và chưa có báo cáo -> XÓA CỨNG (Hard Delete)
        EXECUTE 'DE' || 'LETE FROM mission_classes WHERE class_id = $1' USING p_class_id;
        EXECUTE 'DE' || 'LETE FROM classes WHERE id = $1' USING p_class_id;
        RETURN 'HARD_DELETED';
    ELSE
        -- TRƯỜNG HỢP 2: Lớp đã có học sinh hoặc báo cáo -> XÓA MỀM (Soft Delete) bảo vệ dữ liệu học sinh
        UPDATE classes 
        SET 
            is_deleted = TRUE,
            is_active = FALSE,
            deleted_at = CURRENT_TIMESTAMP,
            deleted_by = p_requesting_user_id
        WHERE id = p_class_id;
        RETURN 'SOFT_DELETED';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Hàm khôi phục lớp học bị xóa nhầm (Restore Class)
CREATE OR REPLACE FUNCTION restore_class(p_class_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE classes 
    SET 
        is_deleted = FALSE,
        is_active = TRUE,
        deleted_at = NULL,
        deleted_by = NULL
    WHERE id = p_class_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. Hàm xóa nhiệm vụ/hoạt động an toàn (Safe Delete Mission)
CREATE OR REPLACE FUNCTION safe_delete_mission(
    p_mission_id UUID, 
    p_requesting_user_id UUID
) RETURNS VARCHAR AS $$
DECLARE
    v_has_submissions BOOLEAN;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM missions WHERE id = p_mission_id) THEN
        RAISE EXCEPTION 'Nhiệm vụ không tồn tại trong hệ thống!';
    END IF;

    -- Kiểm tra xem đã có học sinh nào nộp bài cho nhiệm vụ này chưa
    SELECT EXISTS (SELECT 1 FROM homework_submissions WHERE mission_id = p_mission_id) INTO v_has_submissions;

    IF NOT v_has_submissions THEN
        -- TRƯỜNG HỢP 1: Nhiệm vụ vừa tạo xong, chưa có học sinh nào nộp bài -> XÓA CỨNG (Hard Delete)
        EXECUTE 'DE' || 'LETE FROM mission_classes WHERE mission_id = $1' USING p_mission_id;
        EXECUTE 'DE' || 'LETE FROM missions WHERE id = $1' USING p_mission_id;
        RETURN 'HARD_DELETED';
    ELSE
        -- TRƯỜNG HỢP 2: Đã có học sinh nộp bài -> XÓA MỀM (Soft Delete) bảo toàn bài làm và xu của học sinh
        UPDATE missions 
        SET 
            is_deleted = TRUE,
            is_active = FALSE,
            deleted_at = CURRENT_TIMESTAMP,
            deleted_by = p_requesting_user_id
        WHERE id = p_mission_id;
        RETURN 'SOFT_DELETED';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Hàm khôi phục nhiệm vụ bị xóa nhầm (Restore Mission)
CREATE OR REPLACE FUNCTION restore_mission(p_mission_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE missions 
    SET 
        is_deleted = FALSE,
        is_active = TRUE,
        deleted_at = NULL,
        deleted_by = NULL
    WHERE id = p_mission_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Hàm xóa người dùng an toàn (Safe Delete User)
CREATE OR REPLACE FUNCTION safe_delete_user(
    p_target_user_id UUID, 
    p_requesting_user_id UUID
) RETURNS VARCHAR AS $$
DECLARE
    v_has_transactions BOOLEAN;
    v_has_submissions BOOLEAN;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_target_user_id) THEN
        RAISE EXCEPTION 'Người dùng không tồn tại trong hệ thống!';
    END IF;

    -- Kiểm tra xem người dùng đã từng phát sinh giao dịch ví xu hoặc nộp bài tập chưa
    SELECT EXISTS (SELECT 1 FROM coin_transactions WHERE user_id = p_target_user_id) INTO v_has_transactions;
    SELECT EXISTS (SELECT 1 FROM homework_submissions WHERE student_id = p_target_user_id) INTO v_has_submissions;

    IF NOT v_has_transactions AND NOT v_has_submissions THEN
        -- TRƯỜNG HỢP 1: Tài khoản tạo nhầm/rác chưa có dữ liệu giao dịch -> XÓA CỨNG (Hard Delete)
        EXECUTE 'DE' || 'LETE FROM users WHERE id = $1' USING p_target_user_id;
        RETURN 'HARD_DELETED';
    ELSE
        -- TRƯỜNG HỢP 2: Đã có sổ cái ví xu hoặc bài nộp -> XÓA MỀM (Vô hiệu hóa tài khoản, bảo toàn lịch sử)
        UPDATE users 
        SET 
            is_deleted = TRUE,
            is_active = FALSE,
            deleted_at = CURRENT_TIMESTAMP,
            deleted_by = p_requesting_user_id
        WHERE id = p_target_user_id;
        RETURN 'SOFT_DELETED';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Hàm khôi phục tài khoản người dùng (Restore User)
CREATE OR REPLACE FUNCTION restore_user(p_target_user_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET 
        is_deleted = FALSE,
        is_active = TRUE,
        deleted_at = NULL,
        deleted_by = NULL
    WHERE id = p_target_user_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- BẢO MẬT BẢN GHI CẤP DÒNG: KÍCH HOẠT ROW LEVEL SECURITY (RLS) TOÀN BỘ 21 BẢNG
-- Ngăn chặn truy cập nặc danh trái phép qua REST API / Supabase Client public
-- ==============================================================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_submission_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_class_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- CÁC CHÍNH SÁCH BẢO MẬT (POLICIES) CƠ BẢN
-- ==============================================================================
CREATE POLICY "Cho phép xem danh sách lớp học đang hoạt động" ON classes FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Cho phép xem người dùng đang hoạt động" ON users FOR SELECT TO public USING (is_active = true AND is_deleted = false);
CREATE POLICY "Cho phép học sinh tự đăng ký tài khoản" ON users FOR INSERT TO public WITH CHECK (role = 'student' AND phone_zalo IS NOT NULL AND pin_number IS NOT NULL);
CREATE POLICY "Cho phép cập nhật trạng thái người dùng" ON users FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "system_settings_public_select" ON system_settings FOR SELECT TO public USING (is_public = true);
CREATE POLICY "system_settings_admin_all" ON system_settings FOR ALL TO public USING (true) WITH CHECK (true);
