// Edições a partir dos comentários do orientador (Prof. Dr. Élisson da Silva Rocha) na versão
// comentada em 11/11/2026 (revisao_tcc/TCC_comentado_pelo_orientador_2026-11-11.docx), aplicadas por
// avaliacao/tcc/aplicar_revisao.ts depois da revisão acadêmica (edicoes.ts) e da de concisão
// (edicoes_concisao.ts). Reúne também as cinco reduções propostas no item E.4 do
// RELATORIO_OTIMIZACAO_TCC.md.
//
// Os `ajustes` são aplicados a todo o texto antes das edições; por isso, as edições já escrevem as
// remissões a seções na numeração nova, as citações no formato (Brasil, ano) e as palavras de
// `ajustes.italico` em itálico. Remissões a figuras, quadros e tabelas, ao contrário, usam a numeração
// anterior a estas edições, e o aplicador as renumera.
// Marcação do texto novo: *itálico*, **negrito**, `código`; marcadores pendentes em [[[...]]].
import type { Ajustes, Edicao } from '../avaliacao/tcc/aplicar_revisao';

export const ajustes: Ajustes = {
  // Comentários 5 e 6: o Capítulo 4 substitui a Seção 5.1 (Artefato desenvolvido), e a Discussão
  // passa a ser a Seção 5.4 do capítulo de resultados.
  remissoesSecoes: {
    '5.2': '5.1',
    '5.2.1': '5.1.1',
    '5.2.2': '5.1.2',
    '5.2.3': '5.1.3',
    '5.3': '5.2',
    '5.3.1': '5.2',
    '5.3.2': '5.2',
    '5.3.3': '5.2',
    '5.3.4': '5.2',
    '5.4': '5.3',
    '6.1': '5.4.1',
    '6.2': '5.4.2',
    '6.3': '5.4.3',
    '6.4': '5.4.4',
    '6.5': '5.4.5'
  },
  trocas: [
    // Alterações controladas do orientador: ordem dos termos no título e titulação.
    { de: 'Recuperação Aumentada por Geração', para: 'Geração Aumentada por Recuperação' },
    { de: 'Prof. Élisson da Silva Rocha', para: 'Prof. Dr. Élisson da Silva Rocha' },
    // Comentário 1: documentos do Ministério da Saúde citados como Brasil (NBR 10520). Com o PCDT,
    // há duas obras de Brasil em 2022, distinguidas por letra na ordem da lista de referências.
    // A mensagem de recusa do Apêndice C reproduz literalmente o texto do sistema e não é alterada.
    { de: '(Brasil, 2022)', para: '(Brasil, 2022a)' },
    { de: '(Ministério da Saúde, 2022', para: '(Brasil, 2022b', exceto: ['Não encontrei, nos documentos oficiais da base'] },
    { de: '(Ministério da Saúde, 2024', para: '(Brasil, 2024' },
    { de: '(Ministério da Saúde, 2026', para: '(Brasil, 2026' },
    { de: '; Ministério da Saúde, 2022', para: '; Brasil, 2022b' },
    { de: '; Ministério da Saúde, 2024', para: '; Brasil, 2024' },
    { de: '; Ministério da Saúde, 2026', para: '; Brasil, 2026' }
  ],
  // Comentário 0: nomes científicos e estrangeiros em itálico. Os nomes científicos e quase todos os
  // termos estrangeiros já estavam em itálico; restavam estes.
  italico: ['login', 'Login', 'web', 'script']
};

const QUADRO_PARAMETROS = {
  tipo: 'tabela' as const,
  especie: 'Quadro' as const,
  legenda: 'Parâmetros a registrar para cada cenário de avaliação',
  larguras: [36,40,24],
  cabecalho: ['Parâmetro', 'Cenário A (com RAG)', 'Cenário B (sem RAG)'],
  linhas: [
    ['Versão do sistema (*commit* do repositório)', '[PREENCHER]', '[PREENCHER]'],
    ['Modelo de linguagem e versão', '[PREENCHER] (padrão atual: `gpt-6-luna`)', '[PREENCHER]'],
    ['Temperatura e demais parâmetros de geração', '[PREENCHER] (padrão atual: temperatura 0,1, sem raciocínio)', '[PREENCHER]'],
    ['*Prompt* de sistema', '*Prompt* clínico do sistema (Seção 4.5.6)', '[PREENCHER]'],
    ['Modelo de *embedding*', '[PREENCHER] (padrão atual: `text-embedding-3-small`)', 'Não se aplica'],
    ['Versão da base de conhecimento', '[PREENCHER] (atual: processada em 23 de outubro de 2026, com 328 trechos)', 'Não se aplica'],
    ['Parâmetros de recuperação (*top-K*, *top-N* e similaridade mínima)', '[PREENCHER] (padrão atual: 20, 8 e 0,25)', 'Não se aplica'],
    ['Regras de segurança', 'Ativas (Seção 4.5.5)', '[DEFINIR: ausentes ou equivalentes]'],
    ['Data e ambiente de geração das respostas', '[PREENCHER]', '[PREENCHER]']
  ],
  fonte: 'Fonte: Elaboração própria (2026).'
};

const QUADRO_DIMENSOES = {
  tipo: 'tabela' as const,
  especie: 'Quadro' as const,
  legenda: 'Dimensões candidatas para o instrumento de avaliação',
  larguras: [23,43,34],
  cabecalho: ['Dimensão candidata', 'Pergunta orientadora', 'Referência'],
  linhas: [
    ['Correção factual', 'A resposta está de acordo com as orientações técnicas vigentes?', 'Singhal *et al.* (2023); Zakka *et al.* (2024)'],
    ['Completude', 'A resposta contempla os aspectos necessários à pergunta?', 'Zakka *et al.* (2024); Yang *et al.* (2026)'],
    ['Relevância', 'A resposta trata do que foi perguntado?', 'Es *et al.* (2024); Yang *et al.* (2026)'],
    ['Clareza', 'A resposta é compreensível para o público a que se destina?', 'Yang *et al.* (2026)'],
    ['Segurança e potencial de dano', 'A resposta poderia induzir conduta inadequada?', 'Singhal *et al.* (2023); Zakka *et al.* (2024)'],
    ['Adequação da recusa', 'Nos casos que exigem avaliação presencial, a recusa e a orientação são adequadas?', 'Política de segurança do sistema (Seção 4.5.5)'],
    ['Transparência das fontes', 'É possível identificar de onde vem a informação?', 'Lewis *et al.* (2020); Zakka *et al.* (2024)'],
    ['Confiança e utilidade percebidas', 'O participante confiaria na resposta e a consideraria útil?', '[DEFINIR: referência a localizar, caso a dimensão seja adotada]']
  ],
  fonte: 'Fonte: Elaboração própria (2026), com base nas referências indicadas.'
};

