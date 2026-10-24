import { describe, expect, it } from 'vitest';
import {
  declaresGap,
  scoreCase,
  summarize,
  type GoldenQuestion
} from '../src/modules/evaluation/golden-evaluation';
import { contentHash, embeddingText, searchText } from '../src/modules/knowledge/chunk-text';
import { deriveClinicalTags } from '../src/modules/knowledge/document-processing/clinical-tags';
import {
  chunkDocument,
  sectionPaths
} from '../src/modules/knowledge/document-processing/document-chunker';
import {
  locateOutline,
  parseTocLines,
  splitNumbering
} from '../src/modules/knowledge/document-processing/outline';
import {
  cleanPages,
  mergeWrappedLines,
  stripGluedReferenceNumbers
} from '../src/modules/knowledge/document-processing/pdf-pages';

// Documento sintético de 8 páginas: cabeçalho repetido, número impresso no rodapé (impressa =
// PDF − 2) e duas seções numeradas.
function syntheticPages() {
  return [
    'CAPA\nPROTOCOLO DE TESTE',
    'Ficha catalográfica',
    'MINISTÉRIO DA SAÚDE\n1 INTRODUÇÃO\nA hanseníase é uma doença infecciosa crônica.\n1',
    'MINISTÉRIO DA SAÚDE\nTexto da introdução que continua\nna linha seguinte sem ponto final\n2',
    'MINISTÉRIO DA SAÚDE\n2 DIAGNÓSTICO\n2.1 Sinais cardinais\nLesão de pele com alteração de sensibilidade.\n3',
    'MINISTÉRIO DA SAÚDE\nEspessamento de nervo periférico.\n4',
    'MINISTÉRIO DA SAÚDE\nREFERÊNCIAS\n1. Autor. Título. 2020.\n5',
    'MINISTÉRIO DA SAÚDE\nAnexo de teste\n6'
  ];
}

describe('limpeza das páginas extraídas', () => {
  it('remove cabeçalho repetido e número de página, e identifica o número impresso', () => {
    const pages = cleanPages(syntheticPages());
    expect(pages[2].lines).toEqual([
      '1 INTRODUÇÃO',
      'A hanseníase é uma doença infecciosa crônica.'
    ]);
    expect(pages[2].label).toBe('1');
    expect(pages[5].label).toBe('4');
    // páginas antes da numeração não recebem número inferido
    expect(pages[0].label).toBeNull();
  });

  it('junta linhas quebradas no meio da frase, sem juntar itens de lista', () => {
    expect(
      mergeWrappedLines(['Texto que continua', 'na linha seguinte.', '• item', 'Novo parágrafo.'])
    ).toEqual(['Texto que continua na linha seguinte.', '• item', 'Novo parágrafo.']);
  });

  it('remove números de referência colados, preservando siglas', () => {
    expect(stripGluedReferenceNumbers('pacientes registrados89. Outro caso93,94 aqui')).toBe(
      'pacientes registrados. Outro caso aqui'
    );
    expect(stripGluedReferenceNumbers('(IC95% = 0,59-2,07)102. ou não”16. a PQT-U16.')).toBe(
      '(IC95% = 0,59-2,07). ou não”. a PQT-U.'
    );
    expect(stripGluedReferenceNumbers('casos novos com GIF2 e vitamina B12')).toBe(
      'casos novos com GIF2 e vitamina B12'
    );
  });
});

describe('sumário e seções', () => {
  it('lê títulos de várias linhas, pontos de condução e números colados ao título', () => {
    const entries = parseTocLines([
      'SUMÁRIO',
      'APRESENTAÇÃO9',
      '3 CLASSIFICAÇÃO ESTATÍSTICA',
      'INTERNACIONAL DE DOENÇAS (CID-10)        19',
      'Meta 3 – Reduzir casos novos com GIF2',
      'no momento do diagnóstico                25',
      '1. Introdução......................... 1'
    ]);
    expect(entries).toEqual([
      { title: 'SUMÁRIO APRESENTAÇÃO', page: '9' },
      { title: '3 CLASSIFICAÇÃO ESTATÍSTICA INTERNACIONAL DE DOENÇAS (CID-10)', page: '19' },
      { title: 'Meta 3 – Reduzir casos novos com GIF2 no momento do diagnóstico', page: '25' },
      { title: '1. Introdução', page: '1' }
    ]);
    expect(splitNumbering('6.3.1 Hanseníase paucibacilar (PB)')).toEqual({
      number: '6.3.1',
      text: 'Hanseníase paucibacilar (PB)'
    });
  });

  it('localiza os títulos no texto e monta o caminho de seções', () => {
    const pages = cleanPages(syntheticPages());
    const located = locateOutline(pages, [
      { number: '1', title: 'Introdução', level: 1, pdfPage: 3 },
      { number: '2', title: 'Diagnóstico', level: 1, pdfPage: 5 },
      { number: '2.1', title: 'Sinais cardinais', level: 2, pdfPage: 5 },
      { title: 'Referências', level: 1, pdfPage: 7, exclude: true }
    ]);
    expect(located.every((entry) => entry.located)).toBe(true);
    expect(located[2].position).toEqual({ pdfPage: 5, lineIndex: 1 });
    expect(sectionPaths(located)[2].path).toEqual(['2 Diagnóstico', '2.1 Sinais cardinais']);
  });
});

