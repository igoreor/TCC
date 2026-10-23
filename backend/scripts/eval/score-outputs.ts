// Pontua respostas gravadas por outra versão do sistema (linha de base) com o avaliador atual.
//
// Uso: npx tsx scripts/eval/score-outputs.ts <respostas.json> <rótulo> [descrição da configuração]
// O arquivo de respostas é uma lista de { id, answer, fallbackTriggered, reason, context, cited }.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  CaseOutput,
  loadGoldenSet,
  scoreCase,
  summarize
} from '../../src/modules/evaluation/golden-evaluation';
import { KNOWLEDGE_BASE_DIR } from '../../src/modules/knowledge/document-manifest';

async function main() {
  const [file, label, description] = process.argv.slice(2);
  if (!file || !label)
    throw new Error('Uso: score-outputs.ts <respostas.json> <rótulo> [descrição]');

  const golden = await loadGoldenSet();
  const outputs = JSON.parse(await readFile(file, 'utf8')) as Array<CaseOutput & { id: string }>;
  const cases = golden.questions.map((question) => {
    const output = outputs.find((item) => item.id === question.id);
    if (!output) throw new Error(`sem resposta para ${question.id}`);
    return { ...scoreCase(question, output), answer: output.answer };
  });
  const summary = summarize(cases);

  const target = path.join(
    KNOWLEDGE_BASE_DIR,
    'evaluation',
    'results',
    `${new Date().toISOString().slice(0, 10)}-${label}.json`
  );
  await writeFile(
    target,
    JSON.stringify(
      { configuration: { label, description: description ?? null }, summary, cases },
      null,
      2
    ) + '\n'
  );
  console.log(JSON.stringify(summary.overall, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
