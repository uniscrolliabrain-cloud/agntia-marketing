import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@agntia/contracts': r('./packages/contracts/src/index.ts'),
      '@agntia/core': r('./packages/core/src/index.ts'),
      '@agntia/adapters': r('./packages/adapters/src/index.ts'),
      '@agntia/sdk': r('./packages/sdk/src/index.ts'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    reporters: ['default'],
  },
});
