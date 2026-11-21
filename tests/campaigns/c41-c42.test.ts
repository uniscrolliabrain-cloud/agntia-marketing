import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

describe('MKT-C41 · operaciones, CI y release reversible', () => {
  it('el repositorio tiene scripts de verificación y CI que los ejecuta', () => {
    const pkg = readJson('package.json');
    expect(pkg.scripts.typecheck).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
    expect(ci).toContain('npm ci');
    expect(ci).toContain('npm run typecheck');
    expect(ci).toContain('npm test');
  });

  it('las migraciones son reversibles por diseño y no borran historia', () => {
    const readme = readFileSync('db/README.md', 'utf8');
    expect(readme).toMatch(/rollback/i);
    // El README debe declarar el estado real: SQL verificado y la ruta normalizada
    // todavía pendiente (el API ya usa Postgres para autorizar y para tenant_state).
    expect(readme).toMatch(/VERIFICADO en Postgres/);
    expect(readme).toMatch(/sigue sin verificarse/i);
    const schema = readFileSync('db/migrations/0001_schema.sql', 'utf8');
    expect(schema).toContain('audit_log');
    expect(schema).toContain('service_events');
  });

  it('no hay credenciales reales en el repositorio', () => {
    const files = ['package.json', 'apps/api/src/server.ts', 'db/migrations/0001_schema.sql'];
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      expect(content).not.toMatch(/sk_live_|SUPABASE_SERVICE_ROLE|password=\w+/);
    }
  });

  it('existe evidencia por fase y un anexo agregado', () => {
    expect(existsSync('docs/evidence/ANEXO-42-FASES.md')).toBe(true);
    const anexo = readFileSync('docs/evidence/ANEXO-42-FASES.md', 'utf8');
    expect(anexo).toMatch(/MKT-C01/);
    expect(anexo).toMatch(/MKT-C42/);
  });
});

describe('MKT-C42 · aceptación, informe y entrega', () => {
  const manifest = readJson('docs/campaigns/campaign.json');
  const campaigns = manifest.campaigns as Array<{ id: string; sequence: number; tasks: Array<{ id: string }>; gate_scenarios: Array<{ id: string }> }>;

  it('el manifiesto conserva 42 campañas, 294 tareas y 84 escenarios', () => {
    expect(campaigns).toHaveLength(42);
    expect(campaigns.flatMap((c) => c.tasks)).toHaveLength(294);
    expect(campaigns.flatMap((c) => c.gate_scenarios)).toHaveLength(84);
  });

  it('las 42 campañas tienen reporte de fase con estado y evidencia', () => {
    const dirs = readdirSync('docs/execution-program/campaigns').sort();
    expect(dirs).toHaveLength(42);
    for (const dir of dirs) {
      const doc = readFileSync(join('docs/execution-program/campaigns', dir, 'CAMPAIGN.md'), 'utf8');
      expect(doc).toContain('## Reporte de fase Freebuff');
      expect(doc).toMatch(/Estado: (DONE|PARTIAL|BLOCKED)/);
      expect(doc).toContain('SHA:');
      expect(doc).toMatch(/Tests ejecutados:/);
      expect(doc).not.toContain('Estado: PENDING');
    }
  });

  it('ningún gate se declara PASS sin prueba ejecutada', () => {
    for (const campaign of campaigns) {
      for (const gate of campaign.gate_scenarios) {
        const doc = readFileSync(`docs/execution-program/campaigns/${String(campaign.sequence).padStart(3, '0')}/CAMPAIGN.md`, 'utf8');
        if (doc.includes(`${gate.id} / PASS`)) {
          expect(doc).toMatch(/Tests ejecutados: [1-9]/);
        }
      }
    }
  });

  it('los límites de la entrega quedan escritos para revisión', () => {
    const anexo = readFileSync('docs/evidence/ANEXO-42-FASES.md', 'utf8');
    expect(anexo).toMatch(/NO está implementado o verificado/);
    expect(anexo).toMatch(/Postgres/);
    expect(anexo).toMatch(/proveedores/i);
  });
});
