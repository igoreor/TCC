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
// iniciadas por #), já que as entradas do sumário começam com o mesmo texto.
export type Edicao = { id: string; secao: string; motivo: string } & (
  | { tipo: 'substituir'; antes: string; depois: string; titulo?: boolean; md?: { antes: string; depois: string } }
  | { tipo: 'remover'; antes: string; titulo?: boolean }
  | { tipo: 'inserir_depois'; antes: string; blocos: Bloco[] }
  | { tipo: 'substituir_tabela'; legenda: string; bloco: Extract<Bloco, { tipo: 'tabela' }> }
  | { tipo: 'remover_ilustracao'; legenda: string }
);

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

function mapaRenumeracao(antes: Legenda[], depois: Legenda[]): Mapa | null {
  const mapa: Mapa = { Figura: new Map(), Quadro: new Map(), Tabela: new Map() };
  let mudou = false;
  for (const especie of ['Figura', 'Quadro', 'Tabela'] as Especie[]) {
    const a = antes.filter((l) => l.especie === especie).map((l) => l.texto);
    const d = depois.filter((l) => l.especie === especie).map((l) => l.texto);
    a.forEach((texto, i) => {
      const novo = d.indexOf(texto);
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

export async function aplicarRevisaoDocx(arquivo: string, edicoes: Edicao[], pastaImagens = '.') {
  const zip = await JSZip.loadAsync(readFileSync(arquivo));
  let doc = await zip.file('word/document.xml')!.async('string');
  const legendasAntes = legendasDocx(doc);
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
    const p = localizar(doc, e.antes, e.id, 'titulo' in e && e.titulo);
    if (e.tipo === 'remover') {
      doc = doc.slice(0, p.inicio) + doc.slice(p.fim);
    } else if (e.tipo === 'substituir') {
      const abertura = p.xml.match(/^<w:p[^>]*>/)![0];
      const pPr = p.xml.match(/<w:pPr>[\s\S]*?<\/w:pPr>|<w:pPr\/>/)?.[0] ?? '';
      // Nas alíneas, a letra e a tabulação ficam em execuções próprias, como em docx_blocos.
      const alinea = /w:pStyle w:val="Alinea"/.test(pPr) ? e.depois.match(ALINEA) : null;
      const conteudo = alinea ? `<w:r><w:t>${alinea[1]})</w:t></w:r><w:r><w:tab/></w:r>${runs(alinea[2], ctx)}` : runs(e.depois, ctx);
      // Em células de tabela, o texto segue o tamanho do estilo TextoTabela.
      doc = doc.slice(0, p.inicio) + `${abertura}${pPr}${conteudo}</w:p>` + doc.slice(p.fim);
    } else {
      doc = doc.slice(0, p.fim) + blocosParaXml(e.blocos, ctx, () => readFileSync(pastaImagens)) + doc.slice(p.fim);
    }
  }
  const mapa = mapaRenumeracao(legendasAntes, legendasDocx(doc));
  if (mapa) {
    // Legendas e listas de ilustrações são numeradas pelo Word; o restante do texto, aqui.
    doc = doc.replace(/<w:p(?=[ >])(?:(?!<w:p[ >])[\s\S])*?<\/w:p>/g, (p) =>
      ESTILO_LEGENDA.test(p) || /w:pStyle w:val="ndicedeilustraes"/.test(p)
        ? p
        : p.replace(/(<w:t(?: [^>]*)?>)([^<]*)(<\/w:t>)/g, (_m, a: string, t: string, b: string) => a + renumerar(t, mapa, '.docx') + b)
    );
  }
  zip.file('word/document.xml', doc);
  writeFileSync(arquivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

export function aplicarRevisaoMarkdown(arquivo: string, edicoes: Edicao[]) {
  const original = readFileSync(arquivo, 'utf8');
  const crlf = original.includes('\r\n');
  let linhas = original.replace(/\r\n/g, '\n').split('\n');
  const legendasAntes = legendasMd(linhas);
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
    const titulo = 'titulo' in e && !!e.titulo;
    const i = localizarMd(e.antes, e.id, titulo);
    if (e.tipo === 'remover') {
      // Remove a linha e uma linha em branco adjacente.
      linhas.splice(i, linhas[i + 1] === '' ? 2 : 1);
    } else if (e.tipo === 'substituir') {
      linhas[i] = titulo ? `${linhas[i].match(/^#+ /)![0]}${e.depois}` : paragrafoMd(e.depois);
    } else {
      linhas.splice(i + 1, 0, '', ...blocosParaMarkdown(e.blocos, { Tabela: 0, Quadro: 0, Figura: 0 }).texto.split('\n'));
    }
  }
  const mapa = mapaRenumeracao(legendasAntes, legendasMd(linhas));
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
