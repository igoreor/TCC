/**
 * Gera o hash de uma senha para o cadastro manual de usuários.
 *
 * Uso:
 *   npm run auth:hash-password -- --username <usuario>
 *
 * A senha é lida sem eco no terminal (duas vezes, para confirmar) ou, se a entrada vier de um
 * pipe, da primeira linha. O script não grava nada no banco: ele imprime o hash e o comando SQL
 * de cadastro, que deve ser executado no psql.
 */
import { hashPassword } from '../src/modules/auth/password';
import { normalizeUsername, USERNAME_PATTERN } from '../src/modules/auth/username';

const MIN_PASSWORD_LENGTH = 8;

function readArgument(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function readHidden(prompt: string) {
  return new Promise<string>((resolve, reject) => {
    const stdin = process.stdin;
    let value = '';

    const finish = (error?: Error) => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') return finish();
        if (char === '\u0003') return finish(new Error('Operação cancelada.'));
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else value += char;
      }
    };

    process.stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    stdin.on('data', onData);
  });
}

async function readFirstLine() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8').split(/\r?\n/)[0];
}

async function readPassword() {
  if (!process.stdin.isTTY) return readFirstLine();

  const password = await readHidden('Senha: ');
  const confirmation = await readHidden('Confirme a senha: ');
  if (password !== confirmation) throw new Error('As senhas não conferem.');
  return password;
}

async function main() {
  const rawUsername = readArgument('username');
  const username = rawUsername ? normalizeUsername(rawUsername) : undefined;
  if (username && !USERNAME_PATTERN.test(username)) {
    throw new Error(
      'Usuário inválido: use de 3 a 64 caracteres entre letras minúsculas, números, ".", "_" e "-".'
    );
  }

  const password = await readPassword();
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  const hash = await hashPassword(password);

  console.log('\nHash gerado:');
  console.log(hash);
  console.log(
    '\nCadastro (cole no psql; dentro de aspas duplas no shell, o "$" do hash seria interpretado):'
  );
  console.log(
    `INSERT INTO users (username, password_hash) VALUES ('${username ?? 'SEU_USUARIO'}', '${hash}');`
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
