# 06 — Relatório final da revisão

Revisão acadêmica do TCC "Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase", feita em 09/11/2026 segundo o guia mestre e o prompt de execução entregues pelo autor. Os demais arquivos desta pasta trazem o detalhamento:

- `00_INVENTARIO_E_REGRAS.md`: inventário dos arquivos e regras adotadas;
- `01_DIAGNOSTICO.md`: problemas encontrados, com severidade;
- `02_PLANO_DE_AJUSTES.md`: estratégia por seção;
- `03_AUDITORIA_REFERENCIAL.md`: situação de cada fonte e matriz conceito → fonte → relevância;
- `04_MATRIZ_COERENCIA.md`: alinhamento entre questões, método, resultados e conclusões;
- `05_CHECKLIST_ABNT_UPE.md`: conferência formal;
- `edicoes.ts`: o texto de cada alteração e seu motivo.

## 1. Arquivos e capítulos alterados

| Arquivo | Alteração |
|---|---|
| `TCC/TCC_NexoHansen_Versao_Revisada.docx` e `.md` | 33 edições (R-001 a R-033): 24 no Capítulo 2; 9 de coerência nos Capítulos 1, 3, 5 e 7, no Resumo e no Abstract |
| `revisao_tcc/edicoes.ts` | Texto e motivo de cada edição (novo) |
| `avaliacao/tcc/aplicar_revisao.ts` | Aplica as edições ao .docx e ao .md (novo) |
| `avaliacao/tcc/atualizar_tcc.ts` | Passa a aplicar a revisão depois das inserções da avaliação, para que ela sobreviva à regeração do TCC |
| `avaliacao/tcc/docx_blocos.ts`, `avaliacao/tcc/aplicar.ts` | Três correções de geração: realce das marcações `[[[…]]]`, alíneas e espaçamento antes do Apêndice A no .md |

O backup `TCC/*_antes_avaliacao.*` não foi alterado. Nenhuma marcação amarela existente foi removida.

## 2. O que melhorou no referencial teórico

### 2.1 Correções de integridade (P0)

**Almanac (Seções 2.5.2 e 2.7.2, Quadro 1).**

> Antes: "Avaliado por um painel de médicos em 130 cenários clínicos, o sistema aumentou a factualidade das respostas em 18%, em média, com ganhos de completude e segurança em relação a modelos sem recuperação."
>
> Depois: "Avaliado por um painel de dez profissionais de saúde em 314 perguntas de nove especialidades, superou modelos sem recuperação em factualidade, completude, preferência dos avaliadores e segurança diante de perguntas adversariais."

Os números anteriores eram do preprint de 2023. A referência listada é o artigo publicado no NEJM AI.

**Fernandes *et al.* (2024) (Seção 2.7.1 e Quadro 1).**

> Antes: "Desses, 15 utilizaram apenas imagens de lesões cutâneas, um combinou imagens com dados clínicos e demográficos, e cinco utilizaram dados numéricos de exames […]; nenhum dos estudos incluídos empregou sistemas baseados em texto ou em conversação."
>
> Depois: "[…] 21 foram incluídos, e a maioria utilizou imagens de lesões cutâneas."

A distribuição e a afirmação final não foram encontradas no texto conferido. Se o autor as confirmar na Tabela 4 do artigo, podem voltar.

**Karpukhin *et al.* (2020) (Seção 2.4.2).** A similaridade de cosseno era atribuída ao DPR, que usa produto interno.

### 2.2 De enumeração a comparação (Seção 2.7.1)

> Antes: "Entre os trabalhos com dados clínicos e de imagem, Barbieri *et al.* (2022) desenvolveram o AI4Leprosy […]. Gama *et al.* (2019) combinaram […]. Simões *et al.* (2025) desenvolveram o MaLeSQs […]. No contexto nacional, Andrade *et al.* (2024) apresentaram o Health Guardian […]."
>
> Depois: "Os estudos com resultados quantitativos diferem pelo tipo de dado e pela etapa do cuidado a que se dirigem. No diagnóstico por imagem, […]. Na triagem, […]. Entre contatos domiciliares, […]. Os três trabalhos produzem uma classificação a partir de dados do paciente, e seu desempenho é medido por acurácia, sensibilidade e especificidade."

