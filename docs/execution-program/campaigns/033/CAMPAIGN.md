# MKT-C33 · Escenarios de mix y presupuesto

**PROGRAMA PREVIO · NOT_STARTED · 33/42.** [Campaña original](../../campaigns/33-escenarios-de-mix-y-presupuesto.md).

## Objetivo y contrato
Proponer decisiones revisables bajo restricciones e incertidumbre.

**Invariante:** Recomendación de inversión no ejecuta reasignación ni compromete caja.. **Dependencias:** MKT-C32. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/analytics/src/media-mix.ts`.
- DTO/validación: `packages/contracts/src/33.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/33.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/033.test.ts` y fixtures `tests/fixtures/033/`.
- Evidencia: `docs/evidence/c33/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/planning/`, `docs/budget-scenarios.md`, `tests/planning.test.ts`.

## Patchsets y aceptación por tarea
### 033.01 — MKT-C33-T01
**Acción:** Definir restricciones comerciales por canal/periodo/moneda.

**Archivo primario:** `packages/analytics/src/media-mix.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Separar coste de servicio de gasto publicitario.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 033.02 — MKT-C33-T02
**Acción:** Consumir MeasurementClaims/ModelRuns con validez y coverage.

**Archivo primario:** `packages/analytics/src/media-mix.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Datos stale/no aptos no se transforman en óptimo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C33-T01.

### 033.03 — MKT-C33-T03
**Acción:** Generar escenarios base/alternativos con intervalos/supuestos.

**Archivo primario:** `packages/analytics/src/media-mix.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No punto óptimo único sin sensibilidad.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C33-T02.

### 033.04 — MKT-C33-T04
**Acción:** Agregar riesgos de extrapolación, saturación y coste de cambio.

**Archivo primario:** `packages/analytics/src/media-mix.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No extender curvas fuera de rango observado sin advertencia.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C33-T03.

### 033.05 — MKT-C33-T05
**Acción:** Proponer experimento adicional cuando identificación es débil.

**Archivo primario:** `packages/analytics/src/media-mix.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Se incluye coste/permiso pendiente, sin lanzarlo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C33-T04.

### 033.06 — MKT-C33-T06
**Acción:** Crear propuesta a finanzas/owner con diff y evidencia.

**Archivo primario:** `packages/analytics/src/media-mix.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Aceptar informe no es autorización de compra.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C33-T05.

### 033.07 — MKT-C33-T07
**Acción:** Probar moneda, límites, datos contradictorios y plan imposible.

**Archivo primario:** `packages/analytics/src/media-mix.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Infeasible explicado en vez de inventar saldo o ROI.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C33-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C33-G01 / NOT_EXECUTED:** El optimizador pide duplicar budget y tool no tiene capability de mutate.
- **MKT-C33-G02 / NOT_EXECUTED:** Scenario usa ingreso atribuido como causal: revisión bloquea afirmación.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
