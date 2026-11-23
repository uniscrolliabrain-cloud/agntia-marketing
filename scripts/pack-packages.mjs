#!/usr/bin/env node
/**
 * Empaqueta `@agntia/contracts` y `@agntia/sdk` como tarballs instalables en el
 * repo padre (MKT-C35).
 *
 * Por qué existe este script y no se toca el `package.json` de cada paquete:
 * dentro del monorepo los paquetes se consumen como fuente TypeScript (alias de
 * `tsconfig.json` y de `vitest.config.ts`), y cambiar `main`/`exports` a `dist/`
 * obligaría a compilar antes de cada `npm run api:dev` o `npm test`. El build se
 * hace aparte, en un directorio de staging, y de ahí sale el tarball. El
 * workspace queda intacto.
 *
 * Salida: `dist/npm/agntia-contracts-<v>.tgz` y `dist/npm/agntia-sdk-<v>.tgz`
 * (ignorados por git: `dist/`).
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = join(root, 'dist', 'npm');
const VERSION = '0.1.0';

const PACKAGES = [
  {
    dir: 'packages/contracts',
    name: '@agntia/contracts',
    dependencies: { zod: '^3.24.1' },
    description: 'Contratos de agntia-marketing: envelope v1, DTO Zod, eventos y errores seguros.',
  },
  {
    dir: 'packages/sdk',
    name: '@agntia/sdk',
    dependencies: { '@agntia/contracts': VERSION, zod: '^3.24.1' },
    description: 'Cliente allowlist, 8 tools y bridge de eventos al padre para agntia-marketing.',
  },
];

/** `tsc` emite rutas relativas sin extensión; Node ESM exige `.js`. */
function addEsmExtensions(dir) {
  let touched = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      touched += addEsmExtensions(path);
      continue;
    }
    if (!path.endsWith('.js') && !path.endsWith('.d.ts')) continue;
    const before = readFileSync(path, 'utf8');
    const after = before.replace(/(from\s+')(\.\.?\/[^']*)(')/g, (match, open, specifier, close) =>
      /\.[a-z]+$/i.test(specifier) ? match : `${open}${specifier}.js${close}`,
    );
    if (after !== before) {
      writeFileSync(path, after);
      touched += 1;
    }
  }
  return touched;
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const tarballs = [];

for (const pkg of PACKAGES) {
  // Orden implícito: `@agntia/sdk` resuelve los tipos de `@agntia/contracts`
  // desde su `dist`, así que contratos se compila primero.
  execFileSync(process.execPath, [tsc, '-p', join(root, pkg.dir, 'tsconfig.build.json')], { cwd: root, stdio: 'inherit' });

  const stage = join(outDir, pkg.name.replace('@agntia/', ''));
  cpSync(join(root, pkg.dir, 'dist'), stage, { recursive: true });
  const rewritten = addEsmExtensions(stage);

  writeFileSync(
    join(stage, 'package.json'),
    `${JSON.stringify(
      {
        name: pkg.name,
        version: VERSION,
        description: pkg.description,
        type: 'module',
        main: './index.js',
        types: './index.d.ts',
        exports: { '.': { types: './index.d.ts', default: './index.js' } },
        sideEffects: false,
        engines: { node: '>=20' },
        dependencies: pkg.dependencies,
      },
      null,
      2,
    )}\n`,
  );

  const packed = execFileSync('npm', ['pack', '--pack-destination', outDir, '--silent'], { cwd: stage, encoding: 'utf8' }).trim();
  tarballs.push({ name: pkg.name, tarball: join(outDir, packed.split('\n').pop()), files: rewritten });
}

for (const entry of tarballs) console.log(JSON.stringify({ packed: entry.name, tarball: entry.tarball, esmSpecifiersRewritten: entry.files }));