const QUADRO_TESTES = {
  tipo: 'tabela' as const,
  especie: 'Quadro' as const,
  legenda: 'Testes automatizados do servidor e da interface',
  larguras: [13,22,55,10],
  cabecalho: ['Camada', 'Grupo', 'Comportamentos verificados', 'Testes'],
  linhas: [
    ['Servidor', 'Esquemas, intenção e risco clínico', 'Metadados com valores padrão; ingestão de JSONL; intenção por palavras inteiras; risco muito alto para dose, gestação, criança, reação e talidomida', '4'],
    ['Servidor', 'Segurança', 'Recusa sem evidência, fora do escopo, de prescrição para paciente específico (inclusive dose pelo peso) e de diagnóstico de caso; comparação por palavras inteiras, sem acentos; perguntas antes recusadas por subcadeias respondidas; respostas cautelosas sobre crianças, gestação e reações; maior restrição ao perfil de paciente', '10'],
    ['Servidor', 'Recuperação, interpretação e fusão', 'Recuperação de trechos de diagnóstico e de tratamento; conteúdo das respostas (baciloscopia negativa, PQT em reação, talidomida e gestação); leitura da pergunta no domínio; saída do escopo; continuações; uso do modelo com alternativa local; fusão por posição recíproca', '12'],
    ['Servidor', 'Citações, *prompt* e geração', 'Renumeração e descarte de citações inválidas; remoção da lista de fontes escrita pelo modelo; verificação por sobreposição de termos; referência documental com página e ligação; conteúdo do *prompt*; resposta sem citações e resposta extrativa; parâmetros por família de modelo', '12'],
    ['Servidor', 'Processamento de documentos e avaliação', 'Limpeza das páginas; leitura do sumário e localização das seções; fragmentação por seção; metadados e textos de indexação; métricas da avaliação técnica e reconhecimento da declaração de lacuna', '11'],
    ['Servidor', 'Autenticação, avaliações e API HTTP', 'Senhas com sal e formatos inválidos; recusas de *login*; expiração, *logout* e limite de tentativas; notas de 0 a 10 com comentário, vinculadas ao usuário, à conversa e à resposta, uma por usuário e resposta; rotas bloqueadas sem sessão; *cookie* HttpOnly; respostas de erro de validação, de conflito e de falha interna', '34'],
    ['Servidor', 'Integração com PostgreSQL', 'Cadastro por SQL seguido de *login*; restrições de formato, de faixa da nota, de unicidade e de coerência entre resposta e conversa; bloqueio da exclusão em cascata; indexação incremental com páginas e histórico; busca textual sem acentos; vetores apenas do mesmo modelo e de documentos ativos', '10'],
    ['Interface', '*Login*, avaliação e fontes', 'Redirecionamento sem sessão, erros de credenciais, retorno à origem e sessão expirada; escala de 0 a 10, envio, falha, repetição, dispensa e reabertura da avaliação, exibida após cada resposta; referência documental, trecho original, avisos de documento em inglês e de citação não confirmada; subtítulos e tabelas com citações', '20']
  ],
  fonte: 'Fonte: Elaboração própria (2026), com base nos arquivos de teste do servidor e da interface.'
};

const TABELA_PONTUACAO = {
  tipo: 'tabela' as const,
  especie: 'Tabela' as const,
  legenda: 'Pontuação textual mínima necessária para atingir o limiar de relevância',
  larguras: [80,20],
  cabecalho: ['Pontuação textual mínima necessária', 'Perguntas'],
  linhas: [
    ['Até 0,25', '1'],
    ['Acima de 0,25 até 0,50', '1'],
    ['Acima de 0,50 até 0,75', '3'],
    ['Acima de 0,75 até 1,00', '4'],
    ['Acima de 1,00 (inalcançável)', '13'],
    ['Total de perguntas dependentes da regra de evidência', '22']
  ],
  fonte: 'Fonte: Elaboração própria (2026), a partir da reprodução das partes determinísticas do sistema.'
};

