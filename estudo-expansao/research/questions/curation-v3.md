# Curadoria das perguntas publicadas (v3)

Gerado em 23/10/2026 por `software/rag-study/scripts/curation_v2_build.py`. Nenhum texto de pergunta foi redigido ou alterado (D15) e nenhum modelo avaliado foi executado.

Cada candidata foi anotada uma vez pelo agente (seções do PCDT que aborda, se o corpus responde, complexidade e problemas; arquivo `curation_v2_annotations.py`). A adequação a cada vaga é calculada por regras fixas:

- **temática alta:** todas as seções que a pergunta aborda estão nas seções-alvo da vaga;
- **temática média:** parte das seções está nas seções-alvo;
- **temática baixa:** nenhuma seção está nas seções-alvo;
- nas vagas não respondíveis, alta = o PCDT não responde.

As recomendações são do agente e **precisam da confirmação do autor**. O agente pertence a uma família avaliada; por isso só usou os critérios da vaga, nunca o desempenho esperado dos modelos (viés residual declarado).

## Resumo

- usar literal: 11
- literal com ressalva: 5 (a pergunta toca seção vizinha; usar literal só se os pontos-chave couberem nas seções-alvo)
- adaptar a partir de pergunta publicada: 18 (o autor reescreve; origem `adaptada`)
- autor escreve: 15 (nenhuma candidata serve)
- decisão pendente: 1

Nos pares de registro, uma pergunta real ocupa uma vaga, e a outra precisa expressar a mesma necessidade no outro registro; por isso o par geralmente leva uma adaptação.

## Tabela consolidada

