// Fase 4, passo final (depois de todas as avaliações): calcula a similaridade semântica entre as
// duas respostas de cada pergunta (cosseno, text-embedding-3-small) e prepara os pares para o
// julgamento cego de contradição entre execuções (ordem das respostas sorteada, sem rodada).
// Uso (em backend/): npx tsx ../avaliacao/fase4_consistencia.ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { EmbeddingsService } from '../backend/src/modules/embeddings/embeddings.service';
import { aleatorio } from './fase2_trilha_a';

const SEMENTE_PARES = 20261112;

async function main() {
  const execucoes = readFileSync(path.join(__dirname, 'execucoes.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const { perguntas } = JSON.parse(readFileSync(path.join(__dirname, 'perguntas.json'), 'utf8'));
  const embeddings = new EmbeddingsService();
  if (!embeddings.semantic) throw new Error('embeddings semânticos indisponíveis (OPENAI_API_KEY)');

  const cosseno = (a: number[], b: number[]) => {
    let d = 0;
    let na = 0;
    let nb = 0;
    a.forEach((x, i) => {
      d += x * b[i];
      na += x * x;
      nb += b[i] * b[i];
    });
    return d / Math.sqrt(na * nb);
  };

  const rand = aleatorio(SEMENTE_PARES);
  const similaridades = [];
  const pares = [];
  const chave = [];
  for (const [i, p] of perguntas.entries()) {
    const r1 = execucoes.find((e) => e.id_pergunta === p.id && e.rodada === 1);
    const r2 = execucoes.find((e) => e.id_pergunta === p.id && e.rodada === 2);
    const [v1, v2] = await embeddings.embedMany([r1.resposta ?? '', r2.resposta ?? '']);
    similaridades.push({ id_pergunta: p.id, cosseno: Number(cosseno(v1, v2).toFixed(4)), modelo: embeddings.modelId });
    const inverter = rand() < 0.5;
    const [a, b] = inverter ? [r2, r1] : [r1, r2];
    const codigo = `P${String(i + 1).padStart(2, '0')}`;
    pares.push({ par: codigo, pergunta: p.pergunta, resposta_a: a.resposta, resposta_b: b.resposta });
    chave.push({ par: codigo, id_pergunta: p.id, resposta_a: a.id_execucao, resposta_b: b.id_execucao });
  }
  const pasta = path.join(__dirname, 'validacao');
  mkdirSync(path.join(pasta, 'pares'), { recursive: true });
  writeFileSync(path.join(pasta, 'similaridade.json'), JSON.stringify(similaridades, null, 2) + '\n');
  writeFileSync(path.join(pasta, 'chave_pares.json'), JSON.stringify({ semente: SEMENTE_PARES, chave }, null, 2) + '\n');
  writeFileSync(path.join(pasta, 'pares', 'pares_1.json'), JSON.stringify(pares.slice(0, 25), null, 2) + '\n');
  writeFileSync(path.join(pasta, 'pares', 'pares_2.json'), JSON.stringify(pares.slice(25), null, 2) + '\n');
  const valores = similaridades.map((s) => s.cosseno);
  console.log(`similaridade média ${(valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(3)}; mínima ${Math.min(...valores).toFixed(3)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
