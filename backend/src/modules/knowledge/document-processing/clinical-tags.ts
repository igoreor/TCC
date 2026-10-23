import { containsAnyTerm, matchedTerms } from '../../../shared/text';

// Metadados clínicos dos trechos de documentos oficiais, derivados por regras a partir do título
// da seção e do conteúdo. Servem aos filtros do painel e aos registros; não são usados como fato
// clínico nem alteram a ordem das fontes.

type Phase =
  | 'Screening'
  | 'Diagnosis'
  | 'Classification'
  | 'Exam'
  | 'Treatment'
  | 'Reaction_Management'
  | 'Disability_Prevention'
  | 'Follow_Up'
  | 'Surveillance'
  | 'Psychosocial'
  | 'Safety'
  | 'Technical';

// Ordem importa: a primeira regra que casar com o caminho de seções define a fase.
const PHASE_RULES: Array<{ phase: Phase; terms: string[] }> = [
  {
    phase: 'Reaction_Management',
    terms: [
      'reac*',
      'reaction*',
      'neurite',
      'neuritis',
      'eritema nodoso',
      'enl',
      'talidomida',
      'thalidomide'
    ]
  },
  {
    phase: 'Disability_Prevention',
    terms: [
      'incapacidade*',
      'disabilit*',
      'autocuidado',
      'reabilitac*',
      'curativo*',
      'calcado*',
      'nerve function',
      'avaliacao neurologica',
      'sensory testing',
      'muscle testing',
      'intervencoes cirurgicas'
    ]
  },
  {
    phase: 'Classification',
    terms: ['classificacao operacional', 'paucibacilar*', 'multibacilar*', 'formas clinicas']
  },
  {
    phase: 'Exam',
    terms: [
      'exame*',
      'baciloscopia',
      'histopatolog*',
      'ultrassom',
      'eletroneuromiogra*',
      'teste rapido',
      'biologia molecular',
      'qpcr'
    ]
  },
  { phase: 'Screening', terms: ['suspeicao', 'deteccao', 'rastreamento', 'busca ativa'] },
  {
    phase: 'Diagnosis',
    terms: ['diagnost*', 'definicao de caso', 'aspectos clinicos', 'manifestac*', 'diagnosis']
  },
  {
    phase: 'Follow_Up',
    terms: [
      'monitoramento durante',
      'monitoramento apos',
      'caderneta',
      'acompanhamento',
      'follow up',
      'follow-up'
    ]
  },
  {
    phase: 'Treatment',
    terms: [
      'tratamento*',
      'terapeutic*',
      'medicamento*',
      'poliquimioterapia',
      'resistencia',
      'treatment',
      'casos especiais',
      'comorbidade*'
    ]
  },
  {
    phase: 'Psychosocial',
    terms: ['psicossocial', 'estigma', 'stigma', 'discrimina*', 'direitos humanos']
  },
  {
    phase: 'Surveillance',
    terms: [
      'contato*',
      'vigilancia',
      'profilaxia',
      'prophylaxis',
      'epidemiolog*',
      'indicadores',
      'metas',
      'pilar*',
      'estrategi*',
      'monitoramento',
      'cenario',
      'dados'
    ]
  }
];

const MEDICATION_TERMS = [
  'rifampicina',
  'dapsona',
  'clofazimina',
  'talidomida',
  'prednisona',
  'ofloxacino',
  'minociclina',
  'claritromicina',
  'moxifloxacino',
  'medicamento*',
  'pqt',
  'pqt-u',
  'poliquimioterapia',
  'rifampicin',
  'dapsone',
  'clofazimine',
  'thalidomide',
  'prednisolone',
  'corticosteroid*',
  'corticoide*'
];
const DOSAGE_PATTERN = /\b\d+(?:[.,]\d+)?\s?(?:mg|g|mcg)(?:\/kg)?\b|\bdose[s]?\b|\bposologia\b/i;
const CONTRAINDICATION_TERMS = [
  'contraindica*',
  'contra-indica*',
  'nao deve ser usad*',
  'contraindicated'
];
const EXAM_TERMS = [
  'baciloscopia',
  'histopatolog*',
  'biopsia',
  'exame*',
  'teste rapido',
  'qpcr',
  'eletroneuromiogra*',
  'ultrassom',
  'sorolog*',
  'skin smear'
];
const DIAGNOSIS_TERMS = [
  'diagnost*',
  'sinais cardinais',
  'definicao de caso',
  'suspeicao',
  'cardinal sign*',
  'diagnosis'
];
const REACTION_TERMS = [
  'reacao hansenica',
  'reacoes hansenicas',
  'reacao tipo 1',
  'reacao tipo 2',
  'reacao reversa',
  'neurite',
  'eritema nodoso',
  'enh',
  'type 1 reaction',
  'type 2 reaction',
  'neuritis',
  'enl'
];

