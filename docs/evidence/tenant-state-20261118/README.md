# Etapa 1 de la persistencia: el estado del tenant sobrevive al proceso

Fecha: 2026-11-18. Base: `main` en `356167f`. Migración nueva:
`db/migrations/0007_tenant_state.sql`. Verificación: **4/4** pruebas nuevas en
`tests/db/tenant-state.test.ts`, **141/141** en la suite completa con
`DATABASE_URL` y `tsc --noEmit` exit 0, todo contra Postgres 16.15; más un humo
por red con **reinicio real de proceso** (`run.log`).

Re-ejecución 2026-11-21 (ver más abajo y `recheck-20261121.json`): **5/5** en ese
archivo —se añadió el caso de dos escritores concurrentes— y **142/142** en la
suite completa, sobre Postgres 18.7 y sobre el mismo código que la CI aprobó en
`1b93d17`.

## El hallazgo que cambió el plan

El §9 del handoff proponía empezar por «campaña → commit → lease → delivery →
receipt» dejando el resto en memoria. Al leer el dominio, esa rebanada **no es
separable**: el commit revalida elegibilidad, frecuencia y supresión leyendo
`contacts` y `contactPolicies`, y el lease vuelve a revalidar antes del efecto.
Si sólo se persiste el outbox y los contactos se quedan en memoria, tras un
reinicio la revalidación vería cero contactos y cancelaría todo: la persistencia
sería una promesa falsa justo en el punto donde importa.

Por eso la etapa 1 no es «media rebanada», sino el **agregado del tenant completo**
en un documento con versión, con el dominio intacto.

## Qué se implementó

| Pieza | Qué hace |
|---|---|
| `db/migrations/0007_tenant_state.sql` | `tenant_state(tenant_id, version, state jsonb, updated_at)` con RLS forzada y policy por `app.tenant_id` |
| `apps/api/src/state.ts` | `exportTenantState` / `importTenantState` (24 colecciones + operaciones de idempotencia + auditoría) y `PgTenantStateStore` |
| `apps/api/src/app.ts` | `mutate` y `read` pasan por el puerto cuando está configurado; cada petición carga el documento antes de correr el dominio |
| `apps/api/src/server.ts` | Con `DATABASE_URL` inyecta el puerto; sin ella avisa `tenant_state=memory` |

Semántica, en una frase: **el documento es la verdad y la memoria es su caché de
un turno**. La transacción abre con `select … for update` sobre la fila del
tenant, importa el documento, deja correr el dominio síncrono, exporta y escribe
antes de responder. Un solo escritor por tenant a la vez: no hay actualizaciones
perdidas, y una lectura no puede pisar a una escritura en curso.

Una operación que falla revierte y **no** escribe: la copia en memoria se
descarta y la petición siguiente vuelve a cargar. Si la base no responde, `503
state_write_failed` con `reconciliationRequired`.

## Verificación ejecutada

| Afirmación | Prueba | Resultado |
|---|---|---|
| Una app con el store **vacío** lee la campaña del documento | `tenant-state.test.ts` «una app con el store vacío…» | PASS (200, `state: approved`) |
| Commit y entrega escriben y sobreviven a un proceso nuevo | «commit y entrega…» | PASS (`queued > 0`; todos `confirmed`; `counts.confirmed` y `total` intactos tras pool y store nuevos) |
| Cada escritura sube la versión exactamente una vez | «cada escritura sube la versión…» | PASS (`before + 1`) |
| El tenant vecino no ve el estado | misma prueba | PASS (404 `campaign_not_found` con token de otro tenant) |
| Un efecto rechazado no toca el documento | «un efecto rechazado…» | PASS (409 y versión sin cambios) |
| Un proceso nuevo sirve lo escrito por el anterior | humo por red (`run.log`) | PASS: proceso 41023 crea el brief (`brf_0f89…`), el 41253 lo lista tras reiniciar, con el puerto libre en medio |

