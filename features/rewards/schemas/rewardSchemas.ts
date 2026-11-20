import { z } from "zod";

/**
 * Schema kiểm tra đường dẫn HTTP/HTTPS hợp lệ (dùng chung cho Đổi quà & Hộp quà Vòng quay)
 */
export const httpUrlSchema = z
  .string()
  .trim()
  .min(1, "Con hãy dán link món quà muốn đổi nhé!")
  .refine((val) => {
    try {
      const parsed = new URL(val);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Link món quà phải là đường dẫn hợp lệ bắt đầu bằng http:// hoặc https://");

export const cashExchangeSchema = z.object({
  choiceType: z.literal("cash"),
  coinsToExchange: z
    .number({ message: "Số xu đổi phải là số hợp lệ." })
    .int("Số xu đổi phải là số nguyên.")
    .positive("Số xu đổi phải lớn hơn 0."),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự.").optional(),
});

export const giftExchangeSchema = z.object({
  choiceType: z.literal("gift"),
  link: httpUrlSchema,
  priceVnd: z
    .number({ message: "Số tiền món quà phải là số hợp lệ." })
    .int("Số tiền món quà phải là số nguyên.")
    .positive("Số tiền món quà phải lớn hơn 0đ."),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự.").optional(),
});

export const studentRewardExchangeSchema = z.discriminatedUnion("choiceType", [
  cashExchangeSchema,
  giftExchangeSchema,
]);

export type StudentRewardExchangeInput = z.infer<
  typeof studentRewardExchangeSchema
>;
