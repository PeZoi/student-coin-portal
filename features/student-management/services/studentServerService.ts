import { supabase } from "@/lib/supabase/db";
import { getAuthSession, AuthTokenPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/constants";
import { StudentItem } from "@/features/student-management/types";
import { format } from "date-fns";

export interface GetManageStudentsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  classId?: string;
}

export interface PaginatedStudentsResult {
  data: StudentItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Service tải danh sách học sinh trực tiếp trên máy chủ (Server Component / Route Handler)
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 * - Bảo mật: chỉ cho phép TEACHER, SUPER_TEACHER và ADMIN truy xuất dữ liệu
 * - Phân quyền xem thùng rác: Chỉ duy nhất Admin tối cao mới thấy học sinh đã xóa
 * - Hỗ trợ cả Full-list và Server-side Pagination
 */
export async function getManageStudentsServer(
  customSession?: AuthTokenPayload | null,
  options?: GetManageStudentsOptions
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

    // 1. Truy vấn danh sách học sinh trong bảng users (tận dụng index idx_users_role_deleted)
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
        last_login_at,
        created_at
      `
      )
      .eq("role", UserRole.STUDENT)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false });

    // Lọc theo trạng thái xóa
    if (options?.status === "deleted" && isAdmin) {
      studentsQuery = studentsQuery.eq("is_deleted", true);
    } else if (!isAdmin) {
      studentsQuery = studentsQuery.eq("is_deleted", false);
    }

    // Lọc theo lớp học
    if (options?.classId && options.classId !== "all") {
      if (options.classId === "unassigned") {
        studentsQuery = studentsQuery.is("class_id", null);
      } else {
        studentsQuery = studentsQuery.eq("class_id", options.classId);
      }
    }

    // Lọc theo trạng thái hoạt động / khóa PIN
    if (options?.status && options.status !== "all" && options.status !== "deleted") {
      if (options.status === "active") {
        studentsQuery = studentsQuery.eq("is_active", true);
      } else if (options.status === "inactive") {
        studentsQuery = studentsQuery.eq("is_active", false);
      } else if (options.status === "locked") {
        studentsQuery = studentsQuery.gt("locked_until", new Date().toISOString());
      }
    }

    // Tìm kiếm nhanh theo tên hoặc số điện thoại
    if (options?.search && options.search.trim()) {
      const q = options.search.trim();
      studentsQuery = studentsQuery.or(
        `full_name.ilike.%${q}%,phone_zalo.ilike.%${q}%`
      );
    }

    // Phân trang ở cấp cơ sở dữ liệu nếu có truyền page & limit
    if (options?.page && options?.limit) {
      const page = Math.max(1, options.page);
      const limit = Math.max(1, Math.min(100, options.limit));
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      studentsQuery = studentsQuery.range(from, to);
    }

    const { data: studentsData, error: studentsError } = await studentsQuery;

    if (studentsError || !studentsData) {
      console.error(
        "Lỗi khi tải danh sách học sinh trên server:",
        studentsError?.message
      );
      return [];
    }

    // 2. Lấy tên lớp học (không cần query bảng auth_logs nhờ tối ưu cột last_login_at trực tiếp trên users)
    const { data: classesData } = await supabase
      .from("classes")
      .select("id, class_name");

    const classNameMap = new Map<string, string>();
    if (classesData) {
      for (const cls of classesData) {
        classNameMap.set(cls.id, cls.class_name);
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
        last_login_at: s.last_login_at
          ? format(new Date(s.last_login_at), "HH:mm dd/MM/yyyy")
          : null,
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

/**
 * Service tải danh sách học sinh có phân trang và đếm tổng số (Server-side Pagination - Điểm tối ưu 1)
 */
export async function getPaginatedManageStudentsServer(
  customSession?: AuthTokenPayload | null,
  options?: GetManageStudentsOptions
): Promise<PaginatedStudentsResult> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, options?.limit ?? 10));

  try {
    const session =
      customSession !== undefined ? customSession : await getAuthSession();

    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const isAdmin = session.role === UserRole.ADMIN;

    let countQuery = supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", UserRole.STUDENT);

    if (options?.status === "deleted" && isAdmin) {
      countQuery = countQuery.eq("is_deleted", true);
    } else if (!isAdmin) {
      countQuery = countQuery.eq("is_deleted", false);
    }

    if (options?.classId && options.classId !== "all") {
      if (options.classId === "unassigned") {
        countQuery = countQuery.is("class_id", null);
      } else {
        countQuery = countQuery.eq("class_id", options.classId);
      }
    }

    if (options?.status && options.status !== "all" && options.status !== "deleted") {
      if (options.status === "active") {
        countQuery = countQuery.eq("is_active", true);
      } else if (options.status === "inactive") {
        countQuery = countQuery.eq("is_active", false);
      } else if (options.status === "locked") {
        countQuery = countQuery.gt("locked_until", new Date().toISOString());
      }
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim();
      countQuery = countQuery.or(`full_name.ilike.%${q}%,phone_zalo.ilike.%${q}%`);
    }

    const [{ count }, studentsData] = await Promise.all([
      countQuery,
      getManageStudentsServer(session, { ...options, page, limit: pageSize }),
    ]);

    const total = count ?? studentsData.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      data: studentsData,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại getPaginatedManageStudentsServer:", error.message);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }
}
