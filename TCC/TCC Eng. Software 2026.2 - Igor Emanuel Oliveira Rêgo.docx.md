![][image1]

## **UNIVERSIDADE DE PERNAMBUCO CAMPUS GARANHUNS ENGENHARIA DE SOFTWARE**

**Igor Emanuel Oliveira Rêgo**

**Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase.**

## **GARANHUNS 2026**

Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase.

Monografia apresentada como requisito para obtenção do diploma de Bacharelado em Engenharia de Software pela Universidade de Pernambuco Campus Garanhuns.

Orientador: Prof. Élisson da Silva Rocha Coorientador: 

GARANHUNS 2026

FICHA CATALOGRÁFICA

Após o recebimento da ficha catalográfica da biblioteca, apagar o texto e incluir o arquivo enviado pelo bibliotecário no final desta página

Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase.

Monografia apresentada como requisito para ob- tenção do diploma de Bacharelado em Engenha- ria de Software pela Universidade de Pernam- buco Campus Garanhuns.

Aprovado em: 00/00/2026.

### **Prof. Élisson da Silva Rocha**

Orientador

### 

Coorientadora

### 

Convidado 1

### 

Convidado 2

GARANHUNS 2026

*Dedico este trabalho a minha mãe, Maria José, e a minha madrinha, Syanra Polyana. Sem vocês eu nunca chegaria até este momento. Eu sou, no final, tudo e mais um pouco do que vocês me ensinaram.*

## **AGRADECIMENTOS**

Expressar sentimentos é uma tarefa árdua e indireta. Nem sempre me sinto preparado para isso. Ainda assim, não deixo de sentir e de me permitir expressar da minha própria maneira para as pessoas que me cativam. Dessa forma, é por meio deste espaço que busco agradecer a essas pessoas que marcaram a minha trajetória até este momento e estiveram, direta e indiretamente, contribuindo para a conclusão deste trabalho.  
Em primeiro lugar, gostaria de agradecer aos meus familiares: minha mãe, Maria José; minha madrinha, Synara Polyana; Minha tia, Edna Ferreira; minha irmã,Jullyana; e meu padrinho, Renato Bezerra. Obrigado por todo o apoio durante esses quase quatro anos de estudos. Entre todas as indas e vindas que precisei fazer para chegar até aqui, todas valeram à pena por saber que do outro lado encontraria vocês.   
Em seguida, agradeço aos meus queridos amigos por me acompanharem durante toda a trajetória da graduação, em especial a Mickael e Nathan, no qual fizemos grupo desde o início da faculdade. Compartilhar esse momento ao lado de vocês me mostrou como tudo na vida melhora em boas companhias e a de vocês foi a melhor que eu tive. Obrigado por todo esforço desempenhado, por cada abraço dado, por cada risada tida e por cada lembrança feita\!  
Por fim, gostaria de agradecer a todos os professores que fizeram parte de todo o curso da minha graduação e me expuseram a um mundo de tecnologia, ciência e conhecimento. Aos senhores, o meu muito obrigado\! Em especial, gostaria de agradecer ao meu orientador, Élisson da Silva Rocha, pois o senhor me introduziu a um mundo de novas possibilidades de pesquisa e me apoiou durante esta jornada. Sou muito grato ao senhor\!

*"A tecnologia tornou possível a existência de grandes populações. Grandes populações agora*

*tornam a tecnologia indispensável."*

*(Joseph Krutch)*

## **RESUMO**

A hanseníase permanece como um grave problema de saúde pública no Brasil, país que concentra o segundo maior número de casos novos no mundo e apresenta altas taxas de diagnóstico tardio. A atenção primária à saúde é fundamental no combate à doença, mas frequentemente esbarra na carência de conhecimento especializado para o manejo clínico e identificação de episódios reacionais. Com os recentes avanços em Processamento de Linguagem Natural (PLN), os Modelos de Linguagem de Grande Escala (LLMs) oferecem novas perspectivas para o suporte textual em saúde, embora seu uso puro apresente riscos críticos de "alucinações" e defasagem de informações. Este trabalho propõe o desenvolvimento de um sistema de apoio à decisão clínica direcionado à hanseníase, construído sob a arquitetura de Recuperação Aumentada por Geração (RAG). A metodologia contempla a curadoria de uma base de conhecimento embasada no Protocolo Clínico e Diretrizes Terapêuticas (PCDT) do Ministério da Saúde, a fragmentação semântica e indexação desses documentos em um banco de dados vetorial, e a orquestração de um pipeline capaz de fornecer respostas contextualizadas, rastreáveis e fundamentadas. O sistema será avaliado através do framework RAGAS para garantir fidelidade e relevância de contexto. Espera-se que a plataforma demonstre a viabilidade da aplicação de inteligência artificial generativa segura no contexto das doenças tropicais negligenciadas, entregando uma ferramenta tecnológica apta a subsidiar o raciocínio clínico e mitigar erros diagnósticos.  
Palavras-chaves: hanseníase; Recuperação Aumentada por Geração; RAG; inteligência artificial; apoio à decisão clínica; atenção primária.

**Palavras-chaves**: hanseníase; prognóstico; GIF; aprendizado de máquina.

## **ABSTRACT**

Leprosy remains a severe public health issue in Brazil, the country with the second-highest number of new cases globally and high rates of late diagnosis. Primary health care is fundamental in combating the disease but often faces a lack of specialized knowledge for clinical management and the identification of reactional episodes. With recent advances in Natural Language Processing (NLP), Large Language Models (LLMs) offer new perspectives for textual support in healthcare, although their standalone use presents critical risks of "hallucinations" and outdated information. This work proposes the development of a clinical decision support system directed at leprosy, built on the Retrieval-Augmented Generation (RAG) architecture. The methodology includes the curation of a knowledge base grounded in the Brazilian Ministry of Health's Clinical Protocol and Therapeutic Guidelines (PCDT), the semantic chunking and indexing of these documents in a vector database, and the orchestration of a pipeline capable of providing contextualized, traceable, and evidence-based answers. The system will be evaluated using the RAGAS framework to ensure faithfulness and context relevancy. The platform is expected to demonstrate the feasibility of applying secure generative artificial intelligence in the context of neglected tropical diseases, delivering a technological tool capable of supporting clinical reasoning and mitigating diagnostic errors.  
Key-words: leprosy; Retrieval-Augmented Generation; RAG; artificial intelligence; clinical decision support; primary care.

**Key-words**: leprosy; prognosis; PDG; machine learning.

## **SUMÁRIO**

