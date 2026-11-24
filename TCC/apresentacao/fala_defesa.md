# Fala da defesa: NexoHansen

**Tempo total:** cerca de 13 minutos e 45 segundos lendo num ritmo calmo, com mais de 1 minuto de folga dentro dos 15.

**Como usar:**
- Cada slide traz o tempo previsto e, entre parênteses, o tempo acumulado ao terminar o slide. No ensaio, cronometre e compare com esse acumulado.
- A fala foi escrita para ser lida em voz alta: frases curtas, sem siglas e com os termos técnicos explicados na hora.
- O mesmo texto está nas notas do apresentador do PowerPoint.
- As linhas com ">" são lembretes para você, não fazem parte da fala e não vão para as notas.

| Slide | Assunto | Tempo | Acumulado |
|---|---|---|---|
| 1 | Capa | 0:25 | 0:25 |
| 2 | Roteiro | 0:20 | 0:45 |
| 3 | Introdução | 0:55 | 1:40 |
| 4 | Números | 0:45 | 2:25 |
| 5 | Problema | 1:05 | 3:30 |
| 6 | Objetivos | 0:35 | 4:05 |
| 7 | RAG | 1:05 | 5:10 |
| 8 | Trabalhos relacionados | 0:40 | 5:50 |
| 9 | Metodologia | 0:55 | 6:45 |
| 10 | NexoHansen | 0:55 | 7:40 |
| 11 | Caminho de uma pergunta | 0:55 | 8:35 |
| 12 | Avaliação técnica | 1:00 | 9:35 |
| 13 | Avaliação experimental | 1:25 | 11:00 |
| 14 | Escolha do modelo | 0:35 | 11:35 |
| 15 | Conclusão | 1:00 | 12:35 |
| 16 | Limitações e trabalhos futuros | 0:55 | 13:30 |
| 17 | Referências | 0:05 | 13:35 |
| 18 | Obrigado | 0:10 | 13:45 |

---

## Slide 1 · Capa · 0:25 (0:25)

Bom dia a todos. Bom dia, professor Élisson, e bom dia aos membros da banca.

Meu nome é Igor Rêgo, e hoje vou apresentar o NexoHansen. É um sistema que responde dúvidas sobre hanseníase usando documentos oficiais. E, em cada resposta, ele mostra de onde a informação foi tirada.

## Slide 2 · Roteiro · 0:20 (0:45)

Vou começar pelo contexto e pelo problema. Depois, falo dos objetivos, dos conceitos e dos trabalhos parecidos. Em seguida, mostro como o trabalho foi feito e como o sistema funciona. E termino com os resultados e a conclusão.

## Slide 3 · Introdução · 0:55 (1:40)

A hanseníase é considerada pela Organização Mundial da Saúde uma doença negligenciada. Mas, no Brasil, ela ainda é muito presente.

Na maioria dos casos, quem faz o diagnóstico são as equipes dos postos de saúde, na atenção primária. São profissionais que atendem de tudo e que não são especialistas na doença.

Para orientar essas equipes, o Ministério da Saúde tem um protocolo oficial. Só que esse documento tem 152 páginas. No meio de uma consulta, não dá para procurar uma informação ali.

Ferramentas como o ChatGPT poderiam ajudar, porque resumem bem. O problema é que elas às vezes inventam informações, o que se chama de alucinação. E elas não mostram de onde tiraram a resposta.

## Slide 4 · Números · 0:45 (2:25)

E isso tem consequências, porque o diagnóstico ainda chega tarde.

Em 2024, o Brasil teve mais de 22 mil casos novos. É o segundo país do mundo em número de casos novos.

Desses casos, 82% eram da forma multibacilar, que é a forma com mais bacilos e que costuma indicar um diagnóstico tardio. Em 2015, eram 69%.

E 11,5% das pessoas já chegaram ao diagnóstico com alguma deformidade visível, que é o grau mais grave de incapacidade.

Ou seja: para diagnosticar e tratar a tempo, as equipes precisam de informação técnica fácil de acessar.

## Slide 5 · Problema · 1:05 (3:30)

