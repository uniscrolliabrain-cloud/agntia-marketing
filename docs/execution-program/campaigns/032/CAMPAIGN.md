# MKT-C32 · MMM Meridian y Robyn optativos

**PROGRAMA PREVIO · NOT_STARTED · 32/42.** [Campaña original](../../campaigns/32-mmm-meridian-y-robyn-optativos.md).

## Objetivo y contrato
Ejecutar análisis agregado aislado solo si datos/método/recursos son aptos.

**Invariante:** Instalar MMM no crea causalidad ni aptitud para cualquier pyme.. **Dependencias:** MKT-C31. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/analytics/src/mmm.ts`.
- DTO/validación: `packages/contracts/src/32.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/32.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/032.test.ts` y fixtures `tests/fixtures/032/`.
- Evidencia: `docs/evidence/c32/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/model-jobs/`, `workers/measurement/`, `tests/mmm-admissibility.test.ts`.

## Patchsets y aceptación por tarea
### 032.01 — MKT-C32-T01
**Acción:** Fijar versiones/licencias/runtime y elegir motor inicial justificado.

**Archivo primario:** `packages/analytics/src/mmm.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Referencia rama Robyn no se adopta automáticamente estable.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 032.02 — MKT-C32-T02
**Acción:** Definir contrato de dataset agregado y controles/periodos/geo.

**Archivo primario:** `packages/analytics/src/mmm.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No completar historia real con sintéticos para pasar admisibilidad.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C32-T01.

### 032.03 — MKT-C32-T03
**Acción:** Validar missing, colinealidad, cambios de régimen y calidad.

**Archivo primario:** `packages/analytics/src/mmm.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Datos insuficientes producen blocked/needs_review.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C32-T02.

### 032.04 — MKT-C32-T04
**Acción:** Fijar priors/transformaciones/seeds y presupuesto de cómputo.

**Archivo primario:** `packages/analytics/src/mmm.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** LLM no ejecuta scripts o librerías arbitrarias.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C32-T03.

### 032.05 — MKT-C32-T05
**Acción:** Ejecutar worker aislado sin secretos de canal y outputs tipados.

**Archivo primario:** `packages/analytics/src/mmm.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Un model job no puede comprar medios o leer otro tenant.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C32-T04.

### 032.06 — MKT-C32-T06
**Acción:** Evaluar diagnostics, calibración experimental y sensibilidad.

**Archivo primario:** `packages/analytics/src/mmm.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No seleccionar solo por R², MAPE o gráfica bonita.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C32-T05.

### 032.07 — MKT-C32-T07
**Acción:** Probar datos sintéticos con verdad conocida y restore de artifacts.

**Archivo primario:** `packages/analytics/src/mmm.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** ModelRun reproducible con límites y sin score de autores heredado.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C32-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C32-G01 / NOT_EXECUTED:** Serie corta/confundida no genera recomendación firme por necesidad comercial.
- **MKT-C32-G02 / NOT_EXECUTED:** Modelo pide GPU/coste mayor que reserva: se bloquea sin gasto sorpresa.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: PARTIAL
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/measurement.ts
Tests ejecutados: 17 en `tests/campaigns/c31-c40.test.ts` (`npx vitest run tests/campaigns/c31-c40.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C32-G01 / NOT_VERIFIED:** Serie corta/confundida no genera recomendación firme por necesidad comercial.
- **MKT-C32-G02 / NOT_VERIFIED:** Modelo pide GPU/coste mayor que reserva: se bloquea sin gasto sorpresa.

Desviaciones y ajustes de diseño: Sin Meridian/Robyn: sólo reparto descriptivo del gasto con puerta de suficiencia.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Ejecutar MMM real con datos de 52+ semanas y validación externa.
