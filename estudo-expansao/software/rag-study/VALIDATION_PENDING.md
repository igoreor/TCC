# Validação

## Suíte offline

```powershell
cd C:\TCC\software\rag-study
.venv\Scripts\python -m pytest -q
```

| Data | Testes | Observação |
|---|---|---|
| 03/10/2026 (Codex) | — | suíte não rodou por falha do sandbox (`apply deny-read ACLs`) |
| 03/10/2026 (Claude Code) | 8 | suíte original |
| 03/10/2026 (E1) | 50 | harness reescrito |
| 22/10/2026 | 75 | perguntas, revisão, análise |
| 24/10/2026 | 105 | serviço da tela do estudo (D41) |
| 16/11/2026 | 112 | `subgroups`, `executable` fixado relativo à raiz, pool e qrels no formato do Excel |

Verificações de ponta a ponta: `IMPLEMENTATION_STATUS.md` e `research/runs/README.md`.

## Validado com chamadas reais

Acesso pela assinatura (D31):
- `e2-cli-smoke-claude` e `e2-cli-smoke-gpt` (23/10/2026, Claude Code 2.1.126 e Codex 0.162);
- `e5-cli-smoke-pinned` (16/11/2026, CLIs fixadas em `software/tools`).

## Ainda não validado

- APIs pagas da OpenAI e da Anthropic: o único teste (`e2-api-smoke`) falhou por falta de crédito. Os adaptadores ficam para replicação; o experimento usa as assinaturas.
- Reprodutibilidade dos embeddings em outra máquina.
