import { z } from 'zod';

export const studyConditionSchema = z.enum(['D', 'R0', 'R1', 'R2', 'R3']);

export const studyCompareSchema = z.object({
  question: z.string().trim().min(3).max(2000),
  arm: z.enum(['openai', 'anthropic']),
  conditions: z.array(studyConditionSchema).min(1).max(5)
});

// Identificadores de experimento e de lote, como `e2-cli-smoke-gpt` e `20261023T131207Z`.
export const studyBatchParamsSchema = z.object({
  experimentId: z.string().regex(/^[A-Za-z0-9._-]+$/),
  batchId: z.string().regex(/^[A-Za-z0-9._-]+$/)
});

export type StudyCompareInput = z.infer<typeof studyCompareSchema>;
