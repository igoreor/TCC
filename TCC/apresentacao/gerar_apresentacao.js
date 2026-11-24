// Gera a apresentação da defesa do TCC a partir do template do curso ("Template — Defesa de TCC").
// O template é preservado: cada caixa de texto é preenchida pelo nome ("Text 3", "Shape 4"...), com a
// fonte, a cor e o espaçamento originais; só tamanho, posição e conteúdo mudam onde o texto pede.
// Dois slides do template são duplicados: a metodologia (para o fluxo do pipeline) e o gráfico de
// resultados (para a comparação de modelos). As notas do apresentador trazem a fala de cada slide,
// lida de fala_defesa.md.
// Uso: node TCC/apresentacao/gerar_apresentacao.js
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const JSZip = require(require.resolve('jszip', { paths: [path.join(RAIZ, 'avaliacao'), path.join(RAIZ, 'backend')] }));
const TEMPLATE = path.join(RAIZ, 'TCC', 'Template — Defesa de TCC.pptx');
const SAIDA = path.join(RAIZ, 'TCC', 'Apresentação Defesa TCC - 22-11-2026.pptx');
const FIG = (f) => path.join(RAIZ, 'TCC', 'figuras', f);

const CURSO = 'Engenharia de Software · UPE Campus Garanhuns | 2026';
const AZUL = '0E4A9E';
const MARINHO = '10213F';
const CINZA = '44506A';

