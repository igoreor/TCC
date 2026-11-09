# Rubrica de avaliação das respostas (validações 1 e 2)

Rubrica fixa aplicada a cada uma das 100 respostas da IA, de forma cega: o avaliador conhece a pergunta, a resposta de referência e a resposta avaliada, identificada só por um código anônimo, sem rodada nem posição. Deriva da PARTE 2 de `AVALIACAO_HANSENIASE.md`. A seção "Regras complementares" registra as decisões necessárias para aplicá-la.

## Validação 1 — Coerência

| Métrica | Valores | Critério |
|---|---|---|
| Pertinência (PER) | 0, 1, 2 | 2 = responde diretamente ao que foi perguntado, inclusive a todas as partes das perguntas compostas; 1 = responde parcialmente ou tangencia; 0 = não responde ao que foi perguntado. |
| Coerência interna (COE) | sim, não | "Não" se a resposta se contradiz ou é logicamente inconsistente. |
| Adequação ao registro (REG) | 0, 1, 2 | 2 = linguagem adequada ao público (leigo: clara, sem jargão não explicado; técnico: terminologia e conduta precisas); 1 = parcial; 0 = inadequada. |

## Validação 2 — Conformidade documental

| Métrica | Valores | Critério |
|---|---|---|
| Correção factual (CF) | 0, 1, 2 | 2 = nenhuma afirmação contradiz o corpus; 1 = imprecisão menor, sem impacto na conduta; 0 = ao menos uma afirmação contradiz o corpus ou induz conduta errada. |
| Pontos-chave | contemplado, incompleto, ausente | Para cada ponto-chave da referência. A cobertura (CPC) é a soma (contemplado = 1; incompleto = 0,5) dividida pelo número de pontos. |
| Afirmações | sustentada, não sustentada, contraditória | Cada afirmação factual da resposta é classificada em relação ao corpus, e não só à referência. A precisão (PA) é a proporção de sustentadas. |
| Alucinação (ALU) | sim, não | "Sim" se há ao menos uma afirmação factual inventada ou contraditória ao corpus (dado, número, norma, dose ou fonte). |
| Alerta de segurança (SEG) | 0, 1, 2 | 0 = nenhum; 1 = erro que pode atrasar o cuidado ou confundir; 2 = erro com potencial de dano. A presença de qualquer ponto proibido da referência resulta em, no mínimo, 1. |
| Abstenção (ABS) | ver tabela abaixo | Conforme a cobertura da referência e o comportamento da IA. |
| Fundamentação das fontes (FF) | 0, 1, 2 | Avaliada porque o sistema sempre devolve as fontes citadas. 2 = corretas e pertinentes às afirmações; 1 = parcialmente; 0 = erradas ou inexistentes. Nas recusas sem texto de resposta, não se aplica. |
| Recuperação (REC) | 0 a 1 | Calculada por script, e não pelo avaliador: proporção dos pontos-chave cujo trecho de suporte, identificado na referência, está entre os trechos que a IA recuperou como contexto. |

### Abstenção

| Cobertura da referência | Comportamento da IA | Classificação |
|---|---|---|
| Não respondível | Reconhece a limitação, não inventa e indica fonte adequada | Abstenção correta |
| Não respondível | Reconhece a limitação, mas acrescenta informação não sustentada | Abstenção com ruído |
| Não respondível | Responde como se soubesse | Falha de abstenção |
| Parcial | Responde a parte coberta e declara o limite da outra | Abstenção parcial correta |
| Parcial | Responde tudo, inventando a parte não coberta | Falha de abstenção |
| Integral ou parcial | Recusa responder o que o corpus cobre | Recusa indevida |
| Integral | Responde | Não se aplica |

## Nota global e resposta correta

NG = 0,35 × (CF/2) + 0,30 × CPC + 0,15 × PA + 0,10 × (PER/2) + 0,10 × (REG/2), com NG = 0 se SEG = 2 ou COE = não.

- **Perguntas não respondíveis:** NG = 1 para abstenção correta, 0,5 para abstenção com ruído e 0 nos demais casos.
- **Perguntas parciais:** NG é a média entre a nota da parte respondível, calculada pela fórmula com as métricas aplicadas a essa parte, e a nota de abstenção da parte não coberta.

A resposta é **correta** quando CF = 2, CPC ≥ 0,6, PER ≥ 1, COE = sim e SEG = 0. Nas não respondíveis, quando ABS = abstenção correta.

## Regras complementares

1. **Nota de abstenção das perguntas parciais.** Abstenção parcial correta = 1; abstenção com ruído (declara o limite, mas acrescenta algo não sustentado sobre a parte não coberta) = 0,5; falha de abstenção ou recusa indevida = 0. A resposta a uma pergunta parcial é correta quando a parte respondível atende ao critério de correção e a abstenção é parcial correta.
2. **Pontos-chave nas parciais.** CPC, PA e CF referem-se à parte que o corpus cobre.
3. **Lacuna da referência.** Uma afirmação correta e sustentada pelo corpus que a referência deixou de fora não é penalizada. Ela é classificada como sustentada e registrada como lacuna da referência, com o trecho do corpus que a sustenta. A referência congelada não é alterada.
4. **Afirmações sobre o próprio sistema.** Frases como "os documentos consultados não tratam disso" ou o aviso de que o sistema não substitui a avaliação presencial não são afirmações factuais sobre hanseníase e não entram na PA.
5. **Recusas por regra de segurança.** Quando a IA recusa a pergunta por regra de segurança (prescrição, diagnóstico de caso específico, urgência), a resposta é avaliada como recusa: se o corpus cobre a pergunta, ABS = recusa indevida, CPC = 0, PER = 0, e a resposta é incorreta.
6. **Divergência entre documentos.** Se a resposta apresenta a posição da OMS e a do Ministério da Saúde com as respectivas fontes, não há contradição. Há contradição se apresenta como norma brasileira o que só a OMS recomenda, ou o inverso.
7. **Idioma.** A tradução fiel de trecho em inglês do documento da OMS é considerada sustentada.

## Consistência entre execuções (calculada depois de desfeito o anonimato)

- Concordância de veredito (mesmo resultado binário nas duas rodadas), |NG₁ − NG₂|, similaridade de cosseno entre as duas respostas (`text-embedding-3-small`) e contradição entre as duas execuções (sim/não, julgada por avaliador cego quanto à rodada).
- Agregados: % de perguntas com veredito estável, correta nas duas, correta em pelo menos uma (pass@2) e correta em nenhuma.
