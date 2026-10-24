# Base oficial em produção e escolha do modelo gerador

Relatório de 24/10/2026. Complementa o [diagnóstico e refatoração do RAG](rag-diagnostico-e-refatoracao.md), que descreve a versão avaliada aqui (branch `feat/rag-documentos-oficiais`).

## Resumo

- A base oficial foi indexada no banco de produção (Neon): 5 documentos, 328 trechos, todos com *embedding* `text-embedding-3-small`.
- Com os *embeddings* da OpenAI, a recuperação passou a encontrar a evidência entre os 8 primeiros trechos em todas as perguntas que a têm (revocação@8 = 1,00). Antes, no modo local, esse valor era 0,84; na versão anterior do sistema, 0.
- Seis configurações de modelo gerador foram comparadas no conjunto de referência (32 perguntas), duas vezes cada. Todas tiveram o comportamento esperado em 100% das perguntas.
- **Modelo escolhido: `gpt-6-luna` com o raciocínio desligado (`reasoning_effort: none`).** Teve o desempenho dos demais, a maior precisão de citações, respostas mais diretas e o menor custo: US$ 0,54 por 1.000 perguntas, contra US$ 0,91 do `gpt-4o-mini` usado até então (−41%).
- A avaliação revelou três problemas, já corrigidos:
  1. o cliente da OpenAI não funcionava com os modelos GPT-5 e GPT-6;
  2. o verificador de citações ignorava marcadores escritos depois do ponto final;
  3. o detector de respostas que declaram a lacuna da base deixava passar formulações comuns.

## 1. O que foi executado em produção

| Etapa | Resultado |
|---|---|
| Migrations (`prisma migrate status`) | 7 migrations, banco atualizado |
| Indexação (`npm run prisma:seed`) | 328 trechos com *embedding* novo, em 5 documentos; 5 registros de ingestão com situação "concluída" |
| Base inicial de desenvolvimento | 11 documentos e 15 trechos mantidos com situação "desenvolvimento", inativos (fora da busca) |
| Conjunto de referência | 32 perguntas no banco: 26 criadas e 19 antigas substituídas (6 já existiam com o mesmo texto) |
| Índices | HNSW (cosseno) sobre o *embedding* e GIN sobre o texto sem acentos |

| Documento | Trechos |
|---|---|
| PCDT da Hanseníase (Ministério da Saúde, 2022) | 131 |
| Estratégia Nacional para Enfrentamento à Hanseníase 2024–2030 (Ministério da Saúde, 2024) | 39 |
| Diretrizes para o diagnóstico, tratamento e prevenção da hanseníase (OMS, 2019, tradução) | 49 |
| Management of reactions and prevention of disabilities (OMS, 2020, em inglês) | 63 |
| Estratégia Global de Hanseníase 2021–2030 (OMS, 2021, tradução) | 46 |

A produção ainda executa a versão anterior do código: as mudanças estão no branch e só entram no ar com o merge na `main`. A versão anterior continua funcionando com o banco migrado, mas sem a busca por documento ativo nem as fontes documentais.

## 2. Método da comparação

- **Conjunto:** 32 perguntas de `knowledge-base/evaluation/golden-questions.json`, em 10 categorias:
  - predefinidas, diretas, combinação, sinônimos, continuação e difíceis;
  - sem resposta na base, divergência entre o Ministério da Saúde e a OMS;
  - segurança, regressão.
- **Execução:** cada configuração fez 34 consultas, porque duas perguntas de continuação são precedidas da pergunta anterior.
- **Ambiente:** banco de produção, somente leitura; as conversas ficam em memória.
- **Parâmetros fixos:** `text-embedding-3-small`, top-K 20, top-N 8 e similaridade mínima 0,25.
- **O que variou:** só o modelo, usado na interpretação da pergunta e na redação da resposta.
- **Configurações:**
  - `gpt-4o-mini` (referência, em uso até então);
  - `gpt-4.1-mini`;
  - `gpt-5-mini` (raciocínio `low`);
  - `gpt-5.6-luna` (`low`);
  - `gpt-6-luna` (`low` e `none`).