export const edicoes: Edicao[] = [
  // -------------------------------------------------------------------------
  // Capítulo 1
  {
    id: 'O-001',
    secao: '1',
    motivo: 'A nota de rodapé explicava a divergência entre o título ("Recuperação Aumentada por Geração") e o texto; com o título corrigido pelo orientador, a nota perde o objeto e é retirada.',
    tipo: 'substituir',
    antes: 'A Geração Aumentada por Recuperação (RAG, do inglês',
    depois:
      'A Geração Aumentada por Recuperação (RAG, do inglês *retrieval-augmented generation*) procura mitigar essas limitações ao condicionar a geração de texto a trechos recuperados de uma base documental externa (Lewis *et al.*, 2020). Em vez de depender apenas do conhecimento armazenado nos parâmetros do modelo, o sistema localiza os trechos mais pertinentes à pergunta e redige a resposta a partir deles, o que permite indicar as fontes utilizadas e atualizar o conhecimento por meio da base, sem novo treinamento. Estudos em medicina mostram, entretanto, que a qualidade da recuperação é tão determinante quanto a do modelo gerador (Xiong *et al.*, 2024), e revisões recentes apontam que a área ainda carece de validação clínica, de padronização da avaliação e de adaptação a idiomas diferentes do inglês (Amugongo *et al.*, 2025; Yang *et al.*, 2026).'
  },
  {
    id: 'O-002',
    secao: '1',
    motivo: 'Comentário 2: "Na literatura consultada" exigiria descrever a busca; o orientador sugeriu "Até onde se tem conhecimento".',
    tipo: 'substituir',
    antes: 'No caso da hanseníase, a produção em Inteligência Artificial',
    depois:
      'No caso da hanseníase, a produção em Inteligência Artificial (IA) concentra-se no apoio ao diagnóstico e à triagem, sobretudo a partir de imagens de lesões cutâneas, exames laboratoriais e questionários (Fernandes *et al.*, 2024; Barbieri *et al.*, 2022; Simões *et al.*, 2025). Até onde se tem conhecimento, não foram identificados sistemas baseados em RAG voltados ao apoio informacional sobre a doença, em língua portuguesa e ancorados em documentos oficiais brasileiros.'
  },
  {
    id: 'O-003',
    secao: '1',
    motivo: 'Comentário 3: o orientador marcou "(nome provisório)" para retirada.',
    tipo: 'substituir',
    antes: 'Este trabalho desenvolve o NexoHansen (nome provisório)',
    depois:
      'Este trabalho desenvolve o NexoHansen, um sistema de apoio informacional à decisão clínica em hanseníase baseado em RAG. O sistema recupera trechos de uma base de conhecimento curada, redige respostas restritas a esses trechos com indicação das fontes, recusa situações que exigem avaliação presencial, como pedidos de diagnóstico definitivo ou de prescrição, e registra cada consulta para auditoria. Ele não substitui o julgamento clínico e não foi validado para uso assistencial: nesta pesquisa, é o artefato por meio do qual se investiga como uma arquitetura RAG pode ser projetada para esse domínio e como suas respostas são avaliadas em comparação com as de um modelo de linguagem sem recuperação.'
  },
  {
    id: 'O-004',
    secao: '1.1.2',
    motivo: 'Comentário 4: o Quadro 2 deixa de indicar a "situação nesta versão", que o orientador não entendeu, e passa a indicar onde cada objetivo é tratado.',
    tipo: 'substituir',
    antes: 'O Quadro 2, no Capítulo 3, relaciona cada objetivo',
    depois: 'O Quadro 2, no Capítulo 3, relaciona cada objetivo às etapas metodológicas e às seções em que é tratado.'
  },
  {
    id: 'O-005',
    secao: '1.3',
    motivo: 'Comentários 5 e 6: nova estrutura, com o Capítulo 4 como o artefato e a discussão dentro do Capítulo 5; o trabalho passa a ter seis capítulos.',
    tipo: 'substituir',
    antes: 'Além desta introdução, o trabalho tem',
    depois:
      'Além desta introdução, o trabalho tem cinco capítulos. O Capítulo 2 apresenta o referencial teórico; o Capítulo 3, a metodologia, com a avaliação técnica, a avaliação comparativa planejada e a avaliação experimental com perguntas curadas; o Capítulo 4, o sistema desenvolvido, primeiro resultado da pesquisa; o Capítulo 5, os resultados das avaliações, inclusive os preliminares da avaliação experimental, e sua discussão, com as limitações; e o Capítulo 6, as considerações finais. Os apêndices reúnem os conjuntos de perguntas, os resultados por pergunta, o protocolo previsto da avaliação comparativa e os instrumentos das avaliações.'
  },

  // -------------------------------------------------------------------------
  // Capítulo 2
  {
    id: 'O-006',
    secao: '2.7.1',
    motivo: 'Comentário 2, aplicado também à mesma afirmação no estado da arte.',
    tipo: 'substituir',
    antes: 'Esses trabalhos convergem para tarefas de triagem',
    depois:
      'Esses trabalhos convergem para tarefas de triagem, classificação e apoio ao diagnóstico, com dados de imagem, questionários ou exames. Até onde se tem conhecimento, não foram identificados sistemas voltados a responder perguntas sobre a doença com base em documentos oficiais, isto é, ao apoio informacional em linguagem natural. Essa tarefa exige outro tipo de avaliação: não há um rótulo correto a prever, e sim uma resposta em texto cuja correção, completude e fundamentação precisam ser julgadas (Seção 2.6).'
  },
  {
    id: 'O-007',
    secao: '2.8',
    motivo: 'Remissão ao antigo Capítulo 6, que passou a ser a Seção 5.4.',
    tipo: 'substituir',
    antes: 'Em relação a esses trabalhos, o presente estudo diferencia-se',
    depois:
      'Em relação a esses trabalhos, o presente estudo diferencia-se em quatro aspectos: dirige-se ao apoio informacional em linguagem natural, e não à triagem, à classificação ou ao diagnóstico; opera em português, com documentos oficiais brasileiros e da OMS; trata a segurança como requisito de arquitetura, com regras de recusa implementadas em código, sinalização de risco e registro de cada consulta; e avalia respostas abertas, e não de múltipla escolha, por meio de perguntas curadas e de uma comparação planejada com participantes. Em comparação com Xiong *et al.* (2024) e Zakka *et al.* (2024), a base é restrita a cinco documentos, e a participação de especialistas limita-se, nesta versão, à revisão de uma amostra das respostas (Seção 3.8.4), limitação discutida na Seção 5.4.4.'
  },

  // -------------------------------------------------------------------------
  // Capítulo 3
  {
    id: 'O-008',
    secao: '3',
    motivo: 'Remissão às ameaças à validade da avaliação experimental (agora Seção 5.4.5), com a ordem das remissões corrigida.',
    tipo: 'substituir',
    antes: 'Este capítulo descreve os procedimentos da pesquisa',
    depois:
      'Este capítulo descreve os procedimentos da pesquisa: sua caracterização e suas etapas (Seções 3.1 e 3.2), a construção da base de conhecimento e o desenvolvimento do sistema (Seções 3.3 e 3.4), a avaliação técnica do *pipeline*, que incluiu a escolha do modelo gerador (Seção 3.5), a avaliação comparativa com participantes, ainda não realizada (Seção 3.6), as ameaças à validade dessas avaliações (Seção 3.7) e a avaliação experimental com 50 perguntas curadas (Seção 3.8), cujas ameaças à validade são discutidas na Seção 5.4.5. Os procedimentos executados são distinguidos dos planejados, e as decisões pendentes são indicadas nos pontos em que deverão ser registradas.'
  },
  {
    id: 'O-009',
    secao: '3.2',
    motivo: 'Alteração controlada do orientador na fonte da Figura 1, no padrão das demais fontes.',
    tipo: 'substituir',
    antes: 'Fonte: Elaborado pelo autor com base em Peffers',
    depois: 'Fonte: Elaboração própria (2026), com base em Peffers *et al.* (2007).'
  },
  {
    id: 'O-010',
    secao: '3.2',
    motivo: 'Comentário 4.',
    tipo: 'substituir',
    antes: 'O Quadro 2 relaciona os objetivos específicos às etapas',
    depois: 'O Quadro 2 relaciona cada objetivo específico às etapas da pesquisa (Figura 1) e às seções em que é tratado.'
  },
  {
    id: 'O-011',
    secao: '3.2',
    motivo: 'Comentário 4: a coluna "Situação nesta versão" misturava o andamento do trabalho com a estrutura da pesquisa; o andamento está nas Considerações Finais. O quadro passa a indicar a etapa e as seções correspondentes.',
    tipo: 'substituir_tabela',
    legenda: 'Correspondência entre objetivos específicos, etapas e situação atual',
    bloco: {
      tipo: 'tabela',
      especie: 'Quadro',
      legenda: 'Correspondência entre objetivos específicos, etapas da pesquisa e seções do trabalho',
  larguras: [28,44,28],
      cabecalho: ['Objetivo específico', 'Etapa da pesquisa (Figura 1)', 'Seções'],
      linhas: [
        ['a) Base de conhecimento', '3. Projeto e desenvolvimento', '3.3 e 4.4'],
        ['b) *Pipeline* RAG', '3. Projeto e desenvolvimento', '4.1 a 4.5 e 4.8'],
        ['c) Interface *web*', '3. Projeto e desenvolvimento; 4. Demonstração', '4.6 e 4.7'],
        ['d) Avaliação técnica', '5. Avaliação', '3.5, 3.8, 5.1 e 5.3'],
        ['e) Avaliação comparativa', '5. Avaliação', '3.6, 5.2 e Apêndice E'],
        ['f) Limitações', '5. Avaliação; 6. Comunicação', '5.4.4 e 5.4.5']
      ],
      fonte: 'Fonte: Elaboração própria (2026).'
    }
  },

  // 3.6: o detalhamento da avaliação comparativa, ainda não realizada, vai para o Apêndice E (redução 1
  // do relatório de concisão); no corpo ficam o objetivo, os cenários, os participantes e a ética.
  {
    id: 'O-012',
    secao: '3.6.1',
    motivo: 'Redução: as seis decisões de desenho (alíneas) e o Quadro 6 passam ao Apêndice E; o parágrafo as enumera.',
    tipo: 'substituir',
    antes: 'Para que a comparação seja interpretável',
    depois:
      'Para que a comparação seja interpretável, a diferença entre os cenários deve residir, tanto quanto possível, no uso da recuperação e dos mecanismos associados, e não em fatores alheios ao objeto do estudo. Antes da coleta, precisam ser definidos o mecanismo e o modelo do Cenário B, que não pode ser a simulação da tela de comparação atual (Seção 4.7), as instruções a esse modelo, a forma de apresentação das respostas, o cegamento, a ordem de exposição e o desenho, bem como eventuais correções no Cenário A. Essas decisões, com as alternativas consideradas, e os parâmetros a registrar para cada cenário (Quadro 6) estão no Apêndice E.'
  },
  { id: 'O-013', secao: '3.6.1', motivo: 'Movida para o Apêndice E.', tipo: 'remover', antes: 'a) mecanismo do Cenário B:' },
  { id: 'O-014', secao: '3.6.1', motivo: 'Movida para o Apêndice E.', tipo: 'remover', antes: 'b) modelo do Cenário B:' },
  { id: 'O-015', secao: '3.6.1', motivo: 'Movida para o Apêndice E.', tipo: 'remover', antes: 'c) instruções ao modelo do Cenário B:' },
  { id: 'O-016', secao: '3.6.1', motivo: 'Movida para o Apêndice E.', tipo: 'remover', antes: 'd) apresentação das respostas:' },
  { id: 'O-017', secao: '3.6.1', motivo: 'Movida para o Apêndice E.', tipo: 'remover', antes: 'e) cegamento, ordem e desenho:' },
  { id: 'O-018', secao: '3.6.1', motivo: 'Movida para o Apêndice E.', tipo: 'remover', antes: 'f) correções prévias no Cenário A:' },
  { id: 'O-019', secao: '3.6.1', motivo: 'Movido para o Apêndice E.', tipo: 'remover', antes: '[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: decisões adotadas para cada item acima' },
  { id: 'O-020', secao: '3.6.1', motivo: 'Movido para o Apêndice E.', tipo: 'remover_ilustracao', legenda: 'Parâmetros a registrar para cada cenário de avaliação' },
  {
    id: 'O-021',
    secao: '3.6.2',
    motivo: 'Redução: o Quadro 7 passa ao Apêndice E.',
    tipo: 'substituir',
    antes: 'O instrumento deverá definir as dimensões avaliadas',
    depois:
      'O instrumento deverá definir as dimensões avaliadas, a escala de resposta e os campos para comentários; as dimensões candidatas, derivadas da literatura discutida na Seção 2.6, e a estrutura prevista do instrumento estão no Apêndice E. [[[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: dimensões adotadas, com a definição operacional de cada uma; escala de resposta; questões abertas; validação prévia do instrumento, por exemplo em teste piloto.]]] A nota global de 0 a 10 que o sistema já registra para cada resposta (Seção 4.6.2) não substitui a avaliação por dimensões, mas pode compor o instrumento como avaliação geral de cada resposta. [[[DEFINIR COM O ORIENTADOR: uso da nota global de 0 a 10 registrada pelo sistema no instrumento de avaliação.]]]'
  },
  { id: 'O-022', secao: '3.6.2', motivo: 'Movido para o Apêndice E.', tipo: 'remover_ilustracao', legenda: 'Dimensões candidatas para o instrumento de avaliação' },

  // -------------------------------------------------------------------------
  // Capítulo 4
  {
    id: 'O-023',
    secao: '4',
    motivo: 'Comentários 3 e 5: retira "provisoriamente" e incorpora o que a antiga Seção 5.1 (Artefato desenvolvido) dizia: o sistema é o primeiro resultado e atende aos objetivos a, b e c.',
    tipo: 'substituir',
    antes: 'Este capítulo descreve o sistema desenvolvido',
    depois:
      'Este capítulo descreve o sistema desenvolvido, o NexoHansen, conforme implementado no repositório do projeto em outubro de 2026. O sistema é o primeiro resultado da pesquisa: atende aos objetivos específicos a, b e c, com a ressalva de que o conteúdo da base não foi revisado por profissional de saúde, e foi publicado na plataforma Vercel, com o banco de dados no serviço Neon (Seção 4.2). Essa versão resulta da reformulação motivada pela avaliação técnica preliminar (Seção 5.1.1), e a Seção 4.9 resume as alterações em relação à versão então avaliada.'
  },
  {
    id: 'O-024',
    secao: '4.6.2',
    motivo: 'Redução: a Figura 5 (componente de avaliação) é retirada; o texto já o descreve.',
    tipo: 'substituir',
    antes: 'Após cada resposta concluída, inclusive as recusas',
    depois:
      'Após cada resposta concluída, inclusive as recusas, a interface exibe um componente de avaliação com escala de 0, a pior avaliação, a 10, a melhor, e um comentário opcional de até 1.000 caracteres; a avaliação pode ser dispensada e reaberta, e, se o envio falhar, a nota e o comentário são preservados para nova tentativa.'
  },
  { id: 'O-025', secao: '4.6.2', motivo: 'Redução: captura de tela descrita no texto.', tipo: 'remover_ilustracao', legenda: 'Componente de avaliação de uma resposta, após a escolha da nota' },
  { id: 'O-026', secao: '4.7', motivo: 'Comentário 0: termo estrangeiro em itálico também no título.', tipo: 'substituir', titulo: true, antes: '4.7 INTERFACE WEB', depois: '4.7 INTERFACE *WEB*' },
  {
    id: 'O-027',
    secao: '4.7',
    motivo: 'Redução: a Figura 6 (página inicial) é retirada; o texto já descreve seu conteúdo.',
    tipo: 'substituir',
    antes: 'A interface web tem uma área pública e um painel interno',
    depois:
      'A interface *web* tem uma área pública e um painel interno. A área pública compreende a página inicial, que apresenta a finalidade do sistema, o método de construção das respostas, os limites de segurança e os documentos da base, com um exemplo de consulta identificado como ilustrativo; a tela de *login*; a gaveta de consulta; e a tela de comparação. Exceto a página inicial e o *login*, as telas exigem sessão: sem ela, a pessoa é conduzida ao *login* e, depois, devolvida ao ponto em que estava; ao sair, as conversas mantidas pela interface são descartadas, para que não fiquem visíveis a quem usar o mesmo navegador.'
  },
  { id: 'O-028', secao: '4.7', motivo: 'Redução: captura de tela descrita no texto.', tipo: 'remover_ilustracao', legenda: 'Página inicial do sistema' },
  {
    id: 'O-029',
    secao: '4.7',
    motivo: 'Redução: a Figura 9 (explorador de recuperação) é retirada; o texto já descreve o formulário.',
    tipo: 'substituir',
    antes: 'O painel interno, acessível por endereço próprio',
    depois:
      'O painel interno, acessível por endereço próprio, reúne ferramentas de inspeção: uma tela de consulta com seleção de perfil (profissional de saúde, paciente ou desenvolvedor); um explorador de recuperação, que executa apenas a busca, com escolha do modo (híbrido, vetorial ou textual), dos parâmetros *top-K* e *top-N* e de filtros por metadados, e exibe as pontuações de cada candidato; um navegador da base de conhecimento; e um painel de avaliação, que executa as perguntas de referência e apresenta os indicadores da Seção 3.5.'
  },
  { id: 'O-030', secao: '4.7', motivo: 'Redução: captura de tela descrita no texto.', tipo: 'remover_ilustracao', legenda: 'Formulário do explorador de recuperação no painel interno' },
  {
    id: 'O-031',
    secao: '4.8',
    motivo: 'Redução: o Quadro 10 (testes por grupo) passa ao novo Apêndice L.',
    tipo: 'substituir',
    antes: 'O sistema conta com 113 testes automatizados',
    depois:
      'O sistema conta com 113 testes automatizados, escritos com Vitest: 93 no servidor e 20 na interface, agrupados conforme o Quadro 10 (Apêndice L). No servidor, os testes unitários usam dublês em memória para o repositório, o provedor de *embeddings* e o modelo de linguagem, e parte deles exercita a API por requisições HTTP; dez testes de integração são executados contra um PostgreSQL com as migrações do projeto aplicadas, quando um banco de testes é configurado. Na interface, os testes usam a Testing Library e simulam as respostas da API.'
  },
  { id: 'O-032', secao: '4.8', motivo: 'Movido para o Apêndice L.', tipo: 'remover_ilustracao', legenda: 'Testes automatizados do servidor e da interface' },

  // -------------------------------------------------------------------------
  // Capítulo 5: resultados e discussão (comentários 5 e 6)
  { id: 'O-033', secao: '5', motivo: 'Comentário 6: a discussão passa a integrar o capítulo.', tipo: 'substituir', titulo: true, antes: '5 RESULTADOS', depois: '5 RESULTADOS E DISCUSSÃO' },
  {
    id: 'O-034',
    secao: '5',
    motivo: 'Nova estrutura do capítulo.',
    tipo: 'substituir',
    antes: 'Este capítulo reúne quatro tipos de resultado',
    depois:
      'Este capítulo reúne os resultados das avaliações do sistema descrito no Capítulo 4 e sua discussão: a avaliação técnica do *pipeline*, em execução preliminar e com a base oficial, incluindo a comparação de modelos geradores (Seção 5.1); a avaliação comparativa, ainda não realizada (Seção 5.2); os resultados preliminares da avaliação experimental com perguntas curadas (Seção 5.3); e a discussão desses resultados em relação às questões de pesquisa, à literatura e às limitações do trabalho (Seção 5.4).'
  },
  { id: 'O-035', secao: '5.1', motivo: 'Comentário 5: o Capítulo 4 substitui a seção "Artefato desenvolvido"; seu conteúdo foi incorporado à abertura do Capítulo 4 (O-023).', tipo: 'remover', titulo: true, antes: '5.1 ARTEFATO DESENVOLVIDO' },
  { id: 'O-036', secao: '5.1', motivo: 'Ver O-035.', tipo: 'remover', antes: 'O sistema desenvolvido atende, em sua versão atual, aos requisitos' },
  { id: 'O-037', secao: '5.1', motivo: 'Ver O-035; a relação com os objetivos está na abertura do Capítulo 4.', tipo: 'remover', antes: 'Em relação aos objetivos específicos, os objetivos a, b e c' },
  { id: 'O-038', secao: '5.1', motivo: 'Renumeração.', tipo: 'substituir', titulo: true, antes: '5.2 AVALIAÇÃO TÉCNICA', depois: '5.1 AVALIAÇÃO TÉCNICA' },
  { id: 'O-039', secao: '5.1.1', motivo: 'Renumeração.', tipo: 'substituir', titulo: true, antes: '5.2.1 Execução preliminar', depois: '5.1.1 Execução preliminar' },
  {
    id: 'O-040',
    secao: '5.1.1',
    motivo: 'Redução 5: a análise detalhada da execução preliminar (Tabela 2) passa ao Apêndice D; no corpo fica a conclusão com os números que a sustentam.',
    tipo: 'substituir',
    antes: 'Todas as perguntas terminaram em recusa, e nenhuma resposta continha fontes',
    depois:
      'Todas as perguntas terminaram em recusa, e nenhuma resposta continha fontes. Como os resultados por pergunta dessa execução não foram armazenados, as partes determinísticas do *pipeline* foram reproduzidas em 20 de outubro de 2026 com o código compilado do sistema (Apêndice D). A reprodução mostrou que três perguntas eram recusadas por regras específicas a partir do próprio texto (reação grave, gestação e prescrição) e que, em 13 das 22 perguntas restantes, o limiar não poderia ser atingido pelo trecho ideal nem com a máxima correspondência textual, embora esse trecho tenha sido o mais similar à pergunta, entre os 15 da base, em 16 das 25 perguntas. O resultado da Tabela 1 decorre, portanto, da incompatibilidade entre o limiar configurado e a escala de pontuação do provedor determinístico, e não necessariamente de falhas no ranqueamento.'
  },
  { id: 'O-041', secao: '5.1.1', motivo: 'Movido para o Apêndice D.', tipo: 'remover', antes: 'A análise mostrou que três das 25 perguntas' },
  { id: 'O-042', secao: '5.1.1', motivo: 'Movida para o Apêndice D.', tipo: 'remover_ilustracao', legenda: 'Pontuação textual mínima necessária para atingir o limiar de relevância' },
  { id: 'O-043', secao: '5.1.1', motivo: 'Movido para o Apêndice D.', tipo: 'remover', antes: 'Como a pontuação textual é limitada a 1' },
  { id: 'O-044', secao: '5.1.2', motivo: 'Renumeração.', tipo: 'substituir', titulo: true, antes: '5.2.2 Avaliação com a base oficial', depois: '5.1.2 Avaliação com a base oficial' },
  { id: 'O-045', secao: '5.1.3', motivo: 'Renumeração.', tipo: 'substituir', titulo: true, antes: '5.2.3 Comparação de modelos', depois: '5.1.3 Comparação de modelos e escolha do modelo gerador' },

  // 5.2: a estrutura vazia da avaliação comparativa vira um parágrafo marcado (redução 3).
  { id: 'O-046', secao: '5.2', motivo: 'Renumeração.', tipo: 'substituir', titulo: true, antes: '5.3 RESULTADOS DA AVALIAÇÃO COMPARATIVA', depois: '5.2 RESULTADOS DA AVALIAÇÃO COMPARATIVA' },
  {
    id: 'O-047',
    secao: '5.2',
    motivo: 'Redução 3: as quatro subseções e as Tabelas 6 e 7, sem dados, são substituídas por um parágrafo com todas as pendências.',
    tipo: 'substituir',
    antes: 'Esta seção será redigida após a realização da avaliação comparativa',
    depois:
      'Esta seção será redigida após a realização da avaliação comparativa descrita na Seção 3.6. Os dados de percepção dos participantes deverão ser interpretados como tais, e não como evidência de eficácia clínica ou de segurança assistencial. [PREENCHER APÓS A COLETA DOS DADOS: período e forma de aplicação, participantes convidados, que iniciaram e que concluíram a avaliação, e perfil agregado dos participantes; avaliações de cada dimensão nos Cenários A e B, com tabela, gráfico da distribuição e resultados dos procedimentos estatísticos definidos no protocolo; resultados por pergunta e por tipo de situação (resposta esperada, recusa esperada e fora do escopo), incluindo as recusas indevidas; categorias identificadas nos comentários abertos, com trechos representativos anonimizados.]'
  },
  { id: 'O-048', secao: '5.2', motivo: 'Redução 3.', tipo: 'remover', titulo: true, antes: '5.3.1 Execução da avaliação e participantes' },
  { id: 'O-049', secao: '5.2', motivo: 'Redução 3; pendência reunida em O-047.', tipo: 'remover', antes: '[PREENCHER APÓS A COLETA DOS DADOS: período e forma de aplicação' },
  { id: 'O-050', secao: '5.2', motivo: 'Redução 3: tabela sem dados.', tipo: 'remover_ilustracao', legenda: 'Caracterização agregada dos participantes' },
  { id: 'O-051', secao: '5.2', motivo: 'Redução 3.', tipo: 'remover', titulo: true, antes: '5.3.2 Avaliações por dimensão e cenário' },
  { id: 'O-052', secao: '5.2', motivo: 'Redução 3; pendência reunida em O-047.', tipo: 'remover', antes: '[PREENCHER APÓS A COLETA DOS DADOS: síntese das avaliações' },
  { id: 'O-053', secao: '5.2', motivo: 'Redução 3: tabela sem dados.', tipo: 'remover_ilustracao', legenda: 'Avaliações por dimensão e cenário' },
  { id: 'O-054', secao: '5.2', motivo: 'Redução 3; pendência reunida em O-047.', tipo: 'remover', antes: '[INSERIR GRÁFICO: distribuição das avaliações' },
  { id: 'O-055', secao: '5.2', motivo: 'Redução 3.', tipo: 'remover', titulo: true, antes: '5.3.3 Análise por pergunta e por tipo de situação' },
  { id: 'O-056', secao: '5.2', motivo: 'Redução 3; pendência reunida em O-047.', tipo: 'remover', antes: '[ANALISAR APÓS A CONSOLIDAÇÃO DAS AVALIAÇÕES: resultados por pergunta' },
  { id: 'O-057', secao: '5.2', motivo: 'Redução 3.', tipo: 'remover', titulo: true, antes: '5.3.4 Percepções qualitativas dos participantes' },
  { id: 'O-058', secao: '5.2', motivo: 'Redução 3; pendência reunida em O-047.', tipo: 'remover', antes: '[PREENCHER APÓS A COLETA DOS DADOS: categorias identificadas' },

  { id: 'O-059', secao: '5.3', motivo: 'Renumeração.', tipo: 'substituir', titulo: true, antes: '5.4 RESULTADOS DA AVALIAÇÃO EXPERIMENTAL', depois: '5.3 RESULTADOS DA AVALIAÇÃO EXPERIMENTAL COM PERGUNTAS CURADAS' },

  // 5.4: a Discussão (antigo Capítulo 6), por comentário 6.
  { id: 'O-060', secao: '5.4', motivo: 'Comentário 6: "Vira 5.4 do capítulo anterior".', tipo: 'substituir', titulo: true, nivel: 2, antes: '6 DISCUSSÃO', depois: '5.4 DISCUSSÃO' },
  {
    id: 'O-061',
    secao: '5.4',
    motivo: 'Comentário 6: o texto deixa de ser abertura de capítulo.',
    tipo: 'substituir',
    antes: 'Este capítulo relaciona os resultados às questões de pesquisa',
    depois:
      'Esta seção relaciona os resultados às questões de pesquisa, à literatura, ao projeto de sistemas RAG em saúde e às limitações do trabalho. As partes que dependem da avaliação comparativa permanecem em aberto e indicam as questões que deverão ser examinadas após a coleta.'
  },
  { id: 'O-062', secao: '5.4.1', motivo: 'Comentário 6.', tipo: 'substituir', titulo: true, nivel: 3, antes: '6.1 QUESTÕES DE PESQUISA', depois: '5.4.1 Questões de pesquisa' },
  { id: 'O-063', secao: '5.4.2', motivo: 'Comentário 6.', tipo: 'substituir', titulo: true, nivel: 3, antes: '6.2 RELAÇÃO COM A LITERATURA', depois: '5.4.2 Relação com a literatura' },
  { id: 'O-064', secao: '5.4.3', motivo: 'Comentário 6.', tipo: 'substituir', titulo: true, nivel: 3, antes: '6.3 IMPLICAÇÕES PARA O PROJETO', depois: '5.4.3 Implicações para o projeto de sistemas RAG em saúde' },
  { id: 'O-065', secao: '5.4.4', motivo: 'Comentário 6.', tipo: 'substituir', titulo: true, nivel: 3, antes: '6.4 LIMITAÇÕES', depois: '5.4.4 Limitações' },
  { id: 'O-066', secao: '5.4.5', motivo: 'Comentário 6.', tipo: 'substituir', titulo: true, nivel: 3, antes: '6.5 DISCUSSÃO DA AVALIAÇÃO EXPERIMENTAL', depois: '5.4.5 Discussão da avaliação experimental e ameaças à validade' },
  { id: 'O-067', secao: '6', motivo: 'Renumeração.', tipo: 'substituir', titulo: true, antes: '7 CONSIDERAÇÕES FINAIS', depois: '6 CONSIDERAÇÕES FINAIS' },

  // -------------------------------------------------------------------------
  // Referências (comentário 1): autoria BRASIL. Ministério da Saúde, na ordem alfabética das entradas
  // de BRASIL; as duas obras de 2022 recebem as letras a e b.
  {
    id: 'O-068',
    secao: 'Referências',
    motivo: 'Comentário 1: duas obras de Brasil em 2022.',
    tipo: 'substituir',
    antes: 'BRASIL. Conselho Nacional de Saúde. Comissão Nacional de Ética em Pesquisa. Ofício Circular',
    depois:
      'BRASIL. Conselho Nacional de Saúde. Comissão Nacional de Ética em Pesquisa. **Ofício Circular nº 17/2022/CONEP/SECNS/MS**. Orientações acerca do artigo 1º da Resolução CNS nº 510, de 7 de abril de 2016. Brasília, DF: CONEP, 2022a.'
  },
  {
    id: 'O-069',
    secao: 'Referências',
    motivo: 'Comentário 1.',
    tipo: 'substituir',
    antes: 'MINISTÉRIO DA SAÚDE. Protocolo Clínico e Diretrizes Terapêuticas',
    depois:
      'BRASIL. Ministério da Saúde. **Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase**. Brasília: Ministério da Saúde, 2022b. 152 p. ISBN 978-65-5993-397-6. Disponível em: https://bvsms.saude.gov.br/bvs/publicacoes/protocolo_clinico_diretrizes_terapeuticas_hanseniase.pdf. Acesso em: 20 out. 2026.'
  },
  {
    id: 'O-070',
    secao: 'Referências',
    motivo: 'Comentário 1.',
    tipo: 'substituir',
    antes: 'MINISTÉRIO DA SAÚDE. Secretaria de Vigilância em Saúde e Ambiente. Boletim',
    depois:
      'BRASIL. Ministério da Saúde. Secretaria de Vigilância em Saúde e Ambiente. **Boletim Epidemiológico**: hanseníase 2026, número especial. Brasília: Ministério da Saúde, jan. 2026. Disponível em: https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/boletins/epidemiologicos/especiais/2026/boletim-epidemiologico-de-hanseniase-numero-especial-jan-2026.pdf. Acesso em: 20 out. 2026.'
  },
  {
    id: 'O-071',
    secao: 'Referências',
    motivo: 'Comentário 1.',
    tipo: 'substituir',
    antes: 'MINISTÉRIO DA SAÚDE. Secretaria de Vigilância em Saúde e Ambiente. Departamento',
    depois:
      'BRASIL. Ministério da Saúde. Secretaria de Vigilância em Saúde e Ambiente. Departamento de Doenças Transmissíveis. **Estratégia Nacional para Enfrentamento à Hanseníase 2024-2030**. Brasília: Ministério da Saúde, 2024. ISBN 978-65-5993-565-9. Disponível em: https://bvsms.saude.gov.br/bvs/publicacoes/estrategia_nacional_enfrentamento_hansen%C3%ADase_2024-2030.pdf. Acesso em: 23 out. 2026.'
  },
  { id: 'O-072', secao: 'Referências', motivo: 'Ordem alfabética: depois das demais entradas de BRASIL.', tipo: 'mover', antes: 'BRASIL. Ministério da Saúde. Protocolo', depoisDe: 'BRASIL. Lei nº 13.709' },
  { id: 'O-073', secao: 'Referências', motivo: 'Ordem alfabética.', tipo: 'mover', antes: 'BRASIL. Ministério da Saúde. Secretaria de Vigilância em Saúde e Ambiente. Boletim', depoisDe: 'BRASIL. Ministério da Saúde. Protocolo' },
  { id: 'O-074', secao: 'Referências', motivo: 'Ordem alfabética.', tipo: 'mover', antes: 'BRASIL. Ministério da Saúde. Secretaria de Vigilância em Saúde e Ambiente. Departamento', depoisDe: 'BRASIL. Ministério da Saúde. Secretaria de Vigilância em Saúde e Ambiente. Boletim' },

  // -------------------------------------------------------------------------
  // Apêndices
  {
    id: 'O-075',
    secao: 'Apêndice D',
    motivo: 'Redução 5: recebe a análise detalhada da execução preliminar, retirada da Seção 5.1.1.',
    tipo: 'inserir_depois',
    antes: 'Fonte: Elaboração própria (2026), a partir da reprodução das partes determinísticas do sistema.',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'Na mesma sessão da execução preliminar, o explorador de recuperação posicionava o trecho esperado em primeiro lugar para a pergunta sobre baciloscopia, com pontuação final próxima de 0,25 antes da reordenação, o que sugeria um problema na relação entre a escala das pontuações e o limiar, e não no ranqueamento. A reprodução confirmou essa hipótese: três das 25 perguntas eram recusadas por regras específicas a partir do próprio texto (reação grave, gestação e prescrição), independentemente da recuperação, e a similaridade vetorial entre cada pergunta e seu trecho ideal variou de 0,000 a 0,428, com mediana de 0,227, embora o trecho ideal tenha sido o mais similar à pergunta em 16 das 25 perguntas. A Tabela 2 agrupa a pontuação textual mínima do Quadro 15 nas 22 perguntas que dependem da regra de evidência.'
      },
      TABELA_PONTUACAO,
      {
        tipo: 'paragrafo',
        texto:
          'Como a pontuação textual é limitada a 1, em 13 das 22 perguntas o limiar não poderia ser atingido pelo trecho ideal nem com a máxima correspondência textual, e nas demais exigiria que o trecho contivesse todos os termos significativos da pergunta, condição imposta pela função `plainto_tsquery`.'
      }
    ]
  },
  { id: 'O-076', secao: 'Apêndice E', motivo: 'Redução 1: o apêndice passa a reunir todo o protocolo previsto da avaliação comparativa.', tipo: 'substituir', titulo: true, antes: 'APÊNDICE E – ESTRUTURA PREVISTA', depois: 'APÊNDICE E – PROTOCOLO PREVISTO DA AVALIAÇÃO COMPARATIVA' },
  {
    id: 'O-077',
    secao: 'Apêndice E',
    motivo: 'Redução 1.',
    tipo: 'substituir',
    antes: 'Este apêndice apresenta a estrutura prevista para o instrumento',
    depois:
      'Este apêndice reúne os elementos previstos para a avaliação comparativa descrita na Seção 3.6: as decisões de desenho que precisam ser tomadas antes da coleta, os parâmetros a registrar para cada cenário, as dimensões candidatas e a estrutura do instrumento. Seu conteúdo definitivo depende do protocolo e deverá ser aprovado pelo orientador e, se aplicável, pelo CEP antes de qualquer coleta.'
  },
  {
    id: 'O-078',
    secao: 'Apêndice E',
    motivo: 'Redução 1: conteúdo retirado da Seção 3.6, sem alteração.',
    tipo: 'inserir_depois',
    antes: 'Este apêndice reúne os elementos previstos para a avaliação comparativa',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'Para que a comparação seja interpretável, a diferença entre os cenários deve residir, tanto quanto possível, no uso da recuperação e dos mecanismos associados, e não em fatores alheios ao objeto do estudo. Para isso, os seguintes elementos precisam ser definidos antes da coleta:'
      },
      {
        tipo: 'alineas',
        itens: [
          'mecanismo do Cenário B: a tela de comparação atual produz a resposta sem RAG por uma simulação no navegador, sem consultar nenhum modelo de linguagem (Seção 4.7); essa simulação não pode ser usada como Cenário B e deverá ser substituída por chamadas reais a um modelo de linguagem, com registro das configurações;',
          'modelo do Cenário B: o mesmo modelo gerador do Cenário A, sem recuperação, isola o efeito da recuperação e da camada de segurança, enquanto um assistente de propósito geral aproxima a comparação do uso cotidiano dessas ferramentas, com menor controle sobre as diferenças entre os cenários;',
          'instruções ao modelo do Cenário B: conteúdo do *prompt*, idioma, extensão esperada das respostas e eventual menção ao perfil de profissional de saúde;',
          'apresentação das respostas: fontes e nota de segurança podem revelar o Cenário A ao participante, mas a indicação de fontes é parte do que se pretende avaliar, o que exige decidir entre um formato neutro e o formato de cada sistema;',
          'cegamento, ordem e desenho: se os participantes saberão qual cenário produziu cada resposta; como será definida a ordem de exposição, por exemplo por alternância ou sorteio; e se cada participante avaliará respostas dos dois cenários para as mesmas perguntas ou se cada cenário será avaliado por grupos distintos;',
          'correções prévias no Cenário A: os acionamentos indevidos das regras de segurança e da classificação de intenção identificados na avaliação preliminar foram corrigidos (Seção 4.9) e são verificados pelas perguntas de regressão do conjunto de referência; outras falhas observadas antes da coleta deverão ser corrigidas ou controladas na seleção das perguntas.'
        ]
      },
      {
        tipo: 'paragrafo',
        texto:
          '[PREENCHER APÓS A DEFINIÇÃO DO PROTOCOLO: decisões adotadas para cada item acima, com justificativa.] O Quadro 6 apresenta os parâmetros que deverão ser registrados para cada cenário, de modo a permitir a reprodução das condições.'
      },
      QUADRO_PARAMETROS,
      { tipo: 'paragrafo', texto: 'As dimensões candidatas para o instrumento, derivadas da literatura discutida na Seção 2.6, estão no Quadro 7.' },
      QUADRO_DIMENSOES,
      { tipo: 'paragrafo', texto: 'A estrutura prevista do instrumento compreende os seguintes elementos:' }
    ]
  },
  {
    id: 'O-079',
    secao: 'Apêndice L',
    motivo: 'Redução 4: recebe o Quadro 10, retirado da Seção 4.8.',
    tipo: 'inserir_no_fim',
    blocos: [
      { tipo: 'titulo1', texto: 'APÊNDICE L – TESTES AUTOMATIZADOS DO SISTEMA', apendice: true },
      { tipo: 'paragrafo', texto: 'O Quadro 10 apresenta os testes automatizados do servidor e da interface, agrupados por camada e pelos comportamentos verificados (Seção 4.8).' },
      QUADRO_TESTES
    ]
  }
];
