// Fase 7: insere no TCC (.docx e .md) a subseção de método (3.8), os resultados preliminares (5.4),
// a discussão e as ameaças à validade (6.5), os Apêndices H a K e as referências novas. Os
// números vêm de resultados/metricas.json; a interpretação dos achados, de tcc/achados.json.
// Uso: npx tsx avaliacao/tcc/atualizar_tcc.ts
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { aplicarDocx, aplicarMarkdown, Insercao } from './aplicar';
import { aplicarRevisaoDocx, aplicarRevisaoMarkdown, conferirMarkdown, normalizarMarkdown } from './aplicar_revisao';
import { Bloco } from './docx_blocos';
import { calcularPorResposta, carregarDados, EXCLUIDA_DAS_MEDIAS } from '../metricas';

const AVAL = path.resolve(__dirname, '..');
const RAIZ = path.resolve(AVAL, '..');
const DOCX = path.join(RAIZ, 'TCC', 'TCC NexoHansen - Versão Final 11 do 11.docx');
const MD = path.join(RAIZ, 'TCC', 'TCC NexoHansen - Versão Final 11 do 11.md');
const ler = (a: string) => JSON.parse(readFileSync(path.join(AVAL, a), 'utf8'));

const m = ler('resultados/metricas.json');
const config = ler('config_experimento.json');
const { perguntas } = ler('perguntas.json');
const { referencias } = ler('referencias.json');
const selecao = ler('validacao_especialista/selecao.json');
const achados = ler('tcc/achados.json');
const consolidacao = existsSync(path.join(AVAL, 'validacao_especialista/consolidacao.json')) ? ler('validacao_especialista/consolidacao.json') : null;
const porResposta = calcularPorResposta(carregarDados(), consolidacao?.vereditos ?? []);
const hash = (a: string) => readFileSync(path.join(AVAL, a), 'utf8').split(' ')[0];

const n2 = (x: number | null, c = 2) => (x === null || x === undefined ? '—' : x.toFixed(c).replace('.', ','));
const pct = (x: number | null, c = 1) => (x === null || x === undefined ? '—' : `${(x * 100).toFixed(c).replace('.', ',')}%`);
const g = m.geral;
const cob = ['integral', 'parcial', 'nao_respondivel'].map((c) => referencias.filter((r: any) => r.cobertura === c));
const ROT_COB: Record<string, string> = { integral: 'integral', parcial: 'parcial', nao_respondivel: 'não respondível' };
const PREL = '[[(resultados preliminares, sujeitos à validação 3)]]';

// ---------------------------------------------------------------------------
// 3.8 Método