| Vaga | Registro · complexidade · respondível | Decisão | Melhor candidata (texto literal) | Fonte | Problemas | Decisão pendente |
|---|---|---|---|---|---|---|
| T01 (P01) | leigo · simples · sim | usar literal | **EXT005**: Como identificar uma mancha que pode ser suspeita de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Am](https://aps-repo.bvs.br/aps/como-identificar-uma-mancha-que-pode-ser-suspeita-de-hanseniase/) | sinais de suspeição de mancha |  |
| T02 (P01) | técnico · simples · sim | adaptar (autor) | **EXT005**: Como identificar uma mancha que pode ser suspeita de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Am](https://aps-repo.bvs.br/aps/como-identificar-uma-mancha-que-pode-ser-suspeita-de-hanseniase/) | sinais de suspeição de mancha | ou trocar a necessidade do par para definição de caso (EXT101) e adaptar T01 |
| T03 (P02) | leigo · simples · sim | autor escreve | — | — |  |  |
| T04 (P02) | técnico · simples · sim | autor escreve | — | — |  |  |
| T05 (T05) | técnico · simples · sim | adaptar (autor) | **EXT111**: Toda dormência e fraqueza em mãos, pés e/ou face é hanseníase? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | dormência e fraqueza: diagnóstico diferencial pouco abordado | confirmar que 6.4.5 responde |
| T06 (T06) | leigo · simples · sim | adaptar (autor) | **EXT009**: Como é realizado o exame de baciloscopia para hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Ba](https://aps-repo.bvs.br/aps/como-e-realizado-o-exame-de-baciloscopia-para-hanseniase/) | técnica e sítios da baciloscopia |  |
| T07 (T07) | técnico · composta · parcial | autor escreve | — | — |  |  |
| T08 (T08) | técnico · composta · sim | adaptar (autor) | **EXT117**: É necessário solicitar ou realizar exames complementares para confirmar o diagnóstico de hanseníase? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | exames complementares para confirmar o diagnóstico; qPCR ampliado pela Portaria 51/2026 | a pergunta publicada também toca baciloscopia e histopatologia (7.2, 7.3) |
| T09 (T09) | leigo · simples · sim | autor escreve | — | — |  |  |
| T10 (P03) | leigo · simples · sim | adaptar (autor) | **EXT001**: Em relação ao tratamento de hanseníase, quando se estender até 18 meses? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Ba](https://aps-repo.bvs.br/aps/em-relacao-ao-tratamento-de-hanseniase-quando-se-estender-ate-18-meses/) | prazo para completar a PQT-U (p. 60) | alternativa: par sobre duração, com EXT037 literal em T10 e adaptação em T11 |
| T11 (P03) | técnico · simples · sim | usar literal | **EXT001**: Em relação ao tratamento de hanseníase, quando se estender até 18 meses? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Ba](https://aps-repo.bvs.br/aps/em-relacao-ao-tratamento-de-hanseniase-quando-se-estender-ate-18-meses/) | prazo para completar a PQT-U (p. 60) |  |
| T12 (P04) | leigo · simples · sim | adaptar (autor) | **EXT119**: Quais os efeitos colaterais mais comuns causados pelos medicamentos da PQT? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | efeitos colaterais da PQT |  |
| T13 (P04) | técnico · simples · sim | usar literal | **EXT119**: Quais os efeitos colaterais mais comuns causados pelos medicamentos da PQT? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | efeitos colaterais da PQT | se houver mais de 3 pontos-chave, rever complexidade |
| T14 (T14) | leigo · simples · sim | autor escreve | — | — |  |  |
| T15 (T15) | leigo · simples · sim | adaptar (autor) | **EXT120**: Estes efeitos colaterais persistem após o término do tratamento? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | persistência dos efeitos ("Estes") |  |
| T16 (T16) | técnico · composta · sim | literal com ressalva | **EXT014**: Como proceder em casos de efeito adverso medicamentoso no tratamento da hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Se](https://aps-repo.bvs.br/aps/como-proceder-em-casos-de-efeito-adverso-medicamentoso-no-tratamento-da-hanseniase/) | conduta em evento adverso; segunda linha ampliada pela Portaria 47/2026 (no corpus v2) | a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo; a resposta correta segue a norma mais recente |
| T17 (T17) | técnico · simples · sim | autor escreve | — | — |  |  |
| T18 (T18) | técnico · simples · sim | autor escreve | — | — |  |  |
| T19 (T19) | técnico · composta · sim | usar literal | **EXT013**: Qual o esquema terapêutico para crianças menores de 30 kg com diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Se](https://aps-repo.bvs.br/aps/qual-o-esquema-terapeutico-para-criancas-menores-de-30-kg-com-diagnostico-de-hanseniase/) | doses da PQT-U para crianças com menos de 30 kg (p. 59-60) | alternativa: EXT032 |
| T20 (P05) | leigo · simples · sim | adaptar (autor) | **EXT142**: Como se manifestam os sinais e sintomas das reações? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | sinais das reações tipo 1 e tipo 2 |  |
| T21 (P05) | técnico · simples · sim | adaptar (autor) | **EXT142**: Como se manifestam os sinais e sintomas das reações? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | sinais das reações tipo 1 e tipo 2 | ou ampliar a seção-alvo (alteraria a matriz) |
| T22 (P06) | leigo · composta · sim | adaptar (autor) | **EXT025**: Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Ma](https://aps-repo.bvs.br/aps/quais-sao-as-recomendacoes-para-o-uso-de-talidomida-no-tratamento-da-reacao-hansenica/) | uso da talidomida na reação tipo 2 | alternativa: EXT029 literal, se o autor considerar a mesma necessidade |
| T23 (P06) | técnico · composta · sim | usar literal | **EXT025**: Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Ma](https://aps-repo.bvs.br/aps/quais-sao-as-recomendacoes-para-o-uso-de-talidomida-no-tratamento-da-reacao-hansenica/) | uso da talidomida na reação tipo 2 |  |
| T24 (T24) | leigo · simples · sim | autor escreve | — | — |  |  |
| T25 (T25) | técnico · simples · sim | literal com ressalva | **EXT138**: Recebeu-se hoje um paciente que está em tratamento, relatando que a lesão está avermelhada e inchada. O que deve ser feito? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | lesão avermelhada e inchada durante a PQT | a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo; confirmar que é simples (reconhecer e tratar) |
| T26 (T26) | técnico · composta · sim | autor escreve | — | — |  |  |
| T27 (P07) | leigo · simples · sim | adaptar (autor) | **EXT144**: Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | dor no braço e fraqueza nas mãos (neurite): conduta |  |
| T28 (P07) | técnico · simples · sim | literal com ressalva | **EXT144**: Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | dor no braço e fraqueza nas mãos (neurite): conduta | a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo |
| T29 (T29) | leigo · simples · sim | autor escreve | — | — |  |  |
| T30 (T30) | leigo · simples · sim | autor escreve | — | — |  |  |
| T31 (T31) | leigo · composta · sim | autor escreve | — | — |  |  |
| T32 (T32) | técnico · composta · sim | literal com ressalva | **EXT061**: Por que realizar avaliação neurológica? | [Ministério da Saúde – Guia prático sobre a hanseníase (2017)](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) | finalidade da Avaliação Neurológica Simplificada | a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo |
| T33 (P08) | leigo · composta · sim | literal com ressalva | **EXT095**: A mulher em tratamento contra a hanseníase pode amamentar? | [Fiocruz – Perguntas e respostas (portal fiocruz.br, tema Han](https://fiocruz.br/pergunta/mulher-em-tratamento-contra-hanseniase-pode-amamentar) | amamentação durante a PQT (e pigmentação pela clofazimina) | a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo; não usar EXT122 (duplicata) |
| T34 (P08) | técnico · composta · sim | adaptar (autor) | **EXT095**: A mulher em tratamento contra a hanseníase pode amamentar? | [Fiocruz – Perguntas e respostas (portal fiocruz.br, tema Han](https://fiocruz.br/pergunta/mulher-em-tratamento-contra-hanseniase-pode-amamentar) | amamentação durante a PQT (e pigmentação pela clofazimina) |  |
| T35 (T35) | técnico · simples · sim | usar literal | **EXT136**: É contra-indicado o tratamento PQT para pacientes portadores do vírus HIV? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | PQT em pessoas com HIV |  |
| T36 (T36) | leigo · simples · sim | decisão pendente | **EXT007**: O que fazer quando uma pessoa diagnosticada com hanseníase se nega a fazer o tratamento? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Se](https://aps-repo.bvs.br/aps/o-que-fazer-quando-uma-pessoa-diagnosticada-com-hanseniase-se-nega-a-fazer-o-tratamento/) | recusa do tratamento: acolhimento (10.2.1.6) e ROM em situações extremas (12.5) | usar EXT007 com respondibilidade a reavaliar ou escrever pergunta do autor |
| T37 (P09) | leigo · composta · sim | usar literal | **EXT069**: O que eu devo saber sobre o pós-alta da PQT? | [Ministério da Saúde – Caderneta de saúde da pessoa acometida](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) | pós-alta: reações não significam volta da doença |  |
| T38 (P09) | técnico · composta · sim | adaptar (autor) | **EXT069**: O que eu devo saber sobre o pós-alta da PQT? | [Ministério da Saúde – Caderneta de saúde da pessoa acometida](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) | pós-alta: reações não significam volta da doença |  |
| T39 (T39) | técnico · simples · sim | adaptar (autor) | **EXT039**: Como é feito o acompanhamento dos pacientes durante o tratamento? | [Ministério da Saúde – Hanseníase: Perguntas Frequentes (FAQ)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) | acompanhamento durante a PQT-U (dose supervisionada, ANS) |  |
| T40 (P10) | leigo · simples · sim | usar literal | **EXT145**: Qual a conduta a ser tomada em relação à família do paciente? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | conduta com a família (contatos) |  |
| T41 (P10) | técnico · simples · sim | usar literal | **EXT015**: Qual a conduta em caso de contactantes domiciliares de paciente que já está em tratamento para Hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde NU](https://aps-repo.bvs.br/aps/qual-a-conduta-para-um-caso-de-contactantes-domiciliares-de-um-paciente-que-ja-esta-tratamento-para-hanseniase/) | conduta com contatos domiciliares |  |
| T42 (T42) | leigo · composta · parcial | adaptar (autor) | **EXT019**: Em pacientes residentes em áreas endêmicas ou contactantes domiciliares de portadores de hanseníase, o uso de quimioprofilaxia é eficaz na prevenção da doença? | [BVS APS – Segunda Opinião Formativa (Núcleo de Telessaúde Ri](https://aps-repo.bvs.br/aps/em-pacientes-residentes-em-areas-endemicas-ou-contactantes-domiciliares-de-portadores-de-hanseniase-o-uso-de-quimioprofilaxia-e-eficaz-na-prevencao-da-doenca/) | profilaxia pós-exposição: só no documento da OMS (inglês); o PCDT 2022 não adota | o autor acrescenta a parte BCG (13.1.1) e uma parte fora do corpus v2; alternativa de base: EXT147 |
| T43 (P11) | leigo · simples · sim | usar literal | **EXT073**: Por que o estigma e a discriminação podem acontecer com a pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo estigma, discri](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) | por que o estigma e a discriminação acontecem |  |
| T44 (P11) | técnico · simples · sim | adaptar (autor) | **EXT073**: Por que o estigma e a discriminação podem acontecer com a pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo estigma, discri](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) | por que o estigma e a discriminação acontecem |  |
| T45 (T45) | técnico · composta · parcial | adaptar (autor) | **EXT150**: Qual a política que vem sendo adotada no país para controlar e eliminar a hanseníase como problema de saúde pública no Brasil? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | política nacional: Estratégia Nacional 2024-2030 (metas, pilares, ações) |  |
| T46 (T46) | leigo · simples · não | adaptar (autor) | **EXT041**: Qual laboratório produz o medicamento? | [Ministério da Saúde – Hanseníase: Perguntas Frequentes (FAQ)](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) | laboratório produtor da talidomida; "o medicamento" depende da página | EXT046 descartada: a seção 16 responde em parte (verificação BM25, na-check-v2.md) |
| T47 (T47) | leigo · simples · não | autor escreve | — | — |  |  |
| T48 (T48) | técnico · simples · não | usar literal | **EXT125**: No dia da tomada da dose supervisionada, o paciente deverá estar em jejum? | [SES-RJ (Gerência de Dermatologia Sanitária) – Respostas para](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) | jejum na dose supervisionada: ausente do PCDT; confirmado por leitura dos trechos BM25 (na-check-v2.md) | alternativa: EXT127 |
| T49 (T49) | leigo · simples · não | autor escreve | — | — |  |  |
| T50 (T50) | leigo · simples · não | autor escreve | — | — |  |  |

## Detalhe por vaga

### T01 · diagnóstico · leigo · simples · respondível: sim

Decisão: **usar literal**. dúvida real de enfermeiro (SOF); suspeição de mancha (6.1); leiga, simples, respondível.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT081 | Como é feito o diagnóstico? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | média | ok | ok | ok | não | sim | generica; duplicata:EXT094 |
| EXT033 | Como realizar o teste de sensibilidade na suspeita de hanseníase? | [TelessaúdeRS-UFRGS – Perguntas da Semana](https://www.ufrgs.br/telessauders/perguntas/como-realizar-o-teste-de-sensibilidade-na-suspeita-de-hanseniase/) · não informado | média | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT005 ★ | Como identificar uma mancha que pode ser suspeita de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-identificar-uma-mancha-que-pode-ser-suspeita-de-hanseniase/) · Enfermeiro | alta | ok | ok | ok | sim | não |  |
| EXT101 | O que é um caso de hanseníase? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT113 | Como é feito este teste de sensibilidade? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | ok | não | sim | contexto |

### T02 · diagnóstico · técnico · simples · respondível: sim

Decisão: **adaptar (autor)**. par P01: mesma necessidade de T01 em registro técnico. Pendente: ou trocar a necessidade do par para definição de caso (EXT101) e adaptar T01.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT081 | Como é feito o diagnóstico? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | média | registro diferente | ok | ok | não | sim | generica; duplicata:EXT094; registro leigo (vaga técnico) |
| EXT033 | Como realizar o teste de sensibilidade na suspeita de hanseníase? | [TelessaúdeRS-UFRGS – Perguntas da Semana](https://www.ufrgs.br/telessauders/perguntas/como-realizar-o-teste-de-sensibilidade-na-suspeita-de-hanseniase/) · não informado | média | ok | ok | ok | não | sim |  |
| EXT005 ★ | Como identificar uma mancha que pode ser suspeita de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-identificar-uma-mancha-que-pode-ser-suspeita-de-hanseniase/) · Enfermeiro | alta | registro diferente | ok | ok | não | sim | registro leigo (vaga técnico) |
| EXT101 | O que é um caso de hanseníase? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |
| EXT113 | Como é feito este teste de sensibilidade? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | ok | ok | não | sim | contexto; registro leigo (vaga técnico) |

### T03 · diagnóstico · leigo · simples · respondível: sim

Decisão: **autor escreve**. nenhuma candidata sobre classificação operacional PB/MB.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT081 | Como é feito o diagnóstico? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica; duplicata:EXT094 |
| EXT108 | Que tipo de orientação deve ser dada ao paciente que chega no serviço de saúde apresentando uma lesão de pele? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | diferente | não | não | registro técnico (vaga leigo); respondível=parcial (vaga sim) |
| EXT112 | Como verificar se a mancha é dormente? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não |  |
| EXT094 | Como é feito o diagnóstico da hanseníase? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/como-e-feito-o-diagnostico-da-hanseniase) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | duplicata:EXT081 |
| EXT017 | Como se dá o diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-se-da-o-diagnostico-de-hanseniase/) · Médico | baixa | ok | ok | ok | não | não | generica |

### T04 · diagnóstico · técnico · simples · respondível: sim

Decisão: **autor escreve**. par P02 de T03.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT081 | Como é feito o diagnóstico? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | generica; duplicata:EXT094; registro leigo (vaga técnico) |
| EXT108 | Que tipo de orientação deve ser dada ao paciente que chega no serviço de saúde apresentando uma lesão de pele? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | respondível=parcial (vaga sim) |
| EXT112 | Como verificar se a mancha é dormente? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | registro leigo (vaga técnico) |
| EXT094 | Como é feito o diagnóstico da hanseníase? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/como-e-feito-o-diagnostico-da-hanseniase) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | duplicata:EXT081; registro leigo (vaga técnico) |
| EXT017 | Como se dá o diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-se-da-o-diagnostico-de-hanseniase/) · Médico | baixa | registro diferente | ok | ok | não | não | generica; registro leigo (vaga técnico) |

### T05 · diagnóstico · técnico · simples · respondível: sim

Decisão: **adaptar (autor)**. dormência e fraqueza sem mancha remetem à forma neural pura; precisa de registro técnico e foco em 6.4.5. Pendente: confirmar que 6.4.5 responde.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT111 ★ | Toda dormência e fraqueza em mãos, pés e/ou face é hanseníase? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | ok | diferente | não | sim | registro leigo (vaga técnico); respondível=parcial (vaga sim) |
| EXT089 | Quais são os sintomas da hanseníase? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/quais-sao-os-sintomas-da-hanseniase) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | duplicata:EXT063 EXT080; registro leigo (vaga técnico) |
| EXT033 | Como realizar o teste de sensibilidade na suspeita de hanseníase? | [TelessaúdeRS-UFRGS – Perguntas da Semana](https://www.ufrgs.br/telessauders/perguntas/como-realizar-o-teste-de-sensibilidade-na-suspeita-de-hanseniase/) · não informado | baixa | ok | ok | ok | não | não |  |
| EXT017 | Como se dá o diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-se-da-o-diagnostico-de-hanseniase/) · Médico | baixa | registro diferente | ok | ok | não | não | generica; registro leigo (vaga técnico) |
| EXT101 | O que é um caso de hanseníase? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não |  |

### T06 · diagnóstico · leigo · simples · respondível: sim

Decisão: **adaptar (autor)**. dúvida real (SOF) sobre baciloscopia (7.2); redação técnica, vaga leiga.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT009 ★ | Como é realizado o exame de baciloscopia para hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-e-realizado-o-exame-de-baciloscopia-para-hanseniase/) · Enfermeiro | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT113 | Como é feito este teste de sensibilidade? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | contexto |
| EXT033 | Como realizar o teste de sensibilidade na suspeita de hanseníase? | [TelessaúdeRS-UFRGS – Perguntas da Semana](https://www.ufrgs.br/telessauders/perguntas/como-realizar-o-teste-de-sensibilidade-na-suspeita-de-hanseniase/) · não informado | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT081 | Como é feito o diagnóstico? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica; duplicata:EXT094 |
| EXT112 | Como verificar se a mancha é dormente? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não |  |

### T07 · diagnóstico · técnico · composta · respondível: parcial

Decisão: **autor escreve**. nenhuma sobre teste rápido; vaga parcial exige parte fora do PCDT.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT113 | Como é feito este teste de sensibilidade? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | diferente | não | não | contexto; registro leigo (vaga técnico); simples (vaga composta); respondível=sim (vaga parcial) |
| EXT033 | Como realizar o teste de sensibilidade na suspeita de hanseníase? | [TelessaúdeRS-UFRGS – Perguntas da Semana](https://www.ufrgs.br/telessauders/perguntas/como-realizar-o-teste-de-sensibilidade-na-suspeita-de-hanseniase/) · não informado | baixa | ok | diferente | diferente | não | não | simples (vaga composta); respondível=sim (vaga parcial) |
| EXT081 | Como é feito o diagnóstico? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | registro diferente | diferente | diferente | não | não | generica; duplicata:EXT094; registro leigo (vaga técnico); simples (vaga composta); respondível=sim (vaga parcial) |
| EXT112 | Como verificar se a mancha é dormente? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | diferente | não | não | registro leigo (vaga técnico); simples (vaga composta); respondível=sim (vaga parcial) |
| EXT005 | Como identificar uma mancha que pode ser suspeita de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-identificar-uma-mancha-que-pode-ser-suspeita-de-hanseniase/) · Enfermeiro | baixa | registro diferente | diferente | diferente | não | não | registro leigo (vaga técnico); simples (vaga composta); respondível=sim (vaga parcial) |

### T08 · diagnóstico · técnico · composta · respondível: sim

Decisão: **adaptar (autor)**. exames complementares, com o qPCR ampliado pela Portaria 51/2026; precisa focar em 7.7 e na portaria. Pendente: a pergunta publicada também toca baciloscopia e histopatologia (7.2, 7.3).

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT033 | Como realizar o teste de sensibilidade na suspeita de hanseníase? | [TelessaúdeRS-UFRGS – Perguntas da Semana](https://www.ufrgs.br/telessauders/perguntas/como-realizar-o-teste-de-sensibilidade-na-suspeita-de-hanseniase/) · não informado | baixa | ok | diferente | ok | não | não | simples (vaga composta) |
| EXT113 | Como é feito este teste de sensibilidade? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | contexto; registro leigo (vaga técnico); simples (vaga composta) |
| EXT108 | Que tipo de orientação deve ser dada ao paciente que chega no serviço de saúde apresentando uma lesão de pele? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | diferente | diferente | não | não | simples (vaga composta); respondível=parcial (vaga sim) |
| EXT081 | Como é feito o diagnóstico? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | média | registro diferente | diferente | ok | não | sim | generica; duplicata:EXT094; registro leigo (vaga técnico); simples (vaga composta) |
| EXT005 | Como identificar uma mancha que pode ser suspeita de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-identificar-uma-mancha-que-pode-ser-suspeita-de-hanseniase/) · Enfermeiro | baixa | registro diferente | diferente | ok | não | não | registro leigo (vaga técnico); simples (vaga composta) |
| EXT117 ★ (fora do top 5) | É necessário solicitar ou realizar exames complementares para confirmar o diagnóstico de hanseníase? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | ok | não | sim |  |

### T09 · diagnóstico · leigo · simples · respondível: sim

Decisão: **autor escreve**. nenhuma leiga sobre a ANS; EXT061 reservada a T32.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT033 | Como realizar o teste de sensibilidade na suspeita de hanseníase? | [TelessaúdeRS-UFRGS – Perguntas da Semana](https://www.ufrgs.br/telessauders/perguntas/como-realizar-o-teste-de-sensibilidade-na-suspeita-de-hanseniase/) · não informado | média | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT081 | Como é feito o diagnóstico? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica; duplicata:EXT094 |
| EXT017 | Como se dá o diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-se-da-o-diagnostico-de-hanseniase/) · Médico | baixa | ok | ok | ok | não | não | generica |
| EXT009 | Como é realizado o exame de baciloscopia para hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-e-realizado-o-exame-de-baciloscopia-para-hanseniase/) · Enfermeiro | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT094 | Como é feito o diagnóstico da hanseníase? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/como-e-feito-o-diagnostico-da-hanseniase) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | duplicata:EXT081 |

