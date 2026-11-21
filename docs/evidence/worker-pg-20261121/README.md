# Worker de outbox como proceso real (MKT-C22)

Fecha: 2026-11-21. Base: `main` en `edeb621`. Verificación: **155/155** pruebas con
`DATABASE_URL`, `tsc --noEmit` exit 0, y un humo con **tres procesos worker** contra
el servidor real y Postgres 18.7.

## Qué se implementó

| Pieza | Qué hace |
|---|---|
| `apps/worker/src/client.ts` | `drainOnce` (una vuelta: reclama y entrega por la ruta interna) y `runWorkerLoop` (repite, reintenta transitorios con backoff y para al quedarse sin trabajo) |
| `apps/worker/src/main.ts` | Con `WORKER_API_URL` + `WORKER_JWT` corre como proceso de producto; sin ellas cae al ciclo en memoria **avisando** `worker_mode=demo` |
| `packages/contracts` + `packages/core/src/authority.ts` | Capacidad nueva `marketing.delivery.run`: efecto de máquina para el rol `worker`, sobre intents que ya pasaron por la aprobación humana del commit |
| `apps/api/src/app.ts` | `POST /v1/marketing/internal/deliver` exige `marketing.delivery.run` en vez de `marketing.campaign.commit` |
| `packages/core/src/store.ts` + `apps/api/src/server.ts` | El reloj del proceso pasa a ser real; el congelado queda documentado como fixture de pruebas |

El worker **no** reimplementa reglas: llama a la ruta interna, que corre el dominio
dentro del cerrojo del tenant y escribe en `tenant_state`. Un solo conjunto de
reglas y una sola fuente de verdad.

## El hallazgo que bloqueaba la entrega

La ruta interna estaba declarada con `marketing.campaign.commit`, que es un efecto
humano: cualquier actor no humano recibía `403 effect_requires_human`. Es decir, el
worker de producto **no habría podido existir** con ese contrato. Se añadió
`marketing.delivery.run` como efecto de máquina nombrado uno a uno: sólo ese efecto
acepta un actor no humano, y los demás siguen cerrados (`effect_requires_human`).

Segundo hallazgo, encontrado al ejecutar el humo: `createStore()` nace con el reloj
**congelado** en `2026-11-14T12:00Z` (fixture de pruebas) y `apps/api/src/server.ts`
lo usaba tal cual. Con ese reloj, los intents programados nunca vencen y las
aprobaciones caducan según una fecha fija. El servidor y el worker de demo pasan
ahora `() => new Date()`.

## Verificación ejecutada

| Afirmación | Prueba | Resultado |
|---|---|---|
| El worker habla el contrato interno (token, idempotencia, límite, proveedor) | `tests/worker/http-worker.test.ts` «reclama por la ruta interna…» | PASS |
| No reintenta lo permanente y sí lo transitorio | mismas pruebas, 401/424 vs 5xx y red caída | PASS |
| El bucle para por inactividad y respeta techo de vueltas | «para tras varias vueltas sin trabajo», «respeta el techo…» | PASS |
| Dos workers no entregan el mismo intent dos veces | `tests/db/worker-drain.test.ts` | PASS: `leased` y `confirmed` suman lo encolado; un receipt por intent |
| Un worker que vuelve no repite trabajo confirmado | misma suite | PASS (`leased: 0`) |
| El bucle vacía la cola y para | misma suite | PASS (`confirmed` = encolado, `stopReason: idle`) |
| Tres procesos worker, un servidor, un tenant | humo de esta carpeta (`run.log`) | PASS: uno drena 2, los otros dos quedan inactivos; 2 receipts, 2 intents únicos |
| Token inválido no entrega nada | humo, tanda 1 (`run.log`) | PASS: `401 token_invalid` en los tres procesos, documento intacto |
| Aprobación caducada no entrega nada | humo, tanda 2 (`run.log`) | PASS: los intents quedan `cancelled` con `approval_expired` |

## Límites que siguen abiertos

- **La exclusión mutua es por tenant, no por intent.** El cerrojo de `tenant_state`
  serializa: dos workers del mismo tenant no se pisan, pero tampoco trabajan en
  paralelo. `for update skip locked` sigue sin usarse en la ruta de producto
  (`MKT-C22-G01` sigue `PARTIAL`, no PASS).
- **Proveedor sandbox.** El único adaptador es `email_sandbox`; `MKT-C41-G01` sigue
  `NOT_VERIFIED`.
- **El worker no reclama tenants.** Sirve al tenant de su token; el despliegue
  decide cuántos workers y para qué tenant. No hay descubrimiento de tenants ni
  reparto automático.
- **El JWT del worker lo emite el despliegue.** El repo no mina tokens de servicio;
  en el humo se firmó HS256 con el secreto de desarrollo y se borró el fichero.
- **Sin exactly-once.** Si el proceso muere entre el envío y la escritura, el intent
  queda `queued` con el mensaje ya salido.
- **El worker de demo sigue existiendo** cuando faltan variables; avisa
  `worker_mode=demo` para que nadie lo confunda con el de producto.
