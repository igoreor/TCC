// Validação 3: lê a ficha preenchida pela especialista, calcula a concordância entre a validação 2
// (avaliação automatizada) e a validação 3 (kappa de Cohen ponderado e % de concordância), aplica o
// parecer dela como veredito final nas respostas revisadas, registra as referências corrigidas e
// recalcula métricas, tabelas e gráficos.
// Uso: npx tsx avaliacao/validacao_especialista/consolidar.ts [caminho da ficha preenchida]
import ExcelJS from 'exceljs';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { kappaPonderado } from '../estatistica';
import { calcularPorResposta, carregarDados, gravarResultados, VereditoEspecialista } from '../metricas';

const PASTA = __dirname;
const CATEGORIAS = ['incorreta', 'parcialmente correta', 'correta'] as const;
const texto = (v: ExcelJS.CellValue) => (v === null || v === undefined ? '' : String((v as any).text ?? v).trim().toLowerCase());

async function main() {
  const arquivo = process.argv[2] ?? path.join(PASTA, 'ficha_pesquisadora.xlsx');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(arquivo);

  // Referências revisadas
  const refs: Array<{ id: string; avaliacao: string; correcao: string; comentario: string }> = [];
  wb.getWorksheet('Referências')!.eachRow((row, n) => {
    if (n === 1) return;
    refs.push({ id: texto(row.getCell(1).value).toUpperCase(), avaliacao: texto(row.getCell(8).value), correcao: String(row.getCell(9).value ?? ''), comentario: String(row.getCell(10).value ?? '') });
  });
  const revisadas = refs.filter((r) => r.avaliacao);
  const corrigidas = revisadas.filter((r) => r.avaliacao !== 'sim');
  writeFileSync(
    path.join(PASTA, '..', 'referencias_erratas_especialista.json'),
    JSON.stringify(corrigidas.map((r) => ({ id: r.id, avaliacao_da_especialista: r.avaliacao, correcao_sugerida: r.correcao, comentario: r.comentario })), null, 2) + '\n'
  );

  // Vereditos das respostas da IA
  const vereditos: VereditoEspecialista[] = [];
  wb.getWorksheet('Respostas da IA')!.eachRow((row, n) => {
    if (n === 1) return;
    const veredito = texto(row.getCell(7).value);
    if (!CATEGORIAS.includes(veredito as any)) return;
    vereditos.push({ id_execucao: texto(row.getCell(1).value).toUpperCase(), veredito: veredito as VereditoEspecialista['veredito'], risco_clinico: texto(row.getCell(8).value) });
  });

  // Veredito automatizado em três níveis: correta; parcialmente correta quando incorreta com NG ≥ 0,5; incorreta.
  const dados = carregarDados();
  const automatizado = calcularPorResposta(dados);
  const nivelAuto = (id: string) => {
    const l = automatizado.find((x) => x.id_execucao === id)!;
    return l.correta_automatizada ? 2 : l.NG >= 0.5 ? 1 : 0;
  };
  const a = vereditos.map((v) => nivelAuto(v.id_execucao));
  const b = vereditos.map((v) => CATEGORIAS.indexOf(v.veredito));
  const concordancia = vereditos.length ? a.filter((x, i) => x === b[i]).length / vereditos.length : null;
  const binA = a.map((x) => (x === 2 ? 1 : 0));
  const binB = b.map((x) => (x === 2 ? 1 : 0));
  const alterados = vereditos.filter((_, i) => binA[i] !== binB[i]);

  const { resumo } = gravarResultados(vereditos);
  const consolidacao = {
    consolidado_em: new Date().toISOString(),
    ficha: path.basename(arquivo),
    referencias_revisadas: revisadas.length,
    referencias_corrigidas: corrigidas.length,
    referencias_parcialmente_corretas: corrigidas.filter((r) => r.avaliacao === 'parcialmente').length,
    referencias_incorretas: corrigidas.filter((r) => r.avaliacao === 'não' || r.avaliacao === 'nao').length,
    respostas_revisadas: vereditos.length,
    kappa_ponderado_linear: kappaPonderado(a, b, 3, 'linear'),
    concordancia_percentual: concordancia,
    vereditos_binarios_alterados: alterados.length,
    automatizada_mais_branda: vereditos.filter((_, i) => binA[i] === 1 && binB[i] === 0).length,
    automatizada_mais_rigida: vereditos.filter((_, i) => binA[i] === 0 && binB[i] === 1).length,
    risco_clinico_alto: vereditos.filter((v) => v.risco_clinico === 'alto').length,
    matriz_3x3: CATEGORIAS.map((_, i) => CATEGORIAS.map((__, j) => a.filter((x, k) => x === i && b[k] === j).length)),
    metricas_finais: { acuracia: resumo.geral.acuracia, ic95: [resumo.geral.ic95_inferior, resumo.geral.ic95_superior] },
    observacao:
      'Referências marcadas como incorretas devem ter as respostas da IA da pergunta reavaliadas com a correção (regra 2.4 do protocolo); registrar a reavaliação em DIARIO.md.'
  };
  writeFileSync(path.join(PASTA, 'consolidacao.json'), JSON.stringify(consolidacao, null, 2) + '\n');
  console.log(JSON.stringify(consolidacao, null, 2));
  console.log('Regenere os gráficos e o relatório (em backend/): npx tsx ../avaliacao/graficos.ts && npx tsx ../avaliacao/relatorio.ts');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