### T10 · tratamento · leigo · simples · respondível: sim

Decisão: **adaptar (autor)**. par P03: mesma necessidade de T11 em registro leigo. Pendente: alternativa: par sobre duração, com EXT037 literal em T10 e adaptação em T11.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT087 | Existe tratamento? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | alta | ok | ok | ok | não | sim | generica; contexto |
| EXT082 | Como é o tratamento? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | alta | ok | ok | ok | sim | não | generica; duplicata:EXT099 |
| EXT035 | Como é feito o tratamento medicamentoso da hanseníase? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | ok | ok | ok | sim | não | duplicata:EXT066 EXT099 |
| EXT066 | Como é o tratamento medicamentoso da hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | ok | ok | ok | sim | não | duplicata:EXT035; titulo |
| EXT067 | Como devo tomar meus medicamentos? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | ok | ok | diferente | não | sim | generica; titulo; respondível=parcial (vaga sim) |
| EXT001 ★ (fora do top 5) | Em relação ao tratamento de hanseníase, quando se estender até 18 meses? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/em-relacao-ao-tratamento-de-hanseniase-quando-se-estender-ate-18-meses/) · Enfermeiro | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |

### T11 · tratamento · técnico · simples · respondível: sim

Decisão: **usar literal**. dúvida real de enfermeiro (SOF); prazo da PQT-U (10.1.1, p. 60); técnica, simples.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT087 | Existe tratamento? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | generica; contexto; registro leigo (vaga técnico) |
| EXT082 | Como é o tratamento? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | generica; duplicata:EXT099; registro leigo (vaga técnico) |
| EXT035 | Como é feito o tratamento medicamentoso da hanseníase? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | duplicata:EXT066 EXT099; registro leigo (vaga técnico) |
| EXT066 | Como é o tratamento medicamentoso da hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | registro diferente | ok | ok | não | sim | duplicata:EXT035; titulo; registro leigo (vaga técnico) |
| EXT067 | Como devo tomar meus medicamentos? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | registro diferente | ok | diferente | não | sim | generica; titulo; registro leigo (vaga técnico); respondível=parcial (vaga sim) |
| EXT001 ★ (fora do top 5) | Em relação ao tratamento de hanseníase, quando se estender até 18 meses? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/em-relacao-ao-tratamento-de-hanseniase-quando-se-estender-ate-18-meses/) · Enfermeiro | alta | ok | ok | ok | sim | não |  |

### T12 · tratamento · leigo · simples · respondível: sim

Decisão: **adaptar (autor)**. par P04: mesma necessidade de T13 em registro leigo.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT014 | Como proceder em casos de efeito adverso medicamentoso no tratamento da hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-proceder-em-casos-de-efeito-adverso-medicamentoso-no-tratamento-da-hanseniase/) · Agente Comunitário de Saú | média | registro diferente | diferente | ok | não | sim | registro técnico (vaga leigo); composta (vaga simples) |
| EXT128 | Como proceder se o paciente referir algum problema (efeito colateral) durante a tomada da dose supervisionada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | diferente | não | sim | registro técnico (vaga leigo); respondível=parcial (vaga sim) |
| EXT067 | Como devo tomar meus medicamentos? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | baixa | ok | ok | diferente | não | não | generica; titulo; respondível=parcial (vaga sim) |
| EXT120 | Estes efeitos colaterais persistem após o término do tratamento? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | ok | não | sim | contexto |
| EXT123 | Durante o período do tratamento o paciente pode fazer uso de bebida alcoólica? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | diferente | não | sim | duplicata:EXT098; respondível=parcial (vaga sim) |
| EXT119 ★ (fora do top 5) | Quais os efeitos colaterais mais comuns causados pelos medicamentos da PQT? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |

### T13 · tratamento · técnico · simples · respondível: sim

Decisão: **usar literal**. efeitos colaterais da PQT (10.1.6); técnica, simples, respondível. Pendente: se houver mais de 3 pontos-chave, rever complexidade.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT014 | Como proceder em casos de efeito adverso medicamentoso no tratamento da hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-proceder-em-casos-de-efeito-adverso-medicamentoso-no-tratamento-da-hanseniase/) · Agente Comunitário de Saú | média | ok | diferente | ok | não | sim | composta (vaga simples) |
| EXT128 | Como proceder se o paciente referir algum problema (efeito colateral) durante a tomada da dose supervisionada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | diferente | não | sim | respondível=parcial (vaga sim) |
| EXT067 | Como devo tomar meus medicamentos? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | baixa | registro diferente | ok | diferente | não | não | generica; titulo; registro leigo (vaga técnico); respondível=parcial (vaga sim) |
| EXT120 | Estes efeitos colaterais persistem após o término do tratamento? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | ok | ok | não | sim | contexto; registro leigo (vaga técnico) |
| EXT123 | Durante o período do tratamento o paciente pode fazer uso de bebida alcoólica? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | diferente | não | sim | duplicata:EXT098; registro leigo (vaga técnico); respondível=parcial (vaga sim) |
| EXT119 ★ (fora do top 5) | Quais os efeitos colaterais mais comuns causados pelos medicamentos da PQT? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |

### T14 · tratamento · leigo · simples · respondível: sim

Decisão: **autor escreve**. nenhuma sobre dapsona.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT087 | Existe tratamento? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica; contexto |
| EXT091 | A hanseníase tem cura? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/hanseniase-tem-cura) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica |
| EXT100 | Por que tratar a hanseníase? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/por-que-tratar-hanseniase) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | generica; respondível=parcial (vaga sim) |
| EXT066 | Como é o tratamento medicamentoso da hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | baixa | ok | ok | ok | não | não | duplicata:EXT035; titulo |
| EXT001 | Em relação ao tratamento de hanseníase, quando se estender até 18 meses? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/em-relacao-ao-tratamento-de-hanseniase-quando-se-estender-ate-18-meses/) · Enfermeiro | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |

### T15 · tratamento · leigo · simples · respondível: sim

Decisão: **adaptar (autor)**. tema da pigmentação pela clofazimina (10.1.5.2), mas 'Estes' depende da página de origem.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT067 | Como devo tomar meus medicamentos? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | baixa | ok | ok | diferente | não | não | generica; titulo; respondível=parcial (vaga sim) |
| EXT128 | Como proceder se o paciente referir algum problema (efeito colateral) durante a tomada da dose supervisionada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | diferente | não | não | registro técnico (vaga leigo); respondível=parcial (vaga sim) |
| EXT087 | Existe tratamento? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica; contexto |
| EXT123 | Durante o período do tratamento o paciente pode fazer uso de bebida alcoólica? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | duplicata:EXT098; respondível=parcial (vaga sim) |
| EXT082 | Como é o tratamento? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica; duplicata:EXT099 |
| EXT120 ★ (fora do top 5) | Estes efeitos colaterais persistem após o término do tratamento? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | ok | não | sim | contexto |

### T16 · tratamento · técnico · composta · respondível: sim

Decisão: **literal com ressalva**. dúvida real de ACS (SOF): conduta em evento adverso; combina 10.1.7 e Portaria 47/2026. Pendente: a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo; a resposta correta segue a norma mais recente.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT119 | Quais os efeitos colaterais mais comuns causados pelos medicamentos da PQT? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | diferente | ok | não | não | simples (vaga composta) |
| EXT128 | Como proceder se o paciente referir algum problema (efeito colateral) durante a tomada da dose supervisionada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | diferente | diferente | não | não | simples (vaga composta); respondível=parcial (vaga sim) |
| EXT014 ★ | Como proceder em casos de efeito adverso medicamentoso no tratamento da hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-proceder-em-casos-de-efeito-adverso-medicamentoso-no-tratamento-da-hanseniase/) · Agente Comunitário de Saú | média | ok | ok | ok | não | sim |  |
| EXT087 | Existe tratamento? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | generica; contexto; registro leigo (vaga técnico); simples (vaga composta) |
| EXT124 | Durante o tratamento há alguma restrição alimentar a ser seguida? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | diferente | não | não | registro leigo (vaga técnico); simples (vaga composta); respondível=não (vaga sim) |

### T17 · tratamento · técnico · simples · respondível: sim

Decisão: **autor escreve**. nenhuma sobre critério de investigação da resistência primária.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT087 | Existe tratamento? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | generica; contexto; registro leigo (vaga técnico) |
| EXT014 | Como proceder em casos de efeito adverso medicamentoso no tratamento da hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-proceder-em-casos-de-efeito-adverso-medicamentoso-no-tratamento-da-hanseniase/) · Agente Comunitário de Saú | baixa | ok | diferente | ok | não | não | composta (vaga simples) |
| EXT124 | Durante o tratamento há alguma restrição alimentar a ser seguida? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | diferente | não | não | registro leigo (vaga técnico); respondível=não (vaga sim) |
| EXT128 | Como proceder se o paciente referir algum problema (efeito colateral) durante a tomada da dose supervisionada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | respondível=parcial (vaga sim) |
| EXT067 | Como devo tomar meus medicamentos? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | baixa | registro diferente | ok | diferente | não | não | generica; titulo; registro leigo (vaga técnico); respondível=parcial (vaga sim) |

### T18 · tratamento · técnico · simples · respondível: sim

Decisão: **autor escreve**. EXT059 excluída (tema alterado em 2026); nenhuma outra.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT087 | Existe tratamento? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | generica; contexto; registro leigo (vaga técnico) |
| EXT014 | Como proceder em casos de efeito adverso medicamentoso no tratamento da hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-proceder-em-casos-de-efeito-adverso-medicamentoso-no-tratamento-da-hanseniase/) · Agente Comunitário de Saú | baixa | ok | diferente | ok | não | não | composta (vaga simples) |
| EXT124 | Durante o tratamento há alguma restrição alimentar a ser seguida? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | diferente | não | não | registro leigo (vaga técnico); respondível=não (vaga sim) |
| EXT082 | Como é o tratamento? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | generica; duplicata:EXT099; registro leigo (vaga técnico) |
| EXT066 | Como é o tratamento medicamentoso da hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | baixa | registro diferente | ok | ok | não | não | duplicata:EXT035; titulo; registro leigo (vaga técnico) |

### T19 · tratamento · técnico · composta · respondível: sim

Decisão: **usar literal**. dúvida real de médico (SOF); doses para criança com menos de 30 kg (10.1.1 e 12.2); técnica, composta. Pendente: alternativa: EXT032.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT066 | Como é o tratamento medicamentoso da hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | registro diferente | diferente | ok | não | sim | duplicata:EXT035; titulo; registro leigo (vaga técnico); simples (vaga composta) |
| EXT035 | Como é feito o tratamento medicamentoso da hanseníase? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | registro diferente | diferente | ok | não | sim | duplicata:EXT066 EXT099; registro leigo (vaga técnico); simples (vaga composta) |
| EXT087 | Existe tratamento? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | alta | registro diferente | diferente | ok | não | sim | generica; contexto; registro leigo (vaga técnico); simples (vaga composta) |
| EXT038 | O tratamento medicamentoso da hanseníase leva à cura? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | registro diferente | diferente | ok | não | sim | generica; registro leigo (vaga técnico); simples (vaga composta) |
| EXT099 | Como é feito o tratamento da hanseníase? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/como-e-feito-o-tratamento-da-hanseniase) · não informado (FAQ instit | alta | registro diferente | diferente | ok | não | sim | duplicata:EXT082; registro leigo (vaga técnico); simples (vaga composta) |
| EXT013 ★ (fora do top 5) | Qual o esquema terapêutico para crianças menores de 30 kg com diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-o-esquema-terapeutico-para-criancas-menores-de-30-kg-com-diagnostico-de-hanseniase/) · Médico | alta | ok | ok | ok | sim | não |  |

### T20 · reações · leigo · simples · respondível: sim

Decisão: **adaptar (autor)**. par P05: restringir à reação tipo 1, em registro leigo.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT026 | Qual a abordagem inicial para quadros de reações hansênicas? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-abordagem-inicial-para-quadros-de-reacoes-hansenicas/) · Enfermeiro | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT040 | Como é feito o tratamento medicamentoso para reação hansênica? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | registro técnico (vaga leigo); composta (vaga simples) |
| EXT143 | Existem medicamentos específicos para as reações? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não |  |
| EXT140 | O que fazer quando o paciente em tratamento apresentar sinais de reação? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT025 | Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/quais-sao-as-recomendacoes-para-o-uso-de-talidomida-no-tratamento-da-reacao-hansenica/) · Médico | baixa | registro diferente | diferente | ok | não | não | registro técnico (vaga leigo); composta (vaga simples) |
| EXT142 ★ (fora do top 5) | Como se manifestam os sinais e sintomas das reações? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | diferente | ok | não | sim | registro técnico (vaga leigo); composta (vaga simples) |

### T21 · reações · técnico · simples · respondível: sim

