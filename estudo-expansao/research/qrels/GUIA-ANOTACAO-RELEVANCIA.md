# Guia: anotação de relevância da etapa 1

Para: Nathan (anotação principal) e o segundo anotador. Data: 16/11/2026. Regras: `research/protocol/annotation-guideline-v0.1.md` e protocolo v0.4, seção 7.

A etapa 1 mediu quais trechos cada estratégia de busca trouxe. Para calcular Recall@5 e escolher a melhor estratégia (R\*), alguém precisa dizer, para cada par pergunta × trecho, se o trecho ajuda a responder. Esse julgamento é humano: nenhum modelo GPT ou Claude pode fazê-lo (D15), e eu não posso preencher nenhum rótulo.

## Arquivos

| Arquivo | Quem preenche | Conteúdo |
|---|---|---|
| `pool-stage1-autor.csv` | Nathan | os 797 pares do pool: os 5 primeiros trechos de cada condição e braço, mais todos os trechos das seções-alvo de cada pergunta |
| `pool-stage1-segundo.csv` | segundo anotador | os mesmos pares, só das 10 perguntas sorteadas (155 pares) (`second-rater-sample-v1.json`), sem os rótulos do autor |

Os pares estão embaralhados e não dizem qual condição ou modelo trouxe cada trecho. Não tente adivinhar.

## Como preencher

1. Abra o CSV no Excel; ele já vem com ponto e vírgula e acentos corretos.
2. Para cada linha, leia a pergunta (`question_text`) e o trecho (`chunk_text`, com `section` e `pages`). Preencha:
   - `relevance`: **0**, **1** ou **2** (tabela abaixo);
   - `annotator_id`: suas iniciais;
   - `annotation_round`: `autor` ou `segundo`;
   - `notes`: só quando ficar em dúvida (uma frase).
3. Salve como **CSV UTF-8 (delimitado por vírgulas)**. O Excel em português grava com ponto e vírgula, e o programa aceita. Não apague nem reordene colunas ou linhas.

| Rótulo | Quando usar |
|---|---|
| **2**, diretamente relevante | o trecho tem informação suficiente e diretamente ligada a pelo menos um ponto central da pergunta |
| **1**, parcialmente relevante | ajuda, mas de forma incompleta ou indireta, ou só faz sentido junto com outro trecho |
| **0**, irrelevante | não ajuda a responder, ou só parece com o tema na superfície |

## Casos que geram dúvida

- **Julgue o texto do trecho, não se a informação está atualizada.** Um trecho do PCDT de 2022 sobre um tema que uma portaria de 2026 alterou pode ser relevante, porque responde ao que foi perguntado. A divergência entre documentos é tratada na resposta (etapa 2), não aqui.
- **Documento da OMS (em inglês).** Vale o mesmo critério. Se o trecho só traz uma recomendação internacional que o Brasil não adota, julgue se ela ajuda a responder e anote em `notes`.
- **Perguntas sem resposta nos documentos** (test-012 a test-016): espera-se tudo 0. Se algum trecho responder, marque e anote, porque isso muda a classificação da pergunta.
- **Trechos de título ou sumário**, sem conteúdo: 0.

## Depois

1. Eu calculo a concordância entre os dois anotadores (kappa com peso linear) nas 10 perguntas, antes de qualquer ajuste.
2. Nos pares em que os dois discordarem, o autor decide o rótulo final (adjudicação), e a decisão fica registrada.
3. Com os rótulos finais, eu calculo as métricas da etapa 1, a família F1 e a regra de escolha de R\*, e preparo a etapa 2.

Tamanho: 797 pares para o autor (de 6 a 29 por pergunta, mediana de 16) e 155 para o segundo anotador. Com cerca de 30 segundos por par, são umas 6 a 7 horas para o autor e 1 h 20 min para o segundo anotador. Dá para dividir em vários dias; salve com frequência.
