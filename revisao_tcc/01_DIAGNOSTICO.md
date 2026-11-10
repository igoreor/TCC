# 01 — Diagnóstico

Leitura integral do Capítulo 2 e das partes dos demais capítulos que se relacionam com ele: resumo, Introdução, aberturas dos Capítulos 3 e 5, Quadro 2, Seções 3.8, 5.4, 6.x e 7, e Referências. As localizações seguem a versão anterior à revisão.

## O que explicava a impressão de "texto de IA"

Uma busca no Capítulo 2 não encontrou os conectivos estereotipados mais comuns: "Nesse contexto", "Dessa forma", "Ademais", "Vale ressaltar", "fundamental" e "essencial" têm zero ocorrências. A impressão de texto gerado vinha de problemas estruturais:

1. **Repetição da mesma constatação.** "Predomínio do inglês, ausência de avaliação padronizada, pouca atenção a segurança e viés" (Amugongo *et al.*, 2025; Yang *et al.*, 2026) aparecia em seis lugares:
   - Introdução;
   - Justificativa;
   - Seções 2.5.3, 2.6 e 2.7.2;
   - Quadro 1.
2. **Enumeração sem comparação.** Na Seção 2.7.1, os trabalhos eram descritos em série ("X desenvolveu…, Y combinou…, Z desenvolveu…"). O Quadro 1 repetia os mesmos números do texto.
3. **Fecho padronizado.** Vários parágrafos terminavam com uma frase de ligação ao sistema, como "é a esse tipo de necessidade que o sistema proposto se dirige" e "como as discutidas nas seções seguintes".
4. **Generalizações sem fonte.** Exemplos: "sistemas destinados a contextos sensíveis costumam combinar…", "estratégias recomendadas…", "tarefa para a qual a RAG é especialmente adequada".
5. **Números que não correspondem à obra citada:** Almanac e Fernandes *et al.*, ver P0.

## Problemas encontrados

Severidade: P0, integridade; P1, científico ou coerência; P2, redação; P3, normalização.

