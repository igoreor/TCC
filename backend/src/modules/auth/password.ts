import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/**
 * Hash de senhas com scrypt (nativo do Node). Formato armazenado:
 *   scrypt$N=<custo>,r=<bloco>,p=<paralelismo>$<sal base64>$<hash base64>
 * Os parâmetros ficam no próprio hash, então podem ser elevados no futuro sem invalidar as senhas
 * já cadastradas. Os valores padrão seguem a recomendação da OWASP para scrypt (N=2^15, r=8, p=3).
 */
export interface ScryptParams {
  N: number;
  r: number;
  p: number;
}

export const DEFAULT_SCRYPT_PARAMS: ScryptParams = { N: 2 ** 15, r: 8, p: 3 };

const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const MAX_MEMORY = 64 * 1024 * 1024;
// Limites para não aceitar parâmetros absurdos vindos de um hash malformado.
const LIMITS: ScryptParams = { N: 2 ** 20, r: 32, p: 16 };

function deriveKey(password: string, salt: Buffer, params: ScryptParams, keyLength: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      keyLength,
      { ...params, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key))
    );
  });
}

export async function hashPassword(password: string, params: ScryptParams = DEFAULT_SCRYPT_PARAMS) {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(password, salt, params, KEY_LENGTH);
  return `scrypt$N=${params.N},r=${params.r},p=${params.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

function parseHash(stored: string) {
  const [scheme, paramText, saltText, keyText] = stored.split('$');
  if (scheme !== 'scrypt' || !paramText || !saltText || !keyText) return null;

  const values = Object.fromEntries(
    paramText.split(',').map((pair) => {
      const [name, value] = pair.split('=');
      return [name, Number(value)];
    })
  );
  const params = { N: values.N, r: values.r, p: values.p };
  const valid = (Object.keys(LIMITS) as Array<keyof ScryptParams>).every(
    (name) => Number.isInteger(params[name]) && params[name] > 0 && params[name] <= LIMITS[name]
  );
  if (!valid) return null;

  const salt = Buffer.from(saltText, 'base64');
  const key = Buffer.from(keyText, 'base64');
  if (!salt.length || !key.length) return null;
  return { params, salt, key };
}

/** Compara em tempo constante. Hash malformado ou de outro esquema resulta em `false`. */
export async function verifyPassword(password: string, stored: string) {
  const parsed = parseHash(stored);
  if (!parsed) return false;
  const candidate = await deriveKey(password, parsed.salt, parsed.params, parsed.key.length);
  return timingSafeEqual(candidate, parsed.key);
}
