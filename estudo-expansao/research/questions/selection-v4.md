# Seleção de perguntas v4: só perguntas publicadas

Proposta do agente em 10/11/2026, a pedido do autor (D42). **Precisa da confirmação do autor, pergunta a pergunta, e da aprovação do orientador**, porque muda o desenho validado (matriz v3, com adaptações e perguntas do autor).

Nenhum texto foi redigido ou alterado (D15): as 50 perguntas são cópias literais do banco de 152 perguntas publicadas (`external-questions-candidates.csv`), com fonte. Os pontos-chave continuam a cargo do autor.

## Critérios

1. Pergunta publicada, copiada literalmente, com fonte conferida.
2. Fora: duplicatas (fica uma por grupo, de preferência a dúvida de profissional), perguntas genéricas demais e perguntas que dependem da página de origem ("Estes", "este teste", "o medicamento").
3. Prioridade para as dúvidas enviadas por profissionais ao serviço de Segunda Opinião Formativa (BVS APS).
4. Uma pergunta por necessidade de informação, salvo os pares leigo-técnico que pedem a mesma informação.
5. Mesma distribuição de respondibilidade e de registro da matriz v3: 42 respondíveis, 3 parciais e 5 não respondíveis; 25 leigas e 25 técnicas; as 10 categorias representadas.
6. Respondibilidade conferida por busca de palavra-chave nos 5 documentos (BM25), nunca pelo recuperador do experimento; parciais e não respondíveis listadas em `na-check-v4.md` para o autor confirmar lendo os trechos.
7. Similaridade semântica entre as perguntas (BGE-M3): nenhum par acima de 0,90; o maior foi 0,84.

## Resultado

- Respondibilidade: {'sim': 42, 'não': 5, 'parcial': 3}
- Registro: {'leigo': 25, 'técnico': 25}
- Complexidade: {'simples': 38, 'composta': 12}
- Categoria: {'diagnóstico': 6, 'tratamento': 10, 'reações': 7, 'neuropatia_incapacidade': 4, 'casos_especiais': 4, 'monitoramento': 4, 'contatos_prevenção': 7, 'psicossocial': 1, 'epidemiologia': 4, 'gestão_políticas': 3}
- Quem perguntou: {'Enfermeiro': 6, 'não informado (FAQ institucional)': 28, 'não informado': 2, 'Agente Comunitário de Saúde': 3, 'Médico': 7, 'Fisioterapeuta': 1, 'não se aplica (título de seção de publicação oficial)': 3}
- Pares leigo-técnico: 4 (P01, P02, P03, P04); a matriz v3 tinha 11
- Das 16 perguntas da seleção anterior (documento enviado ao orientador), 16 continuam.

