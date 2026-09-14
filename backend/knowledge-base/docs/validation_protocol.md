# Protocolo de Validação

Validações automatizadas iniciais:

- schema de metadados;
- ingestão JSONL;
- classificação de intenção;
- detecção de risco clínico;
- fallback sem chunks;
- recusa fora do escopo;
- bloqueio de prescrição individualizada;
- retrieval por diagnóstico e tratamento;
- resposta com fontes;
- regras específicas sobre baciloscopia, PQT, talidomida e gestação.

Validações futuras recomendadas:

- revisão de respostas por especialista;
- métricas de recall por chunk ideal;
- auditoria de respostas com risco alto e muito alto;
- teste de regressão a cada atualização da base.
