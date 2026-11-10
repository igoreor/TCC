# Relatório de otimização do TCC (revisão de concisão)

Revisão feita em 10/11/2026 sobre a versão revisada em 09/11/2026 (commit `47a6b63`, que preserva a versão anterior). O texto de cada alteração e o motivo dela estão em `revisao_tcc/edicoes_concisao.ts`.

**Limites de extensão:**
- Não há regulamento do curso de Engenharia de Software da UPE no repositório, e a busca na web não localizou limite de páginas para o TCC do curso.
- A única referência local é `TCC/TCC Exemplo.md`, um TCC do mesmo curso defendido em 2025. Ele tem cerca de 35 páginas de texto principal e cerca de 12.800 palavras, para um estudo único de aprendizado de máquina.
- As metas de 45–65 e de até 70 páginas são editoriais, e não normas da ABNT.

## A. Diagnóstico inicial

Contagens do PDF exportado pelo Word (137 páginas) e do .md correspondente. As palavras do texto excluem tabelas e quadros; entre parênteses, as palavras dentro deles.

| Capítulo | Páginas | Palavras | Problemas identificados |
|---|---:|---:|---|
| Pré-textuais | 19 | — | Resumo com 459 palavras ocupando duas páginas (pendência D-08) |
| 1 Introdução | 6 | 1.776 | Justificativa repetia a contextualização e a constatação das revisões (D-10); a Seção 1.3 repetia o sumário e listava todos os apêndices |
| 2 Referencial teórico | 14 | 4.258 (338) | Histórico do INTERNIST-I e do MYCIN em parágrafo próprio; detalhes de implementação (busca textual do PostgreSQL, pgvector) antecipados; achados de Xiong *et al.* e do MEGA-RAG repetidos nas Seções 2.4.3 e 2.7.2; valores de Barbieri *et al.* e Simões *et al.* no texto e no Quadro 1; Quadro 1 transbordava quatro linhas; aberturas que só anunciavam as subseções |
| 3 Metodologia | 21 | 5.869 (1.042) | Seção 3.6 (avaliação ainda não realizada) dividida em nove subseções curtas, várias com uma frase e uma marcação; Seção 3.4 repetia a descrição dos testes da 4.8; Seção 3.2 descrevia etapa por etapa o que a Figura 1 já mostra |
| 4 Desenvolvimento | 30 | 6.050 (2.124) | Maior capítulo do trabalho. Oito capturas de tela na 4.7, quatro sem informação além do texto: exemplo ilustrativo, login, gaveta vazia e tela de comparação vazia. Quadro 9 (rotas da API) e Quadro 10 (valores dos metadados, que não afetam a ordenação) eram documentação de implementação. Tabela 1 (trechos por fase e documento) sem uso na análise. Quadro 12 com 15 linhas. A Seção 4.3 descrevia atributos que a Figura 3 já mostra, e a 4.6.1 detalhava mecanismos de segurança web periféricos à pesquisa |
| 5 Resultados | 13 | 3.351 (813) | Texto repetia valores das Tabelas 4 a 6; a Seção 5.1 repetia o Capítulo 4; lista de identificadores de perguntas já presente no Apêndice H; a tabela de métricas gerais da avaliação experimental não era citada no texto (NBR 14724) |
| 6 Discussão | 7 | 2.146 | A Seção 6.3 repetia exemplos já relatados nas Seções 4.8 e 5.2; a 6.4 tinha onze alíneas, algumas sobrepostas; a 6.5 repetia números da 5.4 |
| 7 Considerações finais | 2 | 721 | Repetia a lista de componentes do sistema |
| Referências | 5 | — | — |
| Apêndices | 20 | — | — |
| **Total** | **137** | **24.171 (4.317)** | Texto principal (Capítulos 1 a 7): **93 páginas** |

**Diagnóstico em uma frase:** o volume vinha menos de excesso de fundamentação e mais de repetição entre capítulos, de documentação de implementação no corpo do texto e de ilustrações de baixa contribuição. Nenhuma citação servia apenas para dar volume: as 55 referências sustentam afirmações do texto.

## B. Alterações realizadas

### Por capítulo