1. [**INTRODUÇÃO**](#introdução)	14

   1. [OBJETIVOS](#objetivos)	15

      1. [**Objetivo Geral**](#objetivo-geral)	15

      2. [**Objetivos Específicos**](#objetivos-específicos)	15

   2. [JUSTIFICATIVA](#justificativa)	16

   3. [ORGANIZAÇÃO DO TRABALHO](#organização-do-trabalho)	16

2. [**REFERENCIAL TEÓRICO**](#referencial-teórico)	17

   1. [HANSENÍASE](#hanseníase)	17

   2. [SISTEMAS DE APOIO À DECISÃO CLÍNICA](#sistemas-de-apoio-à-decisão-clínica)	18

   3. [INTELIGÊNCIA ARTIFICIAL E MODELOS DE LINGUAGEM DE GRANDE ESCALA](#inteligência-artificial-e-modelos-de-linguagem-de-grande-escala)	18

   4. [RECUPERAÇÃO AUMENTADA POR GERAÇÃO (RAG)](#recuperação-aumentada-por-geração-\(rag\))	19

   5. [ESTADO DA ARTE](#estado-da-arte)	20

   6. [TRABALHOS RELACIONADOS](#trabalhos-relacionados)	21

3. [**METODOLOGIA**](#metodologia)	22

4. [**RESULTADOS ESPERADOS**](#resultados-esperados)	24

5. [**CRONOGRAMA**](#cronograma)	25

6. **CONCLUSÃO**	27

[**REFERÊNCIAS**](#heading=h.14rg8jdgnyib)	28

1. ## **INTRODUÇÃO** {#introdução}

No contexto global das doenças infecciosas, nem todas recebem a atenção científica, política e econômica proporcional ao sofrimento que causam. Algumas enfermidades, apesar de afetarem centenas de milhões de pessoas nas regiões mais vulneráveis do planeta, permanecem à margem das grandes agendas de saúde. Sob essa perspectiva, consolidou-se o conceito de Doenças Tropicais Negligenciadas (DTN), que reúne agravos endêmicos em países pobres da África, Ásia e América Latina, entre os quais se encontra a hanseníase (World Health Organization, 2020).

A hanseníase é uma doença infecciosa crônica causada pelo Mycobacterium leprae, que compromete o sistema nervoso periférico e a pele, podendo gerar incapacidades físicas irreversíveis quando não diagnosticada e tratada precocemente (Ministério da Saúde, 2022). O Brasil ocupa, de forma contínua, a segunda posição mundial em número de casos novos, registrando em 2023 aproximadamente 12,45% de todas as notificações globais, com forte concentração nas regiões Norte, Nordeste e Centro-Oeste (World Health Organization, 2024; Ministério da Saúde, 2025). Entre 2015 e 2024, a proporção de casos multibacilares no país cresceu 19,3%, sinalizando uma tendência de detecção tardia que agrava o prognóstico dos pacientes (Ministério da Saúde, 2026).

Um dos principais fatores que sustentam essa realidade é a lacuna de conhecimento clínico na Atenção Primária à Saúde (APS). Muitos profissionais que atuam em unidades básicas de saúde, especialmente nas regiões endêmicas, carecem de treinamento especializado para reconhecer os sinais iniciais da doença, conduzir o diagnóstico dermatoneurológico e manejar adequadamente os episódios reacionais — fenômenos inflamatórios agudos que representam a principal causa de danos neurológicos permanentes (Ministério da Saúde, 2022). A ausência de suporte inteligente e contextualizado nesses ambientes resulta em erros diagnósticos, subnotificação e manejo inadequado, perpetuando a cadeia de transmissão e o ciclo de incapacidades.

Paralelamente, a ascensão da Inteligência Artificial (IA) generativa, em particular dos Modelos de Linguagem de Grande Escala (LLMs, do inglês *Large Language Models*), abriu novas possibilidades para o processamento e a síntese de conhecimento médico complexo. Contudo, os LLMs convencionais apresentam limitações críticas para uso clínico: a tendência a "alucinações" — geração de informações falsas com aparência convincente — e o caráter estático de seu conhecimento de treinamento, que não acompanha a atualização contínua dos protocolos clínicos (Thirunavukarasu et al., 2023). Nesse cenário, a arquitetura de Recuperação Aumentada por Geração (RAG, do inglês *Retrieval-Augmented Generation*) emerge como uma solução técnica robusta: ao invés de depender exclusivamente dos parâmetros internos do modelo, o sistema RAG consulta uma base de documentos curada e confiável — como protocolos do Ministério da Saúde e diretrizes da OMS — antes de gerar cada resposta, conferindo precisão, rastreabilidade e atualizabilidade ao suporte à decisão (Lewis et al., 2020).

Diante do exposto, este trabalho propõe o desenvolvimento de um sistema baseado em RAG voltado ao apoio à decisão clínica em hanseníase, com foco nos profissionais da atenção primária. A iniciativa justifica-se pela ausência de sistemas de suporte ao raciocínio clínico textual e contextualizado para essa doença: a literatura existente concentra-se majoritariamente em modelos de visão computacional para diagnóstico por imagem e em classificadores de dados tabulares, negligenciando o potencial de sistemas baseados em Processamento de Linguagem Natural (PLN) para auxiliar na conduta clínica, no manejo das reações hansênicas e na educação continuada dos profissionais de saúde (Fernandes et al., 2024). A integração de RAG com os protocolos oficiais do Ministério da Saúde, como o Protocolo Clínico e Diretrizes Terapêuticas (PCDT) da Hanseníase, representa uma oportunidade de democratizar o acesso ao conhecimento especializado em um país de dimensões continentais.

Assim, esta pesquisa busca responder à seguinte pergunta: Como o desenvolvimento de um sistema baseado em Recuperação Aumentada por Geração (RAG) pode contribuir para melhorar o apoio à decisão clínica no diagnóstico e manejo da hanseníase, especialmente em contextos de atenção primária à saúde?

1. ## **OBJETIVOS** {#objetivos}

   1. #  **Objetivo Geral** {#objetivo-geral}

O objetivo geral desta pesquisa é desenvolver e avaliar um sistema de apoio à decisão clínica baseado na arquitetura RAG, alimentado por documentos oficiais e literatura científica sobre hanseníase, capaz de fornecer respostas precisas, contextualizadas e rastreáveis a consultas clínicas realizadas por profissionais de saúde da atenção primária.

2. #  **Objetivos Específicos** {#objetivos-específicos}

Em busca de alcançar o objetivo geral desta pesquisa, os seguintes objetivos específicos são estabelecidos:

1. Construir e curar uma base de conhecimento (knowledge base) composta por documentos técnicos e científicos sobre hanseníase, incluindo o PCDT, manuais do Ministério da Saúde e artigos científicos relevantes;

   2. Desenvolver o pipeline RAG, contemplando as etapas de fragmentação (chunking), indexação vetorial, recuperação semântica e geração de respostas;

      3. Avaliar o desempenho do sistema utilizando o framework RAGAS, mensurando métricas de fidelidade (faithfulness), relevância de resposta (answer relevancy), precisão de contexto (context precision) e revocação de contexto (context recall);

         4. Identificar as principais limitações e lacunas do sistema em relação ao domínio clínico da hanseníase.

2. ## **JUSTIFICATIVA** {#justificativa}

A hanseníase representa um grave problema de saúde pública, sobretudo em países de baixa e média renda, onde o acesso a especialistas é restrito e a atenção primária concentra a maioria dos atendimentos (World Health Organization, 2020). O Brasil, como segundo país em número de casos novos, enfrenta o desafio adicional da vasta extensão territorial e das desigualdades regionais: estados como Mato Grosso registraram, em 2024, proporção de casos multibacilares acima de 97%, indicador direto de diagnóstico tardio sistêmico (Ministério da Saúde, 2026).

A literatura científica sobre IA aplicada à hanseníase revela uma lacuna expressiva no domínio do suporte textual e do raciocínio clínico. Em sua revisão sistemática, Fernandes et al. (2024) demonstram que a maioria dos estudos existentes foca em dados imagéticos e classificação, não avançando para o auxílio à conduta terapêutica e ao manejo de episódios reacionais. Essa lacuna é particularmente relevante, pois as reações hansênicas — Tipo 1 (reversão) e Tipo 2 (eritema nodoso hanseniano) — são frequentemente mal identificadas em unidades básicas de saúde, levando a intervenções tardias e danos neurológicos permanentes.

Nesse cenário, um sistema RAG dedicado à hanseníase pode atuar como um multiplicador de expertise, fornecendo ao profissional da APS respostas contextualizadas, baseadas nos protocolos vigentes e com citação das fontes que as embasam — um requisito essencial para a confiança clínica e para a conformidade com as normas éticas e regulatórias (Thirunavukarasu et al., 2023). Diferente de um chatbot genérico, o sistema proposto ancora suas respostas nos documentos oficiais, reduzindo o risco de alucinações e garantindo a rastreabilidade da informação. Portanto, esta pesquisa justifica-se pela urgência de unir IA generativa e saúde pública para fortalecer a capacidade diagnóstica e terapêutica na linha de frente do combate à hanseníase no Brasil.

3. ##  **ORGANIZAÇÃO DO TRABALHO** {#organização-do-trabalho}

Este trabalho está estruturado em quatro capítulos adicionais. O Capítulo 2 apresenta o referencial teórico, abordando a hanseníase, os sistemas de apoio à decisão clínica, os modelos de linguagem de grande escala, a arquitetura RAG, o estado da arte e os trabalhos relacionados. No Capítulo 3, detalha-se a metodologia de desenvolvimento do sistema, desde a curação da base de conhecimento até a avaliação do pipeline RAG. O Capítulo 4 expõe os resultados obtidos e a discussão. Por fim, o Capítulo 5 apresenta as conclusões, limitações e perspectivas de trabalhos futuros.

2. ##  **REFERENCIAL TEÓRICO** {#referencial-teórico}

Neste capítulo, são apresentados os fundamentos teóricos necessários para a compreensão desta pesquisa. A seção 2.1 descreve a hanseníase em seus aspectos clínicos, epidemiológicos e sociais. A seção 2.2 contextualiza os Sistemas de Apoio à Decisão Clínica (CDSS) e sua evolução histórica. A seção 2.3 aborda a Inteligência Artificial aplicada à saúde, com foco nos Modelos de Linguagem de Grande Escala. A seção 2.4 detalha a arquitetura de Recuperação Aumentada por Geração (RAG), seus componentes e métricas de avaliação. Por fim, as seções 2.5 e 2.6 apresentam o estado da arte e os trabalhos relacionados, respectivamente.

1. ##  **HANSENÍASE** {#hanseníase}

A hanseníase é uma das enfermidades mais antigas registradas na história da humanidade. Há evidências de casos que datam de aproximadamente quatro mil anos, em regiões da Índia, China e Japão (Ministério da Saúde, 2023). Apesar de sua longa história e da disponibilidade de tratamento eficaz desde a década de 1940, a doença persiste como um problema de saúde pública, especialmente nas regiões marginalizadas do planeta (Costa et al., 2020).

1. ##  **Etiologia e Patogênese**

O agente etiológico da hanseníase é o Mycobacterium leprae, um bacilo álcool-ácido resistente de parasitismo intracelular obrigatório, com predileção biológica pelas células de Schwann dos nervos periféricos e pelos macrófagos cutâneos (Ministério da Saúde, 2022). Essa característica determina as manifestações centrais da doença: a invasão nervosa provoca processos inflamatórios progressivos que resultam em desmielinização, perda de sensibilidade, fraqueza muscular e, em estágios avançados, deformidades físicas irreversíveis e cegueira. A transmissão ocorre através das vias aéreas superiores, por meio de gotículas respiratórias eliminadas por indivíduos doentes na forma multibacilar sem tratamento (Ministério da Saúde, 2022).

O período de incubação varia tipicamente de dois a sete anos, podendo se estender por décadas. A resposta imunológica do hospedeiro determina a forma clínica. Para fins operacionais e de tratamento, a Organização Mundial da Saúde utiliza uma classificação simplificada: Paucibacilar (PB), para casos com até cinco lesões cutâneas e baciloscopia negativa; e Multibacilar (MB), para casos com mais de cinco lesões ou baciloscopia positiva — estes últimos são os principais responsáveis pela manutenção da cadeia de transmissão (Ministério da Saúde, 2022). Do ponto de vista acadêmico, a classificação de Ridley-Jopling subdivide a doença em um espectro contínuo, desde a forma Tuberculoide (resposta imunológica preservada, lesões limitadas) até a Virchowiana (anergia imunológica, alta carga bacilar), passando pelas formas Dimorfas, instáveis e frequentemente associadas a surtos reacionais graves.

2. **Epidemiologia e Contexto Brasileiro**

O Brasil mantém posição desfavorável no ranking global da hanseníase, sendo o segundo país com maior número de casos novos, atrás apenas da Índia (World Health Organization, 2024). Em 2023, os casos distribuíram-se de forma heterogênea pelo território: no Centro-Oeste, foram notificados 151,12 casos por 100 mil habitantes; no Norte, 140; no Nordeste, 139,22; enquanto Sudeste e Sul registraram, respectivamente, 22,35 e 6,56 notificações por 100 mil habitantes (Ministério da Saúde, 2025). Em 2024, estados como Mato Grosso e Acre apresentaram proporções de casos multibacilares superiores a 90%, indicando detecção tardia sistêmica (Ministério da Saúde, 2026). Esse quadro reflete as desigualdades socioeconômicas do país e a necessidade urgente de ferramentas que qualifiquem o diagnóstico na atenção primária. 

3. **Diagnóstico Clínico e Desafios na Atenção Primária**

O diagnóstico da hanseníase no Brasil é essencialmente clínico e epidemiológico, realizado por meio do exame físico dermatoneurológico. Os principais sinais incluem manchas hipopigmentadas ou eritematosas com perda de sensibilidade térmica, dolorosa ou tátil, frequentemente acompanhadas de espessamento de troncos nervosos periféricos (Ministério da Saúde, 2022). A baciloscopia de esfregaço intradérmico pode auxiliar no diagnóstico, mas um resultado negativo não o exclui. Testes rápidos foram recentemente incorporados ao SUS para a triagem inicial.

O manejo clínico é baseado na Poliquimioterapia (PQT), com esquemas de seis meses para casos PB e doze meses para casos MB, alcançando cura em até 98% dos casos (Ministério da Saúde, 2022). Contudo, o desafio crítico reside nos episódios reacionais: fenômenos inflamatórios agudos que podem ocorrer antes, durante ou após a alta medicamentosa e que representam a principal causa de incapacidades permanentes. O tratamento das reações exige o uso criterioso de corticosteroides ou talidomida, com monitoramento rigoroso dos efeitos adversos. A identificação e o manejo adequados desses episódios na atenção primária exigem um nível de conhecimento especializado que frequentemente extrapola o escopo da formação generalista dos profissionais de saúde (Ministério da Saúde, 2022).

4. **Impacto Social e Estigma**

Além de suas manifestações biológicas, a hanseníase exerce um impacto psicossocial devastador. No Brasil, até a década de 1980, pacientes eram internados compulsoriamente em leprosários e isolados da sociedade — uma prática que deixou cicatrizes profundas na percepção pública da doença (Lopes et al., 2020). Em 1995, o termo "lepra" foi oficialmente substituído por "hanseníase" na documentação pública (Lei nº 9.010), em um esforço de mitigação do estigma que persiste até os dias atuais (Medeiros, 2018). Pacientes ainda enfrentam isolamento social, baixa autoestima e dificuldades econômicas decorrentes do diagnóstico, o que frequentemente os impede de buscar atendimento ao perceberem os primeiros sintomas (Palmeira et al., 2020). O relatório global da OMS de 2025 destaca que o estigma obstrui o tratamento oportuno e que a inclusão das pessoas afetadas na formulação de políticas é essencial para a garantia de dignidade e direitos humanos (World Health Organization, 2025).

## 

2. ## **SISTEMAS DE APOIO À DECISÃO CLÍNICA** {#sistemas-de-apoio-à-decisão-clínica}

Os Sistemas de Apoio à Decisão Clínica (CDSS, do inglês Clinical Decision Support Systems) são ferramentas computacionais projetadas para auxiliar os profissionais de saúde no processo de tomada de decisão, fornecendo conhecimento filtrado e específico para a situação do paciente no momento do atendimento (Shortliffe; Cimino, 2014). A trajetória desses sistemas acompanha, de perto, a própria história da Inteligência Artificial aplicada à medicina.

As primeiras iniciativas remontam à década de 1970: o INTERNIST-1, desenvolvido na Universidade de Pittsburgh, utilizava busca simbólica sobre sintomas para auxiliar no diagnóstico diferencial de doenças internistas (Miller; Pople Jr.; Myers, 1985). Em 1977, o MYCIN estabeleceu um paradigma para sistemas especialistas ao recomendar antibióticos para infecções bacterianas com base em regras codificadas por especialistas (Shortliffe, 1977). Na década de 1980, o DXplain ampliou esse modelo com uma base de dados mais extensa, servindo como ferramenta de consulta para diagnósticos diferenciais (Massachusetts General Hospital, 2025). Entretanto, todos esses sistemas dependiam de regras manualmente codificadas por especialistas, o que os tornava difíceis de manter e limitos a domínios estreitos.

A virada tecnológica ocorreu com o advento do aprendizado de máquina e, mais recentemente, dos modelos de linguagem. Enquanto os sistemas tradicionais operavam com fluxogramas rígidos de "se-então", as ferramentas modernas baseadas em IA generativa são capazes de processar linguagem natural, compreender consultas abertas e sintetizar informações de múltiplas fontes documentais (Thirunavukarasu et al., 2023). Em 2025, ferramentas como o UpToDate ExpertAI e o Dyna AI já se integraram a fluxos de trabalho hospitalares, utilizando arquiteturas de recuperação sobre bases curadas para garantir respostas seguras e baseadas em evidências (IatroX, 2025).

3. ## **INTELIGÊNCIA ARTIFICIAL E MODELOS DE LINGUAGEM DE GRANDE ESCALA** {#inteligência-artificial-e-modelos-de-linguagem-de-grande-escala}

   1. **Modelos de Linguagem de Grande Escala (LLMs)**

   Os Modelos de Linguagem de Grande Escala (LLMs) são sistemas de IA baseados na arquitetura Transformer, treinados em corpora massivos de texto para aprender representações estatísticas da linguagem (Vaswani et al., 2017). Modelos como GPT-4, Claude e Llama são capazes de realizar tarefas diversas — responder perguntas, resumir textos, redigir relatórios — sem treinamento específico para cada tarefa, mediante o uso de instruções em linguagem natural (prompts).

   

   No domínio médico, revisões abrangentes demonstram tanto o potencial quanto os riscos significativos desses sistemas. Thirunavukarasu et al. (2023), em uma revisão publicada na Nature Medicine, identificam que os LLMs apresentam desempenho promissor em questões de exames médicos e na geração de relatórios clínicos, mas também evidenciam lacunas críticas: tendência a alucinações — geração de informações factualmente incorretas com aparência convincente —, ausência de rastreabilidade das fontes, e conhecimento de treinamento estático que não reflete as atualizações das diretrizes clínicas. Essas limitações tornam o uso direto de LLMs genéricos inadequado para contextos de alta responsabilidade, como o apoio à decisão clínica, sem mecanismos adicionais de verificação e ancoragem factual.

   

   ##  **RECUPERAÇÃO AUMENTADA POR GERAÇÃO (RAG)** {#recuperação-aumentada-por-geração-(rag)}

   

   

   	A Recuperação Aumentada por Geração (RAG, do inglês Retrieval-Augmented Generation) é um framework de Inteligência Artificial que otimiza a saída de um LLM ao integrá-lo a um módulo de recuperação de informação sobre uma base de conhecimento externa (Lewis et al., 2020). A analogia mais precisa é a de um "profissional de saúde em uma consulta com acesso a protocolos": ao receber uma pergunta, o sistema primeiro consulta a biblioteca de documentos relevantes e, em seguida, utiliza os fragmentos recuperados como contexto para gerar uma resposta fundamentada. Isso resolve os dois problemas centrais dos LLMs puros: as alucinações são reduzidas porque o modelo é instruído a responder apenas com base no material recuperado, e o conhecimento pode ser atualizado simplesmente modificando a base documental, sem necessidade de re-treinamento do modelo.

      2. **Arquitetura e Pipeline**

   

   O pipeline RAG compreende duas fases principais: indexação e inferência.

   

   Na fase de indexação, os documentos da base de conhecimento — artigos, manuais, diretrizes — são fragmentados em pedaços menores (chunking) para caber na janela de contexto do modelo. A estratégia de fragmentação é determinante para a qualidade do sistema: a fragmentação semântica (semantic chunking) preserva o contexto clínico de cada instrução, evitando que protocolos sejam cortados de forma arbitrária (Xiong et al., 2024). Cada fragmento é então convertido em um vetor numérico (embedding) por um modelo de representação e armazenado em um banco de dados vetorial.

   

   Na fase de inferência, a consulta do usuário é convertida no mesmo espaço vetorial e comparada matematicamente aos fragmentos indexados. Os fragmentos mais similares (Top-K) são recuperados e anexados ao prompt enviado ao LLM, que os utiliza como contexto para gerar a resposta final. Este processo pode ser realizado por recuperação esparsa (BM25, baseada em sobreposição lexical), recuperação densa (baseada em similaridade semântica de vetores) ou por uma combinação das duas abordagens — o Hybrid Search —, recomendado para domínios com terminologia técnica específica, como a medicina (Xiong et al., 2024).

   

      3. **Embeddings e Bancos de Dados Vetoriais**

   

   Os embeddings são representações numéricas de alta dimensão que capturam o significado semântico dos textos. No domínio biomédico, utilizam-se modelos pré-treinados em corpora científicos, como o BioBERT ou o PubMedBERT, para garantir que termos técnicos — como "eritema nodoso hanseniano" ou "nervo ulnar" — sejam processados com o contexto clínico adequado (Improving Retrieval Augmented Generation for Health Care..., 2026).

   

   Os vetores gerados são armazenados em Bancos de Dados Vetoriais (Vector Databases), sistemas otimizados para realizar buscas de similaridade em milissegundos, mesmo em coleções com milhões de fragmentos. As soluções mais utilizadas incluem FAISS (biblioteca de código aberto do Facebook), ChromaDB e Pinecone. Frameworks de orquestração como LangChain e LlamaIndex simplificam a integração entre todos esses componentes, possibilitando o desenvolvimento ágil de pipelines RAG completos (pesquisa acadêmica, 2025).

   

      4. **Avaliação de Sistemas RAG: Framework RAGAS**

   	A avaliação de sistemas RAG em contextos médicos exige métricas específicas que vão além da acurácia tradicional. O framework RAGAS (Retrieval-Augmented Generation Assessment) estabelece um conjunto de métricas quantitativas para avaliar a qualidade do pipeline em suas dimensões de recuperação e geração (Es et al., 2023):

   

   \- Fidelidade (Faithfulness): Verifica se a resposta gerada está estritamente fundamentada nos documentos recuperados, sem introdução de informações externas. Em contextos clínicos, o alvo é superior a 0,95.

   \- Relevância da Resposta (Answer Relevancy): Mensura se a resposta de fato resolve a dúvida formulada pelo usuário. Alvo recomendado: acima de 0,85.

   \- Precisão de Contexto (Context Precision): Avalia se os fragmentos recuperados são genuinamente úteis para a resposta. Alvo: superior a 0,89.

   \- Revocação de Contexto (Context Recall): Mede se toda a informação necessária para responder à pergunta foi localizada e recuperada. Alvo: superior a 0,90.

   

   Sistemas de ponta, como o MEGA-RAG, demonstraram redução de taxas de alucinação superior a 40% em comparação com modelos padrão, consolidando a arquitetura como viável para ambientes de alta responsabilidade clínica (PLOS COMPUTATIONAL BIOLOGY, 2025).

   

   4. ##  **ESTADO DA ARTE** {#estado-da-arte}

A aplicação de IA no setor da saúde tem uma trajetória que se estende por mais de seis décadas. Na década de 1960, o robô Shakey demonstrou que máquinas poderiam interpretar instruções e executar ações físicas. Em 1971, o INTERNIST-1 transpôs essa capacidade para o raciocínio diagnóstico. Em 1977, o MYCIN refinou o paradigma com recomendações farmacológicas baseadas em regras. A partir de 2007, sistemas como o Watson, com sua arquitetura DeepQA, começaram a aceitar dados heterogêneos e produzir respostas complexas, chegando à identificação de proteínas de RNA associadas à esclerose lateral amiotrófica em 2017 (Bakkar et al., 2018).

O salto qualitativo mais recente ocorreu com os LLMs e a arquitetura RAG. Em 2025, ferramentas como UpToDate ExpertAI e Dyna AI foram integradas a fluxos de trabalho hospitalares, utilizando recuperação sobre bases documentais curadas para fornecer respostas seguras e rastreáveis (IatroX, 2025). O estudo de Yang et al. demonstrou que sistemas RAG melhoram a equidade no atendimento ao fornecer conhecimento especializado para médicos em regiões remotas, onde o acesso a especialistas é limitado. Na ortopedia, chatbots baseados em RAG atingiram precisão superior a 86% na educação de pacientes, reduzindo a carga administrativa de cirurgiões (IMPROVING..., 2026).

1. IA Aplicada à Hanseníase

   	A primeira onda de iniciativas de IA aplicadas à hanseníase, na década de 2010, concentrou-se exclusivamente em diagnóstico por imagem. Em 2013, trabalhos paralelos desenvolveram algoritmos de reconhecimento de textura — como o WLDRI (Weber Local Texture Descriptor Rotation Invariant) — aplicados a máquinas de vetores de suporte (SVM), mas sofreram com conjuntos de dados pequenos e desbalanceados (Pal et al., 2013; Das et al., 2013). Em 2016, uma das primeiras CNNs dedicadas à hanseníase foi treinada com apenas 120 imagens, revelando as limitações do deep learning diante da escassez de dados (Baweja; Parhar, 2016).

   

   A partir de 2019, estratégias para contornar a falta de dados ganharam protagonismo. Um estudo integrou RF com marcadores moleculares (qPCR e ELISA), obtendo alta sensibilidade e especificidade, mas dependendo de infraestrutura laboratorial sofisticada (Gama et al., 2019). Em 2022, o AI4Leprosy combinou 1.229 imagens com metadados clínicos em um modelo logístico multimodal, elevando a especificidade diagnóstica, mas admitindo queda de desempenho significativa na transferência entre populações (Barbieri et al., 2022). Simões et al. (2025) desenvolveram o MaLeSQs, uma versão em machine learning do Questionário de Suspeita de Hanseníase (LSQ), com sensibilidade de 85,7% para triagem em comunidades vulneráveis.

   

   Em sua revisão sistemática, Fernandes et al. (2024) mapearam a produção científica de IA aplicada à hanseníase e identificaram que a vasta maioria dos estudos foca em diagnóstico por imagem, com poucos trabalhos explorando dados tabulares e nenhum utilizando arquiteturas de PLN para apoio ao raciocínio clínico textual — confirmando a lacuna que esta pesquisa se propõe a preencher.

   5. ##  **TRABALHOS RELACIONADOS** {#trabalhos-relacionados}

Esta seção apresenta os trabalhos mais diretamente relacionados ao desenvolvimento de sistemas RAG para saúde, bem como estudos de IA aplicados à hanseníase com abordagens distintas da visão computacional, demonstrando a viabilidade e a relevância do campo.

**Tabela 1 – Trabalhos relacionados ao sistema proposto**

| Título | Autor(es) | Resumo | Resultados |
| ----- | :---: | ----- | ----- |
| Benchmarking Retrieval-Augmented Generation for Medicine | Xiong et al. (2024) | Estudo sistemático sobre RAG em perguntas médicas, com benchmark próprio (MIRAGE) e comparação entre múltiplos corpora, retrievers e LLMs. | Mostra que a recuperação documental é tão decisiva quanto o gerador; sustenta o uso de recuperação híbrida, escolha criteriosa de corpus e avaliação controlada do pipeline RAG. |
| Large Language Models in Medicine | Thirunavukarasu et al. (2023) | Revisão ampla sobre o uso de LLMs na medicina, discutindo benefícios e riscos clínicos. | Fundamenta a necessidade de rastreabilidade, atualização de conhecimento e mitigação de alucinações, justificando a adoção de RAG em vez de LLM “puro”. |
| Artificial Intelligence Applied to Leprosy: A Systematic Literature Review | Fernandes et al. (2024) | Revisão sistemática da literatura de IA aplicada à hanseníase. | Evidencia que a maior parte dos estudos se concentra em imagem e classificação, deixando aberta uma lacuna para sistemas textuais de apoio ao raciocínio clínico. |
| AI4Leprosy: Combining Clinical Metadata and Images for Leprosy Diagnosis | Barbieri et al. (2022) | Propõe abordagem multimodal com metadados clínicos e imagens para diagnóstico da hanseníase. | Mostra viabilidade prática do uso de IA no domínio da hanseníase e ajuda a posicionar o seu TCC como avanço em direção ao suporte textual-clínico, e não apenas ao diagnóstico por imagem. |
| Machine Learning for Leprosy Diagnosis Combining Serology and qPCR | Gama et al. (2019) | Estudo de aprendizado de máquina aplicado ao diagnóstico da hanseníase com dados laboratoriais. | Reforça a viabilidade de modelos computacionais no domínio clínico da hanseníase, embora dependa de infraestrutura laboratorial não disponível na atenção primária. |
| Development and Validation of a Machine Learning Approach for Screening New Leprosy Cases Based on the Leprosy Suspicion Questionnaire | Simões et al. (2025) | Estudo de triagem de hanseníase com base em questionário clínico e aprendizado de máquina. | Aproxima o campo do seu problema real de APS e mostra que dados sintomáticos e textuais/semiestruturados podem apoiar triagem clínica fora da lógica exclusivamente imagética. |

Fonte: Elaboração própria (2026).

O trabalho de Xiong et al. (2024) é o mais diretamente análogo ao sistema proposto: ao demonstrar que a qualidade do módulo de recuperação é tão crítica quanto o modelo gerador, ele fundamenta as decisões de chunking semântico e hybrid search que este projeto adotará. A revisão de Thirunavukarasu et al. (2023) fornece o embasamento ético e técnico que justifica a escolha da arquitetura RAG em detrimento do uso direto de LLMs genéricos. Zhang et al. (2023) valida metodologicamente a abordagem de fragmentação e indexação de documentos PDF de diretrizes clínicas — o que é exatamente o que este trabalho realizará com o PCDT da Hanseníase. Simões et al. (2025) e Andrade et al. (2024) situam este projeto no contexto da produção nacional de IA para hanseníase, evidenciando que o foco em raciocínio clínico textual representa uma contribuição original em relação ao que já foi desenvolvido. Por fim, Yang et al. (2024) reforçam a dimensão de equidade em saúde que motiva a escolha de um sistema voltado à atenção primária em um país de desigualdades regionais acentuadas.

 											

3. ##   **METODOLOGIA** {#metodologia}

Esta pesquisa caracteriza-se como aplicada, de natureza tecnológica e abordagem predominantemente experimental, pois visa ao desenvolvimento e à avaliação de um sistema computacional de apoio à decisão clínica baseado na arquitetura Retrieval-Augmented Generation (RAG), direcionado ao domínio da hanseníase. Do ponto de vista dos objetivos, o estudo possui caráter exploratório e descritivo, uma vez que busca, simultaneamente, compreender a viabilidade da aplicação de RAG em um contexto clínico específico e descrever o comportamento do sistema desenvolvido diante de consultas relacionadas ao diagnóstico e ao manejo da doença. 

	Arquitetura do Sistema e Tecnologias Adotadas  
Para viabilizar a implantação e a escalabilidade do sistema em cenários reais de atenção primária, a solução foi concebida sob uma arquitetura de microsserviços. A interface de usuário (Front-end) será desenvolvida em Flutter, permitindo a geração de aplicações móveis multiplataforma com alta responsabilidade e fluidez, o que garante acessibilidade a partir de dispositivos móveis para os profissionais durante os atendimentos. A orquestração das requisições, a comunicação com o banco de dados vetorial e a interface com a API do modelo de linguagem (LLM) serão gerenciadas por um Back-end robusto implementado em Node.js com TypeScript e arquitetado sobre Java Spring Boot para microsserviços que demandem alta concorrência. Essa separação estrutural assegura que a complexidade do pipeline RAG fique isolada no servidor, entregando respostas rápidas ao aplicativo na ponta.

O desenvolvimento da pesquisa será organizado em etapas. Na primeira etapa, será realizada a curadoria da base de conhecimento, composta por documentos oficiais e literatura científica pertinente ao tema. Serão priorizados, como fontes primárias, o Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase, manuais técnicos do Ministério da Saúde, documentos da Organização Mundial da Saúde e artigos científicos publicados em veículos reconhecidos. Nessa fase, serão definidos critérios de inclusão, exclusão, atualização e confiabilidade dos documentos, de modo a assegurar que a base utilizada pelo sistema reflita conhecimento técnico atual, rastreável e aderente ao contexto da atenção primária à saúde. 

Na segunda etapa, os documentos selecionados serão submetidos a um processo de preparação textual, envolvendo extração do conteúdo, normalização, remoção de ruídos e segmentação em fragmentos semanticamente coerentes. A estratégia de fragmentação será definida com o objetivo de preservar a integridade das orientações clínicas e evitar que trechos normativos sejam separados de seu contexto original. Em seguida, tais fragmentos serão convertidos em embeddings e indexados em uma base vetorial, possibilitando a recuperação semântica de trechos relevantes a partir das consultas dos usuários. Considerando os achados de Xiong et al. sobre o impacto do retriever e da composição do corpus no desempenho de sistemas RAG para medicina, será adotada uma estratégia de recuperação que priorize robustez documental e, quando tecnicamente viável, combine busca semântica com mecanismos lexicais complementares. 

Na terceira etapa, será implementado o pipeline de geração. A consulta do usuário será processada pelo módulo de recuperação, que retornará os fragmentos mais relevantes da base. Esses trechos serão então incorporados ao prompt do modelo gerador, que deverá produzir respostas contextualizadas, fundamentadas e acompanhadas da indicação das fontes utilizadas. O sistema será instruído a restringir sua resposta ao conteúdo recuperado e a explicitar insuficiência de evidências sempre que a consulta ultrapassar a cobertura documental da base, buscando reduzir o risco de respostas especulativas ou não fundamentadas. 

Ademais, no escopo da interação do usuário com o sistema, serão estabelecidas e documentadas diretrizes rígidas de segurança da informação em conformidade com a Lei Geral de Proteção de Dados (LGPD). A interface instruirá ativamente os profissionais de saúde a utilizarem técnicas de anonimização, não inserindo Dados Pessoais ou Dados Pessoais Sensíveis (como nomes, CPFs ou prontuários identificáveis) nas consultas submetidas ao prompt, garantindo que o fluxo de dados processado pelas APIs externas preserve o sigilo médico e a privacidade do paciente.

Na quarta etapa, será conduzida a avaliação do sistema. Para isso, será construído um conjunto de consultas representativas do contexto clínico da hanseníase na atenção primária, contemplando dúvidas sobre sinais e sintomas, classificação operacional, condutas terapêuticas, episódios reacionais, encaminhamento e acompanhamento do paciente. O desempenho será analisado em duas dimensões complementares: a recuperação e a geração. Na dimensão de recuperação, será observado se os documentos retornados são suficientes e pertinentes à pergunta formulada. Na dimensão de geração, será verificado se a resposta é relevante, fiel ao contexto recuperado e adequada ao problema clínico apresentado. Para operacionalizar essa avaliação, poderão ser utilizadas métricas como fidelidade, relevância da resposta, precisão de contexto e revocação de contexto, além de análise qualitativa dos resultados produzidos.

Por fim, a quinta etapa consistirá na análise crítica dos resultados e na identificação das limitações do sistema. Serão discutidos aspectos como cobertura da base de conhecimento, sensibilidade a consultas ambíguas, possíveis falhas de recuperação, dependência da qualidade documental e restrições inerentes ao uso de modelos de linguagem em contexto clínico. Essa análise permitirá não apenas avaliar a viabilidade da solução proposta, mas também indicar melhorias futuras e cuidados necessários para uma eventual adoção prática em ambientes de saúde.

4. ##  **RESULTADOS ESPERADOS** {#resultados-esperados}

Espera-se que o sistema desenvolvido seja capaz de fornecer respostas mais precisas, contextualizadas e rastreáveis do que interações realizadas com modelos de linguagem sem ancoragem documental, especialmente em perguntas relacionadas ao diagnóstico clínico, à classificação operacional e ao manejo inicial da hanseníase na atenção primária. Espera-se, ainda, que o uso de uma base curada de documentos oficiais reduza a ocorrência de informações não fundamentadas e aumente a confiabilidade das respostas ofertadas ao profissional de saúde.

Também se espera demonstrar a viabilidade técnica da arquitetura RAG como mecanismo de apoio ao raciocínio clínico em doenças tropicais negligenciadas, contribuindo para preencher uma lacuna observada na literatura, que historicamente concentra os estudos de IA em hanseníase em classificação e visão computacional, com menor atenção a sistemas textuais de apoio à decisão. Nesse sentido, o trabalho pretende oferecer uma contribuição original ao aproximar inteligência artificial generativa, saúde pública e conhecimento clínico oficial em língua portuguesa. 

Adicionalmente, espera-se que os resultados evidenciem quais escolhas arquiteturais influenciam mais fortemente o desempenho do sistema, como estratégia de fragmentação, qualidade do corpus, método de recuperação e forma de construção do prompt. Mesmo que o sistema não elimine integralmente riscos de erro, o estudo deverá indicar um conjunto de boas práticas para sistemas de apoio clínico fundamentados em documentos oficiais, o que poderá subsidiar pesquisas futuras no domínio da hanseníase e em outras condições negligenciadas.

5. ## **CRONOGRAMA** {#cronograma}

| Atividades | Jul | Ago | Set | Out | Nov | Dez |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Revisão bibliográfica final e consolidação do referencial teórico | X | X |  |  |  |  |
| Curadoria e organização da base de conhecimento | X | X | X |  |  |  |
| Pré-processamento documental, *chunking* e indexação vetorial |  |  | X | X |  |  |
| Implementação do pipeline RAG |  |  |  | X | X | X |
| Definição dos casos de teste e instrumentos de avaliação |  |  | X | X |  |  |
| Execução dos experimentos e ajustes de arquitetura |  |  |  |  | X | X |
| Análise dos resultados e discussão |  |  |  |  |  | X |
| Redação da versão final da monografia |  |  |  | X | X | X |
| Revisão ABNT, correções formais e preparação para defesa |  |  |  |  | X | X |

6. ## **CONCLUSÃO** 

A hanseníase permanece como um importante problema de saúde pública no Brasil, especialmente em regiões marcadas por desigualdades no acesso a serviços especializados e por dificuldades no diagnóstico e manejo precoce da doença. Embora existam protocolos clínicos consolidados e diretrizes oficiais para orientar a atuação dos profissionais de saúde, a aplicação prática desse conhecimento ainda enfrenta limitações, principalmente na Atenção Primária à Saúde, onde muitos atendimentos iniciais são realizados por equipes generalistas. Nesse contexto, o uso de tecnologias baseadas em Inteligência Artificial representa uma oportunidade relevante para ampliar o acesso a informações clínicas qualificadas, atualizadas e rastreáveis.

Este trabalho teve como proposta o desenvolvimento de um sistema de apoio à decisão clínica baseado na arquitetura de Recuperação Aumentada por Geração, direcionado ao domínio da hanseníase. Diferentemente de modelos de linguagem utilizados de forma genérica, a abordagem RAG permite que as respostas sejam fundamentadas em uma base de conhecimento previamente curada, composta por documentos oficiais, protocolos do Ministério da Saúde, materiais da Organização Mundial da Saúde e literatura científica relevante. Dessa forma, busca-se reduzir o risco de respostas imprecisas ou não fundamentadas, ao mesmo tempo em que se preserva a rastreabilidade das informações apresentadas ao usuário.

Do ponto de vista da Engenharia de Software, a pesquisa contribui ao propor uma arquitetura capaz de integrar recuperação semântica, indexação vetorial, processamento de linguagem natural e geração de respostas em um fluxo voltado a um problema real da saúde pública. Além disso, o trabalho se diferencia ao direcionar o uso de IA generativa para uma doença tropical negligenciada, campo em que a literatura ainda se concentra majoritariamente em aplicações de visão computacional e classificação de dados, deixando espaço para soluções voltadas ao raciocínio clínico textual e ao apoio à conduta profissional.

Espera-se que o sistema desenvolvido possa auxiliar profissionais da Atenção Primária na consulta a informações sobre sinais e sintomas, classificação operacional, tratamento, episódios reacionais, acompanhamento e critérios de encaminhamento relacionados à hanseníase. Ainda que a ferramenta não tenha a finalidade de substituir o julgamento clínico ou a atuação do profissional de saúde, ela pode funcionar como um recurso complementar de apoio, contribuindo para maior segurança, agilidade e padronização no acesso ao conhecimento técnico.

Reconhece-se, entretanto, que a aplicação de modelos de linguagem em contextos clínicos exige cautela. A qualidade das respostas depende diretamente da curadoria da base documental, da estratégia de fragmentação dos textos, da eficiência do mecanismo de recuperação e da forma como o modelo gerador utiliza os contextos recuperados. Por isso, a avaliação do sistema por meio de métricas específicas, como fidelidade, relevância da resposta, precisão de contexto e revocação de contexto, é essencial para identificar limitações, riscos e oportunidades de melhoria.

Conclui-se, portanto, que o desenvolvimento de um sistema RAG para apoio à decisão clínica em hanseníase representa uma contribuição relevante tanto do ponto de vista tecnológico quanto social. Ao unir Inteligência Artificial, Engenharia de Software e saúde pública, este trabalho busca contribuir para a construção de ferramentas mais seguras, acessíveis e alinhadas às necessidades do Sistema Único de Saúde. Como trabalhos futuros, recomenda-se a ampliação da base de conhecimento, a validação do sistema com profissionais da área da saúde, a realização de testes em cenários reais ou simulados de atendimento e o aprimoramento contínuo da arquitetura, visando aumentar a confiabilidade e a utilidade prática da solução proposta.


## **REFERÊNCIAS**

ANDRADE et al. Health Guardian – A inteligência artificial a serviço do tratamento das doenças tropicais negligenciadas. 2024\.

BAKKAR, N. et al. Artificial intelligence in neurodegenerative disease research: use of IBM Watson to identify additional RNA-binding proteins altered in amyotrophic lateral sclerosis. Acta Neuropathologica, v. 135, n. 2, p. 227–247, 2018\.

BARBIERI, R. R. et al. AI4Leprosy: combining clinical metadata and images for leprosy diagnosis. PLOS Neglected Tropical Diseases, 2022\.

BAWEJA, H.; PARHAR, T. A convolutional neural network for leprosy skin lesion detection. In: IEEE International Conference on Bioinformatics and Biomedicine, 2016\.

COSTA, A. F. et al. Epidemiological, clinical and social aspects of leprosy in Brazil. Cadernos de Saúde Pública, 2020\.

ES, S. et al. RAGAS: Automated evaluation of retrieval augmented generation. arXiv preprint, 2023\.

FERNANDES, H. et al. Artificial intelligence applied to leprosy: a systematic literature review. PLOS Computational Biology, 2024\.

GAMA, R. S. et al. Machine learning for leprosy diagnosis combining serology and qPCR. PLOS Neglected Tropical Diseases, 2019\.

IMPROVING Retrieval Augmented Generation for Health Care by Fine-Tuning Clinical Embedding Models. Journal of Medical Internet Research, 2026\.

LEWIS, P. et al. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. In: Advances in Neural Information Processing Systems, v. 33, 2020\.

LOPES, L. et al. Hanseníase, estigma social e serviço social. Revista FT, 2020\.

MASSACHUSETTS General Hospital. DXplain: Clinical decision support system. Boston, 2025\.

MEDEIROS, B. Decreto nº 968 de 1962 e o fim do isolamento compulsório na hanseníase. História, Ciências, Saúde – Manguinhos, 2018\.

MILLER, R.; POPLE JR., H.; MYERS, J. INTERNIST-1, an experimental computer-based diagnostic consultant for general internal medicine. New England Journal of Medicine, v. 307, n. 8, p. 468–476, 1985\.

MINISTÉRIO DA SAÚDE. Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase. Brasília: CONITEC, 2022a.

MINISTÉRIO DA SAÚDE. Manual de Condutas para Hanseníase. Brasília, 2022b.

MINISTÉRIO DA SAÚDE. Hanseníase: histórico e aspectos gerais. Brasília, 2023\.

MINISTÉRIO DA SAÚDE. Boletim Epidemiológico de Hanseníase – número especial. Brasília, 2025\.

MINISTÉRIO DA SAÚDE. Boletim Epidemiológico de Hanseníase 2026 – número especial. Brasília, 2026\.

PALMEIRA, I. P. et al. Social impact of leprosy diagnosis. Revista Brasileira de Enfermagem, 2020\.

PAL, N. R. et al. WLDRI-based texture recognition for leprosy, tinea versicolor and vitiligo. 2013\.

PLOS COMPUTATIONAL BIOLOGY. MEGA-RAG: a retrieval-augmented generation framework with multi-source evidence. PMC, 2025\.

SHORTLIFFE, E. H. Computer-Based Medical Consultations: MYCIN. New York: Elsevier, 1977\.

SHORTLIFFE, E. H.; CIMINO, J. J. (Eds.). Biomedical Informatics: Computer Applications in Health Care and Biomedicine. 4\. ed. New York: Springer, 2014\.

SIMÕES, C. et al. Development and validation of a machine learning approach for screening new leprosy cases based on the leprosy suspicion questionnaire. PMC, 2025\.

THIRUNAVUKARASU, A. J. et al. Large language models in medicine. Nature Medicine, v. 29, p. 1930–1940, 2023\.

VASWANI, A. et al. Attention is all you need. In: Advances in Neural Information Processing Systems, 2017\.

WIRTH, Rüdiger; HIPP, Jochen. CRISP-DM: Towards a standard process model for data mining. In: MANCHESTER. PROCEEDINGS of the 4th international conference on the practical applications of knowledge discovery and data mining. \[S. l.: s. n.\], 2000\. v. 1, p. 29–39.

WORLD HEALTH ORGANIZATION. Ending the Neglect to Attain the Sustainable Development Goals: A Road Map for Neglected Tropical Diseases 2021–2030. Geneva: World Health Organization, 2020\. Electronic version. Licensed under CC BY-NC-SA 3.0 IGO. ISBN 978-92-4-001035-2.

WORLD HEALTH ORGANIZATION. Global leprosy (Hansen disease) update, 2023: Elimination of leprosy disease is possible – Time to act\! English. Weekly Epidemiological Record, World Health Organization, Geneva, v. 99, n. 37, p. 501–521, set. 2024\. ISSN 0049-8114. Disponível em: https\://iris.who.int/bitstream/handle/10665/378895/WER9937-501-521.pdf?sequence=1.

WORLD HEALTH ORGANIZATION. Global Report on Neglected Tropical Diseases 2025\. Geneva: WHO, 2025\.

XIONG, Guangzhi; JIN, Qiao; LU, Zhiyong; ZHANG, Aidong. Benchmarking Retrieval-Augmented Generation for Medicine. In: FINDINGS OF THE ASSOCIATION FOR COMPUTATIONAL LINGUISTICS: ACL 2024, 2024, Bangkok. Proceedings \[...\]. Bangkok: Association for Computational Linguistics, 2024\. p. 6233–6251. DOI: 10.18653/v1/2024.findings-acl.372.

YANG, M. et al. Retrieval-Augmented Generation in medicine: a scoping review of technical implementations, clinical applications, and ethical considerations. arXiv, 2024\.

YASIR, Rahat; RAHMAN, Md Ashiqur; AHMED, Nova. Dermatological disease detection using image processing and artificial neural network. In: IEEE. 8TH international conference on electrical and computer engineering. \[S. l.: s. n.\], 2014\. p. 687–690.

ZAFAR, Aziz et al. Machine learning-based risk factor analysis and prevalence prediction of intestinal parasitic infections using epidemiological survey data. PLOS Neglected Tropical Diseases, Public Library of Science San Francisco, CA USA, v. 16, n. 6, e0010517, 2022\.

ZHANG, L. et al. Retrieval-Augmented Generation for clinical guidelines: a case study on hypertension. 2023\.

ZHAO, Hongke et al. Comparative analysis of algorithmic approaches in ensemble learning: bagging vs. boosting. Scientific Reports, v. 15, n. 1, p. 34218, out. 2025\. Disponível em: https\://doi.org/10.1038/s41598-025-15971-0.

[image1]: <data:image/png;base64,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>