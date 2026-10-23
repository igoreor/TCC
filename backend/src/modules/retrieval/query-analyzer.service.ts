import { contentWords, containsAnyTerm, normalizeText } from '../../shared/text';
import type { LlmClient } from '../llm/llm.client';
import {
  ANAPHORA_TERMS,
  FOLLOW_UP_OPENINGS,
  HANSENIASE_ANCHOR_TERMS,
  OTHER_DOMAIN_TERMS,
  QUERY_EXPANSIONS
} from './domain-glossary';

// Interpretação da pergunta antes da busca. Todo o sistema trata de hanseníase: uma pergunta que
// não cita a doença ("Quais são os critérios?") é lida no domínio, e uma continuação ("E para
// crianças?") é completada com a pergunta anterior. A pergunta só sai do escopo quando trata
// explicitamente de outro assunto.

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface QueryAnalysis {
  question: string;
  /** Pergunta autônoma, com o contexto da conversa resolvido. */
  standaloneQuestion: string;
  /** Consultas enviadas à busca vetorial (uma lista de resultados por consulta). */
  searchQueries: string[];
  /** Termos normalizados da busca textual, incluindo siglas expandidas. */
  lexicalTerms: string[];
  inDomain: boolean;
  isFollowUp: boolean;
  mentionsHanseniase: boolean;
  method: 'llm' | 'heuristica';
}

// Termos presentes em quase todo trecho: não distinguem trechos na busca textual.
const DOMAIN_CONSTANT_WORDS = new Set([
  'hanseniase',
  'hansen',
  'lepra',
  'leprosy',
  'doenca',
  'paciente',
  'pacientes',
  'pessoa',
  'pessoas'
]);
// Palavras de conversa e de instrução ("sim, descreva o que tem na base"): não são o assunto, e
// na busca textual encontram trechos sem relação ("com base nesta Estratégia").
const CONVERSATIONAL_WORDS = new Set([
  'sim',
  'ok',
  'pode',
  'claro',
  'quero',
  'favor',
  'descreva',
  'descrever',
  'explique',
  'explicar',
  'detalhe',
  'detalhar',
  'mostre',
  'mostrar',
  'fale',
  'diga',
  'base',
  'documento',
  'documentos',
  'informacao',
  'informacoes',
  'resposta',
  'responda'
]);
const MAX_QUERIES = 4;
const MAX_LEXICAL_TERMS = 30;

function subjectWords(text: string) {
  return contentWords(text).filter((word) => !CONVERSATIONAL_WORDS.has(word));
}

function startsWithOpening(question: string) {
  const normalized = normalizeText(question).replace(/^[^\p{L}]+/u, '');
  return FOLLOW_UP_OPENINGS.some(
    (opening) =>
      normalized === opening ||
      normalized.startsWith(`${opening} `) ||
      normalized.startsWith(`${opening},`)
  );
}

export function glossaryExpansions(text: string) {
  return QUERY_EXPANSIONS.filter((rule) => containsAnyTerm(text, rule.terms)).map(
    (rule) => rule.expansion
  );
}

function lexicalTermsFor(texts: string[]) {
  const words = texts
    .flatMap((text) => subjectWords(text))
    .filter((word) => !DOMAIN_CONSTANT_WORDS.has(word));
  return [...new Set(words)].slice(0, MAX_LEXICAL_TERMS);
}

function withDomain(query: string) {
  return containsAnyTerm(query, HANSENIASE_ANCHOR_TERMS) ? query : `${query} hanseníase`;
}

