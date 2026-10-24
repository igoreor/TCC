# Pendências do TCC — NexoHansen

Complemento da versão revisada `TCC_NexoHansen_Versao_Revisada.docx` (20/10/2026, atualizada em 23 e 24/10/2026). Lista o que falta para concluir a pesquisa, em ordem de prioridade.

## Atualização de 24/10/2026

O texto foi atualizado para a versão do sistema com a base oficial, a nova recuperação e a escolha do modelo gerador. Os bloqueantes 1 a 4 foram concluídos (ver a seção 1).

- **Capítulo 3.**
  - Seção 3.3.2 preenchida: documentos, critérios, processamento, fragmentação, conferência e versão da base. Quadro novo com os cinco documentos.
  - Seção 3.5 reescrita, com as subseções 3.5.1 (conjunto de 32 perguntas e métricas) e 3.5.2 (comparação de modelos).
  - Ajustes nas Seções 3.2, 3.4, 3.6.2 (item g e quadro de parâmetros), 3.6.4, 3.6.9 (banco nos EUA) e 3.7.
- **Capítulo 4.** Seções 4.4 e 4.5 reescritas:
  - interpretação da pergunta;
  - fusão por posição recíproca, com a equação nova;
  - verificação de evidência;
  - segurança com seis regras;
  - geração com verificação das citações.
  
  Seção 4.9 nova, com o quadro de problemas e alterações. Quadro de testes com 113 testes. Publicação na Vercel registrada na Seção 4.2.
- **Capítulo 5.** Seção 5.2 dividida em 5.2.1 (execução preliminar, texto mantido), 5.2.2 (avaliação com a base oficial) e 5.2.3 (comparação de modelos e escolha do `gpt-6-luna`). Tabelas novas: resultados por versão, comparação de modelos, e tempo e custo.
- **Capítulos 6 e 7.** QP2 respondida; Seção 6.3 com a sexta e a sétima observações; limitações reescritas; considerações e trabalhos futuros atualizados.
- **Figuras.**
  - Refeitas: etapas, arquitetura, modelo de dados (com `IngestionRun`), fluxo da consulta, página inicial e exemplo ilustrativo.
  - Novas: resposta na gaveta e lista de fontes, capturadas com resposta real do `gpt-6-luna` em banco descartável.
- **Apêndices.** A, B e D passam a se referir à avaliação preliminar; C traz as mensagens de recusa atuais; F (conjunto de referência) e G (resultados por pergunta) são novos.
- **Referências.**
  - ISBN do PCDT corrigido para 978-65-5993-397-6, conforme a ficha catalográfica.
  - Novas: Estratégia Nacional 2024–2030, Diretrizes da OMS (2019), *Management of reactions* (OMS, 2020b), Estratégia Global (OMS, 2021) e a tabela de preços da OpenAI.
  - O roteiro de DTN da OMS passou a 2020a.
- **Resumo, abstract, objetivos e siglas.** Atualizados; siglas novas: BCG, HNSW, ISBN, PDF e PQT-U.

O relatório técnico da comparação de modelos está em `backend/docs/avaliacao-modelos.md`, e os relatórios por execução, em `backend/knowledge-base/evaluation/results/`.

## Atualização de 23/10/2026

O texto foi atualizado para refletir o login e a avaliação das respostas, implementados em 22/10/2026:

- **Seção 4.6, nova.** Trata do controle de acesso e da avaliação das respostas. A antiga 4.6 (Interface web) passou a 4.7, e a antiga 4.7 (Verificação) passou a 4.8.
- **Quadros.** Quadro 5 com RF09 reescrito, RF10 e RNF04. Quadro 6 com as rotas `/api/auth/*`. Quadro 10 com os 69 testes (53 no servidor e 16 na interface).
- **Figuras.**
  - Figuras 2, 3 e 4 refeitas: arquitetura com o módulo de autenticação, modelo de dados com dez entidades e fluxo com a verificação da sessão.
  - Figuras 5 (componente de avaliação) e 8 (tela de login) são novas.
  - As demais capturas foram refeitas.
