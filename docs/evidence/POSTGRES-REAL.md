# Postgres real sin Docker · cómo se ejecutó y cómo repetirlo

El repo decía `NOT_VERIFIED` en C06/C22 porque "no hay servidor ni daemon Docker
accesible". Era cierto para Docker, no para Postgres: en esta máquina no hay
`sudo` (`no new privileges`), pero sí se pueden extraer los binarios oficiales de
Ubuntu en espacio de usuario y levantar un clúster propio.

## Resultado

- **Postgres 16.15** (paquetes oficiales de Ubuntu 24.04), ejecutado en
  `127.0.0.1:55432` con un `PGDATA` fuera del repo.
- Las **cuatro migraciones** aplican en una base limpia.
- **13 pruebas** de integración en `tests/db/postgres.test.ts`, todas en verde
  (120 pruebas en total con `DATABASE_URL`).

## Reproducción

```bash
# 1. Binarios (sin root, sin Docker)
mkdir -p /tmp/pgpkgs /tmp/pg && cd /tmp/pgpkgs
curl -sS -O http://archive.ubuntu.com/ubuntu/pool/main/p/postgresql-16/postgresql-16_16.15-0ubuntu0.24.04.1_amd64.deb
curl -sS -O http://archive.ubuntu.com/ubuntu/pool/main/p/postgresql-16/postgresql-client-16_16.15-0ubuntu0.24.04.1_amd64.deb
curl -sS -O http://archive.ubuntu.com/ubuntu/pool/main/p/postgresql-16/libpq5_16.15-0ubuntu0.24.04.1_amd64.deb
for f in *.deb; do dpkg-deb -x "$f" /tmp/pg; done

# 2. Clúster
export LD_LIBRARY_PATH=/tmp/pg/usr/lib/x86_64-linux-gnu
export PGBIN=/tmp/pg/usr/lib/postgresql/16/bin
export PGDATA=/tmp/pgdata
mkdir -p /tmp/pgsock
$PGBIN/initdb -D $PGDATA -U postgres --auth=trust -E UTF8
$PGBIN/pg_ctl -D $PGDATA -o "-p 55432 -k /tmp/pgsock -c listen_addresses=127.0.0.1" -l /tmp/pg.log start

# 3. Base y migraciones
$PGBIN/createdb -h 127.0.0.1 -p 55432 -U postgres agntia
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia npm run db:migrate

# 4. Pruebas
DATABASE_URL=postgres://postgres@127.0.0.1:55432/agntia npx vitest run tests/db/postgres.test.ts
```

`libpq5` es necesario porque `initdb` y `psql` enlazan contra `libpq.so.5`; sin
`LD_LIBRARY_PATH` fallan con "cannot open shared object file".

## Qué cubren las pruebas

| Prueba | Qué demuestra |
|---|---|
| Migraciones | Las cuatro aplican en orden sobre una base vacía |
| RLS forzada | Las 21 tablas con `tenant_id` tienen `relrowsecurity` y `relforcerowsecurity` |
| Fail-closed | Sin `app.tenant_id` la consulta no devuelve filas |
| Aislamiento | La sesión de A sólo ve A; la de B sólo ve B |
| Escritura cruzada | Insertar con `tenant_id` ajeno falla con `42501` |
| FK compuesta | Una campaña de B con brief de A falla con `23503` |
| Dedupe outbox | `operation_key` repetido falla con `23505` |
| Pasos de journey | Dos pasos del mismo sujeto conviven sin romper unicidad |
| `SKIP LOCKED` | Dos workers se reparten intents distintos, `lease_fence = 1` |
| Rollback | Una transacción revertida no deja filas |
| Rate limit | 10 consumos concurrentes con límite 5 permiten exactamente 5 |
| Tenant del contador | Consumir el contador de otro tenant falla con `42501` |
| Dos instancias | Dos `PgRateLimiter` comparten la ventana |

## Fallos reales encontrados al ejecutar

1. **`0002_rls.sql` no aplicaba en Postgres limpio**: `revoke ... from anon` falla
   con `role "anon" does not exist` fuera de Supabase. Corregido creando los roles
   de forma idempotente.
2. **El esquema no soportaba journeys**: `outbound_intents` no tenía
   `journey_step_id`/`scheduled_for` y su unicidad `(tenant_id, campaign_id,
   subject_ref)` impedía más de un paso por sujeto. Corregido en `0003`.
3. **`consume_rate_limit` con parámetro ambiguo**: el nombre de salida
   `window_start` chocaba con la columna; renombrado a `window_begin` y con
   `drop function` previo para que reaplicar sea seguro.

## Límites honestos

- El **API y el worker siguen en memoria**: las migraciones están verificadas como
  SQL, no como camino del servicio. Esa es la campaña pendiente.
- El clúster vive en `/tmp`: **no sobrevive** al archivado del sandbox. Los
  binarios y `PGDATA` se recrean con los comandos de arriba.
- No se ha probado contra Supabase, ni con TLS, ni con `service_role`.
