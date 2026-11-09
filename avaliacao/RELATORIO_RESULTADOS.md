# Relatório de resultados — avaliação da IA com 50 perguntas

Resultados **preliminares (validações 1 e 2; validação 3 pendente)**. Gerado automaticamente por `avaliacao/relatorio.ts` em 2026-11-09. Protocolo em `AVALIACAO_HANSENIASE.md`; decisões e problemas em `avaliacao/DIARIO.md`.

## 1. Configuração experimental

| Item | Valor |
|---|---|
| Commit avaliado | `b5acde7` (backend sem alterações locais: sim) |
| Modelo gerador | `gpt-6-luna`, raciocínio `none`, temperatura 0,1 |
| Recuperação | `text-embedding-3-small`; top-K 20; top-N 8; similaridade mínima 0,25 |
| Prompt de sistema | SHA-256 `2012029869d3f504…` |
| Corpus | 5 documentos, 328 trechos (SHA-256 de cada PDF em `config_experimento.json`) |
| Perguntas | 50, SHA-256 `61ff77d6855d19a1…` |
| Referências | SHA-256 `4c3371a8d1afe5ba…`, gravado antes da abertura das respostas da IA |
| Execução da Trilha A | 2026-11-09 16:16 a 2026-11-09 16:32 (UTC); sementes 20261109 e 20261110 |
| Avaliador (validações 1 e 2) | Claude Opus 5.5 (`claude-opus-5-5`), Anthropic, segundo `rubrica.md`, cego quanto à rodada |
| Respostas | 100; falhas técnicas: 0; recusas por regra de segurança: 0 |

Unidade principal: resposta. As médias principais excluem a T36 ("em decisão" na curadoria), totalizando 98 respostas de 49 perguntas; a T36 é reportada à parte (seção 7).

## 2. Resultado geral

**Tabela 1 – Métricas gerais das respostas da IA**

| Métrica | Valor |
|---|---|
| Acurácia (resposta correta) | 65,3% (64/98); IC 95% 55,5%–74,0% |
| Nota global (NG), média (DP) | 0,84 (0,19) |
| Pertinência (PER, 0–2) | 1,92 |
| Adequação ao registro (REG, 0–2) | 1,55 |
| Coerência interna (COE = sim) | 100,0% |
| Correção factual (CF, 0–2) | 1,81 |
| Cobertura de pontos-chave (CPC) | 0,70 |
| Precisão de afirmações (PA) | 0,98 |
| Fundamentação das fontes (FF, 0–2) | 1,90 |
| Recuperação (REC) | 0,74 |
| Respostas com alucinação | 6,1% |
| Respostas com alerta de segurança (SEG ≥ 1) | 9,2% |
| Respostas com erro de potencial dano (SEG = 2) | 0,0% |

Fonte: elaboração própria (2026). Resultados preliminares (validações 1 e 2; validação 3 pendente).

## 3. Recortes

**Tabela 2 – Resultados por tema**

| Grupo | n | NG média (DP) | Acurácia | IC 95% (Wilson) | Alucinação | Alerta de segurança |
|---|---|---|---|---|---|---|
| Casos especiais | 6 | 0,79 (0,12) | 33% | 10%–70% | 0% | 33% |
| Contatos e prevenção | 6 | 0,94 (0,02) | 100% | 61%–100% | 0% | 0% |
| Diagnóstico | 20 | 0,91 (0,13) | 85% | 64%–95% | 0% | 5% |
| Epidemiologia | 4 | 0,99 (0,01) | 100% | 51%–100% | 0% | 0% |
| Gestão e políticas | 2 | 1,00 (0,00) | 100% | 34%–100% | 0% | 0% |
| Monitoramento | 6 | 0,90 (0,07) | 67% | 30%–90% | 0% | 0% |
| Neuropatia e incapacidade | 14 | 0,81 (0,21) | 50% | 27%–73% | 7% | 0% |
| Psicossocial | 4 | 0,92 (0,04) | 100% | 51%–100% | 0% | 0% |
| Reações | 14 | 0,90 (0,07) | 79% | 52%–92% | 0% | 0% |
| Tratamento | 22 | 0,68 (0,25) | 32% | 16%–53% | 23% | 27% |

