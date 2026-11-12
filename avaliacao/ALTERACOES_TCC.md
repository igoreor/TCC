# Alterações no TCC — avaliação experimental com 50 perguntas

Arquivos alterados: `TCC/TCC_NexoHansen_Versao_Revisada.docx` e `TCC/TCC_NexoHansen_Versao_Revisada.md`. Depois das inserções e das revisões acadêmica, de concisão e dos comentários do orientador, o .docx tem 116 páginas (69 de texto principal).

Backups anteriores à edição:

- `TCC/TCC_NexoHansen_Versao_Revisada_antes_avaliacao.docx`;
- `TCC/TCC_NexoHansen_Versao_Revisada_antes_avaliacao.md`.

As inserções são geradas por `avaliacao/tcc/atualizar_tcc.ts`, que sempre parte dos backups. Para regerar depois de alguma mudança:

```bash
cd backend
npx tsx ../avaliacao/tcc/atualizar_tcc.ts
powershell -File ../avaliacao/tcc/word_atualizar.ps1 -Docx "../TCC/TCC_NexoHansen_Versao_Revisada.docx"
```

O segundo comando atualiza o sumário, as listas e a numeração no Word. Como o script parte sempre dos backups, **qualquer edição manual feita no .docx depois disso é sobrescrita**. Antes de editar o .docx à mão, decida se o script ainda será usado. Os textos de interpretação ficam em `avaliacao/tcc/achados.json`.

A avaliação experimental só fez inserções. Depois dela, `atualizar_tcc.ts` aplica as 33 edições da revisão acadêmica de 09/11/2026 (`revisao_tcc/edicoes.ts`), que alteram o Capítulo 2 e trechos de coerência dos Capítulos 1, 3, 5 e 7, do Resumo e do Abstract; ver `revisao_tcc/06_RELATORIO_FINAL.md`. Em seguida, aplica as edições da revisão de concisão de 10/11/2026 (`revisao_tcc/edicoes_concisao.ts`), que enxugam todos os capítulos, retiram quatro capturas de tela, dois quadros e uma tabela e renumeram as remissões; ver `revisao_tcc/RELATORIO_OTIMIZACAO_TCC.md`. Por fim, aplica as edições dos comentários do orientador de 11/11/2026 (`revisao_tcc/edicoes_orientador.ts`), que reestruturam os Capítulos 5 a 7 (a Discussão passa a ser a Seção 5.4 e as Considerações Finais, o Capítulo 6), corrigem o título e as citações do Ministério da Saúde e levam mais conteúdo para os apêndices; ver `revisao_tcc/RELATORIO_COMENTARIOS_ORIENTADOR.md`. Os números de seção e de ilustração abaixo já são os da versão final.

## Seções inseridas

| Local | Conteúdo |
|---|---|
| **3.8 Avaliação experimental com perguntas curadas** (fim do Cap. 3) | 3.8.1 Conjunto de perguntas; 3.8.2 Execução; 3.8.3 Respostas de referência; 3.8.4 Tripla validação. |
| **5.3 Resultados da avaliação experimental…** (Cap. 5) | Tabela 5 (métricas gerais), Tabela 6 (recortes por registro, origem, complexidade e cobertura, com testes exploratórios), Figura 7 (acurácia por tema, IC 95%), Figura 8 (consistência entre execuções), análise de erros e parágrafo da validação 3. |
| **5.4.5 Discussão da avaliação experimental e ameaças à validade** (fim do Cap. 5) | Interpretação, três achados e alíneas com as ameaças à validade. |
| **Apêndice H** | Quadro 17 — as 50 perguntas, com tema, registro, origem e cobertura; o asterisco indica pergunta composta. |
| **Apêndice I** | Quadro 18 — resumo da rubrica das validações 1 e 2. |
| **Apêndice J** | Quadro 19 — modelo da ficha da validação 3. |
| **Apêndice K** | Quadro 20 — resultado de cada pergunta: veredito e nota global nas duas execuções, alertas e situação da validação 3. Remete ao documento `avaliacao/Perguntas_e_Respostas_Avaliacao.docx`. |
| **Notas de rodapé (2)** | Uma em 3.8.3: as referências foram feitas pelo mesmo modelo avaliador, em instâncias isoladas. Outra em 3.8.4: identificação do modelo avaliador (Claude Opus 5.5, `claude-opus-5-5`, 09/11/2026). |
| **Referências (4)**, em ordem alfabética | COHEN (1968), kappa ponderado; PANICKSSERY, BOWMAN e FENG (2024), viés de autopreferência; WILSON (1927), intervalo de confiança; ZHENG *et al.* (2023), *LLM-as-a-judge*. |

As validações 1 e 2 estão descritas como **avaliação automatizada por modelo de linguagem (LLM-as-a-judge)**, e não como avaliação humana.

## Marcações em amarelo (pendências do autor)

| Seção | Marcação | O que fazer |
|---|---|---|
| 3.8.2 | `[VERIFICAR: manter a avaliação com o corpus indexado ou repeti-la após incluir as portarias de 2026.]` | Decidir. Se as Portarias 47 e 51/2026 forem indexadas, a avaliação precisa ser refeita (ver `O_QUE_FOI_FEITO.md`). |
| 3.8.4 | `[REFERÊNCIA A INSERIR: testes de Fisher, Mann-Whitney e Kruskal-Wallis.]` | Citar um livro de estatística (sugestão: SIEGEL; CASTELLAN, *Estatística não-paramétrica para ciências do comportamento*) e incluí-lo nas Referências. |
| 3.8.4 | `[NOME DA PESQUISADORA, FORMAÇÃO E TITULAÇÃO]` | Preencher. |
| 3.8.4 | `[VÍNCULO INSTITUCIONAL E DATA DA REVISÃO]` | Preencher. |
| 5.3 (início) | `(resultados preliminares, sujeitos à validação 3)` | Remover depois de rodar `consolidar.ts` e atualizar os números. |
| 5.3 (fim) | `[Nº DE RESPOSTAS DE REFERÊNCIA REVISADAS E QUANTAS FORAM CORRIGIDAS]` | Usar `referencias_erratas_especialista.json`. |
| 5.3 (fim) | `[Nº DE RESPOSTAS DA IA REVISADAS PELA ESPECIALISTA]` | 25 na ficha (uma por pergunta); confirmar quantas foram de fato preenchidas. |
| 5.3 (fim) | `[KAPPA E % DE CONCORDÂNCIA ENTRE VALIDAÇÃO 2 E VALIDAÇÃO 3 — gerado por consolidar.ts]` | Usar `validacao_especialista/consolidacao.json`. |
| 5.3 (fim) | `[OBSERVAÇÕES DA ESPECIALISTA: …]` | Resumir as observações da ficha. |
| 5.4.5 (fim) | `[OBSERVAÇÕES DA ESPECIALISTA: …]` | Discutir as divergências entre a avaliação automatizada e a especialista. |
| Apêndice K | Frase sobre as células realçadas e as 25 células `A avaliar (exec. N)` do Quadro 20 | **Automático:** depois de `consolidar.ts`, rodar `atualizar_tcc.ts`, que troca as células pelo veredito da especialista e remove a frase. |

As legendas e fontes das Figuras 7 e 8 e o título do gráfico dizem "resultados preliminares". Depois da validação 3, rode novamente `graficos.ts` e `atualizar_tcc.ts`.

**Importante.** Nada sobre a especialista foi inventado: nome, opiniões e números estão todos marcados.
