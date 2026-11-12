// Aplica ao TCC (.docx e .md) as edições da revisão acadêmica, descritas em revisao_tcc/edicoes.ts.
// Cada edição localiza um parágrafo existente pelo início do seu texto (sem marcação), que deve ser
// único no documento, e o substitui, remove ou insere blocos depois dele; tabelas inteiras são
// localizadas pela legenda. O estilo do parágrafo (w:pPr) é preservado nas substituições.
// É chamado por atualizar_tcc.ts depois das inserções da avaliação, para que a revisão sobreviva
// à regeração do TCC a partir do backup.
import JSZip from 'jszip';
import { readFileSync, writeFileSync } from 'node:fs';
import { Bloco, blocosParaMarkdown, blocosParaXml, Contexto, runs } from './docx_blocos';

// `titulo: true` restringe a busca aos títulos de seção (no .docx, estilos Ttulo1–3; no .md, linhas
// iniciadas por #), já que as entradas do sumário começam com o mesmo texto. Com `nivel`, o título
// substituído passa a esse nível (estilo Ttulo1–3 no .docx; #, ## ou ### no .md).
// `mover` leva um parágrafo, com seu estilo, para depois de outro; `inserir_no_fim` acrescenta blocos
// ao fim do documento (no .md, antes das definições de notas de rodapé).
export type Edicao = { id: string; secao: string; motivo: string } & (
  | { tipo: 'substituir'; antes: string; depois: string; titulo?: boolean; nivel?: 1 | 2 | 3; md?: { antes: string; depois: string } }
  | { tipo: 'remover'; antes: string; titulo?: boolean }
  | { tipo: 'inserir_depois'; antes: string; blocos: Bloco[] }
  | { tipo: 'inserir_no_fim'; blocos: Bloco[] }
  | { tipo: 'mover'; antes: string; depoisDe: string }
  | { tipo: 'substituir_tabela'; legenda: string; bloco: Extract<Bloco, { tipo: 'tabela' }> }
  | { tipo: 'remover_ilustracao'; legenda: string }
);

/**
 * Ajustes aplicados ao texto existente antes das edições, em todo o documento:
 * - `remissoesSecoes`: renumera as remissões "Seção X" e "Seções X e Y" (fora dos títulos); um número
 *   mapeado para null indica seção removida, e a remissão a ela interrompe a aplicação;
 * - `trocas`: substituições literais dentro de cada trecho de texto, exceto nos parágrafos que contêm
 *   alguma das expressões de `exceto`;
 * - `italico`: palavras estrangeiras postas em itálico onde aparecem sem formatação, do Capítulo 1 às
 *   Referências (exclusive) e nos apêndices, fora de títulos, legendas e código.
 * As edições seguintes devem, portanto, escrever as remissões a seções já na numeração nova.
 */
export type Ajustes = {
  remissoesSecoes?: Record<string, string | null>;
  trocas?: { de: string; para: string; exceto?: string[] }[];
  italico?: string[];
};

const REMISSAO_SECAO = /\b(Seç(?:ão|ões)|seç(?:ão|ões)) (\d+(?:\.\d+)*(?:(?:, | e )\d+(?:\.\d+)*)*)/g;
function renumerarSecoes(texto: string, mapa: Record<string, string | null>, onde: string) {
  return texto.replace(REMISSAO_SECAO, (_t, palavra: string, numeros: string) => {
    const novos = numeros.replace(/\d+(?:\.\d+)*/g, (n) => {
      if (!(n in mapa)) return n;
      const novo = mapa[n];
      if (novo === null) throw new Error(`remissão à Seção ${n}, removida pela revisão (${onde}): "${texto.slice(0, 80)}"`);
      return novo;
    });
    return `${palavra} ${novos}`;
  });
}
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const reItalico = (palavras: string[]) => new RegExp(`(?<![\\p{L}\\p{N}_-])(${palavras.map(escRe).join('|')})(?![\\p{L}\\p{N}_-])`, 'gu');

const normalizar = (s: string) => s.replace(/\s+/g, ' ').trim();
const plano = (xml: string) =>
  (xml.match(/<w:t(?: [^>]*)?>[^<]*<\/w:t>|<w:tab\/>/g) ?? [])
    .map((t) => (t === '<w:tab/>' ? ' ' : t.replace(/<[^>]+>/g, '')))
    .join('')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
