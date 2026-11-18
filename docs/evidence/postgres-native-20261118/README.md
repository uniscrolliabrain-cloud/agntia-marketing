# PostgreSQL real sin Docker — revisión de Codex

Fecha: 2026-11-18. Fuente revisada: `uniscrolliabrain-cloud/agntia-marketing` @ **`1a848a49775407997a9550fbe58d27bcde222208`** (`main` observado). Decisión: **CHANGES_REQUESTED para la capa DB**. No se modifica el SQL de producción ni se declara completado el worker PostgreSQL.

## Resultado

Se compiló **PostgreSQL 16.16 oficial**, se instaló bajo una carpeta de trabajo y se arrancó con `initdb` + `pg_ctl`, sin Docker, root ni instalación global. Se verificó el SHA-256 del tarball oficial: `9d5cd8633043b75740d5d59749c6b7365e6aeb53c47098b1a5e80bb18f87881a`.

El servidor solo utilizó un socket Unix privado de permisos 0700; `listen_addresses=''`, sin puerto TCP expuesto. `fsync=on`. Las bases, identidades y datos son sintéticos y exclusivos de esta revisión. No se usaron DSN, secretos, cuentas ni campañas de clientes.

Se aplicaron **sin modificar** `db/migrations/0001_schema.sql` y `0002_rls.sql`. Antes se provisionaron los roles `anon` y `authenticated` que normalmente proporciona Supabase. Ese bootstrap del laboratorio no significa que las migraciones creen dichos roles en un PostgreSQL limpio.

Resultado final: **35 comprobaciones, 27 PASS y 8 FAIL reales**, exit code 1. La primera pasada produjo 27 PASS / 7 FAIL; después se añadió la prueba de INSERT de auditoría y se repitió la batería completa en un segundo clúster nuevo: 27 PASS / 8 FAIL. No se silenció ningún fallo ni se ajustaron las migraciones para conseguir verde.

## Qué sí se ha comprobado

- Migraciones aplicadas realmente en PostgreSQL 16 y extensión pgcrypto disponible.
- Roles API y worker de prueba sin SUPERUSER, BYPASSRLS ni CREATEROLE. Se abrieron conexiones independientes como esos roles; no se probó todo usando el administrador.
- Aislamiento SELECT en las **20 tablas con tenant_id**, con contexto A para API y B para worker.
- Sin contexto o con contexto vacío no se leen contactos. `SET LOCAL` deja de aplicar al hacer COMMIT en la misma conexión.
- FORCE RLS también limita al propietario no superusuario de contacts.
- anon, mediante SET ROLE, no puede leer contacts.
- INSERT a otro tenant y cambio de tenant_id rechazados por RLS; UPDATE/DELETE de filas de otro tenant afectan cero filas.
- FK compuestas de campaigns hacia brief, snapshot, creative y approval; FK de intent hacia campaign y de receipt hacia intent: los cruces probados fallan con SQLSTATE 23503.
- Clave de operación duplicada rechazada por PostgreSQL con 23505.
- Una transacción SQL que falla no deja la aprobación parcial confirmada.
- Una migración con fallo inyectado y ejecutada por el harness con `--single-transaction` no deja tablas parciales. Se prueba esa envoltura explícita, no un migrador de la app que no existe.
- Dos conexiones worker reales compiten por un mismo intent: una obtiene el registro y la otra no lo reclama. Con dos intents, la segunda conexión avanza sobre el otro registro mientras la primera mantiene su transacción abierta. El competidor tardó aproximadamente 8 ms, sin esperar los dos segundos de la transacción retenida.
- Backup con `pg_dump -Fc` y restauración con `pg_restore` a otra base: se conservan supresión, revocación de aprobación, intent confirmado, receipt, auditoría y RLS. No se ha ejecutado un worker de producto sobre esa restauración.

## Ocho fallos reproducidos y correcciones propuestas

### PG-01 — P1 — El directorio tenants revela datos de otros tenants

Fuente: `db/migrations/0002_rls.sql:14–18,37`; tabla `tenants` en `0001_schema.sql`.

La lista RLS excluye tenants porque su clave es id, pero el GRANT general incluye esta tabla. La conexión API con `app.tenant_id='tenant_a'` lee también la fila de B, incluido nombre y plan. La prueba esperaba cero filas ajenas y obtuvo una.

Corrección propuesta: política específica para `tenants.id = app_current_tenant()` o revocación del acceso directo y exposición mínima por un puerto autorizado. Probar ausencia de contexto, lectura A/B y escrituras. No aplicar ciegamente la policy de tenant_id a una columna inexistente.

