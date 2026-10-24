// Recalcula o comportamento esperado e o resumo de relatórios já gravados, a partir das respostas
// registradas, depois de uma mudança nos critérios de pontuação que não exige nova execução (por
// exemplo, no reconhecimento das respostas que declaram a lacuna da base).
//
// Uso: npm run eval:rescore -- <arquivo.json> [<arquivo.json> ...]
import { readFile, writeFile } from 'node:fs/promises';
import { CaseScore, declaresGap, summarize } from '../../src/modules/evaluation/golden-evaluation';

type StoredCase = CaseScore & { answer: string };

async function main() {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error('Informe ao menos um relatório.');

  for (const file of files) {
    const report = JSON.parse(await readFile(file, 'utf8')) as {
      summary: ReturnType<typeof summarize>;
      cases: StoredCase[];
      rescoredAt?: string;
    };
    const changed: string[] = [];
    for (const item of report.cases) {
      if (item.expected !== 'informar_lacuna') continue;
      const correct = item.behaviour === 'recusou' || declaresGap(item.answer);
      if (correct !== item.correctBehaviour) changed.push(item.id);
      item.correctBehaviour = correct;
    }
    report.summary = summarize(report.cases);
    report.rescoredAt = new Date().toISOString();
    await writeFile(file, JSON.stringify(report, null, 2) + '\n');
    console.log(
      `${file}: comportamento ${report.summary.overall.correctBehaviour}` +
        (changed.length ? ` (alterados: ${changed.join(', ')})` : '')
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