- **Resumo e Abstract.** Resumo de 459 para 370 palavras, agora em uma página; a frase sobre autenticação e nota de 0 a 10 saiu. Problema, objetivo, método, resultados e marcação pendente foram mantidos. O Abstract acompanha.
- **Capítulo 1.**
  - Contextualização começa pela doença.
  - A Justificativa remete à Seção 2.7 em vez de repetir as revisões.
  - A organização do trabalho deixou de listar os apêndices.
  - Problema, questões de pesquisa, objetivos e motivação ficaram intactos.
- **Capítulo 2 (prioridade).**
  - **História dos CDSS (2.2):** reduzida a uma frase que a liga à distinção de Sutton *et al.*.
  - **Implementação (2.4):** os detalhes do PostgreSQL e do pgvector foram reduzidos ao necessário para entender a Seção 4.5.3.
  - **Achados repetidos:** os de Xiong *et al.* sobre corpus e recuperadores ficaram só na 2.7.2, e os resultados do Almanac também; a 2.5.2 passou a remeter a ela.
  - **Classificação (2.1.1):** a enumeração das formas clínicas saiu, por não ter uso posterior; a divergência OMS × PCDT, usada pelo sistema e pela avaliação, ficou.
  - **Estado da arte (2.7.1):** os valores de desempenho ficaram só no Quadro 1, e o texto manteve a comparação por tipo de dado.
  - **Quadro 1:** células mais curtas, agora em uma página.
  - **Mantido:** a fundamentação de *LLM-as-a-judge*, viés de autofavorecimento e kappa (2.6), a análise dos riscos de Sutton *et al.* (2.2) e a crítica metodológica ao MIRAGE e ao MEGA-RAG (2.7.2).
- **Capítulo 3.**
  - **Seção 3.6:** passou de nove para três subseções (3.6.1 Objetivo e desenho; 3.6.2 Participantes, perguntas e instrumento; 3.6.3 Coleta, análise e aspectos éticos), com as alíneas e) e f) fundidas. Todas as decisões pendentes, todos os parâmetros do Quadro 6 e todas as 35 marcações [PREENCHER] continuam no texto.
  - **Seção 3.4:** o parágrafo sobre testes saiu, por repetir a 4.8.
  - **Seção 3.2:** passou a destacar os retornos entre etapas, que a Figura 1 não mostra.
  - **Mantido integralmente:** critérios de inclusão e exclusão da base, parâmetros de fragmentação, conjunto de referência, métricas, critério de escolha do modelo e todo o método da avaliação experimental (3.8), salvo um detalhe de preparação das perguntas.
- **Capítulo 4.**
  - **Ilustrações retiradas:**
    - Quadro 9 (rotas da API), resumido em uma frase com as rotas citadas no texto;
    - Quadro 10 (metadados), resumido em uma frase;
    - Tabela 1, com a distribuição relevante mantida no texto;
    - quatro capturas de tela: exemplo ilustrativo, login, gaveta vazia e comparação vazia.
  - **Quadro 12 (testes):** de 15 para 8 linhas, com os mesmos totais (93 + 20 = 113).
  - **Seções enxutas:** 4.3, 4.6.1, 4.6.2, 4.7 e 4.8.
  - **Mantido:** requisitos, princípios de projeto, *pipeline* com parâmetros, regras de segurança, regras do *prompt*, critérios de verificação das citações, limites dos testes e Quadro 13 (evolução após a avaliação preliminar).
- **Capítulo 5.**
  - A Seção 5.1 deixou de repetir o Capítulo 4.
  - O texto das Seções 5.2.2 e 5.2.3 destaca padrões e decisões em vez de repetir os valores das tabelas.
  - A lista de perguntas parciais e não respondíveis saiu do texto; está no Apêndice H.
  - A tabela de métricas gerais da avaliação experimental passou a ser citada.
  - Resultados, inclusive os desfavoráveis (acurácia de 65,3%, falhas em tratamento e erro do quadro da PQT-U), estão todos preservados.
- **Capítulo 6.**
  - As sete observações de engenharia (6.3) foram mantidas, com remissões no lugar dos exemplos repetidos.
  - As limitações (6.4) passaram de onze para oito alíneas, sem perder nenhuma.
  - Na Seção 6.5, saiu o parágrafo que repetia a ameaça a) e os números da 5.4.
- **Capítulo 7.** Mesmas contribuições, limitações, etapas pendentes e trabalhos futuros, sem a lista de componentes. A adequação da linguagem ao registro da pergunta, apontada na Seção 6.5, entrou nos trabalhos futuros.

### Numeração das ilustrações após a revisão

