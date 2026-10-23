import { containsAnyTerm, normalizeText } from '../../shared/text';
import { ClinicalRiskLevel, UserType } from '../../shared/types';
import { clinicalDisclaimer, fallbackMessages } from './fallback-policy';

// Regras de segurança aplicadas antes da geração, por palavras inteiras e sem acentos. A recusa é
// reservada a pedidos que exigem avaliação individual: diagnóstico de um caso, prescrição para um
// paciente, situação de urgência relatada. Perguntas informativas sobre crianças, gestação ou
// reações são respondidas com base nos documentos, com risco elevado e recomendação de avaliação.

export interface SafetyDecision {
  answer?: string;
  fallbackTriggered: boolean;
  requiresProfessionalEvaluation: boolean;
  disclaimer: string;
  reason?: string;
  /** Situações que a resposta deve tratar com cautela explícita (repassadas ao modelo). */
  cautions: string[];
}

const URGENT_TERMS = [
  'emergencia',
  'urgente',
  'urgencia',
  'perdi o movimento',
  'perda de movimento',
  'perda subita',
  'paralisia',
  'paralisad*',
  'nao consigo mexer',
  'nao consigo abrir',
  'nao consigo fechar',
  'nao consigo enxergar',
  'perdi a visao',
  'visao embacada',
  'olho vermelho',
  'dor no olho',
  'dor intensa',
  'falta de ar',
  'ictericia',
  'pele amarela',
  'olhos amarelos',
  'desmaio',
  'desmaiou',
  'convulsao',
  'febre alta'
];

// Marcas de uma situação concreta e atual, e não de uma pergunta informativa.
const PERSONAL_SITUATION_TERMS = [
  'estou',
  'eu tenho',
  'tenho sentido',
  'sinto',
  'senti',
  'meu',
  'minha',
  'meu paciente',
  'minha paciente',
  'paciente esta',
  'paciente apresenta',
  'paciente com',
  'agora',
  'hoje',
  'ontem',
  'de repente',
  'neste momento'
];

const PERSONAL_DIAGNOSIS_TERMS = [
  'tenho hanseniase',
  'eu tenho hanseniase',
  'estou com hanseniase',
  'isso e hanseniase',
  'essa mancha e hanseniase',
  'esta mancha e hanseniase',
  'meu caso e hanseniase',
  'este caso e hanseniase',
  'confirme o diagnostico',
  'confirma o diagnostico',
  'confirmar o diagnostico do',
  'confirmar o diagnostico da',
  'confirmar o diagnostico deste',
  'confirmar o diagnostico desta',
  'diagnostico definitivo do',
  'diagnostico definitivo da',
  'fechar o diagnostico'
];

const INDIVIDUAL_PRESCRIPTION_TERMS = [
  'devo prescrever',
  'posso prescrever',
  'prescreva',
  'prescrever para',
  'receite',
  'me receita',
  'qual dose devo',
  'que dose devo',
  'qual dose posso',
  'quanto devo dar',
  'quanto posso dar',
  'quanto devo tomar',
  'quanto posso tomar',
  'posso tomar',
  'devo tomar',
  'posso dar',
  'devo dar',
  'posso parar',
  'devo parar',
  'posso suspender',
  'devo suspender',
  'posso interromper',
  'devo interromper',
  'ajuste a dose',
  'ajustar a dose do',
  'ajustar a dose da',
  'ajustar a dose de meu',
  'qual remedio eu',
  'qual medicamento eu'
];

// Para pacientes, qualquer pergunta sobre dose ou mudança de tratamento é encaminhada à equipe.
const PATIENT_MEDICATION_TERMS = [
  'dose',
  'doses',
  'dosagem',
  'mg',
  'posologia',
  'quantos comprimidos',
  'parar',
  'suspender',
  'interromper',
  'trocar o remedio',
  'trocar o medicamento'
];

