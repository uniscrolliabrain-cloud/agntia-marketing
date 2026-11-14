# MKT-C05 · Contratos tipados y validación de frontera

**PROGRAMA PREVIO · NOT_STARTED · 5/42.** [Campaña original](../../campaigns/05-contratos-tipados-y-validacion-de-frontera.md).

## Objetivo y contrato
Definir DTOs y errores antes de conectar proveedores.

**Invariante:** DTO nuevo del servicio y tipo nativo del host se mapean explícitamente.. **Dependencias:** MKT-C04. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/contracts/src/index.ts`.
- DTO/validación: `packages/contracts/src/05.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/05.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/005.test.ts` y fixtures `tests/fixtures/005/`.
- Evidencia: `docs/evidence/c05/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/contracts/`, `docs/api-design.md`, `tests/contracts.test.ts`.

## Patchsets y aceptación por tarea
### 005.01 — MKT-C05-T01
**Acción:** Definir IDs opacos, Money string/currency, fechas y límites.

**Archivo primario:** `packages/contracts/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Round-trip rechaza NaN/float ambiguo/fecha inválida/campos extra.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 005.02 — MKT-C05-T02
**Acción:** Definir Brief, CreativeRevision, ClaimEvidence y BrandPolicy.

**Archivo primario:** `packages/contracts/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Objetivo/fuente/rights no quedan solo en prompt libre.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C05-T01.

### 005.03 — MKT-C05-T03
**Acción:** Definir AudienceRule/Snapshot y EligibilityDecision.

**Archivo primario:** `packages/contracts/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Máximo aprobado liga miembros reales y finalidad, no solo query.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C05-T02.

### 005.04 — MKT-C05-T04
**Acción:** Definir ApprovalBinding, Intent, Job, Conflict y ExternalLink.

**Archivo primario:** `packages/contracts/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Outcome_unknown no se serializa como éxito o retryable seguro.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C05-T03.

### 005.05 — MKT-C05-T05
**Acción:** Definir Observation, ConversionFact, MeasurementClaim y ExperimentSpec.

**Archivo primario:** `packages/contracts/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Atribuido/descriptivo/causal son tipos distinguibles.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C05-T04.

### 005.06 — MKT-C05-T06
**Acción:** Generar JSON Schema y fixtures públicos sin secretos.

**Archivo primario:** `packages/contracts/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** SchemaVersion propio no se confunde con SystemEvent string1.0.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C05-T05.

### 005.07 — MKT-C05-T07
**Acción:** Probar límites, discriminantes y compatibilidad SDK/backend.

**Archivo primario:** `packages/contracts/src/index.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Rechazo consistente en todas las interfaces, no solo frontend.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C05-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C05-G01 / NOT_EXECUTED:** Payload incluye SQL/model/method/baseURL y scope arbitrario: rechazado.
- **MKT-C05-G02 / NOT_EXECUTED:** Conversiones atribuidas intentan serializarse como ventas causales: contrato exige tipo/fuente.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