- **Capítulo 3.** Ajustes nas Seções 3.2, 3.4, 3.6.5, 3.6.6, 3.6.7 e 3.6.9 e no Quadro 2.
- **Capítulos 5 a 7.** Ajustes na Seção 5.1, nas Seções 6.3 e 6.4 (limitações f e i reescritas, j e k novas) e no Capítulo 7.
- **Resumo e abstract.** Incluem o login, a avaliação de 0 a 10 e os 69 testes.
- **Referências.** Nova referência: Percival e Josefsson (2016), RFC 7914, sobre o scrypt, conferida em rfc-editor.org.

## Marcadores no documento

Os pontos em aberto estão destacados em amarelo no DOCX. Para encontrá-los, use Localizar (Ctrl+L no Word) com o início do marcador, por exemplo `[PREENCHER`.

| Marcador | Qtd. | Quando resolver |
|---|---|---|
| `[PREENCHER ...]` | 35 | Após a etapa indicada no próprio marcador: protocolo ou coleta |
| `[DEFINIR ...]` | 7 | Decisões de método, junto com o orientador |
| `[ANALISAR ...]` | 5 | Após a consolidação das avaliações |
| `[ATUALIZAR ...]` | 3 | Resumo, abstract e considerações finais, ao fim do trabalho |
| `[VERIFICAR ...]` | 3 | Com o orientador ou com o CEP |
| `[INSERIR ...]` | 2 | Tabela e gráfico da avaliação comparativa |
| `[REESCREVER ...]` | 2 | Dedicatória e agradecimentos |
| `[OPCIONAL ...]` | 1 | Epígrafe |

---

## 1. Bloqueantes

Sem estes itens, a pesquisa não pode ser concluída. A lista está na ordem recomendada de execução.

1. **Construir a base de conhecimento a partir de documentos oficiais.** *Concluído em 23–24/10/2026.*
   - Cinco documentos (PCDT, Estratégia Nacional, três da OMS) foram processados em 328 trechos com seção e páginas e indexados em produção.
   - Pendente: a revisão do conteúdo por profissional de saúde, a decidir com o orientador.
2. **Corrigir a correspondência de padrões.** *Concluído.* Regras, intenção e risco passaram a usar palavras inteiras, sem acentos. As perguntas de regressão (R01 a R03) e os testes verificam os casos "Tenho…", "comparar" e "também". O risco depende só da pergunta.
3. **Preparar o ambiente da nova avaliação técnica.** *Concluído.* Chave configurada no `backend/.env` (não versionado). Base reindexada com `text-embedding-3-small`. O IVFFlat foi trocado por HNSW.
4. **Executar de novo a avaliação técnica.** *Concluído em 24/10/2026*, com 32 perguntas, seis configurações de modelo e duas execuções cada. Resultados por pergunta no Apêndice G e em `backend/knowledge-base/evaluation/results/`.
   - O limiar antigo foi substituído pela fusão por posição recíproca e pela similaridade mínima de 0,25.
   - Pendente: calibrar os limiares de evidência, hoje registrado como limitação (Seção 6.4, item c).
5. **Implementar o Cenário B real.** A tela `/comparacao` monta a resposta "genérica" por simulação no navegador. Ela precisa ser substituída por chamadas reais a um modelo de linguagem, com os parâmetros do Quadro 3 registrados. Onde fica: Seções 3.6.2 (item a) e 4.7, Figura 12.
6. **Definir o protocolo da avaliação comparativa.** Envolve os itens a–g da Seção 3.6.2 e as Seções 3.6.3 a 3.6.8, o Apêndice E e as medidas contra as ameaças da Seção 3.7.
7. **Verificar o enquadramento ético antes de qualquer coleta.** Isso deve ser feito com o orientador e o CEP da UPE, com base nas Resoluções CNS 466/2012 e 510/2016 e no Ofício Circular 17/2022/CONEP. Inclui preparar o TCLE ou instrumento equivalente. O texto não afirma dispensa nem aprovação.
8. **Proteger os dados antes de expor o sistema a participantes.** A autenticação já foi implementada (Seção 4.6). Ainda falta:
   - um aviso, na interface, contra a inserção de dados pessoais;
   - informar que as perguntas ficam registradas e vinculadas ao usuário e que, no modo com chave, são enviadas a um serviço externo (LGPD);
   - informar também a transferência internacional de dados: o sistema foi publicado na Vercel, com o banco na Neon, em servidores nos Estados Unidos (Seção 3.6.9);
   - criar as contas dos participantes com códigos não identificáveis, sem nome nem *e-mail* (Seção 3.6.7);
   - separar perfis de acesso: hoje, todo usuário cadastrado entra também no painel interno (`/dashboard`) e nas rotas de carga e de avaliação técnica (Seção 6.4, item j).
