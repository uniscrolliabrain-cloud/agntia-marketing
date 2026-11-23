#!/usr/bin/env node
/**
 * Verifica que los tarballs de `npm run pack:sdk` **se instalan y se usan** como
 * los consumiría el repo padre: `npm install` real del `.tgz`, import ESM real,
 * cliente real y bridge de eventos real.
 *
 * No publica en ningún registro y no necesita credenciales. Si el registro no
 * responde, `zod` no se instala y el script falla: eso es un fallo real del
 * entorno, no un PASS.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const npmDir = join(root, 'dist', 'npm');
const consumer = join(npmDir, 'consumer');
const VERSION = '0.1.0';

execFileSync(process.execPath, [join(root, 'scripts', 'pack-packages.mjs')], { cwd: root, stdio: 'inherit' });

rmSync(consumer, { recursive: true, force: true });
mkdirSync(consumer, { recursive: true });
writeFileSync(join(consumer, 'package.json'), `${JSON.stringify({ name: 'agntia-sdk-consumer', private: true, version: '0.0.0', type: 'module' }, null, 2)}\n`);

const install = (tarball) =>
  execFileSync('npm', ['install', '--no-audit', '--no-fund', '--silent', tarball], { cwd: consumer, stdio: 'inherit' });

// Contratos primero: así `@agntia/sdk` ve su dependencia ya resuelta y no se
// intenta bajar `@agntia/contracts` del registro, donde no existe.
install(join(npmDir, `agntia-contracts-${VERSION}.tgz`));
install(join(npmDir, `agntia-sdk-${VERSION}.tgz`));

writeFileSync(
  join(consumer, 'check.mjs'),
  `import assert from 'node:assert/strict';
import { MarketingClient, TOOLS, toParentEvent } from '@agntia/sdk';
import { CONTRACT_VERSION, MarketingError, PARENT_EVENT_MAP } from '@agntia/contracts';

assert.match(CONTRACT_VERSION, /^\\d+\\.\\d+\\.\\d+$/);

const calls = [];
const client = new MarketingClient({
  baseUrl: 'http://api.test',
  token: 'tok_test',
  fetchImpl: async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify([{ id: 'brf_1', title: 'brief' }]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  },
});

const tool = TOOLS.find((t) => t.name === 'marketing_brief_read');
assert.ok(tool, 'tool marketing_brief_read missing');
const brief = await tool.invoke(client, { briefId: 'brf_1' });
assert.equal(brief.id, 'brf_1');
assert.equal(calls[0].url, 'http://api.test/v1/marketing/briefs');
assert.equal(calls[0].init.headers.authorization, 'Bearer tok_test');
assert.equal(TOOLS.length, 8, 'the SDK must expose exactly 8 allowlisted tools');

assert.throws(() => new MarketingClient({ baseUrl: 'api.test', token: 'tok' }), /baseUrl_invalid/);
await assert.rejects(
  client.call({ capability: 'marketing.campaign.preview', method: 'GET', path: '/v1/other/thing' }),
  /path_not_allowlisted/,
);

const mapped = Object.keys(PARENT_EVENT_MAP)[0];
assert.ok(mapped, 'PARENT_EVENT_MAP is empty');
const envelope = toParentEvent(
  { type: mapped, payloadRefs: [{ kind: 'campaign', id: 'cmp_1' }] },
  { owner: 'tenant_x', emittedAt: '2026-11-23T00:00:00Z' },
);
assert.equal(envelope.schemaVersion, '1.0');
assert.equal(envelope.source, 'agntia-marketing');
assert.equal(envelope.payload.localId, 'cmp_1');
assert.equal(toParentEvent({ type: 'marketing.not_mapped', payloadRefs: [{ kind: 'x', id: 'y' }] }, { owner: 'o', emittedAt: 'now' }), null);

const error = new MarketingError('INVALID', 'detail');
assert.equal(error.name, 'MarketingError');
assert.equal(error.httpStatus, 422);

console.log(JSON.stringify({ ok: true, tools: TOOLS.length, event: envelope.type, contract: CONTRACT_VERSION }));
`,
);

const stdout = execFileSync(process.execPath, [join(consumer, 'check.mjs')], { cwd: consumer, encoding: 'utf8' }).trim();
console.log(stdout);
console.log(JSON.stringify({ installedInto: consumer, result: 'PASS' }));