### PG-02, PG-03 y PG-04 — P1 — Tres referencias de outbound_intents no tienen FK compuesta

Fuente: `db/migrations/0001_schema.sql:134–158`.

Un intent de A puede actualizar `approval_ref` a una aprobación exclusiva de B, `audience_snapshot_id` a un snapshot de B y `subject_ref` a un contacto de B. Las tres sentencias se aceptan: las columnas son texto y solo campaign_id tiene FK.

Corrección propuesta: añadir relaciones compuestas a approvals, audience_snapshots y contacts, o documentar e implementar otra representación de sujeto con integridad equivalente. Antes del upgrade inventariar filas existentes, resolver referencias inválidas y validar constraints; no asumir que una migración fresh basta. Mantener la comprobación de coherencia del grafo en el servicio además de las FK.

### PG-05 y PG-06 — P1 — API y worker pueden reescribir y borrar auditoría

Fuente: `db/migrations/0002_rls.sql:27,37`.

La policy cubre todas las operaciones y el GRANT concede UPDATE y DELETE. La conexión API modifica detail de audit_log del tenant A, y la conexión worker puede borrar auditoría de su tenant. Los ensayos se envuelven en ROLLBACK: no se pierde evidencia del laboratorio.

Corrección propuesta: permisos mínimos por rol; negar UPDATE/DELETE de audit_log y conservar INSERT controlado y lectura autorizada. Considerar defensa de append-only también frente a otros caminos privilegiados. RLS limita filas: no convierte por sí sola una tabla en append-only.

### PG-07 — P1 — El rol general de datos puede cambiar roles y scopes

Fuente: `db/migrations/0002_rls.sql:15,27,37` y `memberships`.

La conexión de datos de API puede actualizar su fila de memberships de `operator` a `owner` y ampliar scopes a `marketing.*`. No se ha probado una escalada por HTTP ni se afirma que esté expuesto hoy a clientes: el backend actual todavía usa memoria. Se demuestra que la capa SQL no separa escritura ordinaria de administración de autorizaciones.

Corrección propuesta: retirar mutación de memberships al rol general y usar un flujo administrativo separado, comprobado y auditado. Si se usa Supabase/PostgREST, revisar expresamente la superficie del rol authenticated y sus RPC. Probar la negativa directa con roles no privilegiados y la positiva del administrador autorizado.

### PG-08 — P1 — El INSERT normal de auditoría falla por permisos de secuencia

Fuente: `db/migrations/0001_schema.sql` (`audit_log.seq bigserial`) y `0002_rls.sql:37`.

El rol API tiene INSERT en la tabla, pero carece de USAGE sobre `audit_log_seq_seq`. Al insertar sin suministrar seq se recibe **42501: permission denied for sequence audit_log_seq_seq**. Esto es distinto de los permisos excesivos de UPDATE/DELETE: actualmente se permite alterar historia y no se permite crear la siguiente entrada de la forma normal.

Corrección propuesta: conceder únicamente los permisos necesarios de la secuencia al escritor de auditoría autorizado, o encapsular la escritura en un puerto restringido. Probar transacción de negocio + auditoría + outbox como unidad y comprobar que no se pierde ni se omite la auditoría para evitar el error.

## Límite decisivo: todavía no hay worker PostgreSQL de producto

`packages/core/src/store.ts` ofrece MemoryStore y Ctx depende de él. `apps/worker/src/worker.ts` llama a leaseIntents de ese core, y `apps/worker/src/main.ts` crea el store en memoria. No hay cliente/driver PostgreSQL ni repositorio SQL conectado a esos puntos en este SHA. La búsqueda de `FOR UPDATE SKIP LOCKED` en el producto solo encuentra un comentario en la migración.

Por ello `tests/postgres/claim-specimen.sql` es una **consulta de laboratorio**, implementada para comprobar el patrón de bloqueo contra el esquema real. No es una consulta extraída de un worker existente ni prueba la autorización, el fencing, el takeover o el envío remoto del producto.

Igualmente, `pg_dump`/`pg_restore` demuestran conservación de datos y policies, pero no prueban el protocolo del producto para reaplicar supresiones o evitar reenvíos al arrancar después de restaurar. No se infiere exactly-once externo de la exclusión de filas SQL.

## Efecto sobre los gates