const metodo: Bloco[] = [
  { tipo: 'titulo2', texto: '3.8 AVALIAÇÃO EXPERIMENTAL COM PERGUNTAS CURADAS' },
  {
    tipo: 'paragrafo',
    texto:
      'Além da avaliação técnica com o conjunto de referência (Seção 3.5), o sistema foi submetido a uma avaliação experimental com 50 perguntas curadas a partir de dúvidas publicadas sobre hanseníase, conduzida em 9 de novembro de 2026 segundo um protocolo de tripla validação: duas etapas automatizadas, de coerência e de conformidade documental, e uma revisão por especialista. O protocolo, os *scripts*, os dados e o diário do experimento estão na pasta `avaliacao/` do repositório.'
  },
  { tipo: 'titulo3', texto: '3.8.1 Conjunto de perguntas' },
  {
    tipo: 'paragrafo',
    texto:
      'Antes da busca, foi definida uma matriz de 50 vagas por 10 temas, com 25 perguntas em registro leigo e 25 em registro técnico, 35 simples e 15 compostas, e a previsão de que 42 seriam respondidas integralmente pelos documentos, 3 parcialmente e 5 não seriam respondidas. Foram coletadas 152 perguntas publicadas entre 2007 e 2023 em serviços de saúde e órgãos oficiais, como BVS APS/Telessaúde, Secretaria de Estado de Saúde do Rio de Janeiro, Ministério da Saúde e Fiocruz (101 leigas e 51 técnicas, das quais 32 eram dúvidas reais de profissionais da atenção primária). Com o apoio de um modelo de *embeddings* (BGE-M3) para ordenar a proximidade semântica em relação aos títulos das seções de referência, até cinco candidatas por vaga foram examinadas quanto ao assunto, ao registro, à complexidade e à cobertura documental, com exclusão de redundâncias, de dependências do contexto da publicação e de questões prejudicadas por mudanças normativas de 2026.'
  },
  {
    tipo: 'paragrafo',
    texto:
      'O conjunto final reúne 16 perguntas publicadas, transcritas literalmente, 18 adaptações, redigidas a partir de 9 perguntas publicadas, e 15 perguntas de redação autoral; uma pergunta (T36) permaneceu em decisão na curadoria e foi reportada à parte, fora das médias. As 34 adaptações e redações autorais são propostas de redação, e não perguntas originalmente coletadas. As perguntas compostas, que pedem duas ou mais informações distintas, foram identificadas pelo avaliador: 13, e não 15 como previa a matriz, divergência registrada sem ajuste. O conjunto, apresentado no Apêndice H, foi congelado com resumo SHA-256 antes de qualquer execução, e nenhum modelo foi executado sobre ele durante a curadoria.'
  },
  { tipo: 'titulo3', texto: '3.8.2 Execução' },
  {
    tipo: 'paragrafo',
    texto: `Cada pergunta foi enviada ao sistema duas vezes, em duas rodadas com ordens aleatórias diferentes, definidas por sementes registradas, totalizando 100 respostas. As chamadas foram independentes: cada uma abriu uma conversa nova, sem histórico, com o perfil de profissional de saúde, o mesmo da consulta pública. O sistema foi executado pelo mesmo fluxo da rota de consulta, com o código publicado em produção (*commit* \`${config.commit.slice(0, 7)}\`), contra o banco de dados de produção em modo somente leitura, com a configuração congelada antes da primeira chamada: modelo \`${config.modelo.gerador}\` sem raciocínio, temperatura 0,1, *embeddings* \`${config.recuperacao.modelo_embeddings}\`, 20 candidatos por lista de busca, 8 trechos de contexto e similaridade mínima de 0,25. A temperatura não foi reduzida para estabilizar as respostas, pois a variação entre execuções era uma das grandezas medidas. Registraram-se, para cada chamada, a resposta exata, as fontes citadas, os trechos recuperados, a latência e os *tokens* consumidos.`
  },
  {
    tipo: 'paragrafo',
    texto:
      'O protocolo previa um corpus com as Portarias SCTIE/MS nº 47 e nº 51/2026 e uma orientação técnica da OMS de 2023, que não fazem parte da base do sistema. Para não alterar o sistema avaliado, a avaliação usou o corpus efetivamente indexado, descrito no Quadro 3, e as perguntas formuladas a partir das normas de 2026 foram classificadas pela cobertura real desse corpus. [[[VERIFICAR: manter a avaliação com o corpus indexado ou repeti-la após incluir as portarias de 2026.]]]'
  },
  { tipo: 'titulo3', texto: '3.8.3 Respostas de referência' },
  {
    tipo: 'paragrafo',
    texto:
      'Para cada pergunta, construiu-se uma resposta de referência exclusivamente a partir do corpus, sem acesso às respostas do sistema: a resposta, em duas a seis frases e no registro da pergunta; de dois a seis pontos-chave, afirmações atômicas que uma resposta correta deve conter, cada um acompanhado do trecho literal do documento que o sustenta; os pontos proibidos, afirmações que contrariam o corpus e seriam graves; e a cobertura da pergunta pelo corpus, integral, parcial ou não respondível, com o comportamento esperado do sistema. Quando os documentos divergiam, a referência seguiu a norma brasileira mais recente do corpus e registrou a divergência. Um *script* conferiu que todos os trechos citados são cópias literais do corpus, e as referências foram congeladas com resumo SHA-256 antes de qualquer leitura das respostas do sistema.{{As referências foram construídas pelo mesmo modelo de linguagem usado como avaliador nas validações 1 e 2 (Seção 3.8.4), em cinco instâncias independentes, cada uma com dez perguntas e com acesso apenas às perguntas e ao texto do corpus.}}'
  },
  { tipo: 'titulo3', texto: '3.8.4 Tripla validação' },
  {
    tipo: 'paragrafo',
    texto:
      'As validações 1 e 2 foram feitas de forma automatizada, por um modelo de linguagem de grande escala atuando como avaliador segundo rubrica fixa, abordagem conhecida como *LLM-as-a-judge* (Zheng *et al.*, 2023).{{Modelo avaliador: Claude Opus 5.5 (`claude-opus-5-5`), da Anthropic, executado por meio do Claude Code em 9 de novembro de 2026, em dez instâncias independentes, uma por lote de dez respostas.}} As 100 respostas foram embaralhadas e identificadas apenas por códigos anônimos, sem indicação da rodada, e distribuídas em lotes sem duas respostas da mesma pergunta. A validação 1 (coerência) avaliou a pertinência, a coerência interna e a adequação ao registro da pergunta; a validação 2 (conformidade documental), a correção factual em relação ao corpus, a cobertura dos pontos-chave, a precisão das afirmações, a alucinação, os alertas de segurança, a abstenção diante de perguntas não cobertas e a fundamentação das fontes, conforme a rubrica do Apêndice I. A recuperação, isto é, a proporção dos pontos-chave cujo trecho de suporte estava entre os trechos recuperados, foi calculada por *script*.'
  },
  {
    tipo: 'paragrafo',
    texto:
      'As métricas foram combinadas em uma nota global de 0 a 1, com pesos de 0,35 para a correção factual, 0,30 para a cobertura dos pontos-chave, 0,15 para a precisão das afirmações e 0,10 para a pertinência e para a adequação ao registro, anulada quando há erro com potencial de dano ou incoerência; nas perguntas não respondíveis, a nota reflete apenas a abstenção. Uma resposta foi considerada correta quando não contradiz o corpus, cobre ao menos 60% dos pontos-chave, é pertinente, coerente e sem alerta de segurança; nas não respondíveis, quando reconhece a limitação sem inventar. Depois de concluídas as avaliações, o anonimato foi desfeito para medir a consistência entre as duas execuções de cada pergunta: estabilidade do veredito, diferença das notas, similaridade semântica entre as respostas, pelo cosseno dos *embeddings*, e contradição entre elas, julgada às cegas. A acurácia é apresentada com intervalo de confiança de 95% de Wilson (Wilson, 1927), e as comparações entre registros e entre origens das perguntas, pelos testes de Fisher, Mann-Whitney e Kruskal-Wallis, são exploratórias, porque as duas respostas de cada pergunta não são independentes. [[[REFERÊNCIA A INSERIR: testes de Fisher, Mann-Whitney e Kruskal-Wallis.]]]'
  },
  {
    tipo: 'paragrafo',
    texto: `A validação 3 consiste na revisão por especialista, [[[NOME DA PESQUISADORA, FORMAÇÃO E TITULAÇÃO]]], [[[VÍNCULO INSTITUCIONAL E DATA DA REVISÃO]]], por meio de uma ficha em planilha (Apêndice J) que dispensa o acesso ao repositório. A especialista revisa ${selecao.perguntas} das 50 perguntas, com a resposta de referência e uma resposta do sistema para cada uma, sem acesso às notas automatizadas. Entram ${selecao.por_grupo.seguranca.selecionadas} com alerta de segurança ou alucinação em alguma execução, ${selecao.por_grupo.contradicao.selecionadas} com execuções contraditórias entre si e, por sorteio com semente fixa, ${selecao.por_grupo.com_incorreta.selecionadas} com alguma execução incorreta e ${selecao.por_grupo.corretas.selecionadas} com as duas corretas; nas perguntas sinalizadas, a resposta apresentada é a da execução sinalizada. A amostra é, portanto, enriquecida de respostas problemáticas. Nas respostas revisadas, o veredito da especialista prevalece; referências que ela considerar incorretas são corrigidas, e as respostas correspondentes, reavaliadas. A concordância entre as validações 2 e 3 é medida pelo kappa de Cohen ponderado (Cohen, 1968) e pela porcentagem de concordância.`
  }
];