| Vaga | Pergunta publicada (literal) | Registro | Categoria | Comp. | Respondível | Seções-alvo | Quem perguntou | Observação |
|---|---|---|---|---|---|---|---|---|
| T01 | **EXT005**: Como identificar uma mancha que pode ser suspeita de hanseníase? | leigo | diagnóstico | simp. | sim | PCDT:6.1 | Enfermeiro | sinais de suspeição da mancha |
| T02 | **EXT089**: Quais são os sintomas da hanseníase? | leigo | diagnóstico | simp. | sim | PCDT:6.1 | não informado (FAQ institucional) | sinais e sintomas |
| T03 | **EXT094**: Como é feito o diagnóstico da hanseníase? | leigo | diagnóstico | simp. | sim | PCDT:6.1;PCDT:6.2;PCDT:7.7;P51: | não informado (FAQ institucional) | diagnóstico; indicações do qPCR ampliadas pela Portaria 51/2026, a resposta correta segue a norma mais recente |
| T04 (P01) | **EXT112**: Como verificar se a mancha é dormente? | leigo | diagnóstico | simp. | sim | PCDT:6.2;PCDT:7.1 | não informado (FAQ institucional) | teste de sensibilidade, registro leigo |
| T05 (P01) | **EXT033**: Como realizar o teste de sensibilidade na suspeita de hanseníase? | técnico | diagnóstico | simp. | sim | PCDT:6.2;PCDT:7.1 | não informado | teste de sensibilidade, registro técnico |
| T06 | **EXT009**: Como é realizado o exame de baciloscopia para hanseníase? | técnico | diagnóstico | simp. | sim | PCDT:7.2 | Enfermeiro | técnica e sítios da baciloscopia |
| T07 | **EXT001**: Em relação ao tratamento de hanseníase, quando se estender até 18 meses? | técnico | tratamento | simp. | sim | PCDT:10.1.1 | Enfermeiro | prazo para completar a PQT-U MB (p. 60) |
| T08 | **EXT036**: Por que são usados três medicamentos no tratamento da hanseníase? | leigo | tratamento | simp. | sim | PCDT:10.1.1 | não informado (FAQ institucional) | por que três medicamentos |
| T09 | **EXT037**: Quanto tempo dura o tratamento medicamentoso da hanseníase? | leigo | tratamento | simp. | sim | PCDT:10.1.1 | não informado (FAQ institucional) | duração do tratamento: 6 doses PB, 12 doses MB |
| T10 | **EXT119**: Quais os efeitos colaterais mais comuns causados pelos medicamentos da PQT? | técnico | tratamento | simp. | sim | PCDT:10.1.6 | não informado (FAQ institucional) | efeitos colaterais da PQT |
| T11 | **EXT014**: Como proceder em casos de efeito adverso medicamentoso no tratamento da hanseníase? | técnico | tratamento | comp. | sim | PCDT:10.1.6;PCDT:10.1.7;P47: | Agente Comunitário de Saúde | conduta em evento adverso; segunda linha ampliada pela Portaria 47/2026, a resposta correta segue a norma mais recente |
| T12 | **EXT124**: Durante o tratamento há alguma restrição alimentar a ser seguida? | leigo | tratamento | simp. | não | — | não informado (FAQ institucional) | restrição alimentar durante a PQT-U: ausente dos 5 documentos (há só a absorção da minociclina com leite, em 10.1.5.4) |
| T13 | **EXT125**: No dia da tomada da dose supervisionada, o paciente deverá estar em jejum? | técnico | tratamento | simp. | não | — | não informado (FAQ institucional) | jejum na dose supervisionada: ausente dos 5 documentos (na-check-v2 e v3) |
| T14 | **EXT126**: Qual o melhor horário para tomar o remédio em casa? | leigo | tratamento | simp. | não | — | não informado (FAQ institucional) | melhor horário para a dose autoadministrada: ausente dos 5 documentos |
| T15 | **EXT127**: Se o paciente esquecer de tomar o remédio um dia, deverá tomar duas doses auto-administradas no dia seguinte? | técnico | tratamento | simp. | não | — | não informado (FAQ institucional) | dobrar a dose esquecida: ausente dos 5 documentos (na-check-v3) |
| T16 | **EXT129**: É preciso guardar o remédio na geladeira? | leigo | tratamento | simp. | não | — | não informado (FAQ institucional) | guardar o medicamento na geladeira: ausente dos 5 documentos |
| T17 | **EXT025**: Quais são as recomendações para o uso de talidomida no tratamento da reação hansênica? | técnico | reações | comp. | sim | PCDT:10.1.2.2;PCDT:10.1.5.8 | Médico | talidomida na reação tipo 2 |
| T18 | **EXT027**: Qual a conduta para pacientes com Hanseníase, poliquimioterapia completa e crises reacionais do tipo 2 frequentes, apesar de uso contínuo de talidomida? | técnico | reações | comp. | sim | PCDT:10.1.2.2 | Médico | ENH recorrente após a PQT completa |
| T19 | **EXT138**: Recebeu-se hoje um paciente que está em tratamento, relatando que a lesão está avermelhada e inchada. O que deve ser feito? | técnico | reações | simp. | sim | PCDT:6.5.1;PCDT:10.1.2.1 | não informado (FAQ institucional) | vinheta: lesão avermelhada e inchada durante a PQT |
| T20 | **EXT141**: E se o paciente já estiver em alta e apresentar sinais de reação, o que deve ser feito? | técnico | reações | simp. | sim | PCDT:10.1.2;PCDT:14.1.2 | não informado (FAQ institucional) | reação após a alta: tratar a reação sem reiniciar a PQT |
| T21 | **EXT142**: Como se manifestam os sinais e sintomas das reações? | técnico | reações | comp. | sim | PCDT:6.5.1;PCDT:6.5.2 | não informado (FAQ institucional) | sinais das reações tipo 1 e tipo 2 |
| T22 (P02) | **EXT143**: Existem medicamentos específicos para as reações? | leigo | reações | simp. | sim | PCDT:10.1.2 | não informado (FAQ institucional) | medicamentos para as reações, registro leigo |
| T23 (P02) | **EXT040**: Como é feito o tratamento medicamentoso para reação hansênica? | técnico | reações | comp. | sim | PCDT:10.1.2 | não informado (FAQ institucional) | tratamento das reações tipo 1 e tipo 2, registro técnico |
| T24 | **EXT023**: Quais os nervos e articulações mais acometidos em pacientes com hanseníase? | técnico | neuropatia_incapacidade | simp. | sim | PCDT:6.6.1;PCDT:6.4.5 | Fisioterapeuta | nervos mais acometidos |
| T25 | **EXT061**: Por que realizar avaliação neurológica? | técnico | neuropatia_incapacidade | comp. | sim | PCDT:7.1;PCDT:10.2.2;PCDT:6.6.2.2 | não se aplica (título de seção de publicação oficial) | finalidade da avaliação neurológica simplificada |
| T26 | **EXT144**: Quando o paciente apresentar queixa de dores no braço e fraqueza nas mãos, qual a conduta a ser adotada? | técnico | neuropatia_incapacidade | simp. | sim | PCDT:6.6.2.1;PCDT:10.1.2.1 | não informado (FAQ institucional) | vinheta: neurite (dor no braço e fraqueza nas mãos) |
| T27 | **EXT018**: Em pacientes adultos com sequelas de hanseníase que apresentam escaras de decúbito o tratamento para estas escaras é o convencional? | técnico | neuropatia_incapacidade | simp. | parcial | PCDT:10.2.4 | Enfermeiro | a base trata úlceras neuropáticas, não escaras de decúbito; a resposta ideal declara a diferença |
| T28 | **EXT004**: Como identificar se uma criança pode ter hanseníase? | leigo | casos_especiais | simp. | sim | PCDT:12.2;PCDT:6.1 | Enfermeiro | suspeição em crianças |
| T29 | **EXT013**: Qual o esquema terapêutico para crianças menores de 30 kg com diagnóstico de hanseníase? | técnico | casos_especiais | comp. | sim | PCDT:10.1.1;PCDT:12.2 | Médico | doses da PQT-U para crianças com menos de 30 kg (p. 59-60) |
| T30 | **EXT095**: A mulher em tratamento contra a hanseníase pode amamentar? | leigo | casos_especiais | comp. | sim | PCDT:12.1.2;PCDT:10.1.5.2 | não informado (FAQ institucional) | amamentação durante a PQT e pigmentação pela clofazimina |
| T31 | **EXT136**: É contra-indicado o tratamento PQT para pacientes portadores do vírus HIV? | técnico | casos_especiais | simp. | sim | PCDT:12.3 | não informado (FAQ institucional) | PQT em pessoas com HIV |
| T32 | **EXT039**: Como é feito o acompanhamento dos pacientes durante o tratamento? | leigo | monitoramento | simp. | sim | PCDT:14.1.1 | não informado (FAQ institucional) | acompanhamento durante a PQT-U |
| T33 | **EXT069**: O que eu devo saber sobre o pós-alta da PQT? | leigo | monitoramento | comp. | sim | PCDT:14.1.2 | não se aplica (título de seção de publicação oficial) | pós-alta: reações não significam volta da doença |
| T34 | **EXT137**: Como reconhecer um caso de recidiva (paciente com sinais clínicos após a alta por cura)? | técnico | monitoramento | comp. | sim | PCDT:14.1.2 | não informado (FAQ institucional) | recidiva e diferença em relação à reação |
| T35 | **EXT031**: Qual o procedimento para paciente com hanseníase que deixou de realizar a dose supervisionada em determinado mês, seguindo o tratamento apenas com dose auto administrada? | técnico | monitoramento | simp. | parcial | PCDT:10.1.1 | Médico | a base fixa o intervalo máximo para as doses (9 e 18 meses), mas não o que fazer com a cartela da dose perdida |
| T36 (P03) | **EXT145**: Qual a conduta a ser tomada em relação à família do paciente? | leigo | contatos_prevenção | simp. | sim | PCDT:13 | não informado (FAQ institucional) | conduta com a família do paciente, registro leigo |
| T37 (P03) | **EXT015**: Qual a conduta em caso de contactantes domiciliares de paciente que já está em tratamento para Hanseníase? | técnico | contatos_prevenção | simp. | sim | PCDT:13 | Agente Comunitário de Saúde | conduta com contatos domiciliares, registro técnico |
| T38 (P04) | **EXT146**: A BCG vacina contra a hanseníase? | leigo | contatos_prevenção | simp. | sim | PCDT:13.1.1 | não informado (FAQ institucional) | BCG e hanseníase, registro leigo |
| T39 (P04) | **EXT020**: Em pacientes suscetíveis o uso da vacina BCG contribui na prevenção primária da hanseníase? | técnico | contatos_prevenção | simp. | sim | PCDT:13.1.1 | Médico | BCG na prevenção, registro técnico; a base recomenda a BCG aos contatos, sem discutir eficácia |
| T40 | **EXT024**: Quais são as condutas com os filhos de pacientes diagnosticados com Hanseníase? | leigo | contatos_prevenção | comp. | sim | PCDT:13;PCDT:12.2 | Médico | filhos de pacientes como contatos: exame e BCG |
| T41 | **EXT019**: Em pacientes residentes em áreas endêmicas ou contactantes domiciliares de portadores de hanseníase, o uso de quimioprofilaxia é eficaz na prevenção da doença? | técnico | contatos_prevenção | simp. | sim | OMS:7.2.6;PCDT:13.1.1 | não informado | profilaxia pós-exposição: só na OMS; o PCDT 2022 não a adota. A resposta correta distingue orientação internacional de norma nacional |
| T42 | **EXT008**: Quais cuidados a Equipe de Saúde Bucal deve ter no atendimento a pacientes com hanseníase sem adesão ao tratamento? | técnico | contatos_prevenção | simp. | parcial | PCDT:6.5.3 | Enfermeiro | a base recomenda avaliação odontológica (6.5.3), mas não trata dos cuidados da equipe no atendimento |
| T43 | **EXT073**: Por que o estigma e a discriminação podem acontecer com a pessoa acometida pela hanseníase? | leigo | psicossocial | simp. | sim | PCDT:10.2.1.1 | não se aplica (título de seção de publicação oficial) | por que o estigma e a discriminação acontecem |
| T44 | **EXT002**: Como acontece a transmissão da hanseníase? | leigo | epidemiologia | simp. | sim | PCDT:1 | Médico | transmissão (p. 17) |
| T45 | **EXT092**: A hanseníase pode demorar bastante tempo para se manifestar? | leigo | epidemiologia | simp. | sim | PCDT:1 | não informado (FAQ institucional) | incubação longa (p. 17) |
| T46 | **EXT093**: Todas as pessoas que têm contato com a bactéria causadora da hanseníase desenvolvem a doença? | leigo | epidemiologia | simp. | sim | PCDT:5 | não informado (FAQ institucional) | cerca de 90% dos infectados não adoecem (p. 25) |
| T47 | **EXT151**: O que significa eliminar a hanseníase com problema de saúde pública? | leigo | epidemiologia | simp. | sim | OMS:4.1.2;EST:No Brasil | não informado (FAQ institucional) | significado de eliminação como problema de saúde pública |
| T48 | **EXT150**: Qual a política que vem sendo adotada no país para controlar e eliminar a hanseníase como problema de saúde pública no Brasil? | leigo | gestão_políticas | comp. | sim | EST:METAS;EST:DEFINIÇÃO DAS AÇÕES ESTRATÉGICAS | não informado (FAQ institucional) | política nacional: Estratégia 2024-2030 |
| T49 | **EXT152**: Que ações os municípios devem assumir para acelerar o processo da eliminação da hanseníase? | leigo | gestão_políticas | simp. | sim | EST:AÇÕES ESTRATÉGICAS POR GRUPOS DE MUNICÍPIOS | não informado (FAQ institucional) | ações dos municípios para a eliminação |
| T50 | **EXT030**: Qual o papel do Agente Comunitário de Saúde no combate à hanseníase? | leigo | gestão_políticas | simp. | sim | PCDT:10.2.1.6.1;EST:AÇÕES ESTRATÉGICAS GERAIS | Agente Comunitário de Saúde | papel do ACS: busca ativa e acolhimento (PCDT) e capacitação (Estratégia) |

