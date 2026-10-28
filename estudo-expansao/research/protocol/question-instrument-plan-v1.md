# Instrumento de avaliação: plano de controle de vieses (v1)

Para: autor e orientador. Data: 23/10/2026. Complementa o protocolo v0.3, D15, D20, D34 e D35.

## 1. Ponto de partida: a regra D15

Redação vigente (`research/notes/decisions-log.md`):

> O agente (Claude) pertence a uma das famílias avaliadas e não redige perguntas de teste, respostas de referência nem rótulos de relevância. O mesmo vale para modelos GPT.

Leitura operacional:

- "Redigir" inclui escrever e também adaptar ou reformular o texto de uma pergunta.
- Selecionar uma pergunta publicada e copiá-la literalmente, com a fonte, não é redigir.
- Montar matrizes, separar trechos, verificar, medir similaridade e documentar não é redigir.

| Situação | Enquadramento |
|---|---|
| Claude ou GPT escreverem ou adaptarem perguntas, pontos-chave ou rótulos | **Proibido** pela D15 |
| Perguntas sintéticas de um modelo **fora** das famílias avaliadas, declaradas e revisadas | **Depende de emenda à D15 aprovada pelo orientador** (seção 8) |
| Matriz de vagas, pacote de leitura, coleta de perguntas publicadas literais, sugestão de candidatas, checagens automáticas, documentação | **Permitido**; feito em 22–23/10/2026 |
| Escolher a pergunta, adaptar o registro, escrever as perguntas faltantes e os pontos-chave | **Autor** (humano) |
| Revisar clareza, registro, pontos-chave e respondibilidade | **Revisor humano independente** |

Declarar a participação da IA não elimina o viés de um modelo avaliado escrever o instrumento. Declarar resolve a autoria; o viés só é evitado por quem escreve.

## 2. Origem das perguntas

Cada pergunta tem um campo `origin` obrigatório, conferido por `questions-check`:

| `origin` | Definição | Exigências verificadas |
|---|---|---|
| `real` | pergunta publicada, copiada literalmente | `source_name`, `source_url`, `original_text` idêntico a `text` |
| `adaptada` | pergunta publicada, reescrita pelo autor (registro, escopo, clareza) | `source_name`, `source_url`, `original_text` diferente de `text` |
| `autor` | escrita pelo autor a partir do pacote de leitura | — |
| `sintetica_externa` | gerada por modelo fora das famílias avaliadas | só com `--allow-external-synthetic` (emenda aprovada); `generator_model` obrigatório; GPT/Claude rejeitados |

Banco de perguntas publicadas (`external-questions-candidates.csv`, coletado em 23/10/2026):

- 152 perguntas literais, cada uma conferida na fonte, com link;
- 32 vêm da Segunda Opinião Formativa (BVS APS/Telessaúde) e foram enviadas por profissionais: 17 enfermeiros, 9 médicos, 4 ACS, 1 fisioterapeuta e 1 não informado;
- 120 vêm de perguntas frequentes e materiais institucionais: MS, Fiocruz, Conitec, SES-MG, SMS-SP e SES-RJ;
- 11 estão marcadas por tratarem de temas alterados em 2026.

As candidatas por vaga estão em `candidates-by-slot-v2.csv` e na coluna `candidate_external_ids` da planilha. Um asterisco indica registro diferente do pedido pela vaga.

## 3. Controles, critérios e verificação