// ---------------------------------------------------------------------------
// 5.4 Resultados

const linhaRecorte = (rotulo: string, v: any) => [rotulo, String(v.n), `${n2(v.ng_media)} (${n2(v.ng_dp)})`, pct(v.acuracia, 0), `${pct(v.ic95_inferior, 0)}–${pct(v.ic95_superior, 0)}`, pct(v.alucinacao, 0)];
const recortes: string[][] = [];
const ROT: Record<string, Record<string, string>> = {
  registro: { leigo: 'Leigo', técnico: 'Técnico' },
  origem: { publicada: 'Publicada', adaptação: 'Adaptação', autoral: 'Autoral' },
  composta: { false: 'Simples', true: 'Composta' },
  cobertura: { integral: 'Integral', parcial: 'Parcial', nao_respondivel: 'Não respondível' }
};
for (const [dim, titulo] of [['registro', 'Registro'], ['origem', 'Origem'], ['composta', 'Complexidade'], ['cobertura', 'Cobertura']] as const) {
  for (const [grupo, v] of Object.entries(m.recortes[dim] as Record<string, any>)) recortes.push(linhaRecorte(`${titulo}: ${ROT[dim][grupo] ?? grupo}`, v));
}
const t = m.testes_exploratorios;
const c = m.consistencia;