Então, o problema deste trabalho é o seguinte. Os modelos de linguagem respondem bem, mas não mostram uma fonte que possa ser conferida, e podem inventar informações. Na saúde, isso é um risco.

E, na literatura, não encontrei nenhum sistema de RAG, que eu explico daqui a pouco, voltado para a hanseníase, em português e com os documentos oficiais do Brasil.

Daí vem a pergunta de pesquisa: como construir um sistema desse tipo para a hanseníase, e qual é a qualidade das respostas que ele dá?

Essa pergunta foi dividida em três. A primeira é sobre a construção: que decisões permitem mostrar a fonte e recusar pedidos arriscados. A segunda é sobre a busca: se o sistema encontra os trechos certos nos documentos. E a terceira é sobre as respostas: se elas estão corretas, completas e baseadas nos documentos.

## Slide 6 · Objetivos · 0:35 (4:05)

O objetivo geral foi desenvolver esse sistema, com respostas baseadas em documentos oficiais, mostrando as fontes e seguindo regras de segurança. E, depois, avaliar a qualidade da busca e das respostas.

Para chegar lá, os objetivos específicos foram: montar a base com os documentos oficiais, construir o sistema com as regras de segurança, criar a tela onde as pessoas fazem as perguntas, avaliar a busca, avaliar as respostas e, por fim, apontar as limitações do sistema e da avaliação.

## Slide 7 · RAG · 1:05 (5:10)

Agora, o conceito principal do trabalho, que é o RAG. Em português, Geração Aumentada por Recuperação.

A ideia tem três passos. Primeiro, quando chega uma pergunta, o sistema procura nos documentos os trechos que falam sobre o assunto. Segundo, esses trechos são enviados ao modelo de linguagem, junto com a pergunta. E terceiro, o modelo escreve a resposta usando apenas esses trechos.

Assim, cada informação da resposta pode mostrar de onde veio. E, quando os documentos mudam, basta atualizar a base, sem precisar treinar o modelo de novo.

Neste trabalho, a busca é feita de dois jeitos ao mesmo tempo. Uma busca pelo significado, que encontra trechos que dizem a mesma coisa com outras palavras. E uma busca pelas palavras exatas, que acerta nomes de remédios e siglas. No fim, as duas listas de resultados são juntadas em uma só.

## Slide 8 · Trabalhos relacionados · 0:40 (5:50)

Antes de construir o sistema, procurei trabalhos parecidos. Eles se dividem em dois grupos.

O primeiro grupo usa RAG na medicina. Mas esses trabalhos são em inglês e não tratam da hanseníase.

O segundo grupo usa inteligência artificial na hanseníase. Mas o foco deles é reconhecer a doença por imagens ou classificar casos. Eles não respondem às dúvidas dos profissionais.

Então, o espaço que este trabalho ocupa é este: um sistema em português, baseado em documentos oficiais, que mostra as fontes e tem regras de segurança.

## Slide 9 · Metodologia · 0:55 (6:45)

Sobre a metodologia. Esta é uma pesquisa aplicada, porque busca resolver um problema real. E a abordagem é quantitativa, ou seja, os resultados são medidos em números.

O método seguido foi a pesquisa em ciência do design, com base em Peffers e colegas. É um método para criar uma solução para um problema e, depois, avaliar se ela funciona.

O trabalho teve quatro etapas: entender o problema, montar a base com cinco documentos oficiais divididos em 328 trechos, construir o sistema e avaliar.

Foram duas avaliações. Uma técnica, com 32 perguntas de teste. E uma experimental, com 50 perguntas, a maioria baseada em dúvidas reais, que foram corrigidas por um modelo de linguagem seguindo critérios fixos.

## Slide 10 · NexoHansen · 0:55 (7:40)

E este é o NexoHansen, que está publicado e funcionando.

Na imagem da esquerda, há uma resposta real do sistema. Ela responde direto à pergunta, e cada informação tem um número que indica a fonte. Na imagem da direita, aparece a lista dessas fontes, com o nome do documento, a seção e a página. E há um link que abre o documento oficial exatamente na página citada.

