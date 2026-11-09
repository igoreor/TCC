// Fase 6: gráficos em PNG (300 dpi, 16 cm de largura, rótulos em português) a partir de
// resultados/metricas.json e, se houver, de validacao_especialista/consolidacao.json.
// Uso: npx tsx avaliacao/graficos.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { chromium } from 'playwright-core';

const CHROMIUM = 'C:/Users/IGOR/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const PASTA = path.join(__dirname, 'resultados', 'graficos');
const LARGURA = 800; // px lógicos; 800 × 2,3622 ≈ 1890 px = 16 cm a 300 dpi
const ESCALA = 1890 / LARGURA;
const COR = '#0e5c66';
const COR2 = '#8a5410';
const fmt = (x: number, casas = 2) => x.toFixed(casas).replace('.', ',');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const resumo = JSON.parse(readFileSync(path.join(__dirname, 'resultados', 'metricas.json'), 'utf8'));
const consolidacaoArq = path.join(__dirname, 'validacao_especialista', 'consolidacao.json');
const consolidacao = existsSync(consolidacaoArq) ? JSON.parse(readFileSync(consolidacaoArq, 'utf8')) : null;
const sufixo = consolidacao ? '' : ' (resultados preliminares)';

/** Barras horizontais de acurácia com IC de 95% de Wilson. */
function barrasAcuracia(titulo: string, grupos: Record<string, any>, rotulos: Record<string, string> = {}) {
  const entradas = Object.entries(grupos);
  const esquerda = 230;
  const largura = LARGURA - esquerda - 60;
  const altura = 70 + entradas.length * 34 + 50;
  const x = (v: number) => esquerda + v * largura;
  let svg = `<text x="${LARGURA / 2}" y="28" text-anchor="middle" font-size="17" font-weight="bold">${esc(titulo)}${sufixo}</text>`;
  for (let t = 0; t <= 1.0001; t += 0.25) {
    svg += `<line x1="${x(t)}" y1="50" x2="${x(t)}" y2="${altura - 45}" stroke="#ddd"/><text x="${x(t)}" y="${altura - 25}" text-anchor="middle" font-size="12">${fmt(t * 100, 0)}%</text>`;
  }
  entradas.forEach(([nome, g], i) => {
    const y = 60 + i * 34;
    svg += `<text x="${esquerda - 10}" y="${y + 16}" text-anchor="end" font-size="13">${esc(rotulos[nome] ?? nome)} (n = ${g.n})</text>`;
    svg += `<rect x="${esquerda}" y="${y + 4}" width="${g.acuracia * largura}" height="18" fill="${COR}"/>`;
    svg += `<line x1="${x(g.ic95_inferior)}" y1="${y + 13}" x2="${x(g.ic95_superior)}" y2="${y + 13}" stroke="#111" stroke-width="1.5"/>`;
    svg += `<line x1="${x(g.ic95_inferior)}" y1="${y + 7}" x2="${x(g.ic95_inferior)}" y2="${y + 19}" stroke="#111"/><line x1="${x(g.ic95_superior)}" y1="${y + 7}" x2="${x(g.ic95_superior)}" y2="${y + 19}" stroke="#111"/>`;
    svg += `<text x="${x(g.ic95_superior) + 6}" y="${y + 17}" font-size="12">${fmt(g.acuracia * 100, 0)}%</text>`;
  });
  svg += `<text x="${LARGURA / 2}" y="${altura - 6}" text-anchor="middle" font-size="12">Acurácia (barra) e intervalo de confiança de 95% de Wilson (linha)</text>`;
  return { svg, altura };
}

function matriz(titulo: string, linhas: string[], colunas: string[], valores: number[][], eixoL: string, eixoC: string) {
  const esquerda = 300;
  const topo = 90;
  const lado = 120;
  const altura = topo + linhas.length * lado + 60;
  const max = Math.max(1, ...valores.flat());
  let svg = `<text x="${LARGURA / 2}" y="28" text-anchor="middle" font-size="17" font-weight="bold">${esc(titulo)}${sufixo}</text>`;
  svg += `<text x="${esquerda + (colunas.length * lado) / 2}" y="${topo - 40}" text-anchor="middle" font-size="13" font-weight="bold">${esc(eixoC)}</text>`;
  colunas.forEach((c, j) => (svg += `<text x="${esquerda + j * lado + lado / 2}" y="${topo - 12}" text-anchor="middle" font-size="12">${esc(c)}</text>`));
  svg += `<text x="20" y="${topo - 12}" font-size="13" font-weight="bold">${esc(eixoL)}</text>`;
  linhas.forEach((l, i) => {
    svg += `<text x="${esquerda - 12}" y="${topo + i * lado + lado / 2 + 5}" text-anchor="end" font-size="12">${esc(l)}</text>`;
    colunas.forEach((_, j) => {
      const v = valores[i][j];
      const intens = v / max;
      svg += `<rect x="${esquerda + j * lado}" y="${topo + i * lado}" width="${lado}" height="${lado}" fill="${COR}" fill-opacity="${0.12 + intens * 0.78}" stroke="#fff" stroke-width="2"/>`;
      svg += `<text x="${esquerda + j * lado + lado / 2}" y="${topo + i * lado + lado / 2 + 8}" text-anchor="middle" font-size="24" fill="${intens > 0.5 ? '#fff' : '#111'}">${v}</text>`;
    });
  });
  return { svg, altura };
}