| Controle | Risco | O que se faz | Verificação objetiva | Limite |
|---|---|---|---|---|
| **A. Naturalidade** | perguntas com estilo artificial ou de LLM | origens `real`/`adaptada`/`autor`; nada escrito por GPT ou Claude | revisor marca "formulação artificial" (sim/não) em cada pergunta, sem saber a origem | julgamento humano; sem métrica automática confiável |
| **B. Independência lexical** | copiar o PCDT favorece a consulta original (R0) e esconde o efeito da expansão | guia proíbe copiar frases e títulos | `questions-check --corpus`: **erro** se ≥ 8 palavras seguidas iguais a um trecho (exceto `real`); **aviso** a partir de 5; **aviso** se reproduzir título de seção com ≥ 3 palavras | não detecta paráfrase próxima; ver F |
| **C. Complexidade** | distribuição fora do desenho | matriz fixa 35 simples e 15 compostas | `simples` = 1 unidade de informação (1 a 3 pontos-chave, normalmente de 1 seção); `composta` = ≥ 2 unidades. **Erro** se composta tiver < 2 pontos-chave; **aviso** se simples tiver > 3 | o revisor confirma que as unidades são distintas |
| **D. Independência dos modelos** | perguntas moldadas pelo comportamento de GPT ou Claude | nenhum modelo é executado nas perguntas antes do congelamento; a escolha das candidatas é por assunto, não por desempenho | o `run-manifest.json` grava o `questions_sha256`; o `freeze-log.md` tem data e hash anteriores à primeira execução | a sugestão de candidatas usou similaridade com títulos (seção 6) |
| **E. Validação externa** | perguntas pouco representativas | prioridade para perguntas publicadas; revisão humana independente; avaliação cega opcional por especialista | proporção de origens relatada; concordância do revisor (seção 5) | só as 32 SOFs são dúvidas espontâneas de profissionais |
| **F. Similaridade** | redundância temática e perguntas próximas demais | três camadas, nenhuma sozinha basta | lexical: Jaccard ≥ 0,6 entre perguntas fora dos pares (`questions-check`); semântica: cosseno BGE-M3 ≥ 0,90 entre perguntas fora dos pares (`questions-similarity`); temática: mesma seção-alvo **e** mesmos pontos-chave em vagas diferentes (revisor) | a similaridade com o corpus é relatada, não penalizada: perguntas respondíveis **devem** ser próximas do PCDT |
| **G. Rastreabilidade** | não saber de onde veio cada pergunta | campos obrigatórios na planilha e no JSONL | ver a lista de colunas abaixo | — |
| **H. Congelamento** | mudar perguntas depois de ver resultados | hash antes de qualquer execução | `questions-check` imprime os SHA-256; `freeze-log.md`; manifesto de cada lote com `questions_sha256`; `questions-build` recusa sobrescrever (correção = v2) | — |
| **I. Sensibilidade à origem** | efeito diferente conforme a origem | análise estratificada (seção 7) | diferença de efeitos entre estratos com IC | poder baixo se um estrato tiver < 10 perguntas |

Colunas de rastreabilidade (G), na planilha `authoring-sheet-v2.csv`:

- identificação e desenho da vaga: `slot_id`, `question_id`, `need_group`, `category`, `register`, `complexity`, `answerable_from_corpus`;
- base documental: `target_sections`, `section_titles`, `pages`;
- origem: `candidate_external_ids`, `origin`, `source_name`, `source_url`, `original_text`, `generator_model`;
- conteúdo e controle: `fit_justification` (por que a pergunta atende à vaga), `key_points`, `reference_pages`, `author`, `created_on`, `reviewed_by`.

## 3a. Controles de auditoria acrescentados em 23/10/2026 (D37)

| Controle | Como verificar |
|---|---|
| Seleção cega pelo autor ou por revisor humano, antes de ver as recomendações do agente | `curation-v2-blind.csv`; concordância com o agente por `curation_v2_build.py --agreement` (mesma candidata; kappa da categoria de uso) |
| Jargão do PCDT em perguntas leigas | aviso de `questions-check` (lista `TECHNICAL_TERMS`) |
| Não respondíveis verificadas por leitura dos trechos mais próximos (BM25, independente do recuperador do experimento) | `questions-na-check`; relatório com caixa de conclusão do autor por pergunta |
| Pares leigo/técnico pedem a mesma informação | **erro** de `questions-check` se os pontos-chave do par diferirem |
| Quem escolheu cada pergunta publicada | campo `selected_by` (`agente_confirmado` ou `autor`), obrigatório para `real` e `adaptada` |

Uma auditoria feita por GPT ou por Claude não é independente (ambas são famílias avaliadas). Validação independente = humano ou modelo de outra família.

## 4. Procedimento de construção

1. Para cada vaga, ler os requisitos (planilha) e os trechos (`reading-pack-v2.md`).
2. Ver as candidatas publicadas da vaga (`candidates-by-slot-v2.csv`). Escolher **pelo assunto**, não pela pontuação. Cada pergunta publicada só pode ocupar uma vaga.
3. Se a candidata servir sem mudança, `origin=real`: o texto é idêntico ao publicado, e você preenche fonte e URL.
4. Se precisar ajustar registro, escopo ou contexto (por exemplo, "Existe tratamento?" depende da página de origem), reescreva com as suas palavras e use `origin=adaptada`, com o original em `original_text`.
5. Se nenhuma servir, escreva com o pacote de leitura: `origin=autor`.
6. Para as 5 não respondíveis: confira no PDF e no `chunks.jsonl` que o PCDT não responde. A sugestão automática dessas vagas é fraca.
7. Preencha os pontos-chave com página e a `fit_justification` (uma linha).
8. Faça a revisão humana (seção 5), depois `questions-build`, `questions-check --corpus` e `questions-similarity`, e resolva os erros e avisos.
9. Congele (seção 5).

## 5. Validação humana e congelamento

**Revisão independente** (obrigatória): uma pessoa que não seja o autor, de preferência profissional de saúde.