/** Texto de uma linha do .md sem marcação. */
const planoMd = (linha: string) => linha.replace(/<\/?mark>/g, '').replace(/\*\*|\*|`|\\(?=[!*_[\]])/g, '');
const planoMarcado = (texto: string) => texto.replace(/\[\[|\]\](?!\])/g, '').replace(/\{\{[\s\S]*?\}\}/g, '').replace(/\*\*|\*|`/g, '');

function paragrafos(doc: string) {
  return [...doc.matchAll(/<w:p(?=[ >])(?:(?!<w:p[ >])[\s\S])*?<\/w:p>/g)].map((m) => ({ inicio: m.index!, fim: m.index! + m[0].length, xml: m[0] }));
}

const ESTILO_TITULO = /w:pStyle w:val="Ttulo\d"/;
const ALINEA = /^([a-z])\)\s+([\s\S]*)$/;

function localizar(doc: string, antes: string, id: string, titulo = false) {
  const alvo = normalizar(antes);
  const achados = paragrafos(doc).filter((p) => (!titulo || ESTILO_TITULO.test(p.xml)) && normalizar(plano(p.xml)).startsWith(alvo));
  if (achados.length !== 1) throw new Error(`[${id}] ${achados.length} parágrafos começam com: "${antes.slice(0, 70)}"`);
  return achados[0];
}

// ---------------------------------------------------------------------------
// Renumeração das remissões. No texto, "Figura 10", "Quadros 7 e 8" etc. são escritos à mão, enquanto
// as legendas são numeradas pela ordem (campos SEQ no .docx). Quando uma edição remove uma ilustração,
// as remissões às seguintes são renumeradas pela correspondência das legendas antes e depois das
// edições. As edições devem, portanto, escrever as remissões na numeração anterior a elas.
type Especie = 'Figura' | 'Quadro' | 'Tabela';
type Legenda = { especie: Especie; texto: string };
type Mapa = Record<Especie, Map<number, number | null>>;
const REMISSAO = /\b(Figura|Quadro|Tabela)(s?) (\d+(?:(?:, | e )\d+)*)(?! do PCDT)/g;

/** `renomeadas`: legenda antiga → nova, para ilustrações cuja legenda a revisão alterou. */
function mapaRenumeracao(antes: Legenda[], depois: Legenda[], renomeadas = new Map<string, string>()): Mapa | null {
  const mapa: Mapa = { Figura: new Map(), Quadro: new Map(), Tabela: new Map() };
  let mudou = false;
  for (const especie of ['Figura', 'Quadro', 'Tabela'] as Especie[]) {
    const a = antes.filter((l) => l.especie === especie).map((l) => l.texto);
    const d = depois.filter((l) => l.especie === especie).map((l) => l.texto);
    a.forEach((texto, i) => {
      const novo = d.indexOf(renomeadas.get(texto) ?? texto);
      mapa[especie].set(i + 1, novo < 0 ? null : novo + 1);
      if (novo !== i) mudou = true;
    });
  }
  return mudou ? mapa : null;
}

function renumerar(texto: string, mapa: Mapa, onde: string) {
  return texto.replace(REMISSAO, (_t, especie: Especie, plural: string, numeros: string) => {
    const novos = numeros.replace(/\d+/g, (n) => {
      const novo = mapa[especie].get(Number(n));
      if (novo === null) throw new Error(`remissão a ${especie} ${n}, removida pela revisão (${onde})`);
      return String(novo ?? n);
    });
    return `${especie}${plural} ${novos}`;
  });
}

const ESTILO_LEGENDA = /w:pStyle w:val="Legenda(Figura|Quadro|Tabela)"/;
function legendasDocx(doc: string): Legenda[] {
  return paragrafos(doc)
    .filter((p) => ESTILO_LEGENDA.test(p.xml))
    .map((p) => ({ especie: p.xml.match(ESTILO_LEGENDA)![1] as Especie, texto: normalizar(plano(p.xml)).replace(/^\S+ \S+ – /, '') }));
}