## Perguntas do banco que ficaram de fora

| Motivo | Perguntas |
|---|---|
| duplicata | mantida uma por grupo: tratamento (EXT035, EXT066, EXT082, EXT099; ficaram EXT036 e EXT037), transmissão (EXT060, EXT064, EXT086, EXT090; ficou EXT002, dúvida de médico), sintomas (EXT063, EXT080; ficou EXT089), diagnóstico (EXT081; ficou EXT094), amamentação (EXT122; ficou EXT095), álcool (EXT098, EXT123) |
| genérica demais | EXT017, EXT038, EXT067, EXT068, EXT082, EXT084, EXT087, EXT091, EXT096, EXT100, EXT102, EXT107, EXT109, EXT110, EXT114, EXT115, EXT116 |
| depende da página de origem | EXT041, EXT065, EXT072, EXT074, EXT113, EXT120 |
| sobreposição com outra escolhida | EXT026, EXT140 (abordagem e conduta nas reações), EXT101 (definição de caso), EXT117 (exames complementares), EXT021 e EXT134 (alta por cura), EXT135 (tuberculose), EXT032 (crianças MB), EXT062 (pós-alta), EXT010, EXT011, EXT003, EXT147 (contatos e BCG), EXT029, EXT055 (talidomida), EXT139 (estados reacionais) |
| resposta incerta na base | EXT121 (PQT na gravidez: sem frase explícita), EXT016 e EXT028 (critérios de 2026 a conferir) |
| parciais e não respondíveis não usadas | parciais: EXT006, EXT007, EXT012, EXT043, EXT046, EXT050, EXT054, EXT070, EXT075, EXT083, EXT108, EXT111, EXT118, EXT128 e outras do banco não anotadas; não respondível: EXT078 |

