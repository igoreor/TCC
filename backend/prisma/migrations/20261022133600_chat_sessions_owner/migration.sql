-- Dono de cada conversa. Fica nulo apenas nas conversas criadas antes da autenticação.

-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "user_id" UUID;

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
