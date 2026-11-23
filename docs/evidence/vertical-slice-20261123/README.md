# Evidencia · rebanada vertical de entrega y paquete instalable · 2026-11-23

Dos entregas medidas en este directorio: la **entrega en dos fases** del worker
(MKT-C22) y el **paquete instalable** para el repo padre (MKT-C35). Lo que sigue
distingue lo ejecutado de lo que sigue sin verificarse.

## 1. Entrega en dos fases

**Problema real.** `POST /v1/marketing/internal/deliver` reclamaba, enviaba y
liquidaba dentro de **una sola** transacción con `select … for update` sobre
`tenant_state`. El cerrojo del tenant cubría la llamada al proveedor: un envío de
15 s retenía el tenant entero y ningún otro worker podía avanzar.

**Cambio.** El borde abre tres tramos:

1. **reclamo** bajo cerrojo — `expireLeases` + `leaseIntents` (revalidación de
   aprobación, consentimiento, supresión y frecuencia ya existentes);
2. **envío** con cero transacciones abiertas (`sendIntent` sólo habla con el
   adaptador);
3. **liquidación** bajo cerrojo y **con el fence del lease** (`settleIntent`).

`expireLeases` es la recuperación del proceso que muere entre 2 y 3: el intent
pasa a `unknown` con `reconciliationRequired`, `lastError: lease_expired`, evento
`marketing.effect.outcome_unknown` y rastro en auditoría. **Nunca** vuelve a
`queued`: no hay exactly-once y devolverlo a la cola reenviaría a ciegas.

## 2. Lo ejecutado

| Comando | Resultado |
|---|---|
| `npx tsc -p tsconfig.json --noEmit` | exit 0 |
| `DATABASE_URL=… npx vitest run` (PostgreSQL 19.0, puerto 55434) | **169/169 en 15 archivos** |
| `env -u DATABASE_URL npx vitest run` | **130 passed, 39 skipped** (los `tests/db/*` se saltan: no hay PASS falso) |
| `npm run verify:pack` | tarballs + `npm install` real + `{"ok":true,"tools":8,…}` |

Pruebas nuevas (`tests/worker/two-phase-delivery.test.ts`, 4):

1. el envío ocurre con **cero** transacciones abiertas y hay un receipt por intent
   (el puerto registra apertura/cierre; se mide `maxOpenDuringSend === 0`);
2. un lease huérfano pasa a `unknown` y **no** se reenvía ni se vuelve a reclamar;
3. una liquidación con fence viejo no reescribe el resultado (`lease_conflict`);
4. la misma liquidación aplicada dos veces deja **un** receipt.

La ruta real por HTTP y Postgres ya estaba cubierta por
`tests/db/worker-drain.test.ts` (dos apps, dos pools, dos stores, mismo tenant):
sigue en verde y ahora ejercita los tres tramos, con un receipt por intent.

## 3. Paquete instalable

`npm run pack:sdk` compila `@agntia/contracts` y `@agntia/sdk` con `tsc`,
reescribe los especificadores relativos a `.js` (Node ESM), genera un
`package.json` de distribución y empaqueta en `dist/npm/`.

`npm run verify:pack` crea un consumidor limpio, instala los tarballs con
`npm install` real y ejecuta `check.mjs`: import ESM, `CONTRACT_VERSION`, la tool
`marketing_brief_read` contra un `fetch` de prueba, exactamente 8 tools, rechazo
de `baseUrl` y de ruta fuera de la allowlist, y `toParentEvent` con
`schemaVersion: "1.0"` y `null` para un tipo desconocido.

Guía para el padre: [`docs/release/INSTALACION-EN-PADRE.md`](../../release/INSTALACION-EN-PADRE.md).

## 4. Límites (sin maquillar)

- El **reclamo sigue siendo por tenant**, no por intent: `for update skip locked`
  sobre `outbound_intents` no existe todavía, así que dos workers no toman
  rebanadas distintas a la vez. `MKT-C22-G01` sigue `PARTIAL`.
- Sin **exactly-once**: la ventana entre el envío aceptado y la liquidación se
  cierra marcando el intent `unknown`, no reintentando.
- Sin **proveedor real** (`MKT-C41-G01`): el único adaptador con `send` es el
  sandbox local.
- El paquete **no se publica** en ningún registro; `verify:pack` necesita red para
  `zod`.
- No se ejecutó un humo de **proceso** en esta tanda (worker real + API real +
  `SIGTERM`); la evidencia de proceso es la del 2026-11-21
  (`docs/evidence/worker-daemon-20261121/`) y no cubre el cambio de hoy. Lo que sí
  está verificado hoy es la ruta HTTP+Postgres con dos workers concurrentes.
- El Postgres de esta evidencia es `embedded-postgres` 19.0 (beta) en el puerto
  55434; CI usa `postgres:16`. Ninguno de los dos acredita un entorno gestionado.
