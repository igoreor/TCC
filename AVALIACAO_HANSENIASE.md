# Avaliação da IA do projeto (RAG) — Hanseníase: 50 perguntas × 2 execuções, com tripla validação

> Documento de entrada para o Claude Code. Contém (1) o prompt de execução, (2) o protocolo de métricas e da tripla validação, (3) as 50 perguntas e (4) o contexto metodológico da curadoria das perguntas.
>
> Fonte das perguntas: *Perguntas_Metodologia_e_Respostas_Hanseniase.docx* (base de 27/10/2026, versão organizada em 30/10/2026). As respostas que existiam no documento original foram **removidas de propósito**: eram ilustrativas, geradas por outro modelo, e não servem como referência. Só as perguntas são usadas.

---

## Visão geral do fluxo

```
                     50 perguntas (PARTE 3)
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
  Trilha A — IA do projeto (RAG)       Trilha B — Respostas de referência
  2 execuções por pergunta             extraídas do corpus documental,
  → 100 respostas                      com citações (sem ver a Trilha A)
          │                                       │
          └───────────────────┬───────────────────┘
                              ▼
   VALIDAÇÃO 1 — Coerência         a resposta é pertinente, internamente
                                   consistente e estável entre execuções?
                              ▼
   VALIDAÇÃO 2 — Conformidade      a resposta está correta segundo os
   documental                      documentos do corpus?
                              ▼
   VALIDAÇÃO 3 — Especialista      pesquisadora da área revisa as respostas
                                   de referência e as respostas da IA;
                                   o parecer dela prevalece nas divergências
                              ▼
          Métricas finais → Relatório → Atualização do TCC
```

As validações 1 e 2 são feitas de forma automatizada, por um modelo de linguagem atuando como avaliador segundo rubrica fixa (abordagem conhecida na literatura como *LLM-as-a-judge*). A validação 3 é humana e é a instância final de verificação.

---

## PARTE 1 — PROMPT PARA O CLAUDE CODE

Salve este arquivo na raiz do repositório como `AVALIACAO_HANSENIASE.md`, copie tudo entre as linhas `=====` e cole no Claude Code.

=====

Você vai conduzir a avaliação experimental da IA deste projeto (o sistema RAG de perguntas e respostas sobre hanseníase que está neste repositório) e, ao final, atualizar o texto do meu TCC com o procedimento e os resultados. Tenho pouco tempo, então trabalhe de forma autônoma sempre que a decisão for clara, mas sem sacrificar rastreabilidade.

Leia o arquivo `AVALIACAO_HANSENIASE.md` inteiro antes de começar. Ele traz as 50 perguntas e o protocolo de métricas.

**Desenho do estudo — tripla validação:**

- **Trilha A:** enviar cada uma das 50 perguntas à IA do projeto **duas vezes** e registrar as respostas.
- **Trilha B:** em paralelo, consultar os documentos do corpus e produzir, para cada pergunta, a **resposta de referência** fundamentada nos documentos, com citações.
- **Validação 1 (coerência):** a resposta da IA responde ao que foi perguntado, é internamente consistente, usa linguagem adequada ao público e é estável entre as duas execuções?
- **Validação 2 (conformidade documental):** a resposta da IA está correta quando confrontada com a resposta de referência e com os trechos do corpus?
- **Validação 3 (especialista):** uma pesquisadora da área revisa as respostas de referência e as respostas da IA, usando uma ficha que você vai preparar. O parecer dela prevalece quando divergir das validações 1 e 2.

### Regras gerais

