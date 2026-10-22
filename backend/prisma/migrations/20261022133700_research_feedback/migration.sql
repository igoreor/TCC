-- Avaliação das respostas da IA para a pesquisa: nota de 0 a 10 vinculada ao usuário, à conversa
-- e à resposta avaliada.
--
-- As avaliações antigas (escala de 1 a 5, sem usuário nem conversa) não são compatíveis com a
-- nova base. Em vez de apagá-las ou misturá-las aos novos registros, a migração é interrompida
-- se existir alguma.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "feedback") THEN
    RAISE EXCEPTION 'A tabela feedback contém avaliações do formato antigo (escala de 1 a 5, sem usuário). Exporte-as e remova-as antes de aplicar esta migração.';
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_message_id_fkey";

-- DropIndex
DROP INDEX "feedback_message_id_idx";

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "reviewed_by_specialist",
ADD COLUMN     "session_id" UUID NOT NULL,
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "message_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "chat_messages_id_session_id_key" ON "chat_messages"("id", "session_id");

-- CreateIndex
CREATE INDEX "feedback_session_id_idx" ON "feedback"("session_id");

-- CreateIndex
CREATE INDEX "feedback_user_id_idx" ON "feedback"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_message_id_user_id_key" ON "feedback"("message_id", "user_id");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_message_id_session_id_fkey" FOREIGN KEY ("message_id", "session_id") REFERENCES "chat_messages"("id", "session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Restrições que o schema do Prisma não representa. O Prisma não as remove em migrações futuras.
-- Repetem no banco a validação da API.
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_rating_range" CHECK ("rating" BETWEEN 0 AND 10);
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_comment_length" CHECK ("comment" IS NULL OR char_length("comment") BETWEEN 1 AND 1000);
