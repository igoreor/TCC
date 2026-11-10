# O que foi feito — avaliação da IA com 50 perguntas

Este documento resume a execução do protocolo `AVALIACAO_HANSENIASE.md` em 09/11/2026: o que foi feito, as decisões tomadas sem consulta, os resultados e o que falta.

- O registro passo a passo está em `avaliacao/DIARIO.md`.
- Os números completos estão em `avaliacao/RELATORIO_RESULTADOS.md`.
- As mudanças no TCC estão em `avaliacao/ALTERACOES_TCC.md`.
- **As perguntas e respostas estão em `avaliacao/Perguntas_e_Respostas_Avaliacao.docx`.** Para cada uma das 50 perguntas: a resposta de referência com os trechos dos documentos, as duas respostas da IA na íntegra e a avaliação de cada uma. Nas 25 perguntas da validação 3, os campos da especialista estão em amarelo.

## 1. Resumo

A IA de produção (commit `b5acde7`, `gpt-6-luna` sem raciocínio, temperatura 0,1) respondeu às 50 perguntas duas vezes, sem nenhuma alteração. Respostas de referência foram construídas a partir do corpus, isoladas das respostas da IA e congeladas por SHA-256 antes de qualquer leitura dessas respostas. As 100 respostas foram avaliadas às cegas, com rubrica fixa. A planilha para a especialista foi gerada, e o TCC recebeu método, resultados, discussão e apêndices, com marcações amarelas no que depende dela.

**Os resultados são preliminares** até a validação 3 (especialista).

## 2. Decisões tomadas sem consulta

| Decisão | Motivo | Onde está registrada |
|---|---|---|
| Avaliar com o **corpus já indexado** (5 documentos, 328 trechos), sem as Portarias 47 e 51/2026 e a OMS 2023 | Incluí-las mudaria o sistema avaliado, o que o protocolo proíbe; as perguntas sobre 2026 foram classificadas pela cobertura real. | TCC 3.8.2 (marcação "VERIFICAR") e ameaças em 6.5 |
| Scripts em **Node/TypeScript**, não Python | O sistema é TypeScript: o adaptador chama o `ChatService` real em processo, sem escrever no banco. | DIARIO, Fase 0 |
| Similaridade com **`text-embedding-3-small`**, não BGE-M3 | É o mesmo modelo de embeddings do sistema e não exige instalar outro modelo. | TCC 6.5 |
| Validações 1 e 2 por **modelo avaliador** (Claude Opus 5.5), descritas no TCC como *LLM-as-a-judge* | O protocolo pedia avaliação automatizada; ela não foi apresentada como humana. | TCC 3.8.4 e nota de rodapé |
| **Regras complementares da rubrica**: abstenção parcial, recusas, lacunas da referência | O protocolo era omisso nesses casos; as regras foram fixadas antes da avaliação. | `rubrica.md` |
| **T36 fora das médias** | Estava "em decisão" na curadoria; é reportada à parte. | Relatório, seção 7 |
| Ficha com **25 perguntas, uma resposta cada** (a pedido do autor) | Todas as 7 perguntas com alerta ou alucinação e 1 com execuções contraditórias, mais 8 sorteadas com alguma execução incorreta e 9 com as duas corretas. | DIARIO, Fase 5 |
| **Edição direta do XML do .docx**, com realce amarelo do Word | Preserva os estilos ABNT do modelo, a numeração automática e o sumário. | `ALTERACOES_TCC.md` |

## 3. Etapas executadas

1. **Configuração (Fase 0).** Registro do commit, do modelo, dos parâmetros, do hash do prompt de sistema e do SHA-256 de cada PDF (`config_experimento.json`).
2. **Perguntas (Fase 1).** As 50 perguntas foram extraídas do protocolo e congeladas (`perguntas.sha256`).
3. **Trilha B (referências).** Cinco instâncias isoladas leram só as perguntas e o corpus. Foram registrados 263 pontos-chave, todos com trecho literal conferido por script, e as referências foram congeladas **antes** da leitura das respostas da IA.
4. **Trilha A (IA).** Foram 100 chamadas em ordem aleatória (sementes registradas), com 0 falhas técnicas e 0 recusas por regra de segurança.
5. **Avaliação cega (Fase 4).** As respostas foram anonimizadas (A001–A100) e divididas em 10 lotes, cada um com um avaliador isolado. Depois disso:
   - os pares foram julgados quanto a contradições;
   - a similaridade de cosseno foi calculada;
   - as afirmações corretas ausentes da referência foram registradas, sem alterar a referência.
6. **Métricas, gráficos e relatório.** O resultado está em `resultados/`, `resultados/graficos/` (PNG a 300 dpi) e `RELATORIO_RESULTADOS.md`.
7. **Ficha da especialista.** O arquivo é `validacao_especialista/ficha_pesquisadora.xlsx`, com 25 perguntas (referência + uma resposta da IA cada; cerca de 1h30 a 2h de revisão), instruções, trechos dos documentos, respostas da IA, listas suspensas e uma aba de identificação em branco.
8. **TCC.** Foram inseridos:
   - 3.8 (método);
   - 5.4 (resultados, com Tabelas 9 e 10 e Figuras 14 e 15);
   - 6.5 (discussão e ameaças);
   - Apêndices H, I e J;
   - 4 referências e 2 notas de rodapé.

   O texto antigo ficou intacto. O documento foi atualizado no Word e conferido visualmente no PDF.