1. **Não altere a IA avaliada.** Não mude prompts de sistema, corpus, índices, parâmetros, modelo ou código de recuperação durante o experimento. Se um bug impedir a execução, pare e me pergunte.
2. **Não edite respostas da IA.** Salve exatamente o que veio, inclusive erros, recusas e respostas vazias.
3. **A referência é o corpus documental**, e só ele: PCDT da Hanseníase (2022), Portarias SCTIE/MS nº 47 e nº 51/2026, Estratégia Nacional 2024–2030 e orientação técnica da OMS (2023), nas versões que estão no repositório. Não use conhecimento próprio nem fontes externas para construir a resposta de referência. Se o corpus não responde, a referência é "o corpus não responde", e isso também é um resultado.
4. **Isolamento das trilhas.** A Trilha B não pode ver nenhuma resposta da Trilha A. Se usar subagentes para rodar em paralelo, o agente da Trilha B não recebe nem lê `execucoes.jsonl`. Grave o SHA-256 das referências antes de qualquer comparação.
5. **Não invente nada, em especial sobre a validação 3.** Você não escreve pareceres, observações, nome, formação ou números atribuídos à pesquisadora. Tudo que depende dela entra no TCC como marcação em amarelo para eu preencher depois que ela fizer a revisão.
6. **Descreva o método como ele foi feito.** No texto do TCC, as validações 1 e 2 são descritas como avaliação automatizada por modelo de linguagem de grande porte atuando como avaliador segundo rubrica, com identificação do modelo e versão em nota ou apêndice. Não atribua essas etapas à pesquisadora nem a "comparação manual".
7. Trabalhe tudo dentro da pasta `avaliacao/` (crie se não existir), com scripts versionáveis (Python de preferência).
8. Mantenha um `avaliacao/DIARIO.md` com data/hora, cada decisão e cada problema encontrado. Ele vira o apêndice metodológico.

### Fase 0 — Reconhecimento (me reporte antes das 100 chamadas)

1. Descubra como a IA do projeto é invocada (API local, endpoint HTTP, função Python, CLI etc.) e escreva um adaptador `avaliacao/cliente_ia.py` com uma função `perguntar(texto) -> dict` que retorne, no mínimo: resposta, trechos/fontes recuperados (se o sistema expuser), latência em ms, tokens de entrada/saída (se disponível), modelo e parâmetros usados.
2. Localize os documentos do corpus no repositório e liste nome, caminho, SHA-256 e se o documento está completo ou recortado (a pergunta T49 pressupõe que seções do PCDT foram excluídas do corpus: identifique quais).
3. Localize o arquivo do TCC no repositório (.docx, LaTeX, Markdown ou outro) e identifique as seções de Metodologia, Resultados, Discussão/Limitações e Apêndices. Se não encontrar, pergunte onde está.
4. Grave a configuração congelada em `avaliacao/config_experimento.json`: commit do git, modelo, temperatura, top-k/top-p, prompt de sistema (texto e hash), parâmetros de recuperação (k, tamanho de chunk, modelo de embeddings), SHA-256 de cada documento do corpus.
5. Faça uma chamada de teste com uma pergunta **fora** do conjunto (ex.: "O que é hanseníase?") para validar o adaptador. Ela não entra nos resultados.
6. Me mostre um resumo curto: como vai chamar a IA, onde está o corpus, onde está o TCC, qual a configuração. Se eu não responder e tudo estiver claro e funcionando, prossiga e registre no DIARIO que seguiu sem confirmação.

### Fase 1 — Congelamento das perguntas

1. Extraia as 50 perguntas da PARTE 3 para `avaliacao/perguntas.json`, com os campos: `id`, `tema`, `registro` (leigo/técnico), `origem` (publicada/adaptação/autoral/em decisão), `pergunta`, `composta` (true/false).
2. O campo `composta` não vem no documento (a matriz prevê 35 simples e 15 compostas). Classifique como composta a pergunta que pede duas ou mais informações distintas e marque `"composta_fonte": "inferida"`. Se a contagem não der 15, não force: registre a divergência no DIARIO.
3. Remova os marcadores ¹ e ² do texto enviado à IA (são chamadas de nota de rodapé do documento de origem, sem texto correspondente) e registre isso.
4. Calcule o SHA-256 de `perguntas.json` e grave em `avaliacao/perguntas.sha256`. A partir daqui o arquivo não muda.

### Fase 2 — Trilha A: execução na IA do projeto (2 rodadas × 50 = 100 respostas)

1. Rodada 1 e rodada 2, cada uma com as 50 perguntas em **ordem aleatória diferente** (registre a semente).
2. Cada chamada é **independente**: sessão nova, sem histórico e sem memória entre perguntas ou rodadas.
3. Use exatamente os parâmetros congelados na Fase 0. Não reduza a temperatura para "estabilizar" as respostas: a variação entre execuções é uma das coisas medidas.
4. Salve cada chamada em `avaliacao/execucoes.jsonl`: `id_execucao`, `id_pergunta`, `rodada`, `posicao_na_ordem`, `timestamp`, `resposta`, `fontes_recuperadas`, `latencia_ms`, `tokens`, `erro`.
5. Em erro técnico (timeout, HTTP 500), tente de novo até 2 vezes, registrando cada tentativa. Se persistir, marque como falha técnica (não como resposta errada).

