UNIVERSIDADE DE PERNAMBUCO<br>CAMPUS GARANHUNS<br>ENGENHARIA DE SOFTWARE

Igor Emanuel Oliveira Rêgo

**Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase**

GARANHUNS<br>2026

---

Igor Emanuel Oliveira Rêgo

**Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase**

> Monografia apresentada como requisito para obtenção do diploma de Bacharelado em Engenharia de Software pela Universidade de Pernambuco Campus Garanhuns.
>
> Orientador: Prof. Élisson da Silva Rocha
>
> Coorientador(a): [PREENCHER OU REMOVER: o campo está em branco no rascunho]
>

GARANHUNS<br>2026

---

**FICHA CATALOGRÁFICA**

*Após o recebimento da ficha catalográfica da biblioteca, apagar o texto e incluir o arquivo enviado pelo bibliotecário no final desta página.*

---

Igor Emanuel Oliveira Rêgo

**Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase**

> Monografia apresentada como requisito para obtenção do diploma de Bacharelado em Engenharia de Software pela Universidade de Pernambuco Campus Garanhuns.

Aprovado em: ____/____/2026.

**BANCA EXAMINADORA**

Prof. Élisson da Silva Rocha — Orientador

[PREENCHER: nome do(a) coorientador(a), se houver] — Coorientador(a)

[PREENCHER: nome do(a) primeiro(a) avaliador(a)] — Convidado(a) 1

[PREENCHER: nome do(a) segundo(a) avaliador(a)] — Convidado(a) 2

GARANHUNS<br>2026

---

*[REESCREVER PELO AUTOR: a dedicatória do rascunho reproduz a do TCC usado como exemplo, alterando apenas os nomes. Recomenda-se redação própria. Pessoas mencionadas no rascunho: a mãe, Maria José, e a madrinha, Synara Polyana (o rascunho grafa "Syanra" na dedicatória e "Synara" nos agradecimentos; conferir a grafia).]*

---

# AGRADECIMENTOS

[REESCREVER PELO AUTOR: o texto dos agradecimentos do rascunho coincide quase integralmente com o do TCC usado como exemplo, inclusive na estrutura dos parágrafos e em frases inteiras. Por se tratar de elemento pessoal, recomenda-se que seja redigido com palavras próprias. Pessoas e grupos citados no rascunho, para referência: a mãe, Maria José; a madrinha, Synara Polyana; a tia, Edna Ferreira; a irmã, Jullyana; o padrinho, Renato Bezerra; os amigos Mickael e Nathan; os professores do curso; e o orientador, Prof. Élisson da Silva Rocha.]

> [OPCIONAL: a epígrafe do rascunho é a mesma do TCC usado como exemplo. Avaliar se deseja mantê-la ou escolher outra.]
>
> "A tecnologia tornou possível a existência de grandes populações. Grandes populações agora tornam a tecnologia indispensável."
>
> (Joseph Krutch)
>

---

# RESUMO

A hanseníase permanece como problema de saúde pública no Brasil, segundo país em número de casos novos da doença no mundo, com proporção crescente de casos multibacilares e de diagnósticos realizados com incapacidade física já instalada. Na atenção primária à saúde, a consulta a orientações técnicas durante o atendimento é uma necessidade recorrente, e os modelos de linguagem de grande escala surgem como meio de localizar e sintetizar informação clínica, embora estejam sujeitos a alucinações e não indiquem a origem do que afirmam. Este trabalho apresenta o desenvolvimento do NexoHansen, um sistema de apoio informacional à decisão clínica em hanseníase baseado em Geração Aumentada por Recuperação (RAG), e o planejamento de uma avaliação comparativa entre respostas produzidas com e sem recuperação. A pesquisa, de natureza aplicada, foi organizada segundo a metodologia de pesquisa em ciência do design. O sistema foi implementado em Node.js e TypeScript, com PostgreSQL e pgvector, e combina classificação de intenção, estimativa de risco clínico, busca híbrida vetorial e textual, reordenação por critérios clínicos, regras explícitas de segurança aplicadas antes da geração, respostas restritas aos trechos recuperados com indicação das fontes e registro das consultas para auditoria, além de uma interface web em React. O acesso exige autenticação por usuário e senha, e cada resposta pode ser avaliada pelo usuário em escala de 0 a 10, com registro vinculado ao usuário e à resposta, mecanismo destinado a apoiar a avaliação com participantes. A base de conhecimento atual é um conjunto inicial de 15 trechos, elaborado para desenvolvimento e teste, e o sistema conta com 69 testes automatizados e um conjunto de 25 perguntas de referência. Uma avaliação técnica preliminar, executada com *embeddings* determinísticos locais, resultou na recusa de todas as perguntas, porque nenhum trecho atingiu a pontuação mínima de relevância configurada; a análise do resultado mostrou que o limiar adotado é incompatível com a escala de pontuação desse provedor e motiva nova execução com *embeddings* semânticos e calibração do limiar. [ATUALIZAR APÓS A AVALIAÇÃO COMPARATIVA: síntese dos resultados obtidos com os participantes e conclusão principal, sem extrapolar para eficácia clínica.]

**Palavras-chave**: hanseníase; geração aumentada por recuperação; apoio à decisão clínica; modelos de linguagem; engenharia de software.

# ABSTRACT

Leprosy remains a public health problem in Brazil, the country with the second highest number of new cases in the world, with a growing proportion of multibacillary cases and of diagnoses made after physical disability has already developed. In primary health care, consulting technical guidance during consultations is a recurring need, and large language models have emerged as a means of locating and summarizing clinical information, although they are prone to hallucinations and do not indicate the origin of their statements. This work presents the development of NexoHansen, an informational clinical decision support system for leprosy based on Retrieval-Augmented Generation (RAG), and the planning of a comparative evaluation between answers produced with and without retrieval. The research is applied in nature and was organized according to the design science research methodology. The system was implemented in Node.js and TypeScript, with PostgreSQL and pgvector, and combines intent classification, clinical risk estimation, hybrid vector and full-text search, reranking based on clinical criteria, explicit safety rules applied before generation, answers restricted to the retrieved passages with source attribution, and query logging for auditing, in addition to a React web interface. Access requires username and password authentication, and users can rate each answer on a scale from 0 to 10, with the rating linked to the user and to the answer, a mechanism intended to support the evaluation with participants. The current knowledge base is an initial set of 15 passages created for development and testing, and the system has 69 automated tests and a set of 25 reference questions. A preliminary technical evaluation, run with local deterministic embeddings, resulted in the refusal of all questions because no passage reached the configured minimum relevance score; the analysis showed that the threshold is incompatible with the score scale of that provider and motivates a new run with semantic embeddings and threshold calibration. [ATUALIZAR APÓS A AVALIAÇÃO COMPARATIVA: traduzir para o inglês a síntese dos resultados e a conclusão incluídas no resumo.]

**Keywords**: leprosy; retrieval-augmented generation; clinical decision support; language models; software engineering.

# LISTA DE FIGURAS

- Figura 1 – Etapas da pesquisa e situação de cada uma
- Figura 2 – Arquitetura geral do sistema
- Figura 3 – Modelo de dados do sistema
- Figura 4 – Fluxo de processamento de uma consulta
- Figura 5 – Componente de avaliação de uma resposta, após a escolha da nota
- Figura 6 – Página inicial do sistema
- Figura 7 – Exemplo ilustrativo de consulta exibido na página inicial
- Figura 8 – Tela de login
- Figura 9 – Gaveta de consulta em seu estado inicial
- Figura 10 – Tela de comparação em seu estado inicial
- Figura 11 – Formulário do explorador de recuperação no painel interno

# LISTA DE QUADROS

- Quadro 1 – Trabalhos relacionados ao sistema proposto
- Quadro 2 – Correspondência entre objetivos específicos, etapas e situação atual
- Quadro 3 – Parâmetros a registrar para cada cenário de avaliação
- Quadro 4 – Dimensões candidatas para o instrumento de avaliação
- Quadro 5 – Requisitos do sistema e mecanismos de implementação
- Quadro 6 – Rotas da API do servidor
- Quadro 7 – Principais metadados dos trechos
- Quadro 8 – Critérios de reordenação dos trechos recuperados
- Quadro 9 – Regras da camada de segurança
- Quadro 10 – Testes automatizados do servidor e da interface
- Quadro 11 – Perguntas de referência da avaliação técnica
- Quadro 12 – Trechos da base inicial de desenvolvimento
- Quadro 13 – Mensagens de recusa da camada de segurança
- Quadro 14 – Análise das partes determinísticas do *pipeline* por pergunta

# LISTA DE TABELAS

- Tabela 1 – Composição da base inicial de desenvolvimento
- Tabela 2 – Resultado da avaliação técnica preliminar
- Tabela 3 – Pontuação textual mínima necessária para atingir o limiar de relevância
- Tabela 4 – Caracterização agregada dos participantes
- Tabela 5 – Avaliações por dimensão e cenário

# LISTA DE ABREVIATURAS E SIGLAS

| Sigla | Significado |
|---|---|
| API | Interface de Programação de Aplicações (*Application Programming Interface*) |
| APS | Atenção Primária à Saúde |
| CDSS | Sistema de Apoio à Decisão Clínica (*Clinical Decision Support System*) |
| CEP | Comitê de Ética em Pesquisa |
| CNS | Conselho Nacional de Saúde |
| CONEP | Comissão Nacional de Ética em Pesquisa |
| DTN | Doenças Tropicais Negligenciadas |
| FTS | Busca Textual Completa (*Full-Text Search*) |
| HTTP | Protocolo de Transferência de Hipertexto (*Hypertext Transfer Protocol*) |
| HTTPS | Protocolo de Transferência de Hipertexto Seguro (*Hypertext Transfer Protocol Secure*) |
| IA | Inteligência Artificial |
| JSON | *JavaScript Object Notation* |
| JSONL | Linhas JSON (*JSON Lines*) |
| LGPD | Lei Geral de Proteção de Dados Pessoais |
| LLM | Modelo de Linguagem de Grande Escala (*Large Language Model*) |
| MB | Multibacilar |
| OMS | Organização Mundial da Saúde |
| ORM | Mapeamento Objeto-Relacional (*Object-Relational Mapping*) |
| PB | Paucibacilar |
| PCDT | Protocolo Clínico e Diretrizes Terapêuticas |
| PQT | Poliquimioterapia |
| RAG | Geração Aumentada por Recuperação (*Retrieval-Augmented Generation*) |
| RAGAS | *Retrieval Augmented Generation Assessment* |
| RRF | Fusão por Posição Recíproca (*Reciprocal Rank Fusion*) |
| SHA | Algoritmo de *Hash* Seguro (*Secure Hash Algorithm*) |
| SQL | *Structured Query Language* |
| SUS | Sistema Único de Saúde |
| TCLE | Termo de Consentimento Livre e Esclarecido |

# SUMÁRIO

- 1 INTRODUÇÃO
  - 1.1 OBJETIVOS
    - 1.1.1 Objetivo Geral
    - 1.1.2 Objetivos Específicos
  - 1.2 JUSTIFICATIVA
  - 1.3 ORGANIZAÇÃO DO TRABALHO
- 2 REFERENCIAL TEÓRICO
  - 2.1 HANSENÍASE E INFORMAÇÃO CLÍNICA
    - 2.1.1 Agente, transmissão e classificação
    - 2.1.2 Diagnóstico, tratamento e desafios na atenção primária
    - 2.1.3 Dimensão social da doença
  - 2.2 SISTEMAS DE APOIO À DECISÃO CLÍNICA
  - 2.3 MODELOS DE LINGUAGEM DE GRANDE ESCALA NA SAÚDE
  - 2.4 RECUPERAÇÃO DE INFORMAÇÃO
    - 2.4.1 Recuperação lexical
    - 2.4.2 *Embeddings* e recuperação densa
    - 2.4.3 Recuperação híbrida e reordenação
  - 2.5 GERAÇÃO AUMENTADA POR RECUPERAÇÃO (RAG)
    - 2.5.1 Arquitetura e *pipeline*
    - 2.5.2 Fundamentação e rastreabilidade das respostas
    - 2.5.3 Riscos e mecanismos de segurança
  - 2.6 AVALIAÇÃO DE SISTEMAS BASEADOS EM RAG
  - 2.7 ESTADO DA ARTE
    - 2.7.1 Inteligência Artificial aplicada à hanseníase
    - 2.7.2 RAG em medicina
  - 2.8 TRABALHOS RELACIONADOS
- 3 METODOLOGIA
  - 3.1 CARACTERIZAÇÃO DA PESQUISA
  - 3.2 ETAPAS DA PESQUISA
  - 3.3 CONSTRUÇÃO DA BASE DE CONHECIMENTO
    - 3.3.1 Base inicial de desenvolvimento
    - 3.3.2 Curadoria a partir de documentos oficiais
  - 3.4 DESENVOLVIMENTO DO SISTEMA
  - 3.5 AVALIAÇÃO TÉCNICA DO *PIPELINE*
  - 3.6 AVALIAÇÃO COMPARATIVA COM PARTICIPANTES
    - 3.6.1 Objetivo da avaliação
    - 3.6.2 Desenho e condições experimentais
    - 3.6.3 Participantes
    - 3.6.4 Perguntas e situações de avaliação
    - 3.6.5 Procedimento de apresentação das respostas
    - 3.6.6 Instrumento de avaliação e dimensões analisadas
    - 3.6.7 Coleta e organização dos dados
    - 3.6.8 Métodos de análise
    - 3.6.9 Aspectos éticos e proteção dos participantes
  - 3.7 AMEAÇAS À VALIDADE
- 4 DESENVOLVIMENTO DO SISTEMA
  - 4.1 REQUISITOS E PRINCÍPIOS DE PROJETO
  - 4.2 ARQUITETURA GERAL
  - 4.3 MODELO DE DADOS
  - 4.4 BASE DE CONHECIMENTO E INGESTÃO
  - 4.5 *PIPELINE* DE CONSULTA
    - 4.5.1 Classificação de intenção e estimativa de risco clínico
    - 4.5.2 Busca híbrida
    - 4.5.3 Reordenação e limiar de relevância
    - 4.5.4 Camada de segurança
    - 4.5.5 Geração da resposta
    - 4.5.6 Registro para rastreabilidade e auditoria
  - 4.6 CONTROLE DE ACESSO E AVALIAÇÃO DAS RESPOSTAS
    - 4.6.1 Autenticação e sessões
    - 4.6.2 Registro da avaliação das respostas
  - 4.7 INTERFACE WEB
  - 4.8 VERIFICAÇÃO DO SOFTWARE
- 5 RESULTADOS
  - 5.1 ARTEFATO DESENVOLVIDO
  - 5.2 AVALIAÇÃO TÉCNICA PRELIMINAR
  - 5.3 RESULTADOS DA AVALIAÇÃO COMPARATIVA
    - 5.3.1 Execução da avaliação e participantes
    - 5.3.2 Avaliações por dimensão e cenário
    - 5.3.3 Análise por pergunta e por tipo de situação
    - 5.3.4 Percepções qualitativas dos participantes
- 6 DISCUSSÃO
  - 6.1 QUESTÕES DE PESQUISA
  - 6.2 RELAÇÃO COM A LITERATURA
  - 6.3 IMPLICAÇÕES PARA O PROJETO DE SISTEMAS RAG EM SAÚDE
  - 6.4 LIMITAÇÕES
- 7 CONSIDERAÇÕES FINAIS
- REFERÊNCIAS
- APÊNDICE A – PERGUNTAS DE REFERÊNCIA DA AVALIAÇÃO TÉCNICA
- APÊNDICE B – TRECHOS DA BASE INICIAL DE DESENVOLVIMENTO
- APÊNDICE C – RESPOSTAS DE RECUSA DEFINIDAS NA POLÍTICA DE SEGURANÇA
- APÊNDICE D – ANÁLISE TÉCNICA POR PERGUNTA
- APÊNDICE E – ESTRUTURA PREVISTA DO INSTRUMENTO DE AVALIAÇÃO

# 1 INTRODUÇÃO

Entre as doenças infecciosas que afetam populações em situação de vulnerabilidade, a Organização Mundial da Saúde (OMS) reúne sob a denominação de doenças tropicais negligenciadas (DTN) um conjunto de agravos que recebem atenção científica, política e financeira desproporcionalmente pequena diante da carga que impõem (World Health Organization, 2020). A hanseníase integra esse grupo. Trata-se de uma doença infecciosa crônica causada pelo *Mycobacterium leprae*, que acomete primariamente os nervos periféricos e a pele e pode resultar em incapacidades físicas permanentes quando o diagnóstico e o tratamento ocorrem tardiamente (Ministério da Saúde, 2022).

O Brasil ocupa a segunda posição mundial em número de casos novos da doença. Em 2024, foram identificados 22.129 casos novos no país, com taxa de detecção de 10,41 casos por 100 mil habitantes, e Índia, Brasil e Indonésia foram os únicos países a notificar mais de 10 mil casos novos, somando 79,8% da detecção global (Ministério da Saúde, 2026). Os indicadores brasileiros também sinalizam diagnóstico tardio: a proporção de casos novos multibacilares passou de 68,9% em 2015 para 82,2% em 2024, e 11,5% dos casos novos de 2024 já apresentavam grau 2 de incapacidade física no momento do diagnóstico (Ministério da Saúde, 2026).

O diagnóstico da hanseníase é eminentemente clínico, e a maioria dos casos pode ser confirmada no nível da Atenção Primária à Saúde (APS) (Ministério da Saúde, 2022). Recai sobre equipes generalistas, portanto, um conjunto amplo de tarefas: reconhecer sinais iniciais, conduzir o exame dermatoneurológico, classificar os casos para fins de tratamento, acompanhar a poliquimioterapia, avaliar contatos e identificar precocemente os episódios reacionais. As orientações para essas tarefas estão consolidadas no Protocolo Clínico e Diretrizes Terapêuticas (PCDT) da Hanseníase, documento de 152 páginas (Ministério da Saúde, 2022). Consultar um documento dessa extensão durante o atendimento nem sempre é viável, o que torna pertinente investigar meios de localizar rapidamente a orientação aplicável a uma dúvida e de indicar de onde ela foi extraída.

Os modelos de linguagem de grande escala (LLMs, do inglês *large language models*) ampliaram as possibilidades de consulta e síntese de conhecimento médico em linguagem natural (Singhal *et al.*, 2023). Seu uso direto em contextos clínicos, contudo, enfrenta limitações conhecidas: esses modelos podem produzir conteúdo plausível e incorreto, fenômeno denominado alucinação, não indicam a origem das afirmações que fazem e têm conhecimento restrito aos dados de treinamento, que não acompanham a atualização dos protocolos (Ji *et al.*, 2023; Thirunavukarasu *et al.*, 2023).

A Geração Aumentada por Recuperação (RAG, do inglês *retrieval-augmented generation*)[^termo] procura mitigar essas limitações ao condicionar a geração de texto a trechos recuperados de uma base documental externa (Lewis *et al.*, 2020). Em vez de depender apenas do conhecimento armazenado nos parâmetros do modelo, o sistema localiza os trechos mais pertinentes à pergunta e redige a resposta a partir deles, o que permite indicar as fontes utilizadas e atualizar o conhecimento por meio da base, sem novo treinamento. Estudos em medicina mostram, entretanto, que a qualidade da recuperação é tão determinante quanto a do modelo gerador (Xiong *et al.*, 2024), e revisões recentes apontam que a área ainda carece de validação clínica, de padronização da avaliação e de adaptação a idiomas diferentes do inglês (Amugongo *et al.*, 2025; Yang *et al.*, 2026).

No caso da hanseníase, a produção em Inteligência Artificial (IA) concentra-se no apoio ao diagnóstico e à triagem, sobretudo a partir de imagens de lesões cutâneas, exames laboratoriais e questionários (Fernandes *et al.*, 2024; Barbieri *et al.*, 2022; Simões *et al.*, 2025). Na literatura consultada para este trabalho, não foram identificados sistemas baseados em RAG voltados ao apoio informacional sobre a doença, em língua portuguesa e ancorados em documentos oficiais brasileiros.

Diante desse cenário, este trabalho desenvolve o NexoHansen (nome provisório), um sistema de apoio informacional à decisão clínica em hanseníase baseado em RAG. O sistema recupera trechos de uma base de conhecimento curada, redige respostas restritas a esses trechos, indica as fontes utilizadas, aplica regras explícitas de segurança a situações que exigem avaliação presencial, como pedidos de diagnóstico definitivo ou de prescrição, e registra cada consulta para fins de auditoria. O sistema não substitui o julgamento clínico e não foi validado para uso assistencial. No âmbito desta pesquisa, ele é o artefato por meio do qual se investiga como uma arquitetura RAG pode ser projetada para esse domínio e como as respostas que produz são percebidas em comparação com as de um modelo de linguagem sem recuperação.

