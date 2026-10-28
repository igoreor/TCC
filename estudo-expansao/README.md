# Estudo de expansão semântica de consultas

Pesquisa de Nathan Dalbert Lopes dos Santos (TCC, UPE): **RAG com Expansão Semântica de Consultas para Apoio à Pesquisa Clínica em Hanseníase**. O NexoHansen é um trabalho colaborativo, e cada autor conduz uma pesquisa própria. Esta pasta reúne a do Nathan: o harness do experimento, o protocolo, os dados e o instrumento de perguntas. A tela `/dashboard/estudo` do app (ver `../ESTUDO-EXPANSAO.md`) mostra esses resultados.

## Pergunta de pesquisa

Expandir a consulta antes da recuperação melhora o RAG sobre documentos oficiais de hanseníase? Comparam-se cinco condições:

- **D:** o modelo responde sem RAG;
- **R0:** RAG com a pergunta original;
- **R1:** RAG após reescrever a pergunta;
- **R2:** RAG após gerar palavras-chave;
- **R3:** RAG após gerar um pseudodocumento.

Os modelos comparados são Claude Sonnet 5.5 e GPT-6.1 Sol. O desenho tem duas etapas: (1) só recuperação, R0–R3, e (2) respostas, D × R0 × a melhor expansão. O protocolo completo está em `research/protocol/experimental-protocol-v0.3.md`, e as métricas e testes estatísticos em `research/protocol/metrics-and-tests-v1.md`.

Este estudo **não** usa o pipeline, o banco, a base nem a avaliação de 0 a 10 do NexoHansen, que são parte da pesquisa do Igor. Ele roda num harness próprio, para isolar o efeito da expansão.

## Conteúdo

| Pasta | O que tem |
|---|---|
| `software/rag-study/` | harness em Python: código, 105 testes, configurações, prompts, `uv.lock` |
| `research/protocol/` | protocolo, métricas, testes estatísticos, rubrica de revisão, plano do instrumento, registro de congelamento |
| `research/corpus/` | corpora congelados com índices BGE-M3: `pcdt2022-v1` e `hanseniase-v2` (5 documentos oficiais, 391 trechos) |
| `research/runs/` | lotes de execução imutáveis (`raw.jsonl` + manifesto); até aqui, só testes funcionais |
| `research/questions/` | matriz de vagas, planilha de redação, perguntas publicadas candidatas e curadoria |
| `research/sources/README.md` | fontes oficiais com link, páginas e SHA-256; os PDFs não são redistribuídos aqui |

O nome de cada arquivo traz a versão (`-v1`, `-v2`, `-v3`); a mais alta é a vigente, e as anteriores ficam como histórico. As decisões citadas como D01–D41 estão no registro de decisões do autor, que fica fora deste repositório público. As regras e o raciocínio de cada uma estão resumidos no protocolo.

## Replicar

Os caminhos das configurações são relativos a esta pasta, então use `--root .` a partir daqui:

```powershell
cd estudo-expansao
uv sync --all-extras --project software/rag-study     # Python 3.12, versões travadas
software\rag-study\.venv\Scripts\python -m pytest -q software/rag-study/tests
$env:HF_HUB_OFFLINE = "1"                               # depois do primeiro download do BGE-M3
software\rag-study\.venv\Scripts\rag-study --root . run --config software/rag-study/config/experiments/<config>.json --dry-run
```

Os demais comandos estão em `software/rag-study/README.md`.

O `.gitattributes` desta pasta desliga a conversão de quebra de linha. Corpus, prompts e perguntas são conferidos por SHA-256 ao carregar, e uma cópia com CRLF falharia.

## Origem dos arquivos

Esta pasta é uma cópia da versão de trabalho do autor, gerada por `software/rag-study/scripts/publish_to_nexohansen.py`. O script copia byte a byte só a lista permitida e recusa conteúdo com chave de API ou caminho pessoal. Não edite os arquivos daqui à mão: altere no workspace do autor e gere a cópia de novo.