describe('fragmentação por seções', () => {
  it('não mistura seções, guarda páginas e exclui seções marcadas', () => {
    const pages = cleanPages(syntheticPages());
    const located = locateOutline(pages, [
      { number: '1', title: 'Introdução', level: 1, pdfPage: 3 },
      { number: '2', title: 'Diagnóstico', level: 1, pdfPage: 5 },
      { number: '2.1', title: 'Sinais cardinais', level: 2, pdfPage: 5 },
      { title: 'Referências', level: 1, pdfPage: 7, exclude: true }
    ]);
    const chunks = chunkDocument(pages, located, {
      contentPages: [3, 8],
      minTokens: 1,
      targetTokens: 40
    });

    expect(chunks.map((chunk) => chunk.sectionPath.at(-1))).toEqual([
      '1 Introdução',
      '2.1 Sinais cardinais'
    ]);
    expect(chunks[1]).toMatchObject({
      pageStart: 5,
      pageEnd: 6,
      pageLabelStart: '3',
      pageLabelEnd: '4'
    });
    expect(chunks[1].content).toContain('Espessamento de nervo periférico.');
    // títulos saem do texto (estão no caminho), e referências e anexo excluídos não entram
    expect(chunks.map((chunk) => chunk.content).join(' ')).not.toMatch(
      /DIAGNÓSTICO|Autor\. Título|Anexo de teste/
    );
  });
});

describe('metadados e textos de indexação', () => {
  it('deriva fase e indicadores do caminho de seções e do conteúdo', () => {
    const tags = deriveClinicalTags(
      [
        '10 Abordagem terapêutica',
        '10.1.3 Tratamento farmacológico das reações hansênicas em crianças'
      ],
      'Prednisona 1 mg/kg/dia, com redução gradual.',
      { documentType: 'Protocolo clínico', sourceType: 'Protocolo oficial' }
    );
    expect(tags).toMatchObject({
      clinical_phase: 'Reaction_Management',
      target_demographic: 'Pediátrico',
      medication_related: true,
      dosage_related: true,
      reaction_related: true
    });
  });

  it('acrescenta documento e seção ao texto do embedding e remove acentos da busca textual', () => {
    const document = {
      title: 'Protocolo',
      shortTitle: 'PCDT',
      institution: 'Ministério da Saúde',
      publicationYear: 2022
    };
    const chunk = {
      content: 'Está indicada nos casos de dúvida.',
      title: '7.2 Baciloscopia',
      sectionPath: ['7 Exames', '7.2 Baciloscopia']
    };
    expect(embeddingText(chunk, document)).toBe(
      'Documento: PCDT (Ministério da Saúde, 2022)\nSeção: 7 Exames > 7.2 Baciloscopia\n\nEstá indicada nos casos de dúvida.'
    );
    expect(searchText(chunk, document)).toBe(
      'pcdt 7 exames 7.2 baciloscopia esta indicada nos casos de duvida.'
    );
    expect(contentHash('a')).toHaveLength(64);
  });
});

describe('pontuação da avaliação', () => {
  const question: GoldenQuestion = {
    id: 'T1',
    category: 'direta',
    question: 'Baciloscopia negativa exclui hanseníase?',
    expected: 'responder',
    evidence: [{ documentId: 'pcdt', pages: [46, 47] }],
    keyFacts: [['nao exclui'], ['paucibacilar', 'pb']]
  };

  it('mede recuperação, precisão das citações e fatos-chave', () => {
    const score = scoreCase(question, {
      answer: 'Não exclui: nos casos PB a baciloscopia costuma ser negativa [1].',
      fallbackTriggered: false,
      context: [
        { chunkId: 'a', documentId: 'oms', pageStart: 10, pageEnd: 11 },
        { chunkId: 'b', documentId: 'pcdt', pageStart: 47, pageEnd: 48 }
      ],
      cited: [
        { chunkId: 'b', documentId: 'pcdt', pageStart: 47, pageEnd: 48, verified: true },
        { chunkId: 'a', documentId: 'oms', pageStart: 10, pageEnd: 11, verified: false }
      ]
    });
    expect(score).toMatchObject({
      correctBehaviour: true,
      hitAt5: true,
      evidenceRecall: 1,
      citationPrecision: 0.5,
      verifiedShare: 0.5,
      keyFactCoverage: 1
    });
  });

  it('conta como correta a resposta que declara a lacuna da base', () => {
    const gap = scoreCase(
      { ...question, expected: 'informar_lacuna', evidence: [], keyFacts: [] },
      {
        answer: 'Os documentos consultados não tratam de acupuntura.',
        fallbackTriggered: false,
        context: [],
        cited: []
      }
    );
    expect(gap.correctBehaviour).toBe(true);
    expect(summarize([gap]).overall.correctBehaviour).toBe(1);
  });

  it('reconhece as formas usuais de declarar a lacuna e não a confunde com uma resposta', () => {
    expect(declaresGap('Não há, nos trechos consultados, recomendação de acupuntura.')).toBe(true);
    expect(declaresGap('Os trechos fornecidos não informam o telefone da coordenação.')).toBe(true);
    expect(declaresGap('Os documentos consultados não fornecem esse contato.')).toBe(true);
    expect(declaresGap('A baciloscopia negativa não exclui o diagnóstico.')).toBe(false);
  });
});
