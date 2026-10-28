# Guia de anotação v0.1

## Relevância documental

- **0 — irrelevante:** não ajuda a responder à pergunta ou trata de tema apenas superficialmente semelhante.
- **1 — parcialmente relevante:** contém informação útil, mas incompleta, indireta ou dependente de outro documento.
- **2 — diretamente relevante:** contém evidência suficiente e diretamente relacionada a pelo menos um componente central da pergunta.

O avaliador deve julgar o texto disponível no chunk e seus metadados autorizados, não o modelo que o recuperou.

## Qualidade da resposta

Avaliar separadamente:

1. **Correção:** compatibilidade com a resposta de referência e fontes autorizadas.
2. **Completude:** cobertura dos elementos necessários.
3. **Relevância:** foco na pergunta, sem conteúdo lateral excessivo.
4. **Fidelidade:** afirmações sustentadas pelos chunks fornecidos.
5. **Citações:** identificadores existentes e suporte real da afirmação.

## Falhas clínicas

Marcar cada categoria independentemente:

- informação não sustentada;
- omissão clinicamente relevante;
- contradição à diretriz;
- recomendação potencialmente perigosa;
- citação inventada;
- alteração de negação;
- alteração de número, dose ou duração;
- alteração de população;
- deriva para outra doença ou intenção.

## Cegamento

Remover nomes de modelos, condição, expansão e ordem original. Randomizar itens. Registrar avaliador, rodada e decisão sem incluir dados pessoais desnecessários.

## Desacordo

Não resolver por consenso antes de medir concordância independente. Após a medição, encaminhar discordâncias para adjudicação documentada.