A pesquisa é orientada pela seguinte questão: como um sistema baseado em Geração Aumentada por Recuperação, com base de conhecimento curada, indicação de fontes e regras explícitas de segurança, pode ser projetado para o apoio informacional em hanseníase, e como as respostas que ele produz são avaliadas por participantes em comparação com respostas de um modelo de linguagem sem recuperação? Para tratá-la, a questão foi desdobrada em três questões específicas:

a) QP1: quais decisões de arquitetura permitem que o sistema indique a origem de suas respostas e recuse as situações que ultrapassam seus limites de segurança?

b) QP2: com a configuração adotada, o mecanismo de recuperação localiza os trechos esperados para um conjunto de perguntas de referência?

c) QP3: como participantes avaliam as respostas produzidas com e sem recuperação, segundo os critérios definidos no protocolo de avaliação?

As questões QP1 e QP2 são tratadas pelo desenvolvimento e pela avaliação técnica do sistema. A QP3 depende de uma avaliação com participantes que, no estágio atual do trabalho, está planejada e ainda não foi realizada.

## 1.1 OBJETIVOS

### 1.1.1 Objetivo Geral

Desenvolver um sistema de apoio informacional à decisão clínica em hanseníase baseado na arquitetura RAG, capaz de produzir respostas fundamentadas em uma base de conhecimento curada, com indicação das fontes e aplicação de regras explícitas de segurança, e avaliar essas respostas tecnicamente e em comparação com as produzidas por um modelo de linguagem sem recuperação.

### 1.1.2 Objetivos Específicos

Para alcançar o objetivo geral, foram estabelecidos os seguintes objetivos específicos:

a) construir uma base de conhecimento sobre hanseníase organizada em trechos com metadados clínicos validados, alimentada por documentos oficiais e técnico-científicos, como o PCDT da Hanseníase;

b) projetar e implementar um *pipeline* RAG com recuperação híbrida, reordenação por critérios clínicos, regras explícitas de segurança, geração com indicação das fontes e registro das consultas;

c) desenvolver uma interface web para consulta ao sistema e para inspeção da recuperação, da base de conhecimento e da avaliação técnica;

d) avaliar tecnicamente o mecanismo de recuperação com um conjunto de perguntas de referência, identificando limitações da configuração adotada;

e) planejar e conduzir uma avaliação comparativa, com participantes, entre respostas produzidas com e sem RAG;

f) identificar as limitações do sistema e da avaliação em relação ao domínio clínico da hanseníase.

O Quadro 2, no Capítulo 3, relaciona cada objetivo às etapas metodológicas e indica sua situação nesta versão do trabalho.

## 1.2 JUSTIFICATIVA

A hanseníase representa um problema de saúde pública persistente, que afeta de forma desproporcional populações em situação de vulnerabilidade (World Health Organization, 2020; Ministério da Saúde, 2026). Como o diagnóstico é eminentemente clínico e pode ser confirmado, na maioria dos casos, na própria APS (Ministério da Saúde, 2022), a qualidade da informação técnica disponível para as equipes generalistas influencia a capacidade de reconhecer a doença, classificar os casos e identificar situações que exigem encaminhamento. Ferramentas que facilitem o acesso a orientações oficiais, com indicação clara de sua origem, têm, portanto, relevância potencial para esse contexto.

Do ponto de vista técnico, a pertinência de investigar uma arquitetura RAG decorre de três características do problema. A primeira é a necessidade de fundamentação: em saúde, uma resposta só é útil se puder ser conferida, o que exige que o sistema recupere trechos de uma base curada e indique de quais deles a resposta foi derivada (Lewis *et al.*, 2020; Zakka *et al.*, 2024). A segunda é a necessidade de tratar situações de risco: pedidos de diagnóstico definitivo ou de prescrição, assim como perguntas que envolvem gestantes, crianças ou sinais de urgência, devem receber recusa explicada e orientação para avaliação presencial, e não respostas geradas livremente. A terceira é a dependência da recuperação: estudos comparativos e revisões indicam que as decisões sobre o corpus, o modelo de *embedding* e o método de recuperação influenciam fortemente o desempenho de sistemas RAG em medicina (Xiong *et al.*, 2024; Amugongo *et al.*, 2025), o que justifica examinar essas decisões em um domínio específico e em língua portuguesa.

Do ponto de vista acadêmico, a literatura de IA aplicada à hanseníase concentra-se em triagem e apoio ao diagnóstico (Fernandes *et al.*, 2024), e as revisões sobre RAG em saúde registram predomínio de dados em inglês e atenção insuficiente a segurança e viés nas avaliações (Amugongo *et al.*, 2025; Yang *et al.*, 2026). Um estudo que documente o projeto de um sistema RAG para uma DTN, em português, e que compare suas respostas com as de um modelo sem recuperação contribui para reduzir parte dessa lacuna. Para a Engenharia de Software, o trabalho oferece um caso concreto de projeto de um sistema baseado em modelos de linguagem em domínio sensível, no qual requisitos de rastreabilidade, segurança e testabilidade orientam a arquitetura.

Cabe distinguir a relevância potencial da proposta das conclusões que ela poderá sustentar. O sistema desenvolvido é um protótipo acadêmico e não foi submetido a validação clínica. Os resultados da avaliação comparativa refletirão a percepção de participantes sobre respostas a um conjunto delimitado de perguntas e não poderão ser interpretados como evidência de eficácia clínica, de segurança assistencial ou de superioridade em relação ao julgamento profissional.

## 1.3 ORGANIZAÇÃO DO TRABALHO

Além desta introdução, o trabalho está organizado em seis capítulos. O Capítulo 2 apresenta o referencial teórico, abordando a hanseníase e a informação clínica, os sistemas de apoio à decisão clínica, os modelos de linguagem, a recuperação de informação, a arquitetura RAG, a avaliação desses sistemas, o estado da arte e os trabalhos relacionados. O Capítulo 3 descreve a metodologia, distinguindo as etapas de desenvolvimento do sistema, a avaliação técnica e a avaliação comparativa planejada. O Capítulo 4 detalha o sistema desenvolvido. O Capítulo 5 reúne os resultados disponíveis e a estrutura destinada aos resultados da avaliação comparativa. O Capítulo 6 discute os resultados e as limitações, e o Capítulo 7 apresenta as considerações finais. Os apêndices trazem o conjunto de perguntas de referência, a composição da base inicial, as respostas de recusa definidas na política de segurança, a análise técnica por pergunta e a estrutura prevista para o instrumento de avaliação.

# 2 REFERENCIAL TEÓRICO

Este capítulo reúne os fundamentos que sustentam o problema investigado e as decisões de projeto do sistema. A Seção 2.1 caracteriza a hanseníase e o contexto de informação clínica em que o sistema se insere. A Seção 2.2 trata dos sistemas de apoio à decisão clínica, e a Seção 2.3, dos modelos de linguagem de grande escala aplicados à saúde. As Seções 2.4 e 2.5 apresentam, respectivamente, os fundamentos de recuperação de informação e a arquitetura RAG, incluindo os mecanismos de rastreabilidade e de segurança. A Seção 2.6 discute a avaliação de sistemas baseados em RAG. Por fim, as Seções 2.7 e 2.8 apresentam o estado da arte e os trabalhos relacionados.

## 2.1 HANSENÍASE E INFORMAÇÃO CLÍNICA

### 2.1.1 Agente, transmissão e classificação

A hanseníase é causada pelo *Mycobacterium leprae*, bacilo que acomete primariamente os nervos periféricos e a pele. A principal fonte de infecção são pessoas com a doença não tratada e com alta carga bacilar, que eliminam o bacilo pelas vias aéreas superiores; a transmissão ocorre pelo contato direto pessoa a pessoa e é facilitada pelo convívio de doentes não tratados com pessoas suscetíveis. O período de incubação não é conhecido com precisão, mas estima-se que dure, em média, cinco anos, havendo relatos de manifestação um ano após o contato e de casos em que a incubação ultrapassou 20 anos (Ministério da Saúde, 2022).

Para fins de tratamento, os casos são classificados operacionalmente segundo critérios definidos pela OMS. O caso paucibacilar (PB) caracteriza-se pela presença de uma a cinco lesões cutâneas e baciloscopia obrigatoriamente negativa; o multibacilar (MB), pela presença de mais de cinco lesões de pele e/ou baciloscopia positiva. Casos que suscitem dúvida quanto à classificação devem ser tratados como multibacilares (Ministério da Saúde, 2022). O PCDT descreve, ainda, as formas clínicas indeterminada, tuberculoide, dimorfa e virchowiana, cujo reconhecimento apoia o raciocínio clínico, embora a classificação operacional seja suficiente para a escolha do esquema terapêutico (Ministério da Saúde, 2022).

### 2.1.2 Diagnóstico, tratamento e desafios na atenção primária

O diagnóstico da hanseníase é eminentemente clínico e baseia-se no exame dermatoneurológico, com a identificação de sinais como lesões de pele com alteração de sensibilidade e o comprometimento de nervos periféricos; a maioria dos casos pode ser confirmada na APS (Ministério da Saúde, 2022). A baciloscopia é um exame laboratorial complementar ao diagnóstico clínico. Como os casos paucibacilares apresentam, por definição, baciloscopia negativa, um resultado negativo não afasta a doença. O Brasil foi o primeiro país a incorporar ao Sistema Único de Saúde (SUS) um teste rápido para detecção de anticorpos contra o *M. leprae*, indicado como ferramenta de apoio na avaliação de contatos (Ministério da Saúde, 2022).

O tratamento de primeira linha é a poliquimioterapia (PQT), associação de rifampicina, dapsona e clofazimina que leva à cura em até 98% dos casos tratados, com baixa taxa de recidiva. No esquema vigente, a poliquimioterapia única (PQT-U) é interrompida após seis doses mensais supervisionadas, administradas em até nove meses, nos casos paucibacilares, e após doze doses mensais supervisionadas, administradas em até dezoito meses, nos multibacilares (Ministério da Saúde, 2022). Um desafio adicional são as reações hansênicas, respostas imunológicas exacerbadas aos antígenos do bacilo que podem surgir durante ou após o tratamento. Seu manejo envolve medicamentos imunossupressores, como corticosteroides e talidomida, com atenção a eventos adversos e a contraindicações; a talidomida, por exemplo, é teratogênica e seu uso é proibido por mulheres grávidas (Ministério da Saúde, 2022).

Esse conjunto de decisões, da suspeição à classificação e do esquema terapêutico ao manejo das reações, exige consulta frequente a orientações técnicas detalhadas. Na APS, em que as equipes lidam com grande variedade de agravos, localizar a orientação pertinente a uma dúvida específica e verificar sua origem é uma necessidade concreta de informação, e é a esse tipo de necessidade que o sistema proposto se dirige.

### 2.1.3 Dimensão social da doença

Além das manifestações biológicas, a hanseníase carrega uma dimensão social marcada pelo estigma. A Lei nº 9.010, de 1995, estabeleceu a terminologia oficial relativa à doença no Brasil, vedando o uso do termo "lepra" e de seus derivados nos documentos oficiais (Brasil, 1995). Ainda assim, o preconceito e a discriminação persistem e podem levar ao isolamento social das pessoas afetadas (Lopes *et al.*, 2020), que relatam alterações em necessidades sociais e de estima associadas à doença (Palmeira *et al.*, 2020). Para um sistema de informação sobre hanseníase, essa dimensão reforça a importância de linguagem adequada e de cuidado na comunicação, aspecto considerado na categoria de perguntas psicossociais tratada pelo sistema (Seção 4.5.1).

## 2.2 SISTEMAS DE APOIO À DECISÃO CLÍNICA

Sistemas de apoio à decisão clínica (CDSS, do inglês *clinical decision support systems*) são ferramentas computacionais que oferecem a profissionais de saúde conhecimento e informações filtradas ou específicas para apoiar decisões no cuidado (Sutton *et al.*, 2020; Shortliffe; Cimino, 2014). Sutton *et al.* (2020) distinguem os sistemas baseados em conhecimento, que aplicam regras explícitas derivadas da literatura ou de especialistas, dos sistemas não baseados em conhecimento, que utilizam aprendizado de máquina ou outras técnicas estatísticas para reconhecer padrões nos dados.

As primeiras iniciativas na área datam da década de 1970. O INTERNIST-I apoiava o diagnóstico diferencial em clínica médica geral (Miller; Pople Jr.; Myers, 1985), e o MYCIN recomendava antibioticoterapia para infecções com base em regras codificadas por especialistas (Shortliffe, 1977). Esses sistemas demonstraram a viabilidade de representar parte do raciocínio clínico em computador, mas dependiam de bases de regras construídas manualmente, difíceis de manter e restritas a domínios estreitos.

A literatura sobre CDSS também documenta riscos que permanecem atuais, como a fadiga provocada pelo excesso de alertas, a dependência excessiva da ferramenta, a desatualização do conhecimento e a dificuldade de manutenção, além de incertezas sobre o efeito desses sistemas nos desfechos clínicos e nos custos (Sutton *et al.*, 2020). Entre as estratégias recomendadas para mitigá-los estão a transparência sobre a origem das recomendações, a avaliação contínua e a manutenção planejada do conhecimento. O sistema desenvolvido neste trabalho pode ser entendido como um apoio de natureza informacional: ele não recebe dados de pacientes nem emite recomendações individualizadas, limitando-se a localizar, organizar e citar orientações técnicas em resposta a perguntas.

## 2.3 MODELOS DE LINGUAGEM DE GRANDE ESCALA NA SAÚDE

Os modelos de linguagem de grande escala são redes neurais baseadas, em geral, na arquitetura Transformer, que utiliza mecanismos de atenção para modelar as relações entre os elementos de uma sequência (Vaswani *et al.*, 2017). Treinados em grandes coleções de texto, esses modelos executam tarefas variadas, como responder perguntas, resumir documentos e redigir textos, a partir de instruções em linguagem natural (*prompts*), sem treinamento específico para cada tarefa.

Na medicina, Singhal *et al.* (2023) mostraram que modelos dessa classe podem atingir desempenho elevado em conjuntos de perguntas de exames médicos, mas também que suas respostas permaneciam inferiores às de clínicos quando avaliadas por especialistas em múltiplas dimensões, o que levou os autores a propor avaliações humanas estruturadas, além das métricas automáticas. Thirunavukarasu *et al.* (2023), em revisão sobre o tema, apontam aplicações promissoras, como o apoio à documentação e à educação, e destacam riscos que limitam o uso clínico direto: informações incorretas apresentadas de forma convincente, ausência de indicação das fontes e conhecimento que não acompanha a atualização das diretrizes.

A produção de conteúdo sem sustentação na entrada ou nos fatos é tratada na literatura como alucinação. Ji *et al.* (2023) distinguem alucinações intrínsecas, que contradizem o conteúdo de origem, de alucinações extrínsecas, que acrescentam informações não verificáveis a partir dele. Em aplicações de saúde, ambas são críticas, pois uma afirmação incorreta sobre dose, contraindicação ou critério diagnóstico pode induzir erro. Essas limitações motivam abordagens que ancorem a geração em fontes verificáveis e que imponham limites explícitos ao que o modelo pode responder, como as discutidas nas seções seguintes.

## 2.4 RECUPERAÇÃO DE INFORMAÇÃO

Recuperação de informação é a tarefa de encontrar, em grandes coleções, material de natureza não estruturada, geralmente documentos de texto, que satisfaça uma necessidade de informação (Manning; Raghavan; Schütze, 2008). Em um sistema RAG, a qualidade dessa etapa condiciona a resposta final: se os trechos pertinentes não forem recuperados, o modelo gerador não terá como fundamentar a resposta, e, se forem recuperados trechos inadequados, poderá fundamentá-la em informação errada. As subseções a seguir apresentam as duas famílias de técnicas combinadas no sistema desenvolvido e as formas de combiná-las.

### 2.4.1 Recuperação lexical

A recuperação lexical, também chamada esparsa, compara a consulta e os documentos pelos termos que compartilham. Os documentos são indexados por seus termos, frequentemente após normalização e redução a radicais, e as correspondências são ordenadas por funções de relevância que consideram, por exemplo, a frequência do termo no documento e sua raridade na coleção (Manning; Raghavan; Schütze, 2008). O BM25 é uma das funções mais difundidas dessa família (Robertson; Zaragoza, 2009).

O PostgreSQL oferece recursos nativos de busca textual completa (FTS, do inglês *full-text search*): os documentos são convertidos em vetores de lexemas (`tsvector`), e as consultas, em expressões de busca (`tsquery`), com dicionários específicos por idioma, inclusive o português. Para ordenar os resultados, há as funções `ts_rank` e `ts_rank_cd`; esta última calcula a relevância por densidade de cobertura, considerando a proximidade entre os termos da consulta no documento (PostgreSQL Global Development Group, 2026; Clarke; Cormack; Tudhope, 2000). A recuperação lexical é eficaz para termos técnicos exatos, como "baciloscopia" ou "PQT-U", mas falha quando a pergunta usa vocabulário diferente do texto, como sinônimos e paráfrases.

### 2.4.2 *Embeddings* e recuperação densa

Na recuperação densa, a consulta e os documentos são representados por vetores numéricos de dimensão fixa, os *embeddings*, produzidos por modelos treinados para que textos semanticamente próximos resultem em vetores próximos. A relevância é estimada por uma medida de similaridade entre vetores, como a similaridade de cosseno (Karpukhin *et al.*, 2020). Essa abordagem reduz o problema do vocabulário divergente, pois uma pergunta pode recuperar um trecho relevante mesmo sem compartilhar termos com ele.

A qualidade da recuperação densa depende do modelo de *embedding*. Há modelos treinados especificamente em textos biomédicos, como o BioBERT (Lee *et al.*, 2020), e modelos de propósito geral oferecidos como serviço, como o `text-embedding-3-small`, que produz vetores de 1.536 dimensões (OpenAI, 2024). Estudos recentes observam que os modelos disponíveis são, em sua maioria, treinados com dados públicos em inglês, o que limita seu desempenho em documentos clínicos especializados e em outros idiomas (Arzideh *et al.*, 2026; Yang *et al.*, 2026).

Para armazenar e consultar *embeddings*, utilizam-se bancos de dados ou extensões vetoriais. O pgvector é uma extensão de código aberto do PostgreSQL que adiciona o tipo `vector`, operadores de distância, entre eles a distância de cosseno, e índices para busca aproximada, como IVFFlat e HNSW (Kane, 2026). Sua adoção permite manter dados relacionais, texto indexado e vetores em um único banco de dados.

### 2.4.3 Recuperação híbrida e reordenação

Como as duas famílias de técnicas falham em situações diferentes, é comum combiná-las em uma recuperação híbrida. A combinação pode ser feita pela soma ponderada das pontuações de cada método, o que exige que elas estejam em escalas comparáveis, ou por métodos baseados apenas na posição dos documentos em cada lista, como a fusão por posição recíproca (RRF, do inglês *reciprocal rank fusion*), que dispensa a calibração das escalas (Cormack; Clarke; Büttcher, 2009). Em sistemas RAG para medicina, Xiong *et al.* (2024) observaram que a escolha do corpus e dos recuperadores influencia significativamente o desempenho, e arquiteturas recentes combinam recuperação densa, recuperação lexical e grafos de conhecimento (Xu *et al.*, 2025).

A reordenação (*reranking*) é uma segunda etapa que reavalia um conjunto menor de candidatos com critérios mais informativos que os da recuperação inicial. Ela pode ser feita por modelos treinados para estimar a relevância de pares pergunta-trecho, como os baseados em BERT (Nogueira; Cho, 2019), ou por regras que incorporam conhecimento do domínio. Neste trabalho, adotou-se a segunda alternativa: a reordenação utiliza metadados clínicos dos trechos, como a criticidade e a relação com medicamentos ou reações, conforme descrito na Seção 4.5.3.

## 2.5 GERAÇÃO AUMENTADA POR RECUPERAÇÃO (RAG)

Lewis *et al.* (2020) propuseram a RAG como a combinação de uma memória paramétrica, representada pelo modelo de linguagem pré-treinado, com uma memória não paramétrica, representada por um índice de documentos acessado por um recuperador. Ao condicionar a geração a documentos recuperados, a abordagem permite produzir respostas mais específicas e factuais, além de possibilitar a atualização do conhecimento pela substituição do índice. Desde então, a técnica tornou-se uma das principais formas de adaptar modelos de linguagem a domínios específicos (Gao *et al.*, 2023).

### 2.5.1 Arquitetura e *pipeline*