9. **Pedir a revisão externa das perguntas de avaliação.** As 32 perguntas do conjunto atual (Apêndice F) foram escritas pelo desenvolvedor, com conhecimento da base, o que favorece o Cenário A (Seção 3.6.4). A leitura das respostas mostrou um erro não captado pelas métricas (F02, tabela do PCDT), o que reforça a revisão por especialista.
10. **Gerar e guardar as respostas dos dois cenários antes da coleta.** As respostas não devem ser geradas em tempo real durante a sessão (Seção 3.6.5). O componente de avaliação de 0 a 10 avalia apenas respostas geradas na hora e só do Cenário A. Se a interface do sistema for o meio de aplicação, ela precisa ser adaptada para apresentar respostas pré-geradas dos dois cenários.
11. **Redigir os resultados depois da coleta.**
    - Preencher as Seções 5.3, 6.1 (QP3), 6.2, 6.3, 6.4 e 7, o Resumo e o Abstract.
    - Atualizar a Figura 1 e o Quadro 2. A fonte editável está em `figuras/editaveis/fig-etapas.svg`.
    - Refazer a captura da Figura 12 se a tela de comparação mudar.

## 2. Decisões para o orientador

- **Título.** O título registrado diz "Recuperação Aumentada por Geração", mas a tradução que preserva o sentido de *retrieval-augmented generation* é "Geração Aumentada por Recuperação". O texto adota esta última, com nota de rodapé na Introdução. É preciso decidir se o título pode ser ajustado.
- **Referencial metodológico.** Confirmar a adoção da pesquisa em ciência do design (Hevner *et al.*, 2004; Peffers *et al.*, 2007).
- **Abordagem.** Definir se a pesquisa será quantitativa, qualitativa ou mista (Seção 3.1).
- **Cenário B.** Escolher entre o mesmo modelo sem recuperação e um assistente de propósito geral. Definir também o formato de apresentação das respostas, o cegamento e o desenho (intra ou entre participantes).
- **Análise.** Definir os métodos estatísticos, o nível de significância e o procedimento de análise qualitativa (Seção 3.6.8).
- **Nota de 0 a 10.** Decidir se a nota global registrada pelo sistema entra no instrumento, por exemplo como avaliação geral ao lado das dimensões do Quadro 4 (Seção 3.6.6).
- **Revisões complementares.** Decidir sobre o uso de métricas automáticas (RAGAS) e sobre a revisão das respostas e da base por um profissional de saúde.
- **Nomes.** Indicar o(a) coorientador(a) (o campo estava em branco no rascunho) e os membros da banca.
- **Entrada do Ministério da Saúde.** A lista usa "MINISTÉRIO DA SAÚDE", como no TCC de exemplo. A NBR 6023:2018 indica a entrada pela jurisdição ("BRASIL. Ministério da Saúde"). Se essa forma for adotada, as citações passam a ser "(Brasil, 2022a)", "(Brasil, 2022b)" e assim por diante, porque já existem outras entradas "Brasil, 2022".
- **Modelo institucional.** O documento usa Arial 12, margens de 3 e 2 cm, espaçamento 1,5 e paginação no canto superior direito a partir da Introdução (NBR 14724). Confirmar com o modelo da UPE, incluindo a capa e a folha de aprovação. A ficha catalográfica vem da biblioteca.
- **Cronograma.** O cronograma do projeto foi retirado do corpo da monografia. Se o curso o exigir na versão final, ele deve ser reinserido.

## 3. Referências

### 3.1 A conferir ou completar

- As datas de acesso ("Acesso em: 20 out. 2026") devem ser atualizadas na versão final.
- A afirmação de lacuna na Seção 2.7.1 ("na literatura consultada, não foram identificados…") pede uma busca estruturada e documentada, com bases, termos e período. Sem ela, é preciso manter a ressalva.
- A dimensão "Confiança e utilidade percebidas" do Quadro 4 ainda não tem referência. É preciso localizar uma se ela for adotada.

### 3.2 Corrigidas em relação ao rascunho

Os dados abaixo foram conferidos nas fontes. Lopes, Palmeira e Simões foram conferidos também no Crossref.