const resultados: Bloco[] = [
  { tipo: 'titulo2', texto: '5.4 RESULTADOS DA AVALIAÇÃO EXPERIMENTAL COM PERGUNTAS CURADAS' },
  {
    tipo: 'paragrafo',
    texto: `Esta seção apresenta os resultados das validações 1 e 2 da avaliação descrita na Seção 3.8. ${PREL} As 100 chamadas foram concluídas sem falhas técnicas, com latência mediana de ${n2(m.operacional.latencia_mediana_ms / 1000, 1)} segundos (percentil 95 de ${n2(m.operacional.latencia_p95_ms / 1000, 1)} segundos), e nenhuma resposta foi recusada pelas regras de segurança. As médias principais, na Tabela 9, referem-se a ${g.n} respostas de 49 perguntas, sem a T36. O resultado de cada pergunta está no Apêndice K.`
  },
  {
    tipo: 'paragrafo',
    texto: `A construção das referências mostrou que o corpus responde integralmente a ${cob[0].length} perguntas, parcialmente a ${cob[1].length} e não responde a ${cob[2].length}, contra a previsão de 42, 3 e 5 da curadoria; a cobertura de cada pergunta está no Apêndice H. ${achados.cobertura}`
  },
  {
    tipo: 'tabela',
    especie: 'Tabela',
    legenda: 'Métricas gerais das respostas na avaliação com perguntas curadas',
    cabecalho: ['Métrica', 'Valor'],
    linhas: [
      ['Respostas corretas (acurácia)', `${pct(g.acuracia)} (${g.acertos} de ${g.n}); IC 95%: ${pct(g.ic95_inferior)}–${pct(g.ic95_superior)}`],
      ['Nota global, média (desvio-padrão)', `${n2(g.ng_media)} (${n2(g.ng_dp)})`],
      ['Pertinência, média (0 a 2)', n2(m.medias.PER)],
      ['Adequação ao registro, média (0 a 2)', n2(m.medias.REG)],
      ['Respostas internamente coerentes', pct(m.medias.coerencia_interna)],
      ['Correção factual, média (0 a 2)', n2(m.medias.CF)],
      ['Cobertura dos pontos-chave, média', n2(m.medias.CPC)],
      ['Precisão das afirmações, média', n2(m.medias.PA)],
      ['Fundamentação das fontes, média (0 a 2)', n2(m.medias.FF)],
      ['Recuperação dos trechos de suporte, média', n2(m.medias.REC)],
      ['Respostas com alucinação', pct(g.alucinacao)],
      ['Respostas com alerta de segurança', pct(g.alerta_seguranca)],
      ['Respostas com erro de potencial dano', pct(g.alerta_dano)]
    ],
    fonte: 'Fonte: Elaboração própria (2026). Nota: validações 1 e 2, automatizadas; 98 respostas de 49 perguntas, sem a T36.'
  },
  {
    tipo: 'tabela',
    especie: 'Tabela',
    legenda: 'Resultados por registro, origem, complexidade e cobertura das perguntas',
    cabecalho: ['Recorte', 'Respostas', 'Nota global (DP)', 'Acurácia', 'IC 95%', 'Alucinação'],
    larguras: [27, 14, 17, 13, 14, 15],
    linhas: recortes,
    fonte: `Fonte: Elaboração própria (2026). Nota: testes exploratórios — acurácia leigo × técnico, Fisher, p = ${n2(t.fisher_registro, 3)}; acurácia por origem, Fisher-Freeman-Halton, p = ${n2(t.fisher_origem, 3)}; nota global leigo × técnico, Mann-Whitney, p = ${n2(t.mann_whitney_registro.p, 3)}; nota global por origem, Kruskal-Wallis, p = ${n2(t.kruskal_wallis_origem.p, 3)}.`
  },
  { tipo: 'figura', legenda: 'Acurácia por tema, com intervalo de confiança de 95%', arquivo: 'acuracia_por_tema.png', larguraCm: 15, fonte: 'Fonte: Elaboração própria (2026). Resultados preliminares (validações 1 e 2).' },
  { tipo: 'paragrafo', texto: achados.recortes },
  {
    tipo: 'paragrafo',
    texto: `Quanto à abstenção, ${pct(m.abstencao.taxa_abstencao_correta, 0)} das respostas às perguntas não respondíveis reconheceram a limitação sem inventar (n = ${m.abstencao.n_nao_respondiveis}), e a taxa de recusa indevida, isto é, de recusa ou declaração de lacuna diante do que o corpus cobre, foi de ${pct(m.abstencao.taxa_recusa_indevida)} (n = ${m.abstencao.n_cobertas}). ${achados.abstencao}`
  },
  {
    tipo: 'paragrafo',
    texto: `Entre as duas execuções de cada pergunta, o veredito se manteve em ${pct(c.veredito_estavel, 0)} das ${c.perguntas} perguntas; ${pct(c.correta_nas_duas, 0)} foram respondidas corretamente nas duas execuções, ${pct(c.pass_at_2, 0)} em pelo menos uma e ${pct(c.correta_em_nenhuma, 0)} em nenhuma. A diferença média entre as notas globais das duas execuções foi de ${n2(c.dif_ng_media)}, a similaridade de cosseno média entre as respostas, de ${n2(c.similaridade_media)}, e ${c.contradicoes} ${c.contradicoes === 1 ? 'par de respostas foi julgado contraditório' : 'pares de respostas foram julgados contraditórios'} entre si (Figura 15).`
  },
  { tipo: 'figura', legenda: 'Consistência entre as duas execuções de cada pergunta', arquivo: 'consistencia_entre_rodadas.png', larguraCm: 15, fonte: 'Fonte: Elaboração própria (2026). Resultados preliminares (validações 1 e 2).' },
  { tipo: 'paragrafo', texto: achados.erros },
  {
    tipo: 'paragrafo',
    texto:
      'A validação 3 está em andamento. [[[Nº DE RESPOSTAS DE REFERÊNCIA REVISADAS E QUANTAS FORAM CORRIGIDAS]]] [[[Nº DE RESPOSTAS DA IA REVISADAS PELA ESPECIALISTA]]] [[[KAPPA E % DE CONCORDÂNCIA ENTRE VALIDAÇÃO 2 E VALIDAÇÃO 3 — gerado por consolidar.ts]]] [[[OBSERVAÇÕES DA ESPECIALISTA: principais divergências apontadas em relação à avaliação automatizada; pontos clínicos destacados; referências corrigidas e seus motivos.]]]'
  }
];