Um sistema RAG compreende duas fases (Gao *et al.*, 2023). Na fase de indexação, os documentos da base são extraídos, limpos e fragmentados em trechos (*chunks*); cada trecho é convertido em *embedding* e armazenado em um índice, frequentemente acompanhado de metadados. A estratégia de fragmentação influencia o resultado: trechos muito longos diluem a informação relevante, e trechos muito curtos perdem contexto, razão pela qual é comum adotar sobreposição entre trechos consecutivos e respeitar unidades do texto, como seções e listas (Gao *et al.*, 2023).

Na fase de inferência, a pergunta do usuário é convertida para o mesmo espaço de representação, os trechos mais relevantes são recuperados e incorporados ao *prompt* enviado ao modelo gerador, que redige a resposta a partir deles. Gao *et al.* (2023) classificam as arquiteturas em RAG ingênuo, que segue esse fluxo básico; RAG avançado, que acrescenta etapas antes e depois da recuperação, como a reescrita da consulta e a reordenação; e RAG modular, que organiza o sistema em componentes intercambiáveis. A arquitetura implementada neste trabalho, descrita no Capítulo 4, corresponde a um RAG avançado, com classificação prévia da pergunta, recuperação híbrida, reordenação e uma camada de segurança anterior à geração.

### 2.5.2 Fundamentação e rastreabilidade das respostas

A fundamentação (*grounding*) designa a correspondência entre o conteúdo da resposta e as fontes recuperadas. Em aplicações de saúde, ela é complementada pela rastreabilidade: a possibilidade de identificar quais trechos e documentos sustentaram cada resposta, tanto pelo usuário, que pode conferir a informação, quanto por quem audita o sistema. Zakka *et al.* (2024) mostraram, com o sistema Almanac, que a recuperação a partir de fontes médicas curadas aumentou a factualidade das respostas avaliadas por médicos em cenários clínicos, com ganhos também em completude e segurança. A citação de fontes, entretanto, não garante fidelidade: o modelo pode citar um trecho e afirmar algo que ele não sustenta, o que torna necessário avaliar a correspondência entre a resposta e as fontes (Es *et al.*, 2024).

### 2.5.3 Riscos e mecanismos de segurança

A RAG reduz, mas não elimina, os riscos discutidos na Seção 2.3. Erros de recuperação propagam-se para a resposta, perguntas fora do escopo da base podem receber respostas apoiadas em trechos pouco relacionados e o modelo gerador pode deixar de seguir as instruções do *prompt*. Por isso, sistemas destinados a contextos sensíveis costumam combinar a recuperação com mecanismos explícitos de controle, como limiares mínimos de relevância para responder, políticas de recusa para perguntas fora do escopo ou que exijam julgamento profissional, avisos sobre os limites da ferramenta e registro das interações para auditoria. As revisões de Amugongo *et al.* (2025) e Yang *et al.* (2026) observam que a maioria dos estudos sobre RAG em saúde dá pouca atenção a segurança, viés e privacidade, o que reforça a importância de tratar esses aspectos como requisitos de projeto.

Neste trabalho, adota-se o princípio de que as regras críticas de segurança devem ser implementadas em código, antes da geração, e não apenas descritas no *prompt*: instruções ao modelo orientam seu comportamento, mas não garantem que serão seguidas. Há, também, implicações de privacidade: como as perguntas podem ser enviadas a serviços externos de modelos de linguagem e são registradas para auditoria, o uso do sistema deve evitar dados pessoais de pacientes, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD) (Brasil, 2018).

## 2.6 AVALIAÇÃO DE SISTEMAS BASEADOS EM RAG

A avaliação de sistemas RAG considera, em geral, duas dimensões: a recuperação, isto é, se os trechos recuperados são pertinentes e suficientes, e a geração, isto é, se a resposta é correta, relevante e fiel aos trechos. Para a recuperação, são usuais métricas clássicas de recuperação de informação, como a revocação (*recall*) e a precisão entre os *k* primeiros resultados, calculadas a partir de julgamentos de relevância (Manning; Raghavan; Schütze, 2008). Para a geração, o *framework* RAGAS propõe métricas automáticas que dispensam respostas de referência anotadas, como a fidelidade (*faithfulness*), a relevância da resposta e a relevância do contexto, calculadas com o auxílio de modelos de linguagem (Es *et al.*, 2024).

Em saúde, as métricas automáticas são frequentemente complementadas por avaliação humana. Singhal *et al.* (2023) avaliaram respostas com médicos e leigos em dimensões como a concordância com o consenso científico, a possibilidade de dano e a presença de conteúdo inadequado ou incorreto; Zakka *et al.* (2024) utilizaram um painel de médicos para julgar factualidade, completude, preferência e segurança. A revisão de Yang *et al.* (2026) observa que as avaliações humanas em RAG médico concentram-se em acurácia, completude, relevância e fluência, com atenção insuficiente a viés e segurança, e Amugongo *et al.* (2025) não identificaram um *framework* padronizado de avaliação para RAG em saúde. Essas constatações orientam a avaliação planejada neste trabalho, que combina uma avaliação técnica da recuperação com uma avaliação comparativa por participantes, cujas dimensões ainda serão definidas no protocolo (Seção 3.6).

## 2.7 ESTADO DA ARTE

### 2.7.1 Inteligência Artificial aplicada à hanseníase

Fernandes *et al.* (2024) conduziram uma revisão sistemática sobre ferramentas de IA para apoio ao diagnóstico da hanseníase, seguindo as diretrizes PRISMA: de 1.659 estudos identificados em cinco bases de dados, 21 foram incluídos. Desses, 15 utilizaram apenas imagens de lesões cutâneas, um combinou imagens com dados clínicos e demográficos, e cinco utilizaram dados numéricos de exames, como expressão gênica, citocinas, qPCR e sorologia; nenhum dos estudos incluídos empregou sistemas baseados em texto ou em conversação. Os autores concluem que a pesquisa na área ainda está em estágio inicial e não tem maturidade suficiente para ser transformada em prática clínica.

Entre os trabalhos com dados clínicos e de imagem, Barbieri *et al.* (2022) desenvolveram o AI4Leprosy, assistente de diagnóstico que combina imagens de lesões cutâneas e dados clínicos e demográficos de 222 pacientes atendidos em um centro de referência brasileiro, totalizando 1.229 imagens e 585 conjuntos de metadados. Um modelo de regressão logística com regularização *elastic-net* alcançou acurácia de 90% e área sob a curva de 96,46%, e os autores destacam a necessidade de validação em populações com diferentes tipos de pele e com imagens obtidas por *smartphones*. Gama *et al.* (2019) combinaram análises moleculares e sorológicas com aprendizado de máquina para predizer o adoecimento entre contatos domiciliares, abordagem que depende de infraestrutura laboratorial. Simões *et al.* (2025) desenvolveram o MaLeSQs, versão do Questionário de Suspeição de Hanseníase baseada em aprendizado de máquina, cujo modelo selecionado, uma máquina de vetores de suporte, obteve sensibilidade de 85,7%, especificidade de 69,2% e área sob a curva de 0,775 na triagem. No contexto nacional, Andrade *et al.* (2024) apresentaram o Health Guardian, aplicativo colaborativo em estágio de protótipo que aplica IA ao apoio de profissionais no tratamento de DTN, entre elas a hanseníase.

Esses trabalhos convergem para tarefas de triagem, classificação e apoio ao diagnóstico, com dados de imagem, questionários ou exames. Na literatura consultada, não foram identificados sistemas voltados a responder perguntas sobre a doença com base em documentos oficiais, isto é, ao apoio informacional em linguagem natural, tarefa para a qual a RAG é especialmente adequada.

### 2.7.2 RAG em medicina

Xiong *et al.* (2024) propuseram o MIRAGE, conjunto de 7.663 perguntas extraídas de cinco bases de perguntas e respostas médicas, e o MedRAG, conjunto de ferramentas para comparar combinações de corpus, recuperadores e modelos. Os autores relatam ganhos de acurácia de até 18% em relação ao uso dos mesmos modelos sem recuperação e mostram que a escolha do corpus e do recuperador afeta significativamente o desempenho.

Zakka *et al.* (2024) desenvolveram o Almanac, sistema que recupera informação de fontes médicas curadas para responder a perguntas clínicas. Avaliado por um painel de médicos em 130 cenários clínicos, o sistema aumentou a factualidade das respostas em 18%, em média, com ganhos de completude e segurança em relação a modelos sem recuperação. Xu *et al.* (2025) propuseram o MEGA-RAG, que combina recuperação densa, recuperação lexical por BM25 e grafos de conhecimento biomédico com um reordenador e um módulo de refinamento sensível a discrepâncias entre evidências; os autores relatam redução superior a 40% na taxa de alucinação em perguntas de saúde pública em relação aos modelos de referência.

As revisões de Amugongo *et al.* (2025), que analisou 70 estudos, e de Yang *et al.* (2026) traçam um panorama convergente: predominam dados públicos e em inglês, modelos de *embedding* centrados no inglês e modelos de linguagem genéricos, proprietários na maior parte dos casos; não há *framework* padronizado de avaliação; e aspectos éticos, como privacidade, segurança e viés, recebem pouca atenção. Yang *et al.* (2026) concluem que a RAG em medicina ainda está em estágio inicial e que são necessárias validação clínica, adaptação a outros idiomas e atenção a contextos com poucos recursos.

## 2.8 TRABALHOS RELACIONADOS

O Quadro 1 reúne os trabalhos mais diretamente relacionados a esta pesquisa, organizados em duas linhas: sistemas e revisões sobre RAG em medicina e trabalhos de IA aplicada à hanseníase.

**Quadro 1 – Trabalhos relacionados ao sistema proposto**

| Trabalho | Objetivo e abordagem | Principais resultados | Relação com este trabalho |
|---|---|---|---|
| Xiong *et al.* (2024) | Avaliar sistematicamente a RAG em perguntas médicas, com o *benchmark* MIRAGE e o conjunto de ferramentas MedRAG | Ganhos de acurácia de até 18% em relação aos modelos sem recuperação; desempenho sensível à escolha do corpus e do recuperador | Fundamenta a recuperação híbrida e a comparação entre respostas com e sem recuperação |
| Zakka *et al.* (2024) | Desenvolver o Almanac, sistema RAG sobre fontes médicas curadas, avaliado por médicos | Aumento médio de 18% na factualidade, com ganhos de completude e segurança | Referência para a ancoragem em fontes curadas e para a avaliação humana por dimensões |
| Xu *et al.* (2025) | Propor o MEGA-RAG, com recuperação densa, BM25, grafos de conhecimento e refinamento da resposta | Redução superior a 40% na taxa de alucinação em saúde pública, segundo os autores | Exemplo de recuperação híbrida com reordenação aplicada à saúde |
| Amugongo *et al.* (2025); Yang *et al.* (2026) | Revisar a literatura sobre RAG em saúde e em medicina | Predomínio do inglês e de modelos genéricos; ausência de avaliação padronizada; pouca atenção a segurança e viés | Justificam o foco em português, em segurança e na definição explícita do protocolo de avaliação |
| Fernandes *et al.* (2024) | Revisar sistematicamente a IA no apoio ao diagnóstico da hanseníase | 21 estudos incluídos: 15 com imagens, um com imagens e dados clínicos e cinco com dados de exames; nenhum baseado em texto | Evidencia a ausência de sistemas de apoio informacional em linguagem natural para a doença |
| Barbieri *et al.* (2022) | Desenvolver o AI4Leprosy, combinando imagens de lesões e dados clínicos | Acurácia de 90% e área sob a curva de 96,46% com regressão logística *elastic-net* | Representa o apoio ao diagnóstico por imagem, distinto da abordagem textual deste trabalho |
| Simões *et al.* (2025) | Desenvolver o MaLeSQs, triagem baseada no Questionário de Suspeição de Hanseníase | Sensibilidade de 85,7% e especificidade de 69,2% | Mostra o uso de questionários na triagem, sem apoio informacional textual |

Fonte: Elaboração própria (2026).

Em relação a esses trabalhos, o presente estudo diferencia-se em quatro aspectos. Primeiro, dirige-se ao apoio informacional em linguagem natural sobre a hanseníase, e não à triagem, à classificação ou ao diagnóstico. Segundo, opera em português e foi projetado para ser alimentado com documentos oficiais brasileiros. Terceiro, trata a segurança como requisito de arquitetura, com regras de recusa implementadas em código, sinalização de risco e registro de cada consulta. Quarto, prevê a comparação, por participantes, entre respostas produzidas com e sem recuperação, sob protocolo documentado. Ao contrário de Xiong *et al.* (2024) e Zakka *et al.* (2024), este trabalho não dispõe, no estágio atual, de base de conhecimento extensa nem de avaliação por especialistas, limitação discutida no Capítulo 6.

# 3 METODOLOGIA

Este capítulo descreve os procedimentos adotados e planejados na pesquisa. A Seção 3.1 caracteriza a pesquisa, e a Seção 3.2 apresenta suas etapas. As Seções 3.3 e 3.4 tratam da construção da base de conhecimento e do desenvolvimento do sistema. A Seção 3.5 descreve a avaliação técnica do *pipeline*, e a Seção 3.6, a avaliação comparativa com participantes, ainda não realizada. A Seção 3.7 discute as ameaças à validade. Ao longo do capítulo, distinguem-se os procedimentos já executados daqueles planejados, e as decisões ainda pendentes são indicadas nos pontos em que deverão ser registradas.

## 3.1 CARACTERIZAÇÃO DA PESQUISA

Quanto à natureza, trata-se de pesquisa aplicada, voltada à produção de conhecimento para a solução de um problema prático: o acesso a informação técnica sobre hanseníase com indicação de fontes e limites de segurança. Quanto aos objetivos, a pesquisa é exploratória, por investigar a aplicação de RAG a um domínio ainda pouco estudado, e descritiva, por caracterizar a arquitetura construída e o comportamento do sistema diante de perguntas sobre a doença. Quanto à abordagem, prevê-se a combinação de dados quantitativos, como os indicadores da avaliação técnica e as avaliações em escala, com dados qualitativos, como os comentários dos participantes. [DEFINIR COM O ORIENTADOR: confirmar a abordagem, quantitativa, qualitativa ou mista, após a definição do instrumento de avaliação.]

Quanto aos procedimentos, a pesquisa adota a pesquisa em ciência do design (*design science research*), abordagem voltada à criação e à avaliação de artefatos que resolvam problemas relevantes (Hevner *et al.*, 2004). Utiliza-se como referência o processo proposto por Peffers *et al.* (2007), composto por seis atividades: identificação do problema e motivação, definição dos objetivos da solução, projeto e desenvolvimento, demonstração, avaliação e comunicação. A avaliação do artefato combina uma avaliação técnica, executada com um conjunto de perguntas de referência, e uma avaliação comparativa com participantes, cujo desenho segue princípios de experimentação em Engenharia de Software, como o controle dos fatores que possam influenciar os resultados e a análise das ameaças à validade (Wohlin *et al.*, 2012). [VERIFICAR COM O ORIENTADOR: adoção da pesquisa em ciência do design como referencial metodológico.]

## 3.2 ETAPAS DA PESQUISA

A Figura 1 apresenta as etapas da pesquisa, adaptadas do processo de Peffers *et al.* (2007), e a situação de cada uma nesta versão do trabalho.

**Figura 1 – Etapas da pesquisa e situação de cada uma**

![Etapas da pesquisa e situação de cada uma](figuras/fig-etapas.png)

Fonte: Elaborado pelo autor com base em Peffers *et al.* (2007).

Na etapa 1, identificação do problema e motivação, foram levantados o contexto epidemiológico da hanseníase, as necessidades de informação na APS e as limitações dos modelos de linguagem em saúde, apresentados nos Capítulos 1 e 2. Na etapa 2, definição dos objetivos da solução, esses elementos foram convertidos em requisitos: responder perguntas com base em uma base curada, indicar as fontes, recusar situações de risco e registrar as consultas (Seção 4.1). A etapa 3, projeto e desenvolvimento, compreendeu a construção da base inicial e a implementação do sistema (Seções 3.3 e 3.4). A etapa 4, demonstração, corresponde ao uso do sistema por meio da interface web, com perguntas de exemplo. A etapa 5, avaliação, divide-se em avaliação técnica, executada de forma preliminar (Seção 3.5), e avaliação comparativa com participantes, planejada (Seção 3.6). A etapa 6, comunicação, corresponde a esta monografia. Como prevê o processo de Peffers *et al.* (2007), os resultados da avaliação podem motivar o retorno às etapas de definição dos objetivos e de desenvolvimento; é o caso dos ajustes de configuração e das correções identificados na avaliação técnica preliminar, que deverão ser realizados antes da avaliação comparativa. Da mesma forma, o planejamento da avaliação comparativa motivou o retorno ao desenvolvimento para incluir a autenticação dos usuários e o registro da avaliação das respostas (Seção 4.6).

O Quadro 2 relaciona os objetivos específicos às etapas e indica a situação de cada um.

**Quadro 2 – Correspondência entre objetivos específicos, etapas e situação atual**

| Objetivo específico | Etapa | Situação nesta versão |
|---|---|---|
| a) Base de conhecimento | 3 | Parcial: estrutura, esquema de metadados, ingestão e base inicial com 15 trechos concluídos; curadoria a partir de documentos oficiais pendente |
| b) *Pipeline* RAG | 3 | Implementado e verificado por testes automatizados; validação com banco de dados real e *embeddings* semânticos pendente |
| c) Interface web | 3 e 4 | Implementada como protótipo, com acesso por login e avaliação das respostas de 0 a 10; a tela de comparação ainda usa uma simulação local no lugar do Cenário B |
| d) Avaliação técnica | 5 | Execução preliminar realizada com *embeddings* determinísticos; nova execução pendente |
| e) Avaliação comparativa | 5 | Planejada; protocolo, verificação ética e coleta pendentes |
| f) Limitações | 5 e 6 | Limitações técnicas identificadas; limitações da avaliação comparativa pendentes |

Fonte: Elaboração própria (2026).

## 3.3 CONSTRUÇÃO DA BASE DE CONHECIMENTO

### 3.3.1 Base inicial de desenvolvimento

Para viabilizar o desenvolvimento e os testes do sistema antes da curadoria definitiva, foi construída uma base inicial com 15 trechos sobre hanseníase, organizados em 11 documentos lógicos que cobrem sinais e sintomas, diagnóstico clínico e diferencial, classificação operacional, baciloscopia, tratamento, medicamentos, reações hansênicas, prevenção de incapacidades, contatos e vigilância e a política de segurança do próprio sistema (Apêndice B). Os trechos foram redigidos diretamente no formato de linhas JSON (JSONL), com texto curto e metadados clínicos, e registram como referência de origem "Seed técnico local para desenvolvimento e validação inicial", com data de revisão de 11 de junho de 2026.

Essa base cumpre função de engenharia: exercitar a ingestão, a recuperação, a reordenação e as regras de segurança com conteúdo representativo do domínio. Ela não foi extraída de documentos oficiais com indicação de página nem revisada por especialistas e, por isso, não deve ser tomada como fonte clínica nem como evidência de cobertura suficiente do tema. A própria documentação do repositório registra que a base deve ser substituída ou complementada por documentos oficiais revisados antes de qualquer uso real.

### 3.3.2 Curadoria a partir de documentos oficiais

A base definitiva deverá ser construída a partir de documentos oficiais e técnico-científicos, tendo o PCDT da Hanseníase (Ministério da Saúde, 2022) como fonte primária. O processo previsto compreende a seleção dos documentos segundo critérios de inclusão, exclusão, atualização e confiabilidade; a extração e a limpeza do texto; a fragmentação; a atribuição de metadados; o registro da fonte, da página e da data de revisão de cada trecho; e a revisão do conteúdo.

A estratégia de fragmentação documentada no projeto estabelece trechos com tamanho médio de 500 a 900 *tokens* e sobreposição de 15% a 25%, sem interromper explicações clínicas, preservando tabelas e listas de condutas e mantendo no mesmo trecho informações que só fazem sentido em conjunto, como medicamento, dose, duração, população-alvo e contraindicação, ou reação hansênica, sinais de alerta e conduta de segurança. Trechos sobre medicamentos e segurança devem ser menores e facilmente rastreáveis. O sistema dispõe de um componente que implementa parte dessa estratégia, agrupando parágrafos até cerca de 700 *tokens* estimados, com 20% de sobreposição e preservação de tabelas e listas clínicas, mas ele ainda não está integrado ao fluxo de ingestão (Seção 4.4).

[PREENCHER APÓS A CURADORIA: documentos incluídos, com versão e data; critérios de inclusão e exclusão aplicados; número final de trechos por tema; procedimento de revisão do conteúdo e responsáveis; versão da base utilizada nas avaliações.] [DEFINIR COM O ORIENTADOR: necessidade e forma de revisão dos trechos por profissional de saúde antes da avaliação comparativa.]