### Fase 3 — Trilha B: respostas de referência a partir dos documentos (em paralelo à Fase 2)

Para cada pergunta, leia as seções pertinentes do corpus e produza em `avaliacao/referencias.json`:

- `resposta_referencia`: a resposta correta e completa, em 2 a 6 frases, escrita **no registro da pergunta** (leigo ou técnico) e sustentada apenas pelo corpus.
- `pontos_chave`: 2 a 6 afirmações atômicas que uma resposta correta deve conter, cada uma com `documento`, `secao_ou_pagina` e `trecho` (citação curta e literal do corpus que a sustenta).
- `pontos_proibidos`: afirmações que contrariam o corpus e seriam graves se aparecessem (dose errada, contraindicação ignorada, orientar suspensão do tratamento por conta própria, talidomida em gestante etc.).
- `cobertura`: **integral**, **parcial** ou **não respondível** pelo corpus, com justificativa. A matriz de curadoria previu 42 integrais, 3 parciais e 5 não respondíveis; compare e registre a diferença, sem forçar.
- `comportamento_esperado`: para parciais, qual parte deve ser respondida e qual deve ser declarada fora do corpus; para não respondíveis, o ideal é a IA reconhecer a limitação, não inventar e indicar onde buscar.
- `documentos_consultados` e `termos_buscados`.

Regras: busque de forma ampla (termos-chave, sinônimos, leitura da seção inteira); se documentos divergirem (ex.: PCDT 2022 × Portarias 2026), a referência segue a norma mais recente e registra a divergência; T36 está "em decisão" na curadoria e é reportada à parte, fora das médias principais. Ao terminar, grave o SHA-256 em `avaliacao/referencias.sha256` **antes** de abrir qualquer resposta da Trilha A.

### Fase 4 — Validações 1 e 2 (automatizadas e cegas)

1. Gere `avaliacao/para_avaliar.jsonl` com as 100 respostas **embaralhadas**, identificadas só por um código anônimo (sem rodada nem posição).
2. **Validação 1 — coerência:** aplique as métricas da seção 2.1 a cada resposta.
3. **Validação 2 — conformidade documental:** aplique as métricas da seção 2.2, comparando com `referencias.json`. Registre as afirmações da resposta classificadas como sustentada / não sustentada / contraditória.
4. Grave tudo em `avaliacao/avaliacoes.jsonl`, com justificativa curta por nota.
5. Se a IA trouxer algo **correto e sustentado pelo corpus** que a referência deixou de fora, não penalize: registre como "lacuna da referência". Não altere `referencias.json` (hash congelado); crie `referencias_erratas.json` e reporte quantas houve.
6. Só depois de avaliar todas, desfaça o anonimato e calcule a consistência entre execuções (seção 2.1).

### Fase 5 — Preparação da validação 3 (especialista)

Gere `avaliacao/validacao_especialista/ficha_pesquisadora.xlsx`, pensada para uma pessoa da área de saúde preencher sem precisar abrir o repositório:

- **Aba "Instruções"**: objetivo, o que avaliar, significado de cada opção, tempo estimado. Linguagem simples, sem jargão de computação.
- **Aba "Referências"**: as 50 respostas de referência com os trechos do corpus que as sustentam. Colunas para ela preencher: `referencia_correta` (sim / parcialmente / não), `correcao_sugerida`, `comentario`.
- **Aba "Respostas da IA"**: pergunta, resposta de referência, resposta da IA (rodada 1 e rodada 2 em linhas separadas). Inclua **todas** as respostas sinalizadas pelas validações 1 e 2 (incorretas, com alerta de segurança, com alucinação, com recusa indevida ou com veredito diferente entre as rodadas) e uma amostra aleatória de 20 das demais (semente registrada). Para manter a revisão independente, **não mostre** as notas automatizadas nessa aba. Colunas para ela: `veredito` (correta / parcialmente correta / incorreta), `risco_clinico` (nenhum / baixo / alto), `comentario`.
- **Aba "Identificação"**: campos em branco para nome, formação, titulação, vínculo institucional, data da revisão.