// ---------------------------------------------------------------------------
// Edição do XML de um slide
const EMU = 914400;
const emu = (pol) => Math.round(pol * EMU);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class Slide {
  constructor(xml, rels, zip) {
    this.xml = xml;
    this.rels = rels;
    this.zip = zip;
  }
  /** Localiza a forma (sp, pic ou graphicFrame) pelo nome exato. */
  local(nome) {
    const m = new RegExp(`<p:cNvPr id="\\d+" name="${escRe(nome)}"`).exec(this.xml);
    if (!m) throw new Error(`forma não encontrada: ${nome}`);
    const inicios = ['<p:sp>', '<p:pic>', '<p:graphicFrame>'].map((t) => ({ t, i: this.xml.lastIndexOf(t, m.index) }));
    const { t, i } = inicios.sort((a, b) => b.i - a.i)[0];
    const fecho = t.replace('<', '</');
    const j = this.xml.indexOf(fecho, m.index) + fecho.length;
    return { i, j, xml: this.xml.slice(i, j) };
  }
  trocar(nome, f) {
    const s = this.local(nome);
    this.xml = this.xml.slice(0, s.i) + f(s.xml) + this.xml.slice(s.j);
    return this;
  }
  remover(...nomes) {
    for (const n of nomes) {
      const s = this.local(n);
      this.xml = this.xml.slice(0, s.i) + this.xml.slice(s.j);
    }
    return this;
  }
  /** Posição e tamanho em polegadas; campos omitidos ficam como estão. */
  geom(nome, { x, y, w, h }) {
    return this.trocar(nome, (s) =>
      s.replace(/<a:off x="(\d+)" y="(\d+)"\/>(\s*)<a:ext cx="(\d+)" cy="(\d+)"\/>/, (_m, ox, oy, sp, cx, cy) =>
        `<a:off x="${x === undefined ? ox : emu(x)}" y="${y === undefined ? oy : emu(y)}"/>${sp}<a:ext cx="${w === undefined ? cx : emu(w)}" cy="${h === undefined ? cy : emu(h)}"/>`
      )
    );
  }
  maxId() {
    return Math.max(...[...this.xml.matchAll(/<p:cNvPr id="(\d+)"/g)].map((m) => Number(m[1])));
  }
  /** Duplica a forma com novo nome, deslocada; a cópia vai logo depois da original. */
  clonar(nome, novo, { dx = 0, dy = 0 } = {}) {
    const s = this.local(nome);
    const id = this.maxId() + 1;
    const copia = s.xml
      .replace(/<p:cNvPr id="\d+" name="[^"]*"/, `<p:cNvPr id="${id}" name="${novo}"`)
      .replace(/<a:off x="(\d+)" y="(\d+)"\/>/, (_m, x, y) => `<a:off x="${Number(x) + emu(dx)}" y="${Number(y) + emu(dy)}"/>`);
    this.xml = this.xml.slice(0, s.j) + copia + this.xml.slice(s.j);
    return this;
  }
  /**
   * Substitui o texto da forma. `paras` é uma lista de parágrafos; cada um é uma string ou uma lista de
   * trechos { t, b, i, sz, cor, fonte }. `o` aplica a todos: sz (pt), cor, fonte, b, i, alinhar.
   * Parágrafo e trechos herdam o pPr e o rPr do texto original; o espaçamento entre linhas
   * acompanha o tamanho da fonte (1,4 vez).
   */
  texto(nome, paras, o = {}) {
    return this.trocar(nome, (s) => {
      const ini = s.indexOf('<a:p>');
      const fim = s.lastIndexOf('</a:p>') + '</a:p>'.length;
      const p1 = s.slice(ini, s.indexOf('</a:p>', ini));
      let pPr = (p1.match(/<a:pPr\b[^>]*\/>|<a:pPr\b[^>]*>[\s\S]*?<\/a:pPr>/) || [''])[0];
      const rPrs = p1.match(/<a:rPr\b[^>]*\/>|<a:rPr\b[^>]*>[\s\S]*?<\/a:rPr>/g) || ['<a:rPr lang="pt-BR" dirty="0"/>'];
      const base = rPrs[rPrs.length - 1];
      const fimPar = (p1.match(/<a:endParaRPr\b[^>]*\/>|<a:endParaRPr\b[^>]*>[\s\S]*?<\/a:endParaRPr>/) || [''])[0];
      if (o.alinhar) pPr = pPr.replace(/algn="\w+"/, `algn="${o.alinhar}"`);
      const montar = (trecho) => {
        const t = typeof trecho === 'string' ? { t: trecho } : trecho;
        const op = { ...o, ...t };
        let r = base.replace(/ (b|i)="\d"/g, '').replace(/lang="[^"]*"/, 'lang="pt-BR"');
        if (op.b) r = r.replace('<a:rPr', '<a:rPr b="1"');
        else if (/ b="1"/.test(base) && op.b === undefined) r = r.replace('<a:rPr', '<a:rPr b="1"');
        if (op.i) r = r.replace('<a:rPr', '<a:rPr i="1"');
        if (op.sz) r = /sz="\d+"/.test(r) ? r.replace(/sz="\d+"/, `sz="${op.sz * 100}"`) : r.replace('<a:rPr', `<a:rPr sz="${op.sz * 100}"`);
        if (op.cor) r = r.replace(/(<a:solidFill><a:srgbClr val=")[0-9A-Fa-f]{6}/, `$1${op.cor}`);
        if (op.fonte) r = r.replace(/typeface="[^"]*"/g, `typeface="${op.fonte}"`);
        const sp = /^\s|\s$/.test(t.t) ? ' xml:space="preserve"' : '';
        return { xml: `<a:r>${r}<a:t${sp}>${esc(t.t)}</a:t></a:r>`, sz: op.sz };
      };
      const corpo = paras
        .map((p) => {
          const runs = (Array.isArray(p) ? p : [p]).map(montar);
          const maior = Math.max(0, ...runs.map((r) => r.sz || 0));
          const pp = maior ? pPr.replace(/<a:spcPts val="\d+"\/>/, `<a:spcPts val="${Math.round(maior * 140)}"/>`) : pPr;
          return `<a:p>${pp}${runs.map((r) => r.xml).join('')}${fimPar}</a:p>`;
        })
        .join('');
      return s.slice(0, ini) + corpo + s.slice(fim);
    });
  }
  /** Células da tabela, linha a linha, com o estilo da célula original. */
  tabela(nome, linhas, o = {}) {
    return this.trocar(nome, (s) => {
      let k = 0;
      const valores = linhas.flat();
      return s.replace(/<a:tc>[\s\S]*?<\/a:tc>/g, (tc) => {
        const v = valores[k++];
        if (v === undefined) return tc;
        const tmp = new Slide(`<p:sp><p:nvSpPr><p:cNvPr id="1" name="cel"/></p:nvSpPr>${tc}</p:sp>`);
        tmp.texto('cel', [v], o);
        return tmp.xml.replace(/^<p:sp><p:nvSpPr><p:cNvPr id="1" name="cel"\/><\/p:nvSpPr>/, '').replace(/<\/p:sp>$/, '');
      });
    });
  }
  /** Caixa tracejada do template vira cartão sólido, sem contorno. */
  cartao(nome, cor) {
    return this.trocar(nome, (s) =>
      s.replace(/<a:solidFill><a:srgbClr val="[0-9A-Fa-f]{6}"\/><\/a:solidFill>/, `<a:solidFill><a:srgbClr val="${cor}"/></a:solidFill>`).replace(/<a:ln\b[^>]*>[\s\S]*?<\/a:ln>|<a:ln\/>/, '<a:ln><a:noFill/></a:ln>')
    );
  }
  /** Barra do gráfico: forma com caminho próprio, redesenhado para a nova altura. */
  barra(nome, { y, h, cor }) {
    const H = emu(h);
    this.geom(nome, { y, h });
    return this.trocar(nome, (s) => {
      let r = s.replace(/(<a:path w="\d+" h=")\d+(")/, `$1${H}$2`).replace(/<a:pt x="(\d+)" y="(\d+)" \/>/g, (m, x, yy) => (Number(yy) > 50800 ? `<a:pt x="${x}" y="${H}" />` : m));
      if (cor) r = r.replace(/(<a:solidFill><a:srgbClr val=")[0-9A-Fa-f]{6}/, `$1${cor}`);
      return r;
    });
  }
  /** Imagem nova, com relação e arquivo de mídia próprios. */
  imagem(arquivo, nome, descr, { x, y, w, h }) {
    const n = Object.keys(this.zip.files).filter((f) => f.startsWith('ppt/media/apres-')).length + 1;
    const alvo = `media/apres-${n}${path.extname(arquivo)}`;
    this.zip.file(`ppt/${alvo}`, fs.readFileSync(arquivo));
    const rId = `rIdApres${n}`;
    this.rels = this.rels.replace('</Relationships>', `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../${alvo}"/></Relationships>`);
    const id = this.maxId() + 1;
    const pic = `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="${nome}" descr="${esc(descr)}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/><a:ext cx="${emu(w)}" cy="${emu(h)}"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 2500"/></a:avLst></a:prstGeom><a:ln w="9525"><a:solidFill><a:srgbClr val="C9D6E8"/></a:solidFill></a:ln></p:spPr></p:pic>`;
    this.xml = this.xml.replace('</p:spTree>', `${pic}</p:spTree>`);
    return this;
  }
}

const pngDim = (f) => {
  const b = fs.readFileSync(f);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

// ---------------------------------------------------------------------------
// Conteúdo de cada slide. A chave é o número do slide no template (17 e 18 são as cópias).
const S = {};

S[1] = {
  notas:
    'Bom dia. Meu nome é Igor, e vou apresentar o NexoHansen, um sistema baseado em Geração Aumentada por Recuperação para apoio informacional à decisão clínica em hanseníase, orientado pelo professor Élisson.\n\nEm uma frase: construí e avaliei um sistema que responde dúvidas sobre hanseníase a partir de documentos oficiais, indicando a página de onde cada informação veio.',
  editar: (s) =>
    s
      .texto('Text 1', [CURSO])
      .geom('Text 1', { w: 6.2 })
      .texto('Text 3', ['NexoHansen'])
      .texto('Text 4', ['Desenvolvimento de um Sistema Baseado em Geração Aumentada por Recuperação (RAG) para Apoio à Decisão Clínica em Hanseníase'])
      .geom('Text 4', { w: 7.9, h: 0.7 })
      .geom('Text 5', { x: 1.22, w: 3.5 })
      .texto('Text 6', ['Igor Emanuel Oliveira Rêgo'])
      .geom('Text 6', { x: 1.22, w: 3.5 })
      .geom('Text 7', { x: 5.0, w: 4.0 })
      .texto('Text 8', ['Prof. Dr. Élisson da Silva Rocha'])
      .geom('Text 8', { x: 5.0, w: 4.0 })
};

S[2] = {
  notas: 'Este é o roteiro: contexto e problema, objetivos, fundamentos, trabalhos relacionados, metodologia e o sistema, resultados e conclusão.',
  editar: (s) => s.texto('Text 2', ['Roteiro'])
};

S[3] = {
  notas:
    'A hanseníase é uma doença negligenciada, mas ainda muito presente no Brasil. O diagnóstico é clínico e, na maioria dos casos, feito na atenção primária, por equipes generalistas.\n\nAs orientações estão no Protocolo Clínico e Diretrizes Terapêuticas, um documento de 152 páginas, difícil de consultar durante o atendimento. Modelos de linguagem poderiam ajudar a localizar a informação, mas eles podem inventar conteúdo e não dizem de onde tiraram a resposta.',
  editar: (s) =>
    s
      .texto('Text 2', ['1 · Introdução'])
      .texto('Text 3', ['Informação confiável na hora do atendimento'])
      .texto('Text 5', ['Doença negligenciada'])
      .texto('Text 6', ['Entre as doenças tropicais negligenciadas (OMS)'])
      .texto('Text 8', ['Diagnóstico na atenção primária'])
      .texto('Text 9', ['Equipes generalistas confirmam a maioria dos casos'])
      .texto('Text 11', ['Modelos de linguagem'])
      .texto('Text 12', ['Resumem bem, mas alucinam e não citam a fonte'])
      .cartao('Shape 13', 'E6EEF7')
      .texto('Text 14', ['152 páginas'], { sz: 44, fonte: 'Fraunces', b: false })
      .geom('Text 14', { x: 8.07, y: 2.95, w: 3.78, h: 0.8 })
      .clonar('Text 15', 'Fonte 15', { dy: 0 })
      .texto('Text 15', ['é a extensão do Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase, a referência para o diagnóstico e o tratamento'], { sz: 16, cor: '10213F', i: false })
      .geom('Text 15', { x: 8.07, y: 3.85, w: 3.78, h: 1.3 })
      .texto('Fonte 15', ['Fonte: Brasil (2022)'], { sz: 12, cor: CINZA, i: false })
      .geom('Fonte 15', { x: 8.07, y: 5.3, w: 3.78, h: 0.3 })
};

S[4] = {
  notas:
    'Os números mostram que o diagnóstico ainda chega tarde. Em 2024 foram mais de 22 mil casos novos, e 82% eram multibacilares, a forma mais avançada; em 2015 eram 69%. E 11,5% dos casos já chegaram com incapacidade física grave. Diagnosticar e tratar no momento certo depende de informação técnica acessível.',
  editar: (s) =>
    s
      .texto('Text 2', ['1 · Introdução · em números'])
      .texto('Text 3', ['O diagnóstico ainda chega tarde'])
      .texto('Text 5', ['22.129'])
      .texto('Text 6', ['casos novos no Brasil em 2024'])
      .texto('Text 7', ['2º país em casos novos'])
      .texto('Text 8', ['Fonte: Brasil (2026)'])
      .texto('Text 10', ['82,2%'])
      .texto('Text 11', ['dos casos novos são multibacilares'])
      .texto('Text 12', ['Eram 68,9% em 2015'])
      .texto('Text 13', ['Fonte: Brasil (2026)'])
      .texto('Text 15', ['11,5%'])
      .texto('Text 16', ['já chegam com incapacidade física'])
      .texto('Text 17', ['Grau 2 no diagnóstico'])
      .texto('Text 18', ['Fonte: Brasil (2026)'])
      .clonar('Text 7', 'Fechamento')
      .texto('Fechamento', ['Diagnosticar e tratar no momento certo depende de informação técnica acessível às equipes de saúde.'], { sz: 20, fonte: 'Fraunces', cor: '10213F' })
      .geom('Fechamento', { x: 1.22, y: 4.85, w: 10.9, h: 0.9 })
};

S[5] = {
  notas:
    'O problema é este: modelos de linguagem respondem com fluência, mas sem fonte verificável e com risco de alucinação, o que não é aceitável em saúde. E, até onde encontrei, não havia sistemas RAG para apoio informacional em hanseníase, em português e com documentos oficiais brasileiros.\n\nA pergunta de pesquisa se desdobra em três: as decisões de arquitetura, a qualidade da recuperação e a qualidade das respostas.',
  editar: (s) =>
    s
      .texto('Text 2', ['2 · Problema'])
      .texto('Text 3', ['Respostas fluentes, mas sem fonte verificável e sujeitas a alucinação'])
      .texto('Text 4', ['Não foram encontrados sistemas RAG para apoio informacional em hanseníase, em português e ancorados em documentos oficiais brasileiros.'])
      .geom('Text 4', { h: 0.7 })
      .clonar('Text 6', 'QP1 rótulo')
      .clonar('Text 6', 'QP2 rótulo')
      .clonar('Text 6', 'QP3 rótulo')
      .clonar('Text 4', 'QP1 texto')
      .clonar('Text 4', 'QP2 texto')
      .clonar('Text 4', 'QP3 texto')
      .texto('QP1 rótulo', ['QP1 · ARQUITETURA'])
      .geom('QP1 rótulo', { x: 1.22, y: 3.45, w: 3.1 })
      .texto('QP1 texto', ['Que decisões permitem citar a origem e recusar o que é arriscado?'])
      .geom('QP1 texto', { x: 1.22, y: 3.76, w: 3.1, h: 1.0 })
      .texto('QP2 rótulo', ['QP2 · RECUPERAÇÃO'])
      .geom('QP2 rótulo', { x: 4.62, y: 3.45, w: 3.1 })
      .texto('QP2 texto', ['A busca encontra os trechos certos dos documentos?'])
      .geom('QP2 texto', { x: 4.62, y: 3.76, w: 3.1, h: 1.0 })
      .texto('QP3 rótulo', ['QP3 · RESPOSTAS'])
      .geom('QP3 rótulo', { x: 8.02, y: 3.45, w: 3.1 })
      .texto('QP3 texto', ['As respostas são corretas, completas e fundamentadas?'])
      .geom('QP3 texto', { x: 8.02, y: 3.76, w: 3.1, h: 1.0 })
      .geom('Shape 5', { y: 5.05, h: 1.2 })
      .geom('Text 6', { y: 5.1 })
      .texto('Text 7', ['Como projetar um sistema RAG para o apoio informacional em hanseníase, e com que qualidade ele responde?'])
      .geom('Text 7', { y: 5.42, h: 0.85 })
};

S[6] = {
  notas:
    'O objetivo geral, como está no TCC, é desenvolver o sistema e avaliar tecnicamente a recuperação e a qualidade das respostas.\n\nOs específicos acompanham as etapas: construir a base, implementar o pipeline, desenvolver a interface, avaliar a recuperação, avaliar as respostas e identificar as limitações.',
  editar: (s) =>
    s
      .texto('Text 2', ['3 · Objetivos'])
      .geom('Shape 4', { h: 3.75 })
      .texto('Text 6', [
        'Desenvolver um sistema de apoio informacional à decisão clínica em hanseníase baseado na arquitetura RAG, capaz de produzir respostas fundamentadas em uma base de conhecimento curada, com indicação das fontes e aplicação de regras explícitas de segurança, e avaliar tecnicamente a recuperação e a qualidade dessas respostas.'
      ])
      .geom('Text 6', { h: 2.95 })
      .clonar('Text 12', 'Text 12f', { dy: 0.44 })
      .texto('Text 8', [[{ t: 'a', b: true }, { t: ' Construir a base com documentos oficiais', b: false }]])
      .texto('Text 9', [[{ t: 'b', b: true }, { t: ' Implementar o ', b: false }, { t: 'pipeline', b: false, i: true }, { t: ' RAG com segurança em código', b: false }]])
      .texto('Text 10', [[{ t: 'c', b: true }, { t: ' Desenvolver a interface ', b: false }, { t: 'web', b: false, i: true }, { t: ' de consulta', b: false }]])
      .texto('Text 11', [[{ t: 'd', b: true }, { t: ' Avaliar tecnicamente a recuperação', b: false }]])
      .texto('Text 12', [[{ t: 'e', b: true }, { t: ' Avaliar a correção e a fundamentação das respostas', b: false }]])
      .texto('Text 12f', [[{ t: 'f', b: true }, { t: ' Identificar as limitações do sistema e da avaliação', b: false }]])
};

S[7] = {
  notas:
    'O conceito central é a Geração Aumentada por Recuperação. Em vez de o modelo responder só com o que aprendeu no treinamento, o sistema primeiro busca os trechos pertinentes numa base de documentos, coloca esses trechos no prompt, e o modelo redige a resposta a partir deles. Assim, cada afirmação pode citar sua fonte, e o conhecimento é atualizado trocando a base, sem retreinar o modelo.\n\nNeste trabalho, a recuperação, que é o R do RAG, é híbrida: são duas buscas independentes na mesma base de trechos. A busca vetorial aproxima sinônimos e paráfrases, e a busca textual acerta termos exatos, como PQT-U. As duas listas são unidas pela fusão por posição recíproca, e os oito trechos mais bem colocados vão para o prompt.',
  editar: (s) =>
    s
      .texto('Text 2', ['4 · Fundamentação teórica'])
      .texto('Text 3', ['Geração Aumentada por Recuperação (RAG)'])
      .texto('Text 5', ['Recuperação'])
      .geom('Text 5', { x: 1.37, w: 3.0 })
      .texto('Text 6', ['busca os trechos pertinentes'])
      .geom('Text 6', { x: 1.37, w: 3.0 })
      .texto('Text 8', ['Aumento'])
      .geom('Text 8', { x: 5.17, w: 3.0 })
      .texto('Text 9', ['os trechos entram no prompt'])
      .geom('Text 9', { x: 5.17, w: 3.0 })
      .texto('Text 11', ['Geração'])
      .geom('Text 11', { x: 8.96, w: 3.0 })
      .texto('Text 12', ['o modelo responde só com eles'])
      .geom('Text 12', { x: 8.96, w: 3.0 })
      .texto('Text 13', ['Assim, cada afirmação pode citar a sua fonte, e o conhecimento é atualizado pela base, sem retreinar o modelo.'])
      .geom('Text 13', { y: 3.4, h: 0.7 })
      // Segunda fileira: a recuperação híbrida usada neste trabalho.
      .clonar('Text 13', 'Rótulo híbrida')
      .texto('Rótulo híbrida', ['NESTE TRABALHO, A RECUPERAÇÃO É HÍBRIDA: DUAS BUSCAS NA MESMA BASE'], { sz: 12, cor: AZUL, b: true })
      .geom('Rótulo híbrida', { y: 4.2, h: 0.3 })
      .clonar('Shape 4', 'Card V', { dy: 2.55 })
      .clonar('Shape 7', 'Card T', { dy: 2.55 })
      .clonar('Shape 10', 'Card R', { dy: 2.55 })
      .clonar('Image 2', 'Seta 1', { dy: 2.55 })
      .clonar('Image 3', 'Seta 2', { dy: 2.55 })
      .clonar('Text 5', 'V titulo', { dy: 2.55 })
      .clonar('Text 6', 'V def', { dy: 2.55 })
      .clonar('Text 8', 'T titulo', { dy: 2.55 })
      .clonar('Text 9', 'T def', { dy: 2.55 })
      .clonar('Text 11', 'R titulo', { dy: 2.55 })
      .clonar('Text 12', 'R def', { dy: 2.55 })
      .texto('V titulo', ['Busca vetorial'])
      .texto('V def', [[{ t: 'aproxima sinônimos e paráfrases' }]])
      .texto('T titulo', ['Busca textual'])
      .texto('T def', ['acerta termos exatos, como PQT-U'])
      .texto('R titulo', ['Fusão RRF'])
      .texto('R def', ['une as duas listas pela posição'])
      // As duas buscas são independentes (hybrid-search.service.ts): "+" entre elas, seta só para a fusão.
      .remover('Seta 1')
      .clonar('V titulo', 'Mais')
      .texto('Mais', ['+'], { sz: 28, cor: AZUL })
      .geom('Mais', { x: 4.52, y: 4.86, w: 0.5, h: 0.55 })
      .texto('Text 14', ['Fonte: Lewis et al. (2020); Cormack, Clarke e Büttcher (2009).'])
};

S[8] = {
  notas:
    'Os trabalhos mais próximos são de dois tipos. RAG em medicina, como o MIRAGE e o Almanac, em inglês e sem foco em hanseníase. E IA aplicada à hanseníase, voltada a diagnóstico por imagem e triagem, que classifica casos mas não responde dúvidas.\n\nA lacuna que este trabalho ocupa é o apoio informacional em português, com documentos oficiais, fontes verificadas e segurança implementada em código.',
  editar: (s) =>
    s
      .texto('Text 2', ['5 · Trabalhos relacionados'])
      .texto('Text 3', ['RAG em medicina e IA em hanseníase: o que falta'])
      .tabela(
        'Table 0',
        [
          ['Trabalho', 'Proposta', 'Lacuna'],
          ['Xiong et al. (2024)', 'Benchmark de RAG médico (MIRAGE)', 'Só múltipla escolha, em inglês'],
          ['Zakka et al. (2024)', 'Almanac: RAG em fontes curadas', 'Em inglês; sem foco em hanseníase'],
          ['Fernandes et al. (2024)', 'Revisão de IA na hanseníase', 'Foco em diagnóstico por imagem'],
          ['Barbieri et al. (2022)', 'AI4Leprosy: imagens e dados clínicos', 'Classifica casos, não responde dúvidas']
        ],
        { sz: 14 }
      )
      .geom('Shape 4', { h: 0.95 })
      .texto('Text 6', ['Apoio informacional em português, com documentos oficiais, fontes verificadas e segurança em código'])
      .geom('Text 6', { x: 3.1, w: 8.8, h: 0.65 })
};

S[9] = {
  notas:
    'A pesquisa é aplicada e segue a pesquisa em ciência do design, no processo de Peffers: identificar o problema, definir os objetivos, projetar e desenvolver, demonstrar, avaliar e comunicar. A abordagem é quantitativa.\n\nForam duas avaliações: a técnica, com 32 perguntas de referência, e a experimental, com 50 perguntas curadas a partir de dúvidas publicadas, avaliadas por um modelo de linguagem com rubrica fixa.',
  editar: (s) =>
    s
      .texto('Text 2', ['6 · Metodologia'])
      .geom('Shape 4', { h: 1.68 })
      .geom('Shape 8', { h: 1.68 })
      .geom('Shape 12', { h: 1.68 })
      .geom('Shape 16', { h: 1.68 })
      .texto('Text 3', ['Pesquisa em ciência do design'])
      .texto('Text 6', ['Requisitos'])
      .texto('Text 7', ['problema, literatura e objetivos'])
      .geom('Text 7', { h: 0.45 })
      .texto('Text 10', ['Base oficial'])
      .texto('Text 11', ['5 documentos, 328 trechos'])
      .geom('Text 11', { h: 0.45 })
      .texto('Text 14', ['Sistema'])
      .texto('Text 15', [[{ t: 'pipeline', i: true }, { t: ' RAG, interface e testes' }]])
      .geom('Text 15', { h: 0.45 })
      .texto('Text 18', ['Avaliação'])
      .texto('Text 19', ['técnica e experimental'])
      .geom('Text 19', { h: 0.45 })
      .texto('Text 22', ['Aplicada, exploratória e descritiva, de abordagem quantitativa (Peffers et al., 2007)'])
      .geom('Text 22', { h: 0.7 })
      .texto('Text 25', ['Node.js, React, PostgreSQL com pgvector e modelos da OpenAI; PCDT e documentos da OMS'])
      .geom('Text 25', { h: 0.7 })
      .clonar('Shape 20', 'Linha aval', { dy: 1.45 })
      .clonar('Text 21', 'Rótulo aval', { dy: 1.45 })
      .clonar('Text 22', 'Texto aval', { dy: 1.45 })
      .geom('Linha aval', { w: 10.9 })
      .texto('Rótulo aval', ['AVALIAÇÕES'])
      .texto('Texto aval', ['Técnica: 32 perguntas de referência, com métricas automáticas · Experimental: 50 perguntas curadas, avaliadas por um modelo de linguagem com rubrica fixa'])
      .geom('Texto aval', { w: 10.9 })
};

S[10] = {
  notas:
    'Este é o NexoHansen, publicado na Vercel. À esquerda, uma resposta real: ela começa respondendo diretamente, traz citações numeradas e uma nota de segurança com o risco clínico. À direita, a lista de fontes, com o documento, a seção e a página, e um link que abre o PDF oficial na página citada.\n\nSe houver tempo, mostrar o sistema funcionando ao vivo ou um vídeo curto de tela.',
  editar: (s) => {
    s.texto('Text 2', ['6 · Metodologia · a solução'])
      .texto('Text 3', ['NexoHansen'])
      .texto('Text 5', ['Respostas com fontes'])
      .texto('Text 6', ['citações numeradas, com a página do documento'])
      .texto('Text 8', ['Segurança em código'])
      .texto('Text 9', ['recusa diagnóstico, prescrição e urgências'])
      .texto('Text 11', ['Rastreabilidade'])
      .texto('Text 12', ['cada consulta é registrada para auditoria'])
      .remover('Shape 13', 'Text 14')
      .geom('Text 15', { x: 5.57, y: 6.08, w: 6.53, h: 0.3 })
      .texto('Text 15', ['Respostas reais do sistema: citações numeradas e lista de fontes'], { i: false, cor: CINZA });
    const h = 3.9;
    const d = pngDim(FIG('fig-resposta.png'));
    const w = (h * d.w) / d.h;
    const x0 = 5.57 + (6.53 - (2 * w + 0.3)) / 2;
    return s
      .imagem(FIG('fig-resposta.png'), 'Captura resposta', 'Resposta do NexoHansen com citações numeradas e nota de segurança', { x: x0, y: 2.05, w, h })
      .imagem(FIG('fig-fontes.png'), 'Captura fontes', 'Lista de fontes de uma resposta, com o trecho da primeira fonte', { x: x0 + w + 0.3, y: 2.05, w, h });
  }
};

// Cópia do slide 9: o fluxo de uma consulta.
S[17] = {
  notas:
    'Uma pergunta passa por quatro etapas. Primeiro, o modelo reescreve a pergunta no contexto da conversa e na terminologia dos documentos. Depois, a busca híbrida combina a busca vetorial e a textual. Antes de gerar qualquer coisa, a camada de segurança aplica regras em código: pedidos de diagnóstico, prescrição ou situações de urgência são recusados com uma mensagem fixa. Por fim, o modelo redige a resposta só com os trechos recuperados, e o sistema verifica se cada citação corresponde ao trecho citado.\n\nTudo isso é registrado, para que se possa reconstituir por que cada resposta foi dada ou recusada.',
  editar: (s) =>
    s
      .texto('Text 2', ['6 · Metodologia · o pipeline'])
      .geom('Shape 4', { h: 1.68 })
      .geom('Shape 8', { h: 1.68 })
      .geom('Shape 12', { h: 1.68 })
      .geom('Shape 16', { h: 1.68 })
      .texto('Text 3', ['Como uma pergunta é respondida'])
      .texto('Text 6', ['Interpretação'])
      .texto('Text 7', ['reescreve a pergunta no contexto'])
      .geom('Text 7', { h: 0.45 })
      .texto('Text 10', ['Busca híbrida'])
      .texto('Text 11', ['vetorial e textual, com fusão RRF'])
      .geom('Text 11', { h: 0.45 })
      .texto('Text 14', ['Segurança'])
      .texto('Text 15', ['regras em código, antes da geração'])
      .geom('Text 15', { h: 0.45 })
      .texto('Text 18', ['Geração'])
      .texto('Text 19', ['só com os trechos; citações verificadas'])
      .geom('Text 19', { h: 0.45 })
      .texto('Text 21', ['BASE DE CONHECIMENTO'])
      .texto('Text 22', ['5 documentos oficiais do Ministério da Saúde e da OMS, em 328 trechos com seção e página'])
      .geom('Text 22', { h: 0.7 })
      .texto('Text 24', ['RASTREABILIDADE'])
      .texto('Text 25', ['Cada consulta registra os trechos, as pontuações e as decisões de segurança'])
      .geom('Text 25', { h: 0.7 })
};

/** Gráfico de barras dos slides de resultado: três barras com rótulo e valor. */
function grafico(s, titulo, barras) {
  const base = 5.95;
  const max = Math.max(...barras.map((b) => b.v));
  s.texto('Text 8', [titulo]);
  [['Shape 11', 'Text 10', 'Text 16'], ['Shape 13', 'Text 12', 'Text 17'], ['Shape 15', 'Text 14', 'Text 18']].forEach(([barra, valor, rotulo], k) => {
    const b = barras[k];
    const h = Math.max(0.12, (2.4 * b.v) / max);
    const x = [7.64, 9.19, 10.75][k];
    s.barra(barra, { y: base - h, h, cor: b.cor });
    s.texto(valor, [b.valor], { alinhar: 'ctr' }).geom(valor, { x: x + 0.415 - 0.6, y: base - h - 0.3, w: 1.2 });
    s.texto(rotulo, [b.rotulo], { alinhar: 'ctr' }).geom(rotulo, { x: x + 0.415 - 0.75, w: 1.5 });
  });
  return s;
}

S[11] = {
  notas:
    'Na avaliação técnica, com 32 perguntas de referência, o sistema teve o comportamento esperado em todas: respondeu o que devia responder, recusou os pedidos de diagnóstico e prescrição, declarou quando a base não tratava do assunto e respondeu as perguntas que a versão anterior recusava por engano.\n\nO gráfico mostra a evolução: a versão preliminar recusava tudo, porque o limiar de relevância era incompatível com a escala das pontuações. Corrigida a recuperação, a versão sem OpenAI já chegava a 94%, e a versão final, a 100%. A evidência esteve entre os trechos enviados ao modelo em todas as 25 perguntas que a possuem.',
  editar: (s) =>
    grafico(
      s
        .texto('Text 2', ['7 · Resultados · avaliação técnica'])
        .texto('Text 3', ['Comportamento correto nas 32 perguntas'])
        .texto('Text 5', ['100%'])
        .texto('Text 6', ['das perguntas de referência tiveram o comportamento esperado'])
        .geom('Text 6', { h: 0.65 })
        .texto('Text 7', ['A evidência esteve entre os trechos enviados ao modelo em todas as 25 perguntas que a possuem. A versão preliminar recusava todas, por um limiar incompatível com a escala das pontuações.'])
        .geom('Text 7', { y: 3.6, h: 1.7 }),
      'Comportamento correto, por versão do sistema',
      [
        { v: 16, valor: '16%', rotulo: 'Preliminar' },
        { v: 94, valor: '94%', rotulo: 'Atual, local' },
        { v: 100, valor: '100%', rotulo: 'Atual + OpenAI' }
      ]
    )
};

S[12] = {
  notas:
    'Na avaliação experimental, as 50 perguntas vieram, em sua maioria, de dúvidas publicadas, e cada uma foi respondida duas vezes. Um modelo de linguagem avaliou as respostas com uma rubrica fixa, comparando com respostas de referência construídas a partir dos documentos.\n\n65,3% das respostas foram consideradas corretas, e nenhuma teve erro com potencial de dano. A maior parte das respostas incorretas estava incompleta, e não errada. As falhas se concentraram em tratamento, em esquemas de segunda linha e interações, e parte delas vem da extração das tabelas do PCDT.',
  editar: (s) =>
    s
      .texto('Text 2', ['7 · Resultados · avaliação experimental'])
      .texto('Text 3', ['Respostas fundamentadas, nem sempre completas'])
      .texto('Text 5', ['65,3%'])
      .texto('Text 6', ['Respostas corretas'])
      .texto('Text 7', ['IC 95%: 55,5% a 74,0%'])
      .texto('Text 9', ['0'])
      .texto('Text 10', ['Erros graves'])
      .texto('Text 11', ['nenhum com risco de dano'])
      .texto('Text 13', ['32%'])
      .texto('Text 14', ['Tratamento'])
      .texto('Text 15', ['tema com mais falhas'])
      .clonar('Text 7', 'Achado 1', { dy: 0 })
      .clonar('Text 7', 'Achado 2', { dy: 0 })
      .clonar('Text 7', 'Achado 3', { dy: 0 })
      .texto('Achado 1', [[{ t: '100%', b: true, cor: AZUL }, { t: ' das perguntas fora dos documentos foram reconhecidas, sem inventar resposta', b: false }]])
      .geom('Achado 1', { x: 1.22, y: 4.15, w: 10.9, h: 0.38 })
      .texto('Achado 2', [[{ t: '0,98', b: true, cor: AZUL }, { t: ' de precisão das afirmações: o que o sistema afirma está nos documentos', b: false }]])
      .geom('Achado 2', { x: 1.22, y: 4.7, w: 10.9, h: 0.38 })
      .texto('Achado 3', [[{ t: '88%', b: true, cor: AZUL }, { t: ' das perguntas tiveram o mesmo veredito nas duas execuções', b: false }]])
      .geom('Achado 3', { x: 1.22, y: 5.25, w: 10.9, h: 0.38 })
};

// Cópia do slide 11: a escolha do modelo gerador.
S[18] = {
  notas:
    'Comparei seis configurações de modelo gerador da OpenAI. Todas tiveram o comportamento esperado nas 32 perguntas; a diferença ficou no tamanho das respostas e no custo. O gpt-6-luna sem raciocínio teve desempenho equivalente ao modelo usado antes, com custo 41% menor e tempo mediano de 7,3 segundos por consulta, e passou a ser o padrão do sistema. O gpt-5-mini, por exemplo, custou quatro vezes mais sem ganho nas métricas.',
  editar: (s) =>
    grafico(
      s
        .texto('Text 2', ['7 · Resultados · escolha do modelo'])
        .texto('Text 3', ['Mesmo desempenho, custo 41% menor'])
        .texto('Text 5', ['−41%'])
        .texto('Text 6', [[{ t: 'de custo por pergunta com o ' }, { t: 'gpt-6-luna', fonte: 'Courier New' }, { t: ', em relação ao modelo anterior' }]])
        .geom('Text 6', { h: 0.65 })
        .texto('Text 7', ['Seis configurações tiveram o comportamento esperado nas 32 perguntas; a diferença ficou no tamanho das respostas e no custo. O modelo escolhido também foi dos mais rápidos: 7,3 s por consulta.'])
        .geom('Text 7', { y: 3.6, h: 1.7 }),
      'Custo por 1.000 perguntas (US$)',
      [
        { v: 0.91, valor: 'US$ 0,91', rotulo: 'gpt-4o-mini' },
        { v: 3.6, valor: 'US$ 3,60', rotulo: 'gpt-5-mini' },
        { v: 0.54, valor: 'US$ 0,54', rotulo: 'gpt-6-luna' }
      ]
    )
};

S[13] = {
  notas:
    'Respondendo à pergunta de pesquisa: é possível projetar um sistema RAG rastreável e seguro para a hanseníase. As decisões de arquitetura, com segurança e rastreabilidade em código, produziram recusas apenas nos casos previstos; a recuperação encontrou a evidência em todas as perguntas que a possuem; e 65,3% das respostas foram corretas, sem erro de potencial dano.\n\nMas as respostas ainda precisam de revisão profissional antes de qualquer uso assistencial. A contribuição é o sistema publicado e um protocolo de avaliação reprodutível.',
  editar: (s) =>
    s
      .texto('Text 2', ['8 · Conclusão'])
      .texto('Text 3', ['Um RAG rastreável e seguro é viável, mas ainda requer revisão profissional'])
      .clonar('Text 6', 'Síntese')
      .texto('Síntese', ['Recusas só nos casos previstos, evidência encontrada em todas as perguntas que a possuem e 65,3% de respostas corretas, sem erro de potencial dano.'], { sz: 16, cor: CINZA })
      .geom('Síntese', { x: 1.22, y: 2.75, w: 10.0, h: 0.75 })
      .texto('Text 5', ['Arquitetura'])
      .texto('Text 6', ['segurança e rastreabilidade em código'])
      .texto('Text 8', ['Recuperação'])
      .texto('Text 9', ['evidência achada nas 25 perguntas'])
      .texto('Text 11', ['Contribuição'])
      .texto('Text 12', ['sistema publicado e avaliação reprodutível'])
};

S[14] = {
  notas:
    'As principais limitações: a base e as respostas não foram revisadas por profissional de saúde; a avaliação comparativa com participantes, entre respostas com e sem RAG, não foi realizada; a avaliação das respostas foi feita por um modelo de linguagem; e as tabelas dos documentos perdem a estrutura na extração, o que causou parte dos erros.\n\nOs trabalhos futuros atacam essas limitações, a começar pela avaliação comparativa e pela validação com especialistas.',
  editar: (s) => {
    s.texto('Text 2', ['8 · Conclusão'])
      .geom('Shape 4', { h: 3.45 })
      .geom('Shape 9', { h: 3.45 })
      .clonar('Text 8', 'Text 8d')
      .clonar('Text 13', 'Text 13d');
    const lim = ['• Base e respostas sem revisão de profissional de saúde', '• Avaliação comparativa com participantes não realizada', '• Respostas avaliadas apenas por um modelo de linguagem', '• Tabelas dos documentos perdem a estrutura na extração'];
    const fut = ['• Comparar respostas com e sem RAG, com participantes', '• Validar o conteúdo e as respostas com especialistas', '• Extrair as tabelas de forma estruturada', '• Ampliar a base com outros documentos oficiais'];
    ['Text 6', 'Text 7', 'Text 8', 'Text 8d'].forEach((n, k) => s.texto(n, [lim[k]]).geom(n, { y: 2.61 + k * 0.7, h: 0.64 }));
    ['Text 11', 'Text 12', 'Text 13', 'Text 13d'].forEach((n, k) => s.texto(n, [fut[k]]).geom(n, { y: 2.61 + k * 0.7, h: 0.64 }));
    return s;
  }
};

S[15] = {
  notas: 'Estas são as referências centrais; a lista completa está no TCC.',
  editar: (s) =>
    s
      .texto('Text 2', ['Referências'])
      .texto('Text 5', ['LEWIS, P. et al. Retrieval-augmented generation for knowledge-intensive NLP tasks. NeurIPS, 2020.'])
      .texto('Text 6', ['Origem da arquitetura RAG'])
      .texto('Text 8', ['BRASIL. Ministério da Saúde. Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase. 2022.'])
      .texto('Text 9', ['Fonte primária da base de conhecimento'])
      .texto('Text 11', ['PEFFERS, K. et al. A design science research methodology for information systems research. 2007.'])
      .texto('Text 12', ['Processo metodológico da pesquisa'])
      .texto('Text 14', ['ZHENG, L. et al. Judging LLM-as-a-judge with MT-Bench and Chatbot Arena. NeurIPS, 2023.'])
      .texto('Text 15', ['Base da avaliação automatizada das respostas'])
};

S[16] = {
  notas: 'Agradeço à banca, ao professor Élisson pela orientação e a todos que acompanharam o trabalho. Fico à disposição para perguntas.',
  editar: (s) =>
    s
      .texto('Text 1', [CURSO])
      .geom('Text 1', { w: 6.2 })
      .geom('Text 4', { x: 1.22, w: 3.5 })
      .texto('Text 5', ['Igor Emanuel Oliveira Rêgo'])
      .geom('Text 5', { x: 1.22, w: 3.5 })
      .geom('Text 6', { x: 5.0, w: 4.0 })
      .texto('Text 7', ['igor.oliveirarego@upe.br'])
      .geom('Text 7', { x: 5.0, w: 4.0 })
};

// Ordem final: as cópias entram depois da solução (17) e depois do resultado principal (18).
const ORDEM = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 17, 11, 12, 18, 13, 14, 15, 16];

// As notas do apresentador vêm da fala da defesa (fala_defesa.md): uma seção "## Slide N" por slide,
// na ordem de exibição. Parágrafos que começam com ">" são lembretes e ficam fora das notas. Sem o
// arquivo, valem as notas escritas acima.
const FALA = path.join(__dirname, 'fala_defesa.md');
function notasDaFala() {
  if (!fs.existsSync(FALA)) return;
  const partes = fs.readFileSync(FALA, 'utf8').replace(/\r/g, '').split(/^## Slide (\d+)\b[^\n]*$/m);
  for (let i = 1; i < partes.length; i += 2) {
    const n = ORDEM[Number(partes[i]) - 1];
    const texto = partes[i + 1]
      .split(/^---$/m)[0]
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p && !p.startsWith('>'))
      .map((p) => p.replace(/\s*\n\s*/g, ' ').replace(/\*\*|\*|`/g, ''))
      .join('\n\n');
    if (n && texto) S[n].notas = texto;
  }
}

// ---------------------------------------------------------------------------
async function main() {
  notasDaFala();
  const zip = await JSZip.loadAsync(fs.readFileSync(TEMPLATE));
  const ler = (f) => zip.file(f).async('string');
  let tipos = await ler('[Content_Types].xml');
  let relsPres = await ler('ppt/_rels/presentation.xml.rels');
  let pres = await ler('ppt/presentation.xml');

  // Cópias de slides (com notas próprias), antes de qualquer edição.
  for (const [nova, origem] of [[17, 9], [18, 11]]) {
    zip.file(`ppt/slides/slide${nova}.xml`, await ler(`ppt/slides/slide${origem}.xml`));
    zip.file(`ppt/slides/_rels/slide${nova}.xml.rels`, (await ler(`ppt/slides/_rels/slide${origem}.xml.rels`)).replace(`notesSlide${origem}.xml`, `notesSlide${nova}.xml`));
    zip.file(`ppt/notesSlides/notesSlide${nova}.xml`, await ler(`ppt/notesSlides/notesSlide${origem}.xml`));
    zip.file(`ppt/notesSlides/_rels/notesSlide${nova}.xml.rels`, (await ler(`ppt/notesSlides/_rels/notesSlide${origem}.xml.rels`)).replace(`slide${origem}.xml`, `slide${nova}.xml`));
    tipos = tipos.replace(
      '</Types>',
      `<Override PartName="/ppt/slides/slide${nova}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/notesSlides/notesSlide${nova}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/></Types>`
    );
    relsPres = relsPres.replace('</Relationships>', `<Relationship Id="rIdApresSlide${nova}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${nova}.xml"/></Relationships>`);
  }

  // Ordem dos slides.
  const rIdDe = (n) => (relsPres.match(new RegExp(`Id="([^"]+)"[^>]*Target="slides/slide${n}\\.xml"`)) || [])[1];
  const idsExistentes = [...pres.matchAll(/<p:sldId id="(\d+)" r:id="([^"]+)"\/>/g)];
  const idDe = new Map(idsExistentes.map((m) => [m[2], m[1]]));
  let proximoId = Math.max(...idsExistentes.map((m) => Number(m[1]))) + 1;
  const lista = ORDEM.map((n) => {
    const rId = rIdDe(n);
    return `<p:sldId id="${idDe.get(rId) ?? proximoId++}" r:id="${rId}"/>`;
  }).join('');
  pres = pres.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, `<p:sldIdLst>${lista}</p:sldIdLst>`);

  // Conteúdo e notas.
  for (const n of ORDEM) {
    const arq = `ppt/slides/slide${n}.xml`;
    const relsArq = `ppt/slides/_rels/slide${n}.xml.rels`;
    const s = new Slide(await ler(arq), await ler(relsArq), zip);
    S[n].editar(s);
    zip.file(arq, s.xml);
    zip.file(relsArq, s.rels);
    const notasArq = `ppt/notesSlides/notesSlide${n}.xml`;
    const notas = await ler(notasArq);
    const paras = S[n].notas
      .split('\n\n')
      .map((p) => `<a:p><a:r><a:rPr lang="pt-BR" dirty="0"/><a:t>${esc(p)}</a:t></a:r></a:p>`)
      .join('');
    zip.file(notasArq, notas.replace(/(<p:ph type="body"[^>]*\/>[\s\S]*?<p:txBody><a:bodyPr\/><a:lstStyle\/>)[\s\S]*?(<\/p:txBody>)/, `$1${paras}$2`));
  }

  zip.file('[Content_Types].xml', tipos);
  zip.file('ppt/_rels/presentation.xml.rels', relsPres);
  zip.file('ppt/presentation.xml', pres);
  const app = await ler('docProps/app.xml');
  zip.file('docProps/app.xml', app.replace(/<Slides>\d+<\/Slides>/, `<Slides>${ORDEM.length}</Slides>`).replace(/<Notes>\d+<\/Notes>/, `<Notes>${ORDEM.length}</Notes>`));
  fs.writeFileSync(SAIDA, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log(`Apresentação gerada: ${SAIDA} (${ORDEM.length} slides)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
