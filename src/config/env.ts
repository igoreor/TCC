import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/hanseniase_rag?schema=public'),
  OPENAI_API_KEY: z.string().optional().default(''),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  CHAT_MODEL: z.string().default('gpt-4o-mini'),
  DEFAULT_TOP_K: z.coerce.number().int().positive().default(12),
  DEFAULT_TOP_N: z.coerce.number().int().positive().default(5),
  MIN_RETRIEVAL_SCORE: z.coerce.number().min(0).max(1).default(0.65),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333)
});

export const env = envSchema.parse(process.env);