Use listas suspensas (validação de dados) nos campos de escolha. Prepare também `avaliacao/validacao_especialista/consolidar.py`, que, a partir da ficha preenchida: calcula a concordância entre a validação 2 e a validação 3 (kappa de Cohen ponderado e % de concordância), aplica o parecer da pesquisadora como veredito final nas respostas que ela revisou, recalcula todas as métricas finais e regenera tabelas e gráficos. Até a ficha voltar preenchida, as métricas do relatório são as das validações 1 e 2, identificadas como resultados preliminares.

### Fase 6 — Métricas e relatório

Calcule tudo por script (`avaliacao/metricas.py`) e gere:

- `avaliacao/resultados/metricas_por_resposta.csv`, `metricas_por_pergunta.csv` (referência, rodada 1 e rodada 2 lado a lado) e `resumo.csv`.
- `avaliacao/resultados/graficos/`: PNG em 300 dpi, rótulos em português: acurácia por tema, por registro e por origem; matriz de abstenção; consistência entre rodadas; e, quando houver, concordância validação 2 × validação 3.
- `avaliacao/RELATORIO_RESULTADOS.md` com: configuração experimental (hashes e datas); tabelas principais em padrão ABNT (título acima, fonte abaixo); recortes por tema, registro, origem, complexidade e cobertura; consistência entre execuções; análise de erros (alucinações, erros com potencial de dano, recusas indevidas) com trechos curtos; cobertura real do corpus versus a matriz prevista (42/3/5); lacunas de referência; ameaças à validade (seção 2.6).

### Fase 7 — Atualização do TCC

1. **Antes de editar, faça uma cópia de segurança** do arquivo do TCC (`<nome>_antes_avaliacao.<ext>`) e trabalhe no original. Mantenha o estilo, a formatação e as normas que o documento já usa (ABNT, numeração de seções, padrão de tabelas e figuras).
2. **Metodologia**: acrescente uma subseção sobre o procedimento de avaliação: conjunto de perguntas e sua curadoria (PARTE 4), execução (2 execuções por pergunta, chamadas independentes, parâmetros congelados), construção das respostas de referência a partir do corpus, e a tripla validação. Descreva as validações 1 e 2 como avaliação automatizada por modelo de linguagem atuando como avaliador segundo rubrica fixa, com referência cega e hashes; a validação 3 como revisão por especialista, com o cálculo de concordância. Coloque o nome e a versão do modelo avaliador em nota de rodapé ou no apêndice. Cite a literatura de avaliação de RAG e de *LLM-as-a-judge* apenas com referências que você conseguir verificar; se não puder verificar, deixe `[REFERÊNCIA A INSERIR: tema]` em amarelo.
3. **Resultados**: insira tabelas e gráficos com os números reais das validações 1 e 2, identificados como preliminares até a consolidação da validação 3.
4. **Discussão e limitações**: inclua as ameaças à validade da seção 2.6.
5. **Apêndices**: lista das 50 perguntas; rubrica de avaliação; modelo da ficha da especialista.
6. **Marcações em amarelo** (realce amarelo no .docx; `\hl{}` do pacote `soul` ou `\colorbox{yellow}{}` em LaTeX; `<mark>` em Markdown) em tudo que depende da pesquisadora ou de decisão minha, por exemplo:
   - `[NOME DA PESQUISADORA, FORMAÇÃO E TITULAÇÃO]`
   - `[VÍNCULO INSTITUCIONAL E DATA DA REVISÃO]`
   - `[Nº DE RESPOSTAS DE REFERÊNCIA REVISADAS E QUANTAS FORAM CORRIGIDAS]`
   - `[Nº DE RESPOSTAS DA IA REVISADAS PELA ESPECIALISTA]`
   - `[KAPPA E % DE CONCORDÂNCIA ENTRE VALIDAÇÃO 2 E VALIDAÇÃO 3 — gerado por consolidar.py]`
   - `[OBSERVAÇÕES DA ESPECIALISTA: preencher com os comentários da ficha]`. Aqui deixe só a indicação do que entra (ex.: "principais divergências apontadas", "pontos clínicos destacados"), **sem redigir as observações**.
   - `[VERIFICAR]` em toda frase que dependa de decisão minha.
7. Gere `avaliacao/ALTERACOES_TCC.md` listando cada trecho alterado ou inserido (seção, antes/depois) e todas as marcações em amarelo pendentes, para eu revisar rápido.
8. Quando eu disser que a ficha voltou preenchida, rode `consolidar.py`, atualize os números do TCC e remova as marcações que foram resolvidas.

