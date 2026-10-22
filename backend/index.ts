import type { Express } from 'express';
import { createApp } from './src/app';

// Entrada da API na Vercel: o app Express exportado por padrão vira uma única Vercel Function.
// Fica na raiz do backend porque a Vercel procura a entrada aqui antes de `src/app.ts`, que só
// exporta a fábrica `createApp`. Em desenvolvimento local continua valendo `src/server.ts`.
const app: Express = createApp();

export default app;
