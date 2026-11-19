import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { supabase } from "@/lib/supabase/db";
import { UserRole } from "@/constants/auth";
import { ExchangeRequestStatus } from "@/constants/rewards";
import { SubmissionApprovalStatus } from "@/constants/missions";

/**
 * GET /api/teacher/sidebar-badges
 * API chuyên trách đếm số lượng thông báo / badge hiển thị trên Sidebar của Giáo viên & Quản trị viên
 * - Đếm số yêu cầu đổi quà đang chờ duyệt (`monthly_exchange_requests.status = 'pending'`)
 * - Đếm số bài tập nộp đang chờ chấm (`homework_submissions.approval_status = 'pending_approval'`)
 * - Sử dụng count: 'exact' kèm head: true của Supabase để đạt hiệu năng tối đa (0 byte payload dữ liệu)
 * - Tự động phân quyền: Admin/Super Teacher thấy toàn trường, Giáo viên thường chỉ thấy học sinh lớp phụ trách
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập dữ liệu quản trị."
    );
    if (!auth.success) {
      return auth.response;
    }

    const { session } = auth;
    const isTeacher = session.role === UserRole.TEACHER;

    const { searchParams } = new URL(req.url);
    const requestedClassId = searchParams.get("classId");
    const hasSpecificClass = Boolean(
      requestedClassId &&
        requestedClassId !== "all" &&
        requestedClassId !== "null" &&
        requestedClassId !== "undefined"
    );

    let pendingRewards = 0;
    let pendingSubmissions = 0;

    if (!isTeacher) {
      // 1. Quản trị viên & Giáo viên trưởng
      if (hasSpecificClass) {
        // Lọc theo lớp cụ thể được chọn trên Header
        const { data: students, error: studentError } = await supabase
          .from("users")
          .select("id")
          .eq("class_id", requestedClassId!);

        if (studentError) {
          console.error("Lỗi lấy danh sách học sinh theo lớp:", studentError.message);
          return apiSuccess({ pendingRewards: 0, pendingSubmissions: 0 });
        }

        const studentIds = students?.map((s) => s.id) ?? [];
        if (studentIds.length === 0) {
          return apiSuccess({ pendingRewards: 0, pendingSubmissions: 0 });
        }

        const [rewardsRes, submissionsRes] = await Promise.all([
          supabase
            .from("monthly_exchange_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", ExchangeRequestStatus.PENDING)
            .in("student_id", studentIds),
          supabase
            .from("homework_submissions")
            .select("id", { count: "exact", head: true })
            .eq("approval_status", SubmissionApprovalStatus.PENDING_APPROVAL)
            .in("student_id", studentIds),
        ]);

        pendingRewards = rewardsRes.count ?? 0;
        pendingSubmissions = submissionsRes.count ?? 0;
      } else {
        // Đếm số lượng toàn trường nếu không chỉ định lớp
        const [rewardsRes, submissionsRes] = await Promise.all([
          supabase
            .from("monthly_exchange_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", ExchangeRequestStatus.PENDING),
          supabase
            .from("homework_submissions")
            .select("id", { count: "exact", head: true })
            .eq("approval_status", SubmissionApprovalStatus.PENDING_APPROVAL),
        ]);

        pendingRewards = rewardsRes.count ?? 0;
        pendingSubmissions = submissionsRes.count ?? 0;
      }
    } else {
      // 2. Giáo viên thường: Chỉ đếm các học sinh thuộc lớp phụ trách
      const { data: teacherClasses, error: tcError } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", session.userId);

      if (tcError) {
        console.error("Lỗi lấy danh sách lớp giáo viên:", tcError.message);
        return apiSuccess({ pendingRewards: 0, pendingSubmissions: 0 });
      }

      const assignedClassIds = teacherClasses?.map((tc) => tc.class_id) ?? [];
      if (assignedClassIds.length === 0) {
        return apiSuccess({ pendingRewards: 0, pendingSubmissions: 0 });
      }

      let targetClassIds = assignedClassIds;
      if (hasSpecificClass) {
        // Kiểm tra bảo mật: Giáo viên chỉ được xem lớp được phân công
        if (!assignedClassIds.includes(requestedClassId!)) {
          return apiSuccess({ pendingRewards: 0, pendingSubmissions: 0 });
        }
        targetClassIds = [requestedClassId!];
      }

      // Lấy danh sách ID học sinh thuộc các lớp hợp lệ
      const { data: students, error: studentError } = await supabase
        .from("users")
        .select("id")
        .in("class_id", targetClassIds);

      if (studentError) {
        console.error("Lỗi lấy danh sách học sinh theo lớp:", studentError.message);
        return apiSuccess({ pendingRewards: 0, pendingSubmissions: 0 });
      }

      const studentIds = students?.map((s) => s.id) ?? [];
      if (studentIds.length === 0) {
        return apiSuccess({ pendingRewards: 0, pendingSubmissions: 0 });
      }

      // Đếm song song siêu tốc qua Supabase PostgREST
      const [rewardsRes, submissionsRes] = await Promise.all([
        supabase
          .from("monthly_exchange_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", ExchangeRequestStatus.PENDING)
          .in("student_id", studentIds),
        supabase
          .from("homework_submissions")
          .select("id", { count: "exact", head: true })
          .eq("approval_status", SubmissionApprovalStatus.PENDING_APPROVAL)
          .in("student_id", studentIds),
      ]);

      pendingRewards = rewardsRes.count ?? 0;
      pendingSubmissions = submissionsRes.count ?? 0;
    }

    return apiSuccess({
      pendingRewards,
      pendingSubmissions,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi máy chủ tại GET /api/teacher/sidebar-badges:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải số lượng badges.");
  }
}
