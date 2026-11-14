# MKT-C18 · Segmentación y audiencia máxima

**PROGRAMA PREVIO · NOT_STARTED · 18/42.** [Campaña original](../../campaigns/18-segmentacion-y-audiencia-maxima.md).

## Objetivo y contrato
Crear reglas cerradas y snapshots de elegibilidad que no se amplíen solos.

**Invariante:** Regla dinámica no amplía el máximo de personas aprobado.. **Dependencias:** MKT-C17. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/segments.ts`.
- DTO/validación: `packages/contracts/src/18.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/18.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/018.test.ts` y fixtures `tests/fixtures/018/`.
- Evidencia: `docs/evidence/c18/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/audiences/`, `packages/segmentation/`, `tests/audience-freeze.test.ts`.

## Patchsets y aceptación por tarea
### 018.01 — MKT-C18-T01
**Acción:** Definir DSL tipada con campos/operadores allowlist y límites.

**Archivo primario:** `packages/domain/src/segments.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No SQL/query libre del LLM ni joins fuera de scope.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 018.02 — MKT-C18-T02
**Acción:** Aplicar purpose/base/identidad/supresión antes de segmentar.

**Archivo primario:** `packages/domain/src/segments.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Dato unknown no se interpreta elegible.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C18-T01.

### 018.03 — MKT-C18-T03
**Acción:** Crear preview de counts/exclusiones y prueba mínima de selección.

**Archivo primario:** `packages/domain/src/segments.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No exportar emails al modelo para explicar un conteo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C18-T02.

### 018.04 — MKT-C18-T04
**Acción:** Congelar miembros reales, watermark, regla y policyVersion.

**Archivo primario:** `packages/domain/src/segments.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Hash de query solo no basta como snapshot.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C18-T03.

### 018.05 — MKT-C18-T05
**Acción:** Definir revalidación que puede reducir pero no ampliar población.

**Archivo primario:** `packages/domain/src/segments.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Nuevo elegible necesita nueva revisión/approval.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C18-T04.

### 018.06 — MKT-C18-T06
**Acción:** Validar cardinalidad cross-project, dedup y fatiga global autorizada.

**Archivo primario:** `packages/domain/src/segments.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Misma persona no recibe dos mensajes por alias si política lo prohíbe.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C18-T05.

### 018.07 — MKT-C18-T07
**Acción:** Probar datos tardíos, retirada y cambio de regla concurrentes.

**Archivo primario:** `packages/domain/src/segments.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Estado aprobado conserva su máximo y evidencia de exclusiones.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C18-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C18-G01 / NOT_EXECUTED:** Añadir100 nuevos contactos al segmento remoto tras approval no los incluye.
- **MKT-C18-G02 / NOT_EXECUTED:** Cambiar atributo sensible en regla se rechaza antes de consulta.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
