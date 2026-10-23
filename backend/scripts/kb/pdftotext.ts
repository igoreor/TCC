import { execFileSync } from 'node:child_process';

// Extração de texto com o pdftotext (Poppler). No Windows, ele acompanha o Git for Windows
// (mingw64/bin); no Linux, vem no pacote poppler-utils. A extração só é necessária para
// reprocessar os PDFs: os trechos resultantes ficam versionados em knowledge-base/processed.

export function extractPages(
  pdfPath: string,
  options: { layout?: boolean; first?: number; last?: number } = {}
) {
  const args = ['-enc', 'UTF-8'];
  if (options.layout) args.push('-layout');
  if (options.first) args.push('-f', String(options.first));
  if (options.last) args.push('-l', String(options.last));
  args.push(pdfPath, '-');

  let output: string;
  try {
    output = execFileSync('pdftotext', args, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore']
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new Error(
        'pdftotext não encontrado. Instale o Poppler (poppler-utils) ou use o Git Bash, que já o inclui.'
      );
    }
    throw error;
  }

  // O pdftotext termina cada página com \f; o último elemento, vazio, é descartado.
  const pages = output.split('\f');
  if (pages.at(-1)?.trim() === '') pages.pop();
  return pages;
}
