-- ==============================================================================
-- DATABASE SCHEMA: STUDENT COIN PORTAL
-- Hệ quản trị CSDL mục tiêu: PostgreSQL (Tương thích 100% để Import vào drawDB.app)
-- Toàn bộ các cột và bảng đều được chú thích chi tiết phục vụ thiết kế & vận hành
-- ==============================================================================

-- ==============================================================================
-- 1. BẢNG LỚP HỌC (CLASSES)
-- Quản lý danh sách các lớp học trong trường/trung tâm (ví dụ: Lớp 5A, Lớp 5B...)
-- ==============================================================================
CREATE TABLE classes (
    -- Khóa chính: Định danh duy nhất cho từng lớp học dạng UUID v4 tự sinh
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tên lớp học hiển thị trên giao diện (Ví dụ: 'Lớp 5A', 'Lớp 5B', 'Lớp 4A')
    class_name VARCHAR(50) NOT NULL,
    
    -- Khóa ngoại: Người tạo lớp học này (Giáo viên hoặc Admin)
    -- Được liên kết với bảng users(id) thông qua câu lệnh ALTER TABLE bên dưới
    created_by UUID,
    
    -- Thời điểm tạo bản ghi lớp học trong hệ thống
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. BẢNG NGƯỜI DÙNG & HỒ SƠ HỌC SINH (USERS)
-- Quản lý thông tin đăng nhập, hồ sơ cá nhân và số dư Heo Đất của học sinh/giáo viên
-- ==============================================================================
CREATE TABLE users (
    -- Khóa chính: Mã định danh duy nhất của người dùng
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Số điện thoại Zalo của phụ huynh/học sinh dùng làm Tên đăng nhập chính (Duy nhất)
    phone_zalo VARCHAR(20) UNIQUE NOT NULL,
    
    -- Mã PIN
    pin_number VARCHAR(255) NOT NULL,
    
    -- Họ và tên đầy đủ của học sinh/giáo viên (Ví dụ: 'Nguyễn Gia Bảo', 'Cô Mai')
    full_name VARCHAR(100) NOT NULL,
    
    -- Khóa ngoại liên kết bảng classes: Xác định học sinh thuộc lớp học nào (Có thể NULL với Giáo viên, Admin hoặc Học sinh mới chưa phân lớp)
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    
    -- Đường dẫn ảnh đại diện avatar (Mặc định dùng ảnh đại diện chibi hoạt hình)
    avatar_url VARCHAR(500) DEFAULT '/avatar.jpg',
    
    -- Phân quyền tài khoản trong hệ thống: 'student' (học sinh), 'teacher' (giáo viên), 'admin' (quản trị)
    role VARCHAR(20) DEFAULT 'student',
    
    -- Số dư xu hiện tại trong Heo Đất (Hiển thị thời gian thực, không được âm)
    current_coins INTEGER DEFAULT 0 CHECK (current_coins >= 0),
    
    -- Tổng số xu học sinh đã từng tích lũy được (Dùng để tính cấp độ danh hiệu Heo Đất)
    total_earned_coins INTEGER DEFAULT 0 CHECK (total_earned_coins >= 0),
    
    -- Cờ kiểm tra: false = lần đầu đăng nhập (kích hoạt tour hướng dẫn), true = đã xem
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    
    -- Trạng thái hoạt động của tài khoản: true = hoạt động bình thường, false = bị khóa
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Số lần nhập sai mã PIN liên tiếp (Khi đạt 5 lần sai, hệ thống sẽ tự động khóa tài khoản)
    failed_login_attempts INTEGER DEFAULT 0 CHECK (failed_login_attempts >= 0),
    
    -- Thời điểm hết hạn khóa tài khoản (Khóa tạm thời, hoặc NULL nếu tài khoản bình thường / chờ giáo viên mở khóa)
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Thời điểm học sinh đăng ký tài khoản
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời điểm cập nhật thông tin hồ sơ gần nhất
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- RÀNG BUỘC KHÓA NGOẠI: XÁC ĐỊNH GIÁO VIÊN/ADMIN TẠO LỚP HỌC
-- (Được khai báo sau bảng users để tránh lỗi vòng lặp phụ thuộc Circular Dependency)
-- ==============================================================================
ALTER TABLE classes 
    ADD CONSTRAINT fk_classes_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ==============================================================================
-- 3. BẢNG HOẠT ĐỘNG & BÀI TẬP CỘNG XU (MISSIONS)
-- Lưu danh sách các hoạt động do giáo viên tự do thêm/sửa/xóa trên web
-- ==============================================================================
CREATE TABLE missions (
    -- Khóa chính: Mã định danh duy nhất của nhiệm vụ/hoạt động
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tiêu đề hoạt động (Ví dụ: 'Đọc 1 cuốn sách', 'Làm bài tập Tiếng Anh Unit 6')
    title VARCHAR(255) NOT NULL,
    
    -- Hướng dẫn chi tiết yêu cầu bài tập/hoạt động cô giáo giao
    description TEXT NOT NULL,

    -- Cơ chế bài tập & Hình thức minh chứng yêu cầu nộp (Khớp với màn hình cấu hình bài tập của cô giáo):
    -- 'platform_proof': 1. Minh chứng nền tảng khác (ảnh chụp bảng điểm Quizizz, Wordwall, Azota, Kahoot...)
    -- 'subjective_writing': 2. Đoạn văn / Tự luận (ảnh chụp vở viết tay, AI chấm ngữ pháp & cô giáo double-check)
    -- Mở rộng tương lai: 'audio_speaking' (ghi âm nói), 'video' (video thuyết trình), 'link' (link Canva/Docs)...
    submission_type VARCHAR(50) DEFAULT 'subjective_writing',
    
    -- Phương thức chấm điểm & duyệt xu:
    -- 'ai_assisted': AI tự động nhận diện và đề xuất số xu, cô giáo duyệt xác nhận cuối ngày
    -- 'teacher_manual': Giáo viên trực tiếp xem bài tự luận/sản phẩm và tự chấm cho xu
    -- 'auto_approved': Hệ thống tự động duyệt cộng xu ngay khi nộp đủ minh chứng
    grading_method VARCHAR(50) DEFAULT 'ai_assisted',

    -- Cờ yêu cầu giáo viên duyệt lại: true = chuyển hàng chờ duyệt, false = tự động duyệt
    require_teacher_review BOOLEAN DEFAULT TRUE,

    -- Mức xu tham khảo tối thiểu (Ví dụ: 20 xu khi làm chưa đúng hết hoặc mức sàn gợi ý cho giáo viên)
    min_reward_coins INTEGER DEFAULT 0 CHECK (min_reward_coins >= 0),
    
    -- Mức xu tham khảo tối đa (Ví dụ: 40 xu khi làm đúng 100% hoặc trần thưởng cho bài xuất sắc)
    max_reward_coins INTEGER NOT NULL CHECK (max_reward_coins >= min_reward_coins),
    
    -- Icon hiển thị: 'notebook' (vở bài tập), 'book-pen' (văn), 'flags-en-vi' (Anh-Việt)
    icon_type VARCHAR(50) DEFAULT 'notebook',
    
    -- Thời điểm bắt đầu giao/mở nhiệm vụ cho học sinh làm
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Hạn chót nộp bài (Sau thời điểm này bài nộp sẽ bị tính là Quá hạn / Nộp muộn)
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Phạm vi giao nhiệm vụ: true = áp dụng cho toàn trường; false = chỉ các lớp được chọn trong bảng mission_classes mới thấy
    is_all_classes BOOLEAN DEFAULT FALSE,
    
    -- Khóa ngoại: Người tạo ra nhiệm vụ này (Giáo viên hoặc Admin nào tạo)
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Trạng thái: true = đang mở cho học sinh làm, false = đóng/ẩn
    is_active BOOLEAN DEFAULT TRUE,
    
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
    
    -- Thời điểm phân công nhiệm vụ cho lớp này
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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
    
    -- Khóa ngoại: Thuộc nhiệm vụ nào trong bảng missions (có thể NULL nếu nộp tự do)
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    
    -- Khóa ngoại: Học sinh thực hiện nộp bài
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Danh sách URL hoặc dữ liệu minh chứng dạng JSONB linh hoạt (URL ảnh bài làm đã nén, file ghi âm, video, link bài làm...)
    proof_image_urls JSONB NOT NULL,
    
    -- Cờ AI nhận diện chữ viết: true = đọc được, false = chữ quá xấu/mờ không đọc được
    readable BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Lý do từ chối nếu chữ quá xấu hoặc ảnh mờ (Yêu cầu học sinh viết lại, không tính xu)
    unreadable_reason TEXT,
    
    -- Toàn bộ phản hồi JSON thô từ AI (Lưu cả kết quả trắc nghiệm correctCount/totalQuestions lẫn văn bản chép chữ, lỗi sai, điểm mạnh/yếu của bài tự luận)
    ai_raw_response JSONB,
    
    -- Số câu làm đúng nhận diện được từ ảnh trắc nghiệm (Ví dụ: 14)
    correct_count INTEGER,
    
    -- Tổng số câu hỏi trắc nghiệm của bài kiểm tra (Ví dụ: 14)
    total_questions INTEGER,
    
    -- Số xu AI đề xuất dựa trên quy tắc của nhiệm vụ (Lấy coins_perfect_score khi đúng hết, hoặc coins_partial_score khi đúng 1 phần)
    ai_suggested_coins INTEGER NOT NULL DEFAULT 0,
    
    -- Số xu thực tế được Giáo viên chốt cộng sau khi duyệt cuối ngày (Có thể theo AI hoặc tự cho xu cụ thể trong khoảng min_reward_coins ~ max_reward_coins)
    final_coins INTEGER DEFAULT 0,
    
    -- Lời phê, góp ý trực tiếp của Giáo viên gửi cho học sinh
    teacher_feedback TEXT,
    
    -- Trạng thái duyệt cuối ngày: 'pending_approval' (chờ cô duyệt), 'approved' (đã duyệt cộng xu), 'rejected' (từ chối)
    approval_status VARCHAR(20) DEFAULT 'pending_approval',
    
    -- Khóa ngoại: Giáo viên thực hiện duyệt bài tập cuối ngày
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thời điểm giáo viên bấm duyệt bài và chốt xu
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Thời điểm học sinh bấm nộp bài lên hệ thống
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. BẢNG CHI TIẾT LỖI SAI DO AI PHÁT HIỆN (AI_SUBMISSION_ERRORS)
-- Lưu chi tiết từng lỗi chính tả/ngữ pháp do AI bóc tách từ bài viết tay để giáo viên đối chiếu
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
    
    -- Phân loại lỗi: 'spelling' (chính tả), 'grammar' (ngữ pháp), 'vocab' (từ vựng), 'punctuation' (dấu câu)
    error_type VARCHAR(30) NOT NULL,
    
    -- Mức độ nghiêm trọng: 'minor' (lỗi nhẹ, trừ 0.5đ), 'major' (lỗi nặng sai cấu trúc, trừ 1.0đ)
    severity VARCHAR(20) NOT NULL,
    
    -- Lời giải thích ngắn gọn bằng tiếng Việt dễ hiểu cho học sinh tiểu học
    explanation TEXT,
    
    -- Thời điểm phát hiện lỗi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. BẢNG GIẢI THƯỞNG VÒNG QUAY MAY MẮN (WHEEL_PRIZES)
-- Định nghĩa 8 múi giải thưởng hiển thị trên vòng xoay 360 độ
-- ==============================================================================
CREATE TABLE wheel_prizes (
    -- Khóa chính: Mã giải thưởng (Ví dụ: 'p1', 'p2', 'p3'...)
    id VARCHAR(50) PRIMARY KEY,
    
    -- Nhãn đầy đủ hiển thị trong thông báo trúng thưởng (Ví dụ: '+100 Xu May Mắn')
    label VARCHAR(100) NOT NULL,
    
    -- Nhãn ngắn gọn hiển thị vừa vặn trên nan đĩa quay (Ví dụ: '+100 Xu')
    short_label VARCHAR(50) NOT NULL,
    
    -- Phân loại phần thưởng: 'coin' (cộng xu), 'multiplier' (nhân đôi), 'gift' (quà tặng), 'luck' (an ủi)
    prize_type VARCHAR(20) NOT NULL,
    
    -- Số lượng xu thưởng tương ứng (Ví dụ: 20, 50, 100, 200 xu)
    reward_coins INTEGER NOT NULL DEFAULT 0,
    
    -- Biểu tượng icon hiển thị trên nan quay: 'coins', 'gift', 'sparkles', 'star', 'smile', 'trophy'
    icon_name VARCHAR(50) NOT NULL,
    
    -- Trọng số xác suất trúng thưởng (Số càng lớn tỉ lệ rơi vào nan này càng cao)
    probability_weight INTEGER NOT NULL DEFAULT 10,
    
    -- Thứ tự vị trí nan quay trên đĩa từ 0 đến 7 (Mỗi nan chiếm 45 độ)
    slot_order INTEGER NOT NULL,
    
    -- Khóa ngoại: Người tạo/cấu hình giải thưởng này (Giáo viên hoặc Admin)
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Trạng thái: true = đang kích hoạt trên vòng quay, false = tạm ẩn
    is_active BOOLEAN DEFAULT TRUE
);

-- ==============================================================================
-- 8. BẢNG LỊCH SỬ QUAY THƯỞNG (WHEEL_SPINS)
-- Lưu vết từng lượt quay may mắn, đảm bảo tính bảo toàn xu và minh bạch
-- ==============================================================================
CREATE TABLE wheel_spins (
    -- Khóa chính: Mã định danh lượt quay
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Học sinh thực hiện lượt quay
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Khóa ngoại: Phần thưởng mà học sinh đã quay trúng
    prize_id VARCHAR(50) NOT NULL REFERENCES wheel_prizes(id) ON DELETE RESTRICT,
    
    -- Mức phí bị trừ cho lượt quay này (Mặc định: 500 xu; nếu không chơi thì bảo toàn xu)
    spin_cost INTEGER DEFAULT 500,
    
    -- Số lượng xu nhận được từ giải thưởng (Được cộng ngay vào Heo Đất)
    reward_coins INTEGER NOT NULL,
    
    -- Cờ kiểm tra: false = quay bằng 500 xu tích lũy, true = dùng lượt quay miễn phí
    is_free_spin BOOLEAN DEFAULT FALSE,
    
    -- Thời điểm học sinh thực hiện quay
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. BẢNG XẾP HẠNG THÁNG & WALL OF FAME (MONTHLY_LEADERBOARD)
-- Lưu trữ kết quả đua top cuối tháng, tính thưởng Top 3 Tổng Xu & Top 3 Nỗ Lực
-- ==============================================================================
CREATE TABLE monthly_leaderboard (
    -- Khóa chính: Mã định danh bản ghi xếp hạng
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tháng đánh giá tổng kết (Ví dụ: 10)
    month INTEGER NOT NULL,
    
    -- Năm đánh giá tổng kết (Ví dụ: 2026)
    year INTEGER NOT NULL,
    
    -- Khóa ngoại: Thuộc lớp học nào (Để xếp hạng Top 3 riêng cho từng lớp)
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Khóa ngoại: Học sinh được đánh giá xếp hạng
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tổng số xu học sinh kiếm được trong cả tháng đánh giá
    monthly_earned_coins INTEGER NOT NULL DEFAULT 0,
    
    -- Thứ hạng tổng xu trong lớp: 1 (Nhất), 2 (Nhì), 3 (Ba)...
    rank_coins INTEGER NOT NULL,
    
    -- Xu thưởng Top Tổng Xu mỗi lớp: Hạng 1 (+150 xu), Hạng 2 (+100 xu), Hạng 3 (+50 xu)
    bonus_rank_coins INTEGER DEFAULT 0,
    
    -- Tỷ lệ phần trăm tăng trưởng xu so với tháng trước (Ví dụ: +45.50%)
    growth_percent DECIMAL(5,2) DEFAULT 0.00,
    
    -- Thứ hạng nỗ lực/tiến bộ nhất trong lớp
    rank_progress INTEGER,
    
    -- Xu thưởng nỗ lực: Tăng >30% (+100 xu), Tăng >50% (+200 xu), Tăng >70% (+300 xu)
    bonus_progress_coins INTEGER DEFAULT 0,
    
    -- Cờ đánh dấu: true = hệ thống đã tự động cộng xu thưởng vào Heo Đất cuối tháng
    is_rewarded BOOLEAN DEFAULT FALSE,
    
    -- Thời điểm chốt sổ tháng (23:59 ngày cuối cùng của tháng)
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 10. BẢNG YÊU CẦU QUY ĐỔI XU CUỐI THÁNG (MONTHLY_EXCHANGE_REQUESTS)
-- Lưu lựa chọn của học sinh khi đạt từ 5.000 xu: Nhận tiền mặt / Shopee / Tiết kiệm tiếp
-- ==============================================================================
CREATE TABLE monthly_exchange_requests (
    -- Khóa chính: Mã định danh yêu cầu đổi xu
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Kỳ tháng tổng kết (Ví dụ: '2026-10')
    month_cycle VARCHAR(10) NOT NULL,
    
    -- Khóa ngoại: Học sinh gửi yêu cầu đổi xu
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Lựa chọn của học sinh: 'cash' (tiền mặt), 'shopee' (quà Shopee), 'save_piggy' (bỏ heo dồn tháng sau)
    choice_type VARCHAR(20) NOT NULL,
    
    -- Số lượng xu học sinh chọn đổi (Bắt buộc là bội số của 5.000 xu: 5.000, 10.000...)
    coins_to_exchange INTEGER DEFAULT 0,
    
    -- Số tiền mặt VNĐ tương ứng nhận được (Cứ mỗi 5.000 xu = 25.000 VNĐ)
    amount_vnd INTEGER DEFAULT 0,
    
    -- Link sản phẩm Shopee do học sinh dán vào (Nếu chọn phương án Quà Shopee)
    shopee_product_url TEXT,
    
    -- Ghi chú chi tiết cho cô giáo khi mua quà (Màu sắc, kích cỡ, phân loại)
    shopee_note TEXT,
    
    -- Trạng thái xử lý: 'pending' (chờ cô trao), 'fulfilled' (cô đã trao quà/tiền), 'cancelled' (hủy)
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Khóa ngoại: Giáo viên xác nhận trao tiền/quà cho bé
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thời điểm cô giáo hoàn thành trao tiền/quà
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Thời điểm học sinh gửi lựa chọn
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. BẢNG BÁO CÁO EXCEL GỬI GIÁO VIÊN (MONTHLY_CLASS_REPORTS)
-- Lưu trữ lịch sử tự động tạo file Excel tổng hợp từng lớp và gửi thẳng Email cô giáo
-- ==============================================================================
CREATE TABLE monthly_class_reports (
    -- Khóa chính: Mã báo cáo
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Lớp học được báo cáo
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Khóa ngoại: Giáo viên chủ nhiệm nhận báo cáo
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Kỳ tháng báo cáo (Ví dụ: '2026-10')
    month_cycle VARCHAR(10) NOT NULL,
    
    -- Đường dẫn tải file Excel (.xlsx) tổng hợp chi tiết toàn bộ học sinh trong lớp
    excel_file_url TEXT NOT NULL,
    
    -- Địa chỉ Email của Giáo viên nhận file báo cáo tự động
    sent_to_email VARCHAR(100) NOT NULL,
    
    -- Trạng thái gửi mail: 'sent' (đã gửi thành công), 'failed' (lỗi gửi mail)
    email_sent_status VARCHAR(20) DEFAULT 'sent',
    
    -- Thời điểm hệ thống tự động xuất file và gửi đi
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 12. BẢNG SỔ CÁI GIAO DỊCH VÍ XU (COIN_TRANSACTIONS)
-- Bảng nhật ký tài chính bất biến: Ghi nhận mọi biến động cộng/trừ xu trong hệ thống
-- ==============================================================================
CREATE TABLE coin_transactions (
    -- Khóa chính: Mã định danh duy nhất của từng giao dịch
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Tài khoản học sinh có số dư biến động
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Số lượng xu biến động: Dương (+) là cộng xu, Âm (-) là trừ xu
    amount INTEGER NOT NULL,
    
    -- Số dư xu trong Heo Đất ngay trước khi thực hiện giao dịch này
    balance_before INTEGER NOT NULL,
    
    -- Số dư xu trong Heo Đất ngay sau khi thực hiện giao dịch này (Bảo đảm tính toàn vẹn)
    balance_after INTEGER NOT NULL,
    
    -- Loại giao dịch: 'MISSION_REWARD', 'WHEEL_SPIN_FEE', 'EXCHANGE_CASH', 'TOP_RANK_BONUS'...
    tx_type VARCHAR(30) NOT NULL,
    
    -- Mã khóa ngoại tham chiếu liên kết (Ví dụ: ID của bài nộp, ID lượt quay, ID yêu cầu đổi quà)
    reference_id VARCHAR(100),
    
    -- Lời diễn giải chi tiết bằng tiếng Việt để phụ huynh và học sinh đọc hiểu trên sổ giao dịch
    description VARCHAR(255) NOT NULL,
    
    -- Thời điểm phát sinh giao dịch ví
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 13. BẢNG CẤU HÌNH HỆ THỐNG AI (AI_SYSTEM_CONFIGS)
-- Cấu hình Gateway kết nối AI Vision (GPT-4o, Gemini 1.5/2.0 Flash) chấm bài tự động
-- ==============================================================================
CREATE TABLE ai_system_configs (
    -- Khóa chính cấu hình
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Đường dẫn Endpoint API AI (Ví dụ: 'https://api.oxionai.com/v1' hoặc OpenAI endpoint)
    api_url VARCHAR(255) NOT NULL,
    
    -- Khóa bảo mật API Key để gọi dịch vụ AI Vision
    api_key VARCHAR(255) NOT NULL,
    
    -- Tên Model Vision được chỉ định (Mặc định: 'gpt-4o' hoặc 'gemini-1.5-flash')
    model_name VARCHAR(100) NOT NULL DEFAULT 'gpt-4o',
    
    -- Chế độ suy luận AI: 'off' (siêu tốc 3-6s), 'low', 'high' (tối ưu tránh bị treo khi chấm bài)
    thinking_mode VARCHAR(20) DEFAULT 'off',
    
    -- Khóa ngoại: Giáo viên hoặc Admin tạo/cập nhật cấu hình AI này
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Cờ kích hoạt cấu hình này
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Thời điểm cập nhật cấu hình lần cuối
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 14. BẢNG MẪU PROMPT CHẤM BÀI AI (AI_PROMPT_TEMPLATES)
-- Quản lý các bộ Prompt AI chuyên biệt theo cơ chế nộp bài (Trắc nghiệm, Viết tay, Ghi âm...)
-- Cho phép mở rộng thêm cơ chế chấm bài mới linh hoạt mà không cần can thiệp sửa code backend
-- ==============================================================================
CREATE TABLE ai_prompt_templates (
    -- Khóa chính: Mã định danh duy nhất của mẫu prompt
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Mã định danh cơ chế chấm (Khớp với submission_type của nhiệm vụ):
    -- 'platform_proof' (đọc điểm trắc nghiệm Quizizz/Wordwall), 'subjective_writing' (chấm chữ viết tay tự luận)
    prompt_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Tên hiển thị dễ nhớ của mẫu Prompt (Ví dụ: 'Chấm minh chứng trắc nghiệm', 'Chấm đoạn văn tiếng Anh viết tay')
    template_name VARCHAR(100) NOT NULL,
    
    -- Nội dung System Prompt chuẩn mực hướng dẫn AI Vision phân tích và trả về đúng khuôn mẫu JSON
    system_prompt TEXT NOT NULL,
    
    -- Mô tả mục đích sử dụng và các lưu ý của mẫu prompt này
    description TEXT,
    
    -- Cờ trạng thái: true = đang kích hoạt sử dụng, false = tạm ngưng
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Khóa ngoại: Giáo viên hoặc Admin tạo/cập nhật mẫu prompt này
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thời điểm tạo mẫu prompt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời điểm cập nhật mẫu prompt lần cuối
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 15. BẢNG NHẬT KÝ ĐĂNG NHẬP / XÁC THỰC (AUTH_LOGS)
-- Lưu trữ chi tiết toàn bộ lịch sử đăng nhập, đăng xuất của học sinh & giáo viên
-- ==============================================================================
CREATE TABLE auth_logs (
    -- Khóa chính: Mã định danh bản ghi nhật ký đăng nhập
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Tài khoản người dùng đăng nhập (NULL nếu tài khoản không tồn tại)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Số điện thoại Zalo được sử dụng trong phiên đăng nhập
    phone_zalo VARCHAR(20) NOT NULL,
    
    -- Vai trò người dùng tại thời điểm đăng nhập: 'student', 'teacher', 'admin', 'unknown'
    role VARCHAR(20) DEFAULT 'student',
    
    -- Hành động xác thực: 'LOGIN', 'LOGOUT', 'TOKEN_REFRESH'
    auth_action VARCHAR(30) DEFAULT 'LOGIN',
    
    -- Trạng thái đăng nhập: 'SUCCESS' (thành công), 'FAILED' (thất bại)
    status VARCHAR(20) NOT NULL,
    
    -- Lý do thất bại (nếu status = 'FAILED'): 'WRONG_PASSWORD', 'ACCOUNT_LOCKED', 'USER_NOT_FOUND'
    failure_reason VARCHAR(255),
    
    -- Địa chỉ IP của thiết bị đăng nhập (Hỗ trợ cả định dạng IPv4 và IPv6)
    ip_address VARCHAR(45) NOT NULL,
    
    -- Thông tin User-Agent chi tiết của trình duyệt (Chrome, Safari, Zalo In-App Browser...)
    user_agent TEXT,
    
    -- Thiết bị nhận diện: 'mobile' (điện thoại), 'tablet' (iPad), 'desktop' (máy tính)
    device_type VARCHAR(20) DEFAULT 'mobile',
    
    -- Thời điểm phát sinh sự kiện xác thực
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 16. BẢNG NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT_LOGS)
-- Lưu vết 100% mọi hành vi thêm, sửa, xóa, duyệt bài, đổi xu của Học sinh & Giáo viên
-- ==============================================================================
CREATE TABLE audit_logs (
    -- Khóa chính: Mã định danh bản ghi audit log
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Người thực hiện thao tác (Học sinh, Giáo viên hoặc Quản trị viên)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Vai trò của người thực hiện tại thời điểm thao tác: 'student', 'teacher', 'admin', 'system'
    role VARCHAR(20) NOT NULL,
    
    -- Mã hành vi chuẩn hóa (Action code):
    -- Giáo viên: 'CREATE_CLASS', 'CREATE_MISSION', 'UPDATE_MISSION', 'DELETE_MISSION', 'DAILY_APPROVE_HOMEWORK', 'REJECT_HOMEWORK', 'MANUAL_COIN_ADJUST', 'EXPORT_EXCEL_REPORT', 'FULFILL_REWARD'
    -- Học sinh: 'SUBMIT_HOMEWORK', 'SPIN_WHEEL', 'REQUEST_CASH_EXCHANGE', 'REQUEST_SHOPEE_EXCHANGE', 'COMPLETE_ONBOARDING', 'UPDATE_PROFILE'
    action VARCHAR(60) NOT NULL,
    
    -- Thực thể/Bảng CSDL bị tác động: 'classes', 'missions', 'homework_submissions', 'reward_requests', 'users', 'wheel_spins'...
    entity_type VARCHAR(50) NOT NULL,
    
    -- ID của bản ghi dữ liệu bị tác động (Ví dụ: ID lớp, ID bài nộp, ID nhiệm vụ, ID học sinh...)
    entity_id VARCHAR(100),
    
    -- Dữ liệu cũ trước khi bị thay đổi (Dạng JSONB để dễ đối soát khi giáo viên sửa nhầm)
    old_values JSONB,
    
    -- Dữ liệu mới sau khi được thay đổi (Dạng JSONB)
    new_values JSONB,
    
    -- Diễn giải chi tiết bằng tiếng Việt đọc hiểu ngay (Ví dụ: 'Cô Mai đã tạo lớp học 5A', 'Cô Mai đã duyệt bài tập cho Gia Bảo (+40 xu)')
    description VARCHAR(500) NOT NULL,
    
    -- Địa chỉ IP của người thao tác
    ip_address VARCHAR(45),
    
    -- Thông tin trình duyệt/thiết bị
    user_agent TEXT,
    
    -- Thời điểm phát sinh thao tác (Không thể sửa hay xóa)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 17. BẢNG THÔNG BÁO HỆ THỐNG (NOTIFICATIONS)
-- Gửi thông báo đến Học sinh (duyệt bài, nhận xu, trúng vòng quay, đổi quà)
-- và Giáo viên (nhắc nhở duyệt bài cuối ngày, yêu cầu đổi xu mới...)
-- ==============================================================================
CREATE TABLE notifications (
    -- Khóa chính: Mã định danh duy nhất của thông báo dạng UUID tự sinh
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại: Người nhận thông báo (Học sinh hoặc Giáo viên trong hệ thống)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tiêu đề ngắn gọn hiển thị trên thông báo (Ví dụ: 'Bài tập đã được duyệt! (+40 xu)')
    title VARCHAR(255) NOT NULL,
    
    -- Nội dung chi tiết thông báo gửi tới người dùng
    content TEXT NOT NULL,
    
    -- Phân loại thông báo để lọc và hiển thị màu sắc giao diện:
    -- 'homework_approved' (duyệt cộng xu), 'homework_rejected' (từ chối/yêu cầu viết lại)
    -- 'daily_review_reminder' (nhắc cô duyệt bài cuối ngày), 'wheel_reward' (trúng thưởng vòng quay)
    -- 'exchange_fulfilled' (cô đã trao quà/tiền mặt), 'monthly_rank' (vinh danh Wall of Fame)
    -- 'security_alert' (cảnh báo nhập sai PIN/khóa tài khoản), 'system_broadcast' (thông báo chung)
    type VARCHAR(50) NOT NULL,
    
    -- Tên biểu tượng hiển thị trên UI: 'coins', 'check-circle', 'bell', 'gift', 'award', 'alert-triangle'
    icon_type VARCHAR(50) DEFAULT 'bell',
    
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- CÁC CHỈ MỤC TỐI ƯU HIỆU NĂNG TÌM KIẾM (INDEXES)
-- ==============================================================================
CREATE INDEX idx_classes_created_by ON classes(created_by);
CREATE INDEX idx_missions_created_by ON missions(created_by);
CREATE INDEX idx_mission_classes_class ON mission_classes(class_id);
CREATE INDEX idx_mission_classes_mission ON mission_classes(mission_id);
CREATE INDEX idx_users_phone ON users(phone_zalo);
CREATE INDEX idx_users_class ON users(class_id);
CREATE INDEX idx_submissions_student ON homework_submissions(student_id);
CREATE INDEX idx_submissions_status ON homework_submissions(approval_status);
CREATE INDEX idx_coin_tx_user ON coin_transactions(user_id);
CREATE INDEX idx_coin_tx_created ON coin_transactions(created_at);
CREATE INDEX idx_auth_logs_user ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_created ON auth_logs(created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_prompt_templates_code ON ai_prompt_templates(prompt_code);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