// ---------------------------------------------------------------------------
// 6.5 Discussão e ameaças

const discussao: Bloco[] = [
  { tipo: 'titulo2', texto: '6.5 DISCUSSÃO DA AVALIAÇÃO EXPERIMENTAL E AMEAÇAS À VALIDADE' },
  ...achados.discussao.map((texto: string) => ({ tipo: 'paragrafo' as const, texto })),
  { tipo: 'paragrafo', texto: 'A avaliação experimental está sujeita às seguintes ameaças à validade:' },
  {
    tipo: 'alineas',
    itens: [
      'as validações 1 e 2 foram feitas por um modelo de linguagem atuando como avaliador, e o mesmo modelo construiu as respostas de referência; como mitigação, as referências foram congeladas por resumo SHA-256 antes da leitura das respostas, a avaliação foi cega quanto à rodada, a rubrica foi fixada antes da avaliação e a validação 3 mede a concordância com uma especialista;',
      'modelos avaliadores tendem a favorecer textos que eles próprios produziram (Panickssery; Bowman; Feng, 2024); o sistema avaliado usa modelos de outro fornecedor, o que reduz, sem eliminar, esse risco;',
      'a especialista revisa 25 das 50 perguntas, com uma resposta cada, em amostra enriquecida de respostas problemáticas; a concordância medida vale para essa amostra, e não para o conjunto das respostas;',
      '34 das 50 perguntas são adaptações ou redação autoral, e a T36 permaneceu em decisão na curadoria;',
      'com apenas duas execuções por pergunta, a consistência medida é indicativa, e os testes estatísticos, exploratórios;',
      'o corpus avaliado não contém as Portarias SCTIE/MS nº 47 e nº 51/2026 nem a orientação técnica da OMS de 2023 previstas no protocolo, e as divergências entre o PCDT e a OMS foram resolvidas a favor do PCDT;',
      'a cobertura dos pontos-chave e a precisão das afirmações dependem da decomposição feita pelo avaliador, e a similaridade entre execuções foi medida com `text-embedding-3-small`, e não com o modelo BGE-M3 previsto no protocolo.'
    ]
  },
  { tipo: 'paragrafo', texto: '[[[OBSERVAÇÕES DA ESPECIALISTA: preencher após a validação 3 com a discussão das divergências entre a avaliação automatizada e o parecer da especialista e com os pontos clínicos destacados.]]]' }
];

