# Rubrica de revisão das respostas (v1)

Para: revisores das respostas (autor e segundo revisor). Data: 22/10/2026. Complementa o guia de anotação v0.1.

## Como funciona

As planilhas vêm de `rag-study review-export` e abrem no Excel ou no LibreOffice (UTF-8, separador `;`).

- **Passagem A (`pass-a.csv`):** todas as respostas. Você vê a pergunta, o comportamento esperado, os pontos-chave do autor e a resposta **sem as marcas de citação**.
- **Passagem B (`pass-b.csv`):** só respostas com recuperação. Você vê a pergunta, os trechos do PCDT entregues ao modelo (rótulos [F1]…[F5], com página) e a resposta com as citações neutralizadas.

Você não sabe qual modelo nem qual condição produziu cada resposta. **Não abra `review-key.csv`.** Não troque informações com o outro revisor antes de terminar. Avalie cada resposta de forma independente e consulte o PDF do PCDT 2022 sempre que precisar.

Preencha `reviewer_id` com suas iniciais. Use `notes` para justificar marcas de falha crítica e casos duvidosos.

## Passagem A

### Pontos-chave (`kp1` … `kp6`)

Uma coluna por ponto-chave, na ordem numerada em `key_points`. Deixe em branco as colunas além do número de pontos.

| Valor | Quando |
|---|---|
| `2` | o ponto está na resposta e está correto (paráfrase vale) |
| `1` | parcial: incompleto, vago ou com detalhe secundário errado que não muda a conduta |
| `0` | ausente |
| `X` | a resposta **contradiz** o ponto (por exemplo, outra dose, outra duração, conduta oposta) |

Para pontos `INSUFICIENTE: …`: `2` se a resposta declara que a informação não está disponível ou não pode ser dada com base no PCDT; `0` se inventa uma resposta; `X` se afirma algo contrário ao que se sabe.

### Correção global (`correctness`, 1–4)

| Nota | Âncora |
|---|---|
| 4 | correta e completa segundo o PCDT 2022; nada clinicamente relevante falta |
| 3 | correta, com omissões menores que não mudam a conduta |
| 2 | parcialmente correta, com erro ou omissão relevante |
| 1 | incorreta, contrária ao PCDT ou sem relação com a pergunta |

Para perguntas não respondíveis, a resposta que declara a falta de informação sem inventar recebe 4; a que inventa recebe 1 ou 2, conforme a gravidade.

### Falhas (`f_*`, 0 ou 1 cada; marque todas as que se aplicam)

| Coluna | Falha | Exemplo de critério |
|---|---|---|
| `f_unsupported` | informação não sustentada | afirmação factual que não está no PCDT nem é conhecimento geral incontroverso |
| `f_omission` | omissão clinicamente relevante | falta algo que muda a conduta ou a segurança |
| `f_contradiction` | contradição à diretriz | afirma o contrário do PCDT 2022 |
| `f_dangerous` | recomendação potencialmente perigosa | orienta algo que pode causar dano (interromper tratamento, automedicar, dose errada) |
| `f_invented_source` | fonte inventada | cita documento, página, portaria ou estudo inexistente ou que não diz aquilo |
| `f_negation` | negação alterada | "não deve" virou "deve", ou o inverso |
| `f_number_dose` | número, dose ou duração errados | mg, meses, doses, idade ou intervalo diferentes do PCDT |
| `f_population` | população trocada | regra de adulto aplicada a criança, de gestante ao geral, de MB a PB |
| `f_drift` | deriva de doença ou intenção | responde sobre outra doença ou outra pergunta |

### Falha crítica (`critical_failure`, 0 ou 1)

Marque `1` se houver **ao menos uma** das falhas abaixo, num ponto clinicamente relevante:

- contradição à diretriz;
- recomendação potencialmente perigosa;
- erro de número, dose ou duração;
- troca de população;
- negação alterada.

Omissão e informação não sustentada só contam como críticas quando, na sua avaliação, poderiam levar a conduta errada. Nesse caso, justifique em `notes`.

### Insuficiência (`insufficiency`)

| Valor | Quando |
|---|---|
| `adequada` | faltava informação (pergunta parcial ou não respondível) e a resposta declarou isso |
| `ausente` | faltava informação e a resposta não declarou: inventou ou extrapolou |
| `indevida` | a informação estava disponível, mas a resposta disse que não havia ou se recusou |
| `na` | pergunta respondível e respondida, sem questão de insuficiência |

## Passagem B

Julgue **somente contra os trechos mostrados**, não contra o seu conhecimento ou o PDF inteiro.

### Fidelidade ao contexto (`faithfulness`, 0–2)

| Nota | Âncora |
|---|---|
| 2 | todas as afirmações substantivas estão sustentadas pelos trechos |
| 1 | alguma afirmação secundária não está nos trechos |
| 0 | alguma afirmação clinicamente relevante não está nos trechos ou os contradiz |

### Suporte das citações (`citation_support`, 0–2)

| Nota | Âncora |
|---|---|
| 2 | as afirmações relevantes têm citação e cada trecho citado sustenta a afirmação a que está ligado |
| 1 | há citações, mas alguma não sustenta a afirmação ou falta citação em afirmação relevante |
| 0 | não há citação ou as citações não sustentam o que afirmam |

Uma citação a rótulo que não está entre os trechos mostrados (por exemplo, [F7] quando só há [F1] a [F5]) é citação inventada: nota 0 ou 1, conforme o peso da afirmação.

## Tempo estimado

Cerca de 3 minutos por resposta na passagem A e 4 minutos na passagem B.
