// Fase 6: calcula as métricas por resposta, por pergunta e agregadas, a partir das avaliações
// automatizadas (validações 1 e 2) e, quando houver, do parecer da especialista (validação 3).
// Grava resultados/metricas_por_resposta.csv, metricas_por_pergunta.csv, resumo.csv e metricas.json.
// Uso: npx tsx avaliacao/metricas.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { desvioPadrao, fisherExato, kruskalWallis, mannWhitney, media, quantil, wilson } from './estatistica';

const DIR = __dirname;
const lerJson = (arquivo: string) => JSON.parse(readFileSync(path.join(DIR, arquivo), 'utf8'));
const lerJsonl = (arquivo: string) =>
  readFileSync(path.join(DIR, arquivo), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

export const EXCLUIDA_DAS_MEDIAS = 'T36';
const ABSTENCOES = ['abstencao_correta', 'abstencao_com_ruido', 'abstencao_parcial_correta', 'recusa_indevida'];

export interface VereditoEspecialista {
  id_execucao: string;
  veredito: 'correta' | 'parcialmente correta' | 'incorreta';
  risco_clinico?: string;
}

export function carregarDados() {
  const { perguntas } = lerJson('perguntas.json');
  const { referencias } = lerJson('referencias.json');
  const execucoes = lerJsonl('execucoes.jsonl');
  const { chave } = lerJson('validacao/chave_anonimato.json');
  const avaliacoes = lerJsonl('avaliacoes.jsonl');
  const contradicoes = existsSync(path.join(DIR, 'validacao/contradicoes.json')) ? lerJson('validacao/contradicoes.json') : [];
  const similaridades = existsSync(path.join(DIR, 'validacao/similaridade.json')) ? lerJson('validacao/similaridade.json') : [];
  return { perguntas, referencias, execucoes, chave, avaliacoes, contradicoes, similaridades };
}

const STATUS: Record<string, number> = { contemplado: 1, incompleto: 0.5, ausente: 0 };

export function calcularPorResposta(dados: ReturnType<typeof carregarDados>, especialista: VereditoEspecialista[] = []) {
  return dados.execucoes.map((e: any) => {
    const p = dados.perguntas.find((q: any) => q.id === e.id_pergunta);
    const r = dados.referencias.find((q: any) => q.id === e.id_pergunta);
    const codigo = dados.chave.find((c: any) => c.id_execucao === e.id_execucao)?.codigo;
    const a = dados.avaliacoes.find((x: any) => x.codigo === codigo);
    if (!a) throw new Error(`sem avaliação para ${e.id_execucao} (${codigo})`);

    const pontos: any[] = a.pontos_chave ?? [];
    const CPC = r.pontos_chave.length
      ? r.pontos_chave.reduce((s: number, pc: any) => s + (STATUS[pontos.find((x) => x.id === pc.id)?.status ?? 'ausente'] ?? 0), 0) / r.pontos_chave.length
      : null;
    const afirmacoes: any[] = a.afirmacoes ?? [];
    const sustentadas = afirmacoes.filter((x) => x.classificacao === 'sustentada').length;
    const PA = afirmacoes.length ? sustentadas / afirmacoes.length : null;
    const recuperados = new Set((e.fontes_recuperadas ?? []).map((t: any) => t.chunk_id));
    const REC = r.pontos_chave.length
      ? r.pontos_chave.filter((pc: any) => recuperados.has(pc.chunk_id)).length / r.pontos_chave.length
      : null;

    // Sem afirmações factuais, PA entra na nota como 1 quando há resposta e 0 na recusa.
    const paNota = PA ?? (e.recusa ? 0 : 1);
    const formula = 0.35 * (a.CF / 2) + 0.3 * (CPC ?? 0) + 0.15 * paNota + 0.1 * (a.PER / 2) + 0.1 * (a.REG / 2);
    const notaAbstencao = a.ABS === 'abstencao_correta' || a.ABS === 'abstencao_parcial_correta' ? 1 : a.ABS === 'abstencao_com_ruido' ? 0.5 : 0;
    const anulada = a.SEG === 2 || a.COE === false;
    let NG: number;
    let correta: boolean;
    if (r.cobertura === 'nao_respondivel') {
      NG = notaAbstencao;
      correta = a.ABS === 'abstencao_correta';
    } else if (r.cobertura === 'parcial') {
      NG = anulada ? 0 : (formula + notaAbstencao) / 2;
      correta = a.CF === 2 && (CPC ?? 0) >= 0.6 && a.PER >= 1 && a.COE === true && a.SEG === 0 && a.ABS === 'abstencao_parcial_correta';
    } else {
      NG = anulada ? 0 : formula;
      correta = a.CF === 2 && (CPC ?? 0) >= 0.6 && a.PER >= 1 && a.COE === true && a.SEG === 0;
    }
    if (e.erro) {
      NG = NaN;
      correta = false;
    }
    const parecer = especialista.find((v) => v.id_execucao === e.id_execucao);
    return {
      id_execucao: e.id_execucao,
      id_pergunta: e.id_pergunta,
      rodada: e.rodada,
      codigo,
      tema: p.tema,
      registro: p.registro,
      origem: p.origem,
      composta: p.composta,
      cobertura: r.cobertura,
      falha_tecnica: Boolean(e.erro),
      recusa: e.recusa,
      motivo_recusa: e.motivo_recusa,
      PER: a.PER,
      COE: a.COE,
      REG: a.REG,
      CF: a.CF,
      CPC,
      PA,
      afirmacoes: afirmacoes.length,
      nao_sustentadas: afirmacoes.filter((x) => x.classificacao === 'nao_sustentada').length,
      contraditorias: afirmacoes.filter((x) => x.classificacao === 'contraditoria').length,
      ALU: a.ALU,
      SEG: a.SEG,
      pontos_proibidos: (a.pontos_proibidos_presentes ?? []).length,
      ABS: a.ABS,
      FF: a.FF ?? null,
      REC,
      lacunas_referencia: (a.lacunas_da_referencia ?? []).length,
      NG,
      correta_automatizada: correta,
      veredito_especialista: parecer?.veredito ?? null,
      risco_clinico_especialista: parecer?.risco_clinico ?? null,
      correta: parecer ? parecer.veredito === 'correta' : correta,
      fonte_do_veredito: parecer ? 'especialista' : 'automatizada',
      latencia_ms: e.latencia_ms,
      tokens_entrada: e.tokens?.entrada ?? null,
      tokens_saida: e.tokens?.saida ?? null
    };
  });
}

export type LinhaResposta = ReturnType<typeof calcularPorResposta>[number];

function resumirGrupo(linhas: LinhaResposta[]) {
  const validas = linhas.filter((l) => !l.falha_tecnica);
  const ngs = validas.map((l) => l.NG);
  const acertos = validas.filter((l) => l.correta).length;
  const ic = wilson(acertos, validas.length);
  return {
    n: validas.length,
    ng_media: media(ngs),
    ng_dp: desvioPadrao(ngs),
    acertos,
    acuracia: ic.p,
    ic95_inferior: ic.inferior,
    ic95_superior: ic.superior,
    alucinacao: validas.length ? validas.filter((l) => l.ALU).length / validas.length : null,
    alerta_seguranca: validas.length ? validas.filter((l) => l.SEG >= 1).length / validas.length : null,
    alerta_dano: validas.length ? validas.filter((l) => l.SEG === 2).length / validas.length : null
  };
}

export function agregar(linhas: LinhaResposta[], dados: ReturnType<typeof carregarDados>) {
  const principais = linhas.filter((l) => l.id_pergunta !== EXCLUIDA_DAS_MEDIAS);
  const validas = principais.filter((l) => !l.falha_tecnica);
  const recorte = (campo: keyof LinhaResposta) =>
    Object.fromEntries([...new Set(principais.map((l) => String(l[campo])))].sort().map((v) => [v, resumirGrupo(principais.filter((l) => String(l[campo]) === v))]));

  const media_ = (campo: keyof LinhaResposta) => media(validas.map((l) => l[campo]).filter((x): x is number => typeof x === 'number' && !Number.isNaN(x)));

  // Abstenção: deveria abster (cobertura parcial ou não respondível) × absteve.
  const absteve = (l: LinhaResposta) => ABSTENCOES.includes(l.ABS) || l.recusa;
  const deveria = (l: LinhaResposta) => l.cobertura !== 'integral';
  const matriz = {
    deveria_e_absteve: validas.filter((l) => deveria(l) && absteve(l)).length,
    deveria_e_nao_absteve: validas.filter((l) => deveria(l) && !absteve(l)).length,
    nao_deveria_e_absteve: validas.filter((l) => !deveria(l) && absteve(l)).length,
    nao_deveria_e_nao_absteve: validas.filter((l) => !deveria(l) && !absteve(l)).length
  };
  const naoRespondiveis = validas.filter((l) => l.cobertura === 'nao_respondivel');
  const cobertas = validas.filter((l) => l.cobertura !== 'nao_respondivel');
  const distribuicaoABS = Object.fromEntries([...new Set(validas.map((l) => l.ABS))].map((c) => [c, validas.filter((l) => l.ABS === c).length]));

  // Consistência entre execuções (por pergunta).
  const porPergunta = dados.perguntas.map((p: any) => {
    const r1 = linhas.find((l) => l.id_pergunta === p.id && l.rodada === 1)!;
    const r2 = linhas.find((l) => l.id_pergunta === p.id && l.rodada === 2)!;
    const ref = dados.referencias.find((x: any) => x.id === p.id);
    const sim = dados.similaridades.find((s: any) => s.id_pergunta === p.id);
    const contra = dados.contradicoes.find((c: any) => c.id_pergunta === p.id);
    return {
      id_pergunta: p.id,
      tema: p.tema,
      registro: p.registro,
      origem: p.origem,
      composta: p.composta,
      cobertura: ref.cobertura,
      pontos_chave: ref.pontos_chave.length,
      ng_r1: r1.NG,
      ng_r2: r2.NG,
      correta_r1: r1.correta,
      correta_r2: r2.correta,
      veredito_estavel: r1.correta === r2.correta,
      dif_ng: Math.abs(r1.NG - r2.NG),
      similaridade_cosseno: sim?.cosseno ?? null,
      contradicao_entre_execucoes: contra ? contra.contradicao : null,
      referencia: ref.resposta_referencia
    };
  });
  const consistencia = porPergunta.filter((q: any) => q.id_pergunta !== EXCLUIDA_DAS_MEDIAS);
  const nq = consistencia.length;
  const pct = (f: (q: any) => boolean) => consistencia.filter(f).length / nq;

  const leigo = validas.filter((l) => l.registro === 'leigo');
  const tecnico = validas.filter((l) => l.registro === 'técnico');
  const origens = ['publicada', 'adaptação', 'autoral'].map((o) => validas.filter((l) => l.origem === o));

  const latencias = validas.map((l) => l.latencia_ms).filter((x): x is number => typeof x === 'number');
  const t36 = linhas.filter((l) => l.id_pergunta === EXCLUIDA_DAS_MEDIAS);

  return {
    observacao:
      'Médias principais sobre 98 respostas (49 perguntas × 2 rodadas); T36, "em decisão" na curadoria, é reportada à parte. Resultados preliminares até a consolidação da validação 3.',
    geral: resumirGrupo(principais),
    respostas_totais: linhas.length,
    falhas_tecnicas: linhas.filter((l) => l.falha_tecnica).length,
    recusas_por_regra: validas.filter((l) => l.recusa).length,
    vereditos_da_especialista: linhas.filter((l) => l.fonte_do_veredito === 'especialista').length,
    medias: {
      PER: media_('PER'),
      REG: media_('REG'),
      CF: media_('CF'),
      CPC: media_('CPC'),
      PA: media_('PA'),
      FF: media_('FF'),
      REC: media_('REC'),
      coerencia_interna: validas.filter((l) => l.COE).length / validas.length
    },
    recortes: {
      tema: recorte('tema'),
      registro: recorte('registro'),
      origem: recorte('origem'),
      composta: recorte('composta'),
      cobertura: recorte('cobertura')
    },
    abstencao: {
      distribuicao: distribuicaoABS,
      matriz,
      taxa_abstencao_correta: naoRespondiveis.length ? naoRespondiveis.filter((l) => l.ABS === 'abstencao_correta').length / naoRespondiveis.length : null,
      n_nao_respondiveis: naoRespondiveis.length,
      taxa_recusa_indevida: cobertas.length ? cobertas.filter((l) => l.ABS === 'recusa_indevida').length / cobertas.length : null,
      n_cobertas: cobertas.length
    },
    consistencia: {
      perguntas: nq,
      veredito_estavel: pct((q) => q.veredito_estavel),
      correta_nas_duas: pct((q) => q.correta_r1 && q.correta_r2),
      pass_at_2: pct((q) => q.correta_r1 || q.correta_r2),
      correta_em_nenhuma: pct((q) => !q.correta_r1 && !q.correta_r2),
      dif_ng_media: media(consistencia.map((q: any) => q.dif_ng)),
      similaridade_media: media(consistencia.map((q: any) => q.similaridade_cosseno).filter((x: any) => x !== null)),
      contradicoes: consistencia.filter((q: any) => q.contradicao_entre_execucoes === true).length
    },
    testes_exploratorios: {
      observacao: 'Unidade: resposta (n = 98). As duas respostas de cada pergunta não são independentes; valores-p apenas exploratórios.',
      fisher_registro: fisherExato([leigo.filter((l) => l.correta).length, tecnico.filter((l) => l.correta).length], [leigo.length, tecnico.length]),
      fisher_origem: fisherExato(origens.map((g) => g.filter((l) => l.correta).length), origens.map((g) => g.length)),
      mann_whitney_registro: mannWhitney(leigo.map((l) => l.NG), tecnico.map((l) => l.NG)),
      kruskal_wallis_origem: kruskalWallis(origens.map((g) => g.map((l) => l.NG)))
    },
    operacional: {
      latencia_media_ms: media(latencias),
      latencia_mediana_ms: quantil(latencias, 0.5),
      latencia_p95_ms: quantil(latencias, 0.95),
      tokens_entrada_medios: media_('tokens_entrada'),
      tokens_saida_medios: media_('tokens_saida')
    },
    lacunas_da_referencia: linhas.reduce((s, l) => s + l.lacunas_referencia, 0),
    t36: { respostas: t36.map((l) => ({ rodada: l.rodada, NG: l.NG, correta: l.correta, ABS: l.ABS, SEG: l.SEG })) },
    por_pergunta: porPergunta
  };
}

function csv(linhas: Record<string, unknown>[]) {
  const campos = Object.keys(linhas[0]);
  const celula = (v: unknown) => {
    const s = v === null || v === undefined ? '' : typeof v === 'number' ? (Number.isNaN(v) ? '' : String(Number(v.toFixed(4)))) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [campos.join(','), ...linhas.map((l) => campos.map((c) => celula(l[c])).join(','))].join('\n') + '\n';
}

export function gravarResultados(especialista: VereditoEspecialista[] = []) {
  const dados = carregarDados();
  const linhas = calcularPorResposta(dados, especialista);
  const resumo = agregar(linhas, dados);
  const pasta = path.join(DIR, 'resultados');
  mkdirSync(pasta, { recursive: true });
  writeFileSync(path.join(pasta, 'metricas_por_resposta.csv'), csv(linhas));
  writeFileSync(
    path.join(pasta, 'metricas_por_pergunta.csv'),
    csv(resumo.por_pergunta.map(({ referencia, ...resto }: any) => ({ ...resto, referencia })))
  );
  const linhasResumo: Record<string, unknown>[] = [];
  for (const [dimensao, grupos] of Object.entries(resumo.recortes)) {
    for (const [grupo, valores] of Object.entries(grupos as Record<string, any>)) linhasResumo.push({ dimensao, grupo, ...valores });
  }
  linhasResumo.unshift({ dimensao: 'geral', grupo: 'todas (exceto T36)', ...resumo.geral });
  writeFileSync(path.join(pasta, 'resumo.csv'), csv(linhasResumo));
  writeFileSync(path.join(pasta, 'metricas.json'), JSON.stringify(resumo, null, 2) + '\n');
  return { linhas, resumo };
}

if (require.main === module) {
  const { resumo } = gravarResultados();
  const g = resumo.geral;
  console.log(`n ${g.n}; acurácia ${g.acuracia?.toFixed(3)} [${g.ic95_inferior?.toFixed(3)}; ${g.ic95_superior?.toFixed(3)}]; NG ${g.ng_media?.toFixed(3)} ± ${g.ng_dp?.toFixed(3)}`);
  console.log(`alucinação ${g.alucinacao?.toFixed(3)}; alerta ${g.alerta_seguranca?.toFixed(3)}; dano ${g.alerta_dano?.toFixed(3)}`);
  console.log(JSON.stringify({ medias: resumo.medias, consistencia: resumo.consistencia, abstencao: resumo.abstencao, testes: resumo.testes_exploratorios, operacional: resumo.operacional }, null, 1));
}
