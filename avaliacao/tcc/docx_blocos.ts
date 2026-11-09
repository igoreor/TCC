// Geração de blocos do TCC em dois formatos, a partir da mesma descrição: XML do Word (com os
// estilos que o .docx já usa: Ttulo1/2/3, Corpo, Alinea, LegendaTabela, LegendaQuadro,
// LegendaFigura, TextoTabela, Fonte, FonteFigura, Figura) e Markdown (para a versão .md do TCC).
//
// Marcação de texto: *itálico*, `código`, [[texto realçado em amarelo]] e {{nota de rodapé}}.

export type Bloco =
  | { tipo: 'titulo1'; texto: string; apendice?: boolean }
  | { tipo: 'titulo2'; texto: string }
  | { tipo: 'titulo3'; texto: string }
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'alineas'; itens: string[] }
  | { tipo: 'tabela'; especie: 'Tabela' | 'Quadro'; legenda: string; cabecalho: string[]; linhas: string[][]; fonte: string; larguras?: number[] }
  | { tipo: 'figura'; legenda: string; arquivo: string; larguraCm: number; fonte: string };

const LARGURA_TEXTO = 9071; // twips (16 cm)
const EMU_POR_CM = 360000;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface Contexto {
  proximaNota: () => number;
  notas: string[]; // XML das notas de rodapé a acrescentar em footnotes.xml
  imagens: Array<{ rId: string; arquivo: string; destino: string }>;
  proximoRid: () => string;
  proximoBookmark: () => number;
  proximoDocPr: () => number;
}

type Segmento = { texto: string; italico?: boolean; negrito?: boolean; codigo?: boolean; realce?: boolean; nota?: string };

/** Separa o texto marcado em segmentos (sem aninhamento, exceto itálico/código dentro de realce). */
export function segmentar(texto: string): Segmento[] {
  const segs: Segmento[] = [];
  const re = /\{\{([\s\S]+?)\}\}|\[\[([\s\S]+?)\]\]|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) segs.push({ texto: texto.slice(ultimo, m.index) });
    if (m[1] !== undefined) segs.push({ texto: '', nota: m[1] });
    else if (m[2] !== undefined) segs.push(...segmentar(m[2]).map((s) => ({ ...s, realce: true })));
    else if (m[3] !== undefined) segs.push({ texto: m[3], negrito: true });
    else if (m[4] !== undefined) segs.push({ texto: m[4], italico: true });
    else segs.push({ texto: m[5], codigo: true });
    ultimo = re.lastIndex;
  }
  if (ultimo < texto.length) segs.push({ texto: texto.slice(ultimo) });
  return segs;
}

