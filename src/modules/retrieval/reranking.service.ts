import { ChunkDTO, ClinicalRiskLevel, IntentCategory } from '../../shared/types';

function mentions(question: string, terms: string[]) {
  const normalized = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  return terms.some((term) => normalized.includes(term));
}

export class RerankingService {
  rerank(chunks: ChunkDTO[], context: { question: string; intent: IntentCategory; riskLevel: ClinicalRiskLevel }) {
    return [...chunks]
      .map((chunk) => {
        let boost = 0;

        if (chunk.clinicalCriticality === 'Muito alta' && context.riskLevel !== 'Baixo') boost += 0.12;
        if (chunk.safetyLevel === 'Alto risco' && context.riskLevel !== 'Baixo') boost += 0.1;
        if (context.intent === 'medication' && chunk.medicationRelated) boost += 0.12;
        if (context.intent === 'reaction' && chunk.reactionRelated) boost += 0.12;
        if (context.intent === 'diagnosis' && chunk.diagnosisRelated) boost += 0.12;
        if (context.intent === 'exam' && chunk.examRelated) boost += 0.12;
        if (mentions(context.question, ['gestante', 'gravida']) && chunk.targetDemographic === 'Gestante') {
          boost += 0.14;
        }
        if (mentions(context.question, ['crianca', 'pediatr']) && chunk.targetDemographic === 'Pediátrico') {
          boost += 0.14;
        }

        return {
          ...chunk,
          finalScore: Math.min(1, (chunk.finalScore ?? 0) + boost)
        };
      })
      .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
  }
}
