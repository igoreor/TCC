import { describe, expect, it } from 'vitest';
import { ChatService, toSourceCitation } from '../src/modules/chat/chat.service';
import {
  lexicallySupported,
  renumberCitations,
  sentencesByCitation,
  stripTrailingSourceList
} from '../src/modules/chat/citations';
import { PromptBuilderService } from '../src/modules/chat/prompt-builder.service';
import { DeterministicEmbeddingsProvider } from '../src/modules/embeddings/embeddings.provider';
import { EmbeddingsService } from '../src/modules/embeddings/embeddings.service';
import type { LlmClient } from '../src/modules/llm/llm.client';
import { ClinicalRiskService } from '../src/modules/retrieval/clinical-risk.service';
import {
  HybridSearchService,
  reciprocalRankFusion
} from '../src/modules/retrieval/hybrid-search.service';
import { IntentClassifierService } from '../src/modules/retrieval/intent-classifier.service';
import { QueryAnalyzerService } from '../src/modules/retrieval/query-analyzer.service';
import { RetrievalService } from '../src/modules/retrieval/retrieval.service';
import { SafetyService } from '../src/modules/safety/safety.service';
import { containsAnyTerm, normalizeText } from '../src/shared/text';
import { ChunkDTO, DocumentInfo } from '../src/shared/types';

const pcdt: DocumentInfo = {
  documentId: 'ms-pcdt-hanseniase-2022',
  title: 'Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase',
  shortTitle: 'PCDT da Hanseníase',
  institution: 'Ministério da Saúde (Brasil)',
  publicationYear: 2022,
  edition: '1ª edição',
  isbn: null,
  language: 'pt',
  jurisdiction: 'nacional',
  documentType: 'Protocolo clínico',
  status: 'vigente',
  officialUrl: 'https://exemplo.gov.br/pcdt.pdf',
  downloadUrl: 'https://exemplo.gov.br/pcdt-arquivo.pdf',
  notes: null
};

function chunk(id: string, content: string, overrides: Partial<ChunkDTO> = {}): ChunkDTO {
  return {
    chunkId: id,
    documentId: pcdt.documentId,
    title: '7.2 Baciloscopia',
    section: '7 Exames de apoio ao diagnóstico',
    content,
    clinicalPhase: 'Exam',
    informationType: 'Clinical_Guideline',
    targetUser: 'Profissional de saúde',
    targetDemographic: 'Geral',
    clinicalCriticality: 'Alta',
    diseaseClassification: 'Não aplicável',
    medicationRelated: false,
    dosageRelated: false,
    contraindicationRelated: false,
    examRelated: true,
    diagnosisRelated: false,
    reactionRelated: false,
    safetyLevel: 'Educativo',
    answerPolicy: '',
    keywords: [],
    entities: [],
    metadata: {},
    sectionPath: ['7 Exames de apoio ao diagnóstico', '7.2 Baciloscopia'],
    pageStart: 46,
    pageEnd: 47,
    pageLabelStart: '44',
    pageLabelEnd: '45',
    document: pcdt,
    ...overrides
  };
}

const baciloscopia = chunk(
  'pcdt:0039',
  'O exame tem baixa sensibilidade, resultando negativo nos casos paucibacilares, o que absolutamente não exclui o diagnóstico da hanseníase.'
);
const definicao = chunk(
  'pcdt:0014',
  'O diagnóstico da hanseníase é eminentemente clínico. Os sinais cardinais incluem lesão de pele com alteração de sensibilidade e espessamento de nervo periférico.',
  {
    title: '6.2 Definição de caso',
    sectionPath: ['6 Aspectos clínicos', '6.2 Definição de caso'],
    pageStart: 28,
    pageEnd: 28,
    pageLabelStart: '26',
    pageLabelEnd: '26'
  }
);

describe('comparação de termos por palavra inteira', () => {
  it('não confunde trechos de palavras com termos clínicos', () => {
    expect(containsAnyTerm('Tenho dúvida sobre a baciloscopia', ['enh'])).toBe(false);
    expect(containsAnyTerm('Como comparar PB e MB?', ['parar'])).toBe(false);
    expect(containsAnyTerm('Escolho qual exame?', ['olho'])).toBe(false);
    expect(containsAnyTerm('Também tenho dúvida', ['mb'])).toBe(false);
    expect(containsAnyTerm('Paciente com ENH', ['enh'])).toBe(true);
  });

  it('aceita prefixo explícito e ignora acentos', () => {
    expect(containsAnyTerm('Eu prescrevo assim', ['prescrev*'])).toBe(true);
    expect(containsAnyTerm('Como descrever a lesão', ['prescrev*'])).toBe(false);
    expect(containsAnyTerm('como tratar casos de hanseniase', ['hanseníase'])).toBe(true);
    expect(normalizeText('  Hanseníase   É  ')).toBe('hanseniase e');
  });
});