Decisão: **adaptar (autor)**. EXT142 abrange tipo 1 e tipo 2 (6.5.2 fora da seção-alvo); restringir à tipo 1. Pendente: ou ampliar a seção-alvo (alteraria a matriz).

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT026 | Qual a abordagem inicial para quadros de reações hansênicas? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-abordagem-inicial-para-quadros-de-reacoes-hansenicas/) · Enfermeiro | baixa | ok | ok | ok | não | não |  |
| EXT040 | Como é feito o tratamento medicamentoso para reação hansênica? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | baixa | ok | diferente | ok | não | não | composta (vaga simples) |
| EXT143 | Existem medicamentos específicos para as reações? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | registro leigo (vaga técnico) |
| EXT140 | O que fazer quando o paciente em tratamento apresentar sinais de reação? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não |  |
| EXT025 | Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/quais-sao-as-recomendacoes-para-o-uso-de-talidomida-no-tratamento-da-reacao-hansenica/) · Médico | baixa | ok | diferente | ok | não | não | composta (vaga simples) |
| EXT142 ★ (fora do top 5) | Como se manifestam os sinais e sintomas das reações? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | diferente | ok | não | sim | composta (vaga simples) |

### T22 · reações · leigo · composta · respondível: sim

Decisão: **adaptar (autor)**. par P06: mesma necessidade de T23 em registro leigo. Pendente: alternativa: EXT029 literal, se o autor considerar a mesma necessidade.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT025 ★ | Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/quais-sao-as-recomendacoes-para-o-uso-de-talidomida-no-tratamento-da-reacao-hansenica/) · Médico | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT027 | Qual a conduta para pacientes com Hanseníase, poliquimioterapia completa e crises reacionais do tipo 2 frequentes, apesar de uso contínuo de talidomida? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-conduta-frente-a-pacientes-com-hanseniase-poliquimioterapia-completa-e-que-persistem-com-crises-reacionais-do-tipo-2-frequentes-apesar-de-uso-continuo-de-talidomida/) · Médico | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT040 | Como é feito o tratamento medicamentoso para reação hansênica? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT029 | Qual a indicação da medicação Talidomida? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-indicacao-da-medicacao-talidomida/) · Enfermeiro | alta | ok | diferente | ok | não | sim | simples (vaga composta) |
| EXT055 | Quais as reações adversas que a talidomida pode causar? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | ok | diferente | ok | não | sim | simples (vaga composta) |

### T23 · reações · técnico · composta · respondível: sim

Decisão: **usar literal**. dúvida real de médico (SOF); talidomida na reação tipo 2 (10.1.2.2 e 10.1.5.8); técnica, composta.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT025 ★ | Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/quais-sao-as-recomendacoes-para-o-uso-de-talidomida-no-tratamento-da-reacao-hansenica/) · Médico | alta | ok | ok | ok | sim | não |  |
| EXT027 | Qual a conduta para pacientes com Hanseníase, poliquimioterapia completa e crises reacionais do tipo 2 frequentes, apesar de uso contínuo de talidomida? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-conduta-frente-a-pacientes-com-hanseniase-poliquimioterapia-completa-e-que-persistem-com-crises-reacionais-do-tipo-2-frequentes-apesar-de-uso-continuo-de-talidomida/) · Médico | alta | ok | ok | ok | sim | não |  |
| EXT040 | Como é feito o tratamento medicamentoso para reação hansênica? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |
| EXT029 | Qual a indicação da medicação Talidomida? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-indicacao-da-medicacao-talidomida/) · Enfermeiro | alta | registro diferente | diferente | ok | não | sim | registro leigo (vaga técnico); simples (vaga composta) |
| EXT055 | Quais as reações adversas que a talidomida pode causar? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | registro diferente | diferente | ok | não | sim | registro leigo (vaga técnico); simples (vaga composta) |

### T24 · reações · leigo · simples · respondível: sim

Decisão: **autor escreve**. nenhuma sobre fatores precipitantes das reações.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT026 | Qual a abordagem inicial para quadros de reações hansênicas? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-abordagem-inicial-para-quadros-de-reacoes-hansenicas/) · Enfermeiro | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT040 | Como é feito o tratamento medicamentoso para reação hansênica? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | registro técnico (vaga leigo); composta (vaga simples) |
| EXT068 | Quais são as complicações da hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | ok | ok | ok | sim | não | generica; titulo |
| EXT142 | Como se manifestam os sinais e sintomas das reações? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | registro técnico (vaga leigo); composta (vaga simples) |
| EXT143 | Existem medicamentos específicos para as reações? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não |  |

### T25 · reações · técnico · simples · respondível: sim

Decisão: **literal com ressalva**. vinheta clínica de reação tipo 1 durante a PQT (10.1.2.1); técnica, respondível. Pendente: a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo; confirmar que é simples (reconhecer e tratar).

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT040 | Como é feito o tratamento medicamentoso para reação hansênica? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | ok | diferente | ok | não | sim | composta (vaga simples) |
| EXT143 | Existem medicamentos específicos para as reações? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro leigo (vaga técnico) |
| EXT140 | O que fazer quando o paciente em tratamento apresentar sinais de reação? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |
| EXT025 | Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/quais-sao-as-recomendacoes-para-o-uso-de-talidomida-no-tratamento-da-reacao-hansenica/) · Médico | baixa | ok | diferente | ok | não | não | composta (vaga simples) |
| EXT026 | Qual a abordagem inicial para quadros de reações hansênicas? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-abordagem-inicial-para-quadros-de-reacoes-hansenicas/) · Enfermeiro | alta | ok | ok | ok | sim | não |  |
| EXT138 ★ (fora do top 5) | Recebeu-se hoje um paciente que está em tratamento, relatando que a lesão está avermelhada e inchada. O que deve ser feito? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | ok | não | sim |  |

### T26 · reações · técnico · composta · respondível: sim

Decisão: **autor escreve**. nenhuma sobre reações em crianças.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT040 | Como é feito o tratamento medicamentoso para reação hansênica? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | baixa | ok | ok | ok | não | não |  |
| EXT025 | Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/quais-sao-as-recomendacoes-para-o-uso-de-talidomida-no-tratamento-da-reacao-hansenica/) · Médico | baixa | ok | ok | ok | não | não |  |
| EXT143 | Existem medicamentos específicos para as reações? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | registro leigo (vaga técnico); simples (vaga composta) |
| EXT026 | Qual a abordagem inicial para quadros de reações hansênicas? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-abordagem-inicial-para-quadros-de-reacoes-hansenicas/) · Enfermeiro | baixa | ok | diferente | ok | não | não | simples (vaga composta) |
| EXT140 | O que fazer quando o paciente em tratamento apresentar sinais de reação? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | diferente | ok | não | não | simples (vaga composta) |

### T27 · neuropatia_incapacidade · leigo · simples · respondível: sim

Decisão: **adaptar (autor)**. par P07: mesma necessidade de T28 em registro leigo.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT061 | Por que realizar avaliação neurológica? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | baixa | registro diferente | diferente | ok | não | não | titulo; registro técnico (vaga leigo); composta (vaga simples) |
| EXT116 | O que deve ser feito quando o paciente já apresentar comprometimento dos nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | ok | ok | não | sim | generica; registro técnico (vaga leigo) |
| EXT114 | Como a hanseníase afeta os nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica |
| EXT144 ★ | Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT006 | Após o tratamento completo para Hanseníase a pessoa pode ficar com manchas e alteração de sensibilidade permanentes ? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/apos-o-tratamento-completo-para-hanseniase-a-pessoa-pode-ficar-com-manchas-e-alteracao-de-sensibilidade-permanentes/) · Enfermeiro | baixa | ok | ok | diferente | não | não | respondível=parcial (vaga sim) |

### T28 · neuropatia_incapacidade · técnico · simples · respondível: sim

Decisão: **literal com ressalva**. quadro de neurite aguda e conduta (6.6.2.1); técnica, simples. Pendente: a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT061 | Por que realizar avaliação neurológica? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | baixa | ok | diferente | ok | não | não | titulo; composta (vaga simples) |
| EXT116 | O que deve ser feito quando o paciente já apresentar comprometimento dos nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | ok | não | sim | generica |
| EXT114 | Como a hanseníase afeta os nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | generica; registro leigo (vaga técnico) |
| EXT144 ★ | Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | ok | não | sim |  |
| EXT006 | Após o tratamento completo para Hanseníase a pessoa pode ficar com manchas e alteração de sensibilidade permanentes ? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/apos-o-tratamento-completo-para-hanseniase-a-pessoa-pode-ficar-com-manchas-e-alteracao-de-sensibilidade-permanentes/) · Enfermeiro | baixa | registro diferente | ok | diferente | não | não | registro leigo (vaga técnico); respondível=parcial (vaga sim) |

### T29 · neuropatia_incapacidade · leigo · simples · respondível: sim

Decisão: **autor escreve**. nenhuma sobre dor neuropática.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT061 | Por que realizar avaliação neurológica? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | baixa | registro diferente | diferente | ok | não | não | titulo; registro técnico (vaga leigo); composta (vaga simples) |
| EXT116 | O que deve ser feito quando o paciente já apresentar comprometimento dos nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | ok | ok | não | sim | generica; registro técnico (vaga leigo) |
| EXT144 | Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT114 | Como a hanseníase afeta os nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica |
| EXT023 | Quais os nervos e articulações mais acometidos em pacientes com hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/quais-os-nervos-e-articulacoes-mais-acometidos-em-pacientes-com-hanseniase/) · Fisioterapeuta | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |

### T30 · neuropatia_incapacidade · leigo · simples · respondível: sim

