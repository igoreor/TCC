# 00 — Inventário e regras

Revisão feita em 09/11/2026, na branch `feat/avaliacao-50-perguntas`, a partir do commit `0d09ef2` (árvore limpa no início).

## Documentos de orientação

- `GUIA_MESTRE_TCC_ABNT_ESCRITA_ACADEMICA_CLAUDE.md` e `PROMPT_EXECUCAO_REVISAO_TCC_CLAUDE_CODE.md` **não estavam na raiz do repositório** nem em outra pasta do projeto. O conteúdo integral dos dois chegou na mensagem do autor e foi lido antes de qualquer edição.
  - Para que fiquem no histórico, convém salvar os dois arquivos na raiz.
- **Comentários do orientador:** não foram encontrados nos arquivos. Os .docx não têm `comments.xml`, e nenhum documento do repositório registra o parecer. A crítica considerada foi a relatada pelo autor: texto com "cara de IA", sobretudo no referencial teórico.
- **Guia e template da UPE:** não foram abertos nesta revisão. As regras formais foram conferidas contra as NBR citadas no guia mestre e contra o próprio documento, que já segue o template da UPE (estilos e elementos pré-textuais). Ver `05_CHECKLIST_ABNT_UPE.md`.

## Trabalho revisado

| Item | Situação |
|---|---|
| Modalidade | Monografia (folha de rosto: "Monografia apresentada como requisito…"); formato mantido |
| Arquivo principal | `TCC/TCC_NexoHansen_Versao_Revisada.docx` (estilos Ttulo1–3, Corpo, Alinea, Legenda*, Fonte, Referencia; campos SEQ, sumário e listas automáticas) |
| Espelho legível | `TCC/TCC_NexoHansen_Versao_Revisada.md`, gerado em paralelo ao .docx |
| Backup | `TCC/TCC_NexoHansen_Versao_Revisada_antes_avaliacao.docx/.md` (versão anterior à avaliação experimental; não alterado) |
| Geração | `avaliacao/tcc/atualizar_tcc.ts` parte do backup, insere a avaliação experimental e, agora, aplica as edições desta revisão (`revisao_tcc/edicoes.ts`, via `avaliacao/tcc/aplicar_revisao.ts`); `avaliacao/tcc/word_atualizar.ps1` atualiza campos, sumário e listas no Word e exporta o PDF |
| Outros arquivos em `TCC/` | `TCC Eng. Software 2026.2 - … .docx.md` (rascunho original), `TCC Exemplo.md` (TCC de referência), `Pendencias_TCC_NexoHansen.md` (registro de pendências) e `figuras/` |
| Fontes primárias locais | Apenas o texto dos cinco documentos do corpus (`avaliacao/corpus_texto/`). Não há PDFs da literatura no repositório |

## Tema e estrutura, segundo o próprio texto

- **Tema:** desenvolvimento e avaliação do NexoHansen, sistema RAG de apoio informacional à decisão clínica em hanseníase, com base em documentos oficiais do Ministério da Saúde e da OMS.
- **Questão de pesquisa e QP1–QP3:** Seção 1. QP3, a avaliação com participantes, está pendente.
- **Método:** pesquisa em ciência do design (Hevner *et al.*, 2004; Peffers *et al.*, 2007).
- **Capítulos:**
  1. Introdução;
  2. Referencial teórico (2.1 a 2.8);
  3. Metodologia (3.1 a 3.8);
  4. Desenvolvimento;
  5. Resultados (5.1 a 5.4);
  6. Discussão (6.1 a 6.5);
  7. Considerações finais;
  - referências e Apêndices A a K.

## Regras adotadas nesta revisão

1. **O que foi alterado:**
   - só o que tinha evidência nos arquivos ou nas fontes conferidas;
   - nada de mudar a pergunta de pesquisa, os objetivos, o método ou os resultados;
   - quando a melhor solução mudaria o conteúdo intelectual, a opção foi registrada como decisão do autor (`06_RELATORIO_FINAL.md`, seção "Decisões").
2. **Fontes:**
   - toda afirmação específica do referencial foi confrontada com a obra (texto integral, resumo ou página oficial) ou, no caso do PCDT, com o texto do documento no repositório;
   - o que não pôde ser conferido foi retirado ou registrado em `03_AUDITORIA_REFERENCIAL.md`.
3. **Nada de técnicas para "disfarçar" autoria.** As mudanças atacam problemas verificáveis: repetição, generalização sem fonte, enumeração sem análise, números incorretos, incoerência entre capítulos.
4. **Rastreabilidade:**
   - cada alteração tem identificador (R-001 a R-033), local e motivo em `revisao_tcc/edicoes.ts`;
   - o backup e o texto anterior podem ser recuperados pelo Git;
   - as marcações em amarelo já existentes foram preservadas.
5. **Hierarquia em caso de conflito:** orientações do curso e do orientador; template da UPE; ABNT; manuais de outras bibliotecas apenas como apoio. Nenhum conflito foi decidido silenciosamente.