const DOSE_TERMS = ['dose', 'doses', 'dosagem', 'mg', 'posologia'];

const CAUTION_RULES: Array<{ caution: string; terms: string[] }> = [
  {
    caution: 'gestacao',
    terms: [
      'gestante*',
      'gravida*',
      'gravidez',
      'gestacao',
      'lactante*',
      'amamentacao',
      'amamentando'
    ]
  },
  {
    caution: 'criancas',
    terms: ['crianca*', 'pediatric*', 'menor de idade', 'menores de 15', 'bebe*', 'infantil']
  },
  {
    caution: 'reacao_ou_neurite',
    terms: ['reacao', 'reacoes', 'neurite', 'eritema nodoso', 'enh', 'reacao reversa']
  },
  { caution: 'talidomida', terms: ['talidomida'] },
  { caution: 'dose', terms: DOSE_TERMS },
  { caution: 'sinais_de_alerta', terms: URGENT_TERMS }
];

export class SafetyService {
  evaluate(input: {
    question: string;
    inDomain: boolean;
    hasEvidence: boolean;
    riskLevel: ClinicalRiskLevel;
    userType?: UserType;
  }): SafetyDecision {
    const question = input.question;
    const cautions = CAUTION_RULES.filter((rule) => containsAnyTerm(question, rule.terms)).map(
      (rule) => rule.caution
    );

    if (!input.inDomain) {
      return this.block(fallbackMessages.outOfScope, false, 'out_of_scope', cautions);
    }

    // Para o profissional, a urgência relatada não bloqueia: a resposta traz a conduta descrita nos
    // documentos com o encaminhamento em destaque. Para o paciente, a orientação é procurar o serviço.
    if (
      input.userType === 'Paciente' &&
      containsAnyTerm(question, URGENT_TERMS) &&
      containsAnyTerm(question, PERSONAL_SITUATION_TERMS)
    ) {
      return this.block(fallbackMessages.emergency, true, 'emergency', cautions);
    }

    if (containsAnyTerm(question, PERSONAL_DIAGNOSIS_TERMS)) {
      return this.block(
        fallbackMessages.definitiveDiagnosis,
        true,
        'definitive_diagnosis',
        cautions
      );
    }

    const weightBasedDose =
      /\b\d{1,3}(?:[.,]\d)?\s?kg\b/.test(normalizeText(question)) &&
      containsAnyTerm(question, DOSE_TERMS);
    if (containsAnyTerm(question, INDIVIDUAL_PRESCRIPTION_TERMS) || weightBasedDose) {
      return this.block(
        input.userType === 'Paciente'
          ? fallbackMessages.prescriptionPatient
          : fallbackMessages.prescription,
        true,
        'prescription',
        cautions
      );
    }

    if (input.userType === 'Paciente' && containsAnyTerm(question, PATIENT_MEDICATION_TERMS)) {
      return this.block(fallbackMessages.prescriptionPatient, true, 'prescription', cautions);
    }

    if (!input.hasEvidence) {
      return this.block(
        fallbackMessages.insufficientEvidence,
        input.riskLevel !== 'Baixo',
        'insufficient_evidence',
        cautions
      );
    }

    return {
      fallbackTriggered: false,
      requiresProfessionalEvaluation:
        input.riskLevel === 'Alto' || input.riskLevel === 'Muito alto',
      disclaimer: clinicalDisclaimer,
      cautions
    };
  }

  appendDisclaimer(answer: string) {
    if (answer.includes(clinicalDisclaimer)) return answer;
    return `${answer}\n\n${clinicalDisclaimer}`;
  }

  private block(
    answer: string,
    requiresProfessionalEvaluation: boolean,
    reason: string,
    cautions: string[]
  ): SafetyDecision {
    return {
      answer: this.appendDisclaimer(answer),
      fallbackTriggered: true,
      requiresProfessionalEvaluation,
      disclaimer: clinicalDisclaimer,
      reason,
      cautions
    };
  }
}