O fecho deixou de dizer que a RAG é "especialmente adequada" à tarefa. Agora explica por que ela exige outra avaliação: "não há um rótulo correto a prever, e sim uma resposta em texto cuja correção, completude e fundamentação precisam ser julgadas".

### 2.3 De afirmação sem fonte a premissa declarada (Seção 2.1.2)

> Antes: "[…] localizar a orientação pertinente a uma dúvida específica e verificar sua origem é uma necessidade concreta de informação, e é a esse tipo de necessidade que o sistema proposto se dirige."
>
> Depois: "Este trabalho parte da premissa de que localizar a orientação pertinente a uma dúvida específica, e identificar o documento de onde ela provém, é uma necessidade de informação das equipes da APS. A premissa não foi medida nesta pesquisa […]."

### 2.4 Análise no lugar de frase genérica (Seção 2.2)

O parágrafo deixou de citar "estratégias recomendadas" sem atribuição. Agora examina quais riscos descritos por Sutton *et al.* (2020) valem para um sistema informacional (desatualização e dependência excessiva) e quais decisões do projeto respondem a eles (base por edição de documento, citação da página).

### 2.5 Lacuna de fundamentação preenchida (Seção 2.6)

A avaliação experimental usa um modelo de linguagem como avaliador e mede a concordância com especialista pelo kappa ponderado, mas o referencial não tratava disso. Entrou um parágrafo, apoiado em fontes conferidas, sobre:

- concordância acima de 80% e vieses de posição, verbosidade e autofavorecimento (Zheng *et al.*, 2023);
- autopreferência dos modelos avaliadores (Panickssery; Bowman; Feng, 2024);
- kappa ponderado (Cohen, 1968).

O parágrafo inclui também o limite dessas evidências no domínio clínico.

### 2.6 Menos repetição, mais dado

- A constatação das revisões de Amugongo e Yang, antes repetida em seis lugares, agora aparece por extenso apenas na Seção 2.7.2, com os dados conferidos (70 estudos de 2020 a 2025; 78,9% com dados em inglês). Nas demais seções há remissão.
- O Quadro 1 deixou de repetir os resultados do texto e passou a comparar tarefa e dados, avaliação e relação com o trabalho.

### 2.7 Outras correções

- **2.1.1:** inclusão do critério de nervos e da divergência entre a OMS e a literatura brasileira (PCDT, Seção 6.3), que o sistema trata na Seção 4.5.6.
- **2.1.2:** a talidomida "nunca deve ser indicada para mulheres grávidas", como no PCDT.
- **2.5.1:** a arquitetura deixou de ser descrita com reordenação, que foi removida.
- **2.7.2:** ressalvas metodológicas. O MIRAGE avalia em múltipla escolha, e os "mais de 40%" do MEGA-RAG aparecem só no resumo do artigo.

## 3. Coerência e ABNT

- **Avaliação experimental (Seções 3.8 e 5.4) incorporada às partes de síntese:**
  - questões de pesquisa, sem alterá-las;
  - organização do trabalho (1.3);
  - aberturas dos Capítulos 3 e 5;
  - Quadro 2;
  - considerações finais;
  - Resumo e Abstract, com os números da Tabela 9 e a indicação de resultados preliminares.
- **Seção 2.8:** deixou de dizer que não há avaliação por especialistas.
- **Formatação:**
  - A4, margens 3/2 cm e Arial 12 conferidos;
  - sumário e listas atualizados pelo Word, sem erros de campo;
  - citações conformes à NBR 10520:2023;
  - correspondência citação ↔ referência íntegra nos dois sentidos.

## 4. Citações e fontes verificadas

- **Conteúdo confirmado no texto integral, no resumo publicado ou no documento oficial (15 obras):**
  - PCDT, conferido no texto do PDF;
  - Amugongo; Fernandes (parcial); Xu; Zakka; Yang; Arzideh;
  - Barbieri; Simões; Andrade;
  - Lopes; Palmeira;
  - Zheng; Panickssery; Xiong.
