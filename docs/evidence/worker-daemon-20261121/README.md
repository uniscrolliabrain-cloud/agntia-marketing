# El worker de outbox como servicio (MKT-C22)

Fecha: 2026-11-21. Base: `main` en `7d4ea79`. Verificación: **165/165** pruebas
en 14 archivos sobre Postgres 18.7, `tsc --noEmit` exit 0, y tres tandas de humo
de proceso (`run.log`).

## Qué faltaba

La entrega ya era de producto desde `2e9f2b7`, pero el proceso **terminaba** tras
tres vueltas sin trabajo (`WORKER_IDLE_ROUNDS`). Eso lo deja como trabajo por
lotes: para tenerlo vivo hay que envolverlo en un supervisor que lo relance, y no
había forma de pedirle que parase sin matarlo a mitad de una entrega.

## Qué se implementó

| Pieza | Qué hace |
|---|---|
| `runWorkerDaemon` (`apps/worker/src/client.ts`) | Bucle de servicio: no para por inactividad, espera `intervalMs` con trabajo y `idleIntervalMs` en vacío, backoff exponencial acotado ante fallos transitorios y salida por señal o por degradación sostenida |
| `defaultSleep` | Espera interrumpible: al llegar la señal se resuelve en el acto, así un worker ocioso no tarda `idleIntervalMs` en apagarse |
| `apps/worker/src/main.ts` | Modo `daemon` (`WORKER_DAEMON=1` o `WORKER_MODE=daemon`), `SIGTERM`/`SIGINT` con parada ordenada, latido por vuelta vacía, validación de entorno y códigos de salida 0 / 2 / 3 |
| `tests/worker/worker-daemon.test.ts` | 10 pruebas del bucle vivo, de la señal y de los fallos |

Variables nuevas, todas validadas al arrancar (un valor inválido detiene el
proceso en vez de degradarlo en silencio):

- `WORKER_DAEMON=1` / `WORKER_MODE=daemon`: modo servicio.
- `WORKER_IDLE_INTERVAL_MS` (5 000): espera entre vueltas vacías.
- `WORKER_MAX_CONSECUTIVE_ERRORS` (30; `0` = sin límite): fallos transitorios
  consecutivos que terminan el proceso con código 3.
- `WORKER_INTERVAL_MS`, `WORKER_LIMIT`, `WORKER_ID`, `WORKER_PROVIDER`: como antes,
  ahora con validación entera y mínimo.

Códigos de salida: `0` parada pedida, `2` configuración inválida o fallo
permanente (401/403/424/contrato roto), `3` degradado (el API dejó de responder).

## La decisión que importa: la señal no aborta la entrega en curso

`SIGTERM` marca la parada, pero **no** se pasa a la petición HTTP que está en
vuelo. Abortarla puede dejar el mensaje confirmado en el proveedor y el intent
todavía `queued` en el documento; con la ventana actual, el reintento del proceso
siguiente duplicaría el envío. Se prefiere terminar la vuelta, contarla y salir.
La prueba «no aborta la entrega en curso cuando llega la señal» comprueba el
`AbortSignal` que recibe el `fetch`: sigue sin abortar después del `SIGTERM`.

Consecuencia honesta: una parada puede tardar lo que tarde la petición en curso
(hasta `requestTimeoutMs`, 15 s por defecto). Es preferible a un doble envío.

## Verificación ejecutada

| Afirmación | Prueba | Resultado |
|---|---|---|
| No para tras varias vueltas vacías; sigue reclamando | `worker-daemon.test.ts` «sigue reclamando después de varias vueltas vacías» | PASS |
| Espera más en vacío que con trabajo | «espera más entre vueltas vacías que entre vueltas con trabajo» | PASS |
| Late en cada vuelta vacía | «reporta el latido de cada vuelta vacía» | PASS |
| La señal no aborta la entrega en curso y su resultado se cuenta | «no aborta la entrega en curso cuando llega la señal» | PASS |
| Señal ya abortada: no se llama al API | «no reclama nada si la señal ya está abortada» | PASS |
| Fallos transitorios con backoff y contador que se reinicia | «absorbe fallos transitorios y reinicia el contador» | PASS |
| Degradación sostenida termina el bucle | «termina degradado tras fallos transitorios consecutivos» | PASS |
| `WORKER_MAX_CONSECUTIVE_ERRORS=0` no se rinde | «con `maxConsecutiveErrors: 0` no se rinde» | PASS |
| Fallo permanente no se reintenta | «propaga el fallo permanente» | PASS |
| Cada vuelta se reporta con duración y recuento | «avisa de cada vuelta con su duración» | PASS |
| Proceso real: 10 vueltas, 1 confirmado, latido cada 200 ms, `SIGTERM` → exit 0 en 17 ms | humo tanda 1 (`run.log`) | PASS |
| Proceso real con API caído: 3 fallos → exit 3, `lastError: stub_down` | humo tanda 2 | PASS |
| Modo demonio sin API configurada: exit 2 en vez de caer a demo | humo tanda 3 | PASS |
| Suite completa | `DATABASE_URL=… npx vitest run` (Postgres 18.7) | PASS 165/165 |
| Sin base | `env -u DATABASE_URL npx vitest run` | PASS 126 + 39 skipped |
| Tipos | `npx tsc -p tsconfig.json --noEmit` | exit 0 |

El humo usa una **API de apoyo** (`/tmp/smoke/stub-api.mjs`, no versionada) que
sólo responde el contrato: lo que verifica es el ciclo de vida del proceso, no la
entrega durable. La entrega contra el API y Postgres reales ya está verificada en
`docs/evidence/worker-pg-20261121/`.

## Límites que siguen abiertos

- **Sin `for update skip locked` en la ruta de producto.** La exclusión sigue
  siendo por tenant; el demonio hace que el proceso sea desplegable, no que dos
  workers del mismo tenant trabajen a la vez (`MKT-C22-G01` sigue `PARTIAL`).
- **Sin exactly-once.** La ventana entre el envío y la escritura del documento
  sigue abierta; el demonio no la cierra, sólo evita empeorarla al apagarse.
- **Un tenant por proceso.** El worker sirve al tenant de su token: sin
  descubrimiento de tenants, el despliegue decide cuántos procesos y para quién.
- **Sin proveedor real** (`MKT-C41-G01` sigue `NOT_VERIFIED`).
