# Deploy do NexoHansen na Vercel

O sistema vai para a Vercel como **dois projetos criados a partir do mesmo repositório**, com um banco PostgreSQL com pgvector na **Neon** (integração da própria Vercel):

```text
navegador ──► nexohansen.vercel.app        (projeto "nexohansen": pasta frontend, site Vite)
                 │  /api/*  e  /health  (rewrite: a Vercel repassa ao backend)
                 ▼
              nexohansen-api.vercel.app    (projeto "nexohansen-api": pasta backend, Express como função)
                 │
                 ▼
              Neon                         (PostgreSQL 16 com pgvector)
```

O site repassa `/api` ao backend pela mesma origem, como o proxy do Vite faz em desenvolvimento. Assim o cookie de sessão (HttpOnly, SameSite=Lax) funciona sem CORS e sem configurar domínios de cookie. Os nomes `nexohansen` e `nexohansen-api` são sugestões; se já estiverem em uso, a Vercel acrescenta um sufixo à URL. Anote as URLs que ela gerar.

O repositório já traz o que a Vercel precisa:

- `backend/index.ts`: entrada da API, onde o app Express vira uma Vercel Function;
- `backend/package.json`: `postinstall` com `prisma generate`, para o cliente do Prisma ser gerado no build;
- `frontend/vercel.json`: repasse de `/api` e `/health` ao backend e retorno de `index.html` para as rotas do React.

## Antes de começar

- Conta na Vercel ligada ao seu GitHub (o plano Hobby atende a um TCC).
- O código no branch `main` do GitHub: faça o merge do pull request antes.
- O backend rodando localmente, com `npm install` feito em `backend/`, porque alguns passos usam os scripts do projeto.

## 1. Criar o projeto da API

1. Em <https://vercel.com/new>, importe o repositório `igoreor/TCC`.
2. Em **Project Name**, use `nexohansen-api`.
3. Em **Root Directory**, clique em **Edit** e escolha `backend`.
4. Confira se o **Framework Preset** ficou como **Express** (detectado automaticamente). Não altere os comandos de build nem a pasta de saída.
5. Clique em **Deploy**. O primeiro deploy sobe sem banco; o próximo passo conecta o banco.
6. Anote a URL de produção (por exemplo, `https://nexohansen-api.vercel.app`).

## 2. Criar o banco na Neon e ligar à API

1. No projeto `nexohansen-api`, abra **Storage** › **Create Database** › **Neon** (Serverless Postgres).
2. Escolha o plano gratuito e uma região. As funções da Vercel rodam por padrão em Washington, D.C. (`iad1`), então `US East` mantém banco e API próximos. Se escolher outra região, ajuste também a região das funções em **Settings › Functions** para a mesma.
3. Conecte o banco ao projeto `nexohansen-api` (ambientes **Production** e **Preview**). A integração cria as variáveis `DATABASE_URL`, com conexão via pooler (usada pela API), e `DATABASE_URL_UNPOOLED`, com conexão direta (usada nas migrations).

O pgvector e o pgcrypto, que as migrations ativam, são suportados pela Neon.

## 3. Variáveis de ambiente da API

Em **Settings › Environment Variables** do projeto `nexohansen-api`:

| Variável | Valor | Observação |
|---|---|---|
| `DATABASE_URL` | já criada pela Neon | não altere |
| `OPENAI_API_KEY` | sua chave | opcional; sem ela, embeddings determinísticos e resposta extrativa |
| `AUTH_SESSION_TTL_HOURS` | `8` | opcional; duração do login em horas |
| `MIN_RETRIEVAL_SCORE` | `0.65` | opcional; ajuste ao valor calibrado na avaliação técnica |

Não defina:

- **`NODE_ENV`:** nas variáveis do projeto, ele faz o `npm install` do build pular as `devDependencies` (TypeScript e Prisma), e o build falha. Na Vercel, a API já se considera em produção: cookie `Secure` e detalhes de erro ocultos.
- **`CORS_ORIGIN`:** o site fala com a API pela mesma origem.

Depois de salvar, vá em **Deployments**, abra o último deploy e use **Redeploy** para a API passar a usar as variáveis.

## 4. Preparar o banco (uma vez, pelo seu computador)

Copie a conexão **direta** do banco: em **Storage** › seu banco › **.env.local**, pegue o valor de `DATABASE_URL_UNPOOLED`. O endereço dela não tem `-pooler`. Depois, no PowerShell, dentro de `backend/`:

```powershell
$env:DATABASE_URL = "postgresql://...cole a conexão direta aqui...?sslmode=require"

# Cria as tabelas, os índices e as restrições
npm run prisma:deploy

# Se a API usar OpenAI em produção, defina a MESMA chave antes do seed
$env:OPENAI_API_KEY = "sk-..."

# Carrega os 15 trechos da base e as 25 perguntas de referência
npm run prisma:seed

# Limpa as variáveis desta janela, para não apontar o desenvolvimento local para o banco de produção
Remove-Item Env:DATABASE_URL, Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
```

