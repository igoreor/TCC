// Gera o documento legível da avaliação: para cada uma das 50 perguntas, a resposta de referência
// (com os trechos dos documentos), as duas respostas da IA na íntegra e a avaliação automatizada de
// cada uma. Nas 25 perguntas da validação 3, os campos da especialista ficam realçados em amarelo
// até a ficha ser consolidada.
// Uso (em backend/): npx tsx ../avaliacao/documento_perguntas_respostas.ts
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { COBERTURA, NOMES_DOCUMENTO } from './fase5_ficha';
import { calcularPorResposta, carregarDados, EXCLUIDA_DAS_MEDIAS } from './metricas';

const DIR = __dirname;
const SAIDA = path.join(DIR, 'Perguntas_e_Respostas_Avaliacao.docx');
const ler = (a: string) => JSON.parse(readFileSync(path.join(DIR, a), 'utf8'));

const LARGURA = 9638; // A4 com margens de 2 cm (twips)
const COR_TITULO = '0E5C66';
const PENDENTE = 'A PREENCHER PELA PESQUISADORA';

// ---------------------------------------------------------------------------
// Texto com marcação simples (**negrito**, *itálico*) → runs

function runs(texto: string, base: { size?: number; color?: string; bold?: boolean; highlight?: 'yellow' } = {}) {
  const partes: TextRun[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) partes.push(new TextRun({ text: texto.slice(ultimo, m.index), ...base }));
    if (m[1] !== undefined) partes.push(new TextRun({ text: m[1], ...base, bold: true }));
    else partes.push(new TextRun({ text: m[2], ...base, italics: true }));
    ultimo = re.lastIndex;
  }
  if (ultimo < texto.length) partes.push(new TextRun({ text: texto.slice(ultimo), ...base }));
  return partes;
}

const paragrafo = (texto: string, opcoes: { size?: number; color?: string; bold?: boolean; highlight?: 'yellow'; antes?: number; depois?: number } = {}) =>
  new Paragraph({
    spacing: { before: opcoes.antes ?? 0, after: opcoes.depois ?? 120, line: 276 },
    children: runs(texto, { size: opcoes.size, color: opcoes.color, bold: opcoes.bold, highlight: opcoes.highlight })
  });

const pendente = (texto = PENDENTE) => new TextRun({ text: `[${texto}]`, highlight: 'yellow' });

// ---------------------------------------------------------------------------
// Markdown das respostas da IA (títulos ###, listas, tabelas, parágrafos) → blocos do docx

let instanciaLista = 0;

function celula(conteudo: Paragraph[], largura: number, cabecalho = false) {
  return new TableCell({
    width: { size: largura, type: WidthType.DXA },
    shading: cabecalho ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E3EEF0' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: conteudo
  });
}

function tabelaMarkdown(linhas: string[]) {
  const celulas = (l: string) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const dados = linhas.filter((l) => !/^\s*\|?\s*:?-{2,}/.test(l)).map(celulas);
  const colunas = Math.max(...dados.map((d) => d.length));
  const largura = Math.floor(LARGURA / colunas);
  return new Table({
    width: { size: largura * colunas, type: WidthType.DXA },
    columnWidths: Array(colunas).fill(largura),
    rows: dados.map(
      (d, i) =>
        new TableRow({
          tableHeader: i === 0,
          children: Array.from({ length: colunas }, (_, j) =>
            celula([new Paragraph({ children: runs(d[j] ?? '', { size: 18, bold: i === 0 || undefined }) })], largura, i === 0)
          )
        })
    )
  });
}

