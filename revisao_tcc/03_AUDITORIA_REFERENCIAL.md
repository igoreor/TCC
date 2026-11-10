# 03 — Auditoria do referencial teórico

Data: 09/11/2026.

**Classificação usada:**
- **CONFIRMADA:** conteúdo conferido no texto integral, no resumo ou no documento oficial;
- **METADADOS APENAS:** a obra existe e os dados conferem, mas o conteúdo não foi reaberto nesta revisão;
- **INCONSISTENTE:** corrigida;
- **NÃO CONFERIDA.**

Um DOI não foi tomado como prova de que uma afirmação está no artigo.

## 1. Fontes citadas no Capítulo 2

| Obra | Onde é citada | Status | Como foi verificada | Observação |
|---|---|---|---|---|
| Ministério da Saúde (2022), PCDT | 2.1 | CONFIRMADA | Texto do PDF no repositório (`avaliacao/corpus_texto/ms-pcdt-hanseniase-2022.md`) | Conferidos: incubação (Seção 1, p. 15–16); diagnóstico clínico na APS (6.2, p. 26); PB/MB, dúvida → MB e critério de nervos (6.3, p. 26–27); teste rápido (7.6, p. 48–49); PQT e cura em até 98% (10.1); talidomida na gravidez (monografia do medicamento) |
| Brasil (1995), Lei nº 9.010 | 2.1.3 | METADADOS APENAS | Endereço oficial na referência | Conteúdo (vedação do termo "lepra" em documentos oficiais) não reaberto |
| Lopes *et al.* (2020) | 2.1.3 | CONFIRMADA (resumo) | Página do periódico (Brazilian Journal of Development, DOI 10.34117/bjdv6n2-001) | Ação educativa contra o estigma; sustenta a menção a preconceito e segregação |
| Palmeira *et al.* (2020) | 2.1.3 | CONFIRMADA (resumo) | Revista Cuidado é Fundamental (DOI 10.9789/2175-5361.rpcfo.v12.7069) | Necessidades humanas básicas alteradas, entre elas sociais e de estima |
| Sutton *et al.* (2020) | 2.2 | METADADOS APENAS | — | Riscos citados coerentes com o título e o escopo; frase sobre "estratégias recomendadas" retirada (R-005) |
| Shortliffe; Cimino (2014); Miller; Pople Jr.; Myers (1985); Shortliffe (1977) | 2.2 | METADADOS APENAS | — | Obras clássicas; afirmações históricas gerais |
| Vaswani *et al.* (2017) | 2.3 | METADADOS APENAS | — | Definição da arquitetura Transformer |
| Singhal *et al.* (2023); Thirunavukarasu *et al.* (2023) | 2.3, 2.6 | METADADOS APENAS | — | Conteúdo não reaberto; afirmações gerais, compatíveis com os artigos |
| Ji *et al.* (2023) | 2.3 | METADADOS APENAS | — | Distinção intrínseca × extrínseca |
| Manning; Raghavan; Schütze (2008); Robertson; Zaragoza (2009); Clarke; Cormack; Tudhope (2000); PostgreSQL (2026) | 2.4 | METADADOS APENAS | — | Definições e documentação técnica |
| Karpukhin *et al.* (2020) | 2.4.2 | INCONSISTENTE → corrigida | Conhecimento do método DPR | O DPR usa produto interno, não similaridade de cosseno (R-008) |
| Lee *et al.* (2020), BioBERT | 2.4.2 | METADADOS APENAS | — | Reclassificado como modelo de linguagem pré-treinado (R-009) |
| OpenAI (2024) | 2.4.2 | METADADOS APENAS | — | 1.536 dimensões do `text-embedding-3-small` |
| Arzideh *et al.* (2026) | 2.4.2 | CONFIRMADA (página e resumo) | JMIR, v. 28, e82997 | Ajuste do multilingual-e5-large com documentos clínicos alemães. Os números do preprint não foram usados |
| Yang *et al.* (2026) | 2.4.2, 2.6, 2.7.2 | CONFIRMADA (resumo) | Repositório UNIGE (Cell Reports Medicine, 102927, DOI 10.1016/j.xcrm.2026.102927); arXiv 2511.05901 | Embeddings centrados no inglês; avaliações humanas em acurácia, completude, relevância e fluência; estágio inicial; validação clínica, outros idiomas e poucos recursos |
| Kane (2026), pgvector | 2.4.2 | METADADOS APENAS | — | Documentação do projeto |
| Cormack; Clarke; Büttcher (2009) | 2.4.3 | METADADOS APENAS | — | RRF |
| Xu *et al.* (2025), MEGA-RAG | 2.4.3, 2.7.2, Quadro 1 | CONFIRMADA (texto integral) | PMC12540348 | Componentes conferidos; os "mais de 40%" estão só no resumo, e o corpo não define a taxa (ressalva incluída, R-020) |
| Nogueira; Cho (2019) | 2.4.3 | METADADOS APENAS | — | Reordenação com BERT |
| Lewis *et al.* (2020); Gao *et al.* (2023) | 2.5 | METADADOS APENAS | — | Gao *et al.* é preprint do arXiv, não revisado por pares |
| Zakka *et al.* (2024), Almanac | 2.5.2, 2.6, 2.7.2, Quadro 1 | INCONSISTENTE → corrigida e CONFIRMADA (resumo publicado) | Resumo do NEJM AI (PubMed 38343631) | Os números anteriores (130 cenários, +18%) eram do preprint de 2023. Publicado: 314 perguntas, 9 especialidades, 8 médicos e 2 profissionais de saúde, comparação com ChatGPT-4, Bing e Bard |
| Es *et al.* (2024), RAGAs | 2.5.2, 2.6 | METADADOS APENAS | — | Métricas de fidelidade e relevância |
| Brasil (2018), LGPD | 2.5.3 | METADADOS APENAS | — | — |
| Amugongo *et al.* (2025) | 2.6, 2.7.2, Quadro 1 | CONFIRMADA (texto integral) | PMC12157099 | 70 estudos (2020–2025), selecionados de 2.139; 78,9% com dados em inglês; falta de *frameworks* padronizados; maioria sem exame de questões éticas |
| Zheng *et al.* (2023) | 2.6 (novo) | CONFIRMADA (resumo publicado) | Página NeurIPS 2023 | Concordância acima de 80% com preferências humanas; vieses de posição, verbosidade e autofavorecimento |
| Panickssery; Bowman; Feng (2024) | 2.6 (novo) | CONFIRMADA (resumo e anais) | Anais NeurIPS 2024; DOI 10.52202/079017-2197 | Autorreconhecimento correlacionado ao viés de autopreferência |
| Cohen (1968) | 2.6 (novo) | METADADOS APENAS | — | Kappa ponderado para discordância graduada (definição do próprio título) |
| Fernandes *et al.* (2024) | 2.7.1, Quadro 1 | CONFIRMADA (parcial) | PMC10779723 | Confirmados 1.659/21, maioria com imagens e estágio inicial. Distribuição 15/1/5 e "nenhum baseado em texto" não confirmadas e retiradas (D-03) |
| Barbieri *et al.* (2022) | 2.7.1, Quadro 1 | CONFIRMADA (resumo) | Lancet Reg. Health Am. 9:100192 | 222 pacientes, 1.229 imagens, 585 metadados, acurácia de 90% e AUC de 96,46%; validação futura com outros tipos de pele e *smartphones* |
| Gama *et al.* (2019) | 2.7.1 | METADADOS APENAS | — | Predição entre contatos com dados moleculares e sorológicos |
| Simões *et al.* (2025) | 2.7.1, Quadro 1 | CONFIRMADA (resumo) | Sci Rep 15:6912 | SVM: sensibilidade de 85,7%, especificidade de 69,2% e AUC de 0,775 |
| Andrade *et al.* (2024) | 2.7.1 | CONFIRMADA (página dos anais) | SOL/SBC, SBSC 2024, p. 151–156 | Aplicativo colaborativo em prototipação, para decisão sobre tratamento de DTN |
| Xiong *et al.* (2024) | 2.4.3, 2.7.2, Quadro 1 | CONFIRMADA (resumo) | ACL Anthology 2024.findings-acl.372 | 7.663 perguntas de cinco conjuntos; avaliação em múltipla escolha; ganhos de até 18% |

