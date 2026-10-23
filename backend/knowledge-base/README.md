# Base documental

Documentos oficiais consultados pelo NexoHansen e o processo que os transforma em trechos pesquisáveis.

## Estrutura

| Caminho | Conteúdo | Versionado |
|---|---|---|
| `manifest.json` | Documentos, metadados bibliográficos, origem do arquivo (com SHA-256), parâmetros de extração e sumário revisado | sim |
| `raw/` | PDFs originais, baixados por `npm run kb:build` | não |
| `processed/<documentId>.jsonl` | Trechos com seção, páginas e metadados, gerados a partir do PDF | sim |
| `processed/<documentId>.report.json` | Relatório da extração: páginas numeradas, seções não localizadas, tamanho dos trechos | sim |
| `processed/hanseniase_chunks.seed.jsonl` | Base inicial de desenvolvimento (15 trechos redigidos), fora da busca | sim |
| `evaluation/golden-questions.json` | Conjunto de referência da avaliação | sim |
| `evaluation/results/` | Relatórios das execuções da avaliação | sim |

## Documentos

| Documento | Instituição e ano | Idioma | Âmbito | Trechos |
|---|---|---|---|---|
| Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase (ISBN 978-65-5993-397-6) | Ministério da Saúde, 2022 | português | nacional | 131 |
| Estratégia Nacional para Enfrentamento à Hanseníase 2024-2030 (ISBN 978-65-5993-565-9) | Ministério da Saúde, 2024 | português | nacional | 39 |
| Diretrizes para o diagnóstico, tratamento e prevenção da hanseníase (ISBN 978-92-9022-707-6) | OMS, tradução de 2019 da edição de 2018 | português | internacional | 49 |
| Leprosy/Hansen disease: management of reactions and prevention of disabilities (ISBN 978-92-9022-759-5) | OMS, 2020 | inglês | internacional | 63 |
| Rumo à zero hanseníase: Estratégia Global de Hanseníase 2021–2030 (ISBN 978-92-9022-842-4) | OMS, 2021 | português | internacional | 46 |

Observações registradas no manifesto:

- **PCDT e Estratégia Nacional.** Os endereços da BVS indicados nas fichas catalográficas responderam com erro (HTTP 503) em 23/10/2026. Os arquivos foram obtidos no portal da Conitec e no da Prefeitura de São Paulo; a ficha catalográfica de cada arquivo confere com a edição oficial.
- **Traduções da OMS.** As traduções para o português declaram que não foram feitas pela OMS e que a edição em inglês é a autêntica. A interface informa isso junto da fonte.
- **"LEMIT".** O documento citado como "LEMIT" corresponde, provavelmente, ao *Leprosy Elimination Monitoring Tool* (LEMT) da OMS (Escritório Regional do Sudeste Asiático; ISBN 978-92-9021-047-4). É uma ferramenta de monitoramento de metas de eliminação para gestores, sem conteúdo clínico, e não foi incluída. Se a intenção era outro documento, informe o título ou o link.
- **Partes excluídas.** Referências, anexos de formulários, tabelas de evidência e GRADE, fluxogramas (que perdem o sentido na extração de texto) e listas de abreviações. O detalhe de cada documento está em `notes` e nas entradas com `"exclude": true` do sumário.

## Reprocessar e reindexar

```bash
cd backend
npm run kb:build                 # todos os documentos
npm run kb:build -- --only ms-pcdt-hanseniase-2022
npm run kb:ingest                # indexa no banco de DATABASE_URL
npm run eval:rag -- --label apos-reindexacao
```

- `kb:build` precisa do `pdftotext` (Poppler). No Windows, ele vem com o Git for Windows; no Linux, no pacote `poppler-utils`.
- O SHA-256 do PDF precisa coincidir com o do manifesto. Se o órgão publicar uma nova versão no mesmo endereço, o processamento para, para que a nova versão seja conferida antes.
- `kb:ingest` só gera embedding para trechos novos, alterados ou indexados com outro modelo, e remove trechos que deixaram de existir. Cada execução fica em `ingestion_runs`.
- **Provedor de embeddings.** Indexe o banco com o mesmo provedor que a API usará. A busca compara só vetores do mesmo modelo: um banco indexado sem `OPENAI_API_KEY` não é usado pela busca vetorial de uma API com a chave, e vice-versa.

## Adicionar um documento

1. Confirme a procedência (página oficial do órgão), a versão e se o documento já está na base.
2. Baixe o PDF para `raw/<documentId>.pdf` e calcule o SHA-256.
3. Gere o rascunho do sumário: `npm run kb:toc -- --pdf raw/<documentId>.pdf --pages <páginas do sumário> --offset <página do PDF − página impressa>`.
4. Acrescente o documento ao `manifest.json`: metadados copiados da ficha catalográfica (não preencha campos que o documento não traz), `downloadUrl`, `sha256`, `extraction.contentPages` e o sumário revisado, marcando com `"exclude": true` as seções que não devem entrar.
5. Rode `npm run kb:build -- --only <documentId>` e confira o relatório (`processed/<documentId>.report.json`): seções não localizadas, páginas sem número impresso e tamanho dos trechos.
6. Rode `npm run kb:ingest -- --only <documentId>` e a avaliação.

## Versões e documentos substituídos

Quando sair uma nova versão de um documento:

- cadastre-a como documento novo, com `documentId` próprio (por exemplo, com o ano);
- marque a anterior com `"status": "substituido"` no manifesto e rode `kb:ingest`: ela sai da busca (`active = false`), mas os trechos continuam no banco, o que preserva o histórico das respostas já dadas;
- se as duas versões precisarem ser consultadas (para explicar mudanças de recomendação), mantenha ambas como `vigente` e informe a diferença de ano no título curto.

Diretrizes brasileiras (`jurisdiction: nacional`) e recomendações internacionais (`internacional`) são apresentadas como tais nas fontes, e a geração é instruída a apontar divergências entre elas.