Fonte: elaboração própria (2026), a partir de `resultados/metricas.json`. Resultados preliminares (validações 1 e 2; validação 3 pendente).

**Tabela 3 – Resultados por registro**

| Grupo | n | NG média (DP) | Acurácia | IC 95% (Wilson) | Alucinação | Alerta de segurança |
|---|---|---|---|---|---|---|
| leigo | 48 | 0,84 (0,18) | 73% | 59%–83% | 8% | 4% |
| técnico | 50 | 0,84 (0,19) | 58% | 44%–71% | 4% | 14% |

Fonte: elaboração própria (2026), a partir de `resultados/metricas.json`. Resultados preliminares (validações 1 e 2; validação 3 pendente).

**Tabela 4 – Resultados por origem da pergunta**

| Grupo | n | NG média (DP) | Acurácia | IC 95% (Wilson) | Alucinação | Alerta de segurança |
|---|---|---|---|---|---|---|
| adaptação | 36 | 0,88 (0,17) | 75% | 59%–86% | 6% | 8% |
| autoral | 30 | 0,82 (0,21) | 60% | 42%–75% | 13% | 7% |
| publicada | 32 | 0,83 (0,18) | 59% | 42%–74% | 0% | 13% |

Fonte: elaboração própria (2026), a partir de `resultados/metricas.json`. Resultados preliminares (validações 1 e 2; validação 3 pendente).

**Tabela 5 – Resultados por complexidade**

| Grupo | n | NG média (DP) | Acurácia | IC 95% (Wilson) | Alucinação | Alerta de segurança |
|---|---|---|---|---|---|---|
| Simples | 72 | 0,82 (0,21) | 61% | 50%–72% | 7% | 13% |
| Composta | 26 | 0,89 (0,11) | 77% | 58%–89% | 4% | 0% |

Fonte: elaboração própria (2026), a partir de `resultados/metricas.json`. Resultados preliminares (validações 1 e 2; validação 3 pendente).

**Tabela 6 – Resultados por cobertura do corpus**

| Grupo | n | NG média (DP) | Acurácia | IC 95% (Wilson) | Alucinação | Alerta de segurança |
|---|---|---|---|---|---|---|
| Integral | 74 | 0,85 (0,15) | 64% | 52%–74% | 7% | 11% |
| Não respondível | 8 | 1,00 (0,00) | 100% | 68%–100% | 0% | 0% |
| Parcial | 16 | 0,72 (0,30) | 56% | 33%–77% | 6% | 6% |

Fonte: elaboração própria (2026), a partir de `resultados/metricas.json`. Resultados preliminares (validações 1 e 2; validação 3 pendente).

**Testes exploratórios** (Unidade: resposta (n = 98). As duas respostas de cada pergunta não são independentes; valores-p apenas exploratórios.): acurácia leigo × técnico, Fisher p = 0,141; acurácia por origem (publicada × adaptação × autoral), Fisher-Freeman-Halton p = 0,320; NG leigo × técnico, Mann-Whitney U = 1176,0, p = 0,864; NG por origem, Kruskal-Wallis H = 4,33, gl = 2, p = 0,115.

## 4. Abstenção

Distribuição das classificações de abstenção: nao_se_aplica: 73; abstencao_parcial_correta: 9; recusa_indevida: 3; abstencao_correta: 8; falha_de_abstencao: 3; abstencao_com_ruido: 2.

**Tabela 7 – Matriz de abstenção (respostas)**

| | Absteve-se | Não se absteve |
|---|---|---|
| Deveria se abster (cobertura parcial ou não respondível) | 21 | 3 |
| Não deveria (cobertura integral) | 1 | 73 |

Fonte: elaboração própria (2026).

Taxa de abstenção correta nas não respondíveis: 100% (n = 8). Taxa de recusa indevida nas respostas a perguntas cobertas pelo corpus: 3,3% (n = 90).

## 5. Consistência entre execuções

**Tabela 8 – Consistência entre as duas execuções (49 perguntas)**