| Antes | Depois |
|---|---|
| Figuras 7, 8, 9 e 12 | Retiradas |
| Figuras 10, 11, 13, 14 e 15 | Figuras 7, 8, 9, 10 e 11 |
| Quadros 9 e 10 | Retirados |
| Quadros 11 a 23 | Quadros 9 a 21 (Apêndices H a K: Quadros 18 a 21) |
| Tabela 1 | Retirada |
| Tabelas 2 a 10 | Tabelas 1 a 9 (avaliação experimental: Tabelas 8 e 9) |

As remissões no texto foram renumeradas automaticamente, e cada uma foi conferida contra a legenda correspondente. Os arquivos das capturas retiradas continuam em `TCC/figuras/`.

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `TCC/TCC_NexoHansen_Versao_Revisada.docx` e `.md` | Regerados com as 161 edições de concisão (C-001 a C-162; a C-149 foi fundida na C-118) |
| `revisao_tcc/edicoes_concisao.ts` | Novo: texto e motivo de cada edição |
| `avaliacao/tcc/aplicar_revisao.ts` | Edições de títulos e de alíneas, remoção de ilustração, renumeração automática das remissões, regeneração do sumário e das listas no .md |
| `avaliacao/tcc/atualizar_tcc.ts` e `avaliacao/tcc/achados.json` | Textos das Seções 3.8, 5.4 e 6.5 enxugados na origem, para que sobrevivam à atualização dos números após a validação 3; o script aplica as duas revisões em sequência |
| `avaliacao/ALTERACOES_TCC.md`, `TCC/Pendencias_TCC_NexoHansen.md`, `revisao_tcc/06_RELATORIO_FINAL.md` | Contagem de páginas, numeração das ilustrações e remissões a seções atualizadas; D-08 e D-10 marcadas como resolvidas |

## C. Comparativo

| Capítulo | Páginas antes | Páginas depois | Redução |
|---|---:|---:|---:|
| Pré-textuais | 19 | 18 | −1 |
| 1 Introdução | 6 | 5 | −1 |
| 2 Referencial teórico | 14 | 12 | −2 |
| 3 Metodologia | 21 | 18 | −3 |
| 4 Desenvolvimento do sistema | 30 | 22 | −8 |
| 5 Resultados | 13 | 11 | −2 |
| 6 Discussão | 7 | 6 | −1 |
| 7 Considerações finais | 2 | 2 | 0 |
| **Texto principal (Capítulos 1 a 7)** | **93** | **76** | **−17 (−18%)** |
| Referências | 5 | 5 | 0 |
| Apêndices | 20 | 20 | 0 |
| **Total do PDF** | **137** | **119** | **−18 (−13%)** |

| Capítulo | Palavras antes | Palavras depois | Redução |
|---|---:|---:|---:|
| 1 | 1.776 | 1.555 | −12% |
| 2 | 4.258 | 3.686 | −13% |
| 3 | 5.869 | 5.056 | −14% |
| 4 | 6.050 | 4.466 | −26% |
| 5 | 3.351 | 2.897 | −14% |
| 6 | 2.146 | 1.877 | −13% |
| 7 | 721 | 624 | −13% |
| **Total (sem tabelas)** | **24.171** | **20.161** | **−17%** |

Palavras em tabelas e quadros do texto principal: de 4.317 para 3.457.

## D. Verificação de qualidade

- **Objetivos.** Os seis objetivos específicos e as três questões de pesquisa continuam contemplados, sem alteração de texto. O Quadro 2 e as Seções 5.1 e 6.1 seguem relacionando-os às etapas e aos resultados.
- **Decisões metodológicas.** Continuam justificadas: critérios da base, fragmentação, métricas, critério de escolha do modelo, regras de segurança, protocolo da avaliação experimental e desenho previsto da comparativa.
- **Referências.** As 55 da lista continuam citadas no texto principal. Nenhum par autor-ano citado antes deixou de ser citado, e as siglas da lista continuam todas em uso.
- **Remissões.** Todas as remissões a figuras, quadros, tabelas e seções apontam para elementos existentes.
- **Marcações em amarelo.** Todas foram preservadas, na mesma quantidade: 35 [PREENCHER], 7 [DEFINIR], 4 [VERIFICAR], 3 [ATUALIZAR], 5 [ANALISAR], 2 [INSERIR], 1 [REFERÊNCIA A INSERIR], 7 campos da especialista e as 25 células "A avaliar" do Apêndice K.
- **Resultados e conclusões.** Coerentes e sem alteração de valores. Os números que deixaram o corpo do texto são todos detalhes secundários:
  - as contagens 1.229 e 585 do AI4Leprosy;
  - os códigos HTTP 401 e 409;
  - o custo de US$ 0,02 por execução do conjunto;
  - os valores da antiga Tabela 1;
  - a lista de identificadores de perguntas, que está no Apêndice H.

  A área sob a curva de Simões *et al.* (0,775) foi para o Quadro 1.
