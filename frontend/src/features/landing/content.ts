import type { IntentCategory, SafetyInfo, SourceCitation } from '../../api/types'

export const heroContent = {
  eyebrow: 'Apoio à decisão clínica em hanseníase',
  title: { lead: 'Respostas sobre hanseníase que mostram ', emphasis: 'de onde vieram', end: '.' },
  lede: 'O NexoHansen redige cada resposta a partir de documentos oficiais, como o protocolo clínico do Ministério da Saúde e as diretrizes da OMS, e indica o documento, a seção e a página de cada informação. Quando os documentos não tratam do assunto, ou a pergunta pede diagnóstico ou prescrição para um caso específico, ele diz isso e explica o motivo.',
  primaryCta: 'Fazer uma consulta',
  secondaryCta: 'Como funciona',
  facts: [
    { term: 'Público', detail: 'Profissionais e estudantes da área da saúde.' },
    {
      term: 'Escopo',
      detail: 'Hanseníase: suspeição, diagnóstico, classificação, tratamento, reações, incapacidades e contatos.',
    },
    { term: 'Estágio', detail: 'Protótipo acadêmico, ainda não validado para uso clínico.' },
  ],
}

interface FigureExample {
  question: string
  intent: IntentCategory
  answer: string
  sources: SourceCitation[]
  safety: SafetyInfo
}

// Metadados do PCDT como constam de backend/knowledge-base/manifest.json.
const pcdtDocument = {
  title: 'Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase',
  short_title: 'PCDT da Hanseníase',
  institution: 'Ministério da Saúde (Brasil)',
  year: 2022,
  edition: '1ª edição – 2022 – versão eletrônica',
  isbn: '978-65-5993-397-6',
  language: 'pt',
  jurisdiction: 'nacional',
  document_type: 'Protocolo clínico',
  status: 'vigente',
  official_url: 'https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_clinico_diretrizes_terapeuticas_hanseniase.pdf',
  notes: null,
}
const pcdtFile =
  'https://www.gov.br/conitec/pt-br/midias/protocolos/publicacoes_ms/copy_of_20230131_PCDT_Hanseniase_2022_eletronica_ISBN.pdf/@@download/file'

/**
 * Exemplo da Fig. 1, renderizado pelos mesmos componentes da consulta real. O texto usa apenas o
 * conteúdo de dois trechos do PCDT (seções 7.2 e 6.2), citados com as frases originais. Intenção
 * e risco reproduzem o que o backend calcula para esta pergunta.
 */
export const figureExample: FigureExample = {
  question: 'Baciloscopia negativa exclui hanseníase?',
  intent: 'exam',
  answer:
    'Não. A baciloscopia tem alta especificidade, mas baixa sensibilidade: o resultado é negativo nos casos paucibacilares, o que não exclui o diagnóstico da hanseníase [1]. O diagnóstico é eminentemente clínico, e a presença do M. leprae na baciloscopia é um dos sinais cardinais, ao lado da lesão de pele com alteração de sensibilidade e do espessamento de nervo periférico [2].',
  sources: [
    {
      index: 1,
      chunk_id: 'ms-pcdt-hanseniase-2022:0039',
      document_id: 'ms-pcdt-hanseniase-2022',
      title: '7.2 Baciloscopia direta para bacilos álcool-ácido resistentes (BAAR)',
      section: '7 Exames de apoio ao diagnóstico',
      section_path: ['7 Exames de apoio ao diagnóstico', '7.2 Baciloscopia direta para bacilos álcool-ácido resistentes (BAAR)'],
      source_page: 44,
      page_label: '44–45',
      pdf_page: 46,
      pdf_page_end: 47,
      document: pcdtDocument,
      url: `${pcdtFile}#page=46`,
      reference:
        'Ministério da Saúde (Brasil). Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase. 2022. Seção 7.2 Baciloscopia direta para bacilos álcool-ácido resistentes (BAAR). p. 44–45.',
      excerpt:
        'Embora a baciloscopia se caracterize por alta especificidade, baixo custo e execução relativamente simples quando realizada por profissionais capacitados, o exame tem baixa sensibilidade, resultando negativo nos casos paucibacilares, o que absolutamente não exclui o diagnóstico da hanseníase.',
      verified: true,
    },
    {
      index: 2,
      chunk_id: 'ms-pcdt-hanseniase-2022:0014',
      document_id: 'ms-pcdt-hanseniase-2022',
      title: '6.2 Definição de caso',
      section: '6 Aspectos clínicos',
      section_path: ['6 Aspectos clínicos', '6.2 Definição de caso'],
      source_page: 26,
      page_label: '26',
      pdf_page: 28,
      pdf_page_end: 28,
      document: pcdtDocument,
      url: `${pcdtFile}#page=28`,
      reference:
        'Ministério da Saúde (Brasil). Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase. 2022. Seção 6.2 Definição de caso. p. 26.',
      excerpt:
        'O diagnóstico da hanseníase é eminentemente clínico e a maioria dos casos pode ser confirmada no nível da Atenção Primária à Saúde. […] O Ministério da Saúde do Brasil define um caso de hanseníase pela presença de pelo menos um ou mais dos seguintes critérios, conhecidos como sinais cardinais da hanseníase: 1) Lesão(ões) e/ou áreas(s) da pele com alteração de sensibilidade térmica e/ou dolorosa e/ou tátil; 2) Espessamento de nervo periférico, associado a alterações sensitivas e/ou motoras e/ou autonômicas; 3) Presença do M. leprae, confirmada na baciloscopia de esfregaço intradérmico ou na biópsia de pele.',
      verified: true,
    },
  ],
  safety: {
    riskLevel: 'Alto',
    fallbackTriggered: false,
    requiresProfessionalEvaluation: true,
    disclaimer:
      'Este sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde.',
  },
}