**Incidente.** Os 10 avaliadores pararam no limite de uso da conta. Foram retomados dois de cada vez, com as mesmas instruções. Nenhum lote foi refeito ou contaminado.

## 4. Resultados preliminares

Os resultados cobrem 98 respostas, sem a T36.

| Indicador | Valor |
|---|---|
| Acurácia | **65,3%** (64/98), IC 95% 55,5–74,0% |
| Nota global (0–1) | **0,84** ± 0,19 |
| Alucinação | 6,1% |
| Alerta de segurança | 9,2% |
| Erro de potencial dano | **0%** |
| Abstenção correta (não respondíveis) | **100%** (8/8) |
| Recusa indevida | 3,3% |
| Veredito estável entre execuções | 88% (correta nas duas: 59%; em pelo menos uma: 71%) |
| Contradições entre execuções | 3 (T10, T18, T35) |
| Latência mediana | 8,9 s (p95 13,1 s) |

Por que a acurácia (65%) é bem menor que a nota global (0,84): das 34 respostas incorretas, **15 falham só por cobrir menos de 60% dos pontos-chave**, com nota global entre 0,78 e 0,88. Essas respostas estão incompletas, não erradas. Os avaliadores registraram ainda 165 afirmações corretas que a referência não tinha.

## 5. Principais achados

1. **Tratamento é o ponto fraco.** A acurácia no tema foi de 32%, com alucinação em 23% e alerta em 27% das respostas. Os erros envolvem esquemas de segunda linha (T10), resistência (T17, T18) e interações (T14, T35).
2. **Parte dos erros vem da extração dos PDFs, não do modelo.** Na T17, o rótulo de seção 11.2 do PCDT se perdeu na extração, e o sistema confundiu os critérios de resistência primária e secundária. As tabelas de esquemas continuam frágeis.
3. **O registro não se adapta ao público leigo.** A adequação ao registro foi de 1,13 em perguntas leigas, contra 1,96 em técnicas, porque o perfil fixo é "Profissional de saúde".

Pontos positivos:

- o sistema é prudente diante do que o corpus não cobre;
- não houve nenhum erro classificado como de potencial dano.

## 6. O que você precisa fazer

1. **Enviar `avaliacao/validacao_especialista/ficha_pesquisadora.xlsx` à especialista.**
2. Com a ficha preenchida de volta, executar a partir de `backend/`, onde o `tsx` está instalado:
   ```bash
   cd backend
   npx tsx ../avaliacao/validacao_especialista/consolidar.ts caminho/da/ficha_preenchida.xlsx
   npx tsx ../avaliacao/graficos.ts
   npx tsx ../avaliacao/relatorio.ts
   npx tsx ../avaliacao/documento_perguntas_respostas.ts
   npx tsx ../avaliacao/tcc/atualizar_tcc.ts
   powershell -File ../avaliacao/tcc/word_atualizar.ps1 -Docx ../TCC/TCC_NexoHansen_Versao_Revisada.docx
   ```
   Isso calcula o kappa ponderado e a concordância e aplica o veredito dela. O documento de perguntas e respostas e o Apêndice K do TCC passam a mostrar o parecer dela no lugar das marcações amarelas, e o último comando atualiza campos e sumário no Word.
3. **Preencher as marcações amarelas do TCC** com os números de `consolidacao.json`. A lista completa está em `ALTERACOES_TCC.md`. Depois, remova os avisos de "resultados preliminares".
4. **Decidir sobre as Portarias 47 e 51/2026.** Se forem indexadas, o sistema muda, e a avaliação deve ser refeita: rode novamente as fases 0, 2 e 4, já que as referências também mudam.
5. Inserir a referência dos testes estatísticos (marcação em 3.8.4).
6. **Segurança:** trocar a senha do Neon e a chave da OpenAI, que foram coladas no chat.

## 7. Onde está cada coisa

| Caminho | Conteúdo |
|---|---|
| `AVALIACAO_HANSENIASE.md` | Protocolo original |
| `avaliacao/DIARIO.md` | Diário de decisões e problemas |
| `avaliacao/perguntas.json`, `referencias.json` (+ `.sha256`) | Perguntas e referências congeladas |
| `avaliacao/execucoes.jsonl` | As 100 respostas da IA, sem edição |
| `avaliacao/avaliacoes.jsonl`, `avaliacao/validacao/` | Avaliações, chave de anonimato, contradições, similaridade |
| `avaliacao/resultados/` | CSV, `metricas.json` e gráficos |
| `avaliacao/RELATORIO_RESULTADOS.md` | Relatório completo |
| `avaliacao/Perguntas_e_Respostas_Avaliacao.docx` | As 50 perguntas com referência, respostas da IA e avaliação (gerado por `documento_perguntas_respostas.ts`) |
| `avaliacao/validacao_especialista/` | Ficha, seleção e script de consolidação |
| `avaliacao/tcc/` | Scripts de atualização do TCC e textos de interpretação |
| `TCC/*_antes_avaliacao.*` | Backup do TCC anterior a esta etapa |
