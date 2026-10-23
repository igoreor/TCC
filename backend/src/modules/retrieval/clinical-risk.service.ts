import { containsAnyTerm } from '../../shared/text';
import { ClinicalRiskLevel, IntentCategory } from '../../shared/types';

// Estimativa do risco clínico da pergunta, exibida na nota de segurança. Depende só da pergunta e
// da intenção: antes, qualquer trecho recuperado de criticidade alta elevava o risco, e quase
// toda pergunta saía como "muito alto".

const VERY_HIGH_TERMS = [
  'prescrev*',
  'receita*',
  'qual dose',
  'quanto devo',
  'dosagem',
  'dose para',
  'ajustar a dose',
  'gestante*',
  'gravida*',
  'gravidez',
  'gestacao',
  'lactante*',
  'amamentacao',
  'amamentando',
  'crianca*',
  'pediatric*',
  'menor de idade',
  'menores de 15',
  'bebe*',
  'talidomida',
  'neurite',
  'deficit motor',
  'perda de forca',
  'paralisia',
  'olho*',
  'ocular*',
  'visao',
  'lagoftalmo',
  'recidiva',
  'efeito adverso grave',
  'eventos adversos graves',
  'falta de ar',
  'ictericia',
  'desmaio',
  'diagnostico definitivo',
  'tenho hanseniase',
  'parar o tratamento',
  'suspender',
  'interromper',
  'eritema nodoso',
  'enh'
];

// Perguntas sobre programa, metas e indicadores: informação de gestão, sem conduta clínica.
const PROGRAM_TERMS = [
  'estrategia*',
  'meta',
  'metas',
  'indicador*',
  'pilar*',
  'epidemiolog*',
  'casos novos',
  'municipios',
  'notificacao'
];

export class ClinicalRiskService {
  detectClinicalRisk(question: string, intent?: IntentCategory): ClinicalRiskLevel {
    if (containsAnyTerm(question, VERY_HIGH_TERMS)) return 'Muito alto';
    if (containsAnyTerm(question, PROGRAM_TERMS) || intent === 'safety') return 'Baixo';

    switch (intent) {
      case 'diagnosis':
      case 'classification':
      case 'exam':
      case 'treatment':
      case 'medication':
      case 'reaction':
      case 'disability_prevention':
      case 'contacts_surveillance':
      case 'screening':
        return 'Alto';
      default:
        return 'Médio';
    }
  }
}