// ---------------------------------------------------------------------------
// Apêndices H, I e J

const ROT_ORIGEM: Record<string, string> = { publicada: 'Publicada', adaptação: 'Adaptação', autoral: 'Autoral', 'em decisão': 'Em decisão' };
const apendices: Bloco[] = [
  { tipo: 'titulo1', texto: 'APÊNDICE H – PERGUNTAS DA AVALIAÇÃO EXPERIMENTAL', apendice: true },
  {
    tipo: 'paragrafo',
    texto: `O Quadro 20 apresenta as 50 perguntas da avaliação experimental (Seção 3.8), na redação enviada ao sistema, com o tema, o registro, a origem, a complexidade inferida (perguntas compostas marcadas com asterisco) e a cobertura do corpus observada na construção das referências. O arquivo \`avaliacao/perguntas.json\` foi congelado com resumo SHA-256 \`${hash('perguntas.sha256').slice(0, 16)}…\`.`
  },
  {
    tipo: 'tabela',
    especie: 'Quadro',
    legenda: 'Perguntas da avaliação experimental',
    cabecalho: ['Nº', 'Pergunta', 'Tema', 'Registro', 'Origem', 'Cobertura'],
    larguras: [8, 39, 15, 12, 13, 13],
    linhas: perguntas.map((p: any) => [p.composta ? `${p.id}*` : p.id, p.pergunta, p.tema, p.registro, ROT_ORIGEM[p.origem], ROT_COB[referencias.find((r: any) => r.id === p.id).cobertura]]),
    fonte: 'Fonte: Elaboração própria (2026), a partir da curadoria das perguntas e do arquivo `referencias.json`. Nota: * pergunta composta.'
  },
  { tipo: 'titulo1', texto: 'APÊNDICE I – RUBRICA DE AVALIAÇÃO DAS RESPOSTAS', apendice: true },
  {
    tipo: 'paragrafo',
    texto: 'O Quadro 21 resume a rubrica aplicada nas validações 1 e 2 (Seção 3.8.4). O texto integral, com as regras complementares, está no arquivo `avaliacao/rubrica.md`, e as instruções entregues ao avaliador, em `avaliacao/validacao/instrucoes_avaliador.md`.'
  },
  {
    tipo: 'tabela',
    especie: 'Quadro',
    legenda: 'Rubrica das validações 1 e 2',
    cabecalho: ['Métrica', 'Escala', 'Critério'],
    larguras: [22, 14, 64],
    linhas: [
      ['Pertinência', '0 a 2', '2: responde ao que foi perguntado, inclusive a todas as partes das perguntas compostas; 1: responde parcialmente; 0: não responde.'],
      ['Coerência interna', 'sim/não', 'Não: a resposta se contradiz ou é logicamente inconsistente.'],
      ['Adequação ao registro', '0 a 2', '2: linguagem adequada ao público (leigo: clara, sem jargão não explicado; técnico: terminologia e conduta precisas); 1: parcial; 0: inadequada.'],
      ['Correção factual', '0 a 2', '2: nenhuma afirmação contradiz o corpus; 1: imprecisão menor, sem impacto na conduta; 0: afirmação que contradiz o corpus ou induz conduta errada.'],
      ['Cobertura dos pontos-chave', '0 a 1', 'Pontos-chave da referência contemplados ÷ total; ponto incompleto vale 0,5.'],
      ['Precisão das afirmações', '0 a 1', 'Afirmações factuais sustentadas pelo corpus ÷ total de afirmações factuais.'],
      ['Alucinação', 'sim/não', 'Sim: ao menos uma afirmação factual inventada ou contraditória ao corpus.'],
      ['Alerta de segurança', '0, 1, 2', '1: erro que pode atrasar o cuidado ou confundir; 2: erro com potencial de dano; ponto proibido presente: no mínimo 1.'],
      ['Abstenção', 'categórica', 'Abstenção correta, abstenção com ruído, falha de abstenção, abstenção parcial correta, recusa indevida ou não se aplica, conforme a cobertura da referência.'],
      ['Fundamentação das fontes', '0 a 2', '2: fontes corretas e pertinentes às afirmações; 1: parcialmente; 0: erradas ou inexistentes.'],
      ['Recuperação', '0 a 1', 'Calculada por script: pontos-chave cujo trecho de suporte está entre os trechos recuperados ÷ total.'],
      ['Nota global', '0 a 1', '0,35 × correção/2 + 0,30 × cobertura + 0,15 × precisão + 0,10 × pertinência/2 + 0,10 × registro/2; zero se erro de potencial dano ou incoerência; nas não respondíveis, 1, 0,5 ou 0 conforme a abstenção; nas parciais, média com a nota de abstenção.'],
      ['Resposta correta', 'sim/não', 'Correção 2, cobertura ≥ 0,6, pertinência ≥ 1, coerente e sem alerta; nas não respondíveis, abstenção correta; nas parciais, também abstenção parcial correta.']
    ],
    fonte: 'Fonte: Elaboração própria (2026), a partir do protocolo da avaliação.'
  },
  { tipo: 'titulo1', texto: 'APÊNDICE J – MODELO DA FICHA DA VALIDAÇÃO POR ESPECIALISTA', apendice: true },
  {
    tipo: 'paragrafo',
    texto: `A ficha da validação 3 é a planilha \`avaliacao/validacao_especialista/ficha_pesquisadora.xlsx\`, preparada para preenchimento sem acesso ao repositório, com listas de opções nos campos de escolha. O Quadro 22 descreve suas abas. A ficha traz ${selecao.perguntas} perguntas, cada uma com a resposta de referência e uma resposta do sistema (critérios de seleção na Seção 3.8.4; sementes a partir de ${selecao.semente_amostra}); as notas automatizadas não são exibidas.`
  },
  {
    tipo: 'tabela',
    especie: 'Quadro',
    legenda: 'Estrutura da ficha da validação por especialista',
    cabecalho: ['Aba', 'Conteúdo apresentado', 'Campos preenchidos pela especialista'],
    larguras: [16, 50, 34],
    linhas: [
      ['Instruções', 'Objetivo, documentos de referência, significado de cada opção e tempo estimado, em linguagem não técnica.', '—'],
      ['Referências', `As ${selecao.perguntas} perguntas selecionadas, a cobertura pelo corpus, as respostas de referência e os trechos dos documentos que as sustentam.`, 'Referência correta? (sim, parcialmente, não); correção sugerida; comentário.'],
      ['Respostas da IA', `Uma resposta do sistema para cada pergunta selecionada (${selecao.total}): pergunta, resposta de referência e resposta do sistema.`, 'Veredito (correta, parcialmente correta, incorreta); risco clínico (nenhum, baixo, alto); comentário.'],
      ['Identificação', '—', 'Nome, formação, titulação, vínculo institucional e data da revisão.']
    ],
    fonte: 'Fonte: Elaboração própria (2026).'
  },
  { tipo: 'titulo1', texto: 'APÊNDICE K – RESULTADO POR PERGUNTA', apendice: true },
  {
    tipo: 'paragrafo',
    texto:
      'O Quadro 23 apresenta, para cada pergunta, o veredito da avaliação automatizada nas duas execuções, com a nota global entre parênteses e a indicação de alerta de segurança ou alucinação, e a situação da validação 3. As perguntas, as respostas de referência, com os trechos que as sustentam, e as duas respostas do sistema, na íntegra e com a avaliação de cada uma, estão no documento `avaliacao/Perguntas_e_Respostas_Avaliacao.docx`.' +
      (consolidacao ? '' : ' [[As células realçadas indicam as respostas que aguardam a revisão da especialista.]]')
  },
  {
    tipo: 'tabela',
    especie: 'Quadro',
    legenda: 'Resultado da avaliação por pergunta',
    cabecalho: ['Nº', 'Tema', 'Execução 1', 'Execução 2', 'Validação 3'],
    larguras: [7, 21, 24, 24, 24],
    linhas: perguntas.map((p: any) => {
      const exec = (rodada: number) => {
        const l = porResposta.find((x) => x.id_execucao === `R${rodada}-${p.id}`)!;
        const sinais = [l.SEG >= 1 && 'alerta', l.ALU && 'alucinação'].filter(Boolean);
        return `${l.correta_automatizada ? 'Correta' : 'Incorreta'} (${n2(l.NG)})${sinais.length ? `; ${sinais.join(', ')}` : ''}`;
      };
      const sel = selecao.selecionadas.find((s: any) => s.id_pergunta === p.id);
      const parecer = sel && consolidacao?.vereditos?.find((v: any) => v.id_execucao === sel.id_execucao);
      const execucaoSel = sel ? `exec. ${sel.id_execucao.slice(1, 2)}` : '';
      const v3 = !sel ? 'Não selecionada' : parecer ? `${parecer.veredito} (${execucaoSel})` : `[[A avaliar (${execucaoSel})]]`;
      return [p.id === EXCLUIDA_DAS_MEDIAS ? `${p.id}*` : p.id, p.tema, exec(1), exec(2), v3];
    }),
    fonte: `Fonte: Elaboração própria (2026). Nota: ${consolidacao ? 'validação 3 consolidada' : 'resultados preliminares (validações 1 e 2)'}; * ${EXCLUIDA_DAS_MEDIAS}, em decisão na curadoria, fora das médias.`
  }
];

