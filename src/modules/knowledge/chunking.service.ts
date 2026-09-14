export interface ChunkingOptions {
  targetTokens?: number;
  overlapRatio?: number;
}

export class ChunkingService {
  chunkRawText(text: string, options: ChunkingOptions = {}) {
    const targetTokens = options.targetTokens ?? 700;
    const overlapRatio = options.overlapRatio ?? 0.2;
    const paragraphs = text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let current: string[] = [];
    let currentTokens = 0;

    for (const paragraph of paragraphs) {
      const paragraphTokens = this.estimateTokens(paragraph);
      const preservesClinicalUnit = this.looksLikeTable(paragraph) || this.looksLikeClinicalList(paragraph);

      if (currentTokens + paragraphTokens > targetTokens && current.length && !preservesClinicalUnit) {
        chunks.push(current.join('\n\n'));
        const overlapTokens = Math.floor(targetTokens * overlapRatio);
        current = this.tailByEstimatedTokens(current, overlapTokens);
        currentTokens = this.estimateTokens(current.join('\n\n'));
      }

      current.push(paragraph);
      currentTokens += paragraphTokens;
    }

    if (current.length) {
      chunks.push(current.join('\n\n'));
    }

    return chunks;
  }

  private estimateTokens(text: string) {
    return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
  }

  private looksLikeTable(paragraph: string) {
    return paragraph.includes('|') && paragraph.includes('---');
  }

  private looksLikeClinicalList(paragraph: string) {
    return /^[-*]\s+/m.test(paragraph) || /\b(dose|duração|contraindicação|conduta|sinais de alerta)\b/i.test(paragraph);
  }

  private tailByEstimatedTokens(paragraphs: string[], maxTokens: number) {
    const tail: string[] = [];
    let total = 0;

    for (const paragraph of [...paragraphs].reverse()) {
      const tokens = this.estimateTokens(paragraph);
      if (total + tokens > maxTokens) break;
      tail.unshift(paragraph);
      total += tokens;
    }

    return tail;
  }
}