## 3.4 DESENVOLVIMENTO DO SISTEMA

O desenvolvimento ocorreu de forma incremental entre junho e outubro de 2026. A primeira versão implementou o servidor, com a base inicial, o *pipeline* de consulta e os testes automatizados; as versões seguintes acrescentaram a interface web, corrigiram falhas identificadas na execução contra o banco de dados real e reformularam a interface pública; a mais recente, de outubro de 2026, acrescentou a autenticação dos usuários e o registro da avaliação das respostas em escala de 0 a 10. Os requisitos foram derivados do problema e da política de segurança clínica documentada no projeto e são apresentados na Seção 4.1.

O servidor foi implementado em Node.js com TypeScript, com o *framework* Express para a interface de programação de aplicações (API, do inglês *application programming interface*) HTTP, o Prisma como ferramenta de mapeamento objeto-relacional (ORM), o PostgreSQL 16 com a extensão pgvector como banco de dados, a biblioteca Zod para a validação de dados e configurações e o Vitest para os testes automatizados. A interface web foi implementada em React com TypeScript, utilizando Vite, Tailwind CSS, TanStack Query e React Router. O uso de TypeScript nas duas camadas buscou manter contratos explícitos entre elas, e a escolha do PostgreSQL com pgvector, concentrar dados relacionais, texto indexado e vetores em um único banco de dados, sem serviço vetorial separado.

A verificação do software combinou análise estática, com ESLint no servidor e oxlint na interface, verificação de tipos, compilação e testes automatizados. Os testes utilizam dublês em memória para o repositório e para o provedor de *embeddings*, o que permite exercitar a lógica de classificação, recuperação, segurança e montagem das respostas sem depender do banco de dados nem de serviços externos. Com a inclusão da autenticação e do registro das avaliações, somaram-se testes da API por requisições HTTP, testes de integração com o banco de dados, restritos às tabelas de usuários, sessões e avaliações, e testes de componentes da interface, escritos com Vitest e Testing Library (Seção 4.8).

## 3.5 AVALIAÇÃO TÉCNICA DO *PIPELINE*

A avaliação técnica tem por objetivo verificar se o mecanismo de recuperação localiza, para um conjunto de perguntas de referência, os trechos esperados (QP2). O instrumento é um conjunto de 25 perguntas elaborado durante o desenvolvimento (Apêndice A). Cada pergunta registra a resposta esperada, os trechos considerados ideais, o nível de risco, os critérios de correção e os erros críticos a evitar; para a pergunta "Baciloscopia negativa exclui hanseníase?", por exemplo, o trecho ideal é `hans_exame_bacilo_001`, e o erro crítico é afirmar que o resultado negativo exclui a doença.

O procedimento é executado pelo próprio sistema, por meio da rota `POST /api/evaluation/run`: cada pergunta percorre o fluxo completo de consulta, com perfil de profissional de saúde, e registram-se as fontes retornadas, o acionamento de recusa e o nível de risco. A partir desses registros, calculam-se dois indicadores: a proporção de perguntas em que ao menos um trecho ideal aparece entre as fontes da resposta, tratada no sistema como aproximação da revocação por trecho ideal, e o número de recusas.

Esses indicadores têm alcance limitado. O primeiro mede a presença de um trecho ideal entre as até cinco fontes da resposta final, e não a posição desse trecho no ranqueamento nem a correção da resposta; os campos de resposta esperada e de erros críticos não são verificados automaticamente. Além disso, quando o limiar mínimo de relevância não é atingido, o sistema recusa a pergunta e não retorna fontes, de modo que o indicador também reflete a calibração do limiar. Para cada execução, devem ser registrados o provedor de *embeddings*, o modelo gerador, o limiar mínimo de relevância, os parâmetros de recuperação, a versão da base e a data.

Uma execução preliminar foi realizada com *embeddings* determinísticos locais e está relatada na Seção 5.2, acompanhada de uma análise das partes determinísticas do *pipeline*. Estão previstas uma nova execução, após a reindexação da base com *embeddings* semânticos, e a calibração do limiar mínimo de relevância a partir do conjunto de referência, observando a relação entre a revocação e o número de recusas. [PREENCHER APÓS A NOVA EXECUÇÃO: configuração utilizada, valores de limiar testados e critério de escolha.] [DEFINIR COM O ORIENTADOR: adoção de métricas automáticas de avaliação da geração, como as do RAGAS (Es *et al.*, 2024), e de revisão das respostas por especialista.]

## 3.6 AVALIAÇÃO COMPARATIVA COM PARTICIPANTES

Esta seção apresenta a estrutura da avaliação comparativa, que ainda não foi realizada. Os elementos já definidos são descritos a seguir, e as decisões pendentes estão indicadas nos pontos em que deverão ser registradas. Nenhuma coleta de dados deverá ocorrer antes da definição do protocolo e da verificação dos requisitos éticos descritos na Seção 3.6.9.

### 3.6.1 Objetivo da avaliação

A avaliação comparativa tem por objetivo responder à QP3, investigando como participantes avaliam respostas a perguntas sobre hanseníase produzidas em dois cenários. No Cenário A, a resposta é produzida pelo NexoHansen, com recuperação de trechos da base de conhecimento, indicação das fontes e aplicação das regras de segurança. No Cenário B, a resposta é produzida por um modelo de linguagem sem acesso ao mecanismo de recuperação do Cenário A. A avaliação mede a percepção dos participantes sobre as respostas e não se destina a demonstrar eficácia clínica, segurança assistencial ou superioridade em relação a profissionais de saúde.

### 3.6.2 Desenho e condições experimentais

A comparação só será interpretável se os dois cenários forem definidos de forma consistente e documentada. A diferença entre eles deve residir, tanto quanto possível, no uso da recuperação e dos mecanismos associados, e não em fatores alheios ao objeto do estudo. Para isso, os seguintes elementos precisam ser definidos antes da coleta:

a) mecanismo do Cenário B: a implementação atual da tela de comparação produz a resposta sem RAG por meio de uma simulação executada no navegador, que monta um texto padronizado a partir da pergunta, sem consultar nenhum modelo de linguagem (Seção 4.7). Essa simulação não pode ser usada como Cenário B e deverá ser substituída por chamadas reais a um modelo de linguagem, com registro das configurações;

b) modelo do Cenário B: usar o mesmo modelo gerador do Cenário A, sem recuperação, isola o efeito da recuperação e da camada de segurança, enquanto usar um assistente de propósito geral aproxima a comparação do uso cotidiano dessas ferramentas, com menor controle sobre as diferenças entre os cenários;

c) instruções ao modelo do Cenário B: conteúdo do *prompt*, idioma, extensão esperada das respostas e eventual menção ao perfil de profissional de saúde;

d) apresentação das respostas: no Cenário A, as respostas incluem fontes e nota de segurança, elementos que podem revelar o cenário ao participante; deve-se decidir se as respostas serão apresentadas em formato neutro ou no formato de cada sistema, considerando que a indicação de fontes é parte do que se pretende avaliar;

e) cegamento e ordem de apresentação: se os participantes saberão qual cenário produziu cada resposta e como será definida a ordem de exposição, por exemplo por alternância ou sorteio;

f) desenho intra ou entre participantes: se cada participante avaliará respostas dos dois cenários para as mesmas perguntas ou se cada cenário será avaliado por grupos distintos;

g) correções prévias no Cenário A: os acionamentos indevidos das regras de segurança e da classificação de intenção identificados na Seção 4.5 podem levar à recusa de perguntas legítimas e deverão ser corrigidos, ou controlados na seleção das perguntas, antes da geração das respostas.

[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: decisões adotadas para cada item acima, com justificativa.] O Quadro 3 apresenta os parâmetros que deverão ser registrados para cada cenário, de modo a permitir a reprodução das condições.

**Quadro 3 – Parâmetros a registrar para cada cenário de avaliação**

| Parâmetro | Cenário A (com RAG) | Cenário B (sem RAG) |
|---|---|---|
| Versão do sistema (*commit* do repositório) | [PREENCHER] | [PREENCHER] |
| Modelo de linguagem e versão | [PREENCHER] | [PREENCHER] |
| Temperatura e demais parâmetros de geração | [PREENCHER] (padrão atual: 0,1) | [PREENCHER] |
| *Prompt* de sistema | *Prompt* clínico do sistema (Seção 4.5.5) | [PREENCHER] |
| Modelo de *embedding* | [PREENCHER] | Não se aplica |
| Versão da base de conhecimento | [PREENCHER] | Não se aplica |
| Parâmetros de recuperação (*top-K*, *top-N* e limiar mínimo) | [PREENCHER] (padrão atual: 12, 5 e 0,65) | Não se aplica |
| Regras de segurança | Ativas (Seção 4.5.4) | [DEFINIR: ausentes ou equivalentes] |
| Data e ambiente de geração das respostas | [PREENCHER] | [PREENCHER] |

Fonte: Elaboração própria (2026).

### 3.6.3 Participantes

O estudo prevê a participação de pessoas com perfil adequado ao objeto da pesquisa, preferencialmente profissionais de saúde ou estudantes da área com contato com o tema. [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: perfil dos participantes; forma de recrutamento; critérios de inclusão, como formação, área de atuação e experiência com hanseníase; critérios de exclusão; tamanho pretendido da amostra e sua justificativa.] Os dados de caracterização dos participantes deverão ser coletados e relatados apenas de forma agregada, sem informações que permitam a identificação individual.

### 3.6.4 Perguntas e situações de avaliação

As perguntas apresentadas aos participantes devem contemplar situações em que se espera uma resposta fundamentada e situações em que se espera recusa, de modo a avaliar também o comportamento dos cenários diante de pedidos de diagnóstico definitivo, de prescrição ou fora do escopo. O conjunto de 25 perguntas de referência (Apêndice A) pode servir de ponto de partida, mas foi elaborado durante o desenvolvimento, em conjunto com a base inicial, o que pode favorecer o Cenário A; recomenda-se, por isso, que as perguntas finais sejam revisadas ou complementadas por pessoa externa ao desenvolvimento. [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: número de perguntas; critérios de seleção; distribuição por tema e por tipo de situação (resposta esperada, recusa esperada e fora do escopo); origem e revisão das perguntas.]

### 3.6.5 Procedimento de apresentação das respostas

As respostas dos dois cenários deverão ser geradas antes da coleta, armazenadas e apresentadas aos participantes sempre na mesma forma, para que todos avaliem o mesmo conteúdo e os resultados possam ser reproduzidos. A geração em tempo real durante a sessão é desaconselhada, porque modelos de linguagem podem produzir respostas diferentes para a mesma pergunta. Caso a interface do próprio sistema seja adotada como meio de aplicação, ela já oferece acesso individual por usuário e senha, com contas criadas pelo pesquisador, e um componente de avaliação exibido após cada resposta (Seção 4.6). Esse componente, porém, avalia respostas geradas no momento da consulta e apenas do Cenário A; para seguir o procedimento acima, a interface precisaria ser adaptada para apresentar respostas previamente geradas, dos dois cenários. [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: meio de aplicação, como formulário ou interface do próprio sistema; formato de apresentação das respostas; ordem de exposição; instruções fornecidas aos participantes; tempo estimado da sessão.]

### 3.6.6 Instrumento de avaliação e dimensões analisadas

O instrumento deverá definir as dimensões avaliadas, a escala de resposta e os campos para comentários. As dimensões candidatas, derivadas da literatura discutida na Seção 2.6, estão listadas no Quadro 4; sua seleção final, assim como a escala, depende do protocolo. [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: dimensões adotadas, com a definição operacional de cada uma; escala de resposta; questões abertas; validação prévia do instrumento, por exemplo em teste piloto.] A estrutura prevista do instrumento encontra-se no Apêndice E. O sistema já registra, para cada resposta, uma nota global de 0 a 10 e um comentário opcional (Seção 4.6.2). Trata-se de uma medida única, que não substitui a avaliação por dimensões, mas pode compor o instrumento, por exemplo como avaliação geral de cada resposta, se o protocolo a adotar. [DEFINIR COM O ORIENTADOR: uso da nota global de 0 a 10 registrada pelo sistema no instrumento de avaliação.]

**Quadro 4 – Dimensões candidatas para o instrumento de avaliação**

| Dimensão candidata | Pergunta orientadora | Referência |
|---|---|---|
| Correção factual | A resposta está de acordo com as orientações técnicas vigentes? | Singhal *et al.* (2023); Zakka *et al.* (2024) |
| Completude | A resposta contempla os aspectos necessários à pergunta? | Zakka *et al.* (2024); Yang *et al.* (2026) |
| Relevância | A resposta trata do que foi perguntado? | Es *et al.* (2024); Yang *et al.* (2026) |
| Clareza | A resposta é compreensível para o público a que se destina? | Yang *et al.* (2026) |
| Segurança e potencial de dano | A resposta poderia induzir conduta inadequada? | Singhal *et al.* (2023); Zakka *et al.* (2024) |
| Adequação da recusa | Nos casos que exigem avaliação presencial, a recusa e a orientação são adequadas? | Política de segurança do sistema (Seção 4.5.4) |
| Transparência das fontes | É possível identificar de onde vem a informação? | Lewis *et al.* (2020); Zakka *et al.* (2024) |
| Confiança e utilidade percebidas | O participante confiaria na resposta e a consideraria útil? | [DEFINIR: referência a localizar, caso a dimensão seja adotada] |

Fonte: Elaboração própria (2026), com base nas referências indicadas.

### 3.6.7 Coleta e organização dos dados

Cada participante deverá receber um código não identificável, e as avaliações deverão ser registradas em formato estruturado, com uma linha por combinação de participante, pergunta e cenário, contendo as notas por dimensão e os comentários. O vínculo entre cada resposta avaliada e as condições registradas no Quadro 3 deve ser preservado. Os dados deverão ser armazenados com acesso restrito ao pesquisador e ao orientador. Se as avaliações forem registradas pelo próprio sistema, cada uma ficará vinculada ao usuário, à conversa e à resposta avaliada, sem possibilidade de duplicidade (Seção 4.6.2). Para que esse vínculo seja compatível com o anonimato dos participantes, os nomes de usuário deverão ser códigos não identificáveis, sem nome, matrícula ou endereço de *e-mail*, e a correspondência entre código e pessoa, se necessária, deverá ser mantida fora do sistema. [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: ferramenta de coleta; local e período de armazenamento; procedimento de exportação e de verificação de consistência; tratamento de respostas incompletas.]

### 3.6.8 Métodos de análise

A análise deverá comparar as avaliações dos dois cenários por dimensão, inicialmente por meio de estatística descritiva adequada ao tipo de escala adotada, e examinar os resultados por pergunta e por tipo de situação, incluindo o tratamento dado pelos dois cenários às perguntas que exigem recusa. Os comentários abertos deverão ser analisados qualitativamente, com categorias definidas a partir dos dados ou do protocolo. A escolha de testes estatísticos depende do desenho, da escala e do tamanho da amostra e deverá ser feita antes da coleta. [DEFINIR COM O ORIENTADOR: métodos estatísticos, nível de significância, se aplicável, e procedimento de análise qualitativa.]

### 3.6.9 Aspectos éticos e proteção dos participantes

Por envolver participantes humanos e conteúdo relacionado à saúde, a avaliação comparativa deverá observar as normas de ética em pesquisa vigentes no Brasil, em especial as Resoluções nº 466/2012 e nº 510/2016 do Conselho Nacional de Saúde (CNS) (Brasil, 2012; Brasil, 2016). A Resolução nº 510/2016 prevê, em seu artigo 1º, situações que não são registradas nem avaliadas pelo sistema formado pelos Comitês de Ética em Pesquisa (CEP) e pela Comissão Nacional de Ética em Pesquisa (CONEP), como a pesquisa de opinião pública com participantes não identificados; orientação da CONEP esclarece, porém, que essa dispensa se aplica apenas quando todos os procedimentos do protocolo se enquadram nessas hipóteses (Brasil, 2022). Como o protocolo ainda não está definido, a necessidade de submissão ao CEP não pode ser determinada nesta versão e deverá ser verificada com o orientador e com o CEP da instituição antes de qualquer coleta. [VERIFICAR COM O ORIENTADOR E O CEP INSTITUCIONAL: enquadramento ético do estudo e procedimentos necessários.]

Independentemente do enquadramento, o estudo deverá adotar participação voluntária, com possibilidade de desistência a qualquer momento; registro de consentimento, por meio de Termo de Consentimento Livre e Esclarecido (TCLE) ou instrumento equivalente; coleta mínima de dados pessoais e apresentação apenas de resultados agregados; e tratamento dos dados conforme a LGPD (Brasil, 2018). As perguntas e as respostas utilizadas não devem conter dados de pacientes. Deve-se considerar, ainda, que as consultas ao sistema são registradas no banco de dados para auditoria, vinculadas ao usuário, e que, no modo com modelo de linguagem, as perguntas são enviadas a um serviço externo, aspectos que precisam constar das informações fornecidas aos participantes, caso eles interajam diretamente com o sistema. Se o sistema for publicado em serviço de hospedagem externo, os dados dos participantes ficarão armazenados nesse serviço, possivelmente fora do Brasil, situação tratada pela LGPD nas regras sobre transferência internacional de dados (Brasil, 2018) e que também deverá ser informada aos participantes.

## 3.7 AMEAÇAS À VALIDADE

Seguindo a classificação de Wohlin *et al.* (2012), identificam-se, nesta fase, as seguintes ameaças à validade, que deverão ser revistas após a definição do protocolo:

a) validade de construto: as dimensões de qualidade avaliadas são, em parte, subjetivas, e sua definição operacional influencia o que se mede; além disso, se a base inicial for usada na avaliação, o Cenário A estará ancorado em conteúdo não extraído de documentos oficiais nem revisado;

b) validade interna: elementos visuais, como fontes e notas de segurança, podem revelar o cenário aos participantes; a ordem de apresentação, o cansaço ao longo da sessão e as diferenças de experiência entre participantes podem influenciar as avaliações; e as perguntas de referência foram elaboradas pelo próprio desenvolvedor;

c) validade externa: o tamanho reduzido da base, a amostra provavelmente pequena e de conveniência, o uso do português e a dependência de versões específicas de modelos limitam a generalização dos resultados, que não se estendem à prática clínica;

d) validade de conclusão: amostras pequenas reduzem o poder estatístico, e comparações múltiplas entre dimensões aumentam a chance de diferenças espúrias.

[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: medidas adotadas para mitigar cada ameaça.]

# 4 DESENVOLVIMENTO DO SISTEMA

Este capítulo descreve o sistema desenvolvido, denominado provisoriamente NexoHansen, conforme implementado no repositório do projeto. A Seção 4.1 apresenta os requisitos e princípios de projeto; as Seções 4.2 e 4.3, a arquitetura e o modelo de dados; a Seção 4.4, a base de conhecimento e a ingestão; a Seção 4.5, o *pipeline* de consulta; a Seção 4.6, o controle de acesso e o registro da avaliação das respostas; a Seção 4.7, a interface web; e a Seção 4.8, a verificação do software.

## 4.1 REQUISITOS E PRINCÍPIOS DE PROJETO

Os requisitos do sistema foram derivados do problema descrito no Capítulo 1 e da política de segurança clínica documentada no projeto. O Quadro 5 relaciona os requisitos funcionais (RF) e não funcionais (RNF) aos mecanismos que os implementam.

**Quadro 5 – Requisitos do sistema e mecanismos de implementação**

