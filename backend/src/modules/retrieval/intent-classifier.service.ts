import { containsAnyTerm } from '../../shared/text';
import { IntentCategory } from '../../shared/types';

// Classificação da intenção por palavras inteiras (sem acentos). A intenção descreve o assunto da
// pergunta para o registro e para a estimativa de risco; ela não decide o escopo: uma pergunta sem
// palavra-chave reconhecida fica como "geral", e não "fora de escopo".

const categoryKeywords: Array<{ intent: IntentCategory; keywords: string[] }> = [
  {
    intent: 'reaction',
    keywords: [
      'reacao',
      'reacoes',
      'reacao reversa',
      'neurite',
      'neurites',
      'nodulo*',
      'eritema nodoso',
      'enh',
      'episodio reacional',
      'episodios reacionais'
    ]
  },
  {
    intent: 'medication',
    keywords: [
      'rifampicina',
      'dapsona',
      'clofazimina',
      'talidomida',
      'prednisona',
      'ofloxacino',
      'minociclina',
      'dose',
      'doses',
      'dosagem',
      'posologia',
      'medicamento*',
      'remedio*'
    ]
  },
  {
    intent: 'treatment',
    keywords: [
      'tratamento*',
      'tratar',
      'trata',
      'pqt',
      'pqt-u',
      'poliquimioterapia',
      'cura',
      'curar',
      'esquema terapeutico',
      'alta por cura'
    ]
  },
  {
    intent: 'classification',
    keywords: [
      'pb',
      'mb',
      'paucibacilar*',
      'multibacilar*',
      'classificacao',
      'classificar',
      'forma clinica',
      'formas clinicas'
    ]
  },
  {
    intent: 'exam',
    keywords: [
      'baciloscopia',
      'biopsia',
      'histopatolog*',
      'exame*',
      'teste rapido',
      'qpcr',
      'pcr',
      'eletroneuromiogra*',
      'ultrassom',
      'sorologia'
    ]
  },
  {
    intent: 'diagnosis',
    keywords: [
      'diagnostico',
      'diagnosticar',
      'criterio*',
      'sinais cardinais',
      'sinal cardinal',
      'definicao de caso',
      'confirmar'
    ]
  },
  {
    intent: 'disability_prevention',
    keywords: [
      'incapacidade*',
      'mao em garra',
      'pe caido',
      'ulcera*',
      'gif',
      'autocuidado',
      'reabilitacao',
      'deformidade*'
    ]
  },
  {
    intent: 'contacts_surveillance',
    keywords: [
      'contato*',
      'bcg',
      'quem mora comigo',
      'domiciliar*',
      'vigilancia',
      'notificacao',
      'notificar',
      'profilaxia',
      'quimioprofilaxia',
      'estrategia*',
      'meta',
      'metas',
      'indicador*',
      'epidemiolog*',
      'casos novos',
      'pilar*'
    ]
  },
  {
    intent: 'psychosocial',
    keywords: ['preconceito', 'estigma', 'discriminacao', 'medo', 'psicossocial', 'acolhimento']
  },
  {
    intent: 'safety',
    keywords: ['seguranca do sistema', 'como o sistema funciona', 'fontes do sistema', 'rag']
  },
  {
    intent: 'screening',
    keywords: [
      'mancha*',
      'dormencia',
      'dormente',
      'formigamento',
      'sensibilidade',
      'sintoma*',
      'sinais',
      'suspeita',
      'suspeitar',
      'encaminh*',
      'hanseniase',
      'lepra'
    ]
  }
];

export class IntentClassifierService {
  classify(question: string): IntentCategory {
    return (
      categoryKeywords.find((category) => containsAnyTerm(question, category.keywords))?.intent ??
      'general'
    );
  }
}
