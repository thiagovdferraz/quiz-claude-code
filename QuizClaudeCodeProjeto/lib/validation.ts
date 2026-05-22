import { z } from "zod";

export const AnswerRecordSchema = z.object({
  questionId: z.string(),
  userAnswer: z.boolean().nullable(),
  correct: z.boolean(),
  timeSpentMs: z.number().min(0).max(10500),
  pointsEarned: z.number().min(0),
});

export const SubmitRankingBodySchema = z.object({
  sessionId: z.string().uuid(),
  nickname: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, "Apenas letras, números, _ e -"),
  answers: z.array(AnswerRecordSchema).length(15),
});

export const RankingEntrySchema = z.object({
  id: z.string().uuid(),
  nickname: z.string(),
  score: z.number(),
  correct_count: z.number(),
  created_at: z.string(),
});

export type SubmitRankingBody = z.infer<typeof SubmitRankingBodySchema>;
