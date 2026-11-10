// Aplica ao TCC (.docx e .md) as edições da revisão acadêmica, descritas em revisao_tcc/edicoes.ts.
// Cada edição localiza um parágrafo existente pelo início do seu texto (sem marcação), que deve ser
// único no documento, e o substitui, remove ou insere blocos depois dele; tabelas inteiras são
// localizadas pela legenda. O estilo do parágrafo (w:pPr) é preservado nas substituições.
// É chamado por atualizar_tcc.ts depois das inserções da avaliação, para que a revisão sobreviva
// à regeração do TCC a partir do backup.
import JSZip from 'jszip';
import { readFileSync, writeFileSync } from 'node:fs';
import { Bloco, blocosParaMarkdown, blocosParaXml, Contexto, runs } from './docx_blocos';

export type Edicao = { id: string; secao: string; motivo: string } & (
  | { tipo: 'substituir'; antes: string; depois: string; md?: { antes: string; depois: string } }
  | { tipo: 'remover'; antes: string }
  | { tipo: 'inserir_depois'; antes: string; blocos: Bloco[] }
  | { tipo: 'substituir_tabela'; legenda: string; bloco: Extract<Bloco, { tipo: 'tabela' }> }
);

const normalizar = (s: string) => s.replace(/\s+/g, ' ').trim();
const plano = (xml: string) =>
  (xml.match(/<w:t(?: [^>]*)?>[^<]*<\/w:t>/g) ?? [])
    .map((t) => t.replace(/<[^>]+>/g, ''))
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

function localizar(doc: string, antes: string, id: string) {
  const alvo = normalizar(antes);
  const achados = paragrafos(doc).filter((p) => normalizar(plano(p.xml)).startsWith(alvo));
  if (achados.length !== 1) throw new Error(`[${id}] ${achados.length} parágrafos começam com: "${antes.slice(0, 70)}"`);
  return achados[0];
}

export async function aplicarRevisaoDocx(arquivo: string, edicoes: Edicao[], pastaImagens = '.') {
  const zip = await JSZip.loadAsync(readFileSync(arquivo));
  let doc = await zip.file('word/document.xml')!.async('string');
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
    const p = localizar(doc, e.antes, e.id);
    if (e.tipo === 'remover') {
      doc = doc.slice(0, p.inicio) + doc.slice(p.fim);
    } else if (e.tipo === 'substituir') {
      const abertura = p.xml.match(/^<w:p[^>]*>/)![0];
      const pPr = p.xml.match(/<w:pPr>[\s\S]*?<\/w:pPr>|<w:pPr\/>/)?.[0] ?? '';
      // Em células de tabela, o texto segue o tamanho do estilo TextoTabela.
      doc = doc.slice(0, p.inicio) + `${abertura}${pPr}${runs(e.depois, ctx)}</w:p>` + doc.slice(p.fim);
    } else {
      doc = doc.slice(0, p.fim) + blocosParaXml(e.blocos, ctx, () => readFileSync(pastaImagens)) + doc.slice(p.fim);
    }
  }
  zip.file('word/document.xml', doc);
  writeFileSync(arquivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

export function aplicarRevisaoMarkdown(arquivo: string, edicoes: Edicao[]) {
  const original = readFileSync(arquivo, 'utf8');
  const crlf = original.includes('\r\n');
  let linhas = original.replace(/\r\n/g, '\n').split('\n');
  const paragrafoMd = (texto: string) => blocosParaMarkdown([{ tipo: 'paragrafo', texto }], { Tabela: 0, Quadro: 0, Figura: 0 }).texto;
  const localizarMd = (antes: string, id: string) => {
    const alvo = normalizar(antes);
    const idx = linhas.flatMap((l, i) => (normalizar(planoMd(l)).startsWith(alvo) ? [i] : []));
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
    const i = localizarMd(e.antes, e.id);
    if (e.tipo === 'remover') {
      // Remove a linha e uma linha em branco adjacente.
      linhas.splice(i, linhas[i + 1] === '' ? 2 : 1);
    } else if (e.tipo === 'substituir') {
      linhas[i] = paragrafoMd(e.depois);
    } else {
      linhas.splice(i + 1, 0, '', ...blocosParaMarkdown(e.blocos, { Tabela: 0, Quadro: 0, Figura: 0 }).texto.split('\n'));
    }
  }
  const md = linhas.join('\n');
  writeFileSync(arquivo, crlf ? md.replace(/\n/g, '\r\n') : md);
}

/** Confere que o texto final de cada substituição aparece no .md (sem marcação). */
export function conferirMarkdown(arquivo: string, edicoes: Edicao[]) {
  const md = normalizar(planoMd(readFileSync(arquivo, 'utf8')));
  return edicoes.filter((e) => e.tipo === 'substituir' && !e.md && !md.includes(normalizar(planoMarcado(e.depois)))).map((e) => e.id);
}