Decisão: **autor escreve**. nenhuma sobre manifestações oculares.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT006 | Após o tratamento completo para Hanseníase a pessoa pode ficar com manchas e alteração de sensibilidade permanentes ? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/apos-o-tratamento-completo-para-hanseniase-a-pessoa-pode-ficar-com-manchas-e-alteracao-de-sensibilidade-permanentes/) · Enfermeiro | baixa | ok | ok | diferente | não | não | respondível=parcial (vaga sim) |
| EXT096 | A hanseníase pode causar deformidades físicas? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/hanseniase-pode-causar-deformidades-fisicas) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | generica |
| EXT144 | Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT116 | O que deve ser feito quando o paciente já apresentar comprometimento dos nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | generica; registro técnico (vaga leigo) |
| EXT061 | Por que realizar avaliação neurológica? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | baixa | registro diferente | diferente | ok | não | não | titulo; registro técnico (vaga leigo); composta (vaga simples) |

### T31 · neuropatia_incapacidade · leigo · composta · respondível: sim

Decisão: **autor escreve**. nenhuma sobre autocuidado e calçados; EXT115 é genérica (10.2.2).

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT116 | O que deve ser feito quando o paciente já apresentar comprometimento dos nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | generica; registro técnico (vaga leigo); simples (vaga composta) |
| EXT006 | Após o tratamento completo para Hanseníase a pessoa pode ficar com manchas e alteração de sensibilidade permanentes ? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/apos-o-tratamento-completo-para-hanseniase-a-pessoa-pode-ficar-com-manchas-e-alteracao-de-sensibilidade-permanentes/) · Enfermeiro | baixa | ok | diferente | diferente | não | não | simples (vaga composta); respondível=parcial (vaga sim) |
| EXT144 | Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | registro técnico (vaga leigo); simples (vaga composta) |
| EXT061 | Por que realizar avaliação neurológica? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | baixa | registro diferente | ok | ok | não | não | titulo; registro técnico (vaga leigo) |
| EXT115 | As deformidades físicas causadas pela hanseníase podem ser evitadas? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | diferente | ok | não | não | generica; simples (vaga composta) |

### T32 · neuropatia_incapacidade · técnico · composta · respondível: sim

Decisão: **literal com ressalva**. finalidade da ANS (7.1) ligada à prevenção de incapacidades (10.2.2); técnica, composta; título de material do MS. Pendente: a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT061 ★ | Por que realizar avaliação neurológica? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | média | ok | ok | ok | não | sim | titulo |
| EXT115 | As deformidades físicas causadas pela hanseníase podem ser evitadas? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | diferente | ok | não | sim | generica; registro leigo (vaga técnico); simples (vaga composta) |
| EXT116 | O que deve ser feito quando o paciente já apresentar comprometimento dos nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | diferente | ok | não | sim | generica; simples (vaga composta) |
| EXT144 | Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | diferente | ok | não | não | simples (vaga composta) |
| EXT096 | A hanseníase pode causar deformidades físicas? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/hanseniase-pode-causar-deformidades-fisicas) · não informado (FAQ instit | média | registro diferente | diferente | ok | não | sim | generica; registro leigo (vaga técnico); simples (vaga composta) |

### T33 · casos_especiais · leigo · composta · respondível: sim

Decisão: **literal com ressalva**. amamentação durante a PQT (12.1.2), com efeito da clofazimina; leiga, composta. Pendente: a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave couberem nas seções-alvo; não usar EXT122 (duplicata).

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT004 | Como identificar se uma criança pode ter hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-identificar-se-uma-crianca-pode-ter-hanseniase/) · Enfermeiro | baixa | ok | diferente | ok | não | não | simples (vaga composta) |
| EXT032 | Qual tratamento deve ser adotado para crianças diagnosticadas com hanseníase na forma multibacilar? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-tratamento-deve-ser-adotado-para-criancas-diagnosticadas-com-hanseniase-na-forma-multibacilar/) · Médico | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT095 ★ | A mulher em tratamento contra a hanseníase pode amamentar? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/mulher-em-tratamento-contra-hanseniase-pode-amamentar) · não informado (FAQ instit | média | ok | ok | ok | não | sim | duplicata:EXT122 |
| EXT013 | Qual o esquema terapêutico para crianças menores de 30 kg com diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-o-esquema-terapeutico-para-criancas-menores-de-30-kg-com-diagnostico-de-hanseniase/) · Médico | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT070 | Como fica a saúde sexual e reprodutiva da pessoa em tratamento para a hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | ok | ok | diferente | não | sim | parte_fora_pcdt; titulo; respondível=parcial (vaga sim) |

### T34 · casos_especiais · técnico · composta · respondível: sim

Decisão: **adaptar (autor)**. par P08: mesma necessidade de T33 em registro técnico.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT004 | Como identificar se uma criança pode ter hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-identificar-se-uma-crianca-pode-ter-hanseniase/) · Enfermeiro | baixa | registro diferente | diferente | ok | não | não | registro leigo (vaga técnico); simples (vaga composta) |
| EXT032 | Qual tratamento deve ser adotado para crianças diagnosticadas com hanseníase na forma multibacilar? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-tratamento-deve-ser-adotado-para-criancas-diagnosticadas-com-hanseniase-na-forma-multibacilar/) · Médico | baixa | ok | ok | ok | não | não |  |
| EXT095 ★ | A mulher em tratamento contra a hanseníase pode amamentar? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/mulher-em-tratamento-contra-hanseniase-pode-amamentar) · não informado (FAQ instit | média | registro diferente | ok | ok | não | sim | duplicata:EXT122; registro leigo (vaga técnico) |
| EXT013 | Qual o esquema terapêutico para crianças menores de 30 kg com diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-o-esquema-terapeutico-para-criancas-menores-de-30-kg-com-diagnostico-de-hanseniase/) · Médico | baixa | ok | ok | ok | não | não |  |
| EXT070 | Como fica a saúde sexual e reprodutiva da pessoa em tratamento para a hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | registro diferente | ok | diferente | não | sim | parte_fora_pcdt; titulo; registro leigo (vaga técnico); respondível=parcial (vaga sim) |

### T35 · casos_especiais · técnico · simples · respondível: sim

Decisão: **usar literal**. PQT em pessoas com HIV (12.3); técnica, simples.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT070 | Como fica a saúde sexual e reprodutiva da pessoa em tratamento para a hanseníase? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | baixa | registro diferente | diferente | diferente | não | não | parte_fora_pcdt; titulo; registro leigo (vaga técnico); composta (vaga simples); respondível=parcial (vaga sim) |
| EXT095 | A mulher em tratamento contra a hanseníase pode amamentar? | [Fiocruz – Perguntas e respostas (portal fiocr](https://fiocruz.br/pergunta/mulher-em-tratamento-contra-hanseniase-pode-amamentar) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | duplicata:EXT122; registro leigo (vaga técnico); composta (vaga simples) |
| EXT004 | Como identificar se uma criança pode ter hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/como-identificar-se-uma-crianca-pode-ter-hanseniase/) · Enfermeiro | baixa | registro diferente | ok | ok | não | não | registro leigo (vaga técnico) |
| EXT012 | O tratamento para hanseníase, interfere na eficácia dos contraceptivos? Quais as melhores opções? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/o-tratamento-para-hanseniase-interfere-na-eficacia-dos-contraceptivos-quais-as-melhores-opcoes/) · Enfermeiro | baixa | registro diferente | diferente | diferente | não | não | parte_fora_pcdt; registro leigo (vaga técnico); composta (vaga simples); respondível=parcial (vaga sim) |
| EXT032 | Qual tratamento deve ser adotado para crianças diagnosticadas com hanseníase na forma multibacilar? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-tratamento-deve-ser-adotado-para-criancas-diagnosticadas-com-hanseniase-na-forma-multibacilar/) · Médico | baixa | ok | diferente | ok | não | não | composta (vaga simples) |
| EXT136 ★ (fora do top 5) | É contra-indicado o tratamento PQT para pacientes portadores do vírus HIV? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |

### T36 · casos_especiais · leigo · simples · respondível: sim

Decisão: **decisão pendente**. dúvida real de ACS sobre recusa do tratamento; 12.5 trata só de dificuldade extrema de adesão (esquema ROM). Pendente: usar EXT007 com respondibilidade a reavaliar ou escrever pergunta do autor.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT135 | Como deve ser feito o tratamento para pacientes que também tenham tuberculose? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT013 | Qual o esquema terapêutico para crianças menores de 30 kg com diagnóstico de hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-o-esquema-terapeutico-para-criancas-menores-de-30-kg-com-diagnostico-de-hanseniase/) · Médico | baixa | registro diferente | diferente | ok | não | não | registro técnico (vaga leigo); composta (vaga simples) |
| EXT122 | A mulher em tratamento pode amamentar? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | ok | não | não | duplicata:EXT095 |
| EXT012 | O tratamento para hanseníase, interfere na eficácia dos contraceptivos? Quais as melhores opções? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/o-tratamento-para-hanseniase-interfere-na-eficacia-dos-contraceptivos-quais-as-melhores-opcoes/) · Enfermeiro | baixa | ok | diferente | diferente | não | não | parte_fora_pcdt; composta (vaga simples); respondível=parcial (vaga sim) |
| EXT136 | É contra-indicado o tratamento PQT para pacientes portadores do vírus HIV? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | ok | não | não | registro técnico (vaga leigo) |
| EXT007 ★ (fora do top 5) | O que fazer quando uma pessoa diagnosticada com hanseníase se nega a fazer o tratamento? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/o-que-fazer-quando-uma-pessoa-diagnosticada-com-hanseniase-se-nega-a-fazer-o-tratamento/) · Agente Comunitário de Saú | média | ok | ok | diferente | não | sim | respondível=parcial (vaga sim) |

