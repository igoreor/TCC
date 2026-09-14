import { createServices } from '../src/services';

async function main() {
  const { knowledgeService, evaluationService } = createServices();
  const knowledge = await knowledgeService.seedFromDefaultFile();
  const evaluation = await evaluationService.seedDefaultQuestions();

  console.log(`Seed de chunks: ${knowledge.inserted + knowledge.updated} registros processados.`);
  console.log(`Seed de avaliacao: ${evaluation.created} perguntas criadas.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
