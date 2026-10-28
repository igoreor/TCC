# Guia de redação das perguntas (v3)

Para: Nathan (autor) e o revisor das perguntas. Data: 22/10/2026; atualizado em 23/10/2026 para 50 perguntas (D34).

## O que você vai produzir

**50 perguntas** (`test-001` a `test-050`) na planilha `authoring-sheet-v3.csv` (corpus `hanseniase-v2`, com 5 documentos oficiais: PCDT 2022, Portarias 47 e 51/2026, Estratégia Nacional 2024-2030 e OMS 2023 em inglês). Elas são usadas nas duas etapas:

- **etapa 1:** compara as três expansões com a consulta original, só na recuperação;
- **etapa 2:** compara sem RAG × RAG × RAG com a melhor expansão, com GPT e Claude.

Cada linha já traz a vaga definida pela matriz (`blueprint-v3.csv`): categoria clínica, registro (leigo ou técnico), complexidade, se o PCDT responde, seções-alvo, páginas e número de trechos do corpus nessas seções. Você preenche só as colunas `text`, `key_points`, `reference_pages`, `author`, `created_on` e, depois da revisão, `reviewed_by`.

A matriz define **onde** perguntar. **O que** perguntar e **como** é decisão sua. Essa divisão preserva a regra D15: GPT e Claude são os modelos avaliados e não escrevem as perguntas, nem os pontos-chave, nem os rótulos de relevância.

## Comece pelas perguntas publicadas (atualizado em 23/10/2026, D35)

Para cada vaga, a coluna `candidate_external_ids` lista até 5 perguntas reais já publicadas, no arquivo `external-questions-candidates.csv`, com texto literal e link. Um `*` indica registro diferente do pedido. Os detalhes estão em `candidates-by-slot-v3.csv`.

1. Leia os trechos da vaga em `reading-pack-v3.md`.
2. Veja as candidatas e escolha **pelo assunto**, não pela posição na lista. Cada pergunta publicada só pode ser usada uma vez.
3. Preencha `origin`:
   - `real`: serve sem mudança. Copie o texto idêntico em `text` e em `original_text`, com `source_name` e `source_url`.
   - `adaptada`: precisou mudar o registro, o escopo ou o contexto. Escreva com as suas palavras em `text` e guarde o original em `original_text`.
   - `autor`: nenhuma serviu, então você escreve.
4. Preencha `fit_justification` com uma linha dizendo por que a pergunta atende à vaga e `selected_by`: `agente_confirmado` se você aceitou a recomendação do `curation-v3.md`, ou `autor` se escolheu por conta própria (por exemplo, na planilha cega `curation-v3-blind.csv`).
5. Nas vagas não respondíveis e parciais, rode `questions-na-check` e leia os trechos: a ausência de palavra-chave não basta. Inclua termos em inglês na coluna `terms_en`, porque a busca não alcança o documento da OMS só com português.
6. Quando o PCDT 2022 e uma portaria de 2026 tratarem do mesmo tema, os pontos-chave seguem a norma mais recente; quando a OMS recomendar algo que o PCDT não adota, o ponto-chave registra essa distinção.
7. Nas 5 vagas não respondíveis, a sugestão automática é fraca. Confira sempre que o PCDT realmente não responde.

O plano completo de controle de vieses está em `research/protocol/question-instrument-plan-v1.md`.

## Regras

1. **Escreva sem ajuda de modelo de linguagem.** Não use ChatGPT, Claude, Gemini ou corretores com IA para redigir, reformular ou "melhorar" perguntas e pontos-chave. Corretor ortográfico comum é permitido. Se algum texto tiver ajuda de IA, registre em `notes`.
2. **Leia antes de escrever.** Abra o PDF do PCDT 2022 nas páginas indicadas e escolha uma necessidade de informação real dentro das seções-alvo.
3. **Não copie frases do PCDT na pergunta.** Copiar aumenta artificialmente a semelhança lexical entre a pergunta e o trecho, favorece a consulta original (R0) e esconde o efeito da expansão.
4. **Uma necessidade por pergunta.** Pergunta "composta" exige combinar duas informações para responder a uma dúvida única, e não duas perguntas coladas.
5. **Sem dados pessoais.** Cenários hipotéticos são permitidos ("um paciente de 30 anos…"), sem nome, endereço, data de nascimento ou outro identificador.
6. **Não rode nenhum modelo nas perguntas de teste antes do congelamento.**
7. **Temas que mudaram depois do PCDT 2022** (atualizado em 23/10/2026: as portarias agora estão no corpus v2, e as vagas T08 e T16 tratam desses temas de propósito). Em 2026 a Portaria SCTIE/MS nº 47 ampliou o uso da claritromicina como segunda linha, e a nº 51 ampliou as indicações do qPCR. Nesses temas, a resposta "correta segundo o corpus" já está desatualizada. Não faça perguntas respondíveis sobre eles. A matriz já desviou as vagas afetadas (T08 e T16).