Nota de honestidad sobre el humo: en la primera tanda el script leyó
`payload` de `GET /v1/marketing/briefs`, que devuelve un **array pelado**, y
reportó `count: null`. Se corrigió el parseo y se repitió la lectura en un
proceso nuevo (`run.log`, sección «corrección»). El fallo era del script, no del
API; el documento ya estaba escrito (`version=1, briefs=1`).

## Límites que siguen abiertos

- **No es la arquitectura final.** `tenant_state` es un documento JSONB por
  tenant, no las tablas normalizadas de `0001`. Un cambio de un brief reescribe
  el documento entero y serializa al tenant: sirve para sandbox/pilot, no para
  muchos tenants activos a la vez.
- **El claim sigue sin `for update skip locked`.** La garantía de «dos workers no
  reclaman el mismo intent» se apoya hoy en el cerrojo por tenant, no en la cola
  SQL. `MKT-C22-G01` sigue `NOT_VERIFIED_PRODUCT`.
- **Ventana de reenvío.** Si el proceso muere entre el envío del proveedor y la
  escritura del documento, el intent queda `queued` y el mensaje ya salió: la
  única defensa es el dedupe por `operationKey` del proveedor. No se declara
  exactly-once.
- **El worker de demostración sigue en memoria** (`apps/worker/src/main.ts`);
  lease y entrega por red se ejercen en la ruta interna del API, con el adaptador
  sandbox. Ningún proveedor real, ningún despliegue.
- **El rol de login del sandbox es superusuario**; la policy de `tenant_state` se
  verificó por comportamiento, no con un rol no privilegiado.

## Reproducción

```bash
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia_final npm run db:migrate
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia_final npx vitest run tests/db/tenant-state.test.ts
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia_final npx vitest run
npx tsc -p tsconfig.json --noEmit
```

El humo de proceso usa un servidor real (`tsx apps/api/src/server.ts`, `PORT=8792`)
y un script de `/tmp` que no forma parte del repositorio.

## Evidencia incluida

- `run.log`: siembra, dos procesos con reinicio verificado, corrección del
  parseo, tercera lectura y estado del documento en Postgres.
- `full-suite.log`: la suite completa, 141/141 (2026-11-18).
- `provenance.json`: SHA base, hashes de las fuentes y límites declarados.
- `recheck-pg18.log`: la suite completa el 2026-11-21, 142/142, contra Postgres
  18.7 (`recheck-20261121.json`).
- `ci.md`: los dos jobs del workflow `ci` sobre `1b93d17`, en success.

## Re-ejecución 2026-11-21: concurrencia y otra versión de Postgres

El sandbox se restauró sin dependencias ni base de datos, así que se levantó un
Postgres 18.7 en espacio de usuario (binarios del paquete `embedded-postgres` en
`/tmp`, sin Docker y sin root) y se repitió todo contra el mismo commit que la CI
ya había aprobado: **142/142** y `tsc` exit 0.

Además se añadió la prueba que faltaba para la afirmación central del diseño. La
prueba anterior medía escrituras **secuenciales**; el documento dice «un solo
escritor por tenant: sin actualizaciones perdidas», y eso sólo se ve con dos
escritores a la vez. La prueba nueva levanta **dos apps, cada una con su pool y su
store** (lo más parecido a dos procesos), lanza dos `POST /v1/marketing/briefs`
en paralelo sobre el mismo tenant y comprueba que la versión sube exactamente dos
veces y que el listado contiene los dos briefs.

Resultado: PASS. La segunda transacción espera en `for update` y, al entrar, lee
el documento ya actualizado por la primera; ninguna de las dos desaparece. Esto
no cambia el límite conocido —el cerrojo serializa al tenant entero, no es la
cola `for update skip locked`— pero convierte «no hay actualizaciones perdidas» de
una afirmación del comentario en algo ejercitado.

Lo que **no** prueba esta re-ejecución: Postgres 18.7 no es la 16.15 del banco
original (la CI usa `postgres:16` y también pasó); el rol de login sigue siendo
superusuario; y sigue sin haber worker de producto ni proveedor real.