function markdown(texto: string): Array<Paragraph | Table> {
  const blocos: Array<Paragraph | Table> = [];
  const linhas = texto.replace(/\r\n/g, '\n').split('\n');
  let paragrafoAtual: string[] = [];
  let tipoLista: 'bullet' | 'numero' | null = null;
  const fecharParagrafo = () => {
    if (paragrafoAtual.length) blocos.push(paragrafo(paragrafoAtual.join(' ')));
    paragrafoAtual = [];
  };
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (!linha.trim()) {
      fecharParagrafo();
      tipoLista = null;
      continue;
    }
    const titulo = linha.match(/^#{2,4}\s+(.*)$/);
    if (titulo) {
      fecharParagrafo();
      tipoLista = null;
      blocos.push(new Paragraph({ spacing: { before: 160, after: 80 }, children: runs(titulo[1], { bold: true, color: '333333' }) }));
      continue;
    }
    if (/^\s*\|/.test(linha)) {
      fecharParagrafo();
      tipoLista = null;
      const tabela: string[] = [];
      while (i < linhas.length && /^\s*\|/.test(linhas[i])) tabela.push(linhas[i++]);
      i--;
      blocos.push(tabelaMarkdown(tabela));
      blocos.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
      continue;
    }
    const item = linha.match(/^\s*(?:([-*])|(\d+)\.)\s+(.*)$/);
    if (item) {
      fecharParagrafo();
      const tipo = item[1] ? 'bullet' : 'numero';
      if (tipo === 'numero' && tipoLista !== 'numero') instanciaLista += 1;
      tipoLista = tipo;
      blocos.push(
        new Paragraph({
          spacing: { after: 60, line: 276 },
          numbering: tipo === 'bullet' ? { reference: 'marcadores', level: 0 } : { reference: 'numeros', level: 0, instance: instanciaLista },
          children: runs(item[3])
        })
      );
      continue;
    }
    if (tipoLista && /^\s{2,}\S/.test(linha)) {
      // Continuação de item de lista: anexa ao último parágrafo como novo parágrafo recuado.
      blocos.push(new Paragraph({ indent: { left: 720 }, spacing: { after: 60 }, children: runs(linha.trim()) }));
      continue;
    }
    tipoLista = null;
    paragrafoAtual.push(linha.trim());
  }
  fecharParagrafo();
  return blocos;
}

// ---------------------------------------------------------------------------
// Dados

const consolidacao = existsSync(path.join(DIR, 'validacao_especialista/consolidacao.json')) ? ler('validacao_especialista/consolidacao.json') : null;
const config = ler('config_experimento.json');
const dados = carregarDados();
const porResposta = calcularPorResposta(dados, consolidacao?.vereditos ?? []);
const { perguntas } = ler('perguntas.json');
const { referencias } = ler('referencias.json');
const avaliacoes = readFileSync(path.join(DIR, 'avaliacoes.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const selecao = ler('validacao_especialista/selecao.json');
const parecer = (idExecucao: string) => consolidacao?.vereditos?.find((v: any) => v.id_execucao === idExecucao);
const parecerReferencia = (id: string) => consolidacao?.referencias?.find((r: any) => r.id === id);
const execucao = (id: string) => dados.execucoes.find((e: any) => e.id_execucao === id);
const linha = (id: string) => porResposta.find((l) => l.id_execucao === id)!;
const avaliacao = (codigo: string) => avaliacoes.find((a: any) => a.codigo === codigo);
const selecionada = (idPergunta: string) => selecao.selecionadas.find((s: any) => s.id_pergunta === idPergunta);

const n2 = (x: number | null | undefined) => (x === null || x === undefined ? '—' : x.toFixed(2).replace('.', ','));
const pct = (x: number | null | undefined) => (x === null || x === undefined ? '—' : `${Math.round(x * 100)}%`);
const ROT_ORIGEM: Record<string, string> = { publicada: 'publicada', adaptação: 'adaptação', autoral: 'autoral', 'em decisão': 'em decisão' };
const ROT_ABS: Record<string, string> = {
  nao_se_aplica: 'não se aplica',
  abstencao_correta: 'reconheceu corretamente que os documentos não respondem',
  abstencao_parcial_correta: 'respondeu a parte coberta e declarou o limite',
  abstencao_com_ruido: 'declarou o limite, mas com informação a mais',
  falha_de_abstencao: 'não declarou o limite dos documentos',
  recusa_indevida: 'recusou o que os documentos respondem'
};

const veredito = (l: ReturnType<typeof linha>) => {
  const sinais = [l.SEG >= 1 && 'alerta de segurança', l.ALU && 'alucinação'].filter(Boolean);
  return `${l.correta_automatizada ? 'Correta' : 'Incorreta'} (${n2(l.NG)})${sinais.length ? `; ${sinais.join(', ')}` : ''}`;
};

// ---------------------------------------------------------------------------
// Documento

const filhos: Array<Paragraph | Table> = [];

filhos.push(
  new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 120 }, children: [new TextRun({ text: 'Perguntas e respostas da avaliação experimental', bold: true, size: 40, color: COR_TITULO })] }),
  paragrafo('NexoHansen — assistente de apoio à decisão clínica em hanseníase', { size: 24, color: '555555', depois: 60 }),
  paragrafo(
    `Sistema avaliado: commit ${config.commit.slice(0, 7)}, modelo ${config.modelo.gerador} (raciocínio ${config.modelo.esforco_de_raciocinio}). Respostas geradas em 09/11/2026. ${
      consolidacao ? 'Inclui a revisão da especialista (validação 3).' : 'Resultados preliminares: validações 1 e 2 concluídas; validação 3 (especialista) pendente.'
    }`,
    { size: 20, color: '555555', depois: 240 }
  ),
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Como ler este documento')] }),
  ...[
    'Cada pergunta traz a **resposta de referência**, construída a partir dos documentos oficiais do sistema e congelada antes da leitura das respostas da IA, com os trechos que a sustentam.',
    'Em seguida vêm as **duas respostas da IA** (execuções 1 e 2), reproduzidas na íntegra e sem edição; os números entre colchetes são as citações dos trechos consultados pelo sistema.',
    'Depois de cada resposta, a **avaliação automatizada** (validações 1 e 2, feitas por modelo de linguagem como avaliador, segundo rubrica fixa): veredito, nota global de 0 a 1, cobertura dos pontos-chave e alertas.',
    `Nas ${selecao.perguntas} perguntas selecionadas para a **validação 3**, os campos da especialista aparecem realçados em amarelo até a revisão ser consolidada.`,
    `A pergunta ${EXCLUIDA_DAS_MEDIAS} estava "em decisão" na curadoria e fica fora das médias.`
  ].map((t) => new Paragraph({ numbering: { reference: 'marcadores', level: 0 }, spacing: { after: 60, line: 276 }, children: runs(t) }))
);