- Ela vê as perguntas sem a coluna de origem e julga, em cada uma:
  - clareza (1 a 4);
  - adequação ao registro (sim/não);
  - pertinência clínica (1 a 4);
  - formulação artificial (sim/não);
  - pontos-chave corretos segundo o PCDT (sim/não);
  - respondibilidade correta (sim/não).
- Perguntas com clareza ≤ 2 ou qualquer "não" são revistas pelo autor antes do congelamento. A versão final de cada pergunta e o motivo da mudança ficam registrados em `notes`.
- **Opcional:** um segundo especialista julga uma amostra de 20%, e relata-se a concordância (kappa).

**Congelamento:**

1. `questions-check --corpus` sem erros, com os avisos resolvidos ou justificados.
2. Registrar no `freeze-log.md` a data e o SHA-256 de `test-v1.jsonl`, `test-v1-keypoints.csv` e `blueprint-v2.csv`.
3. Copiar os três arquivos para um local fora do computador (por exemplo, e-mail ao orientador com os hashes) como prova de data.
4. Nenhuma execução antes disso. Qualquer correção posterior gera `test-v2`, com justificativa, e as análises relatam a versão usada.

## 6. Limitações e vieses residuais

- **Recomendação pelo agente (D36):** a melhor candidata de cada vaga foi recomendada pelo agente (Claude), que pertence a uma família avaliada. Ele usou só critérios da vaga, com adequação calculada por regras fixas a partir de anotações auditáveis, e o autor confirma cada escolha. Ainda assim, é um viés residual: na análise por origem, separar as perguntas recomendadas pelo agente das escolhidas pelo autor.
- **Sugestão automática:** as candidatas foram ordenadas por similaridade semântica com os títulos das seções. Isso pode favorecer perguntas tematicamente próximas do PCDT. Mitigação: a escolha é pelo assunto; há a checagem de cópia (B) e a análise por origem (I).
- **Banco publicado:** as perguntas institucionais (120 de 152) foram escritas por instituições para educar, não são dúvidas espontâneas. Os títulos das SOFs podem ter sido editados pelos núcleos. As respostas da SES-RJ (2010) estão desatualizadas, mas só o texto das perguntas é usado.
- **Autor:** as perguntas `autor` e `adaptada` vêm de quem conhece o corpus. Mitigações: guia, checagens e revisão independente.
- **Registro:** o banco tem mais perguntas leigas (101) que técnicas (51). As vagas técnicas tendem a ter mais perguntas `autor`.
- **Não respondíveis:** dependem de verificação manual de que o PCDT não responde.
- **Nenhuma checagem automática garante a ausência de viés.** Os índices sinalizam casos para revisão humana.

## 7. Análise de sensibilidade por origem (exploratória)

- **Estratos:** `independente` (real + adaptada) × `autor`. Se a emenda da seção 8 for aprovada, entra também `sintetica_externa`.
- **Para cada desfecho primário** (P1: Recall@5 de Rj − R0; P2: `kp_coverage` de R0 − D), estimar o efeito em cada estrato e a diferença entre estratos, com IC 95% por bootstrap por grupo de necessidade.
- **Interpretação:** um IC da diferença que exclua zero indica que a origem modifica o efeito, e isso é discutido como ameaça à validade. Com menos de 10 perguntas num estrato, relatar só estatística descritiva.
- **Não testar:** origem × provedor (n insuficiente).
- **Também relatar:** a distribuição de `longest_corpus_run` e de `max_cosine_corpus` por origem.

## 8. Se o orientador quiser admitir perguntas sintéticas

Seria uma emenda à D15, com a seguinte redação mínima:

- quem aprovou e quando;
- modelo gerador, de família não avaliada, com ID, versão e data;
- prompt literal arquivado com hash;
- vagas em que é permitido (só as sem candidata publicada adequada);
- revisão e edição obrigatórias pelo autor;
- `origin=sintetica_externa` em cada uma;
- análise de sensibilidade incluindo o estrato sintético.

O agente que opera este workspace (Claude) continua sem gerar o texto, mesmo após a emenda.

## 9. Distinções pedidas pelo autor

| Item | Classificação |
|---|---|
| Claude ou GPT escrevendo ou adaptando perguntas, pontos-chave ou rótulos | proibido (D15) |
| Viés lexical (cópia do PCDT) | mitigável por controle (B) |
| Redundância entre perguntas | mitigável por controle (F) e revisão |
| Representatividade das perguntas | exige validação independente (E, seção 5) |
| Perguntas não respondíveis de fato não respondíveis | exige verificação humana |
| Viés da sugestão automática de candidatas | mitigável e mensurável (I), declarado |
| Perguntas sintéticas de modelo externo | depende de aprovação do orientador (seção 8) |
| Efeito residual da origem | não eliminável; estimado na seção 7 |
