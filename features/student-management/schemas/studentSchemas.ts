import { z } from "zod";

/**
 * Schema kiểm tra dữ liệu khi tạo hồ sơ học sinh mới
 */
export const createStudentSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Họ và tên học sinh phải có ít nhất 2 ký tự.")
    .max(100, "Họ và tên không được vượt quá 100 ký tự."),
  phone_zalo: z
    .string()
    .trim()
    .regex(
      /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
      "Số điện thoại Zalo không hợp lệ."
    ),
  class_id: z.string().trim().optional().nullable(),
  pin_number: z
    .string()
    .regex(/^\d{4}$/, "Mã PIN phải gồm đúng 4 chữ số.")
    .optional()
    .default("0000"),
  initial_coins: z.coerce
    .number()
    .int("Số xu khởi tạo phải là số nguyên.")
    .min(0, "Số xu khởi tạo không được âm.")
    .optional()
    .default(0),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

/**
 * Schema kiểm tra dữ liệu khi cập nhật hồ sơ học sinh
 */
export const updateStudentSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Họ và tên học sinh phải có ít nhất 2 ký tự.")
    .max(100, "Họ và tên không được vượt quá 100 ký tự.")
    .optional(),
  phone_zalo: z
    .string()
    .trim()
    .regex(
      /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
      "Số điện thoại Zalo không hợp lệ (ví dụ: 0912345678)."
    )
    .optional(),
  class_id: z.string().trim().optional().nullable(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

/**
 * Schema kiểm tra chuyển lớp học cho 1 học sinh
 */
export const changeStudentClassSchema = z.object({
  new_class_id: z.string().trim().optional().nullable(),
  reset_progress: z.boolean().optional().default(false),
});

export type ChangeStudentClassInput = z.infer<typeof changeStudentClassSchema>;

/**
 * Schema kiểm tra chuyển lớp học hàng loạt
 */
export const batchChangeStudentClassSchema = z.object({
  student_ids: z
    .array(z.string().uuid("Mã học sinh không đúng định dạng UUID."))
    .min(1, "Vui lòng chọn ít nhất 1 học sinh để chuyển lớp."),
  new_class_id: z.string().trim().optional().nullable(),
  reset_progress: z.boolean().optional().default(false),
});

export type BatchChangeStudentClassInput = z.infer<
  typeof batchChangeStudentClassSchema
>;

/**
 * Schema điều chỉnh số xu và lượt quay Heo Đất
 */
export const adjustStudentCoinsSchema = z.object({
  type: z.enum(["add", "deduct"]),
  amount: z
    .number()
    .int("Số xu phải là số nguyên.")
    .min(0, "Số xu không được âm."),
  spins_change: z
    .number()
    .int("Lượt quay phải là số nguyên.")
    .optional()
    .default(0),
  reason: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập lý do ghi nhận sổ nhật ký.")
    .max(255, "Lý do ghi nhận không được vượt quá 255 ký tự."),
});

export type AdjustStudentCoinsInput = z.infer<typeof adjustStudentCoinsSchema>;

/**
 * Schema đặt lại mã PIN học sinh
 */
export const resetStudentPinSchema = z.object({
  new_pin: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Mã PIN phải gồm đúng 4 chữ số."),
});

export type ResetStudentPinInput = z.infer<typeof resetStudentPinSchema>;

/**
 * Schema cập nhật trạng thái hoạt động học sinh (Tạm ngưng / Hoạt động)
 */
export const updateStudentStatusSchema = z.object({
  is_active: z.boolean(),
});

export type UpdateStudentStatusInput = z.infer<typeof updateStudentStatusSchema>;
