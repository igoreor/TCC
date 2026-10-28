# Perguntas do experimento

## Regra de independência

Perguntas `dev` e `test`, respostas de referência e rótulos de relevância **não podem ser escritos por GPT nem por Claude** (famílias avaliadas), nem pelo agente que opera este workspace. Autoria: autor e/ou especialista, com revisão.

## Arquivos

| Arquivo | Split | Uso |
|---|---|---|
| `smoke-v0.jsonl` | `smoke` | 25 perguntas copiadas de `TCC/backend/src/modules/evaluation/evaluation.seed.ts` (SHA-256 `54b7a2c7…ac44`). Autoria não verificada. **Somente teste funcional**; proibido em `dev`/`test` e em qualquer análise |
| `smoke-v0-pilot5.jsonl` | `smoke` | 5 linhas copiadas sem alteração de `smoke-v0.jsonl` (smoke-002, 009, 015, 021, 025; SHA-256 `981b065f…`), para o teste funcional com API real (`e2-api-smoke`) |
| `blueprint-v1.csv` | — | **substituída** pela v2 em 23/10/2026 (D34): matriz de 65 vagas (50 teste, 15 dev). Mantida como histórico; nunca foi preenchida nem congelada |
| `blueprint-v2.csv` | — | **matriz atual**: as 50 vagas de teste da v1, sem alteração (D20, D29, D34) |
| `reading-pack-v2.md` | — | trechos do PCDT de cada vaga, com página |
| `external-questions-candidates.csv` | — | 152 perguntas publicadas, literais, com fonte e link (coletadas em 23/10/2026; D35) |
| `candidates-by-slot-v2.csv` | — | até 5 candidatas publicadas por vaga, sugeridas por assunto (`questions-candidates`) |
| `curation-v2.md` | — | curadoria das candidatas publicadas: tabela consolidada das 50 vagas e detalhe por candidata (D36) |
| `curation-v2-summary.csv` e `curation-v2-by-candidate.csv` | — | mesmos dados em planilha |
| `blueprint-v3.csv`, `authoring-sheet-v3.csv`, `reading-pack-v3.md`, `candidates-by-slot-v3.csv`, `curation-v3*.{md,csv}`, `na-check-v3.md` | — | **versão atual** (corpus `hanseniase-v2`, D38-D40). A v2 fica como histórico |
| `authoring-sheet-v2.csv` | — | planilha de redação gerada da matriz v2 (`questions-sheet`); o autor preenche texto e pontos-chave. Guia: `AUTHORING-GUIDE.md` |
| `test-v1.jsonl` e `test-v1-keypoints.csv` | `test` | a gerar por `questions-build`: as 50 perguntas, congeladas antes da etapa 1 e usadas nas duas etapas |

## Esquema (uma pergunta por linha, JSON)

```json
{"question_id": "test-001", "text": "<pergunta escrita pelo autor>", "split": "test",
 "category": "tratamento", "register": "leigo", "complexity": "simples",
 "answerable_from_corpus": "sim", "reference_sections": ["10.1.1"],
 "author": "<iniciais>", "created_on": "AAAA-MM-DD", "reviewed_by": "<iniciais>"}
```

Obrigatórios para o executor: `question_id`, `text`, `split`. Os demais servem à estratificação e à análise.

A partir da v1 (22/10/2026), o arquivo gerado por `questions-build` usa `target_sections` (seções da matriz) em vez de `reference_sections`, e acrescenta `slot_id`, `need_group` (identifica os pares de registro) e `reference_pages`.

- `category`: diagnóstico | tratamento | reações | neuropatia_incapacidade | casos_especiais | monitoramento | contatos_prevenção | psicossocial | epidemiologia | gestão_políticas (as categorias `casos_especiais` e `psicossocial` foram acrescentadas na v1)
- `register`: leigo | técnico (incluir pares da mesma dúvida nos dois registros é útil para H1)
- `complexity`: simples | composta
- `answerable_from_corpus`: sim | parcial | não (incluir algumas "não" para medir a declaração de insuficiência)

Congelar cada arquivo registrando o SHA-256 no protocolo antes de usá-lo.
