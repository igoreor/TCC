// Edições da revisão acadêmica do TCC (09/11/2026), aplicadas por avaliacao/tcc/aplicar_revisao.ts.
// Cada edição localiza o parágrafo pelo início do texto atual (sem marcação) e registra o motivo.
// Marcação do texto novo: *itálico*, **negrito**, `código`, [[realce amarelo]].
import type { Edicao } from '../avaliacao/tcc/aplicar_revisao';

export const edicoes: Edicao[] = [
  // -------------------------------------------------------------------------
  // Capítulo 2 — Referencial teórico
  {
    id: 'R-001',
    secao: '2 (abertura)',
    motivo: 'P2: a abertura enumerava as seções sem dizer por que cada tema é necessário; passa a indicar a função de cada bloco na pesquisa.',
    tipo: 'substituir',
    antes: 'Este capítulo reúne os fundamentos que sustentam o problema investigado',
    depois:
      'Este capítulo reúne os conceitos de que dependem o problema investigado, as decisões de projeto do sistema e a forma como ele foi avaliado. A Seção 2.1 caracteriza a hanseníase e as decisões clínicas que exigem a consulta a orientações técnicas. As Seções 2.2 e 2.3 situam o sistema entre os sistemas de apoio à decisão clínica e os modelos de linguagem aplicados à saúde, cujas limitações motivam a arquitetura adotada. As Seções 2.4 e 2.5 tratam da recuperação de informação e da Geração Aumentada por Recuperação, que fundamentam o *pipeline* descrito no Capítulo 4, e a Seção 2.6, dos métodos de avaliação usados nos Capítulos 3 e 5. As Seções 2.7 e 2.8 examinam os trabalhos com os quais esta pesquisa se compara.'
  },
  {
    id: 'R-002',
    secao: '2.1.1',
    motivo:
      'P1: a classificação operacional omitia o critério do comprometimento de nervos, ponto em que o PCDT registra divergência entre a OMS e a literatura brasileira; a divergência é pertinente porque o sistema consulta as duas fontes (conferido no PCDT, Seção 6.3, p. 26–27).',
    tipo: 'substituir',
    antes: 'Para fins de tratamento, os casos são classificados operacionalmente',
    depois:
      'A classificação operacional, usada para definir o esquema terapêutico, considera o número de lesões cutâneas e a baciloscopia. O caso paucibacilar (PB) caracteriza-se pela presença de uma a cinco lesões cutâneas e baciloscopia obrigatoriamente negativa; o multibacilar (MB), pela presença de mais de cinco lesões de pele e/ou baciloscopia positiva, e os casos que suscitem dúvida devem ser tratados como multibacilares (Ministério da Saúde, 2022). O comprometimento de nervos periféricos é um ponto em que as fontes oficiais divergem: há consenso em classificar como MB os casos com mais de um nervo comprometido, mas, para o comprometimento de um único nervo, a OMS recomenda a classificação multibacilar, enquanto a literatura brasileira o descreve na forma tuberculoide, reconhecida como paucibacilar (Ministério da Saúde, 2022). Divergências desse tipo importam para um sistema que consulta documentos das duas instituições, pois a resposta precisa indicar qual orientação se aplica à prática no Brasil (Seção 4.5.6). O PCDT descreve, ainda, as formas clínicas indeterminada, tuberculoide, dimorfa e virchowiana, cujo reconhecimento apoia o raciocínio clínico, embora a classificação operacional seja suficiente para a escolha do esquema terapêutico (Ministério da Saúde, 2022).'
  },
  {
    id: 'R-003',
    secao: '2.1.2',
    motivo:
      'P1/P2: a talidomida era descrita como imunossupressor e com a construção "uso proibido por mulheres grávidas"; o PCDT diz que ela "nunca deve ser indicada para mulheres grávidas, em virtude do seu efeito teratogênico" (Seção 10, monografia da talidomida).',
    tipo: 'substituir',
    antes: 'O tratamento de primeira linha é a poliquimioterapia (PQT)',
    depois:
      'O tratamento de primeira linha é a poliquimioterapia (PQT), associação de rifampicina, dapsona e clofazimina que leva à cura em até 98% dos casos tratados, com baixa taxa de recidiva. No esquema vigente, a poliquimioterapia única (PQT-U) é interrompida após seis doses mensais supervisionadas, administradas em até nove meses, nos casos paucibacilares, e após doze doses mensais supervisionadas, administradas em até dezoito meses, nos multibacilares (Ministério da Saúde, 2022). Um desafio adicional são as reações hansênicas, respostas imunológicas exacerbadas aos antígenos do bacilo que podem surgir durante ou após o tratamento. Seu manejo envolve medicamentos que atuam sobre a resposta imunológica, como os corticosteroides e a talidomida, com atenção a eventos adversos e a contraindicações: a talidomida, por exemplo, nunca deve ser indicada para mulheres grávidas, em virtude de seu efeito teratogênico (Ministério da Saúde, 2022).'
  },
  {
    id: 'R-004',
    secao: '2.1.2',
    motivo:
      'P1: o parágrafo afirmava, sem fonte, que localizar orientações é "uma necessidade concreta" das equipes da APS; a afirmação passa a ser apresentada como premissa do trabalho, apoiada apenas no que os documentos mostram (extensão do protocolo e divergências entre fontes).',
    tipo: 'substituir',
    antes: 'Esse conjunto de decisões, da suspeição à classificação',
    depois:
      'Da suspeição à classificação e do esquema terapêutico ao manejo das reações, essas decisões dependem de orientações distribuídas ao longo de um protocolo de 152 páginas e de documentos complementares da OMS, que nem sempre coincidem com ele. Este trabalho parte da premissa de que localizar a orientação pertinente a uma dúvida específica, e identificar o documento de onde ela provém, é uma necessidade de informação das equipes da APS. A premissa não foi medida nesta pesquisa: a avaliação com participantes (Seção 3.6) examina como as respostas do sistema são percebidas, e não a frequência ou a natureza das dúvidas no atendimento.'
  },
  {
    id: 'R-005',
    secao: '2.2',
    motivo:
      'P1/P2: as "estratégias recomendadas" não tinham atribuição conferível; o parágrafo passa a analisar quais riscos descritos por Sutton et al. (2020) se aplicam a um sistema informacional e como o projeto responde a eles.',
    tipo: 'substituir',
    antes: 'A literatura sobre CDSS também documenta riscos',
    depois:
      'Sutton *et al.* (2020) também reúnem riscos que permanecem atuais, como a fadiga provocada pelo excesso de alertas, a dependência excessiva da ferramenta, a desatualização do conhecimento e a dificuldade de manutenção, além de incertezas sobre o efeito desses sistemas nos desfechos clínicos e nos custos. Esses riscos não se aplicam da mesma forma a um sistema de apoio informacional como o desenvolvido neste trabalho, que não recebe dados de pacientes, não dispara alertas e não emite recomendações individualizadas, limitando-se a localizar, organizar e citar orientações técnicas em resposta a perguntas. Para esse tipo de sistema, os riscos mais pertinentes são a desatualização, já que as orientações mudam com a publicação de novas normas, e a dependência excessiva, que se agrava quando o usuário não consegue conferir a origem do que lê. Manter a base em documentos identificados por edição e citar a página de cada afirmação (Seções 3.3.2 e 4.5.6) são as decisões de projeto que respondem a esses dois riscos.'
  },
  {
    id: 'R-006',
    secao: '2.3',
    motivo:
      'P2: a descrição genérica das capacidades dos modelos ("executam tarefas variadas... sem treinamento específico") não tinha fonte nem função na pesquisa; passa a delimitar as duas funções que o modelo exerce no sistema.',
    tipo: 'substituir',
    antes: 'Os modelos de linguagem de grande escala são redes neurais',
    depois:
      'Os modelos de linguagem de grande escala são redes neurais baseadas, em geral, na arquitetura Transformer, que utiliza mecanismos de atenção para modelar as relações entre os elementos de uma sequência (Vaswani *et al.*, 2017). Neste trabalho, o modelo de linguagem exerce duas funções delimitadas: interpretar a pergunta, reescrevendo-a no contexto da conversa e na terminologia dos documentos, e redigir a resposta a partir dos trechos recuperados (Seção 4.5). As limitações descritas a seguir interessam na medida em que afetam essas duas funções.'
  },
  {
    id: 'R-007',
    secao: '2.3',
    motivo:
      'P2: o fecho do parágrafo ("motivam abordagens... discutidas nas seções seguintes") era genérico; passa a relacionar a distinção de Ji et al. (2023) ao comportamento que o sistema tenta impedir e à medida usada na avaliação experimental.',
    tipo: 'substituir',
    antes: 'A produção de conteúdo sem sustentação na entrada',
    depois:
      'A produção de conteúdo sem sustentação na entrada ou nos fatos é tratada na literatura como alucinação. Ji *et al.* (2023) distinguem alucinações intrínsecas, que contradizem o conteúdo de origem, de alucinações extrínsecas, que acrescentam informações não verificáveis a partir dele. Em um sistema que responde a partir de trechos recuperados, a distinção tem correspondência direta: a alucinação intrínseca aparece como uma afirmação que contradiz o trecho citado, e a extrínseca, como uma informação ausente dos trechos, por exemplo uma dose ou um prazo que o documento não menciona. Em saúde, as duas são críticas, pois uma afirmação incorreta sobre dose, contraindicação ou critério diagnóstico pode induzir erro; a segunda é a que as regras de geração do sistema procuram impedir (Seção 4.5.6), e ambas são registradas como alucinação na avaliação experimental (Seção 3.8.4).'
  },
  {
    id: 'R-008',
    secao: '2.4.2',
    motivo:
      'P0: a similaridade de cosseno era atribuída a Karpukhin et al. (2020), cujo recuperador denso (DPR) usa o produto interno; a frase passa a distinguir as duas medidas.',
    tipo: 'substituir',
    antes: 'Na recuperação densa, a consulta e os documentos',
    depois:
      'Na recuperação densa, a consulta e os documentos são representados por vetores numéricos de dimensão fixa, os *embeddings*, produzidos por modelos treinados para que textos semanticamente próximos resultem em vetores próximos. A relevância é estimada por uma medida de similaridade entre vetores, como o produto interno, adotado por Karpukhin *et al.* (2020) na recuperação densa de passagens, ou a similaridade de cosseno, usada neste trabalho. Essa abordagem reduz o problema do vocabulário divergente, pois uma pergunta pode recuperar um trecho relevante mesmo sem compartilhar termos com ele.'
  },
  {
    id: 'R-009',
    secao: '2.4.2',
    motivo:
      'P1/P2: o BioBERT era apresentado como modelo de embedding (é um modelo de linguagem pré-treinado); a afirmação sobre o idioma dos modelos passa a indicar o que cada fonte de fato mostra e a escolha feita no projeto.',
    tipo: 'substituir',
    antes: 'A qualidade da recuperação densa depende do modelo',
    depois:
      'A qualidade da recuperação densa depende do modelo de *embedding*. Uma linha de trabalho especializa modelos em textos biomédicos, como o BioBERT, modelo de linguagem pré-treinado em textos científicos da área que pode servir de base a codificadores de recuperação (Lee *et al.*, 2020); outra oferece modelos de propósito geral como serviço, como o `text-embedding-3-small`, que produz vetores de 1.536 dimensões (OpenAI, 2024). A escolha envolve também o idioma. A revisão de Yang *et al.* (2026) observa que as ferramentas de recuperação usadas em RAG médico se apoiam sobretudo em modelos de *embedding* centrados no inglês, e Arzideh *et al.* (2026), ao ajustar um modelo multilíngue com documentos clínicos de um hospital alemão, relatam ganho na recuperação em relação ao modelo de partida. Este trabalho adotou um modelo de propósito geral, sem ajuste, com documentos e perguntas em português; o efeito dessa escolha é discutido na Seção 6.2.'
  },
  {
    id: 'R-010',
    secao: '2.4.3',
    motivo: 'P2: o histórico do projeto ocupava o referencial; passa a uma remissão à Seção 4.9.',
    tipo: 'substituir',
    antes: 'A reordenação (reranking) é uma segunda etapa',
    depois:
      'A reordenação (*reranking*) é uma segunda etapa que reavalia um conjunto menor de candidatos com critérios mais informativos que os da recuperação inicial. Ela pode ser feita por modelos treinados para estimar a relevância de pares pergunta-trecho, como os baseados em BERT (Nogueira; Cho, 2019), ou por regras que incorporam conhecimento do domínio. A versão atual do sistema não usa reordenação: a reordenação por regras da primeira versão foi substituída pela fusão por posição recíproca, pelos motivos descritos na Seção 4.9.'
  },
  {
    id: 'R-011',
    secao: '2.5.1',
    motivo: 'P1: o texto dizia que a arquitetura atual inclui reordenação, contradizendo a Seção 2.4.3 e o Capítulo 4.',
    tipo: 'substituir',
    antes: 'Na fase de inferência, a pergunta do usuário',
    depois:
      'Na fase de inferência, a pergunta do usuário é convertida para o mesmo espaço de representação, os trechos mais relevantes são recuperados e incorporados ao *prompt* enviado ao modelo gerador, que redige a resposta a partir deles. Gao *et al.* (2023) classificam as arquiteturas em RAG ingênuo, que segue esse fluxo básico; RAG avançado, que acrescenta etapas antes e depois da recuperação, como a reescrita da consulta e a reordenação; e RAG modular, que organiza o sistema em componentes intercambiáveis. A arquitetura implementada neste trabalho, descrita no Capítulo 4, corresponde a um RAG avançado: antes da recuperação, a pergunta é interpretada e classificada; a recuperação combina buscas vetorial e textual; e uma camada de segurança, anterior à geração, decide se a pergunta pode ser respondida.'
  },
  {
    id: 'R-012',
    secao: '2.5.2',
    motivo:
      'P0: os resultados do Almanac (130 cenários, +18% de factualidade) vinham do preprint de 2023, e não do artigo publicado no NEJM AI (2024), que é a obra referenciada.',
    tipo: 'substituir',
    antes: 'A fundamentação (grounding) designa',
    depois:
      'A fundamentação (*grounding*) designa a correspondência entre o conteúdo da resposta e as fontes recuperadas. Em aplicações de saúde, ela é complementada pela rastreabilidade: a possibilidade de identificar quais trechos e documentos sustentaram cada resposta, tanto pelo usuário, que pode conferir a informação, quanto por quem audita o sistema. Zakka *et al.* (2024) mostraram, com o sistema Almanac, que a recuperação a partir de fontes médicas curadas melhorou as respostas a perguntas clínicas em factualidade, completude e segurança diante de perguntas adversariais, em comparação com modelos sem recuperação. A citação de fontes, entretanto, não garante fidelidade: o modelo pode citar um trecho e afirmar algo que ele não sustenta, o que torna necessário avaliar a correspondência entre a resposta e as fontes (Es *et al.*, 2024).'
  },
  {
    id: 'R-013',
    secao: '2.5.3',
    motivo:
      'P1/P2: "sistemas destinados a contextos sensíveis costumam combinar..." generalizava sem fonte, e a constatação das revisões de Amugongo e Yang se repetia pela terceira vez no capítulo; os mecanismos passam a ser apresentados como opções de projeto, com remissão à Seção 2.7.2.',
    tipo: 'substituir',
    antes: 'A RAG reduz, mas não elimina, os riscos',
    depois:
      'A RAG reduz, mas não elimina, os riscos discutidos na Seção 2.3. Erros de recuperação propagam-se para a resposta, perguntas fora do escopo da base podem receber respostas apoiadas em trechos pouco relacionados e o modelo gerador pode deixar de seguir as instruções do *prompt*. Esses riscos podem ser tratados por mecanismos externos ao modelo, como limiares mínimos de relevância para responder, políticas de recusa para perguntas que exijam julgamento profissional, avisos sobre os limites da ferramenta e registro das interações para auditoria. Como mostram as revisões discutidas na Seção 2.7.2, esses aspectos ainda recebem pouca atenção nos estudos sobre RAG em saúde.'
  },
  {
    id: 'R-014',
    secao: '2.6',
    motivo:
      'P1: a seção dizia que as dimensões da avaliação "ainda serão definidas" e não fundamentava a avaliação experimental da Seção 3.8; o parágrafo passa a delimitar o custo da avaliação humana e a remeter à alternativa discutida a seguir.',
    tipo: 'substituir',
    antes: 'Em saúde, as métricas automáticas são frequentemente',
    depois:
      'Em saúde, as métricas automáticas são frequentemente complementadas por avaliação humana. Singhal *et al.* (2023) avaliaram respostas com médicos e leigos em dimensões como a concordância com o consenso científico, a possibilidade de dano e a presença de conteúdo inadequado ou incorreto; Zakka *et al.* (2024) utilizaram um painel de profissionais para julgar factualidade, completude, preferência e segurança. Esse tipo de avaliação é custoso e difícil de repetir a cada alteração do sistema. Além disso, as revisões sobre RAG em saúde não identificaram um *framework* padronizado para conduzi-la (Amugongo *et al.*, 2025) e registram que as avaliações humanas se concentram em acurácia, completude, relevância e fluência, com atenção insuficiente a viés e segurança (Yang *et al.*, 2026).'
  },
  {
    id: 'R-015',
    secao: '2.6',
    motivo:
      'P1: a avaliação experimental (Seção 3.8) usa um modelo de linguagem como avaliador e mede a concordância com especialista por kappa ponderado, mas o referencial não tratava desses métodos; o novo parágrafo os fundamenta com fontes verificadas (Zheng et al., 2023; Panickssery; Bowman; Feng, 2024; Cohen, 1968).',
    tipo: 'inserir_depois',
    antes: 'Em saúde, as métricas automáticas são frequentemente',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'Uma alternativa intermediária entre as métricas automáticas e a avaliação por especialistas é usar um modelo de linguagem como avaliador (*LLM-as-a-judge*), que julga as respostas segundo critérios explícitos. Zheng *et al.* (2023) verificaram que um modelo avaliador de grande porte alcançou concordância superior a 80% com preferências humanas, nível semelhante ao da concordância entre avaliadores humanos, mas identificaram vieses de posição, de verbosidade e de autofavorecimento. O último foi examinado por Panickssery, Bowman e Feng (2024), que observaram que modelos avaliadores reconhecem os próprios textos e tendem a avaliá-los melhor do que textos de outras fontes considerados equivalentes por avaliadores humanos. Esses resultados, obtidos em tarefas gerais, não autorizam substituir o julgamento clínico pelo de um modelo, pois a correção de uma resposta médica pode depender de conhecimento que o avaliador automático também não tem. Quando um modelo é usado como avaliador nesse domínio, a concordância com especialistas precisa ser medida, por exemplo pelo coeficiente kappa ponderado, que considera o grau de discordância entre categorias ordenadas (Cohen, 1968).'
      },
      {
        tipo: 'paragrafo',
        texto:
          'Essas considerações orientam as três avaliações deste trabalho: a avaliação técnica, que mede a recuperação com julgamentos de relevância definidos pelo desenvolvedor (Seção 3.5); a avaliação experimental com perguntas curadas, em que um modelo de linguagem atua como avaliador segundo rubrica fixa e uma especialista revisa uma amostra das respostas (Seção 3.8); e a avaliação comparativa com participantes, planejada (Seção 3.6).'
      }
    ]
  },
  {
    id: 'R-016',
    secao: '2.7.1',
    motivo:
      'P0: a distribuição dos 21 estudos (15 com imagens, 1 combinado, 5 com exames) e a afirmação de que nenhum era baseado em texto não puderam ser conferidas no artigo; mantêm-se apenas os dados confirmados (1.659 identificados, 21 incluídos, predomínio de imagens, área em estágio inicial).',
    tipo: 'substituir',
    antes: 'Fernandes et al. (2024) conduziram uma revisão',
    depois:
      'Fernandes *et al.* (2024) conduziram uma revisão sistemática sobre ferramentas de IA para apoio ao diagnóstico da hanseníase, seguindo as diretrizes PRISMA: de 1.659 estudos identificados em cinco bases de dados, 21 foram incluídos, e a maioria utilizou imagens de lesões cutâneas. Os autores concluem que a pesquisa na área está em estágio inicial e que são necessários novos estudos para que as soluções alcancem maturidade suficiente para a prática clínica.'
  },
  {
    id: 'R-017',
    secao: '2.7.1',
    motivo:
      'P2: o parágrafo enumerava trabalhos ("X desenvolveu..., Y combinou..., Z desenvolveu...") sem compará-los; passa a organizá-los pelo tipo de dado e pela tarefa, e a explicitar o que têm em comum.',
    tipo: 'substituir',
    antes: 'Entre os trabalhos com dados clínicos e de imagem',
    depois:
      'Os estudos com resultados quantitativos diferem pelo tipo de dado e pela etapa do cuidado a que se dirigem. No diagnóstico por imagem, Barbieri *et al.* (2022) desenvolveram o AI4Leprosy, que combina 1.229 imagens de lesões cutâneas e 585 conjuntos de dados clínicos e demográficos de 222 pacientes atendidos em um centro de referência brasileiro; um modelo de regressão logística com regularização *elastic-net* alcançou acurácia de 90% e área sob a curva de 96,46%, e os autores apontam a necessidade de validação em populações com outros tipos de pele e com imagens de *smartphones*. Na triagem, Simões *et al.* (2025) aplicaram aprendizado de máquina ao Questionário de Suspeição de Hanseníase, e o modelo selecionado, uma máquina de vetores de suporte, obteve sensibilidade de 85,7%, especificidade de 69,2% e área sob a curva de 0,775. Entre contatos domiciliares, Gama *et al.* (2019) combinaram análises moleculares e sorológicas com aprendizado de máquina para predizer o adoecimento, abordagem que depende de infraestrutura laboratorial. Os três trabalhos produzem uma classificação a partir de dados do paciente, e seu desempenho é medido por acurácia, sensibilidade e especificidade. Mais próximo do apoio ao profissional, o Health Guardian, de Andrade *et al.* (2024), é um aplicativo colaborativo, em fase de prototipação, que aplica IA ao apoio à decisão sobre o tratamento de DTN, entre elas a hanseníase.'
  },
  {
    id: 'R-018',
    secao: '2.7.1',
    motivo:
      'P2: "tarefa para a qual a RAG é especialmente adequada" era afirmação promocional sem suporte; o fecho passa a explicar a diferença de tarefa e de avaliação em relação aos trabalhos citados.',
    tipo: 'substituir',
    antes: 'Esses trabalhos convergem para tarefas de triagem',
    depois:
      'Esses trabalhos convergem para tarefas de triagem, classificação e apoio ao diagnóstico, com dados de imagem, questionários ou exames. Na literatura consultada, não foram identificados sistemas voltados a responder perguntas sobre a doença com base em documentos oficiais, isto é, ao apoio informacional em linguagem natural. Essa tarefa exige outro tipo de avaliação: não há um rótulo correto a prever, e sim uma resposta em texto cuja correção, completude e fundamentação precisam ser julgadas (Seção 2.6).'
  },
  {
    id: 'R-019',
    secao: '2.7.2',
    motivo:
      'P2: acrescenta a limitação do MIRAGE pertinente a esta pesquisa (avaliação em formato de múltipla escolha, que não avalia respostas abertas), em vez de apenas reproduzir o resultado dos autores.',
    tipo: 'substituir',
    antes: 'Xiong et al. (2024) propuseram o MIRAGE',
    depois:
      'Xiong *et al.* (2024) propuseram o MIRAGE, conjunto de 7.663 perguntas extraídas de cinco bases de perguntas e respostas médicas, e o MedRAG, conjunto de ferramentas para comparar combinações de corpus, recuperadores e modelos. Os autores relatam ganhos de acurácia de até 18% em relação ao uso dos mesmos modelos sem recuperação e mostram que a escolha do corpus e do recuperador afeta significativamente o desempenho. O MIRAGE avalia os sistemas em formato de múltipla escolha, o que permite medir a acurácia automaticamente, mas não avalia a redação, a completude nem a fundamentação de respostas abertas, como as produzidas neste trabalho.'
  },
  {
    id: 'R-020',
    secao: '2.7.2',
    motivo:
      'P0: Almanac com os dados do artigo publicado (NEJM AI, 2024: 314 perguntas de nove especialidades, painel de dez profissionais); MEGA-RAG: a redução "superior a 40%" consta só do resumo do artigo, e o corpo não descreve como a taxa foi medida — a ressalva passa a constar do texto.',
    tipo: 'substituir',
    antes: 'Zakka et al. (2024) desenvolveram o Almanac',
    depois:
      'Zakka *et al.* (2024) aproximam-se mais do objetivo deste trabalho: o Almanac recupera informação de fontes médicas curadas para responder a perguntas clínicas abertas. Avaliado por um painel de dez profissionais de saúde em 314 perguntas de nove especialidades, superou modelos sem recuperação em factualidade, completude, preferência dos avaliadores e segurança diante de perguntas adversariais. Xu *et al.* (2025) propuseram o MEGA-RAG, que combina recuperação densa, recuperação lexical por BM25 e grafos de conhecimento biomédico, com um reordenador e um módulo de refinamento que identifica discrepâncias entre respostas. Os autores relatam, no resumo, redução superior a 40% na taxa de alucinação em relação a quatro modelos de referência; no corpo do artigo, porém, os resultados são apresentados em acurácia, precisão, revocação e F1, sem a descrição de como essa taxa foi calculada, o que limita a comparação.'
  },
  {
    id: 'R-021',
    secao: '2.7.2',
    motivo:
      'P2: a síntese das revisões passa a trazer os dados conferidos (70 estudos de 2020 a 2025; 78,9% com dados em inglês) e a relacionar cada constatação a uma escolha do projeto, em vez de repetir a lista de lacunas.',
    tipo: 'substituir',
    antes: 'As revisões de Amugongo et al. (2025), que analisou',
    depois:
      'As duas revisões mais abrangentes encontradas convergem em três pontos. Amugongo *et al.* (2025) analisaram 70 estudos publicados entre 2020 e 2025 e verificaram que 78,9% usaram conjuntos de dados em inglês, que faltam *frameworks* padronizados de avaliação e que a maioria dos estudos não examina considerações éticas. Yang *et al.* (2026) registram o predomínio de dados públicos e de modelos de *embedding* centrados no inglês, além de avaliações humanas concentradas em acurácia, completude, relevância e fluência, e concluem que a RAG em medicina está em estágio inicial, com necessidade de validação clínica, de adaptação a outros idiomas e de atenção a contextos com poucos recursos. Para este trabalho, as três constatações correspondem a escolhas de projeto: documentos e perguntas em português, segurança tratada como requisito de arquitetura e um protocolo de avaliação explícito, com as limitações registradas.'
  },
  {
    id: 'R-022',
    secao: '2.8',
    motivo: 'P2: o quadro passa a comparar tarefa, dados e forma de avaliação, em vez de repetir os resultados já descritos na Seção 2.7.',
    tipo: 'substituir',
    antes: 'O Quadro 1 reúne os trabalhos mais diretamente',
    depois:
      'O Quadro 1 compara os trabalhos mais diretamente relacionados a esta pesquisa quanto à tarefa, aos dados, à forma de avaliação e à relação com o sistema proposto, em duas linhas: sistemas e revisões sobre RAG em medicina e trabalhos de IA aplicada à hanseníase.'
  },
  {
    id: 'R-023',
    secao: '2.8 (Quadro 1)',
    motivo:
      'P0/P2: corrige os dados do Almanac e de Fernandes et al. e substitui a coluna de resultados, redundante com o texto, por colunas de tarefa e dados e de avaliação, que permitem a comparação.',
    tipo: 'substituir_tabela',
    legenda: 'Trabalhos relacionados ao sistema proposto',
    bloco: {
      tipo: 'tabela',
      especie: 'Quadro',
      legenda: 'Trabalhos relacionados ao sistema proposto',
      cabecalho: ['Trabalho', 'Tarefa e dados', 'Avaliação e resultados', 'Relação com este trabalho'],
      larguras: [17, 29, 29, 25],
      linhas: [
        [
          'Xiong *et al.* (2024)',
          'Perguntas médicas em formato de múltipla escolha (MIRAGE, 7.663 perguntas); comparação de corpus, recuperadores e modelos (MedRAG)',
          'Acurácia automática; ganhos de até 18% sobre modelos sem recuperação; desempenho sensível ao corpus e ao recuperador',
          'Sustenta a atenção dada à recuperação; avalia respostas fechadas, e não abertas'
        ],
        [
          'Zakka *et al.* (2024)',
          'Perguntas clínicas abertas; recuperação em fontes médicas curadas (Almanac)',
          'Painel de dez profissionais, 314 perguntas; melhor que modelos sem recuperação em factualidade, completude, preferência e segurança',
          'Referência para a ancoragem em fontes curadas e para a avaliação humana por dimensões'
        ],
        [
          'Xu *et al.* (2025)',
          'Perguntas de saúde pública; recuperação densa, BM25 e grafos de conhecimento, com reordenação e refinamento (MEGA-RAG)',
          'Acurácia, precisão, revocação e F1; redução de alucinação superior a 40% relatada no resumo',
          'Exemplo de recuperação híbrida em saúde; medida de alucinação pouco descrita'
        ],
        [
          'Amugongo *et al.* (2025); Yang *et al.* (2026)',
          'Revisões sobre RAG em saúde e em medicina (70 estudos na primeira)',
          'Predomínio do inglês; ausência de avaliação padronizada; pouca atenção a ética, viés e segurança',
          'Justificam o foco em português, em segurança e em um protocolo de avaliação explícito'
        ],
        [
          'Fernandes *et al.* (2024)',
          'Revisão sistemática de IA no diagnóstico da hanseníase (21 de 1.659 estudos)',
          'Predomínio de imagens de lesões cutâneas; área em estágio inicial',
          'Mostra o foco da área no diagnóstico, distinto do apoio informacional'
        ],
        [
          'Barbieri *et al.* (2022)',
          'Diagnóstico com imagens de lesões e dados clínicos de 222 pacientes (AI4Leprosy)',
          'Acurácia de 90% e área sob a curva de 96,46%',
          'Apoio ao diagnóstico por imagem, distinto da abordagem textual'
        ],
        [
          'Simões *et al.* (2025)',
          'Triagem com o Questionário de Suspeição de Hanseníase (MaLeSQs)',
          'Sensibilidade de 85,7% e especificidade de 69,2%',
          'Triagem por questionário, sem apoio informacional textual'
        ]
      ],
      fonte: 'Fonte: Elaboração própria (2026).'
    }
  },
  {
    id: 'R-024',
    secao: '2.8',
    motivo:
      'P1: o texto afirmava que o trabalho não dispunha de avaliação por especialistas e não mencionava a avaliação experimental; passa a refletir o estado atual, sem ampliar o alcance dos resultados.',
    tipo: 'substituir',
    antes: 'Em relação a esses trabalhos, o presente estudo',
    depois:
      'Em relação a esses trabalhos, o presente estudo diferencia-se em quatro aspectos. Primeiro, dirige-se ao apoio informacional em linguagem natural sobre a hanseníase, e não à triagem, à classificação ou ao diagnóstico. Segundo, opera em português e com documentos oficiais brasileiros e da OMS. Terceiro, trata a segurança como requisito de arquitetura, com regras de recusa implementadas em código, sinalização de risco e registro de cada consulta. Quarto, avalia respostas abertas, e não de múltipla escolha, por meio de uma avaliação com perguntas curadas e de uma comparação planejada, por participantes, entre respostas produzidas com e sem recuperação. Em comparação com Xiong *et al.* (2024) e Zakka *et al.* (2024), a base de conhecimento é restrita a cinco documentos, e a participação de especialistas limita-se, nesta versão, à revisão de uma amostra das respostas (Seção 3.8.4), limitação discutida no Capítulo 6.'
  },

  // -------------------------------------------------------------------------
  // Coerência com os demais capítulos
  {
    id: 'R-025',
    secao: '1 (questões de pesquisa)',
    motivo: 'P1: a avaliação experimental (Seção 3.8) não era mencionada na Introdução; a frase a situa em relação às questões de pesquisa, sem alterá-las (ver pendência D-01).',
    tipo: 'substituir',
    antes: 'As questões QP1 e QP2 são tratadas pelo desenvolvimento',
    depois:
      'As questões QP1 e QP2 são tratadas pelo desenvolvimento e pela avaliação técnica do sistema, complementada por uma avaliação experimental com 50 perguntas curadas, que examina a correção e a fundamentação das respostas geradas (Seção 3.8). A QP3 depende de uma avaliação com participantes que, no estágio atual do trabalho, está planejada e ainda não foi realizada.'
  },
  {
    id: 'R-026',
    secao: '1.3',
    motivo: 'P1: a organização do trabalho não incluía a avaliação experimental nem os Apêndices H a K.',
    tipo: 'substituir',
    antes: 'Além desta introdução, o trabalho está organizado',
    depois:
      'Além desta introdução, o trabalho está organizado em seis capítulos. O Capítulo 2 apresenta o referencial teórico, abordando a hanseníase e a informação clínica, os sistemas de apoio à decisão clínica, os modelos de linguagem, a recuperação de informação, a arquitetura RAG, a avaliação desses sistemas, o estado da arte e os trabalhos relacionados. O Capítulo 3 descreve a metodologia, distinguindo as etapas de desenvolvimento do sistema, a avaliação técnica, a avaliação comparativa planejada e a avaliação experimental com perguntas curadas. O Capítulo 4 detalha o sistema desenvolvido. O Capítulo 5 reúne os resultados disponíveis, incluindo os resultados preliminares da avaliação experimental, e a estrutura destinada aos resultados da avaliação comparativa. O Capítulo 6 discute os resultados e as limitações, e o Capítulo 7 apresenta as considerações finais. Os apêndices trazem as perguntas e a análise por pergunta da avaliação técnica preliminar, a composição da base inicial, as respostas de recusa definidas na política de segurança, a estrutura prevista para o instrumento de avaliação, o conjunto de referência e os resultados por pergunta da avaliação com a base oficial e, para a avaliação experimental, as perguntas, a rubrica, o modelo da ficha da especialista e o resultado por pergunta.'
  },
  {
    id: 'R-027',
    secao: '3 (abertura)',
    motivo: 'P1: a abertura do capítulo não mencionava a Seção 3.8.',
    tipo: 'substituir',
    antes: 'Este capítulo descreve os procedimentos adotados e planejados',
    depois:
      'Este capítulo descreve os procedimentos adotados e planejados na pesquisa. A Seção 3.1 caracteriza a pesquisa, e a Seção 3.2 apresenta suas etapas. As Seções 3.3 e 3.4 tratam da construção da base de conhecimento e do desenvolvimento do sistema. A Seção 3.5 descreve a avaliação técnica do *pipeline*, incluindo a comparação de modelos de linguagem usada na escolha do modelo gerador, e a Seção 3.6, a avaliação comparativa com participantes, ainda não realizada. A Seção 3.7 discute as ameaças à validade dessas avaliações, e a Seção 3.8 descreve a avaliação experimental com 50 perguntas curadas, realizada depois da escolha do modelo gerador, cujas ameaças à validade são discutidas na Seção 6.5. Ao longo do capítulo, distinguem-se os procedimentos já executados daqueles planejados, e as decisões ainda pendentes são indicadas nos pontos em que deverão ser registradas.'
  },
  {
    id: 'R-028',
    secao: '3.2 (Quadro 2)',
    motivo: 'P1: a situação do objetivo d) não registrava a avaliação experimental.',
    tipo: 'substituir',
    antes: 'Executada com a base oficial e seis configurações de modelo gerador',
    depois:
      'Executada com a base oficial e seis configurações de modelo gerador, com métricas automáticas; avaliação experimental com 50 perguntas curadas executada (Seção 3.8), com resultados preliminares que aguardam a revisão por especialista',
    md: {
      antes: 'Executada com a base oficial e seis configurações de modelo gerador; métricas automáticas, sem revisão das respostas por especialista',
      depois:
        'Executada com a base oficial e seis configurações de modelo gerador, com métricas automáticas; avaliação experimental com 50 perguntas curadas executada (Seção 3.8), com resultados preliminares que aguardam a revisão por especialista'
    }
  },
  {
    id: 'R-029',
    secao: '5 (abertura)',
    motivo: 'P1: a abertura do capítulo não mencionava a Seção 5.4.',
    tipo: 'substituir',
    antes: 'Este capítulo reúne três tipos de resultado',
    depois:
      'Este capítulo reúne quatro tipos de resultado, que não devem ser confundidos. A Seção 5.1 sintetiza o artefato desenvolvido, resultado das etapas de projeto e desenvolvimento. A Seção 5.2 apresenta a avaliação técnica do *pipeline*: a execução preliminar, com a base inicial e *embeddings* determinísticos, e a avaliação com a base oficial, que incluiu a comparação de modelos geradores. A Seção 5.3 contém a estrutura destinada aos resultados da avaliação comparativa com participantes, que ainda não foi realizada, e a Seção 5.4 apresenta os resultados preliminares da avaliação experimental com perguntas curadas.'
  },
  {
    id: 'R-030',
    secao: '7',
    motivo: 'P1: as considerações finais não mencionavam a avaliação experimental; o parágrafo resume os resultados preliminares sem extrapolar.',
    tipo: 'inserir_depois',
    antes: 'Do ponto de vista da Engenharia de Software, a principal',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'A avaliação experimental com 50 perguntas curadas, em sua maioria derivadas de dúvidas publicadas e não elaboradas junto com a base, acrescentou uma medida da correção das respostas. Nos resultados preliminares, obtidos com avaliação automatizada por modelo de linguagem, 65,3% das respostas foram consideradas corretas, todas as respostas a perguntas que os documentos não cobrem reconheceram a limitação e nenhuma teve erro classificado como de potencial dano; as falhas concentraram-se nas perguntas sobre tratamento e tiveram origem, em parte, na extração dos documentos. Esses números dependem da revisão por especialista, ainda em andamento (Seção 5.4).'
      }
    ]
  },
  {
    id: 'R-031',
    secao: '7',
    motivo: 'P1: as etapas para concluir a pesquisa não incluíam a revisão por especialista da avaliação experimental.',
    tipo: 'substituir',
    antes: 'O trabalho tem limitações que condicionam',
    depois:
      'O trabalho tem limitações que condicionam o alcance de suas conclusões, discutidas nas Seções 6.4 e 6.5, das quais se destacam a ausência de revisão da base por profissional de saúde, a revisão das respostas por especialista ainda em andamento, o conjunto de referência da avaliação técnica elaborado pelo próprio desenvolvedor e a ausência, até aqui, da avaliação comparativa. Para concluir a pesquisa, são necessárias as seguintes etapas: concluir a revisão por especialista da avaliação experimental e consolidar seus resultados; definir com o orientador a revisão do conteúdo da base por profissional de saúde; substituir a simulação da tela de comparação por geração real no Cenário B; definir o protocolo da avaliação comparativa e verificar seu enquadramento ético; e conduzir e analisar a avaliação com participantes.'
  },
  {
    id: 'R-032',
    secao: 'Resumo',
    motivo: 'P1: o resumo não mencionava a avaliação experimental; acrescenta uma frase com os resultados preliminares e sua condição. Resumo com cerca de 470 palavras (NBR 6028: até 500 em trabalhos acadêmicos).',
    tipo: 'substituir',
    antes: 'A hanseníase permanece como problema de saúde pública no Brasil',
    depois:
      'A hanseníase permanece como problema de saúde pública no Brasil, segundo país em número de casos novos da doença no mundo, com proporção crescente de casos multibacilares e de diagnósticos realizados com incapacidade física já instalada. Na atenção primária à saúde, a consulta a orientações técnicas durante o atendimento é uma necessidade recorrente, e os modelos de linguagem de grande escala surgem como meio de localizar e sintetizar informação clínica, embora estejam sujeitos a alucinações e não indiquem a origem do que afirmam. Este trabalho apresenta o desenvolvimento do NexoHansen, um sistema de apoio informacional à decisão clínica em hanseníase baseado em Geração Aumentada por Recuperação (RAG), e o planejamento de uma avaliação comparativa entre respostas produzidas com e sem recuperação. A pesquisa, de natureza aplicada, foi organizada segundo a metodologia de pesquisa em ciência do design. O sistema foi implementado em Node.js e TypeScript, com PostgreSQL e pgvector, e combina a interpretação da pergunta no contexto da conversa, busca híbrida vetorial e textual com fusão por posição recíproca, regras explícitas de segurança aplicadas antes da geração, respostas restritas aos trechos recuperados, com citações verificadas e referências às páginas dos documentos de origem, e registro das consultas para auditoria, além de uma interface web em React. O acesso exige autenticação por usuário e senha, e cada resposta pode ser avaliada pelo usuário em escala de 0 a 10, com registro vinculado ao usuário e à resposta, mecanismo destinado a apoiar a avaliação com participantes. A base de conhecimento reúne cinco documentos oficiais do Ministério da Saúde e da Organização Mundial da Saúde, processados em 328 trechos. Uma avaliação técnica preliminar, com uma base inicial de desenvolvimento e *embeddings* determinísticos, resultou na recusa de todas as perguntas, porque o limiar de relevância era incompatível com a escala de pontuação do provedor, e motivou a reformulação da recuperação e das regras de segurança. Na nova avaliação, com 32 perguntas de referência e *embeddings* semânticos, o sistema apresentou o comportamento esperado em todas as perguntas e recuperou a evidência entre os trechos usados como contexto em todas as que a possuem. A comparação de seis configurações de modelo gerador, com medição do consumo real, levou à escolha do `gpt-6-luna`, de desempenho equivalente ao do modelo usado anteriormente e custo 41% menor. Uma avaliação experimental posterior, com 50 perguntas curadas respondidas duas vezes e avaliadas de forma automatizada por um modelo de linguagem segundo rubrica fixa, indicou acurácia preliminar de 65,3%, nenhuma resposta com erro classificado como de potencial dano e desempenho inferior nas perguntas sobre tratamento. Esses resultados decorrem de avaliações automatizadas, e a revisão das respostas por especialista está em andamento. [[[ATUALIZAR APÓS A AVALIAÇÃO COMPARATIVA: síntese dos resultados obtidos com os participantes e conclusão principal, sem extrapolar para eficácia clínica.]]]'
  },
  {
    id: 'R-033',
    secao: 'Abstract',
    motivo: 'P1: correspondência com o resumo revisado.',
    tipo: 'substituir',
    antes: 'Leprosy remains a public health problem in Brazil',
    depois:
      'Leprosy remains a public health problem in Brazil, the country with the second highest number of new cases in the world, with a growing proportion of multibacillary cases and of diagnoses made after physical disability has already developed. In primary health care, consulting technical guidance during consultations is a recurring need, and large language models have emerged as a means of locating and summarizing clinical information, although they are prone to hallucinations and do not indicate the origin of their statements. This work presents the development of NexoHansen, an informational clinical decision support system for leprosy based on Retrieval-Augmented Generation (RAG), and the planning of a comparative evaluation between answers produced with and without retrieval. The research is applied in nature and was organized according to the design science research methodology. The system was implemented in Node.js and TypeScript, with PostgreSQL and pgvector, and combines question interpretation in the context of the conversation, hybrid vector and full-text search with reciprocal rank fusion, explicit safety rules applied before generation, answers restricted to the retrieved passages, with verified citations and references to the pages of the source documents, and query logging for auditing, in addition to a React web interface. Access requires username and password authentication, and users can rate each answer on a scale from 0 to 10, with the rating linked to the user and to the answer, a mechanism intended to support the evaluation with participants. The knowledge base comprises five official documents from the Brazilian Ministry of Health and the World Health Organization, processed into 328 passages. A preliminary technical evaluation, with an initial development base and deterministic embeddings, resulted in the refusal of all questions, because the relevance threshold was incompatible with the score scale of the provider, and led to the redesign of retrieval and of the safety rules. In the new evaluation, with 32 reference questions and semantic embeddings, the system showed the expected behavior for all questions and retrieved the evidence among the passages used as context for all questions that have it. The comparison of six generator model configurations, with measurement of actual usage, led to the choice of `gpt-6-luna`, with performance equivalent to that of the previously used model at a 41% lower cost. A subsequent experimental evaluation, with 50 curated questions answered twice and assessed automatically by a language model following a fixed rubric, indicated a preliminary accuracy of 65.3%, no answer with an error classified as potentially harmful, and lower performance on treatment questions. These results rely on automated evaluations, and the review of the answers by a specialist is in progress. [[[ATUALIZAR APÓS A AVALIAÇÃO COMPARATIVA: traduzir para o inglês a síntese dos resultados e a conclusão incluídas no resumo.]]]'
  }
];
