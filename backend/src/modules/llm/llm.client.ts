import { openAIConfig } from '../../config/openai';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmClient {
  readonly model: string;
  complete(input: {
    messages: LlmMessage[];
    temperature?: number;
    maxTokens?: number;
    json?: boolean;
    timeoutMs?: number;
  }): Promise<string>;
}

export class OpenAIChatClient implements LlmClient {
  readonly model = openAIConfig.chatModel;

  async complete(input: {
    messages: LlmMessage[];
    temperature?: number;
    maxTokens?: number;
    json?: boolean;
    timeoutMs?: number;
  }) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        temperature: input.temperature ?? 0.1,
        max_tokens: input.maxTokens,
        messages: input.messages,
        ...(input.json ? { response_format: { type: 'json_object' } } : {})
      }),
      signal: AbortSignal.timeout(input.timeoutMs ?? 60_000)
    });

    if (!response.ok) {
      throw new Error(`Falha na OpenAI: ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices: Array<{ message: { content: string | null } }>;
    };
    return payload.choices[0]?.message.content ?? '';
  }
}

/** Sem chave (ou em teste), o sistema usa as alternativas locais: análise heurística e resposta extrativa. */
export function createLlmClient(): LlmClient | null {
  if (openAIConfig.enabled && process.env.NODE_ENV !== 'test') {
    return new OpenAIChatClient();
  }
  return null;
}
