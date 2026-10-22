import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Configuração separada do vite.config.ts: os testes não precisam do Tailwind nem do proxy da API.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
  },
})
