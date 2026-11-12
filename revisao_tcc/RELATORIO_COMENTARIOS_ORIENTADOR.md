# Comentários do orientador: o que foi feito

Origem: `revisao_tcc/TCC_comentado_pelo_orientador_2026-11-11.docx`, comentado pelo Prof. Dr. Élisson da Silva Rocha em 11/11/2026. São 7 comentários e 3 alterações controladas.

Esse arquivo é de uma versão **anterior** do TCC: ainda não tinha a avaliação com 50 perguntas nem as revisões acadêmica e de concisão. Por isso, cada comentário foi localizado na versão atual e aplicado a ela.

As edições estão em `revisao_tcc/edicoes_orientador.ts` (79 edições e 4 ajustes globais). O gerador `avaliacao/tcc/atualizar_tcc.ts` aplica esse arquivo depois das revisões anteriores, então nada se perde quando o TCC é regerado.

Resultado: **116 páginas no total (eram 119) e 69 de texto principal (eram 76).**

| Parte | Páginas |
|---|---:|
| Pré-textuais | 17 |
| 1 Introdução | 5 |
| 2 Referencial teórico | 12 |
| 3 Metodologia | 16 |
| 4 Desenvolvimento do sistema | 19 |
| 5 Resultados e discussão | 15 |
| 6 Considerações finais | 2 |
| Referências | 5 |
| Apêndices (A a L) | 25 |

## Comentários

| Nº | Comentário | O que foi feito |
|---|---|---|
| 0 | "Nomes científicos e estrangeiros vão em itálico" | *Mycobacterium leprae* e quase todos os termos estrangeiros já estavam em itálico desde a revisão acadêmica. Faltavam *login* (16 ocorrências), *web* (8, mais o título da Seção 4.7) e *script* (1). Agora estão em itálico em todo o texto, nas tabelas e nos apêndices. O Abstract e as referências não mudaram. |
| 1 | "Não é Ministério da Saúde que vem aqui, deve ser Brasil, 2022" | Todas as citações passaram a (Brasil, ano). Como já havia outra obra de Brasil em 2022 (o Ofício da CONEP), as duas ganharam letra: Ofício = 2022a, PCDT = 2022b. Nas Referências, as três entradas viraram "BRASIL. Ministério da Saúde. …" e foram para junto das demais de BRASIL, em ordem alfabética. **Exceção:** no Apêndice C, a mensagem de recusa do sistema continua com "(Ministério da Saúde, 2022)", porque reproduz literalmente o que o sistema exibe. |
| 2 | Trocar "Na literatura consultada" por "Até onde se tem conhecimento" | Feito na Introdução e também na mesma afirmação da Seção 2.7.1. |
| 3 | "." em "(nome provisório)" | Entendido como pedido de retirada. Saiu da Introdução, e "provisoriamente" saiu da abertura do Capítulo 4. |
| 4 | "Não entendi esse Quadro. Principalmente a parte da Situação" | A coluna "Situação nesta versão" foi retirada do Quadro 2. Agora o quadro relaciona cada objetivo à etapa da pesquisa (Figura 1) e às seções em que é tratado: "Correspondência entre objetivos específicos, etapas da pesquisa e seções do trabalho". As frases que o apresentam (1.1.2 e 3.2) foram ajustadas. |
| 5 | Capítulo 4 separado, mas a Seção 5.1 "ficou bem ruim": o capítulo poderia substituir "Artefato desenvolvido" | A Seção 5.1 foi retirada. O que só ela dizia (o sistema é o primeiro resultado, atende aos objetivos a, b e c e foi publicado) foi para a abertura do Capítulo 4. |
| 6 | "6 Discussão" → "Vira 5.4 do capítulo anterior" | O Capítulo 5 passou a se chamar **5 RESULTADOS E DISCUSSÃO**, e a Discussão virou a Seção 5.4, com 5.4.1 a 5.4.5. As Considerações Finais passaram a ser o Capítulo 6. A nova ordem é 5.1 Avaliação técnica, 5.2 Avaliação comparativa, 5.3 Avaliação experimental e 5.4 Discussão. |

### Alterações controladas do orientador

| Alteração | Situação na versão atual |
|---|---|
| Título: "Recuperação Aumentada por Geração" → "**Geração Aumentada por Recuperação**" | Corrigido na capa, na folha de rosto e na folha de aprovação. A nota de rodapé que justificava a ordem antiga perdeu o sentido e foi retirada. |
| "Prof." → "**Prof. Dr.** Élisson da Silva Rocha" | Corrigido na folha de rosto, na folha de aprovação e na marcação dos agradecimentos. |
| Fonte da Figura 1: "Elaboração própria (2026), com base em Peffers *et al.* (2007)" | Aplicado. |

