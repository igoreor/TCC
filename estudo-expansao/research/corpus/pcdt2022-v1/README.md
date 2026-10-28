# Corpus `pcdt2022-v1`

Snapshot imutável usado pelo recuperador. Não editar estes arquivos: qualquer mudança exige nova versão (`pcdt2022-v2`) gerada pelo comando abaixo.

| Campo | Valor |
|---|---|
| Fonte | Brasil. Ministério da Saúde. *Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase*. Brasília, 2022 |
| Arquivo | `research/sources/2022 - Brasil - PCDTHanseniase.pdf` (156 p.) |
| SHA-256 da fonte | `1e2ee0c56f924a03b00c22a1491da4bd5894539651aaee877c54a9f22dcd9933` |
| Páginas incluídas | 15–113 |
| Exclusões | `exclusions.csv` (com motivo) |
| Extrator | PyMuPDF 1.28.2 |
| Trechos | 206 (32–200 palavras; média 153) |
| Snapshot (`chunks.jsonl`) | `f401426c28805ef5984de02210d0fa08b9ad1ec9ba1d0c8172a85404c655cc03` |
| Construído em | 03/10/2026 |

## Arquivos

- `chunks.jsonl`: um trecho por linha com `chunk_id`, texto, `embed_text` (caminho de seções + texto), seções, páginas e hash.
- `manifest.json`: configuração completa, estatísticas e hashes.
- `sections.csv`: títulos detectados, para auditoria contra o sumário.
- `exclusions.csv`: páginas excluídas e motivo.
- `index-bge-m3/`: embeddings BGE-M3 (revisão `5617a9f6…`) e manifesto do índice, com embeddings `7f5d84f5…`.

## Regenerar (deve reproduzir os mesmos hashes)

```powershell
cd C:\TCC
software\rag-study\.venv\Scripts\rag-study --root . build-corpus --config software/rag-study/config/corpus-pcdt2022-v1.json --out <pasta-nova>
software\rag-study\.venv\Scripts\rag-study --root . build-index --corpus <pasta-nova> --embedder software/rag-study/config/embedder-bge-m3.json --index-id teste --out <pasta-nova>/index
```

## Limitações conhecidas

- Tabelas linearizadas: algumas células aparecem intercaladas. Conferir doses e esquemas no PDF.
- Fluxogramas (Apêndice A) e anexos fora do v1.
- Oito páginas incluídas não têm texto: são separadoras de capítulo (16, 20, 22, 44, 54, 56, 96, 102).
- Numeração inconsistente no próprio PDF: o corpo pula de 13 para 13.1.1 e de 14 para 14.1.1.
- Vigência do PCDT 2022 em outubro de 2026 ainda precisa de confirmação definitiva.