### T37 · monitoramento · leigo · composta · respondível: sim

Decisão: **usar literal**. pós-alta (14.1.2): reações não significam volta da doença; leiga, composta; título da Caderneta do MS.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT069 ★ | O que eu devo saber sobre o pós-alta da PQT? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | ok | ok | ok | sim | não | titulo |
| EXT039 | Como é feito o acompanhamento dos pacientes durante o tratamento? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | baixa | ok | diferente | ok | não | não | simples (vaga composta) |
| EXT062 | Como proceder após o término do tratamento? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | média | ok | ok | ok | não | sim | titulo |
| EXT021 | Paciente da Atenção Básica que conclui o tratamento poliquimioterápico (PQT) para Hanseníase MB poderá receber alta na Unidade de Saúde ? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/paciente-da-atencao-basica-que-conclui-o-tratamento-poliquimioterapico-pqt-para-hanseniase-mb-podera-receber-alta-na-unidade-de-saude/) · Enfermeiro | média | registro diferente | diferente | ok | não | sim | registro técnico (vaga leigo); simples (vaga composta) |
| EXT137 | Como reconhecer um caso de recidiva (paciente com sinais clínicos após a alta por cura)? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |

### T38 · monitoramento · técnico · composta · respondível: sim

Decisão: **adaptar (autor)**. par P09: mesma necessidade de T37 em registro técnico.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT069 ★ | O que eu devo saber sobre o pós-alta da PQT? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | registro diferente | ok | ok | não | sim | titulo; registro leigo (vaga técnico) |
| EXT039 | Como é feito o acompanhamento dos pacientes durante o tratamento? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | registro leigo (vaga técnico); simples (vaga composta) |
| EXT062 | Como proceder após o término do tratamento? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | média | registro diferente | ok | ok | não | sim | titulo; registro leigo (vaga técnico) |
| EXT021 | Paciente da Atenção Básica que conclui o tratamento poliquimioterápico (PQT) para Hanseníase MB poderá receber alta na Unidade de Saúde ? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/paciente-da-atencao-basica-que-conclui-o-tratamento-poliquimioterapico-pqt-para-hanseniase-mb-podera-receber-alta-na-unidade-de-saude/) · Enfermeiro | média | ok | diferente | ok | não | sim | simples (vaga composta) |
| EXT137 | Como reconhecer um caso de recidiva (paciente com sinais clínicos após a alta por cura)? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |

### T39 · monitoramento · técnico · simples · respondível: sim

Decisão: **adaptar (autor)**. tema exato de 14.1.1, mas redação leiga; vaga técnica.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT039 ★ | Como é feito o acompanhamento dos pacientes durante o tratamento? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro leigo (vaga técnico) |
| EXT069 | O que eu devo saber sobre o pós-alta da PQT? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | baixa | registro diferente | diferente | ok | não | não | titulo; registro leigo (vaga técnico); composta (vaga simples) |
| EXT021 | Paciente da Atenção Básica que conclui o tratamento poliquimioterápico (PQT) para Hanseníase MB poderá receber alta na Unidade de Saúde ? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/paciente-da-atencao-basica-que-conclui-o-tratamento-poliquimioterapico-pqt-para-hanseniase-mb-podera-receber-alta-na-unidade-de-saude/) · Enfermeiro | baixa | ok | ok | ok | não | não |  |
| EXT062 | Como proceder após o término do tratamento? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | baixa | registro diferente | diferente | ok | não | não | titulo; registro leigo (vaga técnico); composta (vaga simples) |
| EXT118 | Que tipo de problema pode ocorrer se o paciente fizer o tratamento de forma irregular? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | diferente | não | não | registro leigo (vaga técnico); respondível=parcial (vaga sim) |

### T40 · contatos_prevenção · leigo · simples · respondível: sim

Decisão: **usar literal**. conduta com a família do paciente (13); leiga; forma o par P10 com EXT015, ambas reais.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT065 | E quanto às pessoas que têm contato comigo, o que devo fazer? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | ok | ok | ok | não | sim | contexto; titulo |
| EXT015 | Qual a conduta em caso de contactantes domiciliares de paciente que já está em tratamento para Hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-conduta-para-um-caso-de-contactantes-domiciliares-de-um-paciente-que-ja-esta-tratamento-para-hanseniase/) · Agente Comunitário de Saú | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |
| EXT145 ★ | Qual a conduta a ser tomada em relação à família do paciente? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |
| EXT084 | Existe uma forma de prevenção? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | média | ok | ok | diferente | não | sim | generica; respondível=parcial (vaga sim) |
| EXT011 | Qual conduta em relação aos contatos de hanseníase que já tem cicatriz de BCG? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-conduta-em-relacao-aos-contatos-de-hanseniase-que-ja-tem-cicatriz-de-bcg/) · Enfermeiro | alta | registro diferente | ok | ok | não | sim | registro técnico (vaga leigo) |

### T41 · contatos_prevenção · técnico · simples · respondível: sim

Decisão: **usar literal**. dúvida real de ACS (SOF); contatos domiciliares (13); técnica, simples.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT065 | E quanto às pessoas que têm contato comigo, o que devo fazer? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | registro diferente | ok | ok | não | sim | contexto; titulo; registro leigo (vaga técnico) |
| EXT015 ★ | Qual a conduta em caso de contactantes domiciliares de paciente que já está em tratamento para Hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-conduta-para-um-caso-de-contactantes-domiciliares-de-um-paciente-que-ja-esta-tratamento-para-hanseniase/) · Agente Comunitário de Saú | alta | ok | ok | ok | sim | não |  |
| EXT145 | Qual a conduta a ser tomada em relação à família do paciente? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro leigo (vaga técnico) |
| EXT084 | Existe uma forma de prevenção? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | média | registro diferente | ok | diferente | não | sim | generica; registro leigo (vaga técnico); respondível=parcial (vaga sim) |
| EXT011 | Qual conduta em relação aos contatos de hanseníase que já tem cicatriz de BCG? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-conduta-em-relacao-aos-contatos-de-hanseniase-que-ja-tem-cicatriz-de-bcg/) · Enfermeiro | alta | ok | ok | ok | sim | não |  |

### T42 · contatos_prevenção · leigo · composta · respondível: parcial

Decisão: **adaptar (autor)**. profilaxia pós-exposição agora no corpus (OMS 7.2.6); EXT019 é técnica e simples; vaga leiga, composta e parcial. Pendente: o autor acrescenta a parte BCG (13.1.1) e uma parte fora do corpus v2; alternativa de base: EXT147.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT084 | Existe uma forma de prevenção? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | média | ok | diferente | ok | não | sim | generica; simples (vaga composta) |
| EXT065 | E quanto às pessoas que têm contato comigo, o que devo fazer? | [Ministério da Saúde – Caderneta de saúde da p](https://biblioteca.cofen.gov.br/wp-content/uploads/2021/02/Caderneta-de-saude-da-pessoa-acometida-pela-hanseniase.pdf) · não se aplica (título de  | alta | ok | diferente | diferente | não | sim | contexto; titulo; simples (vaga composta); respondível=sim (vaga parcial) |
| EXT019 ★ | Em pacientes residentes em áreas endêmicas ou contactantes domiciliares de portadores de hanseníase, o uso de quimioprofilaxia é eficaz na prevenção da doença? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/em-pacientes-residentes-em-areas-endemicas-ou-contactantes-domiciliares-de-portadores-de-hanseniase-o-uso-de-quimioprofilaxia-e-eficaz-na-prevencao-da-doenca/) · não informado | alta | registro diferente | diferente | diferente | não | sim | registro técnico (vaga leigo); simples (vaga composta); respondível=sim (vaga parcial) |
| EXT010 | Qual o objetivo e como programar a vigilância de contatos para a Hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/o-que-e-e-como-definimos-a-vigilancia-de-contatos-para-a-hanseniase/) · Enfermeiro | alta | registro diferente | ok | diferente | não | sim | registro técnico (vaga leigo); respondível=sim (vaga parcial) |
| EXT015 | Qual a conduta em caso de contactantes domiciliares de paciente que já está em tratamento para Hanseníase? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/qual-a-conduta-para-um-caso-de-contactantes-domiciliares-de-um-paciente-que-ja-esta-tratamento-para-hanseniase/) · Agente Comunitário de Saú | alta | registro diferente | diferente | diferente | não | sim | registro técnico (vaga leigo); simples (vaga composta); respondível=sim (vaga parcial) |

### T43 · psicossocial · leigo · simples · respondível: sim

Decisão: **usar literal**. por que o estigma acontece (10.2.1.1); leiga, simples; título de cartilha do MS.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT073 ★ | Por que o estigma e a discriminação podem acontecer com a pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | alta | ok | ok | ok | sim | não | titulo |
| EXT075 | Nos serviços de saúde, quais são os direitos da pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | alta | ok | ok | diferente | não | sim | titulo; respondível=parcial (vaga sim) |
| EXT074 | E o direito à saúde da pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | alta | ok | ok | diferente | não | sim | contexto; titulo; respondível=parcial (vaga sim) |
| EXT072 | E o que é discriminação? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | alta | ok | ok | ok | não | sim | contexto; titulo |
| EXT078 | Quais outros direitos relacionados à pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | baixa | ok | ok | diferente | não | não | titulo; respondível=não (vaga sim) |