export const figureContent = {
  caption: 'Exemplo ilustrativo de consulta, montado com trechos do PCDT da Hanseníase (Ministério da Saúde, 2022).',
  notes: [
    'Pergunta, escrita em linguagem clínica.',
    'Resposta redigida a partir dos trechos recuperados, com marcadores que apontam para as fontes.',
    'Nota de segurança: risco clínico do tema e necessidade de avaliação presencial.',
    'Fontes: documento, instituição, ano, seção e página, com link para o documento e o trecho original.',
  ],
  tryIt: 'Enviar esta pergunta ao sistema',
}

export type MethodStepId = 'leitura' | 'busca' | 'reordenacao' | 'seguranca' | 'resposta' | 'registro'

// Etapas na ordem de backend/src/modules/chat/chat.service.ts e retrieval.service.ts.
export const methodContent = {
  label: 'Método',
  title: 'Como uma resposta é construída',
  intro:
    'As etapas seguem sempre esta ordem. A verificação de segurança acontece antes de qualquer texto ser redigido.',
  steps: [
    {
      id: 'leitura',
      title: 'Leitura da pergunta',
      description:
        'Toda pergunta é lida no contexto da hanseníase, mesmo sem citar a doença, e perguntas de continuação ("E para crianças?") são completadas com a conversa. Siglas e sinônimos são expandidos para a busca.',
    },
    {
      id: 'busca',
      title: 'Busca híbrida',
      description:
        'A busca semântica, por vetores, e a busca textual, sem distinção de acentos, procuram trechos ao mesmo tempo. Os resultados são combinados pela posição de cada trecho em cada lista.',
    },
    {
      id: 'reordenacao',
      title: 'Evidência e risco',
      description:
        'Se nenhum trecho tiver relação suficiente com a pergunta, uma segunda busca, mais ampla, é feita antes de concluir que os documentos não tratam do assunto. O risco clínico é estimado pela pergunta.',
    },
    {
      id: 'seguranca',
      title: 'Verificação de segurança',
      description:
        'Pedidos de diagnóstico ou de prescrição para um caso específico e perguntas fora do tema são recusados com orientação. Gestação, crianças e reações são respondidas com base nos documentos e com destaque para a avaliação presencial.',
    },
    {
      id: 'resposta',
      title: 'Resposta com fontes',
      description:
        'O modelo de linguagem recebe só os trechos selecionados, com documento, seção e página, e deve citar cada afirmação. As citações são conferidas automaticamente. Sem um modelo configurado, o sistema apresenta as frases dos próprios trechos.',
    },
    {
      id: 'registro',
      title: 'Registro',
      description:
        'Pergunta, trechos, pontuações, decisão de segurança e resposta final ficam gravados no banco de dados, o que permite auditar cada consulta depois.',
    },
  ] satisfies Array<{ id: MethodStepId; title: string; description: string }>,
}

