"""Agent annotations of published candidate questions (curation v3, corpus hanseniase-v2, 23/10/2026).

Copied from curation v2; entries whose answer changed with the corpus v2 documents
(Estratégia Nacional 2024-2030, WHO 2023 guidance, Portarias 47 and 51/2026) were updated.

One line per distinct candidate: PCDT sections it actually addresses, whether
the frozen corpus answers it (sim/parcial/não), complexity, issues, note.
Judgments made by the agent (Claude) from the corpus text and keyword checks;
they are proposals for the author to confirm, not ground truth. Question text
is never edited (D15).

issues: contexto (depends on the source page), generica, duplicata:<ids>,
parte_fora_pcdt, F2026 (topic changed by the 2026 ordinances), titulo (heading
of an institutional booklet, not a question sent by a person).
"""

ANNOTATIONS = """
EXT001|10.1.1|sim|simples||prazo para completar a PQT-U (p. 60)
EXT004|12.2;6.1|sim|simples||suspeição em crianças
EXT005|6.1|sim|simples||sinais de suspeição de mancha
EXT006|6.6.1;10.1.1|parcial|simples||regressão de manchas e dano neural após a cura
EXT009|7.2|sim|simples||técnica e sítios da baciloscopia
EXT010|13|sim|composta||objetivo e organização da vigilância de contatos
EXT011|13.1.1|sim|simples||BCG em contato com cicatriz
EXT012|12.1.1|parcial|composta|parte_fora_pcdt|PCDT trata a interação rifampicina-anticoncepcional; não indica as melhores opções
EXT013|10.1.1;12.2|sim|composta||doses da PQT-U para crianças com menos de 30 kg (p. 59-60)
EXT014|10.1.6;10.1.7;P47:|sim|composta||conduta em evento adverso; segunda linha ampliada pela Portaria 47/2026 (no corpus v2)
EXT015|13|sim|simples||conduta com contatos domiciliares
EXT017|6.1;6.2;7.7;P51:|sim|simples|generica|diagnóstico; indicações do qPCR ampliadas pela Portaria 51/2026 (no corpus v2)
EXT018|10.2.4|parcial|simples||PCDT trata úlceras neuropáticas, não escaras de decúbito
EXT019|OMS:7.2.6|sim|simples||profilaxia pós-exposição: só no documento da OMS (inglês); o PCDT 2022 não adota
EXT021|14.1.2;10.1.1|sim|simples||alta por cura na atenção básica
EXT023|6.6.1;6.4.5|sim|simples||nervos mais acometidos
EXT025|10.1.2.2;10.1.5.8|sim|composta||uso da talidomida na reação tipo 2
EXT026|10.1.2|sim|simples||abordagem inicial das reações
EXT027|10.1.2.2|sim|composta||ENH recorrente apesar de talidomida
EXT029|10.1.5.8|sim|simples||indicação da talidomida
EXT032|10.1.1;12.2|sim|composta||tratamento MB em crianças
EXT033|6.2;7.1|sim|simples||técnica do teste de sensibilidade
EXT035|10.1.1|sim|simples|duplicata:EXT066 EXT099|composição da PQT-U
EXT036|10.1.1|sim|simples||por que três medicamentos
EXT037|10.1.1|sim|simples||duração: 6 doses PB, 12 doses MB
EXT038|10.1.1|sim|simples|generica|cura com tratamento
EXT039|14.1.1|sim|simples||acompanhamento durante a PQT-U (dose supervisionada, ANS)
EXT040|10.1.2|sim|composta||tratamento das reações tipo 1 e tipo 2
EXT041|-|não|simples|contexto|laboratório produtor da talidomida; "o medicamento" depende da página
EXT043|16|parcial|simples||cadastro para dispensar talidomida
EXT046|16|parcial|simples||verificação BM25 (na-check-v2.md): a seção 16 remete prescrição e dispensação à legislação sanitária vigente; não é não respondível
EXT054|10.1.5.8;16|parcial|composta||armazenamento e devolução da talidomida
EXT055|10.1.5.8|sim|simples||eventos adversos da talidomida
EXT061|7.1;10.2.2;6.6.2.2|sim|composta|titulo|finalidade da Avaliação Neurológica Simplificada
EXT062|14.1.2;10.1.1|sim|composta|titulo|alta e pós-alta
EXT065|13|sim|simples|contexto;titulo|contatos na perspectiva do paciente ("E quanto...")
EXT066|10.1.1|sim|simples|duplicata:EXT035;titulo|PQT
EXT067|10.1.1|parcial|simples|generica;titulo|como tomar os medicamentos
EXT068|6.5|sim|simples|generica;titulo|complicações (reações)
EXT069|14.1.2|sim|composta|titulo|pós-alta: reações não significam volta da doença
EXT070|12.1.1|parcial|composta|parte_fora_pcdt;titulo|saúde sexual e reprodutiva
EXT072|10.2.1.1|sim|simples|contexto;titulo|conceito de discriminação ("E o que é")
EXT073|10.2.1.1|sim|simples|titulo|por que o estigma e a discriminação acontecem
EXT074|10.2.1.2|parcial|simples|contexto;titulo|direito à saúde
EXT075|10.2.1.2|parcial|simples|titulo|direitos nos serviços de saúde
EXT078|-|não|simples|titulo|outros direitos (BPC): fora do PCDT
EXT081|6.1;6.2;7.7;P51:|sim|simples|generica;duplicata:EXT094|diagnóstico
EXT082|10.1.1|sim|simples|generica;duplicata:EXT099|tratamento
EXT083|EST:No Brasil|parcial|simples||grupos e territórios mais afetados (Estratégia, em parte)
EXT084|13;6.1|parcial|simples|generica|prevenção
EXT086|1|sim|simples|duplicata:EXT060 EXT090|transmissão
EXT087|10.1.1|sim|simples|generica;contexto|"Existe tratamento?"
EXT089|6.1|sim|simples|duplicata:EXT063 EXT080|sintomas
EXT091|10.1.1|sim|simples|generica|tem cura
EXT092|1|sim|simples||incubação longa (p. 17)
EXT094|6.1;6.2;7.7;P51:|sim|simples|duplicata:EXT081|diagnóstico
EXT095|12.1.2;10.1.5.2|sim|composta|duplicata:EXT122|amamentação durante a PQT (e pigmentação pela clofazimina)
EXT096|6.6;10.2.2|sim|simples|generica|deformidades
EXT099|10.1.1|sim|simples|duplicata:EXT082|tratamento
EXT100|10.1.1|parcial|simples|generica|por que tratar
EXT101|6.2|sim|simples||definição de caso
EXT102|1;5|parcial|simples|generica|quem adoece
EXT107|-|parcial|simples|generica|risco à comunidade
EXT108|6.1;7.1|parcial|simples||orientação a quem chega com lesão de pele
EXT109|6.4.4;6.1|parcial|simples|generica|como a doença surge
EXT110|6.4|sim|simples|generica|evolução para formas clínicas
EXT111|6.4.5;6.6.1|parcial|simples||dormência e fraqueza: diagnóstico diferencial pouco abordado
EXT112|6.2;7.1|sim|simples||como testar a dormência da mancha
EXT113|6.2;7.1|sim|simples|contexto|"este teste"
EXT114|6.6.1|sim|simples|generica|como afeta os nervos
EXT115|10.2.2|sim|simples|generica|deformidades evitáveis
EXT116|6.6;10.2.2|sim|simples|generica|conduta com comprometimento neural
EXT118|11;10.1.1|parcial|simples||tratamento irregular
EXT119|10.1.6|sim|simples||efeitos colaterais da PQT
EXT120|10.1.5.2;10.1.6|sim|simples|contexto|persistência dos efeitos ("Estes")
EXT122|12.1.2|sim|simples|duplicata:EXT095|amamentar
EXT123|10.1.6|parcial|simples|duplicata:EXT098|álcool durante o tratamento
EXT124|-|não|simples||restrição alimentar: ausente do PCDT
EXT125|-|não|simples||jejum na dose supervisionada: ausente do PCDT; confirmado por leitura dos trechos BM25 (na-check-v2.md)
EXT126|-|não|simples||melhor horário: não localizado no PCDT
EXT127|-|não|simples||dobrar dose esquecida: ausente do PCDT
EXT128|10.1.6|parcial|simples||mal-estar na dose supervisionada
EXT129|-|não|simples||geladeira: ausente do PCDT
EXT135|12.3;10.1.6|sim|simples||coinfecção com tuberculose
EXT136|12.3|sim|simples||PQT em pessoas com HIV
EXT137|14.1.2|sim|composta||recidiva x reação
EXT138|6.5.1;10.1.2.1|sim|simples||lesão avermelhada e inchada durante a PQT
EXT140|10.1.2|sim|simples||conduta diante de sinais de reação na PQT
EXT142|6.5.1;6.5.2|sim|composta||sinais das reações tipo 1 e tipo 2
EXT143|10.1.2|sim|simples||medicamentos para as reações
EXT144|6.6.2.1;10.1.2.1|sim|simples||dor no braço e fraqueza nas mãos (neurite): conduta
EXT145|13|sim|simples||conduta com a família (contatos)
EXT147|13.1.1|sim|simples||BCG para quem reside com o paciente
EXT150|EST:|sim|composta||política nacional: Estratégia Nacional 2024-2030 (metas, pilares, ações)
EXT151|OMS:4.1.2;EST:No Brasil|sim|simples||eliminação como problema de saúde pública (< 1/10 mil): OMS 4.1.2 e Estratégia
EXT152|EST:AÇÕES ESTRATÉGICAS POR GRUPOS DE MUNICÍPIOS|sim|simples||ações por grupos de municípios (Estratégia)
EXT117|7.2;7.3;7.7;P51:|sim|composta||exames complementares para confirmar o diagnóstico; qPCR ampliado pela Portaria 51/2026
EXT050|10.1.3.2|parcial|simples||fracionamento da talidomida: o PCDT menciona fracionar só na reação tipo 2 em crianças (p. 64)
EXT060|1|sim|simples|duplicata:EXT086 EXT090|transmissão; duas perguntas no mesmo título
EXT079|1|sim|simples|generica|contagiosidade (Introdução)
EXT007|10.2.1.6;12.5|parcial|simples||recusa do tratamento: acolhimento (10.2.1.6) e ROM em situações extremas (12.5)
"""

