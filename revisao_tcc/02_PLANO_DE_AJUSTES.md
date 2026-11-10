# 02 — Plano de ajustes

A ordem de prioridade seguiu o guia mestre: integridade (P0), coerência científica (P1), redação (P2) e normalização (P3). Toda mudança que alteraria o conteúdo intelectual ficou como decisão do autor.

## Estratégia por seção

| Seção | Papel na pesquisa | Estratégia |
|---|---|---|
| 2 (abertura) | Orientar a leitura | Dizer por que cada bloco é necessário (problema, arquitetura, avaliação, comparação) |
| 2.1 | Domínio clínico e origem da necessidade de consulta | Conferir no PCDT cada afirmação. Acrescentar a divergência OMS × literatura brasileira, que pesa no projeto e na avaliação. Transformar em premissa a afirmação sem fonte sobre a necessidade de informação |
| 2.2 | Situar o sistema entre os CDSS | Trocar a frase genérica sobre estratégias por análise dos riscos de Sutton *et al.* aplicáveis a um sistema informacional |
| 2.3 | Limitações dos LLMs que motivam o RAG | Delimitar as funções do modelo no sistema; relacionar alucinação intrínseca e extrínseca à arquitetura e à avaliação |
| 2.4 | Fundamentos da busca híbrida | Corrigir a atribuição em Karpukhin; precisar BioBERT e a questão do idioma; tirar o histórico do projeto |
| 2.5 | Arquitetura RAG, rastreabilidade e segurança | Corrigir a descrição da arquitetura; Almanac com os dados publicados; trocar a generalização por opções de projeto |
| 2.6 | Fundamento das três avaliações | Incluir *LLM-as-a-judge*, viés de autofavorecimento e kappa ponderado, que a Seção 3.8 usa e o referencial não tratava |
| 2.7 | Literatura comparável | Comparar por tipo de dado e tarefa; dados conferidos; ressalvas metodológicas (MIRAGE em múltipla escolha; métrica de alucinação do MEGA-RAG) |
| 2.8 | Posicionamento | Quadro com tarefa, dados e avaliação; diferenças atualizadas, sem ampliar o alcance dos resultados |
| 1, 3, 5, 7, Resumo, Abstract | Coerência com a avaliação experimental | Menções mínimas, sem alterar questões de pesquisa nem objetivos (D-01) |

## Fora do escopo desta rodada, por decisão de método

- Capítulos 4 a 6, salvo as remissões citadas: são descrição e resultados do projeto, com outra revisão em andamento após a validação por especialista.
- Elementos pré-textuais pessoais (dedicatória, agradecimentos, epígrafe): já estão marcados para redação do autor.
- Normalização de entradas de entidades (D-02): mexe em dezenas de citações e depende de confirmação do padrão da UPE.

## Como as mudanças foram aplicadas

- `revisao_tcc/edicoes.ts` lista cada edição com o parágrafo de origem, o texto novo e o motivo.
- `avaliacao/tcc/aplicar_revisao.ts` aplica as edições:
  - no .docx, mantendo o estilo de cada parágrafo e gerando o Quadro 1 com legenda automática;
  - no .md, conferindo que o texto novo está presente.
- O fluxo completo é:
  ```bash
  cd backend
  npx tsx ../avaliacao/tcc/atualizar_tcc.ts
  powershell -File ../avaliacao/tcc/word_atualizar.ps1 -Docx ../TCC/TCC_NexoHansen_Versao_Revisada.docx -Pdf <saida.pdf>
  ```
- O aplicador falha se um parágrafo de origem não for encontrado ou aparecer mais de uma vez. Assim, nenhuma edição se perde em silêncio.