// Mensagens copiadas na íntegra de backend/src/modules/safety/fallback-policy.ts;
// gatilhos resumidos das regras de backend/src/modules/safety/safety.service.ts.
export const limitsContent = {
  label: 'Limites',
  title: 'O que o NexoHansen não faz',
  statement:
    'É um recurso de apoio informacional. Não confirma diagnóstico nem prescreve para um caso específico e não substitui a avaliação presencial por um profissional de saúde.',
  columns: { situation: 'Situação identificada', response: 'Resposta do sistema, na íntegra' },
  refusals: [
    {
      code: 'definitive_diagnosis',
      situation: 'Diagnóstico de um caso específico',
      triggers: '“Tenho hanseníase?”, “essa mancha é hanseníase?”, “confirme o diagnóstico do meu paciente”',
      message:
        'Não é possível confirmar o diagnóstico de um caso específico sem exame clínico presencial. Posso explicar os critérios que os documentos oficiais descrevem para a suspeição e a confirmação diagnóstica.',
    },
    {
      code: 'prescription',
      situation: 'Prescrição para um paciente específico',
      triggers: '“Qual dose devo prescrever?”, dose calculada por peso, “posso parar o tratamento?”',
      message:
        'Não indico dose nem conduta para um paciente específico. Posso apresentar os esquemas padronizados descritos nos documentos oficiais (por exemplo: "Qual é o esquema da PQT-U para adultos segundo o PCDT?"), mas a prescrição cabe ao profissional responsável, com a avaliação do paciente.',
    },
    {
      code: 'emergency',
      situation: 'Urgência relatada no perfil paciente',
      triggers: 'Perda de movimento, alteração visual, falta de ar ou desmaio descritos como situação atual',
      message:
        'Os sinais descritos podem exigir avaliação presencial urgente. Procure imediatamente um serviço de saúde.',
    },
    {
      code: 'out_of_scope',
      situation: 'Pergunta sobre outro assunto',
      triggers: 'Tema explicitamente alheio à hanseníase, como outra doença ou finanças',
      message:
        'Esta consulta é dedicada à hanseníase, e a pergunta parece tratar de outro assunto. Se ela se refere à hanseníase (por exemplo, a uma comorbidade em pessoa com hanseníase), reformule mencionando a doença.',
    },
    {
      code: 'insufficient_evidence',
      situation: 'Documentos sem informação sobre o tema',
      triggers: 'Nem a busca ampliada encontra trechos relacionados à pergunta',
      message:
        'Não encontrei, nos documentos oficiais da base, informação suficiente para responder a esta pergunta com segurança. A base reúne o Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase (Ministério da Saúde, 2022), a Estratégia Nacional para Enfrentamento à Hanseníase 2024–2030 e documentos da Organização Mundial da Saúde. Consulte o protocolo vigente ou o serviço de referência.',
    },
  ],
  footnote:
    'Perguntas sobre gestação, crianças, reações hansênicas e doses padronizadas não são recusadas: a resposta vem dos documentos, com risco clínico elevado e destaque para a avaliação presencial. As regras reconhecem padrões no texto e podem não identificar todas as formulações; por isso, toda resposta termina com o mesmo aviso de que o sistema não substitui a avaliação presencial.',
}

// Espelha backend/knowledge-base/manifest.json e os trechos em knowledge-base/processed (23/10/2026).
export const knowledgeBaseContent = {
  label: 'Base de conhecimento',
  title: 'Os documentos consultados',
  description:
    'Documentos oficiais brasileiros e da Organização Mundial da Saúde, divididos em trechos que guardam a seção e a página de origem. Quando o protocolo brasileiro e a OMS divergem, a resposta apresenta as duas posições.',
  caveat:
    'Os documentos são processados automaticamente a partir dos PDFs oficiais; tabelas e fluxogramas podem perder a formatação original. Confira a informação no documento pelo link de cada fonte.',
  stats: [
    { term: 'Documentos', value: '5' },
    { term: 'Trechos', value: '328' },
    { term: 'Processados', value: 'out. 2026' },
  ],
  columns: { topic: 'Documento', count: 'Trechos' },
  topics: [
    {
      title: 'Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase',
      detail: 'Ministério da Saúde, 2022 · diretriz brasileira para diagnóstico, tratamento e acompanhamento',
      chunks: 131,
    },
    {
      title: 'Estratégia Nacional para Enfrentamento à Hanseníase 2024-2030',
      detail: 'Ministério da Saúde, 2024 · metas, ações estratégicas e monitoramento',
      chunks: 39,
    },
    {
      title: 'Diretrizes para o diagnóstico, tratamento e prevenção da hanseníase',
      detail: 'Organização Mundial da Saúde · tradução para o português (2019) da edição de 2018',
      chunks: 49,
    },
    {
      title: 'Management of reactions and prevention of disabilities',
      detail: 'Organização Mundial da Saúde, 2020 · orientação técnica, em inglês',
      chunks: 63,
    },
    {
      title: 'Rumo à zero hanseníase: Estratégia Global de Hanseníase 2021–2030',
      detail: 'Organização Mundial da Saúde, 2021 · pilares e metas globais',
      chunks: 46,
    },
  ],
}

export const closingContent = {
  title: 'A decisão continua sendo clínica.',
  body: 'O NexoHansen organiza o que a base registra e mostra de onde veio cada informação. O exame, o julgamento e a conduta continuam com o profissional de saúde.',
  consult: {
    title: 'Fazer uma consulta',
    description: 'Pergunte sobre suspeição, diagnóstico, classificação, tratamento ou reações.',
  },
  compare: {
    title: 'Comparar respostas',
    description: 'Veja, lado a lado, a resposta do NexoHansen e a de um modelo genérico simulado.',
  },
}

export const footerContent = {
  tagline: 'Apoio à decisão clínica em hanseníase.',
  colophon: [
    { term: 'Projeto', detail: 'Trabalho de Conclusão de Curso em Engenharia de Software.' },
    {
      term: 'Tema',
      detail:
        'Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase.',
    },
    { term: 'Estágio', detail: 'Protótipo acadêmico, ainda não validado para uso clínico.' },
    {
      term: 'Aviso',
      detail: 'Recurso de apoio informacional. Não substitui avaliação presencial por profissional de saúde.',
    },
  ],
  baseNote: 'Base de conhecimento: PCDT da Hanseníase, Estratégia Nacional 2024–2030 e documentos da OMS, processados em 23/10/2026',
}
