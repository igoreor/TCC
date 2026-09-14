import { z } from 'zod';

export const clinicalPhaseSchema = z.enum([
  'Screening',
  'Diagnosis',
  'Classification',
  'Exam',
  'Treatment',
  'Reaction_Management',
  'Disability_Prevention',
  'Follow_Up',
  'Surveillance',
  'Psychosocial',
  'Safety',
  'Technical'
]);

export const informationTypeSchema = z.enum([
  'Clinical_Guideline',
  'Epidemiological_Data',
  'Pharmacological_Info',
  'Diagnostic_Criteria',
  'Differential_Diagnosis',
  'Public_Health',
  'Safety_Policy',
  'Technical_Implementation'
]);

export const targetUserSchema = z.enum([
  'Profissional de saúde',
  'Paciente',
  'Desenvolvedor',
  'Gestor'
]);

export const targetDemographicSchema = z.enum([
  'Adulto',
  'Pediátrico',
  'Gestante',
  'Contato domiciliar',
  'Geral'
]);

export const clinicalCriticalitySchema = z.enum(['Baixa', 'Média', 'Alta', 'Muito alta']);

export const sourceTypeSchema = z.enum([
  'Relatório técnico',
  'Protocolo oficial',
  'Diretriz',
  'Artigo',
  'Documento técnico'
]);

export const diseaseClassificationSchema = z.enum([
  'PB',
  'MB',
  'Indeterminada',
  'Tuberculoide',
  'Dimorfa',
  'Virchowiana',
  'Não aplicável'
]);

export const safetyLevelSchema = z.enum([
  'Educativo',
  'Requer confirmação profissional',
  'Encaminhar serviço de saúde',
  'Alto risco'
]);

export const chunkMetadataSchema = z.object({
  clinical_phase: clinicalPhaseSchema.default('Technical'),
  information_type: informationTypeSchema.default('Clinical_Guideline'),
  target_user: targetUserSchema.default('Profissional de saúde'),
  target_demographic: targetDemographicSchema.default('Geral'),
  clinical_criticality: clinicalCriticalitySchema.default('Média'),
  source_type: sourceTypeSchema.default('Documento técnico'),
  source_name: z.string().default('Base técnica inicial de hanseníase'),
  source_page: z.number().int().positive().nullable().default(null),
  source_reference: z.string().default('Seed técnico local para desenvolvimento e validação inicial'),
  keywords: z.array(z.string()).default([]),
  entities: z.array(z.string()).default([]),
  disease_classification: diseaseClassificationSchema.default('Não aplicável'),
  medication_related: z.boolean().default(false),
  dosage_related: z.boolean().default(false),
  contraindication_related: z.boolean().default(false),
  exam_related: z.boolean().default(false),
  diagnosis_related: z.boolean().default(false),
  reaction_related: z.boolean().default(false),
  safety_level: safetyLevelSchema.default('Educativo'),
  last_reviewed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .default('2026-06-11'),
  answer_policy: z
    .string()
    .default('Responder somente com base nos chunks recuperados, citando fontes e sinalizando incerteza.')
});

export type ChunkMetadataInput = z.input<typeof chunkMetadataSchema>;
export type ChunkMetadata = z.output<typeof chunkMetadataSchema>;
