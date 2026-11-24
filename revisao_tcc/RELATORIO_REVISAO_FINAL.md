# Revisão final: comentários do orientador de 19/11/2026

Origem: versão do TCC comentada no Google Docs pelo Prof. Dr. Élisson da Silva Rocha. Ela tem 13 comentários, exclusões feitas com controle de alterações e edições diretas no texto. A essa versão somam-se:

- as regras de formatação recebidas em 18/11/2026;
- o pedido do orientador de retirar repetições.

As edições estão em `revisao_tcc/edicoes_final.ts`: 162 edições e os ajustes globais. Os nomes corrigidos nos agradecimentos estão em `revisao_tcc/edicoes_agradecimentos.ts`. O gerador aplica os dois arquivos depois das revisões anteriores.

**Resultado: 98 páginas (eram 118).**

| Parte | Páginas |
|---|---|
| Pré-textuais | 1–17 |
| 1 Introdução | 18–21 |
| 2 Referencial teórico | 22–32 |
| 3 Metodologia | 33–42 |
| 4 Desenvolvimento do sistema | 43–60 |
| 5 Resultados e discussão | 61–72 |
| 6 Conclusão | 73–74 |
| Referências | 75–79 |
| Apêndices A a J | 80–98 |

## Comentários

| Comentário | O que foi feito |
|---|---|
| "Verificar no template se é Arial ou Times"; "nos outros, o texto é Times 12" | O documento passou a Times New Roman em todo o texto, nos estilos, nas notas, no sumário e nas listas. Conferido no .docx e no PDF: texto em 12 pt; legendas, fontes das ilustrações, tabelas e notas de rodapé em 10 pt. Só os nomes de código ficam em Courier New, como nos dois TCCs aprovados do curso. |
| "Retirar todas as anotações em amarelo" | Não restam marcações. Para preencher na mão continuam a ficha catalográfica, que vem da biblioteca, e os nomes da banca, agora como linhas em branco. |
| "Retirar tudo que linka a análise do especialista" | Saíram a validação 3, o Apêndice J (ficha), a coluna da validação no quadro de resultados por pergunta, a ameaça à validade correspondente e os marcadores. A avaliação experimental passa a ter duas etapas automatizadas: coerência e conformidade documental. A Seção 3.6.4 ficou com um parágrafo de método (ver "Pontos para conferir"). A frase da Seção 3.3.2 de que a base foi indicada por especialista foi mantida, porque é sobre a escolha dos documentos. |
| "Bora retirar mesmo!" (Seção 3.6, avaliação comparativa) | Saíram a Seção 3.6, a Seção 5.2, o Apêndice E (protocolo) e as referências e siglas usadas só ali: Ofício e Resoluções da CONEP/CNS, CEP, CNS, CONEP e TCLE. Sem o Ofício, o PCDT passou de "Brasil, 2022b" para "Brasil, 2022". |
| "Colocar como limitação a avaliação comparativa que não foi realizada" | Nova limitação "e" na Seção 5.3.3. |
| "O que não foi feito entra como trabalho futuro, não como algo em andamento" | A avaliação comparativa e a validação por profissionais de saúde estão nos trabalhos futuros da Conclusão. Saíram do texto "preliminares", "em andamento", "planejada", "nesta versão" e "desta etapa". |
| "Ajustar as Perguntas de pesquisa" | A questão principal passou a perguntar com que qualidade o sistema responde. A QP3 agora trata da correção, completude e fundamentação das respostas e é respondida pela avaliação experimental (Seção 5.3.1). O objetivo geral e o objetivo específico "e" foram ajustados. |
| Figura 1: "Refazer sem o status de cada etapa" | Figura redesenhada sem as marcações de situação e sem a legenda. A caixa 5 diz "técnica e experimental". A legenda virou "Etapas da pesquisa". Fonte editável: `TCC/figuras/editaveis/fig-etapas.svg`. |
| "Todos que tiverem links para páginas oficiais, coloca como nota de rodapé" | 19 notas de rodapé com o endereço oficial das ferramentas: Node.js, TypeScript, Express, Prisma, PostgreSQL, Zod, Vitest, React, Vite, Tailwind CSS, TanStack Query, React Router, Vercel, Neon, Docker, PGlite, Testing Library, pdftotext (Poppler) e BGE-M3. O pgvector já tem referência. |
| "Já confirmada no whats" e "rever" (abordagem) | A abordagem passou a quantitativa. Ela era mista por causa do formulário da especialista e dos comentários de participantes, que saíram do trabalho (decisão do autor, 19/11/2026). A leitura das respostas continua servindo para identificar os tipos de erro. |
| "Seria 94%?" (Seção 5.1.2) | O texto estava certo. 84% é a revocação@5 da versão atual sem OpenAI, e 94% é o comportamento correto dessa mesma versão. A frase agora traz os dois números para não confundir. |
| "Ajustar" (Apêndice K, células realçadas) | Apêndice K virou Apêndice I, sem a frase das células realçadas e sem a coluna da validação 3. |
| "Introdução muito boa!" | Sem alteração. |

