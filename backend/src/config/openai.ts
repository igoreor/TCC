import { DEFAULT_CHAT_MODEL, env } from './env';

export const openAIConfig = {
  apiKey: env.OPENAI_API_KEY,
  embeddingModel: env.EMBEDDING_MODEL,
  chatModel: env.CHAT_MODEL,
  reasoningEffort:
    env.CHAT_REASONING_EFFORT ?? (env.CHAT_MODEL === DEFAULT_CHAT_MODEL ? 'none' : undefined),
  enabled: Boolean(env.OPENAI_API_KEY)
};
