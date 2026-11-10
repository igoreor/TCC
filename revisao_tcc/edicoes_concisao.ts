// Edições da revisão de concisão do TCC (10/11/2026), aplicadas por avaliacao/tcc/aplicar_revisao.ts
// depois das edições da revisão acadêmica (edicoes.ts). Cada edição localiza o parágrafo pelo início
// do texto atual (sem marcação) e registra o motivo. Marcação do texto novo: *itálico*, `código`,
// [[realce amarelo]]; marcadores pendentes em [[[...]]], realçados com os colchetes.
// Critérios: remover repetição entre capítulos, explicações periféricas e números já apresentados em
// tabelas, sem alterar dados, métricas, critérios, parâmetros, citações essenciais ou conclusões.
// Remissões a figuras, quadros e tabelas usam a numeração anterior a estas edições; o aplicador as
// renumera quando uma ilustração é removida.
// Os textos gerados pela avaliação experimental (3.8, 5.4, 6.5) foram enxugados na própria origem
// (avaliacao/tcc/atualizar_tcc.ts e achados.json), para que sobrevivam à atualização dos números.
import type { Edicao } from '../avaliacao/tcc/aplicar_revisao';

export const edicoes: Edicao[] = [
  // -------------------------------------------------------------------------
  // Resumo e Abstract
  {
    id: 'C-001',
    secao: 'Resumo',
    motivo: 'Resumo com 459 palavras ocupava duas páginas (D-08); retira o detalhe de autenticação e da escala de 0 a 10, tratado no Capítulo 4, e condensa a descrição do sistema, mantendo problema, objetivo, método, resultados e marcação pendente.',
    tipo: 'substituir',
    antes: 'A hanseníase permanece como problema de saúde pública no Brasil',
    depois:
      'A hanseníase permanece como problema de saúde pública no Brasil, segundo país em número de casos novos da doença no mundo, com proporção crescente de casos multibacilares e de diagnósticos realizados com incapacidade física já instalada. Na atenção primária à saúde, a consulta a orientações técnicas durante o atendimento é uma necessidade recorrente, e os modelos de linguagem de grande escala podem localizar e sintetizar informação clínica, mas estão sujeitos a alucinações e não indicam a origem do que afirmam. Este trabalho apresenta o desenvolvimento do NexoHansen, um sistema de apoio informacional à decisão clínica em hanseníase baseado em Geração Aumentada por Recuperação (RAG), e o planejamento de uma avaliação comparativa entre respostas produzidas com e sem recuperação. A pesquisa, de natureza aplicada, seguiu a metodologia de pesquisa em ciência do design. O sistema combina a interpretação da pergunta no contexto da conversa, busca híbrida vetorial e textual com fusão por posição recíproca, regras explícitas de segurança aplicadas antes da geração, respostas restritas aos trechos recuperados, com citações verificadas e referências às páginas dos documentos de origem, e registro das consultas para auditoria, sobre uma base de cinco documentos oficiais do Ministério da Saúde e da Organização Mundial da Saúde, processados em 328 trechos. Uma avaliação técnica preliminar resultou na recusa de todas as perguntas, porque o limiar de relevância era incompatível com a escala de pontuação do provedor de *embeddings*, e motivou a reformulação da recuperação e das regras de segurança. Na nova avaliação, com 32 perguntas de referência, o sistema apresentou o comportamento esperado em todas as perguntas e recuperou a evidência em todas as que a possuem, e a comparação de seis configurações de modelo gerador levou à escolha do `gpt-6-luna`, de desempenho equivalente ao do modelo usado anteriormente e custo 41% menor. Uma avaliação experimental com 50 perguntas curadas, respondidas duas vezes e avaliadas de forma automatizada por um modelo de linguagem segundo rubrica fixa, indicou acurácia preliminar de 65,3%, nenhuma resposta com erro classificado como de potencial dano e desempenho inferior nas perguntas sobre tratamento; a revisão das respostas por especialista está em andamento. [[[ATUALIZAR APÓS A AVALIAÇÃO COMPARATIVA: síntese dos resultados obtidos com os participantes e conclusão principal, sem extrapolar para eficácia clínica.]]]'
  },
  {
    id: 'C-002',
    secao: 'Abstract',
    motivo: 'Correspondência com o resumo condensado (C-001).',
    tipo: 'substituir',
    antes: 'Leprosy remains a public health problem in Brazil',
    depois:
      'Leprosy remains a public health problem in Brazil, the country with the second highest number of new cases in the world, with a growing proportion of multibacillary cases and of diagnoses made after physical disability has already developed. In primary health care, consulting technical guidance during consultations is a recurring need, and large language models can locate and summarize clinical information, but they are prone to hallucinations and do not indicate the origin of their statements. This work presents the development of NexoHansen, an informational clinical decision support system for leprosy based on Retrieval-Augmented Generation (RAG), and the planning of a comparative evaluation between answers produced with and without retrieval. The research is applied in nature and followed the design science research methodology. The system combines question interpretation in the context of the conversation, hybrid vector and full-text search with reciprocal rank fusion, explicit safety rules applied before generation, answers restricted to the retrieved passages, with verified citations and references to the pages of the source documents, and query logging for auditing, over a base of five official documents from the Brazilian Ministry of Health and the World Health Organization, processed into 328 passages. A preliminary technical evaluation resulted in the refusal of all questions, because the relevance threshold was incompatible with the score scale of the embedding provider, and led to the redesign of retrieval and of the safety rules. In the new evaluation, with 32 reference questions, the system showed the expected behavior for all questions and retrieved the evidence for all questions that have it, and the comparison of six generator model configurations led to the choice of `gpt-6-luna`, with performance equivalent to that of the previously used model at a 41% lower cost. An experimental evaluation with 50 curated questions, answered twice and assessed automatically by a language model following a fixed rubric, indicated a preliminary accuracy of 65.3%, no answer with an error classified as potentially harmful, and lower performance on treatment questions; the review of the answers by a specialist is in progress. [[[ATUALIZAR APÓS A AVALIAÇÃO COMPARATIVA: traduzir para o inglês a síntese dos resultados e a conclusão incluídas no resumo.]]]'
  },

  // -------------------------------------------------------------------------
  // Capítulo 1 — Introdução
  {
    id: 'C-003',
    secao: '1',
    motivo: 'Abertura: começa pela doença, objeto do trabalho, e reduz a definição de DTN a uma oração.',
    tipo: 'substituir',
    antes: 'Entre as doenças infecciosas que afetam populações',
    depois:
      'A hanseníase é uma doença infecciosa crônica causada pelo *Mycobacterium leprae*, que acomete primariamente os nervos periféricos e a pele e pode resultar em incapacidades físicas permanentes quando o diagnóstico e o tratamento ocorrem tardiamente (Ministério da Saúde, 2022). A Organização Mundial da Saúde (OMS) a inclui entre as doenças tropicais negligenciadas (DTN), agravos que recebem atenção científica, política e financeira desproporcionalmente pequena diante da carga que impõem (World Health Organization, 2020a).'
  },
  {
    id: 'C-004',
    secao: '1',
    motivo: 'Lista de tarefas da APS reduzida às que o sistema apoia; mantém os dados do PCDT e a motivação.',
    tipo: 'substituir',
    antes: 'O diagnóstico da hanseníase é eminentemente clínico, e a maioria dos casos pode ser confirmada no nível',
    depois:
      'O diagnóstico da hanseníase é eminentemente clínico, e a maioria dos casos pode ser confirmada na Atenção Primária à Saúde (APS) (Ministério da Saúde, 2022). Cabe, portanto, a equipes generalistas reconhecer sinais iniciais, classificar os casos, acompanhar a poliquimioterapia, avaliar contatos e identificar episódios reacionais, tarefas cujas orientações estão consolidadas no Protocolo Clínico e Diretrizes Terapêuticas (PCDT) da Hanseníase, documento de 152 páginas (Ministério da Saúde, 2022). Consultar um documento dessa extensão durante o atendimento nem sempre é viável, o que torna pertinente investigar meios de localizar rapidamente a orientação aplicável a uma dúvida e de indicar de onde ela foi extraída.'
  },
  {
    id: 'C-005',
    secao: '1',
    motivo: 'Apresentação do sistema sem repetir o que o parágrafo sobre RAG já explica.',
    tipo: 'substituir',
    antes: 'Diante desse cenário, este trabalho desenvolve o NexoHansen',
    depois:
      'Este trabalho desenvolve o NexoHansen (nome provisório), um sistema de apoio informacional à decisão clínica em hanseníase baseado em RAG. O sistema recupera trechos de uma base de conhecimento curada, redige respostas restritas a esses trechos com indicação das fontes, recusa situações que exigem avaliação presencial, como pedidos de diagnóstico definitivo ou de prescrição, e registra cada consulta para auditoria. Ele não substitui o julgamento clínico e não foi validado para uso assistencial: nesta pesquisa, é o artefato por meio do qual se investiga como uma arquitetura RAG pode ser projetada para esse domínio e como suas respostas são avaliadas em comparação com as de um modelo de linguagem sem recuperação.'
  },
  {
    id: 'C-006',
    secao: '1.2',
    motivo: 'Justificativa social sem repetir o diagnóstico na APS, já apresentado na contextualização.',
    tipo: 'substituir',
    antes: 'A hanseníase representa um problema de saúde pública persistente',
    depois:
      'Como o diagnóstico da hanseníase pode ser confirmado, na maioria dos casos, na própria APS (Ministério da Saúde, 2022), a qualidade da informação técnica disponível para as equipes generalistas influencia a capacidade de reconhecer a doença, classificar os casos e identificar situações que exigem encaminhamento. Ferramentas que facilitem o acesso a orientações oficiais, com indicação clara de sua origem, têm, portanto, relevância potencial para uma doença que afeta de forma desproporcional populações em situação de vulnerabilidade (World Health Organization, 2020a; Ministério da Saúde, 2026).'
  },
  {
    id: 'C-007',
    secao: '1.2',
    motivo: 'Mesmo argumento em menos palavras; as três características do problema e suas fontes foram mantidas.',
    tipo: 'substituir',
    antes: 'Do ponto de vista técnico, a pertinência de investigar',
    depois:
      'Do ponto de vista técnico, três características do problema justificam investigar uma arquitetura RAG. A primeira é a necessidade de fundamentação: em saúde, uma resposta só é útil se puder ser conferida, o que exige recuperar trechos de uma base curada e indicar de quais deles a resposta foi derivada (Lewis *et al.*, 2020; Zakka *et al.*, 2024). A segunda é a necessidade de tratar situações de risco, como pedidos de diagnóstico definitivo ou de prescrição e perguntas que envolvem gestantes, crianças ou sinais de urgência, com recusa explicada e orientação para avaliação presencial, e não com respostas geradas livremente. A terceira é a dependência da recuperação: as decisões sobre o corpus, o modelo de *embedding* e o método de recuperação influenciam fortemente o desempenho de sistemas RAG em medicina (Xiong *et al.*, 2024; Amugongo *et al.*, 2025), o que justifica examiná-las em um domínio específico e em língua portuguesa.'
  },
  {
    id: 'C-008',
    secao: '1.2',
    motivo: 'D-10: a constatação das revisões já aparece na contextualização e na Seção 2.7.2; a justificativa acadêmica passa a remeter a elas.',
    tipo: 'substituir',
    antes: 'Do ponto de vista acadêmico, a literatura de IA',
    depois:
      'Do ponto de vista acadêmico, um estudo que documente o projeto de um sistema RAG para uma DTN, em português, e que compare suas respostas com as de um modelo sem recuperação contribui para reduzir as lacunas discutidas na Seção 2.7: o foco da IA aplicada à hanseníase em triagem e diagnóstico e o predomínio do inglês e a atenção insuficiente à segurança nas pesquisas sobre RAG em saúde. Para a Engenharia de Software, o trabalho oferece um caso concreto de projeto de sistema baseado em modelos de linguagem em domínio sensível, no qual requisitos de rastreabilidade, segurança e testabilidade orientam a arquitetura.'
  },
  {
    id: 'C-009',
    secao: '1.2',
    motivo: 'Delimitação do alcance mantida e estendida às avaliações já executadas, em menos palavras.',
    tipo: 'substituir',
    antes: 'Cabe distinguir a relevância potencial da proposta',
    depois:
      'Cabe distinguir a relevância potencial da proposta das conclusões que ela pode sustentar. O sistema é um protótipo acadêmico, sem validação clínica, e suas avaliações medem o desempenho em conjuntos delimitados de perguntas e a percepção de participantes; não podem ser interpretadas como evidência de eficácia clínica, de segurança assistencial ou de superioridade em relação ao julgamento profissional.'
  },
  {
    id: 'C-010',
    secao: '1.3',
    motivo: 'Organização do trabalho sem repetir o sumário: o conteúdo de cada apêndice já está no título dele.',
    tipo: 'substituir',
    antes: 'Além desta introdução, o trabalho está organizado',
    depois:
      'Além desta introdução, o trabalho tem seis capítulos. O Capítulo 2 apresenta o referencial teórico; o Capítulo 3, a metodologia, com a avaliação técnica, a avaliação comparativa planejada e a avaliação experimental com perguntas curadas; o Capítulo 4, o sistema desenvolvido; o Capítulo 5, os resultados disponíveis, inclusive os preliminares da avaliação experimental; o Capítulo 6, a discussão e as limitações; e o Capítulo 7, as considerações finais. Os apêndices reúnem os conjuntos de perguntas, os resultados por pergunta e os instrumentos das avaliações.'
  },

  // -------------------------------------------------------------------------
  // Capítulo 2 — Referencial teórico
  {
    id: 'C-011',
    secao: '2 (abertura)',
    motivo: 'Mesma orientação de leitura em cerca de metade das palavras.',
    tipo: 'substituir',
    antes: 'Este capítulo reúne os conceitos de que dependem',
    depois:
      'Este capítulo reúne os conceitos de que dependem o problema, o projeto do sistema e sua avaliação. A Seção 2.1 caracteriza a hanseníase e as decisões clínicas que exigem a consulta a orientações técnicas; as Seções 2.2 e 2.3 situam o sistema entre os sistemas de apoio à decisão clínica e os modelos de linguagem; as Seções 2.4 e 2.5 fundamentam o *pipeline* descrito no Capítulo 4; a Seção 2.6 trata dos métodos de avaliação usados nos Capítulos 3 e 5; e as Seções 2.7 e 2.8, dos trabalhos com os quais esta pesquisa se compara.'
  },
  {
    id: 'C-012',
    secao: '2.1.1',
    motivo: 'Transmissão e incubação em uma frase; detalhes que o sistema não usa foram retirados.',
    tipo: 'substituir',
    antes: 'A hanseníase é causada pelo Mycobacterium leprae, bacilo',
    depois:
      'A hanseníase é causada pelo *Mycobacterium leprae*, bacilo que acomete primariamente os nervos periféricos e a pele. A principal fonte de infecção são pessoas com a doença não tratada e alta carga bacilar, que eliminam o bacilo pelas vias aéreas superiores; a transmissão ocorre pelo contato direto pessoa a pessoa, facilitado pelo convívio de doentes não tratados com pessoas suscetíveis, e o período de incubação, estimado em cinco anos, em média, pode ultrapassar 20 anos (Ministério da Saúde, 2022).'
  },
  {
    id: 'C-013',
    secao: '2.1.1',
    motivo: 'Mantém a classificação operacional e a divergência OMS × literatura brasileira, que o sistema e a avaliação usam; retira a enumeração das formas clínicas, sem uso posterior.',
    tipo: 'substituir',
    antes: 'A classificação operacional, usada para definir o esquema',
    depois:
      'A classificação operacional, que define o esquema terapêutico, considera o número de lesões cutâneas e a baciloscopia: o caso paucibacilar (PB) apresenta de uma a cinco lesões cutâneas e baciloscopia obrigatoriamente negativa; o multibacilar (MB), mais de cinco lesões de pele e/ou baciloscopia positiva, e os casos que suscitem dúvida devem ser tratados como multibacilares (Ministério da Saúde, 2022). O comprometimento de nervos periféricos é um ponto de divergência entre as fontes oficiais: há consenso em classificar como MB os casos com mais de um nervo comprometido, mas, para um único nervo, a OMS recomenda a classificação multibacilar, enquanto a literatura brasileira o descreve na forma tuberculoide, reconhecida como paucibacilar (Ministério da Saúde, 2022). Para um sistema que consulta documentos das duas instituições, divergências desse tipo exigem que a resposta indique qual orientação se aplica à prática no Brasil (Seção 4.5.6).'
  },
  {
    id: 'C-014',
    secao: '2.1.2',
    motivo: 'Mesmo conteúdo em frases mais diretas; "eminentemente clínico" e a confirmação na APS já constam da Introdução.',
    tipo: 'substituir',
    antes: 'O diagnóstico da hanseníase é eminentemente clínico e baseia-se',
    depois:
      'O diagnóstico baseia-se no exame dermatoneurológico, com a identificação de lesões de pele com alteração de sensibilidade e do comprometimento de nervos periféricos (Ministério da Saúde, 2022). A baciloscopia é um exame complementar e, como é negativa por definição nos casos paucibacilares, um resultado negativo não afasta a doença. O Brasil foi o primeiro país a incorporar ao Sistema Único de Saúde (SUS) um teste rápido para detecção de anticorpos contra o *M. leprae*, indicado como apoio na avaliação de contatos (Ministério da Saúde, 2022).'
  },
  {
    id: 'C-015',
    secao: '2.1.2',
    motivo: 'Esquema da PQT-U e manejo das reações em menos palavras, com os dados do PCDT preservados.',
    tipo: 'substituir',
    antes: 'O tratamento de primeira linha é a poliquimioterapia (PQT)',
    depois:
      'O tratamento de primeira linha é a poliquimioterapia (PQT), associação de rifampicina, dapsona e clofazimina que leva à cura em até 98% dos casos tratados, com baixa taxa de recidiva. Na poliquimioterapia única (PQT-U), o tratamento é interrompido após seis doses mensais supervisionadas, administradas em até nove meses, nos casos PB, e após doze doses, em até dezoito meses, nos MB (Ministério da Saúde, 2022). As reações hansênicas, respostas imunológicas exacerbadas que podem surgir durante ou após o tratamento, são manejadas com medicamentos como os corticosteroides e a talidomida, com atenção a eventos adversos e a contraindicações: a talidomida, por exemplo, nunca deve ser indicada para mulheres grávidas, em virtude de seu efeito teratogênico (Ministério da Saúde, 2022).'
  },
  {
    id: 'C-016',
    secao: '2.1.2',
    motivo: 'Premissa da pesquisa mantida, com o aviso de que não foi medida, em uma frase só.',
    tipo: 'substituir',
    antes: 'Da suspeição à classificação e do esquema terapêutico',
    depois:
      'Essas decisões dependem de orientações distribuídas ao longo de um protocolo de 152 páginas e de documentos da OMS que nem sempre coincidem com ele. Este trabalho parte da premissa, não medida nesta pesquisa, de que localizar a orientação pertinente a uma dúvida específica, e identificar o documento de onde ela provém, é uma necessidade de informação das equipes da APS; a avaliação com participantes (Seção 3.6) examina como as respostas do sistema são percebidas, e não a frequência ou a natureza das dúvidas no atendimento.'
  },
  {
    id: 'C-017',
    secao: '2.1.3',
    motivo: 'Mesmo conteúdo e fontes, sem a frase de abertura genérica.',
    tipo: 'substituir',
    antes: 'Além das manifestações biológicas, a hanseníase carrega',
    depois:
      'A hanseníase tem também uma dimensão social marcada pelo estigma. A Lei nº 9.010, de 1995, estabeleceu a terminologia oficial relativa à doença, vedando o uso do termo "lepra" e de seus derivados nos documentos oficiais (Brasil, 1995), mas o preconceito persiste e pode levar ao isolamento social das pessoas afetadas (Lopes *et al.*, 2020), que relatam alterações em necessidades sociais e de estima associadas à doença (Palmeira *et al.*, 2020). Para um sistema de informação, essa dimensão exige linguagem adequada e cuidado na comunicação, aspecto considerado na categoria de perguntas psicossociais (Seção 4.5.2).'
  },
  {
    id: 'C-018',
    secao: '2.2',
    motivo: 'O histórico do INTERNIST-I e do MYCIN, em parágrafo próprio, passa a uma frase que o liga à distinção de Sutton et al.; as duas fontes foram mantidas.',
    tipo: 'substituir',
    antes: 'Sistemas de apoio à decisão clínica (CDSS',
    depois:
      'Sistemas de apoio à decisão clínica (CDSS, do inglês *clinical decision support systems*) são ferramentas computacionais que oferecem a profissionais de saúde conhecimento e informações filtradas ou específicas para apoiar decisões no cuidado (Sutton *et al.*, 2020; Shortliffe; Cimino, 2014). Sutton *et al.* (2020) distinguem os sistemas baseados em conhecimento, que aplicam regras explícitas derivadas da literatura ou de especialistas, dos não baseados em conhecimento, que usam aprendizado de máquina ou outras técnicas estatísticas. Os primeiros sistemas, como o INTERNIST-I, para o diagnóstico diferencial em clínica médica (Miller; Pople Jr.; Myers, 1985), e o MYCIN, para a antibioticoterapia (Shortliffe, 1977), pertenciam ao primeiro grupo e mostraram tanto a viabilidade de representar parte do raciocínio clínico quanto a dificuldade de manter bases de regras construídas manualmente.'
  },
  {
    id: 'C-019',
    secao: '2.2',
    motivo: 'Incorporado ao parágrafo anterior (C-018).',
    tipo: 'remover',
    antes: 'As primeiras iniciativas na área datam da década de 1970'
  },
  {
    id: 'C-020',
    secao: '2.2',
    motivo: 'Mesma análise dos riscos aplicáveis a um sistema informacional, em menos palavras.',
    tipo: 'substituir',
    antes: 'Sutton et al. (2020) também reúnem riscos que permanecem atuais',
    depois:
      'Sutton *et al.* (2020) também reúnem riscos que permanecem atuais, como a fadiga provocada pelo excesso de alertas, a dependência excessiva da ferramenta, a desatualização do conhecimento e a dificuldade de manutenção. Nem todos se aplicam a um sistema informacional como o deste trabalho, que não recebe dados de pacientes, não dispara alertas e não emite recomendações individualizadas. Para ele, os riscos pertinentes são a desatualização, pois as orientações mudam com a publicação de novas normas, e a dependência excessiva, que se agrava quando o usuário não consegue conferir a origem do que lê. Manter a base em documentos identificados por edição e citar a página de cada afirmação (Seções 3.3.2 e 4.5.6) são as decisões de projeto que respondem a esses dois riscos.'
  },
  {
    id: 'C-021',
    secao: '2.3',
    motivo: 'Retira a frase sobre a proposta de avaliações humanas, retomada na Seção 2.6.',
    tipo: 'substituir',
    antes: 'Na medicina, Singhal et al. (2023) mostraram',
    depois:
      'Na medicina, Singhal *et al.* (2023) mostraram que modelos dessa classe podem atingir desempenho elevado em perguntas de exames médicos, mas que suas respostas permaneciam inferiores às de clínicos quando avaliadas por especialistas em múltiplas dimensões. Thirunavukarasu *et al.* (2023) apontam aplicações promissoras, como o apoio à documentação e à educação, e riscos que limitam o uso clínico direto: informações incorretas apresentadas de forma convincente, ausência de indicação das fontes e conhecimento que não acompanha a atualização das diretrizes.'
  },
  {
    id: 'C-022',
    secao: '2.3',
    motivo: 'Mantém a distinção de Ji et al. e sua relação com o sistema e a avaliação; retira a frase genérica sobre a gravidade em saúde.',
    tipo: 'substituir',
    antes: 'A produção de conteúdo sem sustentação na entrada ou nos fatos',
    depois:
      'A produção de conteúdo sem sustentação na entrada ou nos fatos é tratada na literatura como alucinação. Ji *et al.* (2023) distinguem alucinações intrínsecas, que contradizem o conteúdo de origem, de alucinações extrínsecas, que acrescentam informações não verificáveis a partir dele. Em um sistema que responde a partir de trechos recuperados, a primeira aparece como afirmação que contradiz o trecho citado, e a segunda, como informação ausente dos trechos, por exemplo uma dose ou um prazo que o documento não menciona. As regras de geração do sistema procuram impedir a segunda (Seção 4.5.6), e ambas são registradas como alucinação na avaliação experimental (Seção 3.8.4).'
  },
  {
    id: 'C-023',
    secao: '2.4',
    motivo: 'Retira a frase de transição que apenas anunciava as subseções.',
    tipo: 'substituir',
    antes: 'Recuperação de informação é a tarefa de encontrar',
    depois:
      'Recuperação de informação é a tarefa de encontrar, em grandes coleções, material de natureza não estruturada, geralmente documentos de texto, que satisfaça uma necessidade de informação (Manning; Raghavan; Schütze, 2008). Em um sistema RAG, essa etapa condiciona a resposta: sem os trechos pertinentes, o modelo gerador não tem como fundamentá-la, e, com trechos inadequados, pode fundamentá-la em informação errada.'
  },
  {
    id: 'C-024',
    secao: '2.4.1',
    motivo: 'Detalhe de implementação do PostgreSQL reduzido ao necessário para entender a Seção 4.5.3.',
    tipo: 'substituir',
    antes: 'O PostgreSQL oferece recursos nativos de busca textual',
    depois:
      'No PostgreSQL, a busca textual completa (FTS, do inglês *full-text search*) converte documentos e consultas em lexemas, com dicionários por idioma, inclusive o português, e ordena os resultados por funções como a `ts_rank_cd`, que calcula a relevância por densidade de cobertura, considerando a proximidade entre os termos da consulta no documento (PostgreSQL Global Development Group, 2026; Clarke; Cormack; Tudhope, 2000). A recuperação lexical é eficaz para termos técnicos exatos, como "baciloscopia" ou "PQT-U", mas falha quando a pergunta usa vocabulário diferente do texto, como sinônimos e paráfrases.'
  },
  {
    id: 'C-025',
    secao: '2.4.2',
    motivo: 'Mesmo conteúdo e fontes em frases mais curtas.',
    tipo: 'substituir',
    antes: 'A qualidade da recuperação densa depende do modelo de embedding',
    depois:
      'A qualidade da recuperação densa depende do modelo de *embedding*. Há modelos especializados em textos biomédicos, como o BioBERT, pré-treinado em textos científicos da área e utilizável como base de codificadores de recuperação (Lee *et al.*, 2020), e modelos de propósito geral oferecidos como serviço, como o `text-embedding-3-small`, que produz vetores de 1.536 dimensões (OpenAI, 2024). O idioma também pesa: Yang *et al.* (2026) observam que as ferramentas de recuperação do RAG médico se apoiam sobretudo em modelos centrados no inglês, e Arzideh *et al.* (2026), ao ajustar um modelo multilíngue com documentos clínicos de um hospital alemão, relatam ganho na recuperação em relação ao modelo de partida. Este trabalho adotou um modelo de propósito geral, sem ajuste, com documentos e perguntas em português; o efeito dessa escolha é discutido na Seção 6.2.'
  },
  {
    id: 'C-026',
    secao: '2.4.2',
    motivo: 'pgvector em uma frase; a justificativa da escolha (um único banco) é retomada na Seção 3.4.',
    tipo: 'substituir',
    antes: 'Para armazenar e consultar embeddings, utilizam-se',
    depois:
      'O pgvector, extensão de código aberto do PostgreSQL, acrescenta o tipo `vector`, operadores de distância, entre eles a de cosseno, e índices para busca aproximada, como IVFFlat e HNSW (Kane, 2026), o que permite manter dados relacionais, texto indexado e vetores em um único banco de dados.'
  },
  {
    id: 'C-027',
    secao: '2.4.3',
    motivo: 'A constatação de Xiong et al. sobre corpus e recuperadores e a arquitetura do MEGA-RAG são apresentadas na Seção 2.7.2; aqui permanece apenas o conceito de recuperação híbrida e de RRF.',
    tipo: 'substituir',
    antes: 'Como as duas famílias de técnicas falham em situações diferentes',
    depois:
      'Como as duas famílias de técnicas falham em situações diferentes, é comum combiná-las em uma recuperação híbrida. A combinação pode ser feita pela soma ponderada das pontuações de cada método, o que exige que elas estejam em escalas comparáveis, ou por métodos baseados apenas na posição dos documentos em cada lista, como a fusão por posição recíproca (RRF, do inglês *reciprocal rank fusion*), que dispensa a calibração das escalas (Cormack; Clarke; Büttcher, 2009). Essa diferença explica parte dos resultados da avaliação preliminar (Seção 5.2.1).'
  },
  {
    id: 'C-028',
    secao: '2.4.3',
    motivo: 'Reordenação reduzida ao necessário para entender a versão anterior do sistema, que a usava.',
    tipo: 'substituir',
    antes: 'A reordenação (reranking) é uma segunda etapa',
    depois:
      'A reordenação (*reranking*) reavalia um conjunto menor de candidatos com critérios mais informativos que os da recuperação inicial, por modelos que estimam a relevância de pares pergunta-trecho, como os baseados em BERT (Nogueira; Cho, 2019), ou por regras do domínio. A versão atual do sistema não a utiliza: a reordenação por regras da primeira versão foi substituída pela RRF, pelos motivos descritos na Seção 4.9.'
  },
  {
    id: 'C-029',
    secao: '2.5',
    motivo: 'Mesmo conteúdo em duas frases.',
    tipo: 'substituir',
    antes: 'Lewis et al. (2020) propuseram a RAG como a combinação',
    depois:
      'Lewis *et al.* (2020) propuseram a RAG como a combinação de uma memória paramétrica, o modelo de linguagem pré-treinado, com uma memória não paramétrica, um índice de documentos acessado por um recuperador. Condicionar a geração a documentos recuperados torna as respostas mais específicas e factuais e permite atualizar o conhecimento pela substituição do índice, o que fez da técnica uma das principais formas de adaptar modelos de linguagem a domínios específicos (Gao *et al.*, 2023).'
  },
  {
    id: 'C-030',
    secao: '2.5.1',
    motivo: 'Frases mais diretas; conteúdo e fonte mantidos.',
    tipo: 'substituir',
    antes: 'Um sistema RAG compreende duas fases',
    depois:
      'Um sistema RAG compreende duas fases (Gao *et al.*, 2023). Na indexação, os documentos são extraídos, limpos e fragmentados em trechos (*chunks*), que são convertidos em *embeddings* e armazenados em um índice, frequentemente com metadados. A fragmentação influencia o resultado: trechos muito longos diluem a informação relevante, e trechos muito curtos perdem contexto, razão pela qual é comum adotar sobreposição entre trechos consecutivos e respeitar unidades do texto, como seções e listas (Gao *et al.*, 2023).'
  },
  {
    id: 'C-031',
    secao: '2.5.1',
    motivo: 'Mesma classificação de Gao et al. e mesmo enquadramento do sistema, em menos palavras.',
    tipo: 'substituir',
    antes: 'Na fase de inferência, a pergunta do usuário',
    depois:
      'Na inferência, a pergunta é convertida para o mesmo espaço de representação, e os trechos mais relevantes são recuperados e incorporados ao *prompt* do modelo gerador, que redige a resposta a partir deles. Gao *et al.* (2023) distinguem o RAG ingênuo, que segue esse fluxo básico; o avançado, que acrescenta etapas antes e depois da recuperação, como a reescrita da consulta e a reordenação; e o modular, organizado em componentes intercambiáveis. O sistema deste trabalho é um RAG avançado: antes da recuperação, a pergunta é interpretada e classificada; a recuperação combina buscas vetorial e textual; e uma camada de segurança, anterior à geração, decide se a pergunta pode ser respondida.'
  },
  {
    id: 'C-032',
    secao: '2.5.2',
    motivo: 'Os resultados do Almanac são detalhados na Seção 2.7.2; aqui fica a remissão.',
    tipo: 'substituir',
    antes: 'A fundamentação (grounding) designa',
    depois:
      'A fundamentação (*grounding*) designa a correspondência entre o conteúdo da resposta e as fontes recuperadas. Em saúde, ela se complementa pela rastreabilidade, isto é, a possibilidade de identificar quais trechos e documentos sustentaram cada resposta, tanto pelo usuário, que pode conferir a informação, quanto por quem audita o sistema. A recuperação em fontes médicas curadas melhora as respostas a perguntas clínicas (Zakka *et al.*, 2024; Seção 2.7.2), mas a citação de fontes não garante fidelidade: o modelo pode citar um trecho e afirmar algo que ele não sustenta, o que torna necessário avaliar a correspondência entre a resposta e as fontes (Es *et al.*, 2024).'
  },
  {
    id: 'C-033',
    secao: '2.5.3',
    motivo: 'Mesmo conteúdo em menos palavras.',
    tipo: 'substituir',
    antes: 'A RAG reduz, mas não elimina, os riscos',
    depois:
      'A RAG reduz, mas não elimina, os riscos discutidos na Seção 2.3: erros de recuperação propagam-se para a resposta, perguntas fora do escopo da base podem receber respostas apoiadas em trechos pouco relacionados, e o modelo gerador pode deixar de seguir as instruções do *prompt*. Esses riscos podem ser tratados por mecanismos externos ao modelo, como limiares mínimos de relevância, políticas de recusa para perguntas que exijam julgamento profissional, avisos sobre os limites da ferramenta e registro das interações para auditoria, aspectos que ainda recebem pouca atenção nos estudos sobre RAG em saúde (Seção 2.7.2).'
  },
  {
    id: 'C-034',
    secao: '2.5.3',
    motivo: 'Mesmo princípio e mesma implicação de privacidade, em frases mais curtas.',
    tipo: 'substituir',
    antes: 'Neste trabalho, adota-se o princípio de que as regras críticas',
    depois:
      'Neste trabalho, as regras críticas de segurança são implementadas em código, antes da geração, e não apenas descritas no *prompt*, pois instruções ao modelo orientam seu comportamento, mas não garantem que serão seguidas. Há também implicações de privacidade: como as perguntas podem ser enviadas a serviços externos de modelos de linguagem e são registradas para auditoria, o uso do sistema deve evitar dados pessoais de pacientes, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD) (Brasil, 2018).'
  },
  {
    id: 'C-035',
    secao: '2.6',
    motivo: 'Mesmas fontes e constatações em uma sequência mais direta.',
    tipo: 'substituir',
    antes: 'Em saúde, as métricas automáticas são frequentemente',
    depois:
      'Em saúde, as métricas automáticas são frequentemente complementadas por avaliação humana. Singhal *et al.* (2023) avaliaram respostas com médicos e leigos em dimensões como a concordância com o consenso científico, a possibilidade de dano e a presença de conteúdo inadequado ou incorreto, e Zakka *et al.* (2024) usaram um painel de profissionais para julgar factualidade, completude, preferência e segurança. Esse tipo de avaliação é custoso, difícil de repetir a cada alteração do sistema e não segue um *framework* padronizado (Amugongo *et al.*, 2025), e as avaliações humanas publicadas concentram-se em acurácia, completude, relevância e fluência, com atenção insuficiente a viés e segurança (Yang *et al.*, 2026).'
  },
  {
    id: 'C-036',
    secao: '2.6',
    motivo: 'Mantém as evidências de Zheng et al., Panickssery et al. e Cohen e o limite no domínio clínico; enxuga a redação.',
    tipo: 'substituir',
    antes: 'Uma alternativa intermediária entre as métricas automáticas',
    depois:
      'Uma alternativa intermediária é usar um modelo de linguagem como avaliador (*LLM-as-a-judge*), que julga as respostas segundo critérios explícitos. Zheng *et al.* (2023) verificaram que um modelo avaliador de grande porte alcançou concordância superior a 80% com preferências humanas, nível semelhante ao da concordância entre avaliadores humanos, mas identificaram vieses de posição, de verbosidade e de autofavorecimento. Panickssery, Bowman e Feng (2024) mostraram que modelos avaliadores reconhecem os próprios textos e tendem a avaliá-los melhor do que textos de outras fontes considerados equivalentes por avaliadores humanos. Esses resultados, obtidos em tarefas gerais, não autorizam substituir o julgamento clínico pelo de um modelo, pois a correção de uma resposta médica pode depender de conhecimento que o avaliador automático também não tem. Nesse domínio, a concordância com especialistas precisa ser medida, por exemplo pelo coeficiente kappa ponderado, que considera o grau de discordância entre categorias ordenadas (Cohen, 1968).'
  },
  {
    id: 'C-037',
    secao: '2.7.1',
    motivo: 'Os valores de desempenho de Barbieri et al. e Simões et al. estavam no texto e no Quadro 1; o texto mantém a comparação por tipo de dado e remete ao quadro para os números.',
    tipo: 'substituir',
    antes: 'Os estudos com resultados quantitativos diferem',
    depois:
      'Os estudos com resultados quantitativos diferem pelo tipo de dado e pela etapa do cuidado a que se dirigem. No diagnóstico por imagem, Barbieri *et al.* (2022) desenvolveram o AI4Leprosy, que combina imagens de lesões cutâneas e dados clínicos e demográficos de 222 pacientes de um centro de referência brasileiro, e apontam a necessidade de validação em populações com outros tipos de pele e com imagens de *smartphones*. Na triagem, Simões *et al.* (2025) aplicaram aprendizado de máquina ao Questionário de Suspeição de Hanseníase. Entre contatos domiciliares, Gama *et al.* (2019) combinaram análises moleculares e sorológicas com aprendizado de máquina para predizer o adoecimento, abordagem que depende de infraestrutura laboratorial. Os três trabalhos produzem uma classificação a partir de dados do paciente, e seu desempenho é medido por acurácia, sensibilidade e especificidade (Quadro 1). Mais próximo do apoio ao profissional, o Health Guardian, de Andrade *et al.* (2024), é um aplicativo colaborativo, em fase de prototipação, que aplica IA ao apoio à decisão sobre o tratamento de DTN, entre elas a hanseníase.'
  },
  {
    id: 'C-038',
    secao: '2.8',
    motivo: 'Os quatro aspectos de diferenciação em uma enumeração única, sem os ordinais repetidos.',
    tipo: 'substituir',
    antes: 'Em relação a esses trabalhos, o presente estudo diferencia-se',
    depois:
      'Em relação a esses trabalhos, o presente estudo diferencia-se em quatro aspectos: dirige-se ao apoio informacional em linguagem natural, e não à triagem, à classificação ou ao diagnóstico; opera em português, com documentos oficiais brasileiros e da OMS; trata a segurança como requisito de arquitetura, com regras de recusa implementadas em código, sinalização de risco e registro de cada consulta; e avalia respostas abertas, e não de múltipla escolha, por meio de perguntas curadas e de uma comparação planejada com participantes. Em comparação com Xiong *et al.* (2024) e Zakka *et al.* (2024), a base é restrita a cinco documentos, e a participação de especialistas limita-se, nesta versão, à revisão de uma amostra das respostas (Seção 3.8.4), limitação discutida no Capítulo 6.'
  },

  // -------------------------------------------------------------------------
  // Capítulo 3 — Metodologia
  {
    id: 'C-039',
    secao: '3 (abertura)',
    motivo: 'Mesma orientação de leitura em menos palavras.',
    tipo: 'substituir',
    antes: 'Este capítulo descreve os procedimentos adotados e planejados',
    depois:
      'Este capítulo descreve os procedimentos da pesquisa: sua caracterização e suas etapas (Seções 3.1 e 3.2), a construção da base de conhecimento e o desenvolvimento do sistema (Seções 3.3 e 3.4), a avaliação técnica do *pipeline*, que incluiu a escolha do modelo gerador (Seção 3.5), a avaliação comparativa com participantes, ainda não realizada (Seção 3.6), as ameaças à validade dessas avaliações (Seção 3.7) e a avaliação experimental com 50 perguntas curadas, cujas ameaças à validade são discutidas na Seção 6.5 (Seção 3.8). Os procedimentos executados são distinguidos dos planejados, e as decisões pendentes são indicadas nos pontos em que deverão ser registradas.'
  },
  {
    id: 'C-040',
    secao: '3.2',
    motivo: 'A descrição etapa por etapa repetia a Figura 1; o parágrafo passa a destacar os retornos entre etapas, que a figura não mostra.',
    tipo: 'substituir',
    antes: 'Na etapa 1, identificação do problema e motivação',
    depois:
      'As etapas 1 e 2 correspondem ao levantamento do problema (Capítulos 1 e 2) e à sua conversão em requisitos (Seção 4.1); a etapa 3, à construção da base de conhecimento, primeiro como um conjunto inicial de desenvolvimento e depois a partir de documentos oficiais, e à implementação do sistema (Seções 3.3 e 3.4); a etapa 4, à demonstração por meio da interface web; a etapa 5, às avaliações descritas nas Seções 3.5, 3.6 e 3.8; e a etapa 6, a esta monografia. Como prevê o processo de Peffers *et al.* (2007), a avaliação motivou retornos às etapas anteriores: a avaliação técnica preliminar levou à construção da base a partir de documentos oficiais, à reformulação da recuperação e à correção das regras de segurança (Seção 4.9), seguidas de nova avaliação técnica, que serviu também para escolher o modelo de linguagem (Seção 5.2); e o planejamento da avaliação comparativa levou à inclusão da autenticação dos usuários e do registro da avaliação das respostas (Seção 4.6).'
  },
  {
    id: 'C-041',
    secao: '3.3.1',
    motivo: 'Mesmo conteúdo em menos palavras.',
    tipo: 'substituir',
    antes: 'Para viabilizar o desenvolvimento e os testes do sistema antes',
    depois:
      'Para viabilizar o desenvolvimento antes da curadoria definitiva, foi construída uma base inicial com 15 trechos, organizados em 11 documentos lógicos sobre sinais e sintomas, diagnóstico clínico e diferencial, classificação operacional, baciloscopia, tratamento, medicamentos, reações hansênicas, prevenção de incapacidades, contatos e vigilância e a política de segurança do sistema (Apêndice B). Os trechos foram redigidos diretamente no formato de linhas JSON (JSONL), com texto curto e metadados clínicos, e registram como origem "Seed técnico local para desenvolvimento e validação inicial", com data de revisão de 11 de junho de 2026.'
  },
  {
    id: 'C-042',
    secao: '3.3.1',
    motivo: 'Retira a remissão à documentação do repositório, que repetia a ressalva anterior.',
    tipo: 'substituir',
    antes: 'Essa base cumpriu função de engenharia',
    depois:
      'Essa base cumpriu função de engenharia: exercitar a ingestão, a recuperação, a reordenação e as regras de segurança da primeira versão com conteúdo representativo do domínio. Como não foi extraída de documentos oficiais com indicação de página nem revisada por especialistas, não podia ser tomada como fonte clínica nem como evidência de cobertura do tema. Com a base descrita na Seção 3.3.2, seus documentos foram mantidos no banco de dados com a situação "desenvolvimento" e retirados da busca.'
  },
  {
    id: 'C-043',
    secao: '3.3.2',
    motivo: 'Critérios de inclusão e exclusão mantidos integralmente; redação mais direta.',
    tipo: 'substituir',
    antes: 'A base utilizada a partir de outubro de 2026',
    depois:
      'A base utilizada a partir de outubro de 2026 tem o PCDT da Hanseníase (Ministério da Saúde, 2022) como fonte primária. Os documentos incluídos atendem aos seguintes critérios: publicação do Ministério da Saúde ou da OMS; situação vigente na data da coleta; conteúdo técnico sobre diagnóstico, tratamento, reações hansênicas, prevenção de incapacidades, vigilância ou estratégia de enfrentamento da doença; e arquivo obtido em portal oficial ou, quando o endereço oficial estava indisponível, cópia cuja ficha catalográfica identifica a edição. Priorizaram-se versões em português, e o documento da OMS sobre reações e prevenção de incapacidades foi incluído no original, em inglês. Foram excluídos as referências bibliográficas, os apêndices metodológicos, os formulários e os anexos sem conteúdo técnico aplicável às perguntas, como portarias, tabelas de avaliação da evidência e modelos de cartão do paciente. O Quadro 3 apresenta os documentos incluídos (Ministério da Saúde, 2022, 2024; Organização Mundial da Saúde, 2019, 2021; World Health Organization, 2020b).'
  },
  {
    id: 'C-044',
    secao: '3.3.2',
    motivo: 'Parâmetros de fragmentação mantidos; a justificativa da escolha passa para junto deles.',
    tipo: 'substituir',
    antes: 'A estratégia de fragmentação documentada',
    depois:
      'A fragmentação documentada no início do projeto previa trechos de 500 a 900 *tokens*, com sobreposição de 15% a 25%. Na implementação, adotaram-se trechos menores, para que cada um corresponda a poucas páginas e a citação indique com precisão onde está a informação: cerca de 450 *tokens* estimados, no máximo 700 e no mínimo 80, sem ultrapassar o limite de uma seção e repetindo, no início, até cerca de 120 *tokens* do final do trecho anterior da mesma seção. Os trechos resultantes têm, em média, entre 303 e 360 *tokens* estimados, conforme o documento. Cada trecho registra o documento, o caminho de seções (por exemplo, "10 Abordagem terapêutica > 10.1 Tratamento farmacológico"), as páginas inicial e final no PDF e os números de página impressos; os metadados clínicos (Seção 4.4) são atribuídos por regras, a partir dos títulos das seções e do conteúdo. Uma limitação é que tabelas e fluxogramas são extraídos como texto linear: o quadro com os esquemas da PQT-U, por exemplo, perde a disposição em linhas e colunas.'
  },
  {
    id: 'C-045',
    secao: '3.3.2',
    motivo: 'Mesmo procedimento de conferência e mesma marcação pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'A conferência do processamento foi feita pelo desenvolvedor',
    depois:
      'A conferência do processamento foi feita pelo desenvolvedor, com a revisão manual dos sumários transcritos, a inspeção dos relatórios de cada documento, que informam as páginas, as seções localizadas e não localizadas e o tamanho dos trechos, e a comparação, por amostragem, de trechos com as páginas correspondentes dos PDFs. O conteúdo dos trechos não foi revisado por profissional de saúde. A versão usada nas avaliações foi processada em 23 de outubro de 2026 e indexada no banco de dados de produção em 24 de outubro de 2026, com o modelo de *embeddings* `text-embedding-3-small`. [[[DEFINIR COM O ORIENTADOR: necessidade e forma de revisão dos trechos por profissional de saúde antes da avaliação comparativa.]]]'
  },
  {
    id: 'C-046',
    secao: '3.4',
    motivo: 'Histórico de versões resumido; o detalhe das alterações está no Quadro 13 (Seção 4.9).',
    tipo: 'substituir',
    antes: 'O desenvolvimento ocorreu de forma incremental',
    depois:
      'O desenvolvimento ocorreu de forma incremental entre junho e outubro de 2026. A primeira versão implementou o servidor, com a base inicial, o *pipeline* de consulta e os testes automatizados; as seguintes acrescentaram a interface web, corrigiram falhas observadas na execução contra o banco de dados real e, em outubro, incluíram a autenticação dos usuários, o registro da avaliação das respostas, a base de documentos oficiais e a reformulação da recuperação e das regras de segurança (Seção 4.9). Os requisitos derivam do problema e da política de segurança clínica documentada no projeto e são apresentados na Seção 4.1.'
  },
  {
    id: 'C-047',
    secao: '3.4',
    motivo: 'Tecnologias e justificativas mantidas; a descrição dos testes, repetida na Seção 4.8, foi substituída por remissão (parágrafo seguinte removido em C-048).',
    tipo: 'substituir',
    antes: 'O servidor foi implementado em Node.js com TypeScript',
    depois:
      'O servidor foi implementado em Node.js com TypeScript, com o *framework* Express para a interface de programação de aplicações (API, do inglês *application programming interface*) HTTP, o Prisma como ferramenta de mapeamento objeto-relacional (ORM), o PostgreSQL 16 com a extensão pgvector como banco de dados, a biblioteca Zod para a validação de dados e configurações e o Vitest para os testes automatizados. A interface web foi implementada em React com TypeScript, utilizando Vite, Tailwind CSS, TanStack Query e React Router. O uso de TypeScript nas duas camadas buscou manter contratos explícitos entre elas, e a escolha do PostgreSQL com pgvector, concentrar dados relacionais, texto indexado e vetores em um único banco de dados, sem serviço vetorial separado. A verificação combinou análise estática, verificação de tipos, compilação e testes automatizados, descritos na Seção 4.8.'
  },
  {
    id: 'C-048',
    secao: '3.4',
    motivo: 'Repetia a Seção 4.8.',
    tipo: 'remover',
    antes: 'A verificação do software combinou análise estática'
  },
  {
    id: 'C-049',
    secao: '3.5',
    motivo: 'Mesmo conteúdo em menos palavras.',
    tipo: 'substituir',
    antes: 'A avaliação técnica tem por objetivo verificar',
    depois:
      'A avaliação técnica verifica se o mecanismo de recuperação localiza, para um conjunto de perguntas de referência, os trechos que contêm a resposta (QP2) e, de forma complementar, se as respostas geradas citam esses trechos e contêm as informações esperadas. A execução preliminar, de setembro de 2026, usou a base inicial e um conjunto de 25 perguntas elaborado com ela (Apêndice A) e media apenas a presença de um trecho ideal entre as fontes da resposta e o número de recusas (Seção 5.2.1). Com a substituição da base, esse conjunto perdeu a referência e foi substituído pelo descrito a seguir, usado em outubro de 2026.'
  },

  // 3.6 — nove subseções curtas passam a três, sem perder decisões, parâmetros nem marcações.
  {
    id: 'C-050',
    secao: '3.6',
    motivo: 'Consolidação da Seção 3.6 (de nove para três subseções): abertura enxuta.',
    tipo: 'substituir',
    antes: 'Esta seção apresenta a estrutura da avaliação comparativa',
    depois:
      'Esta seção apresenta a estrutura da avaliação comparativa, que ainda não foi realizada; as decisões pendentes estão indicadas nos pontos em que deverão ser registradas. Nenhuma coleta de dados deverá ocorrer antes da definição do protocolo e da verificação dos requisitos éticos (Seção 3.6.3).'
  },
  { id: 'C-051', secao: '3.6', motivo: 'Consolidação da Seção 3.6: objetivo e desenho na mesma subseção.', tipo: 'substituir', titulo: true, antes: '3.6.1 Objetivo da avaliação', depois: '3.6.1 Objetivo e desenho' },
  {
    id: 'C-052',
    secao: '3.6.1',
    motivo: 'Mesmo objetivo e mesmos cenários, em menos palavras.',
    tipo: 'substituir',
    antes: 'A avaliação comparativa tem por objetivo responder à QP3',
    depois:
      'A avaliação comparativa responde à QP3, investigando como participantes avaliam respostas a perguntas sobre hanseníase produzidas em dois cenários: no Cenário A, pelo NexoHansen, com recuperação de trechos da base de conhecimento, indicação das fontes e aplicação das regras de segurança; no Cenário B, por um modelo de linguagem sem acesso ao mecanismo de recuperação do Cenário A. A avaliação mede a percepção dos participantes e não se destina a demonstrar eficácia clínica, segurança assistencial ou superioridade em relação a profissionais de saúde.'
  },
  { id: 'C-053', secao: '3.6', motivo: 'Consolidação da Seção 3.6.', tipo: 'remover', titulo: true, antes: '3.6.2 Desenho e condições experimentais' },
  {
    id: 'C-054',
    secao: '3.6.1',
    motivo: 'Introdução às decisões de desenho em uma frase.',
    tipo: 'substituir',
    antes: 'A comparação só será interpretável se os dois cenários',
    depois:
      'Para que a comparação seja interpretável, a diferença entre os cenários deve residir, tanto quanto possível, no uso da recuperação e dos mecanismos associados, e não em fatores alheios ao objeto do estudo. Para isso, os seguintes elementos precisam ser definidos antes da coleta:'
  },
  {
    id: 'C-055',
    secao: '3.6.1',
    motivo: 'Mesma decisão pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'a) mecanismo do Cenário B',
    depois:
      'a) mecanismo do Cenário B: a tela de comparação atual produz a resposta sem RAG por uma simulação no navegador, sem consultar nenhum modelo de linguagem (Seção 4.7); essa simulação não pode ser usada como Cenário B e deverá ser substituída por chamadas reais a um modelo de linguagem, com registro das configurações;'
  },
  {
    id: 'C-056',
    secao: '3.6.1',
    motivo: 'Mesma alternativa e mesmas consequências, em menos palavras.',
    tipo: 'substituir',
    antes: 'b) modelo do Cenário B',
    depois:
      'b) modelo do Cenário B: o mesmo modelo gerador do Cenário A, sem recuperação, isola o efeito da recuperação e da camada de segurança, enquanto um assistente de propósito geral aproxima a comparação do uso cotidiano dessas ferramentas, com menor controle sobre as diferenças entre os cenários;'
  },
  {
    id: 'C-057',
    secao: '3.6.1',
    motivo: 'Mesma decisão pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'd) apresentação das respostas',
    depois:
      'd) apresentação das respostas: fontes e nota de segurança podem revelar o Cenário A ao participante, mas a indicação de fontes é parte do que se pretende avaliar, o que exige decidir entre um formato neutro e o formato de cada sistema;'
  },
  {
    id: 'C-058',
    secao: '3.6.1',
    motivo: 'Cegamento, ordem e desenho intra ou entre participantes reunidos em uma alínea (antes e) e f)).',
    tipo: 'substituir',
    antes: 'e) cegamento e ordem de apresentação',
    depois:
      'e) cegamento, ordem e desenho: se os participantes saberão qual cenário produziu cada resposta; como será definida a ordem de exposição, por exemplo por alternância ou sorteio; e se cada participante avaliará respostas dos dois cenários para as mesmas perguntas ou se cada cenário será avaliado por grupos distintos;'
  },
  { id: 'C-059', secao: '3.6.1', motivo: 'Incorporada à alínea e) (C-058).', tipo: 'remover', antes: 'f) desenho intra ou entre participantes' },
  {
    id: 'C-060',
    secao: '3.6.1',
    motivo: 'Mesma condição, renumerada após a fusão das alíneas e) e f).',
    tipo: 'substituir',
    antes: 'g) correções prévias no Cenário A',
    depois:
      'f) correções prévias no Cenário A: os acionamentos indevidos das regras de segurança e da classificação de intenção identificados na avaliação preliminar foram corrigidos (Seção 4.9) e são verificados pelas perguntas de regressão do conjunto de referência; outras falhas observadas antes da coleta deverão ser corrigidas ou controladas na seleção das perguntas.'
  },
  { id: 'C-061', secao: '3.6', motivo: 'Consolidação da Seção 3.6: participantes, perguntas, apresentação e instrumento na mesma subseção.', tipo: 'substituir', titulo: true, antes: '3.6.3 Participantes', depois: '3.6.2 Participantes, perguntas e instrumento' },
  { id: 'C-062', secao: '3.6', motivo: 'Consolidação da Seção 3.6.', tipo: 'remover', titulo: true, antes: '3.6.4 Perguntas e situações de avaliação' },
  {
    id: 'C-063',
    secao: '3.6.2',
    motivo: 'Mesma recomendação e mesma marcação pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'As perguntas apresentadas aos participantes devem contemplar',
    depois:
      'As perguntas devem incluir situações em que se espera resposta fundamentada e situações em que se espera recusa, como pedidos de diagnóstico definitivo, de prescrição ou fora do escopo. O conjunto de referência da avaliação técnica (Apêndice F) pode servir de ponto de partida, mas, por ter sido elaborado pelo desenvolvedor, com conhecimento da base, pode favorecer o Cenário A, e convém que as perguntas finais sejam revisadas ou complementadas por pessoa externa ao desenvolvimento. [[[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: número de perguntas; critérios de seleção; distribuição por tema e por tipo de situação (resposta esperada, recusa esperada e fora do escopo); origem e revisão das perguntas.]]]'
  },
  { id: 'C-064', secao: '3.6', motivo: 'Consolidação da Seção 3.6.', tipo: 'remover', titulo: true, antes: '3.6.5 Procedimento de apresentação das respostas' },
  {
    id: 'C-065',
    secao: '3.6.2',
    motivo: 'Mesmo procedimento, mesma ressalva sobre a interface e mesma marcação pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'As respostas dos dois cenários deverão ser geradas antes',
    depois:
      'As respostas dos dois cenários deverão ser geradas antes da coleta, armazenadas e apresentadas a todos os participantes na mesma forma, pois modelos de linguagem podem responder de modo diferente à mesma pergunta. O componente de avaliação da interface (Seção 4.6) avalia apenas respostas do Cenário A geradas no momento da consulta e precisaria ser adaptado para apresentar respostas previamente geradas dos dois cenários. [[[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: meio de aplicação, como formulário ou interface do próprio sistema; formato de apresentação das respostas; ordem de exposição; instruções fornecidas aos participantes; tempo estimado da sessão.]]]'
  },
  { id: 'C-066', secao: '3.6', motivo: 'Consolidação da Seção 3.6.', tipo: 'remover', titulo: true, antes: '3.6.6 Instrumento de avaliação e dimensões analisadas' },
  {
    id: 'C-067',
    secao: '3.6.2',
    motivo: 'Mesmo conteúdo e mesmas marcações pendentes, em menos palavras.',
    tipo: 'substituir',
    antes: 'O instrumento deverá definir as dimensões avaliadas',
    depois:
      'O instrumento deverá definir as dimensões avaliadas, a escala de resposta e os campos para comentários. As dimensões candidatas, derivadas da literatura discutida na Seção 2.6, estão no Quadro 7, e a estrutura prevista do instrumento, no Apêndice E. [[[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: dimensões adotadas, com a definição operacional de cada uma; escala de resposta; questões abertas; validação prévia do instrumento, por exemplo em teste piloto.]]] A nota global de 0 a 10 que o sistema já registra para cada resposta (Seção 4.6.2) não substitui a avaliação por dimensões, mas pode compor o instrumento como avaliação geral de cada resposta. [[[DEFINIR COM O ORIENTADOR: uso da nota global de 0 a 10 registrada pelo sistema no instrumento de avaliação.]]]'
  },
  { id: 'C-068', secao: '3.6', motivo: 'Consolidação da Seção 3.6: coleta, análise e ética na mesma subseção.', tipo: 'substituir', titulo: true, antes: '3.6.7 Coleta e organização dos dados', depois: '3.6.3 Coleta, análise e aspectos éticos' },
  {
    id: 'C-069',
    secao: '3.6.3',
    motivo: 'Mesmas regras de anonimato e armazenamento e mesma marcação pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'Cada participante deverá receber um código não identificável',
    depois:
      'Cada participante deverá receber um código não identificável, e as avaliações deverão ser registradas em formato estruturado, com uma linha por participante, pergunta e cenário, vinculadas às condições do Quadro 6 e armazenadas com acesso restrito ao pesquisador e ao orientador. Se o próprio sistema registrar as avaliações, os nomes de usuário deverão ser códigos, sem nome, matrícula ou endereço de *e-mail*, e a correspondência entre código e pessoa, se necessária, deverá ser mantida fora do sistema. [[[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: ferramenta de coleta; local e período de armazenamento; procedimento de exportação e de verificação de consistência; tratamento de respostas incompletas.]]]'
  },
  { id: 'C-070', secao: '3.6', motivo: 'Consolidação da Seção 3.6.', tipo: 'remover', titulo: true, antes: '3.6.8 Métodos de análise' },
  {
    id: 'C-071',
    secao: '3.6.3',
    motivo: 'Mesmo plano de análise e mesma marcação pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'A análise deverá comparar as avaliações dos dois cenários',
    depois:
      'A análise deverá comparar os dois cenários por dimensão, com estatística descritiva adequada à escala adotada, examinar os resultados por pergunta e por tipo de situação, incluindo o tratamento dado às perguntas que exigem recusa, e analisar qualitativamente os comentários abertos. A escolha de testes estatísticos depende do desenho, da escala e do tamanho da amostra e deverá ser feita antes da coleta. [[[DEFINIR COM O ORIENTADOR: métodos estatísticos, nível de significância, se aplicável, e procedimento de análise qualitativa.]]]'
  },
  { id: 'C-072', secao: '3.6', motivo: 'Consolidação da Seção 3.6.', tipo: 'remover', titulo: true, antes: '3.6.9 Aspectos éticos e proteção dos participantes' },
  {
    id: 'C-073',
    secao: '3.6.3',
    motivo: 'Mesmo enquadramento ético, mesmas fontes e mesma marcação pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'Por envolver participantes humanos e conteúdo relacionado',
    depois:
      'Por envolver participantes humanos e conteúdo relacionado à saúde, a avaliação deverá observar as Resoluções nº 466/2012 e nº 510/2016 do Conselho Nacional de Saúde (CNS) (Brasil, 2012; Brasil, 2016). A Resolução nº 510/2016 prevê, em seu artigo 1º, situações que não são registradas nem avaliadas pelo sistema formado pelos Comitês de Ética em Pesquisa (CEP) e pela Comissão Nacional de Ética em Pesquisa (CONEP), como a pesquisa de opinião pública com participantes não identificados; a CONEP esclarece, porém, que essa dispensa se aplica apenas quando todos os procedimentos do protocolo se enquadram nessas hipóteses (Brasil, 2022). Como o protocolo não está definido, a necessidade de submissão ao CEP deverá ser verificada antes de qualquer coleta. [[[VERIFICAR COM O ORIENTADOR E O CEP INSTITUCIONAL: enquadramento ético do estudo e procedimentos necessários.]]]'
  },
  {
    id: 'C-074',
    secao: '3.6.3',
    motivo: 'Mesmas salvaguardas e mesmas informações devidas aos participantes, em menos palavras.',
    tipo: 'substituir',
    antes: 'Independentemente do enquadramento, o estudo deverá adotar',
    depois:
      'Independentemente do enquadramento, o estudo deverá adotar participação voluntária, com possibilidade de desistência a qualquer momento; registro de consentimento, por meio de Termo de Consentimento Livre e Esclarecido (TCLE) ou instrumento equivalente; coleta mínima de dados pessoais e apresentação apenas de resultados agregados; e tratamento dos dados conforme a LGPD (Brasil, 2018). As perguntas e respostas não devem conter dados de pacientes. Se os participantes usarem o sistema, deverão ser informados de que as consultas são registradas e vinculadas ao usuário, de que as perguntas são enviadas a um serviço externo de modelo de linguagem e de que o banco de dados está em servidores nos Estados Unidos (Seção 4.2), situação regida pelas regras de transferência internacional de dados da LGPD (Brasil, 2018).'
  },

  // -------------------------------------------------------------------------
  // Capítulo 4 — Desenvolvimento do sistema
  {
    id: 'C-075',
    secao: '4 (abertura)',
    motivo: 'A enumeração das seções repetia o sumário.',
    tipo: 'substituir',
    antes: 'Este capítulo descreve o sistema desenvolvido, denominado provisoriamente',
    depois:
      'Este capítulo descreve o sistema desenvolvido, denominado provisoriamente NexoHansen, conforme implementado no repositório do projeto em outubro de 2026. Essa versão resulta da reformulação motivada pela avaliação técnica preliminar (Seção 5.2.1), e a Seção 4.9 resume as alterações em relação à versão então avaliada.'
  },
  {
    id: 'C-076',
    secao: '4.1',
    motivo: 'Mesmos três princípios, em menos palavras.',
    tipo: 'substituir',
    antes: 'Três princípios orientaram as decisões de projeto',
    depois:
      'Três princípios orientaram as decisões de projeto. O primeiro é que a segurança deve ser controlada em código: as regras que bloqueiam diagnóstico definitivo, prescrição e situações de urgência são aplicadas por um serviço determinístico antes da geração, e não apenas descritas no *prompt*. O segundo é que a rastreabilidade integra a segurança: toda resposta informa os trechos utilizados, e toda consulta é registrada com os trechos, as pontuações e as decisões de segurança. O terceiro é a preferência por componentes previsíveis e testáveis, como a classificação de intenção e as regras de segurança por palavras inteiras, ainda que generalizem menos do que modelos treinados; o modelo de linguagem é usado na interpretação da pergunta e na redação da resposta, sempre com uma alternativa local em caso de falha.'
  },
  {
    id: 'C-077',
    secao: '4.1',
    motivo: 'A finalidade dos requisitos já está na Seção 4.6.',
    tipo: 'substituir',
    antes: 'Os requisitos RF10 e RNF04 e a forma atual do RF09',
    depois:
      'Os requisitos RF10 e RNF04 e a forma atual do RF09 foram incorporados depois da avaliação técnica preliminar, para preparar o uso do sistema por participantes (Seção 4.6).'
  },
  {
    id: 'C-078',
    secao: '4.2',
    motivo: 'Mesma arquitetura em menos palavras; a Figura 2 mostra as camadas.',
    tipo: 'substituir',
    antes: 'O sistema segue uma arquitetura cliente-servidor em camadas',
    depois:
      'O sistema segue uma arquitetura cliente-servidor em camadas, representada na Figura 2. A interface web comunica-se com a API do servidor por requisições HTTP com dados em JSON. O servidor é uma aplicação Express organizada em módulos de domínio (base de conhecimento, trechos, *embeddings*, recuperação, segurança, consulta, avaliação técnica e avaliação das respostas pelos usuários, ou *feedback*), cujas dependências são conectadas em um único ponto de composição, e precedidos por um módulo de autenticação que trata do login e verifica a sessão em cada requisição. O acesso aos dados combina o Prisma, nas operações relacionais, com consultas SQL diretas nas que dependem do pgvector e da busca textual. O banco de dados é o PostgreSQL com pgvector, executado em contêiner Docker no desenvolvimento e em serviço gerenciado na publicação. A API da OpenAI é uma dependência opcional, usada, quando há chave de acesso configurada, para gerar *embeddings*, interpretar as perguntas e redigir as respostas.'
  },
  {
    id: 'C-079',
    secao: '4.2',
    motivo: 'Mesmo conteúdo em menos palavras.',
    tipo: 'substituir',
    antes: 'O repositório inclui, ainda, a configuração necessária para publicar',
    depois:
      'A interface e a API foram publicadas em outubro de 2026 como dois projetos na plataforma Vercel, com o banco de dados PostgreSQL com pgvector no serviço gerenciado Neon, em servidores localizados nos Estados Unidos. A interface repassa as requisições `/api` à API pelo mesmo endereço, o que permite usar o *cookie* de sessão sem compartilhá-lo entre domínios, e cada alteração incorporada ao ramo principal do repositório é publicada automaticamente.'
  },
  {
    id: 'C-080',
    secao: '4.3',
    motivo: 'A descrição atributo a atributo repetia a Figura 3; o texto mantém a função de cada entidade.',
    tipo: 'substituir',
    antes: 'O modelo de dados, representado na Figura 3',
    depois:
      'O modelo de dados, representado na Figura 3, possui onze entidades. `Document` guarda os metadados bibliográficos de cada documento, como instituição, ano, edição, ISBN e resumo SHA-256 do arquivo, e a situação que determina se seus trechos participam da busca; `IngestionRun` registra cada indexação; e `Chunk`, a unidade de recuperação, guarda o texto, a posição no documento (caminho de seções, páginas do PDF e números de página impressos), os metadados clínicos, o texto sem acentos usado na busca textual e o *embedding*, de 1.536 dimensões, com o modelo que o gerou. As demais entidades tratam do acesso (`User` e `AuthSession`), das conversas e do registro das consultas (`ChatSession`, `ChatMessage` e `RetrievalLog`), das avaliações das respostas (`Feedback`) e das perguntas de referência (`EvaluationQuestion`); `Source`, prevista para registrar fontes bibliográficas, ainda não é utilizada.'
  },
  {
    id: 'C-081',
    secao: '4.3',
    motivo: 'Mesmas decisões sobre índices e restrições, em menos palavras.',
    tipo: 'substituir',
    antes: 'Como o Prisma não oferece suporte nativo ao tipo vector',
    depois:
      'Como o Prisma não oferece suporte nativo ao tipo `vector`, as operações sobre a coluna de *embedding* são feitas por SQL direto, e os índices vetorial e GIN e as restrições de verificação (CHECK), como a faixa da nota e o tamanho do comentário das avaliações e os formatos do nome de usuário e do *hash* da senha, são criados por migrações próprias. O índice vetorial IVFFlat da primeira versão, criado com 100 listas, parâmetro dimensionado para tabelas muito maiores que a base, e consultado em uma única lista, podia deixar de encontrar vizinhos relevantes; ele foi substituído por um índice HNSW por distância de cosseno, que não exige essa calibração (Kane, 2026). A busca textual usa um índice GIN sobre o texto sem acentos de cada trecho, e outro índice GIN cobre os metadados.'
  },
  {
    id: 'C-082',
    secao: '4.4',
    motivo: 'Mesmo conteúdo em menos palavras; o Quadro 10 detalha os metadados.',
    tipo: 'substituir',
    antes: 'A base é formada pelos cinco documentos oficiais apresentados no Quadro 3',
    depois:
      'A base é formada pelos cinco documentos oficiais do Quadro 3, processados em 328 trechos. Cada trecho é uma linha JSON com identificador, documento de origem, ordem, caminho de seções, páginas, conteúdo e um objeto de metadados, validado por um esquema Zod que aplica valores padrão conservadores aos campos omitidos. Os metadados clínicos descrevem a fase clínica, o tipo de informação, o público e a população-alvo, a criticidade clínica, o nível de segurança e indicadores de conteúdo, como a relação com medicamento, dose, contraindicação, exame, diagnóstico e reação, e são atribuídos por regras a partir do caminho de seções e do conteúdo: um trecho da seção sobre reações hansênicas, por exemplo, recebe a fase clínica de manejo de reação e o indicador de relação com reações.'
  },
  {
    id: 'C-083',
    secao: '4.4',
    motivo: 'Mesmo procedimento de indexação incremental, em menos palavras.',
    tipo: 'substituir',
    antes: 'A indexação é feita por um script do projeto',
    depois:
      'A indexação é feita por um *script* do projeto ou pela rota `POST /api/knowledge/seed`. Os trechos processados são comparados aos já indexados por um resumo do texto: somente os novos ou alterados recebem novo *embedding*, os que deixaram de existir são removidos, e cada execução é registrada no histórico de ingestão. O texto enviado ao modelo de *embeddings* é precedido do título do documento e do caminho de seções, para que trechos curtos sejam representados com seu contexto. Como a busca vetorial compara apenas vetores gerados pelo mesmo modelo, a troca do provedor exige reindexar a base; a indexação dos 328 trechos com o `text-embedding-3-small` foi executada no banco de dados de produção em 24 de outubro de 2026.'
  },
  {
    id: 'C-084',
    secao: '4.5',
    motivo: 'Mesmo fluxo em menos palavras; a Figura 4 o representa.',
    tipo: 'substituir',
    antes: 'A Figura 4 representa o processamento de uma pergunta',
    depois:
      'A Figura 4 representa o processamento de uma pergunta enviada à rota `POST /api/chat/ask`. Verificada a sessão, o serviço de consulta abre ou retoma a conversa do usuário, registra a pergunta e aciona o serviço de recuperação, que interpreta a pergunta no contexto da conversa, classifica a intenção, estima o risco clínico, executa a busca híbrida e verifica se há evidência suficiente. A camada de segurança decide, então, se a pergunta deve ser recusada; não havendo recusa, a resposta é gerada a partir dos trechos selecionados, e suas citações são verificadas. Por fim, a resposta é registrada e devolvida com as fontes, as informações de segurança, o resumo da recuperação e os identificadores da conversa e da resposta, este usado no registro da avaliação.'
  },
  {
    id: 'C-085',
    secao: '4.5.2',
    motivo: 'Mesmas regras de classificação, em menos palavras.',
    tipo: 'substituir',
    antes: 'A intenção é classificada por correspondência de palavras-chave',
    depois:
      'A intenção é classificada por correspondência de palavras-chave inteiras, com asterisco para indicar prefixos, como em `medicamento*`, sobre a pergunta interpretada, em letras minúsculas e sem acentos. Há onze categorias de assunto: reação hansênica, medicamento, tratamento, classificação, exame, diagnóstico, prevenção de incapacidades, contatos e vigilância, psicossocial, segurança do sistema e triagem; as demais perguntas recebem a intenção geral ou, se estiverem fora do escopo, a intenção correspondente. A intenção descreve o assunto para o registro e para a estimativa de risco, mas não decide se a pergunta será respondida.'
  },
  {
    id: 'C-086',
    secao: '4.5.3',
    motivo: 'O modelo da OpenAI já foi apresentado na Seção 2.4.2; resta o provedor determinístico, necessário para entender a avaliação preliminar.',
    tipo: 'substituir',
    antes: 'O sistema possui dois provedores de embeddings',
    depois:
      'O sistema possui dois provedores de *embeddings*: com chave de acesso, o `text-embedding-3-small` da OpenAI (OpenAI, 2024); sem ela, um provedor determinístico local, que normaliza o texto, descarta palavras com até dois caracteres, mapeia cada palavra para uma das 1.536 posições do vetor por uma função de dispersão (*hash*) e normaliza o resultado. Esse provedor permite executar e testar o sistema sem serviços externos, mas não captura relações semânticas: sua similaridade reflete apenas a sobreposição de palavras.'
  },
  {
    id: 'C-087',
    secao: '4.5.5',
    motivo: 'Mesmo comportamento e mesmo exemplo de regressão, em menos palavras.',
    tipo: 'substituir',
    antes: 'As recusas são reservadas aos pedidos que exigem avaliação individual',
    depois:
      'As recusas são reservadas aos pedidos que exigem avaliação individual. Perguntas informativas sobre gestação, crianças, reações hansênicas, talidomida ou doses padronizadas são respondidas, com instrução ao modelo para destacar os cuidados, as restrições e o encaminhamento descritos nos documentos, e a resposta indica a necessidade de avaliação profissional sempre que o risco estimado é alto ou muito alto. Para o perfil de profissional de saúde, a descrição de uma situação de urgência também é respondida, com o encaminhamento em destaque. Na versão anterior, as regras recusavam qualquer menção a gestação, crianças ou reações e, por usarem correspondência por subcadeias, eram acionadas indevidamente: a pergunta "Tenho dúvida sobre a baciloscopia na hanseníase" era recusada porque "enh", abreviatura de eritema nodoso hansênico, ocorre em "tenho". Essas perguntas integram o conjunto de referência como casos de regressão (Seção 3.5.1). Permanece a limitação de que regras baseadas em padrões textuais podem não reconhecer formulações não previstas.'
  },
  {
    id: 'C-088',
    secao: '4.5.6',
    motivo: 'Mesmas regras do prompt, em menos palavras.',
    tipo: 'substituir',
    antes: 'Quando a pergunta não é recusada, a resposta é gerada de uma de duas formas',
    depois:
      'Quando a pergunta não é recusada e há chave de acesso configurada, o sistema envia ao modelo de linguagem um *prompt* de sistema e um *prompt* de usuário. O *prompt* de sistema define o papel do assistente e três grupos de regras. As regras de fontes determinam que a resposta use somente os trechos fornecidos, cite o número do trecho após cada afirmação que ele sustenta, combine trechos de documentos diferentes quando necessário, não use conhecimento externo para fatos clínicos, declare com precisão o que não foi encontrado, apresente as posições do Ministério da Saúde e da OMS quando divergirem, informando que no Brasil a referência para a prática é o protocolo do Ministério da Saúde, e traduza fielmente os trechos em inglês. As regras de formato pedem que a resposta comece respondendo diretamente à pergunta e use listas, tabelas e subtítulos quando facilitarem a leitura. As regras de segurança clínica proíbem confirmar o diagnóstico de um caso, prescrever para um paciente específico e recomendar iniciar, suspender ou alterar tratamentos, admitem doses apenas como os esquemas padronizados descritos nos trechos e exigem destaque para a avaliação presencial nas situações de risco. O *prompt* de usuário informa o perfil do usuário, as mensagens recentes da conversa, a pergunta original e a interpretada, os cuidados identificados pela camada de segurança e os trechos selecionados, numerados e acompanhados do documento, do âmbito (diretriz brasileira ou recomendação internacional), do idioma, do caminho de seções e das páginas.'
  },
  {
    id: 'C-089',
    secao: '4.5.6',
    motivo: 'Mesmo conteúdo em menos palavras.',
    tipo: 'substituir',
    antes: 'O modelo padrão é o gpt-6-luna, com o raciocínio desligado',
    depois:
      'O modelo padrão, configurável, é o `gpt-6-luna`, com o raciocínio desligado e temperatura 0,1, escolhido na comparação descrita nas Seções 3.5.2 e 5.2.3. Como os modelos das famílias GPT-5 e GPT-6 recusam alguns parâmetros aceitos pelos anteriores, o cliente da API ajusta os parâmetros conforme a família do modelo. Se o modelo falhar, o sistema produz a resposta extrativa.'
  },
  {
    id: 'C-090',
    secao: '4.5.6',
    motivo: 'Mesmo conteúdo em menos palavras; o conteúdo da resposta da API está no Quadro 9 e na Seção 4.5.',
    tipo: 'substituir',
    antes: 'Sem chave configurada, o sistema produz uma resposta extrativa',
    depois:
      'Sem chave configurada, o sistema produz uma resposta extrativa, que apresenta, para cada um dos quatro primeiros trechos selecionados, as frases mais relacionadas à pergunta, com o documento, a seção, a página e o número da fonte. Em ambos os casos, o aviso "Este sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde" é anexado ao final da resposta, e a API devolve, além do texto e das fontes, as informações de segurança (nível de risco, acionamento e motivo da recusa e necessidade de avaliação profissional) e um resumo da recuperação.'
  },
  {
    id: 'C-091',
    secao: '4.5.7',
    motivo: 'Mesmo conteúdo em menos palavras; remissão atualizada após a consolidação da Seção 3.6.',
    tipo: 'substituir',
    antes: 'Cada consulta gera registros persistentes',
    depois:
      'Cada consulta gera registros persistentes: a conversa, com o perfil escolhido e o usuário autenticado; a pergunta e a resposta; e um registro de recuperação com a interpretação da pergunta, os trechos usados como contexto, com documento, páginas, pontuações vetorial, textual e de fusão e indicação de citação, a resposta final, o acionamento de recusa e o nível de risco. Esses registros permitem reconstituir por que uma resposta foi dada ou recusada e quais trechos a sustentaram, e o registro da avaliação (Seção 4.6.2) associa a cada resposta a nota de quem a recebeu. Por vincularem perguntas a usuários, impõem os cuidados de privacidade discutidos na Seção 3.6.3.'
  },
  {
    id: 'C-092',
    secao: '4.6',
    motivo: 'Mesmo conteúdo em uma frase.',
    tipo: 'substituir',
    antes: 'Dois mecanismos foram incorporados ao sistema em outubro de 2026',
    depois:
      'A autenticação dos usuários e o registro da avaliação das respostas foram incorporados em outubro de 2026, depois da avaliação técnica preliminar, para preparar o uso do sistema por participantes; nenhum deles altera o *pipeline* de consulta descrito na Seção 4.5.'
  },
  {
    id: 'C-093',
    secao: '4.6.1',
    motivo: 'Mesmos mecanismos de proteção das senhas, em menos palavras.',
    tipo: 'substituir',
    antes: 'O acesso é feito por nome de usuário e senha',
    depois:
      'O acesso é feito por nome de usuário e senha, com contas criadas pelo pesquisador por meio de um comando do projeto, sem cadastro pela interface nem recuperação de senha. As senhas são armazenadas apenas como *hash* calculado com a função scrypt, que encarece tentativas de descoberta por força bruta por exigir tempo de processamento e memória (Percival; Josefsson, 2016), com sal aleatório e comparação em tempo constante, e restrições no banco de dados impedem o armazenamento de uma senha fora do formato de *hash*.'
  },
  {
    id: 'C-094',
    secao: '4.6.1',
    motivo: 'Sessões, proteção das rotas e limite de tentativas reunidos em um parágrafo (o seguinte foi removido em C-095), sem perder mecanismos.',
    tipo: 'substituir',
    antes: 'Quando o login é aceito, o servidor gera um token',
    depois:
      'No login, o servidor gera um *token* aleatório de 32 *bytes*, entregue em um *cookie* HttpOnly, SameSite Lax e, em produção, Secure, restrito a conexões HTTPS; o banco de dados guarda apenas o *hash* SHA-256 do *token*, com expiração de oito horas por padrão. Todas as rotas sob `/api`, exceto as de autenticação, exigem uma sessão válida, e o usuário associado a uma consulta ou avaliação é sempre obtido da sessão, nunca de dados enviados pelo navegador. Após cinco tentativas de login malsucedidas em 15 minutos para a mesma origem e o mesmo nome de usuário, novas tentativas são recusadas, e as mensagens de erro não revelam se o usuário existe; esse controle, mantido na memória do servidor, vale separadamente para cada instância.'
  },
  {
    id: 'C-095',
    secao: '4.6.1',
    motivo: 'Incorporado ao parágrafo anterior (C-094).',
    tipo: 'remover',
    antes: 'Todas as rotas sob o prefixo /api, exceto as de autenticação'
  },
  {
    id: 'C-096',
    secao: '4.6.2',
    motivo: 'Mesmo comportamento do componente, em menos palavras.',
    tipo: 'substituir',
    antes: 'Após cada resposta concluída, inclusive as recusas',
    depois:
      'Após cada resposta concluída, inclusive as recusas, a interface exibe um componente de avaliação (Figura 5) com escala de 0, a pior avaliação, a 10, a melhor, e um comentário opcional de até 1.000 caracteres; a avaliação pode ser dispensada e reaberta, e, se o envio falhar, a nota e o comentário são preservados para nova tentativa.'
  },
  {
    id: 'C-097',
    secao: '4.6.2',
    motivo: 'Mesmas garantias de integridade, em menos palavras.',
    tipo: 'substituir',
    antes: 'Cada avaliação é gravada com a identificação do usuário da sessão',
    depois:
      'Cada avaliação é gravada com o usuário da sessão, a conversa e a resposta avaliada. Restrições na API e no banco de dados validam a faixa da nota e o tamanho do comentário, garantem que a resposta pertence à conversa e que a conversa é do próprio usuário, impedem que o mesmo usuário avalie duas vezes a mesma resposta e recusam a exclusão de conversas com avaliações, o que protege esses registros contra remoções acidentais.'
  },
  {
    id: 'C-098',
    secao: '4.6.2',
    motivo: 'Mesmo conteúdo; remissão atualizada após a consolidação da Seção 3.6.',
    tipo: 'substituir',
    antes: 'A escala de 0 a 10 substituiu a nota de 1 a 5',
    depois:
      'A escala de 0 a 10 substituiu a nota de 1 a 5 da versão anterior do módulo, e a migração que efetua a mudança é interrompida se encontrar avaliações no formato anterior, em vez de convertê-las ou removê-las. A nota é uma avaliação global da resposta; sua relação com as dimensões previstas para a avaliação comparativa é discutida na Seção 3.6.2.'
  },
  {
    id: 'C-099',
    secao: '4.7',
    motivo: 'Área pública e fluxo de login descritos juntos; as figuras do exemplo ilustrativo e da tela de login foram retiradas por não acrescentarem informação ao texto (C-100 a C-102).',
    tipo: 'substituir',
    antes: 'A interface web foi organizada em uma área pública e um painel interno',
    depois:
      'A interface web tem uma área pública e um painel interno. A área pública compreende a página inicial (Figura 6), que apresenta a finalidade do sistema, o método de construção das respostas, os limites de segurança e os documentos da base, com um exemplo de consulta identificado como ilustrativo; a tela de login; a gaveta de consulta; e a tela de comparação. Exceto a página inicial e o login, as telas exigem sessão: sem ela, a pessoa é conduzida ao login e, depois, devolvida ao ponto em que estava; ao sair, as conversas mantidas pela interface são descartadas, para que não fiquem visíveis a quem usar o mesmo navegador.'
  },
  { id: 'C-100', secao: '4.7', motivo: 'Figura de baixa contribuição: repete os componentes de resposta mostrados nas Figuras 7 e 8 (numeração nova).', tipo: 'remover_ilustracao', legenda: 'Exemplo ilustrativo de consulta exibido na página inicial' },
  { id: 'C-101', secao: '4.7', motivo: 'Incorporado ao parágrafo C-099.', tipo: 'remover', antes: 'Quando uma pessoa sem sessão tenta abrir a consulta' },
  { id: 'C-102', secao: '4.7', motivo: 'Figura de baixa contribuição: tela de login convencional, descrita no texto.', tipo: 'remover_ilustracao', legenda: 'Tela de login' },
  {
    id: 'C-103',
    secao: '4.7',
    motivo: 'Mesmo conteúdo; remissões às figuras renumeradas após a retirada das Figuras 7, 8, 9 e 12 originais.',
    tipo: 'substituir',
    antes: 'A consulta é realizada em uma gaveta lateral (Figura 9)',
    depois:
      'Na gaveta de consulta, acessível de qualquer página pública e com o perfil fixado como profissional de saúde, cada resposta exibe o estado da consulta (resposta ou recusa segura, com o motivo), a intenção identificada, o texto com marcadores numerados que remetem às fontes, uma nota de segurança com o risco clínico e a necessidade de avaliação presencial (Figura 10), a lista de fontes (Figura 11) e o componente de avaliação (Seção 4.6.2).'
  },
  { id: 'C-104', secao: '4.7', motivo: 'Figura de baixa contribuição: estado inicial vazio da gaveta, sem informação além do texto.', tipo: 'remover_ilustracao', legenda: 'Gaveta de consulta em seu estado inicial' },
  {
    id: 'C-105',
    secao: '4.7',
    motivo: 'Mesmo conteúdo em menos palavras.',
    tipo: 'substituir',
    antes: 'Cada fonte é apresentada como referência documental',
    depois:
      'Cada fonte é apresentada como referência documental, com documento, instituição, ano, âmbito (diretriz brasileira ou recomendação internacional), seção e página impressa, uma ligação que abre o PDF oficial na página citada e a opção de exibir o trecho original; documentos em inglês e citações não confirmadas pela verificação automática (Seção 4.5.6) são sinalizados.'
  },
  {
    id: 'C-106',
    secao: '4.7',
    motivo: 'Mesma ressalva sobre a simulação; a figura do estado inicial da tela foi retirada (C-107); remissão atualizada após a consolidação da Seção 3.6.',
    tipo: 'substituir',
    antes: 'A tela de comparação (Figura 12) apresenta',
    depois:
      'A tela de comparação apresenta, lado a lado, a resposta do NexoHansen e a de um modelo genérico, que, na versão atual, é produzida por uma simulação no próprio navegador, identificada como tal, sem consultar nenhum modelo de linguagem. A tela é, portanto, demonstrativa e não constitui o Cenário B da avaliação comparativa (Seção 3.6.1).'
  },
  { id: 'C-107', secao: '4.7', motivo: 'Figura de baixa contribuição: estado inicial vazio de uma tela demonstrativa.', tipo: 'remover_ilustracao', legenda: 'Tela de comparação em seu estado inicial' },
  {
    id: 'C-108',
    secao: '4.7',
    motivo: 'Mesmo conteúdo; remissão à figura renumerada.',
    tipo: 'substituir',
    antes: 'O painel interno, acessível por endereço próprio',
    depois:
      'O painel interno, acessível por endereço próprio, reúne ferramentas de inspeção: uma tela de consulta com seleção de perfil (profissional de saúde, paciente ou desenvolvedor); um explorador de recuperação, que executa apenas a busca, com escolha do modo (híbrido, vetorial ou textual), dos parâmetros *top-K* e *top-N* e de filtros por metadados, e exibe as pontuações de cada candidato (Figura 13); um navegador da base de conhecimento; e um painel de avaliação, que executa as perguntas de referência e apresenta os indicadores da Seção 3.5.'
  },
  {
    id: 'C-109',
    secao: '4.7',
    motivo: 'As tecnologias da interface já estão na Seção 3.4; mantêm-se a divisão de estilos e o limite do controle de acesso.',
    tipo: 'substituir',
    antes: 'A interface foi implementada em React com TypeScript. A área pública',
    depois:
      'As telas restritas consultam a sessão na API antes de exibir o conteúdo, mas o controle de acesso efetivo é o da API (Seção 4.6.1). Não há perfis de acesso: todos os usuários cadastrados acessam também o painel interno e, por meio dele, as rotas de carga da base e de execução da avaliação técnica.'
  },
  {
    id: 'C-110',
    secao: '4.8',
    motivo: 'Mesmo conteúdo em menos palavras.',
    tipo: 'substituir',
    antes: 'O sistema conta com 113 testes automatizados',
    depois:
      'O sistema conta com 113 testes automatizados, escritos com Vitest: 93 no servidor e 20 na interface, agrupados conforme o Quadro 12. No servidor, os testes unitários usam dublês em memória para o repositório, o provedor de *embeddings* e o modelo de linguagem, e parte deles exercita a API por requisições HTTP; dez testes de integração são executados contra um PostgreSQL com as migrações do projeto aplicadas, quando um banco de testes é configurado. Na interface, os testes usam a Testing Library e simulam as respostas da API.'
  },
  {
    id: 'C-111',
    secao: '4.8 (Quadro 12)',
    motivo: 'Quadro de 15 linhas reduzido a 8 grupos, com os mesmos comportamentos verificados e os mesmos totais (93 + 20 = 113).',
    tipo: 'substituir_tabela',
    legenda: 'Testes automatizados do servidor e da interface',
    bloco: {
      tipo: 'tabela',
      especie: 'Quadro',
      legenda: 'Testes automatizados do servidor e da interface',
      cabecalho: ['Camada', 'Grupo', 'Comportamentos verificados', 'Testes'],
      larguras: [13, 22, 55, 10],
      linhas: [
        ['Servidor', 'Esquemas, intenção e risco clínico', 'Metadados com valores padrão; ingestão de JSONL; intenção por palavras inteiras; risco muito alto para dose, gestação, criança, reação e talidomida', '4'],
        ['Servidor', 'Segurança', 'Recusa sem evidência, fora do escopo, de prescrição para paciente específico (inclusive dose pelo peso) e de diagnóstico de caso; comparação por palavras inteiras, sem acentos; perguntas antes recusadas por subcadeias respondidas; respostas cautelosas sobre crianças, gestação e reações; maior restrição ao perfil de paciente', '10'],
        ['Servidor', 'Recuperação, interpretação e fusão', 'Recuperação de trechos de diagnóstico e de tratamento; conteúdo das respostas (baciloscopia negativa, PQT em reação, talidomida e gestação); leitura da pergunta no domínio; saída do escopo; continuações; uso do modelo com alternativa local; fusão por posição recíproca', '12'],
        ['Servidor', 'Citações, *prompt* e geração', 'Renumeração e descarte de citações inválidas; remoção da lista de fontes escrita pelo modelo; verificação por sobreposição de termos; referência documental com página e ligação; conteúdo do *prompt*; resposta sem citações e resposta extrativa; parâmetros por família de modelo', '12'],
        ['Servidor', 'Processamento de documentos e avaliação', 'Limpeza das páginas; leitura do sumário e localização das seções; fragmentação por seção; metadados e textos de indexação; métricas da avaliação técnica e reconhecimento da declaração de lacuna', '11'],
        ['Servidor', 'Autenticação, avaliações e API HTTP', 'Senhas com sal e formatos inválidos; recusas de login; expiração, *logout* e limite de tentativas; notas de 0 a 10 com comentário, vinculadas ao usuário, à conversa e à resposta, uma por usuário e resposta; rotas bloqueadas sem sessão; *cookie* HttpOnly; respostas de erro de validação, de conflito e de falha interna', '34'],
        ['Servidor', 'Integração com PostgreSQL', 'Cadastro por SQL seguido de login; restrições de formato, de faixa da nota, de unicidade e de coerência entre resposta e conversa; bloqueio da exclusão em cascata; indexação incremental com páginas e histórico; busca textual sem acentos; vetores apenas do mesmo modelo e de documentos ativos', '10'],
        ['Interface', 'Login, avaliação e fontes', 'Redirecionamento sem sessão, erros de credenciais, retorno à origem e sessão expirada; escala de 0 a 10, envio, falha, repetição, dispensa e reabertura da avaliação, exibida após cada resposta; referência documental, trecho original, avisos de documento em inglês e de citação não confirmada; subtítulos e tabelas com citações', '20']
      ],
      fonte: 'Fonte: Elaboração própria (2026), com base nos arquivos de teste do servidor e da interface.'
    }
  },
  {
    id: 'C-112',
    secao: '4.8',
    motivo: 'Mesmos resultados de execução; remissão às figuras renumeradas.',
    tipo: 'substituir',
    antes: 'Em 24 de outubro de 2026, os 83 testes do servidor',
    depois:
      'Em 24 de outubro de 2026, os 113 testes, a análise estática e a verificação de tipos do servidor foram executados com sucesso; os dez testes de integração rodaram contra o PGlite, distribuição do PostgreSQL executada no próprio processo de teste, com as extensões pgvector e pgcrypto e as migrações do projeto aplicadas a um banco vazio. Na mesma data, o fluxo de login e consulta foi verificado em navegador, com a base oficial indexada e respostas geradas pelo modelo escolhido, situação registrada nas Figuras 10 e 11.'
  },
  {
    id: 'C-113',
    secao: '4.8',
    motivo: 'Mesmas limitações e mesmos exemplos de falha, em menos palavras.',
    tipo: 'substituir',
    antes: 'A verificação tem, entretanto, limites relevantes',
    depois:
      'A verificação tem limites: os dublês não reproduzem o comportamento dos provedores de *embeddings* e de geração, só exercitado pela avaliação técnica, e o PGlite não reproduz o ambiente de publicação. Duas falhas só apareceram na avaliação técnica e foram corrigidas, com testes, antes da escolha do modelo (Seção 5.2.3): os modelos das famílias GPT-5 e GPT-6 recusavam parâmetros enviados pelo cliente da API, o que faria toda resposta cair no modo extrativo sem aviso, e a verificação de citações ignorava marcadores escritos depois do ponto final. Antes disso, as buscas da primeira versão falhavam contra o banco de dados real porque selecionavam a coluna vetorial, que o Prisma não consegue converter, embora todos os testes passassem; a falha motivou os testes de integração.'
  },
  {
    id: 'C-114',
    secao: '4.9',
    motivo: 'Mesmo conteúdo em menos palavras.',
    tipo: 'substituir',
    antes: 'A avaliação técnica preliminar (Seção 5.2.1) e a análise que a acompanhou',
    depois:
      'A avaliação técnica preliminar (Seção 5.2.1) motivou o retorno às etapas de definição dos objetivos e de desenvolvimento (Seção 3.2). O Quadro 13 relaciona os problemas identificados às alterações descritas neste capítulo.'
  },

  // -------------------------------------------------------------------------
  // Capítulo 5 — Resultados
  {
    id: 'C-115',
    secao: '5 (abertura)',
    motivo: 'Mesma orientação, sem repetir a descrição das execuções, feita nas seções.',
    tipo: 'substituir',
    antes: 'Este capítulo reúne quatro tipos de resultado',
    depois:
      'Este capítulo reúne quatro tipos de resultado, que não devem ser confundidos: o artefato desenvolvido (Seção 5.1); a avaliação técnica do *pipeline*, em execução preliminar e com a base oficial, incluindo a comparação de modelos geradores (Seção 5.2); a estrutura destinada aos resultados da avaliação comparativa, ainda não realizada (Seção 5.3); e os resultados preliminares da avaliação experimental com perguntas curadas (Seção 5.4).'
  },
  {
    id: 'C-116',
    secao: '5.1',
    motivo: 'A síntese repetia o Capítulo 4 componente por componente; mantém o que comprova o atendimento aos requisitos.',
    tipo: 'substituir',
    antes: 'O sistema desenvolvido atende, em sua versão atual',
    depois:
      'O sistema desenvolvido atende, em sua versão atual, aos requisitos do Quadro 8: executa o *pipeline* completo de consulta (Seção 4.5), com seis regras de recusa e citações verificadas, sobre uma base de 328 trechos de cinco documentos oficiais; oferece interface de consulta, com fontes documentais e avaliação das respostas, e de inspeção (Seção 4.7); conta com 113 testes automatizados executados com sucesso (Seção 4.8); e foi publicado na plataforma Vercel, com o banco de dados no serviço Neon.'
  },
  {
    id: 'C-117',
    secao: '5.2.1',
    motivo: 'Mesmo raciocínio e mesmo procedimento de reprodução, em menos palavras.',
    tipo: 'substituir',
    antes: 'Todas as perguntas terminaram em recusa, e nenhuma resposta continha fontes',
    depois:
      'Todas as perguntas terminaram em recusa, e nenhuma resposta continha fontes. Na mesma sessão, o explorador de recuperação posicionava o trecho esperado em primeiro lugar para a pergunta sobre baciloscopia, com pontuação final próxima de 0,25 antes da reordenação, o que sugeria um problema na relação entre a escala das pontuações e o limiar, e não no ranqueamento. Como os resultados por pergunta dessa execução não foram armazenados, a hipótese foi examinada em 20 de outubro de 2026 pela reprodução das partes determinísticas do *pipeline* com o código compilado do sistema, sem uso do banco de dados; os resultados por pergunta estão no Apêndice D.'
  },
  {
    id: 'C-118',
    secao: '5.2.1',
    motivo: 'Mesmos números da análise; os exemplos das três perguntas recusadas por regras ficam no Apêndice D.',
    tipo: 'substituir',
    antes: 'A análise mostrou, em primeiro lugar, que três das 25 perguntas',
    depois:
      'A análise mostrou que três das 25 perguntas eram recusadas por regras específicas a partir do próprio texto (reação grave, gestação e prescrição), independentemente da recuperação, e que a similaridade vetorial entre cada pergunta e seu trecho ideal, com o provedor determinístico, variou de 0,000 a 0,428, com mediana de 0,227, embora o trecho ideal tenha sido o mais similar à pergunta, entre os 15 da base, em 16 das 25 perguntas. Para as 22 perguntas que dependem da regra de evidência, calculou-se a pontuação textual mínima que o trecho ideal precisaria obter para que a pontuação final, somada aos acréscimos de reordenação aplicáveis, atingisse o limiar de 0,65, ou de 0,45 nas perguntas de triagem (Tabela 3).'
  },
  {
    id: 'C-119',
    secao: '5.2.1',
    motivo: 'Mesma conclusão em menos palavras.',
    tipo: 'substituir',
    antes: 'Como a pontuação textual é limitada a 1',
    depois:
      'Como a pontuação textual é limitada a 1, em 13 das 22 perguntas o limiar não poderia ser atingido pelo trecho ideal nem com a máxima correspondência textual, e nas demais exigiria que o trecho contivesse todos os termos significativos da pergunta, condição imposta pela função `plainto_tsquery`. O resultado da Tabela 2 decorre, portanto, da incompatibilidade entre o limiar configurado e a escala de pontuação do provedor determinístico, e não necessariamente de falhas no ranqueamento.'
  },
  {
    id: 'C-120',
    secao: '5.2.1',
    motivo: 'Os três aspectos em uma enumeração única, sem os ordinais.',
    tipo: 'substituir',
    antes: 'A avaliação preliminar evidenciou três aspectos',
    depois:
      'A avaliação preliminar mostrou que o mecanismo de segurança funcionou como projetado, recusando a resposta em vez de responder com trechos pouco relacionados; que o limiar mínimo e os pesos da busca híbrida dependiam da escala das pontuações do provedor de *embeddings*; e que o indicador adotado media o efeito conjunto da recuperação e do limiar, e não apenas a qualidade do ranqueamento. Esses resultados, somados às recusas indevidas identificadas na análise das regras de segurança, motivaram as alterações descritas na Seção 4.9.'
  },
  {
    id: 'C-121',
    secao: '5.2.2',
    motivo: 'O texto repetia valores da Tabela 4; passa a destacar o que eles indicam.',
    tipo: 'substituir',
    antes: 'A versão preliminar acertou o comportamento em 5 das 32 perguntas',
    depois:
      'A versão preliminar acertou o comportamento em 5 das 32 perguntas, todas recusas, e não respondeu a nenhuma pergunta com resposta na base. A versão atual sem acesso à OpenAI já localiza a evidência entre os cinco primeiros trechos em 84% das perguntas, o que indica que a maior parte do ganho decorre da base e da nova recuperação, e não apenas do provedor de *embeddings*; suas duas falhas de comportamento ocorrem nas perguntas sem resposta na base, que a resposta extrativa não consegue declarar. Com os *embeddings* e o modelo da OpenAI, todas as 32 perguntas tiveram o comportamento esperado, inclusive as cinco recusas previstas, as duas lacunas declaradas e as três perguntas de regressão, e a evidência esteve entre os trechos enviados ao modelo em todas as 25 que a possuem. Os resultados por pergunta estão no Apêndice G.'
  },
  {
    id: 'C-122',
    secao: '5.2.2',
    motivo: 'Mesma análise qualitativa e mesmo erro identificado, em menos palavras; remissão à figura renumerada.',
    tipo: 'substituir',
    antes: 'A leitura das respostas da configuração escolhida complementa',
    depois:
      'A leitura das respostas da configuração escolhida complementa as métricas. As respostas começam pela resposta direta à pergunta, seguida dos detalhes em listas ou tabelas, com uma citação após cada afirmação (Figura 10). Nas perguntas de divergência, as duas posições foram apresentadas com as respectivas fontes: sobre o caso com um único nervo comprometido, a resposta indicou que a OMS recomenda a classificação multibacilar e que o protocolo brasileiro admite a paucibacilar quando a avaliação é feita por profissionais experientes, informando que no Brasil a referência é o protocolo do Ministério da Saúde; sobre a profilaxia de contatos, apresentou a dose única de rifampicina recomendada pela OMS e a oferta de BCG prevista no PCDT. A leitura revelou também um erro que as métricas não captaram: na continuação sobre o esquema da PQT-U para crianças, a resposta afirmou que os documentos não detalham o esquema para crianças com mais de 50 kg, embora o Quadro 1 do PCDT indique a PQT-U Adulto acima desse peso. No texto extraído do PDF, as linhas e colunas desse quadro aparecem separadas, e a cobertura de fatos-chave da resposta foi, ainda assim, de 100%, o que ilustra a limitação do processamento de tabelas (Seção 3.3.2) e o alcance das métricas automáticas, que não substituem a revisão das respostas por profissional de saúde.'
  },
  {
    id: 'C-123',
    secao: '5.2.3',
    motivo: 'O texto repetia faixas de valores das Tabelas 5 e 6; passa a destacar as diferenças que orientaram a escolha.',
    tipo: 'substituir',
    antes: 'Todas as configurações tiveram o comportamento esperado nas 32 perguntas',
    depois:
      'Todas as configurações tiveram o comportamento esperado nas 32 perguntas, e a recuperação variou pouco entre elas; como a busca é a mesma, as diferenças decorrem das consultas que cada modelo escreve na interpretação da pergunta. As diferenças apareceram na forma das respostas e no custo. O `gpt-6-luna` citou de forma mais seletiva e escreveu as respostas mais curtas, enquanto o `gpt-5-mini` escreveu respostas 2,7 vezes mais longas que as do `gpt-6-luna` sem raciocínio e levou mais que o dobro do tempo, sem ganho nas métricas. No `gpt-6-luna`, o raciocínio baixo não melhorou nenhuma métrica em relação ao raciocínio desligado e custou 24% a mais.'
  },
  {
    id: 'C-124',
    secao: '5.2.3',
    motivo: 'Mesmas correções de apuração e mesmos números, em menos palavras.',
    tipo: 'substituir',
    antes: 'A apuração das métricas passou por duas correções',
    depois:
      'A apuração das métricas passou por duas correções, registradas no repositório. Na primeira execução do `gpt-6-luna`, apenas 19% das citações foram confirmadas pela verificação automática, porque o modelo escreve o marcador de citação depois do ponto final, separado da frase que ele sustenta; corrigida a verificação e repetidas as execuções afetadas, 95% das citações do modelo foram confirmadas. Além disso, em parte das execuções, as perguntas sem resposta na base foram inicialmente contadas como erro, embora todas as respostas declarassem a lacuna, com formulações que o detector não reconhecia, como "os trechos fornecidos não informam..."; o detector foi ampliado, e as execuções foram reapuradas a partir das respostas registradas, sem nova geração.'
  },
  {
    id: 'C-125',
    secao: '5.2.3',
    motivo: 'Mesma decisão e mesmos números, em menos palavras.',
    tipo: 'substituir',
    antes: 'Aplicado o critério da Seção 3.5.2, escolheu-se',
    depois:
      'Aplicado o critério da Seção 3.5.2, escolheu-se o `gpt-6-luna` com o raciocínio desligado: seu desempenho foi equivalente ao da configuração de referência em todas as métricas, com maior precisão das citações; seu custo, de US$ 0,54 por 1.000 perguntas, foi o menor entre as configurações e 41% inferior ao do `gpt-4o-mini`; e seu tempo mediano, de 7,3 segundos, ficou próximo do menor observado, de 7,2 segundos. O modelo passou a ser o padrão do sistema, e a escolha pode ser revista com a repetição da avaliação, uma vez que preços, disponibilidade e comportamento dos modelos podem mudar.'
  },

  // -------------------------------------------------------------------------
  // Capítulo 6 — Discussão
  {
    id: 'C-126',
    secao: '6.1',
    motivo: 'Mesma resposta à QP1, em menos palavras.',
    tipo: 'substituir',
    antes: 'Em relação à QP1, o desenvolvimento permite identificar',
    depois:
      'Em relação à QP1, as decisões de arquitetura que viabilizam a indicação da origem das respostas e a recusa de situações de risco são: a representação da base em trechos de documentos oficiais, com documento, seção e página; a citação de cada afirmação, com verificação automática e ligação para a página do documento original; o registro de cada consulta com trechos, pontuações e decisões; as regras de segurança aplicadas em código, antes da geração, e restritas aos pedidos que exigem avaliação individual; e a verificação de evidência como condição para responder. Na avaliação técnica com a base oficial, essas decisões resultaram em recusas apenas nos casos previstos, em respostas às perguntas legítimas antes recusadas e, na configuração escolhida, em citações confirmadas em 95% a 100% das fontes, conforme a execução. A forma como os usuários percebem as fontes e as recusas depende da avaliação comparativa.'
  },
  {
    id: 'C-127',
    secao: '6.1',
    motivo: 'Mesma resposta à QP2 e mesmas ressalvas, em menos palavras.',
    tipo: 'substituir',
    antes: 'Em relação à QP2, a avaliação com a base oficial indica',
    depois:
      'Em relação à QP2, com *embeddings* semânticos e a configuração atual, o mecanismo de recuperação localiza os trechos esperados: a evidência esteve entre os oito trechos enviados ao modelo em todas as 25 perguntas do conjunto de referência que a possuem e entre os cinco primeiros em 24 delas, resultado que se manteve, com variações de até 0,08, entre as seis configurações de modelo e as duas execuções. A resposta está condicionada a um conjunto de 32 perguntas elaborado pelo desenvolvedor, com conhecimento da base, e à definição de acerto por documento e intervalo de páginas, que não verifica se o trecho recuperado contém toda a informação necessária. A comparação com a execução preliminar indica que o resultado dependia menos do ranqueamento vetorial do que da compatibilidade entre os mecanismos de combinação e de decisão sobre a evidência e a escala das pontuações: mesmo com o provedor determinístico, a versão atual localizou a evidência entre os cinco primeiros trechos em 84% das perguntas, contra nenhuma na versão preliminar.'
  },
  {
    id: 'C-128',
    secao: '6.2',
    motivo: 'Mesma relação com a literatura, em menos palavras.',
    tipo: 'substituir',
    antes: 'Os resultados convergem com a observação de Xiong',
    depois:
      'Os resultados convergem com a observação de Xiong *et al.* (2024) de que o desempenho de sistemas RAG em medicina depende fortemente da configuração da recuperação: na execução preliminar, a soma ponderada das pontuações e o limiar fixo levaram à recusa de todas as perguntas, enquanto a fusão por posição recíproca, que dispensa a calibração das escalas (Cormack; Clarke; Büttcher, 2009), e a base oficial levaram à localização da evidência na quase totalidade das perguntas; a troca do modelo gerador, entre seis configurações, alterou pouco a recuperação e o comportamento. Quanto ao predomínio de modelos de *embedding* orientados ao inglês (Arzideh *et al.*, 2026; Yang *et al.*, 2026), o modelo de uso geral adotado obteve revocação elevada com perguntas e documentos em português no conjunto avaliado, possivelmente com a contribuição da interpretação da pergunta, que gera consultas na terminologia dos documentos e uma consulta em inglês para o documento da OMS nesse idioma; a comparação com modelos de *embedding* treinados em textos clínicos em português não foi realizada.'
  },
  {
    id: 'C-129',
    secao: '6.3',
    motivo: 'As cinco observações de engenharia mantidas, com os exemplos já relatados nos Capítulos 4 e 5 substituídos por remissões.',
    tipo: 'substituir',
    antes: 'O desenvolvimento do sistema permite registrar observações de engenharia',
    depois:
      'O desenvolvimento do sistema permite registrar observações de engenharia que independem da avaliação comparativa. A primeira é que limiares e pesos de recuperação não são transferíveis entre provedores de *embeddings*: valores definidos sem calibração podem fazer o sistema recusar todas as perguntas, como na avaliação preliminar, ou responder com base em trechos pouco relacionados, e combinar as buscas pela posição dos trechos, e não pela soma de pontuações em escalas diferentes, reduz essa dependência. A segunda é que regras de segurança implementadas em código são verificáveis por testes, mas exigem cuidado na correspondência de padrões, como mostraram os acionamentos indevidos por subcadeias; perguntas de regressão com frases comuns da língua, e não apenas os termos-alvo, verificam esse tipo de falha. A terceira é que testes com dublês em memória não substituem testes com o banco de dados e com os provedores reais, pois três falhas só apareceram fora deles (Seção 4.8). A quarta é que a rastreabilidade depende de dados de origem completos: a extração dos documentos com seção e página permitiu substituir os identificadores internos dos trechos por referências que o usuário pode conferir. A quinta é que dados de pesquisa coletados pelo próprio sistema exigem garantias de integridade semelhantes às dos registros de auditoria, para que uma avaliação não possa ser atribuída a outra pessoa, duplicada ou perdida (Seção 4.6.2).'
  },
  {
    id: 'C-130',
    secao: '6.3',
    motivo: 'Mesmas observações sobre o modelo gerador e sobre a auditoria das métricas, em menos palavras.',
    tipo: 'substituir',
    antes: 'A sexta observação refere-se à escolha do modelo gerador',
    depois:
      'A sexta observação refere-se à escolha do modelo gerador. Em uma arquitetura em que a resposta se restringe aos trechos recuperados e a segurança é aplicada em código, antes da geração, o modelo responde pela interpretação da pergunta e pela redação, e não pela decisão sobre o que pode ser respondido; nessa condição, seis configurações de custos distintos tiveram desempenho equivalente, e a escolhida custou 41% menos que a de referência. A escolha deve, porém, ser verificada com um conjunto de avaliação próprio e repetida a cada troca, pois modelos com preços unitários próximos podem diferir no custo por pergunta pela extensão das respostas e do raciocínio, e modelos mais recentes recusavam parâmetros aceitos pelos anteriores. A sétima é que as métricas automáticas também precisam ser auditadas: duas falhas de apuração e um erro de conteúdo não captado pelas métricas só foram identificados na leitura das respostas (Seção 5.2).'
  },

  // -------------------------------------------------------------------------
  // Capítulo 7 — Considerações finais
  {
    id: 'C-131',
    secao: '7',
    motivo: 'Retomada do objetivo e do artefato sem repetir a lista completa de componentes do Capítulo 4.',
    tipo: 'substituir',
    antes: 'Este trabalho teve como objetivo desenvolver um sistema',
    depois:
      'Este trabalho teve como objetivo desenvolver um sistema de apoio informacional à decisão clínica em hanseníase baseado na arquitetura RAG e avaliar suas respostas tecnicamente e em comparação com as de um modelo de linguagem sem recuperação. Foi desenvolvido o NexoHansen, protótipo que combina a interpretação da pergunta, a recuperação híbrida sobre cinco documentos oficiais do Ministério da Saúde e da OMS, regras de segurança aplicadas antes da geração, respostas restritas aos trechos recuperados, com citações verificadas que remetem à página do documento original, e o registro das consultas para auditoria, com uma interface web de acesso autenticado em que cada resposta pode ser avaliada.'
  },
  {
    id: 'C-132',
    secao: '7',
    motivo: 'Mesmas contribuições e mesmos resultados, em menos palavras.',
    tipo: 'substituir',
    antes: 'Do ponto de vista da Engenharia de Software, a principal contribuição',
    depois:
      'Do ponto de vista da Engenharia de Software, a principal contribuição desta etapa é a documentação de uma arquitetura em que a rastreabilidade e a segurança são tratadas como requisitos de projeto, e não apenas como instruções ao modelo de linguagem, e de seu ciclo de avaliação e reformulação. A avaliação técnica preliminar revelou a dependência entre o provedor de *embeddings*, a escala das pontuações e o limiar de resposta, que levava à recusa de todas as perguntas; após a reformulação, o sistema apresentou o comportamento esperado em todas as perguntas do conjunto de referência e localizou a evidência em todas as que a possuem. A comparação de modelos geradores mostrou que, nessa arquitetura, um modelo de menor custo atinge desempenho equivalente: o `gpt-6-luna` custou 41% menos por pergunta que o modelo usado anteriormente.'
  },
  {
    id: 'C-133',
    secao: '7',
    motivo: 'Mesmos resultados preliminares, em menos palavras.',
    tipo: 'substituir',
    antes: 'A avaliação experimental com 50 perguntas curadas, em sua maioria',
    depois:
      'A avaliação experimental com 50 perguntas curadas, em sua maioria derivadas de dúvidas publicadas e não elaboradas junto com a base, acrescentou uma medida da correção das respostas. Nos resultados preliminares, obtidos com avaliação automatizada, 65,3% das respostas foram consideradas corretas, todas as respostas a perguntas que os documentos não cobrem reconheceram a limitação e nenhuma teve erro classificado como de potencial dano; as falhas concentraram-se nas perguntas sobre tratamento e tiveram origem, em parte, na extração dos documentos. Esses números dependem da revisão por especialista, ainda em andamento (Seção 5.4).'
  },
  {
    id: 'C-134',
    secao: '7',
    motivo: 'Mesmas limitações e mesmas etapas pendentes, em menos palavras.',
    tipo: 'substituir',
    antes: 'O trabalho tem limitações que condicionam',
    depois:
      'As limitações que condicionam o alcance dessas conclusões estão nas Seções 6.4 e 6.5, das quais se destacam a ausência de revisão da base por profissional de saúde, a revisão das respostas por especialista ainda em andamento, o conjunto de referência da avaliação técnica elaborado pelo próprio desenvolvedor e a ausência, até aqui, da avaliação comparativa. Para concluir a pesquisa, é preciso consolidar a revisão por especialista da avaliação experimental; definir com o orientador a revisão do conteúdo da base por profissional de saúde; substituir a simulação da tela de comparação por geração real no Cenário B; definir o protocolo da avaliação comparativa e verificar seu enquadramento ético; e conduzir e analisar a avaliação com participantes.'
  },
  {
    id: 'C-135',
    secao: '7',
    motivo: 'Mesmos trabalhos futuros, em menos palavras; acrescenta a adequação da linguagem ao registro da pergunta, apontada na Seção 6.5.',
    tipo: 'substituir',
    antes: 'Como trabalhos futuros, recomendam-se',
    depois:
      'Como trabalhos futuros, recomendam-se a validação do conteúdo e das respostas por profissionais de saúde; a extração estruturada das tabelas dos documentos, para que faixas de peso, doses e populações permaneçam associadas; a calibração dos limiares de evidência com um conjunto de perguntas ampliado; mecanismos mais robustos que as regras baseadas em padrões textuais, mantendo a possibilidade de verificação; métricas automáticas de avaliação da geração, como as do RAGAS, e o uso das avaliações registradas pelos usuários para ampliar o conjunto de referência; modelos de *embedding* adequados a textos clínicos em português; a adequação da linguagem ao registro da pergunta; a inclusão de outros documentos oficiais; e avisos sobre dados pessoais e perfis de acesso que separem participantes e administradores, necessários para qualquer disponibilização mais ampla do sistema.'
  },

  // -------------------------------------------------------------------------
  // Segunda passada: ilustrações de baixa contribuição e trechos ainda extensos
  {
    id: 'C-136',
    secao: '4.2',
    motivo: 'O Quadro 9 (rotas da API) é documentação de implementação; o parágrafo passa a resumir as rotas e mantém as que o texto cita.',
    tipo: 'substituir',
    antes: 'O Quadro 9 resume as rotas da API',
    depois:
      'A API expõe rotas de autenticação (login, *logout* e sessão atual), de ingestão e indexação da base, de listagem de documentos e trechos, de busca sem geração (`POST /api/retrieval/search`), de consulta (`POST /api/chat/ask`), de execução da avaliação técnica e de registro das avaliações dos usuários (`POST /api/feedback`). Com exceção das rotas de autenticação e de `GET /health`, que verifica a disponibilidade da API, do banco de dados e da extensão pgvector, todas exigem uma sessão de login válida (Seção 4.6.1).'
  },
  { id: 'C-137', secao: '4.2', motivo: 'Quadro de baixa contribuição para a pesquisa, resumido em C-136.', tipo: 'remover_ilustracao', legenda: 'Rotas da API do servidor' },
  { id: 'C-138', secao: '4.4', motivo: 'Os metadados clínicos não alteram a ordenação nem o risco na versão atual (servem apenas de filtro); o quadro com todos os valores possíveis foi resumido em uma frase (C-082).', tipo: 'remover_ilustracao', legenda: 'Principais metadados dos trechos' },
  {
    id: 'C-139',
    secao: '4.4',
    motivo: 'A Tabela 1 (trechos por fase clínica e documento) descrevia a base sem uso posterior na análise; o parágrafo retém a distribuição relevante.',
    tipo: 'substituir',
    antes: 'Na versão atual, os metadados clínicos servem como filtros',
    depois:
      'Na versão atual, esses metadados servem como filtros no explorador de recuperação e na rota de busca, mas não alteram a ordem dos trechos nem o risco estimado da pergunta, que depende apenas da pergunta (Seção 4.5.2). Pela fase clínica atribuída, predominam na base os trechos de vigilância (89), manejo de reação (65), tratamento (61) e conteúdo técnico, como metodologia e contexto dos documentos (46); as demais fases somam 67 trechos, entre eles 11 de diagnóstico e 4 de triagem.'
  },
  { id: 'C-140', secao: '4.4', motivo: 'Resumida em C-139.', tipo: 'remover_ilustracao', legenda: 'Distribuição dos trechos da base por fase clínica e documento' },
  {
    id: 'C-141',
    secao: '4.5.1',
    motivo: 'Mesmas regras de interpretação, sem o detalhe dos indícios usados pela análise local.',
    tipo: 'substituir',
    antes: 'Todas as perguntas são interpretadas no domínio da hanseníase',
    depois:
      'Todas as perguntas são interpretadas no domínio da hanseníase: uma pergunta que não menciona a doença, como "Quais são os critérios?", é tratada como relativa a ela, e perguntas de continuação, como "E para crianças?" ou "Sim, descreva", são completadas com a pergunta anterior da conversa. Uma pergunta só é considerada fora do escopo quando cita um assunto alheio de uma lista de termos, como diabetes, covid ou investimentos, sem mencionar a hanseníase.'
  },
  {
    id: 'C-142',
    secao: '4.5.1',
    motivo: 'Mesmo procedimento e mesmos parâmetros, em menos palavras.',
    tipo: 'substituir',
    antes: 'Com chave de acesso configurada, a interpretação é feita pelo modelo',
    depois:
      'Com chave de acesso configurada, a interpretação é feita pelo modelo de linguagem, que recebe as últimas mensagens da conversa e devolve, em JSON, a pergunta reescrita de forma autônoma, de duas a três consultas de busca com a terminologia dos documentos brasileiros, uma consulta em inglês, para o documento da OMS nesse idioma, e as indicações de pertinência ao domínio e de continuação; se o modelo falhar ou demorar mais de 15 segundos, usa-se uma análise local por regras. Em ambos os casos, siglas e termos leigos recebem expansões de um glossário do domínio, como "PB" para "paucibacilar" e "criança" para "menores de 15 anos", e palavras de conversa, como "sim" e "descreva", são excluídas da busca textual.'
  },
  {
    id: 'C-143',
    secao: '3.5.2',
    motivo: 'Mesmo critério e mesmos modelos, em menos palavras.',
    tipo: 'substituir',
    antes: 'O modelo de linguagem é usado em duas etapas do pipeline',
    depois:
      'O modelo de linguagem é usado na interpretação da pergunta e na redação da resposta (Seção 4.5) e responde pela maior parte do custo de operação do sistema. Sua escolha seguiu, por isso, um critério de custo-benefício: buscou-se o menor custo por pergunta que mantivesse o desempenho do modelo usado até então, o `gpt-4o-mini`, e não o melhor desempenho a qualquer custo. Foram incluídos os modelos da OpenAI de custo comparável disponíveis para a chave de acesso do projeto em 24 de outubro de 2026, `gpt-4.1-mini`, `gpt-5-mini`, `gpt-5.6-luna` e `gpt-6-luna`, os três últimos com esforço de raciocínio baixo (`low`) e o `gpt-6-luna` também com o raciocínio desligado (`none`); modelos de custo mais alto não foram incluídos.'
  },
  {
    id: 'C-144',
    secao: '3.5.2',
    motivo: 'Mesmo procedimento e mesmo critério de decisão, em menos palavras.',
    tipo: 'substituir',
    antes: 'Todas as configurações usaram a mesma base',
    depois:
      'Todas as configurações usaram a mesma base, o mesmo modelo de *embeddings* e os mesmos parâmetros de recuperação, e cada uma foi executada duas vezes sobre o conjunto de referência, porque a interpretação da pergunta e a redação da resposta podem variar entre execuções. Na segunda execução, registraram-se os *tokens* consumidos em cada chamada, separados em entrada, entrada reaproveitada do *cache*, saída e raciocínio, e o custo foi calculado com a tabela de preços da OpenAI vigente na data (OpenAI, 2026). O critério de decisão foi: a) desempenho equivalente ao da configuração de referência nas métricas do Quadro 5, considerada a variação entre as duas execuções; b) entre as configurações equivalentes, o menor custo por pergunta; e c) tempo de resposta compatível com o uso interativo.'
  },
  {
    id: 'C-145',
    secao: '5.2.2',
    motivo: 'Mesmas condições de execução, sem repetir a descrição do conjunto, feita na Seção 3.5.1.',
    tipo: 'substituir',
    antes: 'A avaliação com a base oficial foi executada em 24 de outubro',
    depois:
      'A avaliação com a base oficial foi executada em 24 de outubro de 2026, contra o banco de dados de produção, com a base indexada com o `text-embedding-3-small`, *top-K* igual a 20, *top-N* igual a 8 e similaridade mínima de 0,25, sobre o conjunto de 32 perguntas e com as métricas da Seção 3.5.1. Para situar o resultado, a versão avaliada na execução preliminar foi executada sobre o novo conjunto em 23 de outubro de 2026, com seus parâmetros originais e *embeddings* determinísticos, assim como a versão atual sem acesso à OpenAI. A Tabela 4 reúne os três resultados; a coluna da direita corresponde à configuração escolhida na Seção 5.2.3.'
  },

  // -------------------------------------------------------------------------
  // Terceira passada
  {
    id: 'C-146',
    secao: '2.8 (Quadro 1)',
    motivo: 'Células mais curtas, com os mesmos dados, para que o quadro caiba em uma página e não repita o texto.',
    tipo: 'substituir_tabela',
    legenda: 'Trabalhos relacionados ao sistema proposto',
    bloco: {
      tipo: 'tabela',
      especie: 'Quadro',
      legenda: 'Trabalhos relacionados ao sistema proposto',
      cabecalho: [
        'Trabalho',
        'Tarefa e dados',
        'Avaliação e resultados',
        'Relação com este trabalho'
      ],
      larguras: [
        17,
        29,
        29,
        25
      ],
      linhas: [
        [
          'Xiong *et al.* (2024)',
          'Perguntas médicas de múltipla escolha (MIRAGE, 7.663 perguntas); comparação de corpus, recuperadores e modelos (MedRAG)',
          'Acurácia automática; ganhos de até 18% sobre modelos sem recuperação',
          'Sustenta a atenção à recuperação; avalia respostas fechadas, e não abertas'
        ],
        [
          'Zakka *et al.* (2024)',
          'Perguntas clínicas abertas; recuperação em fontes médicas curadas (Almanac)',
          'Painel de dez profissionais, 314 perguntas; superior em factualidade, completude, preferência e segurança',
          'Referência para a ancoragem em fontes curadas e para a avaliação por dimensões'
        ],
        [
          'Xu *et al.* (2025)',
          'Saúde pública; recuperação densa, BM25 e grafos de conhecimento (MEGA-RAG)',
          'Acurácia, precisão, revocação e F1; redução de alucinação acima de 40% relatada no resumo',
          'Recuperação híbrida em saúde; medida de alucinação pouco descrita'
        ],
        [
          'Amugongo *et al.* (2025); Yang *et al.* (2026)',
          'Revisões sobre RAG em saúde e em medicina (70 estudos na primeira)',
          'Predomínio do inglês; avaliação não padronizada; pouca atenção a ética, viés e segurança',
          'Justificam o foco em português, em segurança e em um protocolo de avaliação explícito'
        ],
        [
          'Fernandes *et al.* (2024)',
          'Revisão sistemática de IA no diagnóstico da hanseníase (21 de 1.659 estudos)',
          'Predomínio de imagens de lesões; área em estágio inicial',
          'Foco no diagnóstico, distinto do apoio informacional'
        ],
        [
          'Barbieri *et al.* (2022)',
          'Imagens de lesões e dados clínicos de 222 pacientes (AI4Leprosy)',
          'Acurácia de 90% e área sob a curva de 96,46%',
          'Diagnóstico por imagem, e não apoio textual'
        ],
        [
          'Simões *et al.* (2025)',
          'Questionário de Suspeição de Hanseníase (MaLeSQs)',
          'Sensibilidade de 85,7%, especificidade de 69,2% e área sob a curva de 0,775',
          'Triagem por questionário, e não apoio textual'
        ]
      ],
      fonte: 'Fonte: Elaboração própria (2026).'
    }
  },
  {
    id: 'C-147',
    secao: '3.1',
    motivo: 'Mesma caracterização e mesma marcação pendente, em menos palavras.',
    tipo: 'substituir',
    antes: 'Quanto à natureza, trata-se de pesquisa aplicada',
    depois: 'Quanto à natureza, a pesquisa é aplicada, voltada a um problema prático: o acesso a informação técnica sobre hanseníase com indicação de fontes e limites de segurança. Quanto aos objetivos, é exploratória, por investigar a aplicação de RAG a um domínio ainda pouco estudado, e descritiva, por caracterizar a arquitetura construída e o comportamento do sistema diante de perguntas sobre a doença. Quanto à abordagem, prevê-se a combinação de dados quantitativos, como os indicadores da avaliação técnica e as avaliações em escala, com dados qualitativos, como os comentários dos participantes. [[[DEFINIR COM O ORIENTADOR: confirmar a abordagem, quantitativa, qualitativa ou mista, após a definição do instrumento de avaliação.]]]'
  },
  {
    id: 'C-148',
    secao: '4.5.6',
    motivo: 'Mesmos critérios de verificação, em menos palavras.',
    tipo: 'substituir',
    antes: 'Recebida a resposta, o sistema remove eventual lista',
    depois: 'Recebida a resposta, o sistema remove eventual lista de referências escrita pelo modelo, descarta marcadores de citação que não correspondam a trechos fornecidos e renumera os demais pela ordem de aparição; as fontes da resposta passam a ser apenas os trechos citados. Cada citação é então verificada: a frase que cita um trecho deve compartilhar com ele ao menos três radicais de palavras, ou dois radicais e um número, ou, com *embeddings* semânticos, ter similaridade de cosseno de ao menos 0,35 com o trecho. A interface sinaliza as fontes não confirmadas e, se a resposta não contiver citações, apresenta os trechos consultados sem confirmação. A verificação aproxima a fundamentação da resposta, mas não confirma que a afirmação está correta.'
  },
  {
    id: 'C-150',
    secao: '6.4',
    motivo: 'Limitações de padrões textuais e de limiares reunidas em uma alínea.',
    tipo: 'substituir',
    antes: 'b) a classificação de intenção e as regras de segurança baseiam-se',
    depois: 'b) a classificação de intenção e as regras de segurança baseiam-se em padrões textuais, sujeitos a omissões diante de formulações não previstas, e os limiares de evidência, de similaridade mínima de 0,25 e de pontuação textual de 0,1, não foram calibrados sistematicamente;'
  },
  {
    id: 'C-151',
    secao: '6.4',
    motivo: 'Incorporada à alínea b) (C-150).',
    tipo: 'remover',
    antes: 'c) os limiares de evidência, de similaridade mínima'
  },
  {
    id: 'C-152',
    secao: '6.4',
    motivo: 'Realfabetação após o agrupamento das alíneas.',
    tipo: 'substituir',
    antes: 'd) a avaliação técnica utiliza um conjunto de 32 perguntas',
    depois: 'c) a avaliação técnica utiliza um conjunto de 32 perguntas elaborado pelo próprio desenvolvedor, com conhecimento da base, e métricas automáticas e lexicais, sem revisão das respostas por especialista;'
  },
  {
    id: 'C-153',
    secao: '6.4',
    motivo: 'Realfabetação após o agrupamento das alíneas.',
    tipo: 'substituir',
    antes: 'e) a interpretação da pergunta e a redação da resposta dependem',
    depois: 'd) a interpretação da pergunta e a redação da resposta dependem de um serviço externo pago, cujos preços, disponibilidade e comportamento podem mudar, de modo que os resultados da comparação de modelos valem para as versões disponíveis em outubro de 2026;'
  },
  {
    id: 'C-154',
    secao: '6.4',
    motivo: 'Realfabetação após o agrupamento das alíneas.',
    tipo: 'substituir',
    antes: 'f) os testes automatizados usam dublês',
    depois: 'e) os testes automatizados usam dublês para os provedores de *embeddings* e de geração, cujo comportamento real só é exercitado pela avaliação técnica;'
  },
  {
    id: 'C-155',
    secao: '6.4',
    motivo: 'Limitações da tela de comparação e da nota registrada pelo sistema, ambas ligadas à avaliação comparativa, reunidas em uma alínea.',
    tipo: 'substituir',
    antes: 'g) a tela de comparação utiliza uma simulação local',
    depois: 'f) a tela de comparação utiliza uma simulação local no lugar de um modelo de linguagem sem recuperação, e a avaliação registrada pelo sistema é uma nota global de 0 a 10, sem as dimensões previstas para a avaliação comparativa, aplicável apenas a respostas geradas no momento da consulta;'
  },
  {
    id: 'C-156',
    secao: '6.4',
    motivo: 'Limitações de privacidade e de controle de acesso reunidas em uma alínea.',
    tipo: 'substituir',
    antes: 'h) as perguntas são enviadas a um serviço externo',
    depois: 'g) as perguntas são enviadas a um serviço externo, o banco de dados da publicação está localizado fora do Brasil e a interface não exibe aviso contra a inserção de dados pessoais nas perguntas; além disso, não há perfis de acesso, de modo que todos os usuários cadastrados acessam o painel interno e as rotas de carga da base e de execução da avaliação técnica, e o limite de tentativas de login vale para cada instância do servidor;'
  },
  {
    id: 'C-157',
    secao: '6.4',
    motivo: 'Incorporada à alínea g) (C-156).',
    tipo: 'remover',
    antes: 'i) não há perfis de acesso'
  },
  {
    id: 'C-158',
    secao: '6.4',
    motivo: 'Incorporada à alínea f) (C-155).',
    tipo: 'remover',
    antes: 'j) a avaliação registrada pelo sistema é uma nota global'
  },
  {
    id: 'C-159',
    secao: '6.4',
    motivo: 'Realfabetação após o agrupamento das alíneas.',
    tipo: 'substituir',
    antes: 'k) o sistema não foi validado clinicamente',
    depois: 'h) o sistema não foi validado clinicamente e não se destina ao uso assistencial.'
  },
  {
    id: 'C-160',
    secao: '3.3.2',
    motivo: 'Mesmas etapas de processamento, em menos palavras.',
    tipo: 'substituir',
    antes: 'O processamento foi automatizado por scripts do projeto',
    depois: 'O processamento foi automatizado por *scripts* do projeto, a partir de um manifesto com os metadados bibliográficos, os endereços oficial e de *download*, o resumo criptográfico SHA-256 e o sumário de cada documento. Para cada documento, o processamento compreende: a) o *download* e a verificação da integridade pelo resumo SHA-256; b) a extração do texto página a página, com a ferramenta pdftotext, o que preserva a correspondência entre o texto e a página do PDF; c) a limpeza do texto, com a remoção de cabeçalhos e rodapés repetidos, a junção de linhas quebradas no meio das frases e, quando necessário, a remoção de números de referências colados às palavras; d) a identificação do número impresso de cada página, que difere de sua posição no arquivo; e) a localização das seções a partir do sumário do documento, transcrito para o manifesto e conferido manualmente; e f) a fragmentação por seção e a atribuição de metadados.'
  },
  {
    id: 'C-161',
    secao: '3.5.1',
    motivo: 'Mesmo procedimento, em menos palavras.',
    tipo: 'substituir',
    antes: 'O procedimento é executado por um script do projeto',
    depois: 'O procedimento é executado por um *script* do projeto, que submete cada pergunta ao fluxo completo de consulta, com perfil de profissional de saúde, e registra a configuração utilizada, a resposta, as fontes citadas, os trechos enviados ao modelo, o resultado da verificação das citações e o tempo de resposta. As conversas e os registros são mantidos apenas em memória, o que permite executar a avaliação contra o banco de dados de produção sem gravar dados. A partir desses registros, calculam-se as métricas do Quadro 5.'
  },
  {
    id: 'C-162',
    secao: '5.1',
    motivo: 'A resposta à QP1 é discutida na Seção 6.1; aqui fica o atendimento aos objetivos.',
    tipo: 'substituir',
    antes: 'Em relação aos objetivos específicos, os objetivos a, b e c',
    depois: 'Em relação aos objetivos específicos, os objetivos a, b e c foram atendidos na versão atual, com a ressalva de que o conteúdo da base não foi revisado por profissional de saúde, e o objetivo d foi executado com a base oficial (Seção 5.2). A relação desses resultados com as questões de pesquisa é discutida na Seção 6.1.'
  }
];