const LINHA_LEGENDA = /^\*\*(Figura|Quadro|Tabela) \d+ – (.+)\*\*$/;
function legendasMd(linhas: string[]): Legenda[] {
  const inicio = linhas.indexOf('# SUMÁRIO');
  return linhas.flatMap((l, i) => {
    const m = i > inicio ? l.match(LINHA_LEGENDA) : null;
    return m ? [{ especie: m[1] as Especie, texto: normalizar(planoMd(m[2])) }] : [];
  });
}

const ESTILOS_SEM_AJUSTE = /w:pStyle w:val="(Ttulo\d|Sumrio\d|ndicedeilustraes|Legenda[A-Za-z]*)"/;

function ajustarDocx(doc: string, ajustes: Ajustes) {
  const italico = ajustes.italico?.length ? reItalico(ajustes.italico) : null;
  let regiao = false; // do Capítulo 1 às Referências e nos apêndices
  return doc.replace(/<w:p(?=[ >])(?:(?!<w:p[ >])[\s\S])*?<\/w:p>/g, (p) => {
    const texto = normalizar(plano(p));
    if (/w:pStyle w:val="Ttulo1"/.test(p)) regiao = /^(1 INTRODUÇÃO|APÊNDICE )/.test(texto) || (regiao && !/^REFERÊNCIAS/.test(texto));
    if (ESTILOS_SEM_AJUSTE.test(p)) {
      // Títulos e legendas recebem apenas as trocas literais (como a do título do trabalho).
      return ajustes.trocas ? p.replace(/(<w:t(?: [^>]*)?>)([^<]*)(<\/w:t>)/g, (_m, a: string, t: string, b: string) => a + trocar(t, texto, ajustes) + b) : p;
    }
    let q = p.replace(/(<w:t(?: [^>]*)?>)([^<]*)(<\/w:t>)/g, (_m, a: string, t: string, b: string) => {
      let novo = trocar(t, texto, ajustes);
      if (ajustes.remissoesSecoes) novo = renumerarSecoes(novo, ajustes.remissoesSecoes, '.docx');
      return a + novo + b;
    });
    if (italico && regiao && !/w:pStyle w:val="Referencia"/.test(p)) {
      q = q.replace(/<w:r>(<w:rPr>((?:(?!<\/w:rPr>)[\s\S])*)<\/w:rPr>)?((?:<w:lastRenderedPageBreak\/>)?)<w:t(?: [^>]*)?>([^<]*)<\/w:t><\/w:r>/g, (run, _rpr, rPr = '', quebra: string, t: string) => {
        if (/<w:i\/>|w:rFonts|w:rStyle/.test(rPr) || t.search(italico) < 0) return run;
        // <w:i/> segue rStyle, rFonts, b e bCs na ordem do esquema.
        const inicio = rPr.match(/^(?:<w:(?:rStyle|rFonts|b|bCs)\b[^>]*\/>)*/)![0];
        const rPrItalico = `<w:rPr>${inicio}<w:i/><w:iCs/>${rPr.slice(inicio.length)}</w:rPr>`;
        const normal = rPr ? `<w:rPr>${rPr}</w:rPr>` : '';
        return t
          .split(italico)
          .map((parte, i) => (parte === '' ? '' : `<w:r>${i % 2 ? rPrItalico : normal}${i === 0 ? quebra : ''}<w:t xml:space="preserve">${parte}</w:t></w:r>`))
          .join('');
      });
      italico.lastIndex = 0;
    }
    return q;
  });
}

function trocar(t: string, paragrafo: string, ajustes: Ajustes) {
  for (const { de, para, exceto } of ajustes.trocas ?? []) {
    if (exceto?.some((x) => paragrafo.includes(x))) continue;
    t = t.split(de).join(para);
  }
  return t;
}