function runs(texto: string, ctx: Contexto, tamanhoCodigo = 22) {
  return segmentar(texto)
    .map((s) => {
      if (s.nota !== undefined) {
        const id = ctx.proximaNota();
        ctx.notas.push(
          `<w:footnote w:id="${id}"><w:p><w:pPr><w:pStyle w:val="Textodenotaderodap"/></w:pPr><w:r><w:rPr><w:rStyle w:val="Refdenotaderodap"/></w:rPr><w:footnoteRef/></w:r><w:r><w:t xml:space="preserve"> </w:t></w:r>${runs(s.nota, ctx, 18)}</w:p></w:footnote>`
        );
        return `<w:r><w:rPr><w:rStyle w:val="Refdenotaderodap"/></w:rPr><w:footnoteReference w:id="${id}"/></w:r>`;
      }
      const props = [
        s.codigo ? `<w:rFonts w:ascii="Courier New" w:eastAsia="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/>` : '',
        s.negrito ? '<w:b/><w:bCs/>' : '',
        s.italico ? '<w:i/><w:iCs/>' : '',
        s.codigo ? `<w:sz w:val="${tamanhoCodigo}"/><w:szCs w:val="${tamanhoCodigo}"/>` : '',
        s.realce ? '<w:highlight w:val="yellow"/>' : ''
      ].join('');
      return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${esc(s.texto)}</w:t></w:r>`;
    })
    .join('');
}

const paragrafo = (estilo: string, conteudo: string, extra = '') => `<w:p><w:pPr><w:pStyle w:val="${estilo}"/>${extra}</w:pPr>${conteudo}</w:p>`;

function titulo(estilo: string, texto: string, ctx: Contexto, extra = '') {
  const id = ctx.proximoBookmark();
  return `<w:p><w:pPr><w:pStyle w:val="${estilo}"/>${extra}</w:pPr><w:bookmarkStart w:id="${id}" w:name="_TocAval${id}"/>${runs(texto, ctx)}<w:bookmarkEnd w:id="${id}"/></w:p>`;
}

function legenda(estilo: string, especie: string, texto: string, ctx: Contexto) {
  const id = ctx.proximoBookmark();
  return `<w:p><w:pPr><w:pStyle w:val="${estilo}"/><w:keepNext/></w:pPr><w:bookmarkStart w:id="${id}" w:name="_TocAval${id}"/><w:r><w:t xml:space="preserve">${especie} </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve">SEQ ${especie} \\* ARABIC</w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:noProof/></w:rPr><w:t>0</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r><w:r><w:t xml:space="preserve"> – </w:t></w:r>${runs(texto, ctx)}<w:bookmarkEnd w:id="${id}"/></w:p>`;
}

function tabela(b: Extract<Bloco, { tipo: 'tabela' }>, ctx: Contexto) {
  const n = b.cabecalho.length;
  const pesos = b.larguras ?? b.cabecalho.map((_, j) => Math.max(...[b.cabecalho[j], ...b.linhas.map((l) => l[j] ?? '')].map((t) => Math.min(t.length, 60))) + 6);
  const soma = pesos.reduce((a, x) => a + x, 0);
  const larguras = pesos.map((p) => Math.round((p / soma) * LARGURA_TEXTO));
  const quadro = b.especie === 'Quadro';
  const linha = '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>';
  const bordas = quadro
    ? `<w:tblBorders>${linha}<w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tblBorders>`
    : `<w:tblBorders><w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:left w:val="none" w:sz="0" w:space="0" w:color="FFFFFF"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:right w:val="none" w:sz="0" w:space="0" w:color="FFFFFF"/><w:insideH w:val="none" w:sz="0" w:space="0" w:color="FFFFFF"/><w:insideV w:val="none" w:sz="0" w:space="0" w:color="FFFFFF"/></w:tblBorders>`;
  const numerica = b.cabecalho.map((_, j) => b.linhas.every((l) => /^[\d.,%\s–—+\-−()]*$/.test(l[j] ?? '')));
  const celula = (texto: string, j: number, cabecalho: boolean) =>
    `<w:tc><w:tcPr><w:tcW w:w="${larguras[j]}" w:type="dxa"/>${cabecalho && !quadro ? '<w:tcBorders><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tcBorders>' : ''}<w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar>${cabecalho ? '<w:vAlign w:val="center"/>' : ''}</w:tcPr><w:p><w:pPr><w:pStyle w:val="TextoTabela"/>${cabecalho || numerica[j] ? '<w:jc w:val="center"/>' : ''}</w:pPr>${cabecalho ? runs(texto, ctx).replace(/<w:r>(<w:rPr>)?/g, (_m, rpr) => (rpr ? '<w:r><w:rPr><w:b/><w:bCs/>' : '<w:r><w:rPr><w:b/><w:bCs/></w:rPr>')) : runs(texto, ctx, 16)}</w:p></w:tc>`;
  const cab = `<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>${b.cabecalho.map((t, j) => celula(t, j, true)).join('')}</w:tr>`;
  const corpo = b.linhas.map((l) => `<w:tr><w:trPr><w:cantSplit/></w:trPr>${l.map((t, j) => celula(t, j, false)).join('')}</w:tr>`).join('');
  return (
    legenda(quadro ? 'LegendaQuadro' : 'LegendaTabela', b.especie, b.legenda, ctx) +
    `<w:tbl><w:tblPr><w:tblW w:w="${LARGURA_TEXTO}" w:type="dxa"/>${bordas}<w:tblLayout w:type="fixed"/><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>${larguras.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>${cab}${corpo}</w:tbl>` +
    paragrafo('Fonte', runs(b.fonte, ctx, 18))
  );
  void n;
}

function figura(b: Extract<Bloco, { tipo: 'figura' }>, ctx: Contexto, alturaPx: number, larguraPx: number) {
  const rId = ctx.proximoRid();
  const destino = `media/aval_${ctx.imagens.length + 1}.png`;
  ctx.imagens.push({ rId, arquivo: b.arquivo, destino });
  const cx = Math.round(b.larguraCm * EMU_POR_CM);
  const cy = Math.round((cx * alturaPx) / larguraPx);
  const id = ctx.proximoDocPr();
  const desenho = `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="aval-figura-${id}" descr="${esc(b.legenda)}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name=""/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  return legenda('LegendaFigura', 'Figura', b.legenda, ctx) + paragrafo('Figura', desenho) + paragrafo('FonteFigura', runs(b.fonte, ctx, 18));
}

/** Parágrafo de referência bibliográfica (estilo Referencia). */
export function referenciaXml(texto: string, ctx: Contexto) {
  return paragrafo('Referencia', runs(texto, ctx));
}

/** Dimensões (px) de um PNG, lidas do cabeçalho IHDR. */
export function dimensoesPng(buf: Buffer) {
  return { largura: buf.readUInt32BE(16), altura: buf.readUInt32BE(20) };
}

export function blocosParaXml(blocos: Bloco[], ctx: Contexto, lerImagem: (arquivo: string) => Buffer) {
  return blocos
    .map((b) => {
      switch (b.tipo) {
        case 'titulo1':
          return titulo('Ttulo1', b.texto, ctx, b.apendice ? '<w:pageBreakBefore/><w:jc w:val="center"/>' : '<w:pageBreakBefore/>');
        case 'titulo2':
          return titulo('Ttulo2', b.texto, ctx);
        case 'titulo3':
          return titulo('Ttulo3', b.texto, ctx);
        case 'paragrafo':
          return paragrafo('Corpo', runs(b.texto, ctx));
        case 'alineas':
          return b.itens
            .map((item, i) => paragrafo('Alinea', `<w:r><w:t>${String.fromCharCode(97 + i)})</w:t></w:r><w:r><w:tab/></w:r>${runs(item, ctx)}`))
            .join('');
        case 'tabela':
          return tabela(b, ctx);
        case 'figura': {
          const { largura, altura } = dimensoesPng(lerImagem(b.arquivo));
          return figura(b, ctx, altura, largura);
        }
      }
    })
    .join('');
}

// ---------------------------------------------------------------------------
// Markdown (formato da versão .md do TCC)

function mdTexto(texto: string, notas: string[]) {
  return segmentar(texto)
    .map((s) => {
      if (s.nota !== undefined) {
        notas.push(mdTexto(s.nota, notas));
        return `[^aval${notas.length}]`;
      }
      let t = s.codigo ? `\`${s.texto}\`` : s.italico ? `*${s.texto}*` : s.negrito ? `**${s.texto}**` : s.texto;
      if (s.realce) t = `<mark>${t}</mark>`;
      return t;
    })
    .join('');
}

