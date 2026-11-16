# C03 — EXECUTION REPORT

**ESTADO: PASS.** M01–M10 tienen ahora dominio, contratos, persistencia, API, migración y tests ejecutados.

Fecha UTC: 2026-11-16. Rama: `impl/c00-c03-market-authority-20261116`. SHA base: `08dc584e9e6fcb1248f2267e8402f391d02e2e36`.

## Waves y resultado real

| Wave | Patchsets | Estado | Tests / exit code | Evidencia | Incidencias |
|---|---|---|---|---|---|
| W01 | contratos | PASS | typecheck exit 0 | `packages/contracts/src/market.ts` | 1 colisión de nombre detectada y corregida |
| W02 | dominio + store + migración | PASS | incluido abajo | `packages/core/src/market.ts`, `db/migrations/0003_market_intelligence.sql` | 1 errata de FK corregida |
| W03 | API | PASS | 8 rutas nuevas | `apps/api/src/app.ts` | — |
| W04 | tests | PASS | 16 tests · exit 0 | `tests/market/market-intelligence.test.ts` | 3 fallos reales corregidos, ver «Incidencias» |

## Comandos ejecutados

```text
npm run typecheck → exit 0
npx vitest run tests/market/market-intelligence.test.ts → 16 passed
npm test          → exit 0 · 7 archivos · 117 tests
node scripts/verify-matrix.mjs → exit 0 · 72 capacidades
```

La verificación final se repitió sobre un clon limpio de la rama publicada: `npm ci` exit 0, `typecheck` exit 0, `npm test` 117/117.

## Qué existe ahora

**Contratos** (`packages/contracts/src/market.ts`):
`MarketSourceSchema` (URL sólo `https`, licencia explícita, fechas coherentes) · `MarketObservationSchema` · `CompetitorSchema` · `IcpHypothesisSchema` · `OpportunitySchema` · `SOURCE_MAX_AGE_DAYS` por tipo de fuente · `EVIDENCE_GRADES` E0–E5.

**Dominio** (`packages/core/src/market.ts`):
`registerMarketSource` · `registerObservation` (dedup por huella) · `registerCompetitor` · `registerIcp` · `proposeOpportunity` · `rankOpportunities` · `marketRadar` · `listMarketObservations` · `listMarketSources` · `assessEvidence` · `computeRanking`.

**Reglas que se aplican de verdad**:

1. Una fuente con URL no cifrada o con `publishedAt > retrievedAt` se rechaza (422).
2. Una oportunidad con evidencia inexistente, con licencia `unknown` o caducada **no se crea**: 422, 403 y 409 respectivamente. No hay ranking con evidencia inventada.
3. El grado E0–E5 lo calcula el servidor: E1 con una fuente fresca, E2 con dos, E3 con dos y alguna oficial/estudio, E4 si hay medición interna corroborada. El cliente sólo aporta confianza subjetiva 0–1.
4. El ranking es determinista: `score = impacto_medio × confianza × frescura × peso_esfuerzo`, ordenado por score, título e id, con `inputHash` reproducible.
5. La frescura **decae con el reloj**: el mismo escenario baja de 0,4 a 0 de factor de frescura al envejecer la fuente y el score llega a 0 con la razón `no_fresh_evidence`.
6. Todo es tenant-scoped: la evidencia de otro tenant «no existe» (422 `evidence_ref_unknown`) y los listados no cruzan tenants.

**API** (todas con PEP y capability nueva `marketing.market.read` / `marketing.market.write`):

- `POST|GET /v1/marketing/market/sources`
- `POST|GET /v1/marketing/market/observations` (con `topic`, `kind`, `includeStale`)
- `POST|GET /v1/marketing/market/competitors`
- `POST /v1/marketing/market/icps`
- `POST|GET /v1/marketing/market/opportunities`
- `GET /v1/marketing/market/radar`

**Persistencia** (`db/migrations/0003_market_intelligence.sql`): cinco tablas tenant-scoped con PK compuesta, unicidad por `(tenant_id, source_ref)` y `(tenant_id, domain)`, índices por tipo/tema y `(tenant_id, score desc)`, RLS habilitada y **forzada** con la misma política `tenant_isolation` de `0002`. No aplicada contra base real.

## Incidencias reales y correcciones

| # | Síntoma | Causa | Corrección |
|---|---|---|---|
| 1 | `TS2308`: `listObservations` exportado dos veces | Nombre colisionaba con el de medición | Renombrado a `listMarketObservations` y conservado el original |
| 2 | `TS2552`: rutas de medición sin símbolo | El renombrado eliminó el import usado por MKT-C25 | Import restaurado junto al nuevo |
| 3 | Test de evidencia caducada devolvía 422 | Los datos de prueba tenían `publishedAt` posterior a `retrievedAt` | Datos corregidos; la validación era correcta |
| 4 | Lectura tras avanzar 40 días devolvía 401 | El JWT de prueba caducaba; el sistema lo rechazó correctamente | Se reemite token y se **añade aserción** de que el token viejo da 401 |
| 5 | `on delete restart` en la migración | Errata | `on delete restrict` (no se borran evidencias en cascada) |

Ningún fallo se silenció: los cuatro primeros se corrigieron en código o en datos de prueba, y el quinto en la migración.

## Lo que no está hecho

- Ingesta automática de fuentes (crawling, APIs, RSS): sólo registro manual. Requiere autorización y límites de uso.
- M01 (perfil de empresa) y M10 (simulación competitiva) siguen PENDING; no pertenecen a este paquete.
- El ranking no incorpora tamaño de mercado ni capacidad comercial: eso es C07.

## Gates

- G2 parcial: dominio de mercado implementado y probado.
- G4: **no** certificado. No hay integración real con proveedores de datos.

## Siguiente paso

C04 y C05 pueden empezar en paralelo con zonas de escritura disjuntas (`creative-governance.ts` frente a `journey-runtime.ts`), según sus `PATCHSETS.md`.
