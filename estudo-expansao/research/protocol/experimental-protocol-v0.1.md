# Protocolo experimental v0.1

**Status:** rascunho para revisão do autor e orientador. Não registrado e não executado.

## Pergunta primária

Mantidos constantes o corpus, o processamento documental e as configurações de cada modelo, o uso de RAG melhora a qualidade das respostas sobre hanseníase em comparação com o mesmo modelo sem RAG?

## Perguntas secundárias

1. A família de expansão altera a qualidade da recuperação?
2. GPT e Claude respondem de modo diferente sob a mesma condição?
3. Ganhos na recuperação se refletem em fidelidade e correção da resposta?
4. Quais são os custos, latências e falhas clinicamente relevantes?

## Desenho

Estudo pareado por pergunta, com dois chats:

- **Direto:** GPT ou Claude recebe somente a pergunta.
- **RAG:** GPT ou Claude recebe a pergunta original e o mesmo tipo de contexto recuperado.

| Código | Modelo | RAG | Consulta de recuperação |
|---|---|---|---|
| D-GPT | GPT | não | não aplicável |
| D-CLAUDE | Claude | não | não aplicável |
| R0-GPT | GPT | sim | original |
| R0-CLAUDE | Claude | sim | original |
| R1-GPT | GPT | sim | reescrita clínica |
| R1-CLAUDE | Claude | sim | reescrita clínica |
| R2-GPT | GPT | sim | cinco termos clínicos |
| R2-CLAUDE | Claude | sim | cinco termos clínicos |
| R3-GPT | GPT | sim | pseudo-documento |
| R3-CLAUDE | Claude | sim | pseudo-documento |

## Comparações

- efeito do RAG: `D-GPT × R0-GPT` e `D-CLAUDE × R0-CLAUDE`;
- efeito do modelo: GPT × Claude dentro da mesma condição;
- efeito da expansão: `R0 × R1 × R2 × R3` dentro do mesmo modelo;
- interação modelo–estratégia: análise secundária.

## Constantes

- snapshot do corpus;
- extração e limpeza;
- chunking e overlap;
- BGE-M3 e configuração;
- ChromaDB/índice;
- função de similaridade;
- `k` principal;
- política de fusão;
- pergunta original;
- formato e ordem do contexto;
- versões fixas dos modelos;
- limites de saída;
- rubricas e scripts de métricas.

## Desfechos

### Recuperação — somente condições RAG

- uma métrica primária a escolher antes do teste: Recall@k ou MRR;
- Precision@k, Hit@k e nDCG@k como secundárias;
- documentos exclusivos e sobreposição entre condições.

### Resposta — todas as condições

- correção;
- completude;
- relevância;
- fidelidade ao contexto, somente RAG;
- precisão/cobertura de citações, somente RAG;
- informação não sustentada;
- omissão clinicamente relevante;
- contradição à diretriz;
- recomendação potencialmente perigosa.

### Operação

- tokens de entrada e saída;
- latência;
- custo;
- falha de formato;
- timeout, recusa e erro de API.

## Conjunto de perguntas

Deve ser estratificado por diagnóstico, tratamento, reações hansênicas, neuropatia/incapacidade, acompanhamento, prevenção, epidemiologia e políticas. Separar desenvolvimento, validação e teste antes de ajustar prompts. O tamanho final dependerá do piloto e da precisão desejada.

## Relevância documental

Construir `qrels` por pooling da união dos top-N resultados das condições RAG. Ocultar modelo e condição, deduplicar, embaralhar e rotular `0=irrelevante`, `1=parcial`, `2=diretamente relevante`. Fazer dupla avaliação em fração predefinida e adjudicar desacordos.

## Avaliação humana

Avaliação cega quanto à condição. Calibrar qualquer LLM julgador contra amostra humana. Relatar concordância e não usar RAGAs como padrão-ouro clínico.

## Análise

Comparações pareadas por pergunta, tamanhos de efeito e intervalos de confiança. Usar bootstrap pareado ou permutação; McNemar quando o desfecho for binário; correção de Holm para múltiplas comparações. Separar análise confirmatória de exploratória.

## Critérios antes da execução final

- corpus congelado;
- perguntas e splits congelados;
- `qrels` ou plano de pooling aprovado;
- prompts e hashes congelados;
- modelos e parâmetros fixados;
- baseline validado;
- orçamento aprovado;
- avaliador humano confirmado;
- testes automatizados passando;
- dados brutos configurados como imutáveis.