### T44 · psicossocial · técnico · simples · respondível: sim

Decisão: **adaptar (autor)**. par P11: mesma necessidade de T43 em registro técnico.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT073 ★ | Por que o estigma e a discriminação podem acontecer com a pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | alta | registro diferente | ok | ok | não | sim | titulo; registro leigo (vaga técnico) |
| EXT075 | Nos serviços de saúde, quais são os direitos da pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | alta | registro diferente | ok | diferente | não | sim | titulo; registro leigo (vaga técnico); respondível=parcial (vaga sim) |
| EXT074 | E o direito à saúde da pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | alta | registro diferente | ok | diferente | não | sim | contexto; titulo; registro leigo (vaga técnico); respondível=parcial (vaga sim) |
| EXT072 | E o que é discriminação? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | alta | registro diferente | ok | ok | não | sim | contexto; titulo; registro leigo (vaga técnico) |
| EXT078 | Quais outros direitos relacionados à pessoa acometida pela hanseníase? | [Ministério da Saúde – Hanseníase: conhecendo ](https://www.saude.mg.gov.br/wp-content/uploads/2018/01/hanseniase_conhecendo_estigma_discriminacao_direitos_pessoas-3f8.pdf) · não se aplica (título de  | baixa | registro diferente | ok | diferente | não | não | titulo; registro leigo (vaga técnico); respondível=não (vaga sim) |

### T45 · epidemiologia · técnico · composta · respondível: parcial

Decisão: **adaptar (autor)**. política nacional respondida pela Estratégia 2024-2030; vaga técnica e parcial: acrescentar dado posterior ao período da Estratégia.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT083 | Há algum grupo de risco para essa doença? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | registro leigo (vaga técnico); simples (vaga composta) |
| EXT086 | Como se adquire a doença? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | baixa | registro diferente | diferente | diferente | não | não | duplicata:EXT060 EXT090; registro leigo (vaga técnico); simples (vaga composta); respondível=sim (vaga parcial) |
| EXT107 | Quando os doentes de formas contagiantes colocam em risco a comunidade? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | diferente | ok | não | não | generica; registro leigo (vaga técnico); simples (vaga composta) |
| EXT060 | Como se transmite a hanseníase? Como se pega hanseníase? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | baixa | registro diferente | diferente | diferente | não | não | duplicata:EXT086 EXT090; registro leigo (vaga técnico); simples (vaga composta); respondível=sim (vaga parcial) |
| EXT079 | A hanseníase é uma doença contagiosa? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | baixa | registro diferente | diferente | diferente | não | não | generica; registro leigo (vaga técnico); simples (vaga composta); respondível=sim (vaga parcial) |
| EXT150 ★ (fora do top 5) | Qual a política que vem sendo adotada no país para controlar e eliminar a hanseníase como problema de saúde pública no Brasil? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | diferente | não | não | registro leigo (vaga técnico); respondível=sim (vaga parcial) |

### T46 · gestão_políticas · leigo · simples · respondível: não

Decisão: **adaptar (autor)**. não respondível (laboratório produtor ausente do PCDT), mas 'o medicamento' depende da página. Pendente: EXT046 descartada: a seção 16 responde em parte (verificação BM25, na-check-v2.md).

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT041 ★ | Qual laboratório produz o medicamento? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | alta | ok | ok | ok | não | sim | contexto |
| EXT043 | Por que somente unidades com cadastro válido poderão dispensar a talidomida? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | média | registro diferente | ok | diferente | não | sim | registro técnico (vaga leigo); respondível=parcial (vaga não) |
| EXT054 | Onde, como e por quanto tempo devo guardar a talidomida? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | média | ok | diferente | diferente | não | sim | composta (vaga simples); respondível=parcial (vaga não) |
| EXT046 | Como o médico cadastrado poderá solicitar a Notificação de Receita de Talidomida? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | média | registro diferente | ok | diferente | não | sim | registro técnico (vaga leigo); respondível=parcial (vaga não) |
| EXT050 | A talidomida pode ser fracionada? | [Ministério da Saúde – Hanseníase: Perguntas F](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hanseniase/faq) · não informado (FAQ instit | média | ok | ok | diferente | não | sim | respondível=parcial (vaga não) |

### T47 · diagnóstico · leigo · simples · respondível: não

Decisão: **autor escreve**. nenhuma sobre tratamento de outra doença de pele.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT112 | Como verificar se a mancha é dormente? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | respondível=sim (vaga não) |
| EXT113 | Como é feito este teste de sensibilidade? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | contexto; respondível=sim (vaga não) |
| EXT110 | Como a doença pode evoluir? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | generica; respondível=sim (vaga não) |
| EXT108 | Que tipo de orientação deve ser dada ao paciente que chega no serviço de saúde apresentando uma lesão de pele? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | ok | diferente | não | sim | registro técnico (vaga leigo); respondível=parcial (vaga não) |
| EXT109 | Como a doença surge? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | diferente | não | sim | generica; respondível=parcial (vaga não) |

### T48 · tratamento · técnico · simples · respondível: não

Decisão: **usar literal**. jejum na dose supervisionada: ausente do PCDT; técnica, simples, não respondível. Pendente: alternativa: EXT127.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT129 | É preciso guardar o remédio na geladeira? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro leigo (vaga técnico) |
| EXT125 ★ | No dia da tomada da dose supervisionada, o paciente deverá estar em jejum? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |
| EXT127 | Se o paciente esquecer de tomar o remédio um dia, deverá tomar duas doses auto-administradas no dia seguinte? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | ok | ok | ok | sim | não |  |
| EXT126 | Qual o melhor horário para tomar o remédio em casa? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | alta | registro diferente | ok | ok | não | sim | registro leigo (vaga técnico) |
| EXT123 | Durante o período do tratamento o paciente pode fazer uso de bebida alcoólica? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | registro diferente | ok | diferente | não | sim | duplicata:EXT098; registro leigo (vaga técnico); respondível=parcial (vaga não) |

### T49 · neuropatia_incapacidade · leigo · simples · respondível: não

Decisão: **autor escreve**. nenhuma sobre conteúdo só das partes excluídas do PDF.

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT144 | Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | diferente | não | não | registro técnico (vaga leigo); respondível=sim (vaga não) |
| EXT018 | Em pacientes adultos com sequelas de hanseníase que apresentam escaras de decúbito o tratamento para estas escaras é o convencional? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/em-pacientes-adultos-com-sequelas-de-hanseniase-que-apresentam-escaras-de-decubito-o-tratamento-para-estas-escaras-e-o-convencional/) · Enfermeiro | média | registro diferente | ok | diferente | não | sim | registro técnico (vaga leigo); respondível=parcial (vaga não) |
| EXT116 | O que deve ser feito quando o paciente já apresentar comprometimento dos nervos? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | registro diferente | ok | diferente | não | não | generica; registro técnico (vaga leigo); respondível=sim (vaga não) |
| EXT006 | Após o tratamento completo para Hanseníase a pessoa pode ficar com manchas e alteração de sensibilidade permanentes ? | [BVS APS – Segunda Opinião Formativa (Núcleo d](https://aps-repo.bvs.br/aps/apos-o-tratamento-completo-para-hanseniase-a-pessoa-pode-ficar-com-manchas-e-alteracao-de-sensibilidade-permanentes/) · Enfermeiro | média | ok | ok | diferente | não | sim | respondível=parcial (vaga não) |
| EXT061 | Por que realizar avaliação neurológica? | [Ministério da Saúde – Guia prático sobre a ha](https://prefeitura.sp.gov.br/documents/d/saude/guia-pratico-sobre-hanseniase-ministerio-da-saude-2017-pdf) · não se aplica (título de  | baixa | registro diferente | diferente | diferente | não | não | titulo; registro técnico (vaga leigo); composta (vaga simples); respondível=sim (vaga não) |

### T50 · epidemiologia · leigo · simples · respondível: não

Decisão: **autor escreve**. nenhuma sobre número de casos local posterior a 2023; EXT151 agora é respondível (OMS e Estratégia).

| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | Adaptar | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| EXT107 | Quando os doentes de formas contagiantes colocam em risco a comunidade? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | diferente | não | sim | generica; respondível=parcial (vaga não) |
| EXT083 | Há algum grupo de risco para essa doença? | [Secretaria de Estado de Saúde de Minas Gerais](https://www.saude.mg.gov.br/hanseniase/) · não informado (FAQ instit | média | ok | ok | diferente | não | sim | respondível=parcial (vaga não) |
| EXT086 | Como se adquire a doença? | [Secretaria Municipal da Saúde de São Paulo – ](https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/doencas_e_agravos/hanseniase/saiba-mais) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | duplicata:EXT060 EXT090; respondível=sim (vaga não) |
| EXT151 | O que significa eliminar a hanseníase com problema de saúde pública? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | baixa | ok | ok | diferente | não | não | respondível=sim (vaga não) |
| EXT102 | Quem pega hanseníase? | [SES-RJ (Gerência de Dermatologia Sanitária) –](http://www.riocomsaude.rj.gov.br/Publico/MostrarArquivo.aspx?C=9W7tI79fp78%3D) · não informado (FAQ instit | média | ok | ok | diferente | não | sim | generica; respondível=parcial (vaga não) |
