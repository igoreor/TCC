# Estratégia de Chunking

A base aceita chunks já processados em JSONL e mantém um serviço preparado para evoluir ingestão de texto bruto.

Diretrizes:

- chunking semântico;
- não cortar explicação clínica no meio;
- preservar tabelas Markdown;
- preservar listas de condutas clínicas;
- separar epidemiologia, diagnóstico, tratamento, reações, vigilância e aspectos psicossociais;
- manter medicamento, dose, duração, população-alvo e contraindicação no mesmo chunk;
- manter reação hansênica, sinais de alerta e conduta de segurança no mesmo chunk;
- tamanho médio recomendado entre 500 e 900 tokens;
- overlap entre 15% e 25%;
- chunks de medicação e segurança devem ser menores e rastreáveis.

Padrão de nomeação:

```text
hans_{dominio}_{subdominio}_{numero}
```
