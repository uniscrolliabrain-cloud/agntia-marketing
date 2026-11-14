# MKT-C10 · Taxonomía y contrato de medición de eventos

**PROGRAMA PREVIO · NOT_STARTED · 10/42.** [Campaña original](../../campaigns/10-taxonomia-y-contrato-de-medicion-de-eventos.md).

## Objetivo y contrato
Capturar hechos con finalidad, dedup y definición estable.

**Invariante:** Evento observado no es persona única, venta ni causalidad por defecto.. **Dependencias:** MKT-C09. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/analytics/src/event-taxonomy.ts`.
- DTO/validación: `packages/contracts/src/10.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/10.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/010.test.ts` y fixtures `tests/fixtures/010/`.
- Evidencia: `docs/evidence/c10/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/measurement/events/`, `docs/event-taxonomy.md`, `tests/event-ingestion.test.ts`.

## Patchsets y aceptación por tarea
### 010.01 — MKT-C10-T01
**Acción:** Definir eventos/propiedades allowlist, purpose y data classification.

**Archivo primario:** `packages/analytics/src/event-taxonomy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No credenciales/email/PII en URLs/UTM o bus.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 010.02 — MKT-C10-T02
**Acción:** Verificar ingreso/webhook/binding y antiabuso.

**Archivo primario:** `packages/analytics/src/event-taxonomy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Evento no autenticado no cambia campaign state o enroll sin regla.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C10-T01.

### 010.03 — MKT-C10-T03
**Acción:** Definir occurredAt/receivedAt, timezone y IDs de dedup.

**Archivo primario:** `packages/analytics/src/event-taxonomy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Replay/tardío genera proyección correcta y nueva revisión si corresponde.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C10-T02.

### 010.04 — MKT-C10-T04
**Acción:** Crear Observation con unidad/agregación/ventana/config fuente.

**Archivo primario:** `packages/analytics/src/event-taxonomy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Missing/zero/stale/censored permanecen distintos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C10-T03.

### 010.05 — MKT-C10-T05
**Acción:** Definir ConversionFact con referencia negocio y ajustes.

**Archivo primario:** `packages/analytics/src/event-taxonomy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Plataforma atribuida no crea venta financiera duplicada.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C10-T04.

### 010.06 — MKT-C10-T06
**Acción:** Configurar tracking/privacy por política sin tags ocultos.

**Archivo primario:** `packages/analytics/src/event-taxonomy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Formulario/landing no activa pixels automáticamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C10-T05.

### 010.07 — MKT-C10-T07
**Acción:** Probar duplicados, bot traffic, clock skew y permisos retirados.

**Archivo primario:** `packages/analytics/src/event-taxonomy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No se incrementa un KPI ni identifica persona fuera de alcance.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C10-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C10-G01 / NOT_EXECUTED:** Dos plataformas atribuyen misma order: ConversionFact no duplica ingreso.
- **MKT-C10-G02 / NOT_EXECUTED:** Consentimiento de analítica retirado no se suplanta con captura server-side.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/contracts/src/domain.ts, packages/core/src/measurement.ts
Tests ejecutados: 26 en `tests/campaigns/c01-c10.test.ts` (`npx vitest run tests/campaigns/c01-c10.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C10-G01 / PASS:** Dos plataformas atribuyen misma order: ConversionFact no duplica ingreso.
- **MKT-C10-G02 / PASS:** Consentimiento de analítica retirado no se suplanta con captura server-side.

Desviaciones y ajustes de diseño: missing/zero/stale se distinguen; no hay retención ni compactación de observaciones.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Definir política de retención y ventanas de agregación.
