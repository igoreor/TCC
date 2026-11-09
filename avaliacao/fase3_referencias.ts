// Fase 3: reúne as referências da Trilha B (trilha_b/parte_*.json), confere o formato e se cada
// trecho citado é cópia literal do corpus, e congela referencias.json com SHA-256.
// Uso: npx tsx avaliacao/fase3_referencias.ts [--congelar]
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(__dirname, '..');
const KB = path.join(RAIZ, 'backend', 'knowledge-base');
const congelar = process.argv.includes('--congelar');

// Comparação tolerante apenas a espaços, quebras de linha e aspas tipográficas.
const normalizar = (texto: string) =>
  texto.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[‐‑–—]/g, '-').replace(/\s+/g, ' ').trim();

const trechos = new Map<string, { documento: string; texto: string }>();
const manifest = JSON.parse(readFileSync(path.join(KB, 'manifest.json'), 'utf8'));
for (const doc of manifest.documents) {
  for (const linha of readFileSync(path.join(KB, 'processed', `${doc.documentId}.jsonl`), 'utf8').split('\n').filter(Boolean)) {
    const t = JSON.parse(linha);
    trechos.set(t.chunk_id, { documento: t.document_id, texto: normalizar(t.content) });
  }
}

const { perguntas } = JSON.parse(readFileSync(path.join(__dirname, 'perguntas.json'), 'utf8'));
const referencias = [1, 2, 3, 4, 5].flatMap((n) =>
  JSON.parse(readFileSync(path.join(__dirname, 'trilha_b', `parte_${n}.json`), 'utf8'))
);

const problemas: string[] = [];
const COBERTURAS = ['integral', 'parcial', 'nao_respondivel'];
for (const p of perguntas) {
  const ref = referencias.find((r: any) => r.id === p.id);
  if (!ref) {
    problemas.push(`${p.id}: sem referência`);
    continue;
  }
  if (!COBERTURAS.includes(ref.cobertura)) problemas.push(`${p.id}: cobertura inválida (${ref.cobertura})`);
  if (!ref.resposta_referencia) problemas.push(`${p.id}: resposta_referencia vazia`);
  if (ref.cobertura !== 'nao_respondivel' && !(ref.pontos_chave?.length >= 2 && ref.pontos_chave.length <= 6)) {
    problemas.push(`${p.id}: ${ref.pontos_chave?.length ?? 0} pontos-chave (esperado 2 a 6)`);
  }
  for (const ponto of ref.pontos_chave ?? []) {
    const trecho = normalizar(ponto.trecho ?? '');
    const alvo = trechos.get(ponto.chunk_id);
    if (!alvo) {
      problemas.push(`${ponto.id}: chunk_id inexistente (${ponto.chunk_id})`);
    } else if (!alvo.texto.includes(trecho)) {
      const outro = [...trechos.entries()].find(([, t]) => t.texto.includes(trecho));
      problemas.push(
        outro
          ? `${ponto.id}: trecho está em ${outro[0]}, não em ${ponto.chunk_id}`
          : `${ponto.id}: trecho não encontrado literalmente no corpus: "${ponto.trecho.slice(0, 90)}"`
      );
    } else if (alvo.documento !== ponto.documento) {
      problemas.push(`${ponto.id}: documento ${ponto.documento} difere do trecho (${alvo.documento})`);
    }
  }
}

const contagem = Object.fromEntries(COBERTURAS.map((c) => [c, referencias.filter((r: any) => r.cobertura === c).length]));
console.log(`referências: ${referencias.length}; cobertura ${JSON.stringify(contagem)} (matriz prevista: 42/3/5)`);
console.log(`pontos-chave: ${referencias.reduce((s: number, r: any) => s + (r.pontos_chave?.length ?? 0), 0)}`);
console.log(problemas.length ? `PROBLEMAS (${problemas.length}):\n${problemas.join('\n')}` : 'nenhum problema: todos os trechos são literais do corpus');

if (congelar) {
  if (problemas.length) throw new Error('há problemas; referências não congeladas');
  if (existsSync(path.join(__dirname, 'referencias.sha256'))) throw new Error('referencias.json já está congelado');
  const ordenadas = perguntas.map((p: any) => referencias.find((r: any) => r.id === p.id));
  const conteudo =
    JSON.stringify(
      {
        gerado_em: new Date().toISOString(),
        metodo: 'Trilha B: 5 subagentes (Claude Opus 5.5), apenas com perguntas.json e o texto do corpus, sem acesso às respostas da IA',
        perguntas_sha256: readFileSync(path.join(__dirname, 'perguntas.sha256'), 'utf8').split(' ')[0],
        referencias: ordenadas
      },
      null,
      2
    ) + '\n';
  writeFileSync(path.join(__dirname, 'referencias.json'), conteudo);
  const hash = createHash('sha256').update(conteudo).digest('hex');
  writeFileSync(path.join(__dirname, 'referencias.sha256'), `${hash}  referencias.json\n`);
  console.log(`congelado: sha256 ${hash}`);
}