| Indicador | Valor |
|---|---|
| Veredito estável | 88% |
| Correta nas duas | 59% |
| Correta em pelo menos uma (pass@2) | 71% |
| Correta em nenhuma | 29% |
| \|NG₁ − NG₂\| médio | 0,06 |
| Similaridade de cosseno média (`text-embedding-3-small`) | 0,94 |
| Pares com contradição entre execuções | 3 |

Fonte: elaboração própria (2026).

## 6. Análise de erros

Respostas com alucinação, alerta de segurança, recusa indevida ou falha de abstenção (14):

- **R2-T31** (alucinação, falha de abstenção). Atribui ao corpus uma rotina diária de autoinspeção dos pés e do interior dos calçados, que os documentos não trazem (a inspeção descrita é do serviço de saúde). Trecho da resposta: “Os cuidados diários incluem a própria pessoa inspecionar os pés e o interior dos calçados”
- **R2-T48** (recusa indevida). A cobertura é parcial. A IA se abstém de tudo e diz que não há orientação alimentar, sem responder à parte coberta (rifampicina em jejum, clofazimina com alimentos).
- **R1-T16** (alerta de segurança 1). A resposta omite a notificação da RAM à farmacovigilância, que consta literalmente entre os pontos proibidos; também deixa de dar os esquemas de segunda linha presentes nos trechos que ela mesma citou.
- **R1-T10** (alucinação, alerta de segurança 1). Erro de duração de esquema pode confundir o leigo e levar a tratamento prolongado indevidamente; não esclarece que 18 meses é o prazo para completar 12 doses. Trecho da resposta: “No PCDT, segunda linha MB por RAM à dapsona: 6 meses + 12 meses, total de 18 meses”
- **R1-T48** (recusa indevida). Cobertura parcial: o corpus cobre a orientação farmacocinética da rifampicina e da clofazimina, e a IA declara que os documentos não permitem orientar sobre alimentos. Trecho da resposta: “O protocolo não especifica se os medicamentos devem ser tomados em jejum ou com alimentos”
- **R1-T31** (falha de abstenção). Cobertura parcial: não declara que uma rotina diária detalhada não está nos documentos e apresenta a inspeção diária dos pés como se viesse do PCDT. Trecho da resposta: “A própria pessoa deve inspecionar diariamente os pés e calçados e observar a marcha”
- **R2-T16** (alerta de segurança 1). Omite a notificação obrigatória da RAM à farmacovigilância (ponto proibido) e não informa as 24 doses supervisionadas em MB com intolerância à rifampicina.
- **R2-T17** (alucinação, alerta de segurança 1, recusa indevida). Usa um critério de resistência secundária como critério de resistência primária, que é ponto proibido, e nega que haja critério para casos novos. Isso pode atrasar a investigação de casos novos com IB ≥ 2,0. Trecho da resposta: “Investigar resistência primária em casos novos é pertinente quando há suspeita de persistência de infecção ativa”
- **R1-T35** (alerta de segurança 1). Omite as interações da dapsona com zidovudina e inibidores de protease descritas no PCDT, o que a referência lista como ponto proibido ('ignorar'); pode levar a monitoramento insuficiente da toxicidade.
- **R1-T17** (alucinação, alerta de segurança 1). Usa critérios de resistência secundária para a primária sem distingui-los e omite o critério do IB; isso pode atrasar a investigação em casos novos. Trecho da resposta: “Resistência primária deve ser investigada em casos novos quando há suspeita clínica de persistência de infecção ativa”
- **R1-T14** (alucinação). Atribui à dapsona uma interação (com anticoncepcionais orais) que o corpus atribui à rifampicina. Trecho da resposta: “Dapsona pode reduzir o efeito de anticoncepcionais orais”
- **R2-T35** (alerta de segurança 1). Nega que os documentos detalhem interações com antirretrovirais, quando o PCDT descreve dapsona + zidovudina (neutropenia) e dapsona + amprenavir/saquinavir. Isso pode levar a não monitorar toxicidade.
- **R2-T08** (alerta de segurança 1, falha de abstenção). Diz que a indicação do PCDT 2022 (uso exclusivo em contatos) é a que prevalece na prática, em resposta a uma pergunta sobre a norma de 2026, sem avisar que esta não está no corpus. Pode confundir.
- **R2-T10** (alucinação, alerta de segurança 1). O erro pode confundir quem está em esquema alternativo por reação adversa à rifampicina, de duração prolongada; nenhum ponto proibido presente. Trecho da resposta: “Esquemas de segunda linha por reação adversa à PQT-U duram 6 ou 12 meses, não 18”