describe('regras de segurança', () => {
  const safety = new SafetyService();
  const base = { inDomain: true, hasEvidence: true, riskLevel: 'Alto' as const };

  it('deixa de recusar as perguntas legítimas que antes eram bloqueadas por subcadeias', () => {
    for (const question of [
      'Tenho dúvida sobre a baciloscopia na hanseníase',
      'Como comparar PB e MB na classificação?',
      'Escolho qual exame para suspeita de hanseníase?'
    ]) {
      expect(safety.evaluate({ ...base, question }).fallbackTriggered).toBe(false);
    }
  });

  it('responde perguntas informativas sobre crianças, gestação e reações, com cautela', () => {
    const children = safety.evaluate({
      ...base,
      question: 'E quais são os critérios para crianças?'
    });
    expect(children.fallbackTriggered).toBe(false);
    expect(children.cautions).toContain('criancas');

    const pregnancy = safety.evaluate({
      ...base,
      riskLevel: 'Muito alto',
      question: 'Gestante pode usar talidomida?'
    });
    expect(pregnancy.fallbackTriggered).toBe(false);
    expect(pregnancy.requiresProfessionalEvaluation).toBe(true);
    expect(pregnancy.cautions).toEqual(expect.arrayContaining(['gestacao', 'talidomida']));
  });

  it('recusa prescrição para paciente específico, inclusive dose calculada por peso', () => {
    expect(
      safety.evaluate({ ...base, question: 'Qual dose de rifampicina devo prescrever?' }).reason
    ).toBe('prescription');
    expect(
      safety.evaluate({ ...base, question: 'Qual a dose de prednisona para um paciente de 60 kg?' })
        .reason
    ).toBe('prescription');
    // o esquema padronizado do protocolo é informação, não prescrição
    expect(
      safety.evaluate({ ...base, question: 'Qual é o esquema da PQT-U para adultos?' })
        .fallbackTriggered
    ).toBe(false);
  });

  it('é mais restritivo com o perfil paciente', () => {
    const patient = safety.evaluate({
      ...base,
      userType: 'Paciente',
      question: 'Qual a dose da rifampicina?'
    });
    expect(patient.reason).toBe('prescription');
    expect(patient.answer).toContain('Converse com a equipe');

    const urgent = 'Estou com dor no olho e não consigo fechar a pálpebra de repente';
    expect(safety.evaluate({ ...base, userType: 'Paciente', question: urgent }).reason).toBe(
      'emergency'
    );
    // para o profissional, a urgência não bloqueia: a resposta destaca o encaminhamento
    const professional = safety.evaluate({ ...base, question: urgent });
    expect(professional.fallbackTriggered).toBe(false);
    expect(professional.cautions).toContain('sinais_de_alerta');
  });

  it('recusa diagnóstico de caso específico, mas não a pergunta sobre como diagnosticar', () => {
    expect(
      safety.evaluate({ ...base, question: 'Tenho hanseníase? Apareceu uma mancha.' }).reason
    ).toBe('definitive_diagnosis');
    expect(
      safety.evaluate({ ...base, question: 'Como confirmar o diagnóstico de hanseníase?' })
        .fallbackTriggered
    ).toBe(false);
  });
});