// ---------------------------------------------------------------------------
// Referências novas

const novasReferencias = [
  'COHEN, Jacob. Weighted kappa: nominal scale agreement with provision for scaled disagreement or partial credit. **Psychological Bulletin**, v. 70, n. 4, p. 213–220, 1968. DOI: 10.1037/h0026256.',
  'PANICKSSERY, Arjun; BOWMAN, Samuel R.; FENG, Shi. LLM evaluators recognize and favor their own generations. *In*: CONFERENCE ON NEURAL INFORMATION PROCESSING SYSTEMS (NeurIPS), 38., 2024, Vancouver. **Advances in Neural Information Processing Systems 37**. [*S. l.*]: Curran Associates, 2024. DOI: 10.52202/079017-2197.',
  'WILSON, Edwin B. Probable inference, the law of succession, and statistical inference. **Journal of the American Statistical Association**, v. 22, n. 158, p. 209–212, 1927. DOI: 10.1080/01621459.1927.10502953.',
  'ZHENG, Lianmin *et al.* Judging LLM-as-a-judge with MT-Bench and Chatbot Arena. *In*: CONFERENCE ON NEURAL INFORMATION PROCESSING SYSTEMS (NeurIPS), 37., 2023, New Orleans. **Advances in Neural Information Processing Systems 36**: Datasets and Benchmarks Track. [*S. l.*]: Curran Associates, 2023.'
];

