import { z } from "zod";
import { WHEEL_CONSTANTS } from "@/constants/wheel";

export const wheelPrizeTypeSchema = z.enum([
  "coin",
  "free_spin",
  "luck",
  "gift",
  "deduct_coin",
]);

export const wheelSlotItemSchema = z.object({
  id: z.string().trim().min(1, "ID ô phần thưởng không hợp lệ"),
  slot_order: z.number().int().min(1, "Thứ tự ô phải từ 1 trở lên"),
  label: z
    .string()
    .trim()
    .min(1, "Tên hiển thị đầy đủ không được để trống")
    .max(100, "Tên hiển thị tối đa 100 ký tự"),
  short_label: z
    .string()
    .trim()
    .min(1, "Tên ngắn không được để trống")
    .max(20, "Tên ngắn tối đa 20 ký tự"),
  prize_type: wheelPrizeTypeSchema,
  reward_coins: z.number().int(),
  reward_free_spins: z.number().int().min(0),
  probability_weight: z
    .number()
    .int()
    .min(
      WHEEL_CONSTANTS.MIN_SLOT_WEIGHT,
      `Trọng số xác suất tối thiểu là ${WHEEL_CONSTANTS.MIN_SLOT_WEIGHT}%`
    )
    .max(
      WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT,
      `Trọng số xác suất tối đa là ${WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT}%`
    ),
  is_active: z.boolean(),
  is_locked: z.boolean().optional().default(false),
});

export const saveWheelSlotsSchema = z
  .object({
    slots: z
      .array(wheelSlotItemSchema)
      .min(
        WHEEL_CONSTANTS.MIN_SLOTS,
        `Vòng quay cần có tối thiểu ${WHEEL_CONSTANTS.MIN_SLOTS} ô giải thưởng để đảm bảo tính mỹ thuật.`
      ),
  })
  .superRefine((data, ctx) => {
    const activeSlots = data.slots.filter((s) => s.is_active);
    if (activeSlots.length < WHEEL_CONSTANTS.MIN_SLOTS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Vòng quay cần tối thiểu ${WHEEL_CONSTANTS.MIN_SLOTS} ô đang kích hoạt (Active) để học sinh có thể quay.`,
        path: ["slots"],
      });
      return;
    }

    const totalWeight = activeSlots.reduce(
      (sum, s) => sum + (s.probability_weight || 0),
      0
    );

    if (totalWeight !== WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Tổng xác suất các ô kích hoạt phải đúng ${WHEEL_CONSTANTS.TARGET_TOTAL_WEIGHT}% (Hiện tại là ${totalWeight}%).`,
        path: ["slots"],
      });
    }
  });

export const wheelGeneralSettingsSchema = z.object({
  spin_cost: z
    .number({ message: "Phí mỗi lượt quay phải là số" })
    .int("Phí quay phải là số nguyên")
    .min(0, "Phí mỗi lượt quay không hợp lệ (phải >= 0)."),
  allow_free_spin: z.boolean(),
  daily_free_spins: z
    .number()
    .int()
    .min(1, "Số lượt miễn phí tối thiểu là 1")
    .max(
      WHEEL_CONSTANTS.MAX_DAILY_FREE_SPINS,
      `Số lượt miễn phí tối đa là ${WHEEL_CONSTANTS.MAX_DAILY_FREE_SPINS}`
    )
    .default(1),
  is_maintenance: z.boolean().default(false),
});

export const studentSpinRequestSchema = z.object({
  /** Danh sách ID các ô active hiện đang vẽ trên đĩa quay của trình duyệt học sinh (dùng để chống lệch kim chỉ Desync Animation) */
  client_slot_ids: z.array(z.string()).optional(),
});
