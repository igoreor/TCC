import { ChunkDTO, ClinicalRiskLevel, IntentCategory } from '../../shared/types';
import { clinicalDisclaimer, fallbackMessages } from './fallback-policy';

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export interface SafetyDecision {
  answer?: string;
  fallbackTriggered: boolean;
  requiresProfessionalEvaluation: boolean;
  disclaimer: string;
  reason?: string;
}

export class SafetyService {
  evaluate(input: {
    question: string;
    chunks: ChunkDTO[];
    intent: IntentCategory;
    riskLevel: ClinicalRiskLevel;
  }): SafetyDecision {
    const normalized = normalize(input.question);

    if (input.intent === 'out_of_scope') {
      return this.block(fallbackMessages.outOfScope, true, 'out_of_scope');
    }

    if (/(gestante|gravida|gravidez)/.test(normalized)) {
      return this.block(fallbackMessages.pregnancy, true, 'pregnancy');
    }

    if (/(crianca|pediatr|bebe|menor de idade)/.test(normalized)) {
      return this.block(fallbackMessages.child, true, 'child');
    }

    if (
      /(emergencia|urgente|perdi movimento|paralis|fraqueza|olho|ocular|visao|falta de ar|ictericia|desmaio)/.test(
        normalized
      )
    ) {
      return this.block(fallbackMessages.emergency, true, 'emergency');
    }

    if (/(neurite|reacao grave|deficit motor|eritema nodoso|enh)/.test(normalized)) {
      return this.block(fallbackMessages.severeReaction, true, 'severe_reaction');
    }

    if (
      /(diagnostico definitivo|confirmar diagnostico|tenho hanseniase|(isso|essa mancha|este caso|meu caso) e hanseniase\?)/.test(
        normalized
      )
    ) {
      return this.block(fallbackMessages.definitiveDiagnosis, true, 'definitive_diagnosis');
    }

    if (
      /(prescrev|receit|qual dose|dosagem|dose para|ajustar|posso tomar|parar|suspender|interromper|iniciar|comecar)/.test(
        normalized
      )
    ) {
      return this.block(fallbackMessages.prescription, true, 'prescription');
    }

    if (!input.chunks.length) {
      return this.block(fallbackMessages.insufficientEvidence, input.riskLevel !== 'Baixo', 'insufficient_evidence');
    }

    return {
      fallbackTriggered: false,
      requiresProfessionalEvaluation: input.riskLevel === 'Alto' || input.riskLevel === 'Muito alto',
      disclaimer: clinicalDisclaimer
    };
  }

  appendDisclaimer(answer: string) {
    if (answer.includes(clinicalDisclaimer)) return answer;
    return `${answer}\n\n${clinicalDisclaimer}`;
  }

  private block(answer: string, requiresProfessionalEvaluation: boolean, reason: string): SafetyDecision {
    return {
      answer: this.appendDisclaimer(answer),
      fallbackTriggered: true,
      requiresProfessionalEvaluation,
      disclaimer: clinicalDisclaimer,
      reason
    };
  }
}