## Exclusões e edições diretas do orientador

- **Seções retiradas:** 3.7 (ameaças à validade da comparativa), 4.9 (evolução do sistema, com o Quadro 8), 5.2 e 5.4.2 (relação com a literatura).
  - O essencial da 4.9 ficou num parágrafo da Seção 5.1.1.
  - A discussão sobre o idioma dos *embeddings*, que estava na 5.4.2, passou à QP2 (Seção 5.3.1).
- **Quadro 2 retirado**, com as frases que o apresentavam (1.1.2 e 3.2).
- **Seção 3.8.4 (tripla validação):** ele a retirou inteira. Ficou um parágrafo, porque a Seção 5.2 apresenta acurácia, nota global e testes estatísticos que precisam de método (ver "Pontos para conferir").
- **Capítulo 6:** passou a "CONCLUSÃO". Saíram o parágrafo de limitações e os marcadores.
- **Edições diretas, todas mantidas:**
  - datas retiradas em várias seções;
  - "desenvolvedor" passou a "autor";
  - a Seção 3.4 virou "Tecnologias e processo de desenvolvimento";
  - parágrafos da 3.3.1 reescritos;
  - frase de abertura da 5.1.2 retirada;
  - exemplo do Quadro 4 encurtado.
  
  Corrigi a concordância de uma frase da 3.4 ("e, inclusão da autenticação…").

## Edições feitas pelo autor no Google Docs

Todas foram mantidas:

- nomes corrigidos nos agradecimentos, sem negrito;
- dedicatória retirada;
- coorientador retirado da folha de rosto e, também, da banca;
- marcação da epígrafe retirada (a epígrafe foi mantida).

## Formatação (regras de 18/11/2026)

- **Maiúsculas só nos títulos principais.** Os títulos de nível 2 passaram a ter só a inicial maiúscula, no texto e no sumário (por exemplo, "1.1 Objetivos").
- **Negrito.** Por decisão do autor, os títulos de nível 2 e 3 também ficam em negrito, como os principais, no texto e no sumário. O negrito não é usado no corpo do texto.
- **Citações no texto com só a inicial maiúscula:** já estava assim; a verificação não encontrou nenhuma citação em caixa alta.

## Repetições retiradas

- **Aberturas que enumeravam seções:** a do Capítulo 2 e a da Seção 5.3, que já estavam no sumário.
- **Ressalvas repetidas:**
  - "não substitui o julgamento clínico" na Introdução (fica na Justificativa);
  - "base não revisada por profissional de saúde" na abertura do Capítulo 4 (fica na 3.3.2 e nas limitações);
  - limitação das regras textuais na 4.5.5 (fica nas limitações);
  - "métricas não substituem revisão profissional" na 5.1.2 (fica na 3.5.1).
- **Fatos repetidos:**
  - o papel do modelo de linguagem na 3.5.2 (está na 2.3);
  - a inclusão da autenticação na 4.6 (está na 4.1);
  - as escolhas de projeto no fim da 2.7.2 (estão na 2.8);
  - o resultado de 84% na QP2 (está na 5.1.2);
  - o limite dos dublês de teste nas limitações (está na 4.8 e na 5.3.2).
- **Números da QP3:** reduzidos ao essencial, porque a 5.3.4 os discute.

## Renumeração

| Antes | Depois |
|---|---|
| 3.6 e 3.7 | retiradas |
| 3.8 e 3.8.1 a 3.8.4 | 3.6 e 3.6.1 a 3.6.4 |
| 4.9 | retirada |
| 5.2 | retirada |
| 5.3 | 5.2 |
| 5.4 e 5.4.1 | 5.3 e 5.3.1 |
| 5.4.2 | retirada |
| 5.4.3, 5.4.4 e 5.4.5 | 5.3.2, 5.3.3 e 5.3.4 |
| 6 Considerações finais | 6 Conclusão |
| Apêndices E e J | retirados |
| Apêndices F, G, H, I, K e L | E, F, G, H, I e J |

Ilustrações finais: Figuras 1 a 8, Quadros 1 a 16 e Tabelas 1 a 7.

## Pontos para conferir com o orientador

- **Seção 3.6.4.** O orientador retirou a seção inteira. Mantive um parágrafo com o essencial do método da avaliação automatizada:
  - o avaliador *LLM-as-a-judge*, com a nota de rodapé do modelo;
  - os critérios e o que conta como resposta correta;
  - o intervalo de Wilson e os testes estatísticos.
  
  Sem esse parágrafo, a Seção 5.2 apresenta números sem método. Se ele preferir tirar, os critérios já estão na rubrica do Apêndice H.
- **Referência nova:** SIEGEL; CASTELLAN JR. (2006), para os testes de Fisher, Mann-Whitney e Kruskal-Wallis.
- **Agradecimentos.** Ficou "Tio inho, Guilhermando", exatamente como foi digitado no Google Docs. Confirmar se é "Tioinho".