| Requisito | Mecanismo implementado | Componente principal |
|---|---|---|
| RF01. Responder perguntas sobre hanseníase em linguagem natural | Fluxo de consulta exposto pela rota `POST /api/chat/ask` | `ChatService` |
| RF02. Recuperar trechos pertinentes da base | Busca híbrida vetorial e textual, seguida de reordenação | `HybridSearchService`, `RerankingService` |
| RF03. Indicar as fontes de cada resposta | Lista de fontes com identificador do trecho, documento, título, seção e página | `ChatService`; componente de fontes da interface |
| RF04. Recusar situações que ultrapassam os limites de segurança | Regras explícitas avaliadas antes da geração | `SafetyService` |
| RF05. Sinalizar risco clínico e necessidade de avaliação presencial | Classificação de risco em quatro níveis e aviso anexado a todas as respostas | `ClinicalRiskService`, `SafetyService` |
| RF06. Registrar consultas para auditoria | Persistência das conversas, vinculadas ao usuário, das mensagens e dos registros de recuperação | Entidades `ChatSession`, `ChatMessage` e `RetrievalLog` |
| RF07. Ingerir trechos com metadados validados | Ingestão de arquivos JSONL com validação de esquema | `KnowledgeService`; esquema Zod de metadados |
| RF08. Permitir a inspeção da recuperação, da base e da avaliação | Rotas de busca, listagem e avaliação e painel interno | Módulos `retrieval`, `chunks` e `evaluation` |
| RF09. Registrar a avaliação dos usuários sobre as respostas | Nota inteira de 0 a 10 e comentário opcional, vinculados ao usuário, à conversa e à resposta, com uma avaliação por usuário e resposta | Módulo `feedback`; componente de avaliação da interface |
| RF10. Restringir o uso do sistema a usuários cadastrados | Login por usuário e senha, sessão em *cookie* e exigência de sessão nas rotas `/api`, exceto as de autenticação | Módulo `auth` |
| RNF01. Funcionar sem serviços externos | Provedor local de *embeddings* e resposta extrativa | `DeterministicEmbeddingsProvider`, `ChatService` |
| RNF02. Validar configurações e entradas | Esquemas de validação para variáveis de ambiente e requisições; restrições no banco de dados | `env.ts`; esquemas Zod; migrações |
| RNF03. Ser testável sem infraestrutura | Serviços com dependências injetadas e testes com dublês em memória | `services.ts`; testes do servidor |
| RNF04. Proteger credenciais e sessões | Senhas com *hash* scrypt e sal aleatório; *token* de sessão guardado apenas como *hash*; *cookie* HttpOnly; limite de tentativas de login | Módulo `auth` |

Fonte: Elaboração própria (2026), com base no código-fonte do sistema.

Três princípios orientaram as decisões de projeto. O primeiro é que a segurança deve ser controlada em código: as regras que bloqueiam diagnóstico definitivo, prescrição e situações de urgência são aplicadas por um serviço determinístico antes da geração, e não apenas descritas no *prompt*. O segundo é que a rastreabilidade integra a segurança: toda resposta informa os trechos utilizados, e toda consulta é registrada com os trechos, as pontuações e as decisões de segurança. O terceiro é a preferência, nesta versão, por componentes previsíveis e explicáveis, como a classificação de intenção por palavras-chave, que podem ser testados e ajustados com facilidade, ainda que com menor capacidade de generalização do que modelos treinados.

Os requisitos RF10 e RNF04 e a forma atual do RF09 foram incorporados depois da avaliação técnica preliminar, para preparar o uso do sistema por participantes: a autenticação restringe o acesso às pessoas cadastradas pelo pesquisador, e o registro da avaliação associa cada nota à resposta avaliada e a quem a atribuiu (Seção 4.6).

## 4.2 ARQUITETURA GERAL

O sistema segue uma arquitetura cliente-servidor em camadas, representada na Figura 2. A interface web, executada no navegador, comunica-se com a API do servidor por requisições HTTP com dados em JSON. O servidor é uma aplicação Express organizada em módulos de domínio, que tratam da base de conhecimento, dos trechos, dos *embeddings*, da recuperação, da segurança, da consulta, da avaliação técnica e da avaliação das respostas pelos usuários (*feedback*), e cujas dependências são instanciadas e conectadas em um único ponto de composição. Um módulo de autenticação antecede os módulos de domínio: ele trata do login e do encerramento da sessão e verifica, em cada requisição às demais rotas da API, se há uma sessão válida. O acesso aos dados combina o Prisma, nas operações relacionais, com consultas SQL diretas nas operações que dependem do pgvector e da busca textual. O banco de dados é o PostgreSQL 16 com a extensão pgvector, executado em contêiner Docker. A API da OpenAI é uma dependência opcional, usada para gerar *embeddings* e respostas quando há chave de acesso configurada.

**Figura 2 – Arquitetura geral do sistema**

![Arquitetura geral do sistema](figuras/fig-arquitetura.png)

Fonte: Elaboração própria (2026).

O Quadro 6 resume as rotas da API. Com exceção de `GET /health` e das rotas de autenticação, todas exigem uma sessão de login válida (Seção 4.6.1).

**Quadro 6 – Rotas da API do servidor**

| Rota | Função |
|---|---|
| `GET /health` | Verifica a disponibilidade da API, do banco de dados e da extensão pgvector |
| `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me` | Abrem e encerram a sessão de login e informam o usuário da sessão atual |
| `POST /api/knowledge/ingest/jsonl` | Ingere trechos em JSONL, a partir de um arquivo ou do corpo da requisição |
| `POST /api/knowledge/seed` | Carrega a base inicial de desenvolvimento |
| `GET /api/documents` | Lista os documentos lógicos e o número de trechos de cada um |
| `GET /api/chunks` e `GET /api/chunks/:chunkId` | Listam trechos com filtros e paginação e detalham um trecho |
| `POST /api/retrieval/search` | Executa apenas a recuperação e retorna o ranqueamento anterior à reordenação |
| `POST /api/chat/ask` | Executa o fluxo completo de consulta |
| `POST /api/evaluation/seed`, `GET /api/evaluation/questions` e `POST /api/evaluation/run` | Carregam, listam e executam as perguntas de referência |
| `POST /api/feedback` | Registra a avaliação de 0 a 10 do usuário da sessão sobre uma resposta |

Fonte: Elaboração própria (2026), com base no código-fonte do sistema.

O repositório inclui, ainda, a configuração necessária para publicar a interface e a API como dois projetos na plataforma Vercel, com o banco de dados PostgreSQL com pgvector em serviço gerenciado. Nessa configuração, a interface repassa as requisições `/api` à API pelo mesmo endereço, o que permite usar o *cookie* de sessão sem compartilhá-lo entre domínios. Até a redação desta versão, essa publicação não havia sido realizada.

## 4.3 MODELO DE DADOS

O modelo de dados, representado na Figura 3, possui dez entidades. `Document` representa um documento lógico da base, e `Chunk`, a unidade de recuperação, com texto, metadados clínicos, palavras-chave, entidades e o *embedding* de 1.536 dimensões. `Source` foi prevista para registrar fontes bibliográficas, mas ainda não é utilizada pelo sistema. `User` representa as pessoas autorizadas a usar o sistema, e `AuthSession`, as sessões de login (Seção 4.6.1). `ChatSession` representa uma conversa: agrupa as mensagens, registra o perfil escolhido para a consulta e identifica o usuário que a iniciou, campo opcional apenas para as conversas registradas antes da implementação da autenticação. `ChatMessage` guarda as perguntas e as respostas, e `RetrievalLog` registra, para cada consulta, os trechos recuperados com suas pontuações, os filtros, a resposta final, o acionamento de recusa e o nível de risco. `Feedback` armazena as avaliações das respostas, vinculadas ao usuário, à conversa e à resposta avaliada (Seção 4.6.2), e `EvaluationQuestion`, as perguntas de referência.

**Figura 3 – Modelo de dados do sistema**

![Modelo de dados do sistema](figuras/fig-dados.png)

Fonte: Elaboração própria (2026), com base no esquema do banco de dados.

Como o Prisma não oferece suporte nativo ao tipo `vector`, a coluna de *embedding* é declarada como tipo não suportado, e as operações sobre ela são realizadas por SQL direto. Pelo mesmo motivo, dois índices, o índice vetorial IVFFlat por distância de cosseno e o índice GIN sobre os metadados, não são representáveis no esquema do Prisma e precisaram ser recriados por migração própria depois que uma migração gerada automaticamente os removeu. Há, ainda, um índice GIN para a busca textual. O índice IVFFlat foi criado com 100 listas, parâmetro dimensionado para tabelas muito maiores que a base atual; a adequação dessa configuração ao volume de dados deverá ser verificada na nova avaliação técnica (Seção 3.5). Também foram criadas diretamente nas migrações, por não serem representáveis no esquema do Prisma, as restrições de verificação (CHECK) sobre a faixa da nota e o tamanho do comentário das avaliações, o formato do nome de usuário e o formato do *hash* da senha.

## 4.4 BASE DE CONHECIMENTO E INGESTÃO

Cada trecho da base é representado por uma linha JSON com identificador, documento de origem, título, seção, subseção, conteúdo e um objeto de metadados. Os metadados, validados por um esquema Zod que aplica valores padrão conservadores quando um campo é omitido, descrevem o trecho em dimensões clínicas usadas pela recuperação e pela segurança, resumidas no Quadro 7.

**Quadro 7 – Principais metadados dos trechos**

| Metadado | Valores possíveis | Uso no sistema |
|---|---|---|
| Fase clínica | Triagem, diagnóstico, classificação, exame, tratamento, manejo de reação, prevenção de incapacidades, acompanhamento, vigilância, psicossocial, segurança e técnico | Filtro de busca |
| Tipo de informação | Diretriz clínica, dado epidemiológico, informação farmacológica, critério diagnóstico, diagnóstico diferencial, saúde pública, política de segurança e implementação técnica | Filtro de busca |
| Público e população-alvo | Profissional de saúde, paciente, desenvolvedor e gestor; adulto, pediátrico, gestante, contato domiciliar e geral | Filtro de busca; acréscimo na reordenação para gestantes e público pediátrico |
| Criticidade clínica | Baixa, média, alta e muito alta | Reordenação e estimativa de risco |
| Nível de segurança | Educativo, requer confirmação profissional, encaminhar ao serviço de saúde e alto risco | Reordenação e estimativa de risco |
| Indicadores de conteúdo | Relação com medicamento, dose, contraindicação, exame, diagnóstico e reação | Reordenação conforme a intenção da pergunta |
| Fonte | Tipo, nome, página, referência e data de revisão | Citação e rastreabilidade |
| Política de resposta | Texto livre com a orientação de resposta para o trecho | Documentação do conteúdo; não é enviada ao modelo nesta versão |

Fonte: Elaboração própria (2026), com base no esquema de metadados do sistema.

A ingestão, disponível pela rota `POST /api/knowledge/ingest/jsonl`, processa o arquivo linha a linha: cada linha é interpretada, validada pelo esquema e convertida para a estrutura interna; em seguida, o documento lógico é criado ou atualizado, o *embedding* do conteúdo é gerado e o trecho é gravado com seu vetor. Linhas inválidas são registradas como erro sem interromper o processamento das demais. A operação é idempotente em relação ao identificador do trecho: reprocessar a base atualiza o conteúdo, os metadados e o *embedding* existentes. Essa propriedade é relevante para a nova avaliação técnica, pois a troca do provedor de *embeddings* exige reindexar a base, para que trechos e perguntas sejam representados no mesmo espaço vetorial.

A Tabela 1 apresenta a composição da base inicial de desenvolvimento, detalhada no Apêndice B. O componente de fragmentação de texto bruto descrito na Seção 3.3.2 está implementado e é instanciado na composição dos serviços, mas não é chamado por nenhuma rota; a ingestão atual pressupõe trechos já preparados.

**Tabela 1 – Composição da base inicial de desenvolvimento**

| Documento lógico | Tema | Trechos | Criticidade clínica |
|---|---|---|---|
| `sinais_sintomas` | Sinais e sintomas | 1 | Alta |
| `diagnostico_clinico` | Diagnóstico clínico | 1 | Alta |
| `diagnostico_diferencial` | Diagnóstico diferencial | 1 | Alta |
| `classificacao` | Classificação operacional | 1 | Alta |
| `exames` | Exames complementares | 1 | Alta |
| `tratamento_cura` | Tratamento e cura | 1 | Alta |
| `medicamentos` | Medicamentos | 3 | 2 muito alta; 1 alta |
| `reacoes` | Reações hansênicas | 2 | Muito alta |
| `incapacidades` | Incapacidades | 1 | Alta |
| `contatos_vigilancia` | Contatos e vigilância | 2 | Alta |
| `rag_recomendacoes` | Política de segurança do sistema | 1 | Muito alta |
| Total | — | 15 | 5 muito alta; 10 alta |

Fonte: Elaboração própria (2026), com base no arquivo `hanseniase_chunks.seed.jsonl`.

## 4.5 *PIPELINE* DE CONSULTA

A Figura 4 representa o processamento de uma pergunta enviada à rota `POST /api/chat/ask`. Verificada a sessão de login, o serviço de consulta abre ou retoma a conversa do usuário, registra a pergunta e aciona o serviço de recuperação, que classifica a intenção, executa a busca híbrida, estima o risco clínico, reordena os candidatos e aplica o limiar mínimo de relevância. Em seguida, a camada de segurança decide se a pergunta deve ser recusada; não havendo recusa, a resposta é gerada a partir dos trechos selecionados. Por fim, a resposta é registrada e devolvida com as fontes, as informações de segurança, o resumo da recuperação e os identificadores da conversa e da resposta, este último usado no registro da avaliação. As subseções a seguir detalham cada etapa.

**Figura 4 – Fluxo de processamento de uma consulta**

![Fluxo de processamento de uma consulta](figuras/fig-fluxo.png)

Fonte: Elaboração própria (2026), com base no código-fonte do sistema.

### 4.5.1 Classificação de intenção e estimativa de risco clínico

A intenção é classificada por correspondência de palavras-chave sobre o texto normalizado da pergunta, convertido para letras minúsculas e sem acentos. Há doze categorias: triagem, diagnóstico, classificação, exame, tratamento, medicamento, reação hansênica, prevenção de incapacidades, contatos e vigilância, psicossocial, segurança do sistema e fora de escopo. As categorias são verificadas em ordem fixa, e a primeira que contenha alguma palavra-chave presente na pergunta é atribuída; quando nenhuma corresponde, a pergunta é considerada fora de escopo e a recuperação não é executada.

A abordagem é previsível e fácil de testar, mas tem limitações. Como a correspondência é feita por subcadeias de caracteres, termos curtos podem ser encontrados no interior de outras palavras: a sigla "mb" ocorre em "também", e "parar" ocorre em "comparar", o que leva a classificações indevidas. A ordem fixa das categorias também produz erros; a pergunta de referência "Contato com duas cicatrizes de BCG precisa de nova dose?", por exemplo, é classificada como relativa a medicamento, por conter a palavra "dose", embora trate de vacinação de contatos. Por fim, perguntas legítimas formuladas com vocabulário não previsto podem ser classificadas como fora de escopo.

O risco clínico é estimado em quatro níveis: baixo, médio, alto e muito alto. É classificada como de risco muito alto a pergunta que menciona, entre outros, prescrição ou dose, gestação, crianças, talidomida, neurite ou déficit motor, acometimento ocular, recidiva, eventos adversos graves, diagnóstico definitivo ou início e interrupção de medicamentos. O risco também é muito alto quando algum trecho recuperado tem nível de segurança de alto risco ou criticidade muito alta. Nos demais casos, o nível decorre da intenção: alto para diagnóstico, classificação, exame, tratamento, medicamento, contatos, prevenção de incapacidades e triagem; muito alto para reações; médio para perguntas psicossociais e fora de escopo; e baixo para as demais. Como a busca vetorial retorna até 12 candidatos e cinco dos 15 trechos da base inicial têm criticidade muito alta, perguntas dentro do escopo tendem a receber risco muito alto, o que reduz o poder de discriminação desse indicador com a base atual.

### 4.5.2 Busca híbrida

A busca vetorial gera o *embedding* da pergunta e consulta os trechos mais próximos pela distância de cosseno do pgvector, convertendo-a em pontuação de similaridade, s<sub>vet</sub> = 1 − distância, limitada inferiormente a zero, e retornando até 12 candidatos (*top-K*). A busca textual utiliza a busca textual completa do PostgreSQL, com configuração para o português, sobre título, seção, subseção, conteúdo, palavras-chave e entidades do trecho. A pontuação textual, s<sub>txt</sub>, é dada pela função `ts_rank_cd`, acrescida de 0,25 quando o conteúdo contém a pergunta inteira e limitada a 1. Como a expressão de busca é construída pela função `plainto_tsquery`, que exige a presença de todos os termos significativos da pergunta, trechos que contêm apenas parte deles não recebem pontuação textual.

Os resultados das duas buscas são unidos pelo identificador do trecho, e a pontuação final é calculada pela soma ponderada da Equação 1, que atribui maior peso à similaridade semântica sem desconsiderar a correspondência de termos técnicos.

<p align="center">s<sub>final</sub> = 0,65 · s<sub>vet</sub> + 0,35 · s<sub>txt</sub> &nbsp;&nbsp;&nbsp; (1)</p>

Os pesos de 0,65 e 0,35 foram definidos no projeto como valores iniciais e ainda não foram calibrados experimentalmente, situação que se aplica também ao limiar mínimo de relevância apresentado na Seção 4.5.3.

O sistema possui dois provedores de *embeddings*. Quando há chave de acesso configurada, utiliza o modelo `text-embedding-3-small` da OpenAI, com vetores de 1.536 dimensões (OpenAI, 2024). Na ausência de chave, utiliza um provedor determinístico local, que normaliza o texto, descarta palavras com até dois caracteres, mapeia cada palavra para uma das 1.536 posições do vetor por uma função de dispersão (*hash*) e normaliza o vetor resultante. Esse provedor permite executar e testar o sistema sem serviços externos, mas não captura relações semânticas: a similaridade que produz reflete apenas a sobreposição de palavras, o que tem consequências diretas para a avaliação técnica (Seção 5.2).

### 4.5.3 Reordenação e limiar de relevância

Após a busca híbrida, os candidatos são reordenados por acréscimos à pontuação final, conforme o Quadro 8, com teto de 1. Os critérios favorecem trechos críticos e trechos relacionados à intenção da pergunta, para que, em perguntas sobre medicamentos ou reações, por exemplo, a informação de maior impacto clínico apareça entre as primeiras fontes.

**Quadro 8 – Critérios de reordenação dos trechos recuperados**

| Condição | Acréscimo |
|---|---|
| Trecho de criticidade muito alta, com risco da pergunta diferente de baixo | +0,12 |
| Trecho com nível de segurança de alto risco, com risco da pergunta diferente de baixo | +0,10 |
| Intenção de medicamento e trecho relacionado a medicamento | +0,12 |
| Intenção de reação e trecho relacionado a reação | +0,12 |
| Intenção de diagnóstico e trecho relacionado a diagnóstico | +0,12 |
| Intenção de exame e trecho relacionado a exame | +0,12 |
| Pergunta que menciona gestante e trecho destinado a gestantes | +0,14 |
| Pergunta que menciona criança e trecho destinado ao público pediátrico | +0,14 |

Fonte: Elaboração própria (2026), com base no código-fonte do sistema.

Depois da reordenação, o sistema verifica se o candidato mais bem pontuado atinge o limiar mínimo de relevância, configurado em 0,65; para perguntas classificadas como de triagem, o limiar efetivo é 0,45. Se o limiar for atingido, os cinco primeiros candidatos (*top-N*) são usados como contexto; caso contrário, nenhum trecho é usado, e a camada de segurança aciona a recusa por evidência insuficiente. Esse mecanismo impede que o sistema responda com base em trechos pouco relacionados, mas torna o comportamento dependente da escala das pontuações, que, por sua vez, depende do provedor de *embeddings*.

### 4.5.4 Camada de segurança

A camada de segurança avalia a pergunta antes da geração, com as regras aplicadas na ordem apresentada no Quadro 9. A primeira regra satisfeita determina a recusa, cuja mensagem é fixa e acompanhada do aviso de que o sistema não substitui a avaliação presencial; as mensagens completas estão no Apêndice C. Quando nenhuma regra é acionada e há trechos suficientes, a pergunta segue para a geração, e o sistema indica a necessidade de avaliação profissional sempre que o risco estimado é alto ou muito alto.

**Quadro 9 – Regras da camada de segurança**

| Ordem | Situação | Condição de acionamento | Exige avaliação profissional |
|---|---|---|---|
| 1 | Fora do escopo | Intenção classificada como fora de escopo | Sim |
| 2 | Gestação | Menção a gestante, grávida ou gravidez | Sim |
| 3 | Crianças | Menção a criança, bebê, uso pediátrico ou menor de idade | Sim |
| 4 | Sinais de urgência | Menção a emergência, perda de movimento, paralisia, fraqueza, alterações oculares ou visuais, falta de ar, icterícia ou desmaio | Sim |
| 5 | Reação grave | Menção a neurite, reação grave, déficit motor ou eritema nodoso | Sim |
| 6 | Diagnóstico definitivo | Pedidos como "confirmar diagnóstico" ou "tenho hanseníase?" | Sim |
| 7 | Prescrição ou dose | Menção a prescrever, receita, dose, dosagem, ajuste, início, suspensão ou interrupção de medicamento | Sim |
| 8 | Evidência insuficiente | Nenhum trecho selecionado após a aplicação do limiar | Sim, exceto quando o risco é baixo |

Fonte: Elaboração própria (2026), com base no código-fonte do sistema.