| Gate | Resultado de esta revisión |
|---|---|
| C06-G01: FK cross-tenant por API y DB | **FAIL en DB** por tres referencias faltantes; API→Postgres aún ausente. |
| C06-G02: caída en migración/commit | **PARTIAL**: rollback SQL y DDL con envoltura del harness probados; falta transacción de negocio del adaptador real. |
| C22-G01: caída tras aceptación remota | **NOT_VERIFIED en producto**: SKIP LOCKED nativo pasa, pero no hay worker SQL/proveedor real conectado. |
| C22-G02: suspensión durante takeover | **NOT_VERIFIED en producto**: falta camino PG+mandato+PEP+worker. |
| C41-G01: pausa remota sin ACK | **NOT_VERIFIED**: requiere proveedor/ACK real. |
| C41-G02: restore sin pérdida de supresión ni replay | **PARTIAL**: restauración nativa pasa; falta el arranque/reconciliación del worker real. |

No se han convertido una docena de gates en PASS ni se ha reescrito la matriz histórica. Los resultados positivos reducen incertidumbre del motor y del SQL; los negativos son deuda concreta que ahora tiene reproducción.

## Reproducción sin Docker

Requisitos: Python 3 con biblioteca estándar y PostgreSQL 16 con `initdb`, `pg_ctl`, `psql`, `pg_dump`, `pg_restore` y pgcrypto. El runner no necesita pip, npm ni conexión a proveedores. En PostgreSQL nuevo el bootstrap crea los roles sintéticos; no debe apuntar a una base preexistente ni a producción.

Instalación de esta revisión, desde el tarball oficial ya verificado:

```bash
./configure --prefix=/ruta/privada/pgsql --without-readline --without-icu --with-ssl=openssl
make -j3
make install
make -C contrib/pgcrypto install
```

Ejemplo con prefijo PostgreSQL ya instalado; ejecutar desde la raíz de este repo como usuario no root:

```bash
export MKT_PG_LAB="$(mktemp -d /tmp/agntia-mkt-pg.XXXXXX)"
ln -s /ruta/privada/pgsql "$MKT_PG_LAB/pgsql"
mkdir -m 700 "$MKT_PG_LAB/socket"
"$MKT_PG_LAB/pgsql/bin/initdb" -D "$MKT_PG_LAB/data" -U lab_admin --auth-local=trust --auth-host=reject --encoding=UTF8 --locale=C
"$MKT_PG_LAB/pgsql/bin/pg_ctl" -D "$MKT_PG_LAB/data" -l "$MKT_PG_LAB/postgres.log" -o "-k $MKT_PG_LAB/socket -p 55432 -c listen_addresses='' -c fsync=on -c unix_socket_permissions=0700" -w start
MKT_REVIEW_SOURCE="$PWD" python3 tests/postgres/native_postgres.py
# En el SHA revisado se espera exit 1 con 27 PASS / 8 FAIL.
# Aunque el runner falle, detener el clúster de prueba al terminar:
"$MKT_PG_LAB/pgsql/bin/pg_ctl" -D "$MKT_PG_LAB/data" -m fast -w stop
```

Trust se limita a un socket privado en un clúster sintético; no es configuración recomendada de producción. El runner no borra bases existentes: una repetición requiere otro directorio/clúster nuevo, evitando resets destructivos. Conservar la carpeta evidence para investigar resultados.

El script fue ejecutado contra el SHA de la cabecera; si se usa para revalidar cambios futuros, registrar su SHA real y comparar las migraciones/hashes antes de atribuirle este informe. Tras corregir las migraciones se esperan cambios en los resultados, no la reproducción eterna de ocho fallos.

## Evidencia incluida

- `results.json`: 35 comprobaciones y su alcance, con nombres y resultados individuales.
- `sql-log.json`: 97 ejecuciones SQL con rol, base, SQL, exit code, stdout y stderr; solo fixtures sintéticas.
- `run.log`, `migration-output.log`: salida de la segunda pasada completa y de ambas migraciones.
- `provenance.json`: versión/compilador/tarball/hash, SHA revisado y hashes de fuentes.
- `gate-matrix.json`: situación de los seis gates relevantes sin promociones automáticas.
- `tests/postgres/native_postgres.py`: runner ejecutado, biblioteca estándar.
- `tests/postgres/claim-specimen.sql`: muestra SQL explícitamente separada del worker de producto.

Siguiente paso: corregir permisos y relaciones en una migración aditiva revisada; después implementar el repositorio/worker PostgreSQL y probar la transacción de negocio y la recuperación extremo a extremo. Codex puede revalidar el nuevo SHA. Este cambio solo aporta pruebas/evidencia; no modifica ni despliega producción, ni cambia `/agente`.
