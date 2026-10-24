import { env } from './env';

export const openAIConfig = {
  apiKey: env.OPENAI_API_KEY,
  embeddingModel: env.EMBEDDING_MODEL,
  chatModel: env.CHAT_MODEL,
  reasoningEffort: env.CHAT_REASONING_EFFORT,
  enabled: Boolean(env.OPENAI_API_KEY)
};
