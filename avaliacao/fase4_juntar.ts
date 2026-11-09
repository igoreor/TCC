// Fase 4: reúne as avaliações dos lotes (validacao/avaliacoes/lote_*.json) em avaliacoes.jsonl e,
// se existirem, os julgamentos de contradição (validacao/contradicoes/pares_*.json) em
// validacao/contradicoes.json, conferindo que nada ficou sem avaliação.
// Uso: npx tsx avaliacao/fase4_juntar.ts [--contradicoes]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIR = __dirname;
const lerPasta = (pasta: string) =>
  readdirSync(path.join(DIR, pasta))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => JSON.parse(readFileSync(path.join(DIR, pasta, f), 'utf8')));

if (process.argv.includes('--contradicoes')) {
  const julgamentos = lerPasta('validacao/contradicoes');
  const { chave } = JSON.parse(readFileSync(path.join(DIR, 'validacao/chave_pares.json'), 'utf8'));
  const faltam = chave.filter((c: any) => !julgamentos.some((j: any) => j.par === c.par));
  if (faltam.length) throw new Error(`pares sem julgamento: ${faltam.map((c: any) => c.par).join(', ')}`);
  const saida = chave.map((c: any) => {
    const j = julgamentos.find((x: any) => x.par === c.par);
    return { id_pergunta: c.id_pergunta, par: c.par, contradicao: j.contradicao, justificativa: j.justificativa };
  });
  writeFileSync(path.join(DIR, 'validacao/contradicoes.json'), JSON.stringify(saida, null, 2) + '\n');
  console.log(`contradições: ${saida.filter((s: any) => s.contradicao).length} de ${saida.length} pares`);
} else {
  const avaliacoes = lerPasta('validacao/avaliacoes');
  const codigos = readFileSync(path.join(DIR, 'para_avaliar.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).codigo);
  const faltam = codigos.filter((c) => !avaliacoes.some((a: any) => a.codigo === c));
  const repetidos = codigos.filter((c) => avaliacoes.filter((a: any) => a.codigo === c).length > 1);
  if (faltam.length || repetidos.length) throw new Error(`faltam: ${faltam.join(', ')}; repetidos: ${repetidos.join(', ')}`);
  const obrigatorios = ['PER', 'COE', 'REG', 'CF', 'pontos_chave', 'afirmacoes', 'ALU', 'SEG', 'ABS'];
  const incompletos = avaliacoes.filter((a: any) => obrigatorios.some((campo) => a[campo] === undefined));
  if (incompletos.length) throw new Error(`avaliações incompletas: ${incompletos.map((a: any) => a.codigo).join(', ')}`);
  const ordenadas = codigos.map((c) => avaliacoes.find((a: any) => a.codigo === c));
  if (existsSync(path.join(DIR, 'avaliacoes.jsonl'))) console.log('avaliacoes.jsonl existente será substituído');
  writeFileSync(path.join(DIR, 'avaliacoes.jsonl'), ordenadas.map((a) => JSON.stringify(a)).join('\n') + '\n');
  console.log(`avaliações: ${ordenadas.length}; lacunas da referência: ${ordenadas.reduce((s: number, a: any) => s + (a.lacunas_da_referencia?.length ?? 0), 0)}`);
}