Duas limitações dessa abordagem devem ser registradas. A primeira é que as regras reconhecem padrões textuais e podem não identificar formulações não previstas. A segunda é que, como a correspondência também é feita por subcadeias, há acionamentos indevidos. Verificações executadas com o código compilado do sistema mostraram que a pergunta "Tenho dúvida sobre a baciloscopia na hanseníase" é recusada como reação grave, porque a abreviatura "enh", de eritema nodoso hansênico, ocorre em "tenho"; que "Como comparar PB e MB na classificação?" é recusada como pedido de prescrição, porque "parar" ocorre em "comparar"; e que "Escolho qual exame para suspeita de hanseníase?" é recusada como sinal de urgência, porque "olho" ocorre em "escolho". A correspondência por palavras inteiras é uma correção necessária antes da avaliação comparativa (Seção 3.6.2).

### 4.5.5 Geração da resposta

Quando a pergunta não é recusada, a resposta é gerada de uma de duas formas. Com chave de acesso configurada, o sistema envia ao modelo de linguagem, por padrão o `gpt-4o-mini` com temperatura 0,1, um *prompt* de sistema e um *prompt* de usuário. O *prompt* de sistema define o papel do assistente e regras de fonte, clínicas, de estilo e de escopo: responder somente com base nos trechos recuperados, citá-los, declarar insuficiência quando necessário, não usar conhecimento externo, não emitir diagnóstico definitivo, não prescrever, não recomendar iniciar, suspender ou alterar tratamentos e recomendar atendimento presencial em situações de risco. O *prompt* de usuário informa o perfil do usuário, a pergunta e os trechos selecionados, numerados e acompanhados de identificador, título, documento, seção e página. O perfil ajusta a linguagem, que deve ser técnica e objetiva para profissionais de saúde e simples e educativa para pacientes.

Sem chave configurada, o sistema produz uma resposta extrativa, que apresenta o conteúdo dos trechos selecionados, cada um seguido de seu identificador, e uma linha final com as fontes usadas. Em ambos os casos, o aviso "Este sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde" é anexado ao final da resposta. A resposta da API inclui o texto, a lista de fontes, as informações de segurança (nível de risco, acionamento de recusa, necessidade de avaliação profissional, aviso e motivo da recusa) e um resumo da recuperação, com a intenção identificada e a pontuação de cada trecho. Quando uma regra de segurança é acionada depois da recuperação, a lista de fontes contém os trechos recuperados, embora eles não tenham sido usados na resposta; a interface os apresenta com essa ressalva.

### 4.5.6 Registro para rastreabilidade e auditoria

Cada consulta gera registros persistentes: a conversa, com o perfil escolhido e o usuário autenticado; a pergunta e a resposta, como mensagens da conversa; e um registro de recuperação com a pergunta, os trechos recuperados e suas pontuações vetorial, textual e final, os filtros aplicados, a resposta final, o acionamento de recusa e o nível de risco. Esses registros permitem reconstituir por que uma resposta foi dada ou recusada e quais trechos a sustentaram. O registro da avaliação das respostas (Seção 4.6.2) complementa a rastreabilidade ao associar a cada resposta a nota atribuída por quem a recebeu. Por outro lado, o registro das perguntas, agora vinculadas a um usuário, impõe cuidados de privacidade, discutidos nas Seções 3.6.7 e 3.6.9.

## 4.6 CONTROLE DE ACESSO E AVALIAÇÃO DAS RESPOSTAS

Dois mecanismos foram incorporados ao sistema em outubro de 2026, depois da avaliação técnica preliminar, para preparar seu uso por participantes: a autenticação dos usuários e o registro da avaliação das respostas. Nenhum deles altera o *pipeline* de consulta descrito na Seção 4.5.

### 4.6.1 Autenticação e sessões

O acesso é feito por nome de usuário e senha. Não há cadastro pela interface nem recuperação de senha: as contas são criadas pelo pesquisador diretamente no banco de dados, com o auxílio de um comando do projeto que lê a senha sem exibi-la, calcula seu *hash* e produz a instrução SQL de inserção. As senhas são armazenadas apenas na forma de *hash*, calculado com a função scrypt, que exige tempo de processamento e memória em cada cálculo e, com isso, encarece tentativas de descobrir senhas por força bruta, inclusive com *hardware* especializado (Percival; Josefsson, 2016). Cada senha recebe um sal aleatório, de modo que senhas iguais resultam em *hashes* diferentes, e a comparação é feita em tempo constante. Restrições no banco de dados rejeitam nomes de usuário fora do formato definido, composto por letras minúsculas, algarismos, ponto, hífen e sublinhado, e senhas gravadas fora do formato de *hash* adotado, o que impede o armazenamento acidental de uma senha em texto puro. Uma conta pode ser desativada sem ser excluída.

Quando o login é aceito, o servidor gera um *token* aleatório de 32 *bytes* e o entrega ao navegador em um *cookie* com o atributo HttpOnly, que impede sua leitura por *scripts* da página, e com o atributo SameSite no modo Lax, que restringe seu envio em requisições originadas de outros sites; em produção, o *cookie* recebe também o atributo Secure, que limita seu envio a conexões HTTPS. O banco de dados guarda apenas o *hash* SHA-256 do *token*, com a data de expiração da sessão, de oito horas por padrão, de modo que o acesso à tabela de sessões não permite reutilizar uma sessão ativa. O encerramento da sessão (*logout*) remove o registro no servidor e apaga o *cookie*, e uma sessão expirada ou pertencente a uma conta desativada deixa de ser aceita.

Todas as rotas sob o prefixo `/api`, exceto as de autenticação, exigem uma sessão válida; sem ela, a API responde com o código 401 (não autenticado). A rota de verificação de disponibilidade permanece pública. O usuário associado a uma consulta ou a uma avaliação é sempre obtido da sessão, e nunca de dados enviados pelo navegador, o que impede que alguém registre consultas ou avaliações em nome de outra pessoa; pelo mesmo motivo, o identificador de uma conversa de outro usuário não é reaproveitado, e uma nova conversa é aberta. Para dificultar tentativas sucessivas de adivinhação de senha, após cinco tentativas malsucedidas em 15 minutos para a mesma combinação de endereço de origem e nome de usuário, novas tentativas são recusadas até o fim desse intervalo. As mensagens de erro não indicam se o usuário existe, e o servidor executa o cálculo do *hash* também quando o usuário não existe, para que o tempo de resposta não revele essa informação. O controle de tentativas é mantido na memória do servidor e, por isso, vale separadamente para cada instância em execução.

### 4.6.2 Registro da avaliação das respostas

Após cada resposta concluída, inclusive as recusas, a interface exibe um componente de avaliação (Figura 5) com uma escala de 0 a 10, em que 0 corresponde à pior avaliação e 10, à melhor, e um campo de comentário opcional, de até 1.000 caracteres, apresentado depois da escolha da nota. O usuário pode enviar a avaliação ou dispensá-la e reabri-la depois. O envio é confirmado na própria interface, e, em caso de falha, a nota e o comentário são preservados para nova tentativa.

**Figura 5 – Componente de avaliação de uma resposta, após a escolha da nota**

![Componente de avaliação de uma resposta, após a escolha da nota](figuras/fig-avaliacao.png)

Fonte: Elaboração própria (2026).

Cada avaliação é gravada com a identificação do usuário da sessão, da conversa e da resposta avaliada. A faixa da nota e o tamanho do comentário são validados na API e verificados novamente por restrições do banco de dados, e uma chave estrangeira composta garante que a resposta avaliada pertence à conversa registrada. Uma restrição de unicidade impede que o mesmo usuário avalie mais de uma vez a mesma resposta; a nova tentativa recebe o código 409 (conflito), e a interface a trata como avaliação já registrada. A API aceita apenas a avaliação de respostas do sistema, e não de perguntas, e somente em conversas do próprio usuário. As avaliações não são excluídas em cascata: o banco de dados recusa a exclusão de uma conversa que possua avaliações, o que protege esses registros contra remoções acidentais.

A escala de 0 a 10 substituiu a nota de 1 a 5 e a indicação de revisão por especialista da versão anterior do módulo. Para não descartar dados, a migração do banco de dados que efetua essa mudança é interrompida caso encontre avaliações no formato anterior, em vez de convertê-las ou removê-las. A nota registrada é uma avaliação global da resposta; sua relação com as dimensões previstas para o instrumento da avaliação comparativa é discutida na Seção 3.6.6.

## 4.7 INTERFACE WEB

A interface web foi organizada em uma área pública e um painel interno. A área pública compreende a página inicial, a tela de login, a gaveta de consulta e a tela de comparação, que compartilham um cabeçalho com acesso à consulta. Apenas a página inicial e a tela de login são de acesso livre; a consulta, a tela de comparação e o painel interno exigem login. A página inicial (Figura 6) apresenta a finalidade do sistema, o método de construção das respostas, os limites de segurança, com as mensagens de recusa definidas no servidor, e a composição da base de conhecimento, acompanhada do aviso de que se trata de um conjunto inicial de desenvolvimento. A página também exibe um exemplo de consulta, identificado como ilustrativo e montado com os mesmos componentes usados para exibir respostas reais (Figura 7).

**Figura 6 – Página inicial do sistema**

![Página inicial do sistema](figuras/fig-inicio.png)

Fonte: Elaboração própria (2026).

**Figura 7 – Exemplo ilustrativo de consulta exibido na página inicial**

![Exemplo ilustrativo de consulta exibido na página inicial](figuras/fig-exemplo.png)

Fonte: Elaboração própria (2026), com dados de exemplo identificados como tal na própria interface.

Quando uma pessoa sem sessão tenta abrir a consulta ou acessar uma tela restrita, a interface a conduz à tela de login (Figura 8) e, após a autenticação, a devolve ao ponto em que estava, com a consulta reaberta quando era esse o caso. Com a sessão ativa, o cabeçalho exibe o nome do usuário e a opção de sair. Ao sair, a sessão é encerrada no servidor, e as conversas mantidas pela interface, inclusive a do painel interno guardada no navegador, são descartadas, para que não fiquem visíveis a quem usar o mesmo navegador em seguida. Se a sessão expirar durante o uso, a primeira requisição recusada pela API desfaz o login também na interface.

**Figura 8 – Tela de login**

![Tela de login](figuras/fig-login.png)

Fonte: Elaboração própria (2026).

A consulta é realizada em uma gaveta lateral (Figura 9), acessível a partir de qualquer página pública. Cada interação é apresentada como um registro composto pela pergunta e pela resposta. A resposta exibe o estado da consulta, isto é, resposta ou recusa segura, com o respectivo motivo; a intenção identificada; o texto, com marcadores numerados que remetem às fontes; uma nota de segurança com a escala de risco clínico e a necessidade de avaliação presencial; e a lista de fontes, com título, identificador, seção e pontuação de relevância. Nas recusas, os trechos eventualmente recuperados são apresentados como não utilizados. Ao final de cada resposta, é exibido o componente de avaliação descrito na Seção 4.6.2. Nessa área, o perfil do usuário é fixado como profissional de saúde.

**Figura 9 – Gaveta de consulta em seu estado inicial**

![Gaveta de consulta em seu estado inicial](figuras/fig-gaveta.png)

Fonte: Elaboração própria (2026).

A tela de comparação (Figura 10) apresenta, lado a lado, a resposta do NexoHansen e uma resposta identificada como de um modelo genérico. Na versão atual, essa segunda resposta é produzida por uma simulação executada no próprio navegador, que monta um texto padronizado a partir da pergunta, com atraso artificial, sem consultar nenhum modelo de linguagem; a interface a identifica como simulação, sem fontes e sem regras de segurança. A tela tem, portanto, função demonstrativa e não constitui, em sua forma atual, o Cenário B da avaliação comparativa (Seção 3.6.2).

**Figura 10 – Tela de comparação em seu estado inicial**

![Tela de comparação em seu estado inicial](figuras/fig-comparacao.png)

Fonte: Elaboração própria (2026).

O painel interno, acessível por endereço próprio e sem ligação a partir da área pública, reúne ferramentas de inspeção: uma tela de consulta com seleção de perfil, entre profissional de saúde, paciente e desenvolvedor, e com o mesmo componente de avaliação das respostas; um explorador de recuperação, que executa apenas a busca, com escolha do modo (híbrido, vetorial ou textual), dos parâmetros *top-K* e *top-N* e de filtros por metadados, e exibe as pontuações anteriores à reordenação (Figura 11); um navegador da base de conhecimento, com documentos, trechos paginados e filtráveis e o detalhe de cada trecho; e um painel de avaliação, que carrega e executa as perguntas de referência e apresenta os indicadores descritos na Seção 3.5.

**Figura 11 – Formulário do explorador de recuperação no painel interno**

![Formulário do explorador de recuperação no painel interno](figuras/fig-explorador.png)

Fonte: Elaboração própria (2026).

A interface foi implementada em React com TypeScript. A área pública utiliza Tailwind CSS, com um conjunto próprio de padrões visuais, e o painel interno, CSS Modules. As requisições à API são gerenciadas com TanStack Query, e a navegação, com React Router. As telas restritas são protegidas por um componente que consulta a sessão atual na API antes de exibir o conteúdo; essa proteção orienta a navegação, mas o controle de acesso efetivo é o da API (Seção 4.6.1). Não há distinção de perfis de acesso: todos os usuários cadastrados acessam também o painel interno e, por meio dele, as rotas de carga da base e de execução da avaliação técnica.

## 4.8 VERIFICAÇÃO DO SOFTWARE

O sistema conta com 69 testes automatizados, escritos com Vitest: 53 no servidor e 16 na interface, agrupados conforme o Quadro 10. No servidor, os testes utilizam dublês em memória para o repositório e para o provedor de *embeddings*, o que permite verificar a lógica do *pipeline*, da autenticação e do registro das avaliações de forma rápida e determinística; parte deles exercita a API por requisições HTTP, verificando, por exemplo, o bloqueio das rotas sem sessão e os atributos do *cookie*. Seis testes de integração são executados contra um banco de dados PostgreSQL com as migrações do projeto aplicadas, quando o endereço de um banco de testes é configurado, e são ignorados na ausência dele. Na interface, os testes utilizam a biblioteca Testing Library e simulam as respostas da API.

**Quadro 10 – Testes automatizados do servidor e da interface**

| Camada | Grupo | Comportamentos verificados | Testes |
|---|---|---|---|
| Servidor | Esquemas e ingestão | Validação dos metadados com valores padrão; ingestão de JSONL com *embeddings* simulados | 2 |
| Servidor | Intenção e risco clínico | Classificação de intenção por palavras-chave; risco muito alto para dose, gestação, criança, reação e talidomida | 2 |
| Servidor | Segurança | Recusa sem trechos; recusa fora do escopo; bloqueio de prescrição individualizada | 3 |
| Servidor | Recuperação e consulta | Recuperação de trechos de diagnóstico e de tratamento; resposta com fontes; baciloscopia negativa não exclui hanseníase; não orientar a interrupção da PQT em reação; talidomida e gestação como alto risco | 6 |
| Servidor | Senhas e sessões | *Hash* com sal aleatório e rejeição de formatos inválidos; recusa de senha errada, de usuário inexistente e de conta desativada; expiração e encerramento da sessão; limite de tentativas | 10 |
| Servidor | Registro das avaliações | Notas inteiras de 0 a 10 e comentário opcional; vínculo com usuário, conversa e resposta; uma avaliação por usuário e resposta; recusa de respostas de outros usuários e de perguntas; falha na gravação; reaproveitamento apenas da conversa do próprio usuário | 12 |
| Servidor | API HTTP | Rotas bloqueadas sem sessão ou com *cookie* inválido; login com *cookie* HttpOnly sem exposição do *token*; *logout*; limite de tentativas; consulta e avaliação vinculadas ao usuário da sessão; respostas de erro de validação, de conflito e de falha interna | 12 |
| Servidor | Integração com PostgreSQL | Cadastro manual por SQL seguido de login; restrições de formato do usuário e da senha; gravação e unicidade das avaliações; faixa da nota e coerência entre resposta e conversa; bloqueio da exclusão em cascata | 6 |
| Interface | Login e rotas protegidas | Redirecionamento sem sessão; erro de credenciais e indisponibilidade da API; retorno à página de origem; *logout*; sessão expirada | 7 |
| Interface | Componente de avaliação | Escala de 0 a 10; envio com e sem comentário; falha e nova tentativa; avaliação repetida; dispensa e reabertura; exigência de nota | 7 |
| Interface | Avaliação na consulta | Exibição após cada resposta concluída; avaliações independentes para respostas da mesma conversa | 2 |

Fonte: Elaboração própria (2026), com base nos arquivos de teste do servidor e da interface.

Em 23 de outubro de 2026, os 47 testes do servidor que não dependem do banco de dados e os 16 testes da interface foram executados com sucesso, assim como a análise estática e a compilação das duas camadas. Na mesma data, os seis testes de integração foram executados com sucesso contra o PGlite, distribuição do PostgreSQL executada no próprio processo de teste, com as extensões pgvector e pgcrypto e com as migrações do projeto aplicadas a um banco de dados vazio. Na véspera, em 22 de outubro, o fluxo completo de cadastro manual, login, consulta, avaliação, dispensa da avaliação e *logout* foi verificado em navegador, com o servidor e a interface em execução sobre o mesmo tipo de banco.

A verificação tem, entretanto, limites relevantes. Os testes não exercitam as consultas SQL do pgvector e da busca textual, nem os provedores reais de *embeddings* e de geração; os testes de integração cobrem apenas as tabelas de usuários, sessões e avaliações, e o PGlite, embora derive do PostgreSQL, não reproduz o ambiente em que o sistema seria publicado. Tampouco há testes para os acionamentos indevidos por subcadeias descritos na Seção 4.5.4. Um exemplo concreto dessa limitação ocorreu durante o desenvolvimento: as consultas de busca selecionavam todas as colunas da tabela de trechos, incluindo a coluna vetorial, que o Prisma não consegue converter em consultas diretas, e falhavam contra o banco de dados real, embora todos os testes passassem. A falha foi corrigida com a seleção explícita das colunas, e a lacuna motivou a recomendação de testes de integração com o banco de dados (Capítulo 6), até aqui implementados apenas para a autenticação e o registro das avaliações.

# 5 RESULTADOS

Este capítulo reúne três tipos de resultado, que não devem ser confundidos. A Seção 5.1 sintetiza o artefato desenvolvido, resultado das etapas de projeto e desenvolvimento. A Seção 5.2 apresenta a avaliação técnica preliminar do *pipeline*, executada com *embeddings* determinísticos, e uma análise das partes determinísticas do sistema. A Seção 5.3 contém a estrutura destinada aos resultados da avaliação comparativa com participantes, que ainda não foi realizada.

## 5.1 ARTEFATO DESENVOLVIDO

O sistema desenvolvido atende, em sua versão atual, aos requisitos apresentados no Quadro 5. O servidor implementa oito módulos de domínio e um módulo de autenticação, expõe as rotas descritas no Quadro 6, persiste dez entidades e executa o *pipeline* completo de consulta, com classificação de intenção, estimativa de risco, busca híbrida, reordenação, limiar de relevância, camada de segurança com oito regras de recusa, geração com indicação de fontes e registro para auditoria. O acesso exige login, e cada resposta pode ser avaliada pelo usuário em escala de 0 a 10, com registro vinculado ao usuário, à conversa e à resposta. A base inicial contém 15 trechos em 11 documentos lógicos, e o conjunto de referência, 25 perguntas. A interface web oferece a página inicial, a tela de login, a consulta com avaliação das respostas, a tela de comparação, em caráter demonstrativo, e o painel interno de inspeção. O sistema conta com 69 testes automatizados, executados com sucesso (Seção 4.8).

Em relação aos objetivos específicos, os objetivos b e c foram atendidos na versão atual, e o objetivo a, parcialmente, pois a base ainda não foi construída a partir de documentos oficiais. Esses resultados respondem à QP1 no plano do projeto, uma vez que as decisões de arquitetura que permitem indicar a origem das respostas e recusar situações de risco estão implementadas e descritas no Capítulo 4; sua efetividade, contudo, só poderá ser avaliada com a base definitiva e com as avaliações descritas no Capítulo 3.

## 5.2 AVALIAÇÃO TÉCNICA PRELIMINAR

A avaliação técnica foi executada em 14 de setembro de 2026, em ambiente local, com o banco de dados PostgreSQL com pgvector, a base inicial de 15 trechos e o conjunto de 25 perguntas de referência. Não havia chave de acesso à OpenAI configurada; foram utilizados, portanto, o provedor determinístico de *embeddings* e a geração extrativa. Os parâmetros eram os padrões do sistema: *top-K* igual a 12, *top-N* igual a 5 e limiar mínimo de relevância de 0,65. O resultado, registrado na documentação do projeto, está na Tabela 2.