> **Importante:** o seed calcula os embeddings com o provedor disponível no momento em que roda. Se a API em produção usa `OPENAI_API_KEY`, o seed precisa rodar com a mesma chave; se não usa, rode o seed sem ela. Misturar os dois provedores torna a busca vetorial sem sentido.

## 5. Cadastrar os usuários de produção

1. Gere o hash da senha no seu computador, em `backend/` (a senha é pedida sem aparecer na tela):

   ```powershell
   npm run auth:hash-password -- --username maria.silva
   ```

2. No console da Neon (link em **Storage** › seu banco › **Open in Neon**), abra o **SQL Editor** e execute o `INSERT` impresso pelo script.

Para desativar um acesso, execute `UPDATE users SET active = false WHERE username = 'maria.silva';`.

## 6. Conferir a API

```powershell
curl https://nexohansen-api.vercel.app/health
# esperado: {"api":"ok","database":"ok","vectorStore":"ok"}

curl https://nexohansen-api.vercel.app/api/auth/me
# esperado: {"message":"Não autenticado."}
```

## 7. Criar o projeto do site

1. Em `frontend/vercel.json`, troque `SEU-BACKEND` pelo endereço da API do passo 1, nas duas linhas de `destination`:

   ```json
   { "source": "/api/:path*", "destination": "https://nexohansen-api.vercel.app/api/:path*" },
   { "source": "/health", "destination": "https://nexohansen-api.vercel.app/health" },
   ```

2. Faça o commit e envie para o `main`:

   ```powershell
   git add frontend/vercel.json
   git commit -m "chore(deploy): aponta o frontend para a API na Vercel"
   git push
   ```

3. Em <https://vercel.com/new>, importe de novo o repositório `igoreor/TCC`.
4. Em **Project Name**, use `nexohansen`. Em **Root Directory**, escolha `frontend`. O **Framework Preset** deve aparecer como **Vite**.
5. Não crie variáveis de ambiente: `VITE_API_BASE_URL` deve ficar vazia.
6. Clique em **Deploy** e abra `https://nexohansen.vercel.app`.

Para testar, clique em **Entrar**, faça o login, abra a consulta, envie uma pergunta e avalie a resposta. Recarregue a página em `/dashboard/chat` para confirmar que as rotas do React funcionam.

## Atualizações depois do primeiro deploy

- **Produção:** cada push no `main` gera novo deploy nos dois projetos.
- **Previews:** branches e pull requests geram deploys de preview. O preview do site também chama a API de **produção**, porque o endereço está fixo no `vercel.json`.
- **Evitar builds desnecessários:** em cada projeto, **Settings › Build and Deployment › Root Directory**, ative a opção que pula o deploy quando não há mudanças na pasta do projeto.
- **Migrations novas:** rode `npm run prisma:deploy` com a conexão direta (passo 4) antes de publicar o código que depende delas.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `/health` responde `"database":"error"` | `DATABASE_URL` ausente ou errada na API, ou deploy feito antes de conectar o banco (use **Redeploy**) |
| Build falha com `prisma: not found` ou `tsc: not found` | `NODE_ENV` foi definido nas variáveis do projeto; remova-o e faça **Redeploy** |
| Erro 500 com `@prisma/client did not initialize` | o build não gerou o cliente; confira o `postinstall` no `backend/package.json` e faça **Redeploy** sem cache |
| `prepared statement "s0" already exists` | acrescente `&pgbouncer=true` ao fim da `DATABASE_URL` da API |
| O login funciona, mas a tela volta para o login | o site não está usando o repasse de `/api`: confira o endereço no `frontend/vercel.json` e se `VITE_API_BASE_URL` está vazia |
| 404 ao recarregar uma página como `/comparacao` | falta a última regra (`/(.*)` → `/index.html`) do `frontend/vercel.json` |
| A busca não encontra os trechos esperados | o seed e a API usam provedores de embedding diferentes (veja o aviso do passo 4) |

## Limites desta configuração

- **Duração das funções:** no plano Hobby, cada requisição pode durar até 5 minutos. A execução da avaliação técnica (25 perguntas) precisa caber nesse tempo.
- **Limite de tentativas de login:** fica em memória de cada instância da função, então protege menos do que em um servidor único.
- **Acesso:** todos os usuários cadastrados acessam também o painel interno (`/dashboard`) e as rotas de seed e de avaliação. Cadastre apenas quem deve ter esse acesso.
- **Dados:** as perguntas, as respostas e as avaliações dos participantes ficam no banco da Neon, por padrão nos Estados Unidos. Registre isso no protocolo da pesquisa e no TCLE, por se tratar de transferência internacional de dados (LGPD).
