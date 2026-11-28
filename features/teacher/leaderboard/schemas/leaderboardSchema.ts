import { z } from "zod";

export const leaderboardQuerySchema = z.object({
  classId: z.string().trim().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});

export type ValidatedLeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
