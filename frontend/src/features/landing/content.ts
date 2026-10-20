import type { IntentCategory, SafetyInfo, SourceCitation } from '../../api/types'

export const heroContent = {
  eyebrow: 'Apoio à decisão clínica em hanseníase',
  title: { lead: 'Respostas sobre hanseníase que mostram ', emphasis: 'de onde vieram', end: '.' },
  lede: 'O NexoHansen redige cada resposta a partir de trechos de uma base de conhecimento curada e mostra quais trechos foram usados. Quando a evidência não basta, ou a pergunta pede diagnóstico ou prescrição, ele recusa e explica o motivo.',
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

/**
 * Exemplo da Fig. 1, renderizado pelos mesmos componentes da consulta real.
 * A pergunta é do conjunto de avaliação; o texto usa apenas o conteúdo dos trechos
 * hans_exame_bacilo_001 e hans_diag_001 da base seed. Intenção e risco reproduzem o que o
 * backend calcula para esta pergunta (exame; "Muito alto", porque a busca vetorial sempre traz
 * trechos de criticidade muito alta). Pontuações ficam de fora: dependem do modelo de embedding.
 */
export const figureExample: FigureExample = {
  question: 'Baciloscopia negativa exclui hanseníase?',
  intent: 'exam',
  answer:
    'Não. A baciloscopia pesquisa bacilos álcool-ácido resistentes e auxilia a classificação operacional, mas um resultado negativo não exclui hanseníase, sobretudo nas formas paucibacilares [hans_exame_bacilo_001]. O resultado deve ser interpretado junto ao exame dermatoneurológico, e a confirmação diagnóstica exige avaliação clínica presencial [hans_diag_001].',
  sources: [
    {
      chunk_id: 'hans_exame_bacilo_001',
      document_id: 'exames',
      title: 'Baciloscopia na hanseníase',
      section: 'Exames complementares',
      source_page: null,
    },
    {
      chunk_id: 'hans_diag_001',
      document_id: 'diagnostico_clinico',
      title: 'Diagnóstico clínico da hanseníase',
      section: 'Diagnóstico clínico',
      source_page: null,
    },
  ],
  safety: {
    riskLevel: 'Muito alto',
    fallbackTriggered: false,
    requiresProfessionalEvaluation: true,
    disclaimer:
      'Este sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde.',
  },
}

export const figureContent = {
  caption: 'Exemplo ilustrativo de consulta, montado com trechos da base de desenvolvimento.',
  notes: [
    'Pergunta, escrita em linguagem clínica.',
    'Resposta redigida a partir dos trechos recuperados, com marcadores que apontam para as fontes.',
    'Nota de segurança: risco clínico do tema e necessidade de avaliação presencial.',
    'Fontes, com o identificador e a seção de cada trecho.',
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
        'A pergunta é classificada por intenção — diagnóstico, exame, tratamento, reação, entre outras. Se não tratar de hanseníase, é recusada antes mesmo da busca.',
    },
    {
      id: 'busca',
      title: 'Busca híbrida',
      description:
        'Dois mecanismos procuram trechos ao mesmo tempo: similaridade semântica entre vetores e busca textual no PostgreSQL. As pontuações são combinadas em um único ranking.',
    },
    {
      id: 'reordenacao',
      title: 'Risco e reordenação',
      description:
        'O risco clínico é estimado pela pergunta e pela criticidade dos trechos encontrados. Trechos críticos e ligados à intenção sobem no ranking; se o melhor deles não atinge a pontuação mínima, nenhum é usado.',
    },
    {
      id: 'seguranca',
      title: 'Verificação de segurança',
      description:
        'Regras explícitas identificam pedidos de diagnóstico definitivo, prescrição ou ajuste de dose, sinais de urgência, gestação, crianças e reações graves. Nesses casos, e quando faltam trechos, a resposta é uma recusa com orientação.',
    },
    {
      id: 'resposta',
      title: 'Resposta com fontes',
      description:
        'O modelo de linguagem recebe só os trechos selecionados, com a instrução de não usar conhecimento externo e de citar os trechos usados. Sem um modelo configurado, o sistema apresenta os próprios trechos, sem reescrevê-los.',
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
    'É um recurso de apoio informacional. Não emite diagnóstico definitivo, não prescreve e não substitui a avaliação presencial por um profissional de saúde.',
  columns: { situation: 'Situação identificada', response: 'Resposta do sistema, na íntegra' },
  refusals: [
    {
      code: 'definitive_diagnosis',
      situation: 'Pedido de diagnóstico definitivo',
      triggers: '“Tenho hanseníase?”, “confirmar diagnóstico”, “essa mancha é hanseníase?”',
      message:
        'Não é possível confirmar diagnóstico definitivo sem exame clínico presencial. Posso explicar quais critérios a base descreve para suspeição e avaliação.',
    },
    {
      code: 'prescription',
      situation: 'Prescrição, dose ou mudança de tratamento',
      triggers: 'Prescrever, receitar, dosagem, iniciar, suspender ou interromper medicamento',
      message:
        'Não posso prescrever ou ajustar medicação individualmente. Posso explicar o que a base descreve como informação geral, mas a conduta deve ser definida por profissional de saúde.',
    },
    {
      code: 'emergency',
      situation: 'Sinais de urgência',
      triggers: 'Perda de movimento, fraqueza, alteração ocular, falta de ar, icterícia, desmaio',
      message:
        'Os sinais descritos podem exigir avaliação presencial urgente. Procure imediatamente um serviço de saúde.',
    },
    {
      code: 'pregnancy',
      situation: 'Gestação',
      triggers: 'Menção a gestante, grávida ou gravidez',
      message:
        'Por envolver gestação, esta é uma situação de alto risco. A conduta deve ser definida presencialmente por profissional habilitado.',
    },
    {
      code: 'child',
      situation: 'Crianças',
      triggers: 'Menção a criança, bebê, uso pediátrico ou menor de idade',
      message: 'Em crianças, dose e conduta dependem de avaliação clínica, peso e protocolo. Procure serviço de saúde.',
    },
    {
      code: 'severe_reaction',
      situation: 'Reação hansênica grave',
      triggers: 'Neurite, déficit motor, eritema nodoso, reação grave',
      message:
        'Suspeita de reação hansênica com sinais importantes deve ser avaliada rapidamente para prevenir dano neural.',
    },
    {
      code: 'out_of_scope',
      situation: 'Pergunta fora do tema',
      triggers: 'Assuntos sem relação com hanseníase',
      message: 'Minha base é restrita à hanseníase. Não tenho segurança para responder sobre esse tema.',
    },
    {
      code: 'insufficient_evidence',
      situation: 'Evidência insuficiente',
      triggers: 'Nenhum trecho atinge a pontuação mínima de relevância',
      message:
        'A base recuperada não contém informação suficiente para responder com segurança. Recomendo consultar protocolo oficial ou serviço de saúde.',
    },
  ],
  footnote:
    'As regras reconhecem padrões no texto da pergunta e podem não identificar todas as formulações possíveis. Por isso, toda resposta, recusada ou não, termina com o mesmo aviso: o sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde.',
}

// Espelha backend/knowledge-base/processed/hanseniase_chunks.seed.jsonl (revisão de 11/06/2026).
export const knowledgeBaseContent = {
  label: 'Base de conhecimento',
  title: 'O que a base cobre hoje',
  description:
    'Um conjunto inicial, montado para desenvolver e testar o sistema. Cada trecho traz metadados de fase clínica, público, criticidade e nível de segurança, usados para filtrar a busca e reordenar os resultados.',
  caveat:
    'Os trechos atuais foram redigidos para desenvolvimento e teste. Antes de qualquer uso assistencial, precisam ser substituídos por documentos oficiais e revisados por especialistas.',
  stats: [
    { term: 'Trechos', value: '15' },
    { term: 'Temas', value: '11' },
    { term: 'Revisão', value: 'jun. 2026' },
  ],
  columns: { topic: 'Sumário', count: 'Trechos' },
  topics: [
    { title: 'Sinais e sintomas', detail: 'Lesões cutâneas e sensibilidade', chunks: ['hans_sinais_001'] },
    { title: 'Diagnóstico clínico', detail: 'Critérios cardinais', chunks: ['hans_diag_001'] },
    { title: 'Diagnóstico diferencial', detail: 'Lesões cutâneas e neuropatias', chunks: ['hans_diff_001'] },
    { title: 'Classificação operacional', detail: 'Paucibacilar e multibacilar', chunks: ['hans_class_001'] },
    { title: 'Exames complementares', detail: 'Baciloscopia', chunks: ['hans_exame_bacilo_001'] },
    { title: 'Tratamento e cura', detail: 'Poliquimioterapia única (PQT-U)', chunks: ['hans_trat_pqtu_001'] },
    {
      title: 'Medicamentos',
      detail: 'Rifampicina, dapsona e clofazimina',
      chunks: ['hans_med_rifampicina_001', 'hans_med_dapsona_001', 'hans_med_clofazimina_001'],
    },
    {
      title: 'Reações hansênicas',
      detail: 'Reação reversa (tipo 1) e eritema nodoso hansênico (tipo 2)',
      chunks: ['hans_reac_tipo1_001', 'hans_reac_tipo2_001'],
    },
    { title: 'Incapacidades', detail: 'Grau de incapacidade física', chunks: ['hans_prev_incap_001'] },
    {
      title: 'Contatos e vigilância',
      detail: 'Avaliação de contatos e BCG',
      chunks: ['hans_contatos_001', 'hans_bcg_001'],
    },
    { title: 'Política de segurança', detail: 'Fallback e limites clínicos', chunks: ['hans_safe_001'] },
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
  baseNote: 'Base de conhecimento: conjunto inicial de desenvolvimento, revisão de 11/06/2026',
}
