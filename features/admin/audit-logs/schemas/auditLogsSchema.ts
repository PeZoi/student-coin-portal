import { z } from "zod";
import {
  AUDIT_LOGS_DEFAULT_PAGE,
  AUDIT_LOGS_DEFAULT_PAGE_SIZE,
} from "../constants";

export const auditLogsQuerySchema = z.object({
  tab: z.enum(["auth", "activity"]).default("auth"),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(10000)
    .default(AUDIT_LOGS_DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(5)
    .max(100)
    .default(AUDIT_LOGS_DEFAULT_PAGE_SIZE),
  search: z.string().trim().max(100).default(""),
  status: z.enum(["all", "success", "failed"]).default("all"),
  role: z
    .enum(["all", "student", "teacher", "super_teacher", "admin"])
    .default("all"),
  scope: z
    .enum([
      "all",
      "account_pin",
      "class_assignment",
      "wheel_rewards",
      "system_settings",
      "other",
    ])
    .default("all"),
});

export type ValidatedAuditLogsQuery = z.infer<typeof auditLogsQuerySchema>;
