import { env } from './env';

export const openAIConfig = {
  apiKey: env.OPENAI_API_KEY,
  embeddingModel: env.EMBEDDING_MODEL,
  chatModel: env.CHAT_MODEL,
  enabled: Boolean(env.OPENAI_API_KEY)
};
