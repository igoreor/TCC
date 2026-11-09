// Fase 1: extrai as 50 perguntas da PARTE 3 de AVALIACAO_HANSENIASE.md para perguntas.json,
// remove os marcadores de nota ¹ e ², classifica as compostas (inferido) e grava o SHA-256.
// Uso: npx tsx avaliacao/fase1_perguntas.ts
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(__dirname, '..');
const protocolo = readFileSync(path.join(RAIZ, 'AVALIACAO_HANSENIASE.md'), 'utf8');
const parte3 = protocolo.slice(protocolo.indexOf('## PARTE 3'), protocolo.indexOf('## PARTE 4'));

// Perguntas que pedem duas ou mais informações distintas (classificação do avaliador, inferida;
// justificativa em DIARIO.md).
const COMPOSTAS: Record<string, string> = {
  T05: 'achados que sugerem a forma neural pura + como investigar o diagnóstico diferencial',
  T06: 'para que serve a baciloscopia + como é feita a coleta',
  T07: 'como interpretar o teste rápido + desempenho diagnóstico em diferentes populações',
  T09: 'o que é a avaliação neurológica simplificada + por que realizá-la',
  T14: 'o que é a dapsona + para que serve + quais cuidados exige',
  T21: 'achados que caracterizam a reação tipo 1 + como diferenciá-la',
  T22: 'por que a talidomida é usada + quais cuidados exige',
  T29: 'como reconhecer a dor neuropática + opções de cuidado',
  T30: 'problemas oculares + sinais que exigem avaliação urgente',
  T39: 'avaliações + registros do acompanhamento',
  T42: 'avaliação, BCG ou quimioprofilaxia dos contatos + cobertura no município',
  T44: 'fatores que contribuem para o estigma + como enfrentá-lo',
  T45: 'diretrizes da Estratégia Nacional + resultado epidemiológico posterior'
};

const ORIGENS: Array<[RegExp, string]> = [
  [/^Publicada/, 'publicada'],
  [/^Adaptação/, 'adaptação'],
  [/^Autoral/, 'autoral'],
  [/^Em decisão/, 'em decisão']
];

const blocos = parte3.split(/^### /m).slice(1);
const perguntas = blocos.map((bloco) => {
  const [cabecalho] = bloco.split('\n');
  const [id, tema, registro] = cabecalho.split('|').map((parte) => parte.trim());
  const origemTexto = bloco.match(/\*\*Origem:\*\*\s*(.+)/)![1].trim();
  const original = bloco.match(/\*\*Pergunta:\*\*\s*(.+)/)![1].trim();
  const pergunta = original.replace(/\s*[¹²]\s*$/u, '').replace(/[¹²]/gu, '').trim();
  return {
    id,
    tema,
    registro: registro === 'técnico' ? 'técnico' : 'leigo',
    origem: ORIGENS.find(([padrao]) => padrao.test(origemTexto))![1],
    origem_detalhe: origemTexto,
    pergunta,
    composta: id in COMPOSTAS,
    composta_fonte: 'inferida',
    composta_justificativa: COMPOSTAS[id] ?? null,
    marcador_removido: original !== pergunta ? original.match(/[¹²]/u)![0] : null
  };
});

if (perguntas.length !== 50) throw new Error(`esperadas 50 perguntas, encontradas ${perguntas.length}`);
const destino = path.join(__dirname, 'perguntas.json');
if (existsSync(path.join(__dirname, 'perguntas.sha256'))) {
  throw new Error('perguntas.json já foi congelado (perguntas.sha256 existe); o arquivo não pode mudar.');
}
const conteudo = JSON.stringify({ fonte: 'AVALIACAO_HANSENIASE.md, PARTE 3', perguntas }, null, 2) + '\n';
writeFileSync(destino, conteudo);
const hash = createHash('sha256').update(conteudo).digest('hex');
writeFileSync(path.join(__dirname, 'perguntas.sha256'), `${hash}  perguntas.json\n`);

const conta = (campo: string, valor: unknown) => perguntas.filter((p: any) => p[campo] === valor).length;
console.log(`perguntas: ${perguntas.length}; leigas ${conta('registro', 'leigo')}, técnicas ${conta('registro', 'técnico')}`);
console.log(`origem: publicada ${conta('origem', 'publicada')}, adaptação ${conta('origem', 'adaptação')}, autoral ${conta('origem', 'autoral')}, em decisão ${conta('origem', 'em decisão')}`);
console.log(`compostas ${conta('composta', true)}, simples ${conta('composta', false)}`);
console.log(`marcadores removidos: ${perguntas.filter((p) => p.marcador_removido).map((p) => `${p.id}(${p.marcador_removido})`).join(', ')}`);
console.log(`temas: ${[...new Set(perguntas.map((p) => p.tema))].join('; ')}`);
console.log(`sha256 ${hash}`);
