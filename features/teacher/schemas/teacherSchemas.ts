import { z } from "zod";

/**
 * Schema xác thực dữ liệu khi Tạo tài khoản giáo viên mới
 */
export const createTeacherSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ và tên không được vượt quá 100 ký tự."),
  username: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
    .max(50, "Tên đăng nhập không được vượt quá 50 ký tự.")
    .regex(/^[a-zA-Z0-9_.]+$/, "Tên đăng nhập chỉ chứa chữ cái, số, dấu gạch dưới và dấu chấm."),
  password: z
    .string()
    .min(6, "Mật khẩu khởi tạo phải có ít nhất 6 ký tự.")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự."),
  phone_zalo: z
    .string()
    .trim()
    .regex(
      /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
      "Số điện thoại Zalo không hợp lệ."
    ),
  email: z
    .string()
    .trim()
    .email("Email không đúng định dạng.")
    .optional()
    .or(z.literal("")),
  role: z
    .enum(["teacher", "super_teacher", "admin"])
    .optional()
    .default("teacher"),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;

/**
 * Schema xác thực dữ liệu khi Cập nhật thông tin giáo viên
 */
export const updateTeacherSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
      .max(100, "Họ và tên không được vượt quá 100 ký tự.")
      .optional(),
    phone_zalo: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .email("Email không đúng định dạng.")
      .optional()
      .or(z.literal("")),
    role: z.enum(["teacher", "super_teacher", "admin"]).optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.full_name !== undefined ||
      data.phone_zalo !== undefined ||
      data.email !== undefined ||
      data.role !== undefined ||
      data.is_active !== undefined,
    {
      message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật.",
    }
  );

export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;

/**
 * Schema xác thực dữ liệu khi Phân công lớp học cho giáo viên
 */
export const assignTeacherClassesSchema = z.object({
  class_ids: z.array(z.string().min(1, "Mã lớp học không được để trống.")),
});

export type AssignTeacherClassesInput = z.infer<typeof assignTeacherClassesSchema>;

/**
 * Schema xác thực dữ liệu khi Đặt lại mật khẩu giáo viên
 */
export const resetTeacherPasswordSchema = z.object({
  new_password: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự.")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự."),
});

export type ResetTeacherPasswordInput = z.infer<typeof resetTeacherPasswordSchema>;

/**
 * Schema xác thực thao tác hàng loạt trên nhiều giáo viên
 */
export const teacherBatchActionSchema = z.object({
  ids: z
    .array(z.string().uuid("Mã giáo viên không hợp lệ."))
    .min(1, "Vui lòng chọn ít nhất một giáo viên.")
    .max(100, "Mỗi lần chỉ được chọn tối đa 100 giáo viên."),
  action: z.enum(
    ["activate", "deactivate", "delete_soft", "restore", "delete_permanent"],
    {
      message: "Hành động hàng loạt không hợp lệ.",
    }
  ),
});

export type TeacherBatchActionInput = z.infer<typeof teacherBatchActionSchema>;
