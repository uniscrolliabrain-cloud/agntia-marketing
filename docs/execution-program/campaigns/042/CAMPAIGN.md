# MKT-C42 · Aceptación, informe y entrega

**PROGRAMA PREVIO · NOT_STARTED · 42/42.** [Campaña original](../../campaigns/42-aceptacion-informe-y-entrega.md).

## Objetivo y contrato
Consolidar evidencia, límites y backlog para decidir piloto real.

**Invariante:** Pendiente o no verificado no se declara terminado, conforme o paridad mundial.. **Dependencias:** MKT-C41. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `docs/release/acceptance.md`.
- DTO/validación: `packages/contracts/src/42.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/42.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/042.test.ts` y fixtures `tests/fixtures/042/`.
- Evidencia: `docs/evidence/c42/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `docs/release/final-report.md`, `docs/release/acceptance.md`, `docs/release/handoff-next.md`.

## Patchsets y aceptación por tarea
### 042.01 — MKT-C42-T01
**Acción:** Consolidar42 campañas PASS/BLOCKED/NOT_VERIFIED con commits/PRs.

**Archivo primario:** `docs/release/acceptance.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cada PASS enlaza resultado real, no documento que planea el test.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 042.02 — MKT-C42-T02
**Acción:** Inventariar tests ejecutados/pasados/fallidos/skipped por entorno.

**Archivo primario:** `docs/release/acceptance.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No sumar84 escenarios planeados como pruebas ejecutadas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C42-T01.

### 042.03 — MKT-C42-T03
**Acción:** Publicar matriz de funciones/ediciones/roles/canales habilitados.

**Archivo primario:** `docs/release/acceptance.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Función optativa sin evidencia sigue deshabilitada.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C42-T02.

### 042.04 — MKT-C42-T04
**Acción:** Revisar STOP conditions de seguridad/consentimiento/doble efecto/medición.

**Archivo primario:** `docs/release/acceptance.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cualquier crítico falla aceptación hasta resolverse.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C42-T03.

### 042.05 — MKT-C42-T05
**Acción:** Entregar demo sintética y manuales/costes/restore/rollback.

**Archivo primario:** `docs/release/acceptance.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Owner puede rastrear actor/fuente/approval/receipt y límites.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C42-T04.

### 042.06 — MKT-C42-T06
**Acción:** Documentar producción/presupuesto/contratos y wiring que requieren otro permiso.

**Archivo primario:** `docs/release/acceptance.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cero cambios aplicados a agente o gasto real por esta campaña.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C42-T05.

### 042.07 — MKT-C42-T07
**Acción:** Entregar backlog de expansión y handoff a siguiente equipo.

**Archivo primario:** `docs/release/acceptance.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No promesas de ROI/rankings/cumplimiento universal ni cobertura inventada.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C42-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C42-G01 / NOT_EXECUTED:** Se intenta aprobar piloto con conector real crítico no probado: BLOCKED.
- **MKT-C42-G02 / NOT_EXECUTED:** Owner reproduce un efecto y reporte desde fixture hasta receipt/claim verificable.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