Ao final, me entregue um resumo de no máximo 15 linhas: principais números, os 3 achados mais relevantes e a lista do que falta eu fazer (enviar a ficha à pesquisadora, preencher as marcações em amarelo).

=====

---

## PARTE 2 — PROTOCOLO DE MÉTRICAS

### 2.1 Validação 1 — Coerência

| Métrica | Escala | Critério |
|---|---|---|
| **Pertinência (PER)** | 0–2 | 2 = responde diretamente ao que foi perguntado, inclusive a todas as partes de perguntas compostas; 1 = responde parcialmente ou tangencia; 0 = não responde ao que foi perguntado. |
| **Coerência interna (COE)** | sim/não | Não se a resposta se contradiz ou é logicamente inconsistente. |
| **Adequação ao registro (REG)** | 0–2 | 2 = linguagem adequada ao público (leigo: clara, sem jargão não explicado; técnico: terminologia e conduta precisas); 1 = parcial; 0 = inadequada. |
| **Consistência entre execuções** | por pergunta | Concordância de veredito (mesmo resultado binário nas duas rodadas); \|NG₁ − NG₂\|; similaridade semântica entre as duas respostas (cosseno de embeddings, BGE-M3 se disponível); contradição entre execuções (sim/não). Agregados: % de perguntas com veredito estável, acerto nas duas, acerto em pelo menos uma (pass@2), acerto em nenhuma. |

### 2.2 Validação 2 — Conformidade documental

| Métrica | Escala | Critério |
|---|---|---|
| **Correção factual (CF)** | 0–2 | 2 = nenhuma afirmação contradiz o corpus; 1 = imprecisão menor, sem impacto na conduta; 0 = ao menos uma afirmação contradiz o corpus ou induz conduta errada. |
| **Cobertura de pontos-chave (CPC)** | 0–1 | nº de `pontos_chave` da referência contemplados ÷ total. Ponto incompleto conta 0,5. |
| **Precisão de afirmações (PA)** | 0–1 | afirmações sustentadas pelo corpus ÷ total de afirmações factuais da resposta. |
| **Alucinação (ALU)** | sim/não | Sim se há ao menos uma afirmação factual inventada ou contraditória ao corpus (dado, número, norma, dose, fonte). |
| **Alerta de segurança (SEG)** | 0/1/2 | 0 = nenhum; 1 = erro que pode atrasar o cuidado ou confundir; 2 = erro com potencial de dano. Qualquer item de `pontos_proibidos` presente = no mínimo 1. |
| **Abstenção adequada (ABS)** | categórica | Ver 2.3. |
| **Fundamentação das fontes (FF)** | 0–2 ou N/A | Só se a IA cita ou retorna fontes. 2 = corretas e pertinentes; 1 = parcialmente; 0 = erradas ou inexistentes. |
| **Recuperação (REC)** | 0–1 ou N/A | Só se o sistema expõe os trechos recuperados: proporção dos `pontos_chave` cujo trecho de suporte foi recuperado. Separa erro de **busca** de erro de **geração**. |

**Nota global (NG)**, de 0 a 1:

`NG = 0,35 × (CF/2) + 0,30 × CPC + 0,15 × PA + 0,10 × (PER/2) + 0,10 × (REG/2)`

com **NG = 0** se SEG = 2 ou COE = não. Para perguntas não respondíveis, NG = 1 se ABS = "abstenção correta", 0,5 se "abstenção com ruído" e 0 nos demais casos. Para parciais, NG é a média entre a nota da parte respondível e a nota de abstenção da parte não coberta.

Resposta **correta** (binário): CF = 2, CPC ≥ 0,6, PER ≥ 1, COE = sim e SEG = 0; nas não respondíveis, ABS = "abstenção correta".

### 2.3 Abstenção

| Cobertura (da referência) | Comportamento da IA | Classificação |
|---|---|---|
| Não respondível | Reconhece a limitação, não inventa, indica fonte adequada | Abstenção correta |
| Não respondível | Reconhece a limitação, mas acrescenta informação não sustentada | Abstenção com ruído |
| Não respondível | Responde como se soubesse | Falha de abstenção (alucinação) |
| Parcial | Responde a parte coberta e declara o limite da outra | Abstenção parcial correta |
| Parcial | Responde tudo, inventando a parte não coberta | Falha de abstenção |
| Integral ou parcial | Recusa responder o que o corpus cobre | Recusa indevida |
| Integral | Responde | Não se aplica |

