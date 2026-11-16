# Fontes citadas

Esta pasta contém documentos citados pelo TCC obtidos de fontes oficiais ou repositórios legais de acesso aberto. A integridade foi verificada por assinatura PDF, leitura e SHA-256; os hashes estão em `research/notes/article-recovery-report.md`.

Os arquivos WHO de 2009 são originais oficiais em inglês relacionados à tradução OMS/OPAS de 2010 citada. Eles **não devem ser apresentados como se fossem a tradução exata**. O arquivo de Shi é o preprint arXiv e também não deve ser confundido com a versão final dos anais AMIA. Desde 16/11/2026, a versão final dos anais AMIA também está nesta pasta (`2024 - Shi - MKRAGMedicalQuestionAnswering-AMIA.pdf`); é ela que deve ser citada.

Antes de redistribuir qualquer arquivo, conferir a licença indicada pelo editor. O uso local acadêmico não implica autorização para republicação.

## Fontes do corpus v2 (`hanseniase-v2`), baixadas em 23/10/2026

Documentos escolhidos pelo autor para a base de conhecimento (D38). Todos obtidos de fonte oficial, sem alteração; os recortes são feitos só na construção do corpus.

| Arquivo | Documento | Fonte oficial | Validação | SHA-256 |
|---|---|---|---|---|
| `2024 - Brasil - EstrategiaNacionalEnfrentamentoHanseniase2024-2030.pdf` | Brasil. Ministério da Saúde. SVSA. *Estratégia Nacional para Enfrentamento à Hanseníase 2024-2030*. 1. ed. Brasília, 2024. ISBN 978-65-5993-565-9. Licença CC BY-NC-SA 4.0 | gov.br/saude, `…/publicacoes/svsa/hanseniase/estrategia-nacional-para-enfrentamento-a-hanseniase-2024-2030/@@download/file` (a BVS-MS bloqueou o download) | PDF 1.4, 64 p. (62 p. no registro, mais capas); ISBN conferido no texto | `d85ea09891e0fb74a73561bafe74abf03a359b01ed2d13284dadc435e988655f` |
| `2023 - WHO - InterruptionTransmissionEliminationLeprosyTechnicalGuidance.pdf` | World Health Organization. *Interruption of transmission and elimination of leprosy disease – Technical guidance*. 2023. ISBN 978-92-9021-046-7. CC BY-NC-SA 3.0 IGO | who.int/publications/i/item/9789290210467 → iris.who.int (bitstream `4f41fbdb-…`) | PDF 1.4, 81 p.; ISBN conferido no texto | `e4c27c66570f2613c69fba26a3817c23a6c004df6ddf846843679d10411f0bf2` |
| `2026 - Brasil - DOU 2026-07-21 p167 PortariaSCTIE47-Claritromicina.pdf` | Página do DOU nº 135, Seção 1, p. 167 (21/07/2026), com a **Portaria SCTIE/MS nº 47, de 20/07/2026** (e as Portarias 45, 46 e 48, alheias à hanseníase) | gov.br/conitec, `…/portaria/2026/portaria-sctie-ms-no-47-de-20-de-julho-de-2026/@@display-file/file` | PDF 1.4, 1 p.; assinado digitalmente (ICP-Brasil, código 05152026072100167) | `98db0db25e28ed0c2d94338924d18ea9f53c1b8b812ae77eb946ddd9c738f9a9` |
| `2026 - Brasil - DOU 2026-08-04 p74 PortariaSCTIE51-qPCR.pdf` | Página do DOU nº 145, Seção 1, p. 74 (04/08/2026), com a **Portaria SCTIE/MS nº 51, de 31/07/2026** (e consultas públicas alheias) | gov.br/conitec, `…/portaria/2026/portaria-sctie-ms-no-51-de-31-de-julho-de-2026/@@display-file/file` | PDF 1.4, 1 p.; assinado digitalmente (código 05152026080400074) | `5574571d418b4993497a99932888bb87a2619fe16064821e890da5f5fa42dd5c` |

Observações:

- O LEMT (*Leprosy Elimination Monitoring Tool*, OMS) é uma planilha de monitoramento, não um texto, e não foi incluído.
- As portarias registram só a decisão (incorporar ou ampliar o uso), sem doses nem esquemas.

## Pendências de referência do rascunho `tcc-v4`, baixadas em 16/11/2026

Documentos recuperados para resolver comentários do rascunho `research/drafts/tcc-v4/conteudo-v4.txt`. Todos obtidos de fonte oficial, sem alteração.

| Arquivo | Documento | Fonte oficial | Validação | SHA-256 |
|---|---|---|---|---|
| `2000 - Voorhees - TREC8QATrackReport.pdf` | Voorhees, E. M. *The TREC-8 Question Answering Track Report*. In: *The Eighth Text REtrieval Conference (TREC-8)*. NIST Special Publication 500-246. Gaithersburg: NIST, nov. 2000. p. 77-82. Obra do governo dos EUA (NIST) | trec.nist.gov, `/pubs/trec8/papers/qa_report.pdf` (Last-Modified 27/10/2000). Paginação conferida no volume completo, `nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication500-246.pdf` (DOI 10.6028/NIST.SP.500-246), PDF p. 109-114 = p. impressas 77-82 | PDF 1.1, 6 p.; digitalização sem camada de texto (Ghostscript 5.02); definição do MRR lida na p. 1 (p. 77 impressa) | `5f2ef2bce8066d6a5b84a50ff7799f671584307ab8d262ac412110b1378266f7` |
| `2024 - Shi - MKRAGMedicalQuestionAnswering-AMIA.pdf` | Shi, Y. et al. *MKRAG: Medical Knowledge Retrieval Augmented Generation for Medical Question Answering*. *AMIA Annual Symposium Proceedings*, v. 2024, p. 1011-1020 (publicado em 22/05/2025). PMID 40417500; PMCID PMC12099378; sem DOI. "©2024 AMIA"; o PMC declara: "This is an Open Access article: verbatim copying and redistribution of this article are permitted in all media for any purpose" | Europe PMC, `europepmc.org/api/getPdf?pmcid=PMC12099378` (o PDF do PMC, `pmc.ncbi.nlm.nih.gov/articles/PMC12099378/pdf/5497.pdf`, exigiu reCAPTCHA; o tamanho, 791.223 bytes, coincide com os 772,7 KB anunciados pelo PMC) | PDF 1.5, 10 p.; p. impressas 1011-1020. Texto idêntico ao preprint arXiv 2309.16035v3, exceto a autoria: a versão AMIA tem 7 autores (sem Quanzheng Li) | `909ab9e48c430e6ab3aee88fec0e718b27e3c35a1643266cb95bcbdbd1411e58` |
| `2026 - Brasil - RelatorioRecomendacaoConitec1124-qPCR.pdf` | Brasil. Ministério da Saúde. Conitec. *Relatório de Recomendação nº 1.124: Teste de detecção molecular qualitativa do Mycobacterium leprae para auxiliar o diagnóstico de hanseníase em pacientes com lesões suspeitas e baciloscopia negativa*. Brasília, jun. 2026. Reprodução permitida com citação da fonte, sem fins comerciais | gov.br/conitec, `…/midias/relatorios/2026/relatorio-de-recomendacao-no-1-124-teste-de-deteccao-molecular-qualitativa-do-mycobacterium-leprae/@@display-file/file` | PDF 1.5, 99 p. (criado em 27/08/2026); recomendação final de 19/06/2026 (Registro de Deliberação nº 1.125/2026); frase "em fase de atualização" sobre o PCDT na p. 7 | `659ea3a787008d0f39b9e1e83ca0f18d6cd807a0e09c56b78516bed4d80e83a7` |

Observações:

- O Relatório nº 1.124 trata do qPCR (é o relatório da tecnologia decidida na Portaria SCTIE/MS nº 51/2026), não do PCDT. Ele só informa, na Apresentação, que o teste deverá compor o novo PCDT, "em fase de atualização".
- Carpineto e Romano (2012) e Wilcoxon (1945) foram conferidos só pelos metadados (sem cópia legal aberta); Jagerman et al. (2023) já estava em `research/literature/`.
