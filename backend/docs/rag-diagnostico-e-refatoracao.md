# RAG do NexoHansen: diagnóstico e refatoração (outubro de 2026)

Registro do diagnóstico, das mudanças e dos resultados da refatoração do *pipeline* de recuperação e geração. Comandos de uso: `backend/README.md` e `knowledge-base/README.md`.

## 1. Diagnóstico

As causas foram confirmadas no código e no banco de produção (consulta somente leitura em 23/10/2026: 15 trechos, 4 consultas registradas). A pergunta predefinida "Baciloscopia negativa exclui hanseníase?" foi **recusada em produção** por evidência insuficiente, sem nenhum trecho selecionado.

| # | Camada | Causa | Onde estava |
|---|---|---|---|
| 1 | Documentos | A base tinha 15 trechos redigidos para testes, sem documento oficial, seção ou página reais. Nenhuma pergunta fora desses 15 temas podia ser respondida. | `knowledge-base/processed/hanseniase_chunks.seed.jsonl` |
| 2 | Recuperação | A busca textual usava `plainto_tsquery`, que exige **todos** os termos da pergunta no mesmo trecho; quase sempre pontuava zero. "hanseniase" sem acento não encontrava "hanseníase". | `knowledge.repository.ts`, `textSearch` |
| 3 | Recuperação | Pontuação final = 0,65 × similaridade vetorial + 0,35 × textual, com limiar fixo de 0,65. Com os embeddings da OpenAI, um trecho relevante tem similaridade de 0,4 a 0,5; com a parte textual zerada, nada atingia o limiar. | `hybrid-search.service.ts`, `retrieval.service.ts`, `MIN_RETRIEVAL_SCORE` |
| 4 | Recuperação | A reordenação somava bônus fixos por criticidade e intenção, independentemente da relevância. | `reranking.service.ts` (removido) |
| 5 | Índice | IVFFlat com 100 listas e 1 sonda: com poucos milhares de linhas, a busca aproximada consulta ~1% do índice e perde vizinhos relevantes. | migração `20260914181129` |
| 6 | Escopo | Uma pergunta sem palavra-chave de intenção era tratada como fora do escopo ("Quando devo encaminhar o paciente?", "E para crianças?"). | `intent-classifier.service.ts` |
| 7 | Regras | Correspondência por subcadeias: "Tenho dúvida" disparava "reação grave" ("enh"), "comparar" disparava "prescrição" ("parar"), "escolho" disparava "urgência" ("olho"). | `safety.service.ts`, `intent-classifier.service.ts`, `clinical-risk.service.ts` |
| 8 | Regras | Qualquer menção a criança, gestação, reação ou "fraqueza" era recusada, inclusive perguntas informativas que o PCDT responde. | `safety.service.ts` |
| 9 | Contexto | O histórico da conversa era gravado, mas não usado: continuações perdiam o assunto. | `chat.service.ts` |
| 10 | Geração | O *prompt* mandava responder "não contém informação suficiente" sempre que os trechos não bastassem, sem orientar respostas parciais, combinação de trechos ou divergências entre fontes. | `prompt-builder.service.ts` |
| 11 | Fontes | As fontes eram os trechos (identificador interno, título do trecho, sem documento oficial nem página). | `chat.service.ts`, `SourceList.tsx` |
| 12 | Risco | Qualquer trecho de criticidade "muito alta" recuperado elevava o risco da pergunta: quase tudo saía como "muito alto". | `clinical-risk.service.ts` |

## 2. Mudanças

### Documentos e ingestão

