// Fase 4, passo 1: embaralha as 100 respostas, atribui códigos anônimos (sem rodada nem posição),
// grava para_avaliar.jsonl e distribui as respostas em 10 lotes de avaliação, sem duas respostas
// da mesma pergunta no mesmo lote. A chave código → execução fica em validacao/chave_anonimato.json,
// que os avaliadores não leem.
// Uso: npx tsx avaliacao/fase4_anonimizar.ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { embaralhar } from './fase2_trilha_a';

export const SEMENTE_ANONIMATO = 20261111;
const N_LOTES = 10;

const execucoes = readFileSync(path.join(__dirname, 'execucoes.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l));
const { perguntas } = JSON.parse(readFileSync(path.join(__dirname, 'perguntas.json'), 'utf8'));
const { referencias } = JSON.parse(readFileSync(path.join(__dirname, 'referencias.json'), 'utf8'));
if (execucoes.length !== 100) throw new Error(`esperadas 100 execuções, há ${execucoes.length}`);

const embaralhadas = embaralhar(execucoes, SEMENTE_ANONIMATO);
const itens = embaralhadas.map((e, i) => {
  const p = perguntas.find((q: any) => q.id === e.id_pergunta);
  const r = referencias.find((q: any) => q.id === e.id_pergunta);
  return {
    codigo: `A${String(i + 1).padStart(3, '0')}`,
    id_pergunta: e.id_pergunta,
    pergunta: p.pergunta,
    registro: p.registro,
    composta: p.composta,
    resposta_da_ia: e.resposta,
    falha_tecnica: e.erro !== null,
    recusa_por_regra_de_seguranca: e.recusa,
    motivo_da_recusa: e.motivo_recusa,
    fontes_citadas_pela_ia: (e.fontes_citadas ?? []).map((f: any) => ({ indice: f.indice, chunk_id: f.chunk_id, referencia: f.referencia })),
    referencia: {
      resposta_referencia: r.resposta_referencia,
      pontos_chave: r.pontos_chave,
      pontos_proibidos: r.pontos_proibidos,
      cobertura: r.cobertura,
      justificativa_cobertura: r.justificativa_cobertura,
      comportamento_esperado: r.comportamento_esperado,
      divergencias_entre_documentos: r.divergencias_entre_documentos
    }
  };
});

const pasta = path.join(__dirname, 'validacao');
mkdirSync(path.join(pasta, 'lotes'), { recursive: true });
writeFileSync(path.join(__dirname, 'para_avaliar.jsonl'), itens.map((i) => JSON.stringify(i)).join('\n') + '\n');
writeFileSync(
  path.join(pasta, 'chave_anonimato.json'),
  JSON.stringify(
    { semente: SEMENTE_ANONIMATO, chave: embaralhadas.map((e, i) => ({ codigo: itens[i].codigo, id_execucao: e.id_execucao })) },
    null,
    2
  ) + '\n'
);

// Distribuição em lotes: cada lote recebe no máximo uma resposta de cada pergunta.
const lotes: typeof itens[] = Array.from({ length: N_LOTES }, () => []);
for (const item of itens) {
  const destino = lotes
    .map((lote, indice) => ({ lote, indice }))
    .filter(({ lote }) => lote.length < 100 / N_LOTES && !lote.some((x) => x.id_pergunta === item.id_pergunta))
    .sort((a, b) => a.lote.length - b.lote.length)[0];
  if (!destino) throw new Error('não foi possível distribuir os lotes');
  destino.lote.push(item);
}
lotes.forEach((lote, i) => {
  // O lote não leva id_pergunta nem campos que permitam ligar a resposta à rodada.
  const semId = lote.map(({ id_pergunta, ...resto }) => resto);
  writeFileSync(path.join(pasta, 'lotes', `lote_${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(semId, null, 2) + '\n');
});
console.log(`itens ${itens.length}; lotes ${lotes.map((l) => l.length).join('/')}; falhas técnicas ${itens.filter((i) => i.falha_tecnica).length}; recusas ${itens.filter((i) => i.recusa_por_regra_de_seguranca).length}`);
