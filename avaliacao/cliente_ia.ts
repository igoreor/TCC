// Adaptador da IA avaliada (Fase 0 do protocolo). Executa o mesmo fluxo da rota POST /api/chat/ask
// — o ChatService do backend, com interpretação da pergunta, busca híbrida, regras de segurança,
// geração e verificação das citações — dentro do processo, contra o banco configurado em
// backend/.env, com um repositório que só lê: conversas e registros ficam em memória, e nada é
// gravado no banco. Cada chamada abre uma sessão nova, sem histórico.
//
// Executar sempre com o diretório de trabalho em backend/ (o backend lê backend/.env):
//   cd backend && npx tsx ../avaliacao/<script>.ts
import { randomUUID } from 'node:crypto';
import { prisma } from '../backend/src/config/database';
import { env } from '../backend/src/config/env';
import { openAIConfig } from '../backend/src/config/openai';
import { ChatService } from '../backend/src/modules/chat/chat.service';
import { PromptBuilderService } from '../backend/src/modules/chat/prompt-builder.service';
import { EmbeddingsService } from '../backend/src/modules/embeddings/embeddings.service';
import { KnowledgeRepository } from '../backend/src/modules/knowledge/knowledge.repository';
import { createLlmClient } from '../backend/src/modules/llm/llm.client';
import { ClinicalRiskService } from '../backend/src/modules/retrieval/clinical-risk.service';
import { HybridSearchService } from '../backend/src/modules/retrieval/hybrid-search.service';
import { IntentClassifierService } from '../backend/src/modules/retrieval/intent-classifier.service';
import { QueryAnalyzerService } from '../backend/src/modules/retrieval/query-analyzer.service';
import { RetrievalService } from '../backend/src/modules/retrieval/retrieval.service';
import { SafetyService } from '../backend/src/modules/safety/safety.service';

/** Perfil usado na consulta pública do sistema (a gaveta de consulta fixa este perfil). */
export const PERFIL = 'Profissional de saúde' as const;

/** Lê do banco, mas guarda conversas e registros só em memória. */
class ReadOnlyRepository extends KnowledgeRepository {
  private readonly sessions = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>();

  async ensureSession(sessionId: string | undefined, userType: string, userId: string) {
    const id = sessionId ?? randomUUID();
    const reused = this.sessions.has(id);
    if (!reused) this.sessions.set(id, []);
    return { id, userType, userId, createdAt: new Date(), reused };
  }

  async findRecentMessages(sessionId: string, limit = 6) {
    return (this.sessions.get(sessionId) ?? []).slice(-limit);
  }

  async createChatMessage(input: { sessionId: string; role: 'user' | 'assistant'; content: string }) {
    this.sessions.get(input.sessionId)?.push({ role: input.role, content: input.content });
    return { id: randomUUID(), sessionId: input.sessionId, role: input.role, content: input.content, createdAt: new Date() };
  }

  async createRetrievalLog() {
    return undefined as never;
  }
}

interface UsoChamada {
  tipo: 'analise' | 'resposta' | 'embeddings';
  modelo: string;
  entrada: number;
  entrada_cache: number;
  saida: number;
  raciocinio: number;
}

// Registra o uso de tokens de cada chamada à OpenAI feita durante uma pergunta.
let usoAtual: UsoChamada[] = [];
let pendentes: Promise<void>[] = [];
const fetchOriginal = globalThis.fetch;
globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetchOriginal(url, init);
  const href = String(url);
  if (href.startsWith('https://api.openai.com/v1/')) {
    const body = typeof init?.body === 'string' ? init.body : '';
    const tipo: UsoChamada['tipo'] = href.includes('/embeddings')
      ? 'embeddings'
      : body.includes('"response_format"')
        ? 'analise'
        : 'resposta';
    const destino = usoAtual;
    pendentes.push(
      response
        .clone()
        .json()
        .then((payload: any) => {
          const u = payload?.usage;
          if (!u) return;
          destino.push({
            tipo,
            modelo: payload.model,
            entrada: u.prompt_tokens ?? 0,
            entrada_cache: u.prompt_tokens_details?.cached_tokens ?? 0,
            saida: u.completion_tokens ?? 0,
            raciocinio: u.completion_tokens_details?.reasoning_tokens ?? 0
          });
        })
        .catch(() => undefined)
    );
  }
  return response;
};

export function criarCliente() {
  const repository = new ReadOnlyRepository(prisma);
  const embeddings = new EmbeddingsService();
  const llm = createLlmClient();
  const retrieval = new RetrievalService(
    new HybridSearchService(repository, embeddings),
    new IntentClassifierService(),
    new ClinicalRiskService(),
    new QueryAnalyzerService(llm)
  );
  const chat = new ChatService(retrieval, new SafetyService(), new PromptBuilderService(), repository, llm, embeddings);
  const userId = randomUUID();

  const configuracao = {
    modelo_gerador: llm?.model ?? null,
    esforco_raciocinio: openAIConfig.reasoningEffort ?? null,
    modelo_embeddings: embeddings.modelId,
    embeddings_semanticos: embeddings.semantic,
    top_k: env.DEFAULT_TOP_K,
    top_n: env.DEFAULT_TOP_N,
    similaridade_minima: retrieval.minVectorSimilarity,
    perfil: PERFIL
  };

  async function perguntar(texto: string) {
    usoAtual = [];
    pendentes = [];
    const inicio = Date.now();
    const output = await chat.ask({ question: texto, userType: PERFIL, userId });
    const latencia_ms = Date.now() - inicio;
    await Promise.all(pendentes);
    const soma = (campo: keyof UsoChamada) =>
      usoAtual.filter((u) => u.tipo !== 'embeddings').reduce((total, u) => total + Number(u[campo]), 0);

    return {
      resposta: output.answer,
      recusa: output.safety.fallbackTriggered,
      motivo_recusa: output.safety.reason ?? null,
      risco_clinico: output.safety.riskLevel,
      intencao: output.retrieval.intent,
      pergunta_interpretada: output.retrieval.standaloneQuestion,
      consultas_de_busca: output.retrieval.searchQueries,
      busca_ampliada: output.retrieval.broadened,
      citacoes_ausentes: output.retrieval.citationsMissing,
      fontes_citadas: output.sources.map((s: any) => ({
        indice: s.index,
        chunk_id: s.chunk_id,
        documento: s.document_id,
        referencia: s.reference,
        pagina_pdf: [s.pdf_page ?? null, s.pdf_page_end ?? null],
        verificada: s.verified ?? null
      })),
      trechos_recuperados: output.retrieval.chunks.map((c: any) => ({
        chunk_id: c.chunk_id,
        documento: c.document_id,
        pagina_pdf: [c.page_start, c.page_end],
        pontuacao_fusao: c.score ?? null,
        similaridade_vetorial: c.vectorScore ?? null,
        pontuacao_textual: c.keywordScore ?? null
      })),
      latencia_ms,
      tokens: {
        entrada: soma('entrada'),
        entrada_cache: soma('entrada_cache'),
        saida: soma('saida'),
        raciocinio: soma('raciocinio'),
        por_chamada: usoAtual
      },
      modelo: configuracao.modelo_gerador,
      parametros: configuracao
    };
  }

  return { perguntar, configuracao, encerrar: () => prisma.$disconnect() };
}

export type RespostaIA = Awaited<ReturnType<ReturnType<typeof criarCliente>['perguntar']>>;