Derivadas: taxa de abstenção correta, taxa de recusa indevida e matriz de confusão 2×2 (deveria abster × absteve).

### 2.4 Validação 3 — Especialista

- Revisão das 50 respostas de referência (correta / parcialmente / não) e das respostas da IA selecionadas na Fase 5 (correta / parcialmente correta / incorreta; risco clínico).
- Concordância entre validação 2 e validação 3: kappa de Cohen ponderado e % de concordância, sobre as respostas revisadas.
- Regra de decisão: nas respostas revisadas pela especialista, o veredito dela é o final. Referências que ela marcar como incorretas são corrigidas (em `referencias_erratas.json`) e as respostas da IA dessa pergunta são reavaliadas.
- Reportar: nº de referências corrigidas, nº de vereditos alterados pela especialista e em que direção (a avaliação automatizada foi mais rígida ou mais branda).

### 2.5 Agregados e estatística

- Para cada recorte (tema, registro, origem, complexidade, cobertura): média e desvio-padrão da NG, acurácia com **intervalo de confiança de 95% (Wilson)**, taxa de alucinação e taxa de alertas de segurança.
- Comparações leigo × técnico e publicada × adaptação × autoral: teste exato de Fisher (acurácia) e Mann-Whitney / Kruskal-Wallis (NG). Com n pequeno por recorte, reportar como **exploratório**.
- Desempenho operacional: latência média, mediana e p95; tokens médios.

### 2.6 Ameaças à validade (registrar no relatório e no TCC)

- As validações 1 e 2 foram feitas por um modelo de linguagem atuando como avaliador; o mesmo agente construiu a referência e avaliou. Mitigação: referência congelada por hash antes de ver as respostas, avaliação cega e validação 3 por especialista com cálculo de concordância.
- Se a IA do projeto também usa um modelo do mesmo fornecedor do avaliador, há risco de viés de autopreferência; mitigado pelas mesmas medidas.
- A especialista revisou uma amostra das respostas da IA (todas as sinalizadas + amostra aleatória), não necessariamente todas.
- 34 das 50 perguntas são adaptações ou redação autoral; T36 segue em decisão na curadoria.
- Apenas 2 execuções por pergunta: a consistência medida é indicativa.
- Mudanças normativas de 2026 (Portarias 47 e 51) podem gerar divergências entre documentos do corpus; registrar qual versão prevaleceu.

---

## PARTE 3 — AS 50 PERGUNTAS

> Os marcadores ¹ e ² aparecem no documento de origem sem o texto da nota de rodapé correspondente; devem ser removidos antes do envio à IA.
>
> Distribuição prevista pela matriz de curadoria: 10 temas; 25 leigas e 25 técnicas; 35 simples e 15 compostas; 42 respondíveis integralmente pelo corpus, 3 parcialmente e 5 não respondíveis (a classificação de cada pergunta é feita na Fase 3, a partir dos documentos).

### T01 | Diagnóstico | leigo

- **Origem:** Publicada — transcrição literal

**Pergunta:** Como identificar uma mancha que pode ser suspeita de hanseníase?

### T02 | Diagnóstico | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Quais achados clínicos em uma lesão cutânea devem levantar suspeita de hanseníase e orientar a avaliação diagnóstica?

### T03 | Diagnóstico | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** Qual é a diferença entre hanseníase paucibacilar e multibacilar?

### T04 | Diagnóstico | técnico

- **Origem:** Autoral — redação proposta

**Pergunta:** Quais são os critérios utilizados na classificação operacional da hanseníase em paucibacilar e multibacilar?

### T05 | Diagnóstico | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Na ausência de lesões cutâneas típicas, quais achados sugerem hanseníase neural pura e como investigar o diagnóstico diferencial?

### T06 | Diagnóstico | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** Para que serve a baciloscopia na investigação da hanseníase e como é feita a coleta?

### T07 | Diagnóstico | técnico

- **Origem:** Autoral — redação proposta

**Pergunta:** Como interpretar o teste rápido de anticorpos IgM na hanseníase e qual é seu desempenho diagnóstico em diferentes populações?

### T08 | Diagnóstico | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Em quais situações o exame de qPCR pode auxiliar o diagnóstico da hanseníase conforme a atualização normativa de 2026?

