// Revisão final a partir da versão comentada pelo Prof. Dr. Élisson da Silva Rocha em 19/11/2026
// (Google Docs, "TCC - Versão 16-11-2026"), aplicada por avaliacao/tcc/aplicar_revisao.ts depois de
// todas as revisões anteriores. Reúne:
// - os comentários do orientador: retirar a avaliação comparativa (que passa a limitação e trabalho
//   futuro), retirar tudo o que remete à análise por especialista, ajustar as questões de pesquisa,
//   refazer a Figura 1 sem a situação das etapas, levar a notas de rodapé os endereços oficiais das
//   ferramentas, retirar as marcações em amarelo e usar Times New Roman;
// - as exclusões que ele fez com controle de alterações (Seções 3.7, 3.8.4 em parte, 4.9, 5.2 e 5.4.2,
//   Quadro 2 e parágrafos das Considerações Finais, que passam a "Conclusão") e as edições diretas no
//   documento (datas retiradas, "desenvolvedor" por "autor", folha de rosto e epígrafe);
// - as regras de formatação recebidas em 18/11/2026: maiúsculas só nos títulos principais (os títulos
//   secundários e terciários continuam em negrito, por decisão do autor);
// - uma revisão para retirar repetições, pedida pelo orientador.
//
// Numeração nova das seções: 3.6 (antiga 3.8) e 3.6.1–3.6.4; 5.2 (antiga 5.3); 5.3 (antiga 5.4), com
// 5.3.1 Questões de pesquisa, 5.3.2 Implicações, 5.3.3 Limitações e 5.3.4 Discussão da avaliação
// experimental. Apêndices: E (antigo F), F (G), G (H), H (I), I (K) e J (L); os antigos E e J saem.
// Como os `ajustes` são aplicados antes das edições, o texto novo já usa essa numeração e as letras
// novas dos apêndices; as remissões a quadros, figuras e tabelas seguem a numeração anterior, que o
// aplicador renumera.
// Marcação: *itálico*, **negrito**, `código`, {{nota de rodapé}}.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Ajustes, Edicao } from '../avaliacao/tcc/aplicar_revisao';
import { calcularPorResposta, carregarDados, EXCLUIDA_DAS_MEDIAS } from '../avaliacao/metricas';

const RAIZ = path.resolve(__dirname, '..');

/** Nota de rodapé com o endereço oficial de uma ferramenta (comentário do orientador). */
const url = (endereco: string) => `{{Disponível em: ${endereco}.}}`;

export const ajustes: Ajustes = {
  remissoesSecoes: {
    '3.6': null,
    '3.6.1': null,
    '3.6.2': null,
    '3.6.3': null,
    '3.7': null,
    '3.8': '3.6',
    '3.8.1': '3.6.1',
    '3.8.2': '3.6.2',
    '3.8.3': '3.6.3',
    '3.8.4': '3.6.4',
    '4.9': null,
    '5.2': null,
    '5.3': '5.2',
    '5.4': '5.3',
    '5.4.1': '5.3.1',
    '5.4.2': null,
    '5.4.3': '5.3.2',
    '5.4.4': '5.3.3',
    '5.4.5': '5.3.4'
  },
  trocas: [
    // Edições diretas do orientador: o trabalho é do autor, e não "do desenvolvedor".
    { de: 'pelo próprio desenvolvedor', para: 'pelo próprio autor' },
    { de: 'pelo desenvolvedor', para: 'pelo autor' },
    // Sem o Ofício da CONEP (citado só na avaliação comparativa), o PCDT é a única obra de Brasil em 2022.
    { de: '2022b', para: '2022' },
    // Apêndices renomeados com a saída dos antigos E e J, em ordem crescente para não encadear trocas.
    { de: 'Apêndice F', para: 'Apêndice E' },
    { de: 'APÊNDICE F', para: 'APÊNDICE E' },
    { de: 'Apêndice G', para: 'Apêndice F' },
    { de: 'APÊNDICE G', para: 'APÊNDICE F' },
    { de: 'Apêndice H', para: 'Apêndice G' },
    { de: 'APÊNDICE H', para: 'APÊNDICE G' },
    { de: 'Apêndice I', para: 'Apêndice H' },
    { de: 'APÊNDICE I', para: 'APÊNDICE H' },
    { de: 'Apêndice K', para: 'Apêndice I' },
    { de: 'APÊNDICE K', para: 'APÊNDICE I' },
    { de: 'Apêndice L', para: 'Apêndice J' },
    { de: 'APÊNDICE L', para: 'APÊNDICE J' },
    // Legendas: a Figura 1 deixa de mostrar a situação das etapas, e a rubrica deixa de ter "validações".
    { de: 'Etapas da pesquisa e situação de cada uma', para: 'Etapas da pesquisa' },
    { de: 'Rubrica das validações 1 e 2', para: 'Rubrica da avaliação das respostas' },
    // Fontes e textos com datas e com a indicação de resultados preliminares.
    { de: ' Resultados preliminares (validações 1 e 2).', para: '' },
    { de: 'com resposta gerada pelo sistema em 24 de outubro de 2026.', para: 'com resposta gerada pelo sistema.' },
    { de: ', a partir dos relatórios de avaliação de 23 e 24 de outubro de 2026.', para: '.' },
    { de: ', a partir dos relatórios de avaliação de 24 de outubro de 2026.', para: ', a partir dos relatórios de avaliação do projeto.' },
    { de: 'a partir do registro da execução de 14 de setembro de 2026.', para: 'a partir do registro da execução preliminar.' },
    { de: 'executada em 20 de outubro de 2026 com o código compilado', para: 'executada com o código compilado' },
    { de: 'sem raciocínio, em 24 de outubro de 2026 (Seção 5.1)', para: 'sem raciocínio (Seção 5.1)' },
    // Trabalho final, e não uma etapa.
    { de: 'contribuição desta etapa', para: 'contribuição deste trabalho' }
  ],
  // Comentário do orientador: os TCCs do curso usam Times New Roman 12 no texto.
  fonte: { de: 'Arial', para: 'Times New Roman' },
  // Maiúsculas só nos títulos principais; os títulos secundários e terciários ficam em negrito, como os
  // principais (decisão do autor, 19/11/2026), também no sumário. O terciário já é negritado pelo estilo.
  negrito: ['Ttulo2', 'Sumrio2']
};

// ---------------------------------------------------------------------------
// Quadro do Apêndice I (antigo K), sem a coluna da validação por especialista.
const { perguntas } = JSON.parse(readFileSync(path.join(RAIZ, 'avaliacao', 'perguntas.json'), 'utf8'));
const porResposta = calcularPorResposta(carregarDados(), []);
const n2 = (x: number) => x.toFixed(2).replace('.', ',');
const execucao = (id: string, rodada: number) => {
  const l = porResposta.find((x: any) => x.id_execucao === `R${rodada}-${id}`)!;
  const sinais = [l.SEG >= 1 && 'alerta', l.ALU && 'alucinação'].filter(Boolean);
  return `${l.correta_automatizada ? 'Correta' : 'Incorreta'} (${n2(l.NG)})${sinais.length ? `; ${sinais.join(', ')}` : ''}`;
};

const subst = (id: string, secao: string, motivo: string, antes: string, depois: string, extra: Partial<Extract<Edicao, { tipo: 'substituir' }>> = {}): Edicao => ({
  id,
  secao,
  motivo,
  tipo: 'substituir',
  antes,
  depois,
  ...extra
});
const remover = (id: string, secao: string, motivo: string, antes: string, extra: { docxParagrafos?: number } = {}): Edicao => ({ id, secao, motivo, tipo: 'remover', antes, ...extra });
const titulo = (id: string, antes: string, depois: string): Edicao => ({
  id,
  secao: 'Títulos',
  motivo: 'Regra de formatação: só os títulos principais ficam em maiúsculas; seções renumeradas.',
  tipo: 'substituir',
  titulo: true,
  antes,
  depois
});

