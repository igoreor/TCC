// Fase 4: reúne, por pergunta, as afirmações corretas e sustentadas pelo corpus que a referência não
// incluía ("lacunas da referência") em referencias_erratas.json. referencias.json não é alterado.
// Uso: npx tsx avaliacao/fase4_erratas.ts
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIR = __dirname;
const avaliacoes = readFileSync(path.join(DIR, 'avaliacoes.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const { chave } = JSON.parse(readFileSync(path.join(DIR, 'validacao/chave_anonimato.json'), 'utf8'));

const porPergunta = new Map<string, Array<{ codigo: string; afirmacao: string; chunk_id: string; trecho: string }>>();
for (const a of avaliacoes) {
  const idPergunta = chave.find((c: any) => c.codigo === a.codigo).id_execucao.split('-')[1];
  for (const l of a.lacunas_da_referencia ?? []) {
    const lista = porPergunta.get(idPergunta) ?? [];
    lista.push({ codigo: a.codigo, afirmacao: l.afirmacao, chunk_id: l.chunk_id, trecho: l.trecho });
    porPergunta.set(idPergunta, lista);
  }
}
const erratas = [...porPergunta.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, lacunas]) => ({
    id,
    lacunas_registradas: lacunas.length,
    trechos_distintos: [...new Set(lacunas.map((l) => l.chunk_id))],
    lacunas
  }));
writeFileSync(
  path.join(DIR, 'referencias_erratas.json'),
  JSON.stringify(
    {
      observacao:
        'Afirmações corretas e sustentadas pelo corpus presentes nas respostas da IA e ausentes da referência congelada, registradas pelos avaliadores e não penalizadas. referencias.json não foi alterado.',
      total_lacunas: erratas.reduce((s, e) => s + e.lacunas_registradas, 0),
      perguntas: erratas.length,
      erratas
    },
    null,
    2
  ) + '\n'
);
console.log(`lacunas: ${erratas.reduce((s, e) => s + e.lacunas_registradas, 0)} em ${erratas.length} perguntas`);
