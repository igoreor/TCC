# Diário do experimento

Registro cronológico das decisões e dos problemas da avaliação descrita em `AVALIACAO_HANSENIASE.md`. Horários no fuso de Brasília (UTC−3). Executor: Claude Code, modelo Claude Opus 5.5 (`claude-opus-5-5`), agindo sob instrução do autor do TCC.

## 09/11/2026

### Decisões tomadas antes da Fase 0

O autor pediu execução autônoma ("tome todas as ações recomendadas e não me pergunte nada"). As quatro decisões apresentadas no plano foram tomadas conforme a recomendação:

1. **Corpus.** O protocolo cita as Portarias SCTIE/MS nº 47 e nº 51/2026 e uma orientação técnica da OMS de 2023, que não estão no repositório. Pela regra 3 ("nas versões que estão no repositório"), a avaliação usa o corpus indexado: PCDT da Hanseníase (2022), Estratégia Nacional 2024–2030, Diretrizes da OMS (tradução de 2019), *Leprosy/Hansen disease: management of reactions and prevention of disabilities* (OMS, 2020) e Estratégia Global de Hanseníase 2021–2030 (OMS, 2021). Nenhum documento foi acrescentado, para não alterar a IA avaliada (regra 1). As perguntas que dependem das normas de 2026 são classificadas pela cobertura real do corpus na Fase 3.
2. **Linguagem dos scripts.** Python não está instalado na máquina. Os scripts foram escritos em TypeScript (Node.js 22), a mesma pilha do projeto, o que também permite chamar a IA pelo código do próprio backend. Desvio em relação à preferência por Python registrado aqui.
3. **Edição do TCC.** As fontes Markdown e o gerador usados nas versões anteriores do `.docx` estavam numa pasta temporária que não existe mais. A atualização é feita diretamente no XML do `.docx`, com realce amarelo nativo do Word, seguida da atualização de campos (sumário, listas e numeração) pelo próprio Word.
4. **Similaridade semântica entre execuções.** O BGE-M3 não está disponível. Usa-se o modelo `text-embedding-3-small` (OpenAI), já usado pelo sistema.

### Fase 0 — Reconhecimento

- **Invocação da IA.** `avaliacao/cliente_ia.ts` executa o `ChatService` do backend (o mesmo fluxo da rota `POST /api/chat/ask`) dentro do processo, contra o banco de produção, com um repositório que só lê: conversas e registros ficam em memória. Cada chamada abre uma sessão nova, sem histórico, com o perfil "Profissional de saúde", o mesmo fixado na consulta pública do sistema. Tokens e latência são medidos por interceptação das chamadas à API da OpenAI.
- **Configuração congelada** em `config_experimento.json`: commit `b5acde7`, o mesmo publicado em produção, sem alterações locais no backend; modelo `gpt-6-luna` sem raciocínio, temperatura 0,1; `text-embedding-3-small`; top-K 20, top-N 8, similaridade mínima 0,25; SHA-256 do prompt de sistema, dos PDFs e dos trechos processados.
- **Corpus.** Os SHA-256 dos 5 PDFs conferem com o manifesto, e o número de trechos processados (131, 39, 49, 63, 46) é igual ao número de trechos no banco. Todos os documentos são recortados. No PCDT foram excluídos as referências, os apêndices (fluxogramas e metodologia de busca) e os anexos (portaria, painel GRADE e formulários), o que responde ao que a T49 pressupõe.
- **TCC.** O arquivo é `TCC/TCC_NexoHansen_Versao_Revisada.docx`, com a versão em Markdown gerada ao lado. Metodologia no Capítulo 3, resultados no Capítulo 5, discussão e limitações no Capítulo 6, apêndices A a G.
- **Chamada de teste** ("O que é hanseníase?"), fora do conjunto: 10,9 s, sem recusa, 3 fontes citadas. Gravada em `teste_adaptador.json` e excluída dos resultados.
- O plano foi apresentado ao autor, que mandou seguir sem confirmação adicional.

### Fase 1 — Congelamento das perguntas

- 50 perguntas extraídas por script (`fase1_perguntas.ts`) da PARTE 3 do protocolo. A distribuição confere com a matriz: 25 leigas e 25 técnicas; 16 publicadas, 18 adaptações, 15 autorais e 1 em decisão (T36); 10 temas.
- Marcadores de nota removidos do texto enviado à IA: ¹ em T16, T25, T28, T32 e T33; ² em T48.
- **Compostas: 13, e não 15 como prevê a matriz.** A classificação é inferida (`composta_fonte: "inferida"`), com a justificativa de cada uma no próprio arquivo: T05, T06, T07, T09, T14, T21, T22, T29, T30, T39, T42, T44 e T45. Casos limítrofes mantidos como simples: T02 (os achados que levantam suspeita são a mesma informação que orienta a avaliação), T26 (pede uma conduta, considerando dois fatores) e T38 (seguimento clínico e neurológico como um único plano). A divergência não foi forçada.
- `perguntas.json` congelado com SHA-256 `61ff77d6855d19a15c2747e30dc00df13169e5f5d316adae58c1cede8546cab7`.

