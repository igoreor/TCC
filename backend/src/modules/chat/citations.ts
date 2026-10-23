import { contentWords } from '../../shared/text';

// Tratamento das citações [n] da resposta gerada: validação, renumeração na ordem de aparição e
// verificação de que cada fonte citada sustenta ao menos uma das frases que a citam.

const MARKER = /\[(\d+(?:\s*[,;–-]\s*\d+)*)\]/g;

function expandMarker(body: string) {
  const numbers: number[] = [];
  for (const part of body.split(/\s*[,;]\s*/)) {
    const range = /^(\d+)\s*[–-]\s*(\d+)$/.exec(part);
    if (range) {
      const [start, end] = [Number(range[1]), Number(range[2])];
      for (let value = start; value <= end && value - start < 20; value += 1) numbers.push(value);
    } else if (/^\d+$/.test(part)) {
      numbers.push(Number(part));
    }
  }
  return numbers;
}

/** Remove a lista de fontes que o modelo às vezes acrescenta no fim: a interface já a exibe. */
export function stripTrailingSourceList(answer: string) {
  const blocks = answer.trim().split(/\n\s*\n/);
  while (
    blocks.length > 1 &&
    /^(#+\s*)?(\*\*)?\s*(fontes|referências|referencias)\b/i.test(blocks.at(-1)!.trim())
  ) {
    blocks.pop();
  }
  return blocks.join('\n\n');
}

/**
 * Renumera as citações pela ordem em que aparecem e descarta números fora do intervalo do
 * contexto. `order[i]` é a posição (1-based) no contexto do trecho que passou a ser a fonte i + 1.
 */
export function renumberCitations(answer: string, contextSize: number) {
  const order: number[] = [];
  const text = answer.replace(MARKER, (_match, body: string) => {
    const valid = [...new Set(expandMarker(body))].filter(
      (number) => number >= 1 && number <= contextSize
    );
    return valid
      .map((number) => {
        if (!order.includes(number)) order.push(number);
        return `[${order.indexOf(number) + 1}]`;
      })
      .join('');
  });
  return { text: text.replace(/[ \t]+([.,;:])/g, '$1'), order };
}

/** Frases que citam cada fonte (numeração já final). */
export function sentencesByCitation(answer: string) {
  const result = new Map<number, string[]>();
  const sentences = answer.split(/(?<=[.!?])\s+|\n+/);
  for (const sentence of sentences) {
    const cited = [...sentence.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));
    const text = sentence.replace(/\[\d+\]/g, '').trim();
    if (!text) continue;
    for (const index of cited) {
      result.set(index, [...(result.get(index) ?? []), text]);
    }
  }
  return result;
}

// Compara palavras pelo início (5 letras): "recomendado" e "recomendação" contam como a mesma.
function stems(text: string) {
  return new Set(contentWords(text).map((word) => (word.length > 5 ? word.slice(0, 5) : word)));
}

/** Há sobreposição suficiente de termos (ou de números) entre a frase e o trecho. */
export function lexicallySupported(sentence: string, excerpt: string) {
  const excerptStems = stems(excerpt);
  const shared = [...stems(sentence)].filter((stem) => excerptStems.has(stem));
  const numbers = sentence.match(/\d+(?:[.,]\d+)?/g) ?? [];
  const sharedNumber = numbers.some((number) => excerpt.includes(number));
  return shared.length >= 3 || (shared.length >= 2 && sharedNumber);
}

export function cosine(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}
