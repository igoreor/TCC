// Fase 6: gera avaliacao/RELATORIO_RESULTADOS.md a partir de resultados/metricas.json, das
// configurações congeladas e das avaliações (para a análise de erros).
// Uso: npx tsx avaliacao/relatorio.ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIR = __dirname;
const ler = (a: string) => JSON.parse(readFileSync(path.join(DIR, a), 'utf8'));
const lerJsonl = (a: string) => readFileSync(path.join(DIR, a), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const hash = (a: string) => readFileSync(path.join(DIR, a), 'utf8').split(' ')[0];
const n2 = (x: number | null | undefined, casas = 2) => (x === null || x === undefined || Number.isNaN(x) ? '—' : x.toFixed(casas).replace('.', ','));
const pct = (x: number | null | undefined, casas = 0) => (x === null || x === undefined ? '—' : `${(x * 100).toFixed(casas).replace('.', ',')}%`);

const m = ler('resultados/metricas.json');
const config = ler('config_experimento.json');
const { referencias } = ler('referencias.json');
const { perguntas } = ler('perguntas.json');
const execucoes = lerJsonl('execucoes.jsonl');
const avaliacoes = lerJsonl('avaliacoes.jsonl');
const { chave } = ler('validacao/chave_anonimato.json');
const consolidacaoArq = path.join(DIR, 'validacao_especialista/consolidacao.json');
const consolidacao = existsSync(consolidacaoArq) ? ler('validacao_especialista/consolidacao.json') : null;
const selecao = existsSync(path.join(DIR, 'validacao_especialista/selecao.json')) ? ler('validacao_especialista/selecao.json') : null;
const erratas = existsSync(path.join(DIR, 'referencias_erratas.json')) ? ler('referencias_erratas.json') : [];
const status = consolidacao ? 'finais (validações 1, 2 e 3)' : 'preliminares (validações 1 e 2; validação 3 pendente)';

const linhasPorResposta = readFileSync(path.join(DIR, 'resultados/metricas_por_resposta.csv'), 'utf8');
void linhasPorResposta;

const tabelaRecorte = (titulo: string, numero: number, grupos: Record<string, any>, rotulos: Record<string, string> = {}) =>
  [
    `**Tabela ${numero} – ${titulo}**`,
    '',
    '| Grupo | n | NG média (DP) | Acurácia | IC 95% (Wilson) | Alucinação | Alerta de segurança |',
    '|---|---|---|---|---|---|---|',
    ...Object.entries(grupos).map(
      ([g, v]: [string, any]) =>
        `| ${rotulos[g] ?? g} | ${v.n} | ${n2(v.ng_media)} (${n2(v.ng_dp)}) | ${pct(v.acuracia)} | ${pct(v.ic95_inferior)}–${pct(v.ic95_superior)} | ${pct(v.alucinacao)} | ${pct(v.alerta_seguranca)} |`
    ),
    '',
    `Fonte: elaboração própria (2026), a partir de \`resultados/metricas.json\`. Resultados ${status}.`,
    ''
  ].join('\n');

// Análise de erros
const porCodigo = (codigo: string) => {
  const id = chave.find((c: any) => c.codigo === codigo).id_execucao;
  return execucoes.find((e: any) => e.id_execucao === id);
};
const erros = avaliacoes
  .map((a: any) => ({ a, e: porCodigo(a.codigo) }))
  .filter(({ a }: any) => a.ALU || a.SEG >= 1 || a.ABS === 'recusa_indevida' || a.ABS === 'falha_de_abstencao');
const linhaErro = ({ a, e }: any) => {
  const tipos = [a.ALU && 'alucinação', a.SEG >= 1 && `alerta de segurança ${a.SEG}`, a.ABS === 'recusa_indevida' && 'recusa indevida', a.ABS === 'falha_de_abstencao' && 'falha de abstenção'].filter(Boolean).join(', ');
  const problema = (a.afirmacoes ?? []).find((x: any) => x.classificacao !== 'sustentada');
  const just = [a.SEG >= 1 ? a.SEG_justificativa : null, a.ALU ? a.ALU_justificativa : null, a.ABS_justificativa].filter(Boolean)[0] ?? '';
  return `- **${e.id_execucao}** (${tipos}). ${just}${problema ? ` Trecho da resposta: “${String(problema.texto).slice(0, 220)}”` : ''}`;
};

const coberturaReal = ['integral', 'parcial', 'nao_respondivel'].map((c) => referencias.filter((r: any) => r.cobertura === c).length);
const lacunas = avaliacoes.flatMap((a: any) => (a.lacunas_da_referencia ?? []).map((l: any) => ({ codigo: a.codigo, ...l })));

const t = m.testes_exploratorios;
const g = m.geral;
let n = 0;
const proxima = () => (n += 1);

const md = `# Relatório de resultados — avaliação da IA com 50 perguntas

Resultados **${status}**. Gerado automaticamente por \`avaliacao/relatorio.ts\` em ${new Date().toISOString().slice(0, 10)}. Protocolo em \`AVALIACAO_HANSENIASE.md\`; decisões e problemas em \`avaliacao/DIARIO.md\`.

## 1. Configuração experimental

| Item | Valor |
|---|---|
| Commit avaliado | \`${config.commit.slice(0, 7)}\` (backend sem alterações locais: ${config.backend_sem_alteracoes_locais ? 'sim' : 'não'}) |
| Modelo gerador | \`${config.modelo.gerador}\`, raciocínio \`${config.modelo.esforco_de_raciocinio}\`, temperatura ${n2(config.modelo.temperatura_resposta, 1)} |
| Recuperação | \`${config.recuperacao.modelo_embeddings}\`; top-K ${config.recuperacao.top_k_por_lista}; top-N ${config.recuperacao.top_n_contexto}; similaridade mínima ${n2(config.recuperacao.similaridade_minima)} |
| Prompt de sistema | SHA-256 \`${config.prompt_de_sistema.sha256.slice(0, 16)}…\` |
| Corpus | ${config.corpus.length} documentos, ${config.corpus.reduce((s: number, c: any) => s + c.trechos_processados, 0)} trechos (SHA-256 de cada PDF em \`config_experimento.json\`) |
| Perguntas | 50, SHA-256 \`${hash('perguntas.sha256').slice(0, 16)}…\` |
| Referências | SHA-256 \`${hash('referencias.sha256').slice(0, 16)}…\`, gravado antes da abertura das respostas da IA |
| Execução da Trilha A | ${execucoes[0].timestamp.slice(0, 16).replace('T', ' ')} a ${execucoes[execucoes.length - 1].timestamp.slice(0, 16).replace('T', ' ')} (UTC); sementes 20261109 e 20261110 |
| Avaliador (validações 1 e 2) | Claude Opus 5.5 (\`claude-opus-5-5\`), Anthropic, segundo \`rubrica.md\`, cego quanto à rodada |
| Respostas | ${m.respostas_totais}; falhas técnicas: ${m.falhas_tecnicas}; recusas por regra de segurança: ${m.recusas_por_regra} |

Unidade principal: resposta. As médias principais excluem a T36 ("em decisão" na curadoria), totalizando ${g.n} respostas de 49 perguntas; a T36 é reportada à parte (seção 7).

## 2. Resultado geral

**Tabela ${proxima()} – Métricas gerais das respostas da IA**

| Métrica | Valor |
|---|---|
| Acurácia (resposta correta) | ${pct(g.acuracia, 1)} (${g.acertos}/${g.n}); IC 95% ${pct(g.ic95_inferior, 1)}–${pct(g.ic95_superior, 1)} |
| Nota global (NG), média (DP) | ${n2(g.ng_media)} (${n2(g.ng_dp)}) |
| Pertinência (PER, 0–2) | ${n2(m.medias.PER)} |
| Adequação ao registro (REG, 0–2) | ${n2(m.medias.REG)} |
| Coerência interna (COE = sim) | ${pct(m.medias.coerencia_interna, 1)} |
| Correção factual (CF, 0–2) | ${n2(m.medias.CF)} |
| Cobertura de pontos-chave (CPC) | ${n2(m.medias.CPC)} |
| Precisão de afirmações (PA) | ${n2(m.medias.PA)} |
| Fundamentação das fontes (FF, 0–2) | ${n2(m.medias.FF)} |
| Recuperação (REC) | ${n2(m.medias.REC)} |
| Respostas com alucinação | ${pct(g.alucinacao, 1)} |
| Respostas com alerta de segurança (SEG ≥ 1) | ${pct(g.alerta_seguranca, 1)} |
| Respostas com erro de potencial dano (SEG = 2) | ${pct(g.alerta_dano, 1)} |

Fonte: elaboração própria (2026). Resultados ${status}.

## 3. Recortes

${tabelaRecorte('Resultados por tema', proxima(), m.recortes.tema)}
${tabelaRecorte('Resultados por registro', proxima(), m.recortes.registro)}
${tabelaRecorte('Resultados por origem da pergunta', proxima(), m.recortes.origem)}
${tabelaRecorte('Resultados por complexidade', proxima(), m.recortes.composta, { true: 'Composta', false: 'Simples' })}
${tabelaRecorte('Resultados por cobertura do corpus', proxima(), m.recortes.cobertura, { integral: 'Integral', parcial: 'Parcial', nao_respondivel: 'Não respondível' })}
**Testes exploratórios** (${t.observacao}): acurácia leigo × técnico, Fisher p = ${n2(t.fisher_registro, 3)}; acurácia por origem (publicada × adaptação × autoral), Fisher-Freeman-Halton p = ${n2(t.fisher_origem, 3)}; NG leigo × técnico, Mann-Whitney U = ${n2(t.mann_whitney_registro.U, 1)}, p = ${n2(t.mann_whitney_registro.p, 3)}; NG por origem, Kruskal-Wallis H = ${n2(t.kruskal_wallis_origem.H)}, gl = ${t.kruskal_wallis_origem.gl}, p = ${n2(t.kruskal_wallis_origem.p, 3)}.

## 4. Abstenção

Distribuição das classificações de abstenção: ${Object.entries(m.abstencao.distribuicao).map(([k, v]) => `${k}: ${v}`).join('; ')}.

**Tabela ${proxima()} – Matriz de abstenção (respostas)**

| | Absteve-se | Não se absteve |
|---|---|---|
| Deveria se abster (cobertura parcial ou não respondível) | ${m.abstencao.matriz.deveria_e_absteve} | ${m.abstencao.matriz.deveria_e_nao_absteve} |
| Não deveria (cobertura integral) | ${m.abstencao.matriz.nao_deveria_e_absteve} | ${m.abstencao.matriz.nao_deveria_e_nao_absteve} |

Fonte: elaboração própria (2026).

Taxa de abstenção correta nas não respondíveis: ${pct(m.abstencao.taxa_abstencao_correta)} (n = ${m.abstencao.n_nao_respondiveis}). Taxa de recusa indevida nas respostas a perguntas cobertas pelo corpus: ${pct(m.abstencao.taxa_recusa_indevida, 1)} (n = ${m.abstencao.n_cobertas}).

## 5. Consistência entre execuções

**Tabela ${proxima()} – Consistência entre as duas execuções (${m.consistencia.perguntas} perguntas)**

| Indicador | Valor |
|---|---|
| Veredito estável | ${pct(m.consistencia.veredito_estavel)} |
| Correta nas duas | ${pct(m.consistencia.correta_nas_duas)} |
| Correta em pelo menos uma (pass@2) | ${pct(m.consistencia.pass_at_2)} |
| Correta em nenhuma | ${pct(m.consistencia.correta_em_nenhuma)} |
| \\|NG₁ − NG₂\\| médio | ${n2(m.consistencia.dif_ng_media)} |
| Similaridade de cosseno média (\`text-embedding-3-small\`) | ${n2(m.consistencia.similaridade_media)} |
| Pares com contradição entre execuções | ${m.consistencia.contradicoes} |

Fonte: elaboração própria (2026).

## 6. Análise de erros

Respostas com alucinação, alerta de segurança, recusa indevida ou falha de abstenção (${erros.length}):

${erros.length ? erros.map(linhaErro).join('\n') : '- Nenhuma.'}

## 7. Pergunta em decisão (T36)

${m.t36.respostas.map((r: any) => `- Rodada ${r.rodada}: NG ${n2(r.NG)}, ${r.correta ? 'correta' : 'incorreta'}, abstenção ${r.ABS}, SEG ${r.SEG}.`).join('\n')}

## 8. Cobertura real do corpus × matriz prevista

| Cobertura | Prevista na curadoria | Observada na Trilha B |
|---|---|---|
| Integral | 42 | ${coberturaReal[0]} |
| Parcial | 3 | ${coberturaReal[1]} |
| Não respondível | 5 | ${coberturaReal[2]} |

Perguntas parciais: ${referencias.filter((r: any) => r.cobertura === 'parcial').map((r: any) => r.id).join(', ')}. Não respondíveis: ${referencias.filter((r: any) => r.cobertura === 'nao_respondivel').map((r: any) => r.id).join(', ')}. A diferença decorre, em parte, de o corpus do repositório não conter as Portarias SCTIE/MS nº 47 e nº 51/2026 nem a orientação técnica da OMS de 2023 citadas no protocolo (ver \`DIARIO.md\`).

## 9. Lacunas da referência

${lacunas.length} afirmação(ões) correta(s) e sustentada(s) pelo corpus que a referência não incluía foram registradas pelos avaliadores${erratas.length ? ` e reunidas em \`referencias_erratas.json\` (${erratas.length} perguntas)` : ''}; não foram penalizadas.