export const edicoes: Edicao[] = [
  // -------------------------------------------------------------------------
  // Elementos pré-textuais
  remover('F-001', 'Folha de rosto', 'Não há coorientador; o autor retirou o campo no Google Docs.', 'Coorientador(a): [PREENCHER OU REMOVER'),
  remover('F-002', 'Folha de aprovação', 'Sem coorientador: saem o nome, a função e uma linha de assinatura.', '[PREENCHER: nome do(a) coorientador(a), se houver]', { docxParagrafos: 3 }),
  subst('F-003', 'Folha de aprovação', 'Retirar as marcações em amarelo (orientador); nome do avaliador em branco, para preenchimento.', '[PREENCHER: nome do(a) primeiro(a) avaliador(a)]', '**Prof.(a) _______________________________**', {
    md: { antes: '[PREENCHER: nome do(a) primeiro(a) avaliador(a)] — Convidado(a) 1', depois: 'Prof.(a) _______________________________ — Convidado(a) 1' }
  }),
  subst('F-004', 'Folha de aprovação', 'Idem.', '[PREENCHER: nome do(a) segundo(a) avaliador(a)]', '**Prof.(a) _______________________________**', {
    md: { antes: '[PREENCHER: nome do(a) segundo(a) avaliador(a)] — Convidado(a) 2', depois: 'Prof.(a) _______________________________ — Convidado(a) 2' }
  }),
  remover('F-005', 'Dedicatória', 'O autor retirou a dedicatória, elemento opcional, no Google Docs.', '[REESCREVER PELO AUTOR: a dedicatória do rascunho'),
  // O parágrafo da marcação abre a página da epígrafe e a posiciona; fica vazio.
  subst('F-006', 'Epígrafe', 'O autor manteve a epígrafe e retirou a marcação.', '[OPCIONAL: a epígrafe do rascunho', ''),
  subst('F-007', 'Ficha catalográfica', 'Retirar as marcações em amarelo; a ficha será inserida quando a biblioteca a enviar.', 'Após o recebimento da ficha catalográfica', ''),
  subst(
    'F-008',
    'Resumo',
    'Sem a avaliação comparativa nem a revisão por especialista; resultados apresentados como finais.',
    'A hanseníase permanece como problema de saúde pública no Brasil,',
    'A hanseníase permanece como problema de saúde pública no Brasil, segundo país em número de casos novos da doença no mundo, com proporção crescente de casos multibacilares e de diagnósticos realizados com incapacidade física já instalada. Na atenção primária à saúde, a consulta a orientações técnicas durante o atendimento é uma necessidade recorrente, e os modelos de linguagem de grande escala podem localizar e sintetizar informação clínica, mas estão sujeitos a alucinações e não indicam a origem do que afirmam. Este trabalho apresenta o desenvolvimento e a avaliação do NexoHansen, um sistema de apoio informacional à decisão clínica em hanseníase baseado em Geração Aumentada por Recuperação (RAG). A pesquisa, de natureza aplicada, seguiu a metodologia de pesquisa em ciência do *design*. O sistema combina a interpretação da pergunta no contexto da conversa, busca híbrida vetorial e textual com fusão por posição recíproca, regras explícitas de segurança aplicadas antes da geração, respostas restritas aos trechos recuperados, com citações verificadas e referências às páginas dos documentos de origem, e registro das consultas para auditoria, sobre uma base de cinco documentos oficiais do Ministério da Saúde e da Organização Mundial da Saúde, processados em 328 trechos. Uma avaliação técnica preliminar resultou na recusa de todas as perguntas, porque o limiar de relevância era incompatível com a escala de pontuação do provedor de *embeddings*, e motivou a reformulação da recuperação e das regras de segurança. Na nova avaliação, com 32 perguntas de referência, o sistema apresentou o comportamento esperado em todas as perguntas e recuperou a evidência em todas as que a possuem, e a comparação de seis configurações de modelo gerador levou à escolha do `gpt-6-luna`, de desempenho equivalente ao do modelo usado anteriormente e custo 41% menor. Uma avaliação experimental com 50 perguntas curadas a partir de dúvidas publicadas, respondidas duas vezes e avaliadas de forma automatizada por um modelo de linguagem segundo rubrica fixa, indicou acurácia de 65,3%, nenhuma resposta com erro classificado como de potencial dano, reconhecimento da limitação em todas as perguntas não cobertas pelos documentos e desempenho inferior nas perguntas sobre tratamento. Os resultados indicam que tratar a rastreabilidade e a segurança como requisitos de arquitetura viabiliza respostas fundamentadas e verificáveis, mas não autorizam o uso assistencial do sistema, que não foi validado clinicamente.'
  ),
  subst(
    'F-009',
    'Abstract',
    'Tradução do resumo revisado.',
    'Leprosy remains a public health problem in Brazil,',
    'Leprosy remains a public health problem in Brazil, the country with the second highest number of new cases in the world, with a growing proportion of multibacillary cases and of diagnoses made after physical disability has already developed. In primary health care, consulting technical guidance during consultations is a recurring need, and large language models can locate and summarize clinical information, but they are prone to hallucinations and do not indicate the origin of their statements. This work presents the development and evaluation of NexoHansen, an informational clinical decision support system for leprosy based on Retrieval-Augmented Generation (RAG). The research is applied in nature and followed the design science research methodology. The system combines question interpretation in the context of the conversation, hybrid vector and full-text search with reciprocal rank fusion, explicit safety rules applied before generation, answers restricted to the retrieved passages, with verified citations and references to the pages of the source documents, and query logging for auditing, over a base of five official documents from the Brazilian Ministry of Health and the World Health Organization, processed into 328 passages. A preliminary technical evaluation resulted in the refusal of all questions, because the relevance threshold was incompatible with the score scale of the embedding provider, and led to the redesign of retrieval and of the safety rules. In the new evaluation, with 32 reference questions, the system showed the expected behavior for all questions and retrieved the evidence for all questions that have it, and the comparison of six generator model configurations led to the choice of `gpt-6-luna`, with performance equivalent to that of the previously used model at a 41% lower cost. An experimental evaluation with 50 curated questions, mostly derived from published questions about the disease, answered twice and assessed automatically by a language model following a fixed rubric, indicated an accuracy of 65.3%, no answer with an error classified as potentially harmful, recognition of the limitation in all questions not covered by the documents, and lower performance on treatment questions. The results indicate that treating traceability and safety as architectural requirements enables grounded and verifiable answers, but they do not authorize the clinical use of the system, which has not been clinically validated.'
  ),
  { id: 'F-010', secao: 'Lista de siglas', motivo: 'Siglas usadas apenas na avaliação comparativa, retirada.', tipo: 'remover_linha', antes: 'CEP' },
  { id: 'F-011', secao: 'Lista de siglas', motivo: 'Idem.', tipo: 'remover_linha', antes: 'CNS' },
  { id: 'F-012', secao: 'Lista de siglas', motivo: 'Idem.', tipo: 'remover_linha', antes: 'CONEP' },
  { id: 'F-013', secao: 'Lista de siglas', motivo: 'Idem.', tipo: 'remover_linha', antes: 'TCLE' },

  // -------------------------------------------------------------------------
  // Capítulo 1
  subst(
    'F-020',
    '1',
    'Sem a comparação com participantes; o aviso sobre uso clínico fica só na Justificativa.',
    'Este trabalho desenvolve o NexoHansen,',
    'Este trabalho desenvolve o NexoHansen, um sistema de apoio informacional à decisão clínica em hanseníase baseado em RAG. O sistema recupera trechos de uma base de conhecimento curada, redige respostas restritas a esses trechos com indicação das fontes, recusa situações que exigem avaliação presencial, como pedidos de diagnóstico definitivo ou de prescrição, e registra cada consulta para auditoria. Nesta pesquisa, ele é o artefato por meio do qual se investiga como uma arquitetura RAG pode ser projetada para esse domínio e qual a qualidade das respostas que ela produz.'
  ),
  subst(
    'F-021',
    '1',
    'Comentário do orientador: ajustar as questões de pesquisa à retirada da avaliação comparativa.',
    'A pesquisa é orientada pela seguinte questão:',
    'A pesquisa é orientada pela seguinte questão: como um sistema baseado em Geração Aumentada por Recuperação, com base de conhecimento curada, indicação de fontes e regras explícitas de segurança, pode ser projetado para o apoio informacional em hanseníase, e com que qualidade ele responde a perguntas sobre a doença? Para tratá-la, a questão foi desdobrada em três questões específicas:'
  ),
  subst(
    'F-022',
    '1',
    'Idem.',
    'c) QP3: como participantes avaliam',
    'c) QP3: em que medida as respostas geradas pelo sistema são corretas, completas e fundamentadas nos documentos oficiais, diante de perguntas curadas a partir de dúvidas publicadas sobre a doença?'
  ),
  subst(
    'F-023',
    '1',
    'Idem.',
    'As questões QP1 e QP2 são tratadas pelo desenvolvimento',
    'As questões QP1 e QP2 são tratadas pelo desenvolvimento e pela avaliação técnica do sistema (Seções 3.5 e 5.1), e a QP3, pela avaliação experimental com 50 perguntas curadas (Seções 3.6 e 5.2).'
  ),
  subst(
    'F-024',
    '1.1.1',
    'Objetivo geral sem a comparação com um modelo sem recuperação.',
    'Desenvolver um sistema de apoio informacional à decisão clínica em hanseníase baseado na arquitetura RAG, capaz',
    'Desenvolver um sistema de apoio informacional à decisão clínica em hanseníase baseado na arquitetura RAG, capaz de produzir respostas fundamentadas em uma base de conhecimento curada, com indicação das fontes e aplicação de regras explícitas de segurança, e avaliar tecnicamente a recuperação e a qualidade dessas respostas.'
  ),
  subst(
    'F-025',
    '1.1.2',
    'A avaliação comparativa sai do trabalho; o objetivo passa a ser a avaliação experimental realizada.',
    'e) planejar e conduzir uma avaliação comparativa',
    'e) avaliar a correção, a completude e a fundamentação das respostas com um conjunto de perguntas curadas a partir de dúvidas publicadas sobre a doença;'
  ),
  subst('F-0255', '1.1.2', '"web" em itálico (comentário anterior do orientador sobre termos estrangeiros).', 'c) desenvolver uma interface web', 'c) desenvolver uma interface *web* para consulta ao sistema e para inspeção da recuperação, da base de conhecimento e da avaliação técnica;'),
  remover('F-026', '1.1.2', 'O Quadro 2 foi retirado pelo orientador.', 'O Quadro 2, no Capítulo 3, relaciona'),
  subst(
    'F-027',
    '1.2',
    'Sem a comparação com participantes.',
    'Do ponto de vista acadêmico, um estudo que documente',
    'Do ponto de vista acadêmico, um estudo que documente o projeto de um sistema RAG para uma DTN, em português, e que avalie a correção de suas respostas contribui para reduzir as lacunas discutidas na Seção 2.7: o foco da IA aplicada à hanseníase em triagem e diagnóstico, o predomínio do inglês e a atenção insuficiente à segurança nas pesquisas sobre RAG em saúde. Para a Engenharia de Software, o trabalho oferece um caso concreto de projeto de sistema baseado em modelos de linguagem em domínio sensível, no qual requisitos de rastreabilidade, segurança e testabilidade orientam a arquitetura.'
  ),
  subst(
    'F-028',
    '1.2',
    'Sem a percepção de participantes.',
    'Cabe distinguir a relevância potencial',
    'Cabe distinguir a relevância potencial da proposta das conclusões que ela pode sustentar. O sistema é um protótipo acadêmico, sem validação clínica, e suas avaliações medem o desempenho em conjuntos delimitados de perguntas; não podem ser interpretadas como evidência de eficácia clínica, de segurança assistencial ou de superioridade em relação ao julgamento profissional.'
  ),
  subst(
    'F-029',
    '1.3',
    'Estrutura final do trabalho.',
    'Além desta introdução, o trabalho tem cinco capítulos.',
    'Além desta introdução, o trabalho tem cinco capítulos. O Capítulo 2 apresenta o referencial teórico; o Capítulo 3, a metodologia, com a avaliação técnica e a avaliação experimental com perguntas curadas; o Capítulo 4, o sistema desenvolvido, primeiro resultado da pesquisa; o Capítulo 5, os resultados das avaliações e sua discussão, com as limitações; e o Capítulo 6, a conclusão. Os apêndices reúnem os conjuntos de perguntas, os resultados por pergunta e os instrumentos das avaliações.'
  ),

  // -------------------------------------------------------------------------
  // Capítulo 2
  subst(
    'F-030',
    '2',
    'Repetição: a abertura enumerava as seções, já listadas no sumário.',
    'Este capítulo reúne os conceitos de que dependem',
    'Este capítulo reúne os conceitos de que dependem o problema, o projeto do sistema e sua avaliação: a hanseníase e as decisões clínicas que exigem a consulta a orientações técnicas, os sistemas de apoio à decisão clínica e os modelos de linguagem, a recuperação de informação e a RAG, os métodos de avaliação e os trabalhos com os quais esta pesquisa se compara.'
  ),
  subst(
    'F-031',
    '2.1.2',
    'Sem a avaliação com participantes.',
    'Essas decisões dependem de orientações distribuídas',
    'Essas decisões dependem de orientações distribuídas ao longo de um protocolo de 152 páginas e de documentos da OMS que nem sempre coincidem com ele. Este trabalho parte da premissa, não medida nesta pesquisa, de que localizar a orientação pertinente a uma dúvida específica, e identificar o documento de onde ela provém, é uma necessidade de informação das equipes da APS.'
  ),
  subst(
    'F-032',
    '2.4.2',
    'A Seção 5.4.2 foi retirada pelo orientador; a discussão do idioma passa à Seção 5.3.1.',
    'A qualidade da recuperação densa depende do modelo',
    'A qualidade da recuperação densa depende do modelo de *embedding*. Há modelos especializados em textos biomédicos, como o BioBERT, pré-treinado em textos científicos da área e utilizável como base de codificadores de recuperação (Lee *et al.*, 2020), e modelos de propósito geral oferecidos como serviço, como o `text-embedding-3-small`, que produz vetores de 1.536 dimensões (OpenAI, 2024). O idioma também pesa: Yang *et al.* (2026) observam que as ferramentas de recuperação do RAG médico se apoiam sobretudo em modelos centrados no inglês, e Arzideh *et al.* (2026), ao ajustar um modelo multilíngue com documentos clínicos de um hospital alemão, relatam ganho na recuperação em relação ao modelo de partida. Este trabalho adotou um modelo de propósito geral, sem ajuste, com documentos e perguntas em português; o efeito dessa escolha é discutido na Seção 5.3.1.'
  ),
  subst(
    'F-033',
    '2.4.3',
    'A Seção 4.9 foi retirada pelo orientador.',
    'A reordenação (reranking) reavalia',
    'A reordenação (*reranking*) reavalia um conjunto menor de candidatos com critérios mais informativos que os da recuperação inicial, por modelos que estimam a relevância de pares pergunta-trecho, como os baseados em BERT (Nogueira; Cho, 2019), ou por regras do domínio. A versão atual do sistema não a utiliza: a reordenação por regras da primeira versão foi substituída pela RRF (Seção 4.5.3).'
  ),
  subst(
    'F-034',
    '2.7.2',
    'Repetição: as escolhas de projeto que respondem às revisões são apresentadas na Seção 2.8.',
    'As duas revisões mais abrangentes encontradas convergem',
    'As duas revisões mais abrangentes encontradas convergem em três pontos. Amugongo *et al.* (2025) analisaram 70 estudos publicados entre 2020 e 2025 e verificaram que 78,9% usaram conjuntos de dados em inglês, que faltam *frameworks* padronizados de avaliação e que a maioria dos estudos não examina considerações éticas. Yang *et al.* (2026) registram o predomínio de dados públicos e de modelos de *embedding* centrados no inglês, além de avaliações humanas concentradas em acurácia, completude, relevância e fluência, e concluem que a RAG em medicina está em estágio inicial, com necessidade de validação clínica, de adaptação a outros idiomas e de atenção a contextos com poucos recursos.'
  ),
  subst(
    'F-035',
    '2.6',
    'Duas avaliações, sem a comparativa e sem a revisão por especialista.',
    'Essas considerações orientam as três avaliações',
    'Essas considerações orientam as duas avaliações deste trabalho: a avaliação técnica, que mede a recuperação com julgamentos de relevância definidos pelo autor (Seção 3.5), e a avaliação experimental com perguntas curadas, em que um modelo de linguagem atua como avaliador segundo rubrica fixa (Seção 3.6).'
  ),
  subst(
    'F-036',
    '2.8',
    'Sem a comparação planejada nem a revisão por especialista.',
    'Em relação a esses trabalhos, o presente estudo',
    'Em relação a esses trabalhos, o presente estudo diferencia-se em quatro aspectos: dirige-se ao apoio informacional em linguagem natural, e não à triagem, à classificação ou ao diagnóstico; opera em português, com documentos oficiais brasileiros e da OMS; trata a segurança como requisito de arquitetura, com regras de recusa implementadas em código, sinalização de risco e registro de cada consulta; e avalia respostas abertas, e não de múltipla escolha, com perguntas curadas a partir de dúvidas publicadas. Em comparação com Xiong *et al.* (2024) e Zakka *et al.* (2024), a base é restrita a cinco documentos, e as respostas não foram avaliadas por profissionais de saúde, limitação discutida na Seção 5.3.3.'
  ),

  // -------------------------------------------------------------------------
  // Capítulo 3
  subst(
    'F-040',
    '3',
    'Sem a avaliação comparativa e as ameaças da Seção 3.7, retiradas pelo orientador.',
    'Este capítulo descreve os procedimentos da pesquisa:',
    'Este capítulo descreve os procedimentos da pesquisa: sua caracterização e suas etapas (Seções 3.1 e 3.2), a construção da base de conhecimento e o desenvolvimento do sistema (Seções 3.3 e 3.4), a avaliação técnica do *pipeline*, que incluiu a escolha do modelo gerador (Seção 3.5), e a avaliação experimental com 50 perguntas curadas (Seção 3.6).'
  ),
  subst(
    'F-041',
    '3.1',
    'Abordagem quantitativa: a parte qualitativa dependia da validação por especialista e dos comentários de participantes, que saíram do trabalho (comentário "rever").',
    'Quanto à natureza, a pesquisa é aplicada',
    'Quanto à natureza, a pesquisa é aplicada, voltada a um problema prático: o acesso a informação técnica sobre hanseníase com indicação de fontes e limites de segurança. Quanto aos objetivos, é exploratória, por investigar a aplicação de RAG a um domínio ainda pouco estudado, e descritiva, por caracterizar a arquitetura construída e o comportamento do sistema diante de perguntas sobre a doença. Quanto à abordagem, é quantitativa: os resultados são expressos pelas métricas das avaliações técnica e experimental, e a leitura das respostas serviu para identificar os tipos de erro e suas origens.'
  ),
  subst(
    'F-042',
    '3.1',
    'Edição do orientador: retirada a frase sobre a avaliação comparativa.',
    'Quanto aos procedimentos, a pesquisa adota',
    'Quanto aos procedimentos, a pesquisa adota a pesquisa em ciência do *design* (*design science research*), abordagem voltada à criação e à avaliação de artefatos que resolvam problemas relevantes (Hevner *et al.*, 2004). Utiliza-se como referência o processo proposto por Peffers *et al.* (2007), composto por seis atividades: identificação do problema e motivação, definição dos objetivos da solução, projeto e desenvolvimento, demonstração, avaliação e comunicação.'
  ),
  subst(
    'F-043',
    '3.2',
    'Comentário do orientador: trabalho final, sem a situação das etapas.',
    'A Figura 1 apresenta as etapas da pesquisa',
    'A Figura 1 apresenta as etapas da pesquisa, adaptadas do processo de Peffers *et al.* (2007).'
  ),
  { id: 'F-044', secao: '3.2', motivo: 'Figura 1 refeita sem a situação de cada etapa (comentário do orientador).', tipo: 'substituir_imagem', legenda: 'Etapas da pesquisa', arquivo: path.join(RAIZ, 'TCC', 'figuras', 'fig-etapas.png') },
  subst(
    'F-045',
    '3.2',
    'Sem a avaliação comparativa e sem a Seção 4.9.',
    'As etapas 1 e 2 correspondem ao levantamento',
    'As etapas 1 e 2 correspondem ao levantamento do problema (Capítulos 1 e 2) e à sua conversão em requisitos (Seção 4.1); a etapa 3, à construção da base de conhecimento, primeiro como um conjunto inicial de desenvolvimento e depois a partir de documentos oficiais, e à implementação do sistema (Seções 3.3 e 3.4); a etapa 4, à demonstração por meio da interface *web*; a etapa 5, às avaliações descritas nas Seções 3.5 e 3.6; e a etapa 6, a esta monografia. Como prevê o processo de Peffers *et al.* (2007), a avaliação motivou retornos às etapas anteriores: a avaliação técnica preliminar levou à construção da base a partir de documentos oficiais, à reformulação da recuperação e à correção das regras de segurança (Seção 5.1.1), seguidas de nova avaliação técnica, que serviu também para escolher o modelo de linguagem (Seção 5.1).'
  ),
  remover('F-046', '3.2', 'Quadro 2 retirado pelo orientador.', 'O Quadro 2 relaciona cada objetivo específico'),
  { id: 'F-047', secao: '3.2', motivo: 'Quadro 2 retirado pelo orientador.', tipo: 'remover_ilustracao', legenda: 'Correspondência entre objetivos específicos, etapas da pesquisa e seções do trabalho' },
  subst(
    'F-048',
    '3.3.1',
    'Edição do orientador: sem a data de revisão.',
    'Para viabilizar o desenvolvimento antes da curadoria definitiva',
    'Para viabilizar o desenvolvimento antes da curadoria definitiva, foi construída uma base inicial com 15 trechos, organizados em 11 documentos lógicos sobre sinais e sintomas, diagnóstico clínico e diferencial, classificação operacional, baciloscopia, tratamento, medicamentos, reações hansênicas, prevenção de incapacidades, contatos e vigilância e a política de segurança do sistema (Apêndice B). Os trechos foram redigidos diretamente no formato de linhas JSON (JSONL), com texto curto e metadados clínicos, e registram como origem “Seed técnico local para desenvolvimento e validação inicial”.'
  ),
  subst(
    'F-049',
    '3.3.1',
    'Edição do orientador.',
    'Essa base cumpriu função de engenharia',
    'Essa base foi desenvolvida para exercitar a ingestão, a recuperação, a reordenação e as regras de segurança da primeira versão com conteúdo representativo do domínio. Porém, como não foi extraída de documentos oficiais com indicação de página nem revisada por especialistas, não podia ser tomada como fonte clínica nem como evidência de cobertura do tema.'
  ),
  subst(
    'F-050',
    '3.3.2',
    'Edição no Google Docs: a base oficial foi indicada por especialista; sem a data.',
    'A base utilizada a partir de outubro de 2026',
    'A base oficial, indicada por especialista na área da hanseníase, tem o PCDT da Hanseníase (Brasil, 2022) como fonte primária. Os documentos incluídos atendem aos seguintes critérios: publicação do Ministério da Saúde ou da OMS; situação vigente na data da coleta; conteúdo técnico sobre diagnóstico, tratamento, reações hansênicas, prevenção de incapacidades, vigilância ou estratégia de enfrentamento da doença; e arquivo obtido em portal oficial ou, quando o endereço oficial estava indisponível, cópia cuja ficha catalográfica identifica a edição. Priorizaram-se versões em português, e o documento da OMS sobre reações e prevenção de incapacidades foi incluído no original, em inglês. Foram excluídos as referências bibliográficas, os apêndices metodológicos, os formulários e os anexos sem conteúdo técnico aplicável às perguntas, como portarias, tabelas de avaliação da evidência e modelos de cartão do paciente. O Quadro 3 apresenta os documentos incluídos (Brasil, 2022, 2024; Organização Mundial da Saúde, 2019, 2021; World Health Organization, 2020b).'
  ),
  subst(
    'F-051',
    '3.3.2',
    'Comentário do orientador: endereços oficiais das ferramentas em nota de rodapé.',
    'O processamento foi automatizado por scripts do projeto',
    `O processamento foi automatizado por *scripts* do projeto, a partir de um manifesto com os metadados bibliográficos, os endereços oficial e de *download*, o resumo criptográfico SHA-256 e o sumário de cada documento. Para cada documento, o processamento compreende: a) o *download* e a verificação da integridade pelo resumo SHA-256; b) a extração do texto página a página, com a ferramenta pdftotext${url('https://poppler.freedesktop.org')}, o que preserva a correspondência entre o texto e a página do PDF; c) a limpeza do texto, com a remoção de cabeçalhos e rodapés repetidos, a junção de linhas quebradas no meio das frases e, quando necessário, a remoção de números de referências colados às palavras; d) a identificação do número impresso de cada página, que difere de sua posição no arquivo; e) a localização das seções a partir do sumário do documento, transcrito para o manifesto e conferido manualmente; e f) a fragmentação por seção e a atribuição de metadados.`
  ),
  subst(
    'F-052',
    '3.3.2',
    'Edição do orientador: sem datas nem marcação.',
    'A conferência do processamento foi feita pelo',
    'A conferência do processamento foi feita pelo autor, com a revisão manual dos sumários transcritos, a inspeção dos relatórios de cada documento, que informam as páginas, as seções localizadas e não localizadas e o tamanho dos trechos, e a comparação, por amostragem, de trechos com as páginas correspondentes dos PDFs. O conteúdo dos trechos não foi revisado por profissional de saúde. A versão usada nas avaliações foi indexada no banco de dados com o modelo de *embeddings* `text-embedding-3-small`.'
  ),
  subst(
    'F-053',
    '3.4',
    'Edição do orientador (sem datas), com a concordância corrigida; a Seção 4.9 foi retirada.',
    'O desenvolvimento ocorreu de forma incremental',
    'O desenvolvimento ocorreu de forma incremental. A primeira versão implementou o servidor, com a base inicial, o *pipeline* de consulta e os testes automatizados; as seguintes acrescentaram a interface *web*, corrigiram falhas observadas na execução contra o banco de dados real e incluíram a autenticação dos usuários, o registro da avaliação das respostas, a base de documentos oficiais e a reformulação da recuperação e das regras de segurança (Seção 5.1.1). Os requisitos derivam do problema e da política de segurança clínica documentada no projeto e são apresentados na Seção 4.1.'
  ),
  subst(
    'F-054',
    '3.4',
    'Comentário do orientador: endereços oficiais das ferramentas em nota de rodapé.',
    'O servidor foi implementado em Node.js',
    `O servidor foi implementado em Node.js${url('https://nodejs.org')} com TypeScript${url('https://www.typescriptlang.org')}, com o *framework* Express${url('https://expressjs.com')} para a interface de programação de aplicações (API, do inglês *application programming interface*) HTTP, o Prisma${url('https://www.prisma.io')} como ferramenta de mapeamento objeto-relacional (ORM), o PostgreSQL${url('https://www.postgresql.org')} 16 com a extensão pgvector como banco de dados, a biblioteca Zod${url('https://zod.dev')} para a validação de dados e configurações e o Vitest${url('https://vitest.dev')} para os testes automatizados. A interface *web* foi implementada em React${url('https://react.dev')} com TypeScript, utilizando Vite${url('https://vite.dev')}, Tailwind CSS${url('https://tailwindcss.com')}, TanStack Query${url('https://tanstack.com/query')} e React Router${url('https://reactrouter.com')}. O uso de TypeScript nas duas camadas buscou manter contratos explícitos entre elas, e a escolha do PostgreSQL com pgvector buscou concentrar dados relacionais, texto indexado e vetores em um único banco de dados, sem serviço vetorial separado. A verificação combinou análise estática, verificação de tipos, compilação e testes automatizados, descritos na Seção 4.8.`
  ),
  subst(
    'F-055',
    '3.5',
    'Edição do orientador: sem datas.',
    'A avaliação técnica verifica se o mecanismo de recuperação',
    'A avaliação técnica verifica se o mecanismo de recuperação localiza, para um conjunto de perguntas de referência, os trechos que contêm a resposta (QP2) e, de forma complementar, se as respostas geradas citam esses trechos e contêm as informações esperadas. A execução preliminar usou a base inicial e um conjunto de 25 perguntas elaborado com ela (Apêndice A) e media apenas a presença de um trecho ideal entre as fontes da resposta e o número de recusas (Seção 5.1.1). Com a substituição da base, esse conjunto perdeu a referência e foi substituído pelo descrito a seguir.'
  ),
  subst(
    'F-056',
    '3.5.1',
    'Edição do orientador: sem data.',
    'O conjunto de referência atual, elaborado pelo',
    'O conjunto de referência atual, elaborado pelo autor, contém 32 perguntas distribuídas em dez categorias, apresentadas no Quadro 4 e detalhadas no Apêndice E. Cada pergunta registra o comportamento esperado, que pode ser responder com base nos documentos, recusar por uma regra de segurança, com o motivo esperado, ou informar que a base não trata do assunto; a evidência, isto é, o documento e o intervalo de páginas do PDF em que a resposta se encontra, conferidos no texto processado; e os fatos-chave, termos que uma resposta completa deve conter, cada um com as variantes aceitas. Na pergunta “Qual é o esquema da PQT-U para adultos?”, por exemplo, a evidência são as páginas 59 a 61 do PDF do PCDT, e os fatos-chave são as doses de rifampicina, clofazimina e dapsona. As perguntas de continuação são precedidas, na execução, da pergunta anterior da conversa.'
  ),
  subst('F-057', '3.5.1', 'Edição do orientador no Quadro 4.', 'Formulação leiga ou termo alternativo, como', 'Formulação leiga ou termo alternativo', {
    md: { antes: 'Formulação leiga ou termo alternativo, como "lepra" e "mancha dormente"', depois: 'Formulação leiga ou termo alternativo' }
  }),
  subst(
    'F-058',
    '3.5.1',
    'Marcação retirada (orientador).',
    'Essas métricas são aproximações.',
    'Essas métricas são aproximações. A precisão das citações é um limite inferior, pois um trecho fora das páginas indicadas como evidência pode sustentar legitimamente uma afirmação; a cobertura de fatos-chave é lexical e não verifica se a informação está correta no contexto em que aparece; e a verificação das citações confirma a sobreposição entre a frase e o trecho, e não a correção da afirmação. Nenhuma delas substitui a revisão das respostas por profissional de saúde.'
  ),
  subst(
    'F-059',
    '3.5.2',
    'Repetição: o papel do modelo de linguagem já está na Seção 2.3; sem a data.',
    'O modelo de linguagem é usado na interpretação da pergunta e na redação da resposta (Seção 4.5) e responde',
    'O modelo de linguagem responde pela maior parte do custo de operação do sistema. Sua escolha seguiu, por isso, um critério de custo-benefício: buscou-se o menor custo por pergunta que mantivesse o desempenho do modelo usado até então, o `gpt-4o-mini`, e não o melhor desempenho a qualquer custo. Foram incluídos os modelos da OpenAI de custo comparável disponíveis para a chave de acesso do projeto, `gpt-4.1-mini`, `gpt-5-mini`, `gpt-5.6-luna` e `gpt-6-luna`, os três últimos com esforço de raciocínio baixo (`low`) e o `gpt-6-luna` também com o raciocínio desligado (`none`); modelos de custo mais alto não foram incluídos.'
  ),
  { id: 'F-060', secao: '3.6 e 3.7', motivo: 'Avaliação comparativa retirada (comentário do orientador) e Seção 3.7 retirada por ele.', tipo: 'remover_trecho', de: '3.6 AVALIAÇÃO COMPARATIVA COM PARTICIPANTES', ate: '3.8 AVALIAÇÃO EXPERIMENTAL COM PERGUNTAS CURADAS' },
  subst(
    'F-061',
    '3.6',
    'Sem a tripla validação nem a data.',
    'Além da avaliação técnica com o conjunto de referência',
    'Além da avaliação técnica com o conjunto de referência (Seção 3.5), o sistema foi submetido a uma avaliação experimental com 50 perguntas curadas a partir de dúvidas publicadas sobre hanseníase, que examina a correção, a completude e a fundamentação das respostas (QP3). As respostas foram avaliadas de forma automatizada, quanto à coerência e à conformidade com os documentos. O protocolo, os *scripts*, os dados e o diário do experimento estão na pasta `avaliacao/` do repositório.'
  ),
  subst(
    'F-062',
    '3.6.1',
    'Comentário do orientador: endereço oficial do modelo em nota de rodapé.',
    'Antes da busca, foi definida uma matriz',
    `Antes da busca, foi definida uma matriz de 50 vagas por 10 temas, com 25 perguntas em registro leigo e 25 em registro técnico, 35 simples e 15 compostas, e a previsão de que 42 seriam respondidas integralmente pelos documentos, 3 parcialmente e 5 não seriam respondidas. Foram coletadas 152 perguntas publicadas entre 2007 e 2023 em serviços de saúde e órgãos oficiais, como BVS APS/Telessaúde, Secretaria de Estado de Saúde do Rio de Janeiro, Ministério da Saúde e Fiocruz (101 leigas e 51 técnicas, das quais 32 eram dúvidas reais de profissionais da atenção primária). Com o apoio de um modelo de *embeddings* (BGE-M3${url('https://huggingface.co/BAAI/bge-m3')}) para ordenar a proximidade semântica em relação aos títulos das seções de referência, até cinco candidatas por vaga foram examinadas quanto ao assunto, ao registro, à complexidade e à cobertura documental, com exclusão de redundâncias, de dependências do contexto da publicação e de questões prejudicadas por mudanças normativas de 2026.`
  ),
  subst(
    'F-063',
    '3.6.2',
    'Marcação retirada (orientador).',
    'O protocolo previa um corpus com as Portarias',
    'O protocolo previa um corpus com as Portarias SCTIE/MS nº 47 e nº 51/2026 e uma orientação técnica da OMS de 2023, que não fazem parte da base do sistema. Para não alterar o sistema avaliado, a avaliação usou o corpus efetivamente indexado, descrito no Quadro 3, e as perguntas formuladas a partir das normas de 2026 foram classificadas pela cobertura real desse corpus.'
  ),
  subst(
    'F-0635',
    '3.6.3',
    'Nota de rodapé sem as "validações 1 e 2".',
    'Para cada pergunta, construiu-se uma resposta de referência',
    'Para cada pergunta, construiu-se uma resposta de referência exclusivamente a partir do corpus, sem acesso às respostas do sistema: a resposta, em duas a seis frases e no registro da pergunta; de dois a seis pontos-chave, afirmações atômicas que uma resposta correta deve conter, cada um acompanhado do trecho literal do documento que o sustenta; os pontos proibidos, afirmações que contrariam o corpus e seriam graves; e a cobertura da pergunta pelo corpus, integral, parcial ou não respondível, com o comportamento esperado do sistema. Quando os documentos divergiam, a referência seguiu a norma brasileira mais recente do corpus e registrou a divergência. Um *script* conferiu que todos os trechos citados são cópias literais do corpus, e as referências foram congeladas com resumo SHA-256 antes de qualquer leitura das respostas do sistema.{{As referências foram construídas pelo mesmo modelo de linguagem usado como avaliador das respostas (Seção 3.6.4), em cinco instâncias independentes, cada uma com dez perguntas e com acesso apenas às perguntas e ao texto do corpus.}}'
  ),
  subst(
    'F-064',
    '3.6.4',
    'O orientador retirou a tripla validação; fica só o essencial do método da avaliação automatizada, cujos critérios estão no Apêndice H.',
    'As validações 1 e 2 foram feitas de forma automatizada',
    'As respostas foram avaliadas de forma automatizada por um modelo de linguagem de grande escala atuando como avaliador segundo rubrica fixa, abordagem conhecida como *LLM-as-a-judge* (Zheng *et al.*, 2023).{{Modelo avaliador: Claude Opus 5.5 (`claude-opus-5-5`), da Anthropic, executado por meio do Claude Code, em dez instâncias independentes, uma por lote de dez respostas.}} As 100 respostas foram embaralhadas e identificadas apenas por códigos anônimos, sem indicação da rodada, e avaliadas quanto à coerência (pertinência, coerência interna e adequação ao registro da pergunta) e à conformidade com os documentos (correção factual, cobertura dos pontos-chave, precisão das afirmações, alucinação, alertas de segurança, abstenção e fundamentação das fontes), conforme a rubrica do Apêndice H, que define também a nota global de 0 a 1. Uma resposta foi considerada correta quando não contradiz o corpus, cobre ao menos 60% dos pontos-chave, é pertinente, coerente e sem alerta de segurança; nas perguntas não respondíveis, quando reconhece a limitação sem inventar. A consistência entre as duas execuções de cada pergunta foi medida pela estabilidade do veredito, pela diferença das notas, pela similaridade semântica entre as respostas e pela contradição entre elas. A acurácia é apresentada com intervalo de confiança de 95% de Wilson (Wilson, 1927), e as comparações entre registros e entre origens das perguntas, pelos testes exato de Fisher, de Mann-Whitney e de Kruskal-Wallis (Siegel; Castellan Jr., 2006), são exploratórias, porque as duas respostas de cada pergunta não são independentes.'
  ),
  remover('F-065', '3.6.4', 'Pesos da nota global: estão na rubrica do Apêndice H.', 'As métricas foram combinadas em uma nota global'),
  remover('F-066', '3.6.4', 'Validação por especialista retirada (comentário do orientador).', 'A validação 3 consiste na revisão por especialista'),
  {
    id: 'F-067',
    secao: 'Referências',
    motivo: 'Referência dos testes estatísticos, antes marcada para inserção.',
    tipo: 'inserir_depois',
    antes: 'SHORTLIFFE, Edward H.; CIMINO',
    blocos: [{ tipo: 'referencia', texto: 'SIEGEL, Sidney; CASTELLAN JR., N. John. **Estatística não-paramétrica para ciências do comportamento**. 2. ed. Porto Alegre: Artmed, 2006.' }]
  },

  // -------------------------------------------------------------------------
  // Capítulo 4
  subst(
    'F-070',
    '4',
    'Edição do orientador (sem data); sem a Seção 4.9; endereços oficiais em nota de rodapé.',
    'Este capítulo descreve o sistema desenvolvido, o NexoHansen',
    `Este capítulo descreve o sistema desenvolvido, o NexoHansen, primeiro resultado da pesquisa. O sistema atende aos objetivos específicos a, b e c e foi publicado na plataforma Vercel${url('https://vercel.com')}, com o banco de dados no serviço Neon${url('https://neon.com')} (Seção 4.2). A versão descrita resulta da reformulação motivada pela avaliação técnica preliminar (Seção 5.1.1).`
  ),
  subst(
    'F-071',
    '4.1',
    'Edição do orientador.',
    'Os requisitos RF10 e RNF04 e a forma atual do RF09',
    'Os requisitos RF10 e RNF04 e a forma atual do RF09 foram incorporados depois da avaliação técnica preliminar (Seção 4.6).'
  ),
  subst(
    'F-072',
    '4.2',
    'Endereço oficial em nota de rodapé.',
    'O sistema segue uma arquitetura cliente-servidor em camadas',
    `O sistema segue uma arquitetura cliente-servidor em camadas, representada na Figura 2. A interface *web* comunica-se com a API do servidor por requisições HTTP com dados em JSON. O servidor é uma aplicação Express organizada em módulos de domínio (base de conhecimento, trechos, *embeddings*, recuperação, segurança, consulta, avaliação técnica e avaliação das respostas pelos usuários, ou *feedback*), cujas dependências são conectadas em um único ponto de composição, e precedidos por um módulo de autenticação que trata do *login* e verifica a sessão em cada requisição. O acesso aos dados combina o Prisma, nas operações relacionais, com consultas SQL diretas nas que dependem do pgvector e da busca textual. O banco de dados é o PostgreSQL com pgvector, executado em contêiner Docker${url('https://www.docker.com')} no desenvolvimento e em serviço gerenciado na publicação. A API da OpenAI é uma dependência opcional, usada, quando há chave de acesso configurada, para gerar *embeddings*, interpretar as perguntas e redigir as respostas.`
  ),
  subst(
    'F-073',
    '4.2',
    'Edição do orientador: sem data.',
    'A interface e a API foram publicadas em outubro de 2026',
    'A interface e a API foram publicadas como dois projetos na plataforma Vercel, com o banco de dados PostgreSQL com pgvector no serviço gerenciado Neon, em servidores localizados nos Estados Unidos. A interface repassa as requisições `/api` à API pelo mesmo endereço, o que permite usar o *cookie* de sessão sem compartilhá-lo entre domínios, e cada alteração incorporada ao ramo principal do repositório é publicada automaticamente.'
  ),
  subst(
    'F-074',
    '4.4',
    'Edição do orientador.',
    'Na versão atual, esses metadados servem',
    'Esses metadados servem como filtros no explorador de recuperação e na rota de busca, mas não alteram a ordem dos trechos nem o risco estimado da pergunta, que depende apenas da pergunta (Seção 4.5.2). Pela fase clínica atribuída, predominam na base os trechos de vigilância (89), manejo de reação (65), tratamento (61) e conteúdo técnico, como metodologia e contexto dos documentos (46); as demais fases somam 67 trechos, entre eles 11 de diagnóstico e 4 de triagem.'
  ),
  subst(
    'F-075',
    '4.4',
    'Sem data.',
    'A indexação é feita por um script do projeto',
    'A indexação é feita por um *script* do projeto ou pela rota `POST /api/knowledge/seed`. Os trechos processados são comparados aos já indexados por um resumo do texto: somente os novos ou alterados recebem novo *embedding*, os que deixaram de existir são removidos, e cada execução é registrada no histórico de ingestão. O texto enviado ao modelo de *embeddings* é precedido do título do documento e do caminho de seções, para que trechos curtos sejam representados com seu contexto. Como a busca vetorial compara apenas vetores gerados pelo mesmo modelo, a troca do provedor exige reindexar a base.'
  ),
  subst(
    'F-076',
    '4.5.5',
    'Repetição: a limitação das regras textuais está na Seção 5.3.3.',
    'As recusas são reservadas aos pedidos',
    'As recusas são reservadas aos pedidos que exigem avaliação individual. Perguntas informativas sobre gestação, crianças, reações hansênicas, talidomida ou doses padronizadas são respondidas, com instrução ao modelo para destacar os cuidados, as restrições e o encaminhamento descritos nos documentos, e a resposta indica a necessidade de avaliação profissional sempre que o risco estimado é alto ou muito alto. Para o perfil de profissional de saúde, a descrição de uma situação de urgência também é respondida, com o encaminhamento em destaque. Na versão anterior, as regras recusavam qualquer menção a gestação, crianças ou reações e, por usarem correspondência por subcadeias, eram acionadas indevidamente: a pergunta “Tenho dúvida sobre a baciloscopia na hanseníase” era recusada porque “enh”, abreviatura de eritema nodoso hansênico, ocorre em “tenho”. Essas perguntas integram o conjunto de referência como casos de regressão (Seção 3.5.1).'
  ),
  subst(
    'F-077',
    '4.5.7',
    'A Seção 3.6.3 (aspectos éticos da avaliação comparativa) foi retirada.',
    'Cada consulta gera registros persistentes',
    'Cada consulta gera registros persistentes: a conversa, com o perfil escolhido e o usuário autenticado; a pergunta e a resposta; e um registro de recuperação com a interpretação da pergunta, os trechos usados como contexto, com documento, páginas, pontuações vetorial, textual e de fusão e indicação de citação, a resposta final, o acionamento de recusa e o nível de risco. Esses registros permitem reconstituir por que uma resposta foi dada ou recusada e quais trechos a sustentaram, e o registro da avaliação (Seção 4.6.2) associa a cada resposta a nota de quem a recebeu. Por vincularem perguntas a usuários, exigem que as perguntas não contenham dados pessoais de pacientes (Seção 2.5.3).'
  ),
  subst(
    'F-078',
    '4.6',
    'Repetição: o momento da inclusão já está na Seção 4.1; sem data e sem o uso por participantes.',
    'A autenticação dos usuários e o registro da avaliação das respostas foram incorporados',
    'A autenticação dos usuários e o registro da avaliação das respostas não alteram o *pipeline* de consulta descrito na Seção 4.5.'
  ),
  subst(
    'F-079',
    '4.6.2',
    'A remissão às dimensões da avaliação comparativa (Seção 3.6.2) sai com ela.',
    'A escala de 0 a 10 substituiu a nota de 1 a 5',
    'A escala de 0 a 10 substituiu a nota de 1 a 5 da versão anterior do módulo, e a migração que efetua a mudança é interrompida se encontrar avaliações no formato anterior, em vez de convertê-las ou removê-las. A nota é uma avaliação global da resposta.'
  ),
  subst(
    'F-080',
    '4.7',
    'Sem a remissão ao Cenário B da avaliação comparativa.',
    'A tela de comparação apresenta, lado a lado',
    'A tela de comparação apresenta, lado a lado, a resposta do NexoHansen e a de um modelo genérico, que, na versão atual, é produzida por uma simulação no próprio navegador, identificada como tal, sem consultar nenhum modelo de linguagem; a tela é, portanto, apenas demonstrativa.'
  ),
  subst(
    'F-081',
    '4.8',
    'Endereço oficial em nota de rodapé.',
    'O sistema conta com 113 testes automatizados',
    `O sistema conta com 113 testes automatizados, escritos com Vitest: 93 no servidor e 20 na interface, agrupados conforme o Quadro 21 (Apêndice J). No servidor, os testes unitários usam dublês em memória para o repositório, o provedor de *embeddings* e o modelo de linguagem, e parte deles exercita a API por requisições HTTP; dez testes de integração são executados contra um PostgreSQL com as migrações do projeto aplicadas, quando um banco de testes é configurado. Na interface, os testes usam a Testing Library${url('https://testing-library.com')} e simulam as respostas da API.`
  ),
  subst(
    'F-082',
    '4.8',
    'Sem datas; endereço oficial em nota de rodapé.',
    'Em 24 de outubro de 2026, os 113 testes',
    `Na versão descrita, os 113 testes, a análise estática e a verificação de tipos do servidor foram executados com sucesso; os dez testes de integração rodaram contra o PGlite${url('https://pglite.dev')}, distribuição do PostgreSQL executada no próprio processo de teste, com as extensões pgvector e pgcrypto e as migrações do projeto aplicadas a um banco vazio. O fluxo de *login* e consulta também foi verificado em navegador, com a base oficial indexada e respostas geradas pelo modelo escolhido, situação registrada nas Figuras 5 e 6.`
  ),
  { id: 'F-083', secao: '4.9', motivo: 'Seção 4.9 e Quadro 8 retirados pelo orientador.', tipo: 'remover_trecho', de: '4.9 EVOLUÇÃO DO SISTEMA APÓS A AVALIAÇÃO PRELIMINAR', ate: '5 RESULTADOS E DISCUSSÃO' },

  // -------------------------------------------------------------------------
  // Capítulo 5
  subst(
    'F-090',
    '5',
    'Sem a avaliação comparativa nem a relação com a literatura (5.4.2), retiradas.',
    'Este capítulo reúne os resultados das avaliações',
    'Este capítulo reúne os resultados das avaliações do sistema descrito no Capítulo 4 e sua discussão: a avaliação técnica do *pipeline*, em execução preliminar e com a base oficial, incluindo a comparação de modelos geradores (Seção 5.1); a avaliação experimental com perguntas curadas (Seção 5.2); e a discussão desses resultados em relação às questões de pesquisa, ao projeto de sistemas RAG em saúde e às limitações do trabalho (Seção 5.3).'
  ),
  subst(
    'F-091',
    '5.1',
    'Edição do orientador: sem datas.',
    'A avaliação técnica foi executada em dois momentos',
    'A avaliação técnica foi executada em dois momentos: de forma preliminar, com a base inicial e *embeddings* determinísticos (Seção 5.1.1), e com a base oficial e *embeddings* semânticos, quando serviu também para escolher o modelo gerador (Seções 5.1.2 e 5.1.3).'
  ),
  subst(
    'F-092',
    '5.1.1',
    'Edição do orientador: sem data.',
    'A avaliação técnica preliminar foi executada em 14 de setembro',
    'A avaliação técnica preliminar foi executada em ambiente local, com o banco de dados PostgreSQL com pgvector, a base inicial de 15 trechos e o conjunto de 25 perguntas de referência (Apêndice A). Não havia chave de acesso à OpenAI configurada; foram utilizados, portanto, o provedor determinístico de *embeddings* e a geração extrativa. Os parâmetros eram os padrões do sistema à época: *top-K* igual a 12, *top-N* igual a 5 e limiar mínimo de relevância de 0,65. O resultado, registrado na documentação do projeto, está na Tabela 1.'
  ),
  subst(
    'F-093',
    '5.1.1',
    'Edição do orientador: sem data.',
    'Todas as perguntas terminaram em recusa',
    'Todas as perguntas terminaram em recusa, e nenhuma resposta continha fontes. Como os resultados por pergunta dessa execução não foram armazenados, as partes determinísticas do *pipeline* foram reproduzidas com o código compilado do sistema (Apêndice D). A reprodução mostrou que três perguntas eram recusadas por regras específicas a partir do próprio texto (reação grave, gestação e prescrição) e que, em 13 das 22 perguntas restantes, o limiar não poderia ser atingido pelo trecho ideal nem com a máxima correspondência textual, embora esse trecho tenha sido o mais similar à pergunta, entre os 15 da base, em 16 das 25 perguntas. O resultado da Tabela 1 decorre, portanto, da incompatibilidade entre o limiar configurado e a escala de pontuação do provedor determinístico, e não necessariamente de falhas no ranqueamento.'
  ),
  subst(
    'F-094',
    '5.1.1',
    'A Seção 4.9 (com o Quadro 8) foi retirada; as alterações motivadas ficam resumidas aqui.',
    'A avaliação preliminar mostrou que o mecanismo de segurança',
    'A avaliação preliminar mostrou que o mecanismo de segurança funcionou como projetado, recusando a resposta em vez de responder com trechos pouco relacionados; que o limiar mínimo e os pesos da busca híbrida dependiam da escala das pontuações do provedor de *embeddings*; e que o indicador adotado media o efeito conjunto da recuperação e do limiar, e não apenas a qualidade do ranqueamento. Esses resultados, somados às recusas indevidas identificadas na análise das regras de segurança, motivaram a construção da base a partir de documentos oficiais, a fusão das buscas por posição recíproca, a busca textual por qualquer termo e sem acentos, a interpretação de toda pergunta no domínio da hanseníase, a restrição das regras de segurança aos pedidos que exigem avaliação individual e o novo conjunto de referência (Seções 3.3.2, 3.5.1 e 4.5).'
  ),
  subst(
    'F-095',
    '5.1.2',
    'Edição do orientador: retirada a frase com a data e os parâmetros, já descritos nas Seções 4.5.3 e 4.5.4.',
    'A avaliação com a base oficial foi executada em 24 de outubro',
    'A avaliação com a base oficial usou o conjunto de 32 perguntas e as métricas da Seção 3.5.1. Para situar o resultado, a versão avaliada na execução preliminar foi executada sobre o novo conjunto com seus parâmetros originais e *embeddings* determinísticos, assim como a versão atual sem acesso à OpenAI. A Tabela 2 reúne os três resultados; a coluna da direita corresponde à configuração escolhida na Seção 5.1.3.'
  ),
  subst(
    'F-096',
    '5.1.2',
    'Comentário do orientador ("seria 94%?"): 94% é o comportamento correto, e 84%, a revocação@5; o texto passa a citar os dois.',
    'A versão preliminar acertou o comportamento em 5 das 32',
    'A versão preliminar acertou o comportamento em 5 das 32 perguntas, todas recusas, e não respondeu a nenhuma pergunta com resposta na base. A versão atual sem acesso à OpenAI teve o comportamento esperado em 94% das perguntas e localizou a evidência entre os cinco primeiros trechos em 84% delas (revocação@5 de 0,84), o que indica que a maior parte do ganho decorre da base e da nova recuperação, e não apenas do provedor de *embeddings*; suas duas falhas de comportamento ocorrem nas perguntas sem resposta na base, que a resposta extrativa não consegue declarar. Com os *embeddings* e o modelo da OpenAI, todas as 32 perguntas tiveram o comportamento esperado, inclusive as cinco recusas previstas, as duas lacunas declaradas e as três perguntas de regressão, e a evidência esteve entre os trechos enviados ao modelo em todas as 25 que a possuem. Os resultados por pergunta estão no Apêndice F.'
  ),
  subst(
    'F-097',
    '5.1.2',
    'Repetição: a ressalva sobre a revisão por profissional de saúde já está na Seção 3.5.1.',
    'A leitura das respostas da configuração escolhida',
    'A leitura das respostas da configuração escolhida complementa as métricas. As respostas começam pela resposta direta à pergunta, seguida dos detalhes em listas ou tabelas, com uma citação após cada afirmação (Figura 5). Nas perguntas de divergência, as duas posições foram apresentadas com as respectivas fontes: sobre o caso com um único nervo comprometido, a resposta indicou que a OMS recomenda a classificação multibacilar e que o protocolo brasileiro admite a paucibacilar quando a avaliação é feita por profissionais experientes, informando que no Brasil a referência é o protocolo do Ministério da Saúde; sobre a profilaxia de contatos, apresentou a dose única de rifampicina recomendada pela OMS e a oferta de BCG prevista no PCDT. A leitura revelou também um erro que as métricas não captaram: na continuação sobre o esquema da PQT-U para crianças, a resposta afirmou que os documentos não detalham o esquema para crianças com mais de 50 kg, embora o Quadro 1 do PCDT indique a PQT-U Adulto acima desse peso. No texto extraído do PDF, as linhas e colunas desse quadro aparecem separadas, e a cobertura de fatos-chave da resposta foi, ainda assim, de 100%, o que ilustra a limitação do processamento de tabelas (Seção 3.3.2) e o alcance das métricas automáticas.'
  ),
  { id: 'F-098', secao: '5.2', motivo: 'Resultados da avaliação comparativa retirados pelo orientador.', tipo: 'remover_trecho', de: '5.2 RESULTADOS DA AVALIAÇÃO COMPARATIVA', ate: '5.3 RESULTADOS DA AVALIAÇÃO EXPERIMENTAL COM PERGUNTAS CURADAS' },
  subst(
    'F-099',
    '5.2',
    'Resultados finais, sem a validação por especialista.',
    'Esta seção apresenta os resultados das validações 1 e 2',
    'Esta seção apresenta os resultados da avaliação descrita na Seção 3.6. As 100 chamadas foram concluídas sem falhas técnicas, com latência mediana de 8,9 segundos (percentil 95 de 13,1 segundos), e nenhuma resposta foi recusada pelas regras de segurança. As médias principais, na Tabela 5, referem-se a 98 respostas de 49 perguntas, sem a T36. O resultado de cada pergunta está no Apêndice I.'
  ),
  subst('F-100', '5.2', 'Sem as "validações 1 e 2".', 'Fonte: Elaboração própria (2026). Nota: validações 1 e 2', 'Fonte: Elaboração própria (2026). Nota: avaliação automatizada; 98 respostas de 49 perguntas, sem a T36.'),
  remover('F-101', '5.2', 'Validação por especialista retirada.', 'A validação 3 está em andamento.'),
  subst(
    'F-102',
    '5.3',
    'Sem as partes que dependiam da avaliação comparativa.',
    'Esta seção relaciona os resultados às questões de pesquisa',
    'Esta seção relaciona os resultados às questões de pesquisa, ao projeto de sistemas RAG em saúde e às limitações do trabalho.'
  ),
  subst(
    'F-103',
    '5.3.1',
    'QP1 sem a percepção de usuários.',
    'Em relação à QP1, as decisões de arquitetura',
    'Em relação à QP1, as decisões de arquitetura que viabilizam a indicação da origem das respostas e a recusa de situações de risco são: a representação da base em trechos de documentos oficiais, com documento, seção e página; a citação de cada afirmação, com verificação automática e ligação para a página do documento original; o registro de cada consulta com trechos, pontuações e decisões; as regras de segurança aplicadas em código, antes da geração, e restritas aos pedidos que exigem avaliação individual; e a verificação de evidência como condição para responder. Na avaliação técnica com a base oficial, essas decisões resultaram em recusas apenas nos casos previstos, em respostas às perguntas legítimas antes recusadas e, na configuração escolhida, em citações confirmadas em 95% a 100% das fontes, conforme a execução; na avaliação experimental, nenhuma pergunta foi recusada pelas regras de segurança, e a fundamentação das fontes teve média de 1,90 em 2.'
  ),
  subst(
    'F-104',
    '5.3.1',
    'Repetição do resultado da Seção 5.1.2 retirada; entra a discussão do idioma, que estava na Seção 5.4.2.',
    'Em relação à QP2, com embeddings semânticos',
    'Em relação à QP2, com *embeddings* semânticos e a configuração atual, o mecanismo de recuperação localiza os trechos esperados: a evidência esteve entre os oito trechos enviados ao modelo em todas as 25 perguntas do conjunto de referência que a possuem e entre os cinco primeiros em 24 delas, resultado que se manteve, com variações de até 0,08, entre as seis configurações de modelo e as duas execuções. A resposta está condicionada a um conjunto de 32 perguntas elaborado pelo autor, com conhecimento da base, e à definição de acerto por documento e intervalo de páginas, que não verifica se o trecho recuperado contém toda a informação necessária. Apesar do predomínio de modelos de *embedding* orientados ao inglês (Arzideh *et al.*, 2026; Yang *et al.*, 2026), o modelo de uso geral adotado obteve revocação elevada com perguntas e documentos em português, possivelmente com a contribuição da interpretação da pergunta, que gera consultas na terminologia dos documentos e uma consulta em inglês para o documento da OMS nesse idioma; a comparação com modelos treinados em textos clínicos em português não foi realizada.'
  ),
  subst(
    'F-105',
    '5.3.1',
    'Comentário do orientador: nova QP3, respondida pela avaliação experimental.',
    'Em relação à QP3, [ANALISAR',
    'Em relação à QP3, as respostas foram, em geral, fundamentadas, mas nem sempre completas: 65,3% foram consideradas corretas (IC 95%: 55,5%–74,0%), com precisão das afirmações de 0,98, e as falhas concentraram-se nas perguntas sobre tratamento (Seção 5.2). A Seção 5.3.4 discute esses resultados e as ameaças à sua validade.'
  ),
  { id: 'F-106', secao: '5.4.2', motivo: 'Seção 5.4.2 retirada pelo orientador.', tipo: 'remover_trecho', de: '5.4.2 Relação com a literatura', ate: '5.4.3 Implicações para o projeto de sistemas RAG em saúde' },
  subst(
    'F-107',
    '5.3.2',
    'Sem a remissão à avaliação comparativa.',
    'O desenvolvimento do sistema permite registrar observações de engenharia',
    'O desenvolvimento e a avaliação do sistema permitem registrar observações de engenharia. A primeira é que limiares e pesos de recuperação não são transferíveis entre provedores de *embeddings*: valores definidos sem calibração podem fazer o sistema recusar todas as perguntas, como na avaliação preliminar, ou responder com base em trechos pouco relacionados, e combinar as buscas pela posição dos trechos, e não pela soma de pontuações em escalas diferentes, reduz essa dependência. A segunda é que regras de segurança implementadas em código são verificáveis por testes, mas exigem cuidado na correspondência de padrões, como mostraram os acionamentos indevidos por subcadeias; perguntas de regressão com frases comuns da língua, e não apenas os termos-alvo, verificam esse tipo de falha. A terceira é que testes com dublês em memória não substituem testes com o banco de dados e com os provedores reais, pois três falhas só apareceram fora deles (Seção 4.8). A quarta é que a rastreabilidade depende de dados de origem completos: a extração dos documentos com seção e página permitiu substituir os identificadores internos dos trechos por referências que o usuário pode conferir. A quinta é que dados de pesquisa coletados pelo próprio sistema exigem garantias de integridade semelhantes às dos registros de auditoria, para que uma avaliação não possa ser atribuída a outra pessoa, duplicada ou perdida (Seção 4.6.2).'
  ),
  remover('F-108', '5.3.2', 'Marcação da avaliação comparativa.', '[ANALISAR APÓS A CONSOLIDAÇÃO DAS AVALIAÇÕES: implicações adicionais'),
  subst('F-109', '5.3.3', 'Trabalho final.', 'Identificam-se, nesta versão, as seguintes limitações:', 'Identificam-se as seguintes limitações:'),
  subst(
    'F-110',
    '5.3.3',
    'Sem a revisão por especialista, as duas avaliações dependem de julgamento automatizado.',
    'c) a avaliação técnica utiliza um conjunto de 32 perguntas',
    'c) as avaliações dependem de critérios definidos pelo autor e de julgamento automatizado: o conjunto de referência da avaliação técnica foi elaborado pelo próprio autor, com conhecimento da base, e usa métricas automáticas e lexicais, e as respostas da avaliação experimental foram julgadas por um modelo de linguagem, sem revisão por profissional de saúde;'
  ),
  remover('F-111', '5.3.3', 'Repetição: o limite dos dublês já está nas Seções 4.8 e 5.3.2.', 'e) os testes automatizados usam dublês'),
  subst(
    'F-112',
    '5.3.3',
    'Comentário do orientador: a avaliação comparativa não realizada entra como limitação.',
    'f) a tela de comparação utiliza uma simulação local',
    'e) não foi realizada a avaliação comparativa, com participantes, entre respostas produzidas com e sem recuperação, de modo que o trabalho não mede o ganho da recuperação em relação a um modelo de linguagem sem RAG nem a percepção de usuários; a tela de comparação da interface usa uma simulação local, e não um modelo de linguagem;'
  ),
  subst(
    'F-113',
    '5.3.3',
    'Alínea renomeada.',
    'g) as perguntas são enviadas a um serviço externo',
    'f) as perguntas são enviadas a um serviço externo, o banco de dados da publicação está localizado fora do Brasil e a interface não exibe aviso contra a inserção de dados pessoais nas perguntas; além disso, não há perfis de acesso, de modo que todos os usuários cadastrados acessam o painel interno e as rotas de carga da base e de execução da avaliação técnica, e o limite de tentativas de *login* vale para cada instância do servidor;'
  ),
  subst('F-114', '5.3.3', 'Alínea renomeada.', 'h) o sistema não foi validado clinicamente', 'g) o sistema não foi validado clinicamente e não se destina ao uso assistencial.'),
  remover('F-115', '5.3.3', 'Marcação da avaliação comparativa.', '[PREENCHER APÓS A AVALIAÇÃO COMPARATIVA: limitações da avaliação com participantes'),
  subst(
    'F-116',
    '5.3.4',
    'Resultados finais.',
    'A avaliação experimental complementa a avaliação técnica (Seção 5.1)',
    'A avaliação experimental complementa a avaliação técnica (Seção 5.1) com perguntas que, em sua maioria, vêm de dúvidas publicadas e não foram elaboradas junto com a base. Os resultados indicam comportamento prudente diante do que o corpus não cobre, mas desempenho insuficiente para uso sem supervisão em perguntas sobre tratamento, nas quais se concentraram as alucinações e os alertas de segurança. A acurácia geral de 65%, frente à nota global média de 0,84, decorre do critério binário, que exige a cobertura de ao menos 60% dos pontos-chave: a maior parte das respostas incorretas é incompleta, e não errada.'
  ),
  subst(
    'F-117',
    '5.3.4',
    'Sem a validação por especialista como mitigação.',
    'a) as validações 1 e 2 foram feitas por um modelo',
    'a) as respostas foram avaliadas por um modelo de linguagem atuando como avaliador, e o mesmo modelo construiu as respostas de referência; como mitigação, as referências foram congeladas por resumo SHA-256 antes da leitura das respostas, a avaliação foi cega quanto à rodada e a rubrica foi fixada antes da avaliação, mas a concordância do avaliador automatizado com profissionais de saúde não foi medida;'
  ),
  remover('F-118', '5.3.4', 'Validação por especialista retirada.', 'c) a especialista revisa 25 das 50 perguntas'),
  subst('F-119', '5.3.4', 'Alínea renomeada.', 'd) 34 das 50 perguntas são adaptações', 'c) 34 das 50 perguntas são adaptações ou redação autoral, e a T36 permaneceu em decisão na curadoria;'),
  subst('F-120', '5.3.4', 'Alínea renomeada.', 'e) com apenas duas execuções por pergunta', 'd) com apenas duas execuções por pergunta, a consistência medida é indicativa, e os testes estatísticos, exploratórios;'),
  subst(
    'F-121',
    '5.3.4',
    'Alínea renomeada.',
    'f) o corpus avaliado não contém as Portarias',
    'e) o corpus avaliado não contém as Portarias SCTIE/MS nº 47 e nº 51/2026 nem a orientação técnica da OMS de 2023 previstas no protocolo, e as divergências entre o PCDT e a OMS foram resolvidas a favor do PCDT;'
  ),
  subst(
    'F-122',
    '5.3.4',
    'Alínea renomeada.',
    'g) a cobertura dos pontos-chave e a precisão',
    'f) a cobertura dos pontos-chave e a precisão das afirmações dependem da decomposição feita pelo avaliador, e a similaridade entre execuções foi medida com `text-embedding-3-small`, e não com o modelo BGE-M3 previsto no protocolo.'
  ),
  remover('F-123', '5.3.4', 'Validação por especialista retirada.', '[OBSERVAÇÕES DA ESPECIALISTA: preencher após a validação 3'),

  // -------------------------------------------------------------------------
  // Capítulo 6 (Conclusão)
  remover('F-130', '6', 'Edição do orientador.', '[ATUALIZAR APÓS A AVALIAÇÃO COMPARATIVA: as considerações a seguir'),
  subst(
    'F-131',
    '6',
    'Objetivo sem a comparação com um modelo sem recuperação.',
    'Este trabalho teve como objetivo desenvolver',
    'Este trabalho teve como objetivo desenvolver um sistema de apoio informacional à decisão clínica em hanseníase baseado na arquitetura RAG e avaliar tecnicamente a recuperação e a qualidade de suas respostas. Foi desenvolvido o NexoHansen, protótipo que combina a interpretação da pergunta, a recuperação híbrida sobre cinco documentos oficiais do Ministério da Saúde e da OMS, regras de segurança aplicadas antes da geração, respostas restritas aos trechos recuperados, com citações verificadas que remetem à página do documento original, e o registro das consultas para auditoria, com uma interface *web* de acesso autenticado em que cada resposta pode ser avaliada.'
  ),
  subst(
    'F-132',
    '6',
    'Resultados finais, sem a revisão por especialista.',
    'A avaliação experimental com 50 perguntas curadas, em sua maioria derivadas',
    'A avaliação experimental com 50 perguntas curadas, em sua maioria derivadas de dúvidas publicadas e não elaboradas junto com a base, acrescentou uma medida da correção das respostas: na avaliação automatizada, 65,3% das respostas foram consideradas corretas, todas as respostas a perguntas que os documentos não cobrem reconheceram a limitação e nenhuma teve erro classificado como de potencial dano; as falhas concentraram-se nas perguntas sobre tratamento e tiveram origem, em parte, na extração dos documentos.'
  ),
  remover('F-133', '6', 'Parágrafo retirado pelo orientador.', 'As limitações que condicionam o alcance dessas conclusões'),
  remover('F-134', '6', 'Edição do orientador.', '[PREENCHER APÓS A AVALIAÇÃO COMPARATIVA: síntese dos resultados'),
  subst(
    'F-135',
    '6',
    'Comentário do orientador: o que não foi feito entra como trabalho futuro.',
    'Como trabalhos futuros, recomendam-se',
    'As principais limitações, discutidas na Seção 5.3.3, são a ausência de revisão da base e das respostas por profissionais de saúde e a não realização da avaliação comparativa com participantes. Como trabalhos futuros, recomendam-se essa avaliação comparativa, entre respostas produzidas com e sem recuperação; a validação do conteúdo e das respostas por profissionais de saúde; a extração estruturada das tabelas dos documentos, para que faixas de peso, doses e populações permaneçam associadas; a calibração dos limiares de evidência com um conjunto de perguntas ampliado; mecanismos mais robustos que as regras baseadas em padrões textuais, mantendo a possibilidade de verificação; métricas automáticas de avaliação da geração, como as do RAGAS, e o uso das avaliações registradas pelos usuários para ampliar o conjunto de referência; modelos de *embedding* adequados a textos clínicos em português; a adequação da linguagem ao registro da pergunta; a inclusão de outros documentos oficiais; e avisos sobre dados pessoais e perfis de acesso que separem usuários e administradores, necessários para qualquer disponibilização mais ampla do sistema.'
  ),

  // -------------------------------------------------------------------------
  // Referências citadas apenas nas partes retiradas
  remover('F-140', 'Referências', 'Citado só na avaliação comparativa.', 'BRASIL. Conselho Nacional de Saúde. Comissão Nacional de Ética em Pesquisa.'),
  remover('F-141', 'Referências', 'Idem.', 'BRASIL. Conselho Nacional de Saúde. Resolução nº 466'),
  remover('F-142', 'Referências', 'Idem.', 'BRASIL. Conselho Nacional de Saúde. Resolução nº 510'),
  remover('F-143', 'Referências', 'Citado só na Seção 3.7, retirada.', 'WOHLIN, Claes'),

  // -------------------------------------------------------------------------
  // Apêndices
  { id: 'F-150', secao: 'Apêndice E', motivo: 'Protocolo da avaliação comparativa, retirada.', tipo: 'remover_trecho', de: 'APÊNDICE E – PROTOCOLO PREVISTO DA AVALIAÇÃO COMPARATIVA', ate: 'APÊNDICE E – CONJUNTO DE REFERÊNCIA DA AVALIAÇÃO TÉCNICA' },
  subst(
    'F-151',
    'Apêndice H',
    'Sem as "validações 1 e 2".',
    'O Quadro 18 resume a rubrica aplicada',
    'O Quadro 18 resume a rubrica aplicada na avaliação das respostas (Seção 3.6.4). O texto integral, com as regras complementares, está no arquivo `avaliacao/rubrica.md`, e as instruções entregues ao avaliador, em `avaliacao/validacao/instrucoes_avaliador.md`.'
  ),
  { id: 'F-152', secao: 'Apêndice J', motivo: 'Ficha da validação por especialista, retirada.', tipo: 'remover_trecho', de: 'APÊNDICE J – MODELO DA FICHA DA VALIDAÇÃO POR ESPECIALISTA', ate: 'APÊNDICE I – RESULTADO POR PERGUNTA' },
  subst(
    'F-153',
    'Apêndice I',
    'Comentário do orientador ("Ajustar"): sem a validação por especialista nem as células realçadas.',
    'O Quadro 20 apresenta, para cada pergunta, o veredito',
    'O Quadro 20 apresenta, para cada pergunta, o veredito da avaliação automatizada nas duas execuções, com a nota global entre parênteses e a indicação de alerta de segurança ou alucinação. As perguntas, as respostas de referência, com os trechos que as sustentam, e as duas respostas do sistema, na íntegra e com a avaliação de cada uma, estão no documento `avaliacao/Perguntas_e_Respostas_Avaliacao.docx`.'
  ),
  {
    id: 'F-154',
    secao: 'Apêndice I',
    motivo: 'Quadro sem a coluna da validação por especialista.',
    tipo: 'substituir_tabela',
    legenda: 'Resultado da avaliação por pergunta',
    bloco: {
      tipo: 'tabela',
      especie: 'Quadro',
      legenda: 'Resultado da avaliação por pergunta',
      cabecalho: ['Nº', 'Tema', 'Execução 1', 'Execução 2'],
      larguras: [9, 27, 32, 32],
      linhas: perguntas.map((p: any) => [p.id === EXCLUIDA_DAS_MEDIAS ? `${p.id}*` : p.id, p.tema, execucao(p.id, 1), execucao(p.id, 2)]),
      fonte: `Fonte: Elaboração própria (2026). Nota: * ${EXCLUIDA_DAS_MEDIAS}, em decisão na curadoria, fora das médias.`
    }
  },

  // -------------------------------------------------------------------------
  // Títulos: só os principais em maiúsculas; seções renumeradas.
  titulo('H-001', '1.1 OBJETIVOS', '1.1 Objetivos'),
  titulo('H-002', '1.1.1 Objetivo Geral', '1.1.1 Objetivo geral'),
  titulo('H-003', '1.1.2 Objetivos Específicos', '1.1.2 Objetivos específicos'),
  titulo('H-004', '1.2 JUSTIFICATIVA', '1.2 Justificativa'),
  titulo('H-005', '1.3 ORGANIZAÇÃO DO TRABALHO', '1.3 Organização do trabalho'),
  titulo('H-006', '2.1 HANSENÍASE E INFORMAÇÃO CLÍNICA', '2.1 Hanseníase e informação clínica'),
  titulo('H-007', '2.2 SISTEMAS DE APOIO À DECISÃO CLÍNICA', '2.2 Sistemas de apoio à decisão clínica'),
  titulo('H-008', '2.3 MODELOS DE LINGUAGEM DE GRANDE ESCALA NA SAÚDE', '2.3 Modelos de linguagem de grande escala na saúde'),
  titulo('H-009', '2.4 RECUPERAÇÃO DE INFORMAÇÃO', '2.4 Recuperação de informação'),
  titulo('H-010', '2.5 GERAÇÃO AUMENTADA POR RECUPERAÇÃO (RAG)', '2.5 Geração aumentada por recuperação (RAG)'),
  titulo('H-011', '2.6 AVALIAÇÃO DE SISTEMAS BASEADOS EM RAG', '2.6 Avaliação de sistemas baseados em RAG'),
  titulo('H-012', '2.7 ESTADO DA ARTE', '2.7 Estado da arte'),
  titulo('H-013', '2.8 TRABALHOS RELACIONADOS', '2.8 Trabalhos relacionados'),
  titulo('H-014', '3.1 CARACTERIZAÇÃO DA PESQUISA', '3.1 Caracterização da pesquisa'),
  titulo('H-015', '3.2 ETAPAS DA PESQUISA', '3.2 Etapas da pesquisa'),
  titulo('H-016', '3.3 CONSTRUÇÃO DA BASE DE CONHECIMENTO', '3.3 Construção da base de conhecimento'),
  titulo('H-017', '3.4 DESENVOLVIMENTO DO SISTEMA', '3.4 Tecnologias e processo de desenvolvimento'),
  titulo('H-018', '3.5 AVALIAÇÃO TÉCNICA DO PIPELINE', '3.5 Avaliação técnica do *pipeline*'),
  titulo('H-019', '3.8 AVALIAÇÃO EXPERIMENTAL COM PERGUNTAS CURADAS', '3.6 Avaliação experimental com perguntas curadas'),
  titulo('H-020', '3.8.1 Conjunto de perguntas', '3.6.1 Conjunto de perguntas'),
  titulo('H-021', '3.8.2 Execução', '3.6.2 Execução'),
  titulo('H-022', '3.8.3 Respostas de referência', '3.6.3 Respostas de referência'),
  titulo('H-023', '3.8.4 Tripla validação', '3.6.4 Avaliação das respostas'),
  titulo('H-024', '4.1 REQUISITOS E PRINCÍPIOS DE PROJETO', '4.1 Requisitos e princípios de projeto'),
  titulo('H-025', '4.2 ARQUITETURA GERAL', '4.2 Arquitetura geral'),
  titulo('H-026', '4.3 MODELO DE DADOS', '4.3 Modelo de dados'),
  titulo('H-027', '4.4 BASE DE CONHECIMENTO E INDEXAÇÃO', '4.4 Base de conhecimento e indexação'),
  titulo('H-028', '4.5 PIPELINE DE CONSULTA', '4.5 *Pipeline* de consulta'),
  titulo('H-029', '4.6 CONTROLE DE ACESSO E AVALIAÇÃO DAS RESPOSTAS', '4.6 Controle de acesso e avaliação das respostas'),
  titulo('H-030', '4.7 INTERFACE WEB', '4.7 Interface *web*'),
  titulo('H-031', '4.8 VERIFICAÇÃO DO SOFTWARE', '4.8 Verificação do *software*'),
  titulo('H-032', '5.1 AVALIAÇÃO TÉCNICA', '5.1 Avaliação técnica'),
  titulo('H-033', '5.3 RESULTADOS DA AVALIAÇÃO EXPERIMENTAL COM PERGUNTAS CURADAS', '5.2 Resultados da avaliação experimental com perguntas curadas'),
  titulo('H-034', '5.4 DISCUSSÃO', '5.3 Discussão'),
  titulo('H-035', '5.4.1 Questões de pesquisa', '5.3.1 Questões de pesquisa'),
  titulo('H-036', '5.4.3 Implicações para o projeto de sistemas RAG em saúde', '5.3.2 Implicações para o projeto de sistemas RAG em saúde'),
  titulo('H-037', '5.4.4 Limitações', '5.3.3 Limitações'),
  titulo('H-038', '5.4.5 Discussão da avaliação experimental e ameaças à validade', '5.3.4 Discussão da avaliação experimental e ameaças à validade'),
  titulo('H-039', '6 CONSIDERAÇÕES FINAIS', '6 CONCLUSÃO')
];
