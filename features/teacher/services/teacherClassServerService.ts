import { supabase } from "@/lib/supabase/db";
import { getAuthSession, AuthTokenPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/constants";
import { TeacherClassItem, AvailableTeacherItem } from "../components/classes/types";
import { format } from "date-fns";
import { unstable_rethrow } from "next/navigation";

/**
 * Service tải danh sách lớp học trực tiếp trên máy chủ (Server Component / Route Handler)
 * - Tối ưu 0ms độ trễ mạng client
 * - Bảo mật: chỉ cho phép TEACHER, SUPER_TEACHER và ADMIN truy xuất dữ liệu
 */
export async function getTeacherClassesServer(
  customSession?: AuthTokenPayload | null
): Promise<TeacherClassItem[]> {
  try {
    const session = customSession !== undefined ? customSession : await getAuthSession();

    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return [];
    }

    // 1. Lấy danh sách lớp học (Admin/Super-Teacher lấy cả lớp đã xóa để quản lý thùng rác)
    // Sắp xếp mặc định: Đang hoạt động (is_active: true) lên đầu, Tạm ẩn (is_active: false) xuống cuối
    let classesQuery = supabase
      .from("classes")
      .select("id, class_name, is_active, is_deleted, created_at, created_by")
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false });

    // Chỉ duy nhất Quản trị viên tối cao (Admin) mới có quyền xem cả danh sách thùng rác
    if (session.role !== UserRole.ADMIN) {
      classesQuery = classesQuery.eq("is_deleted", false);
    }

    const { data: classesData, error: classesError } = await classesQuery;

    if (classesError || !classesData) {
      console.error("Lỗi khi tải danh sách lớp học trên server:", classesError?.message);
      return [];
    }

    // 2. Lấy số lượng học sinh và tổng số xu theo từng lớp
    const { data: studentList, error: studentError } = await supabase
      .from("users")
      .select("class_id, current_coins")
      .eq("role", UserRole.STUDENT)
      .eq("is_deleted", false)
      .not("class_id", "is", null);

    if (studentError) {
      console.error("Lỗi khi lấy số lượng học sinh và xu trên server:", studentError.message);
    }

    const studentCountMap = new Map<string, number>();
    const totalCoinsMap = new Map<string, number>();
    if (studentList) {
      for (const student of studentList) {
        if (student.class_id) {
          studentCountMap.set(
            student.class_id,
            (studentCountMap.get(student.class_id) || 0) + 1
          );
          totalCoinsMap.set(
            student.class_id,
            (totalCoinsMap.get(student.class_id) || 0) + (Number(student.current_coins) || 0)
          );
        }
      }
    }

    // 3. Lấy phân công giáo viên và thông tin giáo viên
    const [assignmentsRes, teachersRes] = await Promise.all([
      supabase.from("teacher_classes").select("class_id, teacher_id"),
      supabase
        .from("users")
        .select("id, full_name")
        .in("role", [UserRole.TEACHER, UserRole.SUPER_TEACHER])
        .eq("is_deleted", false),
    ]);

    const teacherNameMap = new Map<string, string>();
    if (teachersRes.data) {
      for (const t of teachersRes.data) {
        teacherNameMap.set(t.id, t.full_name);
      }
    }

    const classTeachersMap = new Map<string, { names: string[]; ids: string[] }>();
    if (assignmentsRes.data) {
      for (const a of assignmentsRes.data) {
        const teacherName = teacherNameMap.get(a.teacher_id);
        if (!classTeachersMap.has(a.class_id)) {
          classTeachersMap.set(a.class_id, { names: [], ids: [] });
        }
        const record = classTeachersMap.get(a.class_id)!;
        record.ids.push(a.teacher_id);
        if (teacherName) {
          record.names.push(teacherName);
        }
      }
    }

    // 4. Đảm bảo trạng thái đang hoạt động (true) luôn đứng trước tạm ẩn (false)
    classesData.sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      return 0;
    });

    // 5. Tổng hợp dữ liệu trả về
    return classesData.map((c) => {
      const teacherInfo = classTeachersMap.get(c.id) || { names: [], ids: [] };
      const formattedDate = c.created_at
        ? format(new Date(c.created_at), "dd/MM/yyyy")
        : "";

      return {
        id: c.id,
        class_name: c.class_name,
        is_active: c.is_active,
        is_deleted: Boolean(c.is_deleted),
        student_count: studentCountMap.get(c.id) || 0,
        total_coins: totalCoinsMap.get(c.id) || 0,
        teachers: teacherInfo.names,
        teacher_ids: teacherInfo.ids,
        created_at: formattedDate,
      };
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Lỗi máy chủ khi tải danh sách lớp học tại getTeacherClassesServer:", error);
    return [];
  }
}

/**
 * Service tải danh sách giáo viên có thể phân công trực tiếp trên máy chủ
 * - Tối ưu 0ms độ trễ mạng client, đọc session trực tiếp từ cookie hoặc truyền vào
 */
export async function getAvailableTeachersServer(
  customSession?: AuthTokenPayload | null
): Promise<AvailableTeacherItem[]> {
  try {
    const session = customSession !== undefined ? customSession : await getAuthSession();

    if (
      !session ||
      (session.role !== UserRole.TEACHER &&
        session.role !== UserRole.SUPER_TEACHER &&
        session.role !== UserRole.ADMIN)
    ) {
      return [];
    }

    // 1. Lấy đồng thời danh sách giáo viên, lớp học chưa xóa và phân công hiện tại
    const [teachersRes, classesRes, assignmentsRes] = await Promise.all([
      supabase
        .from("users")
        .select("id, full_name, username, role")
        .in("role", [UserRole.TEACHER, UserRole.SUPER_TEACHER])
        .eq("is_active", true)
        .eq("is_deleted", false)
        .order("full_name", { ascending: true }),
      supabase.from("classes").select("id").eq("is_deleted", false),
      supabase.from("teacher_classes").select("teacher_id, class_id"),
    ]);

    if (teachersRes.error) {
      console.error("Lỗi khi tải danh sách giáo viên từ Supabase:", teachersRes.error.message);
      return [];
    }

    // 2. Tính số lượng lớp đang phụ trách cho từng giáo viên (chỉ tính lớp chưa xóa)
    const activeClassIdSet = new Set((classesRes.data || []).map((c) => c.id));
    const classCountMap = new Map<string, number>();

    if (assignmentsRes.data) {
      for (const a of assignmentsRes.data) {
        if (activeClassIdSet.has(a.class_id)) {
          classCountMap.set(a.teacher_id, (classCountMap.get(a.teacher_id) || 0) + 1);
        }
      }
    }

    // 3. Ghép thông tin trả về
    return (teachersRes.data || []).map((t) => ({
      id: t.id,
      full_name: t.full_name,
      username: t.username,
      role: t.role,
      assigned_class_count: classCountMap.get(t.id) || 0,
    }));
  } catch (error) {
    unstable_rethrow(error);
    console.error("Lỗi máy chủ khi tải danh sách giáo viên tại getAvailableTeachersServer:", error);
    return [];
  }
}
