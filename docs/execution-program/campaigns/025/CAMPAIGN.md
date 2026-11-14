# MKT-C25 · GA4 y Search Console

**PROGRAMA PREVIO · NOT_STARTED · 25/42.** [Campaña original](../../campaigns/25-ga4-y-search-console.md).

## Objetivo y contrato
Medir fuentes Google con scopes y cobertura documentados.

**Invariante:** Top rows/reporting identity no equivalen a datos completos o personas identificadas.. **Dependencias:** MKT-C24. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/google-analytics.ts`.
- DTO/validación: `packages/contracts/src/25.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/25.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/025.test.ts` y fixtures `tests/fixtures/025/`.
- Evidencia: `docs/evidence/c25/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/adapters/ga4/`, `packages/adapters/search-console/`, `tests/google-measurement.test.ts`.

## Patchsets y aceptación por tarea
### 025.01 — MKT-C25-T01
**Acción:** Configurar OAuth/scopes read-only y bindings de property/site.

**Archivo primario:** `packages/adapters/src/google-analytics.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Credencial no autoriza otras propiedades por existir en cuenta.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 025.02 — MKT-C25-T02
**Acción:** Descubrir métricas/dimensiones/versiones y compatibilidad.

**Archivo primario:** `packages/adapters/src/google-analytics.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No usar Universal Analytics como si fuera GA4.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C25-T01.

### 025.03 — MKT-C25-T03
**Acción:** Implementar reportes con filtros allowlist/cuotas/timezone.

**Archivo primario:** `packages/adapters/src/google-analytics.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Consulta costosa respeta budget y límites.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C25-T02.

### 025.04 — MKT-C25-T04
**Acción:** Persistir identidad/configuración de reporting y ventanas.

**Archivo primario:** `packages/adapters/src/google-analytics.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Snapshot indica si cifras dependen de modelo/config fuente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C25-T03.

### 025.05 — MKT-C25-T05
**Acción:** Importar Search Console sin prometer todas las filas.

**Archivo primario:** `packages/adapters/src/google-analytics.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Query ausente no se interpreta cero impresiones automáticamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C25-T04.

### 025.06 — MKT-C25-T06
**Acción:** Mapear frescura, late data y métricas agregadas por definición.

**Archivo primario:** `packages/adapters/src/google-analytics.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Reprocesado produce versión nueva con evidencia.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C25-T05.

### 025.07 — MKT-C25-T07
**Acción:** Probar propiedadesA/B, datos omitidos y token revocado.

**Archivo primario:** `packages/adapters/src/google-analytics.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** 403/404 sin fuga ni fallback cuenta administrador.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C25-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C25-G01 / NOT_EXECUTED:** GSC devuelve top rows y reporte no las etiqueta como universo completo.
- **MKT-C25-G02 / NOT_EXECUTED:** GA4 mismo nombre de property pero ID distinto no cambia binding.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: BLOCKED
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/measurement.ts
Tests ejecutados: 17 en `tests/campaigns/c21-c30.test.ts` (`npx vitest run tests/campaigns/c21-c30.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C25-G01 / NOT_VERIFIED:** GSC devuelve top rows y reporte no las etiqueta como universo completo.
- **MKT-C25-G02 / NOT_VERIFIED:** GA4 mismo nombre de property pero ID distinto no cambia binding.

Desviaciones y ajustes de diseño: Sin GA4 ni Search Console reales; el endpoint devuelve sólo lo ingerido.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Crear credenciales de servicio y probar cuotas y muestreo.