describe('análise da pergunta', () => {
  const analyzer = new QueryAnalyzerService();

  it('lê no domínio da hanseníase uma pergunta que não cita a doença', () => {
    const analysis = analyzer.analyzeHeuristically('Quais são os critérios?');
    expect(analysis.inDomain).toBe(true);
    expect(normalizeText(analysis.searchQueries[0])).toContain('hanseniase');
  });

  it('só sai do escopo quando a pergunta trata explicitamente de outro assunto', () => {
    expect(analyzer.analyzeHeuristically('Como tratar diabetes tipo 2?').inDomain).toBe(false);
    expect(
      analyzer.analyzeHeuristically('como tratar diabetes em casos confirmados de hanseniase')
        .inDomain
    ).toBe(true);
    expect(analyzer.analyzeHeuristically('Quando devo encaminhar o paciente?').inDomain).toBe(true);
  });

  it('completa uma continuação com a pergunta anterior e expande siglas e sinônimos', () => {
    const analysis = analyzer.analyzeHeuristically('E quais são os critérios para crianças?', [
      { role: 'user', content: 'Como é feito o diagnóstico da hanseníase?' },
      { role: 'assistant', content: 'O diagnóstico é clínico...' }
    ]);
    expect(analysis.isFollowUp).toBe(true);
    expect(analysis.standaloneQuestion).toContain('Como é feito o diagnóstico da hanseníase?');
    expect(analysis.lexicalTerms).toEqual(expect.arrayContaining(['diagnostico', 'menores']));
    // termo presente em quase todo trecho não ajuda a busca textual
    expect(analysis.lexicalTerms).not.toContain('hanseniase');
  });

  it('entende o aceite de uma oferta da resposta anterior como continuação do assunto', () => {
    const analysis = analyzer.analyzeHeuristically('sim descreva o que tem na base', [
      { role: 'user', content: 'Qual dose de rifampicina devo prescrever?' },
      { role: 'assistant', content: 'Não indico dose nem conduta para um paciente específico...' }
    ]);
    expect(analysis.isFollowUp).toBe(true);
    expect(analysis.inDomain).toBe(true);
    expect(analysis.lexicalTerms).toEqual(expect.arrayContaining(['dose', 'rifampicina']));
    // o aceite não é um pedido de prescrição: segue para a resposta com os esquemas documentados
    const decision = new SafetyService().evaluate({
      question: 'sim descreva o que tem na base',
      inDomain: analysis.inDomain,
      hasEvidence: true,
      riskLevel: 'Muito alto'
    });
    expect(decision.fallbackTriggered).toBe(false);
  });

  it('usa o modelo quando disponível e cai para a análise local se ele falhar', async () => {
    const llm: LlmClient = {
      model: 'teste',
      complete: async () =>
        JSON.stringify({
          standalone_question:
            'Quais são os critérios diagnósticos da hanseníase em menores de 15 anos?',
          search_queries: ['hanseníase em menores de 15 anos diagnóstico'],
          english_query: 'leprosy diagnosis in children',
          in_domain: true,
          is_follow_up: true
        })
    };
    const analysis = await new QueryAnalyzerService(llm).analyze('E para crianças?', [
      { role: 'user', content: 'Como diagnosticar?' }
    ]);
    expect(analysis.method).toBe('llm');
    expect(analysis.searchQueries).toContain('leprosy diagnosis in children');

    const failing: LlmClient = {
      model: 'teste',
      complete: async () => Promise.reject(new Error('fora do ar'))
    };
    expect(
      (await new QueryAnalyzerService(failing).analyze('Quais são os critérios?')).method
    ).toBe('heuristica');
  });
});

describe('fusão por posição recíproca', () => {
  it('privilegia o trecho que aparece bem colocado em várias listas', () => {
    const fused = reciprocalRankFusion([
      {
        items: [
          { ...definicao, vectorScore: 0.5 },
          { ...baciloscopia, vectorScore: 0.4 }
        ],
        weight: 1
      },
      { items: [{ ...baciloscopia, keywordScore: 0.3 }], weight: 1 }
    ]);
    expect(fused[0].chunkId).toBe('pcdt:0039');
    expect(fused[0].finalScore).toBe(1);
    expect(fused[0].vectorScore).toBe(0.4);
    expect(fused[0].keywordScore).toBe(0.3);
  });
});

describe('citações', () => {
  it('renumera pela ordem de aparição e descarta números fora do contexto', () => {
    const { text, order } = renumberCitations(
      'Primeiro [3]. Depois [1, 3] e [2-3]. Inválida [9].',
      3
    );
    expect(order).toEqual([3, 1, 2]);
    expect(text).toBe('Primeiro [1]. Depois [2][1] e [3][1]. Inválida.');
  });

  it('remove a lista de fontes acrescentada pelo modelo no fim', () => {
    expect(stripTrailingSourceList('Resposta [1].\n\n**Fontes:**\n[1] PCDT')).toBe('Resposta [1].');
    expect(stripTrailingSourceList('Resposta [1].\n\n### Referências\n- PCDT')).toBe(
      'Resposta [1].'
    );
  });

  it('associa frases às fontes que citam e confere sobreposição de termos', () => {
    const sentences = sentencesByCitation(
      'A baciloscopia negativa não exclui o diagnóstico [1]. O diagnóstico é clínico [2].'
    );
    expect(sentences.get(1)?.[0]).toContain('baciloscopia');
    expect(lexicallySupported(sentences.get(1)![0], baciloscopia.content)).toBe(true);
    expect(lexicallySupported('A talidomida é teratogênica', baciloscopia.content)).toBe(false);
  });

  it('monta a referência documental com seção, página impressa e link para a página do PDF', () => {
    const source = toSourceCitation(baciloscopia, 1, true);
    expect(source.reference).toBe(
      'Ministério da Saúde (Brasil). Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase. 2022. Seção 7.2 Baciloscopia. p. 44–45.'
    );
    expect(source.url).toBe('https://exemplo.gov.br/pcdt-arquivo.pdf#page=46');
    expect(source.page_label).toBe('44–45');
    expect(source.document?.jurisdiction).toBe('nacional');
  });
});

