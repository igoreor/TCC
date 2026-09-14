# Estratégia de Retrieval

O backend usa recuperação híbrida:

1. Busca vetorial com embeddings armazenados em `pgvector`.
2. Busca textual com PostgreSQL Full Text Search e correspondência simples por texto.
3. Combinação por score:

```text
finalScore = vectorScore * 0.65 + keywordScore * 0.35
```

O reranking aplica boosts para:

- criticidade clínica muito alta em perguntas clínicas;
- chunks de medicamento em perguntas sobre medicamento;
- chunks de reação em perguntas sobre reação hansênica;
- chunks de diagnóstico em perguntas diagnósticas;
- chunks de exame em perguntas sobre exames;
- público-alvo gestante ou pediátrico quando a pergunta menciona esses grupos;
- nível de segurança alto risco quando há risco clínico.

Configurações padrão:

- `DEFAULT_TOP_K=12`
- `DEFAULT_TOP_N=5`
- `MIN_RETRIEVAL_SCORE=0.65`