## 7. Pergunta em decisão (T36)

- Rodada 1: NG 0,95, correta, abstenção abstencao_parcial_correta, SEG 0.
- Rodada 2: NG 0,95, correta, abstenção abstencao_parcial_correta, SEG 0.

## 8. Cobertura real do corpus × matriz prevista

| Cobertura | Prevista na curadoria | Observada na Trilha B |
|---|---|---|
| Integral | 42 | 37 |
| Parcial | 3 | 9 |
| Não respondível | 5 | 4 |

Perguntas parciais: T07, T08, T29, T30, T31, T36, T42, T45, T48. Não respondíveis: T46, T47, T49, T50. A diferença decorre, em parte, de o corpus do repositório não conter as Portarias SCTIE/MS nº 47 e nº 51/2026 nem a orientação técnica da OMS de 2023 citadas no protocolo (ver `DIARIO.md`).

## 9. Lacunas da referência

165 afirmação(ões) correta(s) e sustentada(s) pelo corpus que a referência não incluía foram registradas pelos avaliadores; não foram penalizadas.

## 10. Desempenho operacional

Latência média 9,3 s, mediana 8,9 s, p95 13,1 s. Tokens médios por pergunta (interpretação e resposta): 5230 de entrada e 513 de saída.

## 11. Validação 3 (especialista)

Pendente. A ficha `validacao_especialista/ficha_pesquisadora.xlsx` traz as 50 referências e 60 respostas da IA (40 sinalizadas pelas validações 1 e 2 e 20 sorteadas entre as demais, semente 20261113). Depois do preenchimento, `consolidar.ts` calcula o kappa e a concordância e recalcula este relatório.

## 12. Ameaças à validade

- As validações 1 e 2 foram feitas por um modelo de linguagem atuando como avaliador (Claude Opus 5.5), o mesmo modelo que construiu as referências. Mitigações: referências congeladas por SHA-256 antes da abertura das respostas da IA, avaliação cega quanto à rodada, lotes sem duas respostas da mesma pergunta, rubrica fixa e validação 3 por especialista com cálculo de concordância.
- A IA avaliada usa modelos da OpenAI (`gpt-6-luna`), e o avaliador é de outro fornecedor (Anthropic), o que reduz, sem eliminar, o risco de viés de autopreferência.
- A especialista revisa uma amostra das respostas da IA (todas as sinalizadas e 20 sorteadas), não necessariamente todas.
- 34 das 50 perguntas são adaptações ou redação autoral; a T36 segue em decisão na curadoria e foi excluída das médias.
- Apenas duas execuções por pergunta: a consistência medida é indicativa. As duas respostas da mesma pergunta não são independentes, de modo que os testes estatísticos são exploratórios.
- O corpus avaliado não contém as Portarias SCTIE/MS nº 47 e nº 51/2026 nem a orientação técnica da OMS de 2023 previstas no protocolo; perguntas formuladas a partir dessas normas foram classificadas pela cobertura real do corpus. Divergências entre PCDT e OMS foram resolvidas a favor do PCDT, norma brasileira mais recente do corpus.
- As métricas CPC e PA dependem da decomposição em pontos-chave e afirmações feita pelo avaliador; a similaridade semântica usou `text-embedding-3-small`, e não o BGE-M3 previsto.

## 13. Arquivos

`perguntas.json`, `referencias.json`, `execucoes.jsonl`, `para_avaliar.jsonl`, `avaliacoes.jsonl`, `validacao/` (lotes, chave de anonimato, similaridade e contradições), `resultados/` (CSV, `metricas.json` e gráficos) e `validacao_especialista/` (ficha, seleção e consolidação).