describe('prompt', () => {
  it('informa documento, âmbito, seção, páginas, histórico e cuidados', () => {
    const prompt = new PromptBuilderService().build({
      question: 'E para crianças?',
      standaloneQuestion: 'Qual é o esquema da PQT-U para crianças?',
      userType: 'Profissional de saúde',
      chunks: [baciloscopia],
      history: [{ role: 'user', content: 'Qual é o esquema da PQT-U para adultos?' }],
      cautions: ['criancas']
    });
    expect(prompt.system).toContain('contexto da hanseníase');
    expect(prompt.user).toContain('diretriz brasileira (Ministério da Saúde)');
    expect(prompt.user).toContain('Seção: 7 Exames de apoio ao diagnóstico > 7.2 Baciloscopia');
    expect(prompt.user).toContain('Páginas: 44–45');
    expect(prompt.user).toContain('Pergunta interpretada no contexto da conversa');
    expect(prompt.user).toContain('crianças ou menores de 15 anos');
  });
});

describe('geração com modelo de linguagem', () => {
  function createChat(llm: LlmClient, chunks: ChunkDTO[]) {
    const repository = {
      vectorSearch: async () =>
        chunks.map((item, index) => ({ ...item, vectorScore: 0.9 - index * 0.1 })),
      textSearch: async () => chunks.map((item) => ({ ...item, keywordScore: 0.5 })),
      ensureSession: async () => ({ id: '00000000-0000-0000-0000-000000000001', reused: false }),
      findRecentMessages: async () => [],
      createChatMessage: async () => ({ id: '00000000-0000-0000-0000-000000000002' }),
      createRetrievalLog: async () => undefined
    };
    const embeddings = new EmbeddingsService(new DeterministicEmbeddingsProvider());
    const retrieval = new RetrievalService(
      new HybridSearchService(repository as any, embeddings),
      new IntentClassifierService(),
      new ClinicalRiskService(),
      new QueryAnalyzerService()
    );
    return new ChatService(
      retrieval,
      new SafetyService(),
      new PromptBuilderService(),
      repository as any,
      llm,
      embeddings
    );
  }

  const ask = (chat: ChatService) =>
    chat.ask({
      question: 'Baciloscopia negativa exclui hanseníase?',
      userType: 'Profissional de saúde',
      userId: 'u1'
    });

  it('mantém só as fontes citadas, renumeradas, e verifica cada uma', async () => {
    const llm: LlmClient = {
      model: 'teste',
      complete: async () =>
        'Não. A baciloscopia tem baixa sensibilidade e resultado negativo nos casos paucibacilares não exclui o diagnóstico [2]. Número inválido [7].\n\nFontes:\n[2] PCDT'
    };
    const output = await ask(createChat(llm, [definicao, baciloscopia]));
    expect(output.sources).toHaveLength(1);
    expect(output.sources[0].chunk_id).toBe('pcdt:0039');
    expect(output.sources[0].index).toBe(1);
    expect(output.sources[0].verified).toBe(true);
    expect(output.answer).toContain('não exclui o diagnóstico [1].');
    expect(output.answer).not.toContain('[7]');
    expect(output.answer).not.toContain('Fontes:');
  });

  it('sinaliza resposta sem citações e não dá as fontes como confirmadas', async () => {
    const llm: LlmClient = { model: 'teste', complete: async () => 'Não exclui o diagnóstico.' };
    const output = await ask(createChat(llm, [baciloscopia]));
    expect(output.retrieval.citationsMissing).toBe(true);
    expect(output.sources.every((source) => source.verified === false)).toBe(true);
  });

  it('usa a resposta extrativa se o modelo falhar', async () => {
    const llm: LlmClient = {
      model: 'teste',
      complete: async () => Promise.reject(new Error('fora do ar'))
    };
    const output = await ask(createChat(llm, [baciloscopia]));
    expect(output.answer).toContain('resposta extrativa');
    expect(output.answer).toContain('não exclui o diagnóstico');
    expect(output.sources[0].chunk_id).toBe('pcdt:0039');
  });
});
