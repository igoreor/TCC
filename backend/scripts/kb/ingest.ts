// Indexa no banco (DATABASE_URL) os documentos oficiais do manifesto, a partir dos trechos
// processados em knowledge-base/processed.
//
// Uso: npm run kb:ingest [-- --only <documentId>]
// Os embeddings usam o provedor configurado: com OPENAI_API_KEY, o modelo da OpenAI; sem ela, o
// determinístico local. O banco de produção deve ser indexado com o mesmo provedor da API.
// Trechos sem mudança (mesmo texto e mesmo modelo) não geram embedding de novo.
import { prisma } from '../../src/config/database';
import { createServices } from '../../src/services';

async function main() {
  const onlyIndex = process.argv.indexOf('--only');
  const only = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : undefined;
  const { knowledgeService, embeddingsService } = createServices();

  console.log(
    `Modelo de embeddings: ${embeddingsService.modelId}${embeddingsService.semantic ? '' : ' (local, sem semântica)'}`
  );
  const results = await knowledgeService.ingestOfficialDocuments({ only });
  for (const result of results) {
    console.log(
      `${result.documentId}: ${result.total} trechos (${result.embedded} com embedding novo, ` +
        `${result.unchanged} sem mudança, ${result.removed} removidos)`
    );
  }
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await prisma.$disconnect();
  process.exit(1);
});