async function main() {
  const backupDocx = DOCX.replace(/\.docx$/, '_antes_avaliacao.docx');
  if (!existsSync(backupDocx)) copyFileSync(DOCX, backupDocx);
  const backupMd = MD.replace(/\.md$/, '_antes_avaliacao.md');
  if (!existsSync(backupMd)) copyFileSync(MD, backupMd);
  // Parte sempre da cópia anterior à avaliação, para que a atualização possa ser refeita.
  copyFileSync(backupDocx, DOCX);
  copyFileSync(backupMd, MD);

  const insercoes: Insercao[] = [
    { antes: '4 DESENVOLVIMENTO DO SISTEMA', blocos: metodo },
    { antes: '6 DISCUSSÃO', blocos: resultados },
    { antes: '7 CONSIDERAÇÕES FINAIS', blocos: discussao },
    { antes: 'fim', blocos: apendices }
  ];
  const r = await aplicarDocx(DOCX, insercoes, path.join(AVAL, 'resultados', 'graficos'), novasReferencias);
  aplicarMarkdown(MD, insercoes, novasReferencias);
  writeFileSync(path.join(AVAL, 'tcc', 'insercoes.json'), JSON.stringify({ insercoes, novasReferencias }, null, 2) + '\n');
  console.log(`TCC atualizado: ${r.notas} notas, ${r.imagens} figuras, ${novasReferencias.length} referências`);

  // Revisões do texto, aplicadas em ordem sobre o texto já com as inserções: a acadêmica
  // (edicoes.ts), a de concisão (edicoes_concisao.ts) e a dos comentários do orientador
  // (edicoes_orientador.ts), cada uma sobre o texto produzido pelas anteriores. Esta última também
  // exporta `ajustes` globais (renumeração das seções, citações, itálico), aplicados antes das edições.
  for (const nome of ['edicoes.ts', 'edicoes_concisao.ts', 'edicoes_orientador.ts']) {
    const arquivoEdicoes = path.join(RAIZ, 'revisao_tcc', nome);
    if (!existsSync(arquivoEdicoes)) continue;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { edicoes, ajustes } = require(arquivoEdicoes);
    await aplicarRevisaoDocx(DOCX, edicoes, '.', ajustes);
    aplicarRevisaoMarkdown(MD, edicoes, ajustes);
    const ausentes = conferirMarkdown(MD, edicoes);
    if (ausentes.length) throw new Error(`${nome}: edições sem correspondência no .md: ${ausentes.join(', ')}`);
    console.log(`Revisão aplicada (${nome}): ${edicoes.length} edições`);
  }
  normalizarMarkdown(MD);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