**Fora do Capítulo 2, mas conferido de passagem:**
- **Boletim Epidemiológico 2026 (Introdução):**
  - 11,5% de casos com grau 2 em 2024 e "cerca de 22 mil" casos novos aparecem em fontes secundárias;
  - os valores exatos 22.129 e 10,41 não foram localizados nesta revisão (D-04).

**Cruzamento citação ↔ referência:**
- Todas as citações do texto têm entrada na lista.
- Todas as entradas da lista são citadas pelo menos uma vez.
- A conferência foi automática sobre o .md, com revisão manual dos casos de vários autores.

## 2. Matriz conceito → fonte → relevância

| Subseção | Conceito indispensável | Fontes | Convergência ou divergência | Uso no TCC |
|---|---|---|---|---|
| 2.1.1 | Classificação operacional e critério de nervos | PCDT (2022) | O PCDT registra divergência OMS × literatura brasileira sobre o nervo único | Regra do *prompt* para divergências (4.5.6); divergências na referência da avaliação experimental (3.8.3) |
| 2.1.2 | Diagnóstico clínico, PQT-U, reações | PCDT (2022) | — | Categorias de perguntas e regras de segurança (4.5.5) |
| 2.1.3 | Estigma | Lei 9.010; Lopes (2020); Palmeira (2020) | — | Categoria psicossocial (4.5.2) |
| 2.2 | CDSS baseados em conhecimento; riscos | Sutton (2020); clássicos | — | Delimitação do sistema como apoio informacional; resposta a desatualização e dependência |
| 2.3 | Alucinação intrínseca e extrínseca | Ji (2023); Singhal (2023); Thirunavukarasu (2023) | — | Regras de geração (4.5.6); critério de alucinação da avaliação (3.8.4) |
| 2.4 | Recuperação lexical, densa, híbrida e RRF | Manning; Robertson; Karpukhin; Cormack | Lexical e densa falham em situações diferentes | Busca híbrida com RRF (4.5.3) |
| 2.4.2 | Idioma dos modelos de *embedding* | Yang (2026); Arzideh (2026) | Ambos apontam o viés para o inglês | Escolha de modelo geral sem ajuste; discussão em 6.2 |
| 2.5 | RAG, fundamentação, rastreabilidade | Lewis; Gao; Zakka; Es | Citar não garante fidelidade (Es) | Citações verificadas (4.5.6); registro para auditoria (4.5.7) |
| 2.6 | Avaliação de recuperação, de geração e por modelo avaliador | Manning; Es; Singhal; Zakka; Amugongo; Yang; Zheng; Panickssery; Cohen | O modelo avaliador concorda com humanos em tarefas gerais, mas tem vieses | Avaliação técnica (3.5); avaliação experimental com validação por especialista e kappa (3.8) |
| 2.7.1 | IA em hanseníase: tarefas e dados | Fernandes; Barbieri; Simões; Gama; Andrade | Todos tratam de classificação ou triagem | Lacuna do apoio informacional (2.8) |
| 2.7.2 | RAG em medicina | Xiong; Zakka; Xu; Amugongo; Yang | Ganhos com recuperação; avaliação não padronizada | Comparação e limites (2.8, 6.2) |