export interface DocumentDefaults {
  /** Diretriz clínica, documento estratégico etc.: define o tipo de informação padrão. */
  documentType: 'Protocolo clínico' | 'Diretriz' | 'Orientação técnica' | 'Estratégia';
  sourceType:
    | 'Protocolo oficial'
    | 'Diretriz'
    | 'Documento técnico'
    | 'Relatório técnico'
    | 'Artigo';
}

export function deriveClinicalTags(
  sectionPath: string[],
  content: string,
  defaults: DocumentDefaults
) {
  const sectionText = sectionPath.join(' > ');
  // Documentos estratégicos tratam de gestão do programa: "casos novos com GIF2 no diagnóstico"
  // é uma meta, não um critério diagnóstico.
  const phase: Phase =
    defaults.documentType === 'Estratégia'
      ? containsAnyTerm(sectionText, ['estigma', 'discrimina*', 'direitos humanos'])
        ? 'Psychosocial'
        : 'Surveillance'
      : (PHASE_RULES.find((rule) => containsAnyTerm(sectionText, rule.terms))?.phase ??
        'Technical');

  const scope = `${sectionText}\n${content}`;
  const medicationRelated = containsAnyTerm(scope, MEDICATION_TERMS);
  const dosageRelated = DOSAGE_PATTERN.test(content) && medicationRelated;
  const reactionRelated = containsAnyTerm(scope, REACTION_TERMS);

  const informationType =
    defaults.documentType === 'Estratégia'
      ? containsAnyTerm(sectionText, ['dados', 'epidemiolog*', 'cenario', 'no brasil', 'no mundo'])
        ? 'Epidemiological_Data'
        : 'Public_Health'
      : phase === 'Treatment' && medicationRelated
        ? 'Pharmacological_Info'
        : phase === 'Diagnosis' || phase === 'Classification'
          ? 'Diagnostic_Criteria'
          : phase === 'Surveillance'
            ? 'Public_Health'
            : 'Clinical_Guideline';

  const targetDemographic = containsAnyTerm(sectionText, [
    'menores de 15',
    'criancas',
    'crianca',
    'children',
    'pediatr*'
  ])
    ? 'Pediátrico'
    : containsAnyTerm(sectionText, [
          'gestac*',
          'gestante*',
          'maes e filhos',
          'pregnan*',
          'amamentacao',
          'concepcao'
        ])
      ? 'Gestante'
      : containsAnyTerm(sectionText, ['contato*', 'contacts', 'profilaxia', 'prophylaxis'])
        ? 'Contato domiciliar'
        : 'Geral';

  const clinicalCriticality =
    dosageRelated ||
    [
      'Treatment',
      'Reaction_Management',
      'Diagnosis',
      'Classification',
      'Exam',
      'Disability_Prevention'
    ].includes(phase)
      ? 'Alta'
      : phase === 'Technical'
        ? 'Baixa'
        : 'Média';

  const safetyLevel =
    medicationRelated || reactionRelated || ['Treatment', 'Reaction_Management'].includes(phase)
      ? 'Requer confirmação profissional'
      : 'Educativo';

  return {
    clinical_phase: phase,
    information_type: informationType,
    target_user: defaults.documentType === 'Estratégia' ? 'Gestor' : 'Profissional de saúde',
    target_demographic: targetDemographic,
    clinical_criticality: clinicalCriticality,
    disease_classification: containsAnyTerm(sectionText, ['paucibacilar*'])
      ? 'PB'
      : containsAnyTerm(sectionText, ['multibacilar*'])
        ? 'MB'
        : containsAnyTerm(sectionText, ['tuberculoide'])
          ? 'Tuberculoide'
          : containsAnyTerm(sectionText, ['virchowiana'])
            ? 'Virchowiana'
            : containsAnyTerm(sectionText, ['dimorfa'])
              ? 'Dimorfa'
              : containsAnyTerm(sectionText, ['indeterminada'])
                ? 'Indeterminada'
                : 'Não aplicável',
    medication_related: medicationRelated,
    dosage_related: dosageRelated,
    contraindication_related: containsAnyTerm(content, CONTRAINDICATION_TERMS),
    exam_related: containsAnyTerm(scope, EXAM_TERMS),
    diagnosis_related: containsAnyTerm(scope, DIAGNOSIS_TERMS),
    reaction_related: reactionRelated,
    safety_level: safetyLevel,
    entities: matchedTerms(
      content,
      MEDICATION_TERMS.filter((term) => !term.endsWith('*'))
    )
  };
}
