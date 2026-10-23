import 'dotenv/config';
import { z } from 'zod';

// Variável numérica opcional: vazia equivale a ausente (e não a zero).
const optionalNumber = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : value),
  z.coerce.number().min(0).max(1).optional()
);

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/hanseniase_rag?schema=public'),
  OPENAI_API_KEY: z.string().optional().default(''),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  CHAT_MODEL: z.string().default('gpt-4o-mini'),
  // Candidatos por lista de busca e trechos enviados ao modelo.
  DEFAULT_TOP_K: z.coerce.number().int().positive().default(20),
  DEFAULT_TOP_N: z.coerce.number().int().positive().default(8),
  // Similaridade de cosseno mínima do melhor trecho para considerar que há evidência. Vazio usa o
  // padrão do provedor: 0,25 com embeddings da OpenAI e 0,08 com os determinísticos locais.
  MIN_VECTOR_SIMILARITY: optionalNumber,
  // Obsoleto: limiar da soma ponderada usada antes da fusão RRF. É lido para não quebrar arquivos
  // .env antigos, mas ignorado.
  MIN_RETRIEVAL_SCORE: optionalNumber,
  // Na Vercel, NODE_ENV não deve ir nas variáveis do projeto: o build passaria a ignorar as
  // devDependencies. A variável VERCEL, definida pela plataforma, indica execução em produção.
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default(process.env.VERCEL ? 'production' : 'development'),
  PORT: z.coerce.number().int().positive().default(3333),
  // Duração da sessão de login, em horas.
  AUTH_SESSION_TTL_HOURS: z.coerce.number().positive().max(720).default(8),
  // Cookie só por HTTPS. Padrão: ligado em produção. Use "false" apenas em ambiente sem TLS.
  AUTH_COOKIE_SECURE: z.enum(['true', 'false']).optional(),
  // Origens autorizadas a chamar a API com cookies, separadas por vírgula. Vazio: mesma origem
  // (proxy do Vite), sem envio de credenciais entre origens.
  CORS_ORIGIN: z.string().optional().default('')
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  AUTH_COOKIE_SECURE: parsed.AUTH_COOKIE_SECURE
    ? parsed.AUTH_COOKIE_SECURE === 'true'
    : parsed.NODE_ENV === 'production'
};
