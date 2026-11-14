import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus, WHEEL_CONSTANTS } from "@/constants";
import { getInitialWheelConfigServer } from "@/features/wheel-management/services/wheelServerService";
import {
  saveWheelSlotsSchema,
  wheelGeneralSettingsSchema,
} from "@/features/wheel-management/schemas/wheelSchemas";

/**
 * GET /api/teacher/wheel-config
 * Lấy toàn bộ thông tin cấu hình vòng quay, bao gồm danh sách ô (chưa xóa mềm), tham số kinh tế và thống kê thực tế
 */
export async function GET(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền truy cập cấu hình vòng quay may mắn."
    );
    if (!auth.success) {
      return auth.response;
    }

    const config = await getInitialWheelConfigServer(auth.session);
    return apiSuccess(config);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại GET /api/teacher/wheel-config:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi tải cấu hình vòng quay.");
  }
}

/**
 * POST /api/teacher/wheel-config
 * Lưu cơ cấu danh sách các ô phần thưởng trên vòng quay (Hỗ trợ Soft Delete với is_deleted, deleted_by, deleted_at)
 */
export async function POST(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền chỉnh sửa cấu hình vòng quay may mắn."
    );
    if (!auth.success) {
      return auth.response;
    }

    const rawBody: unknown = await req.json();
    const validation = saveWheelSlotsSchema.safeParse(rawBody);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return apiError(
        firstIssue?.message || "Dữ liệu cơ cấu ô giải thưởng không hợp lệ.",
        HttpStatus.BAD_REQUEST
      );
    }

    const { slots } = validation.data;
    const nowIso = new Date().toISOString();

    // 1. Chuẩn bị payload để Upsert vào bảng wheel_prizes (khôi phục trạng thái is_deleted = false)
    const upsertData = slots.map((slot, idx) => ({
      id: slot.id,
      slot_order: idx + 1,
      label: slot.label.trim(),
      short_label: slot.short_label.trim(),
      prize_type: slot.prize_type,
      reward_coins:
        slot.prize_type === "deduct_coin"
          ? -Math.abs(slot.reward_coins)
          : slot.prize_type === "coin"
          ? Math.abs(slot.reward_coins)
          : 0,
      reward_free_spins:
        slot.prize_type === "free_spin"
          ? Math.max(1, slot.reward_free_spins)
          : 0,
      probability_weight: slot.probability_weight,
      is_active: slot.is_active,
      is_locked: slot.is_locked || false,
      is_deleted: false,
      deleted_by: null,
      deleted_at: null,
      updated_by: auth.session.userId,
      updated_at: nowIso,
    }));

    const currentSlotIds = slots.map((s) => s.id);
    const notInFilter = `(${currentSlotIds.map((id) => `"${id}"`).join(",")})`;

    // 2. Thực thi song song (1 round-trip duy nhất): Upsert các ô hiện tại VÀ Soft Delete các ô bị gỡ bỏ
    const [upsertRes, softDeleteRes] = await Promise.all([
      supabase.from("wheel_prizes").upsert(upsertData, { onConflict: "id" }),
      supabase
        .from("wheel_prizes")
        .update({
          is_deleted: true,
          is_active: false,
          deleted_by: auth.session.userId,
          deleted_at: nowIso,
          updated_by: auth.session.userId,
          updated_at: nowIso,
        })
        .eq("is_deleted", false)
        .not("id", "in", notInFilter)
        .select("id"),
    ]);

    if (upsertRes.error) {
      console.error(
        "Lỗi khi lưu các ô giải thưởng vào DB:",
        upsertRes.error.message
      );
      return apiError(`Lỗi lưu CSDL: ${upsertRes.error.message}`);
    }

    if (softDeleteRes.error) {
      console.error(
        "Lỗi khi xóa mềm các ô giải thưởng:",
        softDeleteRes.error.message
      );
    }

    return apiSuccess(
      {
        updated_count: slots.length,
        deleted_count: softDeleteRes.data?.length ?? 0,
      },
      "Đã lưu thành công cơ cấu ô phần thưởng vòng quay!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại POST /api/teacher/wheel-config:", error.message);
    return apiError("Đã xảy ra lỗi hệ thống khi lưu cấu hình các ô phần thưởng.");
  }
}

/**
 * PUT /api/teacher/wheel-config
 * Lưu thiết lập kinh tế vòng quay (spin_cost, allow_free_spin, daily_free_spins, is_maintenance)
 */
export async function PUT(req: Request) {
  try {
    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền chỉnh sửa thiết lập kinh tế vòng quay."
    );
    if (!auth.success) {
      return auth.response;
    }

    const rawBody: unknown = await req.json();
    const validation = wheelGeneralSettingsSchema.safeParse(rawBody);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return apiError(
        firstIssue?.message || "Thiết lập kinh tế vòng quay không hợp lệ.",
        HttpStatus.BAD_REQUEST
      );
    }

    const newSettingValue = validation.data;

    const { error } = await supabase
      .from("system_settings")
      .upsert(
        {
          key: WHEEL_CONSTANTS.SYSTEM_SETTING_KEY,
          value: newSettingValue,
          description:
            "Cấu hình chi phí 1 lượt quay và quyền quay miễn phí vòng quay may mắn",
          is_public: true,
          updated_by: auth.session.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("Lỗi khi lưu cấu hình kinh tế vòng quay:", error.message);
      return apiError(`Lỗi lưu thiết lập kinh tế: ${error.message}`);
    }

    return apiSuccess(
      newSettingValue,
      "Đã lưu thành công thiết lập kinh tế vòng quay!"
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Lỗi tại PUT /api/teacher/wheel-config:", error.message);
    return apiError("Đã xảy ra lỗi máy chủ khi lưu thiết lập kinh tế.");
  }
}