### Fases 2 e 3 — Execução das trilhas

- **Trilha B.** Executada por 5 subagentes (o mesmo modelo Claude Opus 5.5), com 10 perguntas cada. Cada subagente leu apenas `perguntas.json` e o texto do corpus (`avaliacao/corpus_texto/`, gerado a partir dos trechos indexados) e foi proibido de ler qualquer resposta da IA. A Trilha B foi iniciada antes da Trilha A.
- **Trilha A.** Iniciada em paralelo, com as sementes 20261109 (rodada 1) e 20261110 (rodada 2). O script não exibe as respostas, e `execucoes.jsonl` só é aberto depois do congelamento de `referencias.json`.

### Fase 3 — Referências congeladas

- As 5 partes da Trilha B foram concluídas. Cada subagente declarou que não abriu respostas da IA nem executou scripts do projeto. Para conferir as próprias citações, usaram apenas comandos de leitura.
- `fase3_referencias.ts` conferiu as 50 referências: formato correto, 263 pontos-chave e todos os trechos citados encontrados literalmente no trecho do corpus indicado. Referências congeladas com SHA-256 `4c3371a8d1afe5ba8223c9a5362da874f879539b6b75f28a43d7520e8942738c`, antes de qualquer leitura de `execucoes.jsonl`. Até esse momento, a Trilha A tinha feito cerca de metade das chamadas, e o seu registro só continha identificadores e latências.
- **Cobertura observada: 37 integrais, 9 parciais e 4 não respondíveis** (matriz prevista: 42/3/5). Não foi forçada.
  - Parciais: T07 (o desempenho do teste rápido só é descrito em termos qualitativos), T08 (a atualização de 2026 não está no corpus), T29 (para a dor crônica, o PCDT remete a outro PCDT), T30 (não há lista explícita de sinais oculares de urgência), T31 (não há rotina diária detalhada dos pés), T36 (não há protocolo para recusa do tratamento), T42 (cobertura municipal), T45 (dados posteriores a 2022) e T48 (o jejum não é tratado explicitamente).
  - Não respondíveis: T46 (fabricante), T47 (tratamento de outras dermatoses), T49 (conteúdo das seções excluídas) e T50 (casos no município em 2026).
  - Casos de julgamento registrados pelos subagentes: T48 poderia ser considerada integral, pela orientação de tomar a rifampicina em jejum; T17 usa o critério "caso novo com IB ≥ 2,0", cujo rótulo de seção (11.2) não foi preservado na extração do PCDT.
- **Divergências PCDT × OMS registradas e resolvidas a favor do PCDT**, a norma brasileira mais recente do corpus:
  - classificação com um único nervo acometido;
  - dose única de rifampicina para contatos e revacinação BCG;
  - corticoterapia na reação tipo 1;
  - posição da talidomida;
  - dose de albendazol;
  - corte de peso e idade da PQT infantil;
  - fluoroquinolonas alternativas;
  - esquema PB com dois fármacos;
  - calendário pós-alta.
- Achado documental: o quadro inicial da Estratégia Nacional inverte "missão" e "visão" em relação ao texto (T45).

### Fase 2 — Trilha A concluída

- 100 chamadas (2 rodadas × 50 perguntas), sem nenhuma falha técnica, nenhuma nova tentativa e nenhuma recusa por regra de segurança. Ordem das rodadas pelas sementes 20261109 e 20261110. Cada registro em `execucoes.jsonl` traz a resposta exata, as fontes citadas, os trechos recuperados, a latência e os tokens por chamada (interpretação, resposta e embeddings).

### Fase 4 — Anonimato e avaliação cega

- `fase4_anonimizar.ts` (semente 20261111) atribuiu códigos A001–A100 em ordem aleatória e gerou `para_avaliar.jsonl`, sem rodada nem posição.
- As 100 respostas foram distribuídas em 10 lotes de 10, sem duas respostas da mesma pergunta no mesmo lote, para que cada resposta fosse julgada isoladamente. A chave código → execução ficou em `validacao/chave_anonimato.json`, que os avaliadores não leem.
- **Avaliação: 10 subagentes (Claude Opus 5.5), um por lote**, com instrução fixa (`validacao/instrucoes_avaliador.md`) e a rubrica (`rubrica.md`). Cada um teve acesso apenas ao seu lote, à rubrica e ao texto do corpus.
- A rubrica explicita regras que o protocolo deixa implícitas:
  - nota de abstenção nas perguntas parciais;
  - tratamento de recusas e de lacunas da referência;
  - exclusão, da precisão de afirmações, das frases sobre o próprio sistema.

