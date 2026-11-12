import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { getInitialWheelConfigServer } from "@/features/wheel-management/services/wheelServerService";
import { WheelSlotItem, WheelGeneralSettings } from "@/features/wheel-management/types";

/**
 * GET /api/teacher/wheel-config
 * Lấy toàn bộ thông tin cấu hình vòng quay, bao gồm danh sách ô, tham số kinh tế và thống kê
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
 * Lưu cơ cấu danh sách các ô phần thưởng trên vòng quay
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

    const body = await req.json();
    const slots = body.slots as WheelSlotItem[];

    if (!Array.isArray(slots) || slots.length < 4) {
      return apiError(
        "Vòng quay cần có tối thiểu 4 ô giải thưởng để đảm bảo tính mỹ thuật.",
        HttpStatus.BAD_REQUEST
      );
    }

    // Kiểm tra tổng xác suất các ô đang kích hoạt
    const activeSlots = slots.filter((s) => s.is_active);
    const totalWeight = activeSlots.reduce(
      (sum, s) => sum + (s.probability_weight || 0),
      0
    );

    if (totalWeight !== 100) {
      return apiError(
        `Tổng xác suất các ô kích hoạt phải đúng 100% (Hiện tại là ${totalWeight}%).`,
        HttpStatus.BAD_REQUEST
      );
    }

    // 1. Chuẩn bị payload để Upsert vào bảng wheel_prizes
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
        slot.prize_type === "free_spin" ? Math.max(1, slot.reward_free_spins) : 0,
      icon_name: slot.icon_name || "coins",
      probability_weight: slot.probability_weight,
      is_active: slot.is_active,
      is_locked: slot.is_locked || false,
      updated_by: auth.session.userId,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from("wheel_prizes")
      .upsert(upsertData, { onConflict: "id" });

    if (upsertError) {
      console.error("Lỗi khi lưu các ô giải thưởng vào DB:", upsertError.message);
      return apiError(`Lỗi lưu CSDL: ${upsertError.message}`);
    }

    // 2. Tạm ẩn các ô không còn trong danh sách (thay vì xóa cứng để bảo vệ liên kết khóa ngoại wheel_spins)
    const activeIds = slots.map((s) => s.id);
    await supabase
      .from("wheel_prizes")
      .update({ is_active: false })
      .not("id", "in", `(${activeIds.map((id) => `'${id}'`).join(",")})`);

    return apiSuccess(
      { updated_count: slots.length },
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
 * Lưu thiết lập kinh tế vòng quay (spin_cost, allow_free_spin, daily_free_spins)
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

    const body = (await req.json()) as WheelGeneralSettings;

    const spinCost = Number(body.spin_cost);
    if (isNaN(spinCost) || spinCost < 0) {
      return apiError(
        "Phí mỗi lượt quay không hợp lệ (phải >= 0).",
        HttpStatus.BAD_REQUEST
      );
    }

    const newSettingValue = {
      spin_cost: spinCost,
      allow_free_spin: Boolean(body.allow_free_spin),
      daily_free_spins: Math.max(1, Number(body.daily_free_spins) || 1),
      is_maintenance: Boolean(body.is_maintenance),
    };

    const { error } = await supabase
      .from("system_settings")
      .upsert(
        {
          key: "wheel_setting",
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
