import { supabase } from "@/lib/supabase/db";
import { getAuthSession, AuthTokenPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/constants/auth";
import { TeacherExchangeRequestItem } from "@/features/teacher/reward-management/types";

export interface GetTeacherRewardRequestsOptions {
  month?: number;
  year?: number;
  status?: string;
  choiceType?: string;
  classId?: string;
  search?: string;
}

/**
 * Service tải danh sách yêu cầu đổi quà trên máy chủ (Server Component / Route Handler)
 * - Tối ưu 0ms độ trễ mạng client (Quy tắc 9 AGENTS.md)
 * - Bảo mật & phân quyền theo vai trò (Admin / Super Teacher / Teacher)
 * - Tận dụng JOIN quan hệ Postgres qua Supabase PostgREST
 */
export async function getTeacherRewardRequestsServer(
  customSession?: AuthTokenPayload | null,
  options?: GetTeacherRewardRequestsOptions
): Promise<TeacherExchangeRequestItem[]> {
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

    const isTeacher = session.role === UserRole.TEACHER;
    let allowedClassIds: string[] | null = null;

    // Phân quyền: Giáo viên thường chỉ xem các lớp được phân công
    if (isTeacher) {
      const { data: teacherClasses, error: tcError } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", session.userId);

      if (tcError) {
        console.error("Lỗi lấy danh sách lớp của giáo viên:", tcError.message);
        return [];
      }

      allowedClassIds = teacherClasses?.map((tc) => tc.class_id) ?? [];
      if (allowedClassIds.length === 0) {
        return [];
      }
    }

    // Xây dựng query monthly_exchange_requests kèm JOIN sang users
    let query = supabase
      .from("monthly_exchange_requests")
      .select(`
        id,
        month,
        year,
        student_id,
        choice_type,
        coins_to_exchange,
        amount_vnd,
        shopee_product_url,
        shopee_note,
        rejection_reason,
        status,
        hold_tx_id,
        processed_by,
        processed_at,
        created_at,
        updated_by,
        updated_at,
        student:users!monthly_exchange_requests_student_id_fkey (
          id,
          full_name,
          avatar_url,
          phone_zalo,
          class_id
        ),
        processor:users!monthly_exchange_requests_processed_by_fkey (
          id,
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    // Lọc theo tháng & năm
    if (options?.month !== undefined) {
      query = query.eq("month", options.month);
    }
    if (options?.year !== undefined) {
      query = query.eq("year", options.year);
    }

    // Lọc theo trạng thái
    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }

    // Lọc theo hình thức đổi quà
    if (options?.choiceType && options.choiceType !== "all") {
      query = query.eq("choice_type", options.choiceType);
    }

    // Truy vấn song song dữ liệu yêu cầu đổi quà và danh sách lớp học (tránh PostgREST relationship ambiguity)
    const [requestsRes, classesRes] = await Promise.all([
      query,
      supabase.from("classes").select("id, class_name"),
    ]);

    const { data: rawRequests, error: reqError } = requestsRes;
    const { data: classesData } = classesRes;

    const classNameMap = new Map<string, string>();
    if (classesData) {
      for (const cls of classesData) {
        classNameMap.set(cls.id, cls.class_name);
      }
    }

    if (reqError) {
      console.error(
        "Lỗi khi tải monthly_exchange_requests trên server:",
        reqError.message
      );
      return [];
    }

    if (!rawRequests || rawRequests.length === 0) {
      return [];
    }

    // Ánh xạ dữ liệu sang TeacherExchangeRequestItem và lọc theo quyền lớp
    const formatted: TeacherExchangeRequestItem[] = [];

    for (const item of rawRequests) {
      const student = Array.isArray(item.student)
        ? item.student[0]
        : item.student;
      const processor = Array.isArray(item.processor)
        ? item.processor[0]
        : item.processor;

      const classId = student?.class_id || undefined;
      const className = classId ? classNameMap.get(classId) : undefined;

      // Kiểm tra quyền giáo viên đối với lớp của học sinh
      if (allowedClassIds !== null) {
        if (!classId || !allowedClassIds.includes(classId)) {
          continue;
        }
      }

      // Lọc theo classId nếu options có chỉ định
      if (options?.classId && options.classId !== "all") {
        if (classId !== options.classId) {
          continue;
        }
      }

      const studentName = student?.full_name || "Chưa đặt tên";
      const shopeeNote = item.shopee_note || "";

      // Tìm kiếm theo từ khóa nếu có
      if (options?.search && options.search.trim()) {
        const q = options.search.toLowerCase().trim();
        const nameMatch = studentName.toLowerCase().includes(q);
        const noteMatch = shopeeNote.toLowerCase().includes(q);
        if (!nameMatch && !noteMatch) {
          continue;
        }
      }

      formatted.push({
        id: item.id,
        month: item.month,
        year: item.year,
        student_id: item.student_id,
        choice_type: item.choice_type,
        coins_to_exchange: item.coins_to_exchange,
        amount_vnd: item.amount_vnd,
        shopee_product_url: item.shopee_product_url,
        shopee_note: item.shopee_note,
        rejection_reason: item.rejection_reason || null,
        status: item.status,
        hold_tx_id: item.hold_tx_id,
        processed_by: item.processed_by,
        processed_at: item.processed_at,
        created_at: item.created_at,
        updated_by: item.updated_by,
        updated_at: item.updated_at,
        student_name: studentName,
        student_avatar: student?.avatar_url || null,
        class_id: classId,
        class_name: className,
        phone_zalo: student?.phone_zalo || null,
        processor_name: processor?.full_name || null,
      });
    }

    return formatted;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi ngoại lệ tại getTeacherRewardRequestsServer:", error.message);
    return [];
  }
}
