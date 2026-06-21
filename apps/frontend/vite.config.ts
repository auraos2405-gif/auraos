/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      include: [
        'src/components/form-field.tsx',
        'src/store/auth-store.ts',
        'src/components/aura-halo.tsx',
        'src/components/aura-metric-card.tsx',
        'src/components/aura-recommendation-card.tsx',
        'src/pages/executive-dashboard-page.tsx',
      ],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
  },
});