O sistema se apoia em três pontos. Primeiro, toda resposta mostra as fontes. Segundo, a segurança: o sistema não faz diagnóstico, não receita remédios e não atende urgências. Esses pedidos são recusados. E terceiro, cada consulta fica registrada, para que seja possível conferir depois por que o sistema respondeu ou recusou.

> Se o tempo permitir, este é o lugar para uma demonstração ao vivo ou um vídeo curto. Se fizer isso, use os cortes do fim do arquivo.

## Slide 11 · Caminho de uma pergunta · 0:55 (8:35)

Agora, o caminho que uma pergunta percorre dentro do sistema. São quatro etapas.

Na primeira, o sistema reescreve a pergunta para deixá-la completa. Por exemplo, se a pessoa pergunta só "e para criança?", o sistema entende, pela conversa, do que se está falando.

Na segunda, acontece a busca nos documentos, daquele jeito duplo que eu mostrei. E o sistema separa os oito trechos mais importantes.

Na terceira, entram as regras de segurança. Elas foram programadas no próprio sistema e funcionam antes de o modelo escrever qualquer coisa. Assim, a recusa não depende de o modelo obedecer.

E, na quarta, o modelo escreve a resposta usando só aqueles trechos. Depois, o sistema confere se cada fonte citada é mesmo um dos trechos enviados.

## Slide 12 · Avaliação técnica · 1:00 (9:35)

Agora vamos aos resultados, começando pela avaliação técnica.

Ela usou 32 perguntas de teste, e o sistema se comportou como esperado em todas. Ele respondeu o que devia responder, recusou o que devia recusar e avisou quando os documentos não tratavam do assunto.

O gráfico mostra a evolução do sistema. A primeira versão tinha um ajuste errado e recusava todas as perguntas. Por isso, só acertava as poucas que deviam mesmo ser recusadas: 16%. Depois que a base e a busca foram refeitas, o sistema chegou a 94%, mesmo sem usar os serviços da OpenAI. E a versão final chegou a 100%.

Além disso, em todas as 25 perguntas que tinham resposta nos documentos, o trecho certo estava entre os enviados ao modelo.

## Slide 13 · Avaliação experimental · 1:25 (11:00)

A avaliação experimental olhou para a qualidade das respostas.

Foram 50 perguntas, a maioria baseada em dúvidas reais publicadas por serviços de saúde. Cada pergunta foi feita duas vezes ao sistema. Depois, um modelo de linguagem corrigiu as respostas seguindo critérios fixos, como uma folha de correção de prova, e comparou cada uma com uma resposta de referência tirada dos documentos.

E o critério foi rigoroso: uma resposta só contava como correta se trouxesse pelo menos 60% dos pontos principais.

O resultado foi de 65,3% de respostas corretas. Considerando a margem estatística, esse valor fica entre 55 e 74%. E nenhuma resposta teve um erro capaz de causar dano ao paciente.

Outros resultados também são importantes. Quando a pergunta não estava nos documentos, o sistema sempre reconheceu isso e não inventou nada. Em média, 98% do que o sistema afirmou estava nos documentos. E, em 88% das perguntas, o resultado foi o mesmo nas duas vezes.

O ponto mais fraco foi o tema tratamento, com apenas 32% de acerto. Mas a maioria das respostas consideradas incorretas estava incompleta, e não errada.

> Se perguntarem por que 98 respostas, e não 100: uma das perguntas, a T36, ficou sem decisão na seleção e foi analisada à parte. As médias são de 98 respostas de 49 perguntas.

## Slide 14 · Escolha do modelo · 0:35 (11:35)

Também comparei seis configurações de modelos da OpenAI para escrever as respostas. Todas se comportaram como esperado nas 32 perguntas de teste. A diferença ficou no tamanho das respostas e no custo.

O modelo escolhido foi o GPT-6 Luna. Ele teve o mesmo desempenho do modelo usado antes, custando 41% menos. E levou pouco mais de 7 segundos por resposta. Outro modelo testado, por exemplo, custou quase sete vezes mais, sem nenhuma melhora.

## Slide 15 · Conclusão · 1:00 (12:35)

