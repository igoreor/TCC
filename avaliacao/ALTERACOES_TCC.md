# Alterações no TCC — avaliação experimental com 50 perguntas

Arquivos alterados: `TCC/TCC_NexoHansen_Versao_Revisada.docx` e `TCC/TCC_NexoHansen_Versao_Revisada.md`. Depois das inserções, o .docx tem 134 páginas.

Backups anteriores à edição:

- `TCC/TCC_NexoHansen_Versao_Revisada_antes_avaliacao.docx`;
- `TCC/TCC_NexoHansen_Versao_Revisada_antes_avaliacao.md`.

As inserções são geradas por `avaliacao/tcc/atualizar_tcc.ts`, que sempre parte dos backups. Para regerar depois de alguma mudança:

```bash
cd backend
npx tsx ../avaliacao/tcc/atualizar_tcc.ts
powershell -File ../avaliacao/tcc/word_atualizar.ps1 -Docx ../TCC/TCC_NexoHansen_Versao_Revisada.docx
```

O segundo comando atualiza o sumário, as listas e a numeração no Word. Como o script parte sempre dos backups, **qualquer edição manual feita no .docx depois disso é sobrescrita**. Antes de editar o .docx à mão, decida se o script ainda será usado. Os textos de interpretação ficam em `avaliacao/tcc/achados.json`.

O texto antigo não foi alterado: só houve inserções.

## Seções inseridas

| Local | Conteúdo |
|---|---|
| **3.8 Avaliação experimental com perguntas curadas** (fim do Cap. 3) | 3.8.1 Conjunto de perguntas; 3.8.2 Execução; 3.8.3 Respostas de referência; 3.8.4 Tripla validação. |
| **5.4 Resultados da avaliação experimental…** (fim do Cap. 5) | Tabela 9 (métricas gerais), Tabela 10 (recortes por registro, origem, complexidade e cobertura, com testes exploratórios), Figura 14 (acurácia por tema, IC 95%), Figura 15 (consistência entre execuções), análise de erros e parágrafo da validação 3. |
| **6.5 Discussão da avaliação experimental e ameaças à validade** (fim do Cap. 6) | Interpretação, três achados e alíneas com as ameaças à validade. |
| **Apêndice H** | Quadro 20 — as 50 perguntas, com tema, registro, origem e cobertura; o asterisco indica pergunta composta. |
| **Apêndice I** | Quadro 21 — resumo da rubrica das validações 1 e 2. |
| **Apêndice J** | Quadro 22 — modelo da ficha da validação 3. |
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
| 5.4 (início) | `(resultados preliminares, sujeitos à validação 3)` | Remover depois de rodar `consolidar.ts` e atualizar os números. |
| 5.4 (fim) | `[Nº DE RESPOSTAS DE REFERÊNCIA REVISADAS E QUANTAS FORAM CORRIGIDAS]` | Usar `referencias_erratas_especialista.json`. |
| 5.4 (fim) | `[Nº DE RESPOSTAS DA IA REVISADAS PELA ESPECIALISTA]` | 60 na ficha; confirmar quantas foram de fato preenchidas. |
| 5.4 (fim) | `[KAPPA E % DE CONCORDÂNCIA ENTRE VALIDAÇÃO 2 E VALIDAÇÃO 3 — gerado por consolidar.ts]` | Usar `validacao_especialista/consolidacao.json`. |
| 5.4 (fim) | `[OBSERVAÇÕES DA ESPECIALISTA: …]` | Resumir as observações da ficha. |
| 6.5 (fim) | `[OBSERVAÇÕES DA ESPECIALISTA: …]` | Discutir as divergências entre a avaliação automatizada e a especialista. |

As legendas e fontes das Figuras 14 e 15 e o título do gráfico dizem "resultados preliminares". Depois da validação 3, rode novamente `graficos.ts` e `atualizar_tcc.ts`.

**Importante.** Nada sobre a especialista foi inventado: nome, opiniões e números estão todos marcados.
