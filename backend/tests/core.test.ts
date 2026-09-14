import { describe, expect, it } from 'vitest';
import { ChatService } from '../src/modules/chat/chat.service';
import { PromptBuilderService } from '../src/modules/chat/prompt-builder.service';
import { chunkMetadataSchema } from '../src/modules/chunks/chunk-metadata.schema';
import { EmbeddingsService } from '../src/modules/embeddings/embeddings.service';
import { DeterministicEmbeddingsProvider } from '../src/modules/embeddings/embeddings.provider';
import { KnowledgeService } from '../src/modules/knowledge/knowledge.service';
import { ClinicalRiskService } from '../src/modules/retrieval/clinical-risk.service';
import { HybridSearchService } from '../src/modules/retrieval/hybrid-search.service';
import { IntentClassifierService } from '../src/modules/retrieval/intent-classifier.service';
import { RerankingService } from '../src/modules/retrieval/reranking.service';
import { RetrievalService } from '../src/modules/retrieval/retrieval.service';
import { SafetyService } from '../src/modules/safety/safety.service';
import { ChunkDTO } from '../src/shared/types';

const diagChunk: ChunkDTO = {
  chunkId: 'hans_diag_001',
  documentId: 'diagnostico_clinico',
  title: 'Diagnóstico clínico da hanseníase',
  section: 'Diagnóstico clínico',
  subsection: 'Critérios cardinais',
  content:
    'Os critérios cardinais incluem lesão de pele com alteração de sensibilidade, tronco nervoso com disfunção e baciloscopia positiva.',
  sourcePage: null,
  sourceReference: 'seed',
  clinicalPhase: 'Diagnosis',
  informationType: 'Diagnostic_Criteria',
  targetUser: 'Profissional de saúde',
  targetDemographic: 'Geral',
  clinicalCriticality: 'Alta',
  diseaseClassification: 'Não aplicável',
  medicationRelated: false,
  dosageRelated: false,
  contraindicationRelated: false,
  examRelated: true,
  diagnosisRelated: true,
  reactionRelated: false,
  safetyLevel: 'Requer confirmação profissional',
  answerPolicy: 'Citar fontes.',
  keywords: ['diagnóstico', 'baciloscopia', 'sensibilidade'],
  entities: ['BAAR'],
  metadata: {}
};

const treatmentChunk: ChunkDTO = {
  ...diagChunk,
  chunkId: 'hans_trat_pqtu_001',
  documentId: 'tratamento_cura',
  title: 'Tratamento da hanseníase com PQT-U',
  section: 'Tratamento e cura',
  content: 'A PQT-U utiliza rifampicina, dapsona e clofazimina. A hanseníase tem tratamento e cura.',
  clinicalPhase: 'Treatment',
  informationType: 'Clinical_Guideline',
  medicationRelated: true,
  examRelated: false,
  diagnosisRelated: false,
  keywords: ['tratamento', 'PQT-U', 'rifampicina']
};

const baciloChunk: ChunkDTO = {
  ...diagChunk,
  chunkId: 'hans_exame_bacilo_001',
  documentId: 'exames',
  title: 'Baciloscopia na hanseníase',
  section: 'Exames complementares',
  content: 'Resultado negativo não exclui hanseníase, especialmente nas formas paucibacilares.',
  clinicalPhase: 'Exam',
  informationType: 'Clinical_Guideline',
  keywords: ['baciloscopia', 'negativa', 'exclui']
};

const reactionChunk: ChunkDTO = {
  ...diagChunk,
  chunkId: 'hans_reac_tipo1_001',
  documentId: 'reacoes',
  title: 'Reação hansênica tipo 1',
  section: 'Reações hansênicas',
  content:
    'A reação tipo 1 pode causar neurite. A PQT em andamento não deve ser interrompida sem orientação profissional.',
  clinicalPhase: 'Reaction_Management',
  informationType: 'Clinical_Guideline',
  clinicalCriticality: 'Muito alta',
  medicationRelated: true,
  reactionRelated: true,
  safetyLevel: 'Alto risco',
  keywords: ['reação tipo 1', 'PQT', 'neurite']
};

function createFakeRepository(chunks: ChunkDTO[]) {
  return {
    vectorSearch: async () => chunks.map((chunk, index) => ({ ...chunk, vectorScore: 0.98 - index * 0.05 })),
    textSearch: async () => chunks.map((chunk) => ({ ...chunk, keywordScore: 0.9 })),
    upsertDocument: async () => undefined,
    upsertChunk: async () => undefined,
    ensureSession: async () => ({ id: '00000000-0000-0000-0000-000000000001', userType: 'Profissional de saúde' }),
    createChatMessage: async () => ({ id: '00000000-0000-0000-0000-000000000002' }),
    createRetrievalLog: async () => undefined
  };
}

function createRetrievalService(chunks: ChunkDTO[]) {
  const repository = createFakeRepository(chunks);
  const embeddings = new EmbeddingsService(new DeterministicEmbeddingsProvider());
  return new RetrievalService(
    new HybridSearchService(repository as any, embeddings),
    new IntentClassifierService(),
    new ClinicalRiskService(),
    new RerankingService()
  );
}

function createChat(chunks: ChunkDTO[]) {
  const repository = createFakeRepository(chunks);
  return new ChatService(
    createRetrievalService(chunks),
    new SafetyService(),
    new PromptBuilderService(),
    repository as any
  );
}

