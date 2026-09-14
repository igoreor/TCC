import { IntentCategory } from '../../shared/types';

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

const categoryKeywords: Array<{ intent: IntentCategory; keywords: string[] }> = [
  {
    intent: 'reaction',
    keywords: ['reacao', 'neurite', 'nodulo', 'nodulos', 'febre', 'enh', 'eritema nodoso']
  },
  {
    intent: 'medication',
    keywords: ['rifampicina', 'dapsona', 'clofazimina', 'talidomida', 'prednisona', 'dose', 'medicamento']
  },
  {
    intent: 'treatment',
    keywords: ['tratamento', 'pqt', 'pqt-u', 'cura', 'parar', 'suspender', 'iniciar']
  },
  {
    intent: 'classification',
    keywords: ['pb', 'mb', 'paucibacilar', 'multibacilar', 'classificacao', 'classificar']
  },
  {
    intent: 'exam',
    keywords: ['baciloscopia', 'pcr', 'biopsia', 'sorologia', 'exame']
  },
  {
    intent: 'diagnosis',
    keywords: ['diagnostico', 'criterios', 'confirmar', 'criterio cardinal']
  },
  {
    intent: 'disability_prevention',
    keywords: ['incapacidade', 'mao em garra', 'pe caido', 'ferida no pe', 'ulcera', 'gif']
  },
  {
    intent: 'contacts_surveillance',
    keywords: ['contato', 'bcg', 'quem mora comigo', 'domiciliar', 'vigilancia', 'notificacao']
  },
  {
    intent: 'psychosocial',
    keywords: ['preconceito', 'estigma', 'medo', 'psicossocial', 'acolhimento']
  },
  {
    intent: 'safety',
    keywords: ['fonte', 'seguranca do sistema', 'rag', 'responder', 'funciona o sistema']
  },
  {
    intent: 'screening',
    keywords: ['mancha', 'dormencia', 'formigamento', 'sensibilidade', 'hanseniase', 'lepra', 'sintoma']
  }
];

export class IntentClassifierService {
  classify(question: string): IntentCategory {
    const normalized = normalize(question);

    for (const category of categoryKeywords) {
      if (category.keywords.some((keyword) => normalized.includes(keyword))) {
        return category.intent;
      }
    }

    return 'out_of_scope';
  }
}
