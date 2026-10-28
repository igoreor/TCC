# Validação

## Histórico

- **03/10/2026 (Codex):** os arquivos foram criados, mas a suíte não rodou por falha do sandbox (`apply deny-read ACLs`).
- **03/10/2026 (Claude Code):** a suíte original rodou com 8 testes aprovados.
- **03/10/2026 (Claude Code, E1):** o harness foi reescrito e ampliado; a suíte atual tem **50 testes aprovados**:

```powershell
cd C:\TCC\software\rag-study
.venv\Scripts\python -m pytest -q
```

Verificações de ponta a ponta da E1: ver `IMPLEMENTATION_STATUS.md` e `research/runs/README.md`.

## Ainda não validado

- Chamadas reais às APIs OpenAI e Anthropic, incluindo a aceitação de `text.format`/`output_config.format` com os modelos escolhidos, o comportamento de `effort`/`reasoning` e o consumo de tokens de raciocínio dentro dos limites de saída. Primeiro passo do piloto E2: 1 pergunta `dev` × todas as condições, com `--allow-api`, e inspeção manual do `raw.jsonl`.
- Reprodutibilidade dos embeddings em outra máquina.