export function blocosParaMarkdown(blocos: Bloco[], numeros: { Tabela: number; Quadro: number; Figura: number }) {
  const notas: string[] = [];
  const partes = blocos.map((b) => {
    switch (b.tipo) {
      case 'titulo1':
        return `# ${mdTexto(b.texto, notas)}`;
      case 'titulo2':
        return `## ${mdTexto(b.texto, notas)}`;
      case 'titulo3':
        return `### ${mdTexto(b.texto, notas)}`;
      case 'paragrafo':
        return mdTexto(b.texto, notas);
      case 'alineas':
        return b.itens.map((item, i) => `${String.fromCharCode(97 + i)}) ${mdTexto(item, notas)}`).join('\n');
      case 'tabela': {
        numeros[b.especie] += 1;
        const linha = (cols: string[]) => `| ${cols.map((c) => mdTexto(c, notas)).join(' | ')} |`;
        return [`**${b.especie} ${numeros[b.especie]} – ${mdTexto(b.legenda, notas)}**`, '', linha(b.cabecalho), `|${b.cabecalho.map(() => '---').join('|')}|`, ...b.linhas.map(linha), '', mdTexto(b.fonte, notas)].join('\n');
      }
      case 'figura':
        numeros.Figura += 1;
        return [`**Figura ${numeros.Figura} – ${mdTexto(b.legenda, notas)}**`, '', `![${b.legenda}](figuras/${b.arquivo.split(/[\\/]/).pop()})`, '', mdTexto(b.fonte, notas)].join('\n');
    }
  });
  return { texto: partes.join('\n\n'), notas: notas.map((n, i) => `[^aval${i + 1}]: ${n}`) };
}