**Tabela 2 – Resultado da avaliação técnica preliminar**

| Indicador | Valor |
|---|---|
| Perguntas avaliadas | 25 |
| Perguntas com trecho ideal entre as fontes da resposta | 0 |
| Aproximação da revocação por trecho ideal | 0% |
| Perguntas recusadas | 25 |

Fonte: Elaboração própria (2026), a partir do registro da execução de 14 de setembro de 2026.

Todas as perguntas terminaram em recusa, e nenhuma resposta continha fontes. Na mesma sessão, observou-se que o explorador de recuperação posicionava o trecho esperado em primeiro lugar para a pergunta sobre baciloscopia, com pontuação final próxima de 0,25 antes da reordenação, o que sugeria que o problema não estava no ranqueamento, mas na relação entre a escala das pontuações e o limiar. Como os resultados detalhados por pergunta dessa execução não foram armazenados no repositório, essa hipótese foi examinada, em 20 de outubro de 2026, por meio da reprodução das partes determinísticas do *pipeline* com o código compilado do sistema, sem uso do banco de dados: o provedor determinístico de *embeddings*, a classificação de intenção, as regras de segurança e os acréscimos de reordenação. Os resultados por pergunta estão no Apêndice D.

A análise mostrou, em primeiro lugar, que três das 25 perguntas são recusadas por regras específicas a partir do próprio texto, independentemente da recuperação: "O que é eritema nodoso hansênico?", pela regra de reação grave; "Gestante pode usar talidomida?", pela regra de gestação; e "Posso parar o tratamento se os sintomas melhoraram?", pela regra de prescrição. Em segundo lugar, a similaridade vetorial entre cada pergunta e seu trecho ideal, calculada com o provedor determinístico, variou de 0,000 a 0,428, com mediana de 0,227; ainda assim, o trecho ideal foi o mais similar à pergunta, entre os 15 trechos da base, em 16 das 25 perguntas. Em terceiro lugar, para as 22 perguntas que dependem da regra de evidência, calculou-se a pontuação textual mínima que o trecho ideal precisaria obter para que a pontuação final, somada aos acréscimos de reordenação aplicáveis, atingisse o limiar de 0,65, ou de 0,45 nas perguntas de triagem. A distribuição está na Tabela 3.

**Tabela 3 – Pontuação textual mínima necessária para atingir o limiar de relevância**

| Pontuação textual mínima necessária | Perguntas |
|---|---|
| Até 0,25 | 1 |
| Acima de 0,25 até 0,50 | 1 |
| Acima de 0,50 até 0,75 | 3 |
| Acima de 0,75 até 1,00 | 4 |
| Acima de 1,00 (inalcançável) | 13 |
| Total de perguntas dependentes da regra de evidência | 22 |

Fonte: Elaboração própria (2026), a partir da reprodução das partes determinísticas do sistema.

Como a pontuação textual é limitada a 1, em 13 das 22 perguntas o limiar não poderia ser atingido pelo trecho ideal nem com a máxima correspondência textual. Nas demais, seriam necessárias pontuações textuais elevadas, que dependem de o trecho conter todos os termos significativos da pergunta, condição imposta pela função `plainto_tsquery`. O resultado da Tabela 2 decorre, portanto, da incompatibilidade entre o limiar configurado e a escala de pontuação do provedor determinístico, e não necessariamente de falhas no ranqueamento.

A avaliação preliminar evidencia três aspectos. O primeiro é que o mecanismo de segurança funcionou como projetado: diante de evidência considerada insuficiente, o sistema recusou a resposta, em vez de responder com trechos pouco relacionados. O segundo é que o limiar mínimo e os pesos da busca híbrida dependem da escala das pontuações produzidas pelo provedor de *embeddings* e precisam ser calibrados para o provedor efetivamente utilizado. O terceiro é que o indicador adotado mede o efeito conjunto da recuperação e do limiar, e não apenas a qualidade do ranqueamento. Essa execução não permite avaliar a qualidade da recuperação semântica nem a das respostas geradas, que dependem da nova execução.

[PREENCHER APÓS A NOVA EXECUÇÃO DA AVALIAÇÃO TÉCNICA: configuração utilizada, incluindo provedor e modelo de *embeddings*, modelo gerador, limiar e versão da base; resultados para cada limiar testado; limiar adotado e justificativa; resultados por pergunta, exportados do sistema e apresentados em apêndice.] [INSERIR TABELA COM OS RESULTADOS DA NOVA EXECUÇÃO: indicadores da Tabela 2 com *embeddings* determinísticos e com *embeddings* semânticos, lado a lado.]

## 5.3 RESULTADOS DA AVALIAÇÃO COMPARATIVA

Esta seção será redigida após a realização da avaliação comparativa descrita na Seção 3.6. Sua estrutura antecipa os elementos que deverão ser apresentados, sem antecipar resultados. Os dados de percepção dos participantes deverão ser interpretados como tais, e não como evidência de eficácia clínica ou de segurança assistencial.

### 5.3.1 Execução da avaliação e participantes

[PREENCHER APÓS A COLETA DOS DADOS: período e forma de aplicação; número de participantes convidados, que iniciaram e que concluíram a avaliação; ocorrências relevantes durante a coleta; perfil agregado dos participantes, conforme a Tabela 4.]

**Tabela 4 – Caracterização agregada dos participantes**

| Característica | Categoria | Participantes (n) | Participantes (%) |
|---|---|---|---|
| [PREENCHER APÓS A COLETA DOS DADOS: características previstas no protocolo, como formação, área de atuação, tempo de experiência e contato com a hanseníase] | — | — | — |

Fonte: Dados da pesquisa (2026).

### 5.3.2 Avaliações por dimensão e cenário

[PREENCHER APÓS A COLETA DOS DADOS: síntese das avaliações de cada dimensão nos Cenários A e B, conforme a Tabela 5, e gráfico da distribuição das avaliações.] [ANALISAR APÓS A CONSOLIDAÇÃO DAS AVALIAÇÕES: diferenças observadas entre os cenários e resultados dos procedimentos estatísticos definidos no protocolo.]

**Tabela 5 – Avaliações por dimensão e cenário**

| Dimensão | Cenário A (com RAG) | Cenário B (sem RAG) | Diferença observada |
|---|---|---|---|
| [INSERIR TABELA COM OS RESULTADOS DA AVALIAÇÃO: uma linha por dimensão adotada no protocolo, com as medidas nele definidas] | — | — | — |

Fonte: Dados da pesquisa (2026).

[INSERIR GRÁFICO: distribuição das avaliações por dimensão e cenário, em formato adequado à escala adotada no protocolo.]

### 5.3.3 Análise por pergunta e por tipo de situação

[ANALISAR APÓS A CONSOLIDAÇÃO DAS AVALIAÇÕES: resultados por pergunta e por tipo de situação, isto é, resposta esperada, recusa esperada e fora do escopo; perguntas com maior divergência entre os cenários ou entre os participantes; casos em que o Cenário A recusou perguntas para as quais se esperava resposta, e o inverso.]

### 5.3.4 Percepções qualitativas dos participantes

[PREENCHER APÓS A COLETA DOS DADOS: categorias identificadas nos comentários abertos, com trechos representativos anonimizados, sugestões de melhoria e resultados divergentes.]

# 6 DISCUSSÃO

Este capítulo relaciona os resultados às questões de pesquisa, à literatura e às limitações do trabalho. As partes que dependem da avaliação comparativa permanecem em aberto e indicam as questões que deverão ser examinadas após a coleta.

## 6.1 QUESTÕES DE PESQUISA

Em relação à QP1, o desenvolvimento permite identificar as decisões de arquitetura que viabilizam a indicação da origem das respostas e a recusa de situações de risco: a representação da base em trechos com identificador e metadados; a devolução, em toda resposta, da lista de trechos utilizados, com documento, seção e página; o registro de cada consulta com trechos, pontuações e decisões; a aplicação das regras de segurança em código, antes da geração; e o limiar mínimo de relevância como condição para responder. Essas decisões estão implementadas e verificadas por testes, mas sua efetividade depende da qualidade da base e da calibração da recuperação, ainda não concluídas, e da correção dos acionamentos indevidos identificados na Seção 4.5.4.

Em relação à QP2, a execução preliminar não permite responder se a recuperação localiza os trechos esperados, porque nenhuma pergunta atingiu o limiar de relevância com o provedor determinístico. A análise da Seção 5.2 indica que o ranqueamento vetorial desse provedor posicionou o trecho ideal em primeiro lugar na maioria das perguntas, mas a resposta à QP2 depende da nova execução com *embeddings* semânticos e limiar calibrado. [PREENCHER APÓS A NOVA EXECUÇÃO DA AVALIAÇÃO TÉCNICA: resposta à QP2 com base nos resultados obtidos.]

Em relação à QP3, [ANALISAR APÓS A CONSOLIDAÇÃO DAS AVALIAÇÕES: resposta à QP3, indicando em quais dimensões houve diferenças entre os cenários, sua magnitude e as condições em que foram observadas, sem extrapolar para eficácia clínica.]

## 6.2 RELAÇÃO COM A LITERATURA

O resultado da avaliação técnica preliminar converge com a observação de Xiong *et al.* (2024) de que o desempenho de sistemas RAG em medicina depende fortemente da configuração da recuperação: no sistema desenvolvido, a troca do provedor de *embeddings* altera a escala das pontuações e, com ela, a fração de perguntas que atinge o limiar de resposta. O resultado também reforça a constatação de que os modelos de *embedding* disponíveis são majoritariamente orientados ao inglês (Arzideh *et al.*, 2026; Yang *et al.*, 2026), aspecto que deverá ser considerado na escolha do provedor para documentos em português.

[ANALISAR APÓS A CONSOLIDAÇÃO DAS AVALIAÇÕES: relação entre os resultados da avaliação comparativa e os achados de Zakka *et al.* (2024), Xiong *et al.* (2024) e Xu *et al.* (2025) sobre o efeito da recuperação; comparação das dimensões avaliadas com as utilizadas por Singhal *et al.* (2023) e Zakka *et al.* (2024); discussão do tratamento dado à segurança, à luz das lacunas apontadas por Amugongo *et al.* (2025) e Yang *et al.* (2026).]

## 6.3 IMPLICAÇÕES PARA O PROJETO DE SISTEMAS RAG EM SAÚDE

O desenvolvimento do sistema permite registrar observações de engenharia que independem da avaliação comparativa. A primeira é que limiares e pesos de recuperação não são transferíveis entre provedores de *embeddings*: valores definidos sem calibração podem fazer o sistema recusar todas as perguntas, como ocorreu na avaliação preliminar, ou responder com base em trechos pouco relacionados, no caso oposto. A segunda é que regras de segurança implementadas em código são verificáveis por testes, mas exigem cuidado na correspondência de padrões, como mostram os acionamentos indevidos por subcadeias descritos na Seção 4.5.4; testes que contemplem frases comuns da língua, e não apenas os termos-alvo, ajudariam a detectar esse tipo de falha. A terceira é que testes com dublês em memória, embora úteis, não substituem testes de integração com o banco de dados e com os provedores reais, como evidenciou a falha nas consultas vetoriais descrita na Seção 4.8. A quarta é que a rastreabilidade depende de dados de origem completos: sem documento oficial e página associados a cada trecho, a citação de fontes indica a origem dentro da base, mas não permite ao usuário conferir a informação no documento original. A quinta é que dados de pesquisa coletados pelo próprio sistema exigem garantias de integridade semelhantes às dos registros de auditoria: no registro das avaliações, a obtenção do usuário a partir da sessão, as restrições no banco de dados e a ausência de exclusão em cascata foram adotadas para que uma avaliação não possa ser atribuída a outra pessoa, duplicada ou perdida em uma operação de limpeza (Seção 4.6.2).

[ANALISAR APÓS A CONSOLIDAÇÃO DAS AVALIAÇÕES: implicações adicionais decorrentes da avaliação comparativa.]

## 6.4 LIMITAÇÕES

Identificam-se, nesta versão, as seguintes limitações:

a) a base de conhecimento é um conjunto inicial de 15 trechos redigidos para desenvolvimento, sem extração de documentos oficiais com indicação de página e sem revisão por especialistas;

b) a classificação de intenção e as regras de segurança baseiam-se em correspondência de padrões textuais, sujeita a omissões e a acionamentos indevidos;

c) o indicador de risco clínico tende a atribuir risco muito alto às perguntas dentro do escopo, o que reduz seu poder de discriminação com a base atual;

d) a avaliação técnica foi executada apenas com *embeddings* determinísticos, e seus resultados por pergunta não foram armazenados;

e) os pesos da busca híbrida e o limiar mínimo de relevância não foram calibrados;

f) os testes automatizados não exercitam as consultas vetoriais e textuais no banco de dados nem os provedores reais de *embeddings* e de geração, e os testes de integração com o banco cobrem apenas usuários, sessões e avaliações;

g) o componente de fragmentação de documentos não está integrado à ingestão;

h) a tela de comparação utiliza uma simulação local no lugar de um modelo de linguagem sem recuperação;

i) o modo semântico depende de um serviço externo, ao qual as perguntas são enviadas, e a interface não exibe aviso contra a inserção de dados pessoais nas perguntas;

j) não há perfis de acesso: todos os usuários cadastrados acessam o painel interno e as rotas de carga da base e de execução da avaliação técnica, e o limite de tentativas de login é mantido na memória de cada instância do servidor;

k) a avaliação registrada pelo sistema é uma nota global de 0 a 10, sem as dimensões previstas para o instrumento da avaliação comparativa, e se aplica apenas a respostas geradas no momento da consulta;

l) o sistema não foi validado clinicamente e não se destina ao uso assistencial.

[PREENCHER APÓS A AVALIAÇÃO COMPARATIVA: limitações da avaliação com participantes, como o tamanho e a composição da amostra, o desenho adotado e as condições de aplicação.]

# 7 CONSIDERAÇÕES FINAIS

[ATUALIZAR APÓS A AVALIAÇÃO COMPARATIVA: as considerações a seguir refletem o estágio atual do trabalho e deverão ser revistas após a conclusão das avaliações.]

Este trabalho teve como objetivo desenvolver um sistema de apoio informacional à decisão clínica em hanseníase baseado na arquitetura RAG e avaliar suas respostas tecnicamente e em comparação com as de um modelo de linguagem sem recuperação. No estágio atual, foi desenvolvido o NexoHansen, um protótipo que combina classificação de intenção, estimativa de risco clínico, recuperação híbrida, reordenação por critérios clínicos, regras de segurança aplicadas antes da geração, geração restrita aos trechos recuperados com indicação das fontes e registro das consultas para auditoria, acompanhado de uma interface web para consulta e inspeção. Para preparar a avaliação com participantes, o acesso foi restrito a usuários cadastrados, e cada resposta pode ser avaliada em escala de 0 a 10, com registro vinculado ao usuário, à conversa e à resposta.

Do ponto de vista da Engenharia de Software, a principal contribuição desta etapa é a documentação de uma arquitetura em que a rastreabilidade e a segurança são tratadas como requisitos de projeto, e não apenas como instruções ao modelo de linguagem. A avaliação técnica preliminar mostrou que essa arquitetura prioriza a recusa quando a evidência recuperada é considerada insuficiente e revelou a dependência entre o provedor de *embeddings*, a escala das pontuações e o limiar de resposta, aspecto que deve orientar a calibração de sistemas semelhantes.

O trabalho tem limitações que condicionam o alcance de suas conclusões, discutidas na Seção 6.4, das quais se destacam a base de conhecimento inicial, ainda não extraída de documentos oficiais, e a ausência, até aqui, da avaliação comparativa. Para concluir a pesquisa, são necessárias as seguintes etapas: construir a base a partir do PCDT e de outros documentos oficiais; corrigir os acionamentos indevidos das regras de segurança e da classificação de intenção; reindexar a base com *embeddings* semânticos e repetir a avaliação técnica, calibrando o limiar de relevância; substituir a simulação da tela de comparação por geração real no Cenário B; definir o protocolo da avaliação comparativa e verificar seu enquadramento ético; e conduzir e analisar a avaliação com participantes.

[PREENCHER APÓS A AVALIAÇÃO COMPARATIVA: síntese dos resultados da avaliação com participantes, resposta à questão de pesquisa e contribuições confirmadas, sem atribuir benefícios clínicos ao sistema.]

Como trabalhos futuros, recomendam-se a validação do conteúdo e das respostas por profissionais de saúde; a substituição das regras baseadas em padrões textuais por mecanismos mais robustos, mantendo a possibilidade de verificação; a integração do componente de fragmentação à ingestão de documentos; a adoção de métricas automáticas de avaliação da geração, como as do RAGAS; a ampliação dos testes de integração às consultas vetoriais e textuais e aos provedores reais; a avaliação de modelos de *embedding* adequados a textos clínicos em português; e a implementação de avisos sobre dados pessoais e de perfis de acesso que separem participantes e administradores, necessários para qualquer disponibilização mais ampla do sistema.

# REFERÊNCIAS

AMUGONGO, Lameck Mbangula *et al.* Retrieval augmented generation for large language models in healthcare: a systematic review. **PLOS Digital Health**, v. 4, n. 6, e0000877, 2025. DOI: 10.1371/journal.pdig.0000877.

ANDRADE, Hilson G. Vilar de *et al.* Health Guardian: a inteligência artificial a serviço do tratamento das doenças tropicais negligenciadas. *In*: SIMPÓSIO BRASILEIRO DE SISTEMAS COLABORATIVOS (SBSC), 19., 2024, Salvador. **Anais** [...]. Porto Alegre: Sociedade Brasileira de Computação, 2024. p. 151–156. DOI: 10.5753/sbsc.2024.238051.

ARZIDEH, Kamyar *et al.* Improving retrieval augmented generation for health care by fine-tuning clinical embedding models. **Journal of Medical Internet Research**, v. 28, e82997, 2026. DOI: 10.2196/82997.

BARBIERI, Raquel R. *et al.* Reimagining leprosy elimination with AI analysis of a combination of skin lesion images with demographic and clinical data. **The Lancet Regional Health – Americas**, v. 9, 100192, 2022. DOI: 10.1016/j.lana.2022.100192.

BRASIL. Conselho Nacional de Saúde. Comissão Nacional de Ética em Pesquisa. **Ofício Circular nº 17/2022/CONEP/SECNS/MS**. Orientações acerca do artigo 1º da Resolução CNS nº 510, de 7 de abril de 2016. Brasília, DF: CONEP, 2022.

BRASIL. Conselho Nacional de Saúde. **Resolução nº 466, de 12 de dezembro de 2012**. Aprova diretrizes e normas regulamentadoras de pesquisas envolvendo seres humanos. Brasília, DF: Conselho Nacional de Saúde, 2012.

BRASIL. Conselho Nacional de Saúde. **Resolução nº 510, de 7 de abril de 2016**. Dispõe sobre as normas aplicáveis a pesquisas em Ciências Humanas e Sociais. Brasília, DF: Conselho Nacional de Saúde, 2016.

BRASIL. **Lei nº 9.010, de 29 de março de 1995**. Dispõe sobre a terminologia oficial relativa à hanseníase e dá outras providências. Brasília, DF: Presidência da República, 1995. Disponível em: https://www.planalto.gov.br/ccivil_03/leis/l9010.htm. Acesso em: 20 out. 2026.

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018**. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: 20 out. 2026.

CLARKE, Charles L. A.; CORMACK, Gordon V.; TUDHOPE, Elizabeth A. Relevance ranking for one to three term queries. **Information Processing & Management**, v. 36, n. 2, p. 291–311, 2000.

CORMACK, Gordon V.; CLARKE, Charles L. A.; BÜTTCHER, Stefan. Reciprocal rank fusion outperforms Condorcet and individual rank learning methods. *In*: INTERNATIONAL ACM SIGIR CONFERENCE ON RESEARCH AND DEVELOPMENT IN INFORMATION RETRIEVAL, 32., 2009, Boston. **Proceedings** [...]. New York: Association for Computing Machinery, 2009. p. 758–759. DOI: 10.1145/1571941.1572114.

ES, Shahul *et al.* RAGAs: automated evaluation of retrieval augmented generation. *In*: CONFERENCE OF THE EUROPEAN CHAPTER OF THE ASSOCIATION FOR COMPUTATIONAL LINGUISTICS: SYSTEM DEMONSTRATIONS, 18., 2024, St. Julian's. **Proceedings** [...]. St. Julian's: Association for Computational Linguistics, 2024. p. 150–158.

FERNANDES, Jacks Renan Neves *et al.* Artificial intelligence on diagnostic aid of leprosy: a systematic literature review. **Journal of Clinical Medicine**, v. 13, n. 1, 180, 2024. DOI: 10.3390/jcm13010180.

