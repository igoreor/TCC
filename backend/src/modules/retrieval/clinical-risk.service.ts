import { ChunkDTO, ClinicalRiskLevel, IntentCategory } from '../../shared/types';

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export class ClinicalRiskService {
  detectClinicalRisk(question: string, retrievedChunks: ChunkDTO[] = [], intent?: IntentCategory): ClinicalRiskLevel {
    const normalized = normalize(question);

    const veryHighPatterns = [
      /prescrev|receit|qual dose|dosagem|dose para|ajustar dose/,
      /gestante|gravida|gravidez|lactante/,
      /crianca|pediatr|menor de idade|bebe/,
      /talidomida/,
      /neurite|deficit motor|perdi movimento|fraqueza|paralis/,
      /olho|ocular|visao|lagoftalmo/,
      /recidiva|voltou/,
      /efeito adverso grave|falta de ar|ictericia|desmaio/,
      /diagnostico definitivo|confirmar diagnostico|tenho hanseniase/,
      /parar|suspender|interromper|iniciar.*medic|comecar.*trat/
    ];

    if (veryHighPatterns.some((pattern) => pattern.test(normalized))) {
      return 'Muito alto';
    }

    if (
      retrievedChunks.some(
        (chunk) => chunk.safetyLevel === 'Alto risco' || chunk.clinicalCriticality === 'Muito alta'
      )
    ) {
      return 'Muito alto';
    }

    if (
      ['diagnosis', 'classification', 'exam', 'treatment', 'medication', 'contacts_surveillance', 'disability_prevention'].includes(
        intent ?? ''
      )
    ) {
      return 'Alto';
    }

    if (['screening', 'reaction'].includes(intent ?? '')) {
      return intent === 'reaction' ? 'Muito alto' : 'Alto';
    }

    if (['psychosocial', 'out_of_scope'].includes(intent ?? '')) {
      return 'Médio';
    }

    return 'Baixo';
  }
}
