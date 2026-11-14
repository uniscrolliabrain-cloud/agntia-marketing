# MKT-C09 · Datos propios y puente de relación

**PROGRAMA PREVIO · NOT_STARTED · 9/42.** [Campaña original](../../campaigns/09-datos-propios-y-puente-de-relacion.md).

## Objetivo y contrato
Normalizar personas/fuentes sin crear permisos ni leads de forma implícita.

**Invariante:** Origen público o lead aceptado no demuestra identidad/permiso comercial.. **Dependencias:** MKT-C08. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/customer-links.ts`.
- DTO/validación: `packages/contracts/src/09.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/09.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/009.test.ts` y fixtures `tests/fixtures/009/`.
- Evidencia: `docs/evidence/c09/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/customer-projections/`, `packages/imports/`, `tests/contact-sync.test.ts`.

## Patchsets y aceptación por tarea
### 009.01 — MKT-C09-T01
**Acción:** Definir campos permitidos, custodio y AuthorityMap por entidad.

**Archivo primario:** `packages/domain/src/customer-links.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Campo fiscal/sensible innecesario no se importa por comodidad.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 009.02 — MKT-C09-T02
**Acción:** Crear preview CSV/API con encoding/límites y saneado de fórmulas.

**Archivo primario:** `packages/domain/src/customer-links.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Import no ejecuta HTML/SQL ni crea memberships.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C09-T01.

### 009.03 — MKT-C09-T03
**Acción:** Mapear Contact/ChannelIdentity y source credit del padre.

**Archivo primario:** `packages/domain/src/customer-links.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** placeId/ref/source preservados sin sustituir por dominio.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C09-T02.

### 009.04 — MKT-C09-T04
**Acción:** Persistir ExternalLink/hash/mapperVersion y staging revisable.

**Archivo primario:** `packages/domain/src/customer-links.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Misma carga no duplica; cambios revisados generan conflicto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C09-T03.

### 009.05 — MKT-C09-T05
**Acción:** Definir aliases/duplicados como propuestas humanas.

**Archivo primario:** `packages/domain/src/customer-links.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Homónimos/buzones compartidos no se fusionan automáticamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C09-T04.

### 009.06 — MKT-C09-T06
**Acción:** Implementar cursor estable/overlap y watermark tras commit.

**Archivo primario:** `packages/domain/src/customer-links.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Reorder/empate/fallo de lote no pierde objetos ni aparenta éxito completo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C09-T05.

### 009.07 — MKT-C09-T07
**Acción:** Probar1000+ registros sintéticos, bajas y resync.

**Archivo primario:** `packages/domain/src/customer-links.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Totales/contenido se reconcilian por fuente, no solo cantidad.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C09-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C09-G01 / NOT_EXECUTED:** CSV incluye tenant_id/owner y consent=true sin prueba: no concede permisos.
- **MKT-C09-G02 / NOT_EXECUTED:** LeadCandidate se importa como público pero no entra a un journey.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/sdk/src/tools.ts, packages/contracts/src/events.ts
Tests ejecutados: 26 en `tests/campaigns/c01-c10.test.ts` (`npx vitest run tests/campaigns/c01-c10.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C09-G01 / PASS:** CSV incluye tenant_id/owner y consent=true sin prueba: no concede permisos.
- **MKT-C09-G02 / PASS:** LeadCandidate se importa como público pero no entra a un journey.

Desviaciones y ajustes de diseño: El puente sólo mapea 7 tipos; el resto se descarta deliberadamente.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Acordar con el padre el catálogo definitivo de eventos antes de producción.