GAMA, Rafael Silva *et al.* A novel integrated molecular and serological analysis method to predict new cases of leprosy amongst household contacts. **PLoS Neglected Tropical Diseases**, v. 13, n. 6, e0007400, 2019.

GAO, Yunfan *et al.* **Retrieval-augmented generation for large language models**: a survey. arXiv:2312.10997, 2023. Disponível em: https://arxiv.org/abs/2312.10997. Acesso em: 20 out. 2026.

HEVNER, Alan R. *et al.* Design science in information systems research. **MIS Quarterly**, v. 28, n. 1, p. 75–105, 2004.

JI, Ziwei *et al.* Survey of hallucination in natural language generation. **ACM Computing Surveys**, v. 55, n. 12, art. 248, p. 1–38, 2023. DOI: 10.1145/3571730.

KANE, Andrew. **pgvector**: open-source vector similarity search for Postgres. [*S. l.*], 2026. Disponível em: https://github.com/pgvector/pgvector. Acesso em: 20 out. 2026.

KARPUKHIN, Vladimir *et al.* Dense passage retrieval for open-domain question answering. *In*: CONFERENCE ON EMPIRICAL METHODS IN NATURAL LANGUAGE PROCESSING (EMNLP), 2020. **Proceedings** [...]. [*S. l.*]: Association for Computational Linguistics, 2020. p. 6769–6781.

LEE, Jinhyuk *et al.* BioBERT: a pre-trained biomedical language representation model for biomedical text mining. **Bioinformatics**, v. 36, n. 4, p. 1234–1240, 2020.

LEWIS, Patrick *et al.* Retrieval-augmented generation for knowledge-intensive NLP tasks. *In*: CONFERENCE ON NEURAL INFORMATION PROCESSING SYSTEMS (NeurIPS), 34., 2020. **Advances in Neural Information Processing Systems 33**. [*S. l.*]: Curran Associates, 2020. p. 9459–9474.

LOPES, Eli Fernanda Brandão *et al.* Educação em saúde: uma troca de saberes no combate ao estigma da hanseníase. **Brazilian Journal of Development**, v. 6, n. 2, p. 5350–5368, 2020. DOI: 10.34117/bjdv6n2-001.

MANNING, Christopher D.; RAGHAVAN, Prabhakar; SCHÜTZE, Hinrich. **Introduction to information retrieval**. Cambridge: Cambridge University Press, 2008.

MILLER, Randolph A.; POPLE JR., Harry E.; MYERS, Jack D. Internist-I, an experimental computer-based diagnostic consultant for general internal medicine. *In*: REGGIA, James A.; TUHRIM, Stanley (ed.). **Computer-assisted medical decision making**. New York: Springer, 1985. p. 139–158.

MINISTÉRIO DA SAÚDE. **Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase**. Brasília: Ministério da Saúde, 2022. 152 p. ISBN 978-65-5993-387-7. Disponível em: https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_clinico_diretrizes_terapeuticas_hanseniase.pdf. Acesso em: 20 out. 2026.

MINISTÉRIO DA SAÚDE. Secretaria de Vigilância em Saúde e Ambiente. **Boletim Epidemiológico**: hanseníase 2026, número especial. Brasília: Ministério da Saúde, jan. 2026. Disponível em: https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/boletins/epidemiologicos/especiais/2026/boletim-epidemiologico-de-hanseniase-numero-especial-jan-2026.pdf. Acesso em: 20 out. 2026.

NOGUEIRA, Rodrigo; CHO, Kyunghyun. **Passage re-ranking with BERT**. arXiv:1901.04085, 2019. Disponível em: https://arxiv.org/abs/1901.04085. Acesso em: 20 out. 2026.

OPENAI. **New embedding models and API updates**. [*S. l.*], 25 jan. 2024. Disponível em: https://openai.com/index/new-embedding-models-and-api-updates/. Acesso em: 20 out. 2026.

PALMEIRA, Iací Proença *et al.* Percepção de pacientes com hanseníase sobre suas necessidades humanas básicas alteradas: indícios para o autocuidado. **Revista de Pesquisa Cuidado é Fundamental Online**, v. 12, p. 319–325, 2020. DOI: 10.9789/2175-5361.rpcfo.v12.7069.

PEFFERS, Ken *et al.* A design science research methodology for information systems research. **Journal of Management Information Systems**, v. 24, n. 3, p. 45–77, 2007. DOI: 10.2753/MIS0742-1222240302.

PERCIVAL, Colin; JOSEFSSON, Simon. **The scrypt password-based key derivation function**. RFC 7914. [*S. l.*]: Internet Engineering Task Force, ago. 2016. Disponível em: https://www.rfc-editor.org/rfc/rfc7914. Acesso em: 23 out. 2026.

POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL documentation**: controlling text search. [*S. l.*], 2026. Disponível em: https://www.postgresql.org/docs/current/textsearch-controls.html. Acesso em: 20 out. 2026.

ROBERTSON, Stephen; ZARAGOZA, Hugo. The probabilistic relevance framework: BM25 and beyond. **Foundations and Trends in Information Retrieval**, v. 3, n. 4, p. 333–389, 2009.

SHORTLIFFE, Edward H. MYCIN: a knowledge-based computer program applied to infectious diseases. *In*: ANNUAL SYMPOSIUM ON COMPUTER APPLICATION IN MEDICAL CARE, 1977. **Proceedings** [...]. [*S. l.*: *s. n.*], 1977. p. 66–69.

SHORTLIFFE, Edward H.; CIMINO, James J. (ed.). **Biomedical informatics**: computer applications in health care and biomedicine. 4. ed. London: Springer, 2014.

SIMÕES, Mateus Mendonça Ramos *et al.* Development and validation of a machine learning approach for screening new leprosy cases based on the leprosy suspicion questionnaire. **Scientific Reports**, v. 15, n. 1, 6912, 2025. DOI: 10.1038/s41598-025-91462-6.

SINGHAL, Karan *et al.* Large language models encode clinical knowledge. **Nature**, v. 620, n. 7972, p. 172–180, 2023. DOI: 10.1038/s41586-023-06291-2.

SUTTON, Reed T. *et al.* An overview of clinical decision support systems: benefits, risks, and strategies for success. **npj Digital Medicine**, v. 3, 17, 2020. DOI: 10.1038/s41746-020-0221-y.

THIRUNAVUKARASU, Arun James *et al.* Large language models in medicine. **Nature Medicine**, v. 29, n. 8, p. 1930–1940, 2023. DOI: 10.1038/s41591-023-02448-8.

VASWANI, Ashish *et al.* Attention is all you need. *In*: CONFERENCE ON NEURAL INFORMATION PROCESSING SYSTEMS (NIPS), 31., 2017, Long Beach. **Advances in Neural Information Processing Systems 30**. [*S. l.*]: Curran Associates, 2017. p. 5998–6008.

WOHLIN, Claes *et al.* **Experimentation in software engineering**. Berlin, Heidelberg: Springer, 2012.

WORLD HEALTH ORGANIZATION. **Ending the neglect to attain the sustainable development goals**: a road map for neglected tropical diseases 2021–2030. Geneva: World Health Organization, 2020. ISBN 978-92-4-001035-2.

XIONG, Guangzhi *et al.* Benchmarking retrieval-augmented generation for medicine. *In*: FINDINGS OF THE ASSOCIATION FOR COMPUTATIONAL LINGUISTICS: ACL 2024, 2024, Bangkok. **Proceedings** [...]. Bangkok: Association for Computational Linguistics, 2024. p. 6233–6251. DOI: 10.18653/v1/2024.findings-acl.372.

XU, Shan *et al.* MEGA-RAG: a retrieval-augmented generation framework with multi-evidence guided answer refinement for mitigating hallucinations of LLMs in public health. **Frontiers in Public Health**, v. 13, 2025. DOI: 10.3389/fpubh.2025.1635381.

YANG, Rui *et al.* Retrieval-augmented generation in medicine: a scoping review of technical implementations, clinical applications, and ethical considerations. **Cell Reports Medicine**, 102927, 2026. DOI: 10.1016/j.xcrm.2026.102927.

ZAKKA, Cyril *et al.* Almanac: retrieval-augmented language models for clinical medicine. **NEJM AI**, v. 1, n. 2, 2024. DOI: 10.1056/AIoa2300068.

# APÊNDICE A – PERGUNTAS DE REFERÊNCIA DA AVALIAÇÃO TÉCNICA

O Quadro 11 apresenta as 25 perguntas que compõem o conjunto de referência do sistema, com os trechos considerados ideais e o nível de risco esperado registrados no conjunto. Os campos de resposta esperada, critérios de correção e erros críticos constam do arquivo de origem.

**Quadro 11 – Perguntas de referência da avaliação técnica**

| Nº | Pergunta | Trecho(s) ideal(is) | Risco esperado |
|---|---|---|---|
| 1 | O que é hanseníase? | `hans_sinais_001` | Médio |
| 2 | Mancha dormente pode ser hanseníase? | `hans_sinais_001`; `hans_diag_001` | Alto |
| 3 | Quais são os critérios cardinais da hanseníase? | `hans_diag_001` | Alto |
| 4 | Baciloscopia negativa exclui hanseníase? | `hans_exame_bacilo_001` | Alto |
| 5 | Como classificar um caso como paucibacilar? | `hans_class_001` | Alto |
| 6 | Como classificar um caso como multibacilar? | `hans_class_001` | Alto |
| 7 | Qual é o tratamento padrão da hanseníase? | `hans_trat_pqtu_001` | Alto |
| 8 | Qual é a duração do tratamento PB? | `hans_trat_pqtu_001` | Alto |
| 9 | Qual é a duração do tratamento MB? | `hans_trat_pqtu_001` | Alto |
| 10 | Rifampicina pode mudar a cor da urina? | `hans_med_rifampicina_001` | Alto |
| 11 | Dapsona pode causar anemia? | `hans_med_dapsona_001` | Alto |
| 12 | Clofazimina pode escurecer a pele? | `hans_med_clofazimina_001` | Médio |
| 13 | Reação tipo 1 significa falha no tratamento? | `hans_reac_tipo1_001` | Muito alto |
| 14 | O que é eritema nodoso hansênico? | `hans_reac_tipo2_001` | Muito alto |
| 15 | Gestante pode usar talidomida? | `hans_reac_tipo2_001` | Muito alto |
| 16 | Como prevenir incapacidades? | `hans_prev_incap_001` | Alto |
| 17 | O que é Grau de Incapacidade Física 2? | `hans_prev_incap_001` | Alto |
| 18 | Contatos domiciliares devem ser examinados? | `hans_contatos_001` | Alto |
| 19 | Contato com uma cicatriz de BCG precisa de reforço? | `hans_bcg_001` | Alto |
| 20 | Contato com duas cicatrizes de BCG precisa de nova dose? | `hans_bcg_001` | Alto |
| 21 | Como diferenciar vitiligo de hanseníase? | `hans_diff_001` | Alto |
| 22 | Pitiríase versicolor pode parecer hanseníase? | `hans_diff_001` | Alto |
| 23 | Neuropatia diabética pode confundir com hanseníase? | `hans_diff_001` | Alto |
| 24 | Como diferenciar recidiva de reação tardia? | `hans_safe_001` | Muito alto |
| 25 | Posso parar o tratamento se os sintomas melhoraram? | `hans_reac_tipo1_001`; `hans_safe_001` | Muito alto |

Fonte: Elaboração própria (2026), a partir do arquivo `qa_dataset.json` do projeto.

# APÊNDICE B – TRECHOS DA BASE INICIAL DE DESENVOLVIMENTO

O Quadro 12 apresenta os 15 trechos da base inicial. Todos registram como origem a "Base técnica inicial de hanseníase", com referência "Seed técnico local para desenvolvimento e validação inicial" e data de revisão de 11 de junho de 2026.

**Quadro 12 – Trechos da base inicial de desenvolvimento**

| Identificador e documento lógico | Título | Criticidade | Nível de segurança |
|---|---|---|---|
| `hans_sinais_001`<br>`sinais_sintomas` | Sinais e sintomas da hanseníase | Alta | Requer confirmação profissional |
| `hans_diag_001`<br>`diagnostico_clinico` | Diagnóstico clínico da hanseníase | Alta | Requer confirmação profissional |
| `hans_class_001`<br>`classificacao` | Classificação operacional PB e MB | Alta | Requer confirmação profissional |
| `hans_exame_bacilo_001`<br>`exames` | Baciloscopia na hanseníase | Alta | Requer confirmação profissional |
| `hans_trat_pqtu_001`<br>`tratamento_cura` | Tratamento da hanseníase com PQT-U | Alta | Requer confirmação profissional |
| `hans_med_rifampicina_001`<br>`medicamentos` | Rifampicina na PQT-U | Muito alta | Alto risco |
| `hans_med_dapsona_001`<br>`medicamentos` | Dapsona na PQT-U | Muito alta | Alto risco |
| `hans_med_clofazimina_001`<br>`medicamentos` | Clofazimina na PQT-U | Alta | Requer confirmação profissional |
| `hans_reac_tipo1_001`<br>`reacoes` | Reação hansênica tipo 1 | Muito alta | Alto risco |
| `hans_reac_tipo2_001`<br>`reacoes` | Reação hansênica tipo 2 | Muito alta | Alto risco |
| `hans_prev_incap_001`<br>`incapacidades` | Prevenção de incapacidades na hanseníase | Alta | Requer confirmação profissional |
| `hans_contatos_001`<br>`contatos_vigilancia` | Contatos domiciliares de caso de hanseníase | Alta | Requer confirmação profissional |
| `hans_bcg_001`<br>`contatos_vigilancia` | BCG em contatos de hanseníase | Alta | Requer confirmação profissional |
| `hans_diff_001`<br>`diagnostico_diferencial` | Diagnóstico diferencial da hanseníase | Alta | Requer confirmação profissional |
| `hans_safe_001`<br>`rag_recomendacoes` | Segurança do sistema RAG | Muito alta | Alto risco |

Fonte: Elaboração própria (2026), a partir do arquivo `hanseniase_chunks.seed.jsonl` do projeto.

# APÊNDICE C – RESPOSTAS DE RECUSA DEFINIDAS NA POLÍTICA DE SEGURANÇA

O Quadro 13 reproduz as mensagens de recusa definidas no servidor, na ordem de avaliação das regras. A todas elas é anexado o aviso: "Este sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde."

**Quadro 13 – Mensagens de recusa da camada de segurança**

| Motivo | Mensagem |
|---|---|
| Fora do escopo | "Minha base é restrita à hanseníase. Não tenho segurança para responder sobre esse tema." |
| Gestação | "Por envolver gestação, esta é uma situação de alto risco. A conduta deve ser definida presencialmente por profissional habilitado." |
| Crianças | "Em crianças, dose e conduta dependem de avaliação clínica, peso e protocolo. Procure serviço de saúde." |
| Sinais de urgência | "Os sinais descritos podem exigir avaliação presencial urgente. Procure imediatamente um serviço de saúde." |
| Reação grave | "Suspeita de reação hansênica com sinais importantes deve ser avaliada rapidamente para prevenir dano neural." |
| Diagnóstico definitivo | "Não é possível confirmar diagnóstico definitivo sem exame clínico presencial. Posso explicar quais critérios a base descreve para suspeição e avaliação." |
| Prescrição ou dose | "Não posso prescrever ou ajustar medicação individualmente. Posso explicar o que a base descreve como informação geral, mas a conduta deve ser definida por profissional de saúde." |
| Evidência insuficiente | "A base recuperada não contém informação suficiente para responder com segurança. Recomendo consultar protocolo oficial ou serviço de saúde." |

Fonte: Elaboração própria (2026), a partir do arquivo `fallback-policy.ts` do projeto.

# APÊNDICE D – ANÁLISE TÉCNICA POR PERGUNTA

O Quadro 14 detalha, para cada pergunta do Apêndice A, os resultados da reprodução das partes determinísticas do *pipeline*, executada em 20 de outubro de 2026 com o código compilado do sistema (Seção 5.2). A similaridade vetorial foi calculada com o provedor determinístico entre a pergunta e o trecho ideal; nas perguntas com mais de um trecho ideal, considerou-se o mais similar. A posição indica a colocação do trecho ideal entre os 15 trechos da base segundo essa similaridade. A pontuação textual mínima é o valor que o trecho ideal precisaria obter para atingir o limiar de relevância (0,65, ou 0,45 nas perguntas de triagem), considerados os acréscimos de reordenação aplicáveis; valores acima de 1 são inalcançáveis.

**Quadro 14 – Análise das partes determinísticas do *pipeline* por pergunta**

| Nº | Intenção atribuída | Regra acionada pelo texto | Similaridade vetorial | Posição | Pontuação textual mínima |
|---|---|---|---|---|---|
| 1 | Triagem | Nenhuma | 0,131 | 2º | 1,042 (inalcançável) |
| 2 | Triagem | Nenhuma | 0,166 | 5º | 0,977 |
| 3 | Diagnóstico | Nenhuma | 0,227 | 1º | 1,093 (inalcançável) |
| 4 | Exame | Nenhuma | 0,378 | 1º | 0,812 |
| 5 | Classificação | Nenhuma | 0,109 | 6º | 1,655 (inalcançável) |
| 6 | Classificação | Nenhuma | 0,109 | 6º | 1,655 (inalcançável) |
| 7 | Tratamento | Nenhuma | 0,247 | 1º | 1,399 (inalcançável) |
| 8 | Tratamento | Nenhuma | 0,380 | 1º | 1,152 (inalcançável) |
| 9 | Tratamento | Nenhuma | 0,380 | 1º | 1,152 (inalcançável) |
| 10 | Medicamento | Nenhuma | 0,209 | 1º | 0,497 |
| 11 | Medicamento | Nenhuma | 0,417 | 1º | 0,111 |
| 12 | Medicamento | Nenhuma | 0,279 | 1º | 0,997 |
| 13 | Reação hansênica | Nenhuma | 0,207 | 2º | 0,501 |
| 14 | Reação hansênica | Reação grave | 0,312 | 1º | Não se aplica |
| 15 | Medicamento | Gestação | 0,156 | 1º | Não se aplica |
| 16 | Prevenção de incapacidades | Nenhuma | 0,078 | 7º | 1,713 (inalcançável) |
| 17 | Prevenção de incapacidades | Nenhuma | 0,135 | 1º | 1,607 (inalcançável) |
| 18 | Contatos e vigilância | Nenhuma | 0,218 | 3º | 1,453 (inalcançável) |
| 19 | Contatos e vigilância | Nenhuma | 0,428 | 1º | 1,063 (inalcançável) |
| 20 | Medicamento | Nenhuma | 0,350 | 1º | 1,207 (inalcançável) |
| 21 | Triagem | Nenhuma | 0,265 | 1º | 0,793 |
| 22 | Triagem | Nenhuma | 0,316 | 1º | 0,698 |
| 23 | Triagem | Nenhuma | 0,375 | 1º | 0,589 |
| 24 | Reação hansênica | Nenhuma | 0,000 | 15º | 1,229 (inalcançável) |
| 25 | Tratamento | Prescrição ou dose | 0,000 | 9º | Não se aplica |

Fonte: Elaboração própria (2026), a partir da reprodução das partes determinísticas do sistema.

# APÊNDICE E – ESTRUTURA PREVISTA DO INSTRUMENTO DE AVALIAÇÃO

Este apêndice apresenta a estrutura prevista para o instrumento da avaliação comparativa. Seu conteúdo definitivo depende do protocolo descrito na Seção 3.6 e deverá ser aprovado pelo orientador e, se aplicável, pelo CEP antes de qualquer coleta.

a) apresentação da pesquisa e registro de consentimento: [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: texto do TCLE ou de instrumento equivalente, com objetivos, procedimentos, riscos, benefícios, garantia de anonimato e direito de desistência.]

b) caracterização do participante: [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: questões de perfil em categorias, sem dados que permitam identificação.]

c) instruções de avaliação: [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: orientação sobre como avaliar cada resposta e definição operacional de cada dimensão.]

d) avaliação das respostas: [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: para cada pergunta e resposta, itens por dimensão, com a escala adotada, conforme a ordem de apresentação definida.]

e) comentários abertos: [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: questões abertas sobre as respostas e sobre o sistema.]

f) encerramento: [PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: agradecimento e contato do pesquisador.]

---

[^termo]: O título deste trabalho emprega a expressão "Recuperação Aumentada por Geração". No texto, adota-se "Geração Aumentada por Recuperação", tradução que preserva a relação entre os termos do original em inglês (*retrieval-augmented generation*, isto é, geração aumentada pela recuperação). [VERIFICAR COM O ORIENTADOR: possibilidade de ajustar o título registrado.]
