import { supabase } from "@/lib/supabase/db";
import { AuthTokenPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/constants/auth";
import { TeacherRosterStudent } from "../types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export interface GetStudentRosterOptions {
  classId?: string;
  search?: string;
}

/**
 * Service lấy danh sách học sinh theo lớp học trực tiếp trên máy chủ (Server Component / Route Handler)
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 * - Tổng hợp thống kê tiến độ bài tập và lịch sử đổi quà bằng batch queries không có N+1 query
 */
export async function getTeacherStudentRosterServer(
  session: AuthTokenPayload,
  options?: GetStudentRosterOptions
): Promise<TeacherRosterStudent[]> {
  try {
    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return [];
    }

    const targetClassId = options?.classId;
    if (!targetClassId || targetClassId === "all") {
      // Nếu không chọn lớp cụ thể, có thể lấy theo lớp được phân công đầu tiên hoặc trả về rỗng nếu chưa có lớp
      return [];
    }

    // 1. Lấy thông tin lớp học
    const { data: classData } = await supabase
      .from("classes")
      .select("id, class_name")
      .eq("id", targetClassId)
      .maybeSingle();

    const className = classData?.class_name || "Lớp học";

    // 2. Truy vấn danh sách học sinh trong bảng users thuộc lớp
    let query = supabase
      .from("users")
      .select(`
        id,
        full_name,
        phone_zalo,
        avatar_url,
        class_id,
        current_coins,
        total_earned_coins,
        is_active,
        is_deleted,
        failed_login_attempts,
        locked_until,
        last_login_at,
        created_at
      `)
      .eq("role", UserRole.STUDENT)
      .eq("is_deleted", false)
      .eq("class_id", targetClassId)
      .order("current_coins", { ascending: false });

    if (options?.search && options.search.trim()) {
      const q = options.search.trim();
      query = query.or(`full_name.ilike.%${q}%,phone_zalo.ilike.%${q}%`);
    }

    const { data: studentsData, error: studentsError } = await query;

    if (studentsError || !studentsData || studentsData.length === 0) {
      if (studentsError) {
        console.error("Lỗi khi tải danh sách học sinh theo lớp:", studentsError.message);
      }
      return [];
    }

    const studentIds = studentsData.map((s) => s.id);

    // 3. Batch query: Lấy thống kê bài tập từ student_missions
    const { data: missionsAggData, error: missionsError } = await supabase
      .from("student_missions")
      .select("student_id, status")
      .in("student_id", studentIds);

    if (missionsError) {
      console.error("Lỗi khi tải thống kê student_missions:", missionsError.message);
    }

    // Map thống kê bài tập theo student_id
    const missionStatsMap = new Map<
      string,
      { total: number; approved: number; submitted: number; exempt: number }
    >();

    for (const sm of missionsAggData || []) {
      const sid = sm.student_id;
      if (!missionStatsMap.has(sid)) {
        missionStatsMap.set(sid, { total: 0, approved: 0, submitted: 0, exempt: 0 });
      }
      const st = missionStatsMap.get(sid)!;
      st.total++;
      if (sm.status === "approved") {
        st.approved++;
      } else if (sm.status === "submitted") {
        st.submitted++;
      } else if (sm.status === "exempt") {
        st.exempt++;
      }
    }

    // 4. Batch query: Lấy số lượng quà đổi thành công từ monthly_exchange_requests
    const { data: exchangeAggData, error: exchangeError } = await supabase
      .from("monthly_exchange_requests")
      .select("student_id, status")
      .in("student_id", studentIds)
      .in("status", ["completed", "approved"]);

    if (exchangeError) {
      console.error("Lỗi khi tải thống kê monthly_exchange_requests:", exchangeError.message);
    }

    const redeemedCountsMap = new Map<string, number>();
    for (const req of exchangeAggData || []) {
      const sid = req.student_id;
      redeemedCountsMap.set(sid, (redeemedCountsMap.get(sid) || 0) + 1);
    }

    // 5. Chuẩn hóa sang TeacherRosterStudent[]
    const now = new Date();

    return studentsData.map((s) => {
      const mStats = missionStatsMap.get(s.id) || {
        total: 0,
        approved: 0,
        submitted: 0,
        exempt: 0,
      };
      const redeemedCount = redeemedCountsMap.get(s.id) || 0;

      // Xác định trạng thái mã PIN
      let pinStatus: "ok" | "locked" | "failed_attempts" = "ok";
      if (s.locked_until && new Date(s.locked_until) > now) {
        pinStatus = "locked";
      } else if ((s.failed_login_attempts ?? 0) >= 5) {
        pinStatus = "locked";
      } else if ((s.failed_login_attempts ?? 0) > 0) {
        pinStatus = "failed_attempts";
      }

      // Format last_login_at thân thiện
      let lastLoginText = "Chưa đăng nhập";
      if (s.last_login_at) {
        try {
          lastLoginText = formatDistanceToNow(new Date(s.last_login_at), {
            addSuffix: true,
            locale: vi,
          });
        } catch {
          lastLoginText = s.last_login_at;
        }
      }

      return {
        id: s.id,
        full_name: s.full_name,
        avatar_url: s.avatar_url || "/avatar-chibi/male-1.webp",
        phone_zalo: s.phone_zalo || "",
        class_id: s.class_id || targetClassId,
        class_name: className,
        current_coins: s.current_coins ?? 0,
        total_earned_coins: s.total_earned_coins ?? s.current_coins ?? 0,
        redeemed_rewards_count: redeemedCount,
        completed_missions_count: mStats.approved,
        total_missions_count: mStats.total,
        pending_missions_count: mStats.submitted,
        exempt_missions_count: mStats.exempt,
        last_login_at: lastLoginText,
        pin_status: pinStatus,
        failed_login_attempts: s.failed_login_attempts ?? 0,
        locked_until: s.locked_until ?? null,
        is_active: s.is_active ?? true,
        is_deleted: s.is_deleted ?? false,
      };
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại getTeacherStudentRosterServer:", error.message);
    return [];
  }
}