# slot -> (decision, external id or "", justification, pending decision)
RECOMMENDATIONS = {
    "T01": ("literal", "EXT005", "dúvida real de enfermeiro (SOF); suspeição de mancha (6.1); leiga, simples, respondível", ""),
    "T02": ("adaptar", "EXT005", "par P01: mesma necessidade de T01 em registro técnico", "ou trocar a necessidade do par para definição de caso (EXT101) e adaptar T01"),
    "T03": ("autor", "", "nenhuma candidata sobre classificação operacional PB/MB", ""),
    "T04": ("autor", "", "par P02 de T03", ""),
    "T05": ("adaptar", "EXT111", "dormência e fraqueza sem mancha remetem à forma neural pura; precisa de registro técnico e foco em 6.4.5", "confirmar que 6.4.5 responde"),
    "T06": ("adaptar", "EXT009", "dúvida real (SOF) sobre baciloscopia (7.2); redação técnica, vaga leiga", ""),
    "T07": ("autor", "", "nenhuma sobre teste rápido; vaga parcial exige parte fora do PCDT", ""),
    "T08": ("adaptar", "EXT117", "exames complementares, com o qPCR ampliado pela Portaria 51/2026; precisa focar em 7.7 e na portaria", "a pergunta publicada também toca baciloscopia e histopatologia (7.2, 7.3)"),
    "T09": ("autor", "", "nenhuma leiga sobre a ANS; EXT061 reservada a T32", ""),
    "T10": ("adaptar", "EXT001", "par P03: mesma necessidade de T11 em registro leigo", "alternativa: par sobre duração, com EXT037 literal em T10 e adaptação em T11"),
    "T11": ("literal", "EXT001", "dúvida real de enfermeiro (SOF); prazo da PQT-U (10.1.1, p. 60); técnica, simples", ""),
    "T12": ("adaptar", "EXT119", "par P04: mesma necessidade de T13 em registro leigo", ""),
    "T13": ("literal", "EXT119", "efeitos colaterais da PQT (10.1.6); técnica, simples, respondível", "se houver mais de 3 pontos-chave, rever complexidade"),
    "T14": ("autor", "", "nenhuma sobre dapsona", ""),
    "T15": ("adaptar", "EXT120", "tema da pigmentação pela clofazimina (10.1.5.2), mas 'Estes' depende da página de origem", ""),
    "T16": ("literal", "EXT014", "dúvida real de ACS (SOF): conduta em evento adverso; combina 10.1.7 e Portaria 47/2026", "a resposta correta segue a norma mais recente"),
    "T17": ("autor", "", "nenhuma sobre critério de investigação da resistência primária", ""),
    "T18": ("autor", "", "EXT059 excluída (tema alterado em 2026); nenhuma outra", ""),
    "T19": ("literal", "EXT013", "dúvida real de médico (SOF); doses para criança com menos de 30 kg (10.1.1 e 12.2); técnica, composta", "alternativa: EXT032"),
    "T20": ("adaptar", "EXT142", "par P05: restringir à reação tipo 1, em registro leigo", ""),
    "T21": ("adaptar", "EXT142", "EXT142 abrange tipo 1 e tipo 2 (6.5.2 fora da seção-alvo); restringir à tipo 1", "ou ampliar a seção-alvo (alteraria a matriz)"),
    "T22": ("adaptar", "EXT025", "par P06: mesma necessidade de T23 em registro leigo", "alternativa: EXT029 literal, se o autor considerar a mesma necessidade"),
    "T23": ("literal", "EXT025", "dúvida real de médico (SOF); talidomida na reação tipo 2 (10.1.2.2 e 10.1.5.8); técnica, composta", ""),
    "T24": ("autor", "", "nenhuma sobre fatores precipitantes das reações", ""),
    "T25": ("literal", "EXT138", "vinheta clínica de reação tipo 1 durante a PQT (10.1.2.1); técnica, respondível", "confirmar que é simples (reconhecer e tratar)"),
    "T26": ("autor", "", "nenhuma sobre reações em crianças", ""),
    "T27": ("adaptar", "EXT144", "par P07: mesma necessidade de T28 em registro leigo", ""),
    "T28": ("literal", "EXT144", "quadro de neurite aguda e conduta (6.6.2.1); técnica, simples", ""),
    "T29": ("autor", "", "nenhuma sobre dor neuropática", ""),
    "T30": ("autor", "", "nenhuma sobre manifestações oculares", ""),
    "T31": ("autor", "", "nenhuma sobre autocuidado e calçados; EXT115 é genérica (10.2.2)", ""),
    "T32": ("literal", "EXT061", "finalidade da ANS (7.1) ligada à prevenção de incapacidades (10.2.2); técnica, composta; título de material do MS", ""),
    "T33": ("literal", "EXT095", "amamentação durante a PQT (12.1.2), com efeito da clofazimina; leiga, composta", "não usar EXT122 (duplicata)"),
    "T34": ("adaptar", "EXT095", "par P08: mesma necessidade de T33 em registro técnico", ""),
    "T35": ("literal", "EXT136", "PQT em pessoas com HIV (12.3); técnica, simples", ""),
    "T36": ("pendente", "EXT007", "dúvida real de ACS sobre recusa do tratamento; 12.5 trata só de dificuldade extrema de adesão (esquema ROM)", "usar EXT007 com respondibilidade a reavaliar ou escrever pergunta do autor"),
    "T37": ("literal", "EXT069", "pós-alta (14.1.2): reações não significam volta da doença; leiga, composta; título da Caderneta do MS", ""),
    "T38": ("adaptar", "EXT069", "par P09: mesma necessidade de T37 em registro técnico", ""),
    "T39": ("adaptar", "EXT039", "tema exato de 14.1.1, mas redação leiga; vaga técnica", ""),
    "T40": ("literal", "EXT145", "conduta com a família do paciente (13); leiga; forma o par P10 com EXT015, ambas reais", ""),
    "T41": ("literal", "EXT015", "dúvida real de ACS (SOF); contatos domiciliares (13); técnica, simples", ""),
    "T42": ("adaptar", "EXT019", "profilaxia pós-exposição agora no corpus (OMS 7.2.6); EXT019 é técnica e simples; vaga leiga, composta e parcial", "o autor acrescenta a parte BCG (13.1.1) e uma parte fora do corpus v2; alternativa de base: EXT147"),
    "T43": ("literal", "EXT073", "por que o estigma acontece (10.2.1.1); leiga, simples; título de cartilha do MS", ""),
    "T44": ("adaptar", "EXT073", "par P11: mesma necessidade de T43 em registro técnico", ""),
    "T45": ("adaptar", "EXT150", "política nacional respondida pela Estratégia 2024-2030; vaga técnica e parcial: acrescentar dado posterior ao período da Estratégia", ""),
    "T46": ("adaptar", "EXT041", "não respondível (laboratório produtor ausente do PCDT), mas 'o medicamento' depende da página", "EXT046 descartada: a seção 16 responde em parte (verificação BM25, na-check-v2.md)"),
    "T47": ("autor", "", "nenhuma sobre tratamento de outra doença de pele", ""),
    "T48": ("literal", "EXT125", "jejum na dose supervisionada: ausente do PCDT; técnica, simples, não respondível", "alternativa: EXT127"),
    "T49": ("autor", "", "nenhuma sobre conteúdo só das partes excluídas do PDF", ""),
    "T50": ("autor", "", "nenhuma sobre número de casos local posterior a 2023; EXT151 agora é respondível (OMS e Estratégia)", ""),
}