// Resumo
const larg = [900, 2500, 2050, 2050, 2138];
filhos.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun('Resumo por pergunta')] }),
  paragrafo('Veredito automatizado de cada execução, com a nota global entre parênteses, e situação da revisão pela especialista.', { size: 20, color: '555555' }),
  new Table({
    width: { size: LARGURA, type: WidthType.DXA },
    columnWidths: larg,
    rows: [
      new TableRow({
        tableHeader: true,
        children: ['Nº', 'Tema', 'Execução 1', 'Execução 2', 'Validação 3'].map((t, j) => celula([new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 18 })] })], larg[j], true))
      }),
      ...perguntas.map((p: any) => {
        const sel = selecionada(p.id);
        const v3 = sel && parecer(sel.id_execucao);
        return new TableRow({
          cantSplit: true,
          children: [
            celula([new Paragraph({ children: [new TextRun({ text: p.id + (p.id === EXCLUIDA_DAS_MEDIAS ? '*' : ''), size: 18 })] })], larg[0]),
            celula([new Paragraph({ children: [new TextRun({ text: p.tema, size: 18 })] })], larg[1]),
            celula([new Paragraph({ children: [new TextRun({ text: veredito(linha(`R1-${p.id}`)), size: 18 })] })], larg[2]),
            celula([new Paragraph({ children: [new TextRun({ text: veredito(linha(`R2-${p.id}`)), size: 18 })] })], larg[3]),
            celula(
              [
                new Paragraph({
                  children: sel
                    ? v3
                      ? [new TextRun({ text: `${v3.veredito} (execução ${sel.id_execucao.slice(1, 2)})`, size: 18 })]
                      : [new TextRun({ text: `A avaliar (execução ${sel.id_execucao.slice(1, 2)})`, size: 18, highlight: 'yellow' })]
                    : [new TextRun({ text: 'Não selecionada', size: 18, color: '777777' })]
                })
              ],
              larg[4]
            )
          ]
        });
      })
    ]
  }),
  paragrafo(`* ${EXCLUIDA_DAS_MEDIAS}: em decisão na curadoria, fora das médias.`, { size: 18, color: '555555', antes: 80 })
);