| ID | Local | Problema | Evidência | Sev. | Proposta | Status |
|---|---|---|---|---|---|---|
| R-012, R-020, R-023 | 2.5.2, 2.7.2, Quadro 1 | Resultados do Almanac atribuídos ao artigo do NEJM AI, mas tirados do preprint de 2023 | Preprint: 130 cenários e +18% de factualidade. Artigo publicado: 314 perguntas de 9 especialidades, painel de 10 profissionais, ganhos em factualidade, completude, preferência e segurança adversarial (PubMed 38343631) | P0 | Usar os dados do artigo publicado | Aplicado |
| R-016, R-023 | 2.7.1, Quadro 1 | Distribuição dos 21 estudos de Fernandes *et al.* (15/1/5) e afirmação de que nenhum era baseado em texto | Não encontradas no texto conferido (PMC10779723). Confirmados: 1.659 identificados, 21 incluídos, maioria com imagens, área em estágio inicial | P0 | Manter só o confirmado; ver pendência D-03 | Aplicado |
| R-008 | 2.4.2 | Similaridade de cosseno atribuída a Karpukhin *et al.* (2020) | O DPR usa produto interno | P0 | Distinguir as duas medidas | Aplicado |
| R-020, R-023 | 2.7.2, Quadro 1 | "Redução superior a 40% na taxa de alucinação" do MEGA-RAG apresentada sem ressalva | O número está só no resumo; o corpo traz acurácia, precisão, revocação e F1, sem descrever a taxa (PMC12540348) | P1 | Ressalva explícita | Aplicado |
| R-011 | 2.5.1 | Arquitetura descrita com "reordenação", que a 2.4.3 e o Cap. 4 dizem ter sido removida | Contradição interna | P1 | Descrever a arquitetura atual | Aplicado |
| R-014, R-015 | 2.6 | Seção dizia que as dimensões "ainda serão definidas" e não fundamentava o *LLM-as-a-judge* nem o kappa usados na Seção 3.8 | Zheng, Panickssery e Cohen eram citados só no Cap. 3 | P1 | Novo parágrafo com fontes conferidas e ligação com as três avaliações | Aplicado |
| R-002 | 2.1.1 | Classificação operacional sem o critério de nervos, ponto de divergência entre OMS e literatura brasileira, relevante para o sistema | PCDT, 6.3.2, p. 26–27 | P1 | Incluir a divergência | Aplicado |
| R-003 | 2.1.2 | Talidomida chamada de imunossupressor; "uso proibido por mulheres grávidas" | PCDT: "nunca deve ser indicada para mulheres grávidas, em virtude do seu efeito teratogênico" | P1 | Corrigir | Aplicado |
| R-004 | 2.1.2 | "Necessidade concreta de informação" afirmada sem fonte | Nenhuma obra citada sustenta | P1 | Apresentar como premissa e indicar o limite | Aplicado; ver D-05 |
| R-005 | 2.2 | "Estratégias recomendadas para mitigá-los" sem atribuição conferível | — | P1 | Analisar quais riscos de Sutton *et al.* se aplicam ao sistema | Aplicado |
| R-009 | 2.4.2 | BioBERT apresentado como modelo de *embedding*; afirmação vaga sobre o idioma | Lee *et al.* (2020): modelo de linguagem pré-treinado | P1 | Precisar e indicar o que cada fonte mostra | Aplicado |
| R-013 | 2.5.3 | Generalização sem fonte e terceira repetição da lacuna das revisões | — | P1/P2 | Opções de projeto e remissão à 2.7.2 | Aplicado |
| R-024 | 2.8 | "Não dispõe de avaliação por especialistas"; avaliação experimental ausente | Contradiz a Seção 3.8 | P1 | Atualizar | Aplicado |
| R-025 a R-033 | 1, 1.3, 3, Quadro 2, 5, 7, Resumo, Abstract | Avaliação experimental (3.8/5.4) ausente da Introdução, da organização do trabalho, das aberturas dos Caps. 3 e 5, do Quadro 2, das considerações finais e do resumo | — | P1 | Menções mínimas, sem alterar questões nem objetivos | Aplicado |
| R-001 | 2 (abertura) | Abertura apenas enumerava as seções | — | P2 | Dizer a função de cada bloco | Aplicado |
| R-006 | 2.3 | Descrição genérica das capacidades dos modelos, sem fonte nem função | — | P2 | Delimitar as duas funções do modelo no sistema | Aplicado |
| R-007 | 2.3 | Fecho genérico após Ji *et al.* | — | P2 | Relacionar a distinção ao sistema e à avaliação | Aplicado |
| R-010 | 2.4.3 | Histórico do projeto dentro do referencial | — | P2 | Remissão à 4.9 | Aplicado |
| R-017 | 2.7.1 | Enumeração de trabalhos | — | P2 | Organizar por tipo de dado e tarefa | Aplicado |
| R-018 | 2.7.1 | "Especialmente adequada" (promocional) | — | P2 | Explicar a diferença de tarefa e de avaliação | Aplicado |
| R-019 | 2.7.2 | Resultado de Xiong *et al.* reproduzido sem a limitação pertinente | MIRAGE avalia em múltipla escolha | P2 | Acrescentar a limitação | Aplicado |
| R-021 | 2.7.2 | Lista de lacunas repetida; dados vagos | PMC12157099: 70 estudos (2020–2025); 78,9% com dados em inglês | P2 | Dados conferidos e relação com as escolhas do projeto | Aplicado |
| R-022, R-023 | 2.8 | Quadro 1 repetia os números do texto | — | P2 | Colunas de tarefa e dados e de avaliação | Aplicado |
| — | Geração do .md | Colchete final das marcações `[[[…]]]` fora do realce; alíneas da 6.5 sem linha em branco; última referência colada ao Apêndice A | Inspeção do .md | P3 | Corrigido em `docx_blocos.ts` e `aplicar.ts` | Aplicado |
| D-01 | 1.1/QP | Avaliação experimental não corresponde a nenhuma QP nem a um objetivo específico | Objetivo d) fala só da recuperação | P1 | Ver decisão D-01 | Pendente (autor) |
| D-02 | Referências | Órgãos da administração direta com entrada "MINISTÉRIO DA SAÚDE."; a NBR 6023 prevê a jurisdição antes do órgão ("BRASIL. Ministério da Saúde.") | NBR 6023, entidades | P3 | Ver decisão D-02 | Pendente (autor) |
| D-10 | 1, 1.2 | Introdução e Justificativa ainda citam a mesma constatação das revisões | — | P2 | Opcional: encurtar a frase da Justificativa | Pendente (opcional) |
| D-11, D-12 | 2.7/2.8; 3.7/3.8 | Separação entre "Estado da arte" e "Trabalhos relacionados"; Seção 3.8 depois das ameaças à validade (3.7) | Estrutura | P2 | Ver decisões D-11 e D-12 | Pendente (autor) |