### T09 | Diagnóstico | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** O que é a avaliação neurológica simplificada e por que uma pessoa com suspeita de hanseníase deve realizá-la?

### T10 | Tratamento | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** Em quais situações o tratamento da hanseníase pode precisar ser prolongado até 18 meses?

### T11 | Tratamento | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Em relação ao tratamento de hanseníase, quando se estender até 18 meses?

### T12 | Tratamento | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** Quais efeitos colaterais podem aparecer durante o tratamento da hanseníase?

### T13 | Tratamento | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Quais os efeitos colaterais mais comuns causados pelos medicamentos da PQT?

### T14 | Tratamento | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** O que é a dapsona, para que serve no tratamento da hanseníase e quais cuidados ela exige?

### T15 | Tratamento | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** A alteração da cor da pele causada pela clofazimina desaparece depois do tratamento?

### T16 | Tratamento | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Como proceder em casos de efeito adverso medicamentoso no tratamento da hanseníase? ¹

### T17 | Tratamento | técnico

- **Origem:** Autoral — redação proposta

**Pergunta:** Quais critérios clínicos e laboratoriais indicam investigação de resistência primária aos antimicrobianos na hanseníase?

### T18 | Tratamento | técnico

- **Origem:** Autoral — redação proposta

**Pergunta:** Quais alternativas terapêuticas são indicadas quando há resistência aos medicamentos de primeira linha para hanseníase?

### T19 | Tratamento | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Qual o esquema terapêutico para crianças menores de 30 kg com diagnóstico de hanseníase?

### T20 | Reações | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** Como reconhecer, em linguagem simples, uma reação hansênica do tipo 1?

### T21 | Reações | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Quais achados clínicos caracterizam a reação hansênica tipo 1 e como diferenciá-la de outras intercorrências?

### T22 | Reações | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** Por que a talidomida pode ser usada em algumas reações hansênicas e quais cuidados são necessários?

### T23 | Reações | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica?

### T24 | Reações | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** Quais fatores podem desencadear reações hansênicas durante ou após o tratamento?

### T25 | Reações | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Recebeu-se hoje um paciente que está em tratamento, relatando que a lesão está avermelhada e inchada. O que deve ser feito? ¹

### T26 | Reações | técnico

- **Origem:** Autoral — redação proposta

**Pergunta:** Como deve ser conduzido o tratamento das reações hansênicas em crianças, considerando o tipo de reação e os riscos dos medicamentos?

### T27 | Neuropatia e incapacidade | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** Se uma pessoa com hanseníase apresentar dor no braço e fraqueza nas mãos, o que deve fazer?

### T28 | Neuropatia e incapacidade | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? ¹

### T29 | Neuropatia e incapacidade | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** Como reconhecer a dor neuropática relacionada à hanseníase e quais opções de cuidado existem?

### T30 | Neuropatia e incapacidade | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** Quais problemas nos olhos a hanseníase pode causar e quais sinais precisam de avaliação urgente?

### T31 | Neuropatia e incapacidade | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** Quais cuidados diários com os pés e os calçados ajudam a prevenir feridas e incapacidades na hanseníase?

### T32 | Neuropatia e incapacidade | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Por que realizar avaliação neurológica? ¹

### T33 | Casos especiais | leigo

- **Origem:** Publicada — transcrição literal

**Pergunta:** A mulher em tratamento contra a hanseníase pode amamentar? ¹

### T34 | Casos especiais | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Quais são as recomendações para aleitamento materno durante a poliquimioterapia para hanseníase?

### T35 | Casos especiais | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** É contra-indicado o tratamento PQT para pacientes portadores do vírus HIV?

### T36 | Casos especiais | leigo

- **Origem:** Em decisão — redação proposta

**Pergunta:** Como a equipe de saúde deve acolher e acompanhar uma pessoa com hanseníase que recusa o tratamento?

### T37 | Monitoramento | leigo

- **Origem:** Publicada — transcrição literal

**Pergunta:** O que eu devo saber sobre o pós-alta da PQT?

### T38 | Monitoramento | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Como deve ser organizado o seguimento clínico e neurológico após a alta da poliquimioterapia?

### T39 | Monitoramento | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Quais avaliações e registros devem compor o acompanhamento de pessoas em poliquimioterapia para hanseníase?