// Perguntas
for (const p of perguntas) {
  const r = referencias.find((x: any) => x.id === p.id);
  const sel = selecionada(p.id);
  filhos.push(
    new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(`${p.id} · ${p.tema}`)] }),
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: p.pergunta, bold: true, size: 24 })] }),
    paragrafo(
      `Público: ${p.registro} · Origem: ${ROT_ORIGEM[p.origem] ?? p.origem} · Pergunta ${p.composta ? 'composta' : 'simples'} · ${COBERTURA[r.cobertura]}${sel ? ' · Selecionada para a validação 3' : ''}`,
      { size: 18, color: '555555', depois: 160 }
    ),
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Resposta de referência')] }),
    ...r.resposta_referencia.split(/\n+/).map((t: string) => paragrafo(t))
  );
  if (r.pontos_chave.length) {
    filhos.push(paragrafo('**Pontos-chave e trechos dos documentos**', { antes: 80, depois: 60 }));
    instanciaLista += 1;
    for (const pc of r.pontos_chave) {
      filhos.push(
        new Paragraph({
          numbering: { reference: 'numeros', level: 0, instance: instanciaLista },
          spacing: { after: 30, line: 264 },
          children: runs(pc.afirmacao, { size: 20 })
        }),
        new Paragraph({
          indent: { left: 720 },
          spacing: { after: 80, line: 252 },
          children: [new TextRun({ text: `${NOMES_DOCUMENTO[pc.documento] ?? pc.documento}, ${pc.secao_ou_pagina}: “${pc.trecho}”`, size: 17, italics: true, color: '555555' })]
        })
      );
    }
  } else {
    filhos.push(paragrafo('Os documentos não tratam deste assunto.', { size: 20, color: '555555' }));
  }
  if (r.divergencias_entre_documentos) {
    filhos.push(paragrafo(`**Divergência entre documentos:** ${r.divergencias_entre_documentos}`, { size: 18, color: '555555', antes: 60 }));
  }

  for (const rodada of [1, 2]) {
    const id = `R${rodada}-${p.id}`;
    const e = execucao(id);
    const l = linha(id);
    const a = avaliacao(l.codigo);
    filhos.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`Resposta da IA — execução ${rodada}`)] }),
      ...(e.resposta ? markdown(e.resposta) : [paragrafo('(sem resposta: falha técnica)')])
    );
    if (e.fontes_citadas?.length) {
      filhos.push(
        paragrafo(`Fontes citadas pela IA: ${e.fontes_citadas.map((f: any) => `[${f.indice}] ${f.referencia}`).join(' ')}`, { size: 16, color: '666666', antes: 60 })
      );
    }
    const detalhes = [
      `**Avaliação automatizada:** ${veredito(l)}`,
      l.cobertura !== 'nao_respondivel' ? `pontos-chave cobertos: ${pct(l.CPC)}` : null,
      `correção factual: ${l.CF}/2`,
      `abstenção: ${ROT_ABS[l.ABS] ?? l.ABS}`
    ].filter(Boolean);
    const observacoes = [
      a?.CF_justificativa && `Correção factual — ${a.CF_justificativa}`,
      l.SEG >= 1 && a?.SEG_justificativa && `Segurança — ${a.SEG_justificativa}`,
      l.ALU && a?.ALU_justificativa && `Alucinação — ${a.ALU_justificativa}`
    ].filter(Boolean) as string[];
    filhos.push(
      new Paragraph({
        spacing: { before: 120, after: 60 },
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F1F5F6' },
        children: runs(detalhes.join(' · '), { size: 18 })
      }),
      ...observacoes.map(
        (o) => new Paragraph({ spacing: { after: 40 }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F1F5F6' }, children: [new TextRun({ text: o, size: 17, color: '444444' })] })
      )
    );
  }

  if (sel) {
    const v = parecer(sel.id_execucao);
    const ref = parecerReferencia(p.id);
    const linhasV3: Array<[string, string]> = [
      ['Resposta revisada', `execução ${sel.id_execucao.slice(1, 2)}`],
      ['A referência está correta?', ref ? [ref.avaliacao, ref.correcao_sugerida, ref.comentario].filter(Boolean).join(' — ') : ''],
      ['Veredito da resposta da IA', v?.veredito ?? ''],
      ['Risco clínico', v?.risco_clinico ?? ''],
      ['Comentário', v ? v.comentario || '—' : '']
    ];
    filhos.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun('Validação 3 — revisão da especialista')] }),
      new Table({
        width: { size: LARGURA, type: WidthType.DXA },
        columnWidths: [3200, LARGURA - 3200],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' }
        },
        rows: linhasV3.map(([campo, valor], i) => {
          // Mantém o quadro inteiro na mesma página do título.
          const keepNext = i < linhasV3.length - 1;
          return new TableRow({
            cantSplit: true,
            children: [
              celula([new Paragraph({ keepNext, children: [new TextRun({ text: campo, bold: true, size: 18 })] })], 3200, true),
              celula([new Paragraph({ keepNext, children: valor ? [new TextRun({ text: valor, size: 18 })] : [pendente()] })], LARGURA - 3200)
            ]
          });
        })
      })
    );
  }
}

const doc = new Document({
  creator: 'Avaliação da IA do projeto NexoHansen',
  title: 'Perguntas e respostas da avaliação experimental',
  styles: {
    default: { document: { run: { font: 'Arial', size: 20 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, color: COR_TITULO }, paragraph: { spacing: { before: 0, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 23, bold: true, color: COR_TITULO }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } }
    ]
  },
  numbering: {
    config: [
      { reference: 'marcadores', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      { reference: 'numeros', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] }
    ]
  },
  sections: [
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 4 } },
              children: [new TextRun({ text: 'Perguntas e respostas da avaliação · NexoHansen · página ', size: 16, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '777777' })]
            })
          ]
        })
      },
      children: filhos
    }
  ]
});

Packer.toBuffer(doc).then((buf) => {
  writeFileSync(SAIDA, buf);
  console.log(`documento: ${path.relative(process.cwd(), SAIDA)} (${perguntas.length} perguntas, ${selecao.perguntas} na validação 3)`);
});