describe('schemas e ingestão', () => {
  it('valida metadados e aplica defaults seguros', () => {
    const metadata = chunkMetadataSchema.parse({
      clinical_phase: 'Diagnosis',
      information_type: 'Diagnostic_Criteria',
      keywords: ['hanseníase']
    });

    expect(metadata.target_user).toBe('Profissional de saúde');
    expect(metadata.safety_level).toBe('Educativo');
    expect(metadata.diagnosis_related).toBe(false);
  });

  it('ingere JSONL válido usando embeddings mockáveis', async () => {
    const calls: string[] = [];
    const repository = {
      upsertDocument: async () => calls.push('document'),
      upsertChunk: async () => calls.push('chunk')
    };
    const service = new KnowledgeService(
      repository as any,
      new EmbeddingsService(new DeterministicEmbeddingsProvider())
    );

    const line = JSON.stringify({
      chunk_id: 'hans_test_001',
      document_id: 'diagnostico_clinico',
      title: 'Teste',
      section: 'Diagnóstico',
      content: 'Conteúdo clínico suficiente sobre hanseníase e sensibilidade.',
      metadata: {
        clinical_phase: 'Diagnosis',
        information_type: 'Diagnostic_Criteria',
        keywords: ['diagnóstico']
      }
    });

    const result = await service.ingestJsonlContent(line);

    expect(result.total).toBe(1);
    expect(calls).toEqual(['document', 'chunk']);
  });
});

describe('intenção e risco clínico', () => {
  it('classifica intenção por palavras-chave', () => {
    const classifier = new IntentClassifierService();

    expect(classifier.classify('mancha com dormência')).toBe('screening');
    expect(classifier.classify('baciloscopia negativa')).toBe('exam');
    expect(classifier.classify('rifampicina muda urina')).toBe('medication');
    expect(classifier.classify('bolsa de valores')).toBe('out_of_scope');
  });

  it('detecta risco muito alto para dose, gestação, criança, reação e talidomida', () => {
    const risk = new ClinicalRiskService();

    expect(risk.detectClinicalRisk('Qual dose de rifampicina?')).toBe('Muito alto');
    expect(risk.detectClinicalRisk('Gestante pode usar talidomida?')).toBe('Muito alto');
    expect(risk.detectClinicalRisk('Criança com suspeita de hanseníase')).toBe('Muito alto');
    expect(risk.detectClinicalRisk('Paciente com neurite e déficit motor')).toBe('Muito alto');
  });
});

describe('safety', () => {
  it('aciona fallback quando não há chunks', () => {
    const safety = new SafetyService();
    const decision = safety.evaluate({
      question: 'O que é hanseníase?',
      chunks: [],
      intent: 'screening',
      riskLevel: 'Alto'
    });

    expect(decision.fallbackTriggered).toBe(true);
    expect(decision.answer).toContain('não contém informação suficiente');
  });

  it('recusa pergunta fora do escopo', () => {
    const safety = new SafetyService();
    const decision = safety.evaluate({
      question: 'Como investir em ações?',
      chunks: [],
      intent: 'out_of_scope',
      riskLevel: 'Médio'
    });

    expect(decision.answer).toContain('restrita à hanseníase');
  });

  it('bloqueia prescrição individualizada', () => {
    const safety = new SafetyService();
    const decision = safety.evaluate({
      question: 'Qual dose eu devo tomar de rifampicina?',
      chunks: [treatmentChunk],
      intent: 'medication',
      riskLevel: 'Muito alto'
    });

    expect(decision.fallbackTriggered).toBe(true);
    expect(decision.answer).toContain('Não posso prescrever');
  });
});

describe('retrieval e chat', () => {
  it('recupera chunks de diagnóstico', async () => {
    const retrieval = await createRetrievalService([diagChunk]).retrieve({
      question: 'Quais são os critérios de diagnóstico?',
      applyMinScore: false
    });

    expect(retrieval.rawChunks[0].chunkId).toBe('hans_diag_001');
  });

  it('recupera chunks de tratamento', async () => {
    const retrieval = await createRetrievalService([treatmentChunk]).retrieve({
      question: 'Qual é o tratamento com PQT?',
      applyMinScore: false
    });

    expect(retrieval.rawChunks[0].chunkId).toBe('hans_trat_pqtu_001');
  });

  it('retorna resposta com fontes', async () => {
    const chat = createChat([diagChunk]);
    const output = await chat.ask({
      question: 'Quais são os critérios cardinais da hanseníase?',
      userType: 'Profissional de saúde'
    });

    expect(output.sources).toHaveLength(1);
    expect(output.sources[0].chunk_id).toBe('hans_diag_001');
    expect(output.answer).toContain('Fontes usadas');
  });

  it('responde que baciloscopia negativa não exclui hanseníase', async () => {
    const chat = createChat([baciloChunk]);
    const output = await chat.ask({
      question: 'Baciloscopia negativa exclui hanseníase?',
      userType: 'Profissional de saúde'
    });

    expect(output.answer.toLowerCase()).toContain('não exclui');
    expect(output.sources[0].chunk_id).toBe('hans_exame_bacilo_001');
  });

  it('não orienta interromper PQT em reação sem orientação', async () => {
    const chat = createChat([reactionChunk]);
    const output = await chat.ask({
      question: 'Reação tipo 1 significa falha no tratamento?',
      userType: 'Profissional de saúde'
    });

    expect(output.answer).toContain('não deve ser interrompida sem orientação profissional');
    expect(output.sources[0].chunk_id).toBe('hans_reac_tipo1_001');
  });

  it('trata talidomida e gestação como alto risco', async () => {
    const chat = createChat([reactionChunk]);
    const output = await chat.ask({
      question: 'Gestante pode usar talidomida?',
      userType: 'Profissional de saúde'
    });

    expect(output.safety.riskLevel).toBe('Muito alto');
    expect(output.safety.fallbackTriggered).toBe(true);
    expect(output.answer).toContain('gestação');
  });
});