## O que muda no desenho (para o orientador decidir)

- **Pares leigo-técnico:** 4 em vez de 11. A hipótese H5 (ganho maior em perguntas leigas) passa a ser examinada nos 4 pares e, de forma exploratória, pela comparação entre as 25 leigas e as 25 técnicas.
- **Origem:** todas `real`. A análise por origem (publicada × do autor) deixa de existir; no lugar, pode-se comparar dúvidas de profissionais (Segunda Opinião Formativa) com perguntas institucionais.
- **Viés de seleção:** a escolha foi feita pelo agente, que pertence a uma família avaliada, só por critérios da vaga e nunca pelo desempenho esperado. Todas ficam com `selected_by=agente_confirmado`, e o viés residual é declarado.
- **Validade:** ganha naturalidade (todas são perguntas reais publicadas) e elimina o risco de o autor, que conhece o PCDT, redigir perguntas próximas do texto. Perde equilíbrio fino da matriz, que agora segue o banco disponível.
- **Documentos a atualizar depois da aprovação:** protocolo (seção 6), capítulo 3.7 e Quadro 8 do manuscrito (4).

## Próximos passos do autor

1. Ler a tabela e recusar o que não fizer sentido (eu troco pela próxima candidata do mesmo grupo).
2. Na planilha `authoring-sheet-v4.csv`, preencher `author` em cada linha para confirmar a pergunta.
3. Escrever os pontos-chave (1 a 6 por pergunta, com página), usando `reading-pack-v4.md`. Nos pares, os dois itens precisam ter os mesmos pontos-chave; se não fizer sentido, o par vira duas perguntas independentes.
4. Marcar as conclusões em `na-check-v4.md` (parciais e não respondíveis).
5. Revisão independente e congelamento (`questions-build`, `questions-check --corpus`, `freeze-log.md`).