Voltando à pergunta de pesquisa, a conclusão é que é possível construir um sistema desse tipo para a hanseníase, mostrando as fontes e com segurança.

Sobre a construção, colocar as regras de segurança e o registro das consultas dentro do próprio sistema fez com que ele recusasse só o que devia e guardasse o motivo de cada resposta. Sobre a busca, o trecho certo foi encontrado em todas as perguntas que tinham resposta. E, sobre as respostas, 65% foram corretas, sem nenhum erro perigoso, mas nem sempre completas.

Por isso, o sistema ainda precisa da revisão de profissionais de saúde antes de ser usado no atendimento. A contribuição deste trabalho é o sistema publicado e uma avaliação que pode ser repetida por outras pessoas.

## Slide 16 · Limitações e trabalhos futuros · 0:55 (13:30)

O trabalho também tem limitações.

A primeira é que nem a base nem as respostas foram revisadas por um profissional de saúde. A segunda é que não foi feita a avaliação com participantes, comparando as respostas do sistema com as de um modelo comum, sem os documentos. A terceira é que as respostas foram corrigidas apenas por um modelo de linguagem. E a quarta é que as tabelas dos documentos perdem a formatação quando o texto é extraído, o que explica parte dos erros sobre tratamento.

Os trabalhos futuros vão exatamente nesses pontos: fazer a avaliação com participantes, validar o conteúdo com especialistas, extrair melhor as tabelas e incluir mais documentos oficiais.

## Slide 17 · Referências · 0:05 (13:35)

Aqui estão as principais referências. A lista completa está no trabalho escrito.

> Não pare neste slide: leia a frase e já passe para o próximo.

## Slide 18 · Obrigado · 0:10 (13:45)

Agradeço à banca, ao professor Élisson pela orientação e a todos que acompanharam este trabalho. Agora, fico à disposição para as perguntas.

---

## Se o tempo apertar

Corte nesta ordem, sem perder o fio da apresentação:

1. **Slide 8:** leia só o último parágrafo, o que começa com "Então, o espaço que este trabalho ocupa" (economiza uns 30 segundos).
2. **Slide 14:** leia só "Também comparei seis configurações de modelos da OpenAI. O modelo escolhido teve o mesmo desempenho do modelo usado antes, custando 41% menos." (economiza uns 25 segundos).
3. **Slide 6:** leia só o primeiro parágrafo, o do objetivo geral (economiza uns 20 segundos).

## Se perguntarem

- **"Vocês usaram RAG mesmo, ou só o ChatGPT?"** "O modelo só escreve a resposta. Antes disso, o sistema busca os trechos nos documentos oficiais e envia esses trechos junto com a pergunta. Depois, o sistema confere se cada fonte citada é mesmo um trecho que foi enviado. A busca é feita de dois jeitos, pelo significado e pelas palavras exatas, mas as duas fazem parte da mesma etapa de busca do RAG."
- **"Qual modelo vocês usaram?"** "Para escrever as respostas, o GPT-6 Luna, da OpenAI. Para a busca pelo significado, o modelo text-embedding-3-small, também da OpenAI."
- **"Quem corrigiu as respostas?"** "Um modelo de linguagem atuando como avaliador, o Claude Opus 5.5, em dez rodadas independentes, sempre com os mesmos critérios e com respostas de referência tiradas dos documentos. A avaliação por profissionais de saúde ficou como trabalho futuro."
- **"65% não é pouco?"** "O critério foi rigoroso: a resposta precisava trazer pelo menos 60% dos pontos principais. A nota média das respostas foi de 0,84 numa escala de 0 a 1, 98% das afirmações estavam nos documentos e não houve nenhum erro perigoso. A maioria das respostas incorretas estava incompleta, e não errada, e os problemas se concentraram em tratamento."
- **"Por que não houve validação por especialista?"** "Ela estava prevista, mas não foi possível concluí-la a tempo. Por isso, ficou registrada como limitação e como trabalho futuro."
- **"O sistema já pode ser usado no atendimento?"** "Ainda não, sem a revisão de profissionais de saúde. Ele é um apoio para consulta de informação: não faz diagnóstico, não receita e recusa esses pedidos."
