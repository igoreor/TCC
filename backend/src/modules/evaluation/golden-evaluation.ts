import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { normalizeText } from '../../shared/text';
import { KNOWLEDGE_BASE_DIR } from '../knowledge/document-manifest';

// Avaliação do RAG com o conjunto de referência (knowledge-base/evaluation/golden-questions.json).
// As métricas são indicadores aproximados de recuperação, citação e completude: servem para
// comparar versões do sistema, não como prova de qualidade clínica.

const evidenceSchema = z.object({
  documentId: z.string(),
  pages: z.tuple([z.number().int().positive(), z.number().int().positive()]),
  note: z.string().optional()
});

export const goldenQuestionSchema = z.object({
  id: z.string(),
  category: z.enum([
    'predefinida',
    'direta',
    'combinacao',
    'sinonimo',
    'continuacao',
    'dificil',
    'sem_resposta',
    'divergencia',
    'seguranca',
    'regressao'
  ]),
  question: z.string().min(3),
  history: z.array(z.string()).optional(),
  userType: z.enum(['Profissional de saúde', 'Paciente', 'Desenvolvedor']).optional(),
  expected: z.enum(['responder', 'recusar', 'informar_lacuna']),
  expectedReason: z.string().optional(),
  evidence: z.array(evidenceSchema),
  keyFacts: z.array(z.array(z.string()).min(1))
});

export const goldenSetSchema = z.object({
  version: z.literal(1),
  description: z.string(),
  questions: z.array(goldenQuestionSchema).min(1)
});

export type GoldenQuestion = z.infer<typeof goldenQuestionSchema>;

export async function loadGoldenSet(
  file = path.join(KNOWLEDGE_BASE_DIR, 'evaluation', 'golden-questions.json')
) {
  return goldenSetSchema.parse(JSON.parse(await readFile(file, 'utf8')));
}

export interface ContextChunk {
  chunkId: string;
  documentId: string;
  pageStart: number | null;
  pageEnd: number | null;
}

export interface CaseOutput {
  answer: string;
  fallbackTriggered: boolean;
  reason?: string;
  /** Trechos enviados ao modelo, na ordem de relevância. */
  context: ContextChunk[];
  /** Fontes citadas na resposta. */
  cited: Array<ContextChunk & { verified: boolean | null }>;
}

function matchesEvidence(chunk: ContextChunk, evidence: GoldenQuestion['evidence'][number]) {
  return (
    chunk.documentId === evidence.documentId &&
    chunk.pageStart !== null &&
    chunk.pageEnd !== null &&
    chunk.pageStart <= evidence.pages[1] &&
    chunk.pageEnd >= evidence.pages[0]
  );
}

function compact(text: string) {
  return normalizeText(text).replace(/\s+/g, '');
}

// Frases com que a resposta declara a lacuna da base ("Os trechos não informam...", "Não há, nos
// documentos consultados, ...").
const GAP_PATTERN =
  /nao (encontrei|ha\b|existe|tratam|trazem|mencionam|abordam|descrevem|constam|contem|apresentam|informam|fornecem|citam|incluem|indicam|especificam|registram|foi possivel)|nenhum dos (documentos|trechos)/;

/** A resposta declara que a base não trata do assunto. */
export function declaresGap(answer: string) {
  return GAP_PATTERN.test(normalizeText(answer));
}

export function scoreCase(question: GoldenQuestion, output: CaseOutput) {
  const behaviour = output.fallbackTriggered ? 'recusou' : 'respondeu';
  const correctBehaviour =
    question.expected === 'responder'
      ? !output.fallbackTriggered
      : question.expected === 'recusar'
        ? output.fallbackTriggered &&
          (!question.expectedReason || output.reason === question.expectedReason)
        : output.fallbackTriggered || declaresGap(output.answer);

  const hasEvidence = question.evidence.length > 0;
  const hitAt = (k: number) =>
    hasEvidence
      ? output.context
          .slice(0, k)
          .some((chunk) => question.evidence.some((evidence) => matchesEvidence(chunk, evidence)))
      : null;
  const evidenceRecall = hasEvidence
    ? question.evidence.filter((evidence) =>
        output.context.some((chunk) => matchesEvidence(chunk, evidence))
      ).length / question.evidence.length
    : null;

  const citedMatching = output.cited.filter((chunk) =>
    question.evidence.some((evidence) => matchesEvidence(chunk, evidence))
  ).length;
  const citationPrecision =
    hasEvidence && output.cited.length && !output.fallbackTriggered
      ? citedMatching / output.cited.length
      : null;
  const checked = output.cited.filter((chunk) => chunk.verified !== null);
  const verifiedShare =
    checked.length && !output.fallbackTriggered
      ? checked.filter((chunk) => chunk.verified).length / checked.length
      : null;

  const answer = compact(output.answer);
  const keyFactCoverage =
    question.keyFacts.length && !output.fallbackTriggered
      ? question.keyFacts.filter((alternatives) =>
          alternatives.some((fact) => answer.includes(compact(fact)))
        ).length / question.keyFacts.length
      : question.keyFacts.length
        ? 0
        : null;

  return {
    id: question.id,
    category: question.category,
    question: question.question,
    expected: question.expected,
    behaviour,
    reason: output.reason ?? null,
    correctBehaviour,
    hitAt5: hitAt(5),
    hitAt8: hitAt(8),
    evidenceRecall,
    citationPrecision,
    verifiedShare,
    keyFactCoverage,
    cited: output.cited.length
  };
}

export type CaseScore = ReturnType<typeof scoreCase>;

function mean(values: Array<number | boolean | null>) {
  const valid = values.filter((value): value is number | boolean => value !== null).map(Number);
  return valid.length
    ? Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(3))
    : null;
}

export function summarize(scores: CaseScore[]) {
  const aggregate = (items: CaseScore[]) => ({
    cases: items.length,
    correctBehaviour: mean(items.map((item) => item.correctBehaviour)),
    recallAt5: mean(items.map((item) => item.hitAt5)),
    recallAt8: mean(items.map((item) => item.hitAt8)),
    evidenceRecall: mean(items.map((item) => item.evidenceRecall)),
    citationPrecision: mean(items.map((item) => item.citationPrecision)),
    verifiedCitations: mean(items.map((item) => item.verifiedShare)),
    keyFactCoverage: mean(items.map((item) => item.keyFactCoverage))
  });

  const categories = [...new Set(scores.map((score) => score.category))];
  return {
    overall: aggregate(scores),
    byCategory: Object.fromEntries(
      categories.map((category) => [
        category,
        aggregate(scores.filter((score) => score.category === category))
      ])
    )
  };
}
