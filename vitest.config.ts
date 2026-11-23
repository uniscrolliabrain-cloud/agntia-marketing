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
    // Las suites de `tests/db` comparten UNA base y llaman a `applyMigrations`
    // (DDL: `revoke`/`grant`, roles, triggers) en su `beforeAll`, además de
    // sembrar y borrar tenants globales. En paralelo, una lectura puede caer en
    // la ventana en que otra suite revoca permisos y el borde responde 503
    // fail-closed —fue un fallo real en CI el 2026-11-23—. En serie es
    // determinista; el coste es de segundos.
    fileParallelism: false,
  },
});