- **Base oficial** (`knowledge-base/manifest.json`): PCDT da Hanseníase (MS, 2022), Estratégia Nacional 2024–2030 (MS, 2024), Diretrizes da OMS (tradução para o português), orientação técnica da OMS sobre reações e incapacidades (inglês) e Estratégia Global da OMS 2021–2030. Metadados copiados das fichas catalográficas; origem e SHA-256 de cada arquivo.
- **Extração** (`src/modules/knowledge/document-processing/`): texto por página com `pdftotext`; remoção de cabeçalhos e rodapés repetidos; número impresso de cada página; remoção de números de referência colados às palavras; seções a partir do sumário impresso (revisado no manifesto); fragmentação que respeita as seções (~450 *tokens*, com sobreposição de um parágrafo); exclusão de referências, formulários e tabelas de evidência.
- **Indexação** (`knowledge.service.ts`): o texto do embedding traz cabeçalho com documento e seção; a busca textual usa o texto sem acentos; trechos sem mudança não geram novo embedding; trechos removidos saem do banco; cada execução fica em `ingestion_runs`.
- Resultado: **328 trechos**; todas as seções localizadas, exceto 5 anexos da OMS ancorados no início da página.

### Recuperação

- **Leitura da pergunta** (`query-analyzer.service.ts`): domínio da hanseníase por padrão; fora do escopo só com assunto explicitamente alheio; continuação completada com a conversa; glossário de siglas e sinônimos (PB, MB, PQT, ENH, GIF, crianças → menores de 15 anos etc.). Com o modelo, reformulações e uma consulta em inglês (para o documento da OMS em inglês).
- **Busca híbrida com RRF** (`hybrid-search.service.ts`): uma lista vetorial por consulta e uma lista textual (termos unidos por OU, sem acentos), combinadas pela posição — independente da escala das pontuações.
- **Evidência** (`retrieval.service.ts`): similaridade mínima conforme o provedor (`MIN_VECTOR_SIMILARITY`; padrão 0,25 com OpenAI e 0,08 local) ou correspondência textual mínima; segunda busca, mais ampla, antes de concluir que não há informação. Contexto de 8 trechos (`DEFAULT_TOP_N`), de 20 candidatos por lista (`DEFAULT_TOP_K`).
- **Índice HNSW** no lugar do IVFFlat; busca só em documentos ativos e em vetores do mesmo modelo.

### Regras de segurança

- Comparação por palavra inteira e sem acentos (`src/shared/text.ts`).
- Recusas restritas a: assunto alheio; diagnóstico de caso específico; prescrição para paciente específico (inclusive dose por peso); no perfil paciente, dose ou mudança de tratamento e urgência relatada; ausência de evidência.
- Gestação, crianças, reações, talidomida e doses padronizadas: resposta com base nos documentos, risco "muito alto" e instrução ao modelo para destacar cuidados e encaminhamento.

### Geração e fontes

- *Prompt* novo: resposta direta primeiro; uso de todos os trechos pertinentes; citação de cada afirmação; resposta parcial com indicação precisa do que não foi encontrado; divergências entre MS e OMS apresentadas, com o protocolo brasileiro como referência para a prática no Brasil; tradução fiel dos trechos em inglês; Markdown (listas, tabelas, subtítulos).
- **Citações**: números inválidos descartados; renumeração pela ordem de aparição; só as fontes citadas são exibidas; lista de fontes escrita pelo modelo removida; verificação automática de que o trecho sustenta a frase (termos em comum ou, com embeddings semânticos, similaridade entre frase e trecho). Fonte não confirmada aparece com aviso.
- **Fonte documental** na interface: instituição, título, ano, âmbito (diretriz brasileira ou recomendação internacional), seção, página impressa, link para o PDF oficial na página do trecho e o trecho original sob demanda. Avisos para documento em inglês e para tradução não oficial.
- Sem modelo configurado ou com falha do modelo: resposta extrativa com as frases mais pertinentes de cada trecho e a fonte.

## 3. Banco de dados

Migração `20261023120000_official_documents_and_search` (aditiva):

