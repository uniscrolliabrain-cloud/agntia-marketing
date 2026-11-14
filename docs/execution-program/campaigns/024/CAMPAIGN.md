# MKT-C24 · Plausible y PostHog como alternativas

**PROGRAMA PREVIO · NOT_STARTED · 24/42.** [Campaña original](../../campaigns/24-plausible-y-posthog-como-alternativas.md).

## Objetivo y contrato
Añadir analítica opcional sin equiparar Cloud, CE y permisos.

**Invariante:** Privacy-first y licencia base no garantizan todas funciones o configuración segura.. **Dependencias:** MKT-C23. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/analytics-alternatives.ts`.
- DTO/validación: `packages/contracts/src/24.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/24.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/024.test.ts` y fixtures `tests/fixtures/024/`.
- Evidencia: `docs/evidence/c24/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/adapters/plausible/`, `packages/adapters/posthog/`, `tests/analytics-alternatives.test.ts`.

## Patchsets y aceptación por tarea
### 024.01 — MKT-C24-T01
**Acción:** Revisar edición/versiones/operación y licencias mixtas.

**Archivo primario:** `packages/adapters/src/analytics-alternatives.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Stats API o Enterprise se habilitan solo si existen en instalación.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 024.02 — MKT-C24-T02
**Acción:** Validar binding tenant→site/project y roles.

**Archivo primario:** `packages/adapters/src/analytics-alternatives.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Proyecto con mismo nombre no se selecciona automáticamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C24-T01.

### 024.03 — MKT-C24-T03
**Acción:** Descubrir métricas/filtros y lectura nominada permitida.

**Archivo primario:** `packages/adapters/src/analytics-alternatives.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No SQL/HogQL libre, exports o admin tools al modelo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C24-T02.

### 024.04 — MKT-C24-T04
**Acción:** Mapear métricas/eventos y freshness con fuente/versiones.

**Archivo primario:** `packages/adapters/src/analytics-alternatives.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Datos modelados/observados se distinguen si aplica.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C24-T03.

### 024.05 — MKT-C24-T05
**Acción:** Configurar replay/PII capture off hasta aprobación específica.

**Archivo primario:** `packages/adapters/src/analytics-alternatives.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Instalar adaptador de lectura no activa tracking nuevo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C24-T04.

### 024.06 — MKT-C24-T06
**Acción:** Crear sync y conflictos de configuración/cobertura.

**Archivo primario:** `packages/adapters/src/analytics-alternatives.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Missing/unsupported no se rellena con cero.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C24-T05.

### 024.07 — MKT-C24-T07
**Acción:** Probar2proyectos, revisión de roles y límite de respuesta.

**Archivo primario:** `packages/adapters/src/analytics-alternatives.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Un adaptador opcional no probado permanece disabled.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C24-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C24-G01 / NOT_EXECUTED:** Plausible CE no expone operación Cloud requerida: unsupported, no scraping.
- **MKT-C24-G02 / NOT_EXECUTED:** PostHog replay captura PII por default heredado: bloquear hasta configuración revisada.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: BLOCKED
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/adapters/src/stubs.ts
Tests ejecutados: 17 en `tests/campaigns/c21-c30.test.ts` (`npx vitest run tests/campaigns/c21-c30.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C24-G01 / NOT_VERIFIED:** Plausible CE no expone operación Cloud requerida: unsupported, no scraping.
- **MKT-C24-G02 / NOT_VERIFIED:** PostHog replay captura PII por default heredado: bloquear hasta configuración revisada.

Desviaciones y ajustes de diseño: Plausible y PostHog declarados sin integración; no se validó plan ni export.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Elegir uno, revisar plan y probar extracción con datos sintéticos.
