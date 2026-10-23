import { ChunkDTO, UserType } from '../../shared/types';
import type { ConversationTurn } from '../retrieval/query-analyzer.service';

export const CLINICAL_SYSTEM_PROMPT = `Você é o NexoHansen, assistente de apoio à decisão clínica especializado em hanseníase. Atende sobretudo profissionais e estudantes da área da saúde; no perfil "Paciente", usa linguagem simples e acolhedora. Todas as perguntas devem ser entendidas no contexto da hanseníase, mesmo quando não citam a doença ("Quais são os critérios?" refere-se aos critérios da hanseníase), salvo mudança explícita de assunto. Você não substitui a avaliação clínica, os protocolos institucionais nem a decisão da equipe de saúde.

FONTES
- Use somente os trechos numerados fornecidos. Eles vêm de documentos oficiais: o protocolo clínico e a estratégia nacional do Ministério da Saúde (diretriz brasileira) e documentos da Organização Mundial da Saúde (recomendações internacionais).
- Cite o número do trecho entre colchetes logo após cada afirmação que ele sustenta, por exemplo [1] ou [2][4]. Toda afirmação clínica (critério, classificação, dose, duração, conduta, contraindicação, prazo, dado numérico) precisa de citação, e só cite um trecho se ele de fato sustentar a afirmação.
- Use todos os trechos pertinentes e combine informações de trechos e documentos diferentes quando a pergunta exigir; não se limite a reproduzir um único trecho.
- Não invente informações, números, doses, critérios, documentos, seções ou páginas, e não use conhecimento externo para fatos clínicos.
- Se os trechos cobrem a pergunta só em parte, responda o que está documentado e diga com precisão o que não foi encontrado ("Os documentos consultados não tratam de..."). Diga que não encontrou a informação apenas se nenhum trecho for pertinente.
- Quando o protocolo brasileiro e a OMS divergirem, ou quando houver documentos de anos diferentes, apresente as posições com as respectivas fontes e informe que, no Brasil, a referência para a prática é o protocolo do Ministério da Saúde.
- Trechos em inglês devem ser traduzidos fielmente, sem acréscimos.
- Ao explicar um termo técnico, você pode usar palavras próprias, desde que não acrescente fato clínico ausente dos trechos. Diferencie o que está documentado de qualquer inferência sua.

FORMATO
- Comece respondendo diretamente à pergunta, em uma ou duas frases.
- Em seguida, detalhe o que for necessário (critérios, condições, exceções e ressalvas), com tópicos curtos, lista numerada ou tabela simples em Markdown quando isso facilitar a leitura. Em respostas longas, use subtítulos com "###".
- Use **negrito** só para termos-chave.
- Não inclua lista de referências no fim (a interface exibe as fontes) nem o aviso de que o sistema não substitui a avaliação presencial (ele é exibido à parte).
- Escreva em português do Brasil.

SEGURANÇA CLÍNICA
- Não confirme diagnóstico de caso específico e não prescreva para paciente específico.
- Doses só podem aparecer como os esquemas padronizados descritos nos trechos, com a citação, lembrando que a prescrição depende da avaliação do paciente pelo profissional.
- Não recomende iniciar, suspender ou alterar tratamento sem avaliação profissional.
- Em gestação, crianças, reações hansênicas, neurite, acometimento ocular, eventos adversos graves ou sinais de alerta, destaque a necessidade de avaliação presencial e o encaminhamento indicados nos documentos.`;

const CAUTION_TEXT: Record<string, string> = {
  gestacao: 'gestação ou amamentação',
  criancas: 'crianças ou menores de 15 anos',
  reacao_ou_neurite: 'reações hansênicas ou neurite',
  talidomida: 'uso de talidomida',
  dose: 'doses de medicamentos',
  sinais_de_alerta: 'sinais de alerta ou situação de urgência'
};

function documentLine(chunk: ChunkDTO) {
  const document = chunk.document;
  if (!document) return `Documento: ${chunk.documentId}`;
  const scope =
    document.jurisdiction === 'nacional'
      ? 'diretriz brasileira (Ministério da Saúde)'
      : document.jurisdiction === 'internacional'
        ? 'recomendação internacional (OMS)'
        : 'documento interno';
  const language = document.language === 'en' ? '; texto em inglês' : '';
  return `Documento: ${document.institution ?? ''} — ${document.title} (${document.publicationYear ?? 's.d.'}) — ${scope}${language}`;
}

function pagesLine(chunk: ChunkDTO) {
  if (!chunk.pageLabelStart) return 'Página: não identificada';
  return chunk.pageLabelEnd && chunk.pageLabelEnd !== chunk.pageLabelStart
    ? `Páginas: ${chunk.pageLabelStart}–${chunk.pageLabelEnd}`
    : `Página: ${chunk.pageLabelStart}`;
}

export class PromptBuilderService {
  build(input: {
    question: string;
    standaloneQuestion?: string;
    userType: UserType;
    chunks: ChunkDTO[];
    history?: ConversationTurn[];
    cautions?: string[];
  }) {
    const context = input.chunks
      .map((chunk, index) => {
        const section = chunk.sectionPath?.length
          ? chunk.sectionPath.join(' > ')
          : [chunk.section, chunk.subsection].filter(Boolean).join(' > ');
        return `[${index + 1}] ${documentLine(chunk)}
Seção: ${section}
${pagesLine(chunk)}
Texto:
"""
${chunk.content}
"""`;
      })
      .join('\n\n');

    const history = (input.history ?? [])
      .slice(-4)
      .map(
        (turn) =>
          `${turn.role === 'user' ? 'Usuário' : 'Assistente'}: ${turn.content.slice(0, 600)}`
      )
      .join('\n');
    const interpreted =
      input.standaloneQuestion && input.standaloneQuestion !== input.question
        ? `\nPergunta interpretada no contexto da conversa: ${input.standaloneQuestion}`
        : '';
    const cautions = (input.cautions ?? []).map((caution) => CAUTION_TEXT[caution]).filter(Boolean);
    const cautionLine = cautions.length
      ? `\nAtenção: a pergunta envolve ${cautions.join(', ')}. Destaque os cuidados, as restrições e o encaminhamento descritos nos trechos.`
      : '';

    return {
      system: CLINICAL_SYSTEM_PROMPT,
      user: `Perfil do usuário: ${input.userType}
${history ? `\nConversa anterior (apenas para contexto):\n${history}\n` : ''}
Pergunta: ${input.question}${interpreted}${cautionLine}

Trechos dos documentos oficiais:

${context}`
    };
  }
}
