// Fase 0: congela a configuração do experimento (config_experimento.json) e faz uma chamada de
// teste com uma pergunta fora do conjunto, que não entra nos resultados.
// Uso (em backend/): npx tsx ../avaliacao/fase0_config.ts
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { prisma } from '../backend/src/config/database';
import { CLINICAL_SYSTEM_PROMPT } from '../backend/src/modules/chat/prompt-builder.service';
import { criarCliente } from './cliente_ia';

const RAIZ = path.resolve(__dirname, '..');
const KB = path.join(RAIZ, 'backend', 'knowledge-base');
const sha256 = (dados: string | Buffer) => createHash('sha256').update(dados).digest('hex');
const arquivoSha = (arquivo: string) => sha256(readFileSync(arquivo));
const git = (cmd: string) => execSync(`git ${cmd}`, { cwd: RAIZ }).toString().trim();

async function main() {
  const manifest = JSON.parse(readFileSync(path.join(KB, 'manifest.json'), 'utf8'));
  const contagens: Array<{ document_id: string; trechos: number; modelo: string | null; ativo: boolean }> =
    await prisma.$queryRawUnsafe(`
      select d.document_id, count(c.id)::int as trechos, max(c.embedding_model) as modelo, d.active as ativo
      from documents d left join chunks c on c.document_id = d.document_id
      group by d.document_id, d.active order by d.active desc, d.document_id`);
  const ingestoes = await prisma.$queryRawUnsafe(`
      select document_id, status, embedding_model, chunks_total, finished_at
      from ingestion_runs order by started_at desc limit 5`);

  const corpus = manifest.documents.map((doc: any) => {
    const pdf = path.join(KB, 'raw', `${doc.documentId}.pdf`);
    const jsonl = path.join(KB, 'processed', `${doc.documentId}.jsonl`);
    const shaPdf = existsSync(pdf) ? arquivoSha(pdf) : null;
    const excluidas = doc.outline.filter((s: any) => s.exclude).map((s: any) => s.title);
    return {
      documento: doc.documentId,
      titulo: doc.title,
      instituicao: doc.institution,
      ano: doc.publicationYear,
      idioma: doc.language,
      isbn: doc.isbn ?? null,
      arquivo_pdf: path.relative(RAIZ, pdf).replaceAll('\\', '/'),
      sha256_pdf: shaPdf,
      sha256_confere_com_manifesto: shaPdf === doc.sha256,
      paginas_do_pdf: doc.pageCount,
      paginas_usadas: doc.extraction.contentPages,
      recortado: true,
      secoes_excluidas_do_sumario: excluidas,
      observacao_de_exclusao: doc.notes,
      trechos_processados: readFileSync(jsonl, 'utf8').split('\n').filter(Boolean).length,
      arquivo_trechos: path.relative(RAIZ, jsonl).replaceAll('\\', '/'),
      sha256_trechos: arquivoSha(jsonl),
      trechos_no_banco: contagens.find((c) => c.document_id === doc.documentId)?.trechos ?? 0
    };
  });

  const cliente = criarCliente();
  const config = {
    congelado_em: new Date().toISOString(),
    commit: git('rev-parse HEAD'),
    branch: git('rev-parse --abbrev-ref HEAD'),
    arvore_backend: git('rev-parse HEAD:backend'),
    backend_sem_alteracoes_locais: git('status --porcelain -- backend').length === 0,
    invocacao: {
      forma: 'ChatService do backend executado no processo (mesmo fluxo de POST /api/chat/ask), repositório somente leitura',
      adaptador: 'avaliacao/cliente_ia.ts',
      banco: 'banco de produção (Neon), somente leitura; conversas e registros mantidos em memória',
      sessao: 'nova a cada chamada, sem histórico',
      perfil: cliente.configuracao.perfil
    },
    modelo: {
      gerador: cliente.configuracao.modelo_gerador,
      provedor: 'OpenAI (API de chat completions)',
      esforco_de_raciocinio: cliente.configuracao.esforco_raciocinio,
      temperatura_resposta: 0.1,
      temperatura_interpretacao_da_pergunta: 0,
      max_tokens_resposta: 1400,
      max_tokens_interpretacao: 400,
      top_p: 'padrão da API (não definido pelo sistema)'
    },
    recuperacao: {
      modelo_embeddings: cliente.configuracao.modelo_embeddings,
      dimensoes: 1536,
      top_k_por_lista: cliente.configuracao.top_k,
      top_n_contexto: cliente.configuracao.top_n,
      similaridade_minima: cliente.configuracao.similaridade_minima,
      pontuacao_textual_minima: 0.1,
      fusao: 'RRF, k = 60; lista textual com peso max(1, 0,5 × nº de listas vetoriais)',
      indice_vetorial: 'HNSW (vector_cosine_ops)',
      fragmentacao: { tokens_alvo: 450, tokens_max: 700, tokens_min: 80, sobreposicao_tokens: 120 }
    },
    prompt_de_sistema: {
      texto: CLINICAL_SYSTEM_PROMPT,
      sha256: sha256(CLINICAL_SYSTEM_PROMPT),
      sha256_interpretacao_da_pergunta: arquivoSha(
        path.join(RAIZ, 'backend', 'src', 'modules', 'retrieval', 'query-analyzer.service.ts')
      ),
      observacao: 'O prompt de interpretação da pergunta está no código de query-analyzer.service.ts; registra-se o SHA-256 do arquivo.'
    },
    corpus,
    estado_do_banco: { documentos: contagens, ultimas_ingestoes: ingestoes },
    divergencia_de_corpus:
      'O protocolo cita as Portarias SCTIE/MS nº 47 e nº 51/2026 e uma orientação técnica da OMS de 2023, que não estão no repositório. Conforme a regra 3 (versões que estão no repositório), a avaliação usa o corpus indexado listado acima.'
  };
  writeFileSync(path.join(__dirname, 'config_experimento.json'), JSON.stringify(config, null, 2) + '\n');

  const teste = await cliente.perguntar('O que é hanseníase?');
  writeFileSync(
    path.join(__dirname, 'teste_adaptador.json'),
    JSON.stringify({ pergunta: 'O que é hanseníase?', observacao: 'Chamada de teste, fora do conjunto; não entra nos resultados.', ...teste }, null, 2) + '\n'
  );
  console.log(`commit ${config.commit}; modelo ${config.modelo.gerador} (${config.modelo.esforco_de_raciocinio}); embeddings ${config.recuperacao.modelo_embeddings}`);
  console.log(corpus.map((c: any) => `${c.documento}: ${c.trechos_processados} trechos, banco ${c.trechos_no_banco}, sha ok ${c.sha256_confere_com_manifesto}`).join('\n'));
  console.log(`teste: ${teste.latencia_ms} ms, recusa ${teste.recusa}, ${teste.fontes_citadas.length} fontes, tokens ${teste.tokens.entrada}/${teste.tokens.saida}, ${teste.resposta.length} caracteres`);
  await cliente.encerrar();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
