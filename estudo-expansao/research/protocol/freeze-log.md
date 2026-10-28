# Registro de congelamento

Cada linha fixa um artefato antes de ser usado numa execução. Depois de congelado, o artefato não muda: correção gera nova versão (`v2`) e nova linha. O SHA-256 é o dos bytes do arquivo no disco (D26), impresso por `rag-study questions-check` ou por `sha256sum`.

| Data | Artefato | Arquivo | SHA-256 | Responsável | Observação |
|---|---|---|---|---|---|
| 2026-10-23 | Corpus | `research/corpus/hanseniase-v2/chunks.jsonl` | `4c88c18d9b5b4dc338f157857a8b56a1a23ed0721196de301a13ec891e211663` | agente | construído e congelado (D38); índice `94746b0a…` |
| | Matriz das perguntas | `research/questions/blueprint-v3.csv` | _calcular ao congelar_ | | 50 vagas (D20, D29, D34, D40) |
| | Perguntas | `research/questions/test-v1.jsonl` | | | congelar **antes** da etapa 1 |
| | Pontos-chave | `research/questions/test-v1-keypoints.csv` | | | |
| | Estratégia escolhida (R\*) | saída de `select-strategy` | | | preencher `R_ESCOLHIDA` em `e4-stage2-test-full.json` |
| | Configuração da etapa 1 | `software/rag-study/config/experiments/e3-stage1-test-retrieval.json` | | | |
| | Configuração da etapa 2 | `software/rag-study/config/experiments/e4-stage2-test-full.json` | | | executar uma única vez |
| | Tabela de preços | `software/rag-study/config/pricing-2026-10-22.json` | | | trocar por tabela do dia, se os preços mudarem |
