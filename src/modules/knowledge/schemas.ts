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

export const feedbackSchema = z.object({
  messageId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  reviewedBySpecialist: z.boolean().default(false)
});

export type RawChunkInput = z.input<typeof rawChunkSchema>;
export type NormalizedChunkInput = z.output<typeof rawChunkSchema>;