## 3. Pendências de fonte

- **D-03:** confirmar, na Seção 4.2 e na Tabela 4 de Fernandes *et al.* (2024), a distribuição dos estudos por tipo de dado. Se confirmada, ela pode voltar ao texto.
- **D-05 (opcional):** um estudo sobre necessidades de informação de profissionais da APS em hanseníase daria suporte empírico à premissa da Seção 2.1.2. Sem esse estudo, a frase permanece como premissa declarada.
- **D-04:** conferir no PDF do Boletim Epidemiológico 2026 os valores 22.129 casos novos e taxa de 10,41 por 100 mil habitantes, citados na Introdução.

## 4. Fontes consultadas nesta auditoria

- Amugongo *et al.* (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC12157099/
- Fernandes *et al.* (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC10779723/
- Xu *et al.*, MEGA-RAG (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC12540348/
- Zakka *et al.*, Almanac (resumo NEJM AI, BVS/PubMed): https://pesquisa.bvsalud.org/ses/resource/pt/mdl-38343631
- Yang *et al.*: https://archive-ouverte.unige.ch/unige:195436 e https://arxiv.org/abs/2511.05901v1
- Arzideh *et al.*: https://www.jmir.org/2026/1/e82997
- Barbieri *et al.*: https://pmc.ncbi.nlm.nih.gov/articles/PMC9903738
- Simões *et al.*: https://www.leprosy-information.org/resource/development-and-validation-machine-learning-approach-screening-new-leprosy-cases-based
- Andrade *et al.*: https://sol.sbc.org.br/index.php/sbsc/article/view/28111
- Lopes *et al.*: https://ojs.brazilianjournals.com.br/ojs/index.php/BRJD/article/view/6590
- Palmeira *et al.*: https://seer.unirio.br/cuidadofundamental/article/download/7069/pdf/46874
- Panickssery *et al.*: https://papers.nips.cc/paper_files/paper/2024/hash/7f1f0218e45f5414c79c0679633e47bc-Abstract-Conference.html
- Zheng *et al.*: https://neurips.cc/virtual/2023/poster/73434
- Xiong *et al.*: https://aclanthology.org/2024.findings-acl.372
- Boletim Epidemiológico 2026: https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/boletins/epidemiologicos/especiais/2026/boletim-epidemiologico-de-hanseniase-numero-especial-jan-2026.pdf
