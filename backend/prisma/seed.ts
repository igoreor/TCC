import { createServices } from '../src/services';

async function main() {
  const { knowledgeService, evaluationService } = createServices();
  const knowledge = await knowledgeService.seedFromDefaultFile();
  const evaluation = await evaluationService.seedDefaultQuestions();

  console.log(`Base oficial: ${knowledge.total} trechos em ${knowledge.documents.length} documentos (${knowledge.inserted} com embedding novo).`);
  console.log(`Conjunto de referência: ${evaluation.created} perguntas criadas, ${evaluation.removed} substituídas.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