- **Corrigidas por inconsistência:** Zakka, Fernandes e Karpukhin.
- **Só metadados, sem reabertura do conteúdo:** as demais, em geral obras clássicas e documentação técnica usadas para definições.

A lista completa, com os endereços consultados, está em `03_AUDITORIA_REFERENCIAL.md`.

## 5. Decisões e pendências do autor ou do orientador

| ID | Decisão | Recomendação |
|---|---|---|
| D-01 | A avaliação experimental não corresponde a nenhuma questão de pesquisa nem a um objetivo específico | Acrescentar uma QP4 ("Com que correção e fundamentação o sistema responde a perguntas curadas, segundo avaliação automatizada validada por especialista?") e ajustar o objetivo d) para "avaliar tecnicamente o mecanismo de recuperação e a qualidade das respostas". Altera o escopo declarado, por isso não foi aplicado |
| D-02 | Entrada de órgãos governamentais ("MINISTÉRIO DA SAÚDE." × "BRASIL. Ministério da Saúde."), segundo a NBR 6023 | Conferir o padrão do guia da UPE; se seguir a NBR, padronizar todas as entradas e citações de uma vez (anos repetidos exigem 2022a/2022b) |
| D-03 | Distribuição dos estudos em Fernandes *et al.* (2024) | Conferir a Seção 4.2 e a Tabela 4 do artigo; se confirmada, pode voltar ao texto |
| D-04 | Valores 22.129 casos e 10,41/100 mil (Introdução) | Conferir no PDF do Boletim Epidemiológico 2026 |
| D-05 | Premissa da necessidade de informação na APS (2.1.2) | Opcional: citar um estudo sobre necessidades de informação de profissionais da APS, se houver |
| D-06 | Sigla PRISMA ausente da lista de siglas | Incluir na lista |
| D-07 | Declaração de uso de ferramentas de IA | Verificar se o curso ou a UPE exige; o uso na avaliação já está declarado em nota de rodapé (Seção 3.8.4), mas não o uso na redação |
| D-08 | O resumo (459 palavras) passa da primeira página em oito linhas | Se o template exigir página única, a candidata a corte é a frase sobre autenticação e avaliação de 0 a 10 ("O acesso exige autenticação… avaliação com participantes"), detalhe já tratado no Capítulo 4 |
| D-10 | Introdução e Justificativa ainda citam a mesma constatação das revisões | Opcional: encurtar a frase da Justificativa |
| D-11 | Separação entre "Estado da arte" (2.7) e "Trabalhos relacionados" (2.8) | Estrutura mantida; uma opção é fundir a 2.8 na 2.7 como síntese |
| D-12 | Seção 3.8 depois das ameaças à validade (3.7), e ameaças da avaliação experimental na 6.5 | Estrutura mantida; uma opção é mover a 3.8 para antes da 3.7 e concentrar todas as ameaças na 3.7 |

**Responsabilidade do autor:** conferir o texto revisado, saber explicar cada proposição diante da banca e validar as fontes com o orientador.

## 6. Testes de geração e exportação

- `npx tsx ../avaliacao/tcc/atualizar_tcc.ts` (em `backend/`): "TCC atualizado: 2 notas, 2 figuras, 4 referências" e "Revisão aplicada: 33 edições". A conferência automática do .md não apontou edição ausente.
- **XML do .docx:** 2.858 parágrafos e 34 tabelas com aberturas e fechamentos balanceados. Os textos antigos corrigidos não aparecem mais; os novos estão presentes.
- **`word_atualizar.ps1`:** campos, sumário e listas atualizados, PDF exportado com 137 páginas e nenhum "Erro! Indicador não definido". Quadro 1 na p. 37, como na Lista de Quadros.
- **Inspeção visual:** páginas do resumo (8–9) e do Capítulo 2 (30, 34, 37 e 38) conferidas no PDF.

**Não verificado:** template e guia da UPE, paginação dos elementos pré-textuais e conteúdo das obras classificadas como "metadados apenas".