## Registro

| Registro | Como escrever | Evitar |
|---|---|---|
| `leigo` | Como perguntaria um paciente, um familiar ou um agente comunitário: palavras do dia a dia, descrição de sintomas em vez do nome técnico | siglas e termos do PCDT (PQT-U, multibacilar, reação reversa, baciloscopia, ENH) |
| `técnico` | Como perguntaria um profissional de saúde: terminologia clínica do PCDT | colar a frase do documento |

**Pares de registro** (`need_group` P01 a P11; 22 vagas): as duas versões tratam **da mesma necessidade e têm os mesmos pontos-chave**. Só o registro muda. Escreva primeiro a versão técnica e depois a leiga, sem traduzir palavra por palavra. Esses pares testam a hipótese central do seu TCC: a expansão ajuda mais quando a pergunta está longe da linguagem do documento.

## Respondibilidade

| Valor | O que significa | Pontos-chave |
|---|---|---|
| `sim` | O corpus v1 (PCDT, páginas 15 a 113 sem exclusões) contém a resposta completa | 1 a 6 pontos |
| `parcial` | Uma parte está no corpus e a outra não (por exemplo, informação local ou posterior a 2022) | pontos da parte coberta + um ponto `INSUFICIENTE: <o que falta>` |
| `não` | Nada no corpus responde | um único ponto `INSUFICIENTE: <o que falta>` |

Para `não` e `parcial`, **confira** que a resposta realmente não está no corpus: busque no PDF (Ctrl+F) e em `research/corpus/pcdt2022-v1/chunks.jsonl`. Para a vaga T49, use `exclusions.csv`: o conteúdo deve existir só nas partes excluídas do PDF.

## Pontos-chave (`key_points`)

São a "resposta de referência" em forma verificável. O revisor das respostas compara cada resposta com eles.

- Separe com `|`, por exemplo: `Ponto 1 (p. 58) | Ponto 2 (p. 59)`.
- Cada ponto é **uma afirmação atômica** necessária para uma resposta correta, verificável no PCDT, com página.
- Doses, durações, idades e números exatamente como no PDF. Confira quadros e tabelas no PDF, porque o corpus lineariza tabelas (D05).
- Liste só o essencial: o que, se faltar ou estiver errado, torna a resposta incompleta ou incorreta. Detalhe acessório não entra.
- Nos pares, os pontos-chave das duas versões são idênticos.

`reference_pages`: páginas do PDF onde estão os pontos-chave (por exemplo, `58-59`).

## Revisão

Uma segunda pessoa (de preferência profissional de saúde) confere, sem reescrever por você:

- se a pergunta é clara e corresponde ao registro;
- se os pontos-chave estão corretos e completos segundo o PCDT;
- se a respondibilidade está certa.

Você ajusta o texto e a pessoa registra as iniciais em `reviewed_by`. Ajustes são permitidos até o congelamento.

## Converter, validar e congelar

A partir de `C:\TCC`:

```powershell
$R = "software\rag-study\.venv\Scripts\rag-study"
& $R --root . questions-build --sheet research/questions/authoring-sheet-v3.csv --out-dir research/questions
& $R --root . questions-check --questions research/questions/test-v1.jsonl `
    --blueprint research/questions/blueprint-v3.csv --keypoints research/questions/test-v1-keypoints.csv `
    --forbidden research/questions/smoke-v0.jsonl --corpus research/corpus/hanseniase-v2
& $R --root . questions-similarity --questions research/questions/test-v1.jsonl `
    --index research/corpus/hanseniase-v2/index-bge-m3 --corpus research/corpus/hanseniase-v2 `
    --embedder software/rag-study/config/embedder-bge-m3.json --out research/questions/similarity-test-v1.csv
```

O `questions-check` bloqueia o congelamento quando houver:

- vaga sem pergunta;
- campo diferente da matriz;
- autoria ausente;
- número de pontos-chave fora do intervalo;
- duas perguntas muito parecidas que não formem um par de registro previsto;
- reaproveitamento das perguntas smoke.

Avisos, como a falta de revisor, pedem a sua decisão.

Ao passar sem erros, registre os SHA-256 impressos em `research/protocol/freeze-log.md`. A partir daí, qualquer mudança gera `v2`; o `questions-build` se recusa a sobrescrever.

**Ordem obrigatória:** escrever as 50 perguntas e congelar **antes** de executar qualquer etapa. Depois do congelamento, nada muda, nem depois de ver os resultados da etapa 1.

## Esforço estimado

Cerca de 10 a 15 minutos por pergunta (ler a seção, escrever, pontos-chave), ou seja, 8 a 12 horas no total, mais a revisão. Com 10 perguntas por dia, fecha em 5 dias.
