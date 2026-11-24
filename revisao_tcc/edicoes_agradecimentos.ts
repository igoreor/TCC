// Agradecimentos redigidos pelo autor (16/11/2026), no lugar do marcador [REESCREVER PELO AUTOR] que
// apontava a semelhança do rascunho com o TCC usado como exemplo. Aplicado por
// avaliacao/tcc/aplicar_revisao.ts depois das demais revisões. Para corrigir a grafia de um nome,
// altere o texto aqui e regere o TCC: edições feitas à mão no .docx são sobrescritas na regeração.
// Nomes conferidos pelo autor no Google Docs em 19/11/2026; sem negrito, que fica reservado aos títulos
// principais.
import type { Edicao } from '../avaliacao/tcc/aplicar_revisao';

const PARAGRAFOS = [
  'Chegar até aqui não foi uma caminhada fácil. Foram anos de aprendizado, desafios, dificuldades, conquistas e, principalmente, de pessoas que fizeram parte dessa trajetória. Por isso, quero aproveitar este espaço para agradecer a todos que, de alguma forma, contribuíram para que eu chegasse até este momento tão importante da minha vida.',
  'Primeiramente, agradeço à minha mãe, Maria José, por tudo. Pela criação, pelo cuidado, pelos ensinamentos, pelos sacrifícios e por sempre fazer o possível para que eu tivesse oportunidades de crescer. Se hoje estou concluindo essa etapa, é porque tive uma mãe que nunca deixou de acreditar em mim e que sempre me incentivou a seguir em frente. Essa conquista também é sua.',
  'À minha irmã, Jullyana, e ao meu cunhado, Márcio, agradeço pelo apoio, pela confiança e por estarem presentes ao longo dessa caminhada. Aos meus tios de coração, Rodrigo e Daniele, que também tiveram um papel muito importante no meu crescimento, deixo meu carinho e minha gratidão.',
  'À minha madrinha Synara e ao meu padrinho Renato, um agradecimento mais do que especial. Durante esses quatro anos em Garanhuns, vocês me acolheram e me deram muito mais do que um lugar para morar. Foram quatro anos de casa, comida, roupa lavada, cuidado e apoio. Vocês tornaram essa jornada muito mais leve e fizeram com que eu me sentisse em casa, mesmo estando longe da minha. Não tenho palavras suficientes para agradecer por tudo que fizeram por mim.',
  'Agradeço também à minha prima Pietra, às minhas tias Edinha, Adriana e Rosa, aos meus tios Guilhermando e William e aos meus primos Sandro e Sérgio, por todo o carinho e suporte ao longo desses anos. Deixo um agradecimento especial à minha Tia Edinha, Dona Edna, e ao meu Tio inho, Guilhermando, que estiveram presentes na minha criação e fizeram parte de muitos momentos importantes da minha vida. Sou muito grato por tudo que recebi de vocês.',
  'Ao meu genitor, Arthur, agradeço pela vida.',
  'À minha namorada, Maylla Macedo, que esteve ao meu lado desde o início da faculdade até a conclusão dessa etapa, meu muito obrigado. Você acompanhou de perto as dificuldades, as preocupações, os momentos de cansaço e também as pequenas e grandes conquistas desses anos. Obrigado pela companhia, pelo carinho, pelo apoio e por fazer parte de uma fase tão importante da minha vida. É muito especial poder olhar para trás e saber que você esteve comigo durante toda essa caminhada.',
  'Aos professores que passaram pela minha formação, deixo minha gratidão por todo o conhecimento compartilhado, pelas cobranças, pelos conselhos e pelas experiências que levarei comigo. Em especial, agradeço aos professores Élisson, Victor, Eraylson, Adauto, Aeda, Marcelo, Ivaldir, Cleiton, Renato, Brunno, Ewerton, Milton e Emanoel. Cada um, à sua maneira, contribuiu para minha formação acadêmica e pessoal. São professores pelos quais tenho um carinho enorme e que guardarei na memória mesmo depois de deixar a universidade.',
  'Ao professor Élisson, nosso querido Tico, um agradecimento especial pelas aulas, pelas conversas e também pelas partidas de CS. É muito bom quando a relação entre professor e aluno vai além da sala de aula e se transforma em amizade.',
  'Ao professor Emanoel, agradeço também pela paciência, porque sei que dei um certo trabalho. A disciplina de Haskell quase virou um obstáculo a mais nessa caminhada, mas, no final, deu tudo certo. Hoje fica o aprendizado e uma boa história para contar.',
  'Aos meus amigos da faculdade, especialmente ao grupo carinhosamente conhecido como The Boys, meu muito obrigado. Marcos Pierre, Jeová Bezerra, Arthur Leite, Mickael Albuquerque, Nathan Dalbert, João Lucas, Emerson Feitosa, Paulo Henrique, Ocimar Schroeder, Julio Almeida, João Gabriel e Rian Noronha: vocês fizeram esses anos serem muito mais divertidos e especiais. Foram incontáveis conversas, brincadeiras, trabalhos, dificuldades compartilhadas e momentos que certamente ficarão na memória. A faculdade não teria sido a mesma sem vocês.',
  'Agradeço também ao meu amigo Roni Rangel, pela amizade e por fazer parte dessa trajetória, e a todos os demais colegas de turma com quem tive a oportunidade de conviver. Cada amizade, conversa e experiência compartilhada fez parte da pessoa que me tornei ao longo desses anos.',
  'Ao meu primo e fisioterapeuta Victor Sales, deixo também um agradecimento especial. Obrigado pela amizade, pelas caronas, pelos momentos no vôlei, pelas conversas e por toda a parceria durante essa caminhada. São essas companhias do dia a dia que muitas vezes tornam os períodos mais difíceis um pouco mais leves.',
  'Por fim, agradeço a todas as pessoas que passaram pela minha vida durante esses anos, mesmo aquelas que não consegui mencionar pelo nome. Cada pessoa que me ofereceu ajuda, uma palavra de incentivo, uma oportunidade, um conselho ou simplesmente bons momentos contribuiu, de alguma forma, para que eu chegasse até aqui.',
  'Encerro essa etapa com a certeza de que minha formação vai muito além do conhecimento adquirido dentro da sala de aula. Levo comigo amizades, histórias, aprendizados e uma enorme gratidão por todos que fizeram parte desse caminho.',
  'A todos vocês, meu muito obrigado. Essa conquista também tem um pouco de cada um.'
];

export const edicoes: Edicao[] = [
  {
    id: 'A-001',
    secao: 'Agradecimentos',
    motivo: 'Texto dos agradecimentos redigido pelo autor, no lugar do marcador de reescrita.',
    tipo: 'substituir',
    antes: '[REESCREVER PELO AUTOR: o texto dos agradecimentos do rascunho',
    depois: PARAGRAFOS[0]
  },
  {
    id: 'A-002',
    secao: 'Agradecimentos',
    motivo: 'Demais parágrafos dos agradecimentos.',
    tipo: 'inserir_depois',
    antes: 'Chegar até aqui não foi uma caminhada fácil.',
    blocos: PARAGRAFOS.slice(1).map((texto) => ({ tipo: 'paragrafo' as const, texto }))
  }
];
