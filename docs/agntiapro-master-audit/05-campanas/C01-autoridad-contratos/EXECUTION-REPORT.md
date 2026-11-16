# C01 — EXECUTION REPORT

**ESTADO: PASS (M64 verificado, M65 implementado).**

Fecha UTC: 2026-11-16. Rama: `impl/c00-c03-market-authority-20261116`. SHA base: `08dc584e9e6fcb1248f2267e8402f391d02e2e36`.

## Qué se construyó

**M65 · AuthorityMap.** Antes de esta campaña no existía ninguna declaración ejecutable de qué dominio posee cada recurso y cada efecto; la frontera sólo estaba descrita en prosa.

| Pieza | Archivo |
|---|---|
| Contrato y mapa canónico | `packages/contracts/src/authority-map.ts` (nuevo) |
| Enforcement | `packages/core/src/authority-map.ts` (nuevo) — `assertNoSelfGrant`, `ownerOfResource`, `authorityMapView` |
| Wiring | `packages/core/src/service.ts#proposeHandoff` — deniega autoconcesión y anota la declaración |
| API | `GET /v1/marketing/authority` en `apps/api/src/app.ts` |
| Decisión | `docs/decisions/C01-authority.md` |
| Tests | `tests/market/market-intelligence.test.ts` (bloque «C01 · M65 AuthorityMap», 3 casos) |

## Waves y resultado real

| Wave | Patchsets | Estado | Tests / exit code | Evidencia | Incidencias |
|---|---|---|---|---|---|
| W01 | P01–P02 | PASS con desviación | `npm run typecheck` exit 0 | `packages/contracts/src/authority-map.ts` | No se creó `autoridad-contratos.schema.ts`: los schemas de autoridad ya existen en `envelope.ts`/`domain.ts` |
| W02 | P01–P02 | PASS | incluido en W04 | `packages/core/src/authority-map.ts` | El repositorio es el `MemoryStore` existente; no se duplicó |
| W03 | P01–P02 | PASS | tests 117/117 | Ruta registrada con `read('marketing.context.read', …)` | — |
| W04 | P01–P02 | PASS | 3 tests nuevos | Ver bloque M65 | — |

## Reglas que ahora se aplican

1. Marketing **no puede** declararse dueño (`ownerService: 'marketing'`) de un efecto de otro dominio. `publish_post`, `send_message`, `create_quote` y `update_brand_asset` tienen dueño canónico y la petición devuelve `409 effect_not_owned_by_marketing:<efecto>:owner=<dominio>`.
2. Una declaración no canónica pero tampoco autoconcedida (por ejemplo `clientes` para `publish_post`) **no** se bloquea: se devuelve metadato `authority: {declaredOwner, canonicalOwner, matches}` y el conflicto queda registrado en `/v1/marketing/conflicts`. Se mantiene el comportamiento previo porque el test de MKT-C37 exige un registro de conflicto y no un error.
3. El mapa es consultable por API para agentes y humanos, con `boundary.marketingMaySelfGrant: false`.

## Lo que NO se hizo (y por qué)

- **ACL por campo**: la lectura es tenant-scoped y por capability, pero no existe ACL a nivel de campo o recurso individual. M64 sigue PARTIAL en ese punto.
- **Enforcement duro de `toService`**: exigir que `toService` coincida con el dueño canónico rompería el contrato de «conflicto de responsable» que MKT-C37 exige registrar. Se deja como advertencia estructurada hasta que el fundador fije esa política.

## Comandos

```text
npm run typecheck → exit 0
npm test          → exit 0 · 117 tests · 7 archivos
```

## Gate de salida

G1 parcial: autoridad entre dominios demostrada por tests; falta ACL por campo y prueba cruzada con el padre (C09).

## Siguiente paso

C02 (persistencia y outbox): verificada.
