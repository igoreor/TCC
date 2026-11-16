# Guia do autor: planilha v4

Para: Nathan. Data: 16/11/2026. Vale para `authoring-sheet-v4.csv` (D42: só perguntas publicadas). O `AUTHORING-GUIDE.md` foi escrito quando você ia redigir parte das perguntas; nesta versão, você não escreve nem altera nenhuma pergunta.

**Só comece depois que o orientador aprovar a troca para perguntas publicadas** (item O1 do `DUVIDAS.md`). Se ele recusar, volta a valer a v3.

## O que já está preenchido

Texto literal da pergunta, fonte, link, origem (`real`), quem escolheu (`agente_confirmado`), seções-alvo e páginas. Não mexa nessas colunas.

## O que você preenche (por linha)

| Coluna | O que escrever |
|---|---|
| `author` | suas iniciais (por exemplo, NDLS). Significa "li a pergunta e confirmo que ela entra". Se não concordar com alguma, deixe em branco e anote o motivo em `notes`; eu troco por outra do mesmo grupo |
| `created_on` | a data em que confirmou (AAAA-MM-DD) |
| `key_points` | de 1 a 6 afirmações curtas que uma resposta correta precisa ter, separadas por barra vertical: `Ponto 1 (p. 58) \| Ponto 2 (p. 59)` |
| `reference_pages` | as páginas onde estão os pontos (ex.: `58-59`) |
| `reviewed_by` | fica em branco; quem preenche é o revisor independente |

Abra o CSV direto no Excel (ele já vem com ponto e vírgula e acentos corretos) e salve como **CSV UTF-8**. Não renomeie nem reordene colunas.

## Como escrever os pontos-chave

- **Fonte:** os trechos e as páginas de cada pergunta estão no `reading-pack-v4.md`. Confira doses, idades e prazos no PDF, porque as tabelas foram linearizadas no corpus.
- **Atômico:** uma informação por ponto. Se faltar ou estiver errada, a resposta fica incompleta ou incorreta.
- **Quantidade:** pergunta simples, de 1 a 3 pontos (acima de 3 gera aviso). Pergunta composta, pelo menos 2 (com menos, gera erro). Compostas: T11, T17, T18, T21, T23, T25, T29, T30, T33, T34, T40 e T48.
- **Normas de 2026:** em T03 (qPCR, Portaria 51) e T11 (evento adverso, Portaria 47), o ponto segue a norma mais recente. Quando a OMS recomenda algo que o PCDT não adota, o ponto diz qual é a recomendação brasileira.
- **Sem IA:** escreva sem ajuda de ChatGPT, Claude ou outro modelo das famílias avaliadas (D15). Isso é declarado na metodologia.

## Casos especiais

**Pares leigo-técnico.** As duas perguntas do par têm exatamente os mesmos pontos-chave; copie e cole. Se forem diferentes, o `questions-check` dá erro.

| Par | Vagas |
|---|---|
| P01 | T04 e T05 |
| P02 | T22 e T23 (T23 é composta, então o par precisa de pelo menos 2 pontos) |
| P03 | T36 e T37 |
| P04 | T38 e T39 |

**Não respondíveis** (T12, T13, T14, T15 e T16). Escreva um único ponto, começando por `INSUFICIENTE:`, dizendo o que falta nos documentos. Antes, leia os trechos em `na-check-v4.md` e confirme que nenhum responde. Se algum responder, anote em `notes`.

**Parciais** (T27, T35 e T42). Escreva os pontos da parte que os documentos cobrem e mais um ponto `INSUFICIENTE: ...` com a parte que falta. Na T35 (dose supervisionada perdida, EXT031), leia com atenção o trecho de monitoramento da seção 14.1.1 do PCDT.

## Quando terminar

Me avise. Eu rodo `questions-build` e `questions-check`, aponto o que precisar de ajuste e, com zero erros, preparo o pacote para o revisor independente. Depois da revisão, as perguntas são congeladas e a etapa 1 pode rodar (roteiro em `research/protocol/roteiro-congelamento-e-execucao-v1.md`).

Tempo estimado: de 8 a 10 horas.
