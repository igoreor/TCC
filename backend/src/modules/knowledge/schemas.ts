import { z } from 'zod';
import { chunkMetadataSchema } from '../chunks/chunk-metadata.schema';

const optionalBooleanSchema = z.preprocess((value) => {
  if (value === undefined || value === '') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean().optional());

export const rawChunkSchema = z.object({
  chunk_id: z.string().min(3),
  document_id: z.string().min(2),
  title: z.string().min(2),
  section: z.string().min(2),
  subsection: z.string().optional().nullable().default(null),
  content: z.string().min(10),
  metadata: chunkMetadataSchema
});

// Trecho de documento oficial gerado por npm run kb:build: o formato da base inicial mais a
// localização no documento (páginas do PDF, números impressos e caminho de seções).
export const documentChunkSchema = rawChunkSchema.extend({
  chunk_index: z.number().int().min(0),
  section_path: z.array(z.string()),
  page_start: z.number().int().positive(),
  page_end: z.number().int().positive(),
  page_label_start: z.string().nullable(),
  page_label_end: z.string().nullable()
});

export const ingestJsonlSchema = z
  .object({
    filePath: z.string().optional(),
    content: z.string().optional()
  })
  .refine((value) => Boolean(value.filePath || value.content), {
    message: 'Informe filePath ou content com JSONL.'
  });

export const searchFiltersSchema = z
  .object({
    documentId: z.string().optional(),
    clinicalPhase: z.string().optional(),
    informationType: z.string().optional(),
    targetDemographic: z.string().optional(),
    clinicalCriticality: z.string().optional(),
    diseaseClassification: z.string().optional(),
    medicationRelated: optionalBooleanSchema,
    diagnosisRelated: optionalBooleanSchema,
    reactionRelated: optionalBooleanSchema,
    examRelated: optionalBooleanSchema,
    safetyLevel: z.string().optional()
  })
  .default({});

export const retrievalSearchSchema = z.object({
  question: z.string().min(3),
  mode: z.enum(['vector', 'text', 'hybrid']).default('hybrid'),
  topK: z.number().int().positive().max(50).optional(),
  topN: z.number().int().positive().max(20).optional(),
  filters: searchFiltersSchema.optional().default({})
});

export const askSchema = z.object({
  question: z.string().min(3),
  userType: z.enum(['Profissional de saúde', 'Paciente', 'Desenvolvedor']).default('Profissional de saúde'),
  sessionId: z.string().uuid().optional(),
  filters: searchFiltersSchema.optional().default({})
});

// O usuário vem da sessão: campos como `userId` no corpo são descartados pela validação.
export const feedbackSchema = z.object({
  messageId: z.string().uuid(),
  rating: z.number().int().min(0).max(10),
  comment: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => value || undefined)
});

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256)
});

export type RawChunkInput = z.input<typeof rawChunkSchema>;
export type NormalizedChunkInput = z.output<typeof rawChunkSchema>;