export async function aplicarRevisaoDocx(arquivo: string, edicoes: Edicao[], pastaImagens = '.', ajustes?: Ajustes) {
  const zip = await JSZip.loadAsync(readFileSync(arquivo));
  let doc = await zip.file('word/document.xml')!.async('string');
  if (ajustes) doc = ajustarDocx(doc, ajustes);
  const legendasAntes = legendasDocx(doc);
  const renomeadas = new Map<string, string>();
  const maior = (re: RegExp) => Math.max(0, ...[...doc.matchAll(re)].map((m) => Number(m[1])));
  let bookmark = maior(/<w:bookmarkStart w:id="(\d+)"/g) + 5000;
  const ctx: Contexto = {
    proximaNota: () => {
      throw new Error('notas de rodapé não são suportadas nas edições de revisão');
    },
    notas: [],
    imagens: [],
    proximoRid: () => {
      throw new Error('imagens não são suportadas nas edições de revisão');
    },
    proximoBookmark: () => (bookmark += 1),
    proximoDocPr: () => 0
  };
  for (const e of edicoes) {
    if (e.tipo === 'substituir_tabela') {
      const legendas = paragrafos(doc).filter((p) => /w:val="Legenda(Quadro|Tabela)"/.test(p.xml) && normalizar(plano(p.xml)).endsWith(normalizar(e.legenda)));
      if (legendas.length !== 1) throw new Error(`[${e.id}] legenda não encontrada ou repetida: ${e.legenda}`);
      renomeadas.set(normalizar(plano(legendas[0].xml)).replace(/^\S+ \S+ – /, ''), normalizar(e.bloco.legenda));
      const inicio = legendas[0].inicio;
      const fimTabela = doc.indexOf('</w:tbl>', inicio);
      const fonte = paragrafos(doc.slice(fimTabela)).find((p) => /w:val="Fonte"/.test(p.xml));
      if (!fonte) throw new Error(`[${e.id}] parágrafo de fonte não encontrado após a tabela`);
      const fim = fimTabela + fonte.fim;
      doc = doc.slice(0, inicio) + blocosParaXml([e.bloco], ctx, () => readFileSync(pastaImagens)) + doc.slice(fim);
      continue;
    }
    if (e.tipo === 'remover_ilustracao') {
      // Remove da legenda (estilo Legenda*) até o parágrafo de fonte (estilo Fonte*) que a segue.
      const todos = paragrafos(doc);
      const legendas = todos.filter((p) => /w:pStyle w:val="Legenda[A-Za-z]*"/.test(p.xml) && normalizar(plano(p.xml)).endsWith(normalizar(e.legenda)));
      if (legendas.length !== 1) throw new Error(`[${e.id}] legenda não encontrada ou repetida: ${e.legenda}`);
      const fonte = todos.find((p) => p.inicio > legendas[0].inicio && /w:pStyle w:val="Fonte[A-Za-z]*"/.test(p.xml));
      if (!fonte) throw new Error(`[${e.id}] parágrafo de fonte não encontrado após a legenda`);
      doc = doc.slice(0, legendas[0].inicio) + doc.slice(fonte.fim);
      continue;
    }
    if (e.tipo === 'inserir_no_fim') {
      // Antes das propriedades da última seção, filhas diretas de w:body.
      const fim = doc.lastIndexOf('<w:sectPr');
      if (fim < 0 || doc.slice(fim).includes('</w:p>')) throw new Error(`[${e.id}] fim do documento não localizado`);
      doc = doc.slice(0, fim) + blocosParaXml(e.blocos, ctx, () => readFileSync(pastaImagens)) + doc.slice(fim);
      continue;
    }
    const p = localizar(doc, e.antes, e.id, 'titulo' in e && e.titulo);
    if (e.tipo === 'mover') {
      doc = doc.slice(0, p.inicio) + doc.slice(p.fim);
      const q = localizar(doc, e.depoisDe, e.id);
      doc = doc.slice(0, q.fim) + p.xml + doc.slice(q.fim);
    } else if (e.tipo === 'remover') {
      doc = doc.slice(0, p.inicio) + doc.slice(p.fim);
    } else if (e.tipo === 'substituir') {
      const abertura = p.xml.match(/^<w:p[^>]*>/)![0];
      let pPr = p.xml.match(/<w:pPr>[\s\S]*?<\/w:pPr>|<w:pPr\/>/)?.[0] ?? '';
      if (e.nivel) {
        if (!e.titulo) throw new Error(`[${e.id}] nivel exige titulo: true`);
        pPr = `<w:pPr><w:pStyle w:val="Ttulo${e.nivel}"/>${e.nivel === 1 ? '<w:pageBreakBefore/>' : ''}</w:pPr>`;
      }
      // Nas alíneas, a letra e a tabulação ficam em execuções próprias, como em docx_blocos.
      const alinea = /w:pStyle w:val="Alinea"/.test(pPr) ? e.depois.match(ALINEA) : null;
      const conteudo = alinea ? `<w:r><w:t>${alinea[1]})</w:t></w:r><w:r><w:tab/></w:r>${runs(alinea[2], ctx)}` : runs(e.depois, ctx);
      // Em células de tabela, o texto segue o tamanho do estilo TextoTabela.
      doc = doc.slice(0, p.inicio) + `${abertura}${pPr}${conteudo}</w:p>` + doc.slice(p.fim);
    } else {
      doc = doc.slice(0, p.fim) + blocosParaXml(e.blocos, ctx, () => readFileSync(pastaImagens)) + doc.slice(p.fim);
    }
  }
  const mapa = mapaRenumeracao(legendasAntes, legendasDocx(doc), renomeadas);
  if (mapa) {
    // Legendas e listas de ilustrações são numeradas pelo Word; o restante do texto, aqui.
    doc = doc.replace(/<w:p(?=[ >])(?:(?!<w:p[ >])[\s\S])*?<\/w:p>/g, (p) =>
      ESTILO_LEGENDA.test(p) || /w:pStyle w:val="ndicedeilustraes"/.test(p)
        ? p
        : p.replace(/(<w:t(?: [^>]*)?>)([^<]*)(<\/w:t>)/g, (_m, a: string, t: string, b: string) => a + renumerar(t, mapa, '.docx') + b)
    );
  }
  // Notas de rodapé cujo parágrafo foi substituído deixam de ser referenciadas; são removidas.
  const notasXml = zip.file('word/footnotes.xml');
  if (notasXml) {
    const usadas = new Set([...doc.matchAll(/<w:footnoteReference w:id="(\d+)"/g)].map((m) => m[1]));
    const notas = await notasXml.async('string');
    zip.file('word/footnotes.xml', notas.replace(/<w:footnote (?![^>]*w:type=)[^>]*w:id="(\d+)"[^>]*>[\s\S]*?<\/w:footnote>/g, (n, id: string) => (usadas.has(id) ? n : '')));
  }
  zip.file('word/document.xml', doc);
  writeFileSync(arquivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

function ajustarMarkdown(linhas: string[], ajustes: Ajustes) {
  const inicioSumario = linhas.indexOf('# SUMÁRIO');
  const italico = ajustes.italico?.length ? reItalico(ajustes.italico) : null;
  let regiao = false;
  return linhas.map((l, i) => {
    if (i > inicioSumario && /^# /.test(l)) regiao = /^# (1 INTRODUÇÃO|APÊNDICE )/.test(l) || (regiao && l !== '# REFERÊNCIAS');
    let q = trocar(l, planoMd(l), ajustes);
    if (i <= inicioSumario || /^#/.test(l)) return q;
    if (ajustes.remissoesSecoes) q = renumerarSecoes(q, ajustes.remissoesSecoes, '.md');
    if (italico && regiao && !/^!\[|^\[\^/.test(q)) {
      // Só o texto fora de itálico, negrito, código, realce de marcação e endereços.
      q = q
        .split(/(`[^`]*`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/\S+|<\/?mark>)/)
        .map((parte, k) => (k % 2 ? parte : parte.replace(italico, '*$1*')))
        .join('');
    }
    return q;
  });
}

export function aplicarRevisaoMarkdown(arquivo: string, edicoes: Edicao[], ajustes?: Ajustes) {
  const original = readFileSync(arquivo, 'utf8');
  const crlf = original.includes('\r\n');
  let linhas = original.replace(/\r\n/g, '\n').split('\n');
  if (ajustes) linhas = ajustarMarkdown(linhas, ajustes);
  const legendasAntes = legendasMd(linhas);
  const renomeadas = new Map<string, string>();
  const paragrafoMd = (texto: string) => blocosParaMarkdown([{ tipo: 'paragrafo', texto }], { Tabela: 0, Quadro: 0, Figura: 0 }).texto;
  const localizarMd = (antes: string, id: string, titulo = false) => {
    const alvo = normalizar(antes);
    const idx = linhas.flatMap((l, i) => {
      if (titulo && !/^#{1,3} /.test(l)) return [];
      return normalizar(planoMd(titulo ? l.replace(/^#+ /, '') : l)).startsWith(alvo) ? [i] : [];
    });
    if (idx.length !== 1) throw new Error(`[${id}] .md: ${idx.length} linhas começam com: "${antes.slice(0, 70)}"`);
    return idx[0];
  };
  for (const e of edicoes) {
    if (e.tipo === 'substituir_tabela') {
      const i = linhas.findIndex((l) => /^\*\*(Quadro|Tabela) \d+ – /.test(l) && normalizar(planoMd(l)).endsWith(normalizar(e.legenda)));
      if (i < 0) throw new Error(`[${e.id}] .md: legenda não encontrada: ${e.legenda}`);
      renomeadas.set(normalizar(planoMd(linhas[i].match(LINHA_LEGENDA)![2])), normalizar(planoMd(e.bloco.legenda)));
      const j = linhas.findIndex((l, k) => k > i && /^Fonte:/.test(l));
      const numeros = { Tabela: 0, Quadro: 0, Figura: 0 };
      numeros[e.bloco.especie] = linhas.slice(0, i).filter((l) => new RegExp(`^\\*\\*${e.bloco.especie} \\d+ – `).test(l)).length;
      linhas.splice(i, j - i + 1, ...blocosParaMarkdown([e.bloco], numeros).texto.split('\n'));
      continue;
    }
    if (e.tipo === 'substituir' && e.md) {
      const texto = linhas.join('\n');
      if (texto.split(e.md.antes).length !== 2) throw new Error(`[${e.id}] .md: trecho não encontrado ou repetido: ${e.md.antes.slice(0, 70)}`);
      linhas = texto.replace(e.md.antes, () => e.md!.depois).split('\n');
      continue;
    }
    if (e.tipo === 'remover_ilustracao') {
      const i = linhas.findIndex((l) => /^\*\*(Figura|Quadro|Tabela) \d+ – /.test(l) && normalizar(planoMd(l)).endsWith(normalizar(e.legenda)));
      if (i < 0) throw new Error(`[${e.id}] .md: legenda não encontrada: ${e.legenda}`);
      const j = linhas.findIndex((l, k) => k > i && /^Fonte:/.test(l));
      linhas.splice(i, j - i + 1 + (linhas[j + 1] === '' ? 1 : 0));
      continue;
    }
    if (e.tipo === 'inserir_no_fim') {
      // Antes das definições de notas de rodapé que fecham o arquivo, se houver.
      let k = linhas.length;
      while (k > 0 && (/^\[\^\w+\]: /.test(linhas[k - 1]) || linhas[k - 1] === '')) k--;
      linhas.splice(k, 0, '', ...blocosParaMarkdown(e.blocos, { Tabela: 0, Quadro: 0, Figura: 0 }).texto.split('\n'));
      continue;
    }
    const titulo = 'titulo' in e && !!e.titulo;
    const i = localizarMd(e.antes, e.id, titulo);
    if (e.tipo === 'mover') {
      const [linha] = linhas.splice(i, 1);
      if (linhas[i] === '' && linhas[i - 1] === '') linhas.splice(i, 1);
      const j = localizarMd(e.depoisDe, e.id);
      linhas.splice(j + 1, 0, '', linha);
    } else if (e.tipo === 'remover') {
      // Remove a linha e uma linha em branco adjacente.
      linhas.splice(i, linhas[i + 1] === '' ? 2 : 1);
    } else if (e.tipo === 'substituir') {
      const prefixo = titulo ? (e.nivel ? `${'#'.repeat(e.nivel)} ` : linhas[i].match(/^#+ /)![0]) : '';
      linhas[i] = titulo ? `${prefixo}${e.depois}` : paragrafoMd(e.depois);
    } else {
      linhas.splice(i + 1, 0, '', ...blocosParaMarkdown(e.blocos, { Tabela: 0, Quadro: 0, Figura: 0 }).texto.split('\n'));
    }
  }
  const mapa = mapaRenumeracao(legendasAntes, legendasMd(linhas), renomeadas);
  if (mapa) {
    // As legendas e as listas de ilustrações são refeitas por normalizarMarkdown.
    const inicio = linhas.indexOf('# SUMÁRIO');
    linhas = linhas.map((l, i) => (i <= inicio || LINHA_LEGENDA.test(l) ? l : renumerar(l, mapa, '.md')));
  }
  const md = linhas.join('\n');
  writeFileSync(arquivo, crlf ? md.replace(/\n/g, '\r\n') : md);
}

/** Confere que o texto final de cada substituição aparece no .md (sem marcação). */
export function conferirMarkdown(arquivo: string, edicoes: Edicao[]) {
  // Os números das remissões a ilustrações podem ter sido renumerados; a comparação os ignora.
  const semNumeros = (s: string) => s.replace(REMISSAO, '$1$2 #');
  const md = semNumeros(normalizar(planoMd(readFileSync(arquivo, 'utf8'))));
  return edicoes.filter((e) => e.tipo === 'substituir' && !e.md && !md.includes(semNumeros(normalizar(planoMarcado(e.depois))))).map((e) => e.id);
}

/**
 * Mantém o .md coerente com o que o Word gera no .docx: renumera as legendas de figuras, quadros e
 * tabelas pela ordem em que aparecem (no .docx, campos SEQ) e refaz o sumário e as listas de
 * ilustrações a partir dos títulos e das legendas.
 */
export function normalizarMarkdown(arquivo: string) {
  const original = readFileSync(arquivo, 'utf8');
  const crlf = original.includes('\r\n');
  const linhas = original.replace(/\r\n/g, '\n').split('\n');
  // Remove definições de notas de rodapé que nenhum parágrafo referencia mais e o separador "---"
  // que as precedia, quando ele fica sem nenhuma nota.
  const corpo = linhas.filter((l) => !/^\[\^\w+\]: /.test(l)).join('\n');
  for (let i = linhas.length - 1; i >= 0; i--) {
    const m = linhas[i].match(/^\[\^(\w+)\]: /);
    if (!m || corpo.includes(`[^${m[1]}]`)) continue;
    linhas.splice(i, 1);
    if (linhas[i] === '' && linhas[i - 1] === '') linhas.splice(i, 1);
    let k = i - 1;
    while (k >= 0 && linhas[k] === '') k--;
    const proxima = linhas.slice(i).find((l) => l !== '');
    if (linhas[k] === '---' && (proxima === undefined || /^#/.test(proxima))) linhas.splice(k, i - k);
  }
  const legendas: Record<string, string[]> = { Figura: [], Quadro: [], Tabela: [] };
  const inicioSumario = linhas.indexOf('# SUMÁRIO');
  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].match(/^\*\*(Figura|Quadro|Tabela) \d+ – (.+)\*\*$/);
    if (!m || i < inicioSumario) continue;
    legendas[m[1]].push(m[2]);
    linhas[i] = `**${m[1]} ${legendas[m[1]].length} – ${m[2]}**`;
  }
  const titulos = linhas
    .slice(inicioSumario + 1)
    .filter((l) => /^#{1,3} /.test(l))
    .map((l) => `${'  '.repeat(l.match(/^#+/)![0].length - 1)}- ${l.replace(/^#+ /, '')}`);
  const substituirSecao = (titulo: string, conteudo: string[]) => {
    const i = linhas.indexOf(titulo);
    if (i < 0) throw new Error(`.md: seção não encontrada: ${titulo}`);
    const j = linhas.findIndex((l, k) => k > i && /^# /.test(l));
    linhas.splice(i + 1, j - i - 1, '', ...conteudo, '');
  };
  substituirSecao('# LISTA DE FIGURAS', legendas.Figura.map((t, k) => `- Figura ${k + 1} – ${t}`));
  substituirSecao('# LISTA DE QUADROS', legendas.Quadro.map((t, k) => `- Quadro ${k + 1} – ${t}`));
  substituirSecao('# LISTA DE TABELAS', legendas.Tabela.map((t, k) => `- Tabela ${k + 1} – ${t}`));
  substituirSecao('# SUMÁRIO', titulos);
  const md = linhas.join('\n');
  writeFileSync(arquivo, crlf ? md.replace(/\n/g, '\r\n') : md);
}