## 10. Desempenho operacional

Latência média ${n2(m.operacional.latencia_media_ms / 1000, 1)} s, mediana ${n2(m.operacional.latencia_mediana_ms / 1000, 1)} s, p95 ${n2(m.operacional.latencia_p95_ms / 1000, 1)} s. Tokens médios por pergunta (interpretação e resposta): ${Math.round(m.operacional.tokens_entrada_medios)} de entrada e ${Math.round(m.operacional.tokens_saida_medios)} de saída.

## 11. Validação 3 (especialista)

${
  consolidacao
    ? `Referências revisadas: ${consolidacao.referencias_revisadas}; corrigidas: ${consolidacao.referencias_corrigidas}. Respostas da IA revisadas: ${consolidacao.respostas_revisadas}. Kappa de Cohen ponderado (linear): ${n2(consolidacao.kappa_ponderado_linear)}; concordância: ${pct(consolidacao.concordancia_percentual)}. Vereditos alterados: ${consolidacao.vereditos_binarios_alterados} (avaliação automatizada mais branda em ${consolidacao.automatizada_mais_branda} e mais rígida em ${consolidacao.automatizada_mais_rigida}).`
    : `Pendente. A ficha \`validacao_especialista/ficha_pesquisadora.xlsx\` traz ${selecao ? `${selecao.perguntas} perguntas, cada uma com a referência e uma resposta da IA: ${selecao.por_grupo.seguranca.selecionadas} com alerta de segurança ou alucinação em alguma execução, ${selecao.por_grupo.contradicao.selecionadas} com execuções contraditórias entre si e, por sorteio com semente fixa, ${selecao.por_grupo.com_incorreta.selecionadas} com alguma execução incorreta e ${selecao.por_grupo.corretas.selecionadas} com as duas corretas (sementes a partir de ${selecao.semente_amostra})` : 'as perguntas selecionadas'}. Depois do preenchimento, \`consolidar.ts\` calcula o kappa e a concordância e recalcula este relatório.`
}