- **Escopo:** apenas modelos de custo comparável ao da referência, disponíveis na conta. O objetivo era o menor custo que mantivesse o desempenho, e não o melhor modelo a qualquer preço.
- **Repetições:** duas execuções por configuração, porque a interpretação da pergunta e a redação variam entre execuções.
- **Custo:** a segunda execução registrou os tokens efetivamente consumidos (entrada, entrada em cache, saída e raciocínio). O custo foi calculado com a [tabela de preços da OpenAI](https://developers.openai.com/api/docs/pricing), consultada em 24/10/2026.

Métricas (definidas em `src/modules/evaluation/golden-evaluation.ts`):

| Métrica | O que mede |
|---|---|
| Comportamento correto | Respondeu, recusou pelo motivo esperado ou declarou a lacuna da base, conforme o esperado |
| Revocação@5 / @8 | Algum dos 5 (8) primeiros trechos enviados ao modelo é do documento da evidência e cobre as páginas indicadas |
| Revocação da evidência | Fração dos itens de evidência da pergunta presentes entre os trechos enviados ao modelo |
| Precisão das citações | Fração das fontes citadas que correspondem à evidência (limite inferior: outro trecho pode sustentar a mesma frase) |
| Citações verificadas | Fração das fontes citadas confirmadas pela verificação automática (termos em comum ou similaridade semântica) |
| Fatos-chave | Fração dos termos esperados presentes na resposta (indicador lexical de completude, não avaliação clínica) |

## 3. Resultados

Segunda execução, com o mesmo código para todas as configurações:

| Modelo | Raciocínio | Comportamento correto | Revocação@5 | Revocação@8 | Revocação da evidência | Precisão das citações | Citações verificadas | Fatos-chave | Mediana (s) | Resposta (caracteres) |
|---|---|---|---|---|---|---|---|---|---|---|
| `gpt-4o-mini` | — | 1,00 | 1,00 | 1,00 | 0,82 | 0,51 | 0,94 | 0,97 | 7,9 | 1.530 |
| `gpt-4.1-mini` | — | 1,00 | 0,96 | 1,00 | 0,86 | 0,43 | 1,00 | 0,98 | 7,2 | 2.360 |
| `gpt-5-mini` | low | 1,00 | 0,92 | 1,00 | 0,82 | 0,39 | 1,00 | 0,99 | 17,4 | 3.340 |
| `gpt-5.6-luna` | low | 1,00 | 0,96 | 0,96 | 0,83 | 0,47 | 0,99 | 0,96 | 8,7 | 2.025 |
| `gpt-6-luna` | low | 1,00 | 0,96 | 1,00 | 0,85 | 0,64 | 0,94 | 0,96 | 8,2 | 1.275 |
| **`gpt-6-luna`** | **none** | **1,00** | **0,96** | **1,00** | **0,87** | **0,62** | **1,00** | **0,98** | **7,3** | **1.231** |

A mediana é o tempo total de cada consulta: análise da pergunta, *embeddings*, busca no banco, geração e verificação.

Na primeira execução, os valores ficaram próximos, com diferença de no máximo 0,08 em cada métrica. Os relatórios completos, com resposta, fontes e trechos de cada pergunta, estão em `knowledge-base/evaluation/results/2026-10-24-producao-*.json` (primeira execução) e `2026-10-24-producao2-*.json` (segunda).

Custo medido (segunda execução, 34 consultas e 29 respostas geradas; as 5 recusas não chamam a geração):

| Modelo | Raciocínio | Entrada por resposta (tokens) | Saída por resposta (tokens) | Raciocínio por resposta (tokens) | Custo da execução (US$) | Custo por 1.000 perguntas (US$) |
|---|---|---|---|---|---|---|
| `gpt-4o-mini` | — | 4.843 | 357 | 0 | 0,0310 | 0,91 |
| `gpt-4.1-mini` | — | 4.865 | 539 | 0 | 0,0740 | 2,18 |
| `gpt-5-mini` | low | 4.946 | 1.066 | 258 | 0,1223 | 3,60 |
| `gpt-5.6-luna` | low | 4.866 | 471 | 0 | 0,0535 | 1,57 |
| `gpt-6-luna` | low | 4.770 | 297 | 9 | 0,0228 | 0,67 |
| **`gpt-6-luna`** | **none** | **4.762** | **280** | **0** | **0,0184** | **0,54** |

O custo inclui a análise da pergunta, a resposta e os *embeddings* das consultas. A entrada por resposta (≈4.800 tokens) vem quase toda dos 8 trechos enviados como contexto.

### Leitura dos resultados

- **Comportamento:** todas as configurações acertaram as 32 perguntas. Recusaram as 5 que deviam recusar (prescrição, fora do escopo, diagnóstico de caso, interrupção de tratamento por paciente, dose por peso). Responderam as demais, inclusive as 3 de regressão, que a versão anterior recusava indevidamente, e declararam a lacuna nas 2 sem resposta na base.
- **Recuperação:** varia pouco entre os modelos (revocação@5 de 0,92 a 1,00), porque a busca é a mesma. A diferença vem das consultas que cada modelo escreve na interpretação da pergunta. Com o modelo escolhido, a única pergunta com a evidência fora dos 5 primeiros trechos foi a R03 ("Quando devo encaminhar o paciente para a atenção especializada?"), e ela ficou entre os 8.
- **Citações:** o `gpt-6-luna` cita de forma mais seletiva. A precisão ficou entre 0,61 e 0,64, contra 0,39 a 0,51 dos demais, e a fração de citações verificadas foi equivalente.
- **Tamanho e tempo:** o `gpt-5-mini` escreve respostas 2,7 vezes mais longas que as do escolhido e leva mais que o dobro do tempo (17 s), sem ganho nas métricas. O raciocínio `low` do `gpt-6-luna` não melhorou nada em relação ao `none` e custou 24% a mais.

## 4. Problemas encontrados e corrigidos

1. **Modelos GPT-5 e GPT-6 recusavam os parâmetros enviados.** Esses modelos rejeitam `max_tokens` (exigem `max_completion_tokens`) e só aceitam temperatura diferente de 1 com o raciocínio desligado. Com o código anterior, trocar `CHAT_MODEL` na Vercel faria toda resposta cair no modo extrativo, sem aviso.
   - O cliente agora ajusta os parâmetros pela família do modelo (`chatCompletionParameters`) e reserva tokens para o raciocínio.
   - Aceita `CHAT_REASONING_EFFORT`.
   - Inclui a mensagem da OpenAI no erro registrado e trata resposta vazia como falha.
2. **Verificador de citações.** O `gpt-6-luna` escreve o marcador depois do ponto ("…é clínico. [1][2]"). A divisão em frases deixava o marcador sozinho, sem texto para conferir, e a citação aparecia como "não confirmada". Corrigido: marcadores depois do ponto passam a se referir à frase anterior. Na primeira execução do `gpt-6-luna`, as citações verificadas subiram de 19% para 95%.
3. **Detector de lacuna da avaliação.** As respostas às perguntas sem resposta na base declaravam corretamente a lacuna ("Não há, nos trechos consultados…", "os trechos não informam…"), mas o detector não reconhecia essas formas.
   - O padrão foi ampliado, com teste.
   - Os relatórios gravados foram recalculados a partir das respostas registradas (`npm run eval:rescore`). Nenhuma configuração tinha, de fato, errado essas perguntas.

## 5. Decisão

**`CHAT_MODEL=gpt-6-luna` com `CHAT_REASONING_EFFORT=none`** passa a ser o padrão do código (`src/config/env.ts`). Critérios, em ordem:

1. desempenho nas métricas equivalente ao da referência, considerando a variação entre execuções;
2. menor custo por pergunta;
3. tempo de resposta adequado ao uso interativo.

O `gpt-6-luna` sem raciocínio atende aos três:

- tem as mesmas métricas de comportamento, recuperação e completude;
- tem a maior precisão de citações;
- tem o menor custo (41% abaixo do `gpt-4o-mini`);
- tem tempo mediano de 7,3 s, próximo do menor observado (7,2 s, do `gpt-4.1-mini`).

Para referência de escala: 1.000 perguntas custam cerca de US$ 0,54, e o conjunto de avaliação inteiro custa US$ 0,02 por execução.

### Como aplicar na Vercel (projeto `nexohansen-api`)

1. Fazer o merge do branch na `main`. O deploy é automático.
2. Depois do deploy, conferir em **Settings › Environment Variables** se existe `CHAT_MODEL`:
   - se não existir, não é preciso fazer nada, porque o padrão do código já é o `gpt-6-luna` sem raciocínio;
   - se existir com `gpt-4o-mini`, remover a variável ou trocá-la por `gpt-6-luna` e fazer *redeploy*.
3. **Não** trocar `CHAT_MODEL` antes do deploy da versão nova: o código anterior envia `max_tokens`, que o `gpt-6-luna` recusa.

Para voltar ao modelo anterior, basta definir `CHAT_MODEL=gpt-4o-mini`. O cliente ajusta os parâmetros sozinho.

## 6. Limitações

- O conjunto tem 32 perguntas, elaboradas pelo desenvolvedor com conhecimento da base. Diferenças pequenas entre modelos estão dentro da variação entre execuções.
- Fatos-chave e verificação de citações são indicadores automáticos e lexicais. Não substituem a revisão das respostas por profissional de saúde, que não foi feita.
- Um exemplo concreto: na F02 ("E para crianças?", depois do esquema da PQT-U para adultos), o `gpt-6-luna` afirmou que os documentos não detalham o esquema para crianças com mais de 50 kg. O Quadro 1 do PCDT indica a PQT-U Adulto para pacientes acima de 50 kg, mas, no texto extraído do PDF, as linhas e as colunas do quadro aparecem separadas. A cobertura de fatos-chave dessa resposta foi 100%. Extrair as tabelas principais de forma estruturada é a melhoria indicada.
- Preços, disponibilidade e comportamento dos modelos podem mudar. A avaliação vale para as versões disponíveis em 24/10/2026 e deve ser repetida ao trocar de modelo (`npm run eval:rag -- --label <nome>`).
- Os limiares (similaridade mínima 0,25 e pontuação textual 0,1) não foram calibrados sistematicamente. Nenhuma pergunta respondível foi recusada por evidência insuficiente.

## 7. Como reproduzir

```bash
cd backend
# banco e chave em .env (DATABASE_URL e OPENAI_API_KEY); a avaliação não grava no banco
CHAT_MODEL=gpt-6-luna CHAT_REASONING_EFFORT=none npm run eval:rag -- --label gpt-6-luna-none
npm run eval:rescore -- knowledge-base/evaluation/results/<arquivo>.json   # recalcula após mudar critérios
```
