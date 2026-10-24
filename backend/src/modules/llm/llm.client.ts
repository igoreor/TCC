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

export type ReasoningEffort = 'none' | 'minimal' | 'low' | 'medium' | 'high';

// Modelos de raciocínio (o1/o3/o4, GPT-5 e GPT-6) recusam "max_tokens" e só aceitam temperatura
// diferente de 1 com o raciocínio desligado ("reasoning_effort": "none").
const REASONING_MODEL = /^(o\d|gpt-5|gpt-6)/;
// O limite de "max_completion_tokens" inclui os tokens de raciocínio: sem folga, o modelo pode
// gastar o limite raciocinando e devolver o texto vazio.
const REASONING_TOKEN_ALLOWANCE = 4000;

export function chatCompletionParameters(
  model: string,
  input: { temperature?: number; maxTokens?: number },
  reasoningEffort?: ReasoningEffort
) {
  if (!REASONING_MODEL.test(model)) {
    return { temperature: input.temperature ?? 0.1, max_completion_tokens: input.maxTokens };
  }
  const reasoningOff = reasoningEffort === 'none';
  return {
    ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
    ...(reasoningOff ? { temperature: input.temperature ?? 0.1 } : {}),
    max_completion_tokens:
      input.maxTokens === undefined || reasoningOff
        ? input.maxTokens
        : input.maxTokens + REASONING_TOKEN_ALLOWANCE
  };
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
        ...chatCompletionParameters(this.model, input, openAIConfig.reasoningEffort),
        messages: input.messages,
        ...(input.json ? { response_format: { type: 'json_object' } } : {})
      }),
      signal: AbortSignal.timeout(input.timeoutMs ?? 60_000)
    });

    if (!response.ok) {
      // A mensagem da OpenAI diz qual parâmetro ou modelo foi recusado; não contém a chave.
      const detail = await response.text().catch(() => '');
      throw new Error(`Falha na OpenAI: ${response.status} ${detail.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      choices: Array<{ message: { content: string | null }; finish_reason?: string }>;
    };
    const content = payload.choices[0]?.message.content ?? '';
    if (!content.trim()) {
      throw new Error(
        `Resposta vazia da OpenAI (${payload.choices[0]?.finish_reason ?? 'sem motivo'})`
      );
    }
    return content;
  }
}

/** Sem chave (ou em teste), o sistema usa as alternativas locais: análise heurística e resposta extrativa. */
export function createLlmClient(): LlmClient | null {
  if (openAIConfig.enabled && process.env.NODE_ENV !== 'test') {
    return new OpenAIChatClient();
  }
  return null;
}