function unique(items: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeText(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export class QueryAnalyzerService {
  constructor(private readonly llm: LlmClient | null = null) {}

  async analyze(question: string, history: ConversationTurn[] = []): Promise<QueryAnalysis> {
    const heuristic = this.analyzeHeuristically(question, history);
    if (!this.llm) return heuristic;

    try {
      return await this.analyzeWithLlm(question, history, heuristic);
    } catch {
      // Falha ou demora do modelo não impede a consulta: segue com a análise local.
      return heuristic;
    }
  }

  analyzeHeuristically(question: string, history: ConversationTurn[] = []): QueryAnalysis {
    const previousQuestion = [...history].reverse().find((turn) => turn.role === 'user')?.content;
    const mentionsHanseniase = containsAnyTerm(question, HANSENIASE_ANCHOR_TERMS);
    // Pergunta curta só é continuação quando não traz assunto próprio ("Quais são os critérios?").
    const isFollowUp =
      previousQuestion !== undefined &&
      (startsWithOpening(question) ||
        containsAnyTerm(question, ANAPHORA_TERMS) ||
        (!mentionsHanseniase && contentWords(question).length <= 3));
    const otherDomain = containsAnyTerm(question, OTHER_DOMAIN_TERMS);
    const inDomain = mentionsHanseniase || isFollowUp || !otherDomain;

    const standaloneQuestion =
      isFollowUp && previousQuestion
        ? `${question} (continuação da pergunta anterior: "${previousQuestion}")`
        : question;
    // Na continuação, a busca usa o assunto das duas perguntas, sem as palavras de conversa.
    const primary =
      isFollowUp && previousQuestion
        ? [...subjectWords(question), ...subjectWords(previousQuestion)].join(' ')
        : question;
    const expansions = glossaryExpansions(primary);
    const searchQueries = unique([
      withDomain(primary),
      ...(expansions.length ? [withDomain(`${primary} ${expansions.join(' ')}`)] : [])
    ]);

    return {
      question,
      standaloneQuestion,
      searchQueries,
      lexicalTerms: lexicalTermsFor([primary, ...expansions]),
      inDomain,
      isFollowUp,
      mentionsHanseniase,
      method: 'heuristica'
    };
  }

  private async analyzeWithLlm(
    question: string,
    history: ConversationTurn[],
    heuristic: QueryAnalysis
  ): Promise<QueryAnalysis> {
    const transcript = history
      .slice(-4)
      .map(
        (turn) =>
          `${turn.role === 'user' ? 'Usuário' : 'Assistente'}: ${turn.content.slice(0, 500)}`
      )
      .join('\n');

    const raw = await this.llm!.complete({
      json: true,
      temperature: 0,
      maxTokens: 400,
      timeoutMs: 15_000,
      messages: [
        {
          role: 'system',
          content:
            'Você prepara buscas em uma base de documentos oficiais sobre hanseníase: o Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase (Ministério da Saúde, 2022), a Estratégia Nacional para Enfrentamento à Hanseníase 2024-2030 e documentos da OMS (diretrizes de diagnóstico, tratamento e prevenção; manejo de reações e prevenção de incapacidades, em inglês; Estratégia Global 2021-2030). Todas as perguntas pertencem ao domínio da hanseníase, salvo quando tratam explicitamente de outro assunto. Responda somente com JSON.'
        },
        {
          role: 'user',
          content: `${transcript ? `Conversa anterior:\n${transcript}\n\n` : ''}Pergunta atual: ${question}

Devolva um JSON com:
- "standalone_question": a pergunta reescrita de forma completa e autônoma, em português, resolvendo referências à conversa anterior ("e para crianças?" passa a citar o assunto anterior) e situando-a na hanseníase quando ela não indicar outro tema. Não acrescente fatos.
- "search_queries": de 2 a 3 consultas curtas em português, com os termos técnicos usados nos documentos oficiais brasileiros (por exemplo, "poliquimioterapia única (PQT-U)", "menores de 15 anos", "reação hansênica tipo 2 (eritema nodoso hansênico)").
- "english_query": uma consulta curta em inglês com o mesmo assunto.
- "in_domain": false apenas se a pergunta tratar claramente de assunto sem relação com a hanseníase; true nos demais casos, inclusive perguntas genéricas como "quais são os critérios?".
- "is_follow_up": true se a pergunta depende da conversa anterior.`
        }
      ]
    });

    const parsed = JSON.parse(raw) as {
      standalone_question?: unknown;
      search_queries?: unknown;
      english_query?: unknown;
      in_domain?: unknown;
      is_follow_up?: unknown;
    };
    const standaloneQuestion =
      typeof parsed.standalone_question === 'string' && parsed.standalone_question.trim()
        ? parsed.standalone_question.trim()
        : heuristic.standaloneQuestion;
    const llmQueries = Array.isArray(parsed.search_queries)
      ? parsed.search_queries.filter(
          (query): query is string => typeof query === 'string' && query.trim().length > 2
        )
      : [];
    const englishQuery =
      typeof parsed.english_query === 'string' && parsed.english_query.trim()
        ? [parsed.english_query.trim()]
        : [];
    const isFollowUp = parsed.is_follow_up === true || heuristic.isFollowUp;
    const explicitOtherDomain = containsAnyTerm(question, OTHER_DOMAIN_TERMS) && !isFollowUp;

    // A menção à hanseníase decide; um assunto alheio explícito também; no resto, vale o modelo.
    const inDomain =
      heuristic.mentionsHanseniase || (!explicitOtherDomain && parsed.in_domain !== false);
    const expansions = glossaryExpansions(`${standaloneQuestion} ${llmQueries.join(' ')}`);
    const searchQueries = unique([
      withDomain(standaloneQuestion),
      ...llmQueries.map(withDomain),
      ...englishQuery
    ]).slice(0, MAX_QUERIES);

    return {
      question,
      standaloneQuestion,
      searchQueries,
      lexicalTerms: lexicalTermsFor([standaloneQuestion, ...llmQueries, ...expansions]),
      inDomain,
      isFollowUp,
      mentionsHanseniase: heuristic.mentionsHanseniase,
      method: 'llm'
    };
  }
}
