import { z } from "zod";

/**
 * Schema xác thực dữ liệu khi Tạo lớp học mới
 */
export const createClassSchema = z.object({
  class_name: z
    .string()
    .trim()
    .min(2, "Tên lớp học phải có ít nhất 2 ký tự.")
    .max(100, "Tên lớp học không được vượt quá 100 ký tự."),
  is_active: z.boolean().optional().default(true),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;

/**
 * Schema xác thực dữ liệu khi Cập nhật thông tin lớp học
 */
export const updateClassSchema = z
  .object({
    class_name: z
      .string()
      .trim()
      .min(2, "Tên lớp học phải có ít nhất 2 ký tự.")
      .max(100, "Tên lớp học không được vượt quá 100 ký tự.")
      .optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (data) => data.class_name !== undefined || data.is_active !== undefined,
    {
      message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật (tên lớp hoặc trạng thái).",
    }
  );

export type UpdateClassInput = z.infer<typeof updateClassSchema>;

/**
 * Schema xác thực dữ liệu khi Phân công giáo viên cho lớp học
 */
export const assignTeachersSchema = z.object({
  teacher_ids: z.array(z.string().min(1, "Mã giáo viên không được để trống.")),
});

export type AssignTeachersInput = z.infer<typeof assignTeachersSchema>;