function consistencia() {
  const c = resumo.consistencia;
  const partes = [
    ['Correta nas duas execuções', c.correta_nas_duas, COR],
    ['Correta em apenas uma', c.pass_at_2 - c.correta_nas_duas, COR2],
    ['Correta em nenhuma', c.correta_em_nenhuma, '#9ca3af']
  ] as const;
  const esquerda = 40;
  const largura = LARGURA - 80;
  let x = esquerda;
  let svg = `<text x="${LARGURA / 2}" y="28" text-anchor="middle" font-size="17" font-weight="bold">Consistência entre as duas execuções (${c.perguntas} perguntas)${sufixo}</text>`;
  partes.forEach(([rotulo, valor, cor], i) => {
    const w = valor * largura;
    svg += `<rect x="${x}" y="60" width="${w}" height="50" fill="${cor}"/>`;
    if (w > 40) svg += `<text x="${x + w / 2}" y="91" text-anchor="middle" font-size="15" fill="#fff">${fmt(valor * 100, 0)}%</text>`;
    svg += `<rect x="${esquerda + i * 250}" y="135" width="16" height="16" fill="${cor}"/><text x="${esquerda + i * 250 + 22}" y="148" font-size="13">${rotulo} (${Math.round(valor * c.perguntas)})</text>`;
    x += w;
  });
  svg += `<text x="${esquerda}" y="185" font-size="13">Veredito estável: ${fmt(c.veredito_estavel * 100, 0)}%; |NG₁ − NG₂| médio: ${fmt(c.dif_ng_media)}; similaridade de cosseno média: ${fmt(c.similaridade_media)}; contradições entre execuções: ${c.contradicoes}.</text>`;
  return { svg, altura: 205 };
}

/** Acrescenta o bloco pHYs (resolução de 300 dpi) ao PNG. */
function com300dpi(png: Buffer) {
  const crcTabela = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTabela[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const dados = Buffer.alloc(9);
  dados.writeUInt32BE(11811, 0);
  dados.writeUInt32BE(11811, 4);
  dados.writeUInt8(1, 8);
  const tipoDados = Buffer.concat([Buffer.from('pHYs'), dados]);
  const bloco = Buffer.alloc(4 + tipoDados.length + 4);
  bloco.writeUInt32BE(9, 0);
  tipoDados.copy(bloco, 4);
  bloco.writeUInt32BE(crc(tipoDados), 4 + tipoDados.length);
  const fimIHDR = 8 + 4 + 4 + 13 + 4;
  void deflateSync;
  return Buffer.concat([png.subarray(0, fimIHDR), bloco, png.subarray(fimIHDR)]);
}

async function main() {
  mkdirSync(PASTA, { recursive: true });
  const r = resumo.recortes;
  const graficos: Array<[string, { svg: string; altura: number }]> = [
    ['acuracia_por_tema', barrasAcuracia('Acurácia por tema', r.tema)],
    ['acuracia_por_registro', barrasAcuracia('Acurácia por registro da pergunta', r.registro, { leigo: 'Leigo', técnico: 'Técnico' })],
    ['acuracia_por_origem', barrasAcuracia('Acurácia por origem da pergunta', r.origem, { publicada: 'Publicada', adaptação: 'Adaptação', autoral: 'Autoral' })],
    ['acuracia_por_cobertura', barrasAcuracia('Acurácia por cobertura do corpus', r.cobertura, { integral: 'Integral', parcial: 'Parcial', nao_respondivel: 'Não respondível' })],
    [
      'matriz_abstencao',
      matriz(
        'Matriz de abstenção (respostas)',
        ['Deveria se abster (parcial ou não respondível)', 'Não deveria (integral)'],
        ['Absteve-se', 'Não se absteve'],
        [
          [resumo.abstencao.matriz.deveria_e_absteve, resumo.abstencao.matriz.deveria_e_nao_absteve],
          [resumo.abstencao.matriz.nao_deveria_e_absteve, resumo.abstencao.matriz.nao_deveria_e_nao_absteve]
        ],
        'Cobertura da referência',
        'Comportamento da IA'
      )
    ],
    ['consistencia_entre_rodadas', consistencia()]
  ];
  if (consolidacao) {
    graficos.push([
      'concordancia_v2_v3',
      matriz(
        `Concordância validação 2 × validação 3 (κ = ${fmt(consolidacao.kappa_ponderado_linear)})`,
        ['Incorreta', 'Parcialmente correta', 'Correta'],
        ['Incorreta', 'Parcial', 'Correta'],
        consolidacao.matriz_3x3,
        'Validação 2 (automatizada)',
        'Validação 3 (especialista)'
      )
    ]);
  }
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  for (const [nome, { svg, altura }] of graficos) {
    const page = await browser.newPage({ viewport: { width: LARGURA, height: altura }, deviceScaleFactor: ESCALA });
    await page.setContent(
      `<html><body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${altura}" font-family="Arial, Helvetica, sans-serif" fill="#111">${svg}</svg></body></html>`
    );
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: LARGURA, height: altura } });
    writeFileSync(path.join(PASTA, `${nome}.png`), com300dpi(png));
    await page.close();
    console.log(`${nome}.png`);
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
