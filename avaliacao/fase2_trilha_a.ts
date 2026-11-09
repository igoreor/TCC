// Fase 2 (Trilha A): envia as 50 perguntas à IA do projeto em duas rodadas, cada uma em ordem
// aleatória diferente (semente registrada), com chamadas independentes. Grava cada chamada em
// execucoes.jsonl, exatamente como veio. Não imprime respostas (isolamento da Trilha B).
// Retoma de onde parou se o arquivo já existir.
// Uso (em backend/): npx tsx ../avaliacao/fase2_trilha_a.ts
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { criarCliente } from './cliente_ia';

export const SEMENTES = { rodada_1: 20261109, rodada_2: 20261110 };
const TENTATIVAS_EXTRAS = 2;
const ARQUIVO = path.join(__dirname, 'execucoes.jsonl');

/** Gerador pseudoaleatório mulberry32: a mesma semente reproduz a mesma ordem. */
export function aleatorio(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function embaralhar<T>(itens: T[], semente: number) {
  const copia = [...itens];
  const rand = aleatorio(semente);
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

async function main() {
  const { perguntas } = JSON.parse(readFileSync(path.join(__dirname, 'perguntas.json'), 'utf8'));
  const feitas = new Set(
    existsSync(ARQUIVO)
      ? readFileSync(ARQUIVO, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).id_execucao)
      : []
  );
  const cliente = criarCliente();

  for (const [rodada, semente] of [[1, SEMENTES.rodada_1], [2, SEMENTES.rodada_2]] as const) {
    const ordem = embaralhar(perguntas, semente);
    for (const [indice, p] of ordem.entries()) {
      const id_execucao = `R${rodada}-${p.id}`;
      if (feitas.has(id_execucao)) continue;
      const tentativas: Array<{ tentativa: number; timestamp: string; erro: string }> = [];
      let resultado: Awaited<ReturnType<typeof cliente.perguntar>> | null = null;
      let timestamp = '';
      for (let tentativa = 1; tentativa <= 1 + TENTATIVAS_EXTRAS && !resultado; tentativa += 1) {
        timestamp = new Date().toISOString();
        try {
          resultado = await cliente.perguntar(p.pergunta);
        } catch (error) {
          tentativas.push({ tentativa, timestamp, erro: String(error).slice(0, 500) });
        }
      }
      const registro = {
        id_execucao,
        id_pergunta: p.id,
        rodada,
        semente,
        posicao_na_ordem: indice + 1,
        timestamp,
        pergunta_enviada: p.pergunta,
        resposta: resultado?.resposta ?? null,
        recusa: resultado?.recusa ?? null,
        motivo_recusa: resultado?.motivo_recusa ?? null,
        risco_clinico: resultado?.risco_clinico ?? null,
        intencao: resultado?.intencao ?? null,
        pergunta_interpretada: resultado?.pergunta_interpretada ?? null,
        consultas_de_busca: resultado?.consultas_de_busca ?? null,
        busca_ampliada: resultado?.busca_ampliada ?? null,
        fontes_citadas: resultado?.fontes_citadas ?? null,
        fontes_recuperadas: resultado?.trechos_recuperados ?? null,
        latencia_ms: resultado?.latencia_ms ?? null,
        tokens: resultado?.tokens ?? null,
        modelo: resultado?.modelo ?? null,
        tentativas_com_erro: tentativas,
        erro: resultado ? null : 'falha técnica após 3 tentativas'
      };
      appendFileSync(ARQUIVO, JSON.stringify(registro) + '\n');
      console.log(`${id_execucao} pos ${indice + 1} ${resultado ? `ok ${resultado.latencia_ms} ms` : 'FALHA TÉCNICA'}${tentativas.length ? ` (${tentativas.length} erro(s))` : ''}`);
    }
  }
  await cliente.encerrar();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
