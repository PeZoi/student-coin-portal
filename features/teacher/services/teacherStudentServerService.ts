import { supabase } from "@/lib/supabase/db";
import { getAuthSession, AuthTokenPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/constants";
import { StudentItem } from "../components/students/types";
import { format } from "date-fns";

/**
 * Service tải danh sách học sinh trực tiếp trên máy chủ (Server Component / Route Handler)
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 * - Bảo mật: chỉ cho phép TEACHER, SUPER_TEACHER và ADMIN truy xuất dữ liệu
 * - Phân quyền xem thùng rác: Chỉ duy nhất Admin tối cao mới thấy học sinh đã xóa
 */
export async function getManageStudentsServer(
  customSession?: AuthTokenPayload | null
): Promise<StudentItem[]> {
  try {
    const session =
      customSession !== undefined ? customSession : await getAuthSession();

    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return [];
    }

    const isAdmin = session.role === UserRole.ADMIN;

    // 1. Truy vấn danh sách học sinh trong bảng users
    let studentsQuery = supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        phone_zalo,
        avatar_url,
        class_id,
        current_coins,
        total_earned_coins,
        free_spins,
        is_active,
        is_deleted,
        failed_login_attempts,
        locked_until,
        created_at
      `
      )
      .eq("role", UserRole.STUDENT)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false });

    // Chỉ Admin mới có quyền xem học sinh trong thùng rác
    if (!isAdmin) {
      studentsQuery = studentsQuery.eq("is_deleted", false);
    }

    const { data: studentsData, error: studentsError } = await studentsQuery;

    if (studentsError || !studentsData) {
      console.error(
        "Lỗi khi tải danh sách học sinh trên server:",
        studentsError?.message
      );
      return [];
    }

    // 2. Lấy tên lớp học và nhật ký đăng nhập gần nhất song song
    const [classesRes, authLogsRes] = await Promise.all([
      supabase.from("classes").select("id, class_name"),
      supabase
        .from("auth_logs")
        .select("user_id, created_at")
        .eq("status", "SUCCESS")
        .eq("auth_action", "LOGIN")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

    const classNameMap = new Map<string, string>();
    if (classesRes.data) {
      for (const cls of classesRes.data) {
        classNameMap.set(cls.id, cls.class_name);
      }
    }

    const lastLoginMap = new Map<string, string>();
    if (authLogsRes.data) {
      for (const log of authLogsRes.data) {
        if (!lastLoginMap.has(log.user_id)) {
          try {
            lastLoginMap.set(
              log.user_id,
              format(new Date(log.created_at), "HH:mm dd/MM/yyyy")
            );
          } catch {
            lastLoginMap.set(log.user_id, log.created_at);
          }
        }
      }
    }

    // 3. Chuẩn hóa dữ liệu sang StudentItem
    const now = new Date();

    return studentsData.map((s) => {
      let lockRemainingText: string | null = null;
      if (s.locked_until) {
        const lockTarget = new Date(s.locked_until);
        if (lockTarget > now) {
          const diffMinutes = Math.ceil(
            (lockTarget.getTime() - now.getTime()) / 60000
          );
          if (diffMinutes <= 1) {
            lockRemainingText = "còn < 1 phút";
          } else if (diffMinutes < 60) {
            lockRemainingText = `còn ${diffMinutes} phút`;
          } else {
            const hours = Math.floor(diffMinutes / 60);
            const mins = diffMinutes % 60;
            lockRemainingText =
              mins > 0 ? `còn ${hours}h ${mins}p` : `còn ${hours} giờ`;
          }
        }
      }

      return {
        id: s.id,
        full_name: s.full_name,
        phone_zalo: s.phone_zalo || "",
        avatar_url: s.avatar_url || null,
        class_id: s.class_id,
        class_name: s.class_id
          ? classNameMap.get(s.class_id) || "Chưa phân lớp"
          : "Chưa phân lớp",
        current_coins: s.current_coins ?? 0,
        total_earned_coins: s.total_earned_coins ?? s.current_coins ?? 0,
        free_spins: s.free_spins ?? 0,
        is_active: s.is_active ?? true,
        is_deleted: s.is_deleted ?? false,
        failed_login_attempts: s.failed_login_attempts ?? 0,
        locked_until: s.locked_until ?? null,
        lock_remaining_text: lockRemainingText,
        last_login_at: lastLoginMap.get(s.id) || null,
        created_at: s.created_at
          ? format(new Date(s.created_at), "dd/MM/yyyy")
          : "",
      };
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại getManageStudentsServer:", error.message);
    return [];
  }
}
