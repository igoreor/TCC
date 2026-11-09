// Aplica inserções de blocos ao TCC (.docx e .md): cada inserção entra antes de um título de
// capítulo (estilo Ttulo1) ou no fim do documento. Mantém notas de rodapé, imagens e
// relacionamentos coerentes. Os números de tabelas, quadros e figuras são atualizados depois
// pelo Word (campos SEQ), com word_atualizar.ps1.
import JSZip from 'jszip';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Bloco, blocosParaMarkdown, blocosParaXml, Contexto, referenciaXml } from './docx_blocos';

export interface Insercao {
  /** Texto exato do título de capítulo antes do qual inserir, ou 'fim'. */
  antes: string;
  blocos: Bloco[];
}

const maxNumero = (texto: string, re: RegExp) => Math.max(0, ...[...texto.matchAll(re)].map((m) => Number(m[1])));

/** Chave de ordenação alfabética de uma referência (sem acentos nem marcação). */
const chaveRef = (texto: string) =>
  texto.replace(/[*`]/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

const textoDoParagrafo = (p: string) => (p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) ?? []).map((t) => t.replace(/<[^>]+>/g, '')).join('');

function inserirReferenciasXml(doc: string, referencias: string[], ctx: Contexto) {
  for (const ref of referencias) {
    const inicio = doc.lastIndexOf('<w:t>REFERÊNCIAS</w:t>');
    const fim = doc.indexOf('<w:t>APÊNDICE A', inicio);
    const trecho = doc.slice(inicio, fim);
    const paragrafos = [...trecho.matchAll(/<w:p [^>]*>(?:(?!<\/w:p>)[\s\S])*?w:val="Referencia"[\s\S]*?<\/w:p>/g)];
    const chave = chaveRef(ref);
    const depois = paragrafos.find((m) => chaveRef(textoDoParagrafo(m[0])) > chave);
    const ultimo = paragrafos[paragrafos.length - 1];
    const posicao = depois ? inicio + depois.index! : inicio + ultimo.index! + ultimo[0].length;
    doc = doc.slice(0, posicao) + referenciaXml(ref, ctx) + doc.slice(posicao);
  }
  return doc;
}

export async function aplicarDocx(arquivo: string, insercoes: Insercao[], pastaImagens: string, referencias: string[] = []) {
  const zip = await JSZip.loadAsync(readFileSync(arquivo));
  let doc = await zip.file('word/document.xml')!.async('string');
  let notasXml = await zip.file('word/footnotes.xml')!.async('string');
  let rels = await zip.file('word/_rels/document.xml.rels')!.async('string');
  let tipos = await zip.file('[Content_Types].xml')!.async('string');

  let nota = maxNumero(notasXml, /<w:footnote w:id="(\d+)"/g);
  let rid = maxNumero(rels, /Id="rId(\d+)"/g);
  let bookmark = maxNumero(doc, /<w:bookmarkStart w:id="(\d+)"/g) + 1000;
  let docPr = maxNumero(doc, /<wp:docPr id="(\d+)"/g) + 100;
  const ctx: Contexto = {
    proximaNota: () => (nota += 1),
    notas: [],
    imagens: [],
    proximoRid: () => `rId${(rid += 1)}`,
    proximoBookmark: () => (bookmark += 1),
    proximoDocPr: () => (docPr += 1)
  };
  const lerImagem = (a: string) => readFileSync(path.join(pastaImagens, a));

  for (const ins of insercoes) {
    const xml = blocosParaXml(ins.blocos, ctx, lerImagem);
    let posicao: number;
    if (ins.antes === 'fim') {
      posicao = doc.lastIndexOf('<w:sectPr');
    } else {
      const marca = `<w:t>${ins.antes}</w:t>`;
      const i = doc.lastIndexOf(marca);
      if (i < 0) throw new Error(`título não encontrado: ${ins.antes}`);
      posicao = doc.lastIndexOf('<w:p ', i);
      const estilo = doc.slice(posicao, i);
      if (!estilo.includes('w:val="Ttulo1"')) throw new Error(`o parágrafo de "${ins.antes}" não é um título de capítulo`);
    }
    doc = doc.slice(0, posicao) + xml + doc.slice(posicao);
  }

  doc = inserirReferenciasXml(doc, referencias, ctx);
  notasXml = notasXml.replace('</w:footnotes>', ctx.notas.join('') + '</w:footnotes>');
  for (const img of ctx.imagens) {
    zip.file(`word/${img.destino}`, readFileSync(path.join(pastaImagens, img.arquivo)));
    rels = rels.replace(
      '</Relationships>',
      `<Relationship Id="${img.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${img.destino}"/></Relationships>`
    );
  }
  if (!/Extension="png"/i.test(tipos)) {
    tipos = tipos.replace('<Default ', '<Default Extension="png" ContentType="image/png"/><Default ');
  }
  zip.file('word/document.xml', doc);
  zip.file('word/footnotes.xml', notasXml);
  zip.file('word/_rels/document.xml.rels', rels);
  zip.file('[Content_Types].xml', tipos);
  writeFileSync(arquivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  return { notas: ctx.notas.length, imagens: ctx.imagens.length };
}

/** Insere os mesmos blocos na versão Markdown do TCC, com a numeração correta das legendas. */
export function aplicarMarkdown(arquivo: string, insercoes: Insercao[], referencias: string[] = []) {
  const original = readFileSync(arquivo, 'utf8');
  const crlf = original.includes('\r\n');
  let md = original.replace(/\r\n/g, '\n');
  for (const ref of referencias) {
    const inicio = md.indexOf('\n# REFERÊNCIAS\n');
    const fim = md.indexOf('\n# APÊNDICE A', inicio);
    const linhas = md.slice(inicio, fim).split('\n');
    const indice = linhas.findIndex((l, i) => i > 1 && l.trim() && /^[A-ZÀ-Ú]/.test(l) && chaveRef(l) > chaveRef(ref));
    if (indice >= 0) linhas.splice(indice, 0, ref, '');
    else linhas.push('', ref);
    md = md.slice(0, inicio) + linhas.join('\n') + md.slice(fim);
  }
  const todasNotas: string[] = [];
  for (const ins of insercoes) {
    const posicao = ins.antes === 'fim' ? md.length : md.lastIndexOf(`\n# ${ins.antes}\n`);
    if (posicao < 0) throw new Error(`título não encontrado no .md: ${ins.antes}`);
    const antes = md.slice(0, posicao);
    const conta = (especie: string) => (antes.match(new RegExp(`^\\*\\*${especie} \\d+ – `, 'gm')) ?? []).length;
    const numeros = { Tabela: conta('Tabela'), Quadro: conta('Quadro'), Figura: conta('Figura') };
    const { texto, notas } = blocosParaMarkdown(ins.blocos, numeros);
    const renumeradas = notas.map((n) => n.replace(/^\[\^aval(\d+)\]/, (_m, k) => `[^aval${todasNotas.length + Number(k)}]`));
    const textoRenumerado = texto.replace(/\[\^aval(\d+)\]/g, (_m, k) => `[^aval${todasNotas.length + Number(k)}]`);
    todasNotas.push(...renumeradas);
    md = ins.antes === 'fim' ? `${md.trimEnd()}\n\n${textoRenumerado}\n` : `${antes}\n\n${textoRenumerado}\n${md.slice(posicao)}`;
  }
  if (todasNotas.length) md = `${md.trimEnd()}\n\n${todasNotas.join('\n')}\n`;
  writeFileSync(arquivo, crlf ? md.replace(/\n/g, '\r\n') : md);
}
