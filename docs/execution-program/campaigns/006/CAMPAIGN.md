# MKT-C06 · Postgres, RLS y persistencia transaccional

**PROGRAMA PREVIO · NOT_STARTED · 6/42.** [Campaña original](../../campaigns/06-postgres-rls-y-persistencia-transaccional.md).

## Objetivo y contrato
Crear almacenamiento scoped con historia, índices y recovery.

**Invariante:** Relaciones, consultas y jobs conservan tenant; privilegio DB no reemplaza policy.. **Dependencias:** MKT-C05. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/db/migrations/001_init.sql`.
- DTO/validación: `packages/contracts/src/06.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/06.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/006.test.ts` y fixtures `tests/fixtures/006/`.
- Evidencia: `docs/evidence/c06/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/storage/`, `migrations/`, `tests/integration/storage.test.ts`.

## Patchsets y aceptación por tarea
### 006.01 — MKT-C06-T01
**Acción:** Diseñar tablas/FKs compuestas y ACL de proyectos/objetos.

**Archivo primario:** `packages/db/migrations/001_init.sql`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Un intentA no referencia audienceSnapshotB por SQL.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 006.02 — MKT-C06-T02
**Acción:** Implementar migraciones versionadas con transacción/backup.

**Archivo primario:** `packages/db/migrations/001_init.sql`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Fresh/upgrade/fallo parcial mantienen registros y audit.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C06-T01.

### 006.03 — MKT-C06-T03
**Acción:** Configurar RLS USING/WITH CHECK y roles API/worker reales.

**Archivo primario:** `packages/db/migrations/001_init.sql`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Probar owner/BYPASSRLS/service_role, sin suposiciones.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C06-T02.

### 006.04 — MKT-C06-T04
**Acción:** Crear índices de external links, inbox e idempotency por ámbito.

**Archivo primario:** `packages/db/migrations/001_init.sql`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Colisión de externalId entre proveedores/tenants no pisa objetos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C06-T03.

### 006.05 — MKT-C06-T05
**Acción:** Persistir audit y payload de retención separada.

**Archivo primario:** `packages/db/migrations/001_init.sql`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Correlación de intentos/denegaciones sin PII eterna en ledger.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C06-T04.

### 006.06 — MKT-C06-T06
**Acción:** Implementar CAS/versiones, outbox y locks/leases.

**Archivo primario:** `packages/db/migrations/001_init.sql`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Commit local de estado/audit/outbox es indivisible.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C06-T05.

### 006.07 — MKT-C06-T07
**Acción:** Probar concurrencia, rollback y restore de fixtures.

**Archivo primario:** `packages/db/migrations/001_init.sql`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cursores/receipts no se pierden ni reactivan campañas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C06-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C06-G01 / NOT_EXECUTED:** INSERT/UPDATE de FK cross-tenant falla por API y DB con roles usados.
- **MKT-C06-G02 / NOT_EXECUTED:** Caída en migración/commit no deja aprobación/intención parcial visible.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
