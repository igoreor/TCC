// Funções estatísticas usadas no cálculo das métricas (sem dependências externas).

export const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function desvioPadrao(xs: number[]) {
  if (xs.length < 2) return null;
  const m = media(xs)!;
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

export function quantil(xs: number[], q: number) {
  if (!xs.length) return null;
  const ordenado = [...xs].sort((a, b) => a - b);
  const pos = (ordenado.length - 1) * q;
  const base = Math.floor(pos);
  const resto = pos - base;
  return ordenado[base + 1] !== undefined ? ordenado[base] + resto * (ordenado[base + 1] - ordenado[base]) : ordenado[base];
}

/** Intervalo de confiança de 95% de Wilson para uma proporção. */
export function wilson(acertos: number, n: number, z = 1.959964) {
  if (!n) return { p: null, inferior: null, superior: null };
  const p = acertos / n;
  const denominador = 1 + (z * z) / n;
  const centro = (p + (z * z) / (2 * n)) / denominador;
  const margem = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denominador;
  return { p, inferior: Math.max(0, centro - margem), superior: Math.min(1, centro + margem) };
}

function logFatorial(n: number) {
  let s = 0;
  for (let i = 2; i <= n; i += 1) s += Math.log(i);
  return s;
}
const logComb = (n: number, k: number) => logFatorial(n) - logFatorial(k) - logFatorial(n - k);

/**
 * Teste exato de Fisher (Freeman-Halton) para tabelas 2 × k: linha 1 = acertos, linha 2 = erros,
 * uma coluna por grupo. Valor-p bilateral: soma das tabelas com probabilidade ≤ à observada.
 */
export function fisherExato(acertos: number[], totais: number[]) {
  const N = totais.reduce((a, b) => a + b, 0);
  const r1 = acertos.reduce((a, b) => a + b, 0);
  const logProb = (a: number[]) => a.reduce((s, ai, j) => s + logComb(totais[j], ai), 0) - logComb(N, r1);
  const observada = logProb(acertos);
  let p = 0;
  const atual: number[] = [];
  const percorrer = (j: number, restante: number) => {
    if (j === totais.length - 1) {
      if (restante <= totais[j]) {
        atual[j] = restante;
        const lp = logProb(atual);
        if (lp <= observada + 1e-7) p += Math.exp(lp);
      }
      return;
    }
    for (let a = 0; a <= Math.min(totais[j], restante); a += 1) {
      atual[j] = a;
      percorrer(j + 1, restante - a);
    }
  };
  percorrer(0, r1);
  return Math.min(1, p);
}

/** Função de distribuição acumulada da normal padrão (aproximação de Abramowitz e Stegun). */
export function normalCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - p : p;
}

function postos(valores: number[]) {
  const indexados = valores.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const r = new Array<number>(valores.length);
  const empates: number[] = [];
  for (let i = 0; i < indexados.length; ) {
    let j = i;
    while (j + 1 < indexados.length && indexados[j + 1].v === indexados[i].v) j += 1;
    const posto = (i + j) / 2 + 1;
    for (let k = i; k <= j; k += 1) r[indexados[k].i] = posto;
    empates.push(j - i + 1);
    i = j + 1;
  }
  return { r, empates };
}

/** Teste de Mann-Whitney (bilateral), aproximação normal com correção para empates. */
export function mannWhitney(a: number[], b: number[]) {
  const { r, empates } = postos([...a, ...b]);
  const n1 = a.length;
  const n2 = b.length;
  const R1 = r.slice(0, n1).reduce((s, x) => s + x, 0);
  const U = R1 - (n1 * (n1 + 1)) / 2;
  const N = n1 + n2;
  const correcao = empates.reduce((s, t) => s + (t ** 3 - t), 0) / (N * (N - 1));
  const variancia = ((n1 * n2) / 12) * (N + 1 - correcao);
  const z = variancia > 0 ? (U - (n1 * n2) / 2) / Math.sqrt(variancia) : 0;
  return { U, z, p: Math.min(1, 2 * (1 - normalCdf(Math.abs(z)))) };
}

/** Função de sobrevivência da qui-quadrado (gama incompleta regularizada). */
function quiQuadradoSobrevivencia(x: number, gl: number) {
  const a = gl / 2;
  const y = x / 2;
  if (y <= 0) return 1;
  const lnGamaA = (() => {
    const g = 7;
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    let z = a - 1;
    let s = c[0];
    for (let i = 1; i < g + 2; i += 1) s += c[i] / (z + i);
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(s);
  })();
  if (y < a + 1) {
    let soma = 1 / a;
    let termo = soma;
    for (let n = 1; n < 500; n += 1) {
      termo *= y / (a + n);
      soma += termo;
      if (termo < soma * 1e-12) break;
    }
    return 1 - soma * Math.exp(-y + a * Math.log(y) - lnGamaA);
  }
  let b = y + 1 - a;
  let c = 1e300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i += 1) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-12) break;
  }
  return Math.exp(-y + a * Math.log(y) - lnGamaA) * h;
}

/** Teste de Kruskal-Wallis, com correção para empates e aproximação qui-quadrado. */
export function kruskalWallis(grupos: number[][]) {
  const todos = grupos.flat();
  const N = todos.length;
  const { r, empates } = postos(todos);
  let inicio = 0;
  let H = 0;
  for (const g of grupos) {
    const soma = r.slice(inicio, inicio + g.length).reduce((s, x) => s + x, 0);
    H += (soma * soma) / g.length;
    inicio += g.length;
  }
  H = (12 / (N * (N + 1))) * H - 3 * (N + 1);
  const correcao = 1 - empates.reduce((s, t) => s + (t ** 3 - t), 0) / (N ** 3 - N);
  if (correcao > 0) H /= correcao;
  const gl = grupos.length - 1;
  return { H, gl, p: quiQuadradoSobrevivencia(H, gl) };
}

/** Kappa de Cohen ponderado (pesos lineares ou quadráticos) para categorias ordinais 0..k-1. */
export function kappaPonderado(a: number[], b: number[], k: number, pesos: 'linear' | 'quadratico' = 'linear') {
  const n = a.length;
  if (!n) return null;
  const w = (i: number, j: number) => (pesos === 'linear' ? Math.abs(i - j) / (k - 1) : ((i - j) / (k - 1)) ** 2);
  const obs = Array.from({ length: k }, () => new Array(k).fill(0));
  a.forEach((x, i) => (obs[x][b[i]] += 1));
  const ma = obs.map((linha) => linha.reduce((s, x) => s + x, 0));
  const mb = obs[0].map((_, j) => obs.reduce((s, linha) => s + linha[j], 0));
  let po = 0;
  let pe = 0;
  for (let i = 0; i < k; i += 1) {
    for (let j = 0; j < k; j += 1) {
      po += w(i, j) * obs[i][j];
      pe += (w(i, j) * ma[i] * mb[j]) / n;
    }
  }
  return pe === 0 ? 1 : 1 - po / pe;
}