### T40 | Contatos e prevenção | leigo

- **Origem:** Publicada — transcrição literal

**Pergunta:** Qual a conduta a ser tomada em relação à família do paciente?

### T41 | Contatos e prevenção | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** Qual a conduta em caso de contactantes domiciliares de paciente que já está em tratamento para Hanseníase?

### T42 | Contatos e prevenção | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** Quem mora com uma pessoa com hanseníase precisa de avaliação, vacina BCG ou quimioprofilaxia? E qual é a cobertura dessas medidas no meu município?

### T43 | Psicossocial | leigo

- **Origem:** Publicada — transcrição literal

**Pergunta:** Por que o estigma e a discriminação podem acontecer com a pessoa acometida pela hanseníase?

### T44 | Psicossocial | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Quais fatores históricos, sociais e institucionais contribuem para o estigma associado à hanseníase e como enfrentá-lo na assistência?

### T45 | Epidemiologia | técnico

- **Origem:** Adaptação — redação proposta

**Pergunta:** Quais diretrizes da Estratégia Nacional 2024–2030 orientam o controle da hanseníase no Brasil e qual foi o resultado epidemiológico nacional após o período coberto pelos documentos?

### T46 | Gestão e políticas | leigo

- **Origem:** Adaptação — redação proposta

**Pergunta:** Qual laboratório fabrica os medicamentos fornecidos para o tratamento da hanseníase no Brasil?

### T47 | Diagnóstico | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** Qual tratamento deve ser usado para uma outra doença de pele que pode se parecer com hanseníase?

### T48 | Tratamento | técnico

- **Origem:** Publicada — transcrição literal

**Pergunta:** No dia da tomada da dose supervisionada, o paciente deverá estar em jejum? ²

### T49 | Neuropatia e incapacidade | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** Qual é o conteúdo detalhado das seções do PCDT da hanseníase que foram excluídas do conjunto documental deste estudo?

### T50 | Epidemiologia | leigo

- **Origem:** Autoral — redação proposta

**Pergunta:** Quantos casos novos de hanseníase foram registrados no meu município em 2026?

---

## PARTE 4 — CONTEXTO METODOLÓGICO DA CURADORIA DAS PERGUNTAS

### Definição da matriz

Antes da busca, foram estabelecidas 50 vagas, distribuídas por 10 temas, 25 registros leigos e 25 técnicos, 35 perguntas simples e 15 compostas. Previu-se que 42 seriam respondidas integralmente pelos documentos, 3 parcialmente e 5 não seriam respondidas.

### Coleta e fontes

Foram coletadas 152 perguntas publicadas entre 2007 e 2023 em serviços de saúde e órgãos oficiais: 101 leigas e 51 técnicas. Entre elas, 32 eram dúvidas reais de profissionais da atenção primária. As fontes citadas incluem BVS APS/Telessaúde, SES-RJ, Ministério da Saúde e Fiocruz.

### Primeiro filtro — assunto

As perguntas foram agrupadas por assunto; um modelo de embeddings BGE-M3 auxiliou a ordenar a proximidade semântica em relação aos títulos das seções de referência. Até cinco candidatas por vaga foram avaliadas. Restaram 96 candidatas distintas.

### Segundo filtro — adequação

Cada candidata foi examinada quanto ao assunto, registro de linguagem, complexidade e cobertura documental. Também foram excluídas dependências do contexto da publicação, redundâncias e questões prejudicadas por mudanças normativas de 2026.

### Decisão e controle de viés

Foram selecionadas 16 perguntas literalmente publicadas, 18 vagas para adaptação a partir de 9 perguntas e 15 vagas para redação autoral; T36 permaneceu em decisão. Não houve execução prévia dos modelos sobre o conjunto. O protocolo prevê escolha independente, revisão externa e congelamento por SHA-256.

### Referências documentais do corpus

PCDT da Hanseníase (2022), Portarias SCTIE/MS nº 47 e nº 51/2026, Estratégia Nacional 2024–2030 e orientação técnica da OMS (2023).

### Observação para o TCC

As perguntas de adaptação e de redação autoral (34 das 50) são propostas de redação, não perguntas originalmente coletadas; devem ser descritas assim no texto. As respostas de referência usadas na avaliação são construídas exclusivamente a partir do corpus documental, na Fase 3 do protocolo acima, e revisadas pela especialista na validação 3.