## 12. Ameaças à validade

- As validações 1 e 2 foram feitas por um modelo de linguagem atuando como avaliador (Claude Opus 5.5), o mesmo modelo que construiu as referências. Mitigações: referências congeladas por SHA-256 antes da abertura das respostas da IA, avaliação cega quanto à rodada, lotes sem duas respostas da mesma pergunta, rubrica fixa e validação 3 por especialista com cálculo de concordância.
- A IA avaliada usa modelos da OpenAI (\`${config.modelo.gerador}\`), e o avaliador é de outro fornecedor (Anthropic), o que reduz, sem eliminar, o risco de viés de autopreferência.
- A especialista revisa 25 das 50 perguntas, com uma resposta cada, em amostra enriquecida de respostas problemáticas; a concordância vale para essa amostra.
- 34 das 50 perguntas são adaptações ou redação autoral; a T36 segue em decisão na curadoria e foi excluída das médias.
- Apenas duas execuções por pergunta: a consistência medida é indicativa. As duas respostas da mesma pergunta não são independentes, de modo que os testes estatísticos são exploratórios.
- O corpus avaliado não contém as Portarias SCTIE/MS nº 47 e nº 51/2026 nem a orientação técnica da OMS de 2023 previstas no protocolo; perguntas formuladas a partir dessas normas foram classificadas pela cobertura real do corpus. Divergências entre PCDT e OMS foram resolvidas a favor do PCDT, norma brasileira mais recente do corpus.
- As métricas CPC e PA dependem da decomposição em pontos-chave e afirmações feita pelo avaliador; a similaridade semântica usou \`text-embedding-3-small\`, e não o BGE-M3 previsto.

## 13. Arquivos

\`perguntas.json\`, \`referencias.json\`, \`execucoes.jsonl\`, \`para_avaliar.jsonl\`, \`avaliacoes.jsonl\`, \`validacao/\` (lotes, chave de anonimato, similaridade e contradições), \`resultados/\` (CSV, \`metricas.json\` e gráficos) e \`validacao_especialista/\` (ficha, seleção e consolidação).
`;

writeFileSync(path.join(DIR, 'RELATORIO_RESULTADOS.md'), md);
console.log(`relatório gerado (${status}); erros listados: ${erros.length}; perguntas: ${perguntas.length}`);
