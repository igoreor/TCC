# Corpus `hanseniase-v2`

Snapshot imutável com cinco documentos oficiais (D38). Não editar: qualquer mudança gera nova versão. O corpus `pcdt2022-v1` continua congelado e intacto.

| Campo | Valor |
|---|---|
| Snapshot (`chunks.jsonl`) | `4c88c18d9b5b4dc338f157857a8b56a1a23ed0721196de301a13ec891e211663` |
| Trechos | 391 (média de 150 palavras) |
| Índice | `index-bge-m3/`: BGE-M3 revisão `5617a9f6…`, 391 vetores de 1024 dimensões, embeddings `94746b0a22da314f687a8f3f0f8586f2cd276aacd7a61df384bfe5ccb2830e38` |
| Construído em | 23/10/2026 |

## Componentes (nesta ordem)

| Componente | Documento | Função | Trechos | Snapshot do componente |
|---|---|---|---|---|
| `research/corpus/pcdt2022-v1` | PCDT da Hanseníase, MS, 2022 | diretriz clínica normativa | 206 | `f401426c…` (as 206 primeiras linhas do v2 são idênticas ao v1) |
| `research/corpus/components/portaria47-2026-v1` | Portaria SCTIE/MS nº 47/2026 (claritromicina como segunda linha) | atualização normativa do PCDT | 2 | `26e29fd4…` |
| `research/corpus/components/portaria51-2026-v1` | Portaria SCTIE/MS nº 51/2026 (qPCR em casos suspeitos) | atualização normativa do PCDT | 2 | `9d7ac5d8…` |
| `research/corpus/components/estrategia2024-v1` | Estratégia Nacional para Enfrentamento à Hanseníase 2024-2030, MS | estratégia programática nacional | 66 | `4079aed2…` |
| `research/corpus/components/who2023-v1` | WHO, *Interruption of transmission and elimination of leprosy disease – Technical guidance*, 2023 (inglês) | orientação técnica internacional | 115 | `2170362d…` |

Fontes, URLs, licenças e SHA-256 dos PDFs: `research/sources/README.md`. As configurações de extração estão em `software/rag-study/config/corpus-*.json`, e as páginas excluídas com motivo em `exclusions.csv`.

## Regras de extração acrescentadas (opções novas do construtor, desligadas no PCDT)

- **Títulos por tamanho de fonte em até 3 níveis** (`heading_size_levels`): chapéu, seção e subseção da Estratégia e da OMS.
- **Texto grande que não é título** (`heading_max_words`): frases de abertura e quadros de destaque viram parágrafo; títulos numerados nunca são rebaixados.
- **Linhas descartadas** (`drop_line_patterns`): números de página e marcas de tabela ("continua", "conclusão").
- **Recorte do DOU** (`excerpt_start` e `excerpt_end`): cada página do Diário Oficial traz vários atos; só entra o texto entre o título da portaria e a assinatura. A ordem de leitura do PDF (`sort_blocks=false`) respeita as três colunas do DOU.
- **Junção** (`merge-corpora`): os registros dos componentes são mantidos como foram construídos; só `ordinal` é renumerado.

Verificação: a reconstrução do PCDT com o código novo reproduz `chunks.jsonl` byte a byte (`f401426c…`).

## Limitações

- **As portarias trazem só a decisão** (incorporação ou ampliação de uso), sem doses nem esquemas. Para claritromicina e qPCR, o corpus tem a regra de 2022 e a decisão de 2026. O prompt de resposta v2 (D39) manda indicar a divergência e seguir a norma brasileira mais recente.
- **A OMS está em inglês.** O recuperador BGE-M3 é multilíngue, mas a verificação lexical (BM25) das perguntas não respondíveis precisa de termos em inglês (`terms_en`).
- **Recomendações da OMS que o Brasil não adota** (por exemplo, a profilaxia pós-exposição) convivem com o PCDT. A resposta correta deve distinguir orientação internacional de norma nacional.
- **Ruído de diagramação:**
  - Na OMS, dois rótulos de figura foram lidos como título (p. 14 e 28), e termos do glossário em duas colunas saíram com a ordem invertida.
  - Na Estratégia, as tabelas de ações estratégicas são linearizadas.
- **Exclusões da Estratégia:** os Anexos A e B ficaram de fora (lista de participantes e lista de municípios por grupo). Os dados por UF que estão no corpo do texto continuam.