O parágrafo que o orientador reposicionou depois da Figura 1 já está nesse lugar na versão atual, em forma resumida.

### Renumeração

As remissões a seções foram renumeradas automaticamente em todo o texto, inclusive nos trechos gerados pela avaliação. Quem precisar conferir à mão encontra a correspondência abaixo.

| Antes | Depois |
|---|---|
| 5 Resultados | 5 Resultados e discussão |
| 5.1 Artefato desenvolvido | retirada (conteúdo na abertura do Cap. 4) |
| 5.2, 5.2.1–5.2.3 | 5.1, 5.1.1–5.1.3 |
| 5.3 (e 5.3.1–5.3.4) | 5.2 (sem subseções) |
| 5.4 | 5.3 |
| 6 Discussão, 6.1–6.5 | 5.4, 5.4.1–5.4.5 |
| 7 Considerações finais | 6 Considerações finais |

## Reduções retomadas (item E.4 do relatório de concisão)

As cinco reduções propostas em `RELATORIO_OTIMIZACAO_TCC.md` foram aplicadas. Nenhum dado, critério ou marcação pendente foi perdido: o que saiu do corpo foi para um apêndice, ou já estava descrito no texto.

1. **Avaliação comparativa (3.6).** As seis decisões de desenho (alíneas a–f), o quadro de parâmetros por cenário e o de dimensões candidatas foram para o Apêndice E, agora chamado "Protocolo previsto da avaliação comparativa". No corpo ficam o objetivo, os cenários, os participantes, a análise e a ética, com um parágrafo que enumera as decisões pendentes.
2. **Capturas de tela.** Saíram as figuras do componente de avaliação, da página inicial e do explorador de recuperação. O texto já descrevia cada uma. Restam duas capturas (resposta com citações e lista de fontes).
3. **Seção 5.2 (avaliação comparativa).** As quatro subseções e as duas tabelas, ainda sem dados, foram reunidas num parágrafo com um único marcador `[PREENCHER APÓS A COLETA DOS DADOS: …]`, que lista tudo o que deverá ser apresentado.
4. **Testes automatizados.** O quadro foi para o novo Apêndice L. A Seção 4.8 mantém os números e remete ao apêndice.
5. **Execução preliminar (5.1.1).** O corpo mantém a Tabela 1 e um parágrafo com a conclusão e os números que a sustentam. A análise detalhada (observação do explorador, similaridades e a tabela de pontuação mínima) foi para o Apêndice D.

### Numeração final das ilustrações

| Ilustração | Número |
|---|---|
| Figuras | 1–4 diagramas; 5 e 6 capturas; 7 acurácia por tema; 8 consistência entre execuções |
| Quadros no corpo | 1–8 (o 6 é o de requisitos; o 7, regras de segurança; o 8, problemas e alterações) |
| Quadros nos apêndices | 9–12 (A a D); 13 e 14 (E: parâmetros e dimensões); 15–16 (F, G); 17–20 (H a K); 21 (L: testes) |
| Tabelas | 1–4 avaliação técnica; 5 e 6 avaliação experimental; 7 pontuação mínima (Apêndice D) |

## Pontos para você decidir ou conferir

- **Figura 1.** A legenda e a imagem ainda mostram a "situação de cada uma" das etapas. O orientador comentou só o Quadro 2, mas a figura pode gerar a mesma dúvida. A fonte editável está em `figuras/editaveis/fig-etapas.svg`.
- **Comentário 3.** O comentário era só um ".". Interpretei como pedido para retirar "(nome provisório)". Confirme com o orientador se era isso.
- **Itálico.** *software* (em "Engenharia de Software", nome do curso) e *design* (em "ciência do *design*") ficaram sem itálico, por serem nome próprio ou palavra dicionarizada. Se o orientador preferir, é só incluí-los em `ajustes.italico`.
- **Arquivo do orientador.** A cópia comentada foi guardada sem alterações em `revisao_tcc/TCC_comentado_pelo_orientador_2026-11-11.docx`.

## Como regerar

```bash
cd backend
npx tsx ../avaliacao/tcc/atualizar_tcc.ts
powershell -File ../avaliacao/tcc/word_atualizar.ps1 -Docx <caminho absoluto do .docx> -Pdf <caminho absoluto do .pdf>
```

Para viabilizar estas edições, o aplicador (`avaliacao/tcc/aplicar_revisao.ts`) ganhou:

- mudança de nível de título (`nivel`);
- movimentação de parágrafos (`mover`);
- inserção no fim do documento (`inserir_no_fim`);
- ajustes globais antes das edições (renumeração de seções, trocas literais e itálico);
- renumeração de remissões quando um quadro muda de legenda;
- remoção de notas de rodapé que ficam sem referência.