| Rascunho | Versão revisada |
|---|---|
| Barbieri *et al.* "AI4Leprosy…", *PLOS NTD*, 2022 | Título e periódico corrigidos: *The Lancet Regional Health – Americas*, v. 9, 100192 |
| Fernandes, H. *et al.*, *PLOS Computational Biology*, 2024 | Fernandes, J. R. N. *et al.*, *Journal of Clinical Medicine*, v. 13, n. 1, 180 |
| Gama *et al.* "Machine learning for leprosy diagnosis…", 2019 | Título corrigido; *PLoS NTD*, v. 13, n. 6, e0007400 |
| Simões, C. *et al.*, "PMC", 2025 | Simões, M. M. R. *et al.*, *Scientific Reports*, v. 15, n. 1, 6912 |
| "IMPROVING Retrieval Augmented Generation…", *JMIR*, 2026 | Autoria incluída: Arzideh *et al.*, v. 28, e82997 |
| "PLOS COMPUTATIONAL BIOLOGY. MEGA-RAG…", 2025 | Xu *et al.*, *Frontiers in Public Health*, v. 13 |
| Yang, M. *et al.*, arXiv, 2024 | Versão publicada: Yang, R. *et al.*, *Cell Reports Medicine*, 2026 |
| Es *et al.* (RAGAS), arXiv, 2023 | Versão publicada: EACL 2024 (citação passa a ser 2024) |
| Miller; Pople; Myers, dados do *NEJM* (1982) com ano 1985 | Reimpressão de 1985 (Springer). Alternativa: citar o *NEJM* e usar 1982 no texto |
| Shortliffe, livro sobre o MYCIN, 1977 | Artigo do SCAMC de 1977, coerente com o ano citado no texto |
| Andrade *et al.*; Lewis; Vaswani; Thirunavukarasu; Xiong; Shortliffe; Cimino | Completadas com evento, páginas, DOI e local |

### 3.3 Substituídas: confirmar se são as obras pretendidas

A obra citada no rascunho não foi localizada com os dados informados. Em cada caso, usou-se o trabalho localizado do mesmo autor e ano sobre o mesmo tema.

- **Lopes.** O rascunho cita "LOPES, L. *et al.* Hanseníase, estigma social e serviço social. *Revista FT*, 2020". A versão revisada cita LOPES, E. F. B. *et al.* Educação em saúde: uma troca de saberes no combate ao estigma da hanseníase. *Brazilian Journal of Development*, v. 6, n. 2, p. 5350–5368, 2020.
- **Palmeira.** O rascunho cita "PALMEIRA, I. P. *et al.* Social impact of leprosy diagnosis. *Rev. Bras. Enferm.*, 2020". A versão revisada cita PALMEIRA, I. P. *et al.* Percepção de pacientes com hanseníase sobre suas necessidades humanas básicas alteradas… *Rev. Pesq. Cuid. Fundam. Online*, v. 12, p. 319–325, 2020.

### 3.4 Retiradas da lista

Estas obras deixaram de ser citadas porque as seções foram reescritas ou condensadas, ou porque vieram do TCC de exemplo. Se alguma voltar a ser usada, confira os dados completos.

- **Histórico de IA e de IA aplicada à hanseníase:** Bakkar *et al.*; Baweja; Parhar; Pal *et al.*; Yasir; Rahman; Ahmed; Massachusetts General Hospital (DXplain).
- **Contexto da doença:** Costa *et al.* (2020); Medeiros (2018). Do Ministério da Saúde: o *Manual de Condutas* (2022b), *Hanseníase: histórico e aspectos gerais* (2023) e o Boletim de 2025, este substituído pelo de 2026. Da OMS: o *Global leprosy update* (2023) e o *Global Report on NTDs* (2025).
- **Entrada incompleta:** Zhang *et al.* (2023), sem periódico ou evento. A afirmação que a citava foi retirada.
- **Sem relação com este trabalho (vieram do TCC de exemplo):** Wirth; Hipp (CRISP-DM); Zafar *et al.*; Zhao *et al.*

## 4. Inconsistências encontradas

### 4.1 Rascunho em relação ao código (já corrigidas no texto)

