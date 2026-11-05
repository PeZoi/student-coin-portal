import { z } from "zod";

/**
 * ==============================================================================
 * AUTH SCHEMAS (CHUẨN HÓA THEO CSDL POSTGRESQL TRONG docs/database_schema.sql)
 * - Bảng `users`: phone_zalo, pin_number, full_name, class_id, role
 * - Bảng `classes`: id, class_name
 * ==============================================================================
 */

/**
 * Schema đăng nhập học sinh (bước 1: nhập Số điện thoại Zalo để tra cứu hồ sơ)
 * - phone_zalo: Đúng 10 chữ số, bắt đầu bằng số 0
 */
export const studentLoginSchema = z.object({
  phone_zalo: z
    .string({
      error: "Bé hãy nhập Số điện thoại nhé!",
    })
    .trim()
    .min(1, "Bé hãy nhập Số điện thoại nhé!")
    .regex(
      /^[0-9]+$/,
      "Số điện thoại chỉ được chứa chữ số, không được nhập chữ cái."
    )
    .regex(
      /^0[0-9]{9}$/,
      "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0."
    ),
});

/**
 * Schema xác thực mã PIN học sinh (bước 2: nhập mã PIN OTP trong popup)
 */
export const studentPinVerificationSchema = z.object({
  phone_zalo: z
    .string({
      error: "Thiếu số điện thoại.",
    })
    .trim()
    .min(1, "Thiếu số điện thoại.")
    .regex(/^0[0-9]{9}$/, "Số điện thoại không đúng định dạng."),
  pin_number: z
    .string({
      error: "Bé hãy nhập đủ 4 số PIN nhé!",
    })
    .trim()
    .min(1, "Bé hãy nhập đủ 4 số PIN nhé!")
    .regex(/^\d{4}$/, "Mã PIN phải gồm đúng 4 chữ số bí mật (ví dụ: 1234)."),
});

/**
 * Schema đăng ký học sinh
 * - full_name: Họ và tên đầy đủ của học sinh (bảng `users.full_name`)
 * - phone_zalo: Số điện thoại Zalo phụ huynh/học sinh (bảng `users.phone_zalo`)
 * - class_id: Khóa ngoại liên kết bảng classes (bảng `users.class_id`)
 * - pin_number: Mã PIN 4 số (bảng `users.pin_number`)
 * - confirm_pin_number: Nhập lại mã PIN để đối soát
 */
export const studentRegisterSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Bé hãy nhập đầy đủ họ và tên nhé!")
      .max(100, "Họ và tên không vượt quá 100 ký tự ."),
    phone_zalo: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập Số điện thoại Zalo của bố mẹ hoặc bé!")
      .regex(
        /^[0-9]+$/,
        "Số điện thoại chỉ được chứa chữ số, không được nhập chữ cái."
      )
      .regex(
        /^0[0-9]{9}$/,
        "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0."
      ),
    class_id: z
      .string()
      .trim()
      .min(1, "Bé hãy chọn lớp học của mình nhé!"),
    pin_number: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Mã PIN phải gồm đúng 4 chữ số (ví dụ: 1234)."),
    confirm_pin_number: z
      .string()
      .trim()
      .min(1, "Bé hãy nhập lại mã PIN một lần nữa nhé!"),
    avatar_url: z.string().optional(),
  })
  .refine((data) => data.pin_number === data.confirm_pin_number, {
    message: "Mã PIN xác nhận chưa trùng khớp, bé kiểm tra lại nhé!",
    path: ["confirm_pin_number"],
  });

/**
 * Schema đăng nhập Giáo viên & Quản trị viên (bảng `users.username` và `users.password`)
 * - username: Tên đăng nhập của giáo viên / admin (tối thiểu 3 ký tự)
 * - password: Mật khẩu đăng nhập quản trị (tối thiểu 6 ký tự)
 */
export const teacherLoginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Thầy cô hãy nhập Tên đăng nhập nhé!")
    .min(3, "Tên đăng nhập cần có ít nhất 3 ký tự.")
    .max(50, "Tên đăng nhập không dài quá 50 ký tự."),
  password: z
    .string()
    .min(1, "Thầy cô hãy nhập Mật khẩu nhé!")
    .min(6, "Mật khẩu quản trị phải có ít nhất 6 ký tự."),
});