- `documents`: metadados bibliográficos, `status` (`vigente`, `substituido`, `desenvolvimento`, com restrição CHECK), `active`, endereços oficial e de download, SHA-256, páginas, licença, notas, data da indexação;
- `chunks`: `chunk_index`, `section_path`, páginas do PDF e impressas, `content_hash`, `embedding_model`, `search_text`;
- `ingestion_runs`: histórico de ingestão;
- índice GIN em `search_text`; índice HNSW no lugar do IVFFlat;
- a base inicial de desenvolvimento passa a `status = desenvolvimento`, `active = false`: sai da busca sem ser apagada.

Validada em banco vazio e em banco no estado anterior com dados (PGlite com pgvector). O código anterior continua funcionando com o banco migrado.

## 4. Testes e avaliação

- Backend: 77 testes unitários e de API (antes, 47), mais 10 de integração com PostgreSQL (antes, 6): processamento dos PDFs, análise da pergunta, RRF, regras (inclusive os falsos positivos antigos), citações, *prompt*, geração com modelo simulado, ingestão com reaproveitamento de embeddings, busca sem acentos e filtros por modelo e documento ativo.
- Frontend: 20 testes (antes, 16), incluindo a lista de fontes e a leitura de tabelas e subtítulos.
- **Conjunto de referência**: 32 perguntas com evidência (documento e páginas) conferida no texto dos documentos — `knowledge-base/evaluation/golden-questions.json`.

### Comparação (23/10/2026, modo local)

As duas execuções usaram embeddings determinísticos e resposta extrativa, porque não havia `OPENAI_API_KEY` disponível no ambiente de desenvolvimento. Esse modo não capta semântica: os números medem principalmente a base, a busca textual, as regras e a recuperação de contexto.

| Indicador | Versão anterior (base inicial) | Versão nova (base oficial) |
|---|---|---|
| Comportamento esperado | 15,6% (5 de 32; recusou todas as perguntas) | 93,8% (30 de 32) |
| Recall@5 da evidência | 0 | 0,84 |
| Recall@8 da evidência | 0 | 0,84 |
| Fatos-chave na resposta | 0 | 0,63 |
| Precisão das citações | — | 0,30 (a resposta extrativa cita os 4 primeiros trechos) |

Por categoria (comportamento esperado, antes → depois): predefinidas 33% → 100%; diretas 0% → 100%; combinação 0% → 100%; sinônimos 0% → 100%; continuação 0% → 100%; difíceis 0% → 100%; divergência 0% → 100%; segurança 33% → 100%; regressão 0% → 100%; sem resposta na base 100% → 0%.

As duas perguntas sem resposta na base (acupuntura; telefone da coordenação municipal) recebem, no modo local, trechos com palavras em comum; quem reconhece a lacuna é o modelo de linguagem, ausente nesse modo. Relatórios completos: `knowledge-base/evaluation/results/`.

## 5. Pendências

- **`OPENAI_API_KEY` no ambiente de execução dos comandos.** Necessária para (1) indexar o banco de produção com o mesmo provedor da API e (2) medir a versão nova com embeddings semânticos e o modelo, que é como a produção funciona. Sem ela, os números acima não refletem a qualidade semântica nem a da redação.
- **Produção**: aplicar a migração (`npm run prisma:deploy` com a conexão direta da Neon), indexar a base oficial e o conjunto de referência (`npm run prisma:seed`, com a mesma `OPENAI_API_KEY` da API) e só então publicar o código novo. A ordem importa: o código novo ignora a base inicial desativada pela migração, e sem a indexação não teria documentos para consultar.
- **Tabelas linearizadas**: quadros como o de doses da PQT-U são extraídos linha a linha; a associação entre faixa de peso e doses depende da ordem do texto. Revisar as respostas sobre doses com a tabela original (link da fonte).
- **Verificação de citações** é aproximada (termos em comum ou similaridade): confirma relação, não exatidão clínica.
- **Avaliação por especialistas**: os indicadores não substituem a revisão das respostas por profissionais de saúde.
- **TCC**: o Capítulo 4 descreve o *pipeline* anterior (soma ponderada, limiar 0,65, regras por subcadeia, base de 15 trechos) e precisa ser atualizado.