- **Arquitetura.** O rascunho previa Flutter e microsserviços em Spring Boot. O que foi implementado é React com TypeScript (Vite) e um servidor Node.js com TypeScript (Express) em módulos, sobre PostgreSQL e pgvector.
- **Ingestão.** O rascunho descrevia fragmentação e indexação de PDFs do PCDT. A ingestão atual recebe JSONL com trechos prontos.
- **Avaliação.** O rascunho prometia RAGAS com metas (fidelidade > 0,95, relevância > 0,85 e outras), sem fonte para os valores. Nada disso está implementado. O sistema mede a aproximação da revocação por trecho ideal e o número de recusas.
- **LGPD.** O rascunho afirmava que a interface orientaria a anonimização. Não há aviso. A autenticação foi implementada em 22/10/2026.
- **Resultados.** O rascunho afirmava que as respostas seriam mais precisas que as de modelos sem RAG. Não há evidência disso antes da avaliação comparativa.
- **Palavras-chave.** Havia uma segunda linha de palavras-chave do TCC de exemplo ("prognóstico; GIF; aprendizado de máquina"). Ela foi removida.
- **Elementos pré-textuais.** A dedicatória, os agradecimentos e a epígrafe reproduzem os do TCC de exemplo e estão marcados para reescrita, por risco de plágio. O nome da madrinha aparece como "Syanra" na dedicatória e "Synara" nos agradecimentos.

### 4.2 No código e na documentação do repositório (não corrigidas)

- **Origem dos trechos.** *Resolvido.* A base inicial ficou com situação "desenvolvimento" e fora da busca. Os documentos oficiais têm os metadados do manifesto.
- **Título dos documentos.** *Resolvido.* O título vem do manifesto, e não do último trecho ingerido.
- **Documentação do risco.** A seção 18 de `docs/arquitetura-backend-rag-hanseniase.md` ainda descreve o risco antigo. O código decide só pela pergunta (Seção 4.5.2 do TCC).
- **Descrição da tela de comparação.** O `CONTEXTO.md` a apresenta como "RAG vs. LLM genérico", mas o lado genérico é simulado.
- **Migrações.** Aplicadas ao banco de produção (Neon) em 24/10/2026; no banco local, aplicar com `npm run prisma:deploy`.
- **Publicação.** O sistema está publicado na Vercel. A versão com a base oficial entra no ar com o merge do branch `feat/rag-documentos-oficiais` na `main`.

## 5. Ordem sugerida para concluir

As datas devem ser definidas com o orientador.

1. Itens 1 a 4: concluídos em 24/10/2026; a QP2 está respondida na Seção 6.1.
2. Itens 5 a 9: Cenário B real, protocolo, ética, aviso de privacidade e revisão das perguntas e da base.
3. Item 10: gerar as respostas. Em seguida, a coleta, que só deve começar depois do item 7.
4. Item 11: análise e redação. Por último, atualizar o resumo, o abstract, a Figura 1 e o Quadro 2.

## 6. Como manter o documento

- **Sumário e listas.** Foram gerados já atualizados. Depois de editar no Word, selecione tudo (Ctrl+A) e pressione F9 para atualizar os números de página.
- **Legendas.** A numeração usa campos SEQ, mas as menções no texto ("Figura 4", "Quadro 9") são texto simples. Ao inserir uma figura ou um quadro novo, use Inserir legenda e revise as menções.
- **Google Docs.** O sumário pode ser atualizado no próprio Google Docs. As listas de figuras, quadros e tabelas podem virar texto fixo. Nesse caso, faça a revisão final no Word.
- **Figuras.**
  - As capturas de tela são as Figuras 5 a 13.
    - Figuras 6, 7, 10 e 11: interface de 24/10/2026, com a base oficial.
    - Figuras 5, 8, 9, 12 e 13: interface de 23/10/2026, cujas telas não mudaram.
    - A Figura 6 (página inicial) foi capturada sem login.
  - As Figuras 10 e 11 mostram uma resposta real do `gpt-6-luna` à pergunta "Baciloscopia negativa exclui hanseníase?". Foram geradas em banco descartável (PGlite) com a base oficial indexada, com usuário de teste criado pelo procedimento manual.
  - A Figura 5 mostra só o componente de avaliação, depois da escolha de uma nota, sem o texto da resposta.
  - Os diagramas (Figuras 1 a 4) têm fonte editável em SVG na pasta `figuras/editaveis/`.
  - A Figura 7 é o exemplo ilustrativo da página inicial, identificado como tal na própria interface, montado com trechos do PCDT.