- **Geração e exportação.**
  - `npx tsx ../avaliacao/tcc/atualizar_tcc.ts` (em `backend/`) aplica as 33 edições da revisão acadêmica e as 161 de concisão sem erro; o aplicador falharia se alguma remissão apontasse para ilustração retirada.
  - `word_atualizar.ps1` atualiza campos, sumário e listas e exporta o PDF com 119 páginas, sem "Erro! Indicador não definido".
  - Na inspeção visual, resumo, Quadro 1, Seções 3.6 e 4.4, Seção 4.7 com as figuras renumeradas e alíneas da 6.4 estão corretos.
- **Trechos que pedem a sua leitura.**
  - Seção 3.6 consolidada: confira se a nova divisão em três subseções serve ao protocolo que você e o orientador vão definir.
  - Seção 4.7 com quatro figuras: confira se alguma das capturas retiradas é exigida pela banca.
  - Frase-resumo dos Quadros 9 e 10 e da Tabela 1 (4.2 e 4.4).
  - Quadro 12 agrupado.
  - Resumo de 370 palavras.

## E. Avaliação crítica final

1. **O TCC ainda tem capítulos extensos?** Sim. O Capítulo 4 (22 páginas) e o 3 (18) concentram 53% do texto principal. Isso decorre do tipo de trabalho: na pesquisa em ciência do design, o artefato e suas três avaliações (técnica, experimental e comparativa planejada) são o próprio resultado. Mesmo assim, são os candidatos a novos cortes (item 4).
2. **A redução comprometeu informação relevante?** Não, segundo as verificações acima:
   - nenhum dado de resultado, critério, parâmetro, referência ou marcação pendente foi perdido;
   - o que saiu é repetição, documentação de implementação ou ilustração sem informação própria;
   - o ponto de maior perda é visual: quatro capturas da interface.
3. **O referencial ficou mais objetivo e crítico?** Mais objetivo, sim: −13% de palavras e 2 páginas a menos, sem tirar nenhuma das análises críticas da revisão anterior (riscos de Sutton *et al.*, crítica ao MIRAGE e ao MEGA-RAG, limites do *LLM-as-a-judge*). A parte crítica foi preservada, e não ampliada; o que saiu foi história, detalhe de implementação e repetição.
4. **Há seções que ainda podem ser reduzidas?** Sim, mas cada corte abaixo altera a estrutura ou retira conteúdo que a banca pode esperar, e por isso pede sua decisão e a do orientador:

   | Opção | Ganho estimado |
   |---|---:|
   | Levar para o Apêndice E o detalhamento da avaliação comparativa (alíneas da 3.6.1, Quadros 6 e 7) até o protocolo ser definido, deixando no corpo o objetivo, os cenários e a ética | ~3 páginas |
   | Retirar mais capturas de tela (Figuras 5, 6 e 9) | ~2 páginas |
   | Substituir a estrutura vazia da Seção 5.3 (quatro subseções e Tabelas 6 e 7 sem dados) por um parágrafo marcado até a coleta | ~1 página |
   | Levar o Quadro 10 (testes) para um apêndice | ~1 página |
   | Resumir a execução preliminar (5.2.1), levando a análise da Tabela 2 para o Apêndice D | ~1 página |

   Juntas, as cinco opções levariam o texto principal para cerca de 68 páginas.
5. **Qual é a extensão final e ela está coerente com as exigências?**
   - **Extensão:** 76 páginas de texto principal e 119 no total.
   - **Limite oficial:** não foi encontrado nenhum.
   - **Metas editoriais:** a extensão passa da faixa flexível de 70 páginas. A diferença se justifica pelo escopo: um sistema completo e três desenhos de avaliação, contra um único estudo no TCC de exemplo do curso.
   - **Decisão:** vale confirmar com o orientador se há limite. Se houver, as opções do item 4 são o caminho para atingi-lo sem perder rigor.
