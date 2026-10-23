// Utilitários de texto em português usados na recuperação, nas regras de segurança e na ingestão.
// A comparação é sempre sem acentos e por palavra inteira: "enh" não pode casar com "tenho",
// nem "parar" com "comparar".

/** Minúsculas, sem acentos e com espaços simples. */
export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Palavras do texto normalizado (letras e algarismos; hífens internos preservados). */
export function tokenize(text: string) {
  return normalizeText(text)
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^-+|-+$/g, ''))
    .filter(Boolean);
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const termPatternCache = new Map<string, RegExp>();

/**
 * Expressão que casa o termo como palavra (ou sequência de palavras) inteira. Um `*` final indica
 * prefixo: "prescrev*" casa "prescrever" e "prescrevo", mas não "descrever".
 */
function termPattern(term: string) {
  const cached = termPatternCache.get(term);
  if (cached) return cached;

  const normalized = normalizeText(term);
  const isPrefix = normalized.endsWith('*');
  const body = escapeRegExp(isPrefix ? normalized.slice(0, -1) : normalized).replace(/ /g, '\\s+');
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])${body}${isPrefix ? '[\\p{L}\\p{N}]*' : ''}(?![\\p{L}\\p{N}])`,
    'u'
  );
  termPatternCache.set(term, pattern);
  return pattern;
}

/** Verdadeiro se algum dos termos aparece no texto como palavra inteira (ou prefixo, com `*`). */
export function containsAnyTerm(text: string, terms: readonly string[]) {
  const normalized = normalizeText(text);
  return terms.some((term) => termPattern(term).test(normalized));
}

/** Termos da lista presentes no texto. */
export function matchedTerms(text: string, terms: readonly string[]) {
  const normalized = normalizeText(text);
  return terms.filter((term) => termPattern(term).test(normalized));
}

// Palavras sem valor de busca. Removidas da consulta textual e da verificação de sobreposição.
export const PORTUGUESE_STOPWORDS = new Set([
  'a',
  'ao',
  'aos',
  'as',
  'ate',
  'com',
  'como',
  'da',
  'das',
  'de',
  'dela',
  'dele',
  'deles',
  'delas',
  'do',
  'dos',
  'e',
  'ela',
  'elas',
  'ele',
  'eles',
  'em',
  'entre',
  'era',
  'essa',
  'essas',
  'esse',
  'esses',
  'esta',
  'estas',
  'este',
  'estes',
  'eu',
  'foi',
  'ha',
  'isso',
  'isto',
  'ja',
  'lhe',
  'mais',
  'mas',
  'me',
  'mesmo',
  'meu',
  'minha',
  'na',
  'nas',
  'nao',
  'nem',
  'no',
  'nos',
  'num',
  'numa',
  'o',
  'os',
  'ou',
  'para',
  'pela',
  'pelas',
  'pelo',
  'pelos',
  'por',
  'qual',
  'quais',
  'quando',
  'que',
  'quem',
  'se',
  'sem',
  'ser',
  'seu',
  'seus',
  'so',
  'sua',
  'suas',
  'tambem',
  'te',
  'tem',
  'ter',
  'um',
  'uma',
  'umas',
  'uns',
  'voce',
  'devo',
  'pode',
  'posso',
  'deve',
  'devem',
  'sao',
  'sobre',
  'feito',
  'feita',
  'fazer',
  'existe',
  'existem',
  'caso',
  'casos',
  'the',
  'of',
  'and',
  'in',
  'to',
  'is',
  'are',
  'for',
  'with',
  'on',
  'by',
  'be',
  'or',
  'an',
  'at',
  'as',
  'it',
  'this',
  'that'
]);

/** Palavras com conteúdo (sem stopwords e com ao menos duas letras), normalizadas. */
export function contentWords(text: string) {
  return tokenize(text).filter((token) => token.length > 1 && !PORTUGUESE_STOPWORDS.has(token));
}
