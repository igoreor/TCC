// Vocabulário do domínio. Serve para três decisões: (1) se a pergunta já menciona a hanseníase;
// (2) se ela trata explicitamente de outro assunto; (3) quais variantes de termos acrescentar à
// busca textual, que não reconhece siglas nem sinônimos.

/** Termos que, sozinhos, situam a pergunta na hanseníase. */
export const HANSENIASE_ANCHOR_TERMS = [
  'hanseniase',
  'hansen*',
  'lepra',
  'leprosy',
  'leprae',
  'm leprae',
  'mycobacterium leprae',
  'paucibacilar*',
  'multibacilar*',
  'pqt',
  'pqt-u',
  'poliquimioterapia',
  'baciloscopia',
  'reacao hansenica',
  'reacoes hansenicas',
  'reacao reversa',
  'eritema nodoso',
  'enh',
  'virchowiana',
  'virchowianos',
  'tuberculoide',
  'dimorfa',
  'neural pura',
  'clofazimina',
  'talidomida',
  'grau de incapacidade',
  'gif',
  'gif2',
  'avaliacao neurologica simplificada'
] as const;

/**
 * Assuntos claramente alheios à hanseníase. A pergunta só é considerada fora do escopo quando cita
 * um destes termos e nenhum termo do domínio — "diabetes em pacientes com hanseníase" continua no
 * escopo, porque comorbidades fazem parte do protocolo.
 */
export const OTHER_DOMAIN_TERMS = [
  'diabetes',
  'diabetico*',
  'hipertensao',
  'pressao alta',
  'covid*',
  'coronavirus',
  'dengue',
  'zika',
  'chikungunya',
  'malaria',
  'cancer',
  'tumor',
  'asma',
  'gripe',
  'influenza',
  'hepatite',
  'sifilis',
  'tuberculose',
  'hiv',
  'aids',
  'depressao',
  'ansiedade',
  'obesidade',
  'colesterol',
  'investimento*',
  'bolsa de valores',
  'futebol',
  'receita de bolo',
  'culinaria',
  'programacao',
  'javascript',
  'previsao do tempo',
  'eleicao',
  'eleicoes'
] as const;

/**
 * Variantes acrescentadas à consulta textual quando a pergunta contém a chave. A busca vetorial
 * lida razoavelmente com sinônimos; a textual, não.
 */
export const QUERY_EXPANSIONS: ReadonlyArray<{ terms: readonly string[]; expansion: string }> = [
  { terms: ['pb'], expansion: 'paucibacilar' },
  { terms: ['mb'], expansion: 'multibacilar' },
  { terms: ['pqt', 'pqt-u'], expansion: 'poliquimioterapia única rifampicina dapsona clofazimina' },
  { terms: ['enh'], expansion: 'eritema nodoso hansênico reação tipo 2' },
  { terms: ['baar'], expansion: 'bacilos álcool-ácido resistentes baciloscopia' },
  { terms: ['ans'], expansion: 'avaliação neurológica simplificada' },
  { terms: ['gif', 'gif2'], expansion: 'grau de incapacidade física' },
  { terms: ['ib'], expansion: 'índice baciloscópico' },
  { terms: ['rom'], expansion: 'rifampicina ofloxacino minociclina' },
  {
    terms: ['pep', 'profilaxia pos-exposicao', 'quimioprofilaxia'],
    expansion: 'profilaxia pós-exposição dose única de rifampicina contatos'
  },
  { terms: ['lepra'], expansion: 'hanseníase' },
  { terms: ['crianca*', 'pediatric*', 'infantil'], expansion: 'menores de 15 anos crianças' },
  { terms: ['gestante*', 'gravida*', 'gravidez', 'gestacao'], expansion: 'gestação gestantes' },
  { terms: ['amamentacao', 'lactante*'], expansion: 'amamentação lactação' },
  {
    terms: ['contato*', 'familiar*', 'quem mora'],
    expansion: 'contatos domiciliares exame dermatoneurológico BCG'
  },
  { terms: ['remedio*'], expansion: 'medicamentos' },
  {
    terms: ['encaminh*', 'referencia'],
    expansion: 'encaminhamento referência atenção especializada'
  },
  {
    terms: ['sinais de alerta', 'sinais de gravidade', 'agravamento'],
    expansion: 'neurite reação hansênica perda de função neural'
  },
  { terms: ['cura', 'alta por cura'], expansion: 'alta por cura término do tratamento' },
  { terms: ['recidiva', 'voltou'], expansion: 'recidiva retratamento' },
  { terms: ['mancha*'], expansion: 'lesão de pele alteração de sensibilidade' },
  {
    terms: ['dormencia', 'dormente', 'formigamento'],
    expansion: 'alteração de sensibilidade térmica dolorosa tátil'
  },
  {
    terms: ['efeito* colatera*', 'efeito* adverso*'],
    expansion: 'eventos adversos reações adversas medicamentos'
  },
  { terms: ['corticoide*', 'corticosteroide*'], expansion: 'prednisona corticosteroide' }
];

/** Conectivos que costumam abrir uma pergunta de continuação ("E para crianças?"). */
export const FOLLOW_UP_OPENINGS = [
  'e',
  'mas',
  'e quanto',
  'e no caso',
  'nesse caso',
  'neste caso',
  'nesses casos',
  'e se',
  'e para',
  'e em',
  'tambem',
  'entao',
  'e sobre'
] as const;

/** Referências ao assunto anterior. */
export const ANAPHORA_TERMS = [
  'isso',
  'isto',
  'esse',
  'essa',
  'esses',
  'essas',
  'dele',
  'dela',
  'deles',
  'delas',
  'nele',
  'nela',
  'o mesmo',
  'a mesma',
  'os mesmos',
  'as mesmas',
  'acima',
  'anterior'
] as const;
