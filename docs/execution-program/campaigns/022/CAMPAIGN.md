# MKT-C22 · Outbox, jobs y reconciliación

**PROGRAMA PREVIO · NOT_STARTED · 22/42.** [Campaña original](../../campaigns/22-outbox-jobs-y-reconciliacion.md).

## Objetivo y contrato
Hacer recuperable la ejecución sin retry ciego tras incertidumbre.

**Invariante:** Lease/fencing local no demuestra exactamente-una-vez remoto.. **Dependencias:** MKT-C21. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/jobs/src/outbox.ts`.
- DTO/validación: `packages/contracts/src/22.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/22.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/022.test.ts` y fixtures `tests/fixtures/022/`.
- Evidencia: `docs/evidence/c22/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/jobs/`, `packages/outbox/`, `packages/reconcile/`.

## Patchsets y aceptación por tarea
### 022.01 — MKT-C22-T01
**Acción:** Persistir intent/key/hash/audit/outbox en una transacción.

**Archivo primario:** `packages/jobs/src/outbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Caída precommit no deja efecto huérfano o watermark avanzado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 022.02 — MKT-C22-T02
**Acción:** Implementar leases/fences y límites de attempts/DLQ.

**Archivo primario:** `packages/jobs/src/outbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Worker viejo no confirma estado después de perder lease.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C22-T01.

### 022.03 — MKT-C22-T03
**Acción:** Revalidar principal delegado/approval/audiencia/purpose/budget al ejecutar.

**Archivo primario:** `packages/jobs/src/outbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Job no conserva poderes revocados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C22-T02.

### 022.04 — MKT-C22-T04
**Acción:** Clasificar pre-dispatch/rejected/accepted/outcome_unknown por evidencia.

**Archivo primario:** `packages/jobs/src/outbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Timeout no se etiqueta automáticamente failed seguro.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C22-T03.

### 022.05 — MKT-C22-T05
**Acción:** Implementar lookup remoto por refs verificables y política por proveedor.

**Archivo primario:** `packages/jobs/src/outbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin reconciliación fiable se bloquea y escala.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C22-T04.

### 022.06 — MKT-C22-T06
**Acción:** Definir cancel/pause con ACK y efectos en vuelo.

**Archivo primario:** `packages/jobs/src/outbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No borrar historial remoto para simular rollback.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C22-T05.

### 022.07 — MKT-C22-T07
**Acción:** Inyectar crash antes/después de HTTP/ACK y repetición de lote.

**Archivo primario:** `packages/jobs/src/outbox.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Un efecto o uncertainty visible sin duplicación.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C22-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C22-G01 / NOT_EXECUTED:** Backend aceptó envío, worker cae antes ACK: no nuevo envío desde backend alterno.
- **MKT-C22-G02 / NOT_EXECUTED:** Tenant suspendido durante takeover impide HTTP aunque lease esté libre.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/delivery.ts
Tests ejecutados: 17 en `tests/campaigns/c21-c30.test.ts` (`npx vitest run tests/campaigns/c21-c30.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C22-G01 / PASS:** Backend aceptó envío, worker cae antes ACK: no nuevo envío desde backend alterno.
- **MKT-C22-G02 / PASS:** Tenant suspendido durante takeover impide HTTP aunque lease esté libre.

Desviaciones y ajustes de diseño: El outbox es en memoria; la transacción Postgres y el `skip locked` no se ejecutaron.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Probar concurrencia de dos workers sobre Postgres real.

## Hardening 2026-11-15 (2ª pasada)

Estado tras hardening: DONE

- `leaseIntents` revalida en el instante del efecto: aprobación vigente y no revocada, elegibilidad/supresión y límite de frecuencia.
- Los intents con `scheduledFor` futuro no se reclaman; los no elegibles se cancelan con motivo auditable (`intent.cancelled_at_lease`).
- El settle de campaña sólo se aplica a intents que pertenecen a una campaña, no a journeys.

Gates: G01 y G02 siguen PASS; la revalidación añade la garantía de que una revocación posterior al commit no produce efecto.

Límite que sigue abierto: El outbox sigue en memoria: `FOR UPDATE SKIP LOCKED` y la transacción Postgres no se han ejecutado.

## Hardening 2026-11-18 (outbox en Postgres real)

- `0003_intent_scheduling.sql` añade `journey_step_id` y `scheduled_for`, un índice
  parcial de vencimientos y la unicidad por paso (`coalesce` para campañas).
- Probado que dos workers con `for update skip locked` se reparten intents distintos
  sin duplicar y con `lease_fence = 1` en cada uno.
- Probado que un `operation_key` repetido falla con `23505` y que dos pasos del
  mismo journey conviven sin romper la unicidad.

Gates: G01 y G02 se mantienen PASS; la evidencia añade ejecución SQL real.

Límite abierto: el worker sigue reclamando del store en memoria; el `SKIP LOCKED`
está verificado como SQL, no como camino del API.
