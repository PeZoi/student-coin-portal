import { supabase } from "@/lib/supabase/db";
import { getAuthSession, AuthTokenPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/constants";
import {
  TeacherStaffItem,
  AvailableClassItem,
  StaffRole,
} from "@/features/teacher-management/types";
import { format } from "date-fns";
import { unstable_rethrow } from "next/navigation";

/**
 * Service tải danh sách nhân sự giáo viên trực tiếp trên máy chủ (Server Component / Route Handler)
 * - Tối ưu 0ms độ trễ mạng client
 * - Bảo mật: chỉ cho phép TEACHER, SUPER_TEACHER và ADMIN truy xuất dữ liệu
 */
export async function getManageTeachersServer(
  customSession?: AuthTokenPayload | null
): Promise<TeacherStaffItem[]> {
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

    // Chỉ duy nhất Quản trị viên tối cao (Admin) mới có quyền xem cả danh sách thùng rác
    const isAdmin = session.role === UserRole.ADMIN;

    // 1. Lấy danh sách giáo viên và nhân sự quản trị trong bảng users (tận dụng index idx_users_role_deleted)
    let teachersQuery = supabase
      .from("users")
      .select(
        `
        id,
        username,
        full_name,
        email,
        phone_zalo,
        avatar_url,
        role,
        is_active,
        is_deleted,
        failed_login_attempts,
        locked_until,
        last_login_at,
        created_at
      `
      )
      .in("role", [UserRole.TEACHER, UserRole.SUPER_TEACHER])
      .neq("role", UserRole.ADMIN)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false });

    // Chỉ Admin và Super-Teacher mới có quyền xem cả danh sách thùng rác
    if (!isAdmin) {
      teachersQuery = teachersQuery.eq("is_deleted", false);
    }

    const { data: teachersData, error: teachersError } = await teachersQuery;

    if (teachersError || !teachersData) {
      console.error(
        "Lỗi khi tải danh sách giáo viên trên server:",
        teachersError?.message
      );
      return [];
    }

    // 2. Lấy phân công lớp và danh sách lớp học (bỏ query auth_logs nhờ tối ưu cột last_login_at)
    const [assignmentsRes, classesRes] = await Promise.all([
      supabase.from("teacher_classes").select("teacher_id, class_id"),
      supabase.from("classes").select("id, class_name").eq("is_deleted", false),
    ]);

    const classNameMap = new Map<string, string>();
    if (classesRes.data) {
      for (const cls of classesRes.data) {
        classNameMap.set(cls.id, cls.class_name);
      }
    }

    // Map các lớp phụ trách cho từng giáo viên
    const teacherClassesMap = new Map<
      string,
      { names: string[]; ids: string[] }
    >();
    if (assignmentsRes.data) {
      for (const a of assignmentsRes.data) {
        const className = classNameMap.get(a.class_id);
        if (className) {
          if (!teacherClassesMap.has(a.teacher_id)) {
            teacherClassesMap.set(a.teacher_id, { names: [], ids: [] });
          }
          const record = teacherClassesMap.get(a.teacher_id)!;
          record.ids.push(a.class_id);
          record.names.push(className);
        }
      }
    }

    // 3. Sắp xếp: Đang hoạt động (is_active: true) lên đầu, Tạm khóa (is_active: false) xuống dưới
    teachersData.sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      return 0;
    });

    // 4. Lọc bỏ tuyệt đối tài khoản Admin và tổng hợp dữ liệu TeacherStaffItem trả về
    return teachersData
      .filter((t) => t.role === UserRole.TEACHER || t.role === UserRole.SUPER_TEACHER)
      .map((t) => {
      const classInfo = teacherClassesMap.get(t.id) || {
        names: [],
        ids: [],
      };

      const formattedCreatedAt = t.created_at
        ? format(new Date(t.created_at), "dd/MM/yyyy")
        : "";

      const formattedLastLogin = t.last_login_at
        ? format(new Date(t.last_login_at), "HH:mm dd/MM/yyyy")
        : null;

      return {
        id: t.id,
        username: t.username || "",
        full_name: t.full_name,
        email: t.email || null,
        phone_zalo: t.phone_zalo || null,
        avatar_url: t.avatar_url || null,
        role: (t.role as StaffRole) || "teacher",
        is_active: Boolean(t.is_active),
        is_deleted: Boolean(t.is_deleted),
        failed_login_attempts: t.failed_login_attempts || 0,
        locked_until: t.locked_until || null,
        is_locked: Boolean(
          t.locked_until && new Date(t.locked_until).getTime() > Date.now()
        ),
        assigned_classes: classInfo.names,
        assigned_class_ids: classInfo.ids,
        last_login_at: formattedLastLogin,
        created_at: formattedCreatedAt,
      };
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error(
      "Lỗi máy chủ khi tải danh sách giáo viên tại getManageTeachersServer:",
      error
    );
    return [];
  }
}

/**
 * Service tải danh sách lớp học sẵn có phục vụ Modal phân công lớp cho giáo viên
 */
export async function getAvailableClassesForTeachersServer(
  customSession?: AuthTokenPayload | null
): Promise<AvailableClassItem[]> {
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

    const [classesRes, studentsRes] = await Promise.all([
      supabase
        .from("classes")
        .select("id, class_name, is_active")
        .eq("is_deleted", false)
        .eq("is_active", true)
        .order("class_name", { ascending: true }),
      supabase
        .from("users")
        .select("class_id")
        .eq("role", UserRole.STUDENT)
        .eq("is_deleted", false)
        .not("class_id", "is", null),
    ]);

    if (classesRes.error) {
      console.error(
        "Lỗi khi tải danh sách lớp học tại getAvailableClassesForTeachersServer:",
        classesRes.error.message
      );
      return [];
    }

    const studentCountMap = new Map<string, number>();
    if (studentsRes.data) {
      for (const s of studentsRes.data) {
        if (s.class_id) {
          studentCountMap.set(
            s.class_id,
            (studentCountMap.get(s.class_id) || 0) + 1
          );
        }
      }
    }

    return (classesRes.data || []).map((c) => ({
      id: c.id,
      class_name: c.class_name,
      is_active: Boolean(c.is_active),
      student_count: studentCountMap.get(c.id) || 0,
    }));
  } catch (error) {
    unstable_rethrow(error);
    console.error(
      "Lỗi máy chủ khi tải lớp học tại getAvailableClassesForTeachersServer:",
      error
    );
    return [];
  }
}
