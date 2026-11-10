# 04 — Matriz de coerência

## Problema → objetivo → método → evidência → resultado → conclusão

| Questão ou objetivo | Método | Evidência produzida | Resultado | Conclusão vinculada | Situação |
|---|---|---|---|---|---|
| QP1 — decisões que permitem indicar a origem e recusar situações de risco | Projeto e desenvolvimento (3.4, Cap. 4); avaliação técnica (3.5) | Arquitetura, testes, registros de consulta, métricas de citação e recusa | 5.1, 5.2; abstenção na avaliação experimental (5.4) | 6.1; Cap. 7 | Coerente |
| QP2 — a recuperação localiza os trechos esperados? | Avaliação técnica com 32 perguntas (3.5) | Revocação da evidência por documento e página | 5.2.2 | 6.1; Cap. 7 | Coerente |
| QP3 — como participantes avaliam respostas com e sem recuperação? | Avaliação comparativa (3.6) | Não produzida (planejada) | 5.3, estrutura com marcações | 6.1, marcação | Pendente de coleta (declarado no texto) |
| (sem QP) Correção e fundamentação das respostas | Avaliação experimental com 50 perguntas (3.8) | Respostas, referências congeladas, avaliações, métricas | 5.4 e Apêndice K (preliminar) | 6.5; Cap. 7 (R-030) | **Lacuna: decisão D-01** |
| Objetivo a) base de conhecimento | 3.3 | Manifesto, 328 trechos, relatórios de processamento | Quadro 3; 5.1 | Cap. 7 | Coerente; revisão do conteúdo por profissional pendente (declarado) |
| Objetivo b) *pipeline* RAG | 3.4; Cap. 4 | Código, testes | 5.1, 5.2 | Cap. 7 | Coerente |
| Objetivo c) interface | Cap. 4.7 | Protótipo | 5.1 | Cap. 7 | Coerente; tela de comparação simulada (declarado) |
| Objetivo d) avaliação técnica da recuperação | 3.5 (e 3.8, de modo complementar) | Métricas | 5.2 (5.4) | 6.1 | Coerente; texto do objetivo cobre só a recuperação (D-01) |
| Objetivo e) avaliação comparativa | 3.6 | — | 5.3 | — | Pendente (declarado) |
| Objetivo f) limitações | 6.4, 6.5 | — | — | Cap. 7 | Coerente |

## Fundamentação → uso no método e nos resultados

| Conceito do Capítulo 2 | Onde é usado | Situação após a revisão |
|---|---|---|
| Divergência PCDT × OMS (2.1.1) | Regra do *prompt* (4.5.6); referências da avaliação experimental (3.8.3); ameaça f) da 6.5 | Coerente (era ausente) |
| Riscos de CDSS: desatualização e dependência (2.2) | Base por edição de documento (3.3.2); citações com página (4.5.6); Portarias de 2026 ausentes (6.5) | Coerente |
| Alucinação intrínseca e extrínseca (2.3) | Regras de geração (4.5.6); métrica de alucinação (3.8.4) | Coerente (ligação explicitada) |
| Recuperação híbrida e RRF (2.4) | 4.5.3; 6.2 | Coerente; a frase sobre reordenação na 2.5.1 foi corrigida |
| Idioma dos *embeddings* (2.4.2) | 6.2 | Coerente |
| Citação ≠ fidelidade (2.5.2) | Verificação de citações (4.5.6); alucinações com citação (5.4) | Coerente |
| *LLM-as-a-judge*, autofavorecimento e kappa (2.6) | 3.8.4; 6.5 a) e b); validação 3 | Coerente (era ausente no Cap. 2) |
| Lacuna do apoio informacional (2.7.1, 2.8) | Justificativa (1.2) | Coerente |

## Inconsistências corrigidas

- **Seção 2.5.1:** descrevia a arquitetura com reordenação, que a 2.4.3 e o Capítulo 4 dizem ter sido removida (R-011).
- **Seção 2.8:** dizia que não havia avaliação por especialistas, enquanto a 3.8 descreve a validação 3 (R-024).
- **Seção 2.6:** dizia que as dimensões da avaliação "ainda serão definidas" e não fundamentava a 3.8 (R-014, R-015).
- **Avaliação experimental ausente das partes de síntese:** Introdução, 1.3, aberturas dos Capítulos 3 e 5, Quadro 2, Capítulo 7, Resumo e Abstract (R-025 a R-033).

## Coerência numérica conferida

- Os números da avaliação experimental citados no Resumo, no Abstract e no Capítulo 7 batem com a Tabela 9 e com `avaliacao/resultados/metricas.json`:
  - acurácia de 65,3%;
  - nenhuma resposta com erro de potencial dano;
  - abstenção correta em todas as perguntas não respondíveis;
  - pior desempenho em tratamento.
- Os números da avaliação técnica (32 perguntas, seis configurações, custo 41% menor) não foram alterados.