### Fase 4 — Incidente: limite de uso dos subagentes

- Os 10 subagentes avaliadores foram lançados em paralelo e todos pararam no limite de uso da conta ("5-hour limit"), sem gravar nenhum lote. Depois da liberação, foram retomados **dois de cada vez**, cada um com o mesmo lote, a mesma instrução e a mesma rubrica. Nenhum lote foi avaliado duas vezes, e nenhum avaliador viu o resultado de outro.

### Fase 4 — Resultado da avaliação

- 10 lotes concluídos (`validacao/avaliacoes/lote_01..10.json`). `fase4_juntar.ts` validou o esquema de cada avaliação e as juntou em `avaliacoes.jsonl` (100 avaliações, uma por código).
- **Consistência.** O anonimato foi desfeito só depois de concluídas todas as avaliações. `fase4_consistencia.ts` calculou a similaridade de cosseno entre as duas respostas de cada pergunta (`text-embedding-3-small`; média 0,936) e gerou pares sem rodada nem posição, embaralhados com a semente 20261112. Dois subagentes julgaram os pares às cegas quanto à contradição.
- **3 contradições.**
  - T10: duração dos esquemas de segunda linha.
  - T18: existência de esquemas para resistência no PCDT.
  - T35: o que o PCDT diz sobre PQT e HIV.
  - As três tratam do que os documentos contêm.
- **Lacunas da referência.** `fase4_erratas.ts` reuniu 165 afirmações corretas e sustentadas pelo corpus que as referências não incluíam (`referencias_erratas.json`). `referencias.json` não foi alterado, e as lacunas não penalizaram as respostas.

### Fase 4 — Métricas (preliminares)

- `metricas.ts` gerou `resultados/` (CSV e `metricas.json`). As médias principais excluem a T36, "em decisão" na curadoria, que é reportada à parte (NG 0,95 nas duas execuções).
- **Resultado geral:**
  - acurácia 65,3% (64/98), IC 95% de Wilson 55,5–74,0%;
  - NG 0,84 ± 0,19;
  - alucinação 6,1%; alerta de segurança 9,2%; erro de potencial dano 0%.
- **Abstenção:** correta em 8/8 respostas não respondíveis; recusa indevida 3,3% (3/90).
- **Consistência:** veredito estável 88%; correta nas duas execuções 59%; pass@2 71%.
- **Diagnóstico dos erros.** Das 34 respostas incorretas, 15 falham só pela cobertura dos pontos-chave abaixo de 60%, com NG entre 0,78 e 0,88.
- **Recortes:**
  - tratamento é o tema crítico (acurácia 32%);
  - adequação ao registro: leigo 1,13 contra técnico 1,96, efeito do perfil fixo "Profissional de saúde".

### Fase 5 — Ficha da especialista

- `fase5_ficha.ts` gerou `validacao_especialista/ficha_pesquisadora.xlsx`, com 4 abas, listas suspensas e as referências completas para revisão.
- **Seleção: 60 respostas.**
  - 40 sinalizadas: incorretas, com alerta, com veredito instável entre as rodadas ou com recusa indevida.
  - 20 sorteadas entre as demais, com a semente 20261113.
- A identificação da especialista ficou em branco e não foi inventada. `consolidar.ts` lê a ficha preenchida, calcula o kappa ponderado e a concordância entre as validações 2 e 3, grava as correções de referência à parte e regera as métricas com o veredito da especialista.

### Fase 6 — Gráficos, relatório e TCC

- `graficos.ts` gerou 6 gráficos PNG a 300 dpi; `relatorio.ts` gerou `RELATORIO_RESULTADOS.md`.
- **TCC.** Backup feito antes da edição (`TCC/*_antes_avaliacao.docx` e `.md`). `tcc/atualizar_tcc.ts` sempre parte do backup e insere, no .docx e no .md:
  - Seção 3.8;
  - Seção 5.4 (Tabelas 9 e 10, Figuras 14 e 15);
  - Seção 6.5;
  - Apêndices H, I e J (Quadros 20 a 22);
  - 4 referências e 2 notas de rodapé.
- Os campos foram atualizados pelo Word (`tcc/word_atualizar.ps1`), com 134 páginas. Numeração conferida no PDF: 3.8 na p. 55, 5.4 na p. 98, 6.5 na p. 107, Apêndice H na p. 129.
- Revisão visual: as colunas estreitas do Quadro 20 e da Tabela 10 quebravam palavras. As larguras foram ajustadas e a coluna "Composta" do Quadro 20 virou um asterisco no número da pergunta.
- Marcações em amarelo para tudo o que depende da especialista ou de decisão do autor (lista em `ALTERACOES_TCC.md`).
